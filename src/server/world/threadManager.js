/*
	This module contains an array of all threads. Each thread looks like this:

	{
		id: 'The equals the map name unless the map is instanced, in which case it will be a GUID. Mods can override this',
		name: 'The name of the map',
		instanced: 'Boolean value indicating whether the thread is instanced or not',
		path: 'The path to the map file',
		worker: 'The actual thread that has been spawned',
		isReady: 'Boolean value that turns from false to true as soon as the thread is ready to accept players',
		promise: 'Used by the getThread method to wait for the thread to be ready, so it can be sent to the atlas',
		cbOnInitialized: 'The promise resolver',
		inactive: 'An epoch of when the thread became empty, or null if not empty',
	}
*/
const childProcess = require("child_process");
const objects = require("../objects/objects");
const { getMapList, getDefaultMap } = require("./mapManager");
const { registerCallback } = require("./atlas/registerCallback");

const threads = [];
const listenersOnZoneIdle = [];

const getThreadStatus = (thread) => new Promise(
	(res) => {
		thread.worker.send({
			method: "getThreadStatus"
			, args: {
				callbackId: registerCallback(res)
			}
		});
	}
);

const killThread = (thread) => {
	thread.worker.kill();
	threads.spliceWhere((t) => t === thread);
};

const tryFreeUnusedThread = async (thread) => {
	const threadStatus = await getThreadStatus(thread);
	const wasInactive = thread.has("inactive");
	if (threadStatus.playerCount === 0) {
		if (threadStatus.ttl <= 0
			|| (wasInactive && Date.now() - thread.inactive > threadStatus.ttl * 1000)
		) {
			_.log.threadManager.debug("Unloading empty zone (Map/%s).", thread.name || thread.id);
			killThread(thread);
			return true;
		} else if (!wasInactive) {
			thread.inactive = Date.now();
		}
	} else if (wasInactive) {
		delete thread.inactive;
	}
	return false;
};
setInterval(() => {
	for (let i = threads.length - 1; i >= 0; --i) {
		if (!threads[i].has("inactive")) {
			continue;
		}
		tryFreeUnusedThread(threads[i]);
	}
}, 60 * 1000);

const messageAllThreads = (message) => {
	for (const t of threads) {
		t.worker.send(message);
	}
};

const messageHandlers = {
	onReady: function (thread) {
		thread.worker.send({
			method: "init"
			, args: {
				zoneName: thread.name
				, zoneId: thread.id
				, path: thread.path
			}
		});
	}

	, onInitialized: function (thread) {
		thread.isReady = true;

		thread.cbOnInitialized(thread);
		delete thread.cbOnInitialized;
		delete thread.promise;
	}

	, event: function (thread, message) {
		objects.sendEvent(message, thread);
	}

	, events: function (thread, message) {
		objects.sendEvents(message, thread);
	}

	, object: function (thread, message) {
		objects.updateObject(message);
	}

	, track: function (thread, message) {
		const player = objects.objects.find((o) => o.id === message.serverId);
		if (!player) {
			return;
		}
		player.auth.gaTracker.track(message.obj);
	}

	, callDifferentThread: function (thread, message) {
		const obj = cons.players.find((p) => (p.name === message.playerName));
		if (!obj) {
			return;
		}
		const newThread = threads.find((t) => t.name === obj.zoneName);
		if (!newThread) {
			return;
		}
		newThread.worker.send({
			module: message.data.module
			, method: message.data.method
			, args: message.data.args
		});
	}

	, rezone: async function (thread, message) {
		const { args: { obj, newZone, keepPos = true } } = message;

		// Check if old thread should be freed when player leaves.
		tryFreeUnusedThread(thread);

		// When messages are sent from map threads, they have an id (id of the object in the map thread)
		// as well as a serverId (id of the object in the main thread)
		const serverId = obj.serverId;
		obj.id = serverId;
		// Was destroyed in the zone, but not in the server.
		obj.destroyed = false;

		const serverObj = objects.objects.find((o) => o.id === obj.id);
		const mapList = getMapList();
		const mapExists = mapList.some((m) => m.name === newZone);

		if (mapExists) {
			serverObj.zoneName = newZone;
			obj.zoneName = newZone;
		} else {
			const defaultMap = getDefaultMap(mapList);
			obj.zoneName = defaultMap.name;
			serverObj.zoneName = defaultMap.name;
		}

		delete serverObj.zoneId;
		delete obj.zoneId;

		const isRezone = true;
		await atlas.addObject(obj, keepPos, isRezone);
	}

	, onZoneIdle: function (thread) {
		for (const cb of listenersOnZoneIdle) {
			cb(thread);
		}
	}
};

const onMessage = (thread, message) => {
	if (message.module) {
		try {
			global[message.module][message.method](message);
		} catch (e) {
			/* eslint-disable-next-line no-console */
			console.error("Global method error", message.module, message.method, e);
			process.exit();
		}
	} else if (message.event === "onCrashed") {
		thread.worker.kill();
		process.exit();
	} else {
		messageHandlers[message.method](thread, message);
	}
};

const spawnThread = (mapConfig) => {
	const { name, path, instanced } = mapConfig;
	const thread = {
		id: instanced ? _.getGuid() : name
		, name
		, instanced
		, path
		, isReady: false
	};
	thread.promise = new Promise((resolve) => {
		thread.cbOnInitialized = resolve;
	});
	const workerArgs = {
		...mapConfig
	};
	thread.worker = childProcess.fork("./world/worker", [JSON.stringify(workerArgs)]);
	thread.worker.on("message", onMessage.bind(null, thread));
	threads.push(thread);
	return thread;
};

module.exports = {
	getThreadsFromName: (name) => {
		return threads.filter((t) => t.name === name);
	}
	, getThreadFromId: (threadId) => {
		return threads.find((t) => t.id === threadId);
	}
	, getThread: ({ zoneName, zoneId }) => {
		let thread = threads.find(
			(t) => (t.name === zoneName
				&& (t.id === zoneId || t.id === t.name)
			)
		);
		if (!thread) {
			const mapList = getMapList();
			const map = mapList.find((m) => m.name === zoneName) || getDefaultMap(mapList);
			if (map.name !== zoneName) {
				thread = threads.find((t) => t.name === map.name && t.id === t.name);
				if (thread) {
					return thread;
				}
			}
			thread = spawnThread(map);
		}
		if (!thread) {
			io.logError({
				sourceModule: "threadManager"
				, sourceMethod: "getThread"
				, error: "No thread found"
				, info: {
					requestedZoneName: zoneName
					, requestedZoneId: zoneId
					, useMapName: map.name
				}
			});
			process.exit();
		}
		return thread;
	}
	, doesThreadExist:({ zoneName, zoneId }) => {
		for (const t of threads) {
			if (t.name === zoneName
				&& (t.id === zoneId
					|| (!zoneId && t.id === t.name)
				)
			) {
				return true;
			}
		}
		return false;
	}

	, messageAllThreads
	, sendMessageToThread: ({ threadId, msg }) => {
		const thread = threads.find((t) => t.id === threadId);
		if (thread) {
			thread.worker.send(msg);
		}
	}

	, killThread
	, tryFreeUnusedThread

	, returnWhenThreadsIdle: async () => {
		return new Promise((res) => {
			if (!threads.length) {
				return res();
			}
			let doneCount = 0;
			const onZoneIdle = (thread) => {
				doneCount++;
				if (doneCount < threads.length) {
					return;
				}
				listenersOnZoneIdle.spliceWhere((l) => l === onZoneIdle);
				res();
			};
			listenersOnZoneIdle.push(onZoneIdle);
			messageAllThreads({
				method: "notifyOnceIdle"
			});
		});
	}

	, getThreadStatus

	, close: async (timeout = 30) => {
		const timeoutTime = Date.now() + (timeout * 1000);
		while (threads.length && timeoutTime < Date.now()) {
			const statusList = await Promise.all(threads.map((t) => getThreadStatus(t)));
			for (let i = statusList.length - 1; i >= 0; --i) {
				if (statusList[i].playerCount === 0) {
					killThread(threads[i]);
				}
			}
			if (threads.length) {
				await _.asyncDelay(250);
			}
		}
		for (let i = threads.length - 1; i >= 0; --i) {
			killThread(threads[i]);
		}
	}
};

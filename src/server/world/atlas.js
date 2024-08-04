//Imports
const objects = require("../objects/objects");
const events = require("../misc/events");
const {
	getThread, killThread, sendMessageToThread, getThreadFromId,
	returnWhenThreadsIdle, getThreadStatus, tryFreeUnusedThread
} = require("./threadManager");
const { registerCallback, removeCallback } = require("./atlas/registerCallback");

//Exports
module.exports = {
	nextId: 0

	, addObject: async function (obj, keepPos, transfer) {
		const serverObj = objects.objects.find((o) => o.id === obj.id);
		if (!serverObj) {
			_.log.atlas.error("Object %s can't join threads, missing in objects atlas.", obj.name || obj.id);
			return false;
		}

		//While rezoning, this is set to true. So we remove it
		delete serverObj.rezoning;

		await events.emit("onBeforePlayerEnterWorld", obj);

		let { zoneName, zoneId } = obj;

		// Try to join party leader in instanced maps.
		const partyIds = obj.components.find((c) => c.type === "social")?.party;
		if (partyIds) {
			const partyLeader = cons.players.find((p) => {
				if (!partyIds.includes(p.id)) {
					return false;
				}
				const cpnSocial = p.components.find((c) => c.type === "social");
				if (!cpnSocial) {
					return false;
				}
				return cpnSocial.isPartyLeader;
			});
			if (partyLeader?.zoneName === zoneName) {
				zoneId = partyLeader.zoneId;
			}
		}

		const thread = getThread({ zoneName, zoneId });
		if (!thread.isReady) {
			serverObj.socket.emit("event", {
				event: "onGetAnnouncement"
				, data: {
					msg: "Loading map, please wait as this may take a few moments..."
					, ttl: 150
				}
			});
			await thread.promise;
		}

		//Perhaps the player disconnected while waiting for the thread to spawn
		if (!serverObj.socket.connected) {
			await tryFreeUnusedThread(thread);
			return false;
		}

		if (thread.id !== thread.name) {
			// Instanced map. Reset object position.
			delete obj.x;
			delete obj.y;
		}
		if (thread.has("inactive")) {
			// Player joined, thread is now active.
			delete thread.inactive;
		}

		obj.zoneName = thread.name;
		obj.zoneId = thread.id;

		serverObj.zoneId = thread.id;
		serverObj.zoneName = thread.name;

		events.emit("playerObjChanged", {
			obj
		});

		const simpleObj = obj.getSimple ? obj.getSimple(true, true) : obj;
		sendMessageToThread({
			threadId: obj.zoneId
			, msg: {
				method: "addObject"
				, args: {
					keepPos: keepPos
					, obj: simpleObj
					, transfer: transfer
				}
			}
		});
		return true;
	}

	// Save all players in a zone when event is completed and unload the zone.
	, savePlayersUnloadZone: async function (thread, callback) {
		await Promise.all(
			objects.objects.filter(
				(p) => p.zoneId === thread.id
			).map(
				(p) => this.forceSavePlayer(p.id, thread)
			)
		);
		killThread(thread);
		if (callback) {
			return callback();
		}
	}

	// Remove player/tracked obj
	, removeObject: async function (obj, skipLocal, callback) {
		if (!skipLocal) {
			objects.removeObject(obj);
		}
		const thread = getThreadFromId(obj.zoneId);
		if (!thread) {
			if (callback) {
				return callback();
			}
			return;
		}
		const threadStatus = await getThreadStatus(thread);
		if (threadStatus.ttl < 0
			|| (threadStatus.playerCount === 1 && threadStatus.ttl === 0)
		) {
			return this.savePlayersUnloadZone(thread, callback);
		}
		if (threadStatus.playerCount === 1) {
			// Removing last player, flag inactive to be rechecked later.
			thread.inactive = Date.now();
		}
		await new Promise((res) => {
			sendMessageToThread({
				threadId: obj.zoneId
				, msg: {
					method: "removeObject"
					, args: {
						obj: obj.getSimple(true)
						, callbackId: this.registerCallback(res)
					}
				}
			});
		});
		if (callback) {
			return callback();
		}
	}

	, updateObject: function (obj, msgObj) {
		sendMessageToThread({
			threadId: obj.zoneId
			, msg: {
				method: "updateObject"
				, args: {
					id: obj.id
					, obj: msgObj
				}
			}
		});
	}
	, queueAction: function (obj, action) {
		sendMessageToThread({
			threadId: obj.zoneId
			, msg: {
				method: "queueAction"
				, args: {
					id: obj.id
					, action: action
				}
			}
		});
	}
	, performAction: function (obj, action) {
		sendMessageToThread({
			threadId: obj.zoneId
			, msg: {
				method: "performAction"
				, args: {
					id: obj.id
					, action: action
				}
			}
		});
	}

	, registerCallback: function (callback) {
		return registerCallback(callback);
	}

	, resolveCallback: function (msg) {
		const callback = removeCallback(msg.msg.id);
		if (!callback) {
			return;
		}
		callback.callback(msg.msg.result);
	}

	, returnWhenZonesIdle: () => returnWhenThreadsIdle()

	, forceSavePlayer: async function (playerId, threadId) {
		let thread;
		if (typeof threadId === "string") {
			thread = getThreadFromId(threadId);
		} else if (typeof threadId?.worker?.send === "function") {
			thread = threadId;
		}
		if (!thread) {
			_.log.atlas.forceSavePlayer.error("Can't find thread %s", threadId);
			return;
		}
		return new Promise((res) => {
			thread.worker.send({
				method: "forceSavePlayer"
				, args: {
					playerId
					, callbackId: this.registerCallback(res)
				}
			});
		});
	}
};

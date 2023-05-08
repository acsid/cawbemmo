//Imports
const objects = require('../objects/objects');
const events = require('../misc/events');
const {
	getThread, killThread, sendMessageToThread, getThreadFromId, returnWhenThreadsIdle, gePlayerCountInThread
} = require('./threadManager');
const { registerCallback, removeCallback } = require('./atlas/registerCallback');

//Exports
module.exports = {
	nextId: 0,

	addObject: async function (obj, keepPos, transfer) {
		const serverObj = objects.objects.find(o => o.id === obj.id);
		if (!serverObj)
			return;

		events.emit('onBeforePlayerEnterWorld', obj);

		let { zoneName, zoneId } = obj;

		const partyIds = obj.components.find(c => c.type === 'social')?.party;
		if (partyIds) {
			const partyLeader = cons.players.find(p => partyIds.includes(p.id) && p.components.find(c => c.type === 'social').isPartyLeader);

			if (partyLeader?.zoneName === zoneName)
				zoneId = partyLeader.zoneId;
		}

		const { thread, resetObjPosition } = await getThread({
			zoneName,
			zoneId
		});
		
		if (resetObjPosition) {
			delete obj.x;
			delete obj.y;
		}

		obj.zoneName = thread.name;
		obj.zoneId = thread.id;

		serverObj.zoneId = thread.id;
		serverObj.zoneName = thread.name;

		serverObj.player.broadcastSelf();

		const simpleObj = obj.getSimple ? obj.getSimple(true, true) : obj;

		sendMessageToThread({
			threadId: obj.zoneId,
			msg: {
				method: 'addObject',
				args: {
					keepPos: keepPos,
					obj: simpleObj,
					transfer: transfer
				}
			}
		});
	},

	removeObjectFromInstancedZone: async function (thread, objId, callback) {
		await new Promise(res => {
			const cb = this.registerCallback(res);

			thread.worker.send({
				method: 'forceSavePlayer',
				args: {
					playerId: objId,
					callbackId: cb
				}
			});
		});

		killThread(thread);

		if (callback)
			callback();
	},

	removeObject: async function (obj, skipLocal, callback) {
		//We need to store the player id because the calling thread might delete it (connections.unzone)
		const playerId = obj.id;

		if (!skipLocal)
			objects.removeObject(obj);

		const thread = getThreadFromId(obj.zoneId);
		if (!thread)
			return;

		if (thread.instanced && (await gePlayerCountInThread(thread)) === 1) {
			this.removeObjectFromInstancedZone(thread, playerId, callback);

			return;
		}

		let callbackId = null;
		if (callback)
			callbackId = this.registerCallback(callback);

		sendMessageToThread({
			threadId: obj.zoneId,
			msg: {
				method: 'removeObject',
				args: {
					obj: obj.getSimple(true),
					callbackId: callbackId
				}
			}
		});
	},
	updateObject: function (obj, msgObj) {
		sendMessageToThread({
			threadId: obj.zoneId,
			msg: {
				method: 'updateObject',
				args: {
					id: obj.id,
					obj: msgObj
				}
			}
		});
	},
	queueAction: function (obj, action) {
		sendMessageToThread({
			threadId: obj.zoneId,
			msg: {
				method: 'queueAction',
				args: {
					id: obj.id,
					action: action
				}
			}
		});
	},
	performAction: function (obj, action) {
		sendMessageToThread({
			threadId: obj.zoneId,
			msg: {
				method: 'performAction',
				args: {
					id: obj.id,
					action: action
				}
			}
		});
	},

	registerCallback: function (callback) {
		return registerCallback(callback);
	},

	resolveCallback: function (msg) {
		const callback = removeCallback(msg.msg.id);
		if (!callback)
			return;

		callback.callback(msg.msg.result);
	},

	returnWhenZonesIdle: async function () {
		await returnWhenThreadsIdle();
	},

	forceSavePlayer: async function (playerId, zoneId) {
		const thread = getThreadFromId(zoneId);

		if (!thread)
			return;

		return new Promise(res => {
			const callbackId = this.registerCallback(res);

			thread.worker.send({
				method: 'forceSavePlayer',
				args: {
					playerId,
					callbackId
				}
			});
		});
	}

};

define([
	"socket"
	, "js/system/events"
], function (
	io,
	events
) {
	const canReachServer = async () => {
		try {
			const response = await fetch("/", {
				method: "HEAD"
			});
			return response.ok;
		} catch (err) {
			return false;
		}
	};
	const client = {
		doneConnect: false

		, init: function (onReady) {
			this.socket = io({
				transports: [ "websocket" ]
			});

			this.socket.on("connect", this.onConnected.bind(this, onReady));
			this.socket.on("handshake", this.onHandshake.bind(this));
			this.socket.on("event", this.onEvent.bind(this));
			this.socket.on("events", this.onEvents.bind(this));
			// Asked to disconnect.
			this.socket.on("dc", this.onDisconnect.bind(this));
			// Was disconnected.
			this.socket.on("disconnect", this.onDisconnect.bind(this));

			for (const k in this.processAction) {
				this.processAction[k] = this.processAction[k].bind(this);
			}
		}

		, onRezoneStart: function () {
			//Fired for mods to listen to
			events.emit("rezoneStart");

			events.emit("destroyAllObjects");
			events.emit("resetRenderer");
			events.emit("resetPhysics");
			events.emit("clearUis");

			client.request({
				threadModule: "rezoneManager"
				, method: "clientAck"
				, data: {}
			});
		}

		, onGetMap: function ([msg]) {
			events.emit("onGetMap", msg);

			client.request({
				threadModule: "instancer"
				, method: "clientAck"
				, data: {}
			});
		}

		, onConnected: function (onReady) {
			if (this.doneConnect) {
				this.onDisconnect();
			} else {
				this.doneConnect = true;
			}

			if (onReady) {
				onReady();
			}
		}

		, onDisconnect: async function () {
			this.socket.disconnect();
			events.emit("onGetAnnouncement", {
				msg: "Connection lost, please wait while we try to reconnect..."
				, ttl: 350
			});
			do {
				await _.asyncDelay(3000);
			} while (!(await canReachServer()));
			window.location = window.location;
		}

		, onHandshake: function () {
			events.emit("onHandshake");
			this.socket.emit("handshake");
		}

		, request: function (msg) {
			this.socket.emit("request", msg, msg.callback);
		}

		, processAction: {
			default: function (eventName, msgs) {
				for (const m of msgs) {
					events.emit(eventName, m);
				}
			}

			, rezoneStart: function (eventName, msgs) {
				events.emit("rezoneStart");

				events.emit("destroyAllObjects");
				events.emit("resetRenderer");
				events.emit("resetPhysics");
				events.emit("clearUis");

				client.request({
					threadModule: "rezoneManager"
					, method: "clientAck"
					, data: {}
				});
			}

			, getMap: function (eventName, msgs) {
				events.emit("onBuildIngameUis");
				events.emit("onGetMap", msgs[0]);
			}

			, onGetObject: function (eventName, msgs) {
				// Move self messages first.
				msgs = msgs.filter((o) => o.self).concat(msgs.filter((o) => !o.self));
				this.processAction.default(eventName, msgs);
			}
		}

		, onEvent: function ({ event: eventName, data: eventData }) {
			const handler = this.processAction[eventName] || this.processAction.default;

			handler(eventName, [eventData]);
		}

		, onEvents: function (response) {
			for (let eventName in response) {
				const handler = this.processAction[eventName] || this.processAction.default;
				const eventMsgs = response[eventName];
				handler(eventName, eventMsgs);
			}
		}
	};
	return client;
});

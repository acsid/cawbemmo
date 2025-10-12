module.exports = {
	events: {}

	, on: function (eventName, callback) {
		if (typeof eventName !== "string") {
			throw new Error("eventName must be a string.");
		}
		if (typeof callback !== "function") {
			throw new Error("callback must be a function.");
		}
		const list = this.events[eventName] || (this.events[eventName] = []);
		list.push(callback);
		return callback;
	}

	, off: function (eventName, callback) {
		const list = this.events[eventName];
		if (!list) {
			return;
		}
		for (let i = list.length - 1; i >= 0; --i) {
			const { callback: lCallback } = list[i];
			if (lCallback === callback) {
				list.splice(i, 1);
			}
		}
		if (list.length <= 0) {
			delete this.events[eventName];
		}
	}

	, emit: function (eventName, ...args) {
		if (typeof eventName !== "string") {
			throw new Error("eventName must be a string.");
		}
		const list = this.events[eventName];
		if (!list) {
			//_.log.events.emit.debug("Ignored event %s without subscribers.", eventName);
			return;
		}
		//_.log.events.emit.trace(eventName);
		const promises = [];
		for (const callback of list) {
			const r = callback.apply(null, args);
			if (typeof r === "object" && r instanceof Promise) {
				promises.push(r);
			}
		}
		if (promises.length === 1) {
			return promises[0];
		}
		if (promises.length > 0) {
			return Promise.all(promises);
		}
	}
};

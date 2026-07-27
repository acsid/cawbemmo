import client from "/js/system/client.js";
import events from "/js/system/events.js";

const isSameAction = function (a, b) {
	return a.data?.targetId === b.data?.targetId
		&& a.cpn === b.cpn
		&& a.method === b.method;
};

export default {
	type: "serverActions"

	, actions: []

	, init: function (blueprint) {
		this.hookEvent("inputaction", this.onInputAction.bind(this));
	}

	, hasAction: function (actionId) {
		return this.actions.some((a) => a.id === actionId);
	}
	, execAction: function (action) {
		return client.request({
			cpn: "player"
			, method: "performAction"
			, data: action
		});
	}

	, onInputAction: function (e) {
		for (const a of this.actions) {
			if (a.inputAction !== e.actionName) {
				continue;
			}
			this.execAction(a.action);
		}
	}

	, extend: function (blueprint) {
		if (blueprint.addActions) {
			for (const a of blueprint.addActions) {
				this.actions.spliceWhere((f) => {
					if (f.key && f.key === a.key) {
						return true;
					}
					if (f.actionName && f.actionName === a.actionName) {
						return true;
					}
				});
				const exists = this.actions.some((ta) => isSameAction(ta.action, a.action));
				if (exists) {
					continue;
				}
				this.actions.push(a);
			}
			delete blueprint.addActions;
		}
		if (blueprint.removeActions) {
			for (const a of blueprint.removeActions) {
				this.actions.spliceWhere((ta) => isSameAction(ta.action, a.action));
			}
			delete blueprint.removeActions;
		}
		events.emit("onGetServerActions", this.actions);
	}

	, destroy: function () {
		this.unhookEvents();
	}
};

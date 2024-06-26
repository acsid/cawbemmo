module.exports = {
	type: "dialogue"

	, states: {}
	, sourceStates: {}

	, trigger: null

	, init: function (blueprint) {
		this.states = blueprint.config;
	}

	, destroy: function () {
		if (this.trigger) {
			this.trigger.destroyed = true;
		}
	}

	, talk: async function (msg) {
		if (!msg) {
			return false;
		}
		let target = msg.target;
		if (!target && !msg.targetName) {
			return false;
		}
		if (target && !target.id) {
			target = this.obj.instance.objects.objects.find((o) => o.id === target);
			if (!target) {
				return false;
			}
		} else if (msg.targetName) {
			target = this.obj.instance.objects.objects.find((o) => ((o.name) && (o.name.toLowerCase() === msg.targetName.toLowerCase())));
			if (!target) {
				return false;
			}
		}
		if (!target.dialogue) {
			return false;
		}
		//Auto-discover faction
		if (target?.trade?.faction) {
			this.obj.reputation.discoverFaction(target.trade.faction.id);
		}
		const state = await target.dialogue.getState(this.obj, msg.state);
		if (!state) {
			this.obj.syncer.set(true, "dialogue", "state", null);
			return false;
		}
		this.obj.syncer.set(true, "dialogue", "state", state);
	}

	, stopTalk: function () {
		this.obj.syncer.set(true, "dialogue", "state", null);
	}

	, getState: async function (sourceObj, state = 1) {
		let result = null;
		if ((state + "").indexOf(".") > -1) {
			let config = this.states[(state + "").split(".")[0]];
			if (!config) {
				return false;
			}
			let goto = (config.options[state] || {}).goto;
			if (goto instanceof Array) {
				let gotos = [];
				goto.forEach(function (g) {
					let rolls = (g.chance * 100) || 100;
					for (let i = 0; i < rolls; i++) {
						gotos.push(g.number);
					}
				});
				state = gotos[Math.floor(Math.random() * gotos.length)];
			} else {
				state = goto;
			}
		}
		this.sourceStates[sourceObj.id] = state;

		if (!this.states) {
			return null;
		}
		let stateConfig = this.states[state];
		if (!stateConfig) {
			return null;
		}
		let useMsg = stateConfig.msg;
		if (stateConfig.cpn) {
			let cpn = sourceObj[stateConfig.cpn];
			let newArgs = _.assign([], stateConfig.args);
			newArgs.push(this.obj);
			result = cpn[stateConfig.method].apply(cpn, newArgs);

			if (stateConfig.goto) {
				if (result) {
					return await this.getState(sourceObj, stateConfig.goto.success);
				}
				return await this.getState(sourceObj, stateConfig.goto.failure);
			}
			if (result) {
				useMsg = _.assign([], useMsg);
				useMsg[0].msg = result;
			} else {
				return null;
			}
		} else if (stateConfig.method) {
			let methodResult = await stateConfig.method.call(this.obj, sourceObj);
			if (methodResult) {
				useMsg = _.assign([], useMsg);
				useMsg[0].msg = methodResult;
			}
			if (!useMsg) {
				return;
			}
		}
		result = {
			id: this.obj.id
			, msg: null
			, from: this.obj.name
			, options: []
		};
		if (useMsg instanceof Array) {
			const msgs = [];
			useMsg.forEach(function (m, i) {
				let rolls = (m.chance * 100) || 100;
				for (let j = 0; j < rolls; j++) {
					msgs.push({
						msg: m
						, index: i
					});
				}
			});
			const pick = msgs[Math.floor(Math.random() * msgs.length)];
			result.msg = pick.msg.msg;
			result.options = useMsg[pick.index].options;
		} else {
			result.msg = useMsg;
			result.options = stateConfig.options;
		}

		if (!(result.options instanceof Array)) {
			if (result.options[0] === "$") {
				result.options = this.states[result.options.replace("$", "")].options;
			}
			result.options = Object.keys(result.options);
		}
		result.options = result.options
			.map(function (o) {
				const gotoState = this.states[(o + "").split(".")[0]];
				const picked = gotoState.options[o];
				if (!picked) {
					return null;
				} else if (picked.prereq) {
					if (!picked.prereq(sourceObj)) {
						// Doesn't conform to prereq.
						return null;
					}
				}
				return {
					id: o
					, msg: picked.msg
				};
			}, this)
			.filter((o) => Boolean(o));

		result.options.push({
			msg: "Au revoir"
			, id: 999
		});
		return result;
	}

	, simplify: function (self) {
		return {
			type: "dialogue"
		};
	}

	//These don't belong here, but I can't figure out where to put them right now
	//They are actions that can be performed while chatting with someone
	, teleport: function (msg) {
		this.obj.syncer.set(true, "dialogue", "state", null);

		let portal = _.assign({}, require("./portal"), msg);
		portal.collisionEnter(this.obj);
	}

	, getItem: function (msg, source) {
		let inventory = this.obj.inventory;
		let exists = inventory.items.find((i) => (i.name === msg.item.name));
		if (!exists) {
			inventory.getItem(msg.item);
			return msg.successMsg || false;
		} return msg.existsMsg || false;
	}
};

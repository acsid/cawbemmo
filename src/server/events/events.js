//System Imports
const fs = require("fs");

//Imports
const phaseTemplate = require("./phaseTemplate");
const { getMapList } = require("../world/mapManager");

//Helpers
const applyVariablesToDescription = (desc, variables) => {
	if (!variables) {
		return desc;
	}
	for (const [key, value] of Object.entries(variables)) {
		desc = desc.replaceAll(`$${key}$`, value);
	}
	return desc;
};

//Exports
module.exports = {
	configs: []
	, nextId: 0

	, init: function (instance) {
		this.instance = instance;

		const zoneName = this.instance.map.name;
		const mapList = getMapList();
		const zonePath = mapList.find((z) => z.name === zoneName).path;
		const zoneEventPath = `${zonePath}/${zoneName}/events`;

		const paths = ["config/globalEvents", zoneEventPath];
		const files = [];
		for (const p of paths) {
			if (!fs.existsSync(p)) {
				continue;
			}
			files.push(...fs.readdirSync(p).map((f) => `../${p}/${f}`));
		}
		this.instance.eventEmitter.emit("onBeforeGetEventList", zoneName, files);

		for (const f of files) {
			if (!f.includes(".js")) {
				continue;
			}
			const e = _.safeRequire(module, f);
			if (e.disabled) {
				continue;
			}
			this.configs.push(_.assign({
				endMark: -1
			}, e));
		}
		this.instance.eventEmitter.emit("afterGetEventList", {
			eventConfigs: this.configs
		});
	}

	, getEvent: function (name) {
		const nConf = this.configs.find((c) => (c.name === name));
		if (!nConf) {
			return;
		}
		return nConf.event?.config;
	}

	, setEventDescription: function (name, desc) {
		const config = this.getEvent(name);
		const event = config?.event;
		if (!event) {
			_.log.events.setEventDescription.error("Event '%s' isn't active. Can't update description.");
			return;
		}
		if (!config.oldDescription) {
			config.oldDescription = config.description;
		}
		if (config.events && config.events.beforeSetDescription) {
			config.events.beforeSetDescription(this);
		}
		if (desc) {
			config.description = applyVariablesToDescription(desc, event.variables);
		}
		for (const p of event.participators) {
			p.events.syncList();
		}
	}

	, setEventRewards: function (name, rewards) {
		const config = this.getEvent(name);
		const event = config?.event;
		if (!event) {
			_.log.events.setEventRewards.error("Event '%s' isn't active. Can't update rewards.");
			return;
		}
		event.rewards = rewards;
		event.age = event.config.duration - 2;
	}

	, setParticipantRewards: function (eventName, participantName, newRewards) {
		const { event: { rewards } } = this.getEvent(eventName);

		rewards[participantName] = newRewards;
	}

	, addParticipantRewards: function (eventName, participantName, addRewards) {
		const { event: { rewards } } = this.getEvent(eventName);

		let pRewards = rewards[participantName];
		if (!pRewards) {
			pRewards = [];
			rewards[participantName] = pRewards;
		}

		if (!addRewards.push) {
			addRewards = [ addRewards ];
		}

		for (const r of addRewards) {
			const { name, quantity = 1 } = r;

			const exists = pRewards.find((f) => f.name === name);
			if (exists) {
				exists.quantity = (exists.quantity || 1) + quantity;
			} else {
				pRewards.push(r);
			}
		}
	}

	, setWinText: function (name, text) {
		const config = this.getEvent(name);
		if (!config?.event) {
			return;
		}
		const event = config.event;
		event.winText = text;
	}

	, setEventVariable: function (eventName, variableName, value) {
		const config = this.getEvent(eventName);
		const event = config?.event;
		if (!event) {
			return;
		}
		event.variables[variableName] = value;
	}

	, incrementEventVariable: function (eventName, variableName, delta) {
		const config = this.getEvent(eventName);
		const event = config?.event;
		if (!event) {
			return;
		}
		const currentValue = event.variables[variableName] || 0;
		event.variables[variableName] = currentValue + delta;
	}

	, update: function () {
		if (!this.configs) {
			return;
		}
		const scheduler = this.instance.scheduler;
		const time = scheduler.getTime();
		for (const c of this.configs) {
			if (c.event) {
				//Event active.
				this.updateEvent(c.event);
				if (c.event.done
					|| (c.cron
						&& c.durationEvent
						&& !scheduler.isActive(c, time)
					)
					|| (c.endMark !== -1 && c.endMark <= c.event.age)
				) {
					// Event completed.
					this.stopEvent(c);
				}
				continue;
			}
			if (c.manualTrigger) {
				continue;
			}
			if (c.ttl && c.ttl > 0) {
				c.ttl--;
				continue;
			}
			if (c.cron) {
				if (c.durationEvent) {
					if (!scheduler.isActive(c, time)) {
						continue;
					}
				} else if (!scheduler.shouldRun(c, time)) {
					continue;
				}
			}
			c.event = this.startEvent(c);
			this.updateEvent(c.event);
		}
	}

	, startEvent: function (config) {
		if (config.oldDescription) {
			config.description = config.oldDescription;
		}
		const event = {
			id: this.nextId++
			, config: _.assign({}, config)
			, eventManager: this
			, variables: {}
			, rewards: {}
			, phases: []
			, participators: []
			, objects: []
			, nextPhase: 0
			, age: 0
		};
		event.config.event = event;

		_.log.events.debug("Starting event '%s'", config.name);
		const onStart = event.config.events?.onStart;
		if (onStart) {
			onStart(this, event);
		}
		return event;
	}

	, startEventByCode: function (eventCode) {
		const config = this.configs.find((c) => c.code === eventCode);
		if (!config || config.event) {
			return;
		}
		config.event = this.startEvent(config);
		this.updateEvent(config.event);

		this.instance.syncer.queue("onGetMessages", {
			messages: {
				class: "color-pinkA"
				, message: `The ${config.name} event has begun!`
			}
		}, -1);
	}

	, stopEventByCode: function (eventCode) {
		const config = this.configs.find((c) => c.code === eventCode);
		if (!config || !config.event) {
			return;
		}
		this.stopEvent(config);

		this.instance.syncer.queue("onGetMessages", {
			messages: {
				class: "color-pinkA"
				, message: `The ${config.name} event has come to an end!`
			}
		}, -1);
	}

	, giveRewards: function (config) {
		const { event: { rewards = {} } } = config;

		const subject = `${config.name} Rewards`;
		const senderName = config.rewardSenderName;

		Object.entries(rewards).forEach((e) => {
			const [ name, rList ] = e;

			if (!rList || !rList.length) {
				return;
			}

			//Hack: Mail is a mod. As such, events should be a mod that depends on mail
			if (global.mailManager) {
				global.mailManager.sendSystemMail({
					to: name
					, from: senderName
					, subject
					, msg: ""
					, items: rList
					, notify: true
				});
			}
		});

		if (config.events && config.events.afterGiveRewards) {
			config.events.afterGiveRewards(this, config);
		}
	}

	, stopAll: function () {
		for (const c of this.configs) {
			if (!c.event) {
				// Not active...
				continue;
			}
			c.event.done = true;
		}
	}

	, stopEvent: function (config) {
		_.log.events.debug("Event '%s' has completed.", config.name);
		const event = config.event;
		for (const p of event.participators) {
			p.events.unregisterEvent(event);
		}
		for (const o of event.objects) {
			o.destroyed = true;

			this.instance.syncer.queue("onGetObject", {
				x: o.x, y: o.y
				, components: [{
					type: "attackAnimation"
					, row: 0
					, col: 4
				}]
			}, -1);
		}

		if (event.winText) {
			this.instance.syncer.queue("serverModule", {
				module: "cons"
				, method: "emit"
				, msg: [
					"event"
					, {
						event: "onGetMessages"
						, data: {
							messages: {
								class: "color-pinkA"
								, message: event.winText
							}
						}
					}
				]
			}, ["server"]);
		}
		for (const p of event.phases) {
			if (p.destroy && !p.destroyed) {
				p.destroyed = true;
				p.destroy();
			}
		}

		const onStop = event.config.events?.onStop;
		if (onStop) {
			onStop(this, event);
		}
		delete config.event;
	}

	, handleNotification: function (event, { msg, desc, event: triggerEvent }) {
		if (msg) {
			this.instance.syncer.queue("serverModule", {
				module: "cons"
				, method: "emit"
				, msg: [
					"event"
					, {
						event: "onGetMessages"
						, data: {
							messages: {
								class: "color-pinkA"
								, message: msg
							}
						}
					}
				]
			}, ["server"]);
		}

		if (desc) {
			event.config.descTimer = desc;
			this.setEventDescription(event.config.name);
		}

		if (triggerEvent && event.config.events[triggerEvent]) {
			event.config.events[triggerEvent](this, event);
		}
	}

	, updateEvent: function (event) {
		const config = event.config;
		const onTick = config.events?.onTick;
		if (onTick) {
			onTick(this, event);
		}
		event.objects.spliceWhere((o) => o.destroyed);

		let stillBusy = false;
		for (const phase of event.phases) {
			if (phase.destroyed) {
				continue;
			}
			if (phase.end || (phase.endMark !== -1 && phase.endMark <= event.age)) {
				_.log.events.debug("%s[%s] %s has ended.", config.name, phase.step, phase.type);
				if (phase.destroy && !phase.destroyed) {
					phase.destroy();
				}
				phase.destroyed = true;
				continue;
			}
			if (phase.has("ttl")) {
				if (phase.ttl === 0) {
					phase.end = true;
					continue;
				}
				phase.ttl--;
				stillBusy = true;
			} else if (!phase.auto) {
				stillBusy = true;
			}
			phase.update(event);
		}

		const notifications = config.notifications || [];
		for (const n of notifications) {
			if (n.mark === event.age) {
				this.handleNotification(event, n);
			}
		}
		event.age++;

		if (event.age === config.duration) {
			event.done = true;
		} else if (config.prizeTime && event.age === config.prizeTime) {
			this.giveRewards(config);
		}
		if (stillBusy) {
			return;
		}

		const phases = config.phases;
		let pLen = phases.length;
		for (let i = event.nextPhase; i < pLen; i++) {
			const p = phases[i];
			let phase = event.phases[i];
			if (!phase) {
				const typeTemplate = _.safeRequire(module, "./phases/phase" + p.type.capitalize());
				phase = _.assign({
					instance: this.instance
					, event: event
					, step: i
				}
				, phaseTemplate
				, typeTemplate
				, p
				);
				event.phases.push(phase);
				event.currentPhase = phase;
			}
			event.nextPhase = i + 1;
			_.log.events.debug("%s[%s] %s is starting.", config.name, phase.step, phase.type);
			phase.init(event);
			if (!p.auto) {
				stillBusy = true;
				break;
			}
		}

		if (event.nextPhase >= pLen && !stillBusy) {
			event.done = true;
		}

		const oList = this.instance.objects.objects;
		for (const o of oList) {
			if (!o.player) {
				continue;
			}
			o.events.events.afterMove.call(o.events);
		}
	}

	, getCloseEvents: function (obj) {
		if (!this.configs) {
			return;
		}

		const result = [];
		for (const c of this.configs) {
			const event = c.event;
			if (!event) {
				continue;
			}

			const exists = event.participators.find((p) => (p.name === obj.name));
			if (exists) {
				event.participators.spliceWhere((p) => (p === exists));
				event.participators.push(obj);
				result.push(event);
				continue;
			}

			let distance = event.config.distance;
			if (distance === -1) {
				event.participators.push(obj);
				result.push(event);

				if (event.config.events && event.config.events.onParticipantJoin) {
					event.config.events.onParticipantJoin(this, obj);
				}
				continue;
			}
			for (const o of event.objects) {
				if (distance === -1
					|| !distance
					|| (Math.abs(obj.x - o.x) < distance
						&& Math.abs(obj.y - o.y) < distance
					)
				) {
					event.participators.push(obj);
					result.push(event);

					if (event.config.events && event.config.events.onParticipantJoin) {
						event.config.events.onParticipantJoin(this, obj);
					}
					break;
				}
			}
		}
		return result;
	}
};

const configMaterials = require("../../items/config/materials");
const connections = require("../../security/connections");
const events = require("../../misc/events");

//Commands
const rezone = require("../social/rezone");
const canChat = require("../social/canChat");
const startEvent = require("../social/startEvent");
const stopEvent = require("../social/stopEvent");
const teleport = require("../social/teleport");

const commandRoles = {
	//Regular players
	join: 0
	, leave: 0
	, block: 0
	, unblock: 0
	, help: 0
	, die: 0

	//Super Mods
	, broadcast: 8
	, saveAll: 8

	//Admin
	, getGold: 10
	, setLevel: 10
	, godMode: 10
	, clearInventory: 10
	, completeQuests: 10
	, getReputation: 10
	, loseReputation: 10
	, setStat: 10
	, getXp: 10
	, setPassword: 10
	, giveSkin: 10
	, getMaterials: 10
	, rezone: 10
	, startEvent: 10
	, stopEvent: 10
	, teleport: 10
	, roll: 10
	, unEq: 10
};

//Commands that should be run on the main thread (not the zone thread)
const localCommands = [
	"join"
	, "leave"
	, "setPassword"
	, "roll"
	, "broadcast"
	, "saveAll"
	, "help"
	, "startEvent"
	, "stopEvent"
];

//Actions that should appear when a player is right clicked
const contextActions = [];

const commandActions = {};

module.exports = {
	actions: []

	, customChannels: []

	, init: function (blueprint) {
		if (this.customChannels) {
			this.customChannels = this.customChannels.filter((c, i) => (this.customChannels.indexOf(c) === i));
		}
		this.calculateActions();
	}

	, calculateActions: async function () {
		const chatCommandConfig = {
			localCommands
			, contextActions: _.assign([], contextActions)
			, commandRoles
			, commandActions
		};
		await events.emit("onBeforeGetChatCommands", chatCommandConfig);
		await events.emit("onBeforeGetCommandRoles", commandRoles, commandActions);
		Object.entries(commandActions).forEach((a) => {
			const [ actionName, actionHandler ] = a;
			this[actionName] = actionHandler.bind(this);
		});
		this.actions = chatCommandConfig.contextActions.filter((c) => this.obj.auth.getAccountLevel() >= commandRoles[c.command]);
	}

	, onBeforeChat: function (msg) {
		let messageText = msg.message;
		if (messageText[0] !== "/") {
			return;
		}
		msg.ignore = true;

		messageText = messageText.substr(1).split(" ");
		let actionName = messageText.splice(0, 1)[0].toLowerCase();
		actionName = Object.keys(commandRoles).find((a) => (a.toLowerCase() === actionName));

		if (!actionName) {
			this.obj.socket.emit("events", {
				onGetMessages: [{
					messages: [{
						class: "color-redA"
						, message: "Invalid command."
						, type: "info"
					}]
				}]
			});
			return;
		}
		if (this.obj.auth.getAccountLevel() < commandRoles[actionName]) {
			this.obj.socket.emit("events", {
				onGetMessages: [{
					messages: [{
						class: "color-redA"
						, message: "You do not have the required permissions."
						, type: "info"
					}]
				}]
			});
			return;
		}

		let config = {};
		const originalConfig = messageText.join(" ");
		if ((messageText.length === 1) && (messageText[0].indexOf("=") === -1)) {
			config = messageText[0];
		} else {
			messageText.forEach(function (m) {
				m = m.split("=");
				config[m[0]] = m[1];
			});
		}

		if (localCommands.includes(actionName)) {
			this[actionName](config, originalConfig);
		} else {
			atlas.performAction(this.obj, {
				cpn: "social"
				, method: actionName
				, data: config
			});
		}
	}

	//actions
	, join: async function (value) {
		if (typeof (value) !== "string") {
			return;
		}
		value = value.trim().replaceAll(" ", "");
		if (!value) {
			return;
		}
		const obj = this.obj;
		if (!value.match(/^[0-9a-zA-Z]+$/)) {
			obj.socket.emit("events", {
				onGetMessages: [{
					messages: [{
						class: "color-redA"
						, message: "Channel names may only contain letters and numbers."
						, type: "info"
					}]
				}]
			});
			return;
		}
		if (value.length > 15) {
			obj.socket.emit("events", {
				onGetMessages: [{
					messages: [{
						class: "color-redA"
						, message: "Channel names can not be longer than 15 characters."
						, type: "info"
					}]
				}]
			});
			return;
		}
		const channels = obj.auth.customChannels;
		if (!channels.some((c) => (c === value))) {
			channels.push(value);
		} else {
			return;
		}
		channels.push(value);

		const charname = obj.auth.charname;
		await io.setAsync({
			key: charname
			, table: "customChannels"
			, value: channels
			, serialize: true
		});

		obj.socket.emit("events", {
			onGetMessages: [{
				messages: [{
					class: "color-yellowB"
					, message: "joined channel: " + value
					, type: "info"
				}]
			}]
		});

		obj.socket.emit("event", {
			event: "onJoinChannel"
			, data: value
		});
	}

	, leave: async function (value) {
		if (typeof value !== "string") {
			return;
		}
		const obj = this.obj;
		const channels = obj.auth.customChannels;
		if (!channels.some((c) => (c === value))) {
			obj.socket.emit("events", {
				onGetMessages: [{
					messages: [{
						class: "color-redA"
						, message: "you are not currently in that channel"
						, type: "info"
					}]
				}]
			});
			return;
		}
		channels.spliceWhere((c) => (c === value));

		let charname = obj.auth.charname;
		await io.setAsync({
			key: charname
			, table: "customChannels"
			, value: channels
			, serialize: true
		});

		obj.socket.emit("event", {
			event: "onLeaveChannel"
			, data: value
		});

		this.obj.socket.emit("events", {
			onGetMessages: [{
				messages: [{
					class: "color-yellowB"
					, message: "left channel: " + value
					, type: "info"
				}]
			}]
		});
	}

	, block: function (target) {
		const { obj, blockedPlayers } = this;
		const { name, social, syncer } = obj;

		if (blockedPlayers.includes(target)) {
			social.notifySelf({ message: "That player has already been blocked" });
			return;
		} else if (target === name) {
			social.notifySelf({ message: "You cannot block yourself" });
			return;
		}
		blockedPlayers.push(target);
		syncer.set(true, "social", "blockedPlayers", blockedPlayers);
		social.notifySelf({
			message: `Successfully blocked ${target}`
			, className: "color-yellowB"
		});
	}

	, unblock: function (target) {
		const { obj, blockedPlayers } = this;
		const { social, syncer } = obj;

		if (!blockedPlayers.includes(target)) {
			social.notifySelf({ message: "That player is not blocked" });
			return;
		}

		blockedPlayers.spliceWhere((f) => f === target);
		syncer.set(true, "social", "blockedPlayers", blockedPlayers);

		social.notifySelf({
			message: `Successfully unblocked ${target}`
			, className: "color-yellowB"
		});
	}

	, help: function () {
		const msg = [
			"You can use the following commands:"
			, ...Object.keys(commandRoles)
				.filter((c) => this.obj.auth.getAccountLevel() >= commandRoles[c])
				.map((c) => `/${c}`)
		].join("<br />");

		this.sendMessage(msg, "color-yellowB");
	}

	, isInChannel: function (character, channel) {
		return character.auth.customChannels.some((c) => (c === channel));
	}

	, roll: function () {
		if (!canChat(this.obj)) {
			this.sendMessage("Your character needs to be played for at least 3 minutes or be at least level 3 to be able to send messages in chat.", "color-redA");
			return;
		}

		const roll = 1 + Math.floor(Math.random() * 100);
		cons.emit("event", {
			event: "onGetMessages"
			, data: {
				messages: [{
					class: "color-grayB"
					, message: `${this.obj.name} rolled ${roll}`
					, type: "chat"
					, source: this.obj.name
				}]
			}
		});
	}

	, unEq: function () {
		let eq = this.obj.equipment;
		Object.keys(eq.eq).forEach(function (slot) {
			eq.unequip({ itemId: eq.eq[slot] });
		});
	}

	, clearInventory: function () {
		let inventory = this.obj.inventory;

		inventory.items
			.filter((i) => !i.eq)
			.map((i) => i.id)
			.forEach((i) => inventory.destroyItem({ itemId: i }, null, true));
	}

	, getGold: function (amount) {
		let newGold = this.obj.trade.gold + ~~amount;
		newGold = Math.max(-1000000000, Math.min(1000000000, newGold));

		this.obj.trade.gold = newGold;
		this.obj.syncer.set(true, "trade", "gold", newGold);
	}

	, setLevel: function (level) {
		let obj = this.obj;
		let syncer = obj.syncer;

		level = Math.max(1, ~~level);

		let stats = obj.stats;
		let values = stats.values;
		let oldLevel = values.level;

		values.level = level;
		obj.fireEvent("onLevelUp", values.level);

		let delta = level - oldLevel;

		values.hpMax += (40 * delta);

		syncer.setObject(true, "stats", "values", "level", level);
		syncer.setObject(true, "stats", "values", "hpMax", values.hpMax);

		process.send({
			method: "object"
			, serverId: obj.serverId
			, obj: {
				level: level
			}
		});

		stats.calcXpMax();
	}

	, godMode: function () {
		let obj = this.obj;

		let statValues = obj.stats.values;
		let newValues = {
			int: 10000000
			, str: 10000000
			, dex: 10000000
			, hpMax: 10000000
			, hp: 10000000
			, manaMax: 10000000
			, mana: 10000000
			, sprintChance: 100
			, vit: 10000000
		};

		let syncer = obj.syncer;

		for (let s in newValues) {
			let newValue = newValues[s];
			statValues[s] = newValue;

			syncer.setObject(true, "stats", "values", s, newValue);
		}

		obj.spellbook.calcDps();
	}

	, completeQuests: function () {
		let obj = this.obj;
		let quests = obj.quests;

		quests.quests.forEach(function (q) {
			q.isReady = true;
			q.complete();
		}, this);

		quests.quests = [];
		obj.instance.questBuilder.obtain(obj);
	}

	, getReputation: function (faction) {
		if (typeof (faction) !== "string") {
			return;
		}

		this.obj.reputation.getReputation(faction, 50000);
	}

	, loseReputation: function (faction) {
		if (typeof (faction) !== "string") {
			return;
		}

		this.obj.reputation.getReputation(faction, -50000);
	}

	, setStat: function (config) {
		this.obj.stats.values[config.stat] = ~~config.value;
	}

	, getXp: function (amount) {
		this.obj.stats.getXp(amount, this.obj, this.obj);
	}

	, die: function () {
		this.obj.stats.takeDamage({
			damage: { amount: 20000000 }
			, source: this.obj
			, target: this.obj
		});
	}

	, setPassword: async function (config) {
		let keys = Object.keys(config);
		let username = keys[0]
			.split("_")
			.join(" ");

		let hashedPassword = keys[1];

		await io.setAsync({
			key: username
			, table: "login"
			, value: hashedPassword
		});
	}

	, getMaterials: function (config) {
		if (typeof(config) === "object") {
			config = 100;
		}

		let inventory = this.obj.inventory;

		Object.entries(configMaterials).forEach(([material, blueprint]) => {
			inventory.getItem({
				name: material
				, quantity: config
				, material: true
				, ...blueprint
			});
		});
	}

	, broadcast: function (config, msg) {
		if (typeof(msg) === "object") {
			msg = Object.keys(msg).join(" ");
		}

		cons.emit("event", {
			event: "onGetMessages"
			, data: {
				messages: [{
					class: "color-blueA"
					, message: msg
					, type: "chat"
				}]
			}
		});
	}

	, saveAll: async function () {
		const { obj: { social } } = this;

		social.sendMessage("Initiating Save", "color-blueA");

		await connections.forceSaveAll();

		social.sendMessage("Save Complete", "color-blueA");
	}

	, rezone: function (msg) {
		rezone(this, msg);
	}

	, startEvent: function (msg) {
		startEvent(this, msg);
	}

	, stopEvent: function (msg) {
		stopEvent(this, msg);
	}

	, teleport: function (msg) {
		teleport(this, msg);
	}
};

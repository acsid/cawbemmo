//Imports
const bcrypt = require("bcrypt-nodejs");
const messages = require("../language/messages");
const skins = require("../config/skins");
const profanities = require("../language/profanities");
const fixes = require("../fixes/fixes");
const spirits = require("../config/spirits");
const ga = require("../security/ga");
const eventEmitter = require("../misc/events");

const playFunctions = require("./auth/onPlay");

const LOGIN_ILLEGAL_CHARS = [
	"'", "\"", "/", "\\", "(", ")", "[", "]", "{", "}", ":", ";", "<", ">", "+", "?", "*"
];

//This section of code is in charge of ensuring that we only ever create one account at a time,
// since we don't have a read/write lock on the characters table, we have to address it in code
const createLock = new _.Lock("createPlayer");

//Component Definition
module.exports = {
	type: "auth"

	, username: null
	, charname: null
	, characters: {}
	, characterList: []
	, stash: null
	, accountInfo: null

	, customChannels: []

	, play: async function (data) {
		if (!this.username || this.charname) {
			return;
		}
		const character = this.characters[data.data.name];
		if (!character || character.permadead) {
			return;
		}
		character.stash = this.stash;
		character.account = this.username;
		this.charname = character.name;

		playFunctions.updateStatus(this, character);
		await playFunctions.checkLoginRewards(this, character);

		await io.setAsync({
			key: this.username
			, table: "accountInfo"
			, value: this.accountInfo
			, serialize: true
		});

		this.obj.player.sessionStart = Date.now();
		this.obj.player.spawn(character, data.callback);
		_.log.auth.info("Player(%s) %s - Joined game as %s!", this.obj.id, this.username, character.name);
		eventEmitter.emit("playerObjAdded", {
			obj: {
				id: this.obj.id
			}
		});

		let prophecies = this.obj.prophecies ? this.obj.prophecies.simplify().list : [];
		await leaderboard.setLevel(character.name, this.obj.stats.values.level, prophecies);
	}

	, doSave: async function (callback) {
		const simple = this.obj.getSimple(true, true);
		delete simple.destroyed;
		delete simple.forceDestroy;

		simple.components.spliceWhere((f) => (f.type === "stash"));

		await io.setAsync({
			key: this.charname
			, table: "character"
			, value: simple
			, clean: true
			, serialize: true
		});
		await this.doSaveStash();

		if (callback) {
			callback();
		}
	}

	//This function is called from the 'forceSave' command. Because of this, the first argument is the action data
	// instead of (callback, saveStash)
	, doSaveManual: async function (msg) {
		await this.doSave();

		process.send({
			module: "atlas"
			, method: "resolveCallback"
			, msg: {
				id: msg.callbackId
			}
		});
	}

	, doSaveStash: async function () {
		const { username, obj: { stash } } = this;

		if (!stash.changed) {
			return;
		}
		await io.setAsync({
			key: username
			, table: "stash"
			, value: stash.serialize()
			, clean: true
			, serialize: true
		});
	}

	, simplify: function (self) {
		if (!self) {
			return;
		}
		return {
			type: "auth"
			, username: this.username
			, charname: this.charname
			, accountInfo: this.accountInfo
		};
	}

	, getCharacterList: async function (data) {
		if (!this.username) {
			return;
		}
		this.characterList = await io.getAsync({
			key: this.username
			, table: "characterList"
			, isArray: true
		});
		let res = this.characterList.map((c) => ({
			name: c.name ? c.name : c
			, level: leaderboard.getLevel(c.name ? c.name : c)
		}));
		data.callback(res);
	}

	, getCharacter: async function (data) {
		const charName = data.data.name;
		if (!this.characterList.some((c) => (c.name === charName || c === charName))) {
			return;
		}
		const character = await io.getAsync({
			key: charName
			, table: "character"
			, clean: true
		});

		await eventEmitter.emit("onAfterGetCharacter", {
			obj: this.obj
			, character
		});

		fixes.fixCharacter(character);

		character.cell = skins.getCell(character.skinId);
		character.sheetName = skins.getSpritesheet(character.skinId);

		this.characters[charName] = character;

		await this.getCustomChannels(character);

		await this.verifySkin(character);

		data.callback(character);
	}

	, getCustomChannels: async function (character) {
		this.customChannels = await io.getAsync({
			key: character.name
			, table: "customChannels"
			, isArray: true
		});
		const social = character.components.find((c) => (c.type === "social"));
		this.customChannels = fixes.fixCustomChannels(this.customChannels);
		if (social) {
			social.customChannels = this.customChannels;
		}
	}

	, verifySkin: async function (character) {
		const doesOwn = await this.doesOwnSkin(character.skinId);
		if (doesOwn) {
			return;
		}
		const defaultTo = "wizard";
		character.skinId = defaultTo;
		character.cell = skins.getCell(defaultTo);
		character.sheetName = skins.getSpritesheet(defaultTo);
	}

	, doesOwnSkin: async function (skinId) {
		const allSkins = skins.getList();
		const filteredSkins = allSkins.filter(({ default: isDefaultSkin }) => isDefaultSkin);

		const msgSkinList = {
			obj: this
			, allSkins
			, filteredSkins
		};
		await eventEmitter.emit("onBeforeGetAccountSkins", msgSkinList);

		return filteredSkins.some((f) => f.id === skinId);
	}

	, getSkinList: async function ({ callback }) {
		const allSkins = skins.getList();
		const filteredSkins = allSkins.filter(({ default: isDefaultSkin }) => isDefaultSkin);

		const msgSkinList = {
			obj: this
			, allSkins
			, filteredSkins
		};

		await eventEmitter.emit("onBeforeGetAccountSkins", msgSkinList);

		callback(filteredSkins);
	}

	, login: async function (msg) {
		let credentials = msg.data;

		if (credentials.username === "" || credentials.password === "") {
			msg.callback(messages.login.allFields);
			return;
		} else if (credentials.username.length > 32) {
			msg.callback(messages.login.maxUsernameLength);
			return;
		}
		const storedPassword = await io.getAsync({
			key: credentials.username
			, table: "login"
			, noParse: true
		});
		bcrypt.compare(credentials.password, storedPassword, this.onLogin.bind(this, msg));
	}

	, onLogin: async function (msg, err, compareResult) {
		const { data: { username } } = msg;

		const socket = this.obj.socket;
		if (!compareResult) {
			msg.callback(messages.login.incorrect);
			const clientIp = socket?.request.connection.remoteAddress;
			_.log.auth.notice("Player(%s) from %s - Login denied! Invalid password for %s", this.obj.id, clientIp, username);
			return;
		}
		_.log.auth.info("Player(%s) %s - Connected!", this.obj.id, username);

		const emBeforeLogin = {
			obj: this.obj
			, success: true
			, msg: null
			, username
		};
		await eventEmitter.emit("onBeforeLogin", emBeforeLogin);
		if (!emBeforeLogin.success) {
			msg.callback(emBeforeLogin.msg);
			return;
		}
		this.username = username;
		await cons.logOut(this.obj);
		socket.data.username = username;

		this.initTracker();

		const accountInfo = await io.getAsync({
			key: username
			, table: "accountInfo"
			, noDefault: true
		}) || {
			loginStreak: 0
			, level: 0
		};
		const msgAccountInfo = {
			username
			, accountInfo
		};
		await eventEmitter.emit("onBeforeGetAccountInfo", msgAccountInfo);
		await eventEmitter.emit("onAfterLogin", { username });

		this.accountInfo = msgAccountInfo.accountInfo;
		msg.callback();
	}

	, initTracker: function () {
		this.gaTracker = ga.connect(this.username);
	}

	, track: function (category, action, label, value = 1) {
		process.send({
			method: "track"
			, serverId: this.obj.serverId
			, obj: {
				category
				, action
				, label
				, value
			}
		});
	}

	, register: async function (msg) {
		const credentials = msg.data;
		if (credentials.username === "" || credentials.password === "") {
			msg.callback(messages.login.allFields);
			return;
		} else if (credentials.username.length > 32) {
			msg.callback(messages.login.maxUsernameLength);
			return;
		}
		if (credentials.username.indexOfAny(LOGIN_ILLEGAL_CHARS) >= 0) {
			msg.callback(messages.login.illegal);
			return;
		}

		const emBeforeRegisterAccount = {
			obj: this.obj
			, success: true
			, msg: null
			, username: msg.data.username
		};
		await eventEmitter.emit("onBeforeRegisterAccount", emBeforeRegisterAccount);

		if (!emBeforeRegisterAccount.success) {
			msg.callback(emBeforeRegisterAccount.msg);
			return;
		}

		const exists = await io.getAsync({
			key: credentials.username
			, ignoreCase: true
			, table: "login"
			, noDefault: true
			, noParse: true
		});
		if (exists) {
			msg.callback(messages.login.exists);
			return;
		}
		bcrypt.hash(credentials.password, null, null, this.onHashGenerated.bind(this, msg));
	}

	, onHashGenerated: async function (msg, err, hashedPassword) {
		await io.setAsync({
			key: msg.data.username
			, table: "login"
			, value: hashedPassword
		});

		this.accountInfo = {
			loginStreak: 0
			, level: 0
		};

		await io.setAsync({
			key: msg.data.username
			, table: "characterList"
			, value: []
			, serialize: true
		});

		this.username = msg.data.username;
		cons.logOut(this.obj);

		msg.callback();
	}

	, createCharacter: async function (msg) {
		const data = msg?.data;
		const name = data?.name || "";

		let error = null;
		if (!this.username) {
			error = messages.createCharacter.notConnected;
		} else if (typeof name !== "string" || name.length < 3 || name.length > 12) {
			error = messages.createCharacter.nameLength;
		} else if (name.indexOf("  ") >= 0 || !name.isAlphanumeric() || !profanities.isClean(name)) {
			error = messages.login.invalid;
		} else if (!spirits.list.includes(data.class)) {
			error = "invalid or missing class";
		}
		if (error) {
			if (typeof msg?.callback === "function") {
				msg.callback(error);
			}
			return;
		}
		await createLock.request(async () => {
			const exists = await io.getAsync({
				key: name
				, ignoreCase: true
				, table: "character"
				, noDefault: true
			});
			if (exists) {
				msg.callback(messages.login.charExists);
				return;
			}

			// Create new character
			_.assign(this.obj, {
				name: name
				, skinId: data.skinId
				, class: data.class
				, cell: skins.getCell(data.skinId)
				, sheetName: skins.getSpritesheet(data.skinId)
				, x: null
				, y: null
			});
			const simple = this.obj.getSimple(true);
			await this.verifySkin(simple);

			const prophecies = (data.prophecies || []).filter((p) => p);
			simple.components.push({
				type: "prophecies"
				, list: prophecies
			}, {
				type: "social"
				, customChannels: this.customChannels
			});

			const eBeforeSaveCharacter = {
				obj: simple
				, config: data
			};
			await eventEmitter.emit("beforeSaveCharacter", eBeforeSaveCharacter);

			await io.setAsync({
				key: name
				, table: "character"
				, value: eBeforeSaveCharacter.obj
				, serialize: true
			});

			this.characters[name] = simple;
			this.characterList.push(name);

			await io.setAsync({
				key: this.username
				, table: "characterList"
				, value: this.characterList
				, serialize: true
			});
		});

		this.initTracker();
		this.play({
			data: {
				name: name
			}
			, callback: msg.callback
		});
	}

	, deleteCharacter: async function (msg) {
		const data = msg.data;
		if ((!data.name) || (!this.username)) {
			return;
		}
		const name = data.name;
		if (!this.characterList.some((c) => ((c.name === name) || (c === name)))) {
			msg.callback([]);
			return;
		}
		const msgBeforeDeleteCharacter = {
			obj: this
			, name
			, success: true
			, msg: null
		};
		await eventEmitter.emit("beforeDeleteCharacter", msgBeforeDeleteCharacter);

		if (!msgBeforeDeleteCharacter.success) {
			msg.callback({
				success: false
				, msg: msgBeforeDeleteCharacter.msg
			});
			return;
		}
		await io.deleteAsync({
			key: name
			, table: "character"
		});

		this.characterList.spliceWhere((c) => (c.name === name || c === name));
		let characterList = this.characterList
			.map((c) => ({
				name: c.name ? c.name : c
				, level: leaderboard.getLevel(c.name ? c.name : c)
			}));

		await io.setAsync({
			key: this.username
			, table: "characterList"
			, value: characterList
			, serialize: true
		});

		await leaderboard.deleteCharacter(name);

		const result = this.characterList
			.map((c) => ({
				name: c.name ? c.name : c
				, level: leaderboard.getLevel(c.name ? c.name : c)
			}));

		msg.callback({
			success: true
			, characterList: result
		});
	}

	, permadie: function () {
		this.obj.permadead = true;
		this.doSave(this.onPermadie.bind(this));
	}

	, onPermadie: function () {
		process.send({
			method: "object"
			, serverId: this.obj.serverId
			, obj: {
				dead: true
			}
		});
	}

	, getAccountLevel: function () {
		return this.accountInfo.level;
	}
};

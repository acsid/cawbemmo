//Globals
global.io = require("../db/io");
global._ = require("../misc/helpers");
global.consts = require("../config/consts");
global.instancer = require("./instancer");
global.eventManager = require("../events/events");
global.clientConfig = require("../config/clientConfig");
global.rezoneManager = require("./rezoneManager");

//Imports
const components = require("../components/components");
const mods = require("../misc/mods");
const animations = require("../config/animations");
const skins = require("../config/skins");
const factions = require("../config/factions");
const classes = require("../config/spirits");
const spellsConfig = require("../config/spellsConfig");
const spells = require("../config/spells");
const recipes = require("../config/recipes/recipes");
const itemTypes = require("../items/config/types");
const salvager = require("../items/salvager");
const mapManager = require("../world/mapManager");
const itemEffects = require("../items/itemEffects");
const profanities = require("../language/profanities");
const eventEmitter = require("../misc/events");

//Worker
instancer.mapName = process.argv[2];

const onCpnsReady = async function () {
	factions.init();
	skins.init();
	animations.init();
	classes.init();
	spellsConfig.init();
	spells.init();
	itemTypes.init();
	salvager.init();
	mapManager.init();
	recipes.init();
	itemEffects.init();
	profanities.init();
	rezoneManager.init();

	await clientConfig.init();

	process.send({
		method: "onReady"
	});
};

const onModsReady = function () {
	components.init(onCpnsReady);
};

const onCrash = async (e) => {
	if (e.toString().indexOf("ERR_IPC_CHANNEL_CLOSED") >= 0) {
		return;
	}
	_.log.worker.error(`Error Logged: ${e.toString()}\r\n`, e.stack);
	await io.setAsync({
		key: new Date()
		, table: "error"
		, value: e.toString() + " | " + e.stack.toString()
	});
	process.send({
		event: "onCrashed"
	});
};

const onDbReady = async function () {
	require("../misc/random");

	process.on("uncaughtException", onCrash);
	process.on("unhandledRejection", onCrash);

	await mods.init();

	onModsReady();
};

io.init(onDbReady);

process.on("message", (m) => {
	if (m.module) {
		const instances = instancer.instances;
		const iLen = instances.length;
		for (let i = 0; i < iLen; i++) {
			const objects = instances[i].objects.objects;
			const oLen = objects.length;
			let found = false;
			for (let j = 0; j < oLen; j++) {
				const object = objects[j];

				if (object.name === m.args[0]) {
					const mod = object.instance[m.module];
					mod[m.method].apply(mod, m.args);

					found = true;
					break;
				}
			}
			if (found) {
				break;
			}
		}
	} else if (m.threadModule) {
		global[m.threadModule][m.method](m.data);
	} else if (m.method) {
		instancer[m.method](m.args);
	} else if (m.event) {
		eventEmitter.emit(m.event, m.data);
	}
});

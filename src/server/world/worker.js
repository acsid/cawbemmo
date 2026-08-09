// Components Imports
const COMPONENTS_CONFIGURATIONS_PATHS = {
	components: "../components/components"

	, factions: "../config/factions"
	, skins: "../config/skins"
	, animations: "../config/animations"

	, classes: "../config/spirits"
	, spells: "../config/spells"

	, itemTypes: "../items/config/types"
	, salvager: "../items/salvager"
	, mapManager: "../world/mapManager"
	, recipes: "../config/recipes/recipes"
	, itemEffects: "../items/itemEffects"
	, profanities: "../language/profanities"
};

const workerConfig = JSON.parse(process.argv[2]);

(async function () {
	// Globals
	global._ = (await import("../misc/helpers.mjs")).default;
	// Configure logger base name
	_.log = _.log.worker[`Map/${workerConfig.name}`];
	// Log warnings
	process.on("warning", (e) => {
		_.log.warn(`Warning: ${e.toString()}\r\n`, e.stack);
	});

	global.io = require("../db/io");
	global.consts = require("../config/consts");

	global.instancer = require("./instancer");
	instancer.mapName = workerConfig.name;

	global.eventManager = require("../events/events");
	global.clientConfig = require("../config/clientConfig");
	global.rezoneManager = require("./rezoneManager");
	require("../misc/random");

	global.language = (await import("../language/index.mjs")).default;

	const mods = require("../misc/mods");
	const eventEmitter = require("../misc/events");

	// Init database
	await new Promise((resolve) => io.init(resolve));
	// Add crash loggers
	const onCrash = async (e) => {
		if (e.toString().indexOf("ERR_IPC_CHANNEL_CLOSED") >= 0) {
			return;
		}
		const errMsg = `Worker Map/${workerConfig.name} Crashed! ${e}\r\n${e.stack}`;
		//eslint-disable-next-line no-console
		console.error(errMsg);
		await io.setAsync({
			key: new Date().toISOString()
			, table: "error"
			, value: errMsg
		});
		process.send({ event: "onCrashed"
			, name: workerConfig.name
		});
	};
	process.on("uncaughtException", onCrash);
	process.on("unhandledRejection", onCrash);
	// Load mods
	await mods.init({ logger: _.log.mods });
	// and then load the components configurations.
	await _.requireAll(module, COMPONENTS_CONFIGURATIONS_PATHS
		, (component, componentName) => {
			//if (componentName == "factions") {
			//	component = new component();
			//}
			component.init();
			return component;
		}
		, _.log.ComponentsConfiguration
	);

	rezoneManager.init();
	await clientConfig.init();

	let closing = false;
	const onClose = async () => {
		if (closing) {
			return;
		}
		closing = true;
		_.log.debug("Received SIGTERM, saving before disconnect...");
		const instances = instancer.instances;
		for (let i = instances.length - 1; i >= 0; --i) {
			const objects = instances[i].objects.objects;
			const oLen = objects.length;
			for (let j = 0; j < oLen; j++) {
				const object = objects[j];
				if (object?.auth?.doSave) {
					_.log.debug("Saving", object.name);
					await object.auth.doSave();
				}
			}
		}
		if (process.connected) {
			process.disconnect();
		}
		_.log.debug("Disconnedted, closing thread.");
		process.exit();
	};
	process.on("SIGINT", onClose);
	process.on("SIGTERM", onClose);

	// Start listening to messages.
	process.on("message", (m) => {
		//_.log.worker.trace("New message %o", m);
		if (m.module) {
			const instances = instancer.instances;
			const iLen = instances.length;
			for (let i = 0; i < iLen; i++) {
				const objects = instances[i].objects.objects;
				const oLen = objects.length;
				for (let j = 0; j < oLen; j++) {
					const object = objects[j];
					if (object.name === m.args[0]) {
						const mod = object.instance[m.module];
						//_.log.worker.trace("Sending message to instancer module.");
						return mod[m.method].apply(mod, m.args);
					}
				}
			}
			_.log.worker.warn("Missing handler module for message %o", m);
			return;
		}
		if (m.threadModule) {
			//_.log.worker.trace("Sending message to thread module.");
			return global[m.threadModule][m.method](m.data);
		}
		if (m.method) {
			//_.log.worker.trace("Sending message to instancer.");
			return instancer[m.method](m.args);
		}
		if (m.event) {
			//_.log.worker.trace("Sending message to eventEmitter.");
			return eventEmitter.emit(m.event, m.data);
		}
		_.log.worker.warn("Discarded invalid message %o", m);
	});
	// Notify parent that worker is ready.
	process.send({
		method: "onReady"
	});
})().catch(
	(reason) => {
		_.log.fatal(`Failed to initialize components: ${reason.toString()}\r\n`, reason.stack);
		process.send({ event: "onCrashed"
			, name: workerConfig.name
		});
		process.exit();
	}
);

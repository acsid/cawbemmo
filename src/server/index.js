require("./globals");

process.on("warning", (e) => {
	_.log.warn(`Warning: ${e.toString()}\r\n`, e.stack);
});

const server = require("./server/index");
const mods = require("./misc/mods");
const fixes = require("./fixes/fixes");
const { close: closeThreadManager } = require("./world/threadManager");

const COMPONENTS_CONFIGURATIONS_PATHS = {
	routerConfig: "./security/routerConfig"
	, animations: "./config/animations"
	, classes: "./config/spirits"

	, spellsConfig: "./config/spellsConfig"
	, spells: "./config/spells"
	, recipes: "./config/recipes/recipes"
	, itemTypes: "./items/config/types"
	, salvager: "./items/salvager"
	, profanities: "./language/profanities"

	, mapManager: "./world/mapManager"
	, components: "./components/components"

	, skins: "./config/skins"
	, factions: "./config/factions"
};

(async function () {
	await new Promise(resolve => io.init(resolve));
	await fixes.fixDb();

	const onError = async (e) => {
		if (e.toString().indexOf("ERR_IPC_CHANNEL_CLOSED") >= 0) {
			return;
		}
		const errMsg = `MainThread Crashed! ${e}\r\n${e.stack}`;
		//eslint-disable-next-line no-console
		console.error(errMsg);
		await io.setAsync({
			key: new Date().toISOString()
			, table: "error"
			, value: errMsg
		});
		process.exit();
	};
	process.on("unhandledRejection", onError);
	process.on("uncaughtException", onError);

	await mods.init();
	await _.requireAll(module, COMPONENTS_CONFIGURATIONS_PATHS, (c) => c.init(), _.log.ComponentsConfiguration)

	await clientConfig.init();
	await server.init();
	let closing = false;
	const onClose = async () => {
		if (closing) {
			return;
		}
		closing = true;
		await server.close(server);
		await closeThreadManager();
		process.exit();
	};
	process.on("SIGINT", onClose);
	process.on("SIGTERM", onClose);

	await leaderboard.init();
})().catch(
	(reason) => {
		_.log.fatal(`Failed to initialize components: ${reason.toString()}\r\n`, reason.stack);
		process.exit();
	}
);

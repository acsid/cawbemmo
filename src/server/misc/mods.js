const fileLister = require("../misc/fileLister");
const events = require("../misc/events");

const knownModuleSet = new Set();

module.exports = {
	mods: []

	, init: async function ({ logger = _.log.mods } = {}) {
		this.logger = logger;
		//Load all mods
		const modList = fileLister.getDirectories("mods");
		const loadList = modList.map((modName) => {
			if (!knownModuleSet.has(modName)) {
				knownModuleSet.add(modName);
				this.logger.debug("Loading module '%s'", modName);
			}
			const path = `../mods/${modName}/index`;
			const mod = _.safeRequire(module, path);
			if (!mod) {
				return;
			}
			return {
				id: mod.id ? mod.id : modName.replace("iwd-", "")
				, folderName: modName
				, path
				, mod
			};
		}).filter((m) => Boolean(m));
		// Enable mods
		while (loadList.length > 0) {
			const m = loadList.shift();
			const { id, folderName, mod } = m;
			const { dependsOn = [] } = mod;
			// Check if all dependencies are loaded.
			const wait = dependsOn.some((d) => loadList.some((l) => l.id === d));
			if (wait) {
				loadList.push(m);
				continue;
			}
			this.logger.info("Enabling mod '%s' (%s).", id, folderName);
			await this.onGetMod(folderName, mod);
			this.mods.push(mod);
		}
	}

	, onGetMod: async function (name, mod) {
		if (mod.disabled) {
			return;
		}

		mod.isMapThread = Boolean(global.instancer);
		mod.events = events;
		mod.folderName = "server/mods/" + name;
		mod.relativeFolderName = "mods/" + name;

		if (mod.has("extraScripts")) {
			for (const exName of mod.extraScripts) {
				const extra = _.safeRequire(module, `../mods/${name}/${exName}`, this.logger);
				if (extra) {
					this.onGetExtra(name, mod, extra);
				}
			}
		}

		if (typeof mod.init === "function") {
			await mod.init();
		}

		if (mod.isMapThread && typeof mod.initMapThread === "function") {
			await mod.initMapThread();
		} else if (!mod.isMapThread && typeof mod.initMainThread === "function") {
			await mod.initMainThread();
		}
	}

	, onGetExtra: function (name, mod, extra) {
		extra.folderName = "server/mods/" + name;
	}

	, tick: function () {
		for (const m of this.mods) {
			if (m.tick) {
				m.tick();
			}
		}
	}
};

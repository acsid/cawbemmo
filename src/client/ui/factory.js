import uiBase from "/ui/uiBase.js";
import events from "/js/system/events.js";
import client from "/js/system/client.js";
import globals from "/js/system/globals.js";
import browserStorage from "/js/system/browserStorage.js";

const UI_HOTKEYS = [
	"o" // Online players
	, "j" // Hero panel
	, "h" // Help
	, "i" // Inventory
];

const setUiTypes = (list) => {
	list.forEach((l, i) => {
		if (typeof l === "string") {
			// Some UIs are strings. In these cases,
			// the path should default to the client/ui/templates folder
			list[i] = {
				type: l
				, path: `/ui/templates/${l}`
				, load: true
			};
		} else if (!l.type) {
			l.type = l.path.split("/").pop();
		} else if (!l.path) {
			l.path = `/ui/templates/${l.type}`;
		}
	});
};

const tosAcceptanceValid = () => {
	const acceptedVersion = browserStorage.get("tos_accepted_version");
	const currentVersion = globals.clientConfig.tos.version;
	return acceptedVersion === currentVersion;
};

const hasNewContent = () => {
	const logVersion = browserStorage.get("changelog_version");
	const currentVersion = globals.clientConfig.changeLog.version;
	return logVersion !== currentVersion;
};

export default {
	uis: []
	, ingameUisBuilt: false

	, init: function () {
		events.on("uikeypress", this.onUiKeyPress.bind(this));
		events.on("uiaction", this.onUiAction.bind(this));
		events.on("inputchanged", this.onInputChanged.bind(this));
		window.addEventListener("contextmenu", this.onContextMenu.bind(this));

		events.on("onResize", this.onResize.bind(this));
		events.on("onDestroyedUi", this.onDestroyedUi.bind(this));

		events.on("onBuildIngameUis", this.onBuildIngameUis.bind(this));

		setUiTypes(globals.clientConfig.uiLoginList);
		setUiTypes(globals.clientConfig.uiList);

		for (const uiConfig of globals.clientConfig.uiLoginList) {
			if (!uiConfig.load) {
				continue;
			}
			if (uiConfig.preload) {
				_.log.ui.factory.preload.debug("Preloading UI module %o", uiConfig);
				Promise.resolve(import(`${uiConfig.path}/${uiConfig.type}.js`)).catch(_.log.ui.factory.preload.error);
			} else {
				this.buildFromConfig(uiConfig);
			}
		}
	}

	, onDestroyedUi: function (ui) {
		if (!ui || !ui.type) {
			_.log.factory.onDestroyedUi.error("Invalid UI reference: %o", this);
			return;
		}
		_.log.factory.trace("Cleaning destroyed UI %o", this);
		this.uis.spliceWhere((u) => u.type === ui.type);
	}

	, onBuildIngameUis: async function () {
		if (!this.ingameUisBuilt) {
			events.clearQueue();
			await Promise.all(
				globals.clientConfig.uiList
					.filter((u) => u.load)
					.map((u) => this.buildFromConfig(u))
			);
			this.ingameUisBuilt = true;
		}
		client.request({
			threadModule: "instancer"
			, method: "clientAck"
			, data: {}
		});
	}

	, build: function (type, options) {
		let config = globals.clientConfig.uiList.find((u) => u.type === type);
		if (!config) {
			config = globals.clientConfig.uiLoginList.find((u) => u.type === type);
		}
		if (!config) {
			throw new Error(`Can't build ${type}! Missing configuration.`);
		}
		return this.buildFromConfig(config, options);
	}

	, buildFromConfig: async function (config, options = {}) {
		const { type, path } = config;

		let ui = this.getUi(type);
		if (ui) {
			_.log.ui.factory.buildFromConfig.warn("UI module '%s' already loaded.", type);
			return ui;
		}

		_.log.ui.factory.buildFromConfig.debug("Loading UI module '%s'.", type);
		const template = await import(`${path}/${type}.js`);
		ui = _.assign({ type }, uiBase, template.default, options);
		const renderUI = this.renderUi.bind(this, ui);
		await new Promise(
			(res) => requestAnimationFrame(
				(timeStamp) => {
					renderUI();
					res();
				}
			)
		);
		return ui;
	}

	, renderUi: function (ui) {
		ui.render();
		ui.el.data("ui", ui);
		_.log.factory.debug("Element %o linked to UI %o", ui.el, ui);
		this.uis.push(ui);
	}

	, focusNextElement: function ( reverse, activeElem ) {
		// Check if an element is defined or use activeElement
		activeElem = activeElem instanceof HTMLElement ? activeElem : document.activeElement;

		const queryString = [
			`a:not([disabled]):not([tabindex="-1"])`
			, `button:not([disabled]):not([tabindex="-1"])`
			, `input:not([disabled]):not([tabindex="-1"])`
			, `select:not([disabled]):not([tabindex="-1"])`
			, `[tabindex]:not([disabled]):not([tabindex="-1"])`
		].join(",");

		const focusable = Array.from(document.querySelectorAll(queryString))
			.filter((elem) => { // Check for visibility while always include the current activeElement.
				if (elem === activeElem) {
					return true;
				}
				return (elem.offsetWidth > 0 || elem.offsetHeight > 0) && elem.tabIndex !== -1;
			})
			.sort((a, b) => {
				// Sort the array by index from smallest to largest
				if (a.tabIndex > 0 && b.tabIndex > 0) {
					if (a.tabIndex < b.tabIndex) {
						return -1;
					}
					if (b.tabIndex < a.tabIndex) {
						return 1;
					}
					return 0;
				}
				if (a.tabIndex > 0) {
					return -1;
				}
				if (b.tabIndex > 0) {
					return 1;
				}
				if (!a.compareDocumentPosition) {
					return 0;
				}
				const position = a.compareDocumentPosition(b);
				if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
					// If 'b' follows 'a' or 'b' is contained by 'a', then 'a' comes before 'b'
					return -1;
				} else if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
					// If 'b' precedes 'a' or 'b' contains 'a', then 'b' comes before 'a'
					return 1;
				}
				return 0;
			});

		let focusElem;
		// if reverse is true use the previous focusable element
		if (reverse) {
			focusElem = focusable[focusable.indexOf(activeElem) - 1] || focusable[focusable.length - 1];
		} else {
			// reverse is false use the next focusable element
			focusElem = focusable[focusable.indexOf(activeElem) + 1] || focusable[0];
		}
		if (focusElem) {
			focusElem.focus();
		}
		return focusElem;
	}

	, onContextMenu: function (e) {
		const allowed = ["txtUsername", "txtPassword"].some((s) => $(e.target).hasClass(s));
		if (!allowed) {
			e.preventDefault();
			return false;
		}
	}

	, onResize: function () {
		for (const ui of this.uis) {
			if (ui.centered) {
				ui.center();
			} else if (ui.centeredX || ui.centeredY) {
				ui.center(ui.centeredX, ui.centeredY);
			}
		}
	}

	, onUiAction: function (e) {
		if (e.actionName === "mainmenu") {
			for (const u of this.uis) {
				if (!u.modal || !u.shown) {
					continue;
				}
				e.consumed = true;
				u.toggle();
			}
			$(".uiOverlay").hide();
			events.emit("onHideContextMenu");
			return;
		}
		if (e.actionName === "select") {
			this.focusNextElement();
			e.consumed = true;
		}
	}

	, onUiKeyPress: function (e) {
		if (!isMobile && e.key === "F11") {
			events.emit("onToggleFullscreen");
			e.consumed = true;
			return;
		}
		if (UI_HOTKEYS.includes(e.key)) {
			$(".uiOverlay").hide();
		}
	}

	, onInputChanged: function (e) {
		if (e.consumed) {
			return;
		}
		//_.log.factory.onInputChanged.trace(e);
	}

	, preload: function () {
		const loadingPromises = [];
		for (const moduleInfo of globals.clientConfig.uiList) {
			if (moduleInfo.preload === false) {
				continue;
			}
			_.log.ui.factory.preload.debug("Preloading UI module %o", moduleInfo);
			loadingPromises.push(import(`${moduleInfo.path}/${moduleInfo.type}.js`));
		}
		Promise.all(loadingPromises).then(this.afterPreload.bind(this), _.log.ui.factory.preload.error);
	}

	, afterPreload: function () {
		if (!tosAcceptanceValid()) {
			return this.build("terms");
		}
		if (hasNewContent()) {
			return this.build("changeLog");
		}
		return this.build("characters");
	}

	, update: function () {
		let uis = this.uis;
		let uLen = uis.length;
		for (let i = 0; i < uLen; i++) {
			let u = uis[i];
			if (u.update) {
				u.update();
			}
		}
	}

	, exitGame: function () {
		const elmList = $(`[class^="ui"]:not(.ui-container)`).toArray();
		for (const el of elmList) {
			const ui = $(el).data("ui");
			if (ui && ui.destroy) {
				ui.destroy();
			}
		}
		this.ingameUisBuilt = false;
	}

	, getUi: function (type) {
		return this.uis.find((u) => u.type === type);
	}

	, onElementActivated: function (e) {
		const target = $(e.currentTarget);
		const uiType = target.data("ui");
		if (uiType) {
			const ui = this.getUi(uiType);
			if (ui) {
				ui.toggle();
				return;
			}
			this.build(uiType, {
				modal: true
			});
			return;
		}
		const href = target.data("href");
		if (href) {
			window.open(href, "_blank");
			return;
		}
		if (target.hasClass("btnClose")) {
			return;
		}
		_.log.factory.elementActivated.error("Target %o couldn't be handled.", target);
	}
};

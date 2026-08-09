import "/js/misc/helpers.js";
import client from "/js/system/client.js";
import uiFactory from "/ui/factory.js";
import renderer from "/js/rendering/renderer.js";
import objects from "/js/objects/objects.js";
//import effects from "/js/rendering/effects.js";
import numbers from "/js/rendering/numbers.js";
import input from "/js/input.js";
import events from "/js/system/events.js";
import sound from "/js/sound/sound.js";
import globals from "/js/system/globals.js";
import spriteRegistry from "/js/system/spriteRegistry.js";
import locale from "/js/locale/index.js";
import resources from "/js/resources.js";
import components from "/js/components.js";
import "/ui/templates/tooltips/tooltips.js";

const WORKER_PATH = "/service-worker.js";

let fnQueueTick = null;
const getQueueTick = (updateMethod) => {
	return () => requestAnimationFrame(updateMethod);
};

const loadLongPress = async () => {
	return await import("/js/dependencies/long-press-event.min.js");
};

const registerServiceWorker = async () => {
	try {
		const registration = await navigator.serviceWorker.register(WORKER_PATH);
		_.log.serviceWorker.debug("Service Worker registered %o", registration);
	} catch (error) {
		_.log.serviceWorker.error("Service Worker registration failed:", error);
	}
};

const main = {
	hasFocus: true

	, lastRender: 0
	, msPerFrame: Math.floor(1000 / 60)

	, init: async function () {
		if ("serviceWorker" in navigator) {
			await registerServiceWorker();
		} else {
			_.log.serviceWorker.trace("Service Worker not supported!");
		}
		if (isMobile) {
			$("#ui-container").addClass("mobile");

			//If we're on an ios device, we need to load longPress since that polyfills contextmenu for us
			if (_.isIos()) {
				await loadLongPress();
			}
		}

		if (window.location.search.includes("hideMonetization")) {
			$("#ui-container").addClass("hideMonetization");
		}

		await client.init();
		await globals.init();
		await locale.init();

		// Load the animated loader instead of the initial static placeholder.
		this.loader = await uiFactory.buildFromConfig({
			type: "loader"
			, path: "/ui/templates/loader"
		});
		// Remove the static loader.
		$("#loader-container").remove();

		// Load all content.
		await Promise.all([
			resources.init()
			, components.init()
			, sound.init()
		]);
		// Loading complete.
		events.emit("onResourcesLoaded");

		// Preload per-sheet sprite overrides + cache image dimensions (needs resources loaded).
		// Must finish before any UI renders below.
		await spriteRegistry.init();

		window.onfocus = this.onFocus.bind(this, true);
		window.onblur = this.onFocus.bind(this, false);

		input.init("#ui-container");
		objects.init();
		await renderer.init();
		numbers.init();
		uiFactory.init();

		// Init complete, remove loader.
		this.loader.destroy();
		delete this.loader;

		fnQueueTick = getQueueTick(this.update.bind(this));
		fnQueueTick();
	}

	, onFocus: function (hasFocus) {
		this.hasFocus = hasFocus;
		if (hasFocus) {
			this.msPerFrame = Math.floor(1000 / 60);
		} else {
			input.resetKeys();
			this.msPerFrame = Math.floor(1000 / 15);
		}
	}

	, update: function () {
		const time = Date.now();
		if (time - this.lastRender < this.msPerFrame - 1) {
			fnQueueTick();
			return;
		}

		input.update();
		objects.update();
		renderer.update();
		uiFactory.update();
		numbers.update();

		renderer.render();

		this.lastRender = time;
		fnQueueTick();
	}
};

export default main;
main.init();

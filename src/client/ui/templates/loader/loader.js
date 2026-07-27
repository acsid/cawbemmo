import events from "/js/system/events.js";
import locale from "/js/locale/index.js";
import factory from "/ui/factory.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/loader/template.html");

const loadingProgress = {
	resources: 0
	, components: 0
	, sounds: 0
};

const setLoaderProgress = ({ type, progress }) => {
	loadingProgress[type] = progress;

	// Calculate total progress (average of all types)
	let modsCount = 0;
	let loadingTotal = 0;
	for (const pctAmount of Object.values(loadingProgress)) {
		modsCount++;
		loadingTotal += pctAmount;
	}
	const totalProgress = loadingTotal / modsCount;
	_.log.loader.info(`Loading ${(totalProgress * 100).toFixed(2)}% - ${type} ${(progress * 100).toFixed(2)}%`);

	const uiLoader = factory.getUi("loader");
	if (uiLoader) {
		uiLoader.setLoaderProgress(totalProgress, type, progress);
	}
};

const createTemplate = function () {
	const tpl = template.content.cloneNode(true);
	const progressContainer = tpl.querySelector(".progress-container");
	progressContainer.parentNode.removeChild(progressContainer);
	_.log.loader.debug("Loader template %o", tpl);
	return tpl.childNodes;
};

export default {
	beforeRender: function () {
		events.on("loaderProgress", setLoaderProgress);
		this.tpl = createTemplate();
	}
	, beforeDestroy: function () {
		events.off("loaderProgress", setLoaderProgress);
	}
	, setLoaderProgress: async function (totalProgress, subType, subProgress) {
		if (!this.el) {
			return;
		}
		let ct = this.el.find("#progress-container-" + subType);
		if (!ct || ct.length <= 0) {
			ct = $(template.content.querySelector(".progress-container").cloneNode(true));
			ct.attr("id", "progress-container-" + subType);
			const pbar = ct.find(".progress-bar-fill");
			pbar.addClass(subType);
			ct.insertBefore(this.el.find(".loader-text"));
		}
		ct.find(".progress-bar-fill").width(`${Math.floor(subProgress * 100)}%`);
		ct.find(".progress-label").text(`${subType} ${(subProgress * 100).toFixed(2)}%`);
		this.el.find(".loader-text").text(locale.translate("loader", "loading", { progress: (totalProgress * 100).toFixed(2) }));

		// Handle fade out animation when loading is complete
		if (totalProgress >= 1) {
			this.el.addClass("fade-out"); // Add fade-out class to trigger animation
			await _.asyncDelay(500);
			this.el.hide();
		}
	}
};

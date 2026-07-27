import locale from "/js/locale/index.js";
import uiFactory from "/ui/factory.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/credits/template.html");

export default {
	hasClose: true

	, beforeRender: function () {
		this.tpl = locale.localizeHTML(locale.dictionary, template.cloneNode(true));
	}
	, postRender: function () {
		this.find(".btn").on("click", uiFactory.onElementActivated.bind(uiFactory));
	}
	, afterHide: function () {
		setTimeout(() => this.destroy(), 33);
	}
	, beforeDestroy: function () {
		if (uiFactory.getUi("mainMenu")) {
			// If mainMenu is loaded, do nothing.
			return;
		}
		if (!uiFactory.getUi("login")) { // Open login screen.
			uiFactory.build("login");
		}
	}
};

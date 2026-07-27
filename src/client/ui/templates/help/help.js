//import events from "/js/system/events.js";
import locale from "/js/locale/index.js";
import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const rawTemplate = await _.loadHTML("/ui/templates/help/template.html", { raw: true });
//Resolve ${help.*} tokens against the active locale dictionary. Safe to run at
//module-eval: help loads lazily, after locale.init() during client startup.
const template = locale.getLocalizedMessage(locale.dictionary, rawTemplate);

export default {
	tpl: template

	, modal: true
	, hasClose: true

	, isFlex: true

	, postRender: function () {
		this.onEvent("keydown", this.onKeyDown.bind(this));
		this.onEvent("onShowHelp", this.toggle.bind(this));

		this.on(".toslink", "click", this.redirect.bind(this));
	}

	, onKeyDown: function (e) {
		if (e.key === "h") {
			this.toggle();
		}
	}

	, redirect: function (e) {
		let currentLocation = $(e.currentTarget).attr("location");
		window.open(currentLocation, "_blank");
	}
};

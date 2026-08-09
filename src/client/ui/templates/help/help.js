//import events from "/js/system/events.js";
import input from "/js/input.js";
import locale from "/js/locale/index.js";
import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const rawTemplate = await _.loadHTML("/ui/templates/help/template.html", { raw: true });

// Function dictionary for locale.getLocalizedMessage: resolves tokens against the active locale.
// ${help.*} delegates to locale.dictionary;
// ${key.<action>} reads the live keymap then looks up a per-locale label for the key token in locale.dictionary.key.
// Re-emits any other token verbatim, matching the locale resolver's fallback.
const helpDict = (...parts) => {
	if (parts[0] === "key" && parts[1]) {
		const keyToken = input.getKeyForAction(parts[1]);
		if (!keyToken) {
			return parts.join(".");
		}
		// Look up a display label (e.g. "esc" -> "escape"/"espace") fall back to the raw token if no label exists.
		return locale.dictionary.key?.[keyToken] || keyToken;
	}
	// Delegate help.* and any other locale tokens to the object dictionary.
	return locale.getMessage(locale.dictionary, parts);
};

const template = locale.getLocalizedMessage(helpDict, rawTemplate);

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

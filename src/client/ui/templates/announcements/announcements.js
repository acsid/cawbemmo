//import events from "/js/system/events.js";
import input from "/js/input.js";
import locale from "/js/locale/index.js";
import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/announcements/template.html", { raw: true });
const templateLine = await _.loadHTML("/ui/templates/announcements/templateLine.html", { raw: true });

//Function dictionary for locale.getLocalizedMessage: resolves `key.<action>` tokens against the live keymap (e.g. ${key.gather} -> "G"),
// and re-emits any other token verbatim. Reuses the locale resolver's ${...} scanning rather than re-implementing it.
const keyDict = (...parts) => {
	if (parts[0] === "key" && parts[1]) {
		const key = input.getKeyForAction(parts[1]);
		//Fall back to the token's bare name if the action is unbound, matching
		//how the locale resolver treats unresolved tokens.
		return key || parts.join(".");
	}
	return parts.join(".");
};

export default {
	tpl: template

	, message: null
	, maxTtl: 160

	, postRender: function () {
		this.onEvent("onGetAnnouncement", this.onGetAnnouncement.bind(this));
	}

	, onGetAnnouncement: function (e) {
		if (isMobile && /\$\{key\.\w+\}/.test(e.msg)) {
			return;
		}

		this.clearMessage();

		let container = this.find(".list");

		//Resolve ${key.<action>} tokens against the live keymap before display.
		let msg = locale.getLocalizedMessage(keyDict, e.msg);
		let html = templateLine
			.replace("$MSG$", msg);

		let el = $(html)
			.appendTo(container);

		if (e.type) {
			el.addClass(e.type);
		}
		if (e.zIndex) {
			el.css("z-index", e.zIndex);
		}
		if (e.top) {
			el.css("margin-top", e.top);
		}

		this.message = {
			ttl: e.ttl ?? this.maxTtl
			, el: el
		};
	}

	, update: function () {
		let message = this.message;
		if (!message) {
			return;
		}

		message.ttl--;

		if (message.ttl <= 0) {
			this.clearMessage();
		}
	}

	, clearMessage: function () {
		let message = this.message;
		if (!message) {
			return;
		}

		this.message = null;
		message.el.remove();
	}
};

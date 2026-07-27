import events from "/js/system/events.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/context/template.html", { raw: true });
const templateItem = await _.loadHTML("/ui/templates/context/templateItem.html", { raw: true });

export default {
	tpl: template
	, modal: true

	, config: null

	, postRender: function () {
		this.onEvent("onContextMenu", this.onContextMenu.bind(this));
		this.onEvent("onHideContextMenu", this.onMouseDown.bind(this));
		this.onEvent("mousedown", this.onMouseDown.bind(this));
		this.onEvent("uikeypress", this.onUiKeyPress.bind(this));

		$("#ui-container").on("mouseup", this.onMouseDown.bind(this));
	}

	, onContextMenu: function (config, e) {
		this.config = config;

		let container = this.el.find(".list")
			.empty();

		config.forEach((c, i) => {
			const text = (c.text || c);
			const hotkey = c.hotkey;
			const suffix = c.suffix;

			const html = templateItem
				.replace("$TEXT$", text);

			const row = $(html)
				.appendTo(container);

			if (hotkey) {
				row.find(".hotkey").html(`(${hotkey})`);
			} else if (suffix) {
				row.find(".hotkey").html(`${suffix}`);
			}

			if (c.callback) {
				row.on("click", this.onClick.bind(this, i, c.callback));
				row.on("click", events.emit.bind(events, "onClickContextItem"));
			} else {
				row.addClass("no-hover");

				if (text.includes("---")) {
					row.addClass("divider");
				}
			}
		});

		const pos = {
			left: e.clientX
			, top: e.clientY
		};

		//Check for a customEvent, like long touch
		if (_.isIos()) {
			pos.left = e.detail.clientX;
			pos.top = e.detail.clientY;
		}

		pos["max-height"] = window.innerHeight - pos.top - 10;

		this.el
			.css(pos)
			.show();
	}

	, onClick: function (index, callback) {
		this.el.hide();
		callback();
	}

	, onMouseDown: function (e) {
		if (!this.el.is(":visible") || (e && (e.cancel || e.button === 2))) {
			return;
		}

		this.config = null;
		this.el.hide();
	}

	, onUiKeyPress: function (keyEvent) {
		if (!this.config || !this.el.is(":visible")) {
			return;
		}

		const configEntry = this.config.find(({ hotkey }) => hotkey === keyEvent.key);
		if (!configEntry) {
			return;
		}

		configEntry.callback();
		keyEvent.consumed = true;
		this.el.hide();
	}
};

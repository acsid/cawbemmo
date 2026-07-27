import events from "/js/system/events.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/middleHud/template.html", { raw: true });

export default {
	tpl: template

	, postRender: function () {
		this.onEvent("onGetSelfCasting", this.onGetCasting.bind(this));
		if (isMobile) {
			this.onEvent("onGetServerActions", this.onGetServerActions.bind(this));
			this.find(".btnGather").on("click", this.gather.bind(this));
		}
	}

	, onGetCasting: function (casting) {
		const el = this.find(".casting");
		if (casting === 0 || casting === 1) {
			el.hide();
		} else {
			el
				.show()
				.find(".bar")
				.width((casting * 100) + "%");
		}
	}

	, gather: function () {
		const btn = this.find(".btnGather");
		const action = btn.data("action");
		if (action) {
			//Server actions use keyUp
			events.emit("keyup", action.key);
		} else {
			events.emit("keydown", { key: "g" });
		}
	}

	, onGetServerActions: function (actions) {
		const firstAction = actions[0];
		if (!firstAction) {
			return;
		}
		const btn = this.find(".btnGather").hide().data("action", null);
		btn
			.data("action", firstAction)
			.show();
	}
};

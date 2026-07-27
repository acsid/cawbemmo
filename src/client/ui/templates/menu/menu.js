import uiFactory from "/ui/factory.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/menu/template.html", { raw: true });

export default {
	tpl: template

	, postRender: function () {
		if (isMobile) {
			this.el.on("click", this.toggleButtons.bind(this));
			this.find("#btnCollapse").on("click", this.toggleButtons.bind(this));
		}

		this.find("#btnHelp").on("click", this.handler.bind(this));
		this.find("#btnInventory").on("click", this.handler.bind(this));
		this.find("#btnEquipment").on("click", this.handler.bind(this));
		this.find("#btnOnline").on("click", this.handler.bind(this));
		this.find("#btnLeaderboard").on("click", this.handler.bind(this));
		this.find("#btnReputation").on("click", this.handler.bind(this));
		this.find("#btnMainMenu").on("click", this.handler.bind(this));
		this.find("#btnPassives").on("click", this.handler.bind(this));

		this.onEvent("onGetPassivePoints", this.onGetPassivePoints.bind(this));
	}
	, handler: function (e) {
		if (isMobile) {
			this.el.removeClass("active");
		}
		uiFactory.onElementActivated(e);
	}
	, toggleButtons: function (e) {
		this.el.toggleClass("active");
		e.stopPropagation();
	}

	, onGetPassivePoints: function (points) {
		const el = this.find("#btnPassives .points");
		if (points > 0) {
			el.html(points).show();
		} else {
			el.html("").hide();
		}
	}
};

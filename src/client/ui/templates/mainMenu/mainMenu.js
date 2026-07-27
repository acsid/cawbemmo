import events from "/js/system/events.js";
import renderer from "/js/rendering/renderer.js";
import uiFactory from "/ui/factory.js";
import client from "/js/system/client.js";
import sound from "/js/sound/sound.js";
import locale from "/js/locale/index.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/mainMenu/template.html", { raw: true });

export default {
	modal: true
	, hasClose: true

	, beforeRender: function () {
		this.tpl = locale.getLocalizedMessage(locale.dictionary, template);
	}
	, postRender: function () {
		this.onEvent("onShowMainMenu", this.show.bind(this));

		this.el.find("#btnOptions").on("click", this.openOptions.bind(this));
		this.el.find("#btnCharSelect").on("click", this.charSelect.bind(this));
		this.el.find("#btnLogOut").on("click", this.logOut.bind(this));
		this.el.find("#btnCredits").on("click", this.openCredits.bind(this));

		this.onEvent("inputaction", this.onInputAction.bind(this));
	}

	, openOptions: function () {
		if (isMobile) {
			this.el.removeClass("active");
		}
		uiFactory.getUi("options").show();
	}

	, openCredits: function () {
		const credits = uiFactory.getUi("credits");
		if (credits) {
			credits.show();
			return;
		}
		uiFactory.build("credits", {
			modal: true
		});
	}

	, charSelect: async function () {
		this.el.addClass("disabled");

		await client.moduleProxy.cons.unzone();

		events.emit("destroyAllObjects");
		events.emit("resetRenderer");
		events.emit("resetPhysics");

		renderer.buildTitleScreen();
		sound.unload();

		events.emit("onShowCharacterSelect");

		uiFactory.exitGame();
		uiFactory.build("characters");
	}

	, logOut: function () {
		window.location = window.location;
	}

	, onInputAction: function (e) {
		if (e.actionName === "mainmenu") {
			this.toggle();
		}
	}
};

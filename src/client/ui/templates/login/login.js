//import events from "/js/system/events.js";
import client from "/js/system/client.js";
import uiFactory from "/ui/factory.js";
import renderer from "/js/rendering/renderer.js";
import globals from "/js/system/globals.js";
import locale from "/js/locale/index.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/login/template.html", { raw: true });

export default {
	tpl: template
	, centered: true

	, beforeRender: function () {
		const { clientConfig: { logoPath, changeLog } } = globals;
		// Add infos to template.
		const localeDictionary = {};
		if (changeLog) {
			localeDictionary.version = changeLog.version;
		} else {
			localeDictionary.version = "0.0";
		}
		const tempEl = $(locale.getLocalizedMessage(Object.assign(localeDictionary, locale.dictionary), this.tpl));
		if (logoPath) {
			tempEl.find(".logo").attr("src", logoPath);
		}
		this.tpl = tempEl.prop("outerHTML");
	}

	, postRender: function () {
		this.onEvent("onHandshake", this.onHandshake.bind(this));

		this.on(".btnLogin", "click", this.onLoginClick.bind(this));
		this.on(".btnRegister", "click", this.onRegisterClick.bind(this));

		this.el.find(".selectLanguage")
			.val(locale.language);
		this.on(".selectLanguage", "change", this.onSelectLanguage.bind(this));
		$(`.selectLanguage option[value=""]`).remove();

		this.find(".extra, .version")
			.appendTo($("<div class=\"uiLoginExtra\"></div>").appendTo("#ui-container"));

		$(".uiLoginExtra").find(".btn").on("click", uiFactory.onElementActivated.bind(uiFactory));

		$(".news, .version").on("click", uiFactory.onElementActivated.bind(uiFactory));

		this.find("input")
			.on("keyup", this.onKeyDown.bind(this))
			.eq(0).focus();

		renderer.buildTitleScreen();
	}

	, onKeyDown: function (e) {
		if (e.keyCode === 13) {
			this.onLoginClick();
		}
	}
	, onHandshake: function () {
		this.show();
	}

	, onLoginClick: async function () {
		if (this.el.hasClass("disabled")) {
			return;
		}
		this.el.addClass("disabled");

		const res = await client.componentProxy.auth.login({
			username: this.val(".txtUsername")
			, password: this.val(".txtPassword")
			, language: locale.language
		});
		this.onLogin(res);
	}
	, onLogin: function (res) {
		this.el.removeClass("disabled");
		if (res) {
			this.el.find(".message").html(res);
		} else {
			uiFactory.preload();
			$(".uiLoginExtra").remove();
			this.destroy();
		}
	}

	, onRegisterClick: async function () {
		if (this.el.hasClass("disabled")) {
			return;
		}
		this.el.addClass("disabled");

		const res = await client.componentProxy.auth.register({
			username: this.val(".txtUsername")
			, password: this.val(".txtPassword")
			, language: locale.language
		});
		this.onLogin(res);
	}

	, onSelectLanguage: async function () {
		const langSelector = this.el.find(".selectLanguage");
		let selectedLanguage = langSelector.val();
		if (!selectedLanguage) {
			if (!locale.language) {
				return;
			}
			langSelector.val(locale.language);
			return;
		}
		if (selectedLanguage === locale.language) {
			return;
		}
		await locale.init(selectedLanguage);
		this.destroy();
		setTimeout(() => uiFactory.build("login"), 33);
	}
};

import globals from "/js/system/globals.js";
import browserStorage from "/js/system/browserStorage.js";
import locale from "/js/locale/index.js";
import uiFactory from "/ui/factory.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/changeLog/template.html");

export default {
	centered: true

	, beforeRender: function () {
		this.tpl = locale.localizeHTML(locale.dictionary, template.cloneNode(true));
	}
	, postRender: function () {
		const { clientConfig: { changeLog: { content, version } } } = globals;

		const elHeading = this.find(".heading");
		elHeading.html(`${elHeading.html()} (v${version})`);

		const morphedContent = content.replaceAll("\n", "<br/>");
		this.find(".content").html(morphedContent);

		this.find(".btnNext").on("click", this.onNextClick.bind(this, version));

		if (uiFactory.getUi("login")) {
			this.find(".logo").remove();
		}
	}

	, onNextClick: function (version) {
		browserStorage.set("changelog_version", version);
		this.destroy();
		if (this.modal) {
			return;
		}
		uiFactory.build("characters");
	}
};

import client from "/js/system/client.js";
import events from "/js/system/events.js";
import spriteRegistry from "/js/system/spriteRegistry.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/wardrobe/template.html", { raw: true });

export default {
	tpl: template

	, centered: true

	, modal: true
	, hasClose: true

	, skin: null
	, wardrobeId: null

	, postRender: function () {
		this.onEvent("onGetWardrobeSkins", this.onGetWardrobeSkins.bind(this));
		this.onEvent("onCloseWardrobe", this.hide.bind(this));

		this.on(".btnCancel", "click", this.hide.bind(this));
		this.on(".btnApply", "click", this.apply.bind(this));
	}

	, onGetWardrobeSkins: function (msg) {
		let list = msg.skins;
		this.wardrobeId = msg.id;

		let container = this.find(".list").empty();

		list.forEach(function (l) {
			let html = "<div class=\"skinName\">" + l.name + "</div>";

			let el = $(html)
				.appendTo(container);

			el.on("click", this.setPreview.bind(this, l, el));
			el.on("click", events.emit.bind(events, "onClickListItem"));

			if (l.id === window.player.skinId) {
				el.addClass("current");
				this.setPreview(l, el);
			}
		}, this);

		this.show();
	}

	, setPreview: function (skin, el) {
		this.find(".active").removeClass("active");

		el.addClass("active");

		this.skin = skin;

		const props = spriteRegistry.getSpriteProps({ name: "characters", module: "wardrobe" });
		let costume = skin.sprite.split(",");
		let spriteX = -costume[0] * props.size;
		let spriteY = -costume[1] * props.size;

		// Display size = source size * scale factor, parsed from props.transform (e.g. "scale(8)").
		// Used to center the absolutely-positioned .sprite.
		const scaleMatch = (props.transform || "").match(/scale\(([\d.]+)\)/);
		const displaySize = scaleMatch ? props.size * Number(scaleMatch[1]) : props.size;

		let spritesheet = skin.spritesheet || "../../../images/characters.png";

		const centering = `calc((100% - ${displaySize}px) / 2)`;
		this.find(".sprite")
			.css({
				width: props.width
				, height: props.height
				, transform: props.transform
				, left: centering
				, top: centering
				, background: "url(\"" + spritesheet + "\") " + spriteX + "px " + spriteY + "px"
			});
	}

	, apply: function () {
		client.request({
			cpn: "player"
			, method: "performAction"
			, data: {
				cpn: "wardrobe"
				, method: "apply"
				, data: {
					skinId: this.skin.id
					, targetId: this.wardrobeId
				}
			}
		});
	}
};

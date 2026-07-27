import client from "/js/system/client.js";
import events from "/js/system/events.js";
import globals from "/js/system/globals.js";
import spriteRegistry from "/js/system/spriteRegistry.js";
import uiFactory from "/ui/factory.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/createCharacter/template.html", { raw: true });

export default {
	tpl: template
	, centered: true

	, classSprites: null
	, class: null
	, costume: 0
	, skinId: null

	, prophecies: []

	, beforeRender: function () {
		const { clientConfig: { logoPath } } = globals;
		if (!logoPath) {
			return;
		}

		const tempEl = $(this.tpl);
		tempEl.find(".logo").attr("src", logoPath);

		this.tpl = tempEl.prop("outerHTML");
	}

	, postRender: function () {
		this.getSkins();

		uiFactory.build("tooltips");

		this.find(".txtClass")
			.on("click", this.changeClass.bind(this))
			.on("mousemove", this.onClassHover.bind(this))
			.on("mouseleave", this.onClassUnhover.bind(this));

		this.find(".skinBox .btn").on("click", this.changeCostume.bind(this));

		this.find(".btnBack").on("click", this.back.bind(this));
		this.find(".btnCreate").on("click", this.create.bind(this));

		this.find(".prophecy")
			.on("click", this.onProphecyClick.bind(this))
			.on("mousemove", this.onProphecyHover.bind(this))
			.on("mouseleave", this.onProphecyUnhover.bind(this));
	}

	, getSkins: async function () {
		this.el.addClass("disabled");
		this.classSprites = await client.componentProxy.auth.getSkinList({});
		this.el.removeClass("disabled");

		this.costume = 0;

		this.class = "concierge";
		this.find(".txtClass").html("concierge");

		this.changeCostume();
	}

	, onProphecyHover: function (e) {
		let el = $(e.target);

		let pos = {
			x: e.clientX + 25
			, y: e.clientY
		};

		let text = el.attr("tooltip");

		events.emit("onShowTooltip", text, el[0], pos);
		$(".uiTooltips .tooltip").addClass("bright");
	}

	, onProphecyUnhover: function (e) {
		let el = $(e.target);
		events.emit("onHideTooltip", el[0]);
	}

	, onProphecyClick: function (e) {
		let el = $(e.target);
		let pName = el.attr("prophecy");

		if (el.hasClass("active")) {
			this.prophecies.spliceWhere((p) => p === pName);
			el.removeClass("active");
		} else {
			this.prophecies.push(pName);
			el.addClass("active");
		}
	}

	, clear: function () {
		this.prophecies = [];
		this.find(".prophecy").removeClass("active");
	}

	, back: function () {
		this.clear();
		this.destroy();

		uiFactory.build("characters");
	}

	, create: async function () {
		this.el.addClass("disabled");

		const eCreateCharacter = {
			name: this.find(".txtName").val()
			, class: this.class
			, skinId: this.skinId
			, prophecies: this.prophecies
		};

		events.emit("beforeCreateCharacter", eCreateCharacter);

		const result = await client.componentProxy.auth.createCharacter(eCreateCharacter);
		this.el.removeClass("disabled");

		if (result) {
			this.el.find(".message").html(result);
		} else {
			this.clear();
			this.destroy();
		}
	}

	, onClassHover: function (e) {
		let el = $(e.target);

		let pos = {
			x: e.clientX + 25
			, y: e.clientY
		};

		let text = ({
			concierge: "Le concierge utilise les pouvoir de planché propre et de vadrouille magique <br /><br />1 point d'intelligence par niveau."
			, "pee wee": "le pee wee commence faible mais devien de plus en plus fort plus la saison avance<br /><br />1 point de force par niveau"
			, "party animal": "Le party animal n'est pas arrêtable il vas faire le party jusqu'a avoir couché tout le monde <br /><br />1 point de dextérité par niveau"
			//, necro: "test d'ajout des necro"
		})[this.class];

		events.emit("onShowTooltip", text, el[0], pos, 200);
		$(".uiTooltips .tooltip").addClass("bright");
	}

	, onClassUnhover: function (e) {
		let el = $(e.target);
		events.emit("onHideTooltip", el[0]);
	}

	, changeClass: function (e) {
		let el = $(e.target);
		let classes = ["concierge", "pee wee", "party animal" ];
		let nextIndex = (classes.indexOf(this.class) + 1) % classes.length;

		let newClass = classes[nextIndex];

		el.html(newClass.capitalize());

		this.class = newClass;

		this.onClassHover(e);
	}

	, changeCostume: function (e) {
		let delta = (e ? Math.floor($(e.target).attr("delta")) : 0);
		let spriteList = this.classSprites;
		if (!spriteList) {
			return;
		}
		this.costume = (this.costume + delta) % spriteList.length;
		if (this.costume < 0) {
			this.costume = spriteList.length - 1;
		}
		this.skinId = spriteList[this.costume].id;
		$(".txtCostume").html(spriteList[this.costume].name);
		this.setSprite();
	}

	, setSprite: function () {
		let classSprite = this.classSprites[this.costume];
		let costume = classSprite.sprite.split(",");

		const props = spriteRegistry.getSpriteProps({ name: "characters", module: "createCharacter" });
		let spirteX = -costume[0] * props.size;
		let spriteY = -costume[1] * props.size;

		let spritesheet = classSprite.spritesheet || "../../../images/characters.png";

		this.find(".sprite")
			.css({
				width: props.width
				, height: props.height
				, transform: props.transform
				, background: "url(\"" + spritesheet + "\") " + spirteX + "px " + spriteY + "px"
			});
	}
};

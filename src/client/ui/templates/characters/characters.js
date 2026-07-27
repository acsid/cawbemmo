import client from "/js/system/client.js";
//import events from "/js/system/events.js";
import globals from "/js/system/globals.js";
import spriteRegistry from "/js/system/spriteRegistry.js";
import uiFactory from "/ui/factory.js";
import locale from "/js/locale/index.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/characters/template.html", { raw: true });
const templateListItem = await _.loadHTML("/ui/templates/characters/templateListItem.html", { raw: true });

export default {
	centered: true
	, characterInfo: {}
	, characters: null
	, selected: null
	, selectedIndex: -1
	, deleteCount: 0

	, beforeRender: function () {
		this.tpl = locale.getLocalizedMessage(locale.dictionary, template);

		const { clientConfig: { logoPath } } = globals;
		if (!logoPath) {
			return;
		}

		const tempEl = $(this.tpl);
		tempEl.find(".logo").attr("src", logoPath);

		this.tpl = tempEl.prop("outerHTML");
	}

	, postRender: function () {
		this.find(".btnPlay").on("click", this.onPlayClick.bind(this));
		this.find(".btnNew").on("click", this.onNewClick.bind(this));
		this.find(".btnDelete")
			.on("click", this.onDeleteClick.bind(this))
			.on("mouseleave", this.onDeleteReset.bind(this));

		this.getCharacters();

		this.onEvent("keydown", this.onKeyDown.bind(this));
	}

	, onKeyDown: function (e) {
		if (this.el.hasClass("disabled")) {
			return;
		}

		if (e.key === "enter") {
			this.onPlayClick();
		} else if (e.key === "up" || e.key === "down") {
			if (!this.characters || this.selectedIndex === -1) {
				return;
			}

			const numChars = this.characters.length;
			if (!numChars) {
				return;
			}

			const delta = e.key === "up" ? -1 : 1;

			//Clamp index within range [0, numChars - 1]
			const newIndex = Math.min(Math.max(this.selectedIndex + delta, 0), numChars - 1);

			const list = this.find(".left");
			if (!list) {
				return;
			}

			const li = list.children()[newIndex];
			li.click();

			list.scrollTop(li.offsetTop);
		}
	}

	, onPlayClick: async function () {
		if (!this.selected) {
			return;
		}
		this.el.addClass("disabled");
		await client.componentProxy.auth.play({ name: this.selected });
		this.el.removeClass("disabled");
		this.destroy();
	}

	, onNewClick: function () {
		uiFactory.build("createCharacter");
		this.destroy();
	}

	, getCharacters: async function (characters) {
		if (characters) {
			this.characters = characters;
		} else {
			this.el.addClass("disabled");
			this.characters = await client.componentProxy.auth.getCharacterList();
		}

		this.find(".sprite").css("background", "");
		this.find(".info div").html("");

		this.el.removeClass("disabled");

		const list = this.find(".left")
			.empty();

		this.characters
			.sort((a, b) => b.level - a.level)
			.forEach((c, i) => {
				let charName = c.name;
				if (c.level !== null) {
					charName += `<font class="color-yellowB">&nbsp;(${c.level})</font>`;
				}

				const html = locale.getLocalizedMessage({ name: charName }, templateListItem);
				const li = $(html)
					.appendTo(list);

				li.on("click", this.onCharacterClick.bind(this, c.name, i));

				if (i === 0) {
					li.click();
				}
			}, this);
	}
	, onCharacterClick: async function (charName, charIndex, e) {
		this.el.addClass("disabled");

		this.selectedIndex = charIndex;
		this.selected = charName;

		const el = $(e.target);
		el.parent().find(".selected").removeClass("selected");
		el.addClass("selected");

		let charInfo = this.characterInfo[charName];
		if (!charInfo) {
			charInfo = await client.componentProxy.auth.getCharacter({ name: charName });
			this.characterInfo[charName] = charInfo;
		}

		this.find(".btn").removeClass("disabled");

		const props = spriteRegistry.getSpriteProps({ name: charInfo.sheetName, module: "characters" });
		// Column count derives from the sheet's pixel width / source size, mirroring the renderer's getTexture (textures.width / size).
		const charCols = props.sheetWidth / props.size;
		let spriteY = Math.floor(charInfo.cell / charCols);
		let spirteX = charInfo.cell - (spriteY * charCols);

		spirteX = -(spirteX * props.size);
		spriteY = -(spriteY * props.size);

		let spritesheet = charInfo.sheetName;
		if (spritesheet === "characters") {
			spritesheet = "../../../images/characters.png";
		}

		this.find(".sprite")
			.css({
				width: props.width
				, height: props.height
				, transform: props.transform
				, background: `url("${spritesheet}") ${spirteX}px ${spriteY}px`
			})
			.show();

		this.find(".name").html(charName);

		const stats = charInfo.components.find((c) => c.type === "stats");
		if (typeof charInfo.class === "object") {
			this.find(".class").html(`${charInfo.class.name.capitalize()} - Error: ${charInfo.class.error}`);
		} else if (stats && typeof charInfo.class === "string") {
			this.find(".class").html(`Lvl ${stats.values.level} ${charInfo.class.capitalize()}`);
		} else {
			this.find(".class").html("");
		}

		this.el.removeClass("disabled");

		if (charInfo.permadead) {
			this.find(".name").html(charName + " (hc - rip)");
			this.find(".btnPlay").addClass("disabled");
			return;
		}
		if (typeof charInfo.class === "object") {
			this.find(".btnPlay").addClass("disabled");
			return;
		}

		const prophecies = charInfo.components.find((c) => c.type === "prophecies");
		if (prophecies?.list?.includes("hardcore")) {
			this.find(".name").html(charName + " (hc)");
		}

		this.find(".btnPlay").removeClass("disabled");
	}

	, setMessage: function (msg) {
		this.find(".message").html(msg);
	}

	, onDeleteClick: async function () {
		if (!this.selected) {
			return;
		}

		if (this.deleteCount < 3) {
			this.deleteCount++;

			this.setMessage(
				locale.translate("characters", "deleteCountdown"
					, {
						countdown: 4 - this.deleteCount
						, s: (this.deleteCount === 3) ? "" : "s"
					}
				)
			);

			this.find(".btnDelete")
				.removeClass("deleting")
				.addClass("deleting")
				.html(`${locale.translate("characters", "delete")} (${4 - this.deleteCount})`);

			return;
		}
		this.onDeleteReset();

		this.el.addClass("disabled");

		const result = await client.componentProxy.auth.deleteCharacter({ name: this.selected });
		if (!result.success) {
			this.setMessage(result.msg);
			this.el.removeClass("disabled");
			return;
		}
		this.getCharacters(result.characterList);
	}

	, onDeleteReset: function () {
		this.deleteCount = 0;
		this.find(".btnDelete")
			.removeClass("deleting")
			.html(locale.translate("characters", "delete"));

		setTimeout(this.setMessage.bind(this, ""), 5000);
	}
};

import events from "/js/system/events.js";
import client from "/js/system/client.js";
//import input from "/js/input.js";
//import config from "/js/config.js";
import locale from "/js/locale/index.js";
import renderItem from "/ui/shared/renderItem.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/equipment/template.html", { raw: true });

const getStatsAsStrings = (playerStats) => ({
	basic: {
		"${stats.level}": playerStats.level
		, "${stats.nextLevel}": (playerStats.xpMax - playerStats.xp).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "xp"
		, gap1: ""
		, "${stats.gold}": playerStats.gold
		, gap2: playerStats.has("gold")
		, "${stats.hp}": `${Math.floor(playerStats.hp)}/${Math.floor(playerStats.hpMax)}`
		, "${stats.mana}": `${Math.floor(playerStats.mana)}/${Math.floor(playerStats.manaMax)}`
		, "${stats.regenHp}": playerStats.regenHp
		, "${stats.regenMana}": Math.floor(playerStats.regenMana) + "%"
		, gap3: ""
		, "${stats.str}": playerStats.str
		, "${stats.int}": playerStats.int
		, "${stats.dex}": playerStats.dex
		, "${stats.vit}": playerStats.vit
	}
	, offense: {
		"${equipment.critChance}": playerStats.critChance.toFixed(1) + "%"
		, "${equipment.critMultiplier}": playerStats.critMultiplier.toFixed(1) + "%"
		, "${equipment.attackCritChance}": (playerStats.critChance + playerStats.attackCritChance).toFixed(1) + "%"
		, "${equipment.attackCritMultiplier}": (playerStats.critMultiplier + playerStats.attackCritMultiplier).toFixed(1) + "%"
		, "${equipment.spellCritChance}": (playerStats.critChance + playerStats.spellCritChance).toFixed(1) + "%"
		, "${equipment.spellCritMultiplier}": (playerStats.critMultiplier + playerStats.spellCritMultiplier).toFixed(1) + "%"
		, gap1: ""
		, "${stats.elementArcanePercent}": playerStats.elementArcanePercent + "%"
		, "${stats.elementFirePercent}": playerStats.elementFirePercent + "%"
		, "${stats.elementFrostPercent}": playerStats.elementFrostPercent + "%"
		, "${stats.elementHolyPercent}": playerStats.elementHolyPercent + "%"
		, "${stats.elementPoisonPercent}": playerStats.elementPoisonPercent + "%"
		, "${stats.physicalPercent}": playerStats.physicalPercent + "%"
		, gap2: ""
		, "${stats.spellPercent}": playerStats.spellPercent + "%"
		, gap3: ""
		, "${stats.attackSpeed}": (100 + playerStats.attackSpeed) + "%"
		, "${stats.castSpeed}": (100 + playerStats.castSpeed) + "%"
	}
	, defense: {
		"${stats.armor}": playerStats.armor
		, "${stats.blockAttackChance}": playerStats.blockAttackChance + "%"
		, "${stats.blockSpellChance}": playerStats.blockSpellChance + "%"
		, gap1: ""
		, "${stats.dodgeAttackChance}": playerStats.dodgeAttackChance.toFixed(1) + "%"
		, "${stats.dodgeSpellChance}": playerStats.dodgeSpellChance.toFixed(1) + "%"
		, gap2: ""
		, "${stats.elementArcaneResist}": playerStats.elementArcaneResist
		, "${stats.elementFireResist}": playerStats.elementFireResist
		, "${stats.elementFrostResist}": playerStats.elementFrostResist
		, "${stats.elementHolyResist}": playerStats.elementHolyResist
		, "${stats.elementPoisonResist}": playerStats.elementPoisonResist
		, gap3: ""
		, "${stats.elementAllResist}": playerStats.elementAllResist
		, gap4: ""
		, "${stats.lifeOnHit}": playerStats.lifeOnHit
	}
	, other: {
		"${stats.magicFind}": playerStats.magicFind + "%"
		, "${stats.itemQuantity}": playerStats.itemQuantity + "%"
		, gap1: ""
		, "${stats.sprintChance}": (playerStats.sprintChance?.toFixed(2) || 0) + "%"
		, gap2: ""
		, "${stats.xpIncrease}": playerStats.xpIncrease + "%"
		, gap3: ""
		, "${stats.catchChance}": playerStats.catchChance + "%"
		, "${stats.catchSpeed}": playerStats.catchSpeed + "%"
		, "${stats.fishRarity}": playerStats.fishRarity + "%"
		, "${stats.fishWeight}": playerStats.fishWeight + "%"
		, "${stats.fishItems}": playerStats.fishItems + "%"
	}
});

const eventMap = {
	onGetStats: "onGetStats"
	, onGetItems: "onGetItems"
	, onInspectTarget: "onInspectTarget"
	, toggle: "onShowEquipment"
	, onKeyDown: "keydown"
	, onKeyUp: "keyup"
};

export default {
	centered: true
	, modal: true
	, hasClose: true

	, stats: null
	, equipment: null

	, hoverItem: null
	, hoverEl: null
	, hoverCompare: null

	, isInspecting: false

	, beforeRender: function () {
		this.tpl = locale.getLocalizedMessage(locale.dictionary, template);
	}
	, postRender: function () {
		for (const [prop, key] of Object.entries(eventMap)) {
			this.onEvent(key, this[prop].bind(this));
		}

		this.find(".tab").on("click", this.onTabClick.bind(this));
	}

	, beforeHide: function () {
		this.isInspecting = false;
		delete this.result;

		this.find(".itemList").hide();

		this.onHoverItem(null, null, null);
	}

	, onAfterShow: function () {
		this.find(".itemList").hide();

		this.onGetStats();
		this.onGetItems();

		this.onHoverItem(null, null, null);
	}

	, onKeyDown: function (e) {
		if (e.key === "j") {
			this.toggle();
		} else if (e.key === "shift" && this.hoverItem) {
			this.onHoverItem(this.hoverEl, this.hoverItem, this.hoverCompare);
		}
	}
	, onKeyUp: function (e) {
		if (e.key === "shift" && this.hoverItem) {
			this.onHoverItem(this.hoverEl, this.hoverItem, null);
		}
	}

	, onTabClick: function (e) {
		this.find(".tab.selected").removeClass("selected");

		$(e.target).addClass("selected");

		let stats = this.isInspecting ? this.result.stats : this.stats;

		this.onGetStats(stats);
	}

	, onGetItems: function (items) {
		items = items || this.items;

		if (!this.isInspecting) {
			this.items = items;
		}

		if (!this.shown) {
			return;
		}

		this.find(".slot").addClass("empty");

		this.find("[slot]")
			.removeData("item")
			.addClass("empty show-default-icon")
			.find(".info")
			.html("")
			.parent()
			.find(".icon")
			.off()
			.css("background-image", "")
			.css("background-position", "")
			.on("click", this.buildSlot.bind(this));

		this.find("[slot]").toArray().forEach((el) => {
			el = $(el);
			let slot = el.attr("slot");
			let newItems = window.player.inventory.items.some((i) => {
				if (slot.indexOf("finger") === 0) {
					slot = "finger";
				} else if (slot === "oneHanded") {
					return (["oneHanded", "twoHanded"].includes(i.slot) && i.isNew);
				}

				return (i.slot === slot && i.isNew);
			});

			if (newItems) {
				el.find(".info").html("new");
			}
		});

		items
			.filter((item) => item.has("quickSlot") || (item.eq && (item.slot || item.has("runeSlot"))))
			.forEach((item) => {
				let slot = item.slot;
				if (item.has("runeSlot")) {
					let runeSlot = item.runeSlot;
					slot = "rune-" + runeSlot;
				} else if (item.has("quickSlot")) {
					slot = "quick-" + item.quickSlot;
				}

				slot = item.equipSlot || slot;

				const elSlot = this.find("[slot=\"" + slot + "\"]")
					.removeClass("empty show-default-icon");

				const itemEl = renderItem(null, item, elSlot);

				itemEl
					.data("item", item)
					.removeClass("empty show-default-icon")
					.find(".icon")
					.off()
					.on("contextmenu", this.showContext.bind(this, item))
					.on("mousedown", this.buildSlot.bind(this, elSlot))
					.on("mousemove", this.onHoverItem.bind(this, elSlot, item, null))
					.on("mouseleave", this.onHoverItem.bind(this, null, null));
			});
	}

	, showContext: function (item, e) {
		const menuItems = {
			unequip: {
				text: "unequip"
				, callback: this.unequipItem.bind(this, item)
			}
		};
		const config = [];
		config.push(menuItems.unequip);

		events.emit("onContextMenu", config, e);

		e.preventDefault();
		return false;
	}

	, unequipItem: function (item) {
		const isQuickslot = item.has("quickSlot");
		const method = isQuickslot ? "setQuickSlot" : "unequip";
		const data = isQuickslot ? { slot: item.quickSlot } : { itemId: item.id };

		client.request({
			cpn: "player"
			, method: "performAction"
			, data: {
				cpn: "equipment"
				, method
				, data
			}
		});
	}

	, onInspectTarget: function (result) {
		this.isInspecting = true;

		this.show();

		this.result = result;

		this.onGetStats(result.stats);
		this.onGetItems(result.equipment);
	}

	, buildSlot: function (el, e) {
		if (e && e.button !== 0) {
			return;
		}
		if (this.isInspecting) {
			return;
		}
		if (el.target) {
			el = $(el.target).parent();
		}

		const slot = el.attr("slot");
		const isRune = (slot.indexOf("rune") === 0);
		const isConsumable = (slot.indexOf("quick") === 0);

		const container = this.find(".itemList")
			.empty()
			.show();

		const hoverCompare = this.hoverCompare = el.data("item");
		let items = this.items
			.filter((item) => {
				if (isRune) {
					return (!item.slot && item.spell && !item.eq);
				} else if (isConsumable) {
					return (item.type === "consumable" && !item.has("quickSlot"));
				}
				const checkSlot = (slot.indexOf("finger") === 0) ? "finger" : slot;
				if (slot === "oneHanded") {
					return (!item.eq && (item.slot === "oneHanded" || item.slot === "twoHanded"));
				}
				return (item.slot === checkSlot && !item.eq);
			});

		if (isConsumable) {
			items = items.filter((item, i) => items.findIndex((f) => f.name === item.name) === i);
		}

		items.splice(0, 0, {
			name: "None"
			, slot: hoverCompare ? hoverCompare.slot : null
			, id: (hoverCompare && !isConsumable) ? hoverCompare.id : null
			, type: isConsumable ? "consumable" : null
			, empty: true
		});
		if (hoverCompare) {
			items.splice(1, 0, hoverCompare);
		}

		items
			.forEach(function (item, i) {
				let sprite = item.sprite || [7, 0];

				let spriteSheet = item.empty ? "../../../images/uiIcons.png" : item.spritesheet || "../../../images/items.png";
				if (i > 0 && item.type === "consumable") {
					spriteSheet = "../../../images/consumables.png";
				}
				let imgX = -sprite[0] * 64;
				let imgY = -sprite[1] * 64;

				let itemEl = $("<div class=\"slot\"><div class=\"icon\"></div></div>")
					.appendTo(container);

				itemEl
					.find(".icon")
					.css("background", `url("${spriteSheet}") ${imgX}px ${imgY}px`)
					.on("mousedown", this.equipItem.bind(this, item, slot))
					.on("mousemove", this.onHoverItem.bind(this, itemEl, item, null))
					.on("mouseleave", this.onHoverItem.bind(this, null, null));

				if (item === hoverCompare) {
					itemEl.find(".icon").addClass("eq");
				} else if (item.isNew) {
					el.find(".icon").addClass("new");
				}
			}, this);

		if (!items.length) {
			container.hide();
		}

		if (e) {
			e.preventDefault();
			return false;
		}
	}

	, equipItem: function (item, slot, e) {
		let isNew = window.player.inventory.items.some((f) => (f.equipSlot === slot && f.isNew));
		if (!isNew) {
			this.find("[slot=\"" + slot + "\"] .info").html("");
		}

		if (item === this.hoverCompare) {
			this.find(".itemList").hide();
			return;
		}

		let cpn = "equipment";
		let method = "equip";
		let data = { itemId: item.id };

		if (item.empty) {
			method = "unequip";
		}

		if (item.type === "consumable") {
			cpn = "equipment";
			method = "setQuickSlot";
			data = {
				itemId: item.id
				, slot: ~~slot.replace("quick-", "")
			};
		} else if (!item.slot) {
			cpn = "inventory";
			method = "learnAbility";
			data = {
				itemId: item.id
				, slot: ~~slot.replace("rune-", "")
			};

			if (item.empty) {
				if (!this.hoverCompare) {
					this.find(".itemList").hide();
					return;
				}
				method = "unlearnAbility";
				data.itemId = this.hoverCompare.id;
				delete data.slot;
			}
		} else if (item.slot === "finger") {
			data = {
				itemId: item.id
				, slot: slot
			};
		}

		client.request({
			cpn: "player"
			, method: "performAction"
			, data: {
				cpn: cpn
				, method: method
				, data: data
			}
		});

		this.find(".itemList").hide();

		e.preventDefault();
		return false;
	}

	, onHoverItem: function (el, item, compare, e) {
		if (el) {
			this.hoverItem = item;
			this.hoverEl = el;

			if ((item.isNew) && (!item.eq)) {
				delete item.isNew;
				el.find(".icon").removeClass("new");
			}

			let ttPos = null;
			if (e) {
				ttPos = {
					x: Math.floor(e.clientX + 32)
					, y: Math.floor(e.clientY)
				};
			}

			events.emit("onShowItemTooltip", item, ttPos, this.hoverCompare);
		} else {
			events.emit("onHideItemTooltip", this.hoverItem);
			this.hoverItem = null;
		}
	}

	, onGetStats: function (stats) {
		if (stats && !this.isInspecting) {
			this.stats = stats;
		}
		stats = stats || this.stats;

		if (!this.shown) {
			return;
		}
		const container = this.el.find(".stats");
		container
			.children("*:not(.tabs)")
			.remove();

		if (!stats.has("gold")) { //FIXME Gold should be in playerStats...
			_.log.equipment.warn("stats.gold is missing in %o", stats);
			stats = _.assign({
				gold: window.player.trade.gold
			}, stats);
		}
		const newStats = getStatsAsStrings(stats);
		const tabName = this.find(".tab.selected").data("id");
		const sectionInfo = newStats[tabName];
		for (const statName in sectionInfo) {
			let label = "";
			let value = sectionInfo[statName];
			const valueType = typeof value;
			if (valueType === "undefined") {
				continue;
			}
			const isGap = statName.startsWith("gap");
			if (isGap) {
				if (value) {
					value = "";
				} else if (valueType === "boolean") {
					continue;
				}
			} else {
				label = locale.getLocalizedMessage(locale.dictionary, statName) + ": ";
			}
			const row = $(`<div class="stat"><font class="q0">${label}</font><font color="#999">${value}</font></div>`)
				.appendTo(container);

			if (statName === "${stats.gold}") {
				row.addClass("gold");
			} else if (statName === "${stats.level}" || statName === "${stats.nextLevel}") {
				row.addClass("blueText");
			}
			if (isGap) {
				row.addClass("empty");
			}
		}
	}
};

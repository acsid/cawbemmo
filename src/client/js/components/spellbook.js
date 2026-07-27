import client from "/js/system/client.js";
import events from "/js/system/events.js";
import renderer from "/js/rendering/renderer.js";
import input from "/js/input.js";
import locale from "/js/locale/index.js";
import objects from "/js/objects/objects.js";

const ACTION_HEADER = "spell_";

export default {
	type: "spellbook"

	, hoverTarget: null
	, target: null
	, targetSprite: null

	, reticleState: 0
	, reticleCd: 0
	, reticleCdMax: 10
	, reticleSprite: null

	, groundTargetSpell: null

	, init: function (blueprint) {
		this.targetSprite = renderer.buildObject({
			sheetName: "ui"
			, layerName: "effects"
			, cell: 0
			, visible: false
		});

		this.reticleSprite = renderer.buildObject({
			sheetName: "ui"
			, layerName: "effects"
			, cell: 8
			, visible: false
		});

		events.emit("onGetSpells", this.spells);

		this.reticleCd = this.reticleCdMax;

		this.obj.on("onDeath", this.onDeath.bind(this));
		this.obj.on("onMobHover", this.onMobHover.bind(this));
		this.obj.on("mousedown", this.onMouseDown.bind(this));
		this.obj.on("inputaction", this.onInputAction.bind(this));
	}

	, extend: function (blueprint) {
		let listChanged = false;
		if (blueprint.removeSpells) {
			listChanged = true;
			blueprint.removeSpells.forEach((r) => this.spells.spliceWhere((s) => s.id === r));
		}
		if (blueprint.getSpells) {
			listChanged = true;
			blueprint.getSpells.forEach(function (s) {
				const existIndex = this.spells.findIndex((f) => f.id === s.id);
				if (existIndex > -1) {
					this.spells.splice(existIndex, 1, s);
					return;
				}
				this.spells.push(s);
				this.spells.sort((a, b) => a.id - b.id);
			}, this);
		}
		if (listChanged) {
			events.emit("onGetSpells", this.spells);
		}
	}

	, getSpell: function (number) {
		const spellNumber = Number.parseInt(number);
		return this.spells.find((s) => s.id === spellNumber);
	}

	, onMobHover: function (target) {
		this.hoverTarget = target;
	}

	, onMouseDown: function (e) {
		if (isMobile && this.groundTargetSpell) { // Allow attacking ground on mobile.
			this.triggerSpell(this.groundTargetSpell, {
				x: Math.floor(e.worldX / scale)
				, y: Math.floor(e.worldY / scale)
			});
			this.groundTargetSpell = null;
			return;
		}
		if (!isMobile && e?.button === 0
			&& this.hoverTarget && this.target
			&& this.hoverTarget.id === this.target.id
		) { // Allow attack with mouse.
			client.request({
				cpn: "player"
				, method: "castSpell"
				, data: {
					priority: true
					, spell: 0
					, target: this.target.id
				}
			});
			return;
		}
		// Update current target
		this.target = this.hoverTarget;
		// Update target sprite
		if (this.target) {
			this.targetSprite.x = this.target.x * scale;
			this.targetSprite.y = this.target.y * scale;
			this.targetSprite.visible = true;
		} else {
			this.targetSprite.visible = false;
		}
		events.emit("onSetTarget", this.target, e);
	}

	, tabTarget: function (ignoreIfSet) {
		let compareAgainst = ignoreIfSet ? null : this.target;

		this.target = objects.getClosest(window.player.x, window.player.y, 10, input.isKeyDown("shift"), compareAgainst);
		this.targetSprite.visible = Boolean(this.target);

		events.emit("onSetTarget", this.target, null);
	}

	, onInputAction: function (e) {
		if (e.actionName === "target") {
			this.tabTarget();
			return;
		}
		if (e.actionName.startsWith(ACTION_HEADER)) {
			this.triggerSpell(e.actionName.substring(ACTION_HEADER.length));
		}
	}

	, triggerSpell: function (key, target) {
		let spell = this.getSpell(key);
		if (!spell) {
			_.log.spellbook.error("Spell %s not found!", key);
			return;
		}
		if (isMobile && !target
			&& spell.targetGround
			&& !spell.targetPlayerPos
		) { // Allow attacking ground on mobile.
			if (this.groundTargetSpell === key) {
				this.groundTargetSpell = null;
				events.emit("onGetAnnouncement", {
					msg: locale.translate("spellbook", "cancelled", { spellName: spell.name })
				});
				return;
			}
			this.groundTargetSpell = key;
			events.emit("onGetAnnouncement", {
				msg: locale.translate("spellbook", "pickLocation", { spellName: spell.name })
			});
			return;
		}

		const targetSelf = input.isKeyDown("shift") || spell.targetPlayerPos;
		if (!spell.aura
			&& !targetSelf
			&& !spell.targetGround
			&& !spell.autoTargetFollower
			&& !this.target
		) {
			_.log.spellbook.debug("Spell %s requires a target!", spell.name);
			return;
		}

		if (!target) {
			target = this.obj.inputs.hoverTile;
		}
		if (spell.autoTargetFollower && !this.target) {
			target = null;
		} else if (!spell.targetGround && this.target) {
			target = this.target.id;
		} else if (targetSelf) {
			target = this.obj.id;
		}
		if (target === this.obj && spell.noTargetSelf) {
			_.log.spellbook.trace("Spell %s can't target self!", spell.name);
			return;
		}
		if (target) {
			client.request({
				cpn: "player"
				, method: "castSpell"
				, data: {
					priority: input.isKeyDown("ctrl")
					, spell: spell.id
					, target: target
					, self: targetSelf
				}
			});
		}
	}

	, onDeath: function () {
		this.target = null;
		this.targetSprite.visible = false;
	}

	, update: function () {
		if (this.reticleCd > 0) {
			this.reticleCd--;
		} else {
			this.reticleCd = this.reticleCdMax;
			this.reticleState++;
			if (this.reticleState === 4) {
				this.reticleState = 0;
			}
		}

		let target = this.target;
		if (!target) {
			return;
		}

		if (this.target.destroyed || this.target.nonSelectable || !this.target.isVisible) {
			this.target = null;
			this.targetSprite.visible = false;
		}

		this.targetSprite.x = target.x * scale;
		this.targetSprite.y = target.y * scale;

		renderer.setSprite({
			sprite: this.targetSprite
			, cell: this.reticleState
			, sheetName: "ui"
		});
	}

	, destroy: function () {
		if (this.targetSprite) {
			renderer.destroyObject({
				layerName: "effects"
				, sprite: this.targetSprite
			});
		}
	}
};

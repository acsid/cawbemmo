/* eslint-disable max-lines-per-function */

define([
	"js/system/client"
	, "js/rendering/renderer"
	, "js/system/events"
	, "js/input"
], function (
	client,
	renderer,
	events,
	input
) {
	let objects = null;
	require(["js/objects/objects"], function (o) {
		objects = o;
	});

	const ACTION_HEADER = "spell_";

	return {
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
			this.obj.on("mouseDown", this.onMouseDown.bind(this));
			this.obj.on("onAction", this.onAction.bind(this));
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
			const spellNumber = (number === " ") ? 0 : Number.parseInt(number);
			return this.spells.find((s) => s.id === spellNumber);
		}

		, onMobHover: function (target) {
			this.hoverTarget = target;
		}

		, onMouseDown: function (e, target) {
			if (isMobile && this.groundTargetSpell) {
				// Allow attacking ground on mobile.
				this.groundTarget = {
					x: Math.floor(e.worldX / scale)
					, y: Math.floor(e.worldY / scale)
				};
				this.triggerSpell(this.groundTargetSpell);
				this.groundTargetSpell = null;
			}
			// Allow attack with mouse.
			if (this.target
				&& (
					target?.id === this.target.id
					|| this.hoverTarget?.id === this.target.id
				)
			) {
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
			this.target = target || this.hoverTarget;
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

		, onAction: function (action) {
			if (action === "target") {
				this.tabTarget();
				return;
			}
			if (action.startsWith(ACTION_HEADER)) {
				this.triggerSpell(action.substring(ACTION_HEADER.length))
			}
		}

		, triggerSpell: function (key) {
			if (isNaN(key)) {
				return;
			}
			let spell = this.getSpell(key);
			if (!spell) {
				return;
			}

			let isShiftDown = input.isKeyDown("shift");

			let oldTarget = null;
			if (isShiftDown || spell.targetPlayerPos) {
				oldTarget = this.target;
				this.target = this.obj;
			}

			if (!spell.aura && !spell.targetGround && !spell.autoTargetFollower && !this.target) {
				return;
			}

			let target = this.groundTarget || this.obj.inputs.hoverTile;
			if (spell.autoTargetFollower && !this.target) {
				target = null;
			} else if (!spell.targetGround && this.target) {
				target = this.target.id;
			} else if (spell.targetPlayerPos) {
				isShiftDown = true;
			}
			if (isShiftDown) {
				this.target = oldTarget;
			}
			if (target === this.obj && spell.noTargetSelf) {
				return;
			}
			if (isMobile && spell.targetGround && !spell.targetPlayerPos && !this.groundTarget) {
				if (this.groundTargetSpell === key) {
					this.groundTargetSpell = null;
					events.emit("onGetAnnouncement", {
						msg: `Cancelled casting ${spell.name}`
					});
					return;
				}
				this.groundTargetSpell = key;
				events.emit("onGetAnnouncement", {
					msg: `Pick a location to cast ${spell.name}`
				});
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
						, self: isShiftDown
					}
				});
			}
			if (isMobile) {
				this.groundTarget = null;
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
});

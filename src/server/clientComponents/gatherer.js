define([
	"js/system/client"
	, "js/system/events"
	, "js/misc/physics"
], function (
	client,
	events,
	physics
) {
	return {
		type: "gatherer"
		, effect: null

		, init: function () {
			this.obj.on("onKeyDown", this.onKeyDown.bind(this));
		}

		, extend: function (msg) {
			if (msg.width && msg.progress !== 100) {
				if (this.effect) {
					this.effect.destroyed = true;
				}

				const validPos = [];
				for (const pos of _.getPositions(msg)) {
					if (!physics.isTileBlocking(pos[0], pos[1])) {
						continue;
					}
					const plDist = Math.max(Math.abs(pos[0] - this.obj.x), Math.abs(pos[1] - this.obj.y));
					if (plDist <= 2 || plDist >= 9) {
						continue;
					}
					validPos.push(pos);
					if (validPos.length >= 16) {
						break;
					}
				}
				let x = 0;
				let y = 0;
				if (validPos.length <= 0) {
					x = _.constrain(this.obj.x, msg.x, msg.width);
					y = _.constrain(this.obj.y, msg.y, msg.height);
				} else {
					[ x, y ] = _.randomObj(validPos);
				}

				this.obj.flipX = (x < this.obj.x);
				this.obj.setSpritePosition();

				this.effect = this.obj.addComponent("lightningEffect", {
					new: true
					, toX: x
					, toY: y
					, ttl: -1
					, divisions: 4
					, cdMax: 12
					, colors: [0xc0c3cf, 0xc0c3cf, 0x929398]
					, maxDeviate: 5
					, lineGrow: true
					, lineShrink: true
				});
			} else {
				if (msg.progress === 100 && this.effect) {
					this.effect.destroyed = true;
					this.effect = null;
				}
				events.emit("onShowProgress", (msg.action || "Gathering") + "...", msg.progress);
			}
		}

		, onKeyDown: function (key) {
			if (key !== "g") {
				return;
			}

			client.request({
				cpn: "player"
				, method: "performAction"
				, data: {
					cpn: "gatherer"
					, method: "gather"
					, data: {}
				}
			});
		}

		, destroy: function () {
			this.unhookEvents();
		}
	};
});

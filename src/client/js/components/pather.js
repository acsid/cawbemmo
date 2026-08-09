import client from "/js/system/client.js";
import events from "/js/system/events.js";
import renderer from "/js/rendering/renderer.js";

const PATH_LENGTH_MAXIMUM = 50;

export default {
	type: "pather"

	, path: []

	, pathColor: "#48edff"
	, pathAlpha: 0.2

	, pathPos: { x: 0, y: 0 }

	, lastX: 0
	, lastY: 0

	, init: function () {
		events.on("teleportToPosition", this.resetPath.bind(this));
		events.on("onDeath", this.resetPath.bind(this));
		events.on("onClearQueue", this.resetPath.bind(this));

		this.pathPos.x = Math.round(this.obj.x);
		this.pathPos.y = Math.round(this.obj.y);
	}

	, clearPath: function () {
		this.path.forEach(function (p) {
			renderer.destroyObject({
				layerName: "effects"
				, sprite: p.sprite
			});
		});
		this.path = [];
	}
	, resetPath: function () {
		this.clearPath();

		this.pathPos.x = Math.round(this.obj.x);
		this.pathPos.y = Math.round(this.obj.y);
	}

	, add: function (x, y) {
		if (this.path.length >= PATH_LENGTH_MAXIMUM || this.obj.moveAnimation) {
			return;
		}
		this.pathPos.x = x;
		this.pathPos.y = y;

		this.path.push({
			x, y
			, sprite: renderer.buildRectangle({
				layerName: "effects"
				, color: this.pathColor
				, alpha: this.pathAlpha
				, x: (x * scale) + scaleMult
				, y: (y * scale) + scaleMult
				, w: scale - (scaleMult * 2)
				, h: scale - (scaleMult * 2)
			})
		});

		client.request({
			cpn: "player"
			, method: "move"
			, data: {
				x, y
				, priority: this.path.length === 1
			}
		});
	}

	, update: function () {
		if (this.obj.moveAnimation) {
			this.clearPath();
		}

		let x = this.obj.x;
		let y = this.obj.y;

		const pathLen = this.path.length;
		if (pathLen === 0) {
			this.pathPos.x = Math.round(x);
			this.pathPos.y = Math.round(y);
		}
		if (x === this.lastX && y === this.lastY) {
			return;
		}
		this.lastX = x;
		this.lastY = y;

		for (let i = pathLen - 1; i >= 0; --i) {
			const { x: pX, y: pY } = this.path[i];
			if (pX !== x || pY !== y) {
				continue;
			}
			for (let j = 0; j <= i; j++) {
				renderer.destroyObject({
					layerName: "effects"
					, sprite: this.path[j].sprite
				});
			}
			this.path.splice(0, i + 1);
			break;
		}
		const delta = pathLen - this.path.length;
		if (delta > 2) {
			if (pathLen - delta > 0) {
				let first = true;
				for (const p of this.path) {
					client.request({
						cpn: "player"
						, method: "move"
						, data: {
							x: p.x, y: p.y
							, clearQueued: first
							, priority: first
						}
					});
					first = false;
				}
			} else {
				client.request({
					cpn: "player"
					, method: "performAction"
					, data: {
						cpn: "player"
						, method: "clearQueue"
						, data: {}
					}
				});
			}
		}
	}

	, destroy: function () {
		this.unhookEvents();
	}
};

import client from "/js/system/client.js";
import events from "/js/system/events.js";
import physics from "/js/misc/physics.js";
import renderer from "/js/rendering/renderer.js";
import input from "/js/input.js";
//import objects from "/js/objects/objects.js";

const MOUSE_PATH_DISTANCE = 3;

const eventMap = {
	onMoveSpeedChange: "onMoveSpeedChange"

	, onUiHover: "onUiHover"

	, onKeyDown: "keydown"

	, onTouchStart: "touchstart"
	, onTouchMove: "touchmove"
	, onTouchEnd: "touchend"
	, onTouchCancel: "touchcancel"
};

export default {
	type: "inputs"
	// Mouse & touch
	, hoverTile: { x: 0, y: 0 }

	// Mouse move.
	, opacityCounter: 0
	, sprite: null

	// Key move
	, moveCd: 0
	, moveCdMax: 8

	// Touch move
	, lastNode: null
	, minSqrDistance: 1650

	, init: function () {
		this.sprite = renderer.buildObject({
			layerName: "effects"
			, x: 0, y: 0
			, sheetName: "ui"
			, cell: 7
		});
		for (const [prop, key] of Object.entries(eventMap)) {
			this.hookEvent(key, this[prop].bind(this));
		}
		this.hookEvent("onUiLeave", this.onUiHover.bind(this, false));
		this.obj.on("shake", this.onShake.bind(this));
	}

	, destroy: function () {
		renderer.destroyObject({
			sprite: this.sprite
		});
		this.unhookEvents();
	}

	, bump: function (dx, dy) {
		if (this.obj.pather.path.length > 0) {
			return;
		}
		if (this.obj.bumpAnimation) {
			return;
		}
		events.emit("onObjCollideBump", this.obj);
		this.obj.addComponent("bumpAnimation", {
			deltaX: dx
			, deltaY: dy
		});
	}

	, showPath: function (e) {
		if (e.has("button") && e.button !== 0) {
			return;
		}
		const tileX = Math.floor(e.worldX / scale);
		const tileY = Math.floor(e.worldY / scale);
		if (tileX === this.hoverTile.x && tileY === this.hoverTile.y) {
			return;
		}
		events.emit("onChangeHoverTile", tileX, tileY);

		this.hoverTile.x = tileX;
		this.hoverTile.y = tileY;
		this.sprite.x = this.hoverTile.x * scale;
		this.sprite.y = this.hoverTile.y * scale;
	}

	, update: function () {
		if (this.obj.dead) {
			this.sprite.visible = false;
			return;
		}
		this.opacityCounter++;
		if (this.sprite) {
			this.sprite.alpha = 0.35 + Math.abs(Math.sin(this.opacityCounter / 20) * 0.35);
		}
		this.showPath(input.mouse);

		if (this.moveCd > 0) {
			this.moveCd--;
		} else {
			this.keyMove();
		}
		this.onMouseInput(input.mouse);
	}

	, keyMove: function () {
		if (input.isUIVisible()) {
			return;
		}
		const delta = {
			x: input.getAxis("horizontal")
			, y: input.getAxis("vertical")
		};
		if (!delta.x && !delta.y) {
			return;
		}
		const newX = Math.floor(this.obj.pather.pathPos.x + delta.x);
		const newY = Math.floor(this.obj.pather.pathPos.y + delta.y);
		if (physics.isTileBlocking(newX, newY)) {
			this.bump(delta.x, delta.y);
			return;
		}
		this.moveCd = this.moveCdMax;
		this.obj.pather.add(newX, newY);
	}
	, onMouseInput: function (mouse) {
		if (!mouse
			|| !mouse.buttons.includes(0)
			|| mouse.target !== "world"
		) {
			return;
		}
		if (!this.obj.pather) {
			return;
		}
		let dx = Math.floor(mouse.worldX / scale) - this.obj.pather.pathPos.x;
		let dy = Math.floor(mouse.worldY / scale) - this.obj.pather.pathPos.y;
		const distance = Math.max(Math.abs(dx), Math.abs(dy));
		if (distance <= 0 || distance > MOUSE_PATH_DISTANCE) {
			return;
		}
		if (Math.abs(dx) > 1) {
			dx /= Math.abs(dx);
		}
		if (Math.abs(dy) > 1) {
			dy /= Math.abs(dy);
		}
		const newX = Math.floor(this.obj.pather.pathPos.x + dx);
		const newY = Math.floor(this.obj.pather.pathPos.y + dy);
		const spTarget = this.obj.spellbook?.target;
		if (spTarget) {
			if (spTarget.x === newX && spTarget.y === newY) {
				return;
			}
		}
		if (physics.isTileBlocking(newX, newY)) {
			this.bump(dx, dy);
			return;
		}
		this.obj.pather.add(newX, newY);
	}

	//Changes the moveCdMax variable
	// moveSpeed is affected when mounting and unmounting
	// moveSpeed: 0		|	moveCdMax: 8
	// moveSpeed: 200	|	moveCdMax: 4
	, onMoveSpeedChange: function (moveSpeed) {
		this.moveCdMax = Math.ceil(4 + (((200 - moveSpeed) / 200) * 4));
	}

	, onUiHover: function (dunno, onUiHover) {
		if (this.sprite) {
			this.sprite.visible = !onUiHover;
		}
	}

	, onKeyDown: function (e) {
		if (e.key === "esc") {
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

	, onTouchStart: function (e) {
		this.lastNode = e;
		const tileX = Math.floor(e.worldX / scale);
		const tileY = Math.floor(e.worldY / scale);
		this.hoverTile = {
			x: tileX
			, y: tileY
		};
		events.emit("onChangeHoverTile", tileX, tileY);
	}
	, onTouchMove: function (e) {
		const lastNode = this.lastNode;
		let dx = e.x - lastNode.x;
		let dy = e.y - lastNode.y;
		const sqrDistance = Math.pow(dx, 2) + Math.pow(dy, 2);
		if (sqrDistance < this.minSqrDistance) {
			return;
		}
		if (e.touches > 1) {
			dx = Math.floor(dx / Math.abs(dx));
			dy = Math.floor(dy / Math.abs(dy));
		} else if (Math.abs(dx) > Math.abs(dy)) {
			dx = Math.floor(dx / Math.abs(dx));
			dy = 0;
		} else {
			dx = 0;
			dy = Math.floor(dy / Math.abs(dy));
		}
		this.lastNode = e;

		const newX = Math.floor(this.obj.pather.pathPos.x + dx);
		const newY = Math.floor(this.obj.pather.pathPos.y + dy);
		if (physics.isTileBlocking(newX, newY)) {
			this.bump(dx, dy);
			return;
		}
		this.obj.pather.add(newX, newY);
	}
	, onTouchEnd: function (e) {
		this.lastNode = null;
	}
	, onTouchCancel: function () {
		this.lastNode = null;
	}

	, onShake: function () {
		if (!this.obj.pather.path.length) {
			return;
		}
		client.request({
			cpn: "player"
			, method: "performAction"
			, data: {
				cpn: "player"
				, method: "clearQueue"
				, data: {}
			}
		});
		window.navigator.vibrate(150);
	}
};

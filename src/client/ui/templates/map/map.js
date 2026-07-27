import physics from "/js/misc/physics.js";
import objectsModule from "/js/objects/objects.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/map/template.html", { raw: true });

const CANVAS_SCALE = 4;
const eventMap = {
	onGetObject: "onGetObject"
	, onKeyDown: "keydown"
};

export default {
	tpl: template

	, mapScale: CANVAS_SCALE * 2
	, itemColors: {
		default: [ 255, 0, 255 ] // Purple
		, mobs: {
			default: [ 255, 0, 0 ] // Red
		}
		, characters: {
			default: [ 0, 255, 0 ] // Green
		}
		, me: [ 255, 255, 0 ] // Yellow
		, player: {
			default: [ 255, 255, 0 ] // Yellow
		}
		, hidden: {
			default: [ 171, 171, 171 ] // Gray
			, sound: [ 154, 154, 255 ]
		}
		, bigObjects: {
			default: [ 0, 0, 255 ] // Blue
		}
	}

	, mapCanvas: null
	, mapCtx: null
	, viewCtx: null
	, rawImage: null

	, postRender: function () {
		for (const [prop, key] of Object.entries(eventMap)) {
			this.onEvent(key, this[prop].bind(this));
		}
		this.mapCanvas = document.createElement("canvas");
		this.el.on("click", this.toggleMap.bind(this));
		this.uiContainer = $("#ui-container");
		this.el.addClass("uiMapMini");
		this.el.css("display", "block");
	}

	, toggleMap: function () {
		if (this.el.hasClass("uiMapBig")) {
			this.uiContainer.removeClass("blocking");
			this.el.removeClass("uiMapBig");
			this.el.addClass("uiMapMini");
			return;
		}
		this.el.removeClass("uiMapMini");
		this.el.addClass("uiMapBig");
		this.uiContainer.addClass("blocking");
		this.drawMap();
	}

	, drawMap: _.debounce(function () {
		if (!physics.grid) {
			return;
		}

		// Render map.
		if (this.mapCtx
			&& this.mapCanvas.width === physics.grid.length
			&& this.mapCanvas.height === physics.grid[0].length
		) {
			this.mapCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
		} else {
			this.mapCanvas.width = physics.grid.length;
			this.mapCanvas.height = physics.grid[0].length;
			this.mapCtx = this.mapCanvas.getContext("2d", { willReadFrequently: false });
		}
		if (!this.rawImage
			|| this.rawImage.width !== physics.grid.length
			|| this.rawImage.height !== physics.grid[0].length
		) {
			this.rawImage = this.mapCtx.getImageData(0, 0, physics.grid.length, physics.grid[0].length);
		}

		const pix = this.rawImage.data;
		const imgWidth = this.rawImage.width;
		for (let x = 0; x < physics.grid.length; x++) {
			for (let y = 0; y < physics.grid[x].length; y++) {
				const i = (y * imgWidth + x) * 4;
				if (physics.grid[x][y]) {
					// Collision
					pix[i] = 117;
					pix[i + 1] = 123;
					pix[i + 2] = 146;
					pix[i + 3] = 51;
				} else {
					// Walkable
					pix[i] = 0;
					pix[i + 1] = 0;
					pix[i + 2] = 0;
					pix[i + 3] = 255;
				}
			}
		}
		for (const obj of objectsModule.objects) {
			if (obj.destroyed || !obj.updateVisibility) {
				continue;
			}
			this.drawMapItem(this.rawImage, obj);
		}
		if (Date.now() % 1000 > 500) { // Blink each half second when obscured.
			// Draw player again on top of other objects.
			this.drawMapItem(this.rawImage, window.player);
		}
		this.mapCtx.putImageData(this.rawImage, 0, 0);

		// Update map view.
		const viewportCanvas = this.el[0];
		if (this.viewCtx) {
			this.viewCtx.reset();
		} else {
			viewportCanvas.width = this.mapCanvas.width * CANVAS_SCALE;
			viewportCanvas.height = this.mapCanvas.height * CANVAS_SCALE;
			this.viewCtx = viewportCanvas.getContext("2d");
		}

		this.viewCtx.translate(viewportCanvas.width / 2, viewportCanvas.height / 2);
		this.viewCtx.scale(this.mapScale, this.mapScale);
		this.viewCtx.translate(-window.player.x, -window.player.y);

		this.viewCtx.imageSmoothingEnabled = false;
		this.viewCtx.drawImage(this.mapCanvas, 0, 0);

	// 250ms = 4 FPS
	}, 250, true, true)

	, getItemType: function (obj) {
		if (obj.isVisible && obj.sprite) {
			if (obj.account || obj.player) {
				if (window.player.id === obj.id) {
					return "me";
				}
				return ["player", obj.account || obj.name];
			}
			return [obj.sheetName, obj.name];
		}
		if (obj.sound) {
			return ["hidden", "sound"];
		}
		//obj.aggro
		//obj.isRare
		return ["hidden", obj.name];
	}
	, getMapItemColor: function (itemTypeInfo) {
		if (typeof itemTypeInfo === "object") {
			itemTypeInfo = this.getItemType(itemTypeInfo);
		}
		if (typeof itemTypeInfo === "string") {
			itemTypeInfo = itemTypeInfo.split(".");
		}
		const colorDef = this.itemColors[itemTypeInfo[0]];
		if (Array.isArray(colorDef)) {
			return colorDef;
		} else if (colorDef) {
			return colorDef[itemTypeInfo[1]] || colorDef.default;
		}
		return this.itemColors.default;
	}
	, drawMapItem: function (rawImage, obj) {
		const pix = rawImage.data;
		const colorArr = this.getMapItemColor(obj);
		for (let x = (obj.width || 1) - 1; x >= 0; --x) {
			for (let y = (obj.height || 1) - 1; y >= 0; --y) {
				const i = ((obj.y + y) * rawImage.width + (obj.x + x)) * 4;
				pix[i] = colorArr[0];
				pix[i + 1] = colorArr[1];
				pix[i + 2] = colorArr[2];
				pix[i + 3] = 255;
			}
		}
	}

	, onGetObject: function (object) {
		if (!object.id) {
			return;
		}
		this.drawMap();
	}

	, onKeyDown: function (e) {
		if (!e?.key) {
			return;
		}
		if (this.el.css("display") !== "block") {
			// Map hidden...
			return;
		}
		if (e.key === "m") {
			this.toggleMap();
			return;
		}
		if (e.key === "93" && this.mapScale > CANVAS_SCALE) {
			this.mapScale--;
			this.drawMap();
			return;
		}
		if (e.key === "91" && this.mapScale < 11) {
			this.mapScale++;
			this.drawMap();
			return;
		}
	}
};

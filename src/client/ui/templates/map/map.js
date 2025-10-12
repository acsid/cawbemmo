define([
	"html!ui/templates/map/template"
	, "css!ui/templates/map/styles"
	, "js/misc/physics"
	, "js/objects/objects"
], function (
	template
	, styles
	, physics
	, objectsModule
) {
	const CANVAS_SCALE = 4;
	return {
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

		, postRender: function () {
			this.mapCanvas = document.createElement("canvas");
			for (const eventName in this.events) {
				this.onEvent(eventName, this.events[eventName].bind(this));
			}
			this.el.on("click", this.toggleMap.bind(this));
			this.uiContainer = $(".ui-container");
			this.el.addClass("uiMapMini");
			this.el.css("display", "block");
		}

		, toggleMap: function() {
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

		, drawMap: _.debounce(function() {
			if (!physics.grid) {
				return;
			}
			// Render map.
			this.mapCanvas.width = physics.grid.length;
			this.mapCanvas.height = physics.grid[0].length;
			const mapCtx = this.mapCanvas.getContext("2d");
			mapCtx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
			const rawImage = mapCtx.getImageData(0, 0, physics.grid.length, physics.grid[0].length);
			const pix = rawImage.data;
			for (let x = 0; x < physics.grid.length; x++) {
				for (let y = 0; y < physics.grid[x].length; y++) {
					const i = (y * rawImage.width + x) * 4;
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
			objectsModule.objects.forEach((obj) => {
				if (obj.destroyed || !obj.updateVisibility) {
					return;
				}
				this.drawMapItem(rawImage, obj);
			});
			if (Date.now() % 1000 > 500) { // Blink each half second when obscured.
				// Draw player again on top of other objects.
				this.drawMapItem(rawImage, window.player);
			}
			mapCtx.putImageData(rawImage, 0, 0);
			// Update map view.
			const viewportCanvas = this.el[0];
			viewportCanvas.width = this.mapCanvas.width * CANVAS_SCALE;
			viewportCanvas.height = this.mapCanvas.height * CANVAS_SCALE;
			const viewCtx = viewportCanvas.getContext("2d");
			viewCtx.clearRect(0, 0, viewportCanvas.width, viewportCanvas.height);
			viewCtx.translate(viewportCanvas.width / 2, viewportCanvas.height / 2);
			viewCtx.scale(this.mapScale, this.mapScale);
			viewCtx.translate(-player.x, -player.y);
			viewCtx.imageSmoothingEnabled = false;
			viewCtx.drawImage(this.mapCanvas, 0, 0);
		// 250ms - 4 FPS
		}, 250, true, true)

		, getItemType: function(obj) {
			if (obj.isVisible && obj.sprite) {
				if (obj.account || obj.player) {
					if (window.player.id == obj.id) {
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
		, getMapItemColor: function(itemTypeInfo) {
			if (typeof itemTypeInfo == "object") {
				itemTypeInfo = this.getItemType(itemTypeInfo);
			}
			if (typeof itemTypeInfo == "string") {
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
		, drawMapItem: function(rawImage, obj) {
			const pix = rawImage.data;
			const i = (obj.y * rawImage.width + obj.x) * 4;
			const colorArr = this.getMapItemColor(obj);
			pix[i] = colorArr[0];
			pix[i + 1] = colorArr[1];
			pix[i + 2] = colorArr[2];
			pix[i + 3] = 255;
		}

		, events: {
			onGetObject: function(object) {
				if (!object.id) {
					return;
				}
				this.drawMap();
			}
			, onKeyDown: function (key) {
				if (!key) {
					return;
				}
				if (this.el.css("display") != "block") {
					// Map hidden...
					return;
				}
				if (key == "m") {
					this.toggleMap();
					return;
				}
				if (key == "13" && this.mapScale > CANVAS_SCALE) {
					this.mapScale--;
					this.drawMap();
					return;
				}
				if (key == "11" && this.mapScale < 11) {
					this.mapScale++;
					this.drawMap();
					return;
				}
			}
		}
	};
});

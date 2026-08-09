import resources from "/js/resources.js";
import events from "/js/system/events.js";
import physics from "/js/misc/physics.js";
import effects from "/js/rendering/effects.js";
import tileOpacity from "/js/rendering/tileOpacity.js";
import particles from "/js/rendering/particles.js";
import shaderOutline from "/js/rendering/shaders/outline.js";
import spritePool from "/js/rendering/spritePool.js";
import spriteRegistry from "/js/system/spriteRegistry.js";
import globals from "/js/system/globals.js";
import {
	autoDetectRenderer
	, Container
	, Graphics
	, Rectangle
	, Sprite
	, Text as PixiText
	, Texture
	, AlphaFilter
} from "pixi.js";

// The single particle layer name. The legacy "particlesUnder" layer was dropped
// (it was instantiated but never received any emitters).
const particleLayerName = "particles";
let particleEngine = null;

export default {
	stage: null
	, layers: {
		objects: null
		, mobs: null
		, characters: null
		, attacks: null
		, effects: null
		, particles: null
		, lightPatches: null
		, lightBeams: null
		, tileSprites: null
		, hiders: null
	}

	, titleScreen: false
	, loginBackgroundRenderer: null

	, width: 0
	, height: 0

	, showTilesW: 0
	, showTilesH: 0

	, pos: { x: 0, y: 0 }
	, moveTo: null
	, moveSpeed: 0
	, moveSpeedMax: 1.50
	, moveSpeedInc: 0.5

	, lastUpdatePos: {
		x: 0
		, y: 0
	}

	, zoneId: null

	, textures: {}
	, textureCache: {}

	, sprites: []

	, lastTick: null

	, hiddenRooms: null

	, init: async function () {
		events.on("onGetMap", this.onGetMap.bind(this));
		events.on("onToggleFullscreen", this.toggleScreen.bind(this));
		events.on("onMoveSpeedChange", this.adaptCameraMoveSpeed.bind(this));
		events.on("resetRenderer", this.resetRenderer.bind(this));

		this.width = $("body").width();
		this.height = $("body").height();

		this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
		this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

		// PixiJS v8: renderer construction is async (supports WebGPU/WebGL).
		// v8 removed PIXI.settings — resolution goes in renderer options and
		// scaleMode is set per-texture-source (see buildSpritesTexture).
		this.renderer = await autoDetectRenderer({
			width: this.width
			, height: this.height
			, preference: "webgl"
			, background: "#2d2136"
			, resolution: 1
		});

		window.addEventListener("resize", this.onResize.bind(this));

		// v8: renderer.view was renamed to renderer.canvas.
		$(this.renderer.canvas).appendTo(".canvas-container");

		this.stage = new Container();

		particleEngine = _.assign({}, particles);
		await particleEngine.init({
			r: this
			, renderer: this.renderer
			, stage: null
		});

		const layers = this.layers;
		for (const l in layers) {
			// The particle layer must be a ParticleContainer (v8 batched renderer),
			if (l === particleLayerName) {
				layers[l] = particleEngine.createContainer();
			} else {
				layers[l] = new Container();
			}
			layers[l].layer = (l === "tileSprites") ? "tiles" : l;
			this.stage.addChild(layers[l]);
		}
		particleEngine.stage = this.layers[particleLayerName];

		this.buildSpritesTexture();
	}

	, resetRenderer: function () {
		const map = this.map;
		const w = this.w = map.length;
		const h = this.h = map[0].length;

		this.stage.removeChild(this.layers.hiders);
		this.layers.hiders = new Container();
		this.layers.hiders.layer = "hiders";
		this.stage.addChild(this.layers.hiders);

		let container = this.layers.tileSprites;
		this.stage.removeChild(container);

		this.layers.tileSprites = container = new Container();
		container.layer = "tiles";
		this.stage.addChild(container);

		this.stage.children.sort((a, b) => {
			if (a.layer === "hiders") {
				return 1;
			} else if (b.layer === "hiders") {
				return -1;
			} else if (a.layer === "tiles") {
				return -1;
			} else if (b.layer === "tiles") {
				return 1;
			}
			return 0;
		});

		spritePool.clean();

		this.sprites = _.get2dArray(w, h, "array");

		this.map = [];
		this.w = 0;
		this.h = 0;

		delete this.moveTo;
	}

	, buildSpritesTexture: function () {
		const { clientConfig: { atlasTextureDimensions, atlasTextures, spriteSizes, textureList } } = globals;
		const sprites = resources.sprites;
		textureList.forEach((t) => {
			// v8 merged BaseTexture into Texture. The underlying source keeps the
			// width/height we read below; scaleMode lives on the source.
			const texture = Texture.from(sprites[t]);
			texture.source.scaleMode = "nearest";
			this.textures[t] = texture;
		});
		atlasTextures.forEach((t) => {
			const texture = this.textures[t];
			const spSize = spriteSizes[t] || 8;
			atlasTextureDimensions[t] = {
				w: texture.width / spSize
				, h: texture.height / spSize
			};
		});
	}

	, toggleScreen: async function () {
		if (!document.fullscreenEnabled) {
			_.log.requestFullscreen.notice("Fullscreen mode is not available!");
			return "Windowed";
		}
		if (document.fullscreenElement
			|| window.innerHeight === screen.height
		) { // isFullscreen
			try { // Change to windowed mode.
				await document.exitFullscreen();
				return "Windowed";
			} catch (error) {
				_.log.exitFullscreen.error(error);
				return "Fullscreen";
			}
		}
		try { // Enable fullscreen mode.
			await document.body.requestFullscreen();
			return "Fullscreen";
		} catch (error) {
			_.log.requestFullscreen.error(error);
			return "Windowed";
		}
	}

	, buildTitleScreen: async function () {
		this.titleScreen = true;

		if (this.loginBackgroundRenderer) {
			return this.loginBackgroundRenderer(this);
		}

		let { loginBackgroundGeneratorPath } = globals.clientConfig;
		if (Array.isArray(loginBackgroundGeneratorPath)) {
			loginBackgroundGeneratorPath = _.getRandomObj(loginBackgroundGeneratorPath);
		}
		if (!loginBackgroundGeneratorPath) {
			loginBackgroundGeneratorPath = "/js/rendering/renderLoginBackground.js";
		}
		const moduleInstance = await import(loginBackgroundGeneratorPath);
		const exportName = _.getRandomObj(Object.keys(moduleInstance));
		this.loginBackgroundRenderer = moduleInstance[exportName];
		return this.loginBackgroundRenderer(this);
	}

	, onResize: function () {
		if (isMobile) {
			return;
		}
		this.width = $("body").width();
		this.height = $("body").height();

		this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
		this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

		this.renderer.resize(this.width, this.height);
		if (window.player) {
			this.setPosition({
				x: (window.player.x - (this.width / (scale * 2))) * scale
				, y: (window.player.y - (this.height / (scale * 2))) * scale
			}, true);
		}
		if (this.titleScreen) {
			this.clean();
			this.buildTitleScreen();
		}
		events.emit("onResize");
	}

	, getTexture: function (baseTex, cell, size = 8) {
		if (!baseTex) {
			throw Error(`Missing baseTex!`);
		}
		if (baseTex === "sprites") {
			// The 'sprites' texture maps to all the sheets in loading order.
			const { clientConfig: { atlasTextures, spriteSizes } } = globals;
			let curId = 0;
			baseTex = atlasTextures.find((t) => {
				const texture = this.textures[t];
				const spSize = spriteSizes[t] || 8;
				const spCount = (texture.width / spSize) * (texture.height / spSize);
				if (cell - (curId + spCount) >= 0) {
					curId += spCount;
					return false;
				}
				return true;
			});
			//console.log(`Texture 'sprites':${cell} remapped to '${baseTex}':${cell - curId}`);
			cell = cell - curId;
		}
		const textureName = `${baseTex}_${cell}`;
		let cached = this.textureCache[textureName];
		if (cached) {
			return cached;
		}
		const sheetColumns = (this.textures[baseTex].width / size);
		let y = Math.floor(cell / sheetColumns);
		let x = cell - (y * sheetColumns);
			//console.log(`Creating sub texture[${x}, ${y}]`, this.textures[baseTex], new Rectangle(x * size, y * size, size, size));
		// v8: Texture takes an options object { source, frame } instead of (base, rect).
		cached = new Texture({ source: this.textures[baseTex].source, frame: new Rectangle(x * size, y * size, size, size) });
		this.textureCache[textureName] = cached;
		return cached;
	}

	, clean: function () {
		this.stage.removeChild(this.layers.hiders);
		this.layers.hiders = new Container();
		this.layers.hiders.layer = "hiders";
		this.stage.addChild(this.layers.hiders);

		let container = this.layers.tileSprites;
		this.stage.removeChild(container);

		this.layers.tileSprites = container = new Container();
		container.layer = "tiles";
		this.stage.addChild(container);

		this.stage.children.sort((a, b) => {
			if (a.layer === "hiders") {
				return 1;
			} else if (b.layer === "hiders") {
				return -1;
			} else if (a.layer === "tiles") {
				return -1;
			} else if (b.layer === "tiles") {
				return 1;
			}
			return 0;
		});
	}

	, buildTile: function (c, i, j) {
		const tile = new Sprite(this.getTexture("sprites", c));
		tile.alpha = tileOpacity.map(c);
		tile.position.x = i * scale;
		tile.position.y = j * scale;
		tile.width = scale;
		tile.height = scale;
		if (tileOpacity.canFlip(c) && Math.random() < 0.5) {
			tile.position.x += scale;
			tile.scale.x = -scaleMult;
		}
		return tile;
	}

	, onGetMap: function (msg) {
		this.titleScreen = false;
		physics.init(msg.collisionMap);

		let map = this.map = msg.map;
		let w = this.w = map.length;
		let h = this.h = map[0].length;

		for (let i = 0; i < w; i++) {
			let row = map[i];
			for (let j = 0; j < h; j++) {
				if (typeof row[j] !== "string") {
					row[j] = String(row[j]);
				}
				row[j] = row[j].split(",");
			}
		}

		this.clean();
		spritePool.clean();

		this.stage.filters = [new AlphaFilter()];
		this.stage.filterArea = new Rectangle(0, 0, Math.max(w * scale, this.width), Math.max(h * scale, this.height));

		this.hiddenRooms = msg.hiddenRooms;

		this.sprites = _.get2dArray(w, h, "array");

		this.stage.children.sort((a, b) => {
			if (a.layer === "tiles") {
				return -1;
			} else if (b.layer === "tiles") {
				return 1;
			}
			return 0;
		});

		if (this.zoneId !== null) {
			events.emit("onRezone", {
				oldZoneId: this.zoneId
				, newZoneId: msg.zoneId
			});
		}

		this.zoneId = msg.zoneId;

		msg.clientObjects.forEach((c) => {
			c.zoneId = this.zoneId;
			events.emit("onGetObject", c);
		});

		//Normally, the mounts mod queues this event when unmounting.
		// If we rezone, our effects are destroyed, so the event is queued,
		// but flushForTarget clears the event right after and the event is never received.
		// We emit it again here to make sure the speed is reset after entering the new zone.
		events.emit("onMoveSpeedChange", 0);
	}

	, setPosition: function (pos, instant) {
		pos.x += 16;
		pos.y += 16;

		let player = window.player;
		if (player) {
			let px = player.x;
			let py = player.y;

			let hiddenRooms = this.hiddenRooms || [];
			let hLen = hiddenRooms.length;
			for (let i = 0; i < hLen; i++) {
				let h = hiddenRooms[i];
				if (!h.discoverable) {
					continue;
				}
				if (
					px < h.x ||
					px >= h.x + h.width ||
					py < h.y ||
					py >= h.y + h.height ||
					!physics.isInPolygon(px, py, h.area)
				) {
					continue;
				}

				h.discovered = true;
			}
		}
		if (instant) {
			this.moveTo = null;
			this.pos = pos;
			this.stage.x = -Math.floor(this.pos.x);
			this.stage.y = -Math.floor(this.pos.y);
		} else {
			this.moveTo = pos;
		}
		this.updateSprites();
	}

	, isVisible: function (x, y) {
		let stage = this.stage;
		let sx = -stage.x;
		let sy = -stage.y;

		let sw = this.width;
		let sh = this.height;

		return (!(x < sx || y < sy || x >= sx + sw || y >= sy + sh));
	}

	, isHidden: function (x, y) {
		let hiddenRooms = this.hiddenRooms;
		let hLen = hiddenRooms.length;
		if (!hLen) {
			return false;
		}

		const { player: { x: px, y: py } } = window;

		let foundVisibleLayer = null;
		let foundHiddenLayer = null;

		const fnTileInArea = physics.isInArea.bind(physics, x, y);
		const fnPlayerInArea = physics.isInArea.bind(physics, px, py);

		hiddenRooms.forEach((h) => {
			const { discovered, layer, interior } = h;

			/*
			if (!Array.isArray(h.area)) {
				console.warn("Missing area for", h);
			}
			*/
			const playerInHider = (Array.isArray(h.area) ? fnPlayerInArea(h) : false);
			const tileInHider = (Array.isArray(h.area) ? fnTileInArea(h) : false);

			if (playerInHider) {
				if (interior && !tileInHider) {
					foundHiddenLayer = layer;
					return;
				}
			} else if (tileInHider && !discovered) {
				foundHiddenLayer = layer;
				return;
			} else if (tileInHider && discovered) {
				foundVisibleLayer = layer;
				return;
			}

			if (!tileInHider) {
				return;
			}

			foundVisibleLayer = layer;
		});

		//We compare hider layers to cater for hiders inside hiders
		return (foundHiddenLayer > foundVisibleLayer
			|| (foundHiddenLayer === 0
				&& foundVisibleLayer === null
			)
		);
	}

	, updateSprites: function () {
		if (this.titleScreen) {
			return;
		}

		const player = window.player;
		if (!player) {
			return;
		}

		const { w, h, width, height, stage, map, sprites } = this;

		const x = Math.floor((-stage.x / scale) + (width / (scale * 2)));
		const y = Math.floor((-stage.y / scale) + (height / (scale * 2)));

		this.lastUpdatePos.x = stage.x;
		this.lastUpdatePos.y = stage.y;

		const container = this.layers.tileSprites;

		const sw = this.showTilesW;
		const sh = this.showTilesH;

		let lowX = Math.max(0, x - sw + 1);
		let lowY = Math.max(0, y - sh + 2);
		let highX = Math.min(w, x + sw - 2);
		let highY = Math.min(h, y + sh - 2);

		let addedSprite = false;

		const checkHidden = this.isHidden.bind(this);
		const buildTile = this.buildTile.bind(this);

		const newVisible = [];
		const newHidden = [];

		for (let i = lowX; i < highX; i++) {
			let mapRow = map[i];
			let spriteRow = sprites[i];

			for (let j = lowY; j < highY; j++) {
				const cell = mapRow[j];
				if (!cell) {
					continue;
				}

				const cLen = cell.length;
				if (!cLen) {
					return;
				}

				const rendered = spriteRow[j];
				const isHidden = checkHidden(i, j);

				if (isHidden) {
					const nonFakeRendered = rendered.filter((r) => !r.isFake);

					const rLen = nonFakeRendered.length;
					for (let k = 0; k < rLen; k++) {
						const sprite = nonFakeRendered[k];

						sprite.visible = false;
						spritePool.store(sprite);
						rendered.spliceWhere((s) => s === sprite);
					}

					if (cell.visible) {
						cell.visible = false;
						newHidden.push({ x: i, y: j });
					}

					const hasFake = cell.some((c) => c[0] === "-");
					if (hasFake) {
						const isFakeRendered = rendered.some((r) => r.isFake);
						if (isFakeRendered) {
							continue;
						}
					} else {
						continue;
					}
				} else {
					const fakeRendered = rendered.filter((r) => r.isFake);

					const rLen = fakeRendered.length;
					for (let k = 0; k < rLen; k++) {
						const sprite = fakeRendered[k];

						sprite.visible = false;
						spritePool.store(sprite);
						rendered.spliceWhere((s) => s === sprite);
					}

					if (!cell.visible) {
						cell.visible = true;
						newVisible.push({ x: i, y: j });
					}

					const hasNonFake = cell.some((c) => c[0] !== "-");
					if (hasNonFake) {
						const isNonFakeRendered = rendered.some((r) => !r.isFake);
						if (isNonFakeRendered) {
							continue;
						}
					} else {
						continue;
					}
				}

				for (let k = 0; k < cLen; k++) {
					let c = cell[k];
					if (c === "0" || c === "") {
						continue;
					}

					const isFake = +c < 0;
					if (isFake && !isHidden) {
						continue;
					} else if (!isFake && isHidden) {
						continue;
					}

					if (isFake) {
						c = -c;
					}

					c--;

					let flipped = "";
					if (tileOpacity.canFlip(c)) {
						if (Math.random() < 0.5) {
							flipped = "flip";
						}
					}

					let tile = spritePool.getSprite(flipped + c);
					if (!tile) {
						tile = buildTile(c, i, j);
						container.addChild(tile);
						tile.type = c;
						tile.sheetNum = tileOpacity.getSheetNum(c);
						addedSprite = true;
					} else {
						tile.position.x = i * scale;
						tile.position.y = j * scale;
						if (flipped !== "") {
							tile.position.x += scale;
						}
						tile.visible = true;
					}

					if (isFake) {
						tile.isFake = isFake;
					}

					tile.z = k;

					rendered.push(tile);
				}
			}
		}

		lowX = Math.max(0, lowX - 10);
		lowY = Math.max(0, lowY - 10);
		highX = Math.min(w - 1, highX + 10);
		highY = Math.min(h - 1, highY + 10);

		for (let i = lowX; i < highX; i++) {
			const mapRow = map[i];
			let spriteRow = sprites[i];
			let outside = ((i >= x - sw) && (i < x + sw));
			for (let j = lowY; j < highY; j++) {
				if ((outside) && (j >= y - sh) && (j < y + sh)) {
					continue;
				}

				const cell = mapRow[j];

				if (cell.visible) {
					cell.visible = false;
					newHidden.push({ x: i, y: j });
				}

				let list = spriteRow[j];
				let lLen = list.length;
				for (let k = 0; k < lLen; k++) {
					let sprite = list[k];
					sprite.visible = false;
					spritePool.store(sprite);
				}
				spriteRow[j] = [];
			}
		}
		events.emit("onTilesVisible", { visible: newVisible, hidden: newHidden });
		if (addedSprite) {
			container.children.sort((a, b) => a.z - b.z);
		}
	}

	, update: function () {
		const time = Date.now();
		if (!this.moveTo) {
			this.lastTick = time;
			return;
		}
		let deltaX = this.moveTo.x - this.pos.x;
		let deltaY = this.moveTo.y - this.pos.y;
		if (deltaX === 0 && deltaY === 0) {
			this.moveSpeed = 0;
			this.moveTo = null;
			this.lastTick = time;
			return;
		}

		const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));
		if (this.moveSpeed < this.moveSpeedMax) {
			this.moveSpeed += this.moveSpeedInc;
		}
		let moveSpeed = this.moveSpeed;
		if (this.moveSpeedMax < 1.6) {
			moveSpeed *= 1 + (distance / 200);
		}
		let elapsed = time - this.lastTick;
		moveSpeed *= (elapsed / 15);
		if (moveSpeed > distance) {
			moveSpeed = distance;
		}
		deltaX = (deltaX / distance) * moveSpeed;
		deltaY = (deltaY / distance) * moveSpeed;

		this.pos.x = this.pos.x + deltaX;
		this.pos.y = this.pos.y + deltaY;

		let stage = this.stage;
		if (window.staticCamera !== true) {
			stage.x = -Math.floor(this.pos.x);
			stage.y = -Math.floor(this.pos.y);
		}
		let halfScale = scale / 2;
		if (Math.abs(stage.x - this.lastUpdatePos.x) > halfScale || Math.abs(stage.y - this.lastUpdatePos.y) > halfScale) {
			this.updateSprites();
		}

		events.emit("onSceneMove", { x: deltaX, y: deltaY });
		this.lastTick = time;
	}

	, buildContainer: function (obj) {
		const container = new Container();
		this.layers[obj.layerName || obj.sheetName].addChild(container);
		return container;
	}

	, buildRectangle: function (obj) {
		const graphics = new Graphics();

		let alpha = obj.alpha;
		if (obj.has("alpha")) {
			graphics.alpha = alpha;
		}

		let fillAlpha = obj.fillAlpha;
		if (!obj.has("fillAlpha")) {
			fillAlpha = 1;
		}

		graphics.rect(0, 0, obj.w, obj.h);
		graphics.fill({ color: obj.color || "#48edff", alpha: fillAlpha });

		if (obj.strokeColor) {
			graphics.stroke({ width: scaleMult, color: obj.strokeColor });
		}

		(obj.parent || this.layers[obj.layerName || obj.sheetName]).addChild(graphics);

		graphics.position.x = obj.x;
		graphics.position.y = obj.y;

		return graphics;
	}

	, moveRectangle: function (obj) {
		obj.sprite.position.x = obj.x;
		obj.sprite.position.y = obj.y;
		obj.sprite.width = obj.w;
		obj.sprite.height = obj.h;
	}

	, buildObject: function (obj) {
		const { sheetName, parent: container, layerName, visible = true } = obj;

		const sprite = new Sprite();
		obj.sprite = sprite;

		this.setSprite(obj);

		sprite.visible = visible;

		const spriteContainer = container || this.layers[layerName || sheetName] || this.layers.objects;
		spriteContainer.addChild(sprite);

		obj.w = sprite.width;
		obj.h = sprite.height;

		return sprite;
	}

	, addFilter: function (sprite, config) {
		const filter = new shaderOutline(config);

		if (!sprite.filters) {
			sprite.filters = [filter];
		} else {
			sprite.filters.push(filter);
		}

		return filter;
	}

	, removeFilter: function (sprite, filter) {
		if (sprite.filters) {
			sprite.filters = null;
		}
	}

	, buildText: function (obj) {
		const { text, visible, x, y, parent: spriteParent, layerName } = obj;
		const { fontSize = 14, color = 0xF2F5F5 } = obj;

		const textSprite = new PixiText({
			text: text
			, style: {
				fontFamily: "var(--main-font)"
				, fontSize: fontSize
				, fill: color
				, stroke: 0x2d2136
				, strokeThickness: 4
			}
		});

		if (visible === false) {
			textSprite.visible = false;
		}

		textSprite.x = x - (textSprite.width / 2);
		textSprite.y = y;

		const parentSprite = spriteParent ?? this.layers[layerName];
		parentSprite.addChild(textSprite);

		return textSprite;
	}

	, buildEmitter: function (config) {
		return particleEngine.buildEmitter(config);
	}

	, destroyEmitter: function (emitter) {
		particleEngine.destroyEmitter(emitter);
	}

	, setSprite: function (obj) {
		//console.log("Building sprite", obj);
		const { sprite, sheetName, cell } = obj;

		const spriteSizes = globals.clientConfig.spriteSizes;
		const newSize = spriteSizes[sheetName] || 8;
		//In-world size multiplier from the sheet's <sheet>.json "world" override
		//(defaults to 1 for sheets without one). Cached on the sprite so
		//setSpritePosition can derive scale.x from the same value.
		const { scale: sheetScale = 1 } = spriteRegistry.getSpriteProps({ name: sheetName, module: "world" });
		sprite.sheetScale = sheetScale;
		obj.w = newSize * scaleMult * sheetScale;
		obj.h = newSize * scaleMult * sheetScale;
		sprite.width = obj.w;
		sprite.height = obj.h;
		sprite.texture = this.getTexture(sheetName, cell, newSize);

		if (newSize !== sprite.size) {
			sprite.size = newSize;
			this.setSpritePosition(obj);
		}
	}

	, setSpritePosition: function (obj) {
		const { sprite, x, y, flipX, offsetX = 0, offsetY = 0 } = obj;

		sprite.x = (x * scale) + (flipX ? scale : 0) + offsetX;
		const oldY = sprite.y;
		sprite.y = (y * scale) + offsetY;

		if (sprite.width > scale) {
			// Center the oversized sprite over its tile horizontally and stand it on the tile vertically (feet at the tile bottom).
			const overhang = sprite.width - scale;
			if (flipX) {
				sprite.x += (overhang / 2);
			} else {
				sprite.x -= (overhang / 2);
			}
			sprite.y -= overhang;
		}

		if (oldY !== sprite.y) {
			this.reorder();
		}

		sprite.scale.x = flipX ? -(scaleMult * (sprite.sheetScale ?? 1)) : (scaleMult * (sprite.sheetScale ?? 1));
	}

	, reorder: function () {
		this.layers.mobs.children.sort((a, b) => b.y - a.y);
	}

	, destroyObject: function (obj) {
		if (obj.sprite.parent) {
			obj.sprite.parent.removeChild(obj.sprite);
		}
	}

	//Changes the moveSpeedMax and moveSpeedInc variables
	// moveSpeed changes when mounting and unmounting
	// moveSpeed: 0		|	moveSpeedMax: 1.5		|		moveSpeedInc: 0.5
	// moveSpeed: 200	|	moveSpeedMax: 5.5		|		moveSpeedInc: 0.2
	//  Between these values we should follow an exponential curve for moveSpeedInc since
	//   a higher chance will proc more often, meaning the buildup in distance becomes greater
	, adaptCameraMoveSpeed: function (moveSpeed) {
		const factor = Math.sqrt(moveSpeed);
		const maxValue = Math.sqrt(200);

		this.moveSpeedMax = 1.5 + ((moveSpeed / 200) * 3.5);
		this.moveSpeedInc = 0.2 + (((maxValue - factor) / maxValue) * 0.3);
	}

	, updateMapAtPosition: function (x, y, mapCellString) {
		const { map, sprites, layers: { tileSprites: container } } = this;

		const row = sprites[x];
		if (!row) {
			return;
		}

		const cell = row[y];
		if (!cell) {
			return;
		}

		cell.forEach((c) => {
			c.visible = false;
			spritePool.store(c);
		});

		cell.length = 0;

		map[x][y] = mapCellString.split(",");

		map[x][y].forEach((m) => {
			m--;

			let tile = spritePool.getSprite(m);
			if (!tile) {
				tile = this.buildTile(m, x, y);
				container.addChild(tile);
				tile.type = m;
				tile.sheetNum = tileOpacity.getSheetNum(m);
			} else {
				tile.position.x = x * scale;
				tile.position.y = y * scale;
				tile.visible = true;
			}

			cell.push(tile);
			cell.visible = true;
		});
	}

	, render: function () {
		if (!this.stage) {
			return;
		}
		effects.render();
		this.renderer.render({ container: this.stage });
	}
};

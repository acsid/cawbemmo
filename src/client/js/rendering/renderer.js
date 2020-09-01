define([
	'js/resources',
	'js/system/events',
	'js/misc/physics',
	'js/rendering/effects',
	'js/rendering/tileOpacity',
	'js/rendering/particles',
	'js/rendering/shaders/outline',
	'js/rendering/spritePool',
	'js/system/globals',
	'js/rendering/renderLoginBackground'
], function (
	resources,
	events,
	physics,
	effects,
	tileOpacity,
	particles,
	shaderOutline,
	spritePool,
	globals,
	renderLoginBackground
) {
	let pixi = PIXI;
	let mRandom = Math.random.bind(Math);

	return {
		stage: null,
		layers: {
			objects: null,
			mobs: null,
			characters: null,
			attacks: null,
			effects: null,
			particles: null,
			lightPatches: null,
			lightBeams: null,
			tileSprites: null,
			hiders: null
		},

		titleScreen: false,

		width: 0,
		height: 0,

		showTilesW: 0,
		showTilesH: 0,

		pos: {
			x: 0,
			y: 0
		},
		moveTo: null,
		moveSpeed: 0,
		moveSpeedMax: 1.50,
		moveSpeedInc: 0.5,

		lastUpdatePos: {
			x: 0,
			y: 0
		},

		zoneId: null,

		textures: {},
		textureCache: {},

		sprites: [],

		lastTick: null,

		hiddenRooms: null,

		init: function () {
			PIXI.settings.GC_MODE = PIXI.GC_MODES.AUTO;
			PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
			PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES, 16);

			events.on('onGetMap', this.onGetMap.bind(this));
			events.on('onToggleFullscreen', this.toggleScreen.bind(this));
			events.on('onMoveSpeedChange', this.adaptCameraMoveSpeed.bind(this));

			this.width = $('body').width();
			this.height = $('body').height();

			this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
			this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

			this.renderer = new PIXI.Renderer({
				width: this.width,
				height: this.height,
				backgroundColor: '0x2d2136'
			});

			window.addEventListener('resize', this.onResize.bind(this));

			$(this.renderer.view).appendTo('.canvas-container');

			this.stage = new pixi.Container();

			let layers = this.layers;
			Object.keys(layers).forEach(l => {
				layers[l] = new pixi.Container();
				layers[l].layer = (l === 'tileSprites') ? 'tiles' : l;

				this.stage.addChild(layers[l]);
			});

			const textureList = globals.clientConfig.textureList;
			const sprites = resources.sprites;

			textureList.forEach(t => {
				this.textures[t] = new pixi.BaseTexture(sprites[t]);
				this.textures[t].scaleMode = pixi.SCALE_MODES.NEAREST;
			});

			particles.init({
				r: this,
				renderer: this.renderer,
				stage: this.layers.particles
			});

			this.buildSpritesTexture();
		},

		buildSpritesTexture: function () {
			const { clientConfig: { atlasTextures } } = globals;

			let container = new pixi.Container();

			let totalHeight = 0;
			atlasTextures.forEach(t => {
				let texture = this.textures[t];
				let tile = new pixi.Sprite(new pixi.Texture(texture));
				tile.width = texture.width;
				tile.height = texture.height;
				tile.x = 0;
				tile.y = totalHeight;

				tileOpacity.atlasTextureDimensions[t] = {
					w: texture.width / 8,
					h: texture.height / 8
				};

				container.addChild(tile);

				totalHeight += tile.height;
			});

			let renderTexture = pixi.RenderTexture.create(this.textures.tiles.width, totalHeight);
			this.renderer.render(container, renderTexture);

			this.textures.sprites = renderTexture;
			this.textures.scaleMult = pixi.SCALE_MODES.NEAREST;
		},

		toggleScreen: function () {
			let isFullscreen = (window.innerHeight === screen.height);

			if (isFullscreen) {
				let doc = document;
				(doc.cancelFullscreen || doc.msCancelFullscreen || doc.mozCancelFullscreen || doc.webkitCancelFullScreen).call(doc);
				return 'Windowed';
			} 

			let el = $('body')[0];
			(el.requestFullscreen || el.msRequestFullscreen || el.mozRequestFullscreen || el.webkitRequestFullscreen).call(el);
			return 'Fullscreen';
		},

		buildTitleScreen: function () {
			this.titleScreen = true;

			renderLoginBackground(this);
		},

		onResize: function () {
			if (isMobile)
				return;

			this.width = $('body').width();
			this.height = $('body').height();

			this.showTilesW = Math.ceil((this.width / scale) / 2) + 3;
			this.showTilesH = Math.ceil((this.height / scale) / 2) + 3;

			this.renderer.resize(this.width, this.height);
			if (window.player) {
				this.setPosition({
					x: (window.player.x - (this.width / (scale * 2))) * scale,
					y: (window.player.y - (this.height / (scale * 2))) * scale
				}, true);
			}

			if (this.titleScreen) {
				this.clean();
				this.buildTitleScreen();
			}

			events.emit('onResize');
		},

		getTexture: function (baseTex, cell, size) {
			size = size || 8;
			let textureName = baseTex + '_' + cell;

			let textureCache = this.textureCache;

			let cached = textureCache[textureName];

			if (!cached) {
				let y = ~~(cell / 8);
				let x = cell - (y * 8);
				cached = new pixi.Texture(this.textures[baseTex], new pixi.Rectangle(x * size, y * size, size, size));
				textureCache[textureName] = cached;
			}

			return cached;
		},

		clean: function () {
			this.stage.removeChild(this.layers.hiders);
			this.layers.hiders = new pixi.Container();
			this.layers.hiders.layer = 'hiders';
			this.stage.addChild(this.layers.hiders);

			let container = this.layers.tileSprites;
			this.stage.removeChild(container);

			this.layers.tileSprites = container = new pixi.Container();
			container.layer = 'tiles';
			this.stage.addChild(container);

			this.stage.children.sort((a, b) => {
				if (a.layer === 'hiders')
					return 1;
				else if (b.layer === 'hiders')
					return -1;
				else if (a.layer === 'tiles')
					return -1;
				else if (b.layer === 'tiles')
					return 1;
				return 0;
			});
		},

		buildTile: function (c, i, j) {
			let alpha = tileOpacity.map(c);
			let canFlip = tileOpacity.canFlip(c);

			let tile = new pixi.Sprite(this.getTexture('sprites', c));

			tile.alpha = alpha;
			tile.position.x = i * scale;
			tile.position.y = j * scale;
			tile.width = scale;
			tile.height = scale;

			if (canFlip && mRandom() < 0.5) {
				tile.position.x += scale;
				tile.scale.x = -scaleMult;
			}

			return tile;
		},

		onGetMap: function (msg) {
			this.titleScreen = false;
			physics.init(msg.collisionMap);

			let map = this.map = msg.map;
			let w = this.w = map.length;
			let h = this.h = map[0].length;

			for (let i = 0; i < w; i++) {
				let row = map[i];
				for (let j = 0; j < h; j++) {
					if (!row[j].split)
						row[j] += '';

					row[j] = row[j].split(',');
				}
			}

			this.clean();
			spritePool.clean();

			this.stage.filters = [new PIXI.filters.AlphaFilter()];
			this.stage.filterArea = new PIXI.Rectangle(0, 0, Math.max(w * scale, this.width), Math.max(h * scale, this.height));

			this.hiddenRooms = msg.hiddenRooms;

			this.sprites = _.get2dArray(w, h, 'array');

			this.stage.children.sort((a, b) => {
				if (a.layer === 'tiles')
					return -1;
				else if (b.layer === 'tiles')
					return 1;
				return 0;
			});

			if (this.zoneId !== null)
				events.emit('onRezone', this.zoneId);
			this.zoneId = msg.zoneId;

			msg.clientObjects.forEach(c => {
				c.zoneId = this.zoneId;
				events.emit('onGetObject', c);
			});
		},

		setPosition: function (pos, instant) {
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
					if (!h.discoverable)
						continue;
					if (
						px < h.x ||
						px >= h.x + h.width ||
						py < h.y ||
						py >= h.y + h.height ||
						!physics.isInPolygon(px, py, h.area)
					)
						continue;

					h.discovered = true;
				}
			}

			if (instant) {
				this.moveTo = null;
				this.pos = pos;
				this.stage.x = -~~this.pos.x;
				this.stage.y = -~~this.pos.y;
			} else
				this.moveTo = pos;

			this.updateSprites();
		},

		isVisible: function (x, y) {
			let stage = this.stage;
			let sx = -stage.x;
			let sy = -stage.y;

			let sw = this.width;
			let sh = this.height;

			return (!(x < sx || y < sy || x >= sx + sw || y >= sy + sh));
		},

		isHidden: function (x, y) {
			let hiddenRooms = this.hiddenRooms;
			let hLen = hiddenRooms.length;
			if (!hLen)
				return false;

			const { player: { x: px, y: py } } = window;

			let foundVisible = false;
			let foundHidden = false;

			hiddenRooms.forEach(h => {
				const discovered = h.discovered;

				const { x: hx, y: hy, width, height, area } = h;

				//Is the tile outside the hider
				if (
					x < hx ||
					x >= hx + width ||
					y < hy ||
					y >= hy + height
				)
					return;

				//Is the tile inside the hider
				if (!physics.isInPolygon(x, y, area))
					return;

				//Is the player outside the hider
				if (
					px < hx ||
					px >= hx + width ||
					py < hy ||
					py >= hy + height
				) {
					if (!discovered)
						foundHidden = true;

					return;
				}

				//Is the player inside the hider
				if (!physics.isInPolygon(px, py, area)) {
					if (!discovered)
						foundHidden = true;

					return;
				}

				foundVisible = true;
			});

			//If two hiders hide the same tile but you're in one of them, the tile should be visible
			return foundHidden && !foundVisible;
		},

		updateSprites: function () {
			if (this.titleScreen)
				return;

			const player = window.player;
			if (!player)
				return;

			const { w, h, width, height, stage, map, sprites } = this;

			const x = ~~((-stage.x / scale) + (width / (scale * 2)));
			const y = ~~((-stage.y / scale) + (height / (scale * 2)));

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
					if (!cell)
						continue;

					const cLen = cell.length;
					if (!cLen)
						return;

					const rendered = spriteRow[j];
					const isHidden = checkHidden(i, j);

					if (isHidden) {
						const nonFakeRendered = rendered.filter(r => !r.isFake);

						const rLen = nonFakeRendered.length;
						for (let k = 0; k < rLen; k++) {
							const sprite = nonFakeRendered[k];

							sprite.visible = false;
							spritePool.store(sprite);
							rendered.spliceWhere(s => s === sprite);
						}

						newHidden.push({
							x: i,
							y: j
						});

						const hasFake = cell.some(c => c[0] === '-');
						if (hasFake) {
							const isFakeRendered = rendered.some(r => r.isFake);
							if (isFakeRendered)
								continue;
						} else
							continue;
					} else {
						const fakeRendered = rendered.filter(r => r.isFake);

						const rLen = fakeRendered.length;
						for (let k = 0; k < rLen; k++) {
							const sprite = fakeRendered[k];

							sprite.visible = false;
							spritePool.store(sprite);
							rendered.spliceWhere(s => s === sprite);
						}

						newVisible.push({
							x: i,
							y: j
						});

						const hasNonFake = cell.some(c => c[0] !== '-');
						if (hasNonFake) {
							const isNonFakeRendered = rendered.some(r => !r.isFake);
							if (isNonFakeRendered)
								continue;
						} else
							continue;
					}

					for (let k = 0; k < cLen; k++) {
						let c = cell[k];
						if (c === '0' || c === '')
							continue;

						const isFake = +c < 0;
						if (isFake && !isHidden)
							continue;
						else if (!isFake && isHidden)
							continue;

						if (isFake)
							c = -c;

						c--;

						let flipped = '';
						if (tileOpacity.canFlip(c)) {
							if (mRandom() < 0.5)
								flipped = 'flip';
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
							if (flipped !== '')
								tile.position.x += scale;
							tile.visible = true;
						}

						if (isFake)
							tile.isFake = isFake;

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
				let spriteRow = sprites[i];
				let outside = ((i >= x - sw) && (i < x + sw));
				for (let j = lowY; j < highY; j++) {
					if ((outside) && (j >= y - sh) && (j < y + sh))
						continue;

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

			events.emit('onTilesVisible', newVisible, true);
			events.emit('onTilesVisible', newHidden, false);

			if (addedSprite)
				container.children.sort((a, b) => a.z - b.z);
		},

		update: function () {
			let time = +new Date();

			if (this.moveTo) {
				let deltaX = this.moveTo.x - this.pos.x;
				let deltaY = this.moveTo.y - this.pos.y;

				if (deltaX !== 0 || deltaY !== 0) {
					let distance = Math.max(Math.abs(deltaX), Math.abs(deltaY));

					let moveSpeedMax = this.moveSpeedMax;
					if (this.moveSpeed < moveSpeedMax)
						this.moveSpeed += this.moveSpeedInc;

					let moveSpeed = this.moveSpeed;

					if (moveSpeedMax < 1.6)
						moveSpeed *= 1 + (distance / 200);

					let elapsed = time - this.lastTick;
					moveSpeed *= (elapsed / 15);

					if (moveSpeed > distance)
						moveSpeed = distance;

					deltaX = (deltaX / distance) * moveSpeed;
					deltaY = (deltaY / distance) * moveSpeed;

					this.pos.x = this.pos.x + deltaX;
					this.pos.y = this.pos.y + deltaY;
				} else {
					this.moveSpeed = 0;
					this.moveTo = null;
				}

				let stage = this.stage;
				if (window.staticCamera !== true) {
					stage.x = -~~this.pos.x;
					stage.y = -~~this.pos.y;
				}

				let halfScale = scale / 2;
				if (Math.abs(stage.x - this.lastUpdatePos.x) > halfScale || Math.abs(stage.y - this.lastUpdatePos.y) > halfScale)
					this.updateSprites();

				events.emit('onSceneMove');
			}

			this.lastTick = time;
		},

		buildContainer: function (obj) {
			let container = new pixi.Container();
			this.layers[obj.layerName || obj.sheetName].addChild(container);

			return container;
		},

		buildRectangle: function (obj) {
			let graphics = new pixi.Graphics();

			let alpha = obj.alpha;
			if (obj.has('alpha'))
				graphics.alpha = alpha;

			let fillAlpha = obj.fillAlpha;
			if (obj.has('fillAlpha'))
				fillAlpha = 1;

			graphics.beginFill(obj.color || '0x48edff', fillAlpha);

			if (obj.strokeColor)
				graphics.lineStyle(scaleMult, obj.strokeColor);

			graphics.drawRect(0, 0, obj.w, obj.h);

			graphics.endFill();

			(obj.parent || this.layers[obj.layerName || obj.sheetName]).addChild(graphics);

			graphics.position.x = obj.x;
			graphics.position.y = obj.y;

			return graphics;
		},

		moveRectangle: function (obj) {
			obj.sprite.position.x = obj.x;
			obj.sprite.position.y = obj.y;
			obj.sprite.width = obj.w;
			obj.sprite.height = obj.h;
		},

		buildObject: function (obj) {
			const { sheetName } = obj;

			let w = 8;
			let h = 8;
			if (obj.w) {
				w = obj.w / scaleMult;
				h = obj.h / scaleMult;
			}

			let bigSheets = globals.clientConfig.bigTextures;
			if (bigSheets.includes(sheetName)) {
				obj.layerName = 'mobs';
				w = 24;
				h = 24;
				obj.w = w * scaleMult;
				obj.h = h * scaleMult;
			}

			let sprite = new pixi.Sprite(this.getTexture(obj.sheetName, obj.cell, w));
			sprite.x = obj.x * scale;
			sprite.y = obj.y * scale;
			sprite.width = obj.w || scale;
			sprite.height = obj.h || scale;
			sprite.visible = obj.has('visible') ? obj.visible : true;

			if (bigSheets.includes(sheetName)) {
				sprite.x -= scale;
				sprite.y -= (scale * 2);
			}

			if (obj.flipX) {
				sprite.scale.x *= -1;
				if (bigSheets.indexOf(obj.sheetName) > -1)
					sprite.x += (scale * 2);
				else
					sprite.x += scale;
			}

			(obj.parent || this.layers[obj.layerName || obj.sheetName] || this.layers.objects).addChild(sprite);

			return sprite;
		},

		addFilter: function (sprite) {
			let thickness = (sprite.width > scale) ? 8 : 16;

			let filter = new shaderOutline(this.renderer.width, this.renderer.height, thickness, '0xffffff');
			if (!sprite.filters)
				sprite.filters = [filter];
			else
				sprite.filters.push();

			return filter;
		},

		removeFilter: function (sprite, filter) {
			if (sprite.filters)
				sprite.filters = null;
		},

		buildText: function (obj) {
			let textSprite = new pixi.Text(obj.text, {
				fontFamily: 'bitty',
				fontSize: (obj.fontSize || 14),
				fill: obj.color || 0xF2F5F5,
				stroke: 0x2d2136,
				strokeThickness: 4,
				align: 'center'
			});

			textSprite.x = obj.x - (textSprite.width / 2);
			textSprite.y = obj.y;

			let parentSprite = obj.parent || this.layers[obj.layerName];
			parentSprite.addChild(textSprite);

			return textSprite;
		},

		buildEmitter: function (config) {
			return particles.buildEmitter(config);
		},

		destroyEmitter: function (emitter) {
			particles.destroyEmitter(emitter);
		},

		setSprite: function (obj) {
			obj.sprite.texture = this.getTexture(obj.sheetName, obj.cell, obj.sprite.width / scaleMult);
		},

		reorder: function () {
			this.layers.mobs.children.sort((a, b) => b.y - a.y);
		},

		destroyObject: function (obj) {
			if (obj.sprite.parent)
				obj.sprite.parent.removeChild(obj.sprite);
		},

		//Changes the moveSpeedMax and moveSpeedInc variables
		// moveSpeed changes when mounting and unmounting
		// moveSpeed: 0		|	moveSpeedMax: 1.5		|		moveSpeedInc: 0.5
		// moveSpeed: 200	|	moveSpeedMax: 5.5		|		moveSpeedInc: 0.2
		//  Between these values we should follow an exponential curve for moveSpeedInc since
		//   a higher chance will proc more often, meaning the buildup in distance becomes greater
		adaptCameraMoveSpeed: function (moveSpeed) {
			const factor = Math.sqrt(moveSpeed);
			const maxValue = Math.sqrt(200);

			this.moveSpeedMax = 1.5 + ((moveSpeed / 200) * 3.5);
			this.moveSpeedInc = 0.2 + (((maxValue - factor) / maxValue) * 0.3);
		},

		render: function () {
			if (!this.stage)
				return;

			effects.render();
			particles.update();

			this.renderer.render(this.stage);
		}
	};
});

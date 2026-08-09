import { Sprite } from "pixi.js";

const BACKGROUND_REGIONS = {
	snow: 4
	, grass: 6
	, beach: 2
	, shallow: 3
	, water: Number.MAX_SAFE_INTEGER
};
const BACKGROUND_TILES = {
	snow: [ 3, 337, 371 ]
	, grass: [ 2, 80, 128, 371 ]
	, beach: [ 82, 87 ]
	, shallow: [ 373, 5 ]
	, water: [ 5, 101 ]
};

const renderLoginBackground = (renderer) => {
	renderer.setPosition({ x: 0, y: 0 }, true);
	const { width, height, layers } = renderer;
	const w = Math.ceil(width / scale) + 1;
	const h = Math.ceil(height / scale) + 1;
	const midX = Math.floor(w / 2);
	const midY = Math.floor(h / 2);
	const noiseFactor = 3;
	const container = layers.tileSprites;
	for (let i = 0; i < w; i++) {
		for (let j = 0; j < h; j++) {
			const distance = Math.sqrt(Math.pow(i - midX, 2) + Math.pow(j - midY, 2));
			let tile = 0;
			for (const region in BACKGROUND_REGIONS) {
				tile += BACKGROUND_REGIONS[region] + (Math.random() * noiseFactor);
				if (tile > distance) {
					tile = BACKGROUND_TILES[region];
					break;
				}
			}

			let alpha = Math.random();
			if ([...BACKGROUND_TILES.grass, ...BACKGROUND_TILES.water] .includes(tile)) {
				alpha *= 2;
			}
			if (Math.random() < 0.3) {
				tile = _.getRandomObj(tile);
			} else {
				tile = tile[0];
			}
			const sprite = new Sprite(renderer.getTexture("sprites", tile));

			alpha = Math.min(Math.max(0.15, alpha), 0.65);
			sprite.alpha = alpha;

			sprite.position.x = i * scale;
			sprite.position.y = j * scale;
			sprite.width = scale;
			sprite.height = scale;

			if (Math.random() < 0.5) {
				sprite.position.x += scale;
				sprite.scale.x = -scaleMult;
			}
			container.addChild(sprite);
		}
	}
};

export default renderLoginBackground;

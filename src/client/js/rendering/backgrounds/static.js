import { Sprite } from "pixi.js";

const GENERATOR_TYPE = "staticGenerator";

const renderFrame = (renderer) => {
	renderer.setPosition({ x: 0, y: 0 }, true);

	const { width, height, layers } = renderer;
	let w = Math.ceil(width / scale) + 1;
	let h = Math.ceil(height / scale) + 1;

	const container = layers.tileSprites;
	if (container.type === GENERATOR_TYPE) {
		for (const sprite of container.children) {
			let alpha = Math.random();
			if (Math.random() < 0.3) {
				alpha *= 2;
			}
			alpha = Math.min(Math.max(0.15, alpha), 0.65);
			sprite.alpha = alpha;
		}
		return;
	}
	for (let i = 0; i < w; i++) {
		for (let j = 0; j < h; j++) {
			let tile = [ 3, 128 ];
			let alpha = Math.random();
			if (Math.random() < 0.3) {
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
	container.type = GENERATOR_TYPE;
	const intervalID = setInterval(() => {
		if (renderer.titleScreen) {
			renderFrame(renderer);
		} else {
			clearInterval(intervalID);
		}
	}, 250);
};

export default renderFrame;

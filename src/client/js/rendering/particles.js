import { ParticleContainer, Texture } from "pixi.js";
import { Emitter } from "/js/dependencies/pixi-particle-system/index.js";
import particleDefaults from "./particleDefaults.js";

const PARTICLE_TEXTURE_URL = "/images/particle.png";

export default {
	renderer: null
	, stage: null

	, texture: null

	, emitters: []

	, init: async function (options) {
		this.r = options.r;
		this.renderer = options.renderer;
		this.stage = options.stage;

		// Load the particle image the same way resources.js loads every other
		// sprite (new Image + onload), then wrap it with Texture.from.
		// We avoid PIXI's Assets loader here because its image parser isn't registered in
		// this no-bundler client, so Assets.load throws "Cannot read properties of
		// undefined (reading 'load')".
		const image = await new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error(`Failed to load particle image: ${PARTICLE_TEXTURE_URL}`));
			img.src = PARTICLE_TEXTURE_URL;
		});
		this.texture = Texture.from(image);
	}

	, createContainer: function () {
		return new ParticleContainer({
			texture: this.texture
		});
	}

	, buildEmitter: function (config) {
		const obj = config.obj;
		delete config.obj;
		const pos = config.pos;
		delete config.pos;
		// blendMode is not a behavior in pixi-particle-system, and v8's
		// ParticleContainer exposes no blend-mode setting, so the value is
		// dropped (particles render with normal blending). It is still parsed
		// out here so the library doesn't receive an unknown config field.
		delete config.blendMode;

		const options = _.assignWith("particles", {}, particleDefaults, config);
		options.textureBehavior = {
			textureConfigs: [{ textures: [this.texture] }]
			, mode: "static"
		};
		//console.log("Particles emitter created", options);
		const emitter = new Emitter(this.stage, options);
		emitter.obj = obj;
		emitter.particleEngine = this;
		if (pos) {
			emitter.spawnBehavior.origin = pos;
		}
		emitter.play();
		this.emitters.push(emitter);
		return emitter;
	}

	, destroyEmitter: function (emitter) {
		// stop(instant=true) removes existing particles immediately.
		emitter.stop(true);

		const i = this.emitters.indexOf(emitter);
		if (i >= 0) {
			this.emitters.splice(i, 1);
		}
	}
};

//import effects from "/js/rendering/effects.js";
import renderer from "/js/rendering/renderer.js";

const getEmitterConfig = function (pos, blueprint, maxAlpha) {
	return {
		emitterVersion: "0.0.0"
		, minParticleLifetime: (blueprint.lifetime || { min: 1 }).min
		, maxParticleLifetime: (blueprint.lifetime || { max: 4 }).max
		, spawnInterval: 0.9 + Math.random()
		, addAtBack: false
		// spawnBehavior.origin replaces the legacy `pos` field; set at build time.
		, pos
		, colorBehavior: {
			mode: "list"
			, listData: {
				list: blueprint.color || [
					{ time: 0, value: "#ffeb38" }
					, { time: 1, value: "#" + _.getRandomFrom("ff6942", "d43346") }
				]
			}
		}
		, alphaBehavior: {
			mode: "list"
			, listData: {
				list: [
					{ time: 0, value: maxAlpha }
					, { time: 1, value: 0 }
				]
			}
		}
		, movementBehavior: {
			mode: "linear"
			, space: "global"
			, xListData: {
				list: [
					{ time: 0, value: 4 }
					, { time: 1, value: 2 }
				]
			}
		}
		, scaleBehavior: {
			mode: "list"
			, xListData: {
				list: [
					{ time: 0, value: 32 }
					, { time: 1, value: 22 }
				]
			}
		}
		, rotationBehavior: {
			mode: "random"
			, useDegrees: true
			, listData: {
				list: [
					{ time: 0, value: 0 }
					, { time: 0, value: 360 }
				]
			}
		}
		, spawnBehavior: {
			shape: "circle"
			, outerRadius: 30
			, innerRadius: 10
		}
		// blendMode ("screen") is applied to the ParticleContainer, not per-emitter
		// (pixi-particle-system has no blend-mode behavior). See particles.js.
		, blendMode: "screen"
	};
};

export default {
	type: "light"

	, lightCd: 0
	, lightO: {}

	, emitters: {}

	, range: 3

	, init: function (blueprint) {
		this.blueprint = _.assignWith("particles", this.blueprint || {}, blueprint);
		const range = this.range;
		const halfRange = (range - 1) / 2;
		for (let i = 0; i < range; i++) {
			for (let j = 0; j < range; j++) {
				const maxAlpha = (1 + ((halfRange * 2) - (Math.abs(halfRange - i) + Math.abs(halfRange - j)))) * 0.1;
				const emConf = getEmitterConfig({
					x: ((this.obj.x + i - halfRange) * scale) + (scale / 2)
					, y: ((this.obj.y + j - halfRange) * scale) + (scale / 2)
				}, this.blueprint, maxAlpha);
				emConf.obj = this.obj;
				this.emitters[`${i}|${j}`] = renderer.buildEmitter(emConf);
			}
		}
		this.setVisible(this.obj.isVisible);
	}

	, update: function () {
	}

	, setVisible: function (visible) {
		let emitters = this.emitters;
		for (let p in emitters) {
			// The new Emitter self-ticks; toggle emission via play()/stop().
			// stop(false) lets existing particles fade naturally.
			if (visible) {
				emitters[p].play();
			} else {
				emitters[p].stop(false);
			}
		}
	}

	, destroy: function () {
		let keys = Object.keys(this.emitters);
		for (let i = 0; i < keys.length; i++) {
			let emitter = this.emitters[keys[i]];
			delete this.emitters[keys[i]];

			renderer.destroyEmitter(emitter);
		}
	}
};

//import effects from "/js/rendering/effects.js";

export default {
	type: "explosion"

	, blueprint: null

	, init: function (blueprint) {
		this.blueprint = {
			new: true
			, blueprint: _.assignWith("particles", {
				emitterVersion: "0.0.0"
				, particlesPerWave: 14
				, colorBehavior: {
					mode: "list"
					, listData: {
						list: [
							{ time: 0, value: "#929398" }
							, { time: 0.33, value: "#fcfcfc" }
							, { time: 0.5, value: "#929398" }
							, { time: 0.66, value: "#3c3f4c" }
							, { time: 1, value: "#505360" }
						]
					}
				}
				, scaleBehavior: {
					mode: "list"
					, xListData: {
						list: [
							{ time: 0, value: 18 }
							, { time: 1, value: 12 }
						]
					}
				}
			}, blueprint.blueprint, {
				spawnChance: 1
				, movementBehavior: {
					mode: "linear"
					, space: "global"
					, xListData: {
						list: [
							{ time: 0, value: 24 }
							, { time: 1, value: 18 }
						]
					}
				}
				, scaleBehavior: {
					mode: "list"
					, xListData: {
						list: [
							{ time: 0, value: 16 }
							, { time: 1, value: 10 }
						]
					}
				}
			})
		};
	}

	, explode: function (blueprint) {
		if (!this.obj.isVisible) {
			return;
		}
		const particles = this.obj.addComponent("particles", this.blueprint);
		particles.emitter.prewarm(0.2);
		particles.emitter.stop(false);
		particles.emitter.disabled = true;
	}
};

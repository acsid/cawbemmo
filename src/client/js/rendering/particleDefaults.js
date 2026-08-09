// pixi-particle-system (v1.2.0) EmitterConfig defaults.
//
// This used to be a static object consumed by the old pixi-particles library,
// which took a `behaviors: [{ type, config }]` array. The new library takes a
// flat EmitterConfig object. It is now a function because the TextureBehavior
// needs a loaded Texture (the particle image), which is injected by particles.js.
//
// Field mapping (old -> new):
//   behaviors[].textureSingle    -> textureBehavior
//   behaviors[].color            -> colorBehavior
//   behaviors[].alpha            -> alphaBehavior
//   behaviors[].scale            -> scaleBehavior
//   behaviors[].moveSpeed        -> movementBehavior
//   behaviors[].rotationStatic   -> rotationBehavior
//   behaviors[].spawnShape torus -> spawnBehavior shape "circle"
//   behaviors[].blendMode        -> set on the ParticleContainer (no behavior)
//   frequency                    -> spawnInterval
//   lifetime { min, max }        -> minParticleLifetime / maxParticleLifetime

// pixi-particle-system (v1.2.0) EmitterConfig defaults.
//
// This used to be a static object consumed by the old pixi-particles library,
// which took a `behaviors: [{ type, config }]` array. The new library takes a
// flat EmitterConfig object.
//
// Field mapping (old -> new):
//   behaviors[].textureSingle    -> textureBehavior (injected by particles.js,
//                                    after the merge, so the Texture object
//                                    never passes through _.assignWith)
//   behaviors[].color            -> colorBehavior
//   behaviors[].alpha            -> alphaBehavior
//   behaviors[].scale            -> scaleBehavior
//   behaviors[].moveSpeed        -> movementBehavior
//   behaviors[].rotationStatic   -> rotationBehavior
//   behaviors[].spawnShape torus -> spawnBehavior shape "circle"
//   behaviors[].blendMode        -> set on the ParticleContainer (no behavior)
//   frequency                    -> spawnInterval
//   lifetime { min, max }        -> minParticleLifetime / maxParticleLifetime
//
// NOTE: emitterVersion must match the library's internal _version, which is
// "0.0.0" (major 0) — NOT the npm package version. A mismatch logs a warning
// and can break the emitter.

export default {
	// Required by pixi-particle-system for version compatibility checks. Must
	// match the library's internal _version (major 0) — NOT the npm version.
	emitterVersion: "0.0.0"

	// 0.035 for 35ms - For a tick rate of 350ms, this will do 10 times per tick.
	, spawnInterval: 0.035

	, minParticleLifetime: 1
	, maxParticleLifetime: 3

	, spawnChance: 1

	, colorBehavior: {
		mode: "list"
		, listData: {
			list: [
				{ time: 0, value: "#fb1010" }
				, { time: 1, value: "#f5b830" }
			]
		}
	}
	, alphaBehavior: {
		mode: "list"
		, listData: {
			list: [
				{ time: 0, value: 0.9 }
				, { time: 1, value: 0.2 }
			]
		}
	}
	, scaleBehavior: {
		mode: "list"
		, xListData: {
			list: [
				{ time: 0, value: 10 }
				, { time: 1, value: 0.3 }
			]
		}
	}
	, movementBehavior: {
		mode: "linear"
		, space: "global"
		, xListData: {
			list: [
				{ time: 0, value: 12 }
				, { time: 1, value: 2 }
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
		, outerRadius: 10
		, innerRadius: 0
	}

	, addAtBack: false

	, maxParticles: 500
	, particlesPerWave: 1
};

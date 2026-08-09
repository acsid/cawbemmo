import renderer from "/js/rendering/renderer.js";

export default {
	type: "moveAnimation"

	, targetX: 0
	, targetY: 0

	, x: 0
	, y: 0

	, ttl: 50
	, endTime: 0

	, particles: null
	, particleBlueprint: null

	, particleExplosionBlueprint: null

	, init: function (blueprint) {
		const particleBlueprint = _.assignWith("particles", {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 2
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#fcfcfc" }
						, { time: 1, value: "#c0c3cf" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.9 }
						, { time: 1, value: 0.1 }
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
			, movementBehavior: {
				mode: "linear"
				, space: "global"
				, xListData: {
					list: [
						{ time: 0, value: 20 }
						, { time: 1, value: 8 }
					]
				}
			}
			, spawnChance: 0.4
		}, this.particleBlueprint);

		this.particles = this.obj.addComponent("particles", { blueprint: particleBlueprint });

		this.endTime = Date.now() + this.ttl;

		let obj = this.obj;
		this.x = obj.x;
		this.y = obj.y;

		if (this.targetX > this.x) {
			this.obj.flipX = false;
		} else if (this.targetX < this.x) {
			this.obj.flipX = true;
		}

		this.obj.setSpritePosition();
	}

	, update: function () {
		const source = this.obj;
		const target = this.target;
		const ticksLeft = Math.floor((this.endTime - Date.now()) / 16);
		if (ticksLeft <= 0) {
			source.x = this.targetX;
			source.y = this.targetY;
			source.setSpritePosition();

			this.destroyed = true;
			this.particles.destroyed = true;

			//Sometimes we just move to a point without exploding
			if (target) {
				target.addComponent("explosion", {
					new: true
					, blueprint: this.particleExplosionBlueprint || {}
				}).explode();
			}
		} else {
			this.x += (this.targetX - this.x) / ticksLeft;
			this.y += (this.targetY - this.y) / ticksLeft;

			source.x = (Math.floor((this.x * 32) / 8) * 8) / 32;
			source.y = (Math.floor((this.y * 32) / 8) * 8) / 32;
			source.setSpritePosition();
		}

		renderer.updateSprites();
	}
};

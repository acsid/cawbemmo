let cpnSmokePatch = {
	type: "smokePatch"

	, contents: []
	, ttl: 0

	, applyDamage: function (target, damage) {
		target.stats.takeDamage({
			damage
			, threatMult: 1
			, source: this.caster
			, target: target
			, spellName: "smokeBomb"
			, noEvents: this.noEvents
		});
	}

	, collisionEnter: function (o) {
		if (!o.aggro) {
			return;
		}
		if (!this.caster.aggro.canAttack(o)) {
			return;
		}
		this.contents.push(o);
	}

	, collisionExit: function (o) {
		let contents = this.contents;
		let cLen = contents.length;
		for (let i = 0; i < cLen; i++) {
			if (contents[i] === o) {
				contents.splice(i, 1);
				return;
			}
		}
	}

	, update: function () {
		this.ttl--;
		if (this.ttl <= 0) {
			this.obj.destroyed = true;
		}

		let contents = this.contents;
		for (let i = 0; i < contents.length; i++) {
			let c = contents[i];

			if (c) {
				let damage = this.getDamage(c);
				this.applyDamage(c, damage);
			}
		}
	}
};

const particles = {
	emitterVersion: "0.0.0"
	, minParticleLifetime: 1
	, maxParticleLifetime: 3
	, colorBehavior: {
		mode: "list"
		, listData: {
			list: [
				{ time: 0, value: "#80f643" }
				, { time: 0.33, value: "#fcfcfc" }
				, { time: 0.5, value: "#80f643" }
				, { time: 0.66, value: "#c0c3cf" }
				, { time: 1, value: "#2b4b3e" }
			]
		}
	}
	, alphaBehavior: {
		mode: "list"
		, listData: {
			list: [
				{ time: 0, value: 0.2 }
				, { time: 1, value: 0 }
			]
		}
	}
	, scaleBehavior: {
		mode: "list"
		, xListData: {
			list: [
				{ time: 0, value: 30 }
				, { time: 1, value: 14 }
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
	, spawnChance: 0.03
};

module.exports = {
	type: "smokeBomb"

	, cdMax: 20
	, manaCost: 0

	, damage: 1
	, duration: 10
	, isAttack: true

	, radius: 1
	, targetGround: true
	, targetPlayerPos: true

	, particles

	, update: function () {
		const selfCast = this.selfCast;
		if (!selfCast) {
			return;
		}
		if (selfCast !== true && Math.random() >= selfCast) {
			return;
		}
		if (this.canCast()) {
			this.cd = this.cdMax;
			this.cast();
		}
	}

	, cast: function (action) {
		let obj = this.obj;

		let radius = this.radius;

		let repeat = this.repeat || 1;

		const particleEvent = {
			source: this
			, particleConfig: _.assign({}, this.particles)
		};
		obj.fireEvent("beforeSpawnParticles", particleEvent);

		for (let r = 0; r < repeat; r++) {
			let x = obj.x;
			let y = obj.y;

			if (this.randomPos) {
				let range = this.range;
				while ((x === obj.x) && (y === obj.y)) {
					x = obj.x + Math.floor(Math.random() * range * 2) - range;
					y = obj.y + Math.floor(Math.random() * range * 2) - range;
				}
			}

			let objects = this.obj.instance.objects;
			let patches = [];

			const physics = this.obj.instance.physics;
			for (let i = x - radius; i <= x + radius; i++) {
				let dx = Math.abs(x - i);
				for (let j = y - radius; j <= y + radius; j++) {
					let distance = dx + Math.abs(j - y);

					if (distance > radius + 1) {
						continue;
					}

					if (!physics.hasLos(x, y, i, j)) {
						continue;
					}

					const patch = objects.buildObjects([{
						x: i
						, y: j
						, properties: {
							cpnSmokePatch: cpnSmokePatch
							, cpnParticles: {
								simplify: function () {
									return {
										type: "particles"
										, blueprint: this.blueprint
									};
								}
								, blueprint: particleEvent.particleConfig
							}
						}
						, extraProperties: {
							smokePatch: {
								caster: obj
								, statType: this.statType
								, getDamage: this.getDamage.bind(this)
								, ttl: this.duration
								, noEvents: this.noEvents
							}
						}
					}]);
					patches.push(patch);
				}
			}

			if (!this.castEvent) {
				this.sendBump({
					x: x
					, y: y - 1
				});
			}
		}
		return true;
	}
};

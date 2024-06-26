const getTargetPos = (physics, obj, m, pushback) => {
	let targetPos = {
		x: m.x
		, y: m.y
	};

	let dx = m.x - obj.x;
	let dy = m.y - obj.y;

	while ((dx === 0) && (dy === 0)) {
		dx = Math.floor(Math.random() * 2) - 1;
		dy = Math.floor(Math.random() * 2) - 1;
	}

	dx = Math.floor(dx / Math.abs(dx));
	dy = Math.floor(dy / Math.abs(dy));
	for (let l = 0; l < pushback; l++) {
		if (physics.isTileBlocking(targetPos.x + dx, targetPos.y + dy)) {
			if (physics.isTileBlocking(targetPos.x + dx, targetPos.y)) {
				if (physics.isTileBlocking(targetPos.x, targetPos.y + dy)) {
					break;
				} else {
					dx = 0;
					targetPos.y += dy;
				}
			} else {
				dy = 0;
				targetPos.x += dx;
			}
		} else {
			targetPos.x += dx;
			targetPos.y += dy;
		}
	}

	return targetPos;
};

module.exports = {
	type: "fireblast"

	, targetGround: true
	, targetPlayerPos: true

	, radius: 2
	, pushback: 4

	, damage: 1

	, cast: function (action) {
		const { obj, targetPlayerPos } = this;

		let { x, y, instance: { physics, syncer } } = obj;

		if (!targetPlayerPos) {
			x = action.target.x;
			y = action.target.y;
		}

		let radius = this.radius;

		const particleEvent = {
			source: this
			, particleConfig: _.assign({}, this.particles)
		};
		obj.fireEvent("beforeSpawnParticles", particleEvent);

		for (let i = x - radius; i <= x + radius; i++) {
			for (let j = y - radius; j <= y + radius; j++) {
				if (!physics.hasLos(~~x, ~~y, ~~i, ~~j)) {
					continue;
				}

				let effect = {
					x: i
					, y: j
					, components: [{
						type: "particles"
						, ttl: 10
						, blueprint: particleEvent.particleConfig
					}]
				};

				if ((i !== x) || (j !== y)) {
					syncer.queue("onGetObject", effect, -1);
				}

				let mobs = physics.getCell(i, j);
				let mLen = mobs.length;
				for (let k = 0; k < mLen; k++) {
					let m = mobs[k];

					//Maybe we killed something?
					if (!m) {
						mLen--;
						continue;
					} else if (!m.aggro || !m.effects) {
						continue;
					} else if (!obj.aggro.canAttack(m)) {
						continue;
					}

					const targetPos = getTargetPos(physics, obj, m, this.pushback);

					let distance = Math.max(Math.abs(m.x - targetPos.x), Math.abs(m.y - targetPos.y));
					let ttl = distance * 125;

					m.clearQueue();

					let damage = this.getDamage(m);
					m.stats.takeDamage({
						damage
						, threatMult: 1
						, source: this.obj
						, target: m
						, spellName: "fireblast"
						, noEvents: this.noEvents
					});

					if (m.destroyed) {
						continue;
					}

					const eventMsg = {
						success: true
						, targetPos
					};
					m.fireEvent("beforePositionChange", eventMsg);

					if (!eventMsg.success) {
						continue;
					}

					const targetEffect = m.effects.addEffect({
						type: "stunned"
						, silent: true
					});

					//If targetEffect is undefined, it means that the target has become resistant
					if (!targetEffect) {
						continue;
					}

					this.sendAnimation({
						id: m.id
						, components: [{
							type: "moveAnimation"
							, targetX: targetPos.x
							, targetY: targetPos.y
							, ttl: ttl
						}]
					});

					this.queueCallback(
						this.endEffect.bind(this, m, targetPos, targetEffect),
						ttl,
						null,
						m
					);

					//To be called when the object is destroyed
					this.obj.spellbook.registerDestroyCallback(this.destroyEffectOnTarget.bind(this, m, targetEffect));
				}
			}
		}

		this.sendBump({
			x: x
			, y: y - 1
		});

		return true;
	}

	, endEffect: function (target, targetPos, targetEffect) {
		const { instance: { physics }, syncer, effects } = target;
		const { x: xNew, y: yNew } = targetPos;

		const xOld = target.x;
		const yOld = target.y;

		effects.removeEffect(targetEffect.id);

		target.x = xNew;
		target.y = yNew;

		if (physics.addObject(target, xNew, yNew, xOld, yOld)) {
			physics.removeObject(target, xOld, yOld, xNew, yNew);
		} else {
			target.x = xOld;
			target.y = yOld;

			return false;
		}

		//We can't use xNew and yNew because addObject could have changed the position (like entering a building interior with stairs)
		const { x: xFinal, y: yFinal } = target;

		syncer.o.x = xFinal;
		syncer.o.y = yFinal;

		const moveEvent = {
			oldPos: {
				x: xOld
				, y: yOld
			}
			, newPos: {
				x: xFinal
				, y: yFinal
			}
			, source: this.obj
			, target
			, spellName: "fireblast"
			, spell: this
		};
		target.fireEvent("afterPositionChange", moveEvent);
	}

	, destroyEffectOnTarget: function (target, targetEffect) {
		if (targetEffect) {
			target.effects.removeEffect(targetEffect.id);
		}
	}
};

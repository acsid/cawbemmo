define([
	'world/mobBuilder'
], function(
	mobBuilder
) {
	return {
		type: 'summonConsumableFollower',

		targetGround: true,

		cdMax: 30,
		manaCost: 0,

		range: 8,

		needLos: true,

		minions: [],
		walkCd: 0,
		walkCdMax: 5,

		cast: function(action) {
			var obj = this.obj;
			var target = {
				x: 0,
				y: 0
			};

			var angle = Math.random() * Math.PI * 2;
			target.x = obj.x + ~~(Math.cos(angle) * this.range);
			target.y = obj.y + ~~(Math.sin(angle) * this.range);
			target = obj.instance.physics.getClosestPos(target.x, target.y, target.x, target.y);
			if (!target)
				return false;

			obj.syncer.set(false, 'chatter', 'msg', '*tummy grumbles*');

			//Spawn a mob
			var mob = obj.instance.spawners.spawn({
				amountLeft: 1,
				blueprint: {
					x: target.x,
					y: target.y,
					cell: 60,
					sheetName: 'mobs',
					name: 'Slimy Offspring',
					properties: {
						
					},
					extraProperties: {
						
					}
				}
			});

			mobBuilder.build(mob, {
				level: obj.stats.values.level,
				faction: obj.aggro.faction,
				walkDistance: 2,
				regular: {
					drops: 0,
					hpMult: 0.5
				}
			}, false, 'regular');

			mob.aggro.getHighest = this.getFollowerAggro.bind(this, mob);
			mob.aggro.list.push({
				obj: this.obj
			});
			mob.mob.realUpdate = mob.mob.update.bind(mob.mob);

			this.minions.push(mob);

			return true;
		},

		getFollowerAggro: function(mob) {
			return this.obj;
		},

		update: function() {
			var obj = this.obj;
			var x = obj.x;
			var y = obj.y;

			this.walkCd--;
			if (this.walkCd < 0)
				this.walkCd = this.walkCdMax;

			var minions = this.minions;
			var mLen = minions.length;
			for (var i = 0; i < mLen; i++) {
				var m = minions[i];
				if (m.destroyed) {
					minions.splice(i, 1);
					i--;
					mLen--;
				}
				else {
					if ((Math.abs(x - m.x) <= 1) && (Math.abs(y - m.y) <= 1)) {
						m.destroyed = true;
						this.obj.stats.getHp({
							amount: obj.stats.values.hpMax / 10
						}, obj);

						obj.instance.syncer.queue('onGetObject', {
							x: m.x,
							y: m.y,
							components: [{
								type: 'attackAnimation',
								row: 1,
								col: 4
							}]
						});
					}
					else {
						m.mob.update = (this.walkCd == 0) ? m.mob.realUpdate: null;
					}
				}
			}
		},

		onAfterSimplify: function(simple) {
			delete simple.minions;
		}
	};
});
let mobBuilder = require('../../../world/mobBuilder');

module.exports = {
	type: 'summonSkeleton',

	targetGround: true,

	cdMax: 7,
	manaCost: 0,

	range: 9,

	needLos: true,
	killMinionsBeforeSummon: true,
	killMinionsOnDeath: true,
	minionsDieOnAggroClear: false,

	maxSummon: 1,

	minions: [],

	name: 'Skeletal Minion',

	cell: 0,
	sheetName: null,
	positions: null,

	basicSpell: 'melee',

	damagePercent: 20,
	hpPercent: 40,

	cast: function (action) {
		if (this.killMinionsBeforeSummon)
			this.killMinions();

		if (this.minions.length >= this.maxSummon)
			return false;

		let obj = this.obj;
		let target = action.target;

		const sheetName = this.sheetName || `${this.folderName}/images/mobs.png`;

		const positions = this.positions || [[target.x, target.y]];
		const currentTarget = obj.aggro.getHighest();

		positions.forEach(pos => {
			const [ x, y ] = pos;

			let template = {};
			if (this.summonTemplates)
				template = this.summonTemplates[~~(Math.random() * this.summonTemplates.length)];

			const blueprint = {
				x,
				y,
				cell: template.cell || this.cell,
				sheetName,
				name: template.name || this.name,
				properties: {
					cpnFollower: {
						maxDistance: 3
					}
				},
				extraProperties: {
					follower: {
						master: obj
					}
				}
			};

			this.obj.fireEvent('beforeSummonMinion', blueprint);

			//Spawn a mob
			let mob = obj.instance.spawners.spawn({
				amountLeft: 1,
				blueprint: blueprint
			});

			mobBuilder.build(mob, {
				level: obj.stats.values.level,
				faction: obj.aggro.faction,
				walkDistance: 2,
				regular: {
					drops: 0,
					hpMult: (template.hpPercent || this.hpPercent) / 100,
					dmgMult: (template.damagePercent || this.damagePercent) / 100
				},
				spells: [{
					type: template.basicSpell || this.basicSpell,
					damage: 1,
					statMult: 1,
					animation: 'melee'
				}]
			}, 'regular');
			mob.stats.values.hpMax = obj.stats.values.hpMax * (this.hpPercent / 100);
			mob.stats.values.hp = mob.stats.values.hpMax;
			mob.stats.values.regenHp = mob.stats.values.hpMax / 100;

			let spell = mob.spellbook.spells[0];
			spell.statType = ['str', 'int'];
			mob.stats.values.str = obj.stats.values.str || 1;
			mob.stats.values.int = obj.stats.values.int || 1;
			spell.threatMult *= 8;

			mob.follower.noNeedMaster = !this.killMinionsOnDeath;
			if (this.killMinionsOnDeath)
				mob.follower.bindEvents();
			else {
				mob.aggro.dieOnAggroClear = this.minionsDieOnAggroClear;
				mob.removeComponent('follower');

				if (currentTarget)
					mob.aggro.tryEngage(currentTarget);
			}

			this.minions.push(mob);
		});

		this.sendBump({
			x: obj.x,
			y: obj.y - 1
		});

		if (this.animation) {
			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: [{
					type: 'animation',
					template: this.animation
				}]
			}, -1);
		}

		return true;
	},

	update: function () {
		let minions = this.minions;
		let mLen = minions.length;
		for (let i = 0; i < mLen; i++) {
			let m = minions[i];
			if (m.destroyed) {
				minions.splice(i, 1);
				i--;
				mLen--;
			}
		}
	},

	onAfterSimplify: function (simple) {
		delete simple.minions;
	},

	killMinions: function (minion) {
		this.minions.forEach(m => {
			if ((m) && (!m.destroyed)) {
				m.destroyed = true;
				this.minions = [];

				let animations = require('../../../config/animations');

				let deathAnimation = _.getDeepProperty(animations, ['mobs', m.sheetName, m.cell, 'death']);
				if (deathAnimation) {
					this.obj.instance.syncer.queue('onGetObject', {
						x: m.x,
						y: m.y,
						components: [deathAnimation]
					}, -1);
				} else {
					this.obj.instance.syncer.queue('onGetObject', {
						x: m.x,
						y: m.y,
						components: [{
							type: 'attackAnimation',
							row: 0,
							col: 4
						}]
					}, -1);
				}
			}
		});
	},

	unlearn: function () {
		this.killMinions();
	},

	events: {
		onAfterDeath: function (source) {
			if (this.killMinionsOnDeath)
				this.killMinions();
		}
	}
};

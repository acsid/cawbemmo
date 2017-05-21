define([

], function(

) {
	return {
		name: 'Necormancer Class',

		extraScripts: [
			'spells/spellHarvestLife',
			'spells/spellSummonSkeleton',
			'spells/spellBloodBarrier'
		],

		init: function() {
			this.events.on('onBeforeGetClasses', this.beforeGetClasses.bind(this));
			this.events.on('onBeforeGetSkins', this.beforeGetSkins.bind(this));
			this.events.on('onBeforeGetItemTypes', this.beforeGetItemTypes.bind(this));
			this.events.on('onBeforeGetSpellsInfo', this.beforeGetSpellsInfo.bind(this));
			this.events.on('onBeforeGetSpellsConfig', this.beforeGetSpellsConfig.bind(this));
			this.events.on('onBeforeGetSpellTemplate', this.beforeGetSpellTemplate.bind(this));
			this.events.on('onBeforeGetResourceList', this.beforeGetResourceList.bind(this));
		},

		beforeGetResourceList: function(list) {
			list.push(`${this.folderName}/images/inGameSprite.png`);
			list.push(`${this.folderName}/images/abilityIcons.png`);
		},

		beforeGetClasses: function(classes) {
			classes.spells.necromancer = ['summon skeleton', 'blood barrier'];
			classes.stats.necromancer = {
				values: {
					hpMax: 95
				},
				vitScale: 10,
				spritesheet: `${this.folderName}/images/inGameSprite.png`
			};
			classes.weapons.necromancer = 'Sickle';
		},

		beforeGetSpellTemplate: function(spell) {
			if (spell.type == 'HarvestLife')
				spell.template = require(`${this.relativeFolderName}/spells/spellHarvestLife`);
			else if (spell.type == 'SummonSkeleton')
				spell.template = require(`${this.relativeFolderName}/spells/spellSummonSkeleton`);
			else if (spell.type == 'BloodBarrier')
				spell.template = require(`${this.relativeFolderName}/spells/spellBloodBarrier`);
		},

		beforeGetSkins: function(skins) {
			skins['necromancer 1'] = {
				name: 'Necromancer 1',
				sprite: [0, 0],
				class: 'necromancer',
				spritesheet: `${this.folderName}/images/classSprite.png`,
				default: true
			};
		},

		beforeGetItemTypes: function(types) {
			['Sickle', 'Jade Sickle', 'Golden Sickle', 'Bone Sickle'].forEach(function(s, i) {
				types.twoHanded[s] = {
					sprite: [i, 0],
					spellName: 'harvest life',
					spritesheet: `${this.folderName}/images/items.png`
				};
			}, this);
		},

		beforeGetSpellsConfig: function(spells) {
			spells['harvest life'] = {
				statType: ['str', 'int'],
				statMult: 0.1,
				element: 'arcane',
				auto: true,
				cdMax: 7,
				manaCost: 0,
				range: 9,
				random: {
					damage: [2, 4]
				}
			};

			spells['summon skeleton'] = {
				statType: ['str', 'int'],
				statMult: 0.1,
				element: 'arcane',
				auto: true,
				cdMax: 7,
				manaCost: 0,
				range: 9,
				random: {
					damage: [2, 4]
				}
			};

			spells['blood barrier'] = {
				statType: ['str', 'int'],
				statMult: 0.1,
				element: 'arcane',
				auto: true,
				cdMax: 7,
				manaCost: 0,
				range: 9,
				random: {
					damage: [2, 4]
				}
			};
		},

		beforeGetSpellsInfo: function(spells) {
			spells.push({
				name: 'Harvest Life',
				description: 'Absorbs the life-force of your enemies.',
				type: 'harvestLife',
				icon: [0, 0],
				spritesheet: `${this.folderName}/images/abilityIcons.png`,
				particles: {
					color: {
						start: ['ff4252', 'b34b3a'],
						end: ['b34b3a', 'ff4252']
					},
					scale: {
						start: {
							min: 2,
							max: 14
						},
						end: {
							min: 0,
							max: 8
						}
					},
					lifetime: {
						min: 1,
						max: 3
					},
					alpha: {
						start: 0.7,
						end: 0
					},
					randomScale: true,
					randomColor: true,
					chance: 0.6
				}
			});

			spells.push({
				name: 'Summon Skeleton',
				description: 'Absorbs the life-force of your enemies.',
				type: 'summonSkeleton',
				icon: [1, 0],
				spritesheet: `${this.folderName}/images/abilityIcons.png`,
				particles: {
					color: {
						start: ['ff4252', 'b34b3a'],
						end: ['b34b3a', 'ff4252']
					},
					scale: {
						start: {
							min: 2,
							max: 14
						},
						end: {
							min: 0,
							max: 8
						}
					},
					lifetime: {
						min: 1,
						max: 3
					},
					alpha: {
						start: 0.7,
						end: 0
					},
					randomScale: true,
					randomColor: true,
					chance: 0.6
				}
			});

			spells.push({
				name: 'Blood Barrier',
				description: 'Absorbs the life-force of your enemies.',
				type: 'bloodBarrier',
				icon: [2, 0],
				spritesheet: `${this.folderName}/images/abilityIcons.png`,
				particles: {
					color: {
						start: ['ff4252', 'b34b3a'],
						end: ['b34b3a', 'ff4252']
					},
					scale: {
						start: {
							min: 2,
							max: 14
						},
						end: {
							min: 0,
							max: 8
						}
					},
					lifetime: {
						min: 1,
						max: 3
					},
					alpha: {
						start: 0.7,
						end: 0
					},
					randomScale: true,
					randomColor: true,
					chance: 0.6
				}
			});
		}
	};
});
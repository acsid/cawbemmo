module.exports = {
	name: "Le Snack BAR"
	, level: [2, 3]
	, resources: {
		champignon: {
			type: "herb"
			, max: 4
		}
		, weed: {
			type: "herb"
			, max: 10
			//, cdMax: 17100
		}
	}
	, objects: {}
	, mobs: {
		default: {
			level: 2
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 40
					, rolls: 1
				}
			}
		}
		, mouette: {
			level: 2
			, regular: {
				drops: {
					chance: 55
					, rolls: 1
				}
			}
			, rare: {
				name: "Ronald"
			}
			, questItem: {
				name: "Poulet louche"
				, sprite: [0, 0]
			}
		}
		, Sbire: {
			level: 3
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 55
					, rolls: 1
				}
			}
			, questItem: {
				name: "Cagoule"
				, sprite: [0, 0]
			}
		}
		, raymond: {
			level: 10
			, faction: "vendeurs"
			, walkDistance: 0
			, attackable: false
			, rare: {
				count: 0
			}
			, properties: {
				cpnTrade: {
					items: {
						max: 0
					}
					, forceItems: [{
						name: "hot-dog"
						, type: "consumable"
						, sprite: [1, 6]
						, description: "Donne 75 HP"
						, spritesheet: "images/consumables.png"
						, worth: 8
						, noSalvage: true
						, noAugment: true
						, uses: 1
						, cdMax: 85
						, effects: [{
							type: "gainStat"
							, rolls: {
								stat: "hp"
								, amount: 75
							}
						}]
						, infinite: true
					}, {
						name: "Hamburger"
						, type: "consumable"
						, sprite: [0, 6]
						, description: "Donne 100 HP"
						, spritesheet: "images/consumables.png"
						, worth: 12
						, noSalvage: true
						, noAugment: true
						, uses: 1
						, cdMax: 85
						, effects: [{
							type: "gainStat"
							, rolls: {
								stat: "hp"
								, amount: 100
							}
						}]
						, infinite: true
					}, {
						name: "Pince de crabe cuite"
						, type: "consumable"
						, sprite: [0, 3]
						, description: "Donne 200 HP"
						, spritesheet: "images/questItems.png"
						, worth: 18
						, noSalvage: true
						, noAugment: true
						, uses: 1
						, cdMax: 85
						, effects: [{
							type: "gainStat"
							, rolls: {
								stat: "hp"
								, amount: 200
							}
						}]
						, infinite: true
					}]
					, level: {
						min: 1
						, max: 10
					}
					, markup: {
						buy: 0.50
						, sell: 2.5
					}
				}
			}
		}
	}
};

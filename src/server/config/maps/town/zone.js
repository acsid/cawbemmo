module.exports = {
	name: "ville"
	, level: [1, 10]
	, resources: {
		champignon: {
			type: "herb"
			, max: 4
		}
		, weed: {
			type: "herb"
			, max: 5
			, cdMax: 17100
		}
	}
	, objects: {
		shophermit: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: "dialogue"
							, method: "talk"
							, args: [{
								targetName: "hermit"
							}]
						}
						, exit: {
							cpn: "dialogue"
							, method: "stopTalk"
						}
					}
				}
			}
		}
		, mrboner: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: "dialogue"
							, method: "talk"
							, args: [{
								targetName: "binary"
							}]
						}
						, exit: {
							cpn: "dialogue"
							, method: "stopTalk"
						}
					}
				}
			}
		}
		, "sun carp school": {
			max: 9
			, type: "fish"
			, quantity: [6, 12]
		}
		, table: {
			components: {
				cpnWorkbench: {
					type: "table"
				}
			}
		}
		, fireplace: {
			components: {
				cpnWorkbench: {
					type: "cooking"
				}
			}
		}
		, four: {
			components: {
				cpnWorkbench: {
					type: "cooking"
				}
			}
		}
	}
	, mobs: {
		default: {
			regular: {
				drops: {
					chance: 40
					, rolls: 1
				}
			}
		}
		, mouette: {
			level: 1
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
		, sbire: {
			level: 2
			, regular: {
				drops: {
					chance: 45
					, rolls: 1
				}
			}
			, rare: {
				name: "Un fou"
			}
			, questItem: {
				name: "Cagoule"
				, sprite: [0, 2]
			}
		}
		, "truite à panache": {
			level: 10
			, regular: {
				drops: {
					rolls: 1
					, noRandom: true
					, alsoRandom: true
					, blueprints: [{
						chance: 3
						, name: "Eagle Feather"
						, material: true
						, sprite: [0, 0]
						, spritesheet: "images/questItems.png"
					}]
				}
			}
			, rare: {
				name: "Yollande"
				, drops: {
					rolls: 1
					, noRandom: true
					, alsoRandom: true
					, blueprints: [{
						chance: 80
						, name: "Eagle Feather"
						, material: true
						, sprite: [0, 0]
						, spritesheet: "images/questItems.png"
					}]
				}
			}
		}
		, binary: {
			level: 10
			, walkDistance: 0
			, attackable: false
			, rare: {
				count: 0
			}
			, properties: {

			}
		}
		, peter: {
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
						min: 3
						, max: 10
					}
					, forceItems: [{
						name: "Canne à pêche"
						, type: "Fishing Rod"
						, slot: "tool"
						, quality: 0
						, worth: 5
						, sprite: [11, 0]
						, infinite: true
						, noSalvage: true
					}, {
						name: "Skewering Stick"
						, material: true
						, sprite: [11, 7]
						, worth: 2
						, quality: 0
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
		}, "mr giroux": {
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
						min: 3
						, max: 10
					}
					, forceItems: [{
						name: "Bouteille vide"
						, material: true
						, sprite: [0, 9]
						, worth: 3
						, quality: 0
						, infinite: true
					}
					,{
						name: "pain"
						, material: true
						, sprite: [1, 5]
						, worth: 5
						, quality: 0
						, infinite: true
					}
					]
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
		}, gislain: {
			level: 10
			, walkDistance: 0
			, faction: "vendeurs"
			, attackable: false
			, rare: {
				count: 0
			}
			, properties: {
				cpnTrade: {
					items: {
						min: 3
						, max: 10
					}
					, forceItems: [{
						name: "Canne à pêche à spring"
						, type: "Fishing Rod"
						, slot: "tool"
						, quality: 1
						, worth: 500
						, sprite: [11, 1]
						, infinite: true
						, noSalvage: true
					}, {
						name: "Skewering Stick"
						, material: true
						, sprite: [11, 7]
						, worth: 2
						, quality: 0
						, infinite: true
					}, {
						name: "Papier a roulé"
						, material: true
						, sprite: [1, 3]
						, worth: 50
						, quantity: 2
						, quality: 0
						, infinite: true
					}]
					, level: {
						min: 8
						, max: 14
					}
					, markup: {
						buy: 0.52
						, sell: 2.52
					}
				}
			}
		}
		, police: {
			level: 20
			, walkDistance: 50
			, walkSpeed: 1
			, regular: {
				hpMult: 3
				, dmgMult: 1

				, drops: {
					chance: 100
					, rolls: 6
					, magicFind: [6000]
				}
			}
		}
		, ponpon: {
			attackable: false
			, level: 10
			, rare: {
				count: 0
			}
		}
	}
};

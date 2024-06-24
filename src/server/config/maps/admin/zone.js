module.exports = {
	name: "admin"
	, level: [1, 20]
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
		mrBoner: {
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
		, fireplace: {
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
		, "crazed seagull": {
			level: 1
			, attackable: false
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
				name: "Gull Feather"
				, sprite: [0, 0]
			}
		}

		, "grosse vidange": {
			level: 5
			, cron: "0 * * * *"

			, regular: {
				hpMult: 3
				, dmgMult: 3

				, drops: {
					chance: 100
					, rolls: 2
					, magicFind: [1300]
				}
			}
			, rare: {
				chance: 100
			}
		}
		, kazou: {
			level: 7
			, rare: {
				name: "Le roi des homard"
			}
			, regular: {
				drops: {
					rolls: 6
					, noRandom: true
					, alsoRandom: true
					, blueprints: [{
						chance: 35
						, name: "Lettre d'admiratrice"
						, quality: 2
						, quest: true
						, sprite: [0, 4]
					}]
				}
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
		, teleport: {
			level: 10
			, walkDistance: 0
			, attackable: false
			, rare: {
				count: 0
			}
			, properties: {

			}
		}
		, quest: {
			level: 10
			, walkDistance: 0
			, attackable: false
			, rare: {
				count: 0
			}
			, properties: {

			}
		}
		, gislain: {
			level: 10
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
						name: "Canne a pêche a spring"
						, type: "Fishing Rod"
						, slot: "tool"
						, quality: 0
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
		, rodriguez: {
			attackable: false
			, level: 10
			, rare: {
				count: 0
			}
		}
		, pig: {
			attackable: false
			, level: 3
			, rare: {
				count: 0
			}
		}
		, goat: {
			attackable: false
			, level: 3
			, rare: {
				count: 0
			}
		}
		, cow: {
			attackable: false
			, level: 3
			, rare: {
				count: 0
			}
		}
		, sundfehr: {
			level: 9
			, walkDistance: 0

			, cron: "0 */2 * * *"

			, regular: {
				hpMult: 10
				, dmgMult: 1

				, drops: {
					chance: 100
					, rolls: 3
					, magicFind: [2000]
				}
			}

			, rare: {
				chance: 0
			}

			, spells: [{
				type: "warnBlast"
				, range: 8
				, delay: 9
				, damage: 0.8
				, statMult: 1
				, cdMax: 7
				, targetRandom: true
				, particles: {
					color: {
						start: ["c0c3cf", "929398"]
						, end: ["929398", "c0c3cf"]
					}
					, spawnType: "circle"
					, spawnCircle: {
						x: 0
						, y: 0
						, r: 12
					}
					, randomColor: true
					, chance: 0.03
				}
			}, {
				type: "projectile"
				, damage: 0.4
				, statMult: 1
				, cdMax: 5
				, targetRandom: true
				, row: 2
				, col: 4
			}]

			, components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: "particles"
							, blueprint: {
								color: {
									start: ["fc66f7", "802343"]
									, end: ["393268", "de43ae"]
								}
								, scale: {
									start: {
										min: 10
										, max: 18
									}
									, end: {
										min: 4
										, max: 8
									}
								}
								, speed: {
									start: {
										min: 6
										, max: 12
									}
									, end: {
										min: 2
										, max: 4
									}
								}
								, lifetime: {
									min: 5
									, max: 12
								}
								, alpha: {
									start: 0.25
									, end: 0
								}
								, randomScale: true
								, randomSpeed: true
								, chance: 0.06
								, randomColor: true
								, spawnType: "rect"
								, blendMode: "add"
								, spawnRect: {
									x: -24
									, y: -24
									, w: 48
									, h: 48
								}
							}
						};
					}
				}
			}
		}
	}
};

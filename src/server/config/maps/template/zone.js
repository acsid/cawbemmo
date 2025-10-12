module.exports = {
	name: "Bois"
	, level: [13, 16]
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
			level: 13
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 40
					, rolls: 1
				}
			}
		}
		, "renard-garous": {
			level: 13
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 55
					, rolls: 1
				}
			}
			, questItem: {
				name: "Cd de boys band"
				, sprite: [0, 0]
			}
		}
		, "papillion": {
			level: 14
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 55
					, rolls: 1
				}
			}
			, questItem: {
				name: "papillion mort"
				, sprite: [0, 0]
			}
		}
		, wezo: {
			level: 15
			, faction: "hostile"
			, rare: {
				name: "Boss des wézo"
				,hpMult: 3
				, dmgMult: 3

				, drops: {
					chance: 100
					, rolls: 2
					, magicFind: [1300]
				}
			}
			, regular: {
				drops: {
					rolls: 6
					, noRandom: true
					, alsoRandom: true
					, blueprints: [{
						chance: 35
						, name: "Lettre d'admiratrice"
						, quality: 5
						, quest: true
						, sprite: [0, 4]
					}]
				}
			}
		}
		, Steeeveess: {
			level: 16
			, faction: "hostile"
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
				name: "Keveune"
				, faction: "hostile"
				, hpMult: 3
				, dmgMult: 3
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

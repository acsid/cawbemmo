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
		, papillion: {
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
				, hpMult: 3
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
					emitterVersion: "0.0.0"
					, colorBehavior: {
						mode: "random"
						, listData: {
							list: [
								{ time: 0, value: "#c0c3cf" }
								, { time: 0, value: "#929398" }
							]
						}
					}
					, spawnBehavior: {
						shape: "circle"
						, outerRadius: 12
					}
					, spawnChance: 0.03
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
								emitterVersion: "0.0.0"
								, minParticleLifetime: 5
								, maxParticleLifetime: 12
								, colorBehavior: {
									mode: "random"
									, listData: {
										list: [
											{ time: 0, value: "#fc66f7" }
											, { time: 0, value: "#393268" }
										]
									}
								}
								, alphaBehavior: {
									mode: "list"
									, listData: {
										list: [
											{ time: 0, value: 0.25 }
											, { time: 1, value: 0 }
										]
									}
								}
								, scaleBehavior: {
									mode: "random"
									, xListData: {
										list: [
											{ time: 0, value: 10 }
											, { time: 0, value: 18 }
										]
									}
								}
								, movementBehavior: {
									mode: "linear"
									, space: "global"
									, xListData: {
										list: [
											{ time: 0, value: 6 }
											, { time: 1, value: 2 }
										]
									}
								}
								, spawnBehavior: {
									shape: "rectangle"
									, width: 48
									, height: 48
								}
								, spawnChance: 0.06
							}
						};
					}
				}
			}
		}
	}
};

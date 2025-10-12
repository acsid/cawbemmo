module.exports = {
	name: "repaire top secret"
	, level: [9, 10]
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
			level: 10
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 40
					, rolls: 1
				}
			}
		}
		, "vidanges": {
			level: 10
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 55
					, rolls: 1
				}
			}
		}
		, "police corompue": {
			level: 10
			, faction: "hostile"
			, regular: {
				drops: {
					chance: 55
					, rolls: 1
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
						, name: "carte postale de st-jérome"
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
						, name: "carte postale de Laval"
						, material: true
						, sprite: [0, 0]
						, spritesheet: "images/questItems.png"
					}]
				}
			}
		}, "MR. P": {
			level: 10
			, spawnCd: 1714

			, regular: {
				hpMult: 45
				, dmgMult: 2

				, drops: {
					chance: 100
					, rolls: 5
					, noRandom: true
					, alsoRandom: true
					, magicFind: [2000, 200]
					, blueprints: [{
						chance: 100
						, name: "Recette de binnes"
						, quality: 0
						, quest: true
						, sprite: [1, 0]
					}]
				}
			}
			, rare: {
				count: 0
			}

			, mobile: false
			, spells: [{
				type: "projectile"
				, particles: {
					scale: {
						start: {
							min: 6
							, max: 18
						}
						, end: {
							min: 2
							, max: 8
						}
					}
					, color: {
						start: ["fc66f7", "a24eff"]
						, end: ["393268", "933159"]
					}
					, chance: 0.65
					, randomScale: true
					, randomColor: true
				}
			}, {
				type: "smokeBomb"
				, radius: 1
				, repeat: 4
				, duration: 14
				, randomPos: true
				, range: 6
				, selfCast: 0.25
				, statMult: 1
				, damage: 0.05
				, element: "arcane"
				, cdMax: 8
				, particles: {
					scale: {
						start: {
							min: 6
							, max: 18
						}
						, end: {
							min: 4
							, max: 10
						}
					}
					, opacity: {
						start: 0.01
						, end: 0
					}
					, lifetime: {
						min: 1
						, max: 3
					}
					, speed: {
						start: 2
						, end: 0
					}
					, color: {
						start: ["ff4252", "d43346"]
						, end: ["802343", "a82841"]
					}
					, chance: 0.125
					, randomColor: true
					, randomScale: true
					, blendMode: "add"
					, spawnType: "rect"
					, spawnRect: {
						x: -10
						, y: -10
						, w: 20
						, h: 20
					}
				}
			}, {
				type: "summonConsumableFollower"
			}]
		}

		, "canette": {
			level: 4
			, faction: "hostile"
			, regular: {
				drops: {
					rolls: 1
					, noRandom: true
					, alsoRandom: true
					, blueprints: [{
						chance: 30
						, name: "Canette vide"
						, quality: 0
						, quest: true
						, sprite: [1, 1]
					}]
				}
			}
			, rare: {
				name: "Canette Frette"
			}
			, spells: [{
				type: "melee"
			}, {
				type: "smokeBomb"
				, radius: 0
				, repeat: 5
				, duration: 7
				, randomPos: true
				, range: 2
				, selfCast: 0.2
				, statMult: 1
				, damage: 0.125
				, element: "arcane"
				, cdMax: 5
				, particles: {
					lifetime: { min: 1, max: 2 }
					, behaviors: [
						{ type: "color"
							, config: {
								color: {
									list: [
										{ time: 0, value: "a24eff" }
										, { time: 0.33, value: "fc66f7" }
										, { time: 0.5, value: "a24eff" }
										, { time: 0.66, value: "933159" }
										, { time: 1, value: "393268" }
									]
								}
							}
						}
						, { type: "alpha"
							, config: {
								alpha: {
									list: [
										{ time: 0, value: 0.4 }
										, { time: 1, value: 0.1 }
									]
								}
							}
						}
						, { type: "scale"
							, config: {
								scale: {
									list: [
										{ time: 0, value: 25 }
										, { time: 1, value: 10 }
									]
								}
								, minMult: 0.25
							}
						}
						, { type: "blendMode"
							, config: { blendMode: "add" }
						}
						, { type: "moveSpeed",
							config: {
								speed: {
									list: [
										{ time: 0, value: 3 }
										, { time: 1, value: 0 }
									]
								}
							}
						}
						, { type: "spawnShape"
							, config: {
								type: "rect"
								, data: { x: -10, y: -10, w: 20, h: 20 }
							}
						}
					]
					, spawnChance: 0.125
				}
			}]
		}

		, majeur: {
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

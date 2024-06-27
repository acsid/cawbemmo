module.exports = {
	name: "town"
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
		, mrBoner: {
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
		, vidange: {
			level: 3
			, regular: {
				drops: {
					chance: 50
					, rolls: 1
				}
			}
			, rare: {
				name: "Vidange de luxe"
			}
			, questItem: {
				name: "Hamburger usagée"
				, sprite: [0, 1]
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
		, sbire: {
			level: 4
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
		, "45 tours": {
			level: 5
			, regular: {
				drops: {
					rolls: 1
				}

			}
			, rare: {
				name: "Evan Joanes"
			}
		}
		, crab: {
			level: 6

			, rare: {
				name: "Squiggles"
			}
			, questItem: {
				name: "Pince de crabe"
				, sprite: [0, 3]
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
		, hermit: {
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
						name: "Flimsy Fishing Rod"
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
		}, gislain: {
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
								behaviors: [
									{ type: "color"
										, config: {
											color: {
												list: [
													{ time: 0, value: "802343" }
													, { time: 0.33, value: "fc66f7" }
													, { time: 0.5, value: "802343" }
													, { time: 0.66, value: "de43ae" }
													, { time: 1, value: "393268" }
												]
											}
										}
									}
									, { type: "alpha"
										, config: {
											alpha: {
												list: [
													{ time: 0, value: 0.25 }
													, { time: 1, value: 0 }
												]
											}
										}
									}
									, { type: "blendMode"
										, config: { blendMode: "add" }
									}
									, { type: "scale"
										, config: {
											scale: {
												list: [
													{ time: 0, value: 18 }
													, { time: 1, value: 8 }
												]
											}
											, minMult: 0.5
										}
									}
									, { type: "moveSpeed",
										config: {
											speed: {
												list: [
													{ time: 0, value: 12 }
													, { time: 1, value: 4 }
												]
											}
											, minMult: 0.5
										}
									}
									, { type: "spawnShape"
										, config: {
											type: "rect"
											, data: { x: -24, y: -24, w: 48, h: 48 }
										}
									}
								]
								, lifetime: { min: 5, max: 12 }
								, spawnChance: 0.06
							}
						};
					}
				}
			}
		}
	}
};

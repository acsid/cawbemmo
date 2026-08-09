module.exports = {
	name: "Depanneur"
	, level: [4, 6]
	, addLevel: 0
	, resources: {}
	, mobs: {
		default: {
			spells: [{
				type: "melee"
				, element: "arcane"
			}]

			, regular: {
				drops: {
					chance: 35
					, rolls: 1
				}
			}
		}

		, canette: {
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
					emitterVersion: "0.0.0"
					, minParticleLifetime: 1
					, maxParticleLifetime: 2
					, colorBehavior: {
						mode: "list"
						, listData: {
							list: [
								{ time: 0, value: "#a24eff" }
								, { time: 0.33, value: "#fc66f7" }
								, { time: 0.5, value: "#a24eff" }
								, { time: 0.66, value: "#933159" }
								, { time: 1, value: "#393268" }
							]
						}
					}
					, alphaBehavior: {
						mode: "list"
						, listData: {
							list: [
								{ time: 0, value: 0.4 }
								, { time: 1, value: 0.1 }
							]
						}
					}
					, scaleBehavior: {
						mode: "list"
						, xListData: {
							list: [
								{ time: 0, value: 25 }
								, { time: 1, value: 10 }
							]
						}
					}
					, movementBehavior: {
						mode: "linear"
						, space: "global"
						, xListData: {
							list: [
								{ time: 0, value: 3 }
								, { time: 1, value: 0 }
							]
						}
					}
					, spawnBehavior: {
						shape: "rectangle"
						, width: 20
						, height: 20
					}
					, spawnChance: 0.125
				}
			}]
		}

		, rat: {
			level: 5

			, regular: {
				drops: {
					rolls: 1
					, noRandom: true
					, alsoRandom: true
					, blueprints: [{
						chance: 35
						, name: "queue de rat"
						, quality: 0
						, quest: true
						, sprite: [1, 1]
					}]
				}
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
				, damage: 0.25
				, element: "arcane"
				, cdMax: 5
				, particles: {
					emitterVersion: "0.0.0"
					, minParticleLifetime: 1
					, maxParticleLifetime: 2
					, colorBehavior: {
						mode: "list"
						, listData: {
							list: [
								{ time: 0, value: "#ffeb38" }
								, { time: 0.33, value: "#ff6942" }
								, { time: 0.5, value: "#ffeb38" }
								, { time: 0.66, value: "#953f36" }
								, { time: 1, value: "#9a5a3c" }
							]
						}
					}
					, alphaBehavior: {
						mode: "list"
						, listData: {
							list: [
								{ time: 0, value: 0.3 }
								, { time: 1, value: 0.1 }
							]
						}
					}
					, scaleBehavior: {
						mode: "list"
						, xListData: {
							list: [
								{ time: 0, value: 14 }
								, { time: 1, value: 8 }
							]
						}
					}
					, movementBehavior: {
						mode: "linear"
						, space: "global"
						, xListData: {
							list: [
								{ time: 0, value: 2 }
								, { time: 1, value: 0 }
							]
						}
					}
					, spawnBehavior: {
						shape: "rectangle"
						, width: 20
						, height: 20
					}
					, spawnChance: 0.125
				}
			}]
		}

		, gaetan: {
			level: 6
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
						, name: "Clé des toilettes"
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
					emitterVersion: "0.0.0"
					, colorBehavior: {
						mode: "random"
						, listData: {
							list: [
								{ time: 0, value: "#fc66f7" }
								, { time: 0, value: "#393268" }
							]
						}
					}
					, scaleBehavior: {
						mode: "random"
						, xListData: {
							list: [
								{ time: 0, value: 6 }
								, { time: 0, value: 18 }
							]
						}
					}
					, spawnChance: 0.65
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
					emitterVersion: "0.0.0"
					, minParticleLifetime: 1
					, maxParticleLifetime: 3
					, colorBehavior: {
						mode: "random"
						, listData: {
							list: [
								{ time: 0, value: "#ff4252" }
								, { time: 0, value: "#802343" }
							]
						}
					}
					, alphaBehavior: {
						mode: "list"
						, listData: {
							list: [
								{ time: 0, value: 0.01 }
								, { time: 1, value: 0 }
							]
						}
					}
					, scaleBehavior: {
						mode: "random"
						, xListData: {
							list: [
								{ time: 0, value: 6 }
								, { time: 0, value: 18 }
							]
						}
					}
					, movementBehavior: {
						mode: "linear"
						, space: "global"
						, xListData: {
							list: [
								{ time: 0, value: 2 }
								, { time: 1, value: 0 }
							]
						}
					}
					, spawnBehavior: {
						shape: "rectangle"
						, width: 20
						, height: 20
					}
					, spawnChance: 0.125
				}
			}, {
				type: "summonConsumableFollower"
			}]
		}

		, "pti bum": {
			level: 20
			, faction: "akarei"
			, attackable: false
			, deathRep: -3
		}
		, biorn: {
			level: 20
			, attackable: false
			, walkDistance: 0
			, faction: "akarei"
			, deathRep: -3
		}
		, veleif: {
			level: 20
			, attackable: false
			, walkDistance: 0
			, faction: "akarei"
			, deathRep: -3
		}

		, "nain capable": {
			level: 20
			, attackable: false
			, faction: "akarei"
			, deathRep: -6
		}
		, "thaumaturge yala": {
			level: 20
			, attackable: false
			, walkDistance: 0
			, faction: "akarei"

			, deathRep: -15

			, regular: {
				hpMult: 100
				, dmgMult: 2
			}

			, rare: {
				count: 0
			}

			, properties: {
				cpnTrade: {
					items: {
						min: 2
						, max: 5
						, minLevel: 14
						, maxLevel: 18
						, slot: "neck"
						, extra: []
					}
					, faction: {
						id: "akarei"
						, tier: 5
					}
					, markup: {
						buy: 0.25
						, sell: 20
					}
				}
			}
		}
	}
	, objects: {
		redwall: {
			components: {
				cpnBlocker: {
					init: function () {
						this.obj.instance.physics.setCollision(this.obj.x, this.obj.y, true);
						this.obj.instance.objects.notifyCollisionChange(this.obj.x, this.obj.y, true);
					}
				}
			}
		}
		, bigportal: {
			components: {
				cpnAttackAnimation: {
					simplify: function () {
						return {
							type: "attackAnimation"
							, spriteSheet: "animBigObjects"
							, row: 1
							, col: 0
							, frames: 6
							, frameDelay: 7
							, loop: -1
							, noSprite: true
							, hideSprite: true
						};
					}
				}
			}
		}
		, pinktile: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: "particles"
							, blueprint: {
								emitterVersion: "0.0.0"
								, minParticleLifetime: 1
								, maxParticleLifetime: 4
								, colorBehavior: {
									mode: "random"
									, listData: {
										list: [
											{ time: 0, value: "#fc66f7" }
											, { time: 0, value: "#933159" }
										]
									}
								}
								, scaleBehavior: {
									mode: "random"
									, xListData: {
										list: [
											{ time: 0, value: 2 }
											, { time: 0, value: 10 }
										]
									}
								}
								, movementBehavior: {
									mode: "linear"
									, space: "global"
									, xListData: {
										list: [
											{ time: 0, value: 4 }
											, { time: 1, value: 2 }
										]
									}
								}
								, spawnBehavior: {
									shape: "rectangle"
									, width: 60
									, height: 60
								}
								, spawnChance: 0.04
							}
						};
					}
				}
			}
		}
		, walltrigger: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: "particles"
							, blueprint: {
								emitterVersion: "0.0.0"
								, minParticleLifetime: 1
								, maxParticleLifetime: 2
								, colorBehavior: {
									mode: "random"
									, listData: {
										list: [
											{ time: 0, value: "#ff4252" }
											, { time: 0, value: "#802343" }
										]
									}
								}
								, scaleBehavior: {
									mode: "random"
									, xListData: {
										list: [
											{ time: 0, value: 2 }
											, { time: 0, value: 6 }
										]
									}
								}
								, movementBehavior: {
									mode: "linear"
									, space: "global"
									, xListData: {
										list: [
											{ time: 0, value: 0 }
											, { time: 1, value: 0 }
										]
									}
								}
								, spawnBehavior: {
									shape: "rectangle"
									, width: 40
									, height: 40
								}
								, spawnChance: 0.2
							}
						};
					}
				}
				, cpnTrigger: {
					init: function () {
						this.obj.instance.triggerPuzzle = {
							activated: []
						};
					}
					, collisionEnter: function (o) {
						if (!o.player) {
							return;
						}

						let order = this.obj.order;
						let triggerPuzzle = this.obj.instance.triggerPuzzle;
						let activated = triggerPuzzle.activated;

						if (this.obj.forceOpen) {
							triggerPuzzle.activated = [];
							this.activate();
							return;
						}

						activated.push(order);
						let valid = true;
						for (let i = 0; i < activated.length; i++) {
							if (~~activated[i] !== i) {
								valid = false;
								break;
							}
						}

						if (!valid) {
							triggerPuzzle.activated = [];

							process.send({
								method: "events"
								, data: {
									onGetAnnouncement: [{
										obj: {
											msg: "nothing happens"
										}
										, to: [o.serverId]
									}]
								}
							});

							return;
						} else if (activated.length === 4) {
							triggerPuzzle.activated = [];
							this.activate();
						}

						process.send({
							method: "events"
							, data: {
								onGetAnnouncement: [{
									obj: {
										msg: this.obj.message
									}
									, to: [o.serverId]
								}]
							}
						});
					}
					, activate: function () {
						let syncer = this.obj.instance.syncer;
						let physics = this.obj.instance.physics;
						let walls = this.obj.instance.objects.objects.filter((o) => (o.objZoneName === "redWall"));
						walls.forEach(function (w) {
							w.destroyed = true;
							physics.setCollision(w.x, w.y, false);
							this.obj.instance.objects.notifyCollisionChange(w.x, w.y, false);

							syncer.queue("onGetObject", {
								x: w.x
								, y: w.y
								, components: [{
									type: "attackAnimation"
									, row: 0
									, col: 4
								}]
							}, -1);
						}, this);
					}
				}
			}
		}
		, gas: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: "particles"
							, blueprint: {
								emitterVersion: "0.0.0"
								, minParticleLifetime: 4
								, maxParticleLifetime: 16
								, colorBehavior: {
									mode: "random"
									, listData: {
										list: [
											{ time: 0, value: "#c0c3cf" }
											, { time: 0, value: "#69696e" }
										]
									}
								}
								, alphaBehavior: {
									mode: "list"
									, listData: {
										list: [
											{ time: 0, value: 0.2 }
											, { time: 1, value: 0 }
										]
									}
								}
								, scaleBehavior: {
									mode: "random"
									, xListData: {
										list: [
											{ time: 0, value: 32 }
											, { time: 0, value: 18 }
										]
									}
								}
								, movementBehavior: {
									mode: "linear"
									, space: "global"
									, xListData: {
										list: [
											{ time: 0, value: 2 }
											, { time: 1, value: 0 }
										]
									}
								}
								, spawnBehavior: {
									shape: "rectangle"
									, width: 160
									, height: 160
								}
								, spawnChance: 0.02
							}
						};
					}
				}
			}
		}
		, bubbles: {
			components: {
				cpnParticles: {
					simplify: function () {
						return {
							type: "particles"
							, blueprint: {
								emitterVersion: "0.0.0"
								, minParticleLifetime: 1
								, maxParticleLifetime: 3
								, colorBehavior: {
									mode: "random"
									, listData: {
										list: [
											{ time: 0, value: "#48edff" }
											, { time: 0, value: "#69696e" }
										]
									}
								}
								, alphaBehavior: {
									mode: "list"
									, listData: {
										list: [
											{ time: 0, value: 0.5 }
											, { time: 1, value: 0 }
										]
									}
								}
								, scaleBehavior: {
									mode: "random"
									, xListData: {
										list: [
											{ time: 0, value: 2 }
											, { time: 0, value: 8 }
										]
									}
								}
								, movementBehavior: {
									mode: "linear"
									, space: "global"
									, xListData: {
										list: [
											{ time: 0, value: 2 }
											, { time: 1, value: 0 }
										]
									}
								}
								, spawnBehavior: {
									shape: "rectangle"
									, width: 60
									, height: 60
								}
								, spawnChance: 0.2
							}
						};
					}
				}
			}
		}

		, shopyala: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: "dialogue"
							, method: "talk"
							, args: [{
								targetName: "thaumaturge yala"
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
	}
};

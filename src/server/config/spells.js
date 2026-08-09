const events = require("../misc/events");

const spells = [
	{ name: "Melee"
		, description: "Performs a quick melee attack."
		, type: "melee"
		, icon: [7, 0]
		, config: {
			auto: true
			, cdMax: 10
			, castTimeMax: 0
			, useWeaponRange: true
			, random: {
				damage: [3, 11.4]
			}
		}
	}

	, { name: "Projectile"
		, description: "Performs a basic magical attack."
		, type: "projectile"
		, icon: [7, 1]
		, animation: "hitStaff"
		, row: 11
		, col: 4
		, speed: 110
		, config: {
			auto: true
			, cdMax: 10
			, castTimeMax: 0
			, manaCost: 0
			, range: 9
			, random: {
				damage: [2, 7.2]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 1
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#ff6942" }
						, { time: 0.33, value: "#ffeb38" }
						, { time: 0.5, value: "#ff6942" }
						, { time: 0.66, value: "#d43346" }
						, { time: 1, value: "#ff6942" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.6 }
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
			, spawnChance: 0.25
		}
	}

	, { name: "Magic Missile"
		, description: "Launches an orb of unfocused energy at your target."
		, type: "projectile"
		, icon: [1, 0]
		, animation: "hitStaff"
		, config: {
			statType: "int"
			, statMult: 1
			, element: "arcane"
			, cdMax: 7
			, castTimeMax: 6
			, manaCost: 5
			, range: 9
			, random: {
				damage: [4, 32]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 3
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#3fa7dd" }
						, { time: 0.33, value: "#7a3ad3" }
						, { time: 0.5, value: "#3fa7dd" }
						, { time: 0.66, value: "#7a3ad3" }
						, { time: 1, value: "#3fa7dd" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.8 }
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
			, spawnChance: 0.6
		}
	}

	, { name: "Ice Spear"
		, description: "A jagged projectile of pure ice pierces your target and slows his movement."
		, type: "iceSpear"
		, icon: [1, 1]
		, animation: "hitStaff"
		, config: {
			statType: "int"
			, statMult: 1
			, element: "frost"
			, cdMax: 10
			, castTimeMax: 2
			, manaCost: 4
			, range: 9
			, random: {
				damage: [2, 15]
				, i_freezeDuration: [6, 10]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 2
			, spawnInterval: 0.2
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#48edff" }
						, { time: 0.33, value: "#51fc9a" }
						, { time: 0.5, value: "#48edff" }
						, { time: 0.66, value: "#44cb95" }
						, { time: 1, value: "#48edff" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.9 }
						, { time: 1, value: 0.1 }
					]
				}
			}
			, scaleBehavior: {
				mode: "list"
				, xListData: {
					list: [
						{ time: 0, value: 12 }
						, { time: 1, value: 6 }
					]
				}
			}
		}
	}

	, { name: "Fireblast"
		, description: "Unleashes a blast of fire that damages and pushes back nearby foes."
		, type: "fireblast"
		, icon: [1, 2]
		, animation: "raiseStaff"
		, config: {
			statType: "int"
			, statMult: 1
			, element: "fire"
			, cdMax: 4
			, castTimeMax: 2
			, manaCost: 5
			, random: {
				damage: [2, 10]
				, i_radius: [1, 2.2]
				, i_pushback: [2, 5]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 2
			, spawnInterval: 0.02
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#d43346" }
						, { time: 0.33, value: "#faac45" }
						, { time: 0.5, value: "#d43346" }
						, { time: 0.66, value: "#929398" }
						, { time: 1, value: "#c0c3cf" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.9 }
						, { time: 1, value: 0.1 }
					]
				}
			}
			, scaleBehavior: {
				mode: "list"
				, xListData: {
					list: [
						{ time: 0, value: 24 }
						, { time: 1, value: 12 }
					]
				}
			}
			, movementBehavior: {
				mode: "linear"
				, space: "global"
				, xListData: {
					list: [
						{ time: 0, value: 24 }
						, { time: 1, value: 12 }
					]
				}
			}
		}
	}

	, { name: "Smite"
		, description: "Calls down holy energy from the heavens upon your foe."
		, type: "smite"
		, row: 2
		, col: 0
		, icon: [0, 0]
		, animation: "hitStaff"
		, config: {
			statType: "int"
			, statMult: 1
			, element: "holy"
			, cdMax: 6
			, castTimeMax: 3
			, range: 9
			, manaCost: 7
			, random: {
				damage: [4, 14]
				, i_stunDuration: [6, 10]
			}
		}
	}

	, { name: "Consecrate"
		, description: "Creates a circle of pure holy energy that heals allies for a brief period."
		, type: "healingCircle"
		, icon: [0, 1]
		, animation: "raiseStaff"
		, config: {
			statType: "int"
			, statMult: 1
			, element: "holy"
			, cdMax: 15
			, castTimeMax: 4
			, manaCost: 12
			, range: 9
			, radius: 3
			, random: {
				healing: [0.3, 0.5]
				, i_duration: [7, 13]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 3
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#fcfcfc" }
						, { time: 0.33, value: "#ffeb38" }
						, { time: 0.5, value: "#fcfcfc" }
						, { time: 0.66, value: "#faac45" }
						, { time: 1, value: "#fcfcfc" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.55 }
						, { time: 1, value: 0.1 }
					]
				}
			}
			, scaleBehavior: {
				mode: "list"
				, xListData: {
					list: [
						{ time: 0, value: 16 }
						, { time: 1, value: 4 }
					]
				}
			}
			, movementBehavior: {
				mode: "linear"
				, space: "global"
				, xListData: {
					list: [
						{ time: 0, value: 12 }
						, { time: 1, value: 4 }
					]
				}
			}
			, spawnChance: 0.02
		}
	}

	, { name: "Healing Touch"
		, description: "Restore health to a friendly target."
		, type: "singleTargetHeal"
		, spellType: "heal"
		, icon: [0, 3]
		, animation: "raiseStaff"
		, config: {
			statType: "int"
			, statMult: 1
			, element: "holy"
			, cdMax: 5
			, castTimeMax: 3
			, manaCost: 8
			, range: 9
			, random: {
				healing: [1, 3]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 3
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#fcfcfc" }
						, { time: 0.33, value: "#ffeb38" }
						, { time: 0.5, value: "#fcfcfc" }
						, { time: 0.66, value: "#faac45" }
						, { time: 1, value: "#fcfcfc" }
					]
				}
			}
			, alphaBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: 0.55 }
						, { time: 1, value: 0.1 }
					]
				}
			}
			, scaleBehavior: {
				mode: "list"
				, xListData: {
					list: [
						{ time: 0, value: 16 }
						, { time: 1, value: 4 }
					]
				}
			}
			, movementBehavior: {
				mode: "linear"
				, space: "global"
				, xListData: {
					list: [
						{ time: 0, value: 12 }
						, { time: 1, value: 4 }
					]
				}
			}
			, spawnChance: 0.02
		}
	}

	, { name: "Holy Vengeance"
		, description: "Grants holy vengeance to a friendly target. For the duration of the effect, dealing damage will also heal the attacker."
		, type: "holyVengeance"
		, spellType: "buff"
		, icon: [0, 2]
	}

	, { name: "Slash"
		, description: "Performs a melee attack with your equipped weapon."
		, type: "slash"
		, row: 0
		, col: 0
		, icon: [3, 0]
		, animation: "hitSword"
		, config: {
			statType: "str"
			, statMult: 1
			, threatMult: 4
			, cdMax: 9
			, castTimeMax: 1
			, manaCost: 4
			, useWeaponRange: true
			, random: {
				damage: [6, 23]
			}
		}
	}

	, { name: "Charge"
		, type: "charge"
		, description: "Charges at a foe, dealing damage and stunning them for a short period."
		, icon: [3, 1]
		, animation: "raiseShield"
		, config: {
			statType: "str"
			, statMult: 1
			, threatMult: 3
			, cdMax: 14
			, castTimeMax: 1
			, range: 10
			, manaCost: 3
			, random: {
				damage: [2, 11]
				, i_stunDuration: [6, 10]
			}
		}
	}

	, { name: "Reflect Damage"
		, type: "reflectdamage"
		, description: "Gain an ethereal shield that reflects damage until the buff wears off."
		, icon: [3, 2]
		, animation: "raiseShield"
	}

	, { name: "Flurry"
		, type: "flurry"
		, description: "Grants a stack of frenzy, greatly inreasing your attack speed."
		, animation: "hitSword"
		, row: 1
		, col: 0
		, icon: [2, 3]
		, config: {
			statType: "dex"
			, statMult: 1
			, cdMax: 20
			, castTimeMax: 0
			, manaCost: 10
			, random: {
				i_duration: [10, 20]
				, i_chance: [30, 60]
			}
		}
	}

	, { name: "Smokebomb"
		, type: "smokeBomb"
		, description: "Envelops the caster in a cloud of poisonous smoke, dealing damage to enemies every tick until it dissipates."
		, animation: "raiseHands"
		, icon: [2, 1]
		, config: {
			statType: "dex"
			, statMult: 1
			, element: "poison"
			, cdMax: 7
			, castTimeMax: 0
			, manaCost: 6
			, random: {
				damage: [0.25, 1.2]
				, i_radius: [1, 3]
				, i_duration: [7, 13]
			}
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 3
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#80f643" }
						, { time: 0.33, value: "#fcfcfc" }
						, { time: 0.5, value: "#80f643" }
						, { time: 0.66, value: "#c0c3cf" }
						, { time: 1, value: "#2b4b3e" }
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
						{ time: 0, value: 30 }
						, { time: 1, value: 14 }
					]
				}
			}
			, movementBehavior: {
				mode: "linear"
				, space: "global"
				, xListData: {
					list: [
						{ time: 0, value: 12 }
						, { time: 1, value: 2 }
					]
				}
			}
			, spawnChance: 0.03
		}
	}

	, { name: "Whirlwind"
		, description: "You furiously spin in a circle, striking all foes around you."
		, type: "whirlwind"
		, icon: [5, 0]
		, row: 5
		, col: 0
		, frames: 3
		, config: {
			statType: "str"
			, statMult: 1
			, threatMult: 6
			, cdMax: 12
			, castTimeMax: 2
			, manaCost: 7
			, random: {
				i_range: [1, 2.5]
				, damage: [4, 18]
			}
		}
	}

	, { name: "Ambush"
		, type: "ambush"
		, description: "Step into the shadows and reappear behind your target before delivering a concussing blow."
		, icon: [2, 4]
		, animation: "raiseShield"
		, config: {
			statType: "dex"
			, statMult: 1
			, cdMax: 15
			, castTimeMax: 3
			, range: 10
			, manaCost: 7
			, random: {
				damage: [8, 35]
				, i_stunDuration: [4, 7]
			}
		}
	}

	, { name: "Stealth"
		, description: "The thief slips into the shadows and becomes undetectable by foes. Performing an attack removes this effect."
		, type: "stealth"
		, icon: [2, 2]
	}

	, { name: "Crystal Spikes"
		, description: "Jagged crystals break through the ground at your target destination"
		, type: "warnBlast"
		, animation: "raiseHands"
		, icon: [0, 7]
		, config: {
			statType: ["dex", "int"]
			, statMult: 1
			, manaCost: 14
			, needLos: true
			, cdMax: 15
			, castTimeMax: 0
			, range: 9
			, isAttack: true
			, random: {
				damage: [3, 18]
				, i_delay: [1, 4]
			}
			, negativeStats: [
				"i_delay"
			]
		}
		, particles: {
			emitterVersion: "0.0.0"
			, minParticleLifetime: 1
			, maxParticleLifetime: 1
			, colorBehavior: {
				mode: "list"
				, listData: {
					list: [
						{ time: 0, value: "#c0c3cf" }
						, { time: 0.33, value: "#929398" }
						, { time: 0.5, value: "#c0c3cf" }
						, { time: 0.66, value: "#929398" }
						, { time: 1, value: "#c0c3cf" }
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
				mode: "list"
				, xListData: {
					list: [
						{ time: 0, value: 10 }
						, { time: 1, value: 4 }
					]
				}
			}
			, movementBehavior: {
				mode: "linear"
				, space: "global"
				, xListData: {
					list: [
						{ time: 0, value: 16 }
						, { time: 1, value: 8 }
					]
				}
			}
			, spawnChance: 0.075
		}
	}

	, { name: "Chain Lightning"
		, description: "Creates a circle of pure holy energy that heals allies for a brief period."
		, type: "chainLightning"
		, icon: [0, 1]
		, animation: "raiseStaff"
	}

	, { name: "Innervation"
		, description: "Grants an aura that regenerates hp for you and your allies."
		, type: "aura"
		, spellType: "aura"
		, icon: [3, 3]
		, config: {
			statType: ["str"]
			, statMult: 1
			, manaReserve: {
				percentage: 0.25
			}
			, cdMax: 10
			, castTimeMax: 0
			, auraRange: 9
			, effect: "regenHp"
			, random: {
				regenPercentage: [0.3, 1.5]
			}
		}
	}

	, { name: "Tranquility"
		, description: "Grants an aura that regenerates mana for you and your allies."
		, type: "aura"
		, spellType: "aura"
		, icon: [3, 4]
		, config: {
			statType: ["int"]
			, statMult: 1
			, element: "holy"
			, manaReserve: {
				percentage: 0.25
			}
			, cdMax: 10
			, castTimeMax: 0
			, auraRange: 9
			, effect: "regenMana"
			, random: {
				regenPercentage: [4, 10]
			}
		}
	}

	, { name: "Swiftness"
		, description: "Grants an aura that grants increased movement speed to you and your allies."
		, type: "aura"
		, spellType: "aura"
		, icon: [3, 5]
		, config: {
			statType: ["dex"]
			, statMult: 1
			, element: "fire"
			, manaReserve: {
				percentage: 0.4
			}
			, cdMax: 10
			, castTimeMax: 0
			, auraRange: 9
			, effect: "swiftness"
			, random: {
				chance: [8, 20]
			}
		}
	}
];

module.exports = {
	map: new Map()
	, init: function () {
		const list = _.assign([], spells);
		events.emit("onBeforeGetSpellsInfo", list);
		for (const spell of list) {
			this.map.set(spell.name.toLowerCase(), spell);
		}
	}
};

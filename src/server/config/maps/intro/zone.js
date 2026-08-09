module.exports = {
	name: "Le Néant"
	, level: [1, 12]
	, resources: {
		"ticket d\'autobus": {
			type: "herb"
			, sheetName: "tiles"
			, cell: 55
			, itemSprite: [2, 0]
			, max: 4
		}
	}
	, objects: {
		talkbando: {
			properties: {
				cpnNotice: {
					actions: {
						enter: {
							cpn: "dialogue"
							, method: "talk"
							, args: [{
								targetName: "banddo"
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
	, mobs: {
		default: {
			regular: {
				drops: {
					chance: 40
					, rolls: 1
				}
			}
		}

		, chauffeur: {
			level: 10
			, walkDistance: 0
			, attackable: false
		}
		, banddo: {
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
						, max: 5
					}
					, forceItems: [{
						name: "Ticket d'autobus"
						, type: "Fishing Rod"
						, slot: "tool"
						, quality: 0
						, worth: 5
						, sprite: [11, 0]
						, infinite: false
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
						, max: 5
					}
					, markup: {
						buy: 0.25
						, sell: 2.5
					}
				}
			}
		}
	}
};


let events = require("../misc/events");

module.exports = {
	list: ["concierge", "pee wee", "party animal", "necro"]
	, portraits: {
		"concierge": {
			x: 0
			, y: 0
		}
		, "pee wee": {
			x: 2
			, y: 0
		}
		, "party animal": {
			x: 3
			, y: 0
		},
		necro: {
			x: 1
			, y: 0
		}
	}
	, spells: {
		"concierge": ["magic missile", "ice spear"]
		, "pee wee": ["slash", "charge"]
		, "party animal": ["flurry", "smokebomb"]
		, necro: ["harvest life", "summon skeleton"]
	}
	, stats: {
		"concierge": {
			values: {
				hpMax: 35
				, hpPerLevel: 32
			}
			, gainStats: {
				int: 1
			}
		}
		, "pee wee": {
			values: {
				hpMax: 45
				, hpPerLevel: 36
			}
			, gainStats: {
				dex: 1
			}
		}
		, "party animal": {
			values: {
				hpMax: 55
				, hpPerLevel: 40
			}
			, gainStats: {
				str: 1
			}
		}
		, necro: {
			values: {
				hpMax: 40
				, hpPerLevel: 37
			}
			, gainStats: {
				int: 1
			}
		}
	}
	, weapons: {
		"concierge": "Gnarled Staff"
		, "pee wee": "Dagger"
		, "party animal": "Sword"
		, necro: "Sickle"
	}

	, getSpritesheet: function (className) {
		return this.stats[className].spritesheet || "characters";
	}

	, init: function () {
		events.emit("onBeforeGetSpirits", this);
	}
};

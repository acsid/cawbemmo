const events = require("../misc/events");
const factionBase = {
	id: "example"
	, name: "Example"
	, description: "An example faction."

	, initialRep: 1000
	, tiers: [{
		name: "Hated"
		, rep: -25000
	}, {
		name: "Hostile"
		, rep: -10000
	}, {
		name: "Unfriendly"
		, rep: -1000
	}, {
		name: "Neutral"
		, rep: 0
	}, {
		name: "Friendly"
		, rep: 1000
	}, {
		name: "Honored"
		, rep: 10000
	}, {
		name: "Revered"
		, rep: 25000
	}, {
		name: "Exalted"
		, rep: 50000
	}]

	, rewards: {
		honored: []
		, revered: []
		, exalted: []
	}
};
module.exports = class Faction {
	static mappings = {};
	static #cache = {};

	static async init (mappings) {
		if (mappings) {
			_.assign(Faction.mappings, mappings);
		}
		await events.emit("onBeforeGetFactions", Faction.mappings);
	}

	static fromJSON (json) {
		if (typeof json !== "object") {
			throw new Error("json object missing!");
		}
		const faction = Object.create(Faction.prototype);
		return _.assign(faction, factionBase, json);
	}

	static getById (id) {
		if (id in Faction.#cache) {
			return Faction.#cache[id];
		}
		let res = null;
		const mapping = Faction.mappings[id];
		if (mapping) {
			res = _.safeRequire(module, "./" + mapping, _.log.getFactionBlueprint);
		} else {
			res = _.safeRequire(module, "./factions/" + id, _.log.getFactionBlueprint);
		}
		if (!res) {
			return;
		}
		if (!(res instanceof Faction)) {
			res = Faction.fromJSON(res);
		}
		Faction.#cache[id] = res;
		return res;
	}

	constructor () {
	}

	/*
	toJSON() {
		return {
		};
	}
	*/
};

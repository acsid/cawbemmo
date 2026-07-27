//const expect = (await require("chai")).expect;
//import { expect} from "chai"

const Faction = require("../server/config/factions");
const fileLister = require("../server/misc/fileLister");

describe("factions", function() {
	let expect;
	before(async () => {
		expect = (await import("chai")).expect;
		global._ = (await import("../server/misc/helpers.mjs")).default;
		const logging = (await import("../common/logging.mjs")).default;
		_.log = logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler((thisLogger, logLevel, args) => console.info.apply(console, args), () => true)});

		Faction.init();
	});
	it("fromJSON", function() {
		const faction = Faction.fromJSON({
			id: "hostile"
			, name: "Hostile"
			, description: "Generic hostile faction."

			, initialRep: -10000
			, noGainRep: true

			, relations: {
			}
		});
		expect(faction).to.be.a("object");
		expect(faction).to.be.instanceOf(Faction);
		expect(faction).to.deep.equal({
			"id": "hostile"
			, "description": "Generic hostile faction."
			, "name": "Hostile"
			, "initialRep": -10000
			, "noGainRep": true
			, "relations": {}
			, "rewards": {
				"exalted": []
				, "honored": []
				, "revered": []
			}
			, "tiers": [
				{	"name": "Hated"
				  , "rep": -25000
				}
				, { "name": "Hostile"
				  , "rep": -10000
				}
				, { "name": "Unfriendly"
				  , "rep": -1000
				}
				, { "name": "Neutral"
				  , "rep": 0
				}
				, { "name": "Friendly"
				  , "rep": 1000
				}
				, { "name": "Honored"
				  , "rep": 10000
				}
				, { "name": "Revered"
				  , "rep": 25000
				}
				, { "name": "Exalted"
				  , "rep": 50000
				}
			]
		});
	});
	describe("configuration", function() {
		let factionsFiles;
		before(async () => {
			factionsFiles = fileLister.getFiles("./server/config/factions");
		});
		it("has all requires overrides", function() {
			expect(factionsFiles).to.have.lengthOf.above(2);
			for (const factionFile of factionsFiles) {
				const faction = Faction.getById(factionFile);
				expect(faction).to.be.a("object");
				expect(faction).to.be.instanceOf(Faction);

				expect(faction.id).to.be.a("string");
				expect(faction.id).to.not.equal("example");

				expect(faction.name).to.be.a("string");
				expect(faction.name).to.not.equal("Example");

				expect(faction.description).to.be.a("string");
				expect(faction.description).to.not.have.string("example");

				expect(faction.initialRep).to.be.a("number");
				if ("noGainRep" in faction) {
					expect(faction.noGainRep).to.be.a("boolean");
				}
			}
		});
	});
});

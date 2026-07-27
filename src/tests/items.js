//import { expect } from "chai"

const Item = require("../server/components/inventory/item");
const fileLister = require("../server/misc/fileLister");

describe("items", function() {
	let expect;
	before(async () => {
		expect = (await import("chai")).expect;
		global._ = (await import("../server/misc/helpers.mjs")).default;
		const logging = (await import("../common/logging.mjs")).default;
		_.log = logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler((thisLogger, logLevel, args) => console.info.apply(console, args), () => true)});

		Item.init();
	});
	it("fromJSON", function() {
		const item = Item.fromJSON({
		});
		expect(item).to.be.a("object");
		expect(item).to.be.instanceOf(Item);
		expect(item).to.deep.equal({
			"factions": []
		});
	});
	it("toJSON", function() {
		const item = Item.fromJSON({
			factions: [{
				id: 0
				, tier: 1
			}]
		});
		expect(item.toJSON()).to.deep.equal({
			"factions": [
					{ "id": 0
					, "name": "Hostile"
					, "tier": 1
					, "tierName": "Hostile"
				}
			]
		});
	});
	describe("generators", function() {
		it("has all requires overrides", function() {
		});
	});
});

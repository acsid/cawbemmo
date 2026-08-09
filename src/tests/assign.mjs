import { expect } from "chai";

let assignWith;
let assign;

// The "particles" remapper lives in assign.mjs and is reached through the
// global `_` (globals.mjs merges assignModule onto it). The logging calls in
// assign.mjs ( _.log.assign.* ) need a logger set up, matching the locale test.
before(async () => {
	global._ = (await import("../common/globals.mjs")).default;
	const logging = (await import("../common/logging.mjs")).default;
	_.log = logging.createLogger({
		name: "System"
		, loggerCtor: logging.createLogHandler(() => {}, () => {})
	});

	assignWith = _.assignWith;
	assign = _.assign;
});

describe("assign", () => {
	it("shallow-copies source properties onto the target", () => {
		const target = assign({}, { a: 1 }, { b: 2 });
		expect(target).to.deep.equal({ a: 1, b: 2 });
	});

	it("recursively merges nested plain objects", () => {
		const target = assign({ nested: { x: 1, y: 2 } }, { nested: { y: 9, z: 3 } });
		expect(target).to.deep.equal({ nested: { x: 1, y: 9, z: 3 } });
	});

	it("returns non-plain object sources unmodified (no clone)", () => {
		const date = new Date();
		const target = assign({}, { date });
		expect(target.date).to.equal(date);
	});
});

describe("assignWith (no remapper)", () => {
	it("behaves like assign when the remapper is null", () => {
		const target = assignWith(null, { a: { b: 1 } }, { a: { c: 2 } });
		expect(target).to.deep.equal({ a: { b: 1, c: 2 } });
	});

	it("concatenates arrays index-wise without a remapper", () => {
		//This is the behaviour the particles "list" remapper exists to override:
		//merging two {time,value} lists index-wise leaves stale tail entries.
		const base = { list: [{ time: 0, value: "a" }, { time: 1, value: "b" }] };
		const override = { list: [{ time: 0, value: "x" }, { time: 1, value: "y" }, { time: 1, value: "z" }] };
		const target = assignWith(null, {}, base, override);
		//Index-wise: [override[0], override[1], override[2]] — base fully replaced
		//here only because override is longer. The hazard is the reverse (see below).
		expect(target.list).to.deep.equal(override.list);
	});
});

describe('assignWith("particles")', () => {
	//The flat EmitterConfig still uses listData: { list: [{time, value}, ...] }.
	//The remapper's "list" branch REPLACES the whole array rather than merging
	//index-wise, so an overriding list fully replaces the base list regardless
	//of length. This is the load-bearing behaviour we must not break.

	it("replaces a {time,value} list instead of merging index-wise", () => {
		const base = {
			colorBehavior: {
				listData: { list: [{ time: 0, value: "#000000" }, { time: 1, value: "#ffffff" }] }
			}
		};
		const override = {
			colorBehavior: {
				listData: { list: [{ time: 0, value: "#ff0000" }] }
		}
		};
		const target = assignWith("particles", {}, base, override);
		//The shorter override list fully replaces the base — no stale #ffffff tail.
		expect(target.colorBehavior.listData.list).to.deep.equal([{ time: 0, value: "#ff0000" }]);
	});

	it("does not leave stale base entries when the override list is shorter", () => {
		//This is the exact hazard from particleDefaults (2-entry lists) being
		//overridden by component configs with 4-7 entries (and vice-versa).
		const defaults = {
			colorBehavior: {
				listData: { list: [
					{ time: 0, value: "#fb1010" }
					, { time: 1, value: "#f5b830" }
				] }
			}
		};
		const componentConfig = {
			colorBehavior: {
				listData: { list: [
					{ time: 0, value: "#7a3ad3" }
					, { time: 0.33, value: "#3fa7dd" }
					, { time: 0.5, value: "#7a3ad3" }
					, { time: 1, value: "#3c3f4c" }
				] }
			}
		};
		const target = assignWith("particles", {}, defaults, componentConfig);
		expect(target.colorBehavior.listData.list).to.have.length(4);
		expect(target.colorBehavior.listData.list).to.not.deep.include({ time: 1, value: "#f5b830" });
		expect(target.colorBehavior.listData.list).to.deep.equal(componentConfig.colorBehavior.listData.list);
	});

	it("merges other (non-list) behavior fields normally", () => {
		const base = {
			spawnBehavior: { shape: "circle", outerRadius: 10, innerRadius: 0 }
		};
		const override = { spawnBehavior: { outerRadius: 30 } };
		const target = assignWith("particles", {}, base, override);
		expect(target.spawnBehavior).to.deep.equal({ shape: "circle", outerRadius: 30, innerRadius: 0 });
	});

	it("applies multiple sources left-to-right with list replacement at each step", () => {
		//Mirrors explosion.js, which merges three sources.
		const first = {
			scaleBehavior: { xListData: { list: [{ time: 0, value: 18 }, { time: 1, value: 12 }] } }
		};
		const second = {
			scaleBehavior: { xListData: { list: [{ time: 0, value: 16 }, { time: 1, value: 10 }] } }
			, movementBehavior: { xListData: { list: [{ time: 0, value: 24 }, { time: 1, value: 18 }] } }
		};
		const target = assignWith("particles", {}, first, second);
		expect(target.scaleBehavior.xListData.list).to.deep.equal([{ time: 0, value: 16 }, { time: 1, value: 10 }]);
		expect(target.movementBehavior.xListData.list).to.deep.equal([{ time: 0, value: 24 }, { time: 1, value: 18 }]);
	});
});

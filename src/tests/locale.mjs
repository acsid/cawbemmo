import { expect } from "chai";

let getMessage;
let getLocalizedMessage;
let stringifyStatValue;
let translate;

before(async () => {
	global._ = (await import("../common/globals.mjs")).default;
	const logging = (await import("../common/logging.mjs")).default;
	_.log = logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler(() => {}, () => {}) });

	const locale = await import("../common/locale.mjs");
	getMessage = locale.getMessage;
	getLocalizedMessage = locale.getLocalizedMessage;
	stringifyStatValue = locale.stringifyStatValue;
	translate = locale.translate;
});

describe("getMessage", () => {
	it("walks a nested object along the given path", () => {
		const dict = { a: { b: { c: "deep" } } };
		expect(getMessage(dict, [ "a", "b", "c" ])).to.equal("deep");
	});

	it("returns the target itself for an empty path", () => {
		const dict = { a: 1 };
		expect(getMessage(dict, [])).to.equal(dict);
	});

	it("returns undefined and logs when a path is missing", () => {
		expect(getMessage({ a: {} }, [ "a", "missing" ])).to.equal(undefined);
	});

	it("returns undefined when descending into a non-object", () => {
		expect(getMessage({ a: "leaf" }, [ "a", "b" ])).to.equal(undefined);
	});
});

describe("getLocalizedMessage", () => {
	describe("argument handling", () => {
		it("throws when no dictionary is given", () => {
			expect(() => getLocalizedMessage(null, "x")).to.throw("Missing dictionary!");
		});

		it("returns non-string messages unchanged", () => {
			const dict = {};
			expect(getLocalizedMessage(dict, 42)).to.equal(42);
			expect(getLocalizedMessage(dict, undefined)).to.equal(undefined);
			expect(getLocalizedMessage(dict, null)).to.equal(null);
		});

		it("returns a message with no tokens unchanged", () => {
			const dict = {};
			expect(getLocalizedMessage(dict, "plain text")).to.equal("plain text");
		});
	});

	describe("object dictionary", () => {
		it("resolves a single-segment token", () => {
			const dict = { name: "Hero" };
			expect(getLocalizedMessage(dict, "${name}")).to.equal("Hero");
		});

		it("resolves a dotted token through nested objects", () => {
			const dict = { a: { b: { c: "deep" } } };
			expect(getLocalizedMessage(dict, "${a.b.c}")).to.equal("deep");
		});

		it("leaves an unknown dotted token intact (full ${token})", () => {
			const dict = {};
			expect(getLocalizedMessage(dict, "${a.b.c}")).to.equal("${a.b.c}");
		});

		it("leaves an unknown single-segment token intact (full ${token})", () => {
			const dict = {};
			expect(getLocalizedMessage(dict, "${missing}")).to.equal("${missing}");
		});

		it("resolves multiple tokens in one message", () => {
			const dict = { who: "world", what: "hello" };
			expect(getLocalizedMessage(dict, "${what}, ${who}!"))
				.to.equal("hello, world!");
		});

		it("ignores surrounding text outside the tokens", () => {
			const dict = { k: "V" };
			expect(getLocalizedMessage(dict, "before ${k} after"))
				.to.equal("before V after");
		});
	});

	describe("function dictionary", () => {
		//This is the contract announcements.js relies on: a function dict gets
		//the token's name parts as separate arguments.
		it("calls the function with the token's segments for a dotted name", () => {
			const dict = (...parts) => parts.join("|");
			expect(getLocalizedMessage(dict, "${a.b.c}")).to.equal("a|b|c");
		});

		it("calls the function with the single segment for a plain name", () => {
			const dict = (name) => `<${name}>`;
			expect(getLocalizedMessage(dict, "${name}")).to.equal("<name>");
		});

		it("resolves a key.<action> token via the function", () => {
			const keyForAction = { use: "U" };
			const dict = (...parts) => {
				if (parts[0] === "key" && parts[1]) {
					return keyForAction[parts[1]] || parts.join(".");
				}
				return parts.join(".");
			};
			expect(getLocalizedMessage(dict, "Press ${key.use} to open"))
				.to.equal("Press U to open");
		});

		it("falls back to the token's bare name when a key is unbound", () => {
			const dict = (...parts) => {
				if (parts[0] === "key" && parts[1]) {
					return keyForAction[parts[1]] || parts.join(".");
				}
				return parts.join(".");
			};
			const keyForAction = {};
			expect(getLocalizedMessage(dict, "${key.unbound}")).to.equal("key.unbound");
		});

		it("leaves the token intact (full ${token}) when the function returns null/undefined", () => {
			const dict = () => null;
			expect(getLocalizedMessage(dict, "${a.b}")).to.equal("${a.b}");
		});
	});

	describe("recursive resolution", () => {
		//getLocalizedMessage re-scans its output until it stops changing, so a
		//value that itself contains a token resolves fully. A pass cap breaks
		//self-referential cycles.
		it("resolves a token embedded in a resolved value (object dict)", () => {
			const dict = { outer: "x ${inner}", inner: "Y" };
			expect(getLocalizedMessage(dict, "${outer}")).to.equal("x Y");
		});

		it("resolves a token embedded in a resolved value (function dict)", () => {
			const dict = (name) => (name === "outer" ? "x ${inner}" : "Y");
			expect(getLocalizedMessage(dict, "${outer}")).to.equal("x Y");
		});

		it("leaves a resolved value intact when it has no tokens", () => {
			const dict = { outer: "plain" };
			expect(getLocalizedMessage(dict, "${outer}")).to.equal("plain");
		});
	});
});

describe("stringifyStatValue", () => {
	it("appends '%' to percentage stats", () => {
		expect(stringifyStatValue("magicFind", 50)).to.equal("50%");
		expect(stringifyStatValue("attackSpeed", 10)).to.equal("10%");
	});

	it("appends '%' to stats ending in 'Percent'", () => {
		expect(stringifyStatValue("elementFirePercent", 20)).to.equal("20%");
	});

	it("appends '%' to element* stats (except Resist)", () => {
		expect(stringifyStatValue("elementAllResist", 10)).to.equal("10");
		expect(stringifyStatValue("elementFireResist", 10)).to.equal("10");
	});

		it("divides crit-chance stats by 20 and appends '%' when the stat is a percentage stat", () => {
			//addCritChance is in percentageStats, so it's divided and gets '%'.
			expect(stringifyStatValue("addCritChance", 100)).to.equal("5%");
			expect(stringifyStatValue("addAttackCritChance", 40)).to.equal("2%");
		});

		it("divides crit-chance stats by 20 but adds no '%' when the stat isn't a percentage stat", () => {
			//attackCritChance matches the CritChance suffix but isn't listed in percentageStats, so it's divided without a '%' suffix.
			expect(stringifyStatValue("attackCritChance", 40)).to.equal("2");
		});

	it("returns plain stats as a string without '%'", () => {
		expect(stringifyStatValue("armor", 30)).to.equal("30");
		expect(stringifyStatValue("str", 12)).to.equal("12");
	});
});

describe("translate", () => {
	const dict = {
		characters: {
			deleteCountdown: "click delete ${countdown} more time${s} to confirm"
		}
	};

	it("resolves a dotted message path against the dictionary", () => {
		//countdown=3, s="s" → "...3 more times to confirm"
		expect(translate(dict, "characters", "deleteCountdown", { countdown: 3, s: "s" }))
			.to.equal("click delete 3 more times to confirm");
	});

	it("substitutes runtime tokens passed via the trailing object", () => {
		expect(translate(dict, "characters", "deleteCountdown", { countdown: 1, s: "" }))
			.to.equal("click delete 1 more time to confirm");
		expect(translate(dict, "characters", "deleteCountdown", { countdown: 2, s: "s" }))
			.to.equal("click delete 2 more times to confirm");
	});

	it("supports the singular/plural toggle the UI uses (s: '' vs 's')", () => {
		//characters.js computes s = (deleteCount === 3) ? "" : "s"
		const render = (deleteCount) => translate(
			dict
			, "characters"
			, "deleteCountdown"
			, { countdown: 4 - deleteCount, s: (deleteCount === 3) ? "" : "s" }
		);
		expect(render(1)).to.equal("click delete 3 more times to confirm");
		expect(render(2)).to.equal("click delete 2 more times to confirm");
		expect(render(3)).to.equal("click delete 1 more time to confirm");
	});

	it("leaves an omitted runtime token intact (full ${token})", () => {
		//${s} is unknown to the dictionary and not in the object → survives as ${s}.
		expect(translate(dict, "characters", "deleteCountdown", { countdown: 2 }))
			.to.equal("click delete 2 more time${s} to confirm");
	});

	it("merges the object over the dictionary (object tokens override)", () => {
		const withDictDefault = {
			characters: { deleteCountdown: "[${countdown}]" }
			, countdown: 99
		};
		//Object value wins over the dictionary's own countdown.
		expect(translate(withDictDefault, "characters", "deleteCountdown", { countdown: 5 }))
			.to.equal("[5]");
	});

	it("throws when the message path can't be resolved", () => {
		expect(() => translate(dict, "characters", "missing")).to.throw("couldn't be translated!");
	});
});

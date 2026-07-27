import { expect } from "chai"

//let expect;
let parseAcceptLanguage;
before(async () => {
	//expect = (await import("chai")).expect;

	parseAcceptLanguage = (await import("../server/misc/helpers.mjs")).default.parseAcceptLanguage;
});

describe("parseAcceptLanguage", () => {
	it("returns an empty array if passed null or undefined", () => {
		expect(parseAcceptLanguage(null)).to.deep.equal([]);
		expect(parseAcceptLanguage(undefined)).to.deep.equal([]);
	});
	it("sorts by quality", () => {
		expect(parseAcceptLanguage("en")).to.deep.equal(["en"]);
		expect(parseAcceptLanguage("en-US")).to.deep.equal(["en-US"]);
		expect(parseAcceptLanguage("en-US, en")).to.deep.equal(["en-US", "en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5")).to.deep.equal(["en-US", "en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr")).to.deep.equal(["en-US","fr","en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr;q=0.8")).to.deep.equal(["en-US", "fr", "en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr;q=0.8, de")).to.deep.equal(["en-US", "de", "fr", "en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr;q=0.8, de;q=0.9")).to.deep.equal(["en-US", "de", "fr", "en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr;q=0.8, de;q=0.9, *")).to.deep.equal(["en-US", "de", "fr", "en"]);
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr;q=0.8, de;q=0.9, *;q=0.1")).to.deep.equal(["en-US", "de", "fr", "en"]);
		expect(parseAcceptLanguage("en;q=0.5, fr;q=0.8, de;q=0.9, *;q=0.1,en-US")).to.deep.equal(["en-US", "de", "fr", "en"]);
	});
	it("works with or without spaces", () => {
		expect(parseAcceptLanguage(" en-US, en ")).to.deep.equal(["en-US", "en"]);
		expect(parseAcceptLanguage("en-US,en")).to.deep.equal(["en-US", "en"]);
		expect(parseAcceptLanguage("en-US,en; q = 0.5, fr; q= 0.8,de; q= 0.9, *")).to.deep.equal(["en-US", "de", "fr", "en"]);
	});
	it("sort invalid 'q' values at the end", () => {
		// fr;z=0.6 is invalid
		expect(parseAcceptLanguage("en-US, en;q=0.5, fr;z=0.6, de;q=0.9, *")).to.deep.equal(["en-US", "de", "en", "fr"]);
	});
	describe("options.ignoreWildcard", () => {
		it("returns '*' if set to false", () => {
			const ignoreWildcard = false;
			expect(parseAcceptLanguage("en-US,*", { ignoreWildcard })).to.deep.equal([ "en-US", "*" ]);
		});
		it("ignores '*' if set to true", () => {
			const ignoreWildcard = true;
			expect(parseAcceptLanguage("en-US,*", { ignoreWildcard })).to.deep.equal([ "en-US" ]);
		});
		it("defaults to true", () => {
			expect(parseAcceptLanguage("en-US,*")).to.deep.equal(["en-US"]);
		});
	});
	describe("options.validate", () => {
		describe("ignores the passed locale if the callback", () => {
			it("throws", () => {
				const validate = (locale) => {
					if (locale === "en-US") {
						return locale;
					}
					throw new TypeError("Invalid locale");
				};
				expect(parseAcceptLanguage("en-US,fr-FR", { validate })).to.deep.equal([ "en-US" ]);
			});
			it("returns undefined", () => {
				const validate = (locale) => {
					if (locale === "en-US") {
						return locale;
					}
					return undefined;
				};
				expect(parseAcceptLanguage("en-US,fr-FR", { validate })).to.deep.equal([ "en-US" ]);
			});
			it("returns an empty array", () => {
				const validate = (locale) => {
					if (locale === "en-US") {
						return locale;
					}
					return [];
				};
				expect(parseAcceptLanguage("en-US,fr-FR", { validate })).to.deep.equal([ "en-US" ]);
			});
		});
	});
});

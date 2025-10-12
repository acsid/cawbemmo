describe("Client", () => {
	let browserStorage;
	beforeAll(() => new Promise(res => {
		require([ "helpers"
			, "/js/system/browserStorage.js"
		], (glExport
			, browserStorage_module
		) => {
			browserStorage = browserStorage_module;
			browserStorage.prefix = "testing";
			_.log.jasmine.info("Ready!");
			res();
		});
	}), 60 * 1000);
	it("should be able to use WebGL", () => {
		const canvas = document.createElement("canvas");
		// Get WebGLRenderingContext from canvas element.
		const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		// Report the result.
		expect(gl instanceof WebGLRenderingContext).toBeTrue();
	});
	it("is in secure context", () => {
		expect(window.isSecureContext).toBeTrue();
	});
	describe("localstorage", () => {
		const cleanStorage = function () {
			// Remove all storage items created while testing.
			for (const key of Object.keys(localStorage)) {
				if (key.startsWith("testing_")) {
					localStorage.removeItem(key);
				}
			}
		}
		const getUsedSpace = function () {
			let charCount = 0;
			for (const key of Object.keys(window.localStorage)) {
				if (window.localStorage.hasOwnProperty(key)) {
					charCount = key.length + window.localStorage.getItem(key).length + charCount;
				}
			}
			return charCount;
		}
		const getFreeSpace = function () {
			// The closer we are to the real size, the faster it returns.
			let maxCharSize = 10485760; // ~10MBytes
			let minCharSize = 0;
			const stopSize = 1024 * 1; // ~ 1KBytes
			const testKey = "testing_spaceQuota";
			let lastRunFailed = false;
			do {
				let trySize = 1;
				try {
					trySize = Math.ceil((maxCharSize - minCharSize) / 2) + minCharSize;
					window.localStorage.setItem(testKey, '1'.repeat(trySize));
					minCharSize = trySize;
					lastRunFailed = false;
				} catch {
					maxCharSize = trySize - 1;
					lastRunFailed = true;
				}
			} while (maxCharSize - minCharSize > stopSize);
			window.localStorage.removeItem(testKey);
			return minCharSize + testKey.length - (lastRunFailed ? 1 : 0);
		}

		let usedSpace = 0;
		let freeSpace = 0;
		beforeAll(() => {
			cleanStorage();
			usedSpace = getUsedSpace();
			freeSpace = getFreeSpace();
		});

		it("should use specified prefixes", () => {
			browserStorage.set("foo", true);
			expect(localStorage.getItem("testing_foo")).toEqual("true");
		});
		it("should have enough freespace", () => {
			expect(freeSpace).toBeGreaterThan(1 * 1024 * 1024);
		});
		it("should not be too full in %%", () => {
			expect(usedSpace / (freeSpace + usedSpace)).toBeLessThan(0.88);
		});
		afterAll(() => {
			cleanStorage();
		});
	});
	describe("#addons", () => {
		beforeEach(() => {
			if (window.addons && Array.isArray(window.addons.addons)) {
				window.addons.addons = [];
			}
		});
		it("exposes an API to register addons", () => {
			expect(window.addons).toBeDefined();
			expect(typeof window.addons).toBe("object");
			expect(typeof addons.register).toBe("function");
			const testAddon = {
				init: (events) => {}
			}
			const spyObj = spyOn(testAddon, "init");
			addons.register(testAddon);
			const eventList = [ "foo" ];
			addons.init(eventList);
			expect(spyObj).toHaveBeenCalledWith(eventList);
		});
	});
});

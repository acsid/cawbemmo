import * as chai from "chai";

import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import * as sinon from "sinon";

describe("retry", () => {
	let assert, expect;
	before(async () => {
		assert = chai.assert;
		expect = chai.expect;

		global._ = (await import("../common/globals.mjs")).default;
		const logging = (await import("../common/logging.mjs")).default;
		_.log = logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler((thisLogger, logLevel, args) => console.log(args), () => true)});
	});
	it("will execute", async () => {
		const fakeFn = sinon.fake();
		const reFn = _.retry(fakeFn, 1, () => {
			throw new Error("should not fail.");
		});
		reFn();
		sinon.assert.callCount(fakeFn, 1);
		reFn();
		sinon.assert.callCount(fakeFn, 2);
	});
	it("will retry on error", async () => {
		const fakeFn = sinon.fake();
		let count = 1;
		const reFn = _.retry(() => {
			count = 1 + count;
			fakeFn();
			if (count % 2 === 0) {
				throw new Error();
			}
		}, 3);
		reFn();
		sinon.assert.callCount(fakeFn, 2);
		reFn();
		sinon.assert.callCount(fakeFn, 4);
	});
	it("will fail after retry amount", async () => {
		const fakeFn = sinon.fake();
		const reFn = _.retry(() => {
			fakeFn();
			throw new Error();
		}, 3);
		expect(reFn).to.throw();
		sinon.assert.callCount(fakeFn, 4);
		expect(reFn).to.throw();
		sinon.assert.callCount(fakeFn, 8);
	});
	it("will abort if onError throws", async () => {
		const fakeFn = sinon.fake();
		const reFn = _.retry(() => {
			fakeFn();
			throw new Error();
		}, 3, () => { throw new Error(); });
		expect(reFn).to.throw();
		sinon.assert.callCount(fakeFn, 1);
		expect(reFn).to.throw();
		sinon.assert.callCount(fakeFn, 2);
	});
	describe("async", () => {
		it("will execute", async () => {
			const fakeFn = sinon.fake();
			const reFn = _.retry(async () => {
				await _.asyncDelay(1);
				fakeFn();
			}, 1, () => {
				throw new Error("should not fail.");
			});
			await assert.isFulfilled(reFn());
			sinon.assert.callCount(fakeFn, 1);
			await assert.isFulfilled(reFn());
			sinon.assert.callCount(fakeFn, 2);
		});
		it("will retry on error", async () => {
			const fakeFn = sinon.fake();
			let count = 1;
			const reFn = _.retry(async () => {
				await _.asyncDelay(1);
				count = 1 + count;
				fakeFn();
				if (count % 2 === 0) {
					throw new Error();
				}
			}, 3, () => _.asyncDelay(1));
			await assert.isFulfilled(reFn());
			sinon.assert.callCount(fakeFn, 2);
			await assert.isFulfilled(reFn());
			sinon.assert.callCount(fakeFn, 4);
		});
		it("will fail after retry amount", async () => {
			const fakeFn = sinon.fake();
			const reFn = _.retry(async () => {
				await _.asyncDelay(1);
				fakeFn();
				throw new Error();
			}, 3, () => _.asyncDelay(1));
			await assert.isRejected(reFn(), Error);
			sinon.assert.callCount(fakeFn, 4);
			await assert.isRejected(reFn(), Error);
			sinon.assert.callCount(fakeFn, 8);
		});
		it("will abort if onError throws", async () => {
			const fakeFn = sinon.fake();
			const reFn = _.retry(async () => {
				await _.asyncDelay(1);
				fakeFn();
				throw new Error();
			}, 3, async () => {
				await _.asyncDelay(1)
				throw new Error();
			});
			await assert.isRejected(reFn(), Error);
			sinon.assert.callCount(fakeFn, 1);
			await assert.isRejected(reFn(), Error);
			sinon.assert.callCount(fakeFn, 2);
		});
	});
});

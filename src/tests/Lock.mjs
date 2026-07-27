//const expect = (await require("chai")).expect;
//import { expect} from "chai"
import { fake, assert as _assert } from "sinon";

let assert, expect;
before(async () => {
	const chai = (await import("chai"));
	const chaiAsPromised = (await import("chai-as-promised")).default;
	chai.use(chaiAsPromised);
	assert = chai.assert;
	expect = chai.expect;

	global._ = (await import("../common/globals.mjs")).default;
	const logging = (await import("../common/logging.mjs")).default;
	_.log = logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler(() => {}, () => {})});
});

describe("Lock", () => {
	it("will execute one at a time", async () => {
		const lock = new _.Lock("test_lock");
		const fakeFn = fake();
		lock.request(async () => {
			await _.asyncDelay(5);
		});
		lock.request(fakeFn);
		_assert.notCalled(fakeFn);
		await lock.request(() => {
			_assert.callCount(fakeFn, 1);
			fakeFn();
		});
		_assert.callCount(fakeFn, 2);
	});
	it("will release on error", async () => {
		const lock = new _.Lock("test_lock");
		const fakeFn = fake();
		const failedPromise = lock.request(async () => {
			await _.asyncDelay(5);
			throw new Error("Unexpected test error!");
		});
		lock.request(fakeFn);
		_assert.notCalled(fakeFn);
		await expect(failedPromise).to.eventually.be.rejectedWith(Error);
		await expect(lock.request(() => 4)).to.eventually.be.equal(4);
		_assert.called(fakeFn);
	});
});

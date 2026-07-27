//const expect = (await require("chai")).expect;
//import { expect} from "chai"
const scheduler = require("../server/misc/scheduler.js");

let expect;
before(async () => {
	expect = (await import("chai")).expect;
});

describe("Scheduler", function() {
	describe("Utilities functions", function() {
		it("can get current time", function() {
			const timeObj = {
				minute: 56
				, hour: 20
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			};
			expect(scheduler.getTime(1719968180165)).to.deep.equal(timeObj);
		});
	});
	describe("Cron notation", function() {
		it("runs at the right time in minutes", function() {
			scheduler.init({
				minute: 0
				, hour: 21
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			});
			let c = { cron: "*/2 * * * *" };
			let currentTime = {
				minute: 2
				, hour: 21
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			};
			expect(scheduler.shouldRun(c, currentTime)).to.equal(true);

			currentTime.minute = 58;
			scheduler.update(currentTime);
			currentTime.minute = 59;
			c = { cron: "0 * * * *" };
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);
			scheduler.update(currentTime);
			currentTime.minute = 0;
			currentTime.hour = 22;
			expect(scheduler.shouldRun(c, currentTime)).to.equal(true);
		});
		it("runs at the right hour", function() {
			let currentTime = {
				minute: 57
				, hour: 20
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			};
			// 20:57
			scheduler.init(currentTime);
			currentTime.minute = 58;
			let c = { cron: "0 */2 * * *" };
			// 20:58
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);

			scheduler.update(currentTime);
			currentTime.minute = 59;
			// 20:59
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);

			scheduler.update(currentTime);
			currentTime.minute = 0;
			currentTime.hour = 21;
			// 21:00
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);

			scheduler.update(currentTime);
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);
			currentTime.minute = 1;
			// 21:01
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);

			scheduler.update(currentTime);
			currentTime.minute = 59;
			// 21:59
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);

			scheduler.update(currentTime);
			currentTime.minute = 0;
			currentTime.hour = 22;
			// 22:00
			expect(scheduler.shouldRun(c, currentTime)).to.equal(true);

			scheduler.update(currentTime);
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);
			currentTime.minute = 1;
			// 22:01
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);

			currentTime.hour = 21;
			currentTime.minute = 58;
			scheduler.update(currentTime);
			c = { cron: "0 22 * * *" };
			// 21:58
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);
			scheduler.update(currentTime);
			currentTime.minute = 59;
			// 21:59
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);
			scheduler.update(currentTime);
			currentTime.minute = 0;
			currentTime.hour = 22;
			// 22:00
			expect(scheduler.shouldRun(c, currentTime)).to.equal(true);
		});
		it("can determine when task is active", function() {
			let currentTime = {
				minute: 2
				, hour: 21
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			};
			let c = { cron: "*/2 * * * *" };
			expect(scheduler.isActive(c, currentTime)).to.equal(true);
			currentTime.minute = 1;
			expect(scheduler.isActive(c, currentTime)).to.equal(false);
		});
		it("runs only once", function() {
			scheduler.init({
				minute: 0
				, hour: 21
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			})
			let c = { cron: "*/2 * * * *" };
			let currentTime = {
				minute: 2
				, hour: 21
				, day: 2
				, month: 7
				, year: 2024
				, weekday: 2
			};
			//First run
			expect(scheduler.shouldRun(c, currentTime)).to.equal(true);
			// Second run
			expect(scheduler.shouldRun(c, currentTime)).to.equal(false);
		});
	});
});

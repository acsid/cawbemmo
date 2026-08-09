const scheduler = require("../../misc/scheduler");
const rewardGenerator = require("../../misc/rewardGenerator");

const serverConfig = require("../../config/serverConfig");

const MAX_REWARDED_DAYS = 21;

const calculateDaysSkipped = (oldTime, newTime) => {
	let daysSkipped = 1;
	if (oldTime.year === newTime.year && oldTime.month === newTime.month) {
		//Same year and month
		daysSkipped = newTime.day - oldTime.day;
	} else if (oldTime.year === newTime.year) {
		//Same month
		let daysInMonth = scheduler.daysInMonth(oldTime.month);
		daysSkipped = (daysInMonth - oldTime.day) + newTime.day;
		for (let i = oldTime.month + 1; i < newTime.month - 1; i++) {
			daysSkipped += scheduler.daysInMonth(i);
		}
	} else {
		//Different year and month
		const daysInMonth = scheduler.daysInMonth(oldTime.month);
		daysSkipped = (daysInMonth - oldTime.day) + newTime.day;
		for (let i = oldTime.year + 1; i < newTime.year - 1; i++) {
			daysSkipped += 365;
		}
		for (let i = oldTime.month + 1; i < 12; i++) {
			daysSkipped += scheduler.daysInMonth(i);
		}
		for (let i = 0; i < newTime.month - 1; i++) {
			daysSkipped += scheduler.daysInMonth(i);
		}
	}
	return daysSkipped;
};

const checkLoginRewards = async (cpnAuth, character) => {
	const accountInfo = cpnAuth.accountInfo;

	const time = scheduler.getTime();
	let { lastLogin, loginStreak } = accountInfo;

	accountInfo.lastLogin = time;

	if (!lastLogin || (
		lastLogin.day === time.day &&
		lastLogin.month === time.month &&
		lastLogin.year === time.year
	)) {
		// User has already connected today.
		return;
	}

	const daysSkipped = calculateDaysSkipped(lastLogin, time);
	if (daysSkipped === 1) {
		loginStreak++;
	} else {
		loginStreak = 1;
	}
	accountInfo.loginStreak = loginStreak;

	const cappedLoginStreak = Math.max(1, Math.min(MAX_REWARDED_DAYS, loginStreak));
	const itemCount = 1 + Math.floor(cappedLoginStreak / 2);
	const rewards = rewardGenerator(itemCount);
	if (!rewards) {
		return;
	}
	const msg = `Daily login reward for ${loginStreak} day${(loginStreak > 1) ? "s" : ""}`;

	//Hack: Mail is a mod. As such, events should be a mod that depends on mail
	if (global.mailManager) {
		await global.mailManager.sendSystemMail({
			to: character.name
			, subject: "Login Rewards"
			, msg
			, items: rewards
		});
	}
};

const updateStatus = function (cpnAuth, character) {
	const { username, accountInfo } = cpnAuth;
	if (serverConfig.admins?.includes(username)) {
		// Force as highest admin.
		accountInfo.level = 99;
	}
};

module.exports = {
	checkLoginRewards
	, updateStatus
};

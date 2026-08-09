const CRON_STEPS = ["minute", "hour", "day", "month", "weekday"];
const CRON_TIME_OVERFLOWS = [ 60, 24, 32, 12, 7 ];
module.exports = {
	cd: 1000

	, lastTime: null

	, init: function (time) {
		this.lastTime = time || this.getTime();
	}

	, update: function (time) {
		this.lastTime = time || this.getTime();
	}

	, isTimeMatch: function (cron, time) {
		cron = cron.split(" ");
		if (cron.length !== 5) {
			_.log.cron.error("Invalid cron notation '%s'.", cron.join(" "));
			return false;
		}
		if (!time) {
			time = this.lastTime || this.getTime();
		}
		for (const i in CRON_STEPS) {
			const t = CRON_STEPS[i];
			let f = cron[i].split("-");
			if (f[0] === "*") {
				continue;
			}
			const useTime = time[t];
			if (f.length === 1) {
				f = f[0].split("/");
				if (f.length === 1) {
					const options = f[0].split(",");
					let foundMatch = false;
					for (const o of options) {
						if (~~o === useTime) {
							foundMatch = true;
							break;
						}
					}
					if (foundMatch) {
						continue;
					} else {
						return false;
					}
				} else if ((useTime % f[1]) === 0) {
					continue;
				}
			} else if (useTime >= f[0] && useTime <= f[1]) {
				continue;
			}
			return false;
		}
		return true;
	}

	, isActive: function (c, time) {
		if (!time) {
			time = this.lastTime || this.getTime();
		}
		return this.isTimeMatch(c.cron, time);
	}

	, isPlanned: function (cron, lastTime, time) {
		cron = cron.split(" ");
		if (cron.length !== 5) {
			_.log.cron.error("Invalid cron notation '%s'.", cron.join(" "));
			return false;
		}
		for (const i in CRON_STEPS) {
			const t = CRON_STEPS[i];
			let tCheck = cron[i];
			if (tCheck === "*") {
				continue;
			}
			const overflow = CRON_TIME_OVERFLOWS[i];
			let timeT = time[t];
			let lastTimeT = lastTime[t];
			if (timeT < lastTimeT) {
				timeT += overflow;
			} else if (timeT > lastTimeT) {
				lastTimeT++;
			}
			tCheck = tCheck.split(",");
			let foundMatch = false;
			for (let k = timeT - lastTimeT; k >= 0; --k) {
				let s = k + lastTimeT;
				const useTime = (s >= overflow) ? (s - overflow) : s;
				for (let f of tCheck) {
					f = f.split("-");
					if (f.length === 1) {
						f = f[0].split("/");
						if (f.length === 1) {
							if (useTime === Number.parseInt(f[0])) {
								foundMatch = true;
								break;
							}
						} else if (useTime % Number.parseInt(f[1]) === 0) {
							foundMatch = true;
							break;
						}
					} else if (useTime >= Number.parseInt(f[0]) && useTime <= Number.parseInt(f[1])) {
						foundMatch = true;
						break;
					}
				}
				if (foundMatch) {
					break;
				}
			}
			if (!foundMatch) {
				return false;
			}
		}
		return true;
	}

	, shouldRun: function (c, time) {
		if (!time) {
			time = this.getTime();
		}
		if (c.lastRun) {
			// If was runned before, check that time in minutes has changed since.
			let isCurrentTime = true;
			for (const e in c.lastRun) {
				if (c.lastRun[e] !== time[e]) {
					isCurrentTime = false;
					break;
				}
			}
			if (isCurrentTime) {
				return false;
			}
		}
		const run = this.isPlanned(c.cron, this.lastTime, time);
		if (run) {
			c.lastRun = time;
		}
		return run;
	}

	, getTime: function (dateValue) {
		const time = (dateValue === undefined
			? new Date()
			: new Date(dateValue)
		);
		return {
			minute: time.getMinutes()
			, hour: time.getHours()
			, day: time.getDate()
			, month: time.getMonth() + 1
			, year: time.getUTCFullYear()
			, weekday: time.getDay()
		};
	}

	, daysInMonth: function (month) {
		const year = (new Date()).getYear();
		return new Date(year, month, 0).getDate();
	}
};

const logging = require("../../common/logging");
const gExports = require("../../common/globals");

let consoleLogLevel = (process.env.NODE_ENV === "production"
	? logging.EventLevels.STANDARD
	: logging.EventLevels.DEBUG
);
if (process.env.LOG_LEVEL) {
	consoleLogLevel = Number.parseInt(process.env.LOG_LEVEL);
}
let consoleLogFilter = function (logger, logLvl, args) {
	return true;
};

const getColor = function (level) {
	if (!process.env.COLOR || process.env.COLOR === "false") {
		return "";
	}
	switch (level) {
	case logging.EventLevels.TRACE:
		return "\x1b[34m"; // Blue
	case logging.EventLevels.DEBUG:
		return "\x1b[36m"; // Cyan
	case logging.EventLevels.INFORMATIVE:
		return "\x1b[37m"; // White
	case logging.EventLevels.NOTICE:
		return "\x1b[32m"; // Green
	case logging.EventLevels.WARNING:
		return "\x1b[33m"; // Yellow
	case logging.EventLevels.ERROR:
		return "\x1b[31m"; // Red
	case logging.EventLevels.FATAL:
		return "\x1b[31m"; // Red
	case logging.EventLevels.CRITICAL:
		return "\x1b[35m"; // Magenta
	case logging.EventLevels.EMERGENCY:
		return "\x1b[35m"; // Magenta
	default:
		return "\x1b[37m"; // White
	}
};

const applyLogFn = function (thisLogger, logLevel, logFn, args) {
	if (typeof logFn === "string") {
		const fnName = logFn;
		logFn = console[fnName];
	}
	if (typeof logFn !== "function") {
		throw new Error("logFn is not a function.");
	}
	let msgIdx;
	const msgParts = [];
	const color = getColor(logLevel);
	//args = _mapArgsToString(...args);
	if (typeof args[0] === "string") { //Starts with string message
		const msg = args.shift();
		if (typeof thisLogger?.name !== "undefined" && thisLogger.name !== "System") {
			if (process.env.COLOR && process.env.COLOR !== "false") {
				msgParts.push(color);
				msgParts.push(`\x1b[1m${thisLogger.name} -->\x1b[0m `);
			} else {
				msgParts.push(`${thisLogger.name} --> `);
			}
		}
		msgParts.push(msg);
		msgIdx = logging.countRe(msg, "%[cdso]");
	} else {
		// Begins with an object
		// Add missing start messge
		if (typeof thisLogger?.name !== "undefined" && thisLogger.name !== "System") {
			if (process.env.COLOR && process.env.COLOR !== "false") {
				msgParts.push(color);
				msgParts.push(`\x1b[1m${thisLogger.name}-->\x1b[0m %o`);
			} else {
				msgParts.push(`${thisLogger.name} --> %o`);
			}
		} else {
			msgParts.push(`%o`);
		}
		msgIdx = 1;
	}
	const arLen = args.length;
	for (let iter = msgIdx; iter < arLen; ++iter) {
		if (typeof args[iter] === "string") {
			msgParts.push(" %s");
		} else {
			msgParts.push(" %o");
		}
	}
	args.unshift(msgParts.join(""));
	logFn.apply(console, args);
};
const consoleFnNames = {
	error: logging.EventLevels.ERROR
	 , warn: logging.EventLevels.WARNING
	 , info: logging.EventLevels.INFORMATIVE
	 , debug: logging.EventLevels.DEBUG
};
const printEvent = function (thisLogger, logLevel, args) {
	if (!Number.isInteger(logLevel) || (logLevel !== 0 && (logLevel & consoleLogLevel) === 0)) {
		return;
	}
	for (const n in consoleFnNames) {
		if (consoleFnNames[n] >= logLevel) {
			//eslint-disable-next-line no-console
			applyLogFn(thisLogger, logLevel, console[n], args);
			break;
		}
		if (n == "debug") { //Last item...
			//eslint-disable-next-line no-console
			applyLogFn(thisLogger, logLevel, (args?.length > 0 ? console.debug : console.trace), args);
		}
	}
	// Send notifications
	//if (logLevel === logging.EventLevels.EMERGENCY) {
	//TODO Send email on emergencies.
	//email.notify(message);
	//}
};

module.exports = gExports.CONSTANTS(gExports, {
	parseAcceptLanguage: function (languageHeaderValue, options = {}) {
	if (!languageHeaderValue) {
		return [];
	}
	const { ignoreWildcard = true, validate = (locale) => locale } = options;
	return languageHeaderValue
		.split(',')
		.map((lang) => {
			const [locale, q = 'q=1'] = lang.split(';');
			const trimmedLocale = locale.trim();
			const numQ = Number(q.replace(/q ?=/, ''));
			return [ (isNaN(numQ) ? 0 : numQ), trimmedLocale ];
		})
		.sort(([q1], [q2]) => q2 - q1)
		.flatMap(([_, locale]) => {
			if (locale === '*' && ignoreWildcard) {
				return [];
			}
			try {
				return validate(locale) || [];
			} catch {
				return [];
			}
		});
	}
	, safeRequire: function (moduleContext, path, logger) {
		try {
			return moduleContext.require(path);
		} catch (e) {
			(logger || _.log.NodeJS).error(`Failed to import "${path}" Error:`, e);
		}
	}

	, log: logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler(printEvent, consoleLogFilter) })
});

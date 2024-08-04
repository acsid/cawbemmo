/** logging.js - Base logging implementation.
 */

const SYMBOL_WEAK_MAP = Symbol("WeakLogMap");

const EventLevels = {
	// System is in a situation that poses an immediate risk,
	// require urgent intervention to prevent a worsening of the situation.
	EMERGENCY: 0

	// An error of sufficient magnitude that the system aborted all operations to protect itself.
	, FATAL: 1 << 0

	// An error of sufficient magnitude that it cannot be handled.
	// Should be corrected immediately. Impact system operations.
	, CRITICAL: 1 << 1

	// An error that prevents an operation from completing successfully,
	// Could be handled without affecting the system continued operation.
	// Should be corrected immediately, but the failure is in a secondary system. System remains functional.
	, ERROR: 1 << 2

	// Indication that an error will occur if no action is taken.
	, WARNING: 1 << 3

	// Events that are unusual but not error conditions.
	, NOTICE: 1 << 4

	// Normal operational messages.
	, INFORMATIVE: 1 << 5

	// Debug information that will only need to be seen when tracking down specific problems.
	, DEBUG: 1 << 6

	// Not sure if usefull, use Trace.
	// Spam box, Whatever info that could be usefull...
	, TRACE: 1 << 7

	// All messages will be logged.
	, ALL: 0xFF
};
// Minimal logging, errors and warning only.
EventLevels.MINIMUM = EventLevels.FATAL | EventLevels.CRITICAL | EventLevels.ERROR | EventLevels.WARNING;

// Standard messages will be logged.
EventLevels.STANDARD = EventLevels.MINIMUM | EventLevels.NOTICE | EventLevels.INFORMATIVE;

// Verbose, Standard and Debugging.
// Does not include Trace.
EventLevels.VERBOSE = EventLevels.STANDARD | EventLevels.DEBUG;

Object.freeze(EventLevels);

const createLogHandler = (printEvent, printFilter) => {
	if (typeof printEvent !== "function") {
		throw new Error("printEvent is not a function.");
	}
	if (typeof printFilter !== "function") {
		throw new Error("printFilter is not a function.");
	}
	const LogBase = function (name) {
		if (typeof name === "undefined") {
			throw new Error("Name is undefined.");
		} else if (typeof name === "string") {
			this.name = name;
		} else {
			throw new Error("Name is not a string.");
		}
	};
	LogBase.prototype.getCtor = () => LogBase;
	//Add log functions.
	for (const levelName in EventLevels) {
		const logLvl = EventLevels[levelName];
		LogBase.prototype[levelName.toLowerCase()] = function (...args) {
			if (!printFilter(this, logLvl, args)) {
				return;
			}
			printEvent(this, logLvl, args);
		};
	}
	LogBase.prototype.info = LogBase.prototype.informative;
	LogBase.prototype.warn = LogBase.prototype.warning;
	LogBase.prototype.print = function(logLvl, args) {
		printEvent(this, logLvl, args);
	};
	return LogBase;
};

const proxyHandler = Object.create(null);
proxyHandler.set = function (target, propertyKey, value, receiver) {
	Reflect.set(target, propertyKey, value, receiver);
};
const createLogger = function ({ parent, name, loggerCtor }) {
	if (typeof name !== "string") {
		throw new Error("name is not a string.");
	}
	let newLoggerName;
	if (typeof parent === "object" && typeof parent.name === "string" && parent.name !== "System") {
		newLoggerName = [parent.name, "->", name].join("");
	} else {
		//No parent.
		newLoggerName = name;
	}
	if (typeof loggerCtor !== "function") {
		if (typeof parent?.getCtor === "function") {
			loggerCtor = parent.getCtor();
			if (typeof loggerCtor !== "function") {
				throw new Error("parent.getCtor did not return a function.");
			}
		} else if (parent) {
			throw new Error("parent.createLogger is not a function.");
		} else {
			throw new Error("Without a parent, loggerCtor is required to be a function.");
		}
	}
	return new Proxy(new loggerCtor(newLoggerName), proxyHandler);
};
proxyHandler.get = function (target, propertyKey) {
	const propType = typeof propertyKey;
	if (propType === "undefined") {
		throw new Error("propertyKey is undefined.");
	}
	if (propertyKey in target) {
		return Reflect.get(target, propertyKey);
	}
	if (propType === "object") {
		//WeakMap keys must be objects, not primitive values
		let weakLogMap;
		if (typeof target[SYMBOL_WEAK_MAP] === "undefined") {
			weakLogMap = new WeakMap();
			target[SYMBOL_WEAK_MAP] = weakLogMap;
		} else {
			weakLogMap = target[SYMBOL_WEAK_MAP];
		}
		if (weakLogMap.has(propertyKey)) {
			return weakLogMap.get(propertyKey);
		}
		let newLoggerName;
		if (typeof propertyKey.name === "string") {
			newLoggerName = propertyKey.name;
		} else if (typeof propertyKey.toString === "function") {
			newLoggerName = propertyKey.toString();
		} else {
			//If function, propertyKey.displayName
			newLoggerName = propertyKey.prototype.name;
		}
		const newLog = createLogger({ parent: target, name: newLoggerName });
		weakLogMap.set(propertyKey, newLog);
		return newLog;
	}
	return createLogger({ parent: target, name: propertyKey });
};
Object.freeze(proxyHandler);

const replaceErrors = (key, value) => {
	if (value instanceof Error) {
		// Replace property getters by their values.
		const error = {};
		for (const propName of Object.getOwnPropertyNames(value)) {
			error[propName] = value[propName];
		}
		return error;
	}
	return value;
};

const valueToString = (a) => {
	const aType = typeof a;
	if (aType === "undefined") {
		return "undefined";
	} else if (aType === "string") {
		return a;
	} else if (typeof a.toString === "function" && !(a instanceof Error)) {
		return a.toString();
	}
	try {
		return JSON.stringify(a, replaceErrors, 4);
	} catch (ex) {
		// Converting circular structure to JSON
		return ex.toString();
	}
};
const mapArgsToString = (args) => {
	if (!Array.isArray(args)) {
		throw new Error("args must be an array.");
	}
	return args.map(valueToString);
};

const countRe = (str, re) => {
	if (typeof str !== "string") {
		throw new Error(`str need to be a string but an unexpected type of '${typeof str}' was received.`);
	}
	if (!re) {
		throw new Error("Missing Regex!");
	}
	if (!(re instanceof RegExp) || !re.global) {
		re = new RegExp(re, "gm");
	}
	const reMatches = str.match(re);
	if (!reMatches) {
		return 0;
	}
	return reMatches.length;
};

const tmpExport = {
	EventLevels
	, createLogger
	, createLogHandler

	, countRe
	, mapArgsToString
	, replaceErrors
	, valueToString
};
if (typeof define === "function") {
	define([], tmpExport);
} else {
	module.exports = tmpExport;
}

/* eslint-disable no-console */
import gExports from "/common/globals.mjs";
import logging from "/common/logging.mjs";

const urlParams = Object.fromEntries(window.location.search.substr(1).split("&").map((k) => k.split("=")));

window.isMobile = (
	urlParams.forceMobile === "true"
	|| /Mobi|Android/i.test(navigator.userAgent)
	|| (navigator.platform === "MacIntel"
		&& navigator.maxTouchPoints > 1
	)
);

window.scale = isMobile ? 32 : 40;
window.scaleMult = isMobile ? 4 : 5;

if (!window.navigator.vibrate) {
	window.navigator.vibrate = () => {};
}

let consoleLogLevel = logging.EventLevels.ALL;
let reportLogLevel = logging.EventLevels.NOTICE;
let consoleLogFilter = function (logger, logLvl, args) {
	return true;
};

const getColor = function (level) {
	switch (level) {
		case logging.EventLevels.TRACE:
			return "RoyalBlue";
		case logging.EventLevels.DEBUG:
			return "SeaGreen";
		case logging.EventLevels.INFORMATIVE:
			return "Gray";
		case logging.EventLevels.NOTICE:
			return "LimeGreen";
		case logging.EventLevels.WARNING:
			return "Gold";
		case logging.EventLevels.ERROR:
			return "Orangered";
		case logging.EventLevels.FATAL:
			return "Crimson";
		case logging.EventLevels.CRITICAL:
			return "MediumVioletRed";
		case logging.EventLevels.EMERGENCY:
			return "DeepPink";
		default:
			return "Gray";
	}
};

let nextSendDelay = 0;
const sendLogBuffer = async function (logData) {
	if (nextSendDelay > 0) {
		await _.asyncDelay(nextSendDelay);
		nextSendDelay = 0;
	}
	const response = await fetch("/log", {
		method: "POST"
		, headers: {
			"Content-Type": "application/json"
		}
		, body: JSON.stringify(logData)
	});
	if (!response.ok) {
		nextSendDelay = (response.headers.get("Retry-After") || 5) * 1000;
		throw new Error(`HTTP${response.status}:${response.statusText}`);
	}
	return await response.json();
};

const bufferedLogEvents = [];
let sendingPromise;
const processLogBuffer = function () {
	if (sendingPromise?.isPending) {
		return;
	}
	if (bufferedLogEvents.length <= 0) {
		return;
	}
	try {
		const tmpEventsArray = [...bufferedLogEvents];
		bufferedLogEvents.length = 0;
		const sp = sendLogBuffer(tmpEventsArray);
		sendingPromise = _.makeQuerablePromise(sp);
		sp.then(processLogBuffer, () => bufferedLogEvents.unshift(...tmpEventsArray));
		sp.catch(console.error);
	} catch (err) {
		console.error(err);
	}
};

const printCss = function (cssStyle) {
	if (typeof cssStyle === "undefined") {
		return [
			"background: linear-gradient(#D33106, #571402)"
			, "border: 1px solid #3E0E02"
			, "color: white"
			, "display: block"
			, "text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)"
			, "box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset"
			, "line-height: 40px"
			, "text-align: center"
			, "font-weight: bold"
			, "padding: 3px calc(50% - 128px)"
		].join(";");
	} else if (typeof cssStyle === "object") {
		return Object.keys(cssStyle).map((csKey) => `${csKey}:${logging.valueToString(cssStyle[csKey])}`).join(";");
	} else if (typeof cssStyle !== "string") {
		throw new Error(`Unexpected cssStyle "${typeof cssStyle}".`);
	}
	return cssStyle;
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
	const cssStyle = printCss({ color });
	const preTab = `color: black; background-color: ${color}; padding: 2px 6px; border-radius: 2px; font-size:10px`;
	if (typeof args[0] === "string") {
		//Starts with string message
		const msg = args.shift();
		if (typeof thisLogger?.name !== "undefined" && thisLogger.name !== "System") {
			msgParts.push(`%c${thisLogger.name} %c `);
			msgParts.push(msg);
			args.unshift(preTab, cssStyle);
			msgIdx = 2;
		} else {
			msgParts.push("%c");
			msgParts.push(msg);
			args.unshift(cssStyle);
			msgIdx = 1;
		}
		msgIdx += logging.countRe(msg, "%[cdso]");
	} else if (typeof thisLogger?.name !== "undefined" && thisLogger.name !== "System") { // Begins with an object... Add missing start messge
		msgParts.push(`%c${thisLogger.name} %c$o`);
		args.unshift(preTab, cssStyle);
		msgIdx = 3;
	} else { // Begins with an object... Add missing start messge
		msgParts.push(`%c%o`);
		args.unshift(cssStyle);
		msgIdx = 2;
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

const printEvent = function (thisLogger, logLevel, args) {
	if (!Number.isInteger(logLevel) || (logLevel !== 0 && (logLevel & consoleLogLevel) === 0)) {
		return;
	}
	if (logLevel <= logging.EventLevels.ERROR) {
		console.error(...args);
	} else if (logLevel <= logging.EventLevels.WARNING) {
		console.warn(...args);
	} else {
		const fnName = (logLevel <= logging.EventLevels.INFORMATIVE ? "info" : "debug");
		applyLogFn(thisLogger, logLevel, console[fnName], [...args]);
	}
	if (logLevel === 0 || logLevel <= reportLogLevel) {
		// Send back to server.
		args = logging.mapArgsToString(args);
		if (typeof thisLogger?.name !== "undefined" && thisLogger.name !== "System") {
			args.unshift(`<{${thisLogger.name}}>`);
		}
		args.unshift(logLevel);
		bufferedLogEvents.push(args);
		processLogBuffer();
	}
};

window.addEventListener("unhandledrejection", (e) => {
	const stackString = String(e.reason.stack);
	if (stackString.includes("TypeError: Failed to fetch")) {
		// When connexion is lost, dont keep those errors.
		return;
	}
	bufferedLogEvents.push([ logging.EventLevels.ERROR, "Unhandled promise rejection.", stackString ]);
	processLogBuffer();
});

window.addEventListener("error", (e) => {
	bufferedLogEvents.push([ logging.EventLevels.FATAL, "Unhandled error encountered.", String(e.error.stack) ]);
	processLogBuffer();
});

window._ = {
	toggleFullScreen: function () {
		const doc = window.document;
		if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
			const docEl = doc.documentElement;
			const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
			requestFullScreen.call(docEl);
		} else {
			const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
			cancelFullScreen.call(doc);
		}
	}

	, isIos: function () {
		return ([
			"iPad Simulator"
			, "iPhone Simulator"
			, "iPod Simulator"
			, "iPad"
			, "iPhone"
			, "iPod"
		].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document));
	}

	, loadHTML: async function (url, options = {}) {
		options = Object.assign({
			parentElement: "template"
			, raw: false
		}, options);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		const htmlSrc = await response.text();
		if (options.raw) {
			return htmlSrc;
		}
		const element = document.createElement(options.parentElement);
		element.innerHTML = htmlSrc;
		return element;
	}

	, log: logging.createLogger({ name: "System", loggerCtor: logging.createLogHandler(printEvent, consoleLogFilter) })
};

export default gExports.CONSTANTS(gExports, window._);

/** locale.mjs - Portable, DOM-free localisation helpers shared by client and server.
 * Moved verbatim from client/js/locale/index.js. The DOM-bound pieces
 * (localizeHTML, getLanguage, init) remain client-only.
 */

const percentageStats = [
	"addCritChance"
	, "addCritMultiplier"
	, "addAttackCritChance"
	, "addAttackCritMultiplier"
	, "addSpellCritChance"
	, "addSpellCritMultiplier"
	, "sprintChance"
	, "xpIncrease"
	, "blockAttackChance"
	, "blockSpellChance"
	, "dodgeAttackChance"
	, "dodgeSpellChance"
	, "attackSpeed"
	, "castSpeed"
	, "itemQuantity"
	, "magicFind"
	, "catchChance"
	, "catchSpeed"
	, "fishRarity"
	, "fishWeight"
	, "fishItems"
];

const getMessage = function getMessage (target, nParts, curPath = []) {
	if (!Array.isArray(nParts) || nParts.length <= 0) {
		return target;
	}
	if (typeof target !== "object") {
		return undefined;
	}
	const np = nParts.shift();
	const subTarget = target[np];
	curPath.push(np);

	if (!subTarget) {
		return undefined;
	}
	return getMessage(subTarget, nParts, curPath);
};

const _reLocAllMsg = new RegExp("\\${(\\S+?)}", "gm");
const getLocalizedMessage = function getLocalizedMessage (dictionary, message) {
	// Parse messages and replace localized strings tokens when found.
	// Return unmoddified message if not a localized string.
	if (!dictionary) {
		throw new Error("Missing dictionary!");
	}
	if (typeof message !== "string") {
		return message;
	}
	const logger = _.log.getLocalizedMessage;
	const replaceOnce = (input) => input.replaceAll(_reLocAllMsg, (match, msgName) => {
		msgName = msgName.trim();
		if (!msgName) {
			logger.warn(`The localised message "${match}" is invalid as it results into an empty name.`);
			return match;
		}
		if (!msgName.includes(".")) {
			if (typeof dictionary === "object" && Object.prototype.has.call(dictionary, msgName)) {
				return dictionary[msgName];
			} else if (typeof dictionary === "function") {
				const strMsg = dictionary(msgName);
				return (typeof strMsg === "string" ? strMsg : match);
			}
			return match;
		}
		const nameParts = msgName.split(".");
		if (typeof dictionary === "function") {
			const strMsg = dictionary(...nameParts);
			if (strMsg === undefined || strMsg === null) {
				return match;
			}
			return strMsg;
		} else if (typeof dictionary === "object") {
			//Coalesce a missing path to the full ${token}: without this,
			// getMessage returns undefined and String.replaceAll substitutes the literal string "undefined" into the message.
			return getMessage(dictionary, nameParts) ?? match;
		}
		return match;
	});

	// Re-scan until the message stops changing, so a value that itself contains
	// a token (e.g. a help string embedding ${key.*}) resolves fully.
	// Cap the passes to break self-referential cycles (a token whose value contains the same token).
	let result = message;
	for (let pass = 0; pass < 10; pass++) {
		const next = replaceOnce(result);
		if (next === result) {
			return next;
		}
		result = next;
	}
	logger.warn(`Stopped resolving after 10 passes; possible self-referential token cycle in: ${message}`);
	return result;
};

const stringifyStatValue = function stringifyStatValue (statName, statValue) {
	if (statName.includes("CritChance")) {
		statValue = statValue / 20;
	}
	if (percentageStats.includes(statName) || statName.includes("Percent")
		|| (statName.startsWith("element") && !statName.includes("Resist"))
	) {
		statValue += "%";
	}
	return statValue + "";
};

// Resolve a message by path against a dictionary, with optional runtime-token replacement.
// The last argument may be:
//  - an object: merged over the dictionary as the replacement scope
//   (dictionary values fill unresolved tokens, the object overrides them);
//  - a function: used directly as the replacement dictionary;
//  - omitted: the dictionary itself is the replacement scope.
const translate = function translate (dictionary, ...propNames) {
	let replDict;
	const lastPropType = (propNames.length > 0 ? typeof propNames[propNames.length - 1] : undefined);
	if (lastPropType === "object") {
		replDict = Object.assign({}, dictionary, propNames.pop());
	} else if (lastPropType === "function") {
		replDict = propNames.pop();
	} else {
		replDict = dictionary;
	}

	const msg = getMessage(dictionary, propNames);
	if (typeof msg !== "string") {
		throw new Error(`propName "${propNames.join(".")}" couldn't be translated!`);
	}
	return getLocalizedMessage(replDict, msg);
};

export {
	_reLocAllMsg
	, percentageStats
	, getMessage
	, getLocalizedMessage
	, stringifyStatValue
	, translate
};

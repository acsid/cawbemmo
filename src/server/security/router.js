const { routerConfig: { signatures, allowed, allowTargetId, secondaryAllowed, globalAllowed, secondaryAllowTargetId } } = require("./routerConfig");

const DATA_TYPES_VALIDATORS = {
	boolean: (value) => typeof value === "boolean"
	, string: (value) => typeof value === "string"
	, stringOrNull: (value) => value === null || typeof(value) === "string"

	, number: (value) => Number.isFinite(value)
	, numberOrString: (value) => typeof value === "string" || Number.isFinite(value)

	, integer: (value) => Number.isInteger(value)
	, integerOrString: (value) => typeof value === "string" || Number.isInteger(value)

	, arrayOfStrings: (value) => Array.isArray(value) && value.every((v) => typeof(v) === "string")
	, arrayOfIntegers: (value) => Array.isArray(value) && value.every((v) => Number.isInteger(v))
};

const keysCorrect = function (obj, specs) {
	const specsValid = specs.every(({ key, dataType, optional, spec }) => {
		if (!Object.hasOwn(obj, key)) {
			return optional;
		}
		if (!dataType) {
			_.log.router.error("Property %s is missing it's dataType.", key);
			return false;
		}
		const validatorFn = DATA_TYPES_VALIDATORS[dataType];
		if (!validatorFn) {
			_.log.router.error(`Property ${key} has an unknown dataType "${dataType}"`);
			return false;
		}
		return validatorFn(obj[key], spec);
	});
	if (!specsValid) {
		return false;
	}
	// Check if obj has extra unallowed properties.
	for (const p in obj) {
		let valid = false;
		for (const sp of specs) {
			if (p === sp.key) {
				valid = true;
				break;
			}
		}
		if (!valid) {
			return false;
		}
	}
	//_.log.router.trace("Message keys correct.");
	return true;
};

DATA_TYPES_VALIDATORS.arrayOfObjects = (value, spec) => (
	Array.isArray(value)
	&& value.every((v) =>
		v !== null
		&& typeof v === "object"
		&& (!spec || keysCorrect(v, spec))
	)
);

DATA_TYPES_VALIDATORS.object = (value, spec) => (
	value !== null
	&& typeof(value) === "object"
	&& (!spec || keysCorrect(value, spec))
);

DATA_TYPES_VALIDATORS.integerNullOrObject = (value, spec) => (
	Number.isInteger(value)
	|| value === null
	|| (typeof value === "object" && keysCorrect(value, spec))
);

DATA_TYPES_VALIDATORS.integerNullObjectOrString = (value, spec) => (
	Number.isInteger(value)
	|| typeof value === "string"
	|| value === null
	|| (typeof value === "object" && keysCorrect(value, spec))
);

module.exports = {
	allowedCpn: function (msg) {
		const { cpn, method, data: { cpn: secondaryCpn, method: secondaryMethod, targetId } } = msg;
		const valid = allowed[cpn] && allowed[cpn].includes(method);
		if (!valid) {
			return false;
		}
		if (!secondaryCpn) {
			if (targetId !== undefined) {
				const canHaveTargetId = allowTargetId?.[cpn]?.includes(method);
				if (!canHaveTargetId) {
					return false;
				}
			}
			return true;
		}
		const secondaryValid = secondaryAllowed?.[secondaryCpn]?.includes(secondaryMethod);
		if (!secondaryValid) {
			return false;
		}
		if (targetId !== undefined) {
			const canHaveTargetId = secondaryAllowTargetId?.[secondaryCpn]?.includes(secondaryMethod);
			if (!canHaveTargetId) {
				return false;
			}
		}
		return true;
	}

	, allowedGlobal: function (msg) {
		return globalAllowed[msg.module]?.includes(msg.method);
	}

	, allowedGlobalCall: function (threadModule, method) {
		return globalAllowed[threadModule]?.includes(method);
	}

	, keysCorrect

	, signatureCorrect: function (msg, config) {
		if (config.callback !== "deferred") {
			if (config.callback && !msg.callback) {
				_.log.router.debug("Message callback missing!");
				return false;
			} else if (!config.callback && msg.callback) {
				_.log.router.debug("Unexpected message callback!");
				return false;
			}
		}
		const expectKeys = config.data;
		return this.keysCorrect(msg.data, expectKeys);
	}

	, isMsgValid: function (msg, source) {
		let signature;
		if (msg.module) {
			if (msg.threadModule !== undefined || msg.cpn !== undefined || msg.data.cpn !== undefined) {
				return false;
			}
			signature = signatures.global[msg.module]?.[msg.method];
		} else if (msg.threadModule) {
			if (msg.module !== undefined || msg.cpn !== undefined || msg.data.cpn !== undefined) {
				return false;
			}
			signature = signatures.threadGlobal[msg.threadModule]?.[msg.method];
		} else if (msg.cpn) {
			if (msg.module !== undefined || msg.threadModule !== undefined) {
				return false;
			}
			signature = signatures.cpnMethods[msg.cpn]?.[msg.method];
		}
		if (!signature) {
			_.log.router.debug("Message signature not found!");
			return false;
		}
		const result = this.signatureCorrect(msg, signature);
		if (!result || msg.cpn !== "player" || msg.method !== "performAction") {
			if (result && signature.allowWhenIngame === false && source?.name !== undefined) {
				return false;
			}
			return result;
		}
		const signatureThreadMsg = signatures.threadCpnMethods[msg.data.cpn]?.[msg.data.method];
		if (!signatureThreadMsg) {
			_.log.router.debug("ThreadMessage signature not found!");
			return false;
		}
		return this.signatureCorrect(msg.data, signatureThreadMsg);
	}
};

define([
], function (
) {
	const UNSET_VALUE = "{unset}";
	const getEntryName = (key, prefix) => {
		if (!prefix) {
			prefix = "iwd";
		}
		return `${prefix}_${key.toLowerCase()}`;
	};
	const browserStorage = {
		get: function (key) {
			const keyName = getEntryName(key, this.prefix);
			return localStorage.getItem(keyName) || UNSET_VALUE;
		}
		, set: function (key, value) {
			const keyName = getEntryName(key, this.prefix);
			localStorage.setItem(keyName, value);
		}
	};
	const buildConfigObj = (prefix, obj) => {
		obj.getKeyName = (key) => {
			return `${prefix}_${key}`;
		};
		obj.get = (key) => obj[key];
		obj.set = (key, value) => {
			obj[key] = value;
			browserStorage.set(obj.getKeyName(key), obj[key]);
		};
	};
	const loadValue = (config, key) => {
		const currentValue = browserStorage.get(config.getKeyName(key));
		if (currentValue === UNSET_VALUE) {
			return;
		}
		if (["true", "false"].includes(currentValue)) {
			config[key] = currentValue === "true";
			return;
		}
		const floatValue = Number.parseFloat(currentValue);
		if (Number.isFinite(floatValue)) {
			config[key] = floatValue;
			return;
		}
		config[key] = currentValue;
	};
	browserStorage.loadConfig = (prefix, config) => {
		const keys = Object.keys(config);
		buildConfigObj(prefix, config);
		for (const key of keys) {
			loadValue(config, key);
		}
		return config;
	};
	return browserStorage;
});

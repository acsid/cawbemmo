module.exports = {
	level: 9
	, get: async (req, res) => {
		const errors = await io.getAllAsync({
			table: "error"
			, isArray: true
			, noParse: true
		});
		res.jsonp(errors);
	}
	, delete: async (req, res) => {
		const nbrArgs = [
			req.query?.key
			, req.query?.keys
			, req.body?.key
			, req.body?.keys
		].reduce((accumulator, value) => accumulator + (value ? 1 : 0), 0);
		if (nbrArgs <= 0) {
			return res.status(400).jsonp({ message: "Request empty!", error: "No key(s) property was received." });
		}
		if (nbrArgs > 1) {
			return res.status(400).jsonp({ message: "Not successful", error: "Use only one key(s) property at a time." });
		}
		//TODO Sanitize keys args.
		const result = {};
		const key = req.query?.key || req.body?.key;
		if (key) {
			if (typeof key === "string") {
				result[key] = await io.deleteAsync({ table: "error", key }) || "deleted";
			} else {
				return res.status(400).jsonp({ message: "Not successful", error: "Key must be a string." });
			}
		}
		let keys = req.query?.keys || req.body?.keys;
		if (keys) {
			if (typeof keys === "string") {
				keys = keys.split("|");
			}
			if (Array.isArray(keys) && keys.every((k) => typeof k === "string")) {
				for (const k of keys) {
					result[k] = await io.deleteAsync({ table: "error", key: k }) || "deleted";
				}
			} else {
				return res.status(400).jsonp({ message: "Not successful", error: "Keys must be an array of strings." });
			}
		}
		res.jsonp(result);
	}
};

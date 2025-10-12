module.exports = {
	level: 9
	, get: async (req, res) => {
		const users = (await io.getAllAsync({
			table: "accountInfo"
			, isArray: true
		})).map(entry => ({ username: entry.key, ...entry.value }));

		const characterList = (await io.getAllAsync({
			table: "characterList"
			, isArray: true
		})).reduce((table, entry) => {
			table[entry.key] = entry.value;
			return table;
		}, {});
		for (const user of users) {
			user.characters = characterList[user.username];
		}

		res.jsonp(users);
	}
};

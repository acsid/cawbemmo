const { version, nodeEnv, realmName } = require("../../config/serverConfig");

module.exports = {
	get: (req, res) => {
		res.jsonp({
			version
			, type: nodeEnv
			, name: realmName
			, players: cons.players.length
		});
	}
};

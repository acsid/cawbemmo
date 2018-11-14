const serverConfig = require('../config/serverConfig');
const resVersion = {
	version: serverConfig.version
};

module.exports = {
	init: function (app) {
		app.get('/version', (req, res, next) => res.jsonp(resVersion));
	},

	willHandle: function (url) {
		if (url.includes('/version'))
			return true;
	}
};

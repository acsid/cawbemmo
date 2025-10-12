const express = require("express");
const events = require("../../misc/events");
const fileLister = require("../../misc/fileLister");

const willHandle = (url) => {
	return Object.keys(restEndpoints).some((k) => url.includes(`/${k}`));
};

const EXPRESS_ROUTES_HANDLERS = [
	"all", "get", "put", "post", "delete"
];

const createRouter = (options, modules) => {
	const restFiles = fileLister.getFiles("./server/restEndpoints/");
	const restEndpoints = {};
	for (const fName of restFiles) {
		if (!fName.endsWith(".js")) {
			continue;
		}
		const modName = fName.slice(0, fName.lastIndexOf("."));
		const mod = require("../restEndpoints/" + modName);
		if ("init" in mod) {
			mod.init(options[modName]);
		}
		restEndpoints[modName] = mod;
	}
	events.emit("onBeforeRegisterRestEndpoints", restEndpoints);

	const router = express.Router();
	for (const routeName in restEndpoints) {
		const mod = restEndpoints[routeName];
		const route = router.route("/" + routeName);
		if ("level" in mod) {
			const auth = modules.auth;
			route.all(auth.createAuth(mod.level));
		}
		for (const handlerName of EXPRESS_ROUTES_HANDLERS) {
			if (handlerName in mod) {
				route[handlerName](mod[handlerName]);
			}
		}
	}
	return router;
};

module.exports = {
	createRouter
	, willHandle
};

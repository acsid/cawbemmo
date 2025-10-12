//Imports
const http = require("http");

const socketIo = require("socket.io");

const express = require("express");
const compression = require("compression");
const minify = require("express-minify");
const lessMiddleware = require("less-middleware");
const cookieParser = require("cookie-parser");

const fileLister = require("../misc/fileLister");
const rest = require("../security/rest");

const API_ROUTES = {
	auth: {
		secret: undefined
	}
};

const {
	port = 4000
	, startupMessage = "Server: Ready"
	, nodeEnv = "production"
	, realmName = "main"
} = require("../config/serverConfig");

const IS_PROD = nodeEnv === "production";

const onConnection = require("./onConnection");
const { appRoot, appFile } = require("./requestHandlers");

const sharedFolders = [
	"/admin"
	, "/common"
	, "/server"
	, "/mods"
];

const onNewLogEvent = function(req, entry) {
	if (typeof entry !== "object") {
		_.log.UserLog[req.ip].info(entry);
		return;
	}
	if (!Array.isArray(entry) || typeof entry[0] !== "number") {
		_.log.UserLog[req.ip].info(JSON.stringify(entry, undefined, 4));
		return;
	}
	const logLevel = entry.shift();
	let userLogger = _.log.UserLog[req.ip];
	if (typeof entry[0] === "string" && entry[0].length > 4 && entry[0].startsWith("<{") && entry[0].endsWith("}>")) {
		let loggerName = entry.shift();
		userLogger = userLogger[loggerName.slice(2, -2)];
	}
	userLogger.print(logLevel, entry);
}

const loadRoute = function(rName, options, loadedAPIs) {
	const routeModule = require("./routes/" + rName);
	if ("createRouter" in routeModule) {
		routeModule.router = routeModule.createRouter(options, loadedAPIs);
		delete routeModule.createRouter;
	}
	loadedAPIs[rName] = routeModule;
	return routeModule;
};

//Methods
const init = async function () {
	const app = express();
	this.app = app;
	this.server = http.createServer(app);
	this.socketServer = socketIo(this.server, {
		transports: ["websocket"]
	});
	global.cons.sockets = this.socketServer.sockets;

	app.use(compression());
	if (IS_PROD) {
		app.use(minify());
	}

	app.use(cookieParser());
	app.use(express.json({ limit: "50mb" }));

	app.post("/log", (req, res) => {
		if (Array.isArray(req.body)) {
			for (const entry of req.body) {
				onNewLogEvent(req, entry);
			}
		} else {
			onNewLogEvent(req, req.body);
		}
		res.send({ response: "ok" });
	});

	const loadedAPIs = {};
	for (const apiName in API_ROUTES) {
		const routeModule = loadRoute(apiName, API_ROUTES[apiName], loadedAPIs);
		app.use("/api/" + apiName, routeModule.router);
		API_ROUTES[apiName] = routeModule;
	}
	const routeFiles = fileLister.getFiles("./server/routes/");
	for (const fName of routeFiles) {
		if (!fName.endsWith(".js")) {
			continue;
		}
		const apiName = fName.slice(0, fName.lastIndexOf("."));
		if (API_ROUTES[apiName]) {
			continue;
		}
		const routeModule = loadRoute(apiName, {}, loadedAPIs);
		app.use("/api/" + apiName, routeModule.router);
		API_ROUTES[apiName] = routeModule;
	}
	app.get("/admin", (req, res, next) => {
		if (req.path === "/admin") {
			return res.redirect("/admin/index.html");
		}
		next();
	});
	// Restrict javascript folder to authorized users only.
	app.get("/admin/js/", API_ROUTES.auth.createAuth(99), appFile);

	app.use((req, res, next) => {
		if (!rest.willHandle(req.url) && !sharedFolders.some((s) => req.url.startsWith(s))) {
			req.url = `/client/${req.url}`;
		}
		next();
	});
	app.use(lessMiddleware("../", {
		once: IS_PROD
		, force: !IS_PROD
	}));

	rest.init(app);

	app.get("/", appRoot);
	app.get(/^(.*)$/, appFile);

	this.socketServer.on("connection", onConnection);
	_.log.Server.info(`Starting server with 'NODE_ENV=${nodeEnv} REALM=${realmName} SRV_PORT=${port}'`);
	await new Promise((resolve) => this.server.listen(port, resolve));
	_.log.Server.info(startupMessage);
};

const close = async function () {
	if (this.closing) {
		return;
	}
	this.closing = true;
	_.log.Server.debug("Instance is closing...");

	// Ask all clients to disconnect.
	const sockets = await this.socketServer.fetchSockets();
	for (const socket of sockets) {
		socket.emit("dc");
	}
	// Wait for client to close the connection.
	let disconnectCountdown = 10;
	while (disconnectCountdown > 0 && sockets.some(s => s.connected)) {
		disconnectCountdown--;
		await _.asyncDelay(1000);
	}
	// Force disconnect all remaining clients.
	this.socketServer.disconnectSockets();
	_.log.Server.debug("Sockets closed...");

	// Close the server instance.
	await new Promise(resolve => this.server.close(resolve));
	_.log.Server.debug("Server closed...");
};

module.exports = {
	init
	, close
};

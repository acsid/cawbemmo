//Config
const validModPatterns = [".png", "/ui/", "/clientComponents/", "/audio/"];

const tempPath = __dirname.slice(0, __dirname.lastIndexOf("/"));
const basePath = tempPath.slice(0, tempPath.lastIndexOf("/"));

//Methods
const appRoot = (req, res) => {
	let path = req.path;
	if (!path || path === "/") {
		path = "/client/";
	}
	res.sendFile("index.html", {
		root: basePath + path
	});
};

const appFile = (req, res) => {
	let root = req.url.split("/")[1];
	// Express 5 wildcard "*splat" yields an array of path segments; join to a string.
	let file = req.params.splat;
	if (Array.isArray(file)) {
		file = file.join("/");
	}
	if (file.length <= root.length + 2) {
		file = "index.html";
	} else {
		file = file.replace(`/${root}/`, "");
	}

	const validRequest = (root !== "server"
		|| (root === "server"
			&& file.startsWith("clientComponents/")
		)
		|| (file.includes("mods/")
			&& validModPatterns.some((v) => file.includes(v))
		)
	);
	if (!validRequest) {
		return;
	}
	res.sendFile(file
		, {
			root: "../" + root
		}
		, (err) => {
			if (err) {
				res.status(404).end(err.message);
			}
		}
	);
};

//Exports
module.exports = {
	appRoot
	, appFile
};

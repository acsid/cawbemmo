const fileLister = require("../misc/fileLister");
const events = require("../misc/events");
const componentBase = require("./componentBase");

const ignoreFiles = [
	"components.js"
	, "componentBase.js"
];

module.exports = {
	components: {}

	, init: async function () {
		await events.emit("onBeforeGetComponents", this.components);
		const files = fileLister.getFiles("./components/");
		for (const file of files) {
			if (ignoreFiles.includes(file)) {
				continue;
			}
			this.getComponentFile("./" + file);
		}
	}
	, getComponentFile: function (path) {
		_.log.components.debug("Loading %s", path);
		const template = _.assign({}, componentBase, require(path));
		this.components[template.type] = template;
	}
};

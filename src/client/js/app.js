require.config({
	baseUrl: ""
	, waitSeconds: 120
	, paths: {
		assign: "/common/assign"
		, socket: "js/dependencies/socket.io.min"
		, jquery: "js/dependencies/jquery.slim.min"
		, text: "js/dependencies/text.min"
		, html: "plugins/html"
		, css: "js/dependencies/css.min"
		, main: "js/main"
		, helpers: "js/misc/helpers"
		, particles: "plugins/pixi.particles.min"
		, howler: "js/dependencies/howler.core.min"
		, longPress: "plugins/long.press.min"
	}
	, shim: {
		howler: {
			exports: "howl"
		}
		, socket: {
			exports: "io"
		}
		, jquery: {
			exports: "$"
		}
		, helpers: {
			deps: [
				"assign"
			]
			, exports: "_"
		}
		, main: {
			deps: [
				"jquery"
				, "helpers"
				, "js/input"
			]
		}
	}
});

require([
	"main"
], function (
	main
) {
	main.init();
});

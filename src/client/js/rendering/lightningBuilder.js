import renderer from "/js/rendering/renderer.js";

const BLEND_ADD = "add";

export default {
	build: function (config) {
		let obj = {
			lines: []
		};

		let maxDeviate = config.maxDeviate || (scale * 0.3);

		let fx = config.fromX * scale;
		let fy = config.fromY * scale;

		let tx = config.toX * scale;
		let ty = config.toY * scale;

		const linkSize = config.linkSize ?? 3;

		let angle = Math.atan2(ty - fy, tx - fx);
		let distance = Math.sqrt(Math.pow(tx - fx, 2) + Math.pow(ty - fy, 2));
		let divDistance = config.divDistance ?? Math.min(20, distance);
		let divisions = config.divisions || Math.max(1, distance / divDistance);

		let x = fx;
		let y = fy;

		for (let i = 0; i < divisions; i++) {
			let line = {
				sprites: []
			};

			let ntx = fx + (Math.cos(angle) * (divDistance * i)) + Math.floor(Math.random() * (maxDeviate * 2)) - maxDeviate;
			let nty = fy + (Math.sin(angle) * (divDistance * i)) + Math.floor(Math.random() * (maxDeviate * 2)) - maxDeviate;

			if (i === divisions - 1) {
				ntx = tx;
				nty = ty;
			}

			let nAngle = Math.atan2(nty - y, ntx - x);
			let steps = Math.floor(Math.sqrt(Math.pow(ntx - x, 2) + Math.pow(nty - y, 2)) / scaleMult);

			let patches = {};

			for (let j = 0; j < steps; j++) {
				let alpha = 1;
				if ((config.colors) && (i === divisions - 1) && (j > (steps * 0.75))) {
					alpha = 1 - (j / steps);
				}

				let c = _.getRandomObj(config.colors) || _.getRandomFrom(0xffeb38, 0xfaac45, 0xfafcfc);
				line.sprites.push(renderer.buildRectangle({
					x: Math.floor(x / scaleMult) * scaleMult
					, y: Math.floor(y / scaleMult) * scaleMult
					, w: scaleMult
					, h: scaleMult
					, alpha: alpha
					, color: c
					, layerName: "effects"
				}));

				let xx = x;
				let yy = y;
				if ((!patches[`${xx}-${yy}`]) && (!config.colors)) {
					patches[`${xx}-${yy}`] = 1;
					const lightPatch = renderer.buildObject({
						sheetName: "white"
						, x: 0
						, y: 0
						, cell: 0
						, layerName: "lightPatches"
					});
					lightPatch.x = Math.floor((xx - scaleMult) / scaleMult) * scaleMult;
					lightPatch.y = Math.floor((yy - scaleMult) / scaleMult) * scaleMult;
					lightPatch.width = scaleMult * linkSize;
					lightPatch.height = scaleMult * linkSize;
					lightPatch.alpha = Math.random() * 0.5;
					lightPatch.tint = "#ffffff";
					lightPatch.blendMode = BLEND_ADD;
					line.sprites.push(lightPatch);
				}
				x += Math.cos(nAngle) * scaleMult;
				y += Math.sin(nAngle) * scaleMult;
			}
			obj.lines.push(line);
		}
		return obj;
	}

	, toHex: function rgbToHex (r, g, b) {
		let componentToHex = function (c) {
			let hex = c.toString(16);
			return hex.length === 1 ? "0" + hex : hex;
		};

		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}

	, update: function (obj) {

	}

	, destroy: function (obj) {
		obj.lines.forEach(function (l) {
			l.sprites.forEach(function (s) {
				s.parent.removeChild(s);
			});
		});
	}
};

import renderer from "/js/rendering/renderer.js";

// v8: blend modes are strings, not PIXI.BLEND_MODES enums.
const BLEND_ADD = "add";

export default {
	type: "lightPatch"

	, color: "#ffeb38"
	, patches: []
	, rays: []

	, init: function (blueprint) {
		this.blueprint = this.blueprint || {};
		const obj = this.obj;
		const x = obj.x;
		const y = obj.y;
		const maxDistance = Math.sqrt(Math.pow(obj.width / 3, 2) + Math.pow(obj.height / 3, 2));
		for (let i = 0; i < obj.width; i++) {
			for (let j = 0; j < obj.height; j++) {
				let distance = maxDistance - Math.sqrt(Math.pow((obj.width / 2) - i, 2) + Math.pow((obj.width / 2) - j, 2));
				const maxAlpha = (distance / maxDistance) * 0.2;
				if (maxAlpha <= 0.05) {
					continue;
				}
				const sprite = renderer.buildObject({
					x: (x + i)
					, y: (y + j)
					, sheetName: "white"
					, cell: 0
					, layerName: "lightPatches"
				});
				const size = (3 + Math.floor(Math.random() * 6)) * scaleMult;
				sprite.width = size;
				sprite.height = size;
				sprite.x += scaleMult * Math.floor(Math.random() * 4);
				sprite.y += scaleMult * Math.floor(Math.random() * 4);
				sprite.tint = this.color;
				sprite.alpha = (maxAlpha * 0.3) + (Math.random() * (maxAlpha * 0.7));
				sprite.blendMode = BLEND_ADD;
				this.patches.push(sprite);
			}
		}

		const rCount = ((obj.width * obj.height) / 10) + Math.floor(Math.random() + 2);
		for (let i = 0; i < rCount; i++) {
			const nx = x + 3 + Math.floor(Math.random() * (obj.width - 1));
			const ny = y - 4 + Math.floor(Math.random() * (obj.height));
			const w = 1 + Math.floor(Math.random() * 2);
			const h = 6 + Math.floor(Math.random() * 13);
			const hm = 2;

			let rContainer = renderer.buildContainer({
				layerName: "lightBeams"
			});
			this.rays.push(rContainer);

			for (let j = 0; j < h; j++) {
				const ray = renderer.buildObject({
					x: nx
					, y: ny
					, cell: 0
					, sheetName: "white"
					, parent: rContainer
				});
				ray.x = Math.floor((nx * scale) - (scaleMult * j));
				ray.y = (ny * scale) + (scaleMult * j * hm);
				ray.width = w * scaleMult;
				ray.height = scaleMult * hm;
				ray.tint = 0xffeb38;
				ray.alpha = ((1.0 - (j / h)) * 0.4);
				ray.blendMode = BLEND_ADD;
			}
		}
		this.setVisible(obj.isVisible);
	}

	, update: function () {
		for (let r of this.rays) {
			r.alpha += (Math.random() * 0.03) - 0.015;
			if (r.alpha < 0.3) {
				r.alpha = 0.3;
			} else if (r.alpha > 1) {
				r.alpha = 1;
			}
		}
	}

	, setVisible: function (visible) {
		this.patches.forEach(function (p) {
			p.visible = visible;
		});

		this.rays.forEach(function (r) {
			r.visible = visible;
		});
	}

	, destroy: function () {
		this.patches.forEach(function (p) {
			p.parent.removeChild(p);
		});
		this.patches = [];

		this.rays.forEach(function (r) {
			r.parent.removeChild(r);
		});
		this.rays = [];
	}
};

import objBase from "/js/objects/objBase.js";
import events from "/js/system/events.js";
import renderer from "/js/rendering/renderer.js";
import sound from "/js/sound/sound.js";
import config from "/js/config.js";

const OBJECTS_EVENTS = [
	"onGetObject"
	, "onTilesVisible"
	, "onToggleNameplates"
	, "destroyAllObjects"
];

export default {
	objects: []

	, init: function () {
		events.on("onChangeHoverTile", this.getLocation.bind(this));
		for (const e of OBJECTS_EVENTS) {
			events.on(e, this[e].bind(this));
		}
	}

	, getLocation: function (x, y) {
		let objects = this.objects;
		let oLen = objects.length;

		let closest = 999;
		let mob = null;
		for (let i = 0; i < oLen; i++) {
			let o = objects[i];

			if (!o.stats || o.nonSelectable || o === window.player || !o.sprite || !o.sprite.visible) {
				continue;
			}

			let dx = Math.abs(o.x - x);
			if (dx < 3 && dx < closest) {
				let dy = Math.abs(o.y - y);
				if (dy < 3 && dy < closest) {
					mob = o;
					closest = Math.max(dx, dy);
				}
			}
		}

		events.emit("onMobHover", mob);
	}

	, getClosest: function (x, y, maxDistance, reverse, fromMob) {
		let objects = this.objects;

		let list = objects.filter((o) => {
			if ((!o.stats) || (o.nonSelectable) || (o === window.player) || (!o.sprite.visible)) {
				return false;
			}

			let dx = Math.abs(o.x - x);
			if (dx < maxDistance) {
				let dy = Math.abs(o.y - y);
				if (dy < maxDistance) {
					return true;
				}
			}
		});

		if (list.length === 0) {
			return null;
		}

		list.sort((a, b) => {
			let aDistance = Math.max(Math.abs(x - a.x), Math.abs(y - a.y));
			let bDistance = Math.max(Math.abs(x - b.x), Math.abs(y - b.y));

			return (aDistance - bDistance);
		});

		list = list.filter((o) => ((o.aggro) && (o.aggro.faction !== window.player.aggro.faction)));

		if (!fromMob) {
			return list[0];
		}

		let fromIndex = list.findIndex((l) => l.id === fromMob.id);

		if (reverse) {
			fromIndex = (fromIndex === 0 ? list.length : fromIndex) - 1;
		} else {
			fromIndex = (fromIndex + 1) % list.length;
		}

		return list[fromIndex];
	}

	, destroyAllObjects: function () {
		for (let o of this.objects) {
			o.destroy();
		}
		this.objects.length = 0;

		window?.player?.offEvents();
	}

	, onGetObject: function (obj) {
		//Things like attacks don't have ids
		let exists = null;
		if (obj.has("id")) {
			exists = this.objects.find(({ id, destroyed }) => id === obj.id && !destroyed);
		}

		if (!exists) {
			exists = this.buildObject(obj);
		} else {
			this.updateObject(exists, obj);
		}
	}

	, buildObject: function (template) {
		//console.log("Building object from template", template);
		let obj = _.assign({}, objBase);

		let components = template.components || [];
		delete template.components;

		let syncTypes = ["portrait", "area"];

		for (let p in template) {
			let value = template[p];
			let type = typeof (value);

			if (type === "object") {
				if (syncTypes.indexOf(p) > -1) {
					obj[p] = value;
				}
			} else {
				obj[p] = value;
			}
		}

		if (obj.sheetName) {
			obj.sprite = renderer.buildObject(obj);
		}

		if (obj.name && obj.sprite) {
			obj.nameSprite = renderer.buildText({
				layerName: "effects"
				, text: obj.name
				, x: (obj.x * scale) + (scale / 2)
				, y: (obj.y * scale) + scale
			});
		}

		if (template.filters && obj.sprite) {
			renderer.addFilter(obj.sprite, template.filters[0]);
		}

		//We need to set visibility before components kick in as they sometimes need access to isVisible
		obj.updateVisibility();

		for (const c of components) {
			//Map ids to objects
			for (const k in c) {
				if (!k.startsWith("id") || k.length <= 2) {
					continue;
				}
				const newKey = k.substr(2, k.length).toLowerCase();
				c[newKey] = this.objects.find((o) => o.id === c[k]);
				delete c[k];
			}
			obj.addComponent(c.type, c);
		}

		if (obj.self) {
			events.emit("onGetPlayer", obj);
			window.player = obj;

			sound.unload(obj.zoneId);

			renderer.setPosition({
				x: (obj.x - (renderer.width / (scale * 2))) * scale
				, y: (obj.y - (renderer.height / (scale * 2))) * scale
			}, true);
		}

		this.objects.push(obj);

		return obj;
	}

	, updateObject: function (obj, template) {
		//console.log("Updating object", obj);
		if (template.components) {
			for (const c of template.components) {
				//Map ids to objects
				for (const k in c) {
					if (!k.startsWith("id") || k.length <= 2) {
						continue;
					}
					const newKey = k.substr(2, k.length).toLowerCase();
					c[newKey] = this.objects.find((o) => o.id === c[k]);
					delete c[k];
				}
				obj.addComponent(c.type, c);
			}
			delete template.components;
		}

		if (template.removeComponents) {
			for (const r of template.removeComponents) {
				obj.removeComponent(r);
			}
			delete template.removeComponents;
		}

		let oldX = obj.x;

		let sprite = obj.sprite;
		for (let p in template) {
			let value = template[p];
			let type = typeof (value);

			if (type !== "object") {
				obj[p] = value;
			}

			if (p === "casting") {
				if (obj === window.player) {
					events.emit("onGetSelfCasting", value);
				} else {
					events.emit("onGetTargetCasting", obj.id, value);
				}
			}

			if (sprite) {
				if (p === "x") {
					if (obj.x < oldX) {
						obj.flipX = true;
					} else if (obj.x > oldX) {
						obj.flipX = false;
					}
				}
			}
		}

		if ((template.sheetName || template.cell) && sprite) {
			renderer.setSprite(obj);
		}

		if ((!obj.sprite) && (template.sheetName)) {
			obj.sprite = renderer.buildObject(obj);
		}

		if (template.filters && !obj.sprite?.filters?.length) {
			renderer.addFilter(obj.sprite, template.filters[0]);
		}

		if (template.name) {
			if (obj.nameSprite) {
				renderer.destroyObject({ sprite: obj.nameSprite });
			}

			obj.nameSprite = renderer.buildText({
				layerName: "effects"
				, text: template.name
				, x: (obj.x * scale) + (scale / 2)
				, y: (obj.y * scale) + scale
			});

			obj.nameSprite.visible = config.showNames;
		}

		if ((template.x !== 0) || (template.y !== 0)) {
			obj.updateVisibility();
			obj.setSpritePosition();

			if (obj.stats) {
				obj.stats.updateHpSprite();
			}
		}
	}

	, update: function () {
		const objects = this.objects;
		for (let i = objects.length - 1; i >= 0; --i) {
			const o = objects[i];
			if (o.destroyed) {
				o.destroy();
				objects.splice(i, 1);
				continue;
			}
			o.update();
		}
	}

	, onTilesVisible: function (tiles) {
		for (let o of this.objects) {
			let onPos;
			for (let t of tiles.visible.concat(tiles.hidden) ) {
				if (t.x === o.x && t.y === o.y) {
					onPos = true;
					break;
				}
			}
			if (!onPos) {
				continue;
			}
			o.updateVisibility();
		}
	}

	, onToggleNameplates: function (show) {
		for (let obj of this.objects) {
			const ns = obj.nameSprite;
			if (!ns || obj.dead
				|| (obj.sprite && !obj.sprite.visible)
			) {
				continue;
			}
			ns.visible = show;
		}
	}
};

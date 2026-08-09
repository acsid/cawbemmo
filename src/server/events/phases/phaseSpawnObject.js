const buildMob = (objects, mobConfig, i) => {
	const { id, sheetName, cell, name, properties } = mobConfig;
	let pos = mobConfig.pos;
	if (typeof(pos) === "function") {
		pos = pos(i);
	}
	const obj = objects.buildObjects([{
		x: pos.x, y: pos.y
		, sheetName: sheetName || "objects"
		, cell
		, name
		, properties
	}]);
	if (id) {
		obj.id = id.replaceAll("$", i);
	}
	return obj;
};

const spawnAnimation = (syncer, { x, y }) => {
	syncer.queue("onGetObject", {
		x: x
		, y: y
		, components: [{
			type: "attackAnimation"
			, row: 0
			, col: 4
		}]
	}, -1);
};

module.exports = {
	spawnRect: null
	, mobs: null

	, init: function () {
		const { instance: { objects, syncer } } = this;

		if (!this.objs.push) {
			this.objs = [this.objs];
		}

		this.objs.forEach((l, i) => {
			const obj = buildMob(objects, l, i);

			this.event.objects.push(obj);
			obj.event = this.event;

			spawnAnimation(syncer, obj);
		});

		if (!this.endMark) {
			this.end = true;
		}
	}
};

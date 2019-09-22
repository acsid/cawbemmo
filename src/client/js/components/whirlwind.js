define([
	'js/rendering/effects'
], function (
	effects
) {
	return {
		type: 'whirlwind',

		source: null,

		row: null,
		col: null,

		delay: 40,
		coordinates: [],

		objects: null,

		init: async function (blueprint) {
			await this.getObjectsModule();

			if (!this.source) {
				this.obj.destroyed = true;
				return;
			}

			this.coordinates.forEach(([x, y], i) => {
				const wait = i * this.delay;

				setTimeout(this.spawnThing.bind(this, x, y), wait);
			});

			effects.register(this);
		},

		getObjectsModule: async function () {
			return new Promise(res => {
				require(['js/objects/objects'], o => {
					this.objects = o;
					res();
				});
			});
		},

		spawnThing: function (x, y) {
			const { row, col } = this;

			this.objects.buildObject({
				x,
				y,
				components: [{
					type: 'attackAnimation',
					row,
					col
				}]
			});
		},

		renderManual: function () {
			
		},

		destroy: function () {
			effects.unregister(this);
		}
	};
});

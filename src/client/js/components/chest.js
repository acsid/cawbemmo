const colors = [
	"929398"
	, "80f643"
	, "3fa7dd"
	, "a24eff"
	, "ffeb38"
];

const chances = [
	0.0075
	, 0.02
	, 0.04
	, 0.08
	, 0.095
];

const indices = {
	50: 0
	, 51: 1
	, 128: 2
	, 52: 3
	, 53: 4
};

export default {
	type: "chest"

	, ownerName: null

	, init: function (blueprint) {
		const index = indices[this.obj.cell] || 0;

		this.obj.addComponent("particles", {
			chance: chances[index]
			, blueprint: {
				emitterVersion: "0.0.0"
				, minParticleLifetime: 1
				, maxParticleLifetime: 4
				, colorBehavior: {
					mode: "list"
					, listData: {
						list: [
							{ time: 0, value: "#" + colors[index] }
							, { time: 1, value: "#f5b830" }
						]
					}
				}
				, alphaBehavior: {
					mode: "list"
					, listData: {
						list: [
							{ time: 0, value: 0.75 }
							, { time: 1, value: 0 }
						]
					}
				}
				, spawnBehavior: {
					shape: "rectangle"
					, width: 8
					, height: 8
					, origin: { x: -4, y: -4 }
				}
				, spawnChance: chances[index]
			}
		});
	}
};

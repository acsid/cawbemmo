let events = require('../misc/events');

let config = {
	'1.0': {
		name: 'Wizard 1',
		sprite: [2, 0],
		defaultSpirit: 'owl',
		default: true
	},
	1.1: {
		name: 'Wizard 2',
		sprite: [3, 0]
	},
	1.2: {
		name: 'Warrior 1',
		sprite: [1, 1],
		defaultSpirit: 'bear',
		default: true
	},
	1.3: {
		name: 'Warrior 2',
		sprite: [2, 1]
	},
	1.4: {
		name: 'Cleric 1',
		sprite: [4, 0]
	},
	1.5: {
		name: 'Cleric 2',
		sprite: [5, 0]
	},
	1.6: {
		name: 'Thief 1',
		sprite: [6, 0],
		defaultSpirit: 'lynx',
		default: true
	},
	1.7: {
		name: 'Thief 2',
		sprite: [7, 0]
	},
	//Misc
	1.9: {
		name: 'Resplendent Wizard',
		sprite: [1, 0]
	},
	'1.10': {
		name: 'Apprentice Druid',
		sprite: [4, 1]
	},
	1.11: {
		name: 'Sashed Wizard',
		sprite: [5, 1]
	},

	//Faction Skins
	'2.0': {
		name: 'Gaekatlan Druid',
		sprite: [0, 4]
	},

	//Elite Skin Pack
	'10.0': {
		name: 'Sorcerer',
		spritesheet: 'images/skins/0001.png',
		sprite: [0, 0]
	},
	10.1: {
		name: 'Diviner',
		spritesheet: 'images/skins/0001.png',
		sprite: [1, 0]
	},
	10.2: {
		name: 'Cutthroat',
		spritesheet: 'images/skins/0001.png',
		sprite: [2, 0]
	},
	10.3: {
		name: 'Man of War',
		spritesheet: 'images/skins/0001.png',
		sprite: [3, 0]
	},
	10.4: {
		name: 'Occultist',
		spritesheet: 'images/skins/0001.png',
		sprite: [4, 0]
	},

	//Templar Skin Pack
	'11.0': {
		name: 'Crusader 1',
		spritesheet: 'images/skins/0010.png',
		sprite: [0, 0]
	},
	11.1: {
		name: 'Crusader 2',
		spritesheet: 'images/skins/0010.png',
		sprite: [1, 0]
	},
	11.2: {
		name: 'Crusader 3',
		spritesheet: 'images/skins/0010.png',
		sprite: [2, 0]
	},
	11.3: {
		name: 'Crusader 4',
		spritesheet: 'images/skins/0010.png',
		sprite: [3, 0]
	},
	11.4: {
		name: 'Grand Crusader',
		spritesheet: 'images/skins/0010.png',
		sprite: [4, 0]
	},
	11.5: {
		name: 'Infernal Crusader',
		spritesheet: 'images/skins/0010.png',
		sprite: [5, 0]
	},

	//Frozen Pack
	'12.0': {
		name: 'Frozen Lance Knight',
		spritesheet: 'images/skins/0012.png',
		sprite: [0, 0]
	},
	12.1: {
		name: 'Frozen Invoker',
		spritesheet: 'images/skins/0012.png',
		sprite: [1, 0]
	},
	12.2: {
		name: 'Frozen Duelist',
		spritesheet: 'images/skins/0012.png',
		sprite: [1, 0]
	}
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetSkins', config);
	},

	getBlueprint: function (skinId) {
		return config[skinId];
	},

	getSkinList: function (skins) {
		let list = Object.keys(config)
			.filter(function (s) {
				return ((config[s].default) || (skins.some(f => ((f === s) || (f === '*')))));
			})
			.map(function (s) {
				let res = extend({}, config[s]);
				res.id = s;
				return res;
			});

		let result = [];
		list.forEach(function (skin) {
			result.push({
				name: skin.name,
				id: skin.id,
				sprite: skin.sprite[0] + ',' + skin.sprite[1],
				spritesheet: skin.spritesheet,
				defaultSpirit: skin.defaultSpirit
			});
		}, this);

		return result;
	},

	getCell: function (skinId) {
		let skin = config[skinId] || config['1.0'];
		return (skin.sprite[1] * 8) + skin.sprite[0];
	},

	getSpritesheet: function (skinId) {
		let skin = config[skinId] || config['1.0'];
		return skin.spritesheet || 'characters';
	}
};

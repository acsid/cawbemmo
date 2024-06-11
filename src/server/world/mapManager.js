//Imports
const events = require('../misc/events');

//Internals
const mapList = [
	{
		name: 'cave',
		path: 'config/maps'
	},
	{
		name: 'fjolarok',
		path: 'config/maps'
	},
	{
		name: 'town',
		path: 'config/maps'
	}
];

//Helpers
const init = () => {
	events.emit('onBeforeGetMapList', mapList);
};

//Exports
module.exports = {
	init,
	mapList
};

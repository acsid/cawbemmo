module.exports = {
	type: "austere"

	, init: function () {

	}

	, simplify: function () {
		return this.type;
	}

	, events: {
		beforeEquipItem: function (msg) {
			if (msg.item.quality > 1) {
				msg.success = false;
				msg.msg = "Vous refusé le luxe et les équippement puissant";
			}
		}

		, beforeLearnAbility: function (msg) {
			if (msg.item.quality > 1) {
				msg.success = false;
				msg.msg = "Vous refusé le luxe et les équippement puissant";
			}
		}
	}
};

define([
	
], function(
	
) {
	return {
		list: [],
		particles: [],
		fog: [],

		register: function(cpn) {
			this.list.push(cpn);
		},
		unregister: function(cpn) {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				if (l == cpn) {
					list.splice(i, 1);
					return;
				}
			}
		},

		render: function() {
			var list = this.list;
			var lLen = list.length;

			for (var i = 0; i < lLen; i++) {
				var l = list[i];

				if ((l.destroyed) || (!l.obj) || (l.obj.destroyed)) {
					if (((l.destroyManual) && (!l.destroyManual())) || (!l.destroyManual)) {
						list.splice(i, 1);
						i--;
						lLen--;

						continue;
					}
				}

				l.renderManual();
			}
		}
	};
});
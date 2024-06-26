module.exports = {
	type: "reflectDamage"

	, events: {
		beforeTakeDamage: function ({ damage, source }) {
			damage.amount *= 0.5;

			source.stats.takeDamage({
				damage
				, threatMult: 1
				, source: this.obj
				, target: source
				, effectName: "reflectDamage"
			});

			damage.failed = true;

			this.obj.instance.syncer.queue("onGetDamage", {
				id: this.obj.id
				, event: true
				, text: "reflect"
			}, -1);
		}
	}
};

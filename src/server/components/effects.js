const effectTemplate = require("../config/effects/effectTemplate");

module.exports = {
	type: "effects"

	, effects: []
	, nextId: 0

	, ccResistances: {
		stunned: 0
		, slowed: 0
	}

	, init: function (blueprint) {
		const effects = blueprint.effects || [];
		for (const e of effects) {
			if (!e || !e.type) {
				continue;
			}
			this.addEffect(e);
		}
		delete blueprint.effects;
	}

	, transfer: function () {
		let transferEffects = this.effects;
		this.effects = [];

		this.init({
			effects: transferEffects
		});
	}

	, save: function () {
		let e = {
			type: "effects"
			, effects: this.effects
				.map((f) => f.save ? f.save() : f)
				.filter((f) => Boolean(f))
		};

		return e;
	}

	, simplify: function (self) {
		let effects = this.effects;
		if (effects.length > 0 && effects[0].obj) {
			effects = effects.map((f) => f.simplify()).filter((f) => Boolean(f));
		}
		return {
			type: "effects"
			, effects
		};
	}

	, destroy: function () {
		if (this.obj.instance) {
			this.events.beforeRezone.call(this);
		}
	}

	, die: function () {
		this.events.beforeRezone.call(this, true);
	}

	, reset: function () {
		for (const effect of this.effects) {
			if (effect.reset) {
				effect.reset();
			}
		}
	}

	, reapply: function () {
		for (const effect of this.effects) {
			if (effect.reapply) {
				effect.reapply();
			}
		}
	}

	, destroyEffect: function (effect) {
		this.obj.fireEvent("beforeDestroyEffect", effect);

		if (effect.events && effect.events.beforeDestroy) {
			effect.events.beforeDestroy(effect);
		}

		if (effect.destroy) {
			effect.destroy();
		}
	}

	, events: {
		beforeRezone: function (forceDestroy) {
			const effects = this.effects;
			for (let i = effects.length - 1; i >= 0; --i) {
				let effect = effects[i];
				if (!forceDestroy) {
					if (effect.persist) {
						this.syncRemove(effect.id);
						continue;
					}
				}
				this.destroyEffect(effect);
				this.syncRemove(effect.id);
				effects.splice(i, 1);
			}
		}
	}

	, canApplyEffect: function (type) {
		if (!this.ccResistances.has(type)) {
			return true;
		}

		let ccResistances = this.ccResistances;
		if ((100 - ccResistances[type]) >= 50) {
			ccResistances[type] += 50;
			return true;
		} return false;
	}

	, addEffect: function (options, source) {
		//Skip 0-duration effects
		if ((options.has("ttl")) && (options.ttl === 0)) {
			return;
		}

		options.caster = options.caster || source;

		//"X of Y in Z" cc resist check
		if (!options.force && !this.canApplyEffect(options.type)) {
			return;
		}

		let oldEffect = this.effects.find((e) => e.type === options.type);

		//If there is no existing effect or the effect is not stackable, make a new effect
		if (!oldEffect || !oldEffect.shouldStack) {
			return this.buildEffect(options);
		}

		//If the effect is stackable and the new effect should stack, stack with the old effect
		let shouldStack = oldEffect.shouldStack(options);
		if (shouldStack && oldEffect.incrementStack) {
			oldEffect.incrementStack(options);
			return oldEffect;
		}

		//Otherwise make a new effect
		return this.buildEffect(options);
	}

	, getTypeTemplate: function (type) {
		let typeTemplate = null;
		if (type) {
			const result = {
				type: type
				, url: `config/effects/effect${type.capitalize()}.js`
			};
			this.obj.instance.eventEmitter.emit("onBeforeGetEffect", result);

			typeTemplate = _.safeRequire(module, "../" + result.url);
		}
		return _.assign({}, effectTemplate, typeTemplate);
	}

	, buildEffect: function (options) {
		const builtEffect = this.getTypeTemplate(options.type);
		for (const p in options) {
			builtEffect[p] = options[p];
		}
		builtEffect.obj = this.obj;
		builtEffect.id = this.nextId++;
		builtEffect.silent = options.silent;
		if (builtEffect.init) {
			builtEffect.init(options.source);
		}
		this.effects.push(builtEffect);
		if (!options.silent) {
			this.obj.syncer.setArray(false, "effects", "addEffects", builtEffect.simplify());
		}
		this.obj.instance.eventEmitter.emit("onAddEffect", this.obj, builtEffect);
		return builtEffect;
	}

	, syncExtend: function (id, data) {
		const effect = this.effects.find((e) => e.id === id);
		if (!effect || effect.silent) {
			//Never sync silent effects
			return;
		}
		this.obj.syncer.setArray(false, "effects", "extendEffects", { id, data });
	}

	, syncRemove: function (id) {
		const effect = this.effects.find((e) => e.id === id);
		if (!effect || effect.silent) {
			return;
		}
		this.obj.syncer.setArray(false, "effects", "removeEffects", id);
	}

	, removeEffect: function (id) {
		const effect = this.effects.find((e) => e.id === id);

		//It's possible that something else has removed the effect
		if (!effect) {
			return;
		}

		this.destroyEffect(effect);

		this.syncRemove(effect.id);

		this.effects.spliceWhere((e) => e.id === id);
	}

	, removeEffectByType: function (type) {
		const effects = this.effects.filter((e) => e.type === type);

		effects.forEach((e) => this.removeEffect(e.id));
	}

	, getEffectByType: function (effectType) {
		const effect = this.effects.find((e) => e.type === effectType);

		return effect;
	}

	, fireEvent: function (event, args) {
		for (const e of this.effects) {
			if (!e || e.ttl === 0) {
				continue;
			}
			const events = e.events;
			if (!events) {
				continue;
			}
			const callback = events[event];
			if (!callback) {
				continue;
			}
			callback.apply(e, args);
		}
	}

	, update: function () {
		const effects = this.effects;
		for (let i = effects.length - 1; i >= 0; --i) {
			const e = effects[i];
			if (e.ttl > 0) {
				e.ttl--;
			}
			if (e.ttl <= 0) {
				e.destroyed = true;
			}
			if (e.update) {
				e.update();
			}
			if (e.destroyed) {
				this.destroyEffect(e);
				this.syncRemove(e.id);
				effects.splice(i, 1);
			}
		}
		for (let p in this.ccResistances) {
			if (this.ccResistances[p] > 0) {
				this.ccResistances[p]--;
			}
		}
	}
};

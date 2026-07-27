const { getById: faction_getById } = require("../../config/factions");
const learnRecipe = require("./learnRecipe");

const itemBase = {
	factions: []
};
module.exports = class Item {
	static #knownClassesTypes = {};

	static async init () {
	}

	static addType (typeName, typeInstance) {
		this.#knownClassesTypes[typeName] = typeInstance;
	}

	static fromJSON (json) {
		if (typeof json !== "object") {
			throw new Error("json object missing!");
		}
		// if (this.type === "consumable") {
		const item = Object.create(Item.prototype);
		return _.assign(item, itemBase, json);
	}

	static getById (id) {
		throw new Error("Not implemented!");
	}

	constructor () {
	}

	get isStackable () {
		return (this.material || this.quest || this.quantity) && !this.noStack && !this.uses;
	}

	get isOnCooldown () {
		return (this.cdMax > 0 && this.cd);
	}

	placeItemOnCooldown (cpnInv, cdMax) {
		this.cd = cdMax || this.cdMax;

		// Find similar items and put them on cooldown too
		for (const i of cpnInv.items) {
			if (i.name === this.name && i.cdMax === this.cdMax) {
				i.cd = cdMax || i.cdMax;
			}
		}
	}

	async use (cpnInv, itemId) {
		const obj = cpnInv.obj;
		const beforeGetCooldownMessage = {
			obj
			, item: this
			, cd: this.cd
		};
		obj.instance.eventEmitter.emit("onBeforeGetItemCd", beforeGetCooldownMessage);
		obj.fireEvent("onBeforeGetItemCd", beforeGetCooldownMessage);

		if (this.isOnCooldown(obj, cpnInv, beforeGetCooldownMessage)) {
			return false;
		}

		const result = {
			success: true
			, cdMax: this.cdMax
		};
		//FIXME Deprecated
		obj.instance.eventEmitter.emit("onBeforeUseItem", obj, this, result);
		obj.fireEvent("onBeforeUseItem", this, result);
		//New
		const eventMsg = {
			obj
			, item: this
			, cdMax: this.cdMax
			, success: true
		};
		obj.instance.eventEmitter.emit("beforeUseItem", eventMsg);

		if (!result.success || !eventMsg.success) {
			return false;
		}

		this.placeItemOnCooldown(obj, cpnInv, result);
		if (this.recipe) {
			const didLearn = await learnRecipe(obj, this);
			if (didLearn) {
				cpnInv.destroyItem({ itemId: this.id }, 1);
			}
			return true;
		}
		if (this.effects) {
			for (const effect of this.effects) {
				if (!effect.events) {
					continue;
				}
				const effectEvent = effect.events.onConsumeItem;
				if (!effectEvent) {
					continue;
				}

				const effectResult = {
					success: true
					, errorMessage: null
				};
				effectEvent.call(obj, effectResult, this, effect);

				if (!effectResult.success) {
					obj.social.notifySelf({ message: effectResult.errorMessage });
					return false;
				}
			}
		}
		if (this.type === "consumable") {
			if (this.uses > 0) {
				this.uses--;

				if (this.uses) {
					obj.syncer.setArray(true, "inventory", "getItems", this);
					return true;
				}
			}
			cpnInv.destroyItem({ itemId: this.id }, 1);
			if (this.has("quickSlot")) {
				obj.equipment.replaceQuickSlot(this);
			}
		}
		return true;
	}

	toJSON () {
		const result = _.assign({}, this);
		if (result.effects) {
			result.effects = result.effects.map((e) => ({
				factionId: e.factionId ?? null
				, text: e.text ?? null
				, properties: e.properties ?? null
				, type: e.type ?? null
				, rolls: e.rolls ?? null
			}));
		}
		if (result.factions) {
			result.factions = result.factions.map((f) => {
				const faction = faction_getById(f.id);
				if (!faction) {
					_.log.simplifyItem.faction.error("Faction '%s' can't be found!", f.id);
					return;
				}
				const tierDefinition = faction.tiers[f.tier];
				return {
					id: f.id
					, tier: f.tier
					, tierName: tierDefinition?.name || null
					, name: faction.name
				};
			}).filter((f) => Boolean(f));
		}
		return result;
	}
};

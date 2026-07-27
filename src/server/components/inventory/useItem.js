const learnRecipe = require("./learnRecipe");

const isOnCooldown = (obj, cpnInv, { item, cd }) => {
	if (!item.cdMax || !cd) {
		return false;
	}
	process.send({
		method: "events"
		, data: {
			onGetAnnouncement: [{
				obj: {
					msg: language.translate(obj.language, "items", "onCooldown")
				}
				, to: [obj.serverId]
			}]
		}
	});
	return true;
};

const placeItemOnCooldown = (obj, cpnInv, item, { cdMax }) => {
	item.cd = cdMax;

	//Find similar items and put them on cooldown too
	for (const i of cpnInv.items) {
		if (i.name === item.name && i.cdMax === item.cdMax) {
			i.cd = cdMax;
		}
	}
};

module.exports = async (cpnInv, itemId) => {
	const item = cpnInv.findItem(itemId);
	if (!item) {
		return;
	}

	const obj = cpnInv.obj;
	const beforeGetCooldownMessage = {
		obj
		, item
		, cd: item.cd
	};
	obj.instance.eventEmitter.emit("onBeforeGetItemCd", beforeGetCooldownMessage);
	obj.fireEvent("onBeforeGetItemCd", beforeGetCooldownMessage);

	if (isOnCooldown(obj, cpnInv, beforeGetCooldownMessage)) {
		return;
	}

	const result = {
		success: true
		, cdMax: item.cdMax
	};
	//FIXME Deprecated
	obj.instance.eventEmitter.emit("onBeforeUseItem", obj, item, result);
	obj.fireEvent("onBeforeUseItem", item, result);
	//New
	const eventMsg = {
		obj
		, item
		, cdMax: item.cdMax
		, success: true
	};
	obj.instance.eventEmitter.emit("beforeUseItem", eventMsg);

	if (!result.success || !eventMsg.success) {
		return;
	}

	placeItemOnCooldown(obj, cpnInv, item, result);

	if (item.recipe) {
		const didLearn = await learnRecipe(obj, item);
		if (didLearn) {
			cpnInv.destroyItem({ itemId }, 1);
		}
		return;
	}
	if (item.effects) {
		for (const effect of item.effects) {
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
			effectEvent.call(obj, effectResult, item, effect);

			if (!effectResult.success) {
				obj.social.notifySelf({ message: effectResult.errorMessage });
				return;
			}
		}
	}
	if (item.type === "consumable") {
		if (item.uses > 0) {
			item.uses--;

			if (item.uses) {
				obj.syncer.setArray(true, "inventory", "getItems", item);
				return;
			}
		}
		cpnInv.destroyItem({ itemId }, 1);
		if (item.has("quickSlot")) {
			cpnInv.obj.equipment.replaceQuickSlot(item);
		}
	}
};

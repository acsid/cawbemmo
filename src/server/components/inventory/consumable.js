const Item = require("./item");
module.exports = class Consumable extends Item {
	async use (cpnInv) {
		const obj = cpnInv.obj;
		const itemUsed = await super.use(cpnInv);
		if (!itemUsed) {
			return false;
		}
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
		return true;
	}
};
Item.addType("consumable", module.exports);

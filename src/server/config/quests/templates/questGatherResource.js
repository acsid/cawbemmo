module.exports = {
	type: "gatherResource"

	, need: null
	, gatherType: null
	, requiredQuality: 0
	, have: 0

	, build: function () {
		if (!this.need) {
			const { quantity, subType } = this;

			this.need = quantity[0] + Math.floor(Math.random() * (quantity[1] - quantity[0]));

			this.gatherType = subType ?? _.getRandomFrom("herb", "fish", "ticket");

			if (this.gatherType === "fish") {
				this.name = "Une pause a la pêche";

				let isQualityQ = (Math.random() < 0.3);
				if (isQualityQ) {
					this.requiredQuality = 1 + Math.floor(Math.random() * 2);
					this.need = 1;
				}
			}
		}

		if (["herb", "fish", "ticket"].indexOf(this.gatherType) === -1) {
			this.gatherType = "herb";
		}
		if (this.gatherType === "herb") {
			this.typeName = "herbs";
		} else if ( this.gatherType === "fish" ) {
			this.typeName = "fish";
		} else if ( this.gatherType === "ticket") {
			this.typeName = "ticket";
		}
		//this.typeName = (this.gatherType === "herb") ? "herbs" : "fish";

		this.updateDescription();

		return true;
	}

	, getXpMultiplier: function () {
		if (this.requiredQuality === 2) {
			return 8;
		} else if (this.requiredQuality === 1) {
			return 6;
		}
		return this.need;
	}

	, updateDescription: function () {
		let typeName = this.typeName;
		if (this.requiredQuality > 0) {
			typeName = ["big", "giant"][this.requiredQuality - 1] + " " + typeName;
		}

		let action = ({
			herb: "Ceuille"
			, fish: "Attrape"
			, ticket: "Ramasse"
		})[this.gatherType];

		this.description = `${action} ${this.have}/${this.need} ${typeName}`;
	}

	, events: {
		afterGatherResource: function (gatherResult) {
			if (gatherResult.nodeType !== this.gatherType) {
				return;
			} else if ((this.requiredQuality) && (gatherResult.items[0].quality < this.requiredQuality)) {
				return;
			} else if (gatherResult.items[0].name.toLowerCase() === "cerulean pearl") {
				//This is a hack but we have no other way to tell fish from pearls at the moment
				return;
			}

			if ((this.obj.zoneName !== this.zoneName) || (this.have >= this.need)) {
				return;
			}

			this.have++;
			this.updateDescription();

			this.obj.syncer.setArray(true, "quests", "updateQuests", this.simplify(true));

			if (this.have >= this.need) {
				this.ready();
			}
		}
	}
};

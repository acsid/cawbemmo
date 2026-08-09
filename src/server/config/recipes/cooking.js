const baseRecipes = {
	bouffe: {
		item: {
			name: "bouffe"
			, type: "consumable"
			, sprite: [0, 8]
			, worth: 5
			, noSalvage: true
			, noAugment: true
			, uses: 1
			, getXp: 10
			, effects: [{
				type: "gainStat"
			}]
		}
		, materials: [

		]
	}
};

const buildRecipe = function (recipe, item, materials, effects) {
	if (!recipe?.name) {
		throw new Error("Missing recipe name.");
	}
	if (!item?.name) {
		throw new Error("Missing item name.");
	}
	if (materials && !Array.isArray(materials)) {
		materials = [ materials ];
	}
	if (effects && !Array.isArray(effects)) {
		effects = [ effects ];
	}
	return _.assign({}, baseRecipes[recipe.name], recipe, {
		// New recipe name from the item name.
		name: item.name
		, item: _.assign(item, {
			effects: effects || []
		})
		, materials: materials || []
	});
};

module.exports = [
	buildRecipe(
		// recette
		{ name: "bouffe"
			, description: "Un gros hamburger <br /><br />Donne: 100 Hp instant"
		}
		// item
		, { name: "Hamburger"
			, sprite: [0, 6]
			, description: "Un gros hamburger <br /><br />Donne: 100 Hp instant"
			, getXp: 10
		}
		// materials
		, [
			{ name: "Steak", quantity: 1 }
			, { name: "pain", quantity: 1 }]
		// effects
		, {
			rolls: {
				//stat: ( "mana" | "hp" )
				stat: "hp"
				// montant de base
				, amount: 100
			}
		}
	)

];

const baseRecipes = {
	joint: {
		item: {
			name: "Joint"
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
			{
				name: "weed"
				, quantity: 1
			}
			, {
				name: "Papier a roulé"
				, quantity: 1
			}
		]
	}
	, bouteille: {
		item: {
			name: "Liquide louche"
			, type: "consumable"
			, sprite: [0, 7]
			, worth: 15
			, noSalvage: true
			, noAugment: true
			, uses: 1
			, cdMax: 85
			, effects: [{
				type: "augmentWeapon"
				, rolls: {
					duration: 500
				}
			}]
		}
		, materials: [{
			name: "Bouteille vide"
			, quantity: 1
		}, {
			name: "champignon"
			, quantity: 3
		}, {
			name: "weed"
			, quantity: 1
		}]
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
// 	(recette, "nom de l'objet", Effets, "ingrédients", Quantité crafté)
	buildRecipe(
		// recette
		{ name: "joint"
			, description: "Un bon vieux joint pour ce heal<br /><br />Donne: 50% Hp instant"
		}
		// item
		, { name: "Un bon vieux joint"
			, description: "Un bon vieux joint pour ce heal<br /><br />Donne: 50% Hp instant"
			, getXp: 10
		}
		// materials
		, undefined
		// effects
		, {
			rolls: {
				//stat: ( "mana" | "hp" )
				stat: "mana"
				// montant de base
				, amount: 10
			}
		}
	)
	, buildRecipe(
		// recette
		{ name: "joint"
			, description: "Un bon vieux joint pour ce heal<br /><br />Donne: 20 Mana instant"
		}
		// item
		, { name: "Joint Deux papier"
			, description: "Un bon vieux joint pour ce donner de la mana<br /><br />Donne: 20 Mana instant"
			, getXp: 15
		}
		// Materials
		, [ { name: "Papier a roulé", quantity: 2 }
			, { name: "weed", quantity: 2 }
		]
		, {
			rolls: {
				//stat: ( "mana" | "hp" )
				stat: "mana"
				// montant de base
				, amount: 20
			}
		}
	)

	, buildRecipe(
		// recette
		{ name: "bouteille"
			, description: "Ca pue mais ca rend l'arme plus forte."
		}
		// item
		, { name: "Liquide louche"
			, description: "Ca pue mais ca rend l'arme plus forte."
			, getXp: 25
		}
		// Materials
		, [ {
			name: "Bouteille vide"
			, quantity: 1
		}, {
			name: "champignon"
			, quantity: 3
		}, {
			name: "weed"
			, quantity: 1
		}
		]
		, {
			rolls: {
				duration: 500
			}
		}
	)

];

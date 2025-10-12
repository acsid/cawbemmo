module.exports = {

	teleport: {
		1: {
			msg: [{
				msg: "Teleportator !!!!"
				, options: [1.1,1.2]
			}]
			, options: {
				1.1: {
					msg: "Ville"
					, goto: "teleportTown"
				}
				,1.2: {
					msg: "Depanneur"
					, goto: "teleportDep"
				}

			}
		}
		, teleportTown: {
			cpn: "dialogue"
			, method: "teleport"
			, args: [{
				toZone: "town"
				,toPos: {"x":100,"y":100}
			}]

		}
		, teleportDep: {
			cpn: "dialogue"
			, method: "teleport"
			, args: [{
				toZone: "depanneur"

			}]
		}

	}
	, quest: {
		1: {
			msg: [{
				msg: "Questator !!!!"
				, options: [1.1,1.2]
			}]
			, options: {
				1.1: {
					msg: "Ville"
					, goto: "questToTown"
				}
				,1.2: {
					msg: "Depanneur"
					, goto: "questToDep"
				}

			}
		}
		, questToTown: {
			cpn: "questBuilder"
			, method: "init"
			, args: [{
				name: "Conso"
				, type: "killx"
				, subType: "kazou"
				, quantity: [1, 2]
				, zoneName: "admin"
			}]

		}
		, questToDep: {
			cpn: "dialogue"
			, method: "teleport"
			, args: [{
				toZone: "depanneur"

			}]
		}
	}
	, gislain: {
		1: {
			msg: [{
				msg: "Bonjour bienvenue humble magasin"
				, options: [1.1, 1.2, 1.3, 1.4]
			}]
			, options: {
				1.1: {
					msg: "Quelque choses ?"
					, goto: 2
				}
				, 1.2: {
					msg: "des choses a vendre?"
					, goto: "tradeBuy"
				}
				, 1.3: {
					msg: "J'ai peut être de quoi qui vas t'intéressé."
					, goto: "tradeSell"
				}
				, 1.4: {
					msg: "J'ai une lettre pour toi."
					, prereq: function (obj) {
						let crystals = obj.inventory.items.find((i) => (i.name === "Lettre d'admiratrice"));
						return Boolean(crystals);
					}
					, goto: "giveLetter"
				}
			}
		}
		, 2 : {
			msg: [{
				msg: "Oui j'ai perdu mon courrier avec plein de lettre d'admiratrice."
				, options: [2.1]
			}]
			, options: {
				2.1: {
					msg: "ou les a tu perdu ?"
					, goto: 3
				}
			}
		}
		, 3 : {
			msg: [{
				msg: "Je lai ai perdu pres de la track de train au sud du village"
				, options: [3.1, 3.2, 3.3]
			}]
			, options: {
				3.1: {
					msg: "ou les a tu perdu ?"
					, goto: 3
				}
				, 3.2: {
					msg: "des choses a vendre?"
					, goto: "tradeBuy"
				}
				, 3.3: {
					msg: "J'ai peut être de quoi qui vas t'intéressé."
					, goto: "tradeSell"
				}
				,
			}
		}
		, tradeBuy: {
			cpn: "trade"
			, method: "startBuy"
			, args: [{
				targetName: "gislain"
			}]
		}
		, tradeSell: {
			cpn: "trade"
			, method: "startSell"
			, args: [{
				targetName: "gislain"
			}]
		}
		, giveLetter: {
			msg: [{
				msg: "Merci Pour ses lettres."
				, options: [1.1, 1.2, 1.3]
			}]
			, method: function (obj) {
				let inventory = obj.inventory;
				console.log(inventory)
				let crystals = inventory.items.find((i) => (i.name === "Lettre d'admiratrice"));
				if (!crystals) {
					return;
				}
				obj.reputation.getReputation("akarei", (crystals.quantity || 1) * 15);

				inventory.destroyItem({ itemId: crystals.id });
			}
		}
	}
};

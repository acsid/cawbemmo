module.exports = {

	binary: {
		1: {
			msg: [{
				msg: "ZZzZZZz"
				, options: [1.1]
			}]
			, options: {
				1.1: {
					msg: "Coudonc dort tu?"
					, goto: 2
				}

			}
		}
		, 2: {
			msg: [{
				msg: "Nenon je check mon téléphone"
				, options: [2.1]
			}]
			, options: {
				2.1: {
					msg: "Coudonc dort tu?"
					, goto: 1
				}

			}
		}
	}
		,chauffeur: {
		1: {
			msg: [{
				msg: "Ou voulez vous allez?"
				, options: [1.1,1.2]
			}]
			, options: {
				1.1: {
					msg: "La cabanne"
					, goto: "teleportCabanne"
				}

			}
		}
		, teleportCabanne: {
			cpn: "dialogue"
			, method: "teleport"
			, args: [{
				toZone: "cabanne"
				,toPos: {"x":72,"y":106}
			}]
		}
		}

	, peter: {
		1: {
			msg: [{
				msg: "Bienvenue chez les cossin chez peter"
				, options: [1.1, 1.2, 1.3, 1.4]
			}]
			, options: {
				1.1: {
					msg: "What are you doing in the middle of the wilderness?"
					, goto: 2
				}
				, 1.2: {
					msg: "Tas tu des beau cossin en stock?"
					, goto: "tradeBuy"
				}
				, 1.3: {
					msg: "T'intéresserais tu ses cossins la ?"
					, goto: "tradeSell"
				}
				, 1.4: {
					msg: "J'ai changé d'idée j'aimerais racheté."
					, goto: "tradeBuyback"
				}
			}
		}
		, 2: {
			msg: "I ran into some trouble in the city a few years ago. Moving out here seemed preferable to taking up residence in prison."
			, options: {
				2.1: {
					msg: "Trouble? What kind of trouble?"
					, goto: "2-1"
				}
				, 2.2: {
					msg: "Where is the city?"
					, goto: "2-2"
				}
				, 2.3: {
					msg: "I'd like to ask something else."
					, goto: 1
				}
			}
		}
		, "2-1": {
			msg: "Let's just say it was of a royal nature. There are those who would still like to see me in prison, or better yet; dead."
			, options: {
				"2-1.1": {
					msg: "I'd like to ask something else"
					, goto: 2
				}
			}
		}
		, "2-2": {
			msg: "It's on the northern part of the island. Just don't let your tongue slip about my location."
			, options: {
				"2-2.1": {
					msg: "I'd like to ask something else"
					, goto: 2
				}
			}
		}
		, tradeBuy: {
			cpn: "trade"
			, method: "startBuy"
			, args: [{
				targetName: "peter"
			}]
		}
		, tradeSell: {
			cpn: "trade"
			, method: "startSell"
			, args: [{
				targetName: "peter"
			}]
		}
		, tradeBuyback: {
			cpn: "trade"
			, method: "startBuyback"
			, args: [{
				targetName: "peter"
			}]
		}
	}, "mr giroux": {
		1: {
			msg: [{
				msg: "Bienvenue a l'épiceries"
				, options: [1.1]
			}]
			, options: {
				1.1: {
					msg: "acheter"
					, goto: "tradeBuy"
				}
			}

		}
		, tradeBuy: {
			cpn: "trade"
			, method: "startBuy"
			, args: [{
				targetName: "mr giroux"
			}]
		}
		,
	}
	, raymond: {
		1: {
			msg: [{
				msg: "Bienvenue au snack bar"
				, options: [1.1]
			}]
			, options: {
				1.1: {
					msg: "je vais te prendre un..."
					, goto: "tradeBuy"
				}
			}

		}
		, tradeBuy: {
			cpn: "trade"
			, method: "startBuy"
			, args: [{
				targetName: "raymond"
			}]
		}
		,
	}, gislain: {
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

				let crystals = inventory.items.find((i) => (i.name === "Lettre d'admiratrice"));
				if (!crystals) {
					return;
				}
				obj.reputation.getReputation("vendeurs", (crystals.quantity || 1) * 15);
				obj.social.getXp((crystals.quantity || 1) * 5);
				inventory.destroyItem({ itemId: crystals.id });
			}
		}
	}
};

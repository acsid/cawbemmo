module.exports = {
	chauffeur: {
		1: {
			msg: [{
				msg: "Ou voulez vous allez?"
				, options: [1.1, 1.2]
			}]
			, options: {
				1.1: {
					msg: "Ville"
					, goto: "teleportTown"
				}

			}
		}
		, teleportTown: {
			cpn: "dialogue"
			, method: "teleport"
			, args: [{
				toZone: "town"
				, toPos: { x: 96, y: 96 }
			}]
		}
	}

};

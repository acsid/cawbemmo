module.exports = {
	banddo: {
		1: {
			msg: [{
				msg: "le maudit chauffeur d\'autobus"
				, options: [1.1, 1.2]
			}]
			, options: {
				1.1: {
					msg: "Quel chauffeur d\'autobus?"
					, goto: 2
				}
				, 1.2: {
					msg: "on es ou?"
					, goto: 3
				}
			}
		},
		2: {
			msg: [{
				msg: "lui qui es la bas"
				, options: [2.1, 2.2]
			}]
			, options: {
				2.1: {
					msg: "Que-ce qui ce passe?"
					, goto: 4
				}
				, 2.2: {
					msg: "on es ou?"
					, goto: 3
				}
			}
		},
		3: {
				msg: [{
					msg: "ici on es dans le néant ca ce voit pas? regarde la-bas y'a rien"
					, options: [3.1, 3.2]
				}]
				, options: {
					3.1: {
						msg: "Que-ce qui ce passe avec le chauffeur?"
						, goto: 4
					}
					, 3.2: {
						msg: "on es ou?"
						, goto: 2
					}
				}
		},
		4: {
			msg: [{
				msg: "je comprend jammais ses jokes car je m\'assoie toujours en arrière avec les vrais"
				, options: [4.1,4.2]
			}]
			, options: {
				4.1: {
					msg: "c\'est pour ca tu fait du pouce ?"
					, goto: 5
				},
				4.2: {
					msg: "on es ou?"
					, goto: 3
				}
			}
		},
		5: {
			msg: [{
				msg: "Faire du pouce, c’est mon dernier espoir. Dans le néant, y’a peut-être un camion fantôme, une navette dimensionnelle, ou juste quelqu’un qui comprend mon malaise qui va s’arrêter.",
				options: [5.1]
			}],
			options: {
				5.1: {
					msg: "on es ou?"
					, goto: 3
				}
			}
		}
	},
	chauffeur: {
		1: {
			msg: [{
				msg: "Avez vous votre ticket?",
				options: [1.1,1.2]
			}],
			options: {
				1.1: {
					msg: "non"
					, goto: 2
				},
				1.2: {
					msg: "Le vla mon ticket d'autobus"
					, prereq: function (obj) {
						let tickets = obj.inventory.items.find((i) => (i.name === "ticket d\'autobus"));
						return Boolean(tickets);
					}
					, goto: "takeTicket"
				}
			}
		},
		2: {
			msg: [{
				msg: "ca prend un ticket sinon tu rentre pas dans mon autobus"
				, options: [2.1]
			}]
			, options: {
				2.1: {
					msg: "je trouve ca ou?"
					, goto: 3
				}
			}
		},
		3: {
			msg: [{
				msg: "tu peu en acheté en ville sinon ici yen traine un peu partou"
				, options: []
			}]
			, options: {

			}
		}, takeTicket: {
			method: function (obj) {
				let inventory = obj.inventory;
				let ticket = inventory.items.find((i) => (i.name === "ticket d\'autobus"));
				if (!ticket) {
					return;
				}
				inventory.destroyItem({ itemId: ticket.id  }, 1);
				obj.dialogue.teleport({
					toZone: "town"
					,toPos: {"x":96,"y":96}
				});
			}
		}
		, teleportVille: {
			cpn: "dialogue"
			, method: "teleport"
			, args: [{
				toZone: "town"
				,toPos: {"x":96,"y":96}
			}]
		}
	}
};

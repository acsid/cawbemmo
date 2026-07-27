export const characters = {
	new: "Nouveau"
	, delete: "Effacé"
	, play: "Jouer"
	, deleteCountdown: "click delete ${countdown} more time${s} to confirm"
};

export const credits = {
	pageTitle: "Credits"
	, homepage: "HomePage"
	, sourceCode: "Source Code"

	, isleward: "BigBadWaffle - Isleward:\nMain engine supporting the game."
	, levikingman: "LeVikingMan - Art/Maps:\nMade the maps and sprites."
	, madrang: "Madrang - Code:\nModded fork of Isleward."
};

export const changeLog = {
	pageTitle: "Changements Recents"
	, haveFun: "Please have fun!"
};

export const equipment = {
	critChance: "Chance de coup critique global"
	, critMultiplier: "Multiplicateur de coup critique"
	, attackCritChance: "Chance d'attaque critique"
	, attackCritMultiplier: "Multiplicateur d'attaque critique"
	, spellCritChance: "Chance de magie critique"
	, spellCritMultiplier: "Multiplicateur de magie critique"

	, pageTitle: "Hero"
	, tabs: {
		basic: "info"
		, offense: "offense"
		, defense: "défense"
		, other: "autres"
	}
};

export const help = {
	heading: "Aide"

	, movement: {
		name: "Mouvement"
		, desc: "WASD / Flèches"
		, mobileDesc: "Touché l'écran et glissé"
	}
	, cancelMove: {
		name: "Cancellé le mouvement"
		, desc: "Touche: [escape]"
		, mobileDesc: "Secouer l'appareil"
	}
	, combat: {
		name: "Combat"
		, desc: "Cliquez sur un enemie et appuyé sur [espace] pour activé l'attaque automatique"
		, mobileDesc: "Touché un ennemie et appuyé sur une magie"
	}
	, chat: {
		name: "Chat"
		, desc: "Appuyé sur la touche [entré] pour activé la fenêtre de clavardage"
		, mobileDesc: "Touché l'icone de chat"
	}
	, inventory: {
		name: "Inventaire"
		, desc: "Appuyé sur [i] pour ouvrir l'inventaire"
	}
	, equipment: {
		name: "Équipment"
		, desc: "Clique droit sur un item de vôtre inventaire pour l'équippé ou appuyé sur [j] pour la fenêtre d'Équipment click"
	}
	, stats: {
		name: "Stats"
		, desc: "Les esprits hiboux ont besoin d'Int pour faire plus de dégâts. Les lynx ont besoin de Dex et les ours de Str"
	}
	, showNames: {
		name: "Voir les noms"
		, desc: "Touche [v]"
	}
	, whosOnline: {
		name: "Qui es en ligne"
		, desc: "Touche [O]"
	}
	, tos: {
		name: "Termes de services"
		, desc: "voir"
		, mobileDesc: "Pas encore disponible"
	}
	, menu: {
		name: "Menu"
		, desc: "Vous pouvez accedé au menu en sélectionnant l'icode de menu"
	}
	, interaction: {
		name: "Interaction"
		, desc: "Pour interagir avec un objet"
	}
};

export const loader = {
	loading: "Chargement ${progress}%"
	, wait: "Chargement..."
};

export const login = {
	language: "Language"
	, login: "Connexion"
	, password: "MDP"
	, register: "S'enregistré"
	, username: "Compte"
	, selfcheck: "Validation Auto."
};

export const mainMenu = {
	pageTitle: "Menu"
	, charSelect: "Sélection personage"
	, logOut: "Déconnecté"
};

export const menus = {
	back: "Retour"
	, next: "Continué"
};

export const options = {
	pageTitle: "Options"
	, enabled: "On"
	, disabled: "Off"
	, game: {
		pageTitle: "Jeu"
		, fullscreen: "Plein écran"
		, volume: {
			sound: "Volume son"
			, music: "Volume Musique"
		}
		, chat: "Chat"
		, lastChannel: "Ce souvenir du dernier canal"
	}
	, controllers: {
		pageTitle: "Controles"
		, gamepad: "Gamepad"
		, keyboard: "Keyboard"
	}
	, indicators: {
		pageTitle: "Indicateurs"
		, nameplates: "Noms"
		, quests: "Quêtes"
		, events: "Évenements"
		, party: "Groupe"
		, damageNumbers: "Dommages"
		, inventory: "Inventaire"
		, itemQuality: "Indicateur de qualité"
		, itemUnusable: "Inducateur utilisable"
	}
};

export const party = {
	leave: "leave party"
	, remove: "remove from party"
	, whisper: "whisper"
};

export const passives = {
	pageTitle: "Arbre de talent passif"
	, points: "Points Available: ${points}"
	, nodes: {
		myStart: "Your starting node"
		, spiritStart: "Starting node for ${spirit} spirits"
	}
	, reset: "Réinitialisé"
};

export const quests = {
	pageTitle: "Quêtes"
	, ready: "Click to turn in"
	, reward: "Reward"
	, noReward: "Reward: For reputation and glory."
};

export const spellbook = {
	cancelled: "Cancelled casting ${spellName}"
	, pickLocation: "Pick a location to cast ${spellName}"
};

export const stats = {
	gold: "Argent"
	, level: "Niveau"
	, nextLevel: "Prochain Niveau"

	, hp: "hp"
	, regenHp: "health regeneration"

	, mana: "mana"
	, manaMax: "maximum mana"
	, regenMana: "mana regeneration"

	, armor: "Armure"

	, str: "strength"
	, int: "intellect"
	, dex: "dexterity"
	, vit: "vitality"

	, blockAttackChance: "Chance de bloqué des attaques"
	, blockSpellChance: "Chance de bloqué des incantation"

	, dodgeAttackChance: "Chance d'évité une attaque"
	, dodgeSpellChance: "Chance d'évité une incantation"

	, addCritChance: "global crit chance"
	, addCritMultiplier: "global crit multiplier"
	, addAttackCritChance: "attack crit chance"
	, addAttackCritMultiplier: "attack crit multiplier"
	, addSpellCritChance: "spell crit chance"
	, addSpellCritMultiplier: "spell crit multiplier"
	, magicFind: "Qualité des items"
	, itemQuantity: "Quantité des items"
	, sprintChance: "Chance de courir"
	, allAttributes: "to all attributes"
	, xpIncrease: "Augmentation d'expériance"
	, lvlRequire: "level requirement reduction"

	, elementArcanePercent: "Augmentation Arcane"
	, elementFrostPercent: "Augmentation de glace"
	, elementFirePercent: "Augmentation de Feu"
	, elementHolyPercent: "Augmentation saint"
	, elementPoisonPercent: "Augmentation de poision"
	, physicalPercent: "Augmentation physique"

	, elementPercent: "increased elemental damage"
	, spellPercent: "Augementation magique"

	, elementAllResist: "Résistance global"
	, elementArcaneResist: "Résistance arcane"
	, elementFrostResist: "Résistance au gel"
	, elementFireResist: "Résistance au feu"
	, elementHolyResist: "Résistance au dégats saint"
	, elementPoisonResist: "Résistance au poison"

	, attackSpeed: "Vitesse d'attaque"
	, castSpeed: "Vitesse d'incantation"

	, lifeOnHit: "Vie gagné par coup"

	, auraReserveMultiplier: "aura mana reservation multiplier"

	//This stat is used for gambling when you can't see the stats
	, stats: "stats"

	//Fishing
	, weight: "lb"

	//Rods
	, catchChance: "Chance d'attrapé un poisson"
	, catchSpeed: "Vitesse de pêche"
	, fishRarity: "Chance de poisson rare"
	, fishWeight: "Augmentation du poid"
	, fishItems: "Chance de pêché des items"
};

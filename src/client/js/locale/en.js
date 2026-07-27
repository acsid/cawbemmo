export const characters = {
	new: "New"
	, delete: "Delete"
	, play: "Play"
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
	pageTitle: "ChangeLog"
	, haveFun: "Please have fun!"
};

export const equipment = {
	critChance: "global crit chance"
	, critMultiplier: "global crit multiplier"
	, attackCritChance: "attack crit chance"
	, attackCritMultiplier: "attack crit multiplier"
	, spellCritChance: "spell crit chance"
	, spellCritMultiplier: "spell crit multiplier"

	, pageTitle: "Hero"
	, tabs: {
		basic: "Basic"
		, offense: "Offense"
		, defense: "Defense"
		, other: "Misc"
	}
};

export const help = {
	heading: "Help"

	, movement: {
		name: "Movement"
		, desc: "WASD / Arrows"
		, mobileDesc: "Touch the screen and drag"
	}
	, cancelMove: {
		name: "Cancel movement"
		, desc: "Key: [escape]"
		, mobileDesc: "Shake the device"
	}
	, combat: {
		name: "Combat"
		, desc: "Click an enemy and press [space] to enable auto-attack"
		, mobileDesc: "Tap an enemy and press a spell"
	}
	, chat: {
		name: "Chat"
		, desc: "Press [enter] to open the chat window"
		, mobileDesc: "Tap the chat icon"
	}
	, inventory: {
		name: "Inventory"
		, desc: "Press [i] to open the inventory"
	}
	, equipment: {
		name: "Equipment"
		, desc: "Right-click an item in your inventory to equip it, or press [j] for the Equipment window"
	}
	, stats: {
		name: "Stats"
		, desc: "Owl Spirits need Int to deal more damage. Lynxes need Dex and Bears need Str"
	}
	, showNames: {
		name: "Show names"
		, desc: "Key [v]"
	}
	, whosOnline: {
		name: "Who's online"
		, desc: "Key [O]"
	}
	, tos: {
		name: "Terms of Service"
		, desc: "view"
		, mobileDesc: "Not yet available"
	}
	, menu: {
		name: "Menu"
		, desc: "Open the menu by selecting the menu icon"
	}
	, interaction: {
		name: "Interaction"
		, desc: "To interact with an object"
	}
};

export const loader = {
	loading: "Loading ${progress}%"
	, wait: "Loading, please wait..."
};

export const login = {
	language: "Language"
	, login: "Login"
	, password: "Password"
	, register: "Register"
	, username: "UserName"
	, selfcheck: "Health Check"
};

export const mainMenu = {
	pageTitle: "Menu"
	, charSelect: "Character Select"
	, logOut: "Log Out"
};

export const menus = {
	back: "Back"
	, next: "Next"
};

export const options = {
	pageTitle: "Options"
	, enabled: "On"
	, disabled: "Off"
	, game: {
		pageTitle: "Game"
		, fullscreen: "Fullscreen"
		, volume: {
			sound: "Sound Volume"
			, music: "Music Volume"
		}
		, chat: "Chat"
		, lastChannel: "Remember Last Chat Channel"
	}
	, controllers: {
		pageTitle: "Controllers"
		, gamepad: "Gamepad"
		, keyboard: "Keyboard"
	}
	, indicators: {
		pageTitle: "Indicators"
		, nameplates: "Nameplates"
		, quests: "Quests"
		, events: "Events"
		, party: "Party"
		, damageNumbers: "Damage Numbers"
		, inventory: "Inventory"
		, itemQuality: "Quality Indicators"
		, itemUnusable: "Unusable Indicators"
	}
};

export const party = {
	leave: "leave party"
	, remove: "remove from party"
	, whisper: "whisper"
};

export const passives = {
	pageTitle: "Passive Tree"
	, points: "Points Available: ${points}"
	, nodes: {
		myStart: "Your starting node"
		, spiritStart: "Starting node for ${spirit} spirits"
	}
	, reset: "Reset Nodes"
};

export const quests = {
	pageTitle: "Quests"
	, ready: "Click to turn in"
	, reward: "Reward"
	, noReward: "Reward: For reputation and glory."
};

export const spellbook = {
	cancelled: "Cancelled casting ${spellName}"
	, pickLocation: "Pick a location to cast ${spellName}"
};

export const stats = {
	gold: "Gold"
	, level: "Level"
	, nextLevel: "Next Level"

	, hp: "hp"
	, regenHp: "health regeneration"

	, mana: "mana"
	, manaMax: "maximum mana"
	, regenMana: "mana regeneration"

	, armor: "armor"

	, str: "strength"
	, int: "intellect"
	, dex: "dexterity"
	, vit: "vitality"

	, blockAttackChance: "chance to block attacks"
	, blockSpellChance: "chance to block spells"

	, dodgeAttackChance: "chance to dodge attacks"
	, dodgeSpellChance: "chance to dodge spells"

	, addCritChance: "global crit chance"
	, addCritMultiplier: "global crit multiplier"
	, addAttackCritChance: "attack crit chance"
	, addAttackCritMultiplier: "attack crit multiplier"
	, addSpellCritChance: "spell crit chance"
	, addSpellCritMultiplier: "spell crit multiplier"
	, magicFind: "increased item quality"
	, itemQuantity: "increased item quantity"
	, sprintChance: "sprint chance"
	, allAttributes: "to all attributes"
	, xpIncrease: "additional xp per kill"
	, lvlRequire: "level requirement reduction"

	, elementArcanePercent: "increased arcane damage"
	, elementFrostPercent: "increased frost damage"
	, elementFirePercent: "increased fire damage"
	, elementHolyPercent: "increased holy damage"
	, elementPoisonPercent: "increased poison damage"
	, physicalPercent: "increased physical damage"

	, elementPercent: "increased elemental damage"
	, spellPercent: "increased spell damage"

	, elementAllResist: "all resistance"
	, elementArcaneResist: "arcane resistance"
	, elementFrostResist: "frost resistance"
	, elementFireResist: "fire resistance"
	, elementHolyResist: "holy resistance"
	, elementPoisonResist: "poison resistance"

	, attackSpeed: "attack speed"
	, castSpeed: "cast speed"

	, lifeOnHit: "life gained on dealing physical damage"

	, auraReserveMultiplier: "aura mana reservation multiplier"

	//This stat is used for gambling when you can't see the stats
	, stats: "stats"

	//Fishing
	, weight: "lb"

	//Rods
	, catchChance: "extra catch chance"
	, catchSpeed: "faster catch speed"
	, fishRarity: "higher fish rarity"
	, fishWeight: "increased fish weight"
	, fishItems: "extra chance to hook items"
};

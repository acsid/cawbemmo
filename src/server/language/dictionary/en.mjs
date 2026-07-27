/** en.mjs - Server-side English message templates.
 * Independent of the client's js/locale/en.js (server-owned strings only).
 * ${key.*} tokens are left literal: the server doesn't know the client's
 * rebound keymap, so the client resolves them (announcements.js keyDict).
 * Other ${tokens} are runtime values supplied at the call site.
 */

const announcements = {
	doorOpen: "Press ${key.use} to open this door"
	, doorClose: "Press ${key.use} to close this door"
	, doorLocked: "You don't have the key to unlock this door"
	, stash: "Press ${key.use} to access your Shared Stash"
	, wardrobe: "Press ${key.use} to access the wardrobe"
	, workbench: "Press ${key.use} to access the ${workbenchName}"
	, workbenchNotice: "Press ${key.use} to ${notice}"
};

const gatherer = {
	bagsFull: "Your bags are too full to gather any more resources."
	, needFishingRod: "You need a fishing rod to fish"
	, fishGotAway: "The fish got away"
	, schoolDepleted: "The school has been depleted"
	, fishPrompt: "Press ${key.gather} to fish for ${resource}"
	, herbPrompt: "Press ${key.gather} to gather the ${resource}"
};

const spellbook = {
	attackRefused: "You don't feel like attacking that target"
	, healRefused: "You don't feel like healing that target"
	, weaponCooldown: "Weapon is on cooldown"
	, spellCooldown: "Spell is on cooldown"
	, insufficientMana: "Insufficient mana to cast spell"
	, outOfRange: "Target out of range"
	, noLineOfSight: "Target not in line of sight"
};

const items = {
	onCooldown: "That item is on cooldown"
	, recipeKnown: "You already know that recipe"
	, recipeLearned: "The recipe imprints itself in your mind, then vanishes"
};

const zone = {
	loading: "Loading zone ${zoneName}... Please wait"
};

const login = {
	invalid: "invalid name chosen"
	, exists: "username exists, please try another"
	, allFields: "please complete all fields"
	, illegal: "illegal characters in username"
	, incorrect: "invalid username and password"
	, charExists: "character name is taken"
	, maxUsernameLength: "username may not be longer than 32 characters"
};

const createCharacter = {
	nameLength: "name must be between 3 and 12 characters"
	, notConnected: "must be connected to create a character"
};

export default {
	announcements
	, gatherer
	, spellbook
	, items
	, zone
	, login
	, createCharacter
};

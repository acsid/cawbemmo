/** fr.mjs - Server-side French message templates.
 * Independent of the client's js/locale/fr.js (server-owned strings only).
 * ${key.*} tokens are left literal: the server doesn't know the client's
 * rebound keymap, so the client resolves them (announcements.js keyDict).
 * Other ${tokens} are runtime values supplied at the call site.
 */

const announcements = {
	doorOpen: "Appuyez sur ${key.use} pour ouvrir cette porte"
	, doorClose: "Appuyez sur ${key.use} pour fermer cette porte"
	, doorLocked: "Vous n'avez pas la clé pour déverrouiller cette porte"
	, stash: "Appuyez sur ${key.use} pour accéder à votre réserve partagée"
	, wardrobe: "Appuyez sur ${key.use} pour accéder à l'armoire"
	, workbench: "Appuyez sur ${key.use} pour accéder à ${workbenchName}"
	, workbenchNotice: "Appuyez sur ${key.use} pour ${notice}"
};

const gatherer = {
	bagsFull: "Vos sacs sont trop pleins pour récolter davantage de ressources."
	, needFishingRod: "Vous avez besoin d'une canne à pêche pour pêcher"
	, fishGotAway: "Le poisson s'est enfui"
	, schoolDepleted: "Le banc a été épuisé"
	, fishPrompt: "Appuyez sur ${key.gather} pour pêcher ${resource}"
	, herbPrompt: "Appuyez sur ${key.gather} pour récolter ${resource}"
};

const spellbook = {
	attackRefused: "Vous ne voulez pas attaquer cette cible"
	, healRefused: "Vous ne voulez pas soigner cette cible"
	, weaponCooldown: "L'arme est en recharge"
	, spellCooldown: "Le sort est en recharge"
	, insufficientMana: "Mana insuffisant pour lancer le sort"
	, outOfRange: "Cible hors de portée"
	, noLineOfSight: "Cible non visible"
};

const items = {
	onCooldown: "Cet objet est en recharge"
	, recipeKnown: "Vous connaissez déjà cette recette"
	, recipeLearned: "La recette s'imprime dans votre esprit, puis disparaît"
};

const zone = {
	loading: "Chargement de la zone ${zoneName}... Veuillez patienter"
};

const login = {
	invalid: "nom choisi invalide"
	, exists: "ce nom d'utilisateur existe déjà, veuillez en choisir un autre"
	, allFields: "veuillez remplir tous les champs"
	, illegal: "caractères interdits dans le nom d'utilisateur"
	, incorrect: "nom d'utilisateur ou mot de passe invalide"
	, charExists: "ce nom de personnage est déjà pris"
	, maxUsernameLength: "le nom d'utilisateur ne peut pas dépasser 32 caractères"
};

const createCharacter = {
	nameLength: "le nom doit contenir entre 3 et 12 caractères"
	, notConnected: "vous devez être connecté pour créer un personnage"
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

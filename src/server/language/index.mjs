/** index.mjs - Server-side translation global.
 * Wraps common/locale.mjs's translate() with the server-owned dictionaries.
 * Registered as global.language in both the main process (server/globals.mjs)
 * and the worker (world/worker.js), so CJS components reach it synchronously:
 *   language.translate(obj.language, "announcements", "doorOpen")
 */

import { translate } from "../../common/locale.mjs";

const dictionaries = {
	en: (await import("./dictionary/en.mjs")).default
	, fr: (await import("./dictionary/fr.mjs")).default
};

const defaultLanguage = "en";

export default {
	availableLanguages: Object.keys(dictionaries)

	//Resolve a message for a player's language. Falls back to the default
	//(English) when the language has no dictionary. propNames are passed
	//through to common translate(), including an optional trailing object
	//for runtime-token replacement.
	, translate: function (lang, ...propNames) {
		const dict = dictionaries[lang] || dictionaries[defaultLanguage];
		return translate(dict, ...propNames);
	}
};

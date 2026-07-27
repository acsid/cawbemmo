import events from "/js/system/events.js";
import { getMessage, getLocalizedMessage, stringifyStatValue, translate } from "/common/locale.mjs";

/** Localize an HTML structure using the current locale.
 * @static
 * @param {(Node|String)} element - HTML Node.
 * @returns the element after localisation.
 */
const localizeHTML = function localizeHTML (dictionary, element) {
	if (element instanceof Node) {
		if (element.nodeName === "TEMPLATE") {
			for (const node of element.content.childNodes.values()) {
				localizeHTML(dictionary, node);
			}
			return element;
		}
		const hasChildNodes = element.hasChildNodes();
		if (element instanceof Element) {
			if (element.hasAttributes()) {
				const attrs = element.attributes;
				for (let i = attrs.length - 1; i >= 0; --i) {
					const attrib = attrs[i];
					const attrVal = attrib.value;
					attrib.value = getLocalizedMessage(dictionary, attrVal);
					if (attrib.value !== attrVal) {
						_.log.localizeHTML.debug(`Node: ${element.nodeName}, Attribute "${attrs[i]}" tranlated.`);
					}
				}
			}
			if (element instanceof HTMLElement) {
				if (!hasChildNodes) {
					element.innerText = getLocalizedMessage(dictionary, element.innerText);
				}
			} else if (element instanceof SVGElement) {
				_.log.localizeHTML.warn("SVG elements are unsupported. Returning unmoddified element");
			} else {
				_.log.localizeHTML.warn(`Unknown element "${element.id}" Returning unmoddified element %o`, element);
			}
		} else if (
			// Text based nodes.
			element.nodeType === Node.COMMENT_NODE
			|| element.nodeType === Node.TEXT_NODE
			|| element instanceof CDATASection
			|| element instanceof Comment
			|| element instanceof Text
		) {
			element.nodeValue = getLocalizedMessage(dictionary, element.nodeValue);
		} else if (element.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
			_.log.localizeHTML.warn(`Unknown node type "${element.nodeName}.nodeType: ${element.nodeType}`);
		}
		if (hasChildNodes) {
			for (const node of element.childNodes.values()) {
				localizeHTML(dictionary, node);
			}
		}
	} else if (typeof element === "string") {
		// HTML element string
		// <p>${propName}</p>
		return getLocalizedMessage(dictionary, element);
	} else {
		_.log.localizeHTML.warn("Unknown instance type \"%o\" is unsupported.", element);
	}
	return element;
};

export default {
	language: null
	, availableLanguages: [ "en", "fr" ]
	, dictionary: {}

	, init: async function (language) {
		if (language && !this.availableLanguages.includes(language)) {
			throw new Error(`Language ${language} isn't available!`);
		}
		if (!this.language || language) {
			this.language = language || this.getLanguage();
		}
		this.dictionary = await import(`/js/locale/${this.language}.js`);
		await events.emit("onGetTranslation", {
			locale: this
			, language: this.language
			, dictionary: this.dictionary
		});
	}
	, getLanguage: function () {
		if (navigator.languages) {
			for (const lc of navigator.languages) {
				if (this.availableLanguages.includes(lc)) {
					return lc;
				}
			}
		}
		if (navigator.language && this.availableLanguages.includes(navigator.language)) {
			return navigator.language;
		}
		return this.availableLanguages[0];
	}

	, getLocalizedMessage
	, getMessage
	, localizeHTML

	, stringifyStatValue

	, translate: function (...propNames) {
		return translate(this.dictionary, ...propNames);
	}
};

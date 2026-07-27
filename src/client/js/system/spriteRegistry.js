import globals from "/js/system/globals.js";
import resources from "/js/resources.js";

//Per-sheet CSS-inject status, keyed by sheet name. Once a sheet's compiled
//rules are appended to a <style> tag we never touch them again.
const injectedCss = {};
//Per-sheet props objects (the parsed <sheet>.json), keyed by sheet name.
const props = {};
//Per-sheet image natural dimensions { width, height } in source pixels,
//cached during init from the loaded resources.sprites images.
const dimensions = {};

export default {
	//Fetches every <sheet>.json/<sheet>.css listed in clientConfig.spriteOverrides
	//and caches the results, and caches image dimensions for every sheet in
	//clientConfig.textureList. Must be awaited after resources.init and before
	//the UI renders.
	init: async function () {
		const overrides = globals.clientConfig.spriteOverrides || {};
		await Promise.all(Object.entries(overrides).map(([sheet, has]) => {
			return this.loadSheet(sheet, has);
		}));

		//Cache natural dimensions of every loaded sheet image. Used by
		//getSpriteProps (sheetWidth/sheetHeight) so callers don't need to
		//reach into resources.sprites themselves.
		const textureList = globals.clientConfig.textureList || [];
		for (const sheet of textureList) {
			const img = resources.sprites[sheet];
			if (img && img.naturalWidth) {
				dimensions[sheet] = {
					width: img.naturalWidth
					, height: img.naturalHeight
				};
			}
		}
	}

	, loadSheet: async function (sheet, has) {
		if (has.props) {
			try {
				const res = await fetch(`/images/${sheet}.json`);
				if (res.ok) {
					props[sheet] = await res.json();
				}
			} catch (e) {
				_.log.spriteRegistry.error(`Failed to load props for '${sheet}'`, e);
			}
		}
		if (has.css) {
			try {
				//lessMiddleware compiles <sheet>.less into <sheet>.css on the fly.
				const res = await fetch(`/images/${sheet}.css`);
				if (res.ok) {
					this.injectCss(sheet, await res.text());
				}
			} catch (e) {
				_.log.spriteRegistry.error(`Failed to load css for '${sheet}'`, e);
			}
		}
	}

	, injectCss: function (sheet, css) {
		if (injectedCss[sheet] || !css) {
			return;
		}
		const style = document.createElement("style");
		style.id = `sprite-css-${sheet}`;
		style.textContent = css;
		document.head.appendChild(style);
		injectedCss[sheet] = true;
	}

	//Returns { size, sheetWidth, sheetHeight, ...overrides } for a sheet+module.
	//size/sheetWidth/sheetHeight are auto-generated from config + cached image
	//dimensions; module-specific keys overlay from <sheet>.json.
	, getSpriteProps: function ({ name: sheetName, module: moduleName }) {
		const size = globals.clientConfig.spriteSizes[sheetName];
		const dims = dimensions[sheetName] || {};
		const file = props[sheetName];
		const moduleProps = (file && file[moduleName]) || {};
		return {
			size
			, sheetWidth: dims.width
			, sheetHeight: dims.height
			, ...moduleProps
		};
	}

	//CSS rules are injected into a <style> tag during init, so at call time
	//there's nothing to return — callers opt in by adding a class like
	//`sprite-<sheet>-<module>` that the <sheet>.less file targets. This method
	//exists for parity with getSpriteProps and for consumers that need to know
	//whether a sheet has css at all.
	, getSpriteCSS: function ({ name: sheetName }) {
		return Boolean(injectedCss[sheetName]);
	}
};

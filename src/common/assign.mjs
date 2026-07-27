/** assign.mjs - A recursive implementation of Object.assign()
 */
const assignRecursive = function (newObj, objSrc, remapCallback, path) {
	if (!objSrc || typeof objSrc !== "object") {
		return objSrc;
	}
	if (Array.isArray(objSrc)) {
		if (!newObj || !newObj.push) {
			newObj = [];
		}
		for (let i = 0; i < objSrc.length; i++) {
			if (!remapCallback) {
				newObj[i] = assignRecursive(newObj[i], objSrc[i]);
				continue;
			}
			const remap = remapCallback(newObj, objSrc[i], path, i);
			const iPath = (path ? `${path}[${i}]` : `[${i}]`);
			if (typeof remap !== "object") {
				if (remap) {
					_.log.assignRecursive.error("Invalid remapCallback results '%s'.", remap);
				}
				newObj[i] = assignRecursive(newObj[i], objSrc[i], remapCallback, iPath);
				continue;
			}
			if (!remap.has("index")) {
				remap.index = i;
			} else if (remap.index < 0) {
				remap.index = newObj.length;
			}
			if (Object.hasOwn(remap, "value")) {
				newObj[remap.index] = assignRecursive(undefined, remap.value);
			} else {
				newObj[remap.index] = assignRecursive(newObj[remap.index], objSrc[i], remapCallback, iPath);
			}
		}
		return newObj;
	}
	if (!newObj) {
		if (!_.isPlainObject(objSrc)) {
			if (typeof objSrc.clone === "function") {
				_.log.assign.trace("Cloning %o using objSrc.clone().", objSrc);
				return objSrc.clone();
			}
			_.log.assign.debug("objSrc is not a plain object! Object %o will be returned unmodified.", objSrc);
			return objSrc;
		}
		newObj = {};
	}
	/* Debug for particles
	if (!remapCallback
		&& newObj.has("behaviors") && Array.isArray(newObj.behaviors) && newObj.behaviors.length > 0
		&& objSrc.has("behaviors") && Array.isArray(objSrc.behaviors) && objSrc.behaviors.length > 0
	) {
		throw new Error(`Maybe use assignWith("particles") ??`);
	}
	*/
	for (const propName in objSrc) {
		if (!Object.hasOwn(objSrc, propName)) {
			continue;
		}
		if (!remapCallback) {
			newObj[propName] = assignRecursive(newObj[propName], objSrc[propName]);
			continue;
		}
		const remap = remapCallback(newObj, objSrc[propName], path, propName);
		const nPath = (path ? `${path}.${propName}` : propName);
		if (typeof remap !== "object") {
			if (remap) {
				_.log.assignRecursive.error("Invalid remapCallback results '%s'.", remap);
			}
			newObj[propName] = assignRecursive(newObj[propName], objSrc[propName], remapCallback, nPath);
			continue;
		}
		if (!remap.has("index")) {
			remap.index = propName;
		}
		if (Object.hasOwn(remap, "value")) {
			newObj[remap.index] = assignRecursive(undefined, remap.value);
		} else {
			newObj[remap.index] = assignRecursive(newObj[remap.index], objSrc[propName], remapCallback, nPath);
		}
	}
	return newObj;
};

export const REMAPPERS = {
	particles: function(target, value, path, property) {
		if (Array.isArray(target) && path.endsWith("behaviors") && value.has("type")) {
			const result = {
				// Replace index using matching type entry.
				index: target.findIndex((v) => v.type === value.type)
			};
			if (value.type === "spawnShape") {
				// Replace old spawnShape with new one instead of merging.
				result.value = value;
			}
			return result;
		}
		if (property === "list" && Array.isArray(value) && value[0].has("time")) {
			// Replace all values using a copy of the current array.
			return { value };
		}
	}
};

export default {
	/** Recursively assign all sources properties to the target object.
	 * @param {*} target object
	 * @param  {...any} srcArgs source objects
	 * @returns target
	 */
	assign: function (target, ...srcArgs) {
		for (const srcA of srcArgs) {
			assignRecursive(target, srcA);
		}
		return target;
	}

	, assignWith: function (remapCallback, target, ...srcArgs) {
		if (typeof remapCallback === "string") {
			remapCallback = REMAPPERS[remapCallback];
		}
		for (const srcA of srcArgs) {
			assignRecursive(target, srcA, remapCallback);
		}
		return target;
	}
};

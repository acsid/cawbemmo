/** globals.js - Export global vars to both client and server.
 */
(function() {
	//eslint-disable-next-line no-extend-native
	Object.defineProperties(Array.prototype, {
		"spliceWhere": { enumerable: false
			, value: function (callback, thisArg) {
				const arrObj = Object(this);
				for (let idx = (arrObj.length || 0) - 1; idx >= 0; --idx) {
					if (!(idx in arrObj)) {
						continue;
					}
					if (!callback.call(thisArg, arrObj[idx], idx, arrObj)) {
						continue;
					}
					arrObj.splice(idx, 1);
				}
			}
		}
		, "spliceFirstWhere": { enumerable: false
			, value: function (callback, thisArg) {
				const arrObj = Object(this);
				let len = arrObj.length || 0;
				for (let idx = 0; idx < len; ++idx) {
					if (!(idx in arrObj)) {
						continue;
					}
					const kValue = arrObj[idx];
					if (!callback.call(thisArg, kValue, idx, arrObj)) {
						continue;
					}
					arrObj.splice(idx, 1);
					return kValue;
				}
			}
		}

		, "shuffle": { enumerable: false, writable: true
			, value: function shuffle() {
				let currentIndex = this.length;
				let randomIndex;
				// While there remain elements to shuffle...
				while (currentIndex != 0) {
					// Pick a remaining element...
					randomIndex = Math.floor(Math.random() * currentIndex);
					currentIndex--;
					// And swap it with the current element.
					[ this[currentIndex], this[randomIndex] ] = [ this[randomIndex], this[currentIndex] ];
				}
				return this;
			}
		}
	});

	//eslint-disable-next-line no-extend-native
	Object.defineProperty(Object.prototype, "has", {
		enumerable: false, writable: true
		, value: function (prop) {
			return (this.hasOwnProperty(prop) && this[prop] !== undefined && this[prop] !== null);
		}
	});

	if (!String.prototype.padStart) {
		//eslint-disable-next-line no-extend-native
		String.prototype.padStart = function padStart (targetLength, padString) {
			targetLength = targetLength >> 0;
			padString = String(typeof padString !== "undefined" ? padString : " ");
			if (this.length >= targetLength) {
				return String(this);
			}
			targetLength = targetLength - this.length;
			if (targetLength > padString.length) {
				padString += padString.repeat(targetLength / padString.length);
			}
			return padString.slice(0, targetLength) + String(this);
		};
	}
	Object.defineProperties(String.prototype, {
		capitalize: {
			enumerable: false
			, value: function() {
				return this[0].toUpperCase() + this.substr(1);
			}
		}
		, indexOfAny: {
			enumerable: false
			, value: function (charsArr) {
				const sLen = this.length;
				for (let i = 0; i < sLen; ++i) {
					if (charsArr.includes(this[i])) {
						return i;
					}
				}
				return -1;
			}
		}
		, isAlphanumeric: {
			enumerable: false
			, value: function () {
				return /^[0-9a-zA-Z]+$/.test(this);
			}
		}
		, replaceAllWith: {
			enumerable: false
			, value: function(template) {
				return
			}
		}
	});

	const makeQuerablePromise = function (promise) {
		if (typeof promise !== 'object') {
			throw new Error('promise is not an object.');
		}
		if (!(promise instanceof Promise)) {
			throw new Error('Argument is not a promise.');
		}
		// Don't modify a promise that's been already modified.
		if ('isResolved' in promise || 'isRejected' in promise || 'isPending' in promise) {
			return promise;
		}
		let isPending = true;
		let isRejected = false;
		let rejectReason = undefined;
		let isResolved = false;
		let resolvedValue = undefined;
		const qurPro = promise.then(
			function(val){
				isResolved = true;
				isPending = false;
				resolvedValue = val;
				return val;
			}
			, function(reason) {
				rejectReason = reason;
				isRejected = true;
				isPending = false;
				throw reason;
			}
		);
		Object.defineProperties(qurPro, {
			isResolved: {
				get: () => isResolved
			}
			, resolvedValue: {
				get: () => resolvedValue
			}
			, isPending: {
				get: () => isPending
			}
			, isRejected: {
				get: () => isRejected
			}
			, rejectReason: {
				get: () => rejectReason
			}
		});
		return qurPro;
	};

	const PromiseSource = function () {
		let srcPromise;
		if (typeof Promise.withResolvers === "function") {
			const { promise, resolve, reject } = Promise.withResolvers();
			srcPromise = promise;
			Object.defineProperties(this, {
				resolve: { value: resolve, writable: false }
				, reject: { value: reject, writable: false }
			});
		} else {
			srcPromise = new Promise((resolve, reject) => {
				Object.defineProperties(this, {
					resolve: { value: resolve, writable: false }
					, reject: { value: reject, writable: false }
				});
			});
		}
		Object.defineProperties(this, {
			promise: {
				value: makeQuerablePromise(srcPromise)
				, writable: false
			}
			, isResolved: {
				get: () => this.promise.isResolved
			}
			, resolvedValue: {
				get: () => this.promise.resolvedValue
			}
			, isPending: {
				get: () => this.promise.isPending
			}
			, isRejected: {
				get: () => this.promise.isRejected
			}
			, rejectReason: {
				get: () => this.promise.rejectReason
			}
		});
	};

	const tmpExport = {
		CONSTANTS: (params, obj, enumerable = true) => {
			const properties = {};
			if (typeof params === "object") {
				params = [].concat(
					Object.getOwnPropertySymbols(params).map(s => [s, params[s]])
					, Object.entries(params)
				);
			}
			if (Array.isArray(params)) {
				params.forEach(([key, val]) => properties[key] = { value: val, writable: false, configurable: true, enumerable });
			} else {
				throw new Error("Invalid params type");
			}
			return Object.defineProperties(obj || window || global, properties);
		}

		, constrain: function(n, low, high) {
			return Math.max(Math.min(n, high), low);
		}

		/** Pause the execution of an async function until timer elapse.
		 * @Returns a promise that will resolve after the specified timeout.
		 */
		, asyncDelay: function (timeout, arg = true) {
			return new Promise((resolve, reject) => setTimeout(resolve, timeout, arg));
		}

		, Lock: function(name) {
			if (typeof navigator === "object" && typeof navigator.locks?.request === "function") {
				this.request = (options, callback) => {
					return navigator.locks.request(name, options, callback);
				}
			} else {
				const self = this;
				this.createLockBuffer = [];
				const requestLock = () => {
					const releaseLock = (lockEntry) => {
						self.createLockBuffer.spliceWhere((c) => c === lockEntry);
						const nextEntry = self.createLockBuffer[0];
						if (!nextEntry) {
							return;
						}
						nextEntry.takeLock();
					};
					return new Promise((res) => {
						const lockEntry = {};
						lockEntry.takeLock = res.bind(null, releaseLock.bind(null, lockEntry));
						self.createLockBuffer.push(lockEntry);
						if (self.createLockBuffer.length === 1) {
							lockEntry.takeLock();
						}
					});
				};
				this.request = async (...args) => {
					let options, callback;
					if (args.length <= 0) {
						callback = () => {};
					} else if (args.length === 1) {
						callback = args[0];
					} else if (args.length >= 2) {
						options = args[0];
						callback = args[1];
					}
					const releaseLock = await requestLock();
					try {
						//TODO "shared" is not supported.
						return await callback({ mode: "exclusive", name });
					} catch (err) {
						_.log.Lock[name].error(err);
						throw err;
					} finally {
						releaseLock();
					}
				};
			}
		}

		, makeQuerablePromise
		, PromiseSource

		/** A debounce is a higher-order function, which is a function that returns another function
		* that, as long as it continues to be invoked, will not be triggered.
		* The function will be called after it stops being called for N milliseconds.
		* If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
		* @Returns a promise that will resolve to func return value.
		*/
		, debounce: function(func, wait, immediate, allowRepeat) {
			if (typeof wait === "undefined") {
				wait = 40;
			}
			if (typeof wait !== "number") {
				throw new Error("wait is not an number.");
			}
			let timeout = null;
			let lastPromiseSrc = new PromiseSource();
			const applyFn = function(context, args) {
				if (!lastPromiseSrc) {
					return;
				}
				let result = undefined;
				try {
					result = func.apply(context, args);
				} catch (err) {
					lastPromiseSrc.reject(err);
					lastPromiseSrc = null;
					return;
				}
				if (result instanceof Promise) {
					result.then(lastPromiseSrc.resolve, lastPromiseSrc.reject);
				} else {
					lastPromiseSrc.resolve(result);
				}
				lastPromiseSrc = null;
			}
			return function(...args) {
				const callNow = Boolean(immediate && !timeout);
				const context = this;
				if (!lastPromiseSrc) {
					lastPromiseSrc = new PromiseSource();
				}
				const currentPromiseSrc = lastPromiseSrc;
				if (timeout) {
					if (allowRepeat) {
						return;
					}
					clearTimeout(timeout);
				}
				timeout = setTimeout(function () {
					if (!immediate) {
						applyFn(context, args);
					}
					timeout = null;
				}, wait)
				if (callNow) {
					applyFn(context, args);
				}
				return currentPromiseSrc.promise;
			}
		}
		, retry: function(fn, amount, onError) {
			const doFn = function(triesLeft, args) {
				const ctx = this;
				const asyncRetry = async (promiseSrc, reason) => {
					if (reason && onError) {
						try {
							await onError(reason);
						} catch (err) {
							promiseSrc.reject(err);
							throw err;
						}
					}
					triesLeft = triesLeft - 1;
					if (triesLeft >= 0) {
						await doFn.call(ctx, triesLeft, args).then(promiseSrc.resolve, promiseSrc.reject);
					} else {
						promiseSrc.reject(reason);
					}
				};
				do {
					try {
						const result = fn.apply(ctx, args);
						if (result instanceof Promise) {
							const promiseSrc = new PromiseSource();
							result.then(promiseSrc.resolve, asyncRetry.bind(null, promiseSrc));
							return promiseSrc.promise;
						}
						return result;
					} catch (err) {
						if (onError) {
							const ret = onError(err);
							if (ret instanceof Promise) {
								const promiseSrc = new PromiseSource();
								ret.then(asyncRetry.bind(null, promiseSrc, undefined), promiseSrc.reject);
								return promiseSrc.promise;
							}
						}
						triesLeft = triesLeft - 1;
						if (triesLeft < 0) {
							throw err;
						}
					}
				} while (triesLeft >= 0);
			};
			return function(...args) {
				return doFn.call(this, amount, args);
			};
		}

		, get2dArray: function (w, h, def) {
			def = def || 0;
			const result = [];
			for (let i = 0; i < w; i++) {
				const inner = [];
				for (let j = 0; j < h; j++) {
					if (def === "array") {
						inner.push([]);
					} else {
						inner.push(def);
					}
				}
				result.push(inner);
			}
			return result;
		}

		, getDirectionsDeltas: function* (rangeX = 1, rangeY) {
			if (!rangeY) {
				rangeY = rangeX;
			}
			for (let xDir = -rangeX; xDir <= rangeX; ++xDir) {
				for (let yDir = -rangeY; yDir <= rangeY; ++yDir) {
					yield [ xDir, yDir ];
				}
			}
		}
		, getPositions: function* (rect) {
			if (!rect) {
				return;
			}
			const xEnd = rect.x + (rect.width || rect.w || 1);
			for (let xPos = rect.x; xPos <= xEnd; ++xPos) {
				const yEnd = rect.y + (rect.height || rect.h || 1);
				for (let yPos = rect.y; yPos <= yEnd; ++yPos) {
					yield [ xPos, yPos ];
				}
			}
		}

		, getGuid: function () {
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
				let r = Math.random() * 16 | 0;
				let v = (c === "x" ? r : (r & 0x3 | 0x8));
				return v.toString(16);
			});
		}

		, randomInt: function (min, max) {
			//The maximum is exclusive and the minimum is inclusive
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min;
		}
		, randomKey: function (o) {
			const keys = Object.keys(o);
			return keys[Math.floor(Math.random() * keys.length)];
		}
		, randomObj: function (...args) {
			if (typeof args === "undefined" || !Array.isArray(args) || args.length <= 0) {
				return undefined;
			}
			if (args.length === 1) {
				if (Array.isArray(args[0])) {
					// If single item array at pos zero.
					args = args[0];
				} else {
					// Only a single choice possible.
					return args[0];
				}
			}
			return args[Math.floor(Math.random() * args.length)];
		}
	};

	if (typeof define === "function" && define.amd) {
		define([
			"assign"
		], function(
			assignModule
		) {
			assignModule.assign(tmpExport, assignModule);
			return tmpExport;
		});
	} else if (typeof module === "object" && module.exports) {
		const assignModule = require("./assign");
		assignModule.assign(tmpExport, assignModule);
		module.exports = tmpExport;
	} else {
		throw new Error("Can't load globals.js in current env.");
	}
})();

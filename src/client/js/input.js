import events from "/js/system/events.js";
import renderer from "/js/rendering/renderer.js";

export class GamepadInputEvent extends Event {
	#axes;
	#buttons;
	#targetName;
	#repeat;

	constructor (gamepad, options = {}) {
		super("gamepad", {
			bubbles: true // Allows to bubble up the DOM tree
			, cancelable: true // Allows to be canceled
			, composed: true // Will trigger listeners outside of a shadow root
		});
		this.#axes = _.assign({}, gamepad.axes);
		this.#buttons = _.assign([], gamepad.buttons);
		this.#targetName = gamepad.target;
		this.#repeat = Boolean(options.repeat);
	}

	get axes () {
		return this.#axes;
	}

	get buttons () {
		return this.#buttons;
	}

	get repeat () {
		return this.#repeat;
	}

	get targetName () {
		return this.#targetName;
	}
}

const INPUT_STATE = {
	RELEASED: -1
	, CAPTURED: 1
	, TRIGGERED: 2
	, CONSUMED: 3
};
Object.freeze(INPUT_STATE);

const KEYBOARD_MAPPINGS = {
	8: "backspace"
	, 9: "tab"
	, 13: "enter"
	, 16: "shift"
	, 17: "ctrl"
	, 27: "esc"
	, 32: "space"
	, 37: "left"
	, 38: "up"
	, 39: "right"
	, 40: "down"
	, 46: "del"
	, 192: "backquote"

	//hacks for mac cmd key
	, 224: "ctrl"
	, 91: "ctrl"
	, 93: "ctrl"
};
const KEYBOARD_NAMED_MAPPINGS = {
	Digit0: 48
	, Digit1: 49
	, Digit2: 50
	, Digit3: 51
	, Digit4: 52
	, Digit5: 53
	, Digit6: 54
	, Digit7: 55
	, Digit8: 56
	, Digit9: 57

	, NumpadDecimal: "NumpadDecimal"
	, NumpadDivide: "NumpadDivide"
	, NumpadMultiply: "NumpadMultiply"
	, NumpadSubtract: "NumpadSubtract"
	, NumpadAdd: "NumpadAdd"
	, NumpadEnter: "NumpadEnter"
};
for (let i = 0; i <= 32; ++i) {
	if (i >= 0 && i <= 9) {
		KEYBOARD_NAMED_MAPPINGS[`Numpad${i}`] = `Numpad${i}`;
	}
	if (i >= 1 && i <= 32) {
		KEYBOARD_NAMED_MAPPINGS["F" + i] = "F" + i;
	}
}
const KEYBOARD_AXES_DEFAULT = {
	horizontal: {
		negative: ["left", "a", "q", "z"]
		, positive: ["right", "d", "e", "c"]
	}
	, vertical: {
		negative: ["up", "w", "q", "e"]
		, positive: ["down", "s", "x", "z", "c"]
	}
};
const KEYBOARD_KEYS_DEFAULT = {
	modifier_1: {
		values: [ "shift" ]
		, actions: [ "showTooltip" ]
	}
	, modifier_2: [ "ctrl" ]

	, mainmenu: [ "esc" ]
	, select: [ "backquote" ]

	, gather: [ "g" ]
	, use: [ "u" ]
	, spell_0: [ "space" ]
	, spell_1: [ "1" ]
	, spell_2: [ "2" ]
	, spell_3: [ "3" ]
	, spell_4: [ "4" ]
	, target: [ "tab" ]
};
const KEYBOARD_PREVENT_DEFAULT_KEYCODES = [
	8 // backspace
	, 9 // tab
	, 122 // F11
];
const GAMEPAD_UPDATE_DELAY = 33;
const GAMEPAD_REPEAT_DELAY = 44;
const GAMEPAD_AXES_DEFAULT = {
	horizontal: 0
	, vertical: 1
	, cameraX: 2
	, cameraY: 3
};
const GAMEPAD_AXES_EPSILON = 0.01;
const GAMEPAD_BUTTONS_DEFAULT = {
	/** Standard Gamepad buttons
	 * 0	Bottom button in right cluster
	 * 1	Right button in right cluster
	 * 2	Left button in right cluster
	 * 3	Top button in right cluster
	 * 4	Top left front button
	 * 5	Top right front button
	 * 6	Bottom left front button
	 * 7	Bottom right front button
	 * 8	Left button in center cluster
	 * 9	Right button in center cluster
	 * 10	Left stick pressed button
	 * 11	Right stick pressed button
	 * 12	Top button in left cluster
	 * 13	Bottom button in left cluster
	 * 14	Left button in left cluster
	 * 15	Right button in left cluster
	 * 16	Center button in center cluster
	 */
	modifier_1: {
		values: [ 4 ]
		, actions: [ "showTooltip" ]
		, spell_1: [ 0 ]
		, spell_2: [ 1 ]
		, spell_3: [ 2 ]
		, spell_4: [ 3 ]
	}
	, modifier_2: [ 5 ]

	, mainmenu: [ 9 ]
	, select: [ 8 ]

	, spell_0: [ 0 ]
	, gather: [ 1 ]
	, target: [ 2 ]
	, use: [ 3 ]
};

export default {
	axes: {}
	, mappings: {}
	, actions: {}

	//TODO Detect keyboard mapping, US, CA, FR, Etc...
	, namedKeyCodeMappings: _.assign({}, KEYBOARD_NAMED_MAPPINGS)
	, keyCodeMappings: _.assign({}, KEYBOARD_MAPPINGS)
	, blacklistedKeys: []
	, whitelistedKeys: []
	, keyboard: {
		type: "keyboard"
		, pressed: []
		, target: ""
	}
	, pressedKeys: {} // Obj for Named keys

	, mouse: {
		type: "mouse"
		, buttons: []
		, target: ""
		, x: 0, y: 0
	}
	, pressedMouseButtons: [] // Sparse array for mouse buttons indexes.

	, _gamepads: []
	, lastGamepad_update: 0
	, lastGamepad_change: 0
	, gamepad: {
		type: "gamepad"
		, axes: {
			horizontal: 0
			, vertical: 0
		}
		, buttons: []
		, target: ""
	}
	, pressedGamepadButtons: [] // Sparse array for gamepad buttons indexes.

	, init: function (container) {
		this.uiContainer = document.querySelector(container);
		if (!this.uiContainer) {
			throw new Error("ui-container not found!");
		}

		//TODO Load user configs.
		_.assign(this.axes, {
			gamepad: GAMEPAD_AXES_DEFAULT
			, keyboard: KEYBOARD_AXES_DEFAULT
		});
		_.assign(this.mappings, {
			gamepad: GAMEPAD_BUTTONS_DEFAULT
			, keyboard: KEYBOARD_KEYS_DEFAULT
		});

		if (typeof navigator.getGamepads === "function") {
			this._gamepads = navigator.getGamepads();
		}

		window.addEventListener("gamepadconnected", this.events.gamepad.connected.bind(this));
		window.addEventListener("gamepaddisconnected", this.events.gamepad.disconnected.bind(this));
		window.addEventListener("keydown", this.events.keyboard.down.bind(this, true), { capture: true });
		window.addEventListener("keydown", this.events.keyboard.down.bind(this, false));
		window.addEventListener("keyup", this.events.keyboard.up.bind(this, true), { capture: true });
		window.addEventListener("keyup", this.events.keyboard.up.bind(this, false));

		this.uiContainer.addEventListener("mousedown", this.events.mouse.down.bind(this));
		this.uiContainer.addEventListener("mouseup", this.events.mouse.up.bind(this));
		this.uiContainer.addEventListener("mousemove", this.events.mouse.move.bind(this));
		this.uiContainer.addEventListener("touchstart", this.events.touch.start.bind(this));
		this.uiContainer.addEventListener("touchmove", this.events.touch.move.bind(this));
		this.uiContainer.addEventListener("touchend", this.events.touch.end.bind(this));
		this.uiContainer.addEventListener("touchcancel", this.events.touch.cancel.bind(this));

		events.on("onSceneMove", this.events.mouse.onSceneMove.bind(this));

		if (isMobile) {
			(async () => {
				const exportedModule = await import("/plugins/shake.js");
				return exportedModule.default;
			})().then(this.onLoadShake.bind(this));
		}

		_.log.input.debug("Gamepads: %o", this._gamepads);
		for (const gamepad of this._gamepads) {
			if (!gamepad) {
				continue;
			}
			_.log.input.gamepad.debug(
				"Found gamepad[%d]: %s. %d buttons, %d axes."
				, gamepad.index
				, gamepad.id
				, gamepad.buttons.length
				, gamepad.axes.length
			);
		}
	}

	, update: function () {
		if (typeof navigator.getGamepads === "function") {
			this.updateGamepads();
		}
	}

	, isUIVisible: function () {
		const timestamp = performance.now();
		if (this.isUIVisible.lastUpdate > timestamp - 500) {
			return this.isUIVisible.lastValue;
		}
		const uiElems = this.uiContainer.querySelectorAll(".modal, .uiOverlay");
		let isVisible = false;
		for (const element of uiElems.values()) {
			if (element.offsetHeight > 0 && element.offsetWidth > 0) {
				isVisible = true;
				break;
			}
		}
		this.isUIVisible.lastUpdate = timestamp;
		this.isUIVisible.lastValue = isVisible;
		return isVisible;
	}

	, updateGamepads: function () {
		let lastUpdated = Number.POSITIVE_INFINITY;
		for (const gamepad of this._gamepads) { // Check all connected gamepads for the most stale timestamp (smaller is older).
			if (!gamepad) {
				continue;
			}
			if (gamepad.timestamp < lastUpdated) {
				lastUpdated = gamepad.timestamp;
			}
		}
		if (lastUpdated === Number.POSITIVE_INFINITY
			&& this.pressedGamepadButtons.length
		) { // All gamepads disconnected with pressed buttons.
			for (const button in this.pressedGamepadButtons) {
				delete this.pressedGamepadButtons[button];
				const removedActions = this.getMapping("gamepad", button);
				for (const action of removedActions) {
					delete this.actions[action];
				}
			}
		}
		const timestamp = performance.now();
		if (lastUpdated === Number.POSITIVE_INFINITY
			? timestamp - this.lastGamepad_update < 2000 // When no gamepads connected, check every two seconds.
			: timestamp - lastUpdated < GAMEPAD_UPDATE_DELAY // With gamepad connected, poll the data after configured delay.
		) {
			return; // Was updated recently.
		}
		this._gamepads = navigator.getGamepads();
		this.lastGamepad_update = timestamp;

		const buttons = [];
		for (const gamepad of this._gamepads) {
			if (!gamepad) {
				continue;
			}
			for (const button in gamepad.buttons) {
				const newButtonInfo = gamepad.buttons[button];
				const oldButtonInfo = buttons[button];
				if (!oldButtonInfo
					|| ((newButtonInfo.pressed || newButtonInfo.touched) && !oldButtonInfo.pressed && !oldButtonInfo.touched)
					|| newButtonInfo.value > oldButtonInfo.value
				) {
					buttons[button] = {
						pressed: newButtonInfo.pressed
						, touched: newButtonInfo.touched
						, value: newButtonInfo.value
					};
				}
			}
		}

		//TODO when UI is visible, change action map to allow using the UI with a gamepad.
		const enableInput = !this.isUIVisible();

		let updated = false;
		let repeat = false;
		const targetName = this.getTartgetName(document.activeElement);
		for (const button in buttons) {
			const gButtonInfo = buttons[button];
			if (!gButtonInfo) {
				delete this.pressedGamepadButtons[button];
				continue;
			}
			if (gButtonInfo.pressed || gButtonInfo.touched || gButtonInfo.value > 0.1) {
				if (this.pressedGamepadButtons[button] > 0) {
					this.pressedGamepadButtons[button] = INPUT_STATE.CONSUMED;
					repeat = timestamp - this.lastGamepad_change > GAMEPAD_REPEAT_DELAY;
				} else {
					this.pressedGamepadButtons[button] = INPUT_STATE.CAPTURED;
					updated = true;

					const addedActions = this.getMapping("gamepad", button);
					if (!enableInput) { // Certain actions should always register even if something else is the target.
						addedActions.spliceWhere((a) => !a.startsWith("modifier_"));
					}
					for (const action of addedActions) {
						if (this.actions[action] > 0) {
							this.actions[action] = INPUT_STATE.CONSUMED;
						} else {
							this.actions[action] = INPUT_STATE.TRIGGERED;

							const actionEvent = {
								actionName: action
								, consumed: false
								, target: targetName
							};
							if (targetName === "world") {
								events.emit("uiaction", actionEvent);
							}
							if (this.actions[action] !== INPUT_STATE.CONSUMED) {
								if (actionEvent.consumed) {
									this.actions[action] = INPUT_STATE.CONSUMED;
								} else {
									events.emit("inputaction", actionEvent);
								}
							}
						}
					}
				}
			} else if (this.pressedGamepadButtons[button] > 0) {
				this.pressedGamepadButtons[button] = INPUT_STATE.RELEASED;
				updated = true;

				const removedActions = this.getMapping("gamepad", button);
				for (const action of removedActions) {
					delete this.actions[action];
				}
			} else if (button in this.pressedGamepadButtons) {
				delete this.pressedGamepadButtons[button];
			}
		}
		const horizontal = this.getAxisOf("gamepad", "horizontal");
		const vertical = this.getAxisOf("gamepad", "vertical");
		if (updated) {
			repeat = false;
		} else if (Math.abs(horizontal - this.gamepad.axes.horizontal) > GAMEPAD_AXES_EPSILON
			|| Math.abs(vertical - this.gamepad.axes.vertical) > GAMEPAD_AXES_EPSILON
		) {
			updated = true;
		} else if (Math.abs(horizontal) > 0.1 || Math.abs(vertical) > 0.1) {
			repeat = timestamp - this.lastGamepad_change > GAMEPAD_REPEAT_DELAY;
		}
		if (updated || repeat) {
			this.lastGamepad_change = timestamp;
			this.gamepad.axes = {
				horizontal
				, vertical
				, cameraX: this.getAxisOf("gamepad", "cameraX")
				, cameraY: this.getAxisOf("gamepad", "cameraY")
			};
			this.gamepad.buttons = buttons;
			this.gamepad.target = targetName;

			let shouldContinue = true;
			if (targetName !== "world") {
				shouldContinue = document.activeElement.dispatchEvent(new GamepadInputEvent(this.gamepad, { repeat }));
			}
			const gamepadEvent = _.assign({
				consumed: !shouldContinue
				, repeat
			}, this.gamepad);
			events.emit("inputchanged", gamepadEvent);
		}
	}

	, blacklistKeys: function (list) {
		this.blacklistedKeys.push(...list);
	}

	, unBlacklistKeys: function (list) {
		this.blacklistedKeys.spliceWhere((d) => list.includes(d));
	}

	, whitelistKeys: function (list) {
		this.whitelistedKeys.push(...list);
	}

	, unWhitelistKeys: function (list) {
		this.whitelistedKeys.spliceWhere((d) => list.includes(d));
	}

	, onLoadShake: function (shake) {
		let shaker = new shake({
			threshold: 5
			, timeout: 1000
		});
		shaker.start();
		window.addEventListener("shake", this.events.mobile.shake.bind(this), false);
	}

	, resetKeys: function () {
		for (const key in this.pressedKeys) {
			const removedActions = this.getMapping("keyboard", key);
			for (const action of removedActions) {
				delete this.actions[action];
			}
			events.emit("keyup", key);
		}
		this.pressedKeys = {};

		for (const i in this.pressedMouseButtons) {
			events.emit("mouseup", i);
		}
		this.pressedMouseButtons = [];
	}

	, convertKeyCode: function (charCode) {
		if (typeof charCode === "object") {
			charCode = this.namedKeyCodeMappings[charCode.code] || charCode.which;
		}
		if (typeof charCode === "string") {
			return charCode;
		}
		if (charCode in this.keyCodeMappings) {
			return this.keyCodeMappings[charCode];
		}
		if (charCode >= 97) {
			return (charCode - 96).toString();
		}
		return String.fromCharCode(charCode).toLowerCase();
	}

	, getMapping: function (inputType, eventValue) {
		const inputMap = this.mappings[inputType];
		if (!inputMap) {
			_.log.input.getMapping.warn("Unknown input type %s", inputType);
			return [];
		}
		if (inputType === "keyboard" && typeof eventValue !== "string") {
			eventValue = String(eventValue);
		} else if (inputType === "gamepad" && typeof eventValue !== "number") {
			const newVal = Number.parseInt(eventValue);
			if (!Number.isFinite(newVal)) {
				_.log.input.getMapping.gamepad.warn("Invalid input value '%s', a number is required.", eventValue);
				return [];
			}
			eventValue = newVal;
		}
		const isMatch = (inputValues) => {
			if (inputValues === undefined) {
				_.log.input.getMapping.warn("inputValues is undefined!");
				return false;
			}
			return (inputValues === eventValue
				|| (Array.isArray(inputValues) && inputValues.includes(eventValue))
			);
		};
		const actions = [];
		let done = false;
		for (const actionName in this.actions) { // Check already active actions first.
			if (!this.actions.hasOwnProperty(actionName)) {
				continue;
			}
			const inputValues = inputMap[actionName];
			if (inputValues === undefined) {
				continue;
			}
			if (isMatch(inputValues)) {
				actions.push(actionName);
				done = true;
				continue;
			}
			if (typeof inputValues !== "object") {
				continue;
			}
			done = true;
			if (isMatch(inputValues.values)) {
				// Allow removal of active actions sets.
				actions.push(actionName);
				if (inputValues.actions) {
					actions.push(...inputValues.actions);
				}
			}
			for (const subActionName in inputValues) {
				if (subActionName === "values" || subActionName === "actions"
					|| !inputValues.hasOwnProperty(subActionName)
				) {
					continue;
				}
				const actionValues = inputValues[subActionName];
				if (isMatch(actionValues)) {
					actions.push(subActionName);
				}
			}
		}
		if (done) {
			return actions;
		}
		for (const actionName in inputMap) {
			if (!inputMap.hasOwnProperty(actionName)) {
				continue;
			}
			const inputValues = inputMap[actionName];
			if (isMatch(inputValues)) {
				actions.push(actionName);
				continue;
			}
			if (typeof inputValues === "object" && isMatch(inputValues.values)) {
				actions.push(actionName);
				if (inputValues.actions) {
					actions.push(...inputValues.actions);
				}
			}
		}
		return actions;
	}

	//Reverse of getMapping: resolves an action name back to its first bound
	//key token (e.g. getKeyForAction("gather") -> "g", "mainmenu" -> "esc").
	//Returns the raw token as stored in the keymap; callers format it for
	//display (uppercase) or use it to look up a per-locale label.
	//Returns "" if the action has no binding for inputType.
	, getKeyForAction: function (actionName, inputType = "keyboard") {
		const inputMap = this.mappings[inputType];
		if (!inputMap || inputMap[actionName] === undefined) {
			return "";
		}
		let value = inputMap[actionName];
		//Structured bindings (e.g. modifier_1: { values: ["shift"], actions: [...] })
		//carry their trigger keys under .values; resolve those rather than the
		//wrapper object, matching how getMapping reads the same shape.
		if (value !== null && typeof value === "object" && !Array.isArray(value)) {
			value = value.values;
		}
		if (value === undefined) {
			return "";
		}
		const keys = Array.isArray(value) ? value : [ value ];
		const first = keys[0];
		return (typeof first === "string") ? first : String(first);
	}

	, getTartgetName: function (target) {
		if (target === document.body || target === this.uiContainer) {
			return "world";
		}
		if (target.id) {
			return target.id;
		}
		let pNode = target.parentNode;
		while (pNode && pNode !== this.uiContainer) {
			if (pNode.id) {
				return pNode.id;
			}
			pNode = pNode.parentNode;
		}
		return "ui";
	}

	, isTextInputFocused: function () {
		const el = document.activeElement;
		if (!el) {
			return false;
		}
		const tag = el.tagName;
		return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
	}

	, isActive: function (action, noConsume) {
		const active = this.actions[action];
		if (active > 0) {
			if (noConsume) {
				return true;
			}
			this.actions[action] = INPUT_STATE.CONSUMED;
			return active !== INPUT_STATE.CONSUMED;
		}
		return false;
	}

	, isKeyDown: function (key, noConsume) {
		const down = this.pressedKeys[key];
		if (down > 0) {
			if (noConsume) {
				return true;
			}
			this.pressedKeys[key] = INPUT_STATE.CONSUMED;
			return down !== INPUT_STATE.CONSUMED;
		}
		return false;
	}

	, isMouseButtonDown: function (button, noConsume) {
		const down = this.pressedMouseButtons[button];
		if (down > 0) {
			if (noConsume) {
				return true;
			}
			this.pressedMouseButtons[button] = INPUT_STATE.CONSUMED;
			return down !== INPUT_STATE.CONSUMED;
		}
		return false;
	}

	, isGamepadPressed: function (button, noConsume) {
		const down = this.pressedGamepadButtons[button];
		if (down > 0) {
			if (noConsume) {
				return true;
			}
			this.pressedGamepadButtons[button] = INPUT_STATE.CONSUMED;
			return down !== INPUT_STATE.CONSUMED;
		}
		return false;
	}

	, getAxis: function (axisName) {
		let result = 0;
		for (const inputType in this.axes) {
			result += this.getAxisOf(inputType, axisName);
		}
		return result;
	}
	, getAxisOf: function (inputType, axisName) {
		const inputAxes = this.axes[inputType];
		if (!inputAxes) {
			_.log.input.getAxisOf.error("Input type %s not found!", inputType);
			return 0;
		}
		if (!inputAxes.has(axisName)) {
			_.log.input.getAxisOf.error("Input %s doesnt have axis \"%s\"!", inputType, axisName);
			return 0;
		}
		let result = 0;
		const axis = inputAxes[axisName];
		switch (inputType) {
			case "gamepad":
				for (const gamepad of this._gamepads) {
					if (!gamepad || !gamepad.axes.has(axis)) {
						continue;
					}
					result += Math.round(gamepad.axes[axis]);
				}
				break;
			case "keyboard":
				for (let i = axis.negative.length - 1; i >= 0; --i) {
					const key = axis.negative[i];
					if (this.pressedKeys[key] > 0) {
						this.pressedKeys[key] = INPUT_STATE.CONSUMED;
						result--;
						break;
					}
				}
				for (let i = axis.positive.length - 1; i >= 0; --i) {
					const key = axis.positive[i];
					if (this.pressedKeys[key] > 0) {
						this.pressedKeys[key] = INPUT_STATE.CONSUMED;
						result++;
						break;
					}
				}
				break;
		}
		return result;
	}

	, isKeyAllowed: function (key) {
		return Boolean(key
			&& !this.blacklistedKeys.includes(key)
			&& (!this.blacklistedKeys.includes("*") || this.whitelistedKeys.includes(key))
		);
	}

	, events: {
		keyboard: {
			down: function (capture, e) {
				const key = this.convertKeyCode(e);
				if (!this.isKeyAllowed(key)) {
					_.log.input.keyboard.debug("Not allowed key %s press was ignored.", key);
					return;
				}

				const targetName = this.getTartgetName(e.target);
				this.keyboard.target = targetName;
				if (!capture
					&& targetName === "world"
					&& KEYBOARD_PREVENT_DEFAULT_KEYCODES.includes(e.keyCode)
				) {
					e.preventDefault();
				}

				if (capture) {
					const typing = this.isTextInputFocused();
					const addedActions = this.getMapping("keyboard", key);
					if (typing || targetName !== "world") { //TODO Implement context based actions mappings.
						addedActions.spliceWhere((a) => !a.startsWith("modifier_"));
					}
					for (const action of addedActions) {
						if (this.actions[action] > 0) {
							this.actions[action] = INPUT_STATE.CONSUMED;
							continue;
						}
						this.actions[action] = INPUT_STATE.CAPTURED;
					}
					if (typing && !addedActions.some((a) => a.startsWith("modifier_"))) {
						// While a text input is focused, don't record non-modifier keys into
						// pressedKeys: movement axes (WASD via getAxis) and isKeyDown polls
						// would otherwise react to typing. Modifier keys (shift/ctrl) are still
						// tracked so their polled state stays usable (e.g. tooltips, inventory).
						return;
					}
					if (this.pressedKeys[key] > 0) {
						this.pressedKeys[key] = INPUT_STATE.CONSUMED;
					} else {
						this.pressedKeys[key] = INPUT_STATE.CAPTURED;
						this.keyboard.pressed = Object.keys(this.pressedKeys).filter((n) => this.pressedKeys[n] > 0);
						_.log.input.keyboard.trace("Key %s press, event: %o actions: %o", key, e, addedActions);
					}
				} else {
					for (const action in this.actions) {
						if (this.actions[action] !== INPUT_STATE.CAPTURED) {
							continue;
						}
						this.actions[action] = INPUT_STATE.TRIGGERED;
						const actionEvent = {
							actionName: action
							, consumed: false
							, target: targetName
						};
						if (targetName === "world") {
							events.emit("uiaction", actionEvent);
						}
						if (this.actions[action] !== INPUT_STATE.CONSUMED) {
							if (actionEvent.consumed) {
								this.actions[action] = INPUT_STATE.CONSUMED;
							} else {
								events.emit("inputaction", actionEvent);
							}
						}
					}

					const keyEvent = _.assign({
						key
						, consumed: false
						, event: e
					}, this.keyboard);

					if (this.pressedKeys[key] === INPUT_STATE.CAPTURED) {
						this.pressedKeys[key] = INPUT_STATE.TRIGGERED;
						if (targetName === "world") {
							events.emit("uikeypress", keyEvent);
						}
					} else {
						keyEvent.repeat = Boolean(this.pressedKeys[key] > 0);
					}
					if (this.pressedKeys[key] !== INPUT_STATE.CONSUMED) {
						if (keyEvent.consumed) {
							this.pressedKeys[key] = INPUT_STATE.CONSUMED;
						} else if (!this.isTextInputFocused()) {
							events.emit("keydown", keyEvent);
						}
					}
					events.emit("inputchanged", keyEvent);
				}
			}
			, up: function (capture, e) {
				if (capture) {
					this.keyboard.target = this.getTartgetName(e.target);
				}
				const key = this.convertKeyCode(e);
				if (!this.pressedKeys[key]) {
					return;
				}
				if (capture) {
					this.pressedKeys[key] = INPUT_STATE.RELEASED;
					this.keyboard.pressed = Object.keys(this.pressedKeys).filter((n) => this.pressedKeys[n] > 0);

					const removedActions = this.getMapping("keyboard", key);
					for (const action of removedActions) {
						this.actions[action] = INPUT_STATE.RELEASED;
					}
				} else {
					for (const action in this.actions) {
						if (this.actions[action] !== INPUT_STATE.RELEASED) {
							continue;
						}
						delete this.actions[action];
					}
					delete this.pressedKeys[key];

					const keyEvent = _.assign({
						key
						, consumed: false
						, event: e
					}, this.keyboard);
					events.emit("keyup", keyEvent);
					events.emit("inputchanged", keyEvent);
				}
			}
		}

		, mouse: {
			down: function (e) {
				this.mouse.x = e.clientX;
				this.mouse.y = e.clientY;
				this.mouse.worldX = e.clientX + renderer.pos.x;
				this.mouse.worldY = e.clientY + renderer.pos.y;

				this.pressedMouseButtons[e.button] = 1;
				this.mouse.button = e.button;
				this.mouse.buttons = Object.keys(this.pressedMouseButtons).map((n) => Number.parseInt(n));

				if (e.target !== this.uiContainer
					|| this.uiContainer.classList.contains("blocking")
				) {
					this.mouse.target = "ui";
					return;
				}
				this.mouse.target = "world";

				const mouseEvent = _.assign({
					event: e
				}, this.mouse);
				events.emit("mousedown", mouseEvent);
				events.emit("inputchanged", mouseEvent);
			}
			, up: function (e) {
				this.mouse.x = e.clientX;
				this.mouse.y = e.clientY;
				this.mouse.worldX = e.clientX + renderer.pos.x;
				this.mouse.worldY = e.clientY + renderer.pos.y;

				if (!this.pressedMouseButtons[e.button]) {
					delete this.mouse.button;
					return;
				}
				delete this.pressedMouseButtons[e.button];
				this.mouse.button = e.button;
				this.mouse.buttons = Object.keys(this.pressedMouseButtons).map((n) => Number.parseInt(n));

				if (e.target !== this.uiContainer
					|| this.uiContainer.classList.contains("blocking")
				) {
					this.mouse.target = "ui";
					return;
				}
				this.mouse.target = "world";

				const mouseEvent = _.assign({
					event: e
				}, this.mouse);
				events.emit("mouseup", mouseEvent);
				events.emit("inputchanged", mouseEvent);
			}
			, move: function (e) {
				this.mouse.x = e.clientX;
				this.mouse.y = e.clientY;
				this.mouse.worldX = e.clientX + renderer.pos.x;
				this.mouse.worldY = e.clientY + renderer.pos.y;
				if (this.mouse.has("button") && !this.mouse.buttons.includes(this.mouse.button)) {
					delete this.mouse.button;
				}

				if (e.target !== this.uiContainer
					|| this.uiContainer.classList.contains("blocking")
				) {
					this.mouse.target = "ui";
					return;
				}
				this.mouse.target = "world";

				const mouseEvent = _.assign({
					event: e
				}, this.mouse);
				events.emit("mousemove", mouseEvent);
				events.emit("inputchanged", mouseEvent);
			}
			, onSceneMove: function (e) {
				this.mouse.worldX += e.x;
				this.mouse.worldY += e.y;

				const mouseEvent = _.assign({
					event: e
				}, this.mouse);
				events.emit("mousemove", mouseEvent);
				events.emit("inputchanged", mouseEvent);
			}
		}

		, touch: {
			start: function (e) {
				const touch = e.touches[0];
				this.mouse.x = touch.clientX;
				this.mouse.y = touch.clientY;

				if (e.target !== this.uiContainer
					|| this.uiContainer.classList.contains("blocking")
				) {
					return;
				}
				events.emit("touchstart", {
					x: touch.clientX
					, y: touch.clientY
					, worldX: touch.clientX + renderer.pos.x
					, worldY: touch.clientY + renderer.pos.y
				});
				//events.emit("inputchanged", mouseEvent);
			}
			, move: function (e) {
				const touch = e.touches[0];
				this.mouse.x = touch.clientX;
				this.mouse.y = touch.clientY;

				if (e.target !== this.uiContainer
					|| this.uiContainer.classList.contains("blocking")
				) {
					return;
				}
				events.emit("touchmove", {
					x: touch.clientX
					, y: touch.clientY
					, touches: e.touches.length
				});
				//events.emit("inputchanged", mouseEvent);
			}
			, end: function (e) {
				events.emit("touchend", e);
				//events.emit("inputchanged", mouseEvent);
			}
			, cancel: function (e) {
				events.emit("touchcancel", e);
				//events.emit("inputchanged", mouseEvent);
			}
		}

		, mobile: {
			shake: function (e) {
				events.emit("shake", e);
			}
		}

		, gamepad: {
			connected: function (e) {
				_.log.input.gamepad.debug("Gamepad connected %o", e);
				const gamepad = e.gamepad;
				if (!gamepad) {
					return;
				}
				_.log.input.gamepad.debug(
					"Gamepad connected at index %d: %s. %d buttons, %d axes."
					, gamepad.index
					, gamepad.id
					, gamepad.buttons.length
					, gamepad.axes.length
				);
				this._gamepads[gamepad.index] = gamepad;
			}
			, disconnected: function (e) {
				_.log.input.gamepad.debug("Gamepad disconnected %o", e);
				const gamepad = e.gamepad;
				if (!gamepad) {
					return;
				}
				_.log.input.gamepad.debug(
					"Gamepad disconnected from index %d: %s"
					, gamepad.index
					, gamepad.id
				);
				delete this._gamepads[gamepad.index];
			}
		}
	}
};

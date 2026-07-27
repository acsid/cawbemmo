import events from "/js/system/events.js";
import globals from "/js/system/globals.js";
import spriteRegistry from "/js/system/spriteRegistry.js";

const tplItem = `
	<div class="renderItem item">
		<div class="icon"></div>
		<div class="quantity"></div>
	</div>
`;

const hideTooltip = (el, item, e) => {
	events.emit("onHideItemTooltip", item);
};

const renderItemManager = {
	hoverItem: null

	, onHover: function (el, item, e) {
		if (item) {
			this.hoverItem = item;
		} else {
			item = this.hoverItem;
		}
		let ttPos = null;
		if (el) {
			ttPos = {
				x: Math.floor(e.clientX + 32)
				, y: Math.floor(e.clientY)
			};
		}
		events.emit("onShowItemTooltip", item, ttPos, true);
	}

	, onKeyDown: function (e) {
		if (e.key === "shift" && this.hoverItem) {
			this.onHover();
		}
	}

	, onKeyUp: function (e) {
		if (e.key === "shift" && this.hoverItem) {
			this.onHover();
		}
	}

	, onMouseLeave: function (el, item, e) {
		if (this.hoverItem !== item) {
			return;
		}
		hideTooltip(el, item, e);
		this.hoverItem = null;
	}
};

events.on("keydown", renderItemManager.onKeyDown.bind(renderItemManager));
events.on("keyup", renderItemManager.onKeyUp.bind(renderItemManager));

const addTooltipEvents = (el, item) => {
	const leaveHandler = renderItemManager.onMouseLeave.bind(renderItemManager, el, item);
	let moveHandler = renderItemManager.onHover.bind(renderItemManager, el, item);
	let downHandler = () => {};
	if (isMobile) {
		moveHandler = () => {};
		downHandler = renderItemManager.onHover.bind(renderItemManager, el, item);
	}

	$.event.special.destroyed = {
		remove: function (o) {
			if (o.handler) {
				o.handler();
			}
		}
	};

	el
		.on("mousedown", downHandler)
		.on("mousemove", moveHandler)
		.on("mouseleave", leaveHandler)
		.on("destroyed", leaveHandler);
};

const onShowContext = (item, getItemContextConfig, e) => {
	if (isMobile) {
		hideTooltip(null, item);
	}
	const contextConfig = getItemContextConfig(item);
	if (!contextConfig.length) {
		return;
	}
	events.emit("onContextMenu", contextConfig, e);
	e.preventDefault();
	return false;
};

const addContextEvents = (el, item, getItemContextConfig) => {
	el.on("contextmenu", onShowContext.bind(this, item, getItemContextConfig));
};

export default (container, item, useEl, manageTooltip, getItemContextConfig, showNewIndicators = true) => {
	const itemEl = useEl || $(tplItem).appendTo(container);

	if (!item) {
		itemEl.addClass("empty");
		return itemEl;
	}

	let spritesheet = item.spritesheet || "../../../images/items.png";
	if (!item.spritesheet) {
		if (item.material) {
			spritesheet = "../../../images/materials.png";
		} else if (item.quest) {
			spritesheet = "../../../images/questItems.png";
		} else if (item.type === "consumable") {
			spritesheet = "../../../images/consumables.png";
		} else if (item.type === "skin") {
			spritesheet = "../../../images/characters.png";
		}
	}

	let size = 64;
	if (item.type === "skin") {
		size = 8;
	}
	if (item.spriteSize) {
		size = item.spriteSize;
	}
	const spriteSizes = globals.clientConfig.spriteSizes;
	// Extract filename from path.
	const sheetName = spritesheet.split(/[\\/]/g).pop().split(".")[0];
	if (spriteSizes[sheetName]) {
		size = spriteSizes[sheetName];
	}

	const imgX = (-item.sprite[0] * size);
	const imgY = (-item.sprite[1] * size);
	const backgroundPosition = `${imgX}px ${imgY}px`;

	itemEl
		.find(".icon")
		.css({
			background: `url(${spritesheet}) no-repeat scroll ${backgroundPosition} / auto`
			, width: `${size}px`
			, height: `${size}px`
		});

	if (item.quantity > 1 || item.eq || item.active || item.has("quickSlot")) {
		let elQuantity = itemEl.find(".quantity");
		let txtQuantity = item.quantity;
		if (!txtQuantity) {
			txtQuantity = item.has("quickSlot") ? "QS" : "EQ";
		}
		elQuantity.html(txtQuantity);
		//If the item doesn't have a quantity and we reach this point
		//it must mean that it's active, EQd or QSd
		if (!item.quantity) {
			itemEl.addClass("eq");
		}
	} else if (item.isNew && showNewIndicators) {
		itemEl.addClass("new");
		itemEl.find(".quantity").html("NEW");
	}
	if (item.slot) {
		const equipErrors = window.player.inventory.equipItemErrors(item);
		if (equipErrors.length) {
			itemEl.addClass("no-equip");
		}
	}
	if (item.has("quality")) {
		itemEl.addClass(`quality-${item.quality}`);
	}
	if (manageTooltip) {
		addTooltipEvents(itemEl, item);
	}
	if (getItemContextConfig) {
		addContextEvents(itemEl, item, getItemContextConfig);
	}
	//Scale/margin for filling icon frame live in the per-sheet <sheet>.less override (injected by spriteRegistry at init),
	//targeted via this class. Sheets without an override render at their source size.
	if (spriteRegistry.getSpriteCSS({ name: sheetName })) {
		itemEl.addClass(`sprite-${sheetName}-inventory`);
	}
	return itemEl;
};

define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/inventory/template',
	'css!ui/templates/inventory/styles',
	'html!ui/templates/inventory/templateItem',
	'html!ui/templates/inventory/templateTooltip',
	'js/input'
], function (
	events,
	client,
	template,
	styles,
	tplItem,
	tplTooltip,
	input
) {
	var qualityColors = [{
		r: 252,
		g: 252,
		b: 252
	}, {
		r: 7,
		g: 170,
		b: 214
	}, {
		r: 255,
		g: 255,
		b: 0
	}, {
		r: 192,
		g: 0,
		b: 207
	}, {
		r: 255,
		g: 108,
		b: 4
	}];

	return {
		tpl: template,

		centered: true,

		items: [],

		shiftDown: false,
		ctrlDown: false,

		dragItem: null,
		dragEl: null,
		hoverCell: null,

		modal: true,
		oldSpellsZIndex: 0,

		postRender: function () {
			this.onEvent('onGetItems', this.onGetItems.bind(this));
			this.onEvent('onDestroyItems', this.onDestroyItems.bind(this));
			this.onEvent('onShowInventory', this.toggle.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));

			this.find('.grid')
				.on('mousemove', this.onMouseMove.bind(this))
				.on('mouseleave', this.onMouseDown.bind(this, null, null, false));

			this.find('.split-box .amount').on('mousewheel', this.onChangeStackAmount.bind(this));
			this.find('.split-box').on('click', this.splitStackEnd.bind(this, true));
			this.find('.split-box .button').on('click', this.splitStackEnd.bind(this));
		},

		build: function () {
			var container = this.el.find('.grid')
				.empty();

			var items = this.items
				.filter(function (item) {
					return !item.eq;
				});

			var iLen = Math.max(items.length, 50);

			var rendered = [];

			for (var i = 0; i < iLen; i++) {
				var item = items.find(function (item) {
					return ((item.pos != null) && (item.pos == i));
				});

				if (!item) {
					var itemEl = $(tplItem)
						.appendTo(container);

					itemEl
						.on('mouseup', this.onMouseDown.bind(this, null, null, false))
						.on('mousemove', this.onHover.bind(this, itemEl, item))
						.on('mouseleave', this.hideTooltip.bind(this, itemEl, item))
						.children()
						.remove();

					continue;
				} else {
					rendered.push(item);
				}

				var imgX = -item.sprite[0] * 64;
				var imgY = -item.sprite[1] * 64;

				var itemEl = $(tplItem)
					.appendTo(container);

				var spritesheet = item.spritesheet || '../../../images/items.png';
				if (!item.spritesheet) {
					if (item.material)
						spritesheet = '../../../images/materials.png';
					else if (item.quest)
						spritesheet = '../../../images/questItems.png';
				}

				itemEl
					.data('item', item)
					.on('click', this.onClick.bind(this, item))
					.on('mousedown', this.onMouseDown.bind(this, itemEl, item, true))
					.on('mouseup', this.onMouseDown.bind(this, null, null, false))
					.on('mousemove', this.onHover.bind(this, itemEl, item))
					.on('mouseleave', this.hideTooltip.bind(this, itemEl, item))
					.find('.icon')
					.css('background', 'url(' + spritesheet + ') ' + imgX + 'px ' + imgY + 'px')
					.on('contextmenu', this.showContext.bind(this, item));

				if (item.quantity > 1)
					itemEl.find('.quantity').html(item.quantity);
				else if (item.eq)
					itemEl.find('.quantity').html('EQ');
				else if (item.active)
					itemEl.find('.quantity').html('EQ');

				if (item.eq)
					itemEl.addClass('eq');
				else if (item.isNew) {
					itemEl.addClass('new');
					itemEl.find('.quantity').html('NEW');
				}
			}
		},

		onClick: function (item) {
			var msg = {
				item: item,
				success: true
			};
			events.emit('beforeInventoryClickItem', msg);

			if (!msg.success)
				return;

			if (!this.ctrlDown)
				return;

			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: '{' + item.name + '}',
					item: item
				}
			});
		},

		onMouseDown: function (el, item, down, e) {
			if (e.button != 0)
				return;

			if (down) {
				this.dragEl = el.clone()
					.appendTo(this.find('.grid'))
					.hide()
					.on('mouseup', this.onMouseDown.bind(this, null, null, false))
					.addClass('dragging');

				this.dragItem = el;

				events.emit('onHideItemTooltip', this.hoverItem);
				this.hoverItem = null;
			} else if (this.dragItem) {
				var method = 'moveItem';

				if ((this.hoverCell) && (this.hoverCell[0] != this.dragItem[0])) {
					var placeholder = $('<div></div>')
						.insertAfter(this.dragItem);

					this.dragItem.insertBefore(this.hoverCell);
					this.hoverCell.insertBefore(placeholder);
					placeholder.remove();

					var msgs = [{
						id: this.dragItem.data('item').id,
						pos: this.dragItem.index()
					}];

					this.items.find(function (i) {
						return (i.id == this.dragItem.data('item').id)
					}, this).pos = this.dragItem.index();

					var hoverCellItem = this.hoverCell.data('item');
					if (hoverCellItem) {
						if ((hoverCellItem.name != this.dragItem.data('item').name) || (!hoverCellItem.quantity)) {
							msgs.push({
								id: hoverCellItem.id,
								pos: this.hoverCell.index()
							});

							this.items.find(function (i) {
								return (i.id == hoverCellItem.id)
							}, this).pos = this.hoverCell.index();
						} else {
							method = 'combineStacks';
							msgs = {
								fromId: this.dragItem.data('item').id,
								toId: hoverCellItem.id,
							};
						}
					}

					client.request({
						cpn: 'player',
						method: 'performAction',
						data: {
							cpn: 'inventory',
							method: method,
							data: msgs
						}
					});

					this.build();
				}

				this.dragItem = null;
				this.dragEl.remove();
				this.dragEl = null;
				this.hoverCell = null;
				this.find('.hover').removeClass('hover');
			}
		},

		onMouseMove: function (e) {
			if (!this.dragEl)
				return;

			var offset = this.find('.grid').offset();

			this.dragEl.css({
				left: e.clientX - offset.left - 40,
				top: e.clientY - offset.top - 40,
				display: 'block'
			});
		},

		showContext: function (item, e) {
			var menuItems = {
				drop: {
					text: 'drop',
					callback: this.performItemAction.bind(this, item, 'dropItem')
				},
				destroy: {
					text: 'destroy',
					callback: this.performItemAction.bind(this, item, 'destroyItem')
				},
				salvage: {
					text: 'salvage',
					callback: this.performItemAction.bind(this, item, 'salvageItem')
				},
				stash: {
					text: 'stash',
					callback: this.performItemAction.bind(this, item, 'stashItem')
				},
				learn: {
					text: 'learn',
					callback: this.performItemAction.bind(this, item, 'learnAbility')
				},
				activate: {
					text: 'activate',
					callback: this.performItemAction.bind(this, item, 'activateMtx')
				},
				use: {
					text: 'use',
					callback: this.performItemAction.bind(this, item, 'useItem')
				},
				equip: {
					text: 'equip',
					callback: this.performItemAction.bind(this, item, 'equip')
				},
				augment: {
					text: 'craft',
					callback: this.openAugmentUi.bind(this, item)
				},
				mail: {
					text: 'mail',
					callback: this.openMailUi.bind(this, item)
				},
				split: {
					text: 'split stack',
					callback: this.splitStackStart.bind(this, item)
				},
				divider: '----------'
			};

			if (item.eq) {
				menuItems.learn.text = 'unlearn';
				menuItems.equip.text = 'unequip';
			}

			if (item.active)
				menuItems.activate.text = 'deactivate';

			var config = [];

			if (item.ability)
				config.push(menuItems.learn);
			else if (item.type == 'mtx')
				config.push(menuItems.activate);
			else if ((item.type == 'toy') || (item.type == 'consumable'))
				config.push(menuItems.use);
			else if (item.slot) {
				config.push(menuItems.equip);
				if (!item.eq)
					config.push(menuItems.divider);

				if (!item.eq) {
					config.push(menuItems.augment);
					config.push(menuItems.divider);
				}
			}

			if ((!item.eq) && (!item.active)) {
				if (!item.quest) {
					if ((window.player.stash.active) && (!item.noStash))
						config.push(menuItems.stash);

					if (!item.noDrop)
						config.push(menuItems.drop);

					if ((!item.material) && (!item.noSalvage))
						config.push(menuItems.salvage);
				}

				if (!item.noDestroy)
					config.push(menuItems.destroy);
			}

			if (item.quantity > 1)
				config.push(menuItems.split);

			if ((!item.noDrop) && (!item.quest))
				config.push(menuItems.mail);

			if (config.length > 0)
				events.emit('onContextMenu', config, e);

			e.preventDefault;
			return false;
		},

		splitStackStart: function (item) {
			var box = this.find('.split-box').show();
			box.data('item', item);

			box.find('.amount').html(1);
		},

		splitStackEnd: function (cancel, e) {
			var box = this.find('.split-box');

			if ((!e) || (e.target != box.find('.button')[0]))
				return;

			box.hide();

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'inventory',
					method: 'splitStack',
					data: {
						itemId: box.data('item').id,
						stackSize: ~~this.find('.split-box .amount').html()
					}
				}
			});
		},

		onChangeStackAmount: function (e) {
			var item = this.find('.split-box').data('item');
			var delta = (e.originalEvent.deltaY > 0) ? -1 : 1;
			if (this.shiftDown)
				delta *= 10;
			var amount = this.find('.split-box .amount');

			amount.html(Math.max(1, Math.min(item.quantity - 1, ~~amount.html() + delta)));
		},

		hideTooltip: function () {
			if (this.dragEl) {
				this.hoverCell = null;
				return;
			}

			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},
		onHover: function (el, item, e) {
			if (this.dragEl) {
				this.hoverCell = el;
				this.find('.hover').removeClass('hover');
				el.addClass('hover');
				return;
			}

			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			if (!item)
				return;

			var ttPos = null;

			if (el) {
				if (el.hasClass('new')) {
					el.removeClass('new');
					el.find('.quantity').html((item.quantity > 1) ? item.quantity : '');
					delete item.isNew;
				}

				var elOffset = el.offset();
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			var compare = null;
			if (item.slot) {
				compare = this.items.find(function (i) {
					return ((i.eq) && (i.slot == item.slot));
				});
			}

			events.emit('onShowItemTooltip', item, ttPos, compare, false, this.shiftDown);
		},

		onGetItems: function (items, rerender) {
			this.items = items;

			if ((this.shown) && (rerender))
				this.build();
		},
		onDestroyItems: function (itemIds) {
			itemIds.forEach(function (id) {
				var item = this.items.find(i => i.id == id);
				if (item == this.hoverItem)
					this.hideTooltip();

				this.items.spliceWhere(i => i.id == id);
			}, this);

			if (this.shown)
				this.build();
		},

		toggle: function (show) {
			this.shown = !this.el.is(':visible');

			if (this.shown) {
				this.find('.split-box').hide();
				this.show();
				this.build();
			} else {
				this.hide();
				events.emit('onHideInventory');
				events.emit('onHideContextMenu');
			}

			this.hideTooltip();
		},

		beforeDestroy: function () {
			this.el.parent().css('background-color', 'transparent');
			this.el.parent().removeClass('blocking');
		},

		beforeHide: function () {
			if (this.oldSpellsZIndex) {
				$('.uiSpells').css('z-index', this.oldSpellsZIndex);
				this.oldSpellsZIndex = null;
			}
		},

		performItemAction: function (item, action) {
			var stats = window.player.stats.values;
			var playerLevel = stats.originalLevel || stats.level;

			if (!item)
				return;
			else if ((action == 'equip') && ((item.material) || (item.quest) || (item.type == 'mtx') || (item.level > playerLevel)))
				return;
			else if ((action == 'activateMtx') && (item.type != 'mtx'))
				return;
			if ((item.factions) && (action == 'equip')) {
				if (item.factions.some(function (f) {
						return f.noEquip;
					}))
					return;
			}

			var cpn = 'inventory';
			if (action == 'equip')
				cpn = 'equipment';

			if (action == 'useItem')
				this.hide();

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: cpn,
					method: action,
					data: item.id
				}
			});
		},

		openAugmentUi: function (item) {
			events.emit('onSetSmithItem', {
				item: item
			});
		},

		openMailUi: function (item) {
			events.emit('onSetMailItem', {
				item: item
			});
		},

		onKeyDown: function (key) {
			if (key == 'i')
				this.toggle();
			else if (key == 'shift') {
				this.shiftDown = true;
				if (this.hoverItem)
					this.onHover();
			} else if (key == 'ctrl')
				this.ctrlDown = true;
		},
		onKeyUp: function (key) {
			if (key == 'shift') {
				this.shiftDown = false;
				if (this.hoverItem)
					this.onHover();
			} else if (key == 'ctrl')
				this.ctrlDown = false;
		}
	};
});

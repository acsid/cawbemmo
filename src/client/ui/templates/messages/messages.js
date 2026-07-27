import events from "/js/system/events.js";
import client from "/js/system/client.js";
import config from "/js/config.js";
import input from "/js/input.js";
import messagesMobile from "/ui/templates/messages/mobile.js";
import channelPicker from "/ui/templates/messages/channelPicker.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/messages/template.html", { raw: true });
const tplTab = await _.loadHTML("/ui/templates/messages/tplTab.html", { raw: true });

const eventMap = {
	onGetMessages: "onGetMessages"
	, onDoWhisper: "onDoWhisper"
	, onJoinChannel: "onJoinChannel"
	, onLeaveChannel: "onLeaveChannel"
	, onClickFilter: "onClickFilter"
	, onGetCustomChatChannels: "onGetCustomChatChannels"
	, onKeyDown: "keydown"
	, onKeyUp: "keyup"
};

export default {
	tpl: template

	, maxChatLength: 255

	, hoverItem: null

	, hoverFilter: false

	, currentChannel: "global"
	, currentSubChannel: null

	, privateChannels: []
	, lastPrivateChannel: null
	, customChannels: []
	, lastCustomChannel: null

	, postRender: function () {
		for (const [prop, key] of Object.entries(eventMap)) {
			this.onEvent(key, this[prop].bind(this));
		}

		this.find(".filter:not(.channel)").on("click", this.onClickFilter.bind(this));

		channelPicker.init.call(this);

		if (isMobile) {
			messagesMobile.init.call(this);
		} else {
			this.find("input")
				.on("keydown", this.sendChat.bind(this))
				.on("input", this.enforceMaxMsgLength.bind(this))
				.on("blur", this.toggle.bind(this, false, true));
		}
	}

	, update: function () {
		if (isMobile) {
			return;
		}
		if (this.el.hasClass("typing")) {
			return;
		}
		const time = new Date();
		const hours = time.getHours().toString().padStart(2, 0);
		const minutes = time.getMinutes().toString().padStart(2, 0);

		const elTime = this.find(".time");
		const timeString = `[ ${hours}:${minutes} ]`;
		if (elTime.html() !== timeString) {
			elTime.html(timeString);
		}
	}

	, enforceMaxMsgLength: function () {
		const textbox = this.find("input");
		let val = textbox.val();
		if (val.length <= this.maxChatLength) {
			return;
		}
		val = val.substr(0, this.maxChatLength);
		textbox.val(val);
	}

	, onGetCustomChatChannels: function (channels) {
		channels.forEach((c) => this.onJoinChannel(c));
	}

	, onJoinChannel: function (channel) {
		const container = this.find(".filters");
		const channelName = channel.trim();

		this.customChannels.spliceWhere((c) => c === channel);
		this.find(`[filter="${channelName}"]`).remove();

		this.customChannels.push(channel);

		$(tplTab)
			.appendTo(container)
			.addClass("channel")
			.attr("filter", channelName)
			.html(channelName)
			.on("mouseover", this.onFilterHover.bind(this, true))
			.on("mouseleave", this.onFilterHover.bind(this, false))
			.on("click", this.onClickFilter.bind(this));
	}

	, onLeaveChannel: function (channel) {
		this.customChannels.spliceWhere((c) => c === channel);
		this.find(`.filters div[filter="${channel}"]`).remove();
	}

	, onFilterHover: function (hover) {
		this.hoverFilter = hover;
	}

	, onClickFilter: function (e) {
		const el = $(e.target);
		el.toggleClass("active");
		const filter = el.attr("filter");
		const method = (el.hasClass("active") ? "show" : "hide");
		if (method === "show") {
			this.find(".list").addClass(filter);
		} else {
			this.find(".list").removeClass(filter);
		}
		if (el.hasClass("channel")) {
			this.find(".list ." + filter)[method]();
		}
	}

	, onKeyDown: function (e) {
		switch (e.key) {
			case "enter":
				this.toggle(true);
				break;
			case "shift":
				this.showItemTooltip();
				break;
			case "esc":
				if (this.el.hasClass("typing")) {
					this.toggle(false);
				}
				break;
		}
	}

	, onKeyUp: function (e) {
		if (e.key === "shift") {
			this.showItemTooltip();
		}
	}

	, onDoWhisper: function (charName) {
		this.toggle(true);

		this.currentChannel = "direct";
		this.currentSubChannel = charName;

		this.find(".channelPicker").html(charName);

		const elInput = this.find("input")
			.val("message")
			.focus();

		elInput[0].setSelectionRange(0, 7);
	}

	//Remember private and custom channels used
	, trackHistory: function (msg) {
		const { subType, source, target, channel } = msg;

		if (subType === "privateIn" || subType === "privateOut") {
			const list = this.privateChannels;
			list.spliceWhere((l) => l === source || l === target);

			//Newest sources are always at the end
			list.push(source || target);

			if (list.length > 5) {
				list.splice(0, list.length - 5);
			}

			if (subType === "privateOut" && config.rememberChatChannel) {
				this.lastPrivateChannel = target;
			}
		} else if (subType === "custom" && config.rememberChatChannel) {
			this.lastCustomChannel = channel;
		}
	}

	, onGetMessages: function (e) {
		if (!window.player) {
			return;
		}

		let messages = e.messages;
		if (!messages.length) {
			messages = [messages];
		}

		let container = this.find(".list");

		const [ { scrollHeight, clientHeight, scrollTop } ] = container;
		const isAtMaxScroll = scrollTop >= (scrollHeight - clientHeight);

		messages.forEach((m) => {
			this.trackHistory(m);

			let message = m.message;

			if (m.source) {
				if (window.player.social.isPlayerBlocked(m.source)) {
					return;
				}
			}

			if (m.item) {
				const [source, useMessage] = message.split(": {");
				message = `${source}: <span class="q${m.item.quality || 0}">&nbsp;{${useMessage}</span>`;
			}

			let el = $(`<div class="list-message ${m.class}">${message}</div>`)
				.appendTo(container);

			if (m.has("type")) {
				el.addClass(m.type);
			} else {
				el.addClass("info");
			}

			if (m.has("channel")) {
				el.addClass(m.channel);
			}

			if (m.item) {
				let clickHander = () => {};
				let moveHandler = this.showItemTooltip.bind(this, el, m.item);
				if (isMobile) {
					[clickHander, moveHandler] = [moveHandler, clickHander];
				}

				el.find("span")
					.on("mousemove", moveHandler)
					.on("mousedown", clickHander)
					.on("mouseleave", this.hideItemTooltip.bind(this));
			}

			if (m.type) {
				const isChannel = m?.subType === "custom";
				if (isChannel) {
					if (this.find(`.filter[filter="${m.channel}"]`).hasClass("active")) {
						el.css({ display: "flex" });
					} else {
						el.css({ display: "none" });
					}
				}

				if (isMobile && ["loot", "info"].indexOf(m.type) !== -1) {
					events.emit("onGetAnnouncement", {
						msg: m.message
					});
				}
			}
		});

		if (!this.el.hasClass("typing") || isAtMaxScroll) {
			container.scrollTop(9999999);
		}
	}

	, hideItemTooltip: function () {
		if (this.dragEl) {
			this.hoverCell = null;
			return;
		}
		events.emit("onHideItemTooltip", this.hoverItem);
		this.hoverItem = null;
	}

	, showItemTooltip: function (el, item, e) {
		if (item) {
			this.hoverItem = item;
		} else {
			item = this.hoverItem;
		}
		if (!item) {
			return;
		}
		let ttPos = null;
		if (el) {
			ttPos = {
				x: Math.floor(e.clientX + 32)
				, y: Math.floor(e.clientY)
			};
		}
		const bottomAlign = !isMobile;
		events.emit("onShowItemTooltip", item, ttPos, true, bottomAlign);
	}

	, toggle: function (show, isFake, e) {
		if (isFake && this.hoverFilter) {
			return;
		}
		input.resetKeys();

		this.el.removeClass("typing");
		this.el.find(".main").removeClass("hasBorderShadow");

		const textbox = this.find("input");
		if (show) {
			this.el.addClass("typing");
			this.el.find(".main").addClass("hasBorderShadow");

			if (!config.rememberChatChannel) {
				this.currentChannel = "global";
				this.currentSubChannel = null;
			}
			this.find(".channelPicker").html(this.currentSubChannel || this.currentChannel);
			textbox.focus();
			this.find(".list").scrollTop(9999999);
		} else {
			this.find(".channelOptions").removeClass("active");
			textbox.val("");
			this.el.removeClass("picking");

			if (["direct", "custom"].includes(this.currentChannel)
				&& (!this.currentSubChannel || ["join new", "leave"].includes(this.currentSubChannel))
			) {
				this.currentSubChannel = null;
				this.currentChannel = "global";
			}
		}
		if (e) {
			e.stopPropagation();
		}
	}

	, sendChat: function (e) {
		const textbox = this.find("input");
		const msgConfig = {
			success: true
			, message: textbox.val()
			, event: e
			, cancel: false
		};
		this.processChat(msgConfig);
		if (msgConfig.cancel || this.el.hasClass("picking")) {
			return false;
		}
		const { which: charCode } = e;

		if ([9, 27].includes(charCode) || charCode !== 13) {
			if (charCode === 9) {
				e.preventDefault();
				textbox.val(`${textbox.val()}    `);
			} else if (charCode === 27) {
				this.toggle(false);
			}
			return;
		}
		events.emit("onBeforeChat", msgConfig);

		let val = msgConfig.message
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;");

		if (!msgConfig.success) {
			this.toggle(false);
			return;
		}
		if (val.trim() === "") {
			this.toggle(false);
			return;
		}
		client.request({
			cpn: "social"
			, method: "chat"
			, data: {
				message: val
				, type: this.currentChannel
				, subType: this.currentSubChannel
			}
		});
		this.toggle();
	}
};

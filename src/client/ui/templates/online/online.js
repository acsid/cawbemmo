import client from "/js/system/client.js";
import events from "/js/system/events.js";
import globals from "/js/system/globals.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/online/template.html", { raw: true });
const templateListItem = await _.loadHTML("/ui/templates/online/templateListItem.html", { raw: true });

export default {
	tpl: template
	, centered: true
	, modal: true
	, hasClose: true

	, actions: []

	, postRender: function () {
		globals.onlineList = null;

		this.onEvent("playerObjAdded", this.playerObjAddedOrChanged.bind(this));
		this.onEvent("playerObjChanged", this.playerObjAddedOrChanged.bind(this));
		this.onEvent("playerObjRemoved", this.playerObjRemoved.bind(this));

		this.onEvent("onGetSocialActions", this.onGetSocialActions.bind(this));
		this.onEvent("onShowOnline", this.toggle.bind(this));
		this.onEvent("keydown", this.onKeyDown.bind(this));

		_.log.online.debug("Requesting PlayerList");
		client.request({
			cpn: "social"
			, method: "getPlayerList"
			, callback: this.onGetList.bind(this)
		});
	}

	, onGetList: function (list) {
		globals.onlineList = list;
		_.log.online.debug("PlayerList updated", list);
		events.emit("globalObjectListUpdated", { onlineList: list });
	}

	, onGetSocialActions: function (actions) {
		this.actions = actions;
	}

	, onKeyDown: function (e) {
		if (e.key === "o") {
			this.toggle();
		}
	}

	, onAfterShow: function () {
		const container = this.el.find(".list");
		// Empty old list.
		container
			.children(":not(.heading)")
			.remove();

		// Update title.
		const headingText = this.el.find(".heading-text");
		const onlineList = globals.onlineList;
		const playerCount = onlineList?.length || 0;
		if (playerCount > 0) {
			headingText.html(`online players (${playerCount})`);
		} else {
			headingText.html("online players list missing");
			return;
		}
		onlineList.sort((a, b) => {
			if (a.level === b.level) {
				if (a.name > b.name) {
					return 1;
				}
				return -1;
			} return b.level - a.level;
		});

		onlineList.forEach(function (l) {
			const html = templateListItem
				.replace("$NAME$", l.name)
				.replace("$LEVEL$", l.level)
				.replace("$CLASS$", l.class)
				.replace("$ZONE$", l.zoneName);

			const el = $(html)
				.appendTo(container)
				.on("contextmenu", this.showContext.bind(this, l));

			if (isMobile) {
				el.on("mousedown", this.showContext.bind(this, l));
			}
		}, this);
	}

	, playerObjAddedOrChanged: function ({ obj }) {
		const onlineList = globals.onlineList;
		if (!onlineList) {
			return;
		}
		_.log.online.debug("Player changed", obj);
		onlineList.spliceWhere((o) => o.id === obj.id);
		onlineList.push(obj);
		events.emit("globalObjectListUpdated", { onlineList });
		if (this.shown) {
			this.onAfterShow();
		}
	}

	, playerObjRemoved: function ({ id }) {
		const onlineList = globals.onlineList;
		if (!onlineList) {
			return;
		}
		onlineList.spliceWhere((o) => o.id === id);
		if (this.shown) {
			this.onAfterShow();
		}
	}

	, showContext: function (char, e) {
		e.preventDefault();
		if (char.name === window.player.name) {
			return false;
		}
		const isBlocked = window.player.social.isPlayerBlocked(char.name);
		const actions = [
			{ text: "Invité dans le groupe"
				, callback: this.invite.bind(this, char.id)
			}
			, { text: "chuchotté"
				, callback: events.emit.bind(events, "onDoWhisper", char.name)
			}
			, { text: isBlocked ? "débloqué" : "bloqué"
				, callback: this.block.bind(this, char.name)
			}
			, ...this.actions.map(
				({ command, text }) => ({ text
					, callback: this.performAction.bind(this, command, char.name)
				})
			)
		];
		events.emit("onBeforeOnlineListContext", char.id, actions);
		events.emit("onContextMenu", actions, e);
		return false;
	}

	, performAction: function (command, charName) {
		client.request({
			cpn: "social"
			, method: "chat"
			, data: {
				message: `/${command} ${charName}`
			}
		});
	}

	, block: function (charName) {
		const isBlocked = window.player.social.isPlayerBlocked(charName);
		let method = isBlocked ? "unblock" : "block";

		this.performAction(method, charName);
	}

	, invite: function (charId) {
		this.hide();

		client.request({
			cpn: "social"
			, method: "getInvite"
			, data: {
				targetId: charId
			}
		});
	}
};

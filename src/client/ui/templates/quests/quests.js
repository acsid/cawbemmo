import events from "/js/system/events.js";
import client from "/js/system/client.js";
import locale from "/js/locale/index.js";
import config from "/js/config.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/quests/template.html", { raw: true });
const templateQuest = await _.loadHTML("/ui/templates/quests/templateQuest.html", { raw: true });

export default {
	container: ".right"
	, quests: []

	, beforeRender: function () {
		this.tpl = locale.getLocalizedMessage(locale.dictionary, template);
	}
	, postRender: function () {
		if (isMobile) {
			this.el.on("click", this.toggleButtons.bind(this));
			this.find(".btnCollapse").on("click", this.toggleButtons.bind(this));
		}

		this.onEvent("clearUis", this.clear.bind(this));

		this.onEvent("onObtainQuest", this.onObtainQuest.bind(this));
		this.onEvent("onUpdateQuest", this.onUpdateQuest.bind(this));
		this.onEvent("onCompleteQuest", this.onCompleteQuest.bind(this));
		this.onEvent("onToggleQuestsVisibility", this.onToggleQuestsVisibility.bind(this));

		this.onToggleQuestsVisibility(config.showQuests);
	}

	, clear: function () {
		this.quests = [];
		this.el.find(".list").empty();
		this.updateVisibility();
	}

	, onObtainQuest: function (quest) {
		const rewards = [];
		if (quest.xp) {
			rewards.push(quest.xp + " xp");
		}
		const localeDictionary = {
			zone: quest.zoneName
			, name: quest.name
			, description: quest.description
		};
		if (rewards.length > 0) {
			localeDictionary.reward = `${locale.translate("quests", "reward")}: ${rewards.join(", ")}`;
		} else {
			localeDictionary.reward = locale.translate("quests", "noReward");
		}

		const list = this.el.find(".list");
		let html = locale.getLocalizedMessage(Object.assign(localeDictionary, locale.dictionary), templateQuest);
		let el = $(html)
			.appendTo(list);

		if (quest.isReady) {
			el.addClass("ready");
		}
		if (quest.active) {
			el.addClass("active");
		} else if (!quest.isReady) {
			el.addClass("disabled");
		}
		el.on("click", this.onClick.bind(this, el, quest));

		this.quests.push({
			id: quest.id
			, el: el
			, quest: quest
		});

		const questsElements = list.find(".quest");
		for (const qElm of questsElements.toArray()) {
			const childEl = $(qElm);
			if (childEl.hasClass("active")) {
				childEl.prependTo(list);
			}
		}

		this.updateVisibility();
	}

	, onClick: function (el, quest) {
		if (!el.hasClass("ready")) {
			return;
		}
		client.request({
			cpn: "player"
			, method: "performAction"
			, data: {
				cpn: "quests"
				, method: "complete"
				, data: {
					questId: quest.id
				}
			}
		});
	}

	, onUpdateQuest: function (quest) {
		const q = this.quests.find((f) => f.id === quest.id);
		q.quest.isReady = quest.isReady;

		q.el.find(".description").html(quest.description);

		q.el.removeClass("ready");
		if (quest.isReady) {
			q.el.removeClass("disabled");
			q.el.addClass("ready");

			if (isMobile) {
				events.emit("onGetAnnouncement", {
					msg: "Quest ready for turn-in"
				});
			}
			events.emit("onQuestReady", quest);
		}

		this.updateVisibility();
	}

	, onCompleteQuest: function (id) {
		let q = this.quests.find((f) => f.id === id);

		if (!q) {
			return;
		}

		q.el.remove();
		this.quests.spliceWhere((f) => f.id === id);

		this.updateVisibility();
	}

	, toggleButtons: function (e) {
		this.el.toggleClass("active");
		e.stopPropagation();
	}

	// Manage the panel state from the current quest list:
	// - No quests: hide the panel.
	// - All quests disabled: dim the list as a whole (all-disabled class).
	// - At least one active or ready quest: show the panel at full brightness.
	// Does not override the user's showQuests:"off" setting.
	, updateVisibility: function () {
		if (!this.quests.length) {
			if (config.showQuests !== "off") {
				this.hide();
			}
			return;
		}

		const hasActive = this.quests.some((q) => q.el.hasClass("active") || q.el.hasClass("ready"));
		if (hasActive) {
			this.el.removeClass("all-disabled");
		} else {
			this.el.addClass("all-disabled");
		}

		if (config.showQuests !== "off") {
			this.show();
		}
	}

	, onToggleQuestsVisibility: function (state) {
		const shouldHide = state === "off";

		if (shouldHide) {
			this.hide();
		} else {
			this.show();
		}

		this.el.removeClass("minimal");
		if (state === "minimal") {
			this.el.addClass("minimal");
		}
	}
};

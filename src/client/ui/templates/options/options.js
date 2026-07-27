import events from "/js/system/events.js";
//import client from "/js/system/client.js";
import renderer from "/js/rendering/renderer.js";
import uiFactory from "/ui/factory.js";
//import objects from "/js/objects/objects.js";
//import sound from "/js/sound/sound.js";
import config from "/js/config.js";
import locale from "/js/locale/index.js";

import styles from "./styles.css" with { type: "css" };
if (!document.adoptedStyleSheets.includes(styles)) {
	document.adoptedStyleSheets.push(styles);
}

const template = await _.loadHTML("/ui/templates/options/template.html", { raw: true });

const eventMap = {
	onResize: "onResize"
	, onUiKeyPress: "uikeypress"
	, onToggleNameplates: "onToggleNameplates"
	, onToggleQualityIndicators: "onToggleQualityIndicators"
	, onToggleUnusableIndicators: "onToggleUnusableIndicators"
	, onToggleEventsVisibility: "onToggleEventsVisibility"
	, onToggleQuestsVisibility: "onToggleQuestsVisibility"
	, onToggleLastChannel: "onToggleLastChannel"
	, onVolumeChange: "onVolumeChange"
	, onTogglePartyView: "onTogglePartyView"
	, onToggleDamageNumbers: "onToggleDamageNumbers"
};

export default {
	centered: true
	, modal: true
	, hasClose: true
	, isFlex: true

	, beforeRender: function () {
		this.tpl = locale.getLocalizedMessage(locale.dictionary, template);
	}
	, postRender: function () {
		this.find("#options-nameplates .name").on("click", this.toggleNameplates.bind(this));
		this.find("#options-quests .name").on("click", this.toggleQuests.bind(this));
		this.find("#options-events .name").on("click", this.toggleEvents.bind(this));
		this.find("#options-quality .name").on("click", this.toggleQualityIndicators.bind(this));
		this.find("#options-unusable .name").on("click", this.toggleUnusableIndicators.bind(this));
		this.find("#options-lastChannel .name").on("click", this.toggleLastChannel.bind(this));
		this.find("#options-partyView .name").on("click", this.togglePartyView.bind(this));
		this.find("#options-damageNumbers .name").on("click", this.toggleDamageNumbers.bind(this));

		this.find("#options-fullscreen .name")[0].addEventListener("click", this.toggleScreen.bind(this));

		this.find(".item.volume .btn").on("click", this.modifyVolume.bind(this));

		for (const [prop, key] of Object.entries(eventMap)) {
			this.onEvent(key, this[prop].bind(this));
		}

		this.find(".item").on("click", events.emit.bind(events, "onClickOptionsItem"));

		const tabsButtons = this.find(".tabs button");
		tabsButtons.on("click", this.openTab.bind(this));
		tabsButtons.first().trigger("click");
	}
	, onAfterShow: function () {
		this.onResize();
		this.build();
	}

	, afterHide: function () {
		this.onResize();
		uiFactory.getUi("mainMenu").show();
	}

	, onUiKeyPress: function (e) {
		if (e.key === "v") {
			this.toggleNameplates();
		}
	}

	, openTab: function (eventObj, tabName) {
		const tabcontents = document.getElementsByClassName("tabcontent");
		for (let i = tabcontents.length - 1; i >= 0; --i) {
			tabcontents[i].style.display = "none";
		}
		const tablinks = document.getElementsByClassName("tablinks");
		for (let i = tablinks.length - 1; i >= 0; --i) {
			tablinks[i].classList.remove("active");
		}
		if (!tabName) {
			tabName = eventObj.currentTarget.id.replaceAll("tabbtn", "tab");
		}
		const tabcontent = document.getElementById(tabName);
		tabcontent.style.display = "block";
		eventObj.currentTarget.classList.add("active");
	}

	, modifyVolume: function (e) {
		const el = e.target;
		const isIncrease = el.classList.contains("increase");
		const delta = isIncrease ? 10 : -10;
		const soundType = el.closest(".item.volume").id.split("-").pop();
		events.emit("onManipulateVolume", {
			soundType
			, delta
		});
	}
	, onVolumeChange: function ({ soundType, volume }) {
		const item = this.find(`#options-volume-${soundType}`);

		item.find(".value").html(volume);
		item.find(".tick").css({
			left: `${volume}%`
		});

		const btnDecrease = item.find(".btn.decrease").removeClass("disabled");
		const btnIncrease = item.find(".btn.increase").removeClass("disabled");

		if (volume === 0) {
			btnDecrease.addClass("disabled");
		} else if (volume === 100) {
			btnIncrease.addClass("disabled");
		}
		config.set(`${soundType}Volume`, volume);
	}

	, toggleUnusableIndicators: function () {
		config.toggle("unusableIndicators");

		if (config.unusableIndicators === "background" && config.qualityIndicators === "background") {
			config.toggle("qualityIndicators");
			events.emit("onToggleQualityIndicators", config.qualityIndicators);
		}

		events.emit("onToggleUnusableIndicators", config.unusableIndicators);
	}
	, onToggleUnusableIndicators: function (state) {
		this.find("#options-unusable .value").html(state.capitalize());
	}

	, toggleQualityIndicators: function () {
		config.toggle("qualityIndicators");

		if (config.qualityIndicators === "background" && config.unusableIndicators === "background") {
			config.toggle("unusableIndicators");
			events.emit("onToggleUnusableIndicators", config.unusableIndicators);
		}
		events.emit("onToggleQualityIndicators", config.qualityIndicators);
	}
	, onToggleQualityIndicators: function (state) {
		this.find("#options-quality .value").html(state.capitalize());
	}

	, toggleScreen: async function () {
		const state = await renderer.toggleScreen();
		const newValue = locale.translate("options", state === "Windowed" ? "disabled" : "enabled");
		this.find("#options-fullscreen .value").html(newValue);
	}
	, onResize: function () {
		const isFullscreen = (window.innerHeight === screen.height);
		const newValue = locale.translate("options", isFullscreen ? "enabled" : "disabled");
		this.find("#options-screen .value").html(newValue);
	}

	, toggleEvents: function () {
		config.toggle("showEvents");
		events.emit("onToggleEventsVisibility", config.showEvents);
	}
	, onToggleEventsVisibility: function (state) {
		const newValue = locale.translate("options", state ? "enabled" : "disabled");
		this.find("#options-events .value").html(newValue);
	}

	, toggleQuests: function () {
		config.toggle("showQuests");
		events.emit("onToggleQuestsVisibility", config.showQuests);
	}
	, onToggleQuestsVisibility: function (state) {
		this.find("#options-quests .value").html(state.capitalize());
	}

	, toggleNameplates: function () {
		config.toggle("showNames");
		events.emit("onToggleNameplates", config.showNames);
	}
	, onToggleNameplates: function (state) {
		const newValue = locale.translate("options", state ? "enabled" : "disabled");
		this.find("#options-nameplates .value").html(newValue);
	}

	, toggleAudio: function () {
		config.toggle("playAudio");
		events.emit("onToggleAudio", config.playAudio);
	}
	, onToggleAudio: function (isAudioOn) {
		const newValue = locale.translate("options", isAudioOn ? "enabled" : "disabled");
		this.find("#options-audio .value").html(newValue);
	}

	, toggleLastChannel: function () {
		config.toggle("rememberChatChannel");
		events.emit("onToggleLastChannel", config.rememberChatChannel);
	}
	, onToggleLastChannel: function (state) {
		const newValue = locale.translate("options", state ? "enabled" : "disabled");
		this.find("#options-lastChannel .value").html(newValue);
	}

	, togglePartyView: function () {
		config.toggle("partyView");
		events.emit("onTogglePartyView", config.partyView);
	}
	, onTogglePartyView: function (state) {
		this.find("#options-partyView .value").html(state.capitalize());
	}

	, toggleDamageNumbers: function () {
		config.toggle("damageNumbers");
		events.emit("onToggleDamageNumbers", config.damageNumbers);
	}
	, onToggleDamageNumbers: function (state) {
		this.find("#options-damageNumbers .value").html(state.capitalize());
	}

	, build: function () {
		this.onToggleNameplates(config.showNames);
		this.onToggleAudio(config.playAudio);
		this.onToggleEventsVisibility(config.showEvents);
		this.onToggleQuestsVisibility(config.showQuests);
		this.onToggleQualityIndicators(config.qualityIndicators);
		this.onToggleUnusableIndicators(config.unusableIndicators);
		this.onToggleLastChannel(config.rememberChatChannel);
		this.onTogglePartyView(config.partyView);
		this.onToggleDamageNumbers(config.damageNumbers);

		this.onVolumeChange({
			soundType: "sound"
			, volume: config.soundVolume
		});
		this.onVolumeChange({
			soundType: "music"
			, volume: config.musicVolume
		});
	}
};

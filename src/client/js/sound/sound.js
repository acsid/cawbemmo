import "/js/dependencies/howler.core.min.js";
import config from "/js/config.js";
import events from "/js/system/events.js";
import globals from "/js/system/globals.js";
import physics from "/js/misc/physics.js";

const MASTER_VOLUME = 0.3;
const MIN_DISTANCE = 10;

const distanceFalloff = (d) => _.clamp(1 - (d * d) / (MIN_DISTANCE * MIN_DISTANCE), 0, 1);

let soundVolume = config.soundVolume;
let musicVolume = config.musicVolume;

const globalScopes = ["ui"];

window.Howler.volume(MASTER_VOLUME);

export default {
	sounds: []
	, muted: false

	, init: function () {
		events.on("onToggleAudio", this.onToggleAudio.bind(this));
		events.on("onPlaySound", this.play.bind(this));
		events.on("onPlaySoundAtPosition", this.onPlaySoundAtPosition.bind(this));
		events.on("onManipulateVolume", this.onManipulateVolume.bind(this));

		const { clientConfig: { sounds: loadSounds } } = globals;
		let loadCount = 0;
		let totalToLoad = 0;
		for (const [ scope, soundList ] of Object.entries(loadSounds)) {
			for (const soundInfo of soundList) {
				const promiseSrc = new _.PromiseSource();
				const newSound = Object.assign({
					scope
					, autoLoad: { resolve: promiseSrc.resolve, reject: promiseSrc.reject }
				}, soundInfo);
				totalToLoad++;
				this.addSound(newSound);
				promiseSrc.promise.then(() => {
					loadCount++;
					events.emit("loaderProgress", {
						type: "sounds"
						, progress: loadCount / totalToLoad
					});
				});
			}
		}
		if (totalToLoad <= 0) { // No sounds to preload, emit loaderProgress completed event.
			events.emit("loaderProgress", {
				type: "sounds"
				, progress: 1
			});
		}
		this.onToggleAudio(config.playAudio);
	}

	//Fired when a character rezones
	// 'newScope' is the new zone name
	, unload: function (newScope) {
		const { sounds } = this;

		for (let i = 0; i < sounds.length; i++) {
			const { scope, sound } = sounds[i];

			if (!globalScopes.includes(scope) && scope !== newScope) {
				if (sound) {
					sound.unload();
				}
				sounds.splice(i, 1);
				i--;
			}
		}
	}

	, onPlaySoundAtPosition: function ({ position: { x, y }, file, volume }) {
		if (window.player?.x === undefined) {
			return;
		}
		const { player: { x: playerX, y: playerY } } = window;
		const dx = Math.abs(x - playerX);
		const dy = Math.abs(y - playerY);
		const distance = Math.max(dx, dy);
		if (distance >= MIN_DISTANCE) {
			return;
		}

		//eslint-disable-next-line no-undef, no-unused-vars
		const sound = new Howl({
			src: [file]
			, volume: (soundVolume / 100) * distanceFalloff(distance) * (volume ?? 1)
			, loop: false
			, autoplay: true
			, html5: false
		});
	}

	, play: function (entry, volume = 1) {
		if (typeof entry === "string") {
			entry = this.sounds.find((s) => s.name === entry);
		}
		if (!entry) {
			throw new Error("Sound entry not found!");
		}
		if (!entry.sound) {
			entry.sound = this.loadSound(entry.file, entry.loop, true, volume);
			return;
		}
		entry.sound.volume(volume);
		entry.sound.play();
	}

	, fade: function (entry, volume, fadeDuration = 0) {
		if (typeof entry === "string") {
			entry = this.sounds.find((s) => s.name === entry);
		}
		let updated = false;
		if (!entry.sound) {
			entry.sound = this.loadSound(entry.file, entry.loop, Boolean(volume > 0), 0.01);
			updated = true;
		}
		const curVol = entry.sound.volume();
		if (Math.abs(curVol - volume) > 0.001) {
			if (fadeDuration > 0) {
				entry.sound.fade(curVol, volume, fadeDuration);
			} else {
				entry.sound.volume(volume);
			}
			updated = true;
		}
		const isPlaying = entry.sound.playing();
		if (isPlaying && curVol <= 0) {
			entry.sound.stop();
			updated = true;
		}
		if (!isPlaying && volume > 0) {
			entry.sound.play();
			updated = true;
		}
		return updated;
	}

	, stop: function (entry) {
		if (typeof entry === "string") {
			entry = this.sounds.find((s) => s.name === entry);
		}
		if (!entry?.sound?.playing()) {
			return false;
		}
		entry.sound.stop();
		entry.sound.volume(0);
	}

	, updateSounds: function (x, y) {
		for (const s of this.sounds) {
			if (s.music || s.scope === "ui") {
				continue;
			}
			let distance = 0;
			if (!s.area) {
				let dx = Math.abs(s.x - x);
				let dy = Math.abs(s.y - y);
				distance = Math.max(dx, dy);
			} else if (!physics.isInPolygon(x, y, s.area)) {
				distance = physics.distanceToPolygon([x, y], s.area);
			}
			if (distance > MIN_DISTANCE) {
				this.stop(s);
				continue;
			}
			const volume = s.maxVolume * distanceFalloff(distance) * (soundVolume / 100);
			this.fade(s, volume);
		}
	}

	, updateMusic: function (playerX, playerY) {
		if (typeof this._musicPlaying !== "boolean") {
			this._musicPlaying = true;
		}
		let musicPlaying = false;
		for (const s of this.sounds) {
			if (s.music && s.area) {
				if (physics.isInPolygon(playerX, playerY, s.area)) { // Should be playing because we're in the area
					this.fade(s, musicVolume / 100);
					musicPlaying = true;
				} else if (s.sound?.playing()) { // Should stop playing because we're not in the area
					this.fade(s, 0);
					musicPlaying = true;
				}
			}
			if (s.defaultMusic) { // Stop or start defaultMusic, depending on whether anything else was playing last iteration.
				if (this._musicPlaying) {
					this.fade(s, 0);
				} else {
					this.fade(s, musicVolume / 100);
				}
			}
		}
		this._musicPlaying = musicPlaying;
	}

	, update: function (x, y) {
		this.updateSounds(x, y);
		this.updateMusic(x, y);
	}

	, addSound: function (
		{ name: soundName, scope, file, volume = 1, x, y, w, h, area, music, defaultMusic, loop, autoLoad }
	) {
		if (this.sounds.some((s) => s.file === file)) {
			_.log.sound.error("Sound file %s is already loaded!", file);
			return;
		}
		if (!area && w) {
			area = [
				[x, y]
				, [x + w, y]
				, [x + w, y + h]
				, [x, y + h]
			];
		}
		const entry = {
			name: soundName
			, scope
			, file
			, x, y, area
			, loop: Boolean(loop)
			, music: Boolean(music)
			, defaultMusic: Boolean(defaultMusic)

			, maxVolume: _.clamp(volume, 0, 1)
		};
		this.sounds.push(entry);

		if (typeof autoLoad === "object") {
			entry.sound = this.loadSound(file, loop, false, music ? 0 : volume, autoLoad);
		} else if (autoLoad) {
			entry.sound = this.loadSound(file, loop, false, music ? 0 : volume);
		}

		if (window.player?.x !== undefined) {
			this.update(window.player.x, window.player.y);
		}
		return entry;
	}

	, loadSound: function (file, loop = false, autoplay = false, volume = 1, onLoad = undefined) {
		//eslint-disable-next-line no-undef
		const sound = new Howl({
			src: [file]
			, volume
			, loop
			, autoplay
			, html5: loop
		});
		if (typeof onLoad === "function") {
			sound.once("load", onLoad);
		} else if (typeof onLoad === "object") {
			sound.once("load", onLoad.resolve);
			sound.once("loaderror", onLoad.reject);
		}
		return sound;
	}

	, onToggleAudio: function (isAudioOn) {
		this.muted = (isAudioOn === undefined ? !this.muted : !isAudioOn);
		//eslint-disable-next-line no-undef
		Howler.mute(this.muted);

		if (window.player?.x !== undefined) {
			this.update(window.player.x, window.player.y);
		}
	}

	, onManipulateVolume: function ({ soundType, delta }) {
		if (soundType === "sound") {
			soundVolume = Math.max(0, Math.min(100, soundVolume + delta));
		} else if (soundType === "music") {
			musicVolume = Math.max(0, Math.min(100, musicVolume + delta));
		}

		const volume = soundType === "sound" ? soundVolume : musicVolume;
		events.emit("onVolumeChange", {
			soundType
			, volume
		});

		if (window.player?.x !== undefined) {
			this.update(window.player.x, window.player.y);
		}
	}

	, destroySoundEntry: function (entry) {
		if (entry.sound) {
			if (entry.sound.playing()) {
				entry.sound.stop();
			}
			entry.sound.unload();
		}
		this.sounds.spliceWhere((s) => s === entry);
	}
};

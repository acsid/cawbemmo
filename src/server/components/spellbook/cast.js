/* eslint-disable-next-line max-lines-per-function */
const cast = (cpnSpellbook, action, isAuto) => {
	const { obj, physics, spells } = cpnSpellbook;

	//Stop casting
	if (!action.has("spell")) {
		const wasCasting = cpnSpellbook.isCasting();
		cpnSpellbook.stopCasting();

		//Consume a tick if we were casting
		return wasCasting;
	}

	const spell = spells.find((s) => (s.id === action.spell));
	if (!spell) {
		return false;
	}

	action.target = cpnSpellbook.getTarget(spell, action);
	action.auto = spell.auto;

	//If a target has become nonSelectable, we need to stop attacks that are queued/auto
	if (!action.target || action.target.nonSelectable) {
		return false;
	}

	let success = true;
	if (spell.cd > 0) {
		if (!isAuto) {
			cpnSpellbook.sendAnnouncement(
				language.translate(obj.language, "spellbook"
					, spell.auto ? "weaponCooldown" : "spellCooldown"
				)
			);
		}
		success = false;
	} else if (spell.manaCost > obj.stats.values.mana) {
		if (!isAuto) {
			cpnSpellbook.sendAnnouncement(language.translate(obj.language, "spellbook", "insufficientMana"));
		}
		success = false;
	} else if (spell.has("range")) {
		const distance = Math.max(Math.abs(action.target.x - obj.x), Math.abs(action.target.y - obj.y));
		let range = spell.range;
		if ((spell.useWeaponRange) && (obj.player)) {
			const weapon = obj.inventory.findItem(obj.equipment.eq.oneHanded) || obj.inventory.findItem(obj.equipment.eq.twoHanded);
			if (weapon) {
				range = weapon.range || 1;
			}
		}

		if (distance > range) {
			if (!isAuto) {
				cpnSpellbook.sendAnnouncement(language.translate(obj.language, "spellbook", "outOfRange"));
			}
			success = false;
		}
	}

	//LoS check
	//Null means we don't have LoS and as such, we should move
	if (spell.needLos && success) {
		if (!physics.hasLos(~~obj.x, ~~obj.y, ~~action.target.x, ~~action.target.y)) {
			if (!isAuto) {
				cpnSpellbook.sendAnnouncement(language.translate(obj.language, "spellbook", "noLineOfSight"));
			}
			action.auto = false;
			success = null;
		}
	}

	if (!success) {
		cpnSpellbook.queueAuto(action, spell);
		return success;
	} else if (!cpnSpellbook.queueAuto(action, spell)) {
		return false;
	}

	const eventBeforeCastSpell = {
		success: true
		, action
	};
	obj.fireEvent("beforeCastSpell", eventBeforeCastSpell);
	if (!eventBeforeCastSpell.success) {
		return false;
	}

	if (spell.manaReserve) {
		const reserve = spell.manaReserve;

		if (reserve.percentage) {
			const reserveEvent = {
				spell: spell.name
				, reservePercent: reserve.percentage
			};
			obj.fireEvent("onBeforeReserveMana", reserveEvent);

			if (!spell.active) {
				if (1 - obj.stats.values.manaReservePercent < reserve.percentage) {
					cpnSpellbook.sendAnnouncement(language.translate(obj.language, "spellbook", "insufficientMana"));
					return;
				} obj.stats.addStat("manaReservePercent", reserveEvent.reservePercent);
			} else {
				obj.stats.addStat("manaReservePercent", -reserveEvent.reservePercent);
			}
		}
	}

	if (spell.targetFurthest) {
		spell.target = obj.aggro.getFurthest();
	} else if (spell.targetRandom) {
		spell.target = obj.aggro.getRandom();
	}

	if (eventBeforeCastSpell.action.target?.effects) {
		const eventBeforeIsSpellTarget = {
			source: obj
			, spell
			, target: eventBeforeCastSpell.action.target
		};
		eventBeforeIsSpellTarget.target.fireEvent("beforeIsSpellTarget", eventBeforeIsSpellTarget);
		eventBeforeCastSpell.action.target = eventBeforeIsSpellTarget.target;
	}

	success = spell.castBase(eventBeforeCastSpell.action);
	cpnSpellbook.stopCasting(spell, true);

	if (success) {
		spell.consumeMana();
		spell.setCd();
	}

	obj.fireEvent("afterCastSpell", {
		castSuccess: success
		, spell
		, action: eventBeforeCastSpell.action
	});

	//Null means we didn't fail but are initiating casting
	return (success === null || success === true);
};

module.exports = cast;


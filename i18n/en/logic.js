/**
 * i18n/en/logic.js
 * Texts produced by the domain logic modules.
 *
 * Wording rule: the app organises and documents, it does not advise.
 * "keep at least 2h apart" describes a timing fact; it does not tell
 * anyone what to take. Emojis are part of the message and stay identical
 * across languages — they carry the urgency, not just decoration.
 */

export default {
  // Daily slots
  'logic.slot.fasted.label': 'Fasted',
  'logic.slot.fasted.time': '06:00–07:00',
  'logic.slot.morning.label': 'Morning',
  'logic.slot.morning.time': '07:00–09:00',
  'logic.slot.midday.label': 'Midday',
  'logic.slot.midday.time': '12:00–13:00',
  'logic.slot.pre_sport.label': 'Before exercise',
  'logic.slot.pre_sport.time': '60–90 min before training',
  'logic.slot.post_sport.label': 'After exercise',
  'logic.slot.post_sport.time': 'Right after training',
  'logic.slot.evening.label': 'Evening',
  'logic.slot.evening.time': '19:00–21:00',

  // Absorption block
  'logic.absorption.blocked':
    '🚫 Psyllium husk active – all supplements blocked for another {minutes} min.',

  // Conflict labels
  'logic.tag.blutverduenner': 'Anticoagulants (medication)',
  'logic.tag.ssri': 'SSRIs / antidepressants',
  'logic.tag.kaffee': 'Coffee',
  'logic.tag.tee': 'Tea (black/green)',
  'logic.tag.all': 'ALL supplements (absorption blocker)',

  'logic.conflict.critical':
    '🚨 CRITICAL: {a} + {b} → risk of serotonin syndrome. Never combine.',
  'logic.conflict.generic': '⚠️ {a} + {b}: keep them apart in time.',
  'logic.conflict.tagBased': '⚠️ {name} does not go together with: {tag}',
  'logic.synergy': '✅ Synergy: {a} + {b} work more strongly together.',

  'logic.conflict.pair.17-14':
    '⛔ Iron + magnesium citrate: magnesium blocks iron absorption. At least 2h apart.',
  'logic.conflict.pair.17-19':
    '⛔ Iron + calcium: calcium strongly inhibits iron. At least 2h apart!',
  'logic.conflict.pair.17-71':
    '⛔ Iron + magnesium bisglycinate: magnesium blocks iron absorption.',
  'logic.conflict.pair.17-75':
    '⛔ Iron + magnesium oxide: magnesium blocks iron absorption.',
  'logic.conflict.pair.32-33':
    '⚠️ L-arginine + L-lysine: they compete for the same amino acid transporters.',
  'logic.conflict.pair.36-37':
    '⚠️ L-tyrosine + L-tryptophan: they compete for transport across the blood-brain barrier. Separate times!',
  'logic.conflict.pair.10-16':
    '⚠️ Vitamin C (high) + selenium: high vitamin C doses reduce selenium bioavailability.',
  'logic.conflict.pair.2-4':
    '⛔ Nattokinase + ID 4: increased bleeding tendency possible.',
  'logic.conflict.pair.2-59':
    '⛔ Nattokinase + ID 59: increased bleeding tendency possible.',

  // Cure cycles
  'logic.cure.cycle': '{phase}, day {day} of {total}, {left} days left',
  'logic.cure.phase.on': 'Intake phase',
  'logic.cure.phase.off': 'Break',
  'logic.cure.stepped': 'Week {week}: {drops} drops',

  // Refill reminder (StockForecast)
  'logic.notifications.refillTitle': 'Refill',
  'logic.notifications.refill': '{name} lasts about {days} more days.',

  // Slot suggestion (SlotSuggestion.js): descriptive, not an instruction.
  'logic.slotSuggestion.fatSoluble':
    '{name} is fat-soluble and is absorbed better with a meal that contains some fat.',
};

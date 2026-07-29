/**
 * i18n/de/logic.js
 * Texte, die von den Fachlogik-Modulen erzeugt werden: Tages-Slots
 * (TimingEngine), Konflikte und Synergien (ConflictLogic), Kur-Zyklen
 * (CureManager), Aufnahmesperre (AbsorptionBlocker).
 *
 * Diese Module sind bewusst frei von React und nutzen tr() aus
 * i18n/runtime statt eines Hooks.
 *
 * Die Emojis gehoeren zum Text und bleiben in beiden Sprachen gleich —
 * sie tragen die Dringlichkeit mit, nicht nur Dekoration.
 */

export default {
  // ── Tages-Slots (TimingEngine) ──────────────────────────────
  'logic.slot.fasted.label': 'Nüchtern',
  'logic.slot.fasted.time': '06:00–07:00',
  'logic.slot.morning.label': 'Morgen',
  'logic.slot.morning.time': '07:00–09:00',
  'logic.slot.midday.label': 'Mittag',
  'logic.slot.midday.time': '12:00–13:00',
  'logic.slot.pre_sport.label': 'Vor Sport',
  'logic.slot.pre_sport.time': '60–90 min vor Training',
  'logic.slot.post_sport.label': 'Nach Sport',
  'logic.slot.post_sport.time': 'Direkt nach Training',
  'logic.slot.evening.label': 'Abend',
  'logic.slot.evening.time': '19:00–21:00',

  // ── Aufnahmesperre (AbsorptionBlocker) ──────────────────────
  'logic.absorption.blocked':
    '🚫 Flohsamenschalen aktiv – alle Supplements für noch {minutes} Min. gesperrt.',

  // ── Konflikt-Kennzeichnungen (ConflictLogic) ────────────────
  'logic.tag.blutverduenner': 'Blutverdünner (Medikament)',
  'logic.tag.ssri': 'SSRI / Antidepressiva',
  'logic.tag.kaffee': 'Kaffee',
  'logic.tag.tee': 'Tee (schwarz/grün)',
  'logic.tag.all': 'ALLE Supplements (Absorption-Blocker)',

  'logic.conflict.critical':
    '🚨 KRITISCH: {a} + {b} → Serotonin-Syndrom-Risiko! Niemals kombinieren.',
  'logic.conflict.generic': '⚠️ {a} + {b}: Bitte zeitlich trennen.',
  'logic.conflict.tagBased': '⚠️ {name} nicht kombinieren mit: {tag}',
  'logic.synergy': '✅ Synergie: {a} + {b} wirken zusammen stärker.',

  // Spezifische Paar-Meldungen. Die Schluessel tragen die Supplement-IDs
  // aus inventory.json, damit die Zuordnung eindeutig bleibt.
  'logic.conflict.pair.17-14':
    '⛔ Eisen + Magnesiumcitrat: Magnesium blockiert Eisen-Aufnahme. Min. 2h Abstand.',
  'logic.conflict.pair.17-19':
    '⛔ Eisen + Calcium: Calcium hemmt Eisen massiv. Min. 2h Abstand!',
  'logic.conflict.pair.17-71':
    '⛔ Eisen + Magnesiumbisglycinat: Magnesium blockiert Eisen-Aufnahme.',
  'logic.conflict.pair.17-75':
    '⛔ Eisen + Magnesiumoxid: Magnesium blockiert Eisen-Aufnahme.',
  'logic.conflict.pair.32-33':
    '⚠️ L-Arginin + L-Lysin: Konkurrieren um dieselben Aminosäure-Transporter.',
  'logic.conflict.pair.36-37':
    '⚠️ L-Tyrosin + L-Tryptophan: Konkurrieren um BBB-Transport. Getrennte Zeiten!',
  'logic.conflict.pair.10-16':
    '⚠️ Vitamin C (hoch) + Selen: Hohe Vitamin-C-Dosen reduzieren Selen-Bioverfügbarkeit.',
  'logic.conflict.pair.2-4':
    '⛔ Nattokinase + ID 4: Verstärkte Blutungsneigung möglich.',
  'logic.conflict.pair.2-59':
    '⛔ Nattokinase + ID 59: Verstärkte Blutungsneigung möglich.',

  // ── Kur-Zyklen (CureManager) ────────────────────────────────
  'logic.cure.cycle':
    '{emoji} {phase} – Tag {day}/{total} (noch {left} Tage)',
  'logic.cure.phase.on': 'ON',
  'logic.cure.phase.off': 'OFF',
  'logic.cure.stepped': '📈 Woche {week}: {drops} Tropfen',
};

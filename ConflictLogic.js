/**
 * ConflictLogic.js
 * ─────────────────────────────────────────────────────────────
 * Zentrales Regelwerk für Supplement-Konflikte & Synergien.
 * Versionierbar via Git – Logik NIEMALS in UI-Komponenten!
 *
 * Schweregrade:
 *   CRITICAL  → Serotonin-Syndrom-Risiko, niemals kombinieren
 *   HIGH      → Signifikante Absorption-Blockade
 *   MEDIUM    → Reduzierte Wirksamkeit
 *   INFO      → Timing-Hinweis
 */

import inventory from './inventory.json';

// ── Lookup-Map für O(1) Zugriff ──────────────────────────────
const supplementMap = new Map(inventory.map(s => [s.id, s]));

// ── Kritische Paare (beide Richtungen, hardcoded für Safety) ─
const CRITICAL_PAIRS = new Set([
  '69-37',  // Methylenblau ↔ L-Tryptophan
  '69-66',  // Methylenblau ↔ 5-HTP
  '37-69',
  '66-69',
]);

// ── Tag-basierte Konflikte (externe Substanzen) ──────────────
export const CONFLICT_TAG_LABELS = {
  Blutverdünner: 'Blutverdünner (Medikament)',
  SSRI:          'SSRI / Antidepressiva',
  Kaffee:        'Kaffee',
  Tee:           'Tee (schwarz/grün)',
  ALL:           'ALLE Supplements (Absorption-Blocker)',
};

// ─────────────────────────────────────────────────────────────
// checkConflicts(targetId, activeIds[])
//
// Gibt ein Array von Konflikt-Objekten zurück.
// activeIds = IDs der bereits im selben Slot geloggten Supplements.
// ─────────────────────────────────────────────────────────────
function canonicalId(supplementOrId) {
  return typeof supplementOrId === 'object'
    ? supplementOrId.libraryId ?? supplementOrId.id
    : supplementOrId;
}

export function checkConflicts(targetId, activeIds = []) {
  targetId = canonicalId(targetId);
  activeIds = activeIds.map(canonicalId).filter((id) => supplementMap.has(id));
  const target = supplementMap.get(targetId);
  if (!target) return [];

  const results = [];

  for (const activeId of activeIds) {
    if (activeId === targetId) continue;
    const active = supplementMap.get(activeId);
    if (!active) continue;

    const pairKey  = `${targetId}-${activeId}`;
    const isCrit   = CRITICAL_PAIRS.has(pairKey);

    // Direkter ID-Konflikt (target listet active als Konflikt ODER vice versa)
    const directConflict =
      target.conflictIds.includes(activeId) ||
      active.conflictIds.includes(targetId);

    if (directConflict || isCrit) {
      results.push({
        type:       'conflict',
        severity:   isCrit ? 'CRITICAL' : _severityByPair(targetId, activeId),
        sourceId:   targetId,
        targetId:   activeId,
        targetName: active.name,
        message:    _conflictMessage(targetId, activeId, isCrit),
      });
    }

    // Synergie prüfen
    if (target.synergyIds.includes(activeId) || active.synergyIds.includes(targetId)) {
      results.push({
        type:       'synergy',
        severity:   'INFO',
        sourceId:   targetId,
        targetId:   activeId,
        targetName: active.name,
        message:    `✅ Synergie: ${target.name} + ${active.name} wirken zusammen stärker.`,
      });
    }
  }

  // Tag-Konflikte des Targets ausgeben (zur Info-Anzeige im UI)
  for (const tag of target.conflictTags) {
    if (tag === 'ALL') continue; // wird separat via AbsorptionBlocker gehandhabt
    results.push({
      type:       'tag_conflict',
      severity:   tag === 'SSRI' ? 'CRITICAL' : 'HIGH',
      sourceId:   targetId,
      tag,
      targetName: CONFLICT_TAG_LABELS[tag] ?? tag,
      message:    `⚠️ ${target.name} nicht kombinieren mit: ${CONFLICT_TAG_LABELS[tag] ?? tag}`,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────
// checkAllConflictsForSlot(slotSupplementIds[])
//
// Prüft alle Supplements eines Slots gegeneinander.
// Gibt de-duplizierte Konflikt-Liste zurück.
// ─────────────────────────────────────────────────────────────
export function checkAllConflictsForSlot(ids = [], supplements = null) {
  const canonicalIds = Array.isArray(supplements)
    ? supplements.map(canonicalId).filter((id) => supplementMap.has(id))
    : ids.map(canonicalId).filter((id) => supplementMap.has(id));
  const seen  = new Set();
  const result = [];

  for (let i = 0; i < canonicalIds.length; i++) {
    const conflicts = checkConflicts(canonicalIds[i], canonicalIds.slice(i + 1));
    for (const c of conflicts) {
      const key = [c.sourceId, c.targetId, c.type].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(c);
      }
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// getSeverityColor(severity)  → Tailwind / NativeWind Klasse
// ─────────────────────────────────────────────────────────────
export function getSeverityColor(severity) {
  switch (severity) {
    case 'CRITICAL': return { bg: 'bg-red-600',    text: 'text-red-600',    hex: '#dc2626' };
    case 'HIGH':     return { bg: 'bg-orange-500', text: 'text-orange-500', hex: '#f97316' };
    case 'MEDIUM':   return { bg: 'bg-yellow-400', text: 'text-yellow-500', hex: '#eab308' };
    case 'INFO':     return { bg: 'bg-green-500',  text: 'text-green-500',  hex: '#22c55e' };
    default:         return { bg: 'bg-gray-400',   text: 'text-gray-400',   hex: '#9ca3af' };
  }
}

// ─────────────────────────────────────────────────────────────
//  INTERNE HELPERS
// ─────────────────────────────────────────────────────────────
function _severityByPair(idA, idB) {
  // Magnesium-Gruppe vs. Eisen/Calcium → HIGH
  const magGroup = [14, 71, 75];
  const ironCalc  = [17, 19];
  if (
    (magGroup.includes(idA) && ironCalc.includes(idB)) ||
    (magGroup.includes(idB) && ironCalc.includes(idA))
  ) return 'HIGH';

  // Aminosäuren-Transporter-Konkurrenz → MEDIUM
  if ([32, 33, 36, 37].includes(idA) && [32, 33, 36, 37].includes(idB)) return 'MEDIUM';

  // Selen vs. Vitamin C → MEDIUM
  if ([10, 16].includes(idA) && [10, 16].includes(idB)) return 'MEDIUM';

  return 'MEDIUM';
}

function _conflictMessage(idA, idB, isCritical) {
  const a = supplementMap.get(idA)?.name ?? `ID ${idA}`;
  const b = supplementMap.get(idB)?.name ?? `ID ${idB}`;

  if (isCritical) {
    return `🚨 KRITISCH: ${a} + ${b} → Serotonin-Syndrom-Risiko! Niemals kombinieren.`;
  }

  // Spezifische Nachrichten
  const msgMap = {
    '17-14': `⛔ Eisen + Magnesiumcitrat: Magnesium blockiert Eisen-Aufnahme. Min. 2h Abstand.`,
    '17-19': `⛔ Eisen + Calcium: Calcium hemmt Eisen massiv. Min. 2h Abstand!`,
    '17-71': `⛔ Eisen + Magnesiumbisglycinat: Magnesium blockiert Eisen-Aufnahme.`,
    '17-75': `⛔ Eisen + Magnesiumoxid: Magnesium blockiert Eisen-Aufnahme.`,
    '32-33': `⚠️ L-Arginin + L-Lysin: Konkurrieren um dieselben Aminosäure-Transporter.`,
    '36-37': `⚠️ L-Tyrosin + L-Tryptophan: Konkurrieren um BBB-Transport. Getrennte Zeiten!`,
    '10-16': `⚠️ Vitamin C (hoch) + Selen: Hohe Vitamin-C-Dosen reduzieren Selen-Bioverfügbarkeit.`,
    '2-4':   `⛔ Nattokinase + ID 4: Verstärkte Blutungsneigung möglich.`,
    '2-59':  `⛔ Nattokinase + ID 59: Verstärkte Blutungsneigung möglich.`,
  };

  const key1 = `${idA}-${idB}`;
  const key2 = `${idB}-${idA}`;
  return msgMap[key1] ?? msgMap[key2] ?? `⚠️ ${a} + ${b}: Bitte zeitlich trennen.`;
}

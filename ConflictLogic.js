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

import { tr } from './i18n/runtime';
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
// Die Tag-Namen selbst sind Datenschluessel aus inventory.json und bleiben
// unveraendert; nur ihre Beschriftung wird uebersetzt.
const CONFLICT_TAG_KEYS = {
  Blutverdünner: 'logic.tag.blutverduenner',
  SSRI:          'logic.tag.ssri',
  Kaffee:        'logic.tag.kaffee',
  Tee:           'logic.tag.tee',
  ALL:           'logic.tag.all',
};

export function getConflictTagLabel(tag) {
  const key = CONFLICT_TAG_KEYS[tag];
  return key ? tr(key) : tag;
}

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
        message:    tr('logic.synergy', { a: target.name, b: active.name }),
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
      targetName: getConflictTagLabel(tag),
      message:    tr('logic.conflict.tagBased', { name: target.name, tag: getConflictTagLabel(tag) }),
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
    return tr('logic.conflict.critical', { a, b });
  }

  // Paare mit eigener, konkreter Begruendung. Die Reihenfolge der IDs im
  // Schluessel ist die aus dem Katalog — beide Richtungen werden geprueft,
  // weil der Aufruf in beliebiger Reihenfolge kommen kann.
  const SPECIFIC_PAIRS = [
    '17-14', '17-19', '17-71', '17-75',
    '32-33', '36-37', '10-16', '2-4', '2-59',
  ];

  const key1 = `${idA}-${idB}`;
  const key2 = `${idB}-${idA}`;
  const pair = SPECIFIC_PAIRS.includes(key1)
    ? key1
    : SPECIFIC_PAIRS.includes(key2)
      ? key2
      : null;

  return pair
    ? tr(`logic.conflict.pair.${pair}`)
    : tr('logic.conflict.generic', { a, b });
}

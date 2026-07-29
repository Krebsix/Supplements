/**
 * ProfileCheck.js
 * ─────────────────────────────────────────────────────────────
 * Bringt das persoenliche Profil mit dem Bestand zusammen.
 *
 * Bisher wusste die Konfliktpruefung nur etwas ueber Supplements
 * untereinander. Wer ein Medikament nimmt, bekam davon nichts mit,
 * obwohl in der Wirkstoff-Datenbank belegte Hinweise dazu stehen.
 *
 * WAS DIESES MODUL TUT — UND WAS AUSDRUECKLICH NICHT:
 * Es sucht heraus, zu welchen Stoffen im eigenen Bestand ein belegter
 * Hinweis auf eine angegebene Medikamentengruppe hinterlegt ist, und gibt
 * den Originalsatz samt Quelle zurueck.
 *
 * Es bewertet NICHT, ob eine Kombination im Einzelfall problematisch ist.
 * Das kann es auch nicht: Die App kennt weder Praeparat noch Dosis noch
 * Befund. Ein Treffer heisst "dazu steht etwas in der Quelle", nicht
 * "das ist fuer dich gefaehrlich". Genau so muss es in der Oberflaeche
 * auch formuliert sein — die App ordnet ein, sie beraet nicht.
 *
 * Die Datenbasis ist bewusst eng: nur was in data/substances.js oder
 * data/lifeStageAdvisories.js bereits mit Quelle belegt ist (siehe
 * data/medicationClasses.js). Keine erfundene Interaktionsmatrix.
 */

import { matchIngredient } from './SubstanceMatcher';
import {
  getInteractionsForClasses,
  getMedicationClass,
} from './data/medicationClasses';
import { substanceById, normalizeSources } from './data/substances';

const SEVERITY_RANK = {
  contraindicated: 3,
  medical: 2,
  attention: 1,
};

/**
 * Ermittelt die Wirkstoff-IDs, die im Bestand tatsaechlich vorkommen.
 * Beruecksichtigt gescannte Multivitamine ueber ingredientDetails.
 */
function collectSubstanceIds(supplements = []) {
  const found = new Map();

  for (const supplement of Array.isArray(supplements) ? supplements : []) {
    const positions = Array.isArray(supplement?.ingredientDetails) && supplement.ingredientDetails.length > 0
      ? supplement.ingredientDetails
      : [{ name: supplement?.name, form: supplement?.form }];

    for (const position of positions) {
      const match = matchIngredient(position);
      if (!match?.matched) continue;
      if (!found.has(match.substanceId)) found.set(match.substanceId, []);
      const list = found.get(match.substanceId);
      const label = supplement?.name ?? '';
      if (label && !list.includes(label)) list.push(label);
    }
  }

  return found;
}

/**
 * checkProfileAgainstStack(profile, supplements)
 *
 * profile: { medicationClasses: [...] }  — weitere Felder werden ignoriert
 * supplements: aktive Eintraege aus useStore
 *
 * Rueckgabe: Liste der belegten Bezuege, schwerster zuerst.
 * Jeder Eintrag traegt den Originalsatz (`quote`) und die Quellen des
 * Wirkstoffs, damit die Aussage nachpruefbar bleibt.
 */
export function checkProfileAgainstStack(profile = {}, supplements = []) {
  const classIds = Array.isArray(profile?.medicationClasses)
    ? profile.medicationClasses
    : [];

  if (classIds.length === 0) return [];

  const inStack = collectSubstanceIds(supplements);
  if (inStack.size === 0) return [];

  const results = [];

  for (const interaction of getInteractionsForClasses(classIds)) {
    const productNames = inStack.get(interaction.substanceId);
    if (!productNames) continue;

    const substance = substanceById.get(interaction.substanceId);
    if (!substance) continue;

    const medicationClass = getMedicationClass(interaction.medicationClassId);

    results.push({
      substanceId: interaction.substanceId,
      substanceName: substance.name,
      medicationClassId: interaction.medicationClassId,
      medicationClassLabel: medicationClass?.label ?? interaction.medicationClassId,
      severity: interaction.severity,
      // Woertlich aus der belegten Quelle — nicht paraphrasieren, sonst
      // laesst sich die Aussage nicht mehr gegenpruefen.
      quote: interaction.quote,
      sourceField: interaction.sourceField,
      sources: normalizeSources(substance.sources ?? []),
      // In welchen Produkten des Bestands der Stoff steckt
      productNames,
    });
  }

  results.sort((a, b) => {
    const rank = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0);
    if (rank !== 0) return rank;
    return a.substanceName.localeCompare(b.substanceName, 'de');
  });

  return results;
}

/**
 * summarizeProfileFindings(findings)
 * Zaehlt die Treffer je Schweregrad — fuer eine Kurzanzeige, die nicht
 * gleich die ganze Liste aufblaettert.
 */
export function summarizeProfileFindings(findings = []) {
  const counts = { contraindicated: 0, medical: 0, attention: 0 };
  for (const entry of findings) {
    if (counts[entry.severity] !== undefined) counts[entry.severity] += 1;
  }
  return {
    ...counts,
    total: findings.length,
    strictest:
      counts.contraindicated > 0
        ? 'contraindicated'
        : counts.medical > 0
          ? 'medical'
          : counts.attention > 0
            ? 'attention'
            : null,
  };
}

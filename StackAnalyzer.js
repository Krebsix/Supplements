/**
 * StackAnalyzer.js
 * ─────────────────────────────────────────────────────────────
 * Rechnet ueber den GESAMTEN Bestand statt ueber ein einzelnes Produkt.
 *
 * WARUM DAS NOETIG IST:
 * ReferenceCheck.js beantwortet "wie viel steckt in DIESER Dose". Die
 * Obergrenzen in data/referenceValues.js gelten aber fuer die Tagesmenge
 * aus ALLEN Quellen. Wer drei Praeparate mit Magnesium nimmt, blieb bisher
 * unter dem Radar, weil jedes einzeln unauffaellig ist — genau die
 * Konstellation, vor der eine Supplement-App warnen muesste.
 *
 * Diese Datei summiert deshalb je Wirkstoff ueber alle aktiven Produkte
 * und prueft die Summe. Dabei gilt dieselbe Regel wie ueberall:
 * Verbindungsmengen werden vorher auf die elementare Menge gebracht
 * (DoseNormalizer.js), sonst addiert man Aepfel und Birnen.
 *
 * MENGENSPANNEN:
 * Dosierungen stehen im Bestand teils als Spanne ("250-500 mg"), weil
 * Etiketten das so angeben. Der Analyzer fuehrt Unter- und Obergrenze
 * getrennt mit und prueft die Obergrenze gegen den Grenzwert — bei einer
 * Sicherheitsfrage ist das der relevante Rand. Die Spanne bleibt sichtbar,
 * damit die Zahl nicht genauer wirkt, als sie ist.
 *
 * Wie ueberall: keine erfundenen Werte. Positionen ohne erkennbare Menge
 * oder ohne gesicherten Elementanteil werden gezaehlt und ausgewiesen,
 * aber nicht geschaetzt — sonst waere eine Summe scheingenau.
 */

import { matchIngredient, convertAmount } from './SubstanceMatcher';
import { AMOUNT_BASIS, resolveAmountBasis } from './DoseNormalizer';
import { checkAgainstReference, REFERENCE_STATUS } from './ReferenceCheck';
import { tr } from './i18n/runtime';
import { getReferenceValue } from './data/referenceValues';

/**
 * Zerlegt eine Mengenangabe in Unter- und Obergrenze.
 * "250-500" → {min: 250, max: 500}   "300" → {min: 300, max: 300}
 * "1,5"     → {min: 1.5, max: 1.5}   ""    → null
 */
export function parseAmountRange(raw) {
  const text = String(raw ?? '').trim().replace(',', '.');
  if (!text) return null;

  const range = text.match(/^(\d+(?:\.\d+)?)\s*[-–bis]+\s*(\d+(?:\.\d+)?)$/i);
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  const single = text.match(/^(\d+(?:\.\d+)?)/);
  if (!single) return null;
  const value = Number(single[1]);
  if (!Number.isFinite(value)) return null;
  return { min: value, max: value };
}

/**
 * Zieht aus einem Bestandseintrag alle Wirkstoff-Positionen.
 * Ein gescanntes Produkt kann mehrere enthalten (Multivitamin), ein
 * manuell angelegtes traegt in der Regel genau einen.
 */
function extractPositions(supplement) {
  const details = Array.isArray(supplement?.ingredientDetails)
    ? supplement.ingredientDetails
    : null;

  if (details && details.length > 0) {
    return details.map((detail) => ({
      label: detail?.name ?? '',
      match: matchIngredient(detail),
      range: parseAmountRange(detail?.amount),
      unit: detail?.unit ?? '',
    }));
  }

  return [
    {
      label: supplement?.name ?? '',
      match: matchIngredient({
        name: supplement?.name,
        form: supplement?.form,
        // Menge bewusst nicht mitgeben: die Spanne wird separat gelesen,
        // matchIngredient kann mit "250-500" nichts anfangen.
        amount: '',
        unit: supplement?.dosage?.unit,
      }),
      range: parseAmountRange(supplement?.dosage?.amount),
      unit: supplement?.dosage?.unit ?? '',
    },
  ];
}

/**
 * Bringt eine Positionsmenge auf die elementare Menge in Referenz-Einheit.
 * Gibt null zurueck, wenn das nicht sicher moeglich ist.
 */
function toComparableRange(position, referenceUnit) {
  const { match, range, unit } = position;
  if (!match?.matched || !range) return null;

  // Elementanteil bestimmen — dafuer braucht resolveAmountBasis eine Menge,
  // also einmal mit der Obergrenze fragen und den Faktor uebernehmen.
  const probe = resolveAmountBasis({ ...match, amount: range.max });

  if (probe.basis === AMOUNT_BASIS.COMPOUND_UNKNOWN) return null;

  const factor = probe.basis === AMOUNT_BASIS.COMPOUND ? probe.fraction : 1;

  const min = convertAmount(range.min * factor, unit, referenceUnit, match.substance);
  const max = convertAmount(range.max * factor, unit, referenceUnit, match.substance);

  if (min === null || max === null) return null;
  return { min, max, converted: probe.basis === AMOUNT_BASIS.COMPOUND };
}

/**
 * analyzeStack(supplements, lifeStageId)
 * supplements: aktive Eintraege aus useStore (userSupplements)
 *
 * Rueckgabe:
 *   totals      je Wirkstoff die Tagessumme mit Referenzabgleich
 *   duplicates  Wirkstoffe, die in mehr als einem Produkt stecken
 *   unresolved  Positionen, die nicht sicher verrechnet werden konnten
 */
export function analyzeStack(supplements = [], lifeStageId = null) {
  const bySubstance = new Map();
  const unresolved = [];

  for (const supplement of Array.isArray(supplements) ? supplements : []) {
    for (const position of extractPositions(supplement)) {
      if (!position.match?.matched) {
        unresolved.push({
          supplementName: supplement?.name ?? '',
          label: position.label,
          reason: 'unknown_substance',
        });
        continue;
      }

      const substanceId = position.match.substanceId;
      const reference = lifeStageId
        ? getReferenceValue(substanceId, lifeStageId)
        : null;

      // Ohne Referenzwert gibt es keine Zieleinheit — dann wird die
      // Substanz zwar als Doppelung erfasst, aber nicht summiert.
      const referenceUnit = reference?.unit ?? position.unit;
      const comparable = toComparableRange(position, referenceUnit);

      if (!bySubstance.has(substanceId)) {
        bySubstance.set(substanceId, {
          substanceId,
          name: position.match.substance.name,
          unit: referenceUnit,
          totalMin: 0,
          totalMax: 0,
          countedPositions: 0,
          skippedPositions: 0,
          sources: [],
          hasConvertedAmounts: false,
        });
      }

      const entry = bySubstance.get(substanceId);
      entry.sources.push({
        supplementId: supplement?.id ?? null,
        supplementName: supplement?.name ?? '',
        label: position.label,
        amountText: position.range
          ? (position.range.min === position.range.max
              ? `${position.range.min} ${position.unit}`
              : `${position.range.min}–${position.range.max} ${position.unit}`)
          : '',
      });

      if (comparable) {
        entry.totalMin += comparable.min;
        entry.totalMax += comparable.max;
        entry.countedPositions += 1;
        if (comparable.converted) entry.hasConvertedAmounts = true;
      } else {
        entry.skippedPositions += 1;
        unresolved.push({
          supplementName: supplement?.name ?? '',
          label: position.label,
          reason: position.range ? 'no_comparable_amount' : 'no_amount',
        });
      }
    }
  }

  const totals = [];
  for (const entry of bySubstance.values()) {
    const rounded = {
      ...entry,
      totalMin: roundSensibly(entry.totalMin),
      totalMax: roundSensibly(entry.totalMax),
    };

    // Die Summe gegen den Referenzwert halten — bewusst mit der Obergrenze
    // der Spanne, weil das der sicherheitsrelevante Rand ist.
    rounded.referenceCheck =
      lifeStageId && entry.countedPositions > 0
        ? checkAgainstReference(
            {
              matched: true,
              substanceId: entry.substanceId,
              substance: { name: entry.name },
              // Bereits elementar und in Referenz-Einheit umgerechnet:
              // als reine Elementangabe kennzeichnen, damit DoseNormalizer
              // nicht ein zweites Mal herunterrechnet.
              tokens: [],
              form: null,
              label: entry.name,
              amount: rounded.totalMax,
              unit: entry.unit,
            },
            lifeStageId
          )
        : null;

    totals.push(rounded);
  }

  // Auffaelligstes zuerst: Grenzwertueberschreitungen nach oben.
  const severity = {
    [REFERENCE_STATUS.ABOVE_LIMIT]: 3,
    [REFERENCE_STATUS.ABOVE_REFERENCE]: 2,
  };
  totals.sort((a, b) => {
    const sa = severity[a.referenceCheck?.status] ?? 0;
    const sb = severity[b.referenceCheck?.status] ?? 0;
    if (sa !== sb) return sb - sa;
    return b.sources.length - a.sources.length;
  });

  const duplicates = totals.filter((entry) => entry.sources.length > 1);

  return { totals, duplicates, unresolved };
}

function roundSensibly(value) {
  if (!Number.isFinite(value)) return null;
  if (value >= 100) return Math.round(value);
  if (value >= 10) return Math.round(value * 10) / 10;
  return Math.round(value * 100) / 100;
}

/**
 * getStackWarnings(analysis)
 * Reduziert die Analyse auf das, was tatsaechlich Aufmerksamkeit verdient.
 * Bewusst knapp gehalten — eine Liste mit zwanzig roten Hinweisen wird
 * ignoriert, und genau das soll diese App nicht tun.
 */
export function getStackWarnings(analysis) {
  if (!analysis?.totals) return [];

  const warnings = [];

  for (const entry of analysis.totals) {
    const status = entry.referenceCheck?.status;

    if (status === REFERENCE_STATUS.ABOVE_LIMIT) {
      warnings.push({
        level: 'critical',
        substanceId: entry.substanceId,
        text: tr(
          entry.sources.length === 1
            ? 'stack.warning.aboveLimit_one'
            : 'stack.warning.aboveLimit_other',
          {
            name: entry.name,
            count: entry.sources.length,
            amount: entry.totalMax,
            unit: entry.unit,
            limit: entry.referenceCheck.upperLimit,
          }
        ),
      });
    } else if (status === REFERENCE_STATUS.ABOVE_REFERENCE && entry.sources.length > 1) {
      warnings.push({
        level: 'notice',
        substanceId: entry.substanceId,
        text: tr('stack.warning.aboveReference', {
          name: entry.name,
          count: entry.sources.length,
          amount: entry.totalMax,
          unit: entry.unit,
          reference: entry.referenceCheck.reference,
        }),
      });
    } else if (entry.sources.length > 1) {
      warnings.push({
        level: 'info',
        substanceId: entry.substanceId,
        text: tr('stack.warning.duplicate', {
          name: entry.name,
          count: entry.sources.length,
        }),
      });
    }
  }

  return warnings;
}

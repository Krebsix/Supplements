/**
 * ComplaintSearch.js
 * ─────────────────────────────────────────────────────────────
 * Sucht zu einer alltagssprachlich formulierten Beschwerde.
 *
 * "ich bin staendig muede" fand bisher nichts: Die Suche verglich den
 * Text mit Substanznamen und Anwendungsgebieten, und dort steht nun mal
 * kein ganzer Satz.
 *
 * WAS DIE ANTWORT LEISTEN MUSS:
 * Zuerst die Einordnung, dass die Beschwerde unspezifisch ist. Dann die
 * Breite der moeglichen Ursachen. Dann die Warnsignale. Und erst danach
 * die Naehrstoffe, mit ehrlicher Angabe zur Evidenzlage.
 *
 * Diese Reihenfolge ist keine Kosmetik. Wer bei "muede" mit Eisen
 * anfaengt, hat die Beschwerde bereits gedeutet — und genau das darf die
 * App nicht.
 *
 * Der Abgleich mit dem eigenen Bestand ist der zweite ehrliche Teil:
 * "Du nimmst davon bereits zwei" ist eine nuetzliche Information, gerade
 * weil sie oft gegen den Kauf eines weiteren Praeparats spricht.
 */

import { matchIngredient } from './SubstanceMatcher';
import { COMPLAINTS } from './data/complaints';
import { localizeComplaint } from './data/localize';
import { substanceById } from './data/substances';

function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * findComplaints(query)
 * Gibt passende Beschwerdebilder zurueck, bester Treffer zuerst.
 *
 * Bewertet wird nach Laenge des getroffenen Begriffs: Wer "wadenkraempfe"
 * schreibt, meint etwas Spezifischeres als jemand, der nur "krampf"
 * tippt, und soll den praeziseren Treffer oben sehen.
 */
export function findComplaints(query) {
  const normalized = normalize(query);
  if (normalized.length < 3) return [];

  const scored = [];

  for (const complaint of COMPLAINTS) {
    const terms = [complaint.label, ...complaint.synonyms].map(normalize);
    let best = 0;

    for (const term of terms) {
      if (!term) continue;
      // Ganzer Suchbegriff enthaelt den Term oder umgekehrt — beides
      // zaehlt, weil Leute mal knapp und mal ausschweifend tippen.
      if (normalized.includes(term) || term.includes(normalized)) {
        best = Math.max(best, term.length);
      }
    }

    if (best > 0) scored.push({ complaint, score: best });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.complaint);
}

/**
 * buildComplaintView(complaint, supplements)
 *
 * Setzt die Antwort zusammen und verknuepft sie mit dem eigenen Bestand.
 * Naehrstoffe, die schon eingenommen werden, sind markiert — samt der
 * Produkte, in denen sie stecken.
 */
export function buildComplaintView(rawComplaint, supplements = []) {
  if (!rawComplaint) return null;

  // Sprach-Overlay (data/localize.js): auf Deutsch ein No-op.
  const complaint = localizeComplaint(rawComplaint);

  // Was steckt im Bestand? Gescannte Multivitamine mitzaehlen.
  const inStack = new Map();
  for (const supplement of Array.isArray(supplements) ? supplements : []) {
    const positions =
      Array.isArray(supplement?.ingredientDetails) && supplement.ingredientDetails.length > 0
        ? supplement.ingredientDetails
        : [{ name: supplement?.name, form: supplement?.form }];

    for (const position of positions) {
      const match = matchIngredient(position);
      if (!match?.matched) continue;
      if (!inStack.has(match.substanceId)) inStack.set(match.substanceId, []);
      const names = inStack.get(match.substanceId);
      if (supplement?.name && !names.includes(supplement.name)) names.push(supplement.name);
    }
  }

  const nutrients = (complaint.relatedNutrients ?? []).map((entry) => {
    const substance = substanceById.get(entry.substanceId);
    return {
      substanceId: entry.substanceId,
      name: substance?.name ?? entry.substanceId,
      note: entry.note,
      // Der wichtigste Teil fuer die Kaufentscheidung
      inStack: inStack.has(entry.substanceId),
      productNames: inStack.get(entry.substanceId) ?? [],
      known: Boolean(substance),
    };
  });

  const alreadyCovered = nutrients.filter((entry) => entry.inStack);

  return {
    id: complaint.id,
    label: complaint.label,
    intro: complaint.intro,
    contextAreas: complaint.contextAreas ?? [],
    redFlags: complaint.redFlags ?? [],
    nutrients,
    alreadyCovered,
    labMarkers: complaint.labMarkers ?? [],
    questionsForProfessional: complaint.questionsForProfessional ?? [],
    sources: complaint.sources ?? [],
  };
}

/**
 * Prueft beim Start, dass alle referenzierten Wirkstoffe existieren.
 * Ein Tippfehler in einer substanceId wuerde sonst still dazu fuehren,
 * dass ein Naehrstoff ohne Namen und ohne Bestandsabgleich erscheint.
 */
export function findUnknownSubstanceRefs() {
  const unknown = [];
  for (const complaint of COMPLAINTS) {
    for (const entry of complaint.relatedNutrients ?? []) {
      if (!substanceById.has(entry.substanceId)) {
        unknown.push({ complaintId: complaint.id, substanceId: entry.substanceId });
      }
    }
  }
  return unknown;
}

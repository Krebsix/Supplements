/**
 * AmountEquivalence.js
 * ─────────────────────────────────────────────────────────────
 * Entscheidet, ob zwei Wirkstoff-Positionen DESSELBEN Produkts dieselbe
 * Menge beschreiben (das Etikett nennt sie zweimal, in zwei Einheiten)
 * oder ob es zwei echte Quellen sind, die addiert werden muessen.
 *
 * WARUM DAS NOETIG IST (belegter Fall, Feature-Audit 2026-09-14):
 * Ein Etikett mit "Vitamin D3 1000 I.E. (25 µg)" liefert aus der
 * Vision-Analyse ZWEI Zutatenzeilen fuer dieselbe Substanz:
 *
 *   Vitamin D3 | 1000 | I.E. | Cholecalciferol
 *   Vitamin D3 |   25 | µg   | Cholecalciferol
 *
 * StackAnalyzer.js summierte beide und kam auf 2000 IE. Der
 * Referenzabgleich meldete daraufhin "250 Prozent des Referenzwerts",
 * obwohl das Produkt 1000 IE enthaelt, also 125 Prozent. Aus einer
 * korrekt gelesenen Doppelangabe wurde eine falsche fachliche Aussage.
 * Genau das darf die App nicht tun.
 *
 * DIE ENTSCHEIDUNG LIEGT HIER, NICHT IM MODELL:
 * Die Vision-Analyse liefert zwar oft einen Hinweis in `uncertainties`
 * ("Vitamin D3 ist doppelt erfasst"), und analyzeStack fuehrt eine
 * `duplicates`-Liste. Beides sind HINWEISE. Ob zusammengefuehrt wird,
 * entscheidet ausschliesslich dieses Modul, deterministisch aus den
 * Zahlen und aus data/substances.js. Ein Modelltext ist kein Beleg.
 *
 * WIRKSTOFFSPEZIFISCH, NIE PAUSCHAL:
 * Zusammengefuehrt wird nur, wenn die Substanz in data/substances.js
 * eine belegte Umrechnung traegt (`unitConversion.factorToIE`). Stand
 * 2026-09-14 ist das ausschliesslich Vitamin D3 (1 µg = 40 IE, gilt
 * fuer D3 und D2 gleichermassen).
 *
 * Bewusst NICHT umgerechnet, obwohl Etiketten dort IE verwenden:
 *   - Vitamin A: 1 IE sind 0,3 µg Retinol, aber 0,6 µg Beta-Carotin.
 *     Der Faktor haengt an der Form; ohne gesicherte Form waere jede
 *     Zahl geraten. Referenzwert steht in µg, kein unitConversion.
 *   - Vitamin E: 1 mg RRR-alpha-Tocopherol sind rund 1,49 IE,
 *     synthetisches all-rac-alpha-Tocopherol rund 1,10 IE. Ebenfalls
 *     formabhaengig, kein unitConversion.
 * Solche Faelle werden als `undecidable` gemeldet und WEITER ADDIERT,
 * plus prueffaehiger Hinweis. Lieber eine Rueckfrage an die Nutzerin
 * als eine stillschweigend halbierte Tagessumme.
 *
 * VIER BEDINGUNGEN fuer eine Zusammenfuehrung, alle muessen gelten:
 *   1. gleiche kanonische Substanz
 *   2. VERSCHIEDENE Einheiten (zwei Zeilen in derselben Einheit sind
 *      nicht entscheidbar: Etikettenfehler oder zwei Quellen)
 *   3. belegte Umrechnung zwischen beiden Einheiten
 *   4. gleiche oder unbestimmte chemische Form
 *
 * Bedingung 4 schuetzt den echten Kombinationsfall: "D3 aus Lanolin
 * 500 IE" plus "D3 aus Flechten 12,5 µg" sind zwei Quellen, die
 * zusammen 1000 IE ergeben. Ohne die Formpruefung wuerde dieses Modul
 * daraus 500 IE machen und die Summe zu NIEDRIG ansetzen.
 *
 * Die Zusammenfuehrung wirkt nur INNERHALB eines Produkts. Zwei
 * Praeparate mit je 1000 IE bleiben 2000 IE — das ist der Kern der
 * Tagessummen-Pruefung und darf nie wegfallen.
 */

import { convertAmount } from './SubstanceMatcher';

export const EQUIVALENCE = {
  /** Sicher dieselbe Menge, zweimal angeschrieben. Einmal zaehlen. */
  SAME_AMOUNT: 'same_amount',
  /** Sicher verschiedene Mengen. Addieren. */
  DISTINCT: 'distinct',
  /** Nicht sicher entscheidbar. Addieren UND Hinweis zeigen. */
  UNDECIDABLE: 'undecidable',
};

/** Rolle einer Position, nachdem die Gruppe aufgeloest ist. */
export const POSITION_ROLE = {
  /** Zaehlt fuer Tagessumme und Referenzvergleich. */
  COUNTED: 'counted',
  /** Dieselbe Menge in anderer Einheit. Bleibt sichtbar, zaehlt nicht. */
  RESTATED: 'restated',
  /** Verdaechtig, aber nicht entscheidbar. Zaehlt weiter, mit Hinweis. */
  AMBIGUOUS: 'ambiguous',
};

/**
 * Relative Toleranz beim Vergleich zweier umgerechneter Mengen.
 * Der Faktor 40 (µg auf IE) ist glatt, Etikettenangaben stimmen deshalb
 * meist exakt ("1000 IE (25 µg)"). Zwei Prozent decken Rundungen ab,
 * ohne zwei benachbarte, echte Angaben zu verschmelzen.
 */
const RELATIVE_TOLERANCE = 0.02;

/**
 * Formangabe fuer den Vergleich: bewusst die ROHE Etikettangabe
 * (`position.rawForm`), nicht die zugeordnete Form aus `match.form`.
 * `detectForm()` in SubstanceMatcher.js leitet die Form auch aus dem
 * Substanznamen ab — bei "Vitamin D3" kommt deshalb immer die D3-Form
 * heraus, selbst wenn auf dem Etikett D2 steht und selbst wenn gar keine
 * Form angegeben ist. Als Unterscheidungsmerkmal ist sie damit
 * unbrauchbar.
 */
const normalizedForm = (position) =>
  String(position?.rawForm ?? '')
    .trim()
    .toLowerCase();

const unitOf = (position) => String(position?.unit ?? '').trim().toLowerCase();

/** Beide Raender innerhalb der Toleranz? */
function rangesMatch(a, b) {
  const close = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (x === y) return true;
    const scale = Math.max(Math.abs(x), Math.abs(y));
    if (scale === 0) return true;
    return Math.abs(x - y) / scale <= RELATIVE_TOLERANCE;
  };
  return close(a.min, b.min) && close(a.max, b.max);
}

/**
 * compareAmounts(a, b)
 * Vergleicht zwei Positionen derselben Substanz. Gibt eine der drei
 * EQUIVALENCE-Werte zurueck, plus eine kurze, nicht uebersetzte
 * Begruendung fuer Protokoll und Test.
 */
export function compareAmounts(a, b) {
  const substance = a?.match?.substance ?? b?.match?.substance ?? null;

  if (!a?.match?.matched || !b?.match?.matched) {
    return { equivalence: EQUIVALENCE.UNDECIDABLE, reason: 'unmatched' };
  }
  if (a.match.substanceId !== b.match.substanceId) {
    return { equivalence: EQUIVALENCE.DISTINCT, reason: 'other_substance' };
  }
  if (!a.range || !b.range) {
    return { equivalence: EQUIVALENCE.UNDECIDABLE, reason: 'missing_amount' };
  }

  const unitA = unitOf(a);
  const unitB = unitOf(b);
  if (!unitA || !unitB) {
    return { equivalence: EQUIVALENCE.UNDECIDABLE, reason: 'missing_unit' };
  }

  // Bedingung 2: Dieselbe Einheit zweimal ist nicht entscheidbar.
  if (unitA === unitB) {
    return rangesMatch(a.range, b.range)
      ? { equivalence: EQUIVALENCE.UNDECIDABLE, reason: 'same_unit_same_value' }
      : { equivalence: EQUIVALENCE.DISTINCT, reason: 'same_unit_other_value' };
  }

  // Bedingung 4: Verschiedene Formen heissen zwei Quellen.
  const formA = normalizedForm(a);
  const formB = normalizedForm(b);
  if (formA && formB && formA !== formB) {
    return { equivalence: EQUIVALENCE.DISTINCT, reason: 'different_form' };
  }

  // Bedingung 3: Umrechnung muss belegt sein. convertAmount greift fuer
  // IE ausschliesslich auf substance.unitConversion.factorToIE zu und
  // liefert sonst null.
  const min = convertAmount(b.range.min, unitB, unitA, substance);
  const max = convertAmount(b.range.max, unitB, unitA, substance);
  if (min === null || max === null) {
    return { equivalence: EQUIVALENCE.UNDECIDABLE, reason: 'no_conversion' };
  }

  return rangesMatch(a.range, { min, max })
    ? { equivalence: EQUIVALENCE.SAME_AMOUNT, reason: 'converted_match' }
    : { equivalence: EQUIVALENCE.DISTINCT, reason: 'converted_mismatch' };
}

/**
 * resolveDuplicateAmounts(positions, options)
 * positions: Wirkstoff-Positionen EINES Produkts (aus
 *            StackAnalyzer.extractPositions)
 * options.preferUnit: Einheit, die bei einer Zusammenfuehrung gezaehlt
 *            werden soll (in der Regel die Referenz-Einheit). Fehlt sie
 *            oder passt keine Position, gewinnt die erste Position.
 *
 * Gibt ALLE Positionen unveraendert zurueck, jede zusaetzlich mit:
 *   role         POSITION_ROLE
 *   countedForTotal  true, wenn die Position in die Summe eingeht
 *   equivalence  { role, reason, partnerLabels: [] } oder null
 *
 * Beide Etikettangaben bleiben also erhalten; nur eine zaehlt.
 */
export function resolveDuplicateAmounts(positions = [], { preferUnit = '' } = {}) {
  const list = Array.isArray(positions) ? positions : [];
  if (list.length < 2) {
    return list.map((position) => ({
      ...position,
      role: POSITION_ROLE.COUNTED,
      countedForTotal: true,
      equivalence: null,
    }));
  }

  const decorated = list.map((position, index) => ({
    ...position,
    index,
    role: POSITION_ROLE.COUNTED,
    countedForTotal: true,
    equivalence: null,
  }));

  // Nach Substanz gruppieren; nur innerhalb einer Gruppe vergleichen.
  const groups = new Map();
  for (const position of decorated) {
    const id = position.match?.matched ? position.match.substanceId : null;
    if (!id) continue;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(position);
  }

  const wanted = String(preferUnit ?? '').trim().toLowerCase();

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    // Bereits als Wiederholung markierte Positionen nicht erneut prüfen:
    // Bei drei Angaben derselben Menge bleibt genau eine gezaehlt.
    for (let i = 0; i < group.length; i += 1) {
      const anchor = group[i];
      if (anchor.role === POSITION_ROLE.RESTATED) continue;

      for (let j = i + 1; j < group.length; j += 1) {
        const other = group[j];
        if (other.role === POSITION_ROLE.RESTATED) continue;

        const { equivalence, reason } = compareAmounts(anchor, other);

        if (equivalence === EQUIVALENCE.SAME_AMOUNT) {
          // Welche der beiden zaehlt: die in der gewuenschten Einheit.
          const anchorWanted = wanted && unitOf(anchor) === wanted;
          const otherWanted = wanted && unitOf(other) === wanted;
          const keep = !anchorWanted && otherWanted ? other : anchor;
          const drop = keep === anchor ? other : anchor;

          drop.role = POSITION_ROLE.RESTATED;
          drop.countedForTotal = false;
          drop.equivalence = {
            role: POSITION_ROLE.RESTATED,
            reason,
            partnerLabels: [`${keep.range?.max ?? ''} ${keep.unit}`.trim()],
          };
          keep.role = POSITION_ROLE.COUNTED;
          keep.countedForTotal = true;
          keep.equivalence = {
            role: POSITION_ROLE.COUNTED,
            reason,
            partnerLabels: [
              ...(keep.equivalence?.partnerLabels ?? []),
              `${drop.range?.max ?? ''} ${drop.unit}`.trim(),
            ],
          };
          // Wenn die Ankerposition selbst verworfen wurde, ist sie als
          // Anker verbraucht.
          if (drop === anchor) break;
        } else if (equivalence === EQUIVALENCE.UNDECIDABLE) {
          // Nicht zusammenfuehren, aber beide kennzeichnen. Sie zaehlen
          // weiter, damit die Summe nicht stillschweigend sinkt.
          for (const [self, partner] of [[anchor, other], [other, anchor]]) {
            if (self.role === POSITION_ROLE.RESTATED) continue;
            self.role = POSITION_ROLE.AMBIGUOUS;
            self.equivalence = {
              role: POSITION_ROLE.AMBIGUOUS,
              reason,
              partnerLabels: [
                ...(self.equivalence?.partnerLabels ?? []),
                `${partner.range?.max ?? ''} ${partner.unit}`.trim(),
              ],
            };
          }
        }
      }
    }
  }

  return decorated.map(({ index, ...position }) => position);
}

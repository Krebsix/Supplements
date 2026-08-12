# Laborbefund einlesen — Umsetzungsplan

> **Fuer agentische Bearbeiter:** ERFORDERLICHER SUB-SKILL: superpowers:subagent-driven-development (empfohlen) oder superpowers:executing-plans, um diesen Plan Aufgabe fuer Aufgabe umzusetzen. Die Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Laborwerte aus einem PDF-Befund uebernehmen, ohne sie abzutippen — vollstaendig auf dem Geraet, mit Bestaetigung durch die Nutzerin.

**Architektur:** Drei Einheiten mit klarer Grenze. `LabReportText.js` beschafft Rohtext aus einer Datei und kennt keine Laborwerte. `LabReportParser.js` bekommt Rohtext und liefert Wert-Kandidaten; er kennt keine Dateien und ist damit ohne Geraet testbar. Der Screen zeigt Kandidaten und schreibt ueber die vorhandene `addLabValue`-Funktion. Am Datenmodell aendert sich nichts.

**Tech-Stack:** React Native / Expo SDK 54, expo-router, zustand, expo-document-picker (bereits im Projekt), Tests ueber `npm test` (esbuild + node, `tests/*.test.mjs`).

**Spezifikation:** `docs/superpowers/specs/2026-08-12-laborbefund-einlesen-design.md`

## Global Constraints

- **Kein Netzwerkzugriff.** In keiner Ausbaustufe, an keiner Stelle. Der Befund verlaesst das Geraet nicht.
- **Nichts raten.** Was nicht sicher erkannt wird, bleibt leer und wird als offen ausgewiesen. Keine Vorbelegung mit Standardwerten (Regel aus CLAUDE.md, Commit `6bd60b6`).
- **Keine eigenen Referenzbereiche.** Nur uebernehmen, was im Befund steht.
- **Keine Bewertung.** Kein "zu niedrig", kein "Mangel", kein "im Normbereich", auch nicht farblich.
- **Keine Diagnosen, kein Freitext aus Arztbriefen.**
- Code-Kommentare auf Deutsch.
- Keine Hex-Werte in Komponenten — nur Tokens aus `theme.js`.
- Keine Gedankenstriche in Nutzertexten (Doppelpunkt, Komma oder Punkt).
- Neue Oberflaechentexte immer in `i18n/de/` UND `i18n/en/` anlegen, gleiche Schluesselzahl.
- Tests laufen mit `npm test` und muessen gruen bleiben.

## Dateien

| Datei | Verantwortung |
|---|---|
| `data/labMarkers.js` (aendern) | Erhaelt je Marker ein Feld `synonyms` — Katalogwissen, gehoert zu den Daten, nicht in den Parser |
| `LabReportParser.js` (neu) | Rohtext zu Wert-Kandidaten. Reine Funktionen, kein Dateizugriff |
| `LabReportText.js` (neu) | Rohtext aus einer PDF-Datei. Kennt keine Laborwerte |
| `app/(tabs)/(more)/lab-import.jsx` (neu) | Bestaetigungs-Oberflaeche, schreibt ueber `addLabValue` |
| `app/(tabs)/(more)/_layout.jsx` (aendern) | Route registrieren |
| `app/(tabs)/(more)/lab.jsx` (aendern) | Einstieg "Befund einlesen" |
| `i18n/de/lab.js`, `i18n/en/lab.js` (aendern) | Texte |
| `data/legalContent.js` (aendern) | Ein Satz zum Einlesen |
| `tests/lab-report-parser.test.mjs` (neu) | Parser gegen echte Befundmuster |

---

### Task 1: Machbarkeit der PDF-Textextraktion klaeren

Dieser Task schreibt kein Produktionscode. Er beantwortet eine Frage, von der alles Weitere abhaengt: Laesst sich PDF-Text in React Native ohne natives Modul lesen? Faellt die Antwort negativ aus, braucht der PDF-Weg denselben Development Build wie die spaetere Fotoerkennung, und die Reihenfolge des Vorhabens aendert sich.

**Files:**
- Create: `docs/superpowers/spikes/2026-08-12-pdf-text.md`
- Create (temporaer, wird wieder entfernt): `spike-pdf/`

**Interfaces:**
- Consumes: nichts
- Produces: die Entscheidung, welche Bibliothek `LabReportText.js` in Task 4 nutzt

- [ ] **Schritt 1: Test-PDF mit Textebene erzeugen**

Ein PDF, dessen Text maschinenlesbar ist, laesst sich lokal erzeugen — kein echter Befund noetig, keine Gesundheitsdaten im Repo.

```bash
mkdir -p spike-pdf && cd spike-pdf
cat > befund.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842">
  <text x="40" y="60" font-family="Helvetica" font-size="12">Laborbefund vom 05.08.2026</text>
  <text x="40" y="100" font-family="Helvetica" font-size="11">Ferritin            45      ng/ml     30 - 300</text>
  <text x="40" y="120" font-family="Helvetica" font-size="11">25-OH-Vitamin D     18,4    ng/ml     30 - 70</text>
  <text x="40" y="140" font-family="Helvetica" font-size="11">TSH                 2,1     mU/l      0,4 - 4,0</text>
</svg>
EOF
rsvg-convert -f pdf befund.svg -o befund.pdf
```

- [ ] **Schritt 2: Textextraktion in reinem Node pruefen**

Erst ohne React Native. Geht es hier nicht, geht es dort erst recht nicht.

```bash
cd spike-pdf
npm init -y >/dev/null
npm install pdfjs-dist@4
cat > extract.mjs <<'EOF'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'node:fs';

const data = new Uint8Array(readFileSync('befund.pdf'));
const pdf = await getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
let out = '';
for (let p = 1; p <= pdf.numPages; p++) {
  const content = await (await pdf.getPage(p)).getTextContent();
  out += content.items.map((i) => i.str).join(' ') + '\n';
}
console.log(out);
EOF
node extract.mjs
```

Erwartet: Die drei Wertzeilen erscheinen lesbar. Erscheint stattdessen Leerstring oder Fehler, ist das Ergebnis "PDF-Textebene nicht lesbar" und Schritt 4 haelt das fest.

- [ ] **Schritt 3: Dieselbe Extraktion in der App pruefen**

`pdfjs-dist` setzt Browser-Globals voraus, die React Native nicht mitbringt. Dieser Schritt klaert, ob die Luecken mit Polyfills zu schliessen sind.

Vorgehen: In `app/(tabs)/(more)/lab.jsx` voruebergehend einen Knopf ergaenzen, der eine mit `expo-document-picker` gewaehlte Datei ueber `expo-file-system` als Base64 liest, in ein `Uint8Array` wandelt und durch dieselbe `getDocument`-Aufrufkette schickt. Ergebnis per `console.log` ausgeben und im Metro-Log lesen.

Auf Fehler achten, die auf fehlende Globals hindeuten (`DOMMatrix`, `Path2D`, `btoa`, `structuredClone`). Fuer jeden solchen Fehler pruefen, ob ein Polyfill genuegt.

Zeitrahmen: hoechstens zwei Stunden. Laeuft es dann nicht, gilt die Antwort als negativ — weitere Zeit hier ist schlecht investiert, weil der native Weg ohnehin fuer die Fotoerkennung gebraucht wird.

- [ ] **Schritt 4: Ergebnis festhalten**

`docs/superpowers/spikes/2026-08-12-pdf-text.md` anlegen mit: Ergebnis (ja/nein), verwendete Bibliothek und Version, noetige Polyfills, Fehlermeldungen bei Misserfolg, und die Empfehlung fuer Task 4 — entweder `pdfjs-dist` mit den genannten Polyfills oder ein natives Modul samt Development Build.

- [ ] **Schritt 5: Aufraeumen und committen**

```bash
rm -rf spike-pdf
git checkout -- "app/(tabs)/(more)/lab.jsx"
git add docs/superpowers/spikes/2026-08-12-pdf-text.md
git commit -m "docs(spike): PDF-Textextraktion in React Native geprueft"
```

---

### Task 2: Synonyme in den Markerkatalog

Der Parser muss "25-OH-Vitamin D3", "Vitamin D" und "Calcidiol" auf denselben Marker abbilden. Diese Namen sind Katalogwissen und gehoeren zu den Daten, nicht in die Parser-Logik — genauso haelt es `data/substances.js` mit den Wirkstoff-Synonymen.

**Files:**
- Modify: `data/labMarkers.js:32-52`
- Test: `tests/lab-report-parser.test.mjs` (in Task 3 angelegt; hier nur die Datenpflege)

**Interfaces:**
- Consumes: nichts
- Produces: `LAB_MARKERS[].synonyms: string[]` — der Parser in Task 3 liest dieses Feld

- [ ] **Schritt 1: Synonyme ergaenzen**

Jeder Eintrag in `LAB_MARKERS` erhaelt ein Feld `synonyms`. Der eigene Klarname muss nicht enthalten sein, den prueft der Parser separat. Alle Schreibweisen kleingeschrieben, weil der Vergleich normalisiert erfolgt.

```js
{ id: 'ferritin', labelKey: 'lab.marker.ferritin', commonUnit: 'µg/l', relatedSubstanceId: 'iron',
  synonyms: ['ferritin', 'serum-ferritin', 'ferritin im serum'] },
{ id: 'hemoglobin', labelKey: 'lab.marker.hemoglobin', commonUnit: 'g/dl', relatedSubstanceId: 'iron',
  synonyms: ['hb', 'haemoglobin', 'hämoglobin', 'hgb'] },
{ id: 'vitamin-d-25oh', labelKey: 'lab.marker.vitaminD', commonUnit: 'ng/ml', relatedSubstanceId: 'vitamin-d3',
  synonyms: ['25-oh-vitamin d', '25-oh-vitamin d3', '25-oh-d3', 'vitamin d', 'calcidiol', '25-hydroxyvitamin d'] },
{ id: 'vitamin-b12', labelKey: 'lab.marker.vitaminB12', commonUnit: 'pg/ml', relatedSubstanceId: 'vitamin-b12',
  synonyms: ['vitamin b12', 'b12', 'cobalamin', 'vit. b12'] },
{ id: 'holo-tc', labelKey: 'lab.marker.holoTC', commonUnit: 'pmol/l', relatedSubstanceId: 'vitamin-b12',
  synonyms: ['holo-tc', 'holotranscobalamin', 'holo-transcobalamin', 'aktives b12'] },
{ id: 'folate', labelKey: 'lab.marker.folate', commonUnit: 'ng/ml', relatedSubstanceId: 'folate',
  synonyms: ['folsäure', 'folsaeure', 'folat', 'folate'] },
{ id: 'magnesium', labelKey: 'lab.marker.magnesium', commonUnit: 'mmol/l', relatedSubstanceId: 'magnesium',
  synonyms: ['magnesium', 'mg im serum', 'magnesium im serum'] },
{ id: 'zinc', labelKey: 'lab.marker.zinc', commonUnit: 'µg/dl', relatedSubstanceId: 'zinc',
  synonyms: ['zink', 'zinc'] },
{ id: 'selenium', labelKey: 'lab.marker.selenium', commonUnit: 'µg/l', relatedSubstanceId: 'selenium',
  synonyms: ['selen', 'selenium'] },
{ id: 'calcium', labelKey: 'lab.marker.calcium', commonUnit: 'mmol/l', relatedSubstanceId: 'calcium',
  synonyms: ['calcium', 'kalzium', 'ca im serum'] },
{ id: 'tsh', labelKey: 'lab.marker.tsh', commonUnit: 'mU/l', relatedSubstanceId: 'iodine',
  synonyms: ['tsh', 'tsh basal', 'thyreotropin'] },
{ id: 'crp', labelKey: 'lab.marker.crp', commonUnit: 'mg/l', relatedSubstanceId: null,
  synonyms: ['crp', 'c-reaktives protein', 'c reaktives protein'] },
{ id: 'hba1c', labelKey: 'lab.marker.hba1c', commonUnit: '%', relatedSubstanceId: null,
  synonyms: ['hba1c', 'hba1c ifcc', 'langzeitzucker'] },
{ id: 'ldl', labelKey: 'lab.marker.ldl', commonUnit: 'mg/dl', relatedSubstanceId: null,
  synonyms: ['ldl', 'ldl-cholesterin', 'ldl cholesterin'] },
{ id: 'hdl', labelKey: 'lab.marker.hdl', commonUnit: 'mg/dl', relatedSubstanceId: null,
  synonyms: ['hdl', 'hdl-cholesterin', 'hdl cholesterin'] },
{ id: 'triglycerides', labelKey: 'lab.marker.triglycerides', commonUnit: 'mg/dl', relatedSubstanceId: null,
  synonyms: ['triglyceride', 'triglyzeride', 'tg'] },
{ id: 'creatinine', labelKey: 'lab.marker.creatinine', commonUnit: 'mg/dl', relatedSubstanceId: null,
  synonyms: ['kreatinin', 'creatinin', 'creatinine'] },
{ id: 'alt-gpt', labelKey: 'lab.marker.altGpt', commonUnit: 'U/l', relatedSubstanceId: null,
  synonyms: ['alt', 'gpt', 'alt (gpt)', 'alanin-aminotransferase'] },
{ id: 'other', labelKey: 'lab.marker.other', commonUnit: '', relatedSubstanceId: null,
  synonyms: [] },
```

- [ ] **Schritt 2: Kommentar im Dateikopf ergaenzen**

Unter den vorhandenen Erklaerungen in `data/labMarkers.js`:

```js
/**
 * SYNONYME:
 * Jeder Marker fuehrt die Schreibweisen, unter denen er auf Befunden
 * auftaucht. Labore benennen denselben Wert unterschiedlich: "25-OH-Vitamin
 * D3", "Calcidiol" und "Vitamin D" meinen dasselbe. Die Liste gehoert zu
 * den Daten und nicht in den Parser, genau wie die Wirkstoff-Synonyme in
 * data/substances.js.
 *
 * Alles kleingeschrieben: Der Abgleich normalisiert vorher.
 */
```

- [ ] **Schritt 3: Pruefen, dass nichts kaputt ist**

```bash
npm test
```
Erwartet: ALLE TESTS BESTANDEN. `labMarkers.js` wird von `lab.jsx` und `tests/lab-export.test.mjs` genutzt; ein zusaetzliches Feld darf dort nichts aendern.

- [ ] **Schritt 4: Commit**

```bash
git add data/labMarkers.js
git commit -m "feat(lab): Synonyme je Labormarker im Katalog"
```

---

### Task 3: Der Parser

Das Herzstueck. Bekommt Rohtext, liefert Kandidaten. Keine Datei, keine Kamera, kein Screen — dadurch vollstaendig mit Textmustern testbar.

**Files:**
- Create: `LabReportParser.js`
- Create: `tests/lab-report-parser.test.mjs`

**Interfaces:**
- Consumes: `LAB_MARKERS` aus `data/labMarkers.js` (Task 2), Feld `synonyms`
- Produces:
  - `parseLabReport(text: string) => { measuredAt: string | null, candidates: Candidate[] }`
  - `Candidate = { markerId: string | null, rawName: string, value: number, unit: string, referenceMin: number | null, referenceMax: number | null }`
  - `matchMarker(name: string) => string | null`

Die Feldnamen `referenceMin` und `referenceMax` sind bewusst so gewaehlt: `createLabValue` in `LabValues.js:58-59` erwartet genau diese, der Screen kann den Kandidaten damit unveraendert durchreichen.

- [ ] **Schritt 1: Den fehlschlagenden Test schreiben**

`tests/lab-report-parser.test.mjs`:

```js
/**
 * tests/lab-report-parser.test.mjs
 * ─────────────────────────────────────────────────────────────
 * Prueft, dass aus Befundtext Werte werden — und vor allem, dass nichts
 * erfunden wird.
 *
 * Ein falsch zugeordneter Laborwert ist schlimmer als ein fehlender: Er
 * landet unbemerkt in der Historie und steht spaeter im Bericht fuer die
 * Praxis. Deshalb prueft die Haelfte der Faelle hier, dass der Parser
 * schweigt, wo er unsicher ist.
 */

import { matchMarker, parseLabReport } from '../LabReportParser.js';

let failed = 0;
function check(name, cond, extra = '') {
  if (cond) { console.log(`  ok   ${name}`); }
  else { console.log(`  FAIL ${name} ${extra}`); failed++; }
}

console.log('\n— Marker erkennen —');
check('Klarname', matchMarker('Ferritin') === 'ferritin');
check('Synonym', matchMarker('25-OH-Vitamin D3') === 'vitamin-d-25oh');
check('Gross- und Kleinschreibung egal', matchMarker('tsh') === 'tsh');
check('Unbekannter Name ergibt null', matchMarker('Xanthopterin') === null);
check('Leerer Name ergibt null', matchMarker('') === null);

console.log('\n— Wertzeilen —');
const einfach = parseLabReport('Ferritin 45 ng/ml 30 - 300');
check('Eine Zeile ergibt einen Kandidaten', einfach.candidates.length === 1, einfach.candidates.length);
check('Marker zugeordnet', einfach.candidates[0].markerId === 'ferritin');
check('Wert gelesen', einfach.candidates[0].value === 45, einfach.candidates[0].value);
check('Einheit gelesen', einfach.candidates[0].unit === 'ng/ml', einfach.candidates[0].unit);
check('Referenz-Untergrenze', einfach.candidates[0].referenceMin === 30);
check('Referenz-Obergrenze', einfach.candidates[0].referenceMax === 300);

console.log('\n— Deutsche Zahlenschreibweise —');
const komma = parseLabReport('25-OH-Vitamin D 18,4 ng/ml 30 - 70');
check('Komma als Dezimaltrennzeichen', komma.candidates[0].value === 18.4, komma.candidates[0].value);

console.log('\n— Referenzbereiche in drei Schreibweisen —');
check('Bis-Form', parseLabReport('TSH 2,1 mU/l 0,4 bis 4,0').candidates[0].referenceMax === 4);
check('Kleiner-als-Form: keine Untergrenze',
  parseLabReport('CRP 2 mg/l < 5').candidates[0].referenceMin === null);
check('Kleiner-als-Form: Obergrenze',
  parseLabReport('CRP 2 mg/l < 5').candidates[0].referenceMax === 5);
check('Groesser-als-Form: Untergrenze',
  parseLabReport('HDL 62 mg/dl > 40').candidates[0].referenceMin === 40);
check('Groesser-als-Form: keine Obergrenze',
  parseLabReport('HDL 62 mg/dl > 40').candidates[0].referenceMax === null);

console.log('\n— Fehlender Referenzbereich bleibt leer —');
const ohne = parseLabReport('Zink 95 µg/dl');
check('Keine Untergrenze erfunden', ohne.candidates[0].referenceMin === null);
check('Keine Obergrenze erfunden', ohne.candidates[0].referenceMax === null);

console.log('\n— Unbekannter Marker wird angeboten, nicht verschwiegen —');
const fremd = parseLabReport('Xanthopterin 12 µg/l');
check('Kandidat entsteht trotzdem', fremd.candidates.length === 1);
check('Marker bleibt offen', fremd.candidates[0].markerId === null);
check('Rohname bleibt erhalten', fremd.candidates[0].rawName === 'Xanthopterin');

console.log('\n— Messdatum —');
const mitDatum = parseLabReport('Laborbefund vom 05.08.2026\nFerritin 45 ng/ml');
check('Datum aus dem Kopf', mitDatum.measuredAt === '2026-08-05', mitDatum.measuredAt);
check('Ohne Datum bleibt es null', parseLabReport('Ferritin 45 ng/ml').measuredAt === null);

console.log('\n— Was keine Wertzeile ist, wird ignoriert —');
const rauschen = parseLabReport(
  'Praxis Dr. Sommer\nMusterstrasse 1\n12345 Musterstadt\nBefund fuer: Anna Muster\nFerritin 45 ng/ml'
);
check('Nur die Wertzeile zaehlt', rauschen.candidates.length === 1, rauschen.candidates.length);
check('Keine Adresse als Wert', !rauschen.candidates.some((c) => c.rawName.includes('Musterstadt')));

console.log('\n— Grenzfaelle —');
check('Leerer Text', parseLabReport('').candidates.length === 0);
check('Nur Fliesstext', parseLabReport('Die Werte sind unauffaellig.').candidates.length === 0);
check('null als Eingabe', parseLabReport(null).candidates.length === 0);

console.log(`\n${failed === 0 ? 'ALLE TESTS BESTANDEN' : failed + ' FEHLER'}\n`);
process.exit(failed === 0 ? 0 : 1);
```

- [ ] **Schritt 2: Test ausfuehren, Fehlschlag bestaetigen**

```bash
npm test
```
Erwartet: Fehler beim Buendeln, weil `../LabReportParser.js` nicht existiert.

- [ ] **Schritt 3: Den Parser schreiben**

`LabReportParser.js`:

```js
/**
 * LabReportParser.js
 * ─────────────────────────────────────────────────────────────
 * Macht aus dem Text eines Laborbefunds Wert-Kandidaten.
 *
 * WAS ER NICHT TUT:
 * Er bewertet nichts. Er ergaenzt keinen Referenzbereich, den der Befund
 * nicht nennt. Und er raet nicht: Was er nicht sicher zuordnet, gibt er mit
 * offenem Marker zurueck, damit die Nutzerin entscheidet.
 *
 * Der Grund ist derselbe wie beim Produktscan: Ein falsch zugeordneter Wert
 * faellt niemandem auf, landet in der Historie und steht spaeter im Bericht
 * fuer die Praxis. Ein fehlender Wert faellt sofort auf.
 *
 * Keine Dateien, keine Oberflaeche, kein Netzwerk — nur Text hinein,
 * Kandidaten heraus. Dadurch mit Textmustern pruefbar.
 */

import { LAB_MARKERS } from './data/labMarkers';

// Zeilen, die typischerweise im Briefkopf stehen und nie ein Messwert sind.
const IGNORE_PATTERNS = [
  /befund/i, /praxis/i, /labor(?!wert)/i, /stra(ss|ß)e/i, /^\d{5}\s/,
  /patient/i, /geb\./i, /telefon/i, /seite \d/i,
];

/** Vergleichsform: Kleinschreibung, Mehrfachleerzeichen weg. */
function normalize(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Deutsche Zahl ("18,4") zu Number. null, wenn es keine Zahl ist. */
function toNumber(raw) {
  const text = String(raw ?? '').trim().replace(',', '.');
  if (!text) return null;
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

/**
 * matchMarker(name)
 * Ordnet einen Namen einem Marker zu. Prueft den Klarnamen-Teil der ID und
 * die gepflegten Synonyme. Kein Treffer heisst null — nicht 'other', denn
 * 'other' waere eine Behauptung.
 */
export function matchMarker(name) {
  const needle = normalize(name);
  if (!needle) return null;

  for (const marker of LAB_MARKERS) {
    if (marker.id === 'other') continue;
    const synonyms = Array.isArray(marker.synonyms) ? marker.synonyms : [];
    if (synonyms.some((synonym) => normalize(synonym) === needle)) return marker.id;
  }
  return null;
}

/** Referenzbereich aus dem Zeilenrest lesen. Fehlt er, bleibt beides null. */
function parseReference(rest) {
  const spanne = rest.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|bis)\s*(\d+(?:[.,]\d+)?)/i);
  if (spanne) {
    return { referenceMin: toNumber(spanne[1]), referenceMax: toNumber(spanne[2]) };
  }
  const kleiner = rest.match(/[<≤]\s*(\d+(?:[.,]\d+)?)/);
  if (kleiner) return { referenceMin: null, referenceMax: toNumber(kleiner[1]) };

  const groesser = rest.match(/[>≥]\s*(\d+(?:[.,]\d+)?)/);
  if (groesser) return { referenceMin: toNumber(groesser[1]), referenceMax: null };

  return { referenceMin: null, referenceMax: null };
}

/** Messdatum aus dem Kopf (TT.MM.JJJJ) als ISO-Datum. */
function parseMeasuredAt(text) {
  const treffer = String(text ?? '').match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!treffer) return null;
  const [, tag, monat, jahr] = treffer;
  return `${jahr}-${monat}-${tag}`;
}

/**
 * parseLabReport(text)
 * Rueckgabe: { measuredAt, candidates }
 */
export function parseLabReport(text) {
  const zeilen = String(text ?? '').split(/\r?\n/);
  const candidates = [];

  for (const zeile of zeilen) {
    const trimmed = zeile.trim();
    if (!trimmed) continue;
    if (IGNORE_PATTERNS.some((pattern) => pattern.test(trimmed))) continue;

    // Name, Zahl, optionale Einheit, Rest. Der Name ist alles vor der
    // ersten freistehenden Zahl.
    const treffer = trimmed.match(
      /^([A-Za-zÄÖÜäöüß0-9().\-\s]*?[A-Za-zÄÖÜäöüß)])\s+(\d+(?:[.,]\d+)?)\s*([A-Za-zµ%/]+(?:\/[A-Za-zµ]+)?)?\s*(.*)$/
    );
    if (!treffer) continue;

    const [, rawName, rohWert, rohEinheit, rest] = treffer;
    const value = toNumber(rohWert);
    if (value === null) continue;

    candidates.push({
      markerId: matchMarker(rawName),
      rawName: rawName.trim(),
      value,
      unit: (rohEinheit ?? '').trim(),
      ...parseReference(rest ?? ''),
    });
  }

  return { measuredAt: parseMeasuredAt(text), candidates };
}
```

- [ ] **Schritt 4: Test ausfuehren, gruen bestaetigen**

```bash
npm test
```
Erwartet: ALLE TESTS BESTANDEN. Schlaegt ein Fall fehl, den regulaeren Ausdruck an diesem Fall anpassen, nicht den Test abschwaechen.

- [ ] **Schritt 5: Commit**

```bash
git add LabReportParser.js tests/lab-report-parser.test.mjs
git commit -m "feat(lab): Parser fuer Befundtext, mit Tests gegen echte Muster"
```

---

### Task 4: Text aus dem PDF holen

**Files:**
- Create: `LabReportText.js`

**Interfaces:**
- Consumes: das Ergebnis von Task 1 (welche Bibliothek, welche Polyfills)
- Produces: `extractPdfText(uri: string) => Promise<string>`, wirft `Error` mit uebersetzbarer Kennung bei Misserfolg

> **Abhaengig von Task 1.** Faellt der Spike negativ aus, wird dieser Task auf ein natives Modul umgeschrieben und braucht einen Development Build. Der Rest des Plans bleibt unveraendert, weil `LabReportParser` nur Text sieht.

- [ ] **Schritt 1: Modul anlegen**

```js
/**
 * LabReportText.js
 * ─────────────────────────────────────────────────────────────
 * Holt den Rohtext aus einer Befunddatei. Kennt keine Laborwerte — was
 * der Text bedeutet, entscheidet LabReportParser.
 *
 * Alles laeuft auf dem Geraet: kein Upload, kein Netzwerkzugriff, keine
 * Zwischenspeicherung. Der Text lebt so lange wie der Import-Vorgang.
 */

import * as FileSystem from 'expo-file-system/legacy';

/** Kennungen statt fertiger Saetze: Die Oberflaeche uebersetzt sie. */
export const LAB_TEXT_ERROR = {
  UNREADABLE: 'lab.import.error.unreadable',
  NO_TEXT_LAYER: 'lab.import.error.noTextLayer',
};

export async function extractPdfText(uri) {
  let base64;
  try {
    base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  } catch {
    throw new Error(LAB_TEXT_ERROR.UNREADABLE);
  }

  const text = await extractFromBase64(base64);

  // Ein reiner Scan liefert eine Textebene ohne Inhalt. Das ist kein
  // Fehler der Datei, sondern ein Fall fuer den spaeteren Foto-Weg —
  // und die Nutzerin soll das erfahren, statt eine leere Liste zu sehen.
  if (!text || text.trim().length < 10) {
    throw new Error(LAB_TEXT_ERROR.NO_TEXT_LAYER);
  }
  return text;
}
```

`extractFromBase64` mit der in Task 1 bestaetigten Bibliothek implementieren. Bei `pdfjs-dist`: Base64 zu `Uint8Array`, `getDocument({ data, useWorkerFetch: false, isEvalSupported: false })`, ueber alle Seiten `getTextContent()`, Items mit Leerzeichen verbinden, Seiten mit `\n` trennen. Die in Task 1 ermittelten Polyfills vor dem Import setzen.

- [ ] **Schritt 2: Am Geraet pruefen**

App starten, ein PDF waehlen, den extrahierten Text per `console.log` im Metro-Log gegenlesen. Erwartet: Die Wertzeilen sind vollstaendig und in Lesereihenfolge.

- [ ] **Schritt 3: Commit**

```bash
git add LabReportText.js
git commit -m "feat(lab): PDF-Text lokal auslesen"
```

---

### Task 5: Bestaetigungs-Oberflaeche

**Files:**
- Create: `app/(tabs)/(more)/lab-import.jsx`
- Modify: `app/(tabs)/(more)/_layout.jsx`
- Modify: `app/(tabs)/(more)/lab.jsx`
- Modify: `i18n/de/lab.js`, `i18n/en/lab.js`

**Interfaces:**
- Consumes: `parseLabReport`, `extractPdfText`, `LAB_TEXT_ERROR`, `addLabValue` aus dem Store
- Produces: Route `/lab-import`

- [ ] **Schritt 1: Texte anlegen**

In `i18n/de/lab.js`:

```js
'lab.import.title': 'Befund einlesen',
'lab.import.intro': 'Wähle die PDF-Datei deines Laborbefunds. Sie wird auf diesem Gerät ausgewertet und nicht gespeichert.',
'lab.import.pick': 'PDF auswählen',
'lab.import.reading': 'Befund wird gelesen …',
'lab.import.foundTitle_one': 'Ein Wert gefunden',
'lab.import.foundTitle_other': '{count} Werte gefunden',
'lab.import.foundText': 'Prüfe die Zuordnung, bevor du übernimmst. Offene Einträge stehen oben.',
'lab.import.openMarker': 'Kein Marker zugeordnet',
'lab.import.dateLabel': 'Messdatum',
'lab.import.dateMissing': 'Im Befund stand kein Datum. Trag es ein, bevor du übernimmst.',
'lab.import.confirm': 'Ausgewählte übernehmen',
'lab.import.nothing': 'In dieser Datei standen keine erkennbaren Werte.',
'lab.import.error.unreadable': 'Die Datei ließ sich nicht öffnen.',
'lab.import.error.noTextLayer': 'Diese PDF enthält nur ein Bild, keinen lesbaren Text. Das kommt bei eingescannten Befunden vor.',
'lab.import.savedTitle': 'Übernommen',
'lab.import.savedMessage_one': 'Ein Wert steht jetzt in deiner Laborhistorie.',
'lab.import.savedMessage_other': '{count} Werte stehen jetzt in deiner Laborhistorie.',
```

In `i18n/en/lab.js` dieselben Schluessel. Keine Gedankenstriche, keine Verbotswoerter (`recommended`, `you should`):

```js
'lab.import.title': 'Read a report',
'lab.import.intro': 'Pick the PDF of your lab report. It is processed on this device and not stored.',
'lab.import.pick': 'Choose PDF',
'lab.import.reading': 'Reading the report …',
'lab.import.foundTitle_one': 'One value found',
'lab.import.foundTitle_other': '{count} values found',
'lab.import.foundText': 'Check the assignment before you apply. Open entries come first.',
'lab.import.openMarker': 'No marker assigned',
'lab.import.dateLabel': 'Measurement date',
'lab.import.dateMissing': 'The report carried no date. Add it before applying.',
'lab.import.confirm': 'Apply selected',
'lab.import.nothing': 'This file contained no readable values.',
'lab.import.error.unreadable': 'The file could not be opened.',
'lab.import.error.noTextLayer': 'This PDF holds only an image, no readable text. That happens with scanned reports.',
'lab.import.savedTitle': 'Applied',
'lab.import.savedMessage_one': 'One value is now in your lab history.',
'lab.import.savedMessage_other': '{count} values are now in your lab history.',
```

- [ ] **Schritt 2: Schluesselzahl pruefen**

```bash
for f in de en; do grep -c "^  '" i18n/$f/lab.js; done
```
Erwartet: zweimal dieselbe Zahl.

- [ ] **Schritt 3: Screen anlegen**

`app/(tabs)/(more)/lab-import.jsx`. Aufbau: Zustand fuer `candidates`, `selectedIndexes` (Set, anfangs alle mit zugeordnetem Marker), `measuredAt`, `isReading`, `error`.

Ablauf: `DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true })` → `extractPdfText(uri)` → `parseLabReport(text)` → Kandidaten sortieren, offene zuerst → Liste rendern.

Je Kandidat eine Zeile mit: Auswahlkaestchen, Markername oder `lab.import.openMarker`, Wert mit Einheit, Referenzbereich falls vorhanden. Offene Eintraege bekommen den Ton aus `toneFor('caution')`, damit sie auffallen, ohne zu alarmieren.

Uebernahme: je ausgewaehltem Kandidaten ein Aufruf

```js
addLabValue({
  markerId: candidate.markerId ?? 'other',
  customName: candidate.markerId ? '' : candidate.rawName,
  value: candidate.value,
  unit: candidate.unit,
  measuredAt: measuredAt,
  referenceMin: candidate.referenceMin,
  referenceMax: candidate.referenceMax,
});
```

Danach `Alert.alert` mit `lab.import.savedTitle` und Ruecksprung per `router.back()`.

Nur Tokens aus `theme.js` verwenden, keine Hex-Werte.

- [ ] **Schritt 4: Route registrieren**

In `app/(tabs)/(more)/_layout.jsx` neben den bestehenden Eintraegen:

```jsx
<Stack.Screen name="lab-import" options={{ title: t('lab.import.title') }} />
```

- [ ] **Schritt 5: Einstieg in lab.jsx**

Oberhalb des Erfassungsformulars ein Knopf, der `router.push('/lab-import')` aufruft, beschriftet mit `t('lab.import.title')`.

- [ ] **Schritt 6: Am Geraet pruefen**

Ein PDF mit bekannten Werten einlesen. Pruefen: Werte stimmen, offene Eintraege stehen oben, Abwaehlen wirkt, uebernommene Werte erscheinen in der Laborhistorie mit korrektem Datum.

- [ ] **Schritt 7: Commit**

```bash
git add "app/(tabs)/(more)/lab-import.jsx" "app/(tabs)/(more)/_layout.jsx" "app/(tabs)/(more)/lab.jsx" i18n/de/lab.js i18n/en/lab.js
git commit -m "feat(lab): Befund einlesen mit Bestaetigung vor der Uebernahme"
```

---

### Task 6: Datenschutzerklaerung nachziehen

Es fliessen keine Daten nach aussen. Genau das gehoert dort hin, wo steht, was mit den Eingaben passiert — sonst fragt sich jemand zu Recht, wohin sein Befund geht.

**Files:**
- Modify: `data/legalContent.js`

**Interfaces:**
- Consumes: nichts
- Produces: nichts

- [ ] **Schritt 1: Satz ergaenzen**

Im Abschnitt zur lokalen Datenhaltung, deutsche und englische Fassung:

DE: `'Wenn du einen Laborbefund einliest, wird die Datei auf deinem Gerät ausgewertet. Weder die Datei noch der ausgelesene Text verlassen das Gerät oder werden gespeichert; übernommen werden nur die Werte, die du bestätigst.'`

EN: `'When you read in a lab report, the file is processed on your device. Neither the file nor the extracted text leaves the device or is stored; only the values you confirm are kept.'`

- [ ] **Schritt 2: PRIVACY_VERSION erhoehen**

In `data/legalContent.js:16` auf das Datum der Aenderung setzen. Dadurch wird die Kenntnisnahme erneut eingeholt.

- [ ] **Schritt 3: Drift-Test und Webseite**

```bash
npm test
npm run build:legal
```
Erwartet: Tests gruen, `web/` neu erzeugt.

- [ ] **Schritt 4: Commit**

```bash
git add data/legalContent.js web/
git commit -m "docs(legal): Einlesen von Befunden in der Datenschutzerklaerung"
```

---

## Selbstpruefung

**Abdeckung der Spezifikation:** Lokal ohne Netzwerk (Global Constraints, Task 4). Nur Laborwerte (Task 3 liefert ausschliesslich Marker, Wert, Einheit, Bereich). PDF zuerst (Tasks 1 und 4), Foto spaeter (nicht Teil dieses Plans, wie in der Spezifikation festgehalten). Dokument wird nicht abgelegt (Task 4 haelt nichts, Task 5 verwirft nach Uebernahme). Parser als eigenstaendige Einheit mit Tests (Task 3). Fehlerfaelle: keine Textebene und kein Wert gefunden in Task 4 und 5, unbekannter Marker in Task 3, fehlendes Datum in Task 5. Datenschutz-Satz (Task 6).

**Nachtrag zur Spezifikation:** Sie nennt `referenceRange` als ein Feld. Das Datenmodell in `LabValues.js:58-59` fuehrt `referenceMin` und `referenceMax` getrennt; der Plan verwendet diese Namen, damit der Kandidat unveraendert an `addLabValue` durchgereicht werden kann. Ebenso ergaenzt der Plan die Synonyme im Markerkatalog (Task 2), ohne die kein Abgleich moeglich waere.

**Typkonsistenz:** `matchMarker` liefert `string | null`, wird in `parseLabReport` fuer `markerId` verwendet, dort ebenfalls `string | null`; der Screen setzt bei `null` auf `'other'` und fuellt `customName`. `referenceMin`/`referenceMax` sind durchgaengig `number | null`. `extractPdfText` liefert `Promise<string>` und wirft `Error` mit einer Kennung aus `LAB_TEXT_ERROR`, die der Screen als Uebersetzungsschluessel verwendet.

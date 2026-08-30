# Praeparat aufnehmen in zwei Fragen

Stand: 2026-08-30. Entwurf aus Nadines Rueckmeldung vom Geraetetest
(13:19): "viel zu kompliziert, sein Praeparat einzutragen ... soviel zu
lesen, dass ich ueberhaupt nicht weiss, was ich machen soll".

## Ist

Ein Katalogprodukt aus der Suche laeuft heute durch drei Screens:
Produktzeile antippen → `(scan)/results.jsx` (Wirkstoffprofile, 21
Textbloecke, Knopf "Pruefen") → `app/AddSupplement.jsx` (895 Zeilen:
Hero-Karte, Pruefhinweis-Karte, elf Felder mit je einem Erklaersatz,
sechs Slot-Chips, Kur-Zyklus). Dasselbe Formular bedient Foto-Scan,
manuelle Eingabe und Bearbeiten. Bei einem Katalogprodukt kennt die App
Name, Menge, Einheit, Form und Inhaltsstoffe bereits; offen sind genau
zwei Fragen (wie oft, wann), und die stellt das Formular nicht erkennbar.

## Ziel

Katalog → Tagesplan in vier Handgriffen: Suchen, Produkt antippen, zwei
Chips, ein Knopf. Foto-Scan und manuelle Eingabe nutzen denselben Screen.
Alles, was die App schon weiss, steht als Produktkarte oben; alles, was
nicht fuer den Tagesplan noetig ist, ist eingeklappt.

## Sieben Entscheidungen

### 1. Ein Screen "Aufnehmen" ersetzt das Formular, fuer alle vier Einstiege

`app/AddSupplement.jsx` wird neu geschrieben (Route bleibt, die
Bearbeiten-Links in Bestand und Tagesplan zeigen darauf). Aufbau von oben
nach unten:

1. **Produktkarte**: Name, Marke, "1 Kapsel = 150 mg Magnesium
   (Bisglycinat)" aus `ingredientDetails`. Rechts "Aendern" (klappt Name,
   Menge, Einheit als Felder auf). Beim Foto-Scan steht darueber eine
   Zeile "Aus dem Etikett erkannt, bitte pruefen" (`type.small`), sonst
   nichts.
2. **Frage 1 "Wie oft am Tag?"**: Chips 1x / 2x / 3x, Standard 1x.
3. **Frage 2 "Wann?"**: Slot-Chips (`SLOT_ORDER` aus TimingEngine, ohne
   Emojis), vorausgewaehlt nach Vorschlag (Entscheidung 3). Darunter eine
   Zeile Begruendung mit Quellenkuerzel, oder "Standard: morgens.
   Jederzeit aenderbar." Bei 2x/3x sind entsprechend viele Slots
   vorausgewaehlt; die Nutzerin kann abwaehlen und andere waehlen,
   Mindestzahl = 1.
4. **"Mehr Angaben"** (eingeklappt): Packungsinhalt, Kaufpreis,
   Kur-Zyklus (an/aus, Einnahme-/Pausentage), Notiz. Ziel/Kontext,
   Kategorie, Timing-Anzeige und Familienhinweis entfallen aus dem
   Formular; bestehende Werte bleiben im Datensatz erhalten
   (`purpose`, `category`, `timingRaw`, `childSafe` werden beim
   Bearbeiten unveraendert durchgereicht, beim Anlegen mit den heutigen
   Defaults belegt).
5. **Knopf "Zum Tagesplan hinzufuegen"** (beim Bearbeiten "Speichern"),
   feste Leiste unten wie heute. Danach `router.replace('/Dashboard')`
   ohne Alert; der neue Eintrag ist im Tagesplan sichtbar, das ist die
   Bestaetigung.

Die Hero-Karte, die Modus-Pille, die Pruefhinweis-Karte und die
Erklaersaetze unter jedem Feld fallen weg.

### 2. Katalogprodukt springt direkt auf "Aufnehmen"

`handlePickCatalogProduct` in `search.jsx` (und derselbe Pfad in
`brands.jsx` und der Namenssuche des Scanners) setzt weiterhin den
Scan-Entwurf (`seedEntryToScanDraft` → `pendingScanResult`), navigiert
aber direkt nach `/AddSupplement?fromScan=1`. `results.jsx` bleibt der
Pruef-Screen fuer Foto-Scans (dort ist die Wirkstoff-Uebersicht die
Kontrolle, ob das Etikett richtig gelesen wurde) und fuer den
Barcode-Pfad; sein Knopf fuehrt wie heute auf "Aufnehmen".

### 3. Die App schlaegt den Zeitpunkt vor, nur aus belegten Regeln

Neu `SlotSuggestion.js` (rein, Node-testbar):

```
suggestSlots({ substanceIds, timesPerDay }) =>
  { slots: string[], reason: { key, substanceId, sources } | null }
```

Regeln in fester Prioritaet, erste greift:

| Quelle | Bedingung | Vorschlag (1x) | reason.key |
|---|---|---|---|
| `INTAKE_GUIDANCE` (data/interactions.js) | iron | `fasted` | `guidance` (Text = note, Quelle = sources) |
| `INTAKE_GUIDANCE` | melatonin | `evening` | `guidance` |
| `INTAKE_GUIDANCE` | caffeine | `morning` | `guidance` |
| `substances.js` | eine Substanz `fatSoluble: true` | `morning` | `fatSoluble` (Text aus i18n: "{name} ist fettloeslich und wird zu einer Mahlzeit besser aufgenommen", Quelle = sources der Substanz) |
| keine | | `morning` | `null` |

Die Zuordnung Substanz → Slot steht als Tabelle im Modul mit Kommentar,
welcher Satz der Regel sie traegt; sie ist keine neue Fachaussage,
sondern die Uebersetzung eines belegten Satzes in einen Slot. psyllium
und creatine haben Hinweise ohne Zeitpunkt (viel trinken, Zeitpunkt
zweitrangig) und liefern deshalb keinen Vorschlag.

Mehrfachgabe: 2x = [Vorschlag, `evening`], ist der Vorschlag `evening`
dann [`morning`, `evening`]; 3x = [`morning`, `midday`, `evening`],
ist der Vorschlag `fasted` dann [`fasted`, `midday`, `evening`].

Formulierung: "Vorschlag" und deskriptiv. Nie "nimm", nie "solltest".
Ohne Regel steht "Standard: morgens. Jederzeit aenderbar." Ein Vorschlag
ist eine Voreinstellung im Formular, keine Empfehlung: Die Nutzerin
sieht die Chips und aendert mit einem Tipp.

### 4. Manuelle Eingabe: Produktkarte wird zu Feldern

Ohne Entwurf zeigt der Screen statt der Produktkarte drei Eingaben: Name
(Pflicht), Menge (Zahl) und Einheit als Chips (Kapsel, Tablette, mg,
Tropfen, ml, Portion; "andere" als Freitext). Dann dieselben zwei Fragen.
`ingredientDetails` wird wie heute aus Name/Menge/Einheit abgeleitet,
damit Matcher und Slot-Vorschlag den Namen versuchen koennen.

### 5. Bearbeiten: derselbe Screen, vorausgefuellt

`?editId=` fuellt Produktkarte, Haeufigkeit (aus Anzahl `timingSlots`),
Slots und "Mehr Angaben" (aufgeklappt, wenn dort Werte stehen). Kein
Vorschlag beim Bearbeiten, die gespeicherten Slots gelten.

### 6. Die Free-Grenze bleibt

Die Pruefung auf die 5-Praeparate-Grenze (`Entitlements`) und der
Paywall-Hinweis bleiben wie heute vor dem Speichern.

### 7. Was die Karte "Ersteinrichtung" bekommt

Nichts Neues; sie fuehrt weiter auf Scannen/Suchen/Manuell. Mit Schritt 2
dieser Spec ist "Suchen → Produkt → zwei Chips → Knopf" der kuerzeste Weg.

## Architektur

```
SlotSuggestion.js              neu, rein: suggestSlots(), SLOT_BY_GUIDANCE-Tabelle
app/AddSupplement.jsx          neu geschrieben: Produktkarte, zwei Fragen, Mehr Angaben
components/ProductSummaryCard.jsx   Produktkarte mit "Aendern"
components/FrequencyChips.jsx       1x / 2x / 3x
components/SlotChips.jsx            Slot-Auswahl ohne Emojis, mit Begruendungszeile
app/(tabs)/(discover)/search.jsx    Katalog → /AddSupplement?fromScan=1
app/(tabs)/(discover)/brands.jsx    dito
app/(tabs)/(scan)/scanner.jsx       Namenssuche dito (falls vorhanden)
i18n/de,en: addSupplement (neu, alte Schluessel raus), logic (slotSuggestion-Saetze)
```

Der Datensatz (`normalizeUserSupplement`) aendert sich nicht: `timingSlots`,
`dosage`, `ingredientDetails`, `cureConfig`, `stock` bleiben wie sie sind.
Die Kostenanalyse liest Packung/Preis weiter aus dem Bestand.

## Datenschutz und Regeln

- Keine neuen Daten, kein Server.
- Der Slot-Vorschlag zitiert nur Saetze, die in `data/interactions.js`
  oder `data/substances.js` mit Quelle stehen. Ein Test prueft, dass
  jede Zeile der Zuordnungstabelle auf eine existierende Regel mit
  `sources` zeigt.
- Keine Gedankenstriche in Nutzertexten, keine Hex-Werte, Fachlogik
  (Vorschlag, Slot-Ableitung aus Haeufigkeit) nur in `SlotSuggestion.js`.
- EN-Parity fuer alle neuen i18n-Schluessel (Test besteht).

## Testing

- `tests/slot-suggestion.test.mjs`: iron → fasted mit Quelle; melatonin →
  evening; Vitamin D (fatSoluble) → morning mit Begruendung; Magnesium →
  morning ohne reason; 2x/3x-Ableitung inkl. Sonderfaelle; Tabelle zeigt
  nur auf Regeln mit sources.
- `tests/i18n.test.mjs` (bestehend): Parity, keine verwaisten Schluessel.
- Geraetetest: Magnesium suchen → Produkt antippen → Screen zeigt
  Produktkarte, 1x, Morgens vorausgewaehlt mit "Standard" → Knopf →
  Tagesplan zeigt den Eintrag unter Morgens. Eisen aus dem Katalog →
  "Nuechtern" vorausgewaehlt mit NIH-Quelle. Manuell "Vitamin D 2000 IE"
  → Morgens mit Fettloeslich-Satz.

## Abgrenzung

Nicht enthalten: Aenderungen an `results.jsx` fuer den Foto-Scan (bleibt
Pruef-Screen), Dosisvorschlaege (gibt es nicht, Projektregel),
Zeitfenster je Slot (bleibt in den Erinnerungs-Einstellungen).

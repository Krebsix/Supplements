# Suche, Bestand und Tagesplan

Stand: 2026-08-30. Entwurf aus Nadines Rueckmeldungen vom Geraetetest
(09:13, 09:28, 09:47): "wo sind die Erklaerungen", "bei Magnesium alle
Produkte sehen", "Bestand nur manuell", "Erinnerung fuers Nachfuellen".

Fuenf Teile, jeder einzeln nutzbar. Reihenfolge nach Nutzen fuer den
ersten Tag der Nutzerin.

## Ziel

Die App erklaert, warum ein Praeparat wann genommen wird, zeigt zu jedem
Wirkstoff die Produkte aus dem Katalog, bietet an jeder Stelle denselben
Einstieg fuer neue Praeparate, erinnert ans Nachfuellen, und bekommt einen
Weg, den Katalog in die Groessenordnung der Datengraph-Entscheidung zu
bringen.

## Fuenf Entscheidungen

### 1. Der Tagesplan erklaert jeden Eintrag mit einem Satz und einer Quelle

Das Wissen liegt bereits vor: `InteractionCheck.getIntakeGuidance(id)`
liefert je Wirkstoff die Einnahme-Hinweise (nuechtern, mit Fett, viel
trinken, Tageszeit) mit Quelle aus `data/interactions.js`;
`findPairInteractions` liefert Konflikte zwischen Wirkstoffen mit
Schweregrad. `TimingEngine` waehlt den Slot, begruendet ihn aber nicht.

Neu: `TimingEngine` gibt je Eintrag eine `reason` mit
(`{ key, substanceId, sourceId }`), z. B. `fat-soluble-with-meal`,
`iron-fasted`, `separated-from` (mit Partner-ID), `default-slot`. Der
Tagesplan zeigt darunter einen Satz aus i18n plus Quellenkuerzel: "Zu einer
Mahlzeit mit Fett: Vitamin D ist fettloeslich (NIH ODS)". Bei Konflikten:
"Getrennt von Magnesium, mindestens 2 Stunden (EFSA)". Antippen oeffnet das
Wirkstoff-Profil mit dem vollen Zitat.

Formulierung deskriptiv ("wird besser aufgenommen mit"), nie praeskriptiv
("nimm mit"). Ohne hinterlegte Regel steht nichts, kein Fuellsatz.

### 2. Die Suche zeigt zu jedem Wirkstoff die Produkte aus dem Katalog

Suche "Magnesium" → unter dem Wirkstoff-Profil der Abschnitt "66 Produkte
mit Magnesium": je Zeile Marke, Produkt, Menge je Portion, Form (Citrat,
Bisglycinat, Oxid), Land. Sortierung nach Marke (Standard), Menge oder Form.
Antippen uebernimmt ins Formular wie heute aus der Markenliste.

Abgleich ueber `SubstanceMatcher.matchIngredient` auf `keyIngredients`
jedes Katalogeintrags, damit "Magnesiumcitrat" und "Mg" auf denselben
Wirkstoff treffen. Neue reine Funktion
`SeedCatalog.findProductsBySubstance(substanceId) => [{ product, amount,
unit, form }]`, einmal beim Start indexiert (411 Eintraege, kein
Performance-Thema; bei 30.000 wird der Index lazy gebaut).

Keine Bewertung, kein "bestes", keine Reihung nach Preis oder Marke ausser
alphabetisch: Projektregel "keine Markenrankings".

### 3. Ein Einstieg fuer neue Praeparate, ueberall gleich

Heute fuehren Bestand und leerer Tagesplan direkt ins Formular. Neu:
`components/AddSupplementChooser.jsx` mit drei Karten "Scannen", "Suchen",
"Manuell eingeben" (dieselben Icons wie im Onboarding-Schritt "Dein erstes
Praeparat"). Eingesetzt: leerer Tagesplan, leerer Bestand, "+"-Knopf im
Bestand, Menue "Praeparat erfassen". Scannen → Scanner-Tab, Suchen →
Suche-Tab, Manuell → Formular wie heute.

### 4. Nachfuell-Erinnerung aus dem Bestand

Der Bestand kennt `currentUnits` je Praeparat und zieht bei jeder Einnahme
ab. Neu in `StockForecast.js` (rein): `daysLeft(stock, dailyUnits)` aus
Dosis und aktiven Slots; Schwelle 5 Tage (Standard, in den
Erinnerungs-Einstellungen aenderbar: 3, 5, 7, aus). Eine lokale
Benachrichtigung je Praeparat, wenn die Schwelle unterschritten wird, einmal
pro Unterschreitung (Flag im Bestand `refillNotifiedAt`), zurueckgesetzt,
wenn der Bestand wieder ueber der Schwelle liegt (Nachfuellen erfasst).
Text: "Magnesium reicht noch etwa 5 Tage." Keine Kauf-Links, kein Shop, das
waere die Grenze zur Verkaufs-App. Im Bestand steht dieselbe Zeile als
Hinweis.

Geplant ueber `NotificationScheduler` als taegliche Pruefung beim App-Start
und nach jeder Einnahme (kein Hintergrund-Job noetig; wer die App nicht
oeffnet, bekommt die Erinnerung beim naechsten Oeffnen, das ist ehrlich
genug fuer einen Bestand).

### 5. Open-Food-Facts-Import, aber erst nach der ODbL-Klaerung

Der Katalog traegt heute 48 von 411 Eintraegen aus Open Food Facts, und er
wird mit der App ausgeliefert (`data/seedProducts.json`). Damit ist die App
bereits Verbreiterin einer aus OFF abgeleiteten Datenbank. Die ODbL
verlangt dafuer Namensnennung (fehlt in App und Impressum) und Share-alike
fuer die abgeleitete Datenbank (offen, ob der ganze Katalog oder nur der
OFF-Teil betroffen ist; das entscheidet, ob der kuratierte Herstellerteil
getrennt gehalten werden muss).

Entscheidung in dieser Spec: **Zuerst die ODbL-Frage klaeren** (Nadine,
ggf. mit Rechtsrat, Kosten eine Stunde): Variante A trennt OFF-Eintraege in
eine eigene Datei `data/offProducts.json` unter ODbL mit Attribution und
haelt den Herstellerkatalog proprietaer; Variante B veroeffentlicht den
Gesamtkatalog unter ODbL (Moat weg, widerspricht der Datengraph-
Entscheidung). Empfehlung A. Erst danach der Massenimport (Kategorie
Nahrungsergaenzung, Laender DE/AT/CH, nur Eintraege mit Zutatenliste, als
`verified: false`), voraussichtlich mehrere tausend Eintraege.

Bis zur Klaerung: Attribution "Produktdaten teilweise aus Open Food Facts
(ODbL)" in Impressum, Nutzungsbedingungen (steht dort bereits) und
Landingpage-Footer. Das ist Teil dieser Spec, der Import selbst nicht.

## Architektur

```
TimingEngine.js          + reason je Eintrag ({ key, substanceId, sourceId, partnerId })
InteractionCheck.js      unveraendert (liefert Hinweise und Quellen)
SeedCatalog.js           + findProductsBySubstance(substanceId), + buildSubstanceIndex()
StockForecast.js         neu, rein: daysLeft, shouldNotifyRefill
NotificationScheduler.js + scheduleRefillReminders(stocks, supplements, threshold)
useNotificationStore.js  + refillThresholdDays (5 | 3 | 7 | 0)
useStore.js              + stock.refillNotifiedAt
components/
  AddSupplementChooser.jsx   drei Karten, ueberall gleich
  SlotReason.jsx             Satz + Quellenkuerzel, antippbar
app/(tabs)/(today)/Dashboard.jsx   SlotReason je Eintrag, Chooser im Leerzustand
app/(tabs)/(today)/inventory.jsx   Chooser, Nachfuell-Zeile
app/(tabs)/(discover)/search.jsx   Produktliste je Wirkstoff mit Sortierung
app/(tabs)/(more)/notifications.jsx  Schwelle fuer Nachfuellen
i18n/de,en: logic (reason-Saetze), search, inventory, notifications, dashboard
data/legalContent.js     Impressum: OFF-Attribution
```

## Datenschutz und Regeln

- Nachfuell-Erinnerungen sind lokal wie alle Erinnerungen; keine neuen
  Daten am Server.
- Erklaerungssaetze zitieren nur Regeln, die in `data/interactions.js`
  bzw. `substances.js` mit Quelle stehen; ein Test prueft, dass jeder
  `reason.key` einen i18n-Satz und jede Regel eine Quelle hat.
- Produktliste je Wirkstoff: keine Reihung nach Preis, keine Hervorhebung,
  keine Shop-Links.
- Nachfuell-Hinweis: "reicht noch etwa 5 Tage", nie "jetzt nachkaufen".

## Testing

- `tests/timing-engine.test.mjs` erweitert: reason je Eintrag fuer
  fettloeslich, Eisen nuechtern, Trennung bei Konflikt, Default.
- `tests/seed-catalog.test.mjs` erweitert: findProductsBySubstance
  ('magnesium') liefert 66, Form und Menge korrekt, Synonyme treffen.
- `tests/stock-forecast.test.mjs` neu: daysLeft mit Dosis 1x, 2x, ohne
  Bestand (null), Schwelle, einmalige Benachrichtigung, Reset nach
  Nachfuellen.
- Reason-Vollstaendigkeits-Test: jeder reason.key hat i18n DE/EN.
- Geraetetest: Magnesium suchen, Produkt uebernehmen, Tagesplan zeigt
  Erklaerung, Bestand auf 3 setzen, Erinnerung kommt beim naechsten Start.

## Abgrenzung

Nicht enthalten: der OFF-Massenimport selbst (nach ODbL-Klaerung eigener
Plan), Formula Versioning und Evidence Graph (Datengraph-Roadmap),
Preisvergleich, Kauf-Links.

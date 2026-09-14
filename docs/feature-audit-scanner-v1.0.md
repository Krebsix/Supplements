# Feature Audit: Scanner und Produkterkennung

Stand: 2026-09-14. Geprüfter Entwicklungsstand: Branch
`fix/cloud-backup-schutz`, Commit `0ee71f3`. Reiner Audit, nichts
implementiert.

**Beweisregel dieses Audits:** Jede Einstufung hängt an einer Datei mit
Zeilennummer, einem Testnamen oder an ausgeführtem Verhalten. Dokumente
unter `docs/` und `launch/` wurden ausdrücklich **nicht** als Nachweis
verwendet, auch nicht die eigenen. Wo ein Beleg fehlt, steht "nicht
belegbar".

## Einstufungen

| Kürzel | Bedeutung |
|---|---|
| **A** | fertig und nachgewiesen (Code plus Test oder ausgeführtes Verhalten) |
| **B** | implementiert, aber nicht praktisch geprüft (Code vorhanden, kein Test, kein Lauf) |
| **C** | nur vorbereitet (Gerüst, unbenutzter Code, Flag aus) |
| **D** | fehlt für Beta |
| **E** | vorgesehen für Version 1.0 |
| **F** | späterer Ausbau |

---

# Teil 1: Kritische Beta-Lücken

Diese fünf Punkte stehen einem Beta-Start im Weg. Sie sind nach Schwere
geordnet.

## L1. Doppelte Wirkstoffangaben verfälschen die Tagessumme (D)

**Der schwerste Befund, im echten Betrieb reproduziert.**

Ein echter Vision-Aufruf gegen die deployte Edge Function (siehe
Abschnitt 5, ausgeführt am 2026-09-14) lieferte für ein Etikett mit der
Angabe "Vitamin D3 1000 I.E. (25 µg)" **zwei Wirkstoffzeilen für
dieselbe Substanz**:

```
Vitamin D3 | 1000 | I.E. | Form: Cholecalciferol
Vitamin D3 |   25 | µg   | Form: Cholecalciferol
```

Das Modell erkennt das Problem selbst und schreibt in `uncertainties`:
"Vitamin D3 ist doppelt erfasst (1000 I.E. entspricht der Angabe 25 µg
auf dem Etikett)."

Die App reicht diesen Hinweis nur als Textwarnung durch. `StackAnalyzer`
summiert beide Zeilen. Ausgeführter Beleg (esbuild-Bundle gegen
`StackAnalyzer.js`, Lebensphase `adult-woman`):

```
Vitamin D3: total 2000-2000 IE | Positionen gezaehlt: 2 | uebersprungen: 0
referenceCheck.summary: "2000 IE liegen über dem Referenzwert von
  800 IE pro Tag, aber unter der Obergrenze von 4000 IE."
percentOfReference: 250
```

Tatsächlich enthält das Produkt 1000 IE, also 125 Prozent des
Referenzwerts. Die App nennt 250 Prozent. **Sie trifft damit eine
falsche fachliche Aussage aus einer korrekt erkannten Doppelangabe.**

Die Doppelung wird sogar erfasst: `analyzeStack` liefert sie in
`duplicates` mit beiden Quellen samt `amountText` zurück
(`StackAnalyzer.js:128-175`). Sie wird nur nicht bereinigt. Der
Kommentar `StackAnalyzer.js:148-149` beschreibt einen anderen Fall
(Doppelung ohne Referenzwert wird nicht summiert) und deckt diesen
nicht ab.

Einstufung **D**: Das trifft den Kern des Produktversprechens
(Tagessummen gegen Obergrenzen) und tritt bei jeder Doppelangabe
IE/µg auf, die auf Vitamin-D- und Vitamin-A-Etiketten der Normalfall
ist. Ohne Korrektur produziert die App reproduzierbar falsche
Referenzaussagen.

Mögliche Richtungen, nicht implementiert: gleiche `substanceId` plus
umrechenbare Einheiten als eine Position behandeln und die redundante
Zeile in `duplicates` ausweisen statt addieren; oder im Schema der
Edge Function eine Zeile je Substanz erzwingen.

## L2. Kein Kostenschutz: Paywall aus, Modell ist Opus (D)

`Entitlements.js:36` — `PAYWALL_ENFORCED = false`. `evaluateVisionScan`
liefert deshalb `allowed: true` unabhängig vom Kontingent
(`Entitlements.js:110`), zählt nur mit. Der Sperrdialog in
`scanner.jsx:360-369` ist im Produktivbetrieb unerreichbar.

Gleichzeitig ist das Standardmodell `claude-opus-5`
(`supabase/functions/analyze-supplement/index.ts:408`). Der echte
Testaufruf bestätigt das: `"model": "claude-opus-5"`, 2991 Eingabe- und
464 Ausgabe-Token für ein einzelnes kleines Etikett.

Das einzige verbleibende Bollwerk ist ein IP-Rate-Limit von 20 Anfragen
je 60 Minuten (`supabase/migrations/20260729010000_scan_rate_limit.sql`,
Prüfung `index.ts:296-339`). Pro Gerät sind das bis zu 480 Opus-Analysen
am Tag, für jede Nutzerin, kostenlos.

Eine Modell-Whitelist für billigere Modelle existiert serverseitig
(`index.ts:43-47`, nur Haiku und Sonnet), **wird vom Client aber nie
genutzt**: `ScanAnalyzer.js` sendet kein `model`-Feld
(`ScanAnalyzer.js:198-202`). Das ist Einstufung **C** für die Whitelist
und **D** für den Kostenschutz insgesamt.

## L3. Kein Freigabeweg für den Community-Cache (D)

Erfolgreiche Foto-Analysen landen automatisch mit `verified = false` im
geteilten Cache (`index.ts:535`). Ausgeliefert werden nur Einträge mit
`verified = true` (`index.ts:272`). Die Schleuse funktioniert also.

Es gibt aber **keinen Freigabeweg**: Grep über `app/`, `components/` und
die Module im Wurzelverzeichnis findet keine einzige Stelle, die
`verified` schreibt oder liest. Freigaben liefen bisher ausschließlich
über handgeschriebene SQL-Migrationen
(`fix_legacy*_verification.sql`, `fix_w8_verification.sql`,
`fix_w9b_verification.sql`). `scripts/import-dsld.mjs` importiert, prüft
aber nicht.

Folge im Beta-Betrieb: Alles, was Nutzerinnen scannen, bleibt für andere
unsichtbar, bis jemand von Hand SQL schreibt. Der Cache wächst, hilft
aber niemandem. Einstufung **D** für den Freigabeweg; die Schleuse selbst
ist **A** (siehe Abschnitt 4).

## L4. Produktsuche findet keine Produktnamen (D)

`SeedCatalog.js:68-89` enthält eine tokenbasierte Volltextsuche über
Marke und Produktname (`searchSeedCatalog`). Diese Funktion ist im
Such-Tab **nicht eingebunden**: `app/(tabs)/(discover)/search.jsx`
importiert sie nicht und durchsucht ausschließlich `data/substances.js`
(Wirkstoffe, `search.jsx:32-48`, Substring-Match ohne Fuzzy).
Katalogprodukte erscheinen dort erst, wenn die Freitextsuche auf genau
eine Substanz auflöst (`search.jsx:136`).

Wer im Such-Tab "Biogena Magnesium" eingibt, bekommt kein Ergebnis,
obwohl der Katalog das Produkt kennt. Erreichbar ist die Namenssuche nur
im Scanner-Ablauf (`scanner.jsx:219-225`).

Einstufung **D**: Der Katalog mit 2831 Einträgen ist über den
naheliegendsten Weg nicht auffindbar.

## L5. Herkunft ist nach dem Speichern verloren (D für Beta-Support)

Jedes Scan-Ergebnis trägt `analysisMode`. Am gespeicherten Präparat wird
er **nicht** festgehalten: Der Payload in `AddSupplement.jsx:335-351`
enthält kein `analysisMode`, und `normalizeUserSupplement`
(`storeLogic.js:88-108`) setzt ihn nicht ab. Es gibt nur
`source: 'scan'` und `scanResultId` (`useStore.js:355-374`) — und
`scanResultId` wird nirgends wieder gelesen (einzige Schreibstelle
`useStore.js:371`, kein lesender Treffer im Repo).

Dazu passt die zweite Lücke: `captureSummary` wird an jedes Ergebnis
gehängt (`scanner.jsx:311-326`) und persistiert (`useStore.js:47-79`),
ist aber **nirgends in der Oberfläche gerendert** (kein Treffer in
`results.jsx`, `AddSupplement.jsx`, `ExportBuilder.js`).

Folge: Bei einem Support-Fall ("warum steht da 2000 IE") lässt sich
nicht feststellen, ob der Eintrag aus einem Foto-Scan, einem
Barcode-Treffer, dem Katalog oder von Hand kam. Zusammen mit L1 ist das
die gefährliche Kombination.

---

# Teil 2: Die dreizehn Prüfbereiche

## 1. Foto-Scan und Kameraablauf — **B**

**Implementiert:** Vier Aufnahmeschritte `front/back/ingredients/dosage`
(`scanner.jsx:39-68`), alle **optional** — `canAnalyze = completedCount > 0`
(`scanner.jsx:116`), ein einzelnes Foto genügt; `missingSteps` ist nur ein
Hinweis (`scanner.jsx:117, 851-857`). Kamera-Berechtigung über
`useCameraPermissions` (`scanner.jsx:83`), Unterscheidung zwischen
"nochmal fragen" und endgültig blockiert (`scanner.jsx:118-138`), bei
Blockade `Linking.openSettings()`. Ohne Berechtigung erscheint ein
Platzhalter mit Zweckerklärung statt eines Absturzes
(`scanner.jsx:621-640`). Thumbnail je Schritt mit Wiederholung durch
erneuten Auslöser-Tipp (`scanner.jsx:269-277, 745-789`). Ein 12-Sekunden-
Wachhund gegen hängende Aufnahmen (`Promise.race`, `scanner.jsx:161-172`).

**Warum B und nicht A:** Kein Test. Es gibt keine
`tests/scanner*.test.mjs`; `npm test` (Exitcode 0, 7664 Zusicherungen,
45 Dateien, ausgeführt 2026-09-14) deckt `scanner.jsx` nicht ab. Der
Wachhund samt Kommentar deutet auf ein real beobachtetes Rennen zwischen
Barcode-Leser und Fotoaufnahme hin, das abgefangen, aber nicht behoben
ist. Eine Vollbild-Vorschau je Foto fehlt (**F**, späterer Ausbau).

## 2. Barcode-Erkennung und Open Food Facts — **A** mit zwei Mängeln

**Implementiert und getestet:** Acht Codeformate
(`scanner.jsx:610`: ean13, ean8, upc_a, upc_e, qr, code128, datamatrix,
code39). Normalisierung in `BarcodeLookup.js:48-71`: Ziffernfolgen 6-14,
PZN mit und ohne Präfix auch siebenstellig, GS1 Digital Link
(`/01/<gtin>`), führende Nullen bis EAN-8-Länge entfernt. Timeout
15 Sekunden über `AbortController` (`BarcodeLookup.js:32`). Fehlende
Nährwerte bleiben leer, keine erfundenen Werte
(`BarcodeLookup.js:231-234`).

**Test:** `tests/barcode-lookup.test.mjs`, rund 45 Zusicherungen, darunter
`extractProductCode` mit 11 Fällen, `originCountryFromTags` mit 7 Fällen
und "fehlende Felder statt erfundener Werte"
(`tests/barcode-lookup.test.mjs:129-140`). Netzzugriff im Test bewusst
blockiert.

**Mangel 1 (D):** **Kein User-Agent-Header** an Open Food Facts, weder in
`lookupBarcode` (`BarcodeLookup.js:96-100`) noch in
`searchProductsByName` (`:143-146`). Die OFF-Nutzungsrichtlinien
erwarten eine deskriptive Kennung; ohne sie besteht Sperr- und
Rate-Limit-Risiko genau dann, wenn viele Beta-Geräte gleichzeitig
scannen.

**Mangel 2 (C):** `quantity` wird von OFF angefragt
(`BarcodeLookup.js:20`), aber in `mapOffProductToScanResult`
(`:218-246`) nie gelesen — totes Feld.

## 3. Produktsuche und Seed-Katalog — **B**, Suchweg **D** (siehe L4)

**Gemessene Datenlage** (node-Skript über die JSON-Dateien,
ausgeführt 2026-09-14):

| Quelle | Produkte | mit Wirkstoffmenge | Anteil |
|---|---|---|---|
| `data/seedProducts.json` | 365 | 238 | 65,2 % |
| `data/offProducts.json` | 2466 | 968 | 39,3 % |
| **zusammen** | **2831** | **1206** | **42,6 %** |

Von 2990 erfassten Wirkstoffzeilen tragen 2989 eine Zahl (99,97 %) — wo
Mengen erfasst sind, fehlen sie praktisch nie. Aber **57,4 Prozent der
Katalogprodukte haben gar keine Wirkstoffliste**. Für die Tagessummen
sind diese Einträge wertlos; sie liefern nur Identität. Das ist
Einstufung **E** (Version 1.0): Die Abdeckung muss wachsen, bevor der
Katalog das Versprechen "Tagessummen über alles" für beliebige Produkte
hält.

**Zusammenführung und Kennzeichnung (A):** `SeedCatalog.js:24-27` merged
beide Kataloge und hängt `license: 'ODbL'` an jeden OFF-Eintrag.
Getestet in `tests/seed-catalog.test.mjs` (exakte Zahlen 365/2466/2831,
jeder OFF-Eintrag mit Lizenzfeld, keine OFF-Quellen in
`seedProducts.json`).

**Zwei verschiedene Abläufe für denselben Katalog (B):** In `search.jsx:154-158`
und `brands.jsx:36-39` springt ein Treffer direkt nach
`/AddSupplement?fromScan=1` (Begründung im Code: Katalogeinträge seien
geprüft, `SeedCatalog.js:151-153`). Im Scanner geht derselbe Katalogtreffer
über den Prüf-Screen `/results` (`scanner.jsx:234-267`). Uneinheitlich,
nicht getestet.

## 4. Community-Cache und redaktionelle Freigabe — Schleuse **A**, Freigabe **D**

**Ausgeführtes Verhalten (2026-09-14), stärkster Nachweis in diesem
Audit:** Zwei echte Aufrufe gegen die deployte Edge Function, ohne
Vision-Kosten, weil reiner Lookup:

- Bekannter DSLD-Barcode `733739005977`: **HTTP 200**, vollständiges
  Ergebnis mit 20 Wirkstoffen samt Mengen und Formen (NOW Foods
  Effer-C Elderberry).
- Unbekannter Barcode `9999999999999`: **HTTP 404**,
  `{"error":"Kein Cache-Eintrag zu diesem Barcode."}`.

Damit ist belegt: Der Cache-Lookup ist live, liefert nur verifizierte
Einträge und scheitert sauber.

**Schleuse (A):** `verified`-Spalte mit Default `false`
(`supabase/migrations/20260810150000_cache_verified_flag.sql:7-8`),
Lookup filtert auf `verified = true` (`index.ts:272`), Insert neuer
Analysen mit `verified: false` (`index.ts:535`). RLS ist aktiv **ohne**
Policy für `anon`/`authenticated` (`20260809120000_product_cache.sql:23`,
Absicht im Kommentar) — Zugriff nur über die Service Role der Edge
Function (`index.ts:253-256`). Textfallback-Schlüssel
`text-<marke>__<produkt>` für Produkte ohne Barcode
(`index.ts:505-511`), Rezeptur-Versionierung über
`20260903100000_product_cache_formula_versioning.sql`.

**Freigabe (D):** siehe L3.

**Bestand:** Aus dem Migrationsverlauf grob 1740 Insert-Zeilen, davon
1532 aus der DSLD-Welle 1 (`verified: true` je Zeile). Das ist eine
Obergrenze aus den Migrationen, keine Ist-Zahl — wegen
`on conflict do nothing` und Versionierung kann die Datenbank abweichen.
Eine Live-Zählung wurde bewusst nicht durchgeführt.

## 5. Claude-Vision-Analyse über Supabase — **A** für den Pfad, **D** für die Absicherung

**Ausgeführtes Verhalten (2026-09-14):** Ein echter Aufruf mit einem
selbst erzeugten Testetikett (erfundene Marke "TESTMARKE AUDIT", damit
keine echten Produktdaten in den Cache gelangen):

```
HTTP 200 in 11,5 s, Modell claude-opus-5
Produkt: "Vitamin D3 + K2 Tropfen" | Marke: "TESTMARKE AUDIT"
Dosierung: 1 Tropfen | confidence: 90
Wirkstoffe: Vitamin D3 1000 I.E. (Cholecalciferol);
            Vitamin D3 25 µg (Cholecalciferol);
            Vitamin K2 20 µg (Menachinon-7);
            Magnesiumcitrat 500 mg (Citrat)
intakeInstruction: "1 Tropfen taeglich zu einer fetthaltigen Mahlzeit."
uncertainties: Doppelerfassung D3 erkannt; 500 mg je Tropfen als
            ungewöhnlich markiert
usage: 2991 Eingabe-, 464 Ausgabe-Token
```

Positiv belegt: Die Kette Gerät → Edge Function → Claude → strukturiertes
Ergebnis funktioniert, das Schema greift, chemische Formen werden
erkannt, der Einnahmehinweis wird gelesen, und das Modell markiert
Auffälligkeiten selbst. Deployter Stand: Version 17, aktiv seit
2026-09-03 (`supabase functions list`).

**Implementierung:** Bildaufbereitung vor dem Upload (max. 1600 px,
JPEG-Qualität 0,7, `ScanAnalyzer.js:22-23, 55-71`), Structured Output mit
`json_schema` und `additionalProperties: false` (`index.ts:51-152,
411-413`), Server-Grenzen 4 Bilder und je etwa 4,5 MB Base64
(`index.ts:35-37, 354-371`), Client-Timeout 90 Sekunden
(`ScanAnalyzer.js:24, 180-212`), differenzierte Fehlermeldungen für
Abbruch, Netz, Serverstatus und leeres Ergebnis
(`ScanAnalyzer.js:205-231`). Serverseitige Nachbearbeitung gegen
durchgesickerte Modellartefakte in Freitextlisten
(`index.ts:433-472`, dokumentierter Vorfall). `ANTHROPIC_API_KEY` nur als
Supabase-Secret (`index.ts:347`), kein Treffer im Client-Code.

**Warum D für die Absicherung:** Es existiert **kein einziger Test** für
`ScanAnalyzer.js` oder die Edge Function. Der einzige kostenpflichtige,
extern abhängige Pfad der App ist damit ohne automatisierte Abdeckung.
Zusammen mit L2 (Paywall aus, Opus als Default) ist das das größte
Betriebsrisiko.

## 6. Erkennung von Wirkstoffen, Formen, Mengen, Einheiten — **A**

**Gemessene Zuordnungsquote** (esbuild-Bundle, `matchIngredient` gegen
alle Katalog-Wirkstoffnamen, ausgeführt 2026-09-14):

| Quelle | gematcht | Quote |
|---|---|---|
| seedProducts | 752 / 766 | 98,2 % |
| offProducts | 2224 / 2224 | 100 % |
| zusammen | 2976 / 2990 | **99,5 %** |

Die 14 Ausreißer sind Sammelbegriffe wie "Polyphenole" und
"Ballaststoffe", die bewusst nicht kanonisch geführt werden. Die Quote
gilt nur für die 42,6 Prozent der Produkte mit erfasster Wirkstoffliste
(siehe Abschnitt 3).

**Implementierung:** Synonym-Index mit längeren Begriffen zuerst
(`SubstanceMatcher.js:57-68`), Matching exakt oder ab vier Zeichen als
Präfix beziehungsweise Wortgruppe, Kurzsymbole wie Fe, Zn, B6 nur exakt
(`:94-99`). Formerkennung über `form.name`/`form.aka` (`:105-121`).
Einheiten-Normalisierung mg, g, µg (ug, mcg), IE (IU), KBE (CFU), ml
(`:19-35`), Umrechnung nur innerhalb Masse plus Sonderfall Vitamin D
µg zu IE (`:215-236`) — alles andere liefert `null` statt zu raten.

`DoseNormalizer.js` rechnet Verbindung auf Element nur unter drei
Bedingungen (`:52-72, 134-138`) und liefert ohne belegten Elementanteil
`COMPOUND_UNKNOWN` ohne Wert. Der echte Vision-Test hat genau diesen
Fall geliefert (Magnesiumcitrat 500 mg) — die Kennzeichnung greift.

**Tests:** `tests/substance-logic.test.mjs` (94 Prüfungen: Matching,
Formen, mcg zu µg, MK-7 zu vitamin-k2, Referenzwert-Abgleich),
`tests/dose-normalizer.test.mjs` (Magnesiumcitrat-Regression "KEINE
Grenzwert-Warnung mehr (war der Bug)", Zinkoxid, elementare Angabe bleibt
unverändert, Molybdänglycinat ohne erfundenen Wert, Datenintegrität von
`elementalFractions.js`).

## 7. Umgang mit unvollständigen oder falschen Ergebnissen — **A** für die Datenregel, **B** für die Anzeige

**Keine erfundenen Werte (A):** `ScanAnalyzer.js:30-32` (`cleanText`
liefert leeren String statt Ersatzwert), `:100-103` (Dosierung nur über
`cleanText`), `SeedCatalog.js:242-257` (`parseCatalogAmount`: leer zu
`null`, Spanne "250-500" zu `null`), `AddSupplement.jsx:128-134`
(nicht parsebare Eingabe bleibt unverändert). Getestet über
`tests/seed-catalog.test.mjs` ("Keine erfundene Dosierung", "Eintrag
ohne Mengen → leere Wirkstofflisten") und `tests/dose-normalizer.test.mjs`.

**Confidence (B, mit Anzeigeproblem):** `clampConfidence`
(`ScanAnalyzer.js:94`) begrenzt auf 0 bis 100. Nur der Vision-Pfad füllt
den Wert; Barcode (`BarcodeLookup.js:228`) und Katalog
(`SeedCatalog.js:205`) setzen fest `0`. Die Karte staffelt aber nach
Zahl: kein Wert "Keine Bewertung verfügbar", ab 90 "Hohe technische
Erkennung", ab 75 "Prüfung erforderlich", darunter "Manuelle Kontrolle
erforderlich" (`components/SupplementResultCard.jsx:96-105`). Ein
kuratierter Katalogtreffer erscheint damit in derselben Karte wie ein
schlecht erkannter Scan. Kein Test auf `clampConfidence` oder
`mapResultToDraft`.

**Uncertainties (B):** Vision-Unsicherheiten werden einzeln als
Warnhinweise angehängt (`ScanAnalyzer.js:107-110`), plus ein statischer
Hinweistext je Quelle. Anzeige als Block "Grenzen der Analyse"
(`SupplementResultCard.jsx:285-291`). **Aber:** Der Hinweis auf die
Doppelerfassung aus L1 landet damit nur im Fließtext, während die
Rechnung falsch weiterläuft.

## 8. Nutzerprüfung vor dem Speichern — **B**

**Implementiert:** Prüfpunkte einzeln mit Sprung zum Nachtragen
(`results.jsx:216-236`), vier Review-Zeilen mit Status erkannt, prüfen,
fehlt (`SupplementResultCard.jsx:154-206`), Scan-Warnungen und
Unsicherheiten werden in die Notiz übernommen, damit sie beim Speichern
nicht verloren gehen (`AddSupplement.jsx:197-205`), Haftungshinweis auf
jeder Ergebnisseite (`results.jsx:326-328`).

**Zwei Befunde:**
1. Pflicht sind nur **Produktname** (`AddSupplement.jsx:308-312`) und
   **mindestens ein Zeit-Slot** (`:313-316`). Marke, Dosierung und
   Zutaten sind nicht Pflicht; ein unvollständiges Ergebnis lässt sich
   ungehindert speichern. Die Prüfpunkte sind ein Anstoß, keine Sperre.
   Das ist eine bewusste Haltung (die App bevormundet nicht), gehört
   aber vor der Beta entschieden: **E**.
2. Die **Marke ist gar nicht editierbar** — es gibt kein Markenfeld im
   Formular (`AddSupplement.jsx:82-109, 391-406`). Wer eine falsch
   erkannte Marke korrigieren will, kann es nicht. **D für Beta**,
   weil `results.jsx` "Marke nicht erkannt" als Prüfpunkt anzeigt und
   zum Nachtragen auffordert, das Formular das aber nicht anbietet.

Kein Test auf Speichersperren oder Pflichtfelder.

## 9. Quellen, Lizenzhinweise und ODbL-Attribution — **A** mit Inkonsistenz

**Belegt:** `data/offProducts.json:2-3` trägt `license: "ODbL-1.0"` und
die Attribution im Dateikopf. `SeedCatalog.js:26` hängt `license: 'ODbL'`
an jeden Eintrag. In Suche und Markenregister erscheint ein Badge "OFF"
mit Vorlese-Hinweis "Daten aus Open Food Facts, ODbL"
(`search.jsx:459-469`, `brands.jsx:137-147`, `i18n/de/search.js:32,34`).
Die Trennung erzwingt `tests/seed-catalog.test.mjs:41-64` (keine
OFF-Quellen in `seedProducts.json`, Lizenzfeld je Eintrag, exakte
Zahlen).

**Inkonsistenz (B):** Beim direkten Barcode-Treffer in `results.jsx`
gibt es **kein** Lizenz-Badge. Die Attribution läuft dort über
`warnings` und `uncertaintyNote` im Fließtext
(`BarcodeLookup.js:236-240`, gerendert in
`SupplementResultCard.jsx:72-73, 285-291`). Die ODbL-Namensnennung ist
damit technisch erfüllt, aber anders dargestellt als in der Suche.

**Kein CI-Gate (C):** `npm run split:off` hält die Trennung her, wird
aber nicht automatisch erzwungen; nur der Test prüft den Zustand
hinterher.

## 10. Datenschutz, Kosten, Fehlerfälle und Offline — gemischt

**Einwilligung (A):** `consents.scanUpload` wird genau vor dem echten
Foto-Upload geprüft (`scanner.jsx:375-387`), nach dem Kontingent-Gate.
Mock-Pfad und Barcode-Lookup brauchen sie nicht, weil dort keine Fotos
das Gerät verlassen. Widerruf in den Einstellungen
(`app/(tabs)/(more)/settings.jsx:45-46, 545-553`).

**Übertragen wird (A):** Bilder als Base64 (verkleinert), die aktive
Sprache und optional der Barcode (`ScanAnalyzer.js:163-233`); die IP ist
technisch Teil der Anfrage und wird serverseitig für das Rate-Limit
gelesen (`index.ts:296-314`). **Fotos werden serverseitig nicht
gespeichert** — belegt durch vollständige Durchsicht der Edge Function:
kein Storage-Upload, nur `result`-JSON in `product_cache`.

**Zwei Abweichungen zwischen `data/legalContent.js` und Code (D, klein
aber Projektregel):**
1. Der Text nennt die IP-Löschung als "nach etwa zwei Stunden
   automatisch"; die Migration löscht nur **beiläufig beim nächsten
   RPC-Aufruf** (`20260729010000_scan_rate_limit.sql:44-45`), es gibt
   keinen Cron-Job. Ohne Folgeaufruf bleibt der Eintrag länger stehen.
2. Die **Übertragung der App-Sprache** bei Foto-Scan und Cache-Lookup
   (`ScanAnalyzer.js:144, 198-202`) ist im Datenschutztext nicht
   genannt. Sachlich harmlos, verstößt aber gegen die Projektregel
   "Wer einen Datenfluss ändert, ändert `data/legalContent.js` mit".

**Kosten:** siehe L2. Ein Betrag pro Scan ist im Code **nicht belegbar**
(kein Cent-Wert in `Entitlements.js`, `scanConfig.js`, `ScanAnalyzer.js`
oder der Edge Function). Kontingentlogik selbst ist **A**:
`tests/entitlements.test.mjs` deckt Freikontingent, Fair-Use-Rollover,
Credit-Priorität und "bei abgeschalteter Paywall trotzdem erlaubt" ab;
Verbrauch erst nach erfolgreicher Analyse (`scanner.jsx:401-403`).

**Offline (B):** Es gibt **keine Netzstatus-Erkennung** (kein NetInfo im
Repo); offline wird ausschließlich über fehlschlagende `fetch`-Aufrufe
erkannt. Der OFF-Pfad unterscheidet Timeout, Nichterreichbarkeit und
echten Miss (`BarcodeLookup.js:101-116`, sichtbar über
`scanner.jsx:480-484`). Der Vision-Pfad unterscheidet ebenfalls
(`ScanAnalyzer.js:205-212`). **Der Cache-Pfad nicht:**
`lookupProductCache` hat kein Timeout und fängt jeden Fehler pauschal ab
(`ScanAnalyzer.js:128-153`, `catch { return null; }`) — ein
Netzwerkfehler sieht für die Nutzerin aus wie "Produkt nicht gefunden"
(`scanner.jsx:468-482`). Einstufung **D**, weil die Meldung irreführt.

**Fehlerfälle im UI (A):** Jeder Zustand hat einen Textschlüssel und
erscheint am Ort der Aktion (`scanner.jsx:691-695`): Timeout, nicht
erreichbar, Serverstatus, kein Ergebnis, Kontingentgrenze, kein
Barcode-Treffer, Suche fehlgeschlagen, Berechtigung verweigert oder
blockiert, Aufnahme-Timeout. Kein stilles Demo-Ergebnis bei Fehlern
(Kommentar `scanner.jsx:410`). Kein Test auf diese Pfade.

## 11. Deutsche und englische Oberfläche — **A**

**Gemessen** (Modul-Diff über die Kataloge, ausgeführt 2026-09-14):

| Datei | DE | EN | Lücken |
|---|---|---|---|
| scanner.js | 95 | 95 | 0 |
| results.js | 39 | 39 | 0 |
| analyzer.js | 10 | 10 | 0 |
| search.js | 38 | 38 | 0 |
| components.js | 71 | 71 | 0 |

Keine fehlenden Schlüssel. Identische Zeichenketten sind echte Kognaten
(Form, OFF, Discounter, Scan). **Keine hartcodierten deutschen Texte**
in `scanner.jsx`, `results.jsx`, `search.jsx`, `brands.jsx` — jeder
sichtbare Text läuft über `t()`.

`tests/i18n.test.mjs` erzwingt auf dem gemergten Katalog: keine
englischen Waisen-Schlüssel, keine leeren Texte, identische Platzhalter
je Schlüssel, Verbot präskriptiver englischer Formulierungen, und dass
die Sprachumschaltung in den Fachlogik-Modulen greift.

Fachtexte im Scan-Ergebnis werden über die EN-Overlays lokalisiert:
`ReferenceCheck.js:298, 327, 343, 350` laufen bei jedem
`buildSubstanceProfile`, den `results.jsx:116-118` für die
Substanz-Karten nutzt.

## 12. Unterschiede zwischen Mock, Demo und echter Analyse — **B**, Kennzeichnung **D**

**Die sechs Modi und wo sie gesetzt werden:**

| Modus | Quelle |
|---|---|
| `mock` | `scanner.jsx:351`, wenn Backend nicht konfiguriert; Daten aus `data/mockScanResult.js` |
| `demo-fallback` | `results.jsx:127`, wenn `/results` ohne vorherigen Scan aufgerufen wird |
| `vision` | `ScanAnalyzer.js:233` nach erfolgreicher Analyse |
| `barcode-off` | `BarcodeLookup.js:241` |
| `community-cache` | `ScanAnalyzer.js:149` |
| `seed-catalog` | `SeedCatalog.js:218` |

**Lücke (D):** Die Beschriftung in `results.jsx:50-60` kennt nur vier
Zweige. **`community-cache` und `seed-catalog` fallen auf den
generischen Text "Scan vorhanden"** (`results.modeDefault`). Die
Nutzerin kann einen Treffer aus dem geteilten, aus fremden Foto-Analysen
gespeisten Cache nicht von einem kuratierten Katalogeintrag
unterscheiden. Derselbe blinde Fleck in `AddSupplement.jsx:458`, wo
`analysisMode === 'vision'` das einzige Kriterium für ein
"gescannt"-Merkmal ist.

**Mock-Fallback (C):** `isAnalyzerConfigured` prüft auf eine nicht leere
URL (`ScanAnalyzer.js:26-28`); `scanConfig.js:19-20` setzt sie fest, der
Mock-Pfad ist im aktuellen Stand also nicht erreichbar, nur Vorkehrung.
Vor dem Launch prüfen, dass die URL in der ausgelieferten Konfiguration
gesetzt ist, sonst erhalten Nutzerinnen dauerhaft Demo-Daten ohne harten
Fehler.

**Tests:** `tests/barcode-lookup.test.mjs:76` prüft `barcode-off`,
`tests/seed-catalog.test.mjs:85` prüft `seed-catalog`. Kein Test für
`vision`, `mock`, `demo-fallback`, `community-cache` oder die
Label-Zuordnung.

## 13. Was der Vision-Pfad noch nicht nutzt — **C** und **F**

- **Modell-Whitelist** serverseitig fertig (`index.ts:43-47`), vom
  Client nie angesprochen (**C**). Ein Wechsel auf Haiku oder Sonnet für
  einfache Etiketten wäre der direkte Kostenhebel.
- **`captureSummary`** vollständig erhoben und persistiert, nirgends
  angezeigt (**C**, siehe L5).
- **`quantity`** von OFF angefragt, nie gelesen (**C**).
- **Vollbild-Vorschau je Foto** (**F**).
- **Granulare Unsicherheiten je Feld** außerhalb des Vision-Pfads
  (**F**) — Barcode und Katalog haben nur einen statischen Hinweistext.

---

# Teil 3: Übersicht

| Bereich | Einstufung | Härtester Beleg |
|---|---|---|
| Foto-Scan und Kameraablauf | B | `scanner.jsx:39-172`, kein Test |
| Barcode und Open Food Facts | A, zwei Mängel (D/C) | `tests/barcode-lookup.test.mjs`, 45 Zusicherungen |
| Produktsuche | D (Weg), B (Katalog) | `search.jsx` ohne `searchSeedCatalog`-Import |
| Seed-Katalog Datenlage | E | gemessen: 42,6 % mit Wirkstoffmenge |
| Community-Cache Schleuse | A | echter Lookup: HTTP 200 / HTTP 404 |
| Community-Cache Freigabe | D | kein `verified`-Treffer in `app/`, `components/` |
| Claude-Vision-Kette | A | echter Aufruf: HTTP 200, Opus, 11,5 s |
| Vision-Absicherung | D | kein Test für `ScanAnalyzer.js` und Edge Function |
| Wirkstoff-/Form-/Mengenerkennung | A | gemessen 99,5 %, 94 + Zusicherungen |
| Tagessumme bei Doppelangabe | **D** | ausgeführt: 2000 statt 1000 IE |
| Keine erfundenen Werte | A | `tests/seed-catalog.test.mjs`, `tests/dose-normalizer.test.mjs` |
| Confidence-Anzeige | B | `SupplementResultCard.jsx:96-105` |
| Nutzerprüfung vor Speichern | B, Marke D | `AddSupplement.jsx:308-316`, kein Markenfeld |
| ODbL-Attribution | A, inkonsistent (B) | `tests/seed-catalog.test.mjs:41-64` |
| Datenschutz Scan-Pfad | A, zwei Textabweichungen (D) | Edge Function ohne Storage-Upload |
| Kostenschutz | **D** | `PAYWALL_ENFORCED = false` |
| Offline Cache-Pfad | D | `ScanAnalyzer.js:150-152` |
| Fehlerfälle im UI | A (Abdeckung), kein Test | Tabelle in Abschnitt 10 |
| DE und EN | A | 0 Lücken in 5 Katalogen, `tests/i18n.test.mjs` |
| Modus-Kennzeichnung | D | `results.jsx:50-60` ohne Cache-/Katalog-Zweig |

## Reihenfolge für die Umsetzung, wenn beauftragt

1. **L1** Doppelangaben (falsche fachliche Aussage)
2. **L2** Kostenschutz (Paywall-Entscheidung und Modellwahl)
3. **L4** Produktsuche einbinden (kleiner Aufwand, große Wirkung)
4. **L5** Herkunft am Datensatz plus Modus-Kennzeichnung aus Abschnitt 12
5. **L3** Freigabeweg für den Cache
6. Markenfeld, Cache-Offline-Meldung, OFF-User-Agent, die zwei
   Datenschutz-Textstellen
7. Tests für `ScanAnalyzer.js` und den Scanner-Ablauf

## Was dieses Audit nicht geprüft hat

Bedienung auf einem echten Gerät (Kamera, Berechtigungsdialoge,
Vorlesefunktion), Verhalten bei schlechten Fotos und schrägen Etiketten,
mehrsprachige Etiketten, Verhalten unter echtem Mobilfunk, Lastverhalten
des Rate-Limits bei vielen Geräten, und die Live-Zahlen des
`product_cache`. Der einzige ausgeführte Vision-Aufruf war ein
synthetisches, sauber gedrucktes Testetikett — das ist der günstigste
Fall, nicht der Alltag.

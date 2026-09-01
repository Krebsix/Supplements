# ODbL-Rechtsrecherche: Open-Food-Facts-Massenimport

Stand: 2026-09-01. Tiefenrecherche durch Claude (Primärquellen abgerufen
bzw. per Titelabgleich verifiziert). Das ist fundierte Rechtsrecherche,
keine anwaltliche Beratung; das Memo kann jederzeit einem Anwalt zur
Gegenprüfung vorgelegt werden.

## Ergebnis in einem Satz

Der Massenimport ist mit der bestehenden Architektur (getrennte
`offProducts.json` mit eigener Attribution) rechtlich gut machbar; es
bleiben vier konkrete Compliance-Aufgaben, alle klein.

## 1. Lizenzlage bei Open Food Facts

Quelle: https://world.openfoodfacts.org/terms-of-use (abgerufen 2026-09-01)

- Datenbank: **ODbL 1.0**. Einzelinhalte: **DbCL 1.0**. Fotos: **CC-BY-SA 3.0**.
- Kommerzielle Nutzung ist ausdrücklich erlaubt ("all purposes, including
  commercial use").
- Verlangte Attribution: Lizenz nennen und Urheberschaft "Open Food Facts"
  mit Link auf https://openfoodfacts.org; bei produktbezogenen Daten
  zusätzlich Link auf die jeweilige Produktseite.
- Rechte Dritter (Marken, Produktdesign) bleiben unberührt; Prüfung liegt
  beim Weiterverwender. Für uns unkritisch: Wir zeigen Produktnamen und
  Nährstoffangaben, keine Logos, keine Fotos.
- Rückfragen: reuse@openfoodfacts.org.

**Wichtig: OFF-Fotos nie übernehmen.** CC-BY-SA ist ein eigenes
Pflichtenpaket; wir nutzen keine Fotos, das bleibt so.

## 2. Pflichten der ODbL 1.0

Quelle: https://opendatacommons.org/licenses/odbl/1-0/ (abgerufen 2026-09-01)

| Begriff | Was es ist | Pflicht |
|---|---|---|
| Derivative Database | veränderte/ausgewählte Teilmenge (unsere DACH-Auswahl) | §4.2 Notices + §4.4 Share-Alike bei öffentlicher Nutzung, §4.6 Teilmenge oder Diff maschinenlesbar verfügbar machen |
| Collective Database | unabhängige Datenbanken nebeneinander | KEIN Share-Alike auf die anderen Teile (§4.5 a) |
| Produced Work | Darstellung/Screen aus der Datenbank | nur Hinweis-Pflicht (§4.3): eine Notice, die erkennbar macht, dass Inhalte aus der ODbL-Datenbank stammen |

Interpretationspraxis der größten ODbL-Community (OpenStreetMap):
Share-Alike greift auf veröffentlichte abgeleitete DATENBANKEN, nicht auf
gewöhnliche Darstellungen daraus; getrennt gehaltene eigene Datenbanken
bleiben als Collective Database frei.
Quellen: https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ,
https://wiki.openstreetmap.org/wiki/Open_Database_License

## 3. Anwendung auf MySuplea

Unsere Architektur ist bereits richtig gebaut:

- `data/seedProducts.json` (Herstellerkatalog, redaktionell) und
  `data/offProducts.json` (OFF-Teilmenge, ODbL-Kopf mit license +
  attribution) sind getrennt; `npm run split:off` erzwingt die Trennung.
  Das ist das Collective-Database-Muster: **Share-Alike erfasst nur die
  OFF-Teilmenge, nicht unseren eigenen Katalog und nicht die App.**
- Die App als solche ist ein Produced Work: Es braucht eine sichtbare
  Notice, dass Produktdaten teilweise aus Open Food Facts stammen (ODbL).
- Deutsches Recht: Die ODbL stützt sich auf das
  Datenbankherstellerrecht (sui generis, §§ 87a-e UrhG, Basis RL 96/9/EG).
  Die Lizenz ist damit in DE/EU tragfähig; wer die Bedingungen einhält,
  hat eine wirksame Gestattung.
  Quelle: https://de.wikipedia.org/wiki/Datenbankherstellerrecht

## 4. Die vier Compliance-Aufgaben vor/mit dem Massenimport

1. **Sichtbare Attribution in der App**: Ein Satz an sichtbarer Stelle
   (Katalog/Scan-Treffer und Rechtliches): "Produktdaten teilweise aus
   Open Food Facts, © Open Food Facts contributors, ODbL 1.0" mit Link.
   OFF-Treffer tragen in der App bereits `license: 'ODbL'`; der
   pauschale Hinweis fehlt noch in `data/legalContent.js`.
2. **Teilmenge verfügbar machen (§4.4/4.6)**: Die ausgelieferte
   `offProducts.json` (unsere Derivative Database) unter ODbL öffentlich
   zugänglich machen, z. B. als Download auf mysuplea.com oder im
   öffentlichen Repo-Pfad. Aufwand: eine statische Datei.
3. **Produkt-Cache sauber halten**: Wenn OFF-Daten in den geteilten
   `product_cache` fließen, wird auch dieser Bestand ODbL-pflichtig.
   Entweder OFF-Herkunft je Eintrag kennzeichnen und die OFF-Einträge
   unter denselben Bedingungen abrufbar machen, oder OFF-Treffer nicht in
   den Cache schreiben. Empfehlung: kennzeichnen (Feld existiert).
4. **Keine Fotos, keine Vermischung**: bestehende Regeln beibehalten
   (kein OFF-Material in seedProducts.json, keine OFF-Fotos).

## 5. Risikoeinschätzung

- OFF wirbt aktiv für kommerzielle Weiterverwendung; das praktische
  Konfliktrisiko konzentriert sich auf fehlende Attribution. Mit den
  Aufgaben 1 und 2 ist das adressiert.
- Share-Alike bedroht NICHT den eigenen Katalog, die Fachlogik oder die
  App, solange die Trennung (Collective Database) steht. Genau dafür
  existiert der split:off-Mechanismus.
- Restrisiko: Auslegungsfragen der ODbL sind nicht höchstrichterlich
  geklärt; die OSM-Praxis ist Industriestandard, aber keine Rechtsprechung.

## 6. Skalierung über OFF hinaus (Nadines Ziel: größte, bestverwertbare DB)

Für US-/Nicht-EU-Produkte ist die **NIH/ODS Dietary Supplement Label
Database (DSLD)** der nächste Hebel: Etikettendaten von zehntausenden
US-Präparaten, als Werk der US-Bundesbehörden **public domain**, also ohne
Share-Alike-Pflichten nutzbar (https://dsld.od.nih.gov/). Kandidat für
einen zweiten Import nach dem OFF-Import.

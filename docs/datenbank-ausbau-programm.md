# Datenbank-Ausbau: Programm „Maximale Datentiefe"

Stand: 2026-09-01. Nadines Zielvorgabe: die beste und größte Supplement-
Datenbank mit den bestverwertbaren, anwendbarsten Infos, für alle
Produkte und alle Infos, die wir verwenden. Quellen außerhalb Europas
sind ausdrücklich erwünscht (NIH, LactMed, DSLD).

## Drei unverhandelbare Regeln

1. **Quellenpflicht**: Jede fachliche Aussage trägt eine verifizierte
   Quelle (abgerufen oder per Titel+Kernwert bestätigt). Tests erzwingen
   das maschinell, wo möglich.
2. **Keine erfundenen Werte**: Lieber Lücke als Schätzung. OFF-Nährwerte
   „je 100 g" werden nie als Tagesdosis ausgegeben.
3. **Transparente Umrechnung**: Wo wir selbst rechnen (Stöchiometrie,
   Portionsumrechnung), steht der Rechenweg im Text bzw. am Datensatz,
   sodass jeder den Wert nachvollziehen kann (Muster:
   `data/elementalFractions.js` mit Summenformel; Natron-cautionNote).

## Erledigt (2026-09-01)

- OFF-Massenimport: 2.418 DACH-Produkte (Identitätsdaten), Katalog 2.831
  Einträge; ODbL-Recherche in `launch/odbl-recherche.md`.
- Wirkstoffe: 170 Substanzen (neu: Beta-Glucan, Inulin, Lycopin,
  Citrus-Bioflavonoide, Chlorid, Protein, Natron), Zuordnungsquote der
  Katalog-Zutaten 98,3 Prozent.
- Einnahme-Hinweise: 10 Substanzen mit belegtem Einnahmezeitpunkt plus
  Fettlöslich-Regel; Vorbefüllung im Aufnehmen-Screen greift.
- Stillzeit/Schwangerschaft: Salbei- und Pfefferminz-Advisories
  (EMA/HMPC, LactMed), DE + EN.

## Bausteine in Reihenfolge

1. **BfR-Überdosierungs-Durchgang**: ERLEDIGT 2026-09-02 (Commit
   61fa6e7): `overdoseNote` für 29 Substanzen DE + EN aus den 27
   BfR-Einzeldokumenten, jede Aussage gegen den Dokumenttext geprüft,
   BfR-Quelle je Substanz ergänzt, Anzeige im Steckbrief, Test erzwingt
   Parität.
2. **BfR-NEM-Höchstmengen als dritte Referenz-Ebene**: ERLEDIGT
   2026-09-02: `data/bfrMaxAmounts.js` mit allen 29 Werten je
   Tagesdosis (inkl. Absenkungen B6 0,9 mg und Selen 40 µg aus den
   EFSA-Aktualisierungen) plus BfR-Warnhinweisen (Vitamin K/
   Gerinnungshemmer, Eisen nur nach Rücksprache, Biotin vor
   Labortests, Kupfer nicht für Jugendliche), DE + EN, eigener Test,
   Anzeige im Substanz-Steckbrief. Die Phase-3b-Balken greifen darauf
   zu.
3. **OFF-Serving-Enrichment**: Für importierte Produkte per Produkt-API
   `nutriments._serving` + `serving_size` nachladen; nur echte
   Portionswerte übernehmen, Umrechnung 100g→Portion nur bei eindeutiger
   Gramm-Portionsangabe, Rechenweg am Datensatz dokumentieren.
   Erwartung: geringe Abdeckung (viele OFF-Supplements ohne Nährwerte),
   deshalb nach DSLD priorisieren.
4. **DSLD-Import** (NIH Dietary Supplement Label Database,
   https://dsld.od.nih.gov/, public domain): Welle 1 ERLEDIGT
   2026-09-02: 766 On-Market-Produkte von 20 DACH-relevanten US-Marken
   MIT Wirkstoffmengen je Portion, als verified-Einträge (de/en) im
   geteilten product_cache (Migration deployt); Barcode-Scan findet sie
   sofort. Werkzeug: scripts/import-dsld.mjs (Label-Platten-Cache,
   Retry mit Backoff gegen das API-Stundenlimit). Offen: 31 rate-
   limitierte Labels nachziehen, weitere Marken als Welle 2, mehr
   MAX_PRODUCTS wenn gewünscht.
5. **HMPC-Monographien-Durchgang je Kraut**: Welle 1 ERLEDIGT
   2026-09-02: 22 Kräuter mit belegten Lebensphasen-Aussagen aus ihren
   EMA/HMPC-basierten cautionNotes als strukturierte Advisories
   (Schwangerschaft/Stillzeit/Kinder), DE + EN, Profil-Check zeigt sie
   jetzt der richtigen Lebensphase. Keine neuen Behauptungen, Quellen
   hängen an den Substanzen. Offen (v2, braucht Monographie-Recherche):
   17 Kräuter ohne Lebensphasen-Aussage (u. a. saw-palmetto, garlic,
   artichoke, thyme, goldenrod, arnica, horsetail) plus fennel
   (EMA-Aussage betrifft Kinder unter 4, dafür existiert keine
   Lebensphasen-Gruppe).
6. **ODbL-Restpflichten**: offProducts.json als Download veröffentlichen
   (Website), product_cache-OFF-Kennzeichnung.

## Arbeitsweise je Baustein

Quelle beschaffen und verifizieren, Datenmodell minimal erweitern,
DE + EN pflegen, Test erzwingt Struktur und Parität, testgrüner Stand
wird gepusht (stehende Freigabe).

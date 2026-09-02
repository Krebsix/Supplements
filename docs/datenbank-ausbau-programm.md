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
3. **OFF-Serving-Enrichment**: ERLEDIGT 2026-09-02: 957 von 2.455
   offenen OFF-Produkten tragen jetzt Portionsmengen (39 Prozent,
   deutlich über der Erwartung), alle über die Umrechnung 100g→Portion
   bei eindeutiger Gramm-Portionsangabe (`amountBasis:
   'converted-from-100g'`, Rechenweg in `conversionNote` am Datensatz);
   kein einziges Produkt deklarierte je Portion (`per-serving`: 0).
   Rest bleibt bewusst Lücke (keine Nährwerte oder keine eindeutige
   Gramm-Portion in OFF). Werkzeug: `scripts/enrich-off-servings.mjs`
   (Search-API in 100er-Blöcken, 429/503-Backoff, Platten-Cache je EAN
   unter ../.off-product-cache).
4. **DSLD-Import** (NIH Dietary Supplement Label Database,
   https://dsld.od.nih.gov/, public domain): Welle 1 ERLEDIGT
   2026-09-02: 766 On-Market-Produkte von 20 DACH-relevanten US-Marken
   MIT Wirkstoffmengen je Portion, als verified-Einträge (de/en) im
   geteilten product_cache (Migration deployt); Barcode-Scan findet sie
   sofort. Welle 2 ERLEDIGT 2026-09-02: alle Rate-Limit-Lücken
   nachgezogen (855/855 Labels, null Fehlschläge), 796 Produkte gesamt.
   Werkzeug: scripts/import-dsld.mjs (Label-Platten-Cache, Retry mit
   Backoff, Wellen-Logik für Delta-Migrationen). Optional später:
   weitere Marken, mehr MAX_PRODUCTS.
5. **HMPC-Monographien-Durchgang je Kraut**: Welle 1 ERLEDIGT
   2026-09-02: 22 Kräuter mit belegten Lebensphasen-Aussagen aus ihren
   EMA/HMPC-basierten cautionNotes als strukturierte Advisories
   (Schwangerschaft/Stillzeit/Kinder), DE + EN, Profil-Check zeigt sie
   jetzt der richtigen Lebensphase. Keine neuen Behauptungen, Quellen
   hängen an den Substanzen. Welle 2 ERLEDIGT 2026-09-02:
   12 weitere Kräuter per Monographie-PDF-Recherche (EMA-Dokumente
   geladen und extrahiert): thyme, garlic, artichoke, dandelion,
   marshmallow-root, goldenrod, calendula, arnica, birch-leaf,
   horsetail, nettle-root, saw-palmetto; cautionNotes DE/EN erweitert
   plus 27 Advisory-Einträge (inkl. "keine Anwendung bei Frauen" für
   Sägepalme/Brennnesselwurzel). Verbleibende Lücken (bewusst, keine
   Arzneipflanzen bzw. keine passende Gruppe): myo-inositol, d-mannose,
   phosphatidylserine, shiitake, fennel (EMA-Aussage betrifft Kinder
   unter 4).
6. **ODbL-Restpflichten**: ERLEDIGT 2026-09-02, Details in
   `launch/odbl-recherche.md` Abschnitt 4a: Download-Seite
   `web/public/odbl/` mit `offProducts.json` unter ODbL (Branch
   phase-2u-website, Footer verlinkt); zusätzlich ist das GitHub-Repo
   öffentlich (maschinenlesbarer Repo-Pfad). product_cache-Frage
   geklärt: OFF-Daten fließen NICHT in den Cache (nur Vision-Analysen,
   Seeds, DSLD), damit greift die Nicht-Schreiben-Alternative, eine
   Kennzeichnung ist gegenstandslos. Wer `offProducts.json` ändert,
   zieht die Website-Kopie nach.

## Arbeitsweise je Baustein

Quelle beschaffen und verifizieren, Datenmodell minimal erweitern,
DE + EN pflegen, Test erzwingt Struktur und Parität, testgrüner Stand
wird gepusht (stehende Freigabe).

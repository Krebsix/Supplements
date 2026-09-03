# Roadmap: Supplement Intelligence (Post-Launch)

Stand: 2026-08-09, aus Nadines Wettbewerbsanalyse (SuppCo, SuppTrack,
BioStacks, Suppi u. a.).

## STRATEGISCHE THESE (von Nadine bestaetigt 2026-08-09)
Deutschland hat KEINE oeffentliche Gesamtdatenbank der angezeigten NEM
(BVL-Anzeigen sind nicht einsehbar). Wer den DACH-Datensatz sauber selbst
aufbaut, baut einen proprietaeren europaeischen Supplement-Datengraphen —
das ist der Moat, nicht die App-Oberflaeche. Als Vertiefung gewaehlt:
Formula Versioning + Evidence Graph + Stack Conflict Resolver +
Intelligence-Positionierung. Reihenfolge NACH den Launch-Gates:
1. Stack Conflict Resolver (kleinster Schritt, Fundament steht)
2. Formula Versioning (Cache-Schema, Daten-Moat)
3. Evidence Graph (je Top-Wirkstoff, beginnend Magnesium)
4. Intelligence-Positionierung ab v1.1 (Marketing, parallel) Kernbefund: 7 der 13 Empfehlungen existieren
bereits in MySuplea (Labelscan-No-Dead-End, Kontext statt Score,
EU-Referenzebenen, Stack-Aggregation, N-of-1 mit Stoerfaktoren,
Praxis-Bericht, Kostenanalyse). Dieses Dokument haelt fest, was NEU ist
und NACH den Launch-Gates (Council 2026-08-09) drankommt.

## 1. Formula Versioning: ERLEDIGT 2026-09-03
Migration 20260903100000_product_cache_formula_versioning.sql:
Surrogat-ID + formula_version + valid_from + superseded_at, partieller
Unique-Index auf die aktuelle Version je (barcode, language). Edge
Function analyze-supplement legt bei tatsaechlich abweichender
Zutatenliste/Dosierung (formulaVersioning.ts hasFormulaChanged, 11
Deno-Tests, konservativ: Vision-Rauschen loest KEINE neue Version aus)
eine neue Version an statt sie zu verwerfen; alte Version bleibt als
Historie stehen. 1.751 bestehende Zeilen migriert und geprueft.

## 2. Preis je Wirkstoff-Tagesdosis (klein, CostAnalyzer-Erweiterung)
"Preis pro 100 mg Magnesium" bzw. je Tagesdosis; Grundlage existiert
(CostAnalyzer + StackAnalyzer). Formulierung deskriptiv, kein "besser".

## 3. Timing-Vorschlag mit Begruendung: ERLEDIGT 2026-09-03 (v1)
StackConflictResolver.js: bei einem Paar-Konflikt mit editorisch
gesetztem alwaysSeparate-Flag (nur 3 von 7 PAIR_RULES qualifizieren,
siehe Kommentar in data/interactions.js) wird ein bereits im
Tagesplan genutzter Alternativ-Slot vorgeschlagen, Antipp wendet ihn an
(ScheduleGuidance.js, SlotReason.jsx, Dashboard.jsx). Offen fuer v2:
mehr als zwei Praeparate gleichzeitig konfligierend, automatische
Vorschlaege beim Anlegen (aktuell nur im bestehenden Tagesplan).

## 4. Familienmodus (gross, Datenmodell-Aenderung)
Mehrere Profile lokal (Ich/Partner/Eltern). Wichtig fuer Aeltere mit
Medikamenten. Verschluesselung und Backup pro Profil durchdenken.

## 5. Evidence Graph: PILOT ERLEDIGT 2026-09-03 (Magnesium)
data/evidenceGraph.js: 3 Anwendungsgebiete fuer Magnesium (Muskelkraempfe,
Migraene, Schlaf), je mit Kernaussage aus einem echten systematischen
Review (Cochrane bevorzugt), GRADE-Sicherheitsstufe wie vom Review selbst
verwendet, eigener Quellenliste. Rendering in SubstanceInsightCard.jsx
als Abschnitt "Studienlage". 40 Tests (Struktur, Quellenpflicht,
EN-Paritaet, keine praeskriptive Sprache).

Weiterhin "sehr gross, eigenes Projekt" fuer den vollen Umfang: Vitamin
D3 und Omega-3 (naechste Kandidaten laut Roadmap) sowie die Dimensionen
Form und Dosis sind bewusst NICHT im Pilot enthalten. Nicht automatisch
fortsetzen -- erst Rueckmeldung zum Piloten (Layout, Tonfall,
Aussagekraft) einholen, dann entscheiden, welche Substanz als naechstes.

## 6. Positionierung "Supplement Intelligence"
Story traegt es bereits inhaltlich ("ordnet ein, zitiert Quellen").
ASO-Titel behaelt "Supplement Tracker" (Suchvolumen); der
Intelligence-Claim gehoert in Untertitel/Screenshots ab v1.1.
Keine Aenderung vor dem Launch (Council-Gates).

## Bewusst NICHT uebernommen
- TrustScore/0-100-Bewertungen (Konkurrenz-Muster; widerspricht
  Positionierung und Health-Claims-Grenzen)
- 250k-US-Produkte-Wettlauf (falscher Krieg, siehe Analyse selbst)
- Brand-Rankings jeder Art (harte Projektregel)

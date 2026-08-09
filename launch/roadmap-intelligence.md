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

## 1. Formula Versioning (hoher Wert, mittlerer Aufwand)
Product ID ≠ Formula ID: Rezepturen aendern sich unter gleichem Namen.
Umsetzung: product_cache um label_version/valid_from erweitern; bei
Vision-Scans mit abweichenden Werten zum Cache-Eintrag neue Version
anlegen statt ueberschreiben. Deckt auch DE/AT/CH-Rezepturunterschiede ab.

## 2. Preis je Wirkstoff-Tagesdosis (klein, CostAnalyzer-Erweiterung)
"Preis pro 100 mg Magnesium" bzw. je Tagesdosis; Grundlage existiert
(CostAnalyzer + StackAnalyzer). Formulierung deskriptiv, kein "besser".

## 3. Timing-Vorschlag mit Begruendung (mittlere Groesse)
Stack Conflict Resolver: Aus InteractionCheck-Regeln einen konkreten
Tagesplan-Vorschlag ableiten, jede Verschiebung mit Regel + Quelle.
Fundament (Paar-Regeln, TimingEngine, AbsorptionBlocker) steht.

## 4. Familienmodus (gross, Datenmodell-Aenderung)
Mehrere Profile lokal (Ich/Partner/Eltern). Wichtig fuer Aeltere mit
Medikamenten. Verschluesselung und Backup pro Profil durchdenken.

## 5. Evidence Graph (sehr gross, eigenes Projekt)
Wirkstoff x Form x Dosis x Outcome x Population mit Evidenzgrad.
NUR mit derselben Zitat-Disziplin wie medicationClasses (keine
LLM-generierten Zusammenfassungen als Quelle). Realistisch: schrittweise
je Top-Wirkstoff, beginnend bei Magnesium/D3/Omega-3.

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

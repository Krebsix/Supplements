# Ontologie-Referenz: MySuplea Knowledge Graph (Zielbild)

Stand: 2026-08-09, aus Nadines Architektur-Analyse. Dies ist das
ZIELBILD fuer den Datengraphen, NICHT das aktuelle Datenmodell und
NICHT ein Vor-Launch-Arbeitspaket (Council-Gates gelten). Jede kuenftige
Schema-Entscheidung wird gegen dieses Dokument geprueft, damit nichts
gebaut wird, das dem Zielbild widerspricht.

## Verbindliche Leitplanken ab sofort (Ontologie v0)
1. **Rohwerte niemals ueberschreiben.** Etikett-/Quellwerte sind Ebene A
   und bleiben erhalten; Normalisierung (Ebene B) und Intelligence
   (Ebene C) sind abgeleitet. Offene Stelle: product_cache-Upsert wird im
   Formula-Versioning-Paket durch Versionshistorie ersetzt.
2. **Jede Zahl traegt Quelle, Datum, Bezugsgroesse** (je Tagesdosis,
   LMIV). Ohne belegte Bezugsgroesse keine Uebernahme.
3. **Kanonische Identitaet vor Text.** Neue Wirkstoffe/Formen laufen
   ueber substances.js-IDs (Synonym-Aufloesung im SubstanceMatcher);
   externe Referenzen (ChEBI/PubChem) sind als Felder vorgesehen, werden
   aber erst beim Evidence-Graph-Ausbau gepflegt.
4. **Spezialdomaenen bekommen Spezialfelder, wenn sie real auftreten:**
   Botanicals (Spezies, Pflanzenteil, Zubereitung, DER, Marker),
   Probiotika (Gattung/Art/STAMM, KBE je Portion und bis MHD),
   Omega-3 (Gesamtoel vs. EPA/DHA, TG/EE-Form), Enzyme
   (Aktivitaetseinheiten statt Masse). Nicht auf Vorrat modellieren.
5. **DE ≠ AT ≠ CH.** Referenz- und Hoechstmengen-Ebenen (NRV, DRV, UL,
   BfR-Vorschlag, CH-Hoechstmenge, Hersteller-Tagesdosis) bleiben
   getrennte Objekte mit Jurisdiktion.
6. **Data Confidence ist ein Datensatz-Attribut, nie ein Produkt-Score.**

## Bereits umgesetzt (flach, migrierbar)
Raw/Normalisiert-Trennung (Scan + DoseNormalizer), kanonische Substanzen
mit Synonymen und Formen (163), elementalFractions, stoffabhaengige
IE-Konversion, getrennte Referenzwert-Ebenen, Quelle je Seed-Zeile/
Regel/Zitat mit Test-Erzwingung, analysisMode als Herkunft je Scan,
productClass/channel/country im Seed-Schema, PZN als Produktschluessel.

## Zielbild: die 68 Kernobjekte (Master-Liste, Original)
Company, Brand, Manufacturer, Manufacturing Site, Product Family,
Product Variant, Market Variant, GTIN, Package, Formula, Formula
Version, Label, Batch, Serving, Dosage Instruction, Ingredient
Declaration, Canonical Ingredient, Nutrient, Chemical Form, Botanical
Species, Plant Part, Botanical Preparation, Extract, Marker Compound,
Probiotic Organism, Strain, Fatty Acid, Enzyme, Excipient, Allergen,
Unit, Conversion Rule, Health Goal, Health Claim, Evidence Claim,
Study, Population, Intervention, Comparator, Outcome, Evidence Grade,
Interaction, Contraindication, Adverse Effect, Reference Intake,
UL/Safe Level, Regulatory Limit, Jurisdiction, Regulatory Status,
Novel Food Status, Certification, Laboratory, COA, Contaminant Test,
Recall, Safety Alert, Doping Test, Retailer, Price Observation, Source,
Source Snapshot, Reviewer, Confidence, User Stack, User Dose, Intake
Event, Schedule, Context Event.

Wichtige Einzelideen aus der Analyse fuer spaetere Pakete:
- Product ≠ GTIN ≠ Formula ≠ Label (Formula Versioning, Roadmap #2)
- Claim-Graph: Marketing-Claim ≠ zugelassener EU-Claim ≠ Evidenz
- Recall/RASFF-Anbindung je Charge
- Koelner Liste je CHARGE, nie "dopingfrei" pauschal
- User-Kontext strikt getrennt vom Produktgraphen (Art. 9 DSGVO)
- NIH DSLD als Referenzmodell fuer Label-Datenbank-APIs

## Reihenfolge
Launch-Gates → Stack Conflict Resolver → Formula Versioning (inkl.
Leitplanke 1 im Cache) → Evidence Graph je Top-Wirkstoff. Die
Seed-Wellen laufen parallel weiter: Sie sammeln Ebene-A-Fakten, die
jede spaetere Schema-Migration ueberleben.

# Seed-Briefing: Deutsche Supplement-Marken und Kategorien

Stand: 2026-08-09. Quelle: Nadines Marktrecherche (BfR-Befragung 2025,
Verbraucherzentrale/IQVIA 2024, Hersteller-Seiten). Dient als Priorisierung
fuer den Produkt-Cache-Seed; Einzelfakten je Produkt werden bei der
Erfassung gegen die Originalquelle geprueft.

## Datenmodell-Grundsatz
**Marke ≠ Markeninhaber ≠ Lohnhersteller.** Im Seed werden Marke und
Markeninhaber getrennt erfasst; der tatsaechliche Produktionsbetrieb wird
NICHT gepflegt (wechselt je Charge, nur vom Etikett erfassbar).
Beispiel: Marke Doppelherz, Markeninhaber Queisser Pharma GmbH & Co. KG.

Wichtig fuer die App-Regeln: Markennamen sind neutrale Produktdaten.
KEINE Qualitaets-Rankings von Marken (CLAUDE.md), der Cache speichert nur,
was auf dem Etikett steht.

## Kategorien-Prioritaet (BfR 2025: Nutzungshaeufigkeit)
1. Magnesium (Oxid, Citrat, Bisglycinat, Malat, Komplexe)
2. Vitamin D (D3, D3+K2, Tropfen, Wochendepot)
3. Vitamin C (Ascorbinsaeure, gepuffert, Depot, +Zink)
4. Calcium (auch +D3, +D3+K2)
5. Danach: Multivitamin/A-Z, B12/B-Komplex, Zink, Omega-3, Eisen,
   Folsaeure, K2, Selen, Jod, Elektrolyte, Probiotika, Kollagen,
   Melatonin, Q10, Protein, Kreatin

## Marken-Kernliste (~35)
- **Drogerie/Massenmarkt:** Doppelherz (Queisser), Mivolis (dm),
  altapharma (Rossmann), Abtei (Perrigo), taxofit (Klosterfrau),
  tetesept (Merz Lifecare), Zirkulin (Merz), Merz Spezial (Merz)
- **Apotheke/Premium:** Orthomol, Dr. Wolz, Biolectra (Hermes),
  Magnesium-Diasporal (Protina), Sanct Bernhard
- **Online/D2C:** Sunday Natural, NATURTREU, Natural Elements,
  Nature Love, GloryFeel, Vit4ever, ZeinPharma, Fairvital, Warnke,
  effective nature, Raab Vitalfood, Vitamaze
- **Sport:** ESN (The Quality Group), More Nutrition (TQG), Body Attack,
  IronMaxx, ZEC+, All Stars, Foodspring, Peak, ProFuel
  (Sport-Prioritaet: Whey, Kreatin, Elektrolyte, Isolate, EAA,
  Pre-Workout, Magnesium, D3, Omega-3)
- **Discounter/Elektrolyte (Welle 4):** Mivolis (dm), altapharma
  (Rossmann), Mueller-Eigenmarken, Aldi (Multinorm/Curamed), Lidl
  (Eigenmarke verifizieren), Dextro Energy (Krefeld; Elektrolyt-,
  Magnesium- und Vitamin-Linien), Elotrans (STADA, PZN), Xenofit
- **Direktvertrieb (Welle 4 + 5):** Prioritaet A: FitLine
  (PM-International), Herbalife, Juice Plus+, LR Health & Beauty (Ahlen),
  Forever Living, Amway/Nutrilite, Lifeplus, Zinzino, RINGANA (AT).
  Prioritaet B: Nu Skin/Pharmanex, Young Living und doTERRA (NUR die als
  Nahrungsergaenzung vertriebenen Produkte, keine Oele/Kosmetik), ASEA,
  Partner.Co. Nur offizielle Herstellerseiten als Quelle, keine
  Partner-/Reseller-Shops. Seed-Schema ergaenzt um "channel"
  (drogerie|apotheke|discounter|online|sport|direct); das
  "verantwortliche Lebensmittelunternehmen" ist eine Etikett-Angabe und
  wird vom Foto-Scan erfasst, nicht aus dem Web geraten.

Bei D2C-Marken Markeninhaber und Produktionsland einzeln pruefen, bevor
"deutscher Hersteller" behauptet wird.

## Oesterreich und Schweiz (Ergaenzung 2026-08-09, Nadines Recherche)
Endkunden-relevante Marken fuer den Produkt-Seed:
- **AT:** BIOGENA, Pure Encapsulations (Vertrieb pro medico Graz;
  Markeninhaber pruefen, urspruenglich US/Nestle Health Science),
  OMNi-BiOTiC (Institut AllergoSan), Dr. Boehm (Apomedica), Gall Pharma,
  OEKOPHARM, PANACEO, Kwizda
- **CH:** Burgerstein (Antistress AG), Kingnature, Phytopharma,
  Alpinamed, Nahrin, SPONSER

## Offene Produkt-Dimensionen (Backlog, als Etikett-Fakten machbar)
- **vegan/vegetarisch:** Kapselhuelle (Gelatine vs. HPMC) und V-Label sind
  Etikett-Fakten; fuer viele Nutzerinnen ein K.-o.-Kriterium. Aufnahme in
  Scan-Schema (Vision-Prompt), Seed und Filter der Namenssuche.
- **Allergene:** Soja, Laktose, Gluten sind LMIV-Pflichtangaben; als
  deskriptive Etikett-Fakten erfassbar, nie als Vertraeglichkeitsurteil.
- **Chemische Form je Produkt:** ab Welle 4 im Seed (form-Feld), im
  Vision-Schema bereits vorhanden.

## Welle 6 (geplant): Premium, Mikrobiom, Schwangerschaft, Import, Produktklassen
Neue Marken (nicht in Wellen 1-5): Centrum (Haleon), Supradyn (Bayer),
Solgar, Kijimea (Synformulas), Femibion (P&G), K-Concept+ Vital
(Kaufland-Eigenmarke), MyProtein, Bulk, Optimum Nutrition; Import-Marken
mit DACH-Reichweite: NOW Foods, Thorne, Life Extension, Nordic Naturals,
Vital Proteins (Quelle: offizielle Herstellerseiten, iHerb & Co. sind
Haendler und als Quelle gesperrt).
Themenwelten: Darm/Mikrobiom (Kijimea, OMNi-BiOTiC vertiefen; Substanz
Inulin fehlt noch in data/substances.js), Schwangerschaft/Kinderwunsch
(Femibion-Linie; Substanzseite existiert: Folat, Eisen, Jod, Cholin, DHA).
SCHEMA-ERWEITERUNG "productClass": "nem" (Default) | "arznei" |
"medizinprodukt" | "sportlebensmittel" | "fsmp". Arzneimittel erkennbar
an Zulassungsnummer/PZN-Pflicht (z. B. Vigantol ist ARZNEIMITTEL, nicht
NEM — bestehende Eintraege beim Konsolidieren pruefen). Die App behandelt
alle Klassen als dokumentierbare Einnahmen, kennzeichnet aber die Klasse;
Arzneimittel-Hinweise bleiben Sache von Arzt/Apotheke.

## Welle 8 (laeuft): Gummis/Weichgummis
Aus dem ersten Community-Scan entdeckte Segment-Luecke (Vigantolvit
Weichgummis). Marken: Bears with Benefits (DACH-Marktfuehrer), Gummi-
Linien von Doppelherz/Mivolis/altapharma/Abtei/Centrum, weitere belegte
Gummi-Marken. Schema neu: optionales "doseForm"-Feld. Gummi-Fallstrick:
Etiketten geben oft "pro 2 Gummis" an — Mengen nur bei belegter
Tagesdosis uebernehmen.

## Welle 10 (laeuft): Verla, Weleda, Wala
Nadine (2026-08-10): Apotheken-Klassiker fehlten fast komplett (nur
Magnesium Verla N Dragées war drin). Verla-Pharm (Zinkletten, Zink,
Magnesium-Linie, Calcium, Ferro, Kalium; viele davon zugelassene
ARZNEIMITTEL → productClass je Produkt pruefen), Weleda (einnehmbare
Produkte, keine Kosmetik) und WALA (gaengige einnehmbare Praeparate).
Anthroposophika: zugelassen mit Indikation → "arznei", registriert ohne
Indikation → "homoeopathikum". Potenzierte Zusammensetzungen bekommen
NIE keyIngredients.

## Welle 9b (laeuft): Extrasparte Bachblueten
Nadine (2026-08-10): auch alle Bachblueten-Produkte aufnehmen. Gleiche
Extrasparten-Logik wie Homoeopathie, aber EIGENE Produktklasse
"bachblueten" mit eigenem Hinweistext (seedCatalog.class.bachblueten):
Bachblueten sind in DE ueberwiegend LEBENSMITTEL oder Kosmetik, keine
registrierten Arzneimittel — der Packungsbeilagen-Satz der Homoeopathika
waere hier falsch, stattdessen Verweis auf die Herstellerangaben.
category "Bachblüten", keyIngredients immer leer, keine Indikationen.
Marken: Bach Original/RESCUE (Nelsons), Murnauers, weitere nur offiziell
belegt.

## Welle 9 (laeuft): Extrasparte Homoeopathie (DHU/Schuessler)
Von Nadine gemeldete Luecke (2026-08-10): Schuessler-Salze und gaengige
DHU-Praeparate. Entscheidung: eigene SPARTE, klar getrennt von den
Nahrungsergaenzungsmitteln.
- Schema: productClass "homoeopathikum", category "Homöopathie",
  channel "apotheke", PZN von offiziellen DHU-Seiten.
- keyIngredients bleibt IMMER leer: Potenzen enthalten keine
  analysierbaren Naehrstoffmengen, "Magnesium phosphoricum D6" ist NICHT
  Magnesium. Dadurch bleiben die Eintraege automatisch aus Tagessummen,
  Referenzabgleich und Interaktionspruefung draussen, ohne Sonderlogik.
- KEINE Indikationen, keine Anwendungsgebiete: registrierte Homoeopathika
  (§ 38 AMG) tragen keine behoerdlich gepruefte Indikation, die App
  uebernimmt nur Belegtes. Hinweistext in der App:
  seedCatalog.class.homoeopathikum (i18n, DE/EN), verweist auf
  Packungsbeilage und kennzeichnet den Dokumentations-Charakter.
- Bericht: Homoeopathika erscheinen als eigene Gruppe, getrennt von den
  Naehrstoff-Produkten (Umsetzung bei ExportBuilder-Anpassung).
- Apple-Relevanz: Formulierungen strikt nach
  launch/apple-review-leitfaden.md (kein Wirkversprechen, kein
  Dosier-Imperativ, Packungsbeilagen-Verweis).

## Ausbau Pruef-Schleuse: schluessellose Scans (Backlog)
Produkte ohne EAN/PZN (Kleinsthersteller, Eigenimporte) funktionieren
fuer die Nutzerin voll lokal, erreichen die Schleuse aber nicht (PK ist
der Barcode). Ausbau: product_cache auf UUID-PK + nullable barcode,
schluessellose verified-Eintraege dienen der redaktionellen
KATALOG-Aufnahme (Namenssuche), nie der Barcode-Aufloesung. Kein Name
als Produktschluessel (Ontologie: Produkt ≠ Name, Varianten kollidieren).

## Naechstes Arbeitspaket: Lebensphasen-Hinweise fuer die Kraeuter
Befund (2026-08-10, Nadines Stillzeit-Frage): lifeStageAdvisories.js
deckt erst 7 Substanzen aktiv ab; die 27 Kraeuter tragen ihre
Schwangerschafts-/Stillzeit-/Kinder-Saetze nur im cautionNote der Karte.
Umsetzung: je Kraut Advisory-Eintraege ableiten (Muster ashwagandha):
- "nicht anwenden" in der Quelle → CONTRAINDICATED (z. B. Salbei
  Stillzeit [reduziert Milchbildung], Wermut, Mutterkraut, Suessholz
  Schwangerschaft, Baerentraube, Weidenrinde letztes Trimenon + Kinder
  mit fieberhaften Infekten)
- "Daten fehlen" → MEDICAL mit ehrlichem Text ("keine ausreichenden
  Daten, uebliche aerztliche Abklaerung")
- Arnika NICHT (nur aeusserlich, eigener Warnhinweis reicht)
Plus EN-Overlay (data/en/lifeStageAdvisories.js) und bestehende
data-en-Tests. KEINE neuen Behauptungen: nur was die cautionNotes/
EMA-Monographien bereits hergeben. Pfefferminz-Stillzeit NUR aufnehmen,
wenn eine Quelle es traegt (aktuell nicht belegt).

## Erkrankungs-Warnschicht: UMGESETZT 2026-08-09 (spaetabends)
data/healthConditions.js (8 Erkrankungen, 26 belegte Bezuege,
Zitate programmatisch extrahiert), ProfileCheck-Verdrahtung,
Erkrankungs-Chips im Profil, tests/health-conditions.test.mjs.
EN-Overlay der Zitate: ebenfalls umgesetzt (data/en/healthConditions.js, programmatisch extrahiert, testerzwungen). Offen: weitere Erkrankungen
sobald neue cautionNotes sie belegen. Urspruengliches Design darunter:

## Arbeitspaket-Design (Referenz, umgesetzt)
`data/healthConditions.js` analog zu medicationClasses.js: Erkrankungen
(Bluthochdruck, Nieren-/Lebererkrankung, Diabetes, Gerinnungsstoerungen,
Schilddruese, Salicylat-Unvertraeglichkeit, Epilepsie) verweisen mit
WOERTLICHEM Zitat auf bereits belegte cautionNotes in substances.js;
Zitat-Integritaetstest wie tests/medication-en.test.mjs; Verdrahtung in
ProfileCheck.js (profile.conditions existiert schon); Formulierung immer
"dazu ist ein Hinweis hinterlegt". KEINE Gewichts-/Groessenerfassung
(Art.-9-Datensparsamkeit, MDR-Abgrenzung); Koffein-Sonderfall deskriptiv
("EFSA nennt 3 mg/kg"), ohne Gewicht zu erheben.

## Lohnhersteller (separate Kategorie, NICHT im Produkt-Seed)
- **DE:** Plantafood Medical, Biohealth International, Goerlich Pharma,
  Nutrilo, SternLife, Aakamp
- **AT:** MELASAN, vis vitalis, Bioflora LAB, HKS/1Q Health, R&M,
  Natural Power, SonnenMoor, Novogenia
- **CH:** FormuLAB, SFI Health Solutions, Swiss Nutrition Solutions
Relevanz: Hintergrundwissen und Markeninhaber-Zuordnung, keine
Produktdaten im Seed.

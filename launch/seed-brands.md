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

## Lohnhersteller (separate Kategorie, NICHT im Produkt-Seed)
- **DE:** Plantafood Medical, Biohealth International, Goerlich Pharma,
  Nutrilo, SternLife, Aakamp
- **AT:** MELASAN, vis vitalis, Bioflora LAB, HKS/1Q Health, R&M,
  Natural Power, SonnenMoor, Novogenia
- **CH:** FormuLAB, SFI Health Solutions, Swiss Nutrition Solutions
Relevanz: Hintergrundwissen und Markeninhaber-Zuordnung, keine
Produktdaten im Seed.

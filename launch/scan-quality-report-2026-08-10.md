# Scan-Qualitaetsvergleich: Produktiv-Default vs. Haiku

Stand: 2026-08-10 · 10 von 10 Fotos ausgewertet

Beurteilung gegen das ECHTE Etikett vornehmen: Eine Zeile gilt als korrekt,
wenn Substanzname UND Menge stimmen. Kill-Kriterium (Council 2026-08-09):
unter 50 % korrekte Zeilen bei Haiku bis 2026-08-16 → Umstellung tot.

## IMG_8857.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Oregano Öl Wild Herbal+ und Olivenöl | Oregano Öl Wild Herbalt und Olivenöl |
| Konfidenz | 30 | 45 |
| Wirkstoffe | (keine erkannt) | (keine erkannt) |
| Unsicherheiten | Nur die Vorderseite des Etiketts ist sichtbar - keine Nährstoff-/Zutatentabelle erkennbar; Keine Mengenangaben zu Oreganoöl, Olivenöl oder Carvacrol lesbar; Empfohlene Verzehrmenge und Einnahmehinweis nicht sichtbar; Kein Strichcode/EAN oder PZN im Bild; Seitlicher Text am linken Etikettenrand abgeschnitten und unleserlich | Nährstoff-/Zutatentabelle nicht lesbar, nur Vorderseite des Produkts sichtbar; Genaue Wirkstoffmengen und -formen nicht erkennbar; Dosierungsangaben nicht lesbar; Einnahmehinweise nicht sichtbar; Barcode nicht sichtbar |
| Output-Tokens | 309 | 176 |

## IMG_8858.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | NMN | NMN |
| Konfidenz | 45 | 50 |
| Wirkstoffe | NMN (Nicotinamid-Mononukleotid): 500 mg | NMN: 500 mg |
| Unsicherheiten | Die seitliche Textpassage auf dem Etikett (mutmasslich Zutaten, Verzehrempfehlung und Warnhinweise) ist stark verkuerzt/unscharf und nicht lesbar.; Portionsgroesse (Anzahl Kapseln pro Portion) nicht erkennbar; '500 mg per serving' bezieht sich auf eine nicht lesbare Portionsangabe.; Kein Strichcode bzw. keine Ziffernfolge auf dem Foto sichtbar. | Keine vollständige Zutatenliste sichtbar - nur die Vorderseite des Etiketts erkennbar, Nährstofftabelle und weitere Details nicht lesbar; Strichcode-Ziffern nicht klar erkennbar auf dem Foto |
| Output-Tokens | 322 | 154 |

## IMG_8859.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Vitamin B Komplex | Vitamin B Komplex |
| Konfidenz | 35 | 45 |
| Wirkstoffe | (keine erkannt) | (keine erkannt) |
| Unsicherheiten | Nur die Vorderseite des Etiketts sichtbar - keine Nährstofftabelle mit Mengenangaben lesbar; Keine Einnahmeempfehlung oder Verzehrmenge erkennbar; Keine Warnhinweise sichtbar; Kein Strichcode/EAN oder PZN im Bild; Angabe 'Alle 8 B-Vitamine mit veganem Vitamin D3 und Vitamin C' ist Produktbeschreibung ohne Mengenangaben | Nährstofftabelle/Zutatenaufstellung nicht lesbar auf dem vorliegenden Foto; Dosierungsangabe nicht erkennbar; Keine Nährstoffwerte oder Wirkstoffe mit Mengen erkennbar; Barcode nicht sichtbar |
| Output-Tokens | 284 | 157 |

## IMG_8860.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Methylenblau - Hochwertige 1% Lösung | Methylenblau |
| Konfidenz | 45 | 45 |
| Wirkstoffe | Methylenblau (1% Lösung): [Menge fehlt] | Methylenblau: 1 % |
| Unsicherheiten | Nur die Vorderseite des Etiketts sichtbar - keine Nährstoff-/Zutatentabelle, keine Verzehrempfehlung, keine Warnhinweise lesbar; Wirkstoffmenge pro Tropfen bzw. pro Portion nicht angegeben/lesbar; Handschriftlicher Namenszug auf dem Etikett nur teilweise lesbar ('Dr. med. Harald Pf...'); Kein Strichcode/keine PZN im Bild sichtbar | Genaue Wirkstoffmenge pro Tropfen nicht lesbar; Einnahmehinweise nicht sichtbar; Inhaltsmenge in ml nicht vollständig lesbar (2600 Tropfen erkannt, aber Gesamtvolumen unklar); Weitere Zutaten/Hilfsstoffe nicht erkennbar |
| Output-Tokens | 324 | 191 |

## IMG_8861.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Mariendistel Leber Komplex | MariendistelLeberKomplex |
| Konfidenz | 30 | 35 |
| Wirkstoffe | (keine erkannt) | (keine erkannt) |
| Unsicherheiten | Die Nährstoff-/Zutatentabelle ist auf dem Foto nur seitlich angeschnitten und unleserlich (erkennbar sind bruchstückhaft Begriffe wie 'Cholin', 'Artischocke', 'Curcuma(?)', 'Zink'); Verzehrempfehlung und Einnahmehinweis nicht lesbar; Kein Strichcode/keine EAN lesbar; Mengenangaben der Wirkstoffe nicht lesbar | Nährstofftabelle und Zutaten nicht lesbar auf dem Foto; Dosierungsangaben nicht sichtbar; Barcode nicht auf dem Foto erkennbar; Einnahmehinweise nicht lesbar |
| Output-Tokens | 277 | 177 |

## IMG_8862.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Kamillen Konzentrat | Kamillen Konzentrat |
| Konfidenz | 30 | 45 |
| Wirkstoffe | Kamille: [Menge fehlt] | (keine erkannt) |
| Unsicherheiten | Die Zutaten-/Nährstofftabelle ist auf dem Foto nicht lesbar (seitlicher Etikettentext unscharf und verdeckt); Mengenangaben der Inhaltsstoffe nicht erkennbar; Dosierung und Anwendungshinweise nicht lesbar; Kein Strichcode bzw. keine PZN im Bild erkennbar; Auf dem Etikett steht 'Mit echter Kamille'; konkrete Wirkstoffform/-menge nicht angegeben bzw. nicht lesbar | Keine Nährstoff-/Zutatentabelle mit Mengenangaben sichtbar; Dosierungshinweise nicht lesbar; Detaillierte Wirkstoffkonzentrationen nicht erkennbar |
| Output-Tokens | 323 | 179 |

## IMG_8863.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Otovowen | Otovowen |
| Konfidenz | 38 | 45 |
| Wirkstoffe | Aconitum napellus (Dil. D6): [Menge fehlt]<br>Chamomilla recutita: [Menge fehlt]<br>Hydrargyrum bicyanatum (Dil. D4): 0,075 ml<br>Nicht lesbarer Bestandteil (Dil. D4): 0,075 ml<br>Sanguinaria canadensis (Ø (Urtinktur)): 0,075 ml | Chamomilla recutita: [Menge fehlt]<br>Hydrargyrum bichromicum: [Menge fehlt]<br>Dil. D4: 0,075 ml<br>Dil. D4: 0,075 ml<br>canadensis: 0,0 |
| Unsicherheiten | Die Zusammensetzungsangaben sind teilweise durch den Bildrand abgeschnitten und unscharf; Mengenangaben und weitere Bestandteile nicht vollstaendig lesbar; Zulassungsnummer nur teilweise lesbar: 'Zul.-Nr. 6406156...'; Anwendungsgebiete und Hinweistext (u. a. 'Homoeopathisches Arzneimittel für Kinder ...') abgeschnitten; Darreichungsform: 'Mischung zum Ein...' (wahrscheinlich zum Einnehmen), Text abgeschnitten; Herstelleradresse teilweise abgeschnitten: 'Herrschinger Str. ..., 82266 Inning'; Keine Angaben zur Dosierung bzw. Verzehrmenge im Bild sichtbar | Dosierungsangabe nicht lesbar; Verzehrmenge nicht sichtbar auf dem Foto; Einige Zutatenangaben teilweise abgeschnitten oder unklar; Barcode nicht lesbar auf dem Foto |
| Output-Tokens | 622 | 333 |

## IMG_8865.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | TMG Trimethylglycine | TMG Trimethylglycine |
| Konfidenz | 62 | 75 |
| Wirkstoffe | Trimethylglycin (TMG): 500 mg | Trimethylglycin: 500 mg |
| Unsicherheiten | Nur die Vorderseite des Etiketts sichtbar; keine Nährstofftabelle, Zutatenliste oder Verzehrempfehlung lesbar; Angabe '500mg PER CAPSULE' als Gehalt pro Kapsel interpretiert; empfohlene Tagesdosis nicht angegeben; Kein Strichcode/EAN oder PZN im Bild erkennbar | Barcode nicht lesbar auf dem Foto; Detaillierte Einnahmeanweisungen nicht sichtbar; Vollständige Zutatenliste und weitere Hinweise nicht lesbar |
| Output-Tokens | 290 | 148 |

## IMG_8866.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | SCUTELANDRO liposomal (NoCov) | SCUTELANDRO Liposomial (NoCov) |
| Konfidenz | 52 | 45 |
| Wirkstoffe | (keine erkannt) | (keine erkannt) |
| Unsicherheiten | Markenname oben auf dem Etikett nur schwer lesbar (vermutlich 'BioPure'); Keine Zutaten- oder Nährstofftabelle auf dem Foto sichtbar; Chargennummer schwer lesbar: 'ChNr. 4NCV1213-WFriQ' (unsicher) | Keine Nährstofftabelle/Zutatenliste lesbar auf dem Foto; Wirkstoffmenge und -form nicht erkennbar; Barcode nicht sichtbar; Marke und Produktname teilweise verdeckt oder unklar |
| Output-Tokens | 300 | 194 |

## IMG_8867.HEIC

| | Default | Haiku |
|---|---|---|
| Modell | claude-opus-5 | claude-haiku-4-5-20251001 |
| Produkt | Löwenzahnblatt-Extrakt | Löwenzahnblatt-Extrakt |
| Konfidenz | 35 | 35 |
| Wirkstoffe | (keine erkannt) | (keine erkannt) |
| Unsicherheiten | Es ist nur die Vorderseite des Etiketts sichtbar – keine Zutaten- oder Nährstofftabelle erkennbar; Keine Angaben zu Verzehrmenge, Einnahmehinweisen oder Warnhinweisen auf dem Foto lesbar; Kein Strichcode/EAN oder PZN sichtbar; Produktname evtl. mit Bindestrich-Trennung über zwei Zeilen ('Löwenzahnblatt-Extrakt') | Keine Nährstoff-/Zutatentabelle sichtbar - nur Produktname, Marke und Inhalt (100 ml) sind lesbar; Dosierungsangaben nicht erkennbar; Wirkstoffe und deren Mengen nicht erkennbar; Einnahmehinweise nicht sichtbar; Warnhinweise nicht sichtbar |
| Output-Tokens | 310 | 165 |

---

## Auswertung gegen die echten Etiketten (redaktionell, 2026-08-10)

Testmaterial: 10 Einzelfotos (ueberwiegend Vorderseiten). Beide Modelle
verhielten sich ehrlich, wo nichts lesbar war (keine erfundenen Werte,
beidseitig). Auswertbar im Sinne des Kill-Kriteriums (Substanz UND
Menge) waren die Faelle NMN, TMG, Methylenblau und Otovowen (5 Zeilen).

| Fall | Default (Opus) | Haiku |
|---|---|---|
| NMN 500 mg | korrekt, Portions-Vorbehalt benannt | korrekt |
| TMG 500 mg | korrekt, Bezugsgroesse "pro Kapsel" explizit | korrekt, ohne Bezugsgroessen-Hinweis |
| Methylenblau | Menge korrekt leer gelassen (Etikett nennt keine Dosis) | "1 %" als Menge eingetragen (Konzentration ist keine Dosis) |
| Otovowen (5 Zeilen, Arznei-Etikett) | 4/5 korrekt, Unlesbares ehrlich als unlesbar | 1/5 korrekt: "bichromicum" statt "bicyanatum" (ANDERE Verbindung), Fragment-Zeilen ("Dil. D4" als Name, "canadensis: 0,0") |

Zeilen-Trefferquote Substanz+Dosis: Default ~8/9, Haiku ~4/9 (unter 50%).

Zwei strukturelle Befunde gegen die Umstellung:
1. Haiku verstuemmelt auf dem einzigen anspruchsvollen Etikett
   Substanznamen zu ANDEREN Verbindungen, statt Unlesbares leer zu
   lassen. Das ist die gefaehrlichste Fehlerklasse der App.
2. Haiku gibt durchgehend HOEHERE Konfidenzwerte bei gleicher oder
   schlechterer Leistung (z. B. 45 vs. 30 bei identisch leerem
   Ergebnis) — die Konfidenz waere als Nutzersignal entwertet.

VERDIKT: Kill-Kriterium ausgeloest (unter 50 % vor dem 2026-08-16).
Die Haiku-Umstellung ist tot; ANALYZE_MODEL bleibt Opus. Einordnung:
Stichprobe klein und vorderseitenlastig, aber die Fehlerklasse
(verstuemmelte Substanznamen mit hoher Konfidenz) ist kein
Mengenproblem, sondern ein Vertrauensproblem — Qualitaet ist nicht
verhandelbar.

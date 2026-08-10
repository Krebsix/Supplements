-- Vollpruefung Welle 8 (Gummis): drei Bears-with-Benefits-EANs waren
-- auf den Quellen nicht belegbar (Quelltext nennt andere GTINs je
-- Packungsgroesse) — unbelegte Cache-Schluessel werden GELOESCHT, bevor
-- sie ein falsches Produkt aufloesen. Mivolis-Baerchen: Naehrwerttabelle
-- (Tagesdosis 3 Stueck) belegt nachgetragen.

delete from public.product_cache
where barcode in ('710535656794', '745760685165', '4260717770535')
  and language = 'de' and model = 'seed-2026-08-10';

insert into public.product_cache (barcode, language, result, model, verified)
values ('4066447832846', 'de', '{"productName": "Mivolis Multivitamin-Bärchen für Kinder", "brand": "Mivolis", "confidence": 0, "ingredients": [{"name": "Niacin", "form": null, "amount": "6", "unit": "mg"}, {"name": "Biotin", "form": null, "amount": "9.4", "unit": "µg"}, {"name": "Vitamin B2", "form": null, "amount": "0.5", "unit": "mg"}, {"name": "Vitamin B1", "form": null, "amount": "0.4", "unit": "mg"}, {"name": "Vitamin B12", "form": null, "amount": "1", "unit": "µg"}, {"name": "Vitamin B6", "form": null, "amount": "0.4", "unit": "mg"}, {"name": "Vitamin C", "form": null, "amount": "30", "unit": "mg"}, {"name": "Vitamin D", "form": null, "amount": "2.5", "unit": "µg"}, {"name": "Vitamin E", "form": null, "amount": "4.5", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben/Open Food Facts, ODbL). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true)
on conflict (barcode, language) do nothing;

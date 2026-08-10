-- Vollpruefung Altbestand Charge 2 (2026-08-10):
-- 1) Zwei Doppelherz-Cache-Eintraege GELOESCHT, deren Mengen in der
--    Quelle (OFF) nicht belegbar sind — unbelegte Mengen duerfen nicht
--    per Barcode-Scan ausgeliefert werden.
-- 2) Cetebe-Namen an die Herstellerseite angeglichen; Immun Aktiv:
--    Holunder-BLUETEN-Extrakt (Seite belegt Bluete, nicht Beere).
-- 3) Neu belegte EAN-Schluessel: Doppelherz Melatonin, Dextro Salt Tablets.

delete from public.product_cache
where barcode in ('4009932135565', '4009932131253')
  and language = 'de' and model like 'seed-%';

update public.product_cache
set result = jsonb_set(result, '{productName}', '"Extra-C 600 mg"')
where barcode = '173609' and language = 'de';

update public.product_cache
set result = jsonb_set(jsonb_set(result,
  '{productName}', '"Immun Aktiv +Pflanzenextrakte"'),
  '{ingredients}', '[{"name": "Vitamin C", "form": null, "amount": "250", "unit": "mg"}, {"name": "Vitamin D3", "form": null, "amount": "5.0", "unit": "µg"}, {"name": "Zink", "form": null, "amount": "5.0", "unit": "mg"}, {"name": "Selen", "form": null, "amount": "28", "unit": "µg"}, {"name": "Holunderblütenextrakt", "form": null, "amount": "100", "unit": "mg"}, {"name": "Sanddornfruchtextrakt", "form": null, "amount": "25", "unit": "mg"}, {"name": "Echinaceawurzelextrakt", "form": null, "amount": "20", "unit": "mg"}, {"name": "Curcumawurzelextrakt", "form": null, "amount": "17", "unit": "mg"}]'::jsonb)
where barcode = '17513442' and language = 'de';

insert into public.product_cache (barcode, language, result, model, verified)
values
('4009932137880', 'de', '{"productName": "Melatonin", "brand": "Doppelherz", "confidence": 0, "ingredients": [{"name": "Melatonin", "form": null, "amount": "1", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben/Open Food Facts, ODbL). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4046802213459', 'de', '{"productName": "Salt Tablets Lemon", "brand": "Dextro Energy", "confidence": 0, "ingredients": [{"name": "Natrium", "form": "Natriumcitrat", "amount": "104", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben/Open Food Facts, ODbL). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true)
on conflict (barcode, language) do nothing;

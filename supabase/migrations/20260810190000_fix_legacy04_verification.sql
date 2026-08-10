-- Vollpruefung Altbestand Charge 4 (2026-08-10):
-- Kijimea Reizdarm PRO ist Medizinprodukt Klasse IIb, die Keimzahl-
-- Angabe war nicht belegbar — ingredients im Cache geleert. Drei neu
-- belegte EAN (GloryFeel x2, Kijimea FloraCare) als Scan-Schluessel.

update public.product_cache
set result = jsonb_set(result, '{ingredients}', '[]'::jsonb)
where barcode = '4260344391301' and language = 'de';

insert into public.product_cache (barcode, language, result, model, verified)
values
('4260619420002', 'de', '{"productName": "Magnesium Citrat Kapseln", "brand": "GloryFeel", "confidence": 0, "ingredients": [{"name": "Magnesium", "form": null, "amount": "400", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4260619422860', 'de', '{"productName": "Vitamin C gepuffert + Zink Kapseln", "brand": "GloryFeel", "confidence": 0, "ingredients": [{"name": "Vitamin C", "form": null, "amount": "1000", "unit": "mg"}, {"name": "Zink", "form": null, "amount": "20", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4260344391578', 'de', '{"productName": "Kijimea FloraCare", "brand": "Kijimea", "confidence": 0, "ingredients": [{"name": "Milchsäurebakterien (33 Stämme)", "form": "u.a. L. crispatus SG18/QL33/ID63, L. rhamnosus ZR54/AC94/IX51/HM83/BP73/VN76, L. fermentum LB91/LR28", "amount": "10", "unit": "Mrd. KBE je Kapsel"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true)
on conflict (barcode, language) do nothing;

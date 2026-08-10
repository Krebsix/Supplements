-- Vollpruefung Altbestand Chargen 7+10 (2026-08-10):
-- 1) Zwei unbelegte EAN-Schluessel GELOESCHT (Natural Elements,
--    OMNi-BiOTiC PANDA — Nummern auf den Quellen nicht auffindbar).
-- 2) ZeinPharma: Bezugsgroesse der Menge praezisiert (Tagesdosis,
--    3 Kapseln).
-- 3) Neu belegte Schluessel: ZEC+, 2x gloryfeel (EAN), 4x OEKOPHARM (PZN).

delete from public.product_cache
where barcode in ('4260558410324', '9120001437368')
  and language = 'de' and model like 'seed-%';

update public.product_cache
set result = jsonb_set(result, '{ingredients}', '[{"name": "Magnesium", "form": null, "amount": "375", "unit": "mg pro Tagesdosis (3 Kapseln)"}]'::jsonb)
where barcode = '4260085382989' and language = 'de';

insert into public.product_cache (barcode, language, result, model, verified)
values
('4260492771673', 'de', '{"productName": "Health+ Magnesium-Bisglycinat", "brand": "ZEC+", "confidence": 0, "ingredients": [{"name": "Magnesium", "form": null, "amount": "300", "unit": "mg pro Portion (3 Kapseln)"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4260619422624', 'de', '{"productName": "Natürliches Jod Tabletten", "brand": "gloryfeel", "confidence": 0, "ingredients": [{"name": "Jod", "form": null, "amount": "225", "unit": "µg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4260619422686', 'de', '{"productName": "Kaliumcitrat Kapseln", "brand": "gloryfeel", "confidence": 0, "ingredients": [{"name": "Kalium", "form": null, "amount": "800", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4855738', 'de', '{"productName": "ÖKOPHARM Magnesium PRO Brausepulver (für den Sport)", "brand": "OEKOPHARM", "confidence": 0, "ingredients": [{"name": "Magnesium", "form": null, "amount": "192", "unit": "mg"}, {"name": "Kalium", "form": null, "amount": "360", "unit": "mg"}, {"name": "Zink", "form": null, "amount": "7.5", "unit": "mg"}, {"name": "Vitamin C", "form": null, "amount": "200", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4363449', 'de', '{"productName": "ÖKOPHARM Vitamin D Kapseln", "brand": "OEKOPHARM", "confidence": 0, "ingredients": [{"name": "Vitamin D3", "form": null, "amount": "50", "unit": "µg"}, {"name": "Vitamin K2", "form": null, "amount": "19", "unit": "µg"}, {"name": "Vitamin C", "form": null, "amount": "20", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4148490', 'de', '{"productName": "ÖKOPHARM Hochdosierte Vitamin C Kapseln", "brand": "OEKOPHARM", "confidence": 0, "ingredients": [{"name": "Vitamin C", "form": null, "amount": "400", "unit": "mg"}, {"name": "Citrus-Bioflavonoide", "form": null, "amount": "60", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true),
('4099225', 'de', '{"productName": "ÖKOPHARM Zink Wirkkombination", "brand": "OEKOPHARM", "confidence": 0, "ingredients": [{"name": "Zink", "form": null, "amount": "15", "unit": "mg"}, {"name": "Kupfer", "form": null, "amount": "0.5", "unit": "mg"}, {"name": "Vitamin C", "form": null, "amount": "80", "unit": "mg"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true)
on conflict (barcode, language) do nothing;

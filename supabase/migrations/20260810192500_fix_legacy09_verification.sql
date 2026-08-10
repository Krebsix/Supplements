-- Vollpruefung Altbestand Charge 9 (2026-08-10): Vital-Proteins-EAN
-- gehoerte zu einer anderen Produktvariante — Cache-Eintrag geloescht
-- (war zudem mit fuehrender Null gespeichert und damit nie scanbar).
-- Neu belegter Creamer-Schluessel aus dem Hersteller-JSON.

delete from public.product_cache
where barcode = '0850013279005' and language = 'de' and model like 'seed-%';

insert into public.product_cache (barcode, language, result, model, verified)
values ('810089955197', 'de', '{"productName": "Original Collagen Creamer (Coconut)", "brand": "Vital Proteins", "confidence": 0, "ingredients": [{"name": "Collagen Peptides", "form": null, "amount": "10", "unit": "g"}], "dosage": {"amount": null, "unit": null}, "intakeInstruction": null, "warnings": [], "uncertainties": ["Aus kuratierter DACH-Produktrecherche (Herstellerangaben). Nicht vom Etikett gelesen; Angaben vor Übernahme prüfen."], "certifications": []}'::jsonb, 'seed-2026-08-10', true)
on conflict (barcode, language) do nothing;

-- Korrekturen aus der Vollpruefung Welle 9 (2026-08-10):
-- Nr.-7-Globuli sind D12 (Pflichttext der PZN 10545924), und drei
-- DHU-Praeparate tragen echte Anwendungsgebiete, sind also zugelassene
-- Arzneimittel — Hinweistext entsprechend ersetzt.

update public.product_cache
set result = jsonb_set(result, '{productName}',
  '"DHU Schüßler-Salz Nr. 7 Magnesium phosphoricum D12, 10 g Globuli"')
where barcode = '10545924' and language = 'de';

update public.product_cache
set result = jsonb_set(result, '{warnings}', '["Dieses Produkt ist als Arzneimittel zugelassen; für Anwendung und Dosierung gilt die Packungsbeilage."]')
where barcode in ('12608698', '15528824', '13699929') and language = 'de';

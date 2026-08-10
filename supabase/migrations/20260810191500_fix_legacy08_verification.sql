-- Vollpruefung Altbestand Charge 8 (2026-08-10): Sponser-Produktname
-- an die Herstellerseite angeglichen ("Tabs" ist nicht Teil des Namens).

update public.product_cache
set result = jsonb_set(result, '{productName}', '"Sponser Electrolytes Berry"')
where barcode = '7611174121373' and language = 'de';

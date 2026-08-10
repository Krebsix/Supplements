-- Vollpruefung Welle 9b (Bachblueten): Produktname ohne den nur im
-- URL-Slug gefuehrten Zusatz "Junior" (H1 und Breadcrumb der
-- Herstellerseite sind massgeblich).

update public.product_cache
set result = jsonb_set(result, '{productName}',
  '"Murnauers Bachblüten KLEINES TRÄUMERLE Globulini"')
where barcode = '01605900' and language = 'de';

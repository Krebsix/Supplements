-- Pruef-Schleuse fuer den geteilten Produkt-Cache (Nadines Entscheidung
-- 2026-08-10): Nur redaktionell geprueftes Material wird an andere
-- Nutzerinnen ausgeliefert. Nutzer-Scans landen als verified=false in
-- der Schleuse und werden erst nach Pruefung freigegeben (UPDATE ...
-- SET verified = true). Kuratierte Seed-Eintraege gelten als geprueft.

alter table public.product_cache
  add column if not exists verified boolean not null default false;

update public.product_cache set verified = true where model like 'seed-%';

-- Nachschlagen filtert auf verified in der Edge Function; ein Index
-- haelt den Pfad schnell.
create index if not exists product_cache_verified_idx
  on public.product_cache (barcode, language, verified);

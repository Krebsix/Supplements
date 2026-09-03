-- Formula Versioning (Roadmap-Baustein 1, launch/roadmap-intelligence.md):
-- Product ID != Formula ID. Ein Hersteller aendert die Rezeptur unter
-- gleichem Namen/Barcode (auch DE/AT/CH-Rezepturunterschiede desselben
-- Produkts). Bisher war (barcode, language) der Primaerschluessel: ein
-- neuer Vision-Treffer zu einem bereits gecachten Barcode wurde beim
-- Insert schlicht verworfen (Unique-Konflikt 23505, "gewolltes
-- Verhalten" im Code-Kommentar) -- eine veraltete oder falsche
-- Rezeptur blieb dadurch unbegrenzt stehen. Ab jetzt bekommt eine
-- tatsaechlich abweichende Rezeptur eine neue Version, die alte bleibt
-- als Historie erhalten (superseded_at gesetzt).
--
-- superseded_at ist NULL fuer genau die aktuell gueltige Version. Die
-- alte Primary-Key-Eindeutigkeit (barcode, language) wird durch einen
-- PARTIELLEN Unique-Index auf die aktuelle Version ersetzt -- historische
-- Versionen duerfen denselben Barcode/Sprache mehrfach tragen.

alter table public.product_cache
  add column if not exists id uuid not null default gen_random_uuid(),
  add column if not exists formula_version integer not null default 1,
  add column if not exists valid_from timestamptz not null default now(),
  add column if not exists superseded_at timestamptz;

-- Bestehende Zeilen: valid_from = created_at (wahrer Beginn der Version),
-- nicht der Migrationszeitpunkt.
update public.product_cache set valid_from = created_at where valid_from is null or valid_from = now();

alter table public.product_cache drop constraint if exists product_cache_pkey;
alter table public.product_cache add constraint product_cache_pkey primary key (id);

-- Ersatz fuer die alte (barcode, language)-Eindeutigkeit: gilt nur fuer
-- die jeweils aktuelle Version. Der Lookup-Pfad filtert ebenfalls auf
-- superseded_at is null (siehe analyze-supplement/index.ts).
create unique index if not exists product_cache_current_idx
  on public.product_cache (barcode, language)
  where superseded_at is null;

-- Versionshistorie eines Produkts abfragen (redaktionelle Ansicht,
-- spaeter): alle Versionen eines Barcodes in Reihenfolge.
create index if not exists product_cache_history_idx
  on public.product_cache (barcode, language, formula_version);

comment on column public.product_cache.formula_version is
  'Fortlaufend je (barcode, language), beginnend bei 1. Erhoeht sich nur bei tatsaechlich abweichender Zutatenliste oder Dosierung (formulaVersioning.ts hasFormulaChanged).';
comment on column public.product_cache.superseded_at is
  'NULL = aktuell gueltige Version. Gesetzt, sobald eine neuere Version derselben (barcode, language) angelegt wurde.';

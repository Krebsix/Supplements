-- Geteilter Produkt-Cache (Decision 2026-08-09, "Schicht 1"):
-- Erfolgreiche Foto-Analysen werden, wenn ein Barcode bekannt ist, als
-- reine Produktdaten je (Barcode, Sprache) abgelegt. Der naechste Scan
-- desselben Produkts wird ohne Claude-Aufruf beantwortet.
--
-- Enthaelt AUSSCHLIESSLICH Produktdaten (Etiketteninhalt) — keine Fotos,
-- keine Nutzerkennungen, keine Gesundheitsdaten. Zugriff laeuft NUR ueber
-- die Edge Function analyze-supplement (Service Role); es gibt bewusst
-- keine RLS-Policy fuer anon/authenticated.

create table if not exists public.product_cache (
  barcode text not null,
  language text not null default 'de',
  result jsonb not null,
  model text,
  hit_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (barcode, language),
  constraint product_cache_barcode_format check (barcode ~ '^[0-9]{6,14}$')
);

alter table public.product_cache enable row level security;

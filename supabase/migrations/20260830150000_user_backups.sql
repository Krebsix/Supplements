-- Cloud-Backup (Spec 2026-08-30): ein verschluesselter Stand je Nutzerin.
-- ciphertext ist AES-256-GCM ueber das JSON-Backup (CloudBackup.js), mit
-- dem Datenschluessel verschluesselt, der das Geraet nie verlaesst. Der
-- Server kann den Inhalt nicht lesen. Keine Klartext-Zaehler: Anzahl
-- Praeparate oder Laborwerte waeren Metadaten ueber Gesundheitsdaten.

create table if not exists public.user_backups (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ciphertext text not null,
  payload_version integer not null default 1,
  device_label text not null default '',
  exported_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint user_backups_ciphertext_format check (ciphertext ~ '^[0-9a-f]{24}:[0-9a-f]+$'),
  -- rund 3 MB Klartext; ein realer Bestand liegt weit darunter
  constraint user_backups_ciphertext_size check (length(ciphertext) <= 6000000),
  constraint user_backups_label_length check (char_length(device_label) <= 60)
);

alter table public.user_backups enable row level security;

-- (select auth.uid()) statt auth.uid(): einmal je Anfrage ausgewertet.
create policy user_backups_select_own on public.user_backups
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy user_backups_insert_own on public.user_backups
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy user_backups_update_own on public.user_backups
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Loeschen erlaubt: "Stand auf dem Server loeschen" (Widerruf ohne
-- Konto-Loeschung). Bei Konto-Loeschung faellt die Zeile per Cascade.
create policy user_backups_delete_own on public.user_backups
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.touch_user_backups_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists user_backups_touch on public.user_backups;
create trigger user_backups_touch
  before update on public.user_backups
  for each row execute function public.touch_user_backups_updated_at();

-- Konto-Grundlage (Spec 2026-08-29): eine Zeile je Nutzerin mit den
-- Umschlaegen des Datenschluessels. Enthaelt KEINEN Klartext-Schluessel,
-- kein Passwort, keinen Recovery-Key. Der Server kann damit allein nichts
-- entschluesseln (AccountCrypto.js).
--
-- Befuellung: Der Client schreibt den Datensatz bei signUp() in die
-- Nutzer-Metadaten (options.data.key_record); der Trigger unten kopiert
-- ihn hierher. Grund: Vor der E-Mail-Bestaetigung hat der Client keine
-- Session und darf unter RLS nichts schreiben.

create table if not exists public.user_keys (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kdf jsonb not null,
  kdf_salt text not null,
  wrapped_key_pw text not null,
  wrapped_key_recovery text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_keys_salt_hex check (kdf_salt ~ '^[0-9a-f]{32}$'),
  constraint user_keys_pw_format check (wrapped_key_pw ~ '^[0-9a-f]{24}:[0-9a-f]+$'),
  constraint user_keys_recovery_format check (wrapped_key_recovery ~ '^[0-9a-f]{24}:[0-9a-f]+$')
);

alter table public.user_keys enable row level security;

-- (select auth.uid()) statt auth.uid(): einmal je Anfrage ausgewertet,
-- nicht je Zeile (Supabase-Empfehlung fuer RLS-Performance).
create policy user_keys_select_own on public.user_keys
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy user_keys_insert_own on public.user_keys
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy user_keys_update_own on public.user_keys
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Kein delete fuer Clients: Die Zeile faellt per Cascade, wenn die
-- Edge Function delete-account den auth.users-Eintrag loescht.

create or replace function public.handle_new_user_keys()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := new.raw_user_meta_data -> 'key_record';
begin
  if rec is not null and rec ? 'wrapped_key_pw' then
    insert into public.user_keys (user_id, kdf, kdf_salt, wrapped_key_pw, wrapped_key_recovery)
    values (
      new.id,
      rec -> 'kdf',
      rec ->> 'kdf_salt',
      rec ->> 'wrapped_key_pw',
      rec ->> 'wrapped_key_recovery'
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

-- Nur der Trigger darf die Funktion ausfuehren, kein Client. Der Insert
-- in auth.users laeuft unter supabase_auth_admin, deshalb dort explizit
-- erlauben.
revoke execute on function public.handle_new_user_keys() from public, anon, authenticated;
grant execute on function public.handle_new_user_keys() to supabase_auth_admin;

drop trigger if exists on_auth_user_created_keys on auth.users;
create trigger on_auth_user_created_keys
  after insert on auth.users
  for each row execute function public.handle_new_user_keys();

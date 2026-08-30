-- Beta-Anmeldungen von der Website (web/), geschrieben ausschliesslich von
-- der Edge Function beta-signup mit Service-Role. Eine Zeile je Adresse.
--
-- Kein Double-Opt-In, kein Mailversand: Die Einladung verschickt Apple
-- ueber TestFlight, sobald Nadine die Adresse dort eintraegt. Die Liste
-- wird nach Ende der Beta geloescht (Datenschutzerklaerung, Abschnitt
-- "Website (mysuplea.com)").

create table if not exists public.beta_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'de',
  source text not null default 'website',
  created_at timestamptz not null default now(),
  -- Kleinschreibung erzwingt die Function; die Constraints halten den
  -- Datensatz auch dann sauber, wenn jemand direkt schreibt.
  constraint beta_signups_email_lower check (email = lower(email)),
  constraint beta_signups_email_len check (char_length(email) between 3 and 254),
  constraint beta_signups_locale check (locale in ('de', 'en')),
  constraint beta_signups_source_len check (char_length(source) <= 40)
);

-- Eine Adresse nur einmal; die Function nutzt den Konflikt fuer ein
-- stilles "schon drin", ohne das nach aussen zu verraten.
create unique index if not exists beta_signups_email_key on public.beta_signups (email);

comment on table public.beta_signups is
  'Beta-Anmeldungen der Website. Nur die Edge Function beta-signup schreibt (service_role). Nach Beta-Ende loeschen.';

-- RLS aktiv, absichtlich OHNE Policies: anon/authenticated haben ueber
-- PostgREST keinerlei Zugriff (Default-Deny). service_role umgeht RLS.
alter table public.beta_signups enable row level security;

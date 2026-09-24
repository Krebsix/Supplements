-- Serverseitiges Scan-Kontingent je Konto (Audit-Befund L2, 2026-09-14).
--
-- WARUM:
-- Der Kostenschutz fuer kostenpflichtige Foto-Analysen lag vollstaendig
-- in der App. Entitlements.js zaehlte mit, blockierte aber nie
-- (PAYWALL_ENFORCED = false), und der Zaehler liegt im lokalen Store auf
-- dem Geraet. Das einzige serverseitige Bollwerk war das IP-Limit aus
-- 20260729010000_scan_rate_limit.sql: 20 Anfragen je 60 Minuten, also bis
-- zu 480 Analysen am Tag je Geraet, jede als kostenpflichtiger
-- Claude-Aufruf auf unserem Konto.
--
-- Diese Migration fuehrt das Kontingent dort, wo der Client es nicht
-- aendern kann. Das IP-Limit bleibt bestehen und schuetzt weiterhin den
-- Weg ohne Konto (Barcode- und Cache-Abfragen).
--
-- ZWEI PHASEN, damit Fehler nichts kosten:
--   reserve_scan_quota  erhoeht atomar VOR dem Claude-Aufruf
--   release_scan_quota  gibt zurueck, wenn kein verwertbares Ergebnis kam
-- Eine Zaehlung erst nach Erfolg waere nicht parallelsicher: Zwei
-- gleichzeitige Anfragen saehen beide denselben Stand und kaemen beide
-- durch. Die Reservierung schliesst das aus, die Freigabe haelt die
-- Regel "ein fehlgeschlagener Scan kostet nichts" ein.
--
-- Die Obergrenze selbst steht NICHT hier, sondern wird von der Edge
-- Function uebergeben (quota.ts, MONTHLY_HARD_CAP). So gibt es genau eine
-- Stelle, an der sie geaendert wird.

create table if not exists public.scan_quotas (
  -- Konto aus auth.users. Kein Fremdschluessel auf auth.users, damit ein
  -- Konto-Loeschvorgang nicht an diesem Zaehler haengt; aufgeraeumt wird
  -- ueber die Bereinigung unten.
  user_id uuid not null,
  -- Abrechnungszeitraum als 'YYYY-MM' in UTC (quota.ts billingPeriod).
  -- Teil des Schluessels: Ein neuer Monat ist eine neue Zeile, alte
  -- Zeitraeume bleiben als Nachweis stehen, bis sie bereinigt werden.
  period text not null,
  used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, period),
  constraint scan_quotas_period_format check (period ~ '^[0-9]{4}-[0-9]{2}$'),
  constraint scan_quotas_used_not_negative check (used >= 0)
);

comment on table public.scan_quotas is
  'Verbrauchte KI-Foto-Analysen je Konto und Abrechnungszeitraum. Enthaelt keine Gesundheitsdaten und keine Produktdaten, nur einen Zaehler.';

-- RLS aktiv, absichtlich OHNE Policies: anon und authenticated haben
-- damit keinen direkten Tabellenzugriff ueber PostgREST. Zugriff nur
-- ueber die beiden Functions unten, die nur der service_role ausfuehren
-- darf -- also nur die Edge Function.
alter table public.scan_quotas enable row level security;

-- Atomare Reservierung: erhoeht den Zaehler und meldet, ob die Anfrage
-- innerhalb des uebergebenen Limits lag. Parallele Anfragen serialisieren
-- sich am Row-Lock des UPDATE-Zweigs, keine kann die andere ueberholen.
--
-- Liegt die Anfrage ueber dem Limit, wird NICHT erhoeht: Sonst wuerde ein
-- Konto, das gegen die Grenze laeuft, seinen Zaehler immer weiter
-- hochtreiben und nach einem Credit-Kauf trotzdem gesperrt bleiben.
create or replace function public.reserve_scan_quota(
  p_user_id uuid,
  p_period text,
  p_limit integer
)
returns table (allowed boolean, used_after integer, quota_limit integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
begin
  if p_user_id is null then
    return query select false, 0, p_limit;
    return;
  end if;

  insert into public.scan_quotas (user_id, period, used)
  values (p_user_id, p_period, 0)
  on conflict (user_id, period) do nothing;

  -- Zeile sperren, damit zwei gleichzeitige Anfragen denselben Stand
  -- nicht beide lesen.
  select used into v_used
  from public.scan_quotas
  where user_id = p_user_id and period = p_period
  for update;

  if v_used >= p_limit then
    return query select false, v_used, p_limit;
    return;
  end if;

  update public.scan_quotas
  set used = used + 1, updated_at = now()
  where user_id = p_user_id and period = p_period
  returning used into v_used;

  return query select true, v_used, p_limit;
end;
$$;

comment on function public.reserve_scan_quota is
  'Reserviert eine Foto-Analyse fuer ein Konto im Zeitraum. Erhoeht nur, wenn das Limit noch nicht erreicht ist.';

-- Freigabe: nimmt eine Reservierung zurueck, wenn die Analyse kein
-- verwertbares Ergebnis geliefert hat (Upstream-Fehler, Refusal,
-- abgeschnittene Antwort). Faellt nie unter null.
create or replace function public.release_scan_quota(
  p_user_id uuid,
  p_period text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
begin
  if p_user_id is null then
    return 0;
  end if;

  update public.scan_quotas
  set used = greatest(0, used - 1), updated_at = now()
  where user_id = p_user_id and period = p_period
  returning used into v_used;

  return coalesce(v_used, 0);
end;
$$;

comment on function public.release_scan_quota is
  'Gibt eine reservierte Analyse zurueck, wenn kein verwertbares Ergebnis entstand. Ein fehlgeschlagener Scan kostet kein Kontingent.';

-- Bereinigung alter Zeitraeume, damit die Tabelle nicht unbegrenzt
-- waechst. Bewusst grosszuegig: 14 Monate halten den Vorjahresmonat als
-- Vergleich vor.
create or replace function public.cleanup_scan_quotas()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.scan_quotas
  where updated_at < now() - interval '14 months';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- KRITISCH, dieselbe Begruendung wie beim IP-Limit: Jede Function im
-- public-Schema ist per Default als PostgREST-RPC aufrufbar. Ohne diese
-- REVOKEs koennte jeder Inhaber des (absichtlich oeffentlichen)
-- Anon-Keys reserve_scan_quota mit einem selbstgewaehlten Limit aufrufen
-- oder release_scan_quota benutzen, um den eigenen Zaehler
-- zurueckzusetzen -- das Kontingent waere wirkungslos.
revoke all on function public.reserve_scan_quota(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.release_scan_quota(uuid, text) from public, anon, authenticated;
revoke all on function public.cleanup_scan_quotas() from public, anon, authenticated;
grant execute on function public.reserve_scan_quota(uuid, text, integer) to service_role;
grant execute on function public.release_scan_quota(uuid, text) to service_role;
grant execute on function public.cleanup_scan_quotas() to service_role;

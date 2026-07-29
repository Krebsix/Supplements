-- Rate-Limit fuer die analyze-supplement Edge Function.
--
-- Hintergrund: Der Supabase Anon-Key ist per Design oeffentlich (er steht
-- im App-Bundle und im Repo). Ohne diese Sperre koennte jeder, der den
-- Key aus dem Repo liest, die Function unbegrenzt oft per curl aufrufen
-- und dabei kostenpflichtige Claude-API-Aufrufe auf unserem Konto ausloesen.
--
-- Das Limit ist bewusst grosszuegig (siehe Werte in der Edge Function),
-- damit normale Nutzung nicht eingeschraenkt wird, aber automatisierter
-- Missbrauch schnell blockiert wird.

create table if not exists public.scan_rate_limits (
  client_key text primary key,
  window_start timestamptz not null default now(),
  request_count integer not null default 0
);

comment on table public.scan_rate_limits is
  'Rate-Limit-Zaehler fuer die Scan-Analyse-Function, geschluesselt nach Client-IP.';

-- RLS aktiv, absichtlich OHNE Policies: anon/authenticated haben dadurch
-- per Default-Deny keinerlei direkten Tabellenzugriff ueber die PostgREST-
-- API. Das reicht fuer die TABELLE, schuetzt aber NICHT die Function unten
-- (SECURITY DEFINER Functions umgehen RLS immer, unabhaengig vom Aufrufer).
alter table public.scan_rate_limits enable row level security;

-- Atomarer Check-and-Increment, damit parallele Requests sich nicht
-- gegenseitig ueberholen koennen (row lock via UPDATE ... RETURNING).
create or replace function public.check_scan_rate_limit(
  p_client_key text,
  p_max_requests integer,
  p_window_minutes integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed boolean;
begin
  -- Alte Eintraege aufraeumen, damit die Tabelle nicht unbegrenzt waechst
  -- (unabhaengig vom REVOKE unten -- Verteidigung in der Tiefe).
  delete from public.scan_rate_limits
  where window_start < now() - make_interval(mins => p_window_minutes * 2);

  insert into public.scan_rate_limits (client_key, window_start, request_count)
  values (p_client_key, now(), 1)
  on conflict (client_key) do update
    set
      window_start = case
        when public.scan_rate_limits.window_start < now() - make_interval(mins => p_window_minutes)
          then now()
        else public.scan_rate_limits.window_start
      end,
      request_count = case
        when public.scan_rate_limits.window_start < now() - make_interval(mins => p_window_minutes)
          then 1
        else public.scan_rate_limits.request_count + 1
      end
  returning (request_count <= p_max_requests) into v_allowed;

  return v_allowed;
end;
$$;

comment on function public.check_scan_rate_limit is
  'Gibt true zurueck, wenn client_key im aktuellen Zeitfenster noch unter dem Limit liegt, und zaehlt gleichzeitig hoch.';

-- KRITISCH: Diese Function ist SECURITY DEFINER und wird von Supabase
-- automatisch als PostgREST-RPC-Endpunkt exponiert (jede Function im
-- public-Schema ist per Default so aufrufbar). Ohne dieses REVOKE koennte
-- jeder Inhaber des (absichtlich oeffentlichen) Anon-Keys die Function
-- DIREKT per HTTP aufrufen -- mit selbstgewaehlten Schwellenwerten und
-- beliebigen client_key-Werten. Damit liesse sich sowohl das Rate-Limit
-- fuer eine bestimmte echte Nutzerin boeswillig ausschoepfen (DoS gegen
-- deren IP) als auch die Tabelle mit beliebig vielen Fantasie-Eintraegen
-- fluten. Aufrufbar ist die Function deshalb ausschliesslich fuer den
-- service_role, den nur die Edge Function selbst besitzt (Secret, nie im
-- Client-Bundle oder Repo).
revoke all on function public.check_scan_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_scan_rate_limit(text, integer, integer) to service_role;

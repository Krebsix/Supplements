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

-- Keine RLS-Policies noetig: Die Tabelle wird ausschliesslich ueber die
-- Function unten mit SECURITY DEFINER angesprochen, nie direkt per API.
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

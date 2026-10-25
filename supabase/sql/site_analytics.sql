-- Execute uma vez no SQL Editor do projeto que hospeda o site.
begin;
create table if not exists public.site_presence (
  visitor_id uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  path text not null check (length(path) <= 120)
);
create index if not exists site_presence_last_seen_idx on public.site_presence (last_seen desc);
alter table public.site_presence enable row level security;
revoke all on public.site_presence from public, anon, authenticated;
grant select, insert, update, delete on public.site_presence to service_role;

create or replace function public.record_site_presence(p_visitor_id uuid, p_path text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_path is null or length(p_path) > 120 or left(p_path, 1) <> '/' then
    raise exception 'Invalid path';
  end if;
  insert into public.site_presence (visitor_id, path) values (p_visitor_id, p_path)
  on conflict (visitor_id) do update set last_seen = now(), path = excluded.path
  where public.site_presence.last_seen < now() - interval '15 seconds'
     or public.site_presence.path <> excluded.path;
  -- Limpa registros antigos durante a coleta, sem guardar histórico permanente.
  if random() < 0.01 then
    delete from public.site_presence where last_seen < now() - interval '24 hours';
  end if;
end;
$$;

create or replace function public.site_analytics_snapshot(p_hours integer)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'generatedAt', now(),
    'online', count(*) filter (where last_seen >= now() - interval '60 seconds'),
    'last2Hours', count(*) filter (where last_seen >= now() - interval '2 hours'),
    'last4Hours', count(*),
    'visitors', coalesce((
      select jsonb_agg(jsonb_build_object('id', v.visitor_id, 'firstSeen', v.first_seen, 'lastSeen', v.last_seen, 'path', v.path) order by v.last_seen desc)
      from (select visitor_id, first_seen, last_seen, path from public.site_presence
            where p_hours in (2,4) and last_seen >= now() - make_interval(hours => p_hours)
            order by last_seen desc limit 200) v
    ), '[]'::jsonb)
  ) from public.site_presence where last_seen >= now() - interval '4 hours';
$$;
revoke all on function public.record_site_presence(uuid, text) from public, anon, authenticated;
revoke all on function public.site_analytics_snapshot(integer) from public, anon, authenticated;
grant execute on function public.record_site_presence(uuid, text) to service_role;
grant execute on function public.site_analytics_snapshot(integer) to service_role;
commit;

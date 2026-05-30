-- Añade columna join_code a leagues, realiza backfill desde UUID, crea índice
-- único y expone RPC SECURITY DEFINER para resolver código → liga sin necesitar
-- membresía previa (el invitado aún no es miembro cuando introduce el código).

-- ── 1. Columna ──
alter table leagues add column if not exists join_code text;

-- ── 2. Backfill para ligas existentes (replica algoritmo _codeForLeague) ──
-- Toma los 7 primeros caracteres alfanuméricos del UUID (quitando guiones),
-- los pone en mayúsculas y formatea XXX-XXXX con relleno 'X' si faltan chars.
update leagues
set join_code = (
  -- Quitar guiones del UUID y poner en mayúsculas
  with cleaned as (
    select upper(regexp_replace(id::text, '[^a-zA-Z0-9]', '', 'g')) as slug
  )
  select
    rpad(substring(slug from 1 for 3), 3, 'X')
    || '-' ||
    rpad(substring(slug from 4 for 4), 4, 'X')
  from cleaned
)
where join_code is null;

-- ── 3. Índice único ──
-- Si hay colisión de backfill (mismos 7 primeros chars, muy improbable),
-- esta instrucción fallará; resuelve manualmente antes de ejecutarla.
create unique index if not exists leagues_join_code_idx on leagues (join_code);

-- ── 4. RPC SECURITY DEFINER para resolver código sin membresía previa ──
-- Sigue el patrón de is_league_member en 20260527090000_leagues_rls_fix.sql.
-- Devuelve solo id + name (no expone owner_id ni miembros).
create or replace function public.find_league_by_code(_code text)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select leagues.id, leagues.name
  from leagues
  where leagues.join_code = upper(trim(_code))
  limit 1;
$$;

revoke all on function public.find_league_by_code(text) from public;
grant execute on function public.find_league_by_code(text) to authenticated;

comment on function public.find_league_by_code(text) is
  'Devuelve id y nombre de la liga cuyo join_code coincide con el código introducido.
   SECURITY DEFINER: omite RLS para que un usuario aún no miembro pueda resolver
   el código antes de unirse. Solo expone id y name.';

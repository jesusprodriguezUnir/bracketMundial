-- Arregla la recursión infinita en la policy "league_members_read".
-- El problema: la policy de SELECT sobre league_members consultaba la misma
-- tabla, lo que dispara la policy otra vez → infinite recursion (error 42P17).
-- Solución: usar una función SECURITY DEFINER que omite RLS al comprobar
-- la pertenencia. La función queda restringida a `authenticated` para no
-- filtrar datos a anónimos.

-- ── Quitar policies recursivas / antiguas ──
drop policy if exists "league_members_read" on league_members;
drop policy if exists "leagues_member_read" on leagues;

-- ── Función helper sin recursión ──
create or replace function public.is_league_member(p_league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from league_members
    where league_id = p_league_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_league_member(uuid) from public;
grant execute on function public.is_league_member(uuid) to authenticated;

-- ── Policies nuevas ──

-- league_members: SELECT → puedo ver miembros de las ligas en las que estoy.
-- La función SECURITY DEFINER salta RLS al consultar league_members, así
-- que no hay recursión.
create policy "league_members_read"
  on league_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_league_member(league_id)
  );

-- leagues: SELECT → miembros o owner. Usamos la misma función.
create policy "leagues_member_read"
  on leagues for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.is_league_member(id)
  );

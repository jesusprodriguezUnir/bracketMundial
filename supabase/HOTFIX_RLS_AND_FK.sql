-- ════════════════════════════════════════════════════════════════════════
-- HOTFIX para los errores actuales del backend de bracketMundial.
-- Ejecuta este script COMPLETO en Supabase Dashboard → SQL Editor → "New query".
--
-- Arregla:
-- 1) Recursión infinita en RLS de league_members (error 42P17).
-- 2) FK roto de predictions.user_id → ahora apunta a auth.users.
-- 3) Restablece la policy de lectura de leagues sin recursión.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. RLS: recursión infinita en league_members ─────────────────────────

drop policy if exists "league_members_read" on league_members;
drop policy if exists "leagues_member_read" on leagues;

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

create policy "league_members_read"
  on league_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_league_member(league_id)
  );

create policy "leagues_member_read"
  on leagues for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.is_league_member(id)
  );

-- ── 2. FK de predictions.user_id → auth.users ────────────────────────────

do $$
declare
  fk_name text;
begin
  select conname
  into fk_name
  from pg_constraint
  where conrelid = 'public.predictions'::regclass
    and contype = 'f'
    and conname like '%user_id%';

  if fk_name is not null then
    execute format('alter table public.predictions drop constraint %I', fk_name);
  end if;

  alter table public.predictions
    add constraint predictions_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
exception
  when undefined_table then
    raise notice 'La tabla public.predictions no existe en este entorno, se omite el FK.';
end $$;

-- ── 3. Limpieza opcional: huérfanos en predictions ────────────────────────
-- Borra registros cuyo user_id no existe en auth.users (residuos de pruebas)
delete from public.predictions
where user_id not in (select id from auth.users);

-- ── Listo ─────────────────────────────────────────────────────────────────
-- Vuelve al navegador, recarga la app con Ctrl+F5 y prueba "Subir a la nube".

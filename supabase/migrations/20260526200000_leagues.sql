-- Tablas para el sistema de ligas multijugador.
-- RLS: los miembros ven a todos los de su liga; cada uno solo actualiza su fila.

-- ── Limpiar (seguro para 1ª ejecución — borra datos si existen) ──
drop trigger if exists trg_leagues_updated_at on leagues;
drop function if exists update_modified_column;
drop table if exists league_members cascade;
drop table if exists leagues cascade;

-- ── leagues ──
create table leagues (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  owner_id    uuid        not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index leagues_owner_idx on leagues (owner_id);

-- ── Trigger para updated_at ──
create function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_leagues_updated_at
  before update on leagues
  for each row execute function update_modified_column();

-- ── league_members ──
create table league_members (
  id          uuid        primary key default gen_random_uuid(),
  league_id   uuid        not null references leagues(id) on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  predictions jsonb,
  joined_at   timestamptz not null default now(),
  unique (league_id, user_id)
);

create index league_members_league_idx on league_members (league_id);
create index league_members_user_idx on league_members (user_id);

-- ── RLS ──
alter table leagues enable row level security;
alter table league_members enable row level security;

-- leagues: SELECT → miembros o owner
create policy "leagues_member_read"
  on leagues for select
  to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from league_members lm
      where lm.league_id = leagues.id and lm.user_id = auth.uid()
    )
  );

-- leagues: INSERT → cualquier authenticated (owner = quien crea)
create policy "leagues_authenticated_insert"
  on leagues for insert
  to authenticated
  with check (owner_id = auth.uid());

-- leagues: UPDATE → solo el owner
create policy "leagues_owner_update"
  on leagues for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- leagues: DELETE → solo el owner
create policy "leagues_owner_delete"
  on leagues for delete
  to authenticated
  using (owner_id = auth.uid());

-- league_members: SELECT → solo miembros de la misma liga
create policy "league_members_read"
  on league_members for select
  to authenticated
  using (
    exists (
      select 1 from league_members lm2
      where lm2.league_id = league_members.league_id
        and lm2.user_id = auth.uid()
    )
  );

-- league_members: INSERT → cualquier authenticated (se une él mismo)
create policy "league_members_insert"
  on league_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- league_members: UPDATE → cada uno solo su propia fila
create policy "league_members_update_own"
  on league_members for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- league_members: DELETE → el propio usuario sale, o el owner lo echa
create policy "league_members_delete"
  on league_members for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from leagues
      where leagues.id = league_members.league_id
        and leagues.owner_id = auth.uid()
    )
  );

-- ── Comentarios ──
comment on table leagues is
  'Ligas multijugador creadas por usuarios autenticados.';
comment on column leagues.owner_id is
  'Usuario que creó y administra la liga.';
comment on column leagues.updated_at is
  'Última modificación de metadatos de la liga.';

comment on table league_members is
  'Participantes de cada liga con sus predicciones en JSONB.';
comment on column league_members.name is
  'Nombre público del participante dentro de la liga.';
comment on column league_members.predictions is
  'JSONB: { groupScores, knockoutScores } (DecodedBracket). NULL hasta que rellene su bracket.';

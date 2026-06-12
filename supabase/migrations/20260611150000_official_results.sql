create table if not exists official_results (
  id         integer     primary key,
  payload    text        not null,
  updated_at timestamptz not null default now()
);

alter table official_results enable row level security;

drop policy if exists "official_results public read" on official_results;
create policy "official_results public read"
  on official_results for select
  to anon, authenticated
  using (true);

comment on table official_results is
  'Fila única (id=1) con el payload codificado del bracket oficial.';
comment on column official_results.payload is
  'Bracket codificado vía encodeBracket()';
comment on column official_results.updated_at is
  'Timestamp de la última actualización.';

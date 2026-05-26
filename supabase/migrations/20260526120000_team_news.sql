-- Tabla de noticias por equipo y locale.
-- Ingestada por scripts/ingest-news.mjs desde GNews, NewsAPI y RSS oficiales.
-- Leída por el cliente (anon) vía la vista team_news_top.

create table if not exists team_news (
  team_id      text        not null,
  locale       text        not null check (locale in ('es', 'en')),
  url          text        not null,
  title        text        not null,
  description  text,
  image        text,
  source       text        not null,
  source_url   text,
  published_at timestamptz not null,
  fetched_at   timestamptz not null default now(),
  primary key (team_id, locale, url)
);

create index if not exists team_news_team_locale_pub_idx
  on team_news (team_id, locale, published_at desc);

-- Vista: top 5 noticias más recientes por equipo y locale.
-- El cliente la consulta directamente para evitar ordenar/paginar en el frontend.
create or replace view team_news_top as
select team_id, locale, url, title, description, image, source, source_url,
       published_at, fetched_at, rn
from (
  select tn.*,
         row_number() over (
           partition by team_id, locale
           order by published_at desc, fetched_at desc
         ) as rn
  from team_news tn
) ranked
where rn <= 5;

-- RLS: lectura pública (anon), escritura solo desde service role (ingesta).
alter table team_news enable row level security;

drop policy if exists "team_news public read" on team_news;
create policy "team_news public read"
  on team_news for select
  to anon, authenticated
  using (true);

-- service_role bypasses RLS, no necesita policy explícita.

comment on table team_news is
  'Noticias por equipo (FIFA ID) y locale (es/en). Ingestada por GitHub Actions cron.';
comment on view  team_news_top is
  'Top 5 noticias más recientes por equipo y locale. Vista consumida por el cliente web.';

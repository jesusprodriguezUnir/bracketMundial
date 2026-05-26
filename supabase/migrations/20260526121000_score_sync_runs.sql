-- Auditoría de las ejecuciones del cron que sincroniza scores con API-Football.
-- Permite ver desde el dashboard de Supabase qué pasó en cada run sin abrir GH Actions.

create table if not exists score_sync_runs (
  id                bigserial primary key,
  ran_at            timestamptz not null default now(),
  source            text        not null,        -- 'api-football'
  fixtures_seen     int,
  fixtures_updated  int,
  http_status       int,
  error_msg         text,
  duration_ms       int,
  triggered_by      text                          -- 'cron' | 'manual' | 'workflow_dispatch'
);

create index if not exists score_sync_runs_ran_at_idx
  on score_sync_runs (ran_at desc);

-- RLS: lectura pública para mostrar "última actualización" en la UI si se quiere.
alter table score_sync_runs enable row level security;

drop policy if exists "score_sync_runs public read" on score_sync_runs;
create policy "score_sync_runs public read"
  on score_sync_runs for select
  to anon, authenticated
  using (true);

comment on table score_sync_runs is
  'Una fila por ejecución del cron scripts/update-live-scores.ts. Incluye éxito y errores.';

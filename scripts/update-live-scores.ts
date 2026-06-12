import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Importar datos y lógica del torneo
import { TEAMS_2026, KNOCKOUT_BRACKET } from '../src/data/fifa-2026';
import { KNOCKOUT_SCHEDULE, GROUP_MATCHES } from '../src/data/match-schedule';
import { decodeBracket, encodeBracket } from '../src/lib/bracket-codec';
import { syncKnockoutBracket } from '../src/lib/bracket-logic';
import { recalculateStandings, getWinnerId, getKnockoutMatchOrder, initialGroupMatches } from '../src/store/tournament-store';

// ── .env parser simple ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env: Record<string, string> = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const ENV = loadEnv();
const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY ?? ENV.FOOTBALL_DATA_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ENV.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ENV.SUPABASE_SERVICE_ROLE_KEY;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const TRIGGERED_BY = process.env.GITHUB_EVENT_NAME ?? (process.env.CI ? 'cron' : 'manual');

if (!FOOTBALL_DATA_KEY) {
  console.error('❌ Falta FOOTBALL_DATA_KEY (env o .env). Regístrate en https://www.football-data.org/client/register');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// ── Helpers de log estructurado ──────────────────────────────────────────────
function logJson(level: 'info' | 'warn' | 'error', event: string, data: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ t: new Date().toISOString(), level, event, ...data }));
}

// ── Detección de partido activo (skip inteligente) ───────────────────────────
/**
 * Devuelve true si hay al menos un partido programado dentro de la ventana
 * [-30min, +3h] del momento actual. Eso es "hay fútbol ahora o en breve".
 *
 * Si no hay partido en esa ventana y la última run de Supabase tiene <1h,
 * el caller puede decidir saltarse esta ejecución y ahorrar cuota de API.
 */
function hasMatchInProgress(now: Date): boolean {
  // CEST = UTC+2 en verano 2026. timeSpain es HH:MM CEST.
  const nowMs = now.getTime();
  const windowStart = nowMs - 30 * 60 * 1000;
  const windowEnd = nowMs + 3 * 60 * 60 * 1000;

  for (const m of GROUP_MATCHES) {
    const iso = `${m.date}T${m.timeSpain}:00+02:00`;
    const t = new Date(iso).getTime();
    if (t >= windowStart && t <= windowEnd) return true;
  }
  for (const m of Object.values(KNOCKOUT_SCHEDULE)) {
    const iso = `${m.date}T${m.timeSpain}:00+02:00`;
    const t = new Date(iso).getTime();
    if (t >= windowStart && t <= windowEnd) return true;
  }
  return false;
}

// ── name normalization + Levenshtein similarity ──────────────────────────────
function normalizeStr(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
}

function levenshtein(a: string, b: string) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function nameSimilarity(a: string, b: string) {
  const na = normalizeStr(a), nb = normalizeStr(b);
  if (na === nb) return 1;
  const maxLen = Math.max(na.length, nb.length);
  return maxLen === 0 ? 1 : 1 - levenshtein(na, nb) / maxLen;
}

function getTeamIdByApiName(apiName: string): string | null {
  const matches = TEAMS_2026.map(t => {
    const scoreES = nameSimilarity(t.name, apiName);
    const scoreShort = nameSimilarity(t.shortName, apiName);
    return { id: t.id, score: Math.max(scoreES, scoreShort) };
  }).sort((a, b) => b.score - a.score);

  return matches[0].score > 0.6 ? matches[0].id : null;
}

// ── Fetch con reintentos exponenciales (football-data.org v4) ────────────────
interface ApiFetchResult {
  fixtures: any[];
  httpStatus: number;
}

// Statuses de football-data.org que indican partido no empezado
const SKIP_STATUSES = new Set(['SCHEDULED', 'TIMED', 'POSTPONED', 'CANCELLED', 'SUSPENDED']);

async function fetchWorldCupFixtures(retries = 2): Promise<ApiFetchResult> {
  const url = 'https://api.football-data.org/v4/competitions/WC/matches';
  let lastError = '';
  let lastStatus = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          'X-Auth-Token': FOOTBALL_DATA_KEY!,
        },
        signal: AbortSignal.timeout(20_000),
      });
      lastStatus = resp.status;

      if (resp.ok) {
        const json = await resp.json();
        return { fixtures: json.matches ?? [], httpStatus: 200 };
      }

      // Recoverable: rate limit or server error
      if (resp.status === 429 || resp.status >= 500) {
        lastError = `HTTP ${resp.status}`;
        if (attempt < retries) {
          const backoff = 1000 * Math.pow(2, attempt);
          logJson('warn', 'api_retry', { attempt: attempt + 1, status: resp.status, backoff_ms: backoff });
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }
      } else {
        lastError = `HTTP ${resp.status}: ${await resp.text()}`;
        break; // 4xx no recuperables, abortar
      }
    } catch (err: any) {
      lastError = err.message ?? String(err);
      if (attempt < retries) {
        const backoff = 1000 * Math.pow(2, attempt);
        logJson('warn', 'api_retry_network', { attempt: attempt + 1, error: lastError, backoff_ms: backoff });
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
    }
  }
  throw new Error(`football-data.org falló tras ${retries + 1} intentos: ${lastError} (last status ${lastStatus})`);
}

// ── Auditoría en Supabase ────────────────────────────────────────────────────
async function recordRun(sb: SupabaseClient, row: {
  fixtures_seen?: number;
  fixtures_updated?: number;
  http_status?: number;
  error_msg?: string;
  duration_ms: number;
}) {
  const { error } = await sb.from('score_sync_runs').insert({
    source: 'football-data.org',
    triggered_by: TRIGGERED_BY,
    ...row,
  });
  if (error) logJson('warn', 'audit_insert_failed', { error: error.message });
}

// ── Skip inteligente: si no hay partido en ventana y última run <1h, salta ──
async function shouldSkip(sb: SupabaseClient): Promise<{ skip: boolean; reason: string }> {
  if (FORCE) return { skip: false, reason: 'force' };
  if (hasMatchInProgress(new Date())) return { skip: false, reason: 'match_in_window' };

  const { data } = await sb
    .from('score_sync_runs')
    .select('ran_at')
    .order('ran_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return { skip: false, reason: 'no_previous_run' };

  const ageMs = Date.now() - new Date(data.ran_at).getTime();
  if (ageMs < 60 * 60 * 1000) {
    return { skip: true, reason: `last_run_${Math.round(ageMs / 60000)}min_ago` };
  }
  return { skip: false, reason: 'last_run_stale' };
}

// ── Guard de fechas del torneo (belt-and-braces; el workflow ya filtra) ─────
const TOURNAMENT_START = '2026-06-11';
const TOURNAMENT_END = '2026-07-20'; // día después de la final, margen para correcciones

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const t0 = Date.now();
  logJson('info', 'start', { triggered_by: TRIGGERED_BY, force: FORCE });

  const todayUtc = new Date().toISOString().slice(0, 10);
  if (!FORCE && (todayUtc < TOURNAMENT_START || todayUtc > TOURNAMENT_END)) {
    logJson('info', 'skip', { reason: 'outside_tournament_window' });
    return;
  }

  const sb = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  // 1. ¿Debemos saltarnos esta ejecución?
  const skipDecision = await shouldSkip(sb);
  if (skipDecision.skip) {
    logJson('info', 'skip', { reason: skipDecision.reason });
    await recordRun(sb, {
      fixtures_seen: 0, fixtures_updated: 0,
      http_status: 0, error_msg: `skipped:${skipDecision.reason}`,
      duration_ms: Date.now() - t0,
    });
    return;
  }
  logJson('info', 'proceed', { reason: skipDecision.reason });

  // 2. Bracket oficial actual
  const { data: resultsRow, error: sbError } = await sb
    .from('official_results')
    .select('payload')
    .eq('id', 1)
    .maybeSingle();

  if (sbError) {
    logJson('error', 'load_official_failed', { error: sbError.message });
    await recordRun(sb, { error_msg: `load_official: ${sbError.message}`, duration_ms: Date.now() - t0 });
    process.exit(1);
  }

  let groupMatches = [...initialGroupMatches].map(m => ({ ...m, scoreA: null as number | null, scoreB: null as number | null }));
  let knockoutMatches: Record<string, any> = {};

  if (resultsRow?.payload) {
    const decoded = decodeBracket(resultsRow.payload as string);
    if (decoded) {
      const groupScoreMap = new Map(decoded.groupScores.map(s => [s.matchId, s]));
      groupMatches = initialGroupMatches.map(m => {
        const s = groupScoreMap.get(m.matchId);
        return s ? { ...m, scoreA: s.scoreA, scoreB: s.scoreB } : { ...m };
      });
      for (const ks of decoded.knockoutScores) {
        knockoutMatches[ks.matchId] = {
          ...(knockoutMatches[ks.matchId] ?? { teamA: null, teamB: null, winnerId: null, isPlayed: false }),
          scoreA: ks.scoreA,
          scoreB: ks.scoreB,
          penaltyScoreA: ks.penaltyScoreA ?? null,
          penaltyScoreB: ks.penaltyScoreB ?? null,
        };
      }
    }
    logJson('info', 'official_loaded', { has_payload: true });
  } else {
    logJson('info', 'official_loaded', { has_payload: false });
  }

  // 3. Fetch API-Football con retries
  let fetchResult: ApiFetchResult;
  try {
    fetchResult = await fetchWorldCupFixtures();
  } catch (e: any) {
    logJson('error', 'api_fetch_failed', { error: e.message });
    await recordRun(sb, { http_status: 0, error_msg: e.message, duration_ms: Date.now() - t0 });
    process.exit(1);
  }

  const { fixtures, httpStatus } = fetchResult;
  logJson('info', 'api_ok', { http_status: httpStatus, fixtures_seen: fixtures.length });

  if (fixtures.length === 0) {
    // Esperado pre-temporada. No es error.
    logJson('info', 'no_fixtures', { note: 'API devolvió 0; probable pre-temporada' });
    await recordRun(sb, {
      fixtures_seen: 0, fixtures_updated: 0, http_status: httpStatus,
      duration_ms: Date.now() - t0,
    });
    return;
  }

  // 4. Mapeo y actualización (football-data.org v4 structure)
  let updatedCount = 0;
  for (const f of fixtures) {
    // football-data.org: status es SCHEDULED, TIMED, IN_PLAY, PAUSED, EXTRA_TIME,
    // PENALTY_SHOOTOUT, FINISHED, SUSPENDED, POSTPONED, CANCELLED, AWARDED
    if (SKIP_STATUSES.has(f.status)) continue;

    const teamA_id = getTeamIdByApiName(f.homeTeam.name);
    const teamB_id = getTeamIdByApiName(f.awayTeam.name);
    if (!teamA_id || !teamB_id) continue;

    // fullTime contiene el marcador final (o actual si IN_PLAY)
    const scoreA = f.score.fullTime.home ?? 0;
    const scoreB = f.score.fullTime.away ?? 0;
    // penalties aparece solo si duration === 'PENALTY_SHOOTOUT'
    const penA = f.score.penalties?.home ?? null;
    const penB = f.score.penalties?.away ?? null;

    const groupMatch = groupMatches.find(m =>
      (m.teamA === teamA_id && m.teamB === teamB_id) ||
      (m.teamA === teamB_id && m.teamB === teamA_id)
    );

    if (groupMatch) {
      const isHomeA = groupMatch.teamA === teamA_id;
      groupMatch.scoreA = isHomeA ? scoreA : scoreB;
      groupMatch.scoreB = isHomeA ? scoreB : scoreA;
      updatedCount++;
    } else {
      const koMatch = Object.values(knockoutMatches).find((m: any) =>
        (m.teamA === teamA_id && m.teamB === teamB_id) ||
        (m.teamA === teamB_id && m.teamB === teamA_id)
      ) as any;

      if (koMatch) {
        const isHomeA = koMatch.teamA === teamA_id;
        koMatch.scoreA = isHomeA ? scoreA : scoreB;
        koMatch.scoreB = isHomeA ? scoreB : scoreA;
        if (penA !== null && penB !== null) {
          koMatch.penaltyScoreA = isHomeA ? penA : penB;
          koMatch.penaltyScoreB = isHomeA ? penB : penA;
        }
        koMatch.winnerId = getWinnerId(koMatch.teamA, koMatch.teamB, koMatch.scoreA, koMatch.scoreB, koMatch.penaltyScoreA ?? null, koMatch.penaltyScoreB ?? null);
        koMatch.isPlayed = koMatch.winnerId !== null;
        updatedCount++;
      }
    }
  }

  if (updatedCount === 0) {
    logJson('info', 'no_updates');
    await recordRun(sb, {
      fixtures_seen: fixtures.length, fixtures_updated: 0,
      http_status: httpStatus, duration_ms: Date.now() - t0,
    });
    return;
  }

  // 5. Recalcular standings y bracket
  const standings = recalculateStandings(groupMatches);
  let finalKnockout = syncKnockoutBracket(standings, knockoutMatches as any, KNOCKOUT_BRACKET, KNOCKOUT_SCHEDULE);

  for (const matchId of getKnockoutMatchOrder()) {
    const match = finalKnockout[matchId];
    if (match?.teamA && match?.teamB && match.scoreA !== null && match.scoreB !== null) {
      match.winnerId = getWinnerId(match.teamA, match.teamB, match.scoreA, match.scoreB, match.penaltyScoreA ?? null, match.penaltyScoreB ?? null);
      match.isPlayed = match.winnerId !== null;
      finalKnockout = syncKnockoutBracket(standings, finalKnockout, KNOCKOUT_BRACKET, KNOCKOUT_SCHEDULE);
    }
  }

  // 6. Guardar
  const payload = encodeBracket(groupMatches, finalKnockout);
  const { error: upsertErr } = await sb.from('official_results').upsert(
    { id: 1, payload, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );

  if (upsertErr) {
    logJson('error', 'save_failed', { error: upsertErr.message });
    await recordRun(sb, {
      fixtures_seen: fixtures.length, fixtures_updated: updatedCount,
      http_status: httpStatus, error_msg: `save: ${upsertErr.message}`,
      duration_ms: Date.now() - t0,
    });
    process.exit(1);
  }

  logJson('info', 'saved', { fixtures_updated: updatedCount });
  await recordRun(sb, {
    fixtures_seen: fixtures.length, fixtures_updated: updatedCount,
    http_status: httpStatus, duration_ms: Date.now() - t0,
  });
}

run().catch(err => {
  logJson('error', 'unhandled', { error: err.message ?? String(err) });
  process.exit(1);
});

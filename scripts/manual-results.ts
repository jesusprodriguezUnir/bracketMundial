#!/usr/bin/env tsx
/**
 * Script manual para insertar resultados de partidos del Mundial 2026.
 * Uso: npx tsx scripts/manual-results.ts M1 2-1 M2 0-0 [--pen M2 4-3]
 *
 * Ejemplo (MEX 2-1 RSA, KOR 1-1 CZE con 5-3 penales):
 *   npx tsx scripts/manual-results.ts M1 2-1 M2 1-1 --pen M2 5-3
 *
 * Para ver lista de partidos disponibles:
 *   npx tsx scripts/manual-results.ts --list
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

import { KNOCKOUT_BRACKET } from '../src/data/fifa-2026';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../src/data/match-schedule';
import { decodeBracket, encodeBracket } from '../src/lib/bracket-codec';
import { syncKnockoutBracket } from '../src/lib/bracket-logic';
import { recalculateStandings, getWinnerId, getKnockoutMatchOrder, initialGroupMatches } from '../src/store/tournament-store';

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
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? ENV.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ENV.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes('--list')) {
  console.log('\nPartidos de grupo disponibles:\n');
  for (const m of GROUP_MATCHES) {
    console.log(`  ${m.matchId}  [${m.group}] ${m.teamA} vs ${m.teamB}  —  ${m.date} ${m.timeSpain}`);
  }
  console.log('\nPartidos de knockout disponibles:\n');
  for (const [id, m] of Object.entries(KNOCKOUT_SCHEDULE)) {
    console.log(`  ${id}  —  ${m.date} ${m.timeSpain}  (${m.venue})`);
  }
  process.exit(0);
}

interface ScoreInput {
  matchId: string;
  scoreA: number;
  scoreB: number;
  penaltyA?: number | null;
  penaltyB?: number | null;
}

function parseArgs(argv: string[]): ScoreInput[] {
  const results: ScoreInput[] = [];
  const pens: Map<string, { a: number; b: number }> = new Map();

  const penIdx = argv.indexOf('--pen');
  if (penIdx !== -1) {
    const penArgs = argv.slice(penIdx + 1);
    for (let i = 0; i + 2 < penArgs.length; i += 3) {
      pens.set(penArgs[i], { a: parseInt(penArgs[i + 1]), b: parseInt(penArgs[i + 2]) });
    }
  }

  const scoreArgs = penIdx === -1 ? argv : argv.slice(0, penIdx);
  for (let i = 0; i + 1 < scoreArgs.length; i += 2) {
    const matchId = scoreArgs[i];
    const parts = scoreArgs[i + 1].split('-');
    if (parts.length !== 2) {
      console.error(`Formato inválido: "${scoreArgs[i + 1]}". Usa "2-1".`);
      process.exit(1);
    }
    const scoreA = parseInt(parts[0]);
    const scoreB = parseInt(parts[1]);
    if (isNaN(scoreA) || isNaN(scoreB)) {
      console.error(`Puntaje inválido: "${scoreArgs[i + 1]}".`); process.exit(1);
    }
    const p = pens.get(matchId);
    results.push({ matchId, scoreA, scoreB, penaltyA: p?.a ?? null, penaltyB: p?.b ?? null });
  }
  return results;
}

async function run() {
  const inputs = parseArgs(args);
  if (inputs.length === 0) {
    console.error('Uso: npx tsx scripts/manual-results.ts M1 2-1 [M2 1-1 --pen M2 5-3]');
    console.error('  npx tsx scripts/manual-results.ts --list  para ver partidos');
    process.exit(1);
  }

  const sb = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

  const { data: resultsRow } = await sb.from('official_results').select('payload').eq('id', 1).maybeSingle();

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
          scoreA: ks.scoreA, scoreB: ks.scoreB,
          penaltyScoreA: ks.penaltyScoreA ?? null, penaltyScoreB: ks.penaltyScoreB ?? null,
        };
      }
    }
  }

  let updatedCount = 0;

  for (const input of inputs) {
    const gm = GROUP_MATCHES.find(m => m.matchId === input.matchId);
    if (gm) {
      const idx = groupMatches.findIndex(m => m.matchId === input.matchId);
      if (idx !== -1) {
        groupMatches[idx].scoreA = input.scoreA;
        groupMatches[idx].scoreB = input.scoreB;
        console.log(`  ${input.matchId} [${gm.group}] ${gm.teamA} ${input.scoreA}-${input.scoreB} ${gm.teamB} ✓`);
        updatedCount++;
      }
      continue;
    }

    const km = KNOCKOUT_SCHEDULE[input.matchId];
    if (km) {
      if (!knockoutMatches[input.matchId]) {
        knockoutMatches[input.matchId] = { teamA: null, teamB: null, winnerId: null, isPlayed: false };
      }
      knockoutMatches[input.matchId].scoreA = input.scoreA;
      knockoutMatches[input.matchId].scoreB = input.scoreB;
      knockoutMatches[input.matchId].penaltyScoreA = input.penaltyA ?? null;
      knockoutMatches[input.matchId].penaltyScoreB = input.penaltyB ?? null;
      console.log(`  ${input.matchId} ${input.scoreA}-${input.scoreB}${input.penaltyA != null ? ` (${input.penaltyA}-${input.penaltyB} pen)` : ''} ✓`);
      updatedCount++;
    } else {
      console.warn(`  Partido no encontrado: ${input.matchId} (usa --list para ver IDs)`);
    }
  }

  if (updatedCount === 0) {
    console.log('Sin partidos para actualizar.');
    return;
  }

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

  const payload = encodeBracket(groupMatches, finalKnockout);
  const { error: upsertErr } = await sb.from('official_results').upsert(
    { id: 1, payload, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );

  if (upsertErr) {
    console.error('Error al guardar:', upsertErr.message);
    process.exit(1);
  }

  console.log(`\nGuardado en Supabase (${updatedCount} partido${updatedCount > 1 ? 's' : ''} actualizado${updatedCount > 1 ? 's' : ''})`);
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });

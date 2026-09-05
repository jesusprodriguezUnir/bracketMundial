// Simulation script for UEFA Champions League 2026/27
// Simulates the 144 league phase matches based on bookmaker/Elo odds,
// sorts standings via official UEFA tiebreakers, and projects the entire knockout stage.
// Run: node scripts/simulate-ucl.mjs [--seed <number>]

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUP_MATCHES } from '../src/data/league-schedule.js';
import { TEAMS_2026 } from '../src/data/ucl-2027.js';
import { TEAM_STRENGTH } from '../src/data/team-strength.js';
import { expectedProbabilities, sampleResult } from '../src/lib/odds-model.js';
import { compareUefaLeagueRows, standingToUefaRow } from '../src/data/competition.js';
import { ODDS_SEED } from '../src/data/odds/seed.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Pseudo-random generator with optional seed for reproducibility
function createRng(seed = Date.now()) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const seedArgIdx = process.argv.indexOf('--seed');
const seedVal = seedArgIdx !== -1 ? parseInt(process.argv[seedArgIdx + 1], 10) : 42;
const rng = createRng(seedVal);

const TEAM_MAP = new Map(TEAMS_2026.map(t => [t.id, t]));

function getTeam(id) {
  return TEAM_MAP.get(id) ?? { id, name: id, shortName: id, flag: '⚽' };
}

// ── 1. Simulate League Phase (144 Matches) ──
console.log(`\n🏆 SIMULACIÓN UEFA CHAMPIONS LEAGUE 2026/27 (Seed: ${seedVal})`);
console.log(`================================================================`);

const simulatedMatches = [];
const matchdayGroups = {};

for (const m of GROUP_MATCHES) {
  const odds = ODDS_SEED.matches[m.matchId] ?? expectedProbabilities(
    TEAM_STRENGTH[m.teamA] ?? 1500,
    TEAM_STRENGTH[m.teamB] ?? 1500,
  );

  const res = sampleResult(odds, rng, false);
  const sim = {
    ...m,
    scoreA: res.scoreA,
    scoreB: res.scoreB,
    odds,
  };
  simulatedMatches.push(sim);

  if (!matchdayGroups[m.matchDay]) matchdayGroups[m.matchDay] = [];
  matchdayGroups[m.matchDay].push(sim);
}

// ── 2. Calculate Standings with Official UEFA Tiebreakers ──
const standingsMap = new Map();
for (const t of TEAMS_2026) {
  standingsMap.set(t.id, {
    teamId: t.id,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
    awayGoals: 0,
    awayWins: 0,
  });
}

for (const m of simulatedMatches) {
  const rowA = standingsMap.get(m.teamA);
  const rowB = standingsMap.get(m.teamB);

  rowA.played++;
  rowB.played++;

  rowA.goalsFor += m.scoreA;
  rowA.goalsAgainst += m.scoreB;
  rowA.goalDiff = rowA.goalsFor - rowA.goalsAgainst;

  rowB.goalsFor += m.scoreB;
  rowB.goalsAgainst += m.scoreA;
  rowB.goalDiff = rowB.goalsFor - rowB.goalsAgainst;
  rowB.awayGoals += m.scoreB;

  if (m.scoreA > m.scoreB) {
    rowA.won++;
    rowA.points += 3;
    rowB.lost++;
  } else if (m.scoreB > m.scoreA) {
    rowB.won++;
    rowB.awayWins++;
    rowB.points += 3;
    rowA.lost++;
  } else {
    rowA.drawn++;
    rowB.drawn++;
    rowA.points += 1;
    rowB.points += 1;
  }
}

const table = Array.from(standingsMap.values());
table.sort((a, b) => compareUefaLeagueRows(standingToUefaRow(a), standingToUefaRow(b)));

// Print Standings Table
console.log(`\n📊 TABLA GENERAL DE LA FASE LIGA (36 Clubes - 8 Jornadas)`);
console.log(`-----------------------------------------------------------------------------------------`);
console.log(`Pos  Club                     PJ   V   E   D   GF   GC   DG  AG  AV  Pts  Zona`);
console.log(`-----------------------------------------------------------------------------------------`);

table.forEach((row, i) => {
  const pos = i + 1;
  const team = getTeam(row.teamId);
  const name = `${team.flag} ${team.name}`.padEnd(25);
  const band = pos <= 8 ? '🟢 Octavos (Top 8)' : pos <= 24 ? '🟡 Play-offs (9-24)' : '🔴 Eliminado';
  console.log(
    `${String(pos).padStart(2)}   ${name}  ${row.played}   ${row.won}   ${row.drawn}   ${row.lost}   ${String(row.goalsFor).padStart(2)}   ${String(row.goalsAgainst).padStart(2)}  ${String(row.goalDiff >= 0 ? '+' + row.goalDiff : row.goalDiff).padStart(3)}  ${String(row.awayGoals).padStart(2)}  ${String(row.awayWins).padStart(2)}   ${String(row.points).padStart(2)}  ${band}`
  );
});

// ── 3. Knockout Play-offs (Positions 9-24) ──
const top8 = table.slice(0, 8);
const seededPO = table.slice(8, 16); // Pos 9 to 16
const unseededPO = table.slice(16, 24); // Pos 17 to 24

// Official UEFA pairing brackets: 9/10 vs 23/24, 11/12 vs 21/22, 13/14 vs 19/20, 15/16 vs 17/18
const playOffPairings = [
  { id: 'PO-01', seed: seededPO[0], unseed: unseededPO[7], posA: 9, posB: 24 },
  { id: 'PO-02', seed: seededPO[1], unseed: unseededPO[6], posA: 10, posB: 23 },
  { id: 'PO-03', seed: seededPO[2], unseed: unseededPO[5], posA: 11, posB: 22 },
  { id: 'PO-04', seed: seededPO[3], unseed: unseededPO[4], posA: 12, posB: 21 },
  { id: 'PO-05', seed: seededPO[4], unseed: unseededPO[3], posA: 13, posB: 20 },
  { id: 'PO-06', seed: seededPO[5], unseed: unseededPO[2], posA: 14, posB: 19 },
  { id: 'PO-07', seed: seededPO[6], unseed: unseededPO[1], posA: 15, posB: 18 },
  { id: 'PO-08', seed: seededPO[7], unseed: unseededPO[0], posA: 16, posB: 17 },
];

function simulateKnockoutTie(teamAId, teamBId, label) {
  const rA = TEAM_STRENGTH[teamAId] ?? 1500;
  const rB = TEAM_STRENGTH[teamBId] ?? 1500;

  // Leg 1: Team B is home (+40 home boost)
  const prob1 = expectedProbabilities(rB + 40, rA);
  const leg1 = sampleResult(prob1, rng, false);

  // Leg 2: Team A is home (+40 home boost)
  const prob2 = expectedProbabilities(rA + 40, rB);
  const leg2 = sampleResult(prob2, rng, false);

  const aggA = leg1.scoreB + leg2.scoreA;
  const aggB = leg1.scoreA + leg2.scoreB;

  let winnerId = null;
  let penA = null;
  let penB = null;

  if (aggA > aggB) {
    winnerId = teamAId;
  } else if (aggB > aggA) {
    winnerId = teamBId;
  } else {
    penA = 3 + Math.floor(rng() * 3);
    penB = 3 + Math.floor(rng() * 3);
    if (penA === penB) {
      if (rng() > 0.5) penA += 1;
      else penB += 1;
    }
    winnerId = penA > penB ? teamAId : teamBId;
  }

  const teamA = getTeam(teamAId);
  const teamB = getTeam(teamBId);
  const winner = getTeam(winnerId);

  return {
    label,
    teamA,
    teamB,
    leg1: { home: teamB.shortName, away: teamA.shortName, scoreH: leg1.scoreA, scoreA: leg1.scoreB },
    leg2: { home: teamA.shortName, away: teamB.shortName, scoreH: leg2.scoreA, scoreA: leg2.scoreB },
    aggA,
    aggB,
    penA,
    penB,
    winner,
  };
}

console.log(`\n⚔️ PLAY-OFFS ELIMINATORIOS (Ida y Vuelta - Puestos 9 al 24)`);
console.log(`-----------------------------------------------------------------------------------------`);

const poResults = [];
for (const po of playOffPairings) {
  const res = simulateKnockoutTie(
    po.seed.teamId,
    po.unseed.teamId,
    `${po.id}: #${po.posA} ${po.seed.teamId} vs #${po.posB} ${po.unseed.teamId}`
  );
  poResults.push(res);
  const penStr = res.penA !== null ? ` (Pen: ${res.penA}-${res.penB})` : '';
  console.log(
    `  ${res.label.padEnd(35)} -> Ida: ${res.leg1.scoreH}-${res.leg1.scoreA} | Vuelta: ${res.leg2.scoreH}-${res.leg2.scoreA} | Global: ${res.aggA}-${res.aggB}${penStr} => Clasifica: ${res.winner.name}`
  );
}

// ── 4. Round of 16 (Octavos de Final) ──
const r16Pairings = [
  { id: 'R16-01', seed: top8[0], poWinner: poResults[7].winner },
  { id: 'R16-02', seed: top8[7], poWinner: poResults[0].winner },
  { id: 'R16-03', seed: top8[3], poWinner: poResults[4].winner },
  { id: 'R16-04', seed: top8[4], poWinner: poResults[3].winner },
  { id: 'R16-05', seed: top8[1], poWinner: poResults[6].winner },
  { id: 'R16-06', seed: top8[6], poWinner: poResults[1].winner },
  { id: 'R16-07', seed: top8[2], poWinner: poResults[5].winner },
  { id: 'R16-08', seed: top8[5], poWinner: poResults[2].winner },
];

console.log(`\n🔥 OCTAVOS DE FINAL (Ida y Vuelta)`);
console.log(`-----------------------------------------------------------------------------------------`);
const r16Results = [];
for (const r of r16Pairings) {
  const res = simulateKnockoutTie(r.seed.teamId, r.poWinner.id, `${r.id}: ${r.seed.teamId} vs ${r.poWinner.id}`);
  r16Results.push(res);
  const penStr = res.penA !== null ? ` (Pen: ${res.penA}-${res.penB})` : '';
  console.log(
    `  ${res.label.padEnd(30)} -> Global: ${res.aggA}-${res.aggB}${penStr} => Pasa: ${res.winner.name}`
  );
}

// ── 5. Quarterfinals (Cuartos de Final) ──
console.log(`\n⚡ CUARTOS DE FINAL (Ida y Vuelta)`);
console.log(`-----------------------------------------------------------------------------------------`);
const qfPairings = [
  { id: 'QF-01', teamA: r16Results[0].winner.id, teamB: r16Results[1].winner.id },
  { id: 'QF-02', teamA: r16Results[2].winner.id, teamB: r16Results[3].winner.id },
  { id: 'QF-03', teamA: r16Results[4].winner.id, teamB: r16Results[5].winner.id },
  { id: 'QF-04', teamA: r16Results[6].winner.id, teamB: r16Results[7].winner.id },
];
const qfResults = [];
for (const q of qfPairings) {
  const res = simulateKnockoutTie(q.teamA, q.teamB, `${q.id}: ${q.teamA} vs ${q.teamB}`);
  qfResults.push(res);
  const penStr = res.penA !== null ? ` (Pen: ${res.penA}-${res.penB})` : '';
  console.log(
    `  ${res.label.padEnd(25)} -> Global: ${res.aggA}-${res.aggB}${penStr} => Semifinalista: ${res.winner.name}`
  );
}

// ── 6. Semifinals (Semifinales) ──
console.log(`\n🌟 SEMIFINALES (Ida y Vuelta)`);
console.log(`-----------------------------------------------------------------------------------------`);
const sfPairings = [
  { id: 'SF-01', teamA: qfResults[0].winner.id, teamB: qfResults[1].winner.id },
  { id: 'SF-02', teamA: qfResults[2].winner.id, teamB: qfResults[3].winner.id },
];
const sfResults = [];
for (const s of sfPairings) {
  const res = simulateKnockoutTie(s.teamA, s.teamB, `${s.id}: ${s.teamA} vs ${s.teamB}`);
  sfResults.push(res);
  const penStr = res.penA !== null ? ` (Pen: ${res.penA}-${res.penB})` : '';
  console.log(
    `  ${res.label.padEnd(25)} -> Global: ${res.aggA}-${res.aggB}${penStr} => Finalista: ${res.winner.name}`
  );
}

// ── 7. Final (Partido Único en Sede Neutral) ──
console.log(`\n👑 GRAN FINAL DE LA UEFA CHAMPIONS LEAGUE (Sede Neutral)`);
console.log(`-----------------------------------------------------------------------------------------`);
const finalTeamAId = sfResults[0].winner.id;
const finalTeamBId = sfResults[1].winner.id;
const rFinalA = TEAM_STRENGTH[finalTeamAId] ?? 1500;
const rFinalB = TEAM_STRENGTH[finalTeamBId] ?? 1500;
const finalOdds = expectedProbabilities(rFinalA, rFinalB);
const finalRes = sampleResult(finalOdds, rng, true);

let finalPenA = null;
let finalPenB = null;
let championId = null;

if (finalRes.scoreA > finalRes.scoreB) {
  championId = finalTeamAId;
} else if (finalRes.scoreB > finalRes.scoreA) {
  championId = finalTeamBId;
} else {
  finalPenA = 4 + Math.floor(rng() * 2);
  finalPenB = 4 + Math.floor(rng() * 2);
  if (finalPenA === finalPenB) {
    if (rng() > 0.5) finalPenA += 1;
    else finalPenB += 1;
  }
  championId = finalPenA > finalPenB ? finalTeamAId : finalTeamBId;
}

const teamFinalA = getTeam(finalTeamAId);
const teamFinalB = getTeam(finalTeamBId);
const champion = getTeam(championId);
const runnerUp = championId === finalTeamAId ? teamFinalB : teamFinalA;

const finalPenStr = finalPenA !== null ? ` (Penaltis: ${finalPenA}-${finalPenB})` : '';
console.log(`  ${teamFinalA.name} ${finalRes.scoreA} - ${finalRes.scoreB} ${teamFinalB.name}${finalPenStr}`);
console.log(`\n🎉 CAMPEÓN DE EUROPA: ${champion.flag} ${champion.name.toUpperCase()} 🎉`);
console.log(`🥈 Subcampeón: ${runnerUp.flag} ${runnerUp.name}`);

// ── 8. Export Results Payload ──
const exportPayload = {
  meta: {
    competition: 'UEFA Champions League 2026/27',
    generatedAt: new Date().toISOString(),
    seed: seedVal,
  },
  table: table.map((r, i) => ({
    pos: i + 1,
    teamId: r.teamId,
    name: getTeam(r.teamId).name,
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    goalsFor: r.goalsFor,
    goalsAgainst: r.goalsAgainst,
    goalDiff: r.goalDiff,
    awayGoals: r.awayGoals,
    awayWins: r.awayWins,
    points: r.points,
    zone: i < 8 ? 'direct_r16' : i < 24 ? 'playoffs' : 'eliminated',
  })),
  leaguePhaseMatches: simulatedMatches.map(m => ({
    matchId: m.matchId,
    matchDay: m.matchDay,
    teamA: m.teamA,
    teamB: m.teamB,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
  })),
  playOffs: poResults.map(p => ({
    label: p.label,
    teamA: p.teamA.id,
    teamB: p.teamB.id,
    aggA: p.aggA,
    aggB: p.aggB,
    penA: p.penA,
    penB: p.penB,
    winner: p.winner.id,
  })),
  roundOf16: r16Results.map(r => ({
    label: r.label,
    teamA: r.teamA.id,
    teamB: r.teamB.id,
    aggA: r.aggA,
    aggB: r.aggB,
    penA: r.penA,
    penB: r.penB,
    winner: r.winner.id,
  })),
  quarterfinals: qfResults.map(q => ({
    label: q.label,
    teamA: q.teamA.id,
    teamB: q.teamB.id,
    aggA: q.aggA,
    aggB: q.aggB,
    penA: q.penA,
    penB: q.penB,
    winner: q.winner.id,
  })),
  semifinals: sfResults.map(s => ({
    label: s.label,
    teamA: s.teamA.id,
    teamB: s.teamB.id,
    aggA: s.aggA,
    aggB: s.aggB,
    penA: s.penA,
    penB: s.penB,
    winner: s.winner.id,
  })),
  final: {
    teamA: teamFinalA.id,
    teamB: teamFinalB.id,
    scoreA: finalRes.scoreA,
    scoreB: finalRes.scoreB,
    penA: finalPenA,
    penB: finalPenB,
    champion: champion.id,
    runnerUp: runnerUp.id,
  },
};

const OUT_PATH = join(ROOT, 'ucl-simulation-results.json');
writeFileSync(OUT_PATH, JSON.stringify(exportPayload, null, 2), 'utf8');
console.log(`\n💾 Resultados guardados en ucl-simulation-results.json`);

// Carga y normaliza los datos del torneo desde las fuentes TS del frontend.
// Debe ejecutarse bajo `tsx` (resuelve imports .ts sin extensión).

import { teamNameEn, slugify } from './seo-i18n.mjs';

export async function loadTournamentData() {
  const fifa = await import('../../src/data/fifa-2026.ts');
  const stadiumsMod = await import('../../src/data/stadiums.ts');
  const scheduleMod = await import('../../src/data/match-schedule.ts');
  const squadsMod = await import('../../src/data/squads/index.ts').catch(() => null);

  const teamsRaw = fifa.TEAMS_2026;
  const STADIUMS = stadiumsMod.STADIUMS;
  const GROUP_MATCHES = scheduleMod.GROUP_MATCHES;
  const MATCH_DAYS = fifa.MATCH_DAYS;
  const KNOCKOUT_BRACKET = fifa.KNOCKOUT_BRACKET;

  const teams = teamsRaw.map((t) => ({
    id: t.id,
    nameEs: t.name,
    nameEn: teamNameEn(t),
    group: t.group,
    slugEs: slugify(t.name),
    slugEn: slugify(teamNameEn(t)),
  }));

  const teamById = new Map(teams.map((t) => [t.id, t]));
  const stadiumById = new Map(STADIUMS.map((s) => [s.id, s]));

  const groups = {};
  for (const t of teams) {
    (groups[t.group] ??= []).push(t);
  }

  const matches = GROUP_MATCHES.map((m) => {
    const st = stadiumById.get(m.venueId) ?? STADIUMS[0];
    return {
      matchId: m.matchId,
      group: m.group,
      teamA: teamById.get(m.teamA),
      teamB: teamById.get(m.teamB),
      matchDay: m.matchDay,
      date: m.date,
      timeSpain: m.timeSpain,
      stadium: st,
    };
  });

  const matchesByGroup = {};
  for (const m of matches) {
    (matchesByGroup[m.group] ??= []).push(m);
  }
  const matchesByTeam = {};
  for (const m of matches) {
    (matchesByTeam[m.teamA.id] ??= []).push(m);
    (matchesByTeam[m.teamB.id] ??= []).push(m);
  }

  const getSquad = squadsMod?.getSquad ?? (() => null);

  return {
    teams,
    teamById,
    groups,
    groupLetters: Object.keys(groups).sort(),
    matches,
    matchesByGroup,
    matchesByTeam,
    stadiums: STADIUMS,
    matchDays: MATCH_DAYS,
    knockout: KNOCKOUT_BRACKET,
    getSquad,
  };
}

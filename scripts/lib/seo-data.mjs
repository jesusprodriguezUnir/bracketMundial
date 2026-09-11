// Carga y normaliza los datos de la UEFA Champions League 2026/27 desde las fuentes TS del frontend.
// Debe ejecutarse bajo `tsx` (resuelve imports .ts sin extensión).

import { slugify } from './seo-i18n.mjs';

export async function loadTournamentData() {
  const uclMod = await import('../../src/data/ucl-2027.ts');
  const clubsMod = await import('../../src/data/ucl-clubs.ts');
  const scheduleMod = await import('../../src/data/league-schedule.ts');
  const squadsMod = await import('../../src/data/squads/index.ts').catch(() => null);

  const teamsRaw = uclMod.TEAMS_2026;
  const UCL_CLUBS_DATA = clubsMod.UCL_CLUBS_DATA;
  const GROUP_MATCHES = scheduleMod.GROUP_MATCHES;

  const teams = teamsRaw.map((t) => {
    const profile = UCL_CLUBS_DATA[t.id];
    return {
      id: t.id,
      nameEs: t.name,
      nameEn: t.name,
      shortName: t.shortName,
      group: 'LP',
      slugEs: slugify(t.name),
      slugEn: slugify(t.name),
      flag: t.flag,
      flagUrl: t.flagUrl,
      profile,
      stadium: profile?.stadium ?? { name: 'Estadio local', capacity: 50000 },
      city: profile?.city ?? 'Europa',
      country: profile?.country ?? 'Europa',
      uclTitles: profile?.uclTitles ?? 0,
      uclBest: profile?.uclBest ?? '',
      uclHistory: profile?.uclHistory ?? { es: '', en: '' },
      colors: profile?.colors ?? ['#1a1933', '#ffffff'],
    };
  });

  const teamById = new Map(teams.map((t) => [t.id, t]));

  // Estadios de los 36 clubes
  const stadiums = teams.map((tm) => ({
    id: slugify(tm.stadium.name),
    name: tm.stadium.name,
    capacity: tm.stadium.capacity,
    city: tm.city,
    country: tm.country,
    clubName: tm.nameEs,
    highlight: tm.uclTitles > 0 ? `${tm.uclTitles} Copa(s) de Europa en sus vitrinas.` : `Sede europea en ${tm.city}.`,
  }));

  // Sede de la Final 2027 (Estadio Metropolitano, Madrid)
  stadiums.push({
    id: 'estadio-metropolitano',
    name: 'Estadio Metropolitano',
    capacity: 70460,
    city: 'Madrid',
    country: 'España',
    clubName: 'Club Atlético de Madrid',
    highlight: 'Sede oficial de la Gran Final de la UEFA Champions League el 5 de junio de 2027.',
  });

  const matches = GROUP_MATCHES.map((m) => {
    const teamA = teamById.get(m.teamA);
    const teamB = teamById.get(m.teamB);
    return {
      matchId: m.matchId,
      group: 'LP',
      teamA,
      teamB,
      matchDay: m.matchDay,
      date: m.date,
      timeSpain: m.timeSpain,
      venue: m.venue,
      city: m.city,
    };
  });

  const matchesByMatchDay = {};
  for (let d = 1; d <= 8; d++) {
    matchesByMatchDay[d] = matches.filter((m) => m.matchDay === d);
  }

  const matchesByTeam = {};
  for (const m of matches) {
    if (m.teamA) (matchesByTeam[m.teamA.id] ??= []).push(m);
    if (m.teamB) (matchesByTeam[m.teamB.id] ??= []).push(m);
  }

  const matchDays = [
    { id: 'jornada-1', matchDay: 1, label: 'Jornada 1', labelEn: 'Matchday 1', dates: '8-10 sep 2026', datesEn: 'Sep 8-10, 2026' },
    { id: 'jornada-2', matchDay: 2, label: 'Jornada 2', labelEn: 'Matchday 2', dates: '13-14 oct 2026', datesEn: 'Oct 13-14, 2026' },
    { id: 'jornada-3', matchDay: 3, label: 'Jornada 3', labelEn: 'Matchday 3', dates: '20-21 oct 2026', datesEn: 'Oct 20-21, 2026' },
    { id: 'jornada-4', matchDay: 4, label: 'Jornada 4', labelEn: 'Matchday 4', dates: '3-4 nov 2026', datesEn: 'Nov 3-4, 2026' },
    { id: 'jornada-5', matchDay: 5, label: 'Jornada 5', labelEn: 'Matchday 5', dates: '24-25 nov 2026', datesEn: 'Nov 24-25, 2026' },
    { id: 'jornada-6', matchDay: 6, label: 'Jornada 6', labelEn: 'Matchday 6', dates: '8-9 dic 2026', datesEn: 'Dec 8-9, 2026' },
    { id: 'jornada-7', matchDay: 7, label: 'Jornada 7', labelEn: 'Matchday 7', dates: '19-20 ene 2027', datesEn: 'Jan 19-20, 2027' },
    { id: 'jornada-8', matchDay: 8, label: 'Jornada 8', labelEn: 'Matchday 8', dates: '27 ene 2027', datesEn: 'Jan 27, 2027' },
  ];

  const getSquad = squadsMod?.getSquad ?? (() => []);

  return {
    teams,
    teamById,
    groups: { LP: teams },
    groupLetters: ['LP'],
    matches,
    matchesByGroup: { LP: matches },
    matchesByTeam,
    matchesByMatchDay,
    stadiums,
    matchDays,
    getSquad,
  };
}

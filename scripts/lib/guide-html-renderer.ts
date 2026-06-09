import type { GuideData, GuideTeamData, GuideMatch } from '../../src/lib/guide-service';
import { STADIUMS } from '../../src/data/stadiums';

const TEAM_COLORS: Record<string, [string, string]> = {
  ARG: ['#75AADB', '#fff'], AUS: ['#FFD700', '#00843D'], AUT: ['#ED2939', '#fff'],
  BEL: ['#E42B2B', '#000'], BOL: ['#1D7D3A', '#FFD700'], BRA: ['#FFD700', '#009739'],
  CAN: ['#E42B2B', '#fff'], CHI: ['#E42B2B', '#0047AB'], COL: ['#FFD700', '#003893'],
  CRC: ['#E42B2B', '#0015FF'], CRO: ['#E42B2B', '#fff'], CZE: ['#003399', '#E42B2B'],
  DEN: ['#E42B2B', '#fff'], ECU: ['#FFD700', '#034EA2'], EGY: ['#E42B2B', '#fff'],
  ENG: ['#fff', '#C8102E'], ESP: ['#E42B2B', '#FFC400'], FRA: ['#002395', '#E42B2B'],
  GER: ['#fff', '#000'], GHA: ['#E42B2B', '#00843D'], GRE: ['#0035BC', '#fff'],
  HUN: ['#E42B2B', '#477050'], IRN: ['#fff', '#239F40'], ITA: ['#008FD7', '#fff'],
  JAM: ['#009B3A', '#FFD200'], JOR: ['#fff', '#E42B2B'], JPN: ['#0044AD', '#fff'],
  KSA: ['#fff', '#006C35'], KOR: ['#E42B2B', '#0047AB'], MAR: ['#E42B2B', '#006233'],
  MEX: ['#006847', '#E42B2B'], NGA: ['#008751', '#fff'], NED: ['#FF6600', '#fff'],
  NOR: ['#E42B2B', '#00205B'], NZL: ['#fff', '#000'], PAR: ['#E42B2B', '#0035BC'],
  PER: ['#E42B2B', '#fff'], POL: ['#fff', '#DC143C'], POR: ['#006600', '#E42B2B'],
  QAT: ['#fff', '#731A22'], IRL: ['#169B62', '#fff'], ROU: ['#FFD700', '#0035BC'],
  SEN: ['#00853F', '#FFD700'], SRB: ['#E42B2B', '#003399'], SVK: ['#fff', '#003399'],
  SLO: ['#fff', '#005DA4'], RSA: ['#FFD700', '#00843D'], SWE: ['#FFD700', '#005B99'],
  SUI: ['#E42B2B', '#fff'], TUN: ['#E42B2B', '#fff'], UKR: ['#0057B7', '#FFD700'],
  URU: ['#75AADB', '#fff'], USA: ['#E42B2B', '#fff'], VEN: ['#FFD700', '#003893'],
  WAL: ['#E42B2B', '#fff'], ALG: ['#E42B2B', '#006233'], BIH: ['#FFD700', '#0035BC'],
  CIV: ['#FF771F', '#009A44'], CPV: ['#003893', '#FFD700'], COD: ['#007FFF', '#FFD700'],
  CUW: ['#003893', '#FFD700'], HAI: ['#0035BC', '#E42B2B'], IRQ: ['#E42B2B', '#fff'],
  PAN: ['#003893', '#E42B2B'], SCO: ['#0035BC', '#fff'], TUR: ['#E42B2B', '#fff'],
  UZB: ['#0099B5', '#E42B2B'],
};

const WORLD_CUP_HISTORY = [
  { year: 1930, host: 'Uruguay', winner: 'URU', runnerUp: 'ARG', score: '4-2' },
  { year: 1934, host: 'Italia', winner: 'ITA', runnerUp: 'CZE', score: '2-1' },
  { year: 1938, host: 'Francia', winner: 'ITA', runnerUp: 'HUN', score: '4-2' },
  { year: 1950, host: 'Brasil', winner: 'URU', runnerUp: 'BRA', score: '2-1' },
  { year: 1954, host: 'Suiza', winner: 'GER', runnerUp: 'HUN', score: '3-2' },
  { year: 1958, host: 'Suecia', winner: 'BRA', runnerUp: 'SWE', score: '5-2' },
  { year: 1962, host: 'Chile', winner: 'BRA', runnerUp: 'CZE', score: '3-1' },
  { year: 1966, host: 'Inglaterra', winner: 'ENG', runnerUp: 'GER', score: '4-2' },
  { year: 1970, host: 'México', winner: 'BRA', runnerUp: 'ITA', score: '4-1' },
  { year: 1974, host: 'Alemania', winner: 'GER', runnerUp: 'NED', score: '2-1' },
  { year: 1978, host: 'Argentina', winner: 'ARG', runnerUp: 'NED', score: '3-1' },
  { year: 1982, host: 'España', winner: 'ITA', runnerUp: 'GER', score: '3-1' },
  { year: 1986, host: 'México', winner: 'ARG', runnerUp: 'GER', score: '3-2' },
  { year: 1990, host: 'Italia', winner: 'GER', runnerUp: 'ARG', score: '1-0' },
  { year: 1994, host: 'EE. UU.', winner: 'BRA', runnerUp: 'ITA', score: '0-0 (3-2 pen.)' },
  { year: 1998, host: 'Francia', winner: 'FRA', runnerUp: 'BRA', score: '3-0' },
  { year: 2002, host: 'Corea/Japón', winner: 'BRA', runnerUp: 'GER', score: '2-0' },
  { year: 2006, host: 'Alemania', winner: 'ITA', runnerUp: 'FRA', score: '1-1 (5-3 pen.)' },
  { year: 2010, host: 'Sudáfrica', winner: 'ESP', runnerUp: 'NED', score: '1-0' },
  { year: 2014, host: 'Brasil', winner: 'GER', runnerUp: 'ARG', score: '1-0' },
  { year: 2018, host: 'Rusia', winner: 'FRA', runnerUp: 'CRO', score: '4-2' },
  { year: 2022, host: 'Catar', winner: 'ARG', runnerUp: 'FRA', score: '3-3 (4-2 pen.)' },
];

const FORMATIONS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  '4-3-3': [[50,140],[14,108],[37,108],[63,108],[86,108],[24,80],[50,80],[76,80],[20,40],[50,32],[80,40]],
  '4-4-2': [[50,140],[14,108],[37,108],[63,108],[86,108],[14,78],[37,80],[63,80],[86,78],[36,38],[64,38]],
  '4-2-3-1': [[50,140],[14,108],[37,108],[63,108],[86,108],[35,88],[65,88],[20,60],[50,58],[80,60],[50,32]],
  '3-5-2': [[50,140],[25,108],[50,108],[75,108],[10,82],[30,80],[50,76],[70,80],[90,82],[36,38],[64,38]],
  '3-4-3': [[50,140],[25,108],[50,108],[75,108],[14,80],[37,82],[63,82],[86,80],[22,40],[50,32],[78,40]],
  '5-3-2': [[50,140],[8,103],[29,110],[50,113],[71,110],[92,103],[28,80],[50,80],[72,80],[36,38],[64,38]],
};

const T: Record<string, Record<string, string>> = {
  es: {
    coverTitle: 'GUÍA OFICIAL', coverSubtitle: '48 SELECCIONES · 104 PARTIDOS · 3 PAÍSES',
    teams: 'Selecciones', stadiums: 'Estadios', matches: 'Partidos',
    calendarSection: 'CALENDARIO COMPLETO', groups: 'GRUPOS', knockout: 'ELIMINATORIAS',
    teamsSection: 'FICHAS DE EQUIPOS', coach: 'Entrenador', formation: 'Formación',
    group: 'Grupo', captain: 'CAP', fifaRank: 'FIFA Rank', worldCups: 'Mundiales',
    matchday: 'J', r32: 'Dieciseisavos', r16: 'Octavos', qf: 'Cuartos', sf: 'Semifinales',
    tp: '3er Puesto', final: 'Final', vs: 'vs',
    champion: 'CAMPEÓN', runnerUp: 'FINALISTA', thirdPlace: 'BRONCE',
    generatedBy: 'Generado por bracketmundial.com',
    stadiumsSection: 'Estadios', stadiumsSub: 'Las 16 sedes que albergarán la Copa del Mundo 2026',
    capacity: 'Capacidad', stadiumMatches: 'Partidos',
    kitsSection: 'Escudos y Países', kitsSub: 'Las 48 selecciones participantes agrupadas por grupo',
    home: 'Local', away: 'Visitante',
    historySection: 'Historia de la Copa del Mundo', historySub: 'Todos los campeones desde 1930 hasta 2022',
    predictionSection: 'PREDICCIÓN', predictionDesc: '¿QUIÉN SE LLEVA LA COPA?',
    podiumPred: 'PODIO PREDICHO', tbd: 'Por definir', modeAuto: 'Predicción automática',
    matchCount: 'Partidos', days: 'Días', venues: 'Sedes',
    footer: 'Guía oficial de bracketmundial.com', noLineup: 'Sin alineación disponible',
  },
  en: {
    coverTitle: 'OFFICIAL GUIDE', coverSubtitle: '48 TEAMS · 104 MATCHES · 3 COUNTRIES',
    teams: 'Teams', stadiums: 'Stadiums', matches: 'Matches',
    calendarSection: 'FULL SCHEDULE', groups: 'GROUPS', knockout: 'KNOCKOUT',
    teamsSection: 'TEAM SHEETS', coach: 'Coach', formation: 'Formation',
    group: 'Group', captain: 'CAP', fifaRank: 'FIFA Rank', worldCups: 'World Cups',
    matchday: 'MD', r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-Finals',
    sf: 'Semi-Finals', tp: '3rd Place', final: 'Final', vs: 'vs',
    champion: 'CHAMPION', runnerUp: 'RUNNER-UP', thirdPlace: '3RD PLACE',
    generatedBy: 'Generated by bracketmundial.com',
    stadiumsSection: 'Stadiums', stadiumsSub: 'The 16 venues hosting the 2026 World Cup',
    capacity: 'Capacity', stadiumMatches: 'Matches',
    kitsSection: 'Crests & Countries', kitsSub: 'All 48 participating nations grouped by stage',
    home: 'Home', away: 'Away',
    historySection: 'World Cup History', historySub: 'Every champion from 1930 to 2022',
    predictionSection: 'PREDICTION', predictionDesc: 'WHO TAKES THE CUP?',
    podiumPred: 'PREDICTED PODIUM', tbd: 'TBD', modeAuto: 'Auto Prediction',
    matchCount: 'Matches', days: 'Days', venues: 'Venues',
    footer: 'Official guide by bracketmundial.com', noLineup: 'No lineup available',
  },
};

const ROUND_LABELS: Record<string, Record<string, string>> = {
  es: { roundOf32: 'Dieciseisavos', roundOf16: 'Octavos', quarterfinals: 'Cuartos',
    semifinals: 'Semifinales', thirdPlace: '3er Puesto', final: 'Final' },
  en: { roundOf32: 'Round of 32', roundOf16: 'Round of 16', quarterfinals: 'Quarter-Finals',
    semifinals: 'Semi-Finals', thirdPlace: '3rd Place', final: 'Final' },
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bioText(bio: string | { es: string; en: string } | undefined, lang: string): string {
  if (!bio) return '';
  if (typeof bio === 'string') return bio;
  return bio[lang] ?? bio.es ?? bio.en ?? '';
}

function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return esc(parts.at(-1) ?? name);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}/${m}/${y}`;
}

function posLabel(pos: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    GK: { es: 'POR', en: 'GK' }, DF: { es: 'DEF', en: 'DF' },
    MF: { es: 'MED', en: 'MF' }, FW: { es: 'DEL', en: 'FW' },
  };
  return map[pos]?.[lang] ?? pos;
}

function toFileUrl(rootDir: string, path: string): string {
  const clean = path.replace(/^\//, '');
  const full = rootDir.replace(/\/?$/, '/') + 'public/' + clean;
  return 'file:///' + full.replace(/\\/g, '/').replace(/\/\//g, '/');
}

function teamFlagUrl(team: GuideTeamData, rd: string): string {
  return toFileUrl(rd, team.flagUrl || `/assets/flags/${team.teamId.toLowerCase()}.svg`);
}

function playerImg(team: GuideTeamData, p: { number: number; hasPhoto: boolean }, rd: string): string {
  if (!p.hasPhoto) return '';
  return toFileUrl(rd, `/players-upscaled/${team.teamId}/${p.number}.webp`);
}

function coachImg(team: GuideTeamData, rd: string): string {
  if (!team.hasCoachPhoto) return '';
  return toFileUrl(rd, `/coaches/${team.teamId}.webp`);
}

function flagUrlById(teamId: string, teams: GuideTeamData[], rd: string): string {
  const t = teams.find(x => x.teamId === teamId);
  return t ? teamFlagUrl(t, rd) : toFileUrl(rd, `/assets/flags/${teamId.toLowerCase()}.svg`);
}

function teamNameById(teamId: string, teams: GuideTeamData[]): string {
  return teams.find(t => t.teamId === teamId)?.name ?? teamId;
}

function getHistoryFlagUrl(teamId: string, rd: string): string {
  return toFileUrl(rd, `/assets/flags/${teamId.toLowerCase()}.svg`);
}

// ── CSS ──
const GUIDE_CSS = `
:root {
  --paper: #ecdfc0; --paper-2: #e6d6b1; --paper-3: #fff9ec;
  --ink: #1a1933; --ink-soft: rgba(26,25,51,0.75); --ink-muted: rgba(26,25,51,0.6);
  --retro-orange: #e8541f; --retro-red: #c41e2c; --retro-green: #1f6b3a;
  --retro-blue: #22418c; --retro-yellow: #f0b021; --dim: #7a6f54;
  --font-var: 'Bowlby One', 'Anton', Impact, sans-serif;
  --font-head: 'Archivo Black', 'Anton', Impact, sans-serif;
  --font-body: 'Archivo', 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Space Mono', 'JetBrains Mono', monospace;
  --shadow-hard-sm: 2px 2px 0 0 var(--ink);
  --shadow-hard-md: 3px 3px 0 0 var(--ink);
  --shadow-hard-lg: 4px 4px 0 0 var(--ink);
  --shadow-hard-xl: 6px 6px 0 0 var(--ink);
}
body {
  margin: 0; padding: 0;
  font-family: var(--font-body);
  background: var(--paper); color: var(--ink);
}
.guide-document { background: var(--paper); color: var(--ink); padding: 0 36px; box-sizing: border-box; }

/* ── Cabecera y pie de página ── */
.pdf-running-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px dotted var(--ink);
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--dim); margin-bottom: 16px;
}
.pdf-page-footer {
  display: flex; justify-content: center; align-items: center;
  padding: 10px 0; border-top: 1px solid var(--ink);
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.1em;
  color: var(--dim); margin-top: 16px;
}

/* ── Portada ── */
.cover-page {
  page-break-after: always;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  min-height: 1100px; text-align: center; padding: 60px 40px 20px;
  border: 4px solid var(--ink);
  box-shadow: inset 0 0 80px rgba(26,25,51,0.04);
  position: relative; overflow: hidden;
}
.cover-page::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 30%, rgba(255,200,50,0.08) 0%, transparent 60%),
              radial-gradient(ellipse at 50% 70%, rgba(230,70,50,0.05) 0%, transparent 50%);
  pointer-events: none;
}
.cover-top-strip {
  width: 100%; height: 6px;
  background: linear-gradient(90deg, var(--retro-orange), var(--retro-yellow), var(--retro-green));
  border-bottom: 2px solid var(--ink); margin-bottom: 24px;
}
.cover-eyebrow {
  font-family: var(--font-mono); font-size: 14px; letter-spacing: 0.35em;
  color: var(--retro-orange); margin-bottom: 20px; position: relative;
}
.cover-title {
  font-family: var(--font-var); font-size: 60px; line-height: 0.95;
  color: var(--ink); margin-bottom: 12px; position: relative;
  text-shadow: 2px 2px 0 var(--retro-yellow);
}
.cover-subtitle {
  font-family: var(--font-var); font-size: 22px; color: var(--dim);
  margin-bottom: 28px; position: relative;
}
.cover-badge {
  display: inline-block; padding: 12px 28px; border: 3px solid var(--ink);
  box-shadow: 3px 3px 0 var(--ink); font-family: var(--font-mono); font-size: 12px;
  letter-spacing: 0.15em; background: var(--retro-yellow); color: var(--ink);
  margin-bottom: 24px; position: relative;
}
.cover-stats-bar { display: flex; gap: 20px; margin-bottom: 20px; position: relative; }
.cover-stat {
  display: flex; flex-direction: column; align-items: center; padding: 8px 18px;
  border: 2px solid var(--ink); background: var(--paper-2);
}
.cover-stat-num {
  font-family: var(--font-var); font-size: 30px; font-weight: 900;
  line-height: 1; color: var(--retro-orange);
}
.cover-stat-label {
  font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.1em;
  color: var(--dim); text-transform: uppercase; margin-top: 2px;
}
.cover-flags {
  display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; max-width: 100%; margin-top: 12px;
}
.cover-flag { width: 100%; height: auto; aspect-ratio: 3/2; object-fit: cover; border: 1px solid var(--ink); box-shadow: 1px 1px 0 var(--ink); }
.cover-bottom-bar {
  width: 100%; margin-top: 16px; padding: 8px 0; border-top: 2px solid var(--ink);
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  color: var(--dim); display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; position: relative;
}

/* ── Secciones ── */
.section-page { page-break-before: always; padding: 24px 0; }
.section-header { border-bottom: 3px dashed var(--ink); margin-bottom: 24px; padding-bottom: 12px; }
.section-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.25em; color: var(--retro-orange); text-transform: uppercase; }
.section-title { font-family: var(--font-var); font-size: 28px; line-height: 1.1; color: var(--ink); margin-top: 4px; }

/* ── Calendario ── */
.calendar-date { margin-bottom: 20px; page-break-inside: avoid; }
.calendar-date-header {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em;
  background: var(--ink); color: var(--paper); padding: 6px 10px; margin-bottom: 8px;
}
.calendar-match {
  display: grid; grid-template-columns: 45px minmax(0,1fr) 70px minmax(0,1fr) 55px;
  gap: 6px; align-items: center; padding: 6px 0;
  border-bottom: 1px dashed rgba(26,25,51,0.15); font-size: 11px;
}
.calendar-time { font-family: var(--font-mono); font-size: 11px; color: var(--dim); }
.calendar-team { font-family: var(--font-var); font-size: 13px; display: flex; align-items: center; gap: 6px; min-width: 0; }
.calendar-flag { width: 20px; height: 14px; object-fit: cover; border: 1px solid var(--ink); flex-shrink: 0; }
.calendar-score { font-family: var(--font-mono); font-size: 12px; text-align: center; background: var(--paper-2); padding: 2px 6px; border: 1px solid var(--ink); }
.calendar-venue { font-family: var(--font-mono); font-size: 8px; color: var(--dim); text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.calendar-group-label { display: inline-block; font-family: var(--font-mono); font-size: 9px; background: var(--retro-yellow); color: var(--ink); padding: 1px 5px; margin-left: 6px; }
.calendar-round-label { display: inline-block; font-family: var(--font-mono); font-size: 9px; background: var(--retro-orange); color: var(--paper); padding: 1px 5px; margin-left: 6px; }

/* ── Ficha de equipo ── */
.team-sheet { page-break-after: always; padding: 16px 0; box-sizing: border-box; }
.team-sheet:last-of-type { page-break-after: auto; }
.team-sheet-header { display: flex; align-items: center; gap: 12px; border-bottom: 3.5px solid var(--ink); padding-bottom: 8px; margin-bottom: 12px; }
.team-sheet-flag { width: 44px; height: 30px; object-fit: cover; border: 2px solid var(--ink); box-shadow: 1.5px 1.5px 0 var(--ink); }
.team-sheet-title { flex: 1; }
.team-sheet-name { font-family: var(--font-var); font-size: 20px; line-height: 1; font-weight: bold; }
.team-sheet-meta { font-family: var(--font-mono); font-size: 8.5px; color: var(--dim); letter-spacing: 0.05em; margin-top: 3px; }
.team-top-row { display: grid; grid-template-columns: 1.25fr 1fr; gap: 16px; margin-bottom: 10px; align-items: start; }

/* Coach */
.coach-block-mini {
  display: flex; gap: 8px; align-items: center;
  background: var(--paper-2); border: 1.5px solid var(--ink);
  box-shadow: 1.5px 1.5px 0 var(--ink); padding: 6px; margin-bottom: 8px;
}
.coach-photo-mini { width: 32px; height: 32px; object-fit: cover; border: 1px solid var(--ink); border-radius: 50%; }
.coach-info-mini { flex: 1; min-width: 0; }
.coach-name-mini { font-family: var(--font-var); font-size: 11px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.coach-detail-mini { font-family: var(--font-mono); font-size: 7.5px; color: var(--dim); }
.coach-placeholder { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--ink); display: flex; align-items: center; justify-content: center; font-size: 14px; background: var(--paper-3); flex-shrink: 0; }

/* Match mini */
.matches-block-mini { background: var(--paper-3); border: 1.5px solid var(--ink); box-shadow: 1.5px 1.5px 0 var(--ink); padding: 6px; }
.matches-title-mini { font-family: var(--font-var); font-size: 10px; font-weight: bold; margin-bottom: 4px; color: var(--retro-orange); }
.match-row-mini { display: grid; grid-template-columns: 20px 1fr auto; gap: 6px; align-items: center; padding: 3px 0; border-bottom: 1px dashed rgba(26,25,51,0.1); font-size: 8.5px; }
.match-row-mini:last-child { border-bottom: none; }
.match-day-mini { font-family: var(--font-mono); font-weight: bold; color: var(--dim); }
.match-teams-mini { display: flex; align-items: center; gap: 3px; min-width: 0; }
.match-flag-mini { width: 14px; height: 10px; object-fit: cover; border: 0.5px solid var(--ink); flex-shrink: 0; }
.match-team-name-mini { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 60px; font-weight: bold; }
.match-score-mini { font-family: var(--font-mono); background: rgba(26,25,51,0.06); padding: 0 3px; border: 0.5px solid var(--ink); font-size: 8px; flex-shrink: 0; }
.match-time-mini { font-family: var(--font-mono); color: var(--dim); font-size: 7.5px; }

/* Pitch */
.pitch-block-mini {
  background: repeating-linear-gradient(to bottom, var(--retro-green) 0 10%, color-mix(in srgb, var(--retro-green) 86%, #000) 10% 20%);
  border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink);
  aspect-ratio: 100/150; position: relative; width: 100%; max-width: 190px; margin: 0 auto;
}
.pitch-svg-mini { position: absolute; inset: 0; width: 100%; height: 100%; }
.pitch-svg-mini .line { fill: none; stroke: rgba(255,255,255,0.48); stroke-width: 0.7; }
.pitch-svg-mini .line-bold { fill: none; stroke: rgba(255,255,255,0.64); stroke-width: 1; }
.pitch-svg-mini .spot { fill: rgba(255,255,255,0.64); }
.player-card-pitch {
  position: absolute; transform: translate(-50%,-50%);
  width: 32px; display: flex; flex-direction: column; align-items: center; gap: 1px;
}
.player-photo-pitch {
  width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid var(--ink);
  background: var(--retro-blue); display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 8px; font-weight: bold; color: var(--paper);
  box-shadow: 1px 1px 0 rgba(0,0,0,0.15);
}
.player-card-pitch.gk .player-photo-pitch { background: var(--retro-yellow); color: var(--ink); }
.player-name-pitch {
  font-family: var(--font-body); font-size: 6.5px; font-weight: 800; color: var(--paper);
  background: var(--ink); border: 0.5px solid var(--paper);
  padding: 0 2px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; line-height: 1; text-align: center;
}
.pitch-empty { font-size: 8px; padding: 10px; color: var(--dim); }

/* Players grouped by position */
.position-group { margin-bottom: 14px; page-break-inside: avoid; }
.position-group-header {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.15em;
  padding: 3px 8px; margin-bottom: 6px; border: 1.5px solid var(--ink);
  box-shadow: 1.5px 1.5px 0 var(--ink);
}
.pos-gk { background: var(--retro-yellow); color: var(--ink); }
.pos-df { background: var(--retro-blue); color: var(--paper); }
.pos-mf { background: var(--retro-green); color: var(--paper); }
.pos-fw { background: var(--retro-orange); color: var(--paper); }
.player-full-card {
  display: grid; grid-template-columns: 64px 1fr; gap: 6px 10px;
  border: 1.5px solid var(--ink); box-shadow: 1.5px 1.5px 0 var(--ink);
  background: var(--paper-2); padding: 6px 8px; margin-bottom: 5px;
  page-break-inside: avoid;
}
.player-full-photo {
  width: 64px; height: 64px; border-radius: 50%; border: 1.5px solid var(--ink);
  object-fit: cover; background: var(--paper-3);
  grid-row: 1 / 3; grid-column: 1 / 2;
}
.player-full-photo-placeholder {
  width: 64px; height: 64px; border-radius: 50%; border: 1.5px solid var(--ink);
  display: flex; align-items: center; justify-content: center; font-size: 22px;
  color: var(--dim); background: var(--paper-3);
  grid-row: 1 / 3; grid-column: 1 / 2;
}
.player-full-info { grid-column: 2 / 3; }
.player-full-name { font-family: var(--font-var); font-size: 13px; font-weight: bold; line-height: 1.1; }
.player-full-meta { font-family: var(--font-mono); font-size: 9px; color: var(--ink-soft); margin-top: 2px; }
.player-full-club { font-family: var(--font-body); font-size: 10px; color: var(--ink-soft); margin-top: 2px; }
.player-full-badge {
  display: inline-block; font-family: var(--font-mono); font-size: 8px;
  background: var(--ink); color: var(--paper); padding: 0 4px; margin-top: 2px;
}
.player-full-badge.captain { background: var(--retro-yellow); color: var(--ink); }
.player-full-badge.special { background: var(--retro-yellow); color: var(--ink); }
.player-full-badge.stats { background: var(--paper-3); color: var(--ink); border: 0.5px solid var(--ink); }
.player-full-bio {
  grid-column: 1 / -1;
  font-family: var(--font-body); font-size: 8.5px; line-height: 1.35;
  color: var(--ink-soft); margin-top: 2px; padding-top: 4px;
  border-top: 1px dashed rgba(26,25,51,0.12); white-space: pre-line;
}

/* ── Predicción ── */
.prediction-page { page-break-before: always; padding: 24px 0; }
.prediction-podium { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 16px; margin: 24px 0; align-items: end; }
.podium-item { border: 3px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); padding: 16px; text-align: center; background: var(--paper-2); }
.podium-item.champion { background: var(--retro-yellow); order: 2; }
.podium-item.runner-up { order: 1; }
.podium-item.third { order: 3; }
.podium-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.15em; margin-bottom: 8px; }
.podium-flag { width: 48px; height: 32px; object-fit: cover; border: 1px solid var(--ink); margin-bottom: 8px; }
.podium-name { font-family: var(--font-var); font-size: 16px; }
.bracket-summary { margin-top: 24px; }
.bracket-round { margin-bottom: 16px; }
.bracket-round-title { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; background: var(--ink); color: var(--paper); padding: 4px 10px; margin-bottom: 8px; }
.bracket-match { display: grid; grid-template-columns: 1fr 50px 1fr; gap: 8px; align-items: center; padding: 6px 0; border-bottom: 1px dashed rgba(26,25,51,0.15); font-size: 13px; }
.bracket-team { display: flex; align-items: center; gap: 6px; }
.bracket-team.winner { font-weight: bold; }
.bracket-score { font-family: var(--font-mono); text-align: center; background: var(--paper-2); border: 1px solid var(--ink); padding: 2px 6px; }
.footer-line { margin-top: 40px; padding-top: 12px; border-top: 2px solid var(--ink); font-family: var(--font-mono); font-size: 9px; color: var(--dim); text-align: center; letter-spacing: 0.1em; }

/* ── Estadios ── */
.stadiums-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.stadium-card { border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); background: var(--paper-2); page-break-inside: avoid; }
.stadium-card-image { width: 100%; height: 130px; object-fit: cover; border-bottom: 2px solid var(--ink); display: block; }
.stadium-card-body { padding: 10px 12px; }
.stadium-card-name { font-family: var(--font-var); font-size: 14px; font-weight: bold; line-height: 1.1; margin-bottom: 4px; }
.stadium-card-location { font-family: var(--font-mono); font-size: 9px; color: var(--dim); letter-spacing: 0.05em; margin-bottom: 6px; }
.stadium-card-capacity { display: inline-block; font-family: var(--font-mono); font-size: 10px; background: var(--ink); color: var(--paper); padding: 2px 8px; margin-bottom: 6px; }
.stadium-card-desc { font-family: var(--font-body); font-size: 10px; line-height: 1.4; color: var(--ink); margin-bottom: 6px; }
.stadium-card-matches { font-family: var(--font-mono); font-size: 8.5px; color: var(--dim); border-top: 1px dashed rgba(26,25,51,0.2); padding-top: 5px; }
.stadium-card-highlight { display: inline-block; font-family: var(--font-mono); font-size: 8px; background: var(--retro-yellow); color: var(--ink); padding: 1px 5px; margin-top: 4px; }

/* ── Kits ── */
.kits-group-block { margin-bottom: 20px; page-break-inside: avoid; }
.kits-group-header { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; background: var(--ink); color: var(--paper); padding: 5px 10px; margin-bottom: 8px; }
.kits-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.kit-card { border: 1.5px solid var(--ink); box-shadow: 1.5px 1.5px 0 var(--ink); background: var(--paper-2); padding: 8px; text-align: center; page-break-inside: avoid; }
.kit-crest { width: 48px; height: 48px; object-fit: contain; margin-bottom: 6px; }
.kit-team-name { font-family: var(--font-var); font-size: 10px; font-weight: bold; line-height: 1.1; margin-bottom: 4px; }
.kit-color-bar { display: flex; gap: 3px; justify-content: center; margin-top: 4px; }
.kit-color-swatch { width: 20px; height: 10px; border: 1px solid var(--ink); }
.kit-label { font-family: var(--font-mono); font-size: 7px; color: var(--dim); text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Historia ── */
.history-timeline { position: relative; padding-left: 30px; }
.history-timeline::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: var(--ink); }
.history-item {
  position: relative; margin-bottom: 10px; padding: 8px 12px;
  border: 1.5px solid var(--ink); box-shadow: 1.5px 1.5px 0 var(--ink);
  background: var(--paper-2); page-break-inside: avoid;
  display: flex; align-items: center; gap: 10px;
}
.history-item::before {
  content: ''; position: absolute; left: -26px; top: 50%; transform: translateY(-50%);
  width: 10px; height: 10px; border-radius: 50%; background: var(--retro-orange);
  border: 2px solid var(--ink);
}
.history-year { font-family: var(--font-mono); font-size: 16px; font-weight: bold; color: var(--retro-orange); min-width: 48px; }
.history-flags { display: flex; align-items: center; gap: 6px; flex: 1; }
.history-flag { width: 28px; height: 19px; object-fit: cover; border: 1px solid var(--ink); }
.history-vs { font-family: var(--font-mono); font-size: 10px; color: var(--dim); }
.history-score { font-family: var(--font-mono); font-size: 13px; font-weight: bold; background: var(--ink); color: var(--paper); padding: 1px 6px; }
.history-host { font-family: var(--font-body); font-size: 9px; color: var(--dim); margin-left: auto; white-space: nowrap; }
`;

// ── Section Renderers ──

function renderCover(data: GuideData, lang: string, rd: string, t: Record<string,string>): string {
  const ct = data.teams.length;
  return `<div class="cover-page">
    <div class="cover-top-strip"></div>
    <div class="cover-eyebrow">FIFA WORLD CUP 2026</div>
    <div class="cover-title">${esc(t.coverTitle)}</div>
    <div class="cover-subtitle">${esc(t.coverSubtitle)}</div>
    <div class="cover-badge">${esc(t.modeAuto)}</div>
    <div class="cover-stats-bar">
      <div class="cover-stat"><span class="cover-stat-num">${ct}</span><span class="cover-stat-label">${esc(t.teams)}</span></div>
      <div class="cover-stat"><span class="cover-stat-num">16</span><span class="cover-stat-label">${esc(t.venues)}</span></div>
      <div class="cover-stat"><span class="cover-stat-num">104</span><span class="cover-stat-label">${esc(t.matchCount)}</span></div>
    </div>
    <div class="cover-flags">
      ${data.teams.slice(0, 48).map(team => `<img class="cover-flag" src="${teamFlagUrl(team, rd)}" alt="${esc(team.name)}" />`).join('')}
    </div>
    <div class="cover-bottom-bar">
      <span>${esc(t.footer)}</span>
      <span>· 11 Jun · 19 Jul 2026 ·</span>
      <span>EE.UU. · México · Canadá</span>
    </div>
  </div>`;
}

function renderCalendar(data: GuideData, lang: string, rd: string, t: Record<string,string>): string {
  const groupDates: Record<string, GuideMatch[]> = {};
  for (const m of data.groupMatches) {
    if (!groupDates[m.date]) groupDates[m.date] = [];
    groupDates[m.date].push(m);
  }
  const sortedDates = Object.keys(groupDates).sort();

  const knockoutByRound: Record<string, GuideMatch[]> = {
    roundOf32: [], roundOf16: [], quarterfinals: [], semifinals: [], thirdPlace: [], final: [],
  };
  for (const m of data.knockoutMatches) {
    if (m.round && knockoutByRound[m.round]) knockoutByRound[m.round].push(m);
  }
  const rl = ROUND_LABELS[lang];

  function groupMatchRow(m: GuideMatch): string {
    const fA = flagUrlById(m.teamA, data.teams, rd);
    const fB = flagUrlById(m.teamB, data.teams, rd);
    return `<div class="calendar-match">
      <span class="calendar-time">${esc(m.timeSpain || '')}</span>
      <span class="calendar-team"><img class="calendar-flag" src="${fA}" alt="" />${esc(m.teamAName)}</span>
      <span class="calendar-score">vs</span>
      <span class="calendar-team"><img class="calendar-flag" src="${fB}" alt="" />${esc(m.teamBName)}</span>
      <span class="calendar-venue">${esc(m.venue || '')}<span class="calendar-group-label">${esc(m.group || '')}</span></span>
    </div>`;
  }

  function koMatchRow(m: GuideMatch, t: Record<string,string>): string {
    return `<div class="calendar-match">
      <span class="calendar-time">${m.date ? formatDate(m.date) + ' ' + esc(m.timeSpain || '') : ''}</span>
      <span class="calendar-team">${esc(t.tbd)}</span>
      <span class="calendar-score">vs</span>
      <span class="calendar-team">${esc(t.tbd)}</span>
      <span class="calendar-venue">${esc(m.venue || '')}<span class="calendar-round-label">${esc(rl[m.round as keyof typeof rl] || '')}</span></span>
    </div>`;
  }

  return `<div class="section-page">
    <div class="section-header"><div class="section-eyebrow">${esc(t.calendarSection)}</div><div class="section-title">${esc(t.calendarSection)}</div></div>
    <div class="section-header" style="margin-top:24px;"><div class="section-eyebrow">⚽ ${esc(t.groups)}</div></div>
    ${sortedDates.map(date => `<div class="calendar-date"><div class="calendar-date-header">${formatDate(date)}</div>${groupDates[date].map(groupMatchRow).join('')}</div>`).join('')}
    <div class="section-header" style="margin-top:32px;"><div class="section-eyebrow">★ ${esc(t.knockout)}</div></div>
    ${Object.entries(knockoutByRound).map(([round, matches]) => matches.length ? `<div class="calendar-date"><div class="calendar-date-header">${esc(rl[round as keyof typeof rl] || round)}</div>${matches.map(m => koMatchRow(m, t)).join('')}</div>` : '').join('')}
  </div>`;
}

function renderPitchHtml(team: GuideTeamData): string {
  const lineup = team.lineup;
  if (!lineup) return `<div class="pitch-empty">${esc(T[team.group?.length ? 'es' : 'es'].noLineup)}</div>`;
  const coords = FORMATIONS[lineup.formation] ?? FORMATIONS['4-3-3'];
  const xi = lineup.startingXI
    .map(num => team.squad.find(p => p.number === num))
    .filter((p): p is NonNullable<typeof p> => p != null);
  return `<div class="pitch-block-mini">
    <svg class="pitch-svg-mini" viewBox="0 0 100 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="94" height="144" class="line-bold"></rect>
      <line x1="3" y1="75" x2="97" y2="75" class="line"></line>
      <circle cx="50" cy="75" r="11" class="line"></circle><circle cx="50" cy="75" r="0.9" class="spot"></circle>
      <rect x="20" y="3" width="60" height="16" class="line"></rect><rect x="36" y="3" width="28" height="6" class="line"></rect>
      <circle cx="50" cy="12" r="0.9" class="spot"></circle><path d="M 39 19 A 11 11 0 0 0 61 19" class="line"></path>
      <rect x="20" y="131" width="60" height="16" class="line"></rect><rect x="36" y="141" width="28" height="6" class="line"></rect>
      <circle cx="50" cy="138" r="0.9" class="spot"></circle><path d="M 39 131 A 11 11 0 0 1 61 131" class="line"></path>
    </svg>
    ${xi.map((p, i) => {
      const [x, y] = coords[i] ?? [50, 75];
      return `<div class="player-card-pitch ${p.position === 'GK' ? 'gk' : ''}" style="left:${x}%;top:${(y/150)*100}%;" title="${esc(p.name)}">
        <div class="player-photo-pitch">${p.number}</div>
        <div class="player-name-pitch">${lastName(esc(p.name))}</div>
      </div>`;
    }).join('')}
  </div>`;
}

const POSITION_GROUPS = [
  { key: 'GK' as const, es: 'PORTEROS', en: 'GOALKEEPERS', css: 'pos-gk' },
  { key: 'DF' as const, es: 'DEFENSAS', en: 'DEFENDERS', css: 'pos-df' },
  { key: 'MF' as const, es: 'MEDIOCAMPISTAS', en: 'MIDFIELDERS', css: 'pos-mf' },
  { key: 'FW' as const, es: 'DELANTEROS', en: 'FORWARDS', css: 'pos-fw' },
];

function renderPlayerFullCard(p: GuideTeamData['players'][number], team: GuideTeamData, lang: string, rd: string, t: Record<string,string>): string {
  const imgSrc = playerImg(team, p, rd);
  const photoHtml = p.hasPhoto && imgSrc
    ? `<img class="player-full-photo" src="${imgSrc}" alt="${esc(p.name)}" />`
    : `<div class="player-full-photo-placeholder">⚽</div>`;
  const ageLabel = lang === 'es' ? 'años' : 'yrs';
  const fullBio = bioText(p.bio, lang);

  const badges: string[] = [];
  if (p.captain) badges.push(`<span class="player-full-badge captain">${esc(t.captain)}</span>`);
  if (p.special) badges.push(`<span class="player-full-badge special">${esc(p.special)}</span>`);
  const statsParts: string[] = [];
  if (p.caps != null) statsParts.push(`${p.caps} caps`);
  if (p.goals != null) statsParts.push(`${p.goals} ${lang === 'es' ? 'goles' : 'goals'}`);
  if (statsParts.length) badges.push(`<span class="player-full-badge stats">${esc(statsParts.join(' · '))}</span>`);

  return `<div class="player-full-card">
    ${photoHtml}
    <div class="player-full-info">
      <div class="player-full-name">${esc(p.name)}</div>
      <div class="player-full-meta">#${p.number} · ${posLabel(p.position, lang)} · ${p.age} ${ageLabel}</div>
      <div class="player-full-club">${esc(p.club)}</div>
      ${badges.length ? `<div>${badges.join(' ')}</div>` : ''}
    </div>
    ${fullBio ? `<div class="player-full-bio">${esc(fullBio)}</div>` : ''}
  </div>`;
}

function renderTeamSheet(team: GuideTeamData, data: GuideData, lang: string, rd: string, t: Record<string,string>): string {
  const formation = team.lineup?.formation ?? '';
  const posLabelL = (key: string) => POSITION_GROUPS.find(g => g.key === key)?.[lang === 'en' ? 'en' : 'es'] ?? key;

  return `<div class="team-sheet">
    <div class="team-sheet-header">
      <img class="team-sheet-flag" src="${teamFlagUrl(team, rd)}" alt="${esc(team.name)}" />
      <div class="team-sheet-title">
        <div class="team-sheet-name">${esc(team.name)}</div>
        <div class="team-sheet-meta">
          ${esc(t.group)} ${team.group} · ${esc(t.fifaRank)}: #${team.meta.fifaRank}
          ${formation ? '· ' + esc(t.formation) + ' ' + formation : ''}
          · ${team.meta.worldCups} ${esc(t.worldCups)}
        </div>
      </div>
    </div>
    <div class="team-top-row">
      <div>
        ${team.coach ? `<div class="coach-block-mini">
          ${team.hasCoachPhoto
            ? `<img class="coach-photo-mini" src="${coachImg(team, rd)}" alt="${esc(team.coach.name)}" />`
            : `<div class="coach-placeholder">👤</div>`}
          <div class="coach-info-mini">
            <div class="coach-name-mini">${esc(team.coach.name)}</div>
            <div class="coach-detail-mini">${esc(t.coach)} · ${esc(team.coach.nationality)}</div>
          </div>
        </div>` : ''}
        <div class="matches-block-mini">
          <div class="matches-title-mini">📅 ${esc(t.calendarSection)}</div>
          ${team.groupMatches.map(m => {
            const fA = flagUrlById(m.teamA, data.teams, rd);
            const fB = flagUrlById(m.teamB, data.teams, rd);
            return `<div class="match-row-mini">
              <span class="match-day-mini">${esc(t.matchday)}${m.matchDay}</span>
              <span class="match-teams-mini">
                <img class="match-flag-mini" src="${fA}" alt="" />
                <span class="match-team-name-mini">${esc(m.teamAName)}</span>
                <span class="match-score-mini">vs</span>
                <img class="match-flag-mini" src="${fB}" alt="" />
                <span class="match-team-name-mini">${esc(m.teamBName)}</span>
              </span>
              <span class="match-time-mini">${esc(m.timeSpain)}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div>${renderPitchHtml(team)}</div>
    </div>
    ${POSITION_GROUPS.map(g => {
      const players = team.players
        .filter(p => p.position === g.key)
        .sort((a, b) => a.number - b.number);
      if (!players.length) return '';
      return `<div class="position-group">
        <div class="position-group-header ${g.css}">${posLabelL(g.key)}</div>
        ${players.map(p => renderPlayerFullCard(p, team, lang, rd, t)).join('')}
      </div>`;
    }).join('')}
  </div>`;
}

function renderStadiums(lang: string, rd: string, t: Record<string,string>): string {
  const capLabel = t.capacity;
  const matchesLabel = t.stadiumMatches;
  return `<div class="section-page">
    <div class="section-header"><div class="section-eyebrow">🏟 ${esc(t.stadiumsSection)}</div><div class="section-title">${esc(t.stadiumsSub)}</div></div>
    <div class="stadiums-grid">
      ${STADIUMS.map(s => `<div class="stadium-card">
        <img class="stadium-card-image" src="${toFileUrl(rd, s.image)}" alt="${esc(s.name)}" />
        <div class="stadium-card-body">
          <div class="stadium-card-name">${esc(s.name)}</div>
          <div class="stadium-card-location">${esc(s.city)}, ${esc(s.country)}</div>
          <div class="stadium-card-capacity">${capLabel}: ${s.capacity.toLocaleString()}</div>
          <div class="stadium-card-desc">${esc(s.description)}</div>
          <div class="stadium-card-matches">${matchesLabel}: ${esc(s.matchesSummary)}</div>
          <div class="stadium-card-highlight">${esc(s.highlight)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function renderKits(data: GuideData, lang: string, rd: string, t: Record<string,string>): string {
  const teamsByGroup: Record<string, GuideTeamData[]> = {};
  for (const team of data.teams) {
    if (!teamsByGroup[team.group]) teamsByGroup[team.group] = [];
    teamsByGroup[team.group].push(team);
  }
  const groupLetters = 'ABCDEFGHIJKL'.split('');
  return `<div class="section-page">
    <div class="section-header"><div class="section-eyebrow">🎨 ${esc(t.kitsSection)}</div><div class="section-title">${esc(t.kitsSub)}</div></div>
    ${groupLetters.map(letter => {
      const groupTeams = teamsByGroup[letter] ?? [];
      if (!groupTeams.length) return '';
      return `<div class="kits-group-block">
        <div class="kits-group-header">${esc(t.group)} ${letter}</div>
        <div class="kits-grid">
          ${groupTeams.map(team => {
            const colors = TEAM_COLORS[team.teamId] ?? ['#ccc', '#999'];
            return `<div class="kit-card">
              <img class="kit-crest" src="${toFileUrl(rd, `/assets/crests/${team.teamId.toLowerCase()}.png`)}" alt="${esc(team.shortName || team.name)}" onerror="this.src='${teamFlagUrl(team, rd)}'" />
              <div class="kit-team-name">${esc(team.shortName || team.name)}</div>
              <div class="kit-color-bar">
                <span class="kit-color-swatch" style="background:${colors[0]};"></span>
                <span class="kit-color-swatch" style="background:${colors[1]};"></span>
              </div>
              <div class="kit-label">${esc(t.home)} / ${esc(t.away)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderHistory(lang: string, rd: string, t: Record<string,string>): string {
  return `<div class="section-page">
    <div class="section-header"><div class="section-eyebrow">🏆 ${esc(t.historySection)}</div><div class="section-title">${esc(t.historySub)}</div></div>
    <div class="history-timeline">
      ${WORLD_CUP_HISTORY.map(h => `<div class="history-item">
        <div class="history-year">${h.year}</div>
        <div class="history-flags">
          <img class="history-flag" src="${getHistoryFlagUrl(h.winner, rd)}" alt="${h.winner}" />
          <span class="history-vs">vs</span>
          <img class="history-flag" src="${getHistoryFlagUrl(h.runnerUp, rd)}" alt="${h.runnerUp}" />
          <span class="history-score">${esc(h.score)}</span>
        </div>
        <div class="history-host">${esc(h.host)}</div>
      </div>`).join('')}
    </div>
    <div class="footer-line" style="margin-top:24px;">
      ${lang === 'es' ? '2026 será el año en que la historia se escriba de nuevo' : '2026 will be the year history is rewritten'}
    </div>
  </div>`;
}

function renderPrediction(data: GuideData, lang: string, rd: string, t: Record<string,string>): string {
  const knockoutByRound: Record<string, GuideMatch[]> = {
    roundOf32: [], roundOf16: [], quarterfinals: [], semifinals: [], thirdPlace: [], final: [],
  };
  for (const m of data.knockoutMatches) {
    if (m.round && knockoutByRound[m.round]) knockoutByRound[m.round].push(m);
  }
  const rl = ROUND_LABELS[lang];

  return `<div class="prediction-page">
    <div class="section-header"><div class="section-eyebrow">${esc(t.predictionSection)}</div><div class="section-title">${esc(t.predictionDesc)}</div></div>
    <div class="prediction-podium">
      <div class="podium-item runner-up">
        <div class="podium-label">${esc(t.runnerUp)}</div>
        <div class="podium-name">${esc(t.tbd)}</div>
      </div>
      <div class="podium-item champion">
        <div class="podium-label">🏆 ${esc(t.champion)}</div>
        <div class="podium-name">${esc(t.tbd)}</div>
      </div>
      <div class="podium-item third">
        <div class="podium-label">${esc(t.thirdPlace)}</div>
        <div class="podium-name">${esc(t.tbd)}</div>
      </div>
    </div>
    <div class="bracket-summary">
      ${Object.entries(knockoutByRound).map(([round, matches]) => matches.length ? `<div class="bracket-round">
        <div class="bracket-round-title">${esc(rl[round as keyof typeof rl] || round)}</div>
        ${matches.map(m => `<div class="bracket-match">
          <span class="bracket-team">${esc(t.tbd)}</span>
          <span class="bracket-score">-</span>
          <span class="bracket-team">${esc(t.tbd)}</span>
        </div>`).join('')}
      </div>` : '').join('')}
    </div>
    <div class="footer-line">${esc(t.generatedBy)} · ${new Date().toLocaleDateString()}</div>
  </div>`;
}

// ── Main Export ──
export function renderGuideHtml(data: GuideData, lang: string, rootDir: string): string {
  const t = T[lang] ?? T.es;

  const sections = [
    renderCover(data, lang, rootDir, t),
    renderCalendar(data, lang, rootDir, t),
    ...data.teams.map(team => renderTeamSheet(team, data, lang, rootDir, t)),
    renderStadiums(lang, rootDir, t),
    renderKits(data, lang, rootDir, t),
    renderHistory(lang, rootDir, t),
    renderPrediction(data, lang, rootDir, t),
  ];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Guía Mundial 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Archivo+Black&family=Archivo:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${GUIDE_CSS}</style>
</head>
<body>
<div class="guide-document">
${sections.join('\n')}
</div>
</body>
</html>`;
}

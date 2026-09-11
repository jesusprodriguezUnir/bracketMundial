// Genera el descriptor de cada página estática (ES + EN) de la UEFA Champions League 2026/27:
// ruta, meta tags, JSON-LD estructurado y cuerpo HTML semántico (>300 palabras).

import { SITE_URL, OG_IMAGE, esc, slugify, countryEn } from './seo-i18n.mjs';

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso, lang) {
  if (!iso || !iso.includes('-')) return iso;
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'en'
    ? `${MONTHS_EN[m - 1]} ${d}, ${y}`
    : `${d} ${MONTHS_ES[m - 1]} ${y}`;
}

const L = (href, text) => `<a href="${href}">${esc(text)}</a>`;

const UEFA_ORGANIZER = {
  '@type': 'Organization',
  name: 'UEFA',
  url: 'https://www.uefa.com',
};

function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

// ---- Strings por idioma --------------------------------------------------

const TXT = {
  es: {
    home: 'Inicio',
    groups: 'Tabla de la Liga',
    calendar: 'Calendario',
    stadiums: 'Estadios',
    squads: 'Clubes y Plantillas',
    backHome: '← Volver a la Porra de Champions',
    siteName: 'Bracket Champions',
    disclaimer:
      'Sitio recreativo e independiente. Todas las predicciones y recursos son gratuitos. No guarda relación oficial con la UEFA ni sus clubes participantes.',
  },
  en: {
    home: 'Home',
    groups: 'League Table',
    calendar: 'Schedule',
    stadiums: 'Stadiums',
    squads: 'Clubs & Squads',
    backHome: '← Back to Champions Pool',
    siteName: 'Bracket Champions',
    disclaimer:
      'Recreational and independent website. All predictions and features are free. Not officially affiliated with UEFA or participating clubs.',
  },
};

// Prefijos de ruta por idioma
function paths(lang) {
  const en = lang === 'en';
  return {
    root: en ? '/en/' : '/',
    groupsHub: en ? '/en/groups/' : '/grupos/',
    group: (letter) => (en ? `/en/groups/group-${letter.toLowerCase()}/` : `/grupos/grupo-${letter.toLowerCase()}/`),
    calendar: en ? '/en/schedule/' : '/calendario/',
    matchday: (d) => (en ? `/en/matchday-${d}/` : `/jornada-${d}/`),
    stadiums: en ? '/en/stadiums/' : '/estadios/',
    squads: en ? '/en/squads/' : '/plantillas/',
    team: (t) => (en ? `/en/team/${t.slugEn}/` : `/seleccion/${t.slugEs}/`),
    pool: en ? '/en/champions-league-pool/' : '/porra-champions-league/',
    printable: en ? '/en/printable-bracket/' : '/plantilla-imprimir/',
    simulator: en ? '/en/knockout-simulator/' : '/simulador-eliminatorias/',
  };
}

function teamName(t, lang) {
  return t ? (lang === 'en' ? t.nameEn : t.nameEs) : '';
}

// ---- 1. HUB DE LA FASE LIGA (TABLA DE 36 CLUBES) -------------------------

function buildGroupsHub(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'UEFA Champions League 2026/27 League Phase — 36 Clubs & Standings'
    : 'Fase Liga Champions League 2026/27 — Los 36 Clubes y Clasificación';
  const description = en
    ? 'Single 36-club league table for the UEFA Champions League 2026/27. Standings rules, qualifying cutoffs: top 8 to Round of 16, 9-24 to playoffs, 25-36 eliminated.'
    : 'Tabla única de 36 clubes de la fase liga de la Champions League 2026/27. Reglas de clasificación, cortes 1-8 a octavos, 9-24 a playoff y 25-36 eliminados.';

  const clubList = data.teams
    .map((tm) => `<li>${L(P.team(tm), teamName(tm, lang))} (${esc(tm.city)}, ${esc(en ? countryEn(tm.country) : tm.country)}) — <em>${tm.uclTitles} ${en ? 'UCL title(s)' : 'título(s)'}</em></li>`)
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'League Table' : 'Fase Liga'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The <strong>UEFA Champions League 2026/27</strong> format features <strong>36 top European clubs in a single league table</strong>. Each club plays 8 matches (4 at home, 4 away) against 8 different opponents across 8 matchdays from September 2026 to January 2027.'
    : 'La <strong>UEFA Champions League 2026/27</strong> reúne a <strong>36 clubes europeos en una única tabla de clasificación</strong>. Cada equipo disputa 8 partidos (4 en casa y 4 fuera) frente a 8 rivales distintos a lo largo de 8 jornadas entre septiembre de 2026 y enero de 2027.'}</p>

<h2>${en ? 'Qualifying bands & cutoffs' : 'Cortes de clasificación'}</h2>
<ul>
  <li><strong>${en ? 'Positions 1 to 8:' : 'Puestos 1 al 8:'}</strong> ${en ? 'Direct qualification to the Round of 16 as seeded teams.' : 'Clasificación directa a los octavos de final como cabezas de serie.'}</li>
  <li><strong>${en ? 'Positions 9 to 24:' : 'Puestos 9 al 24:'}</strong> ${en ? 'Playoff round (knockout phase play-offs, two legs). Seeds 9–16 face unseeded 17–24.' : 'Ronda de playoff (dieciseisavos a doble partido). Puestos 9-16 son cabezas de serie ante los puestos 17-24.'}</li>
  <li><strong>${en ? 'Positions 25 to 36:' : 'Puestos 25 al 36:'}</strong> ${en ? 'Eliminated from European competition (no drop to Europa League).' : 'Eliminados definitivamente de competiciones europeas (sin paso a la Europa League).'}</li>
</ul>

<h2>${en ? 'Tie-breaking criteria' : 'Criterios de desempate'}</h2>
<p>${en
    ? 'Ties in points are resolved strictly by: 1) Goal difference across all matches, 2) Goals scored, 3) Away goals scored, 4) Total wins, 5) Away wins, 6) UEFA club coefficient.'
    : 'Los empates a puntos se resuelven por: 1) Diferencia de goles general, 2) Goles a favor, 3) Goles fuera de casa, 4) Número de victorias, 5) Victorias fuera de casa, 6) Coeficiente UEFA de clubes.'}</p>

<h2>${en ? 'The 36 participating clubs' : 'Los 36 clubes participantes'}</h2>
<ul>
${clubList}
</ul>

<p>${L(P.calendar, en ? 'Match schedule & fixtures' : 'Calendario y jornadas')} · ${L(P.stadiums, en ? 'Host stadiums' : 'Estadios y aforos')} · ${L(P.squads, en ? 'Squads' : 'Plantillas oficiales')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.groupsHub,
    lang,
    title,
    description,
    keywords: en
      ? 'champions league standings 2026 2027, ucl single table, 36 clubs champions league, ucl league phase table'
      : 'clasificacion champions league 2026 2027, tabla fase liga champions, 36 clubes champions league, tabla ucl',
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: data.teams.map((tm, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: teamName(tm, lang),
          url: `${SITE_URL}${P.team(tm)}`,
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'League Table' : 'Fase Liga', path: P.groupsHub },
      ]),
    ],
    body,
  };
}

// Alias para mantener limpia la ruta /grupos/grupo-lp/ y /en/groups/group-lp/
function buildGroupPage(data, lang, letter) {
  const page = buildGroupsHub(data, lang);
  page.path = paths(lang).group(letter);
  return page;
}

// ---- 2. CALENDARIO COMPLETO (144 PARTIDOS + FASES FINALES) ---------------

function buildCalendar(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'UEFA Champions League 2026/27 Schedule — 8 Matchdays & 144 Fixtures'
    : 'Calendario Champions League 2026/27 — 8 Jornadas y 144 Partidos';
  const description = en
    ? 'Full UEFA Champions League 2026/27 schedule: 8 league-phase matchdays from Sep 8 to Jan 27, playoffs in Feb, and knockout rounds to the Madrid final on June 5, 2027.'
    : 'Calendario completo de la Champions League 2026/27: 8 jornadas de la fase liga del 8 de septiembre al 27 de enero, playoffs en febrero y eliminatorias hasta la final en Madrid el 5 de junio de 2027.';

  const matchdaysList = data.matchDays
    .map((d) => `<li><strong>${L(P.matchday(d.matchDay), en ? d.labelEn : d.label)}:</strong> ${esc(en ? d.datesEn : d.dates)} — 18 ${en ? 'matches' : 'partidos'}</li>`)
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Schedule' : 'Calendario'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The <strong>UEFA Champions League 2026/27</strong> schedule features <strong>144 league-phase matches</strong> played across 8 matchdays. The league phase begins on September 8, 2026 and concludes with a simultaneous final matchday on January 27, 2027. The knockout phase runs from February to June 2027, culminating at the Estadio Metropolitano in Madrid.'
    : 'El calendario de la <strong>UEFA Champions League 2026/27</strong> comprende <strong>144 partidos de fase liga</strong> distribuidos en 8 jornadas. Arranca el 8 de septiembre de 2026 y concluye con una jornada 8 en horario unificado el 27 de enero de 2027. Las eliminatorias se juegan de febrero a junio de 2027, finalizando en el Estadio Metropolitano de Madrid.'}</p>

<h2>${en ? 'League-phase matchdays' : 'Jornadas de la fase liga'}</h2>
<ul>
${matchdaysList}
</ul>

<h2>${en ? 'Knockout rounds key dates' : 'Fechas clave de las eliminatorias'}</h2>
<ul>
  <li><strong>${en ? 'Playoffs (two legs):' : 'Playoffs eliminatorios (ida y vuelta):'}</strong> 16/17 & 23/24 ${en ? 'Feb 2027' : 'feb 2027'}</li>
  <li><strong>${en ? 'Round of 16:' : 'Octavos de final:'}</strong> 9/10 & 16/17 ${en ? 'Mar 2027' : 'mar 2027'}</li>
  <li><strong>${en ? 'Quarterfinals:' : 'Cuartos de final:'}</strong> 6/7 & 13/14 ${en ? 'Apr 2027' : 'abr 2027'}</li>
  <li><strong>${en ? 'Semifinals:' : 'Semifinales:'}</strong> 27/28 ${en ? 'Apr' : 'abr'} & 4/5 ${en ? 'May 2027' : 'may 2027'}</li>
  <li><strong>${en ? 'Grand Final:' : 'Gran Final:'}</strong> 5 ${en ? 'June 2027' : 'junio 2027'} — Estadio Metropolitano, Madrid (${en ? 'Single match' : 'partido único'})</li>
</ul>

<p>${L(P.groupsHub, en ? 'League standings' : 'Tabla de clasificación')} · ${L(P.stadiums, en ? 'Stadiums' : 'Estadios')} · ${L(P.pool, en ? 'Join the pool' : 'Crear porra')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.calendar,
    lang,
    title,
    description,
    keywords: en
      ? 'champions league schedule 2026 2027, ucl fixtures, ucl match dates, champions league dates 26 27'
      : 'calendario champions league 2026 2027, partidos champions league, fechas champions 26 27, ucl fixture',
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: data.matchDays.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: en ? d.labelEn : d.label,
          url: `${SITE_URL}${P.matchday(d.matchDay)}`,
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Schedule' : 'Calendario', path: P.calendar },
      ]),
    ],
    body,
  };
}

// ---- 3. PÁGINAS DE JORNADA ESPECÍFICA (JORNADA 1 A 8) ---------------------

function buildMatchdayPage(data, lang, matchDay) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const mdInfo = data.matchDays.find((d) => d.matchDay === matchDay) ?? {
    label: `Jornada ${matchDay}`,
    labelEn: `Matchday ${matchDay}`,
    dates: '',
    datesEn: '',
  };

  const matches = data.matchesByMatchDay[matchDay] ?? [];
  const title = en
    ? `${mdInfo.labelEn} UEFA Champions League 2026/27 — Fixtures, Kick-Off Times & Pool`
    : `${mdInfo.label} Champions League 2026/27 — Partidos, Horarios y Porra`;
  const description = en
    ? `All 18 matches of Champions League ${mdInfo.labelEn} (${mdInfo.datesEn}): fixtures, times, stadiums and predictions. Fill in your private pool with friends.`
    : `Los 18 partidos de la ${mdInfo.label} de Champions League (${mdInfo.dates}): horarios, estadios, pronósticos y predicciones. Haz tu porra gratis con amigos.`;

  const matchRows = matches
    .map((m) => {
      const home = teamName(m.teamA, lang);
      const away = teamName(m.teamB, lang);
      return `<li><strong>${esc(home)} vs ${esc(away)}</strong> — ${fmtDate(m.date, lang)} (${esc(m.timeSpain)} CET) · ${esc(m.venue)}, ${esc(m.city)}</li>`;
    })
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${L(P.calendar, en ? 'Schedule' : 'Calendario')} › ${en ? mdInfo.labelEn : mdInfo.label}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? `Complete fixtures for <strong>${esc(mdInfo.labelEn)}</strong> of the UEFA Champions League 2026/27, taking place on <strong>${esc(mdInfo.datesEn)}</strong>. A total of 18 high-intensity matches featuring Europe's elite clubs.`
    : `Calendario completo de la <strong>${esc(mdInfo.label)}</strong> de la UEFA Champions League 2026/27, disputada del <strong>${esc(mdInfo.dates)}</strong>. 18 encuentros de máxima rivalidad entre los mejores clubes de Europa.`}</p>

<h2>${en ? 'Fixtures & kick-off times' : 'Partidos y horarios confirmados'}</h2>
<ul>
${matchRows}
</ul>

<h2>${en ? 'How to predict this matchday' : 'Cómo pronosticar esta jornada en la porra'}</h2>
<p>${en
    ? 'Enter your predicted scorelines for each of the 18 matches in the online simulator. Exact scoreline awards 5 points, correct goal difference awards 3 points, and predicting the correct match winner/draw gives 2 points. Create a private league with friends to see who tops the leaderboard.'
    : 'Introduce tus marcadores pronosticados para cada uno de los 18 partidos en el simulador. Acertar el resultado exacto otorga 5 puntos, la diferencia de goles 3 puntos y el signo 1X2 otorga 2 puntos. Crea una liga privada con amigos y compite jornada a jornada.'}</p>

<p>${L(P.calendar, en ? 'All matchdays' : 'Ver todas las jornadas')} · ${L(P.groupsHub, en ? 'League table' : 'Tabla de clasificación')} · ${L(P.root, en ? 'Open simulator' : 'Abrir el simulador')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.matchday(matchDay),
    lang,
    title,
    description,
    keywords: en
      ? `champions league matchday ${matchDay}, ucl matchday ${matchDay} fixtures, ucl schedule, predict matchday ${matchDay}`
      : `jornada ${matchDay} champions league, partidos jornada ${matchDay} champions, horarios champions jornada ${matchDay}, porra jornada ${matchDay}`,
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: matches.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SportsEvent',
            name: `${teamName(m.teamA, lang)} vs ${teamName(m.teamB, lang)}`,
            startDate: `${m.date}T${m.timeSpain}:00+02:00`,
            endDate: `${m.date}T23:00:00+02:00`,
            eventStatus: 'https://schema.org/EventScheduled',
            sport: 'Football',
            organizer: UEFA_ORGANIZER,
            location: { '@type': 'Place', name: m.venue, address: m.city },
            performer: [
              { '@type': 'SportsTeam', name: teamName(m.teamA, lang) },
              { '@type': 'SportsTeam', name: teamName(m.teamB, lang) },
            ],
            image: OG_IMAGE,
          },
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Schedule' : 'Calendario', path: P.calendar },
        { name: en ? mdInfo.labelEn : mdInfo.label, path: P.matchday(matchDay) },
      ]),
    ],
    body,
  };
}

// ---- 4. ESTADIOS Y SEDES EUROPEAS ---------------------------------------

function buildStadiums(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'UEFA Champions League 2026/27 Stadiums — All 36 Club Venues & Madrid Final'
    : 'Estadios Champions League 2026/27 — Las 36 Sedes y la Gran Final en Madrid';
  const description = en
    ? 'Explore all official stadiums of the UEFA Champions League 2026/27: Signal Iduna Park, Allianz Arena, Santiago Bernabéu, Anfield, Camp Nou and Estadio Metropolitano (Final).'
    : 'Todos los estadios de la Champions League 2026/27: Santiago Bernabéu, Camp Nou, Signal Iduna Park, Allianz Arena, Anfield y el Estadio Metropolitano (sede de la final).';

  const rows = data.stadiums
    .map(
      (s) =>
        `<li><strong>${esc(s.name)}</strong> — ${esc(s.city)}, ${esc(en ? countryEn(s.country) : s.country)} · <em>${s.capacity.toLocaleString(en ? 'en-US' : 'es-ES')} ${en ? 'capacity' : 'espectadores'}</em> (${esc(s.clubName)}). ${esc(s.highlight)}</li>`,
    )
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Stadiums' : 'Estadios'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The <strong>UEFA Champions League 2026/27</strong> brings together the most iconic football temples across Europe. From the Signal Iduna Park in Dortmund to the Santiago Bernabéu in Madrid, each venue hosts 4 historic league-phase clashes. The single-match final will take place on June 5, 2027 at the Estadio Metropolitano in Madrid.'
    : 'La <strong>UEFA Champions League 2026/27</strong> reúne a los templos más emblemáticos del fútbol europeo. Desde el Signal Iduna Park en Dortmund hasta el Santiago Bernabéu en Madrid, cada estadio alberga 4 noches mágicas de fase liga. La gran final a partido único se celebrará el 5 de junio de 2027 en el Estadio Metropolitano de Madrid.'}</p>
<ul>
${rows}
</ul>
<p>${L(P.groupsHub, en ? 'League standings' : 'Tabla de clasificación')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')} · ${L(P.squads, en ? 'Squads' : 'Plantillas')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.stadiums,
    lang,
    title,
    description,
    keywords: en
      ? 'champions league stadiums 2026 2027, ucl venues, santiago bernabeu, anfield ucl, estadio metropolitano final 2027'
      : 'estadios champions league 2026 2027, sedes champions league, bernabeu champions, final metropolitano 2027',
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: data.stadiums.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Place',
            name: s.name,
            address: {
              '@type': 'PostalAddress',
              addressLocality: s.city,
              addressCountry: en ? countryEn(s.country) : s.country,
            },
          },
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Stadiums' : 'Estadios', path: P.stadiums },
      ]),
    ],
    body,
  };
}

// ---- 5. HUB DE PLANTILLAS Y CLUBES ---------------------------------------

function buildSquadsHub(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'UEFA Champions League 2026/27 Squads — All 36 Clubs & Official Players'
    : 'Plantillas Champions League 2026/27 — Los 36 Clubes y Jugadores Oficiales';
  const description = en
    ? 'Official squads, starting lineups and player rosters for all 36 clubs competing in the UEFA Champions League 2026/27.'
    : 'Plantillas oficiales, alineaciones y jugadores de los 36 clubes participantes en la Champions League 2026/27.';

  const byClub = data.teams
    .map((tm) => {
      const squad = data.getSquad(tm.id);
      const count = Array.isArray(squad) ? squad.length : 0;
      return `<li><strong>${L(P.team(tm), teamName(tm, lang))}</strong> (${esc(tm.city)}, ${esc(en ? countryEn(tm.country) : tm.country)}) — ${count} ${en ? 'players listed' : 'jugadores en plantilla'}</li>`;
    })
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Squads' : 'Plantillas'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'Explore the official rosters, player profiles and starting line-ups of all <strong>36 clubs</strong> qualified for the UEFA Champions League 2026/27. Select any club to view their 8 confirmed league-phase fixtures and complete squad details.'
    : 'Consulta las plantillas oficiales, perfiles de jugadores y onces probables de los <strong>36 clubes</strong> clasificados a la UEFA Champions League 2026/27. Haz clic en cualquier club para ver sus 8 partidos confirmados de fase liga y plantilla completa.'}</p>
<ul>
${byClub}
</ul>
<p>${L(P.groupsHub, en ? 'League standings' : 'Tabla de la liga')} · ${L(P.calendar, en ? 'Match schedule' : 'Calendario')} · ${L(P.stadiums, en ? 'Stadiums' : 'Estadios')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.squads,
    lang,
    title,
    description,
    keywords: en
      ? 'champions league squads 2026 2027, ucl lineups, champions league players, official ucl rosters'
      : 'plantillas champions league 2026 2027, convocatorias champions league, jugadores champions league, alineaciones ucl',
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: data.teams.map((tm, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: teamName(tm, lang),
          url: `${SITE_URL}${P.team(tm)}`,
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Squads' : 'Plantillas', path: P.squads },
      ]),
    ],
    body,
  };
}

// ---- 6. PÁGINA INDIVIDUAL DE CADA CLUB (36 CLUBES) -----------------------

function buildTeamPage(data, lang, team) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const name = teamName(team, lang);

  // Partidos exactos de este club (4 en casa, 4 fuera)
  const matches = data.matchesByTeam[team.id] ?? [];
  const opponents = matches.map((m) => {
    const opp = m.teamA.id === team.id ? m.teamB : m.teamA;
    return teamName(opp, lang);
  });

  const title = en
    ? `${name} in UEFA Champions League 2026/27 — Fixtures, Opponents & Squad`
    : `${name} en Champions League 2026/27 — Calendario, Rivales y Plantilla`;
  const description = en
    ? `${name} competes in the UEFA Champions League 2026/27 against ${opponents.slice(0, 5).join(', ')} and more. 8 matchday schedule, ${team.stadium.name} and official squad.`
    : `${name} disputa la Champions League 2026/27 ante ${opponents.slice(0, 5).join(', ')} y más. Calendario de 8 jornadas, estadio ${team.stadium.name} y plantilla oficial.`;

  const matchRows = matches
    .map((m) => {
      const isHome = m.teamA.id === team.id;
      const opponent = isHome ? m.teamB : m.teamA;
      const venueLabel = isHome
        ? (en ? 'Home' : 'Casa')
        : (en ? 'Away' : 'Fuera');
      return `<li><strong>${esc(mdLabel(m.matchDay, en))}:</strong> ${esc(teamName(m.teamA, lang))} vs ${esc(teamName(m.teamB, lang))} (${venueLabel}) — ${fmtDate(m.date, lang)} (${esc(m.timeSpain)} CET) · ${esc(m.venue)}, ${esc(m.city)}</li>`;
    })
    .join('\n');

  let squadHtml = '';
  const squad = data.getSquad(team.id);
  if (Array.isArray(squad) && squad.length) {
    const players = squad
      .map((pl) => `<li>${pl.number ? `#${pl.number} ` : ''}${esc(pl.name)}${pl.position ? ` — ${esc(pl.position)}` : ''}</li>`)
      .join('\n');
    squadHtml = `<h2>${en ? 'Official Squad' : 'Plantilla Oficial'}</h2>\n<ul style="column-count: 2; column-gap: 2rem;">\n${players}\n</ul>`;
  }

  const historyText = en ? (team.uclHistory?.en || '') : (team.uclHistory?.es || '');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${L(P.squads, en ? 'Clubs' : 'Clubes')} › ${esc(name)}</nav>
<h1>${esc(name)} — UEFA Champions League 2026/27</h1>
<p>${en
    ? `<strong>${esc(name)}</strong> competes in the <strong>UEFA Champions League 2026/27 league phase</strong>. With its home fortress at <strong>${esc(team.stadium.name)}</strong> (${team.stadium.capacity.toLocaleString('en-US')} capacity), the club plays 8 crucial matches to earn a spot in the Round of 16.`
    : `El <strong>${esc(name)}</strong> disputa la <strong>fase liga de la UEFA Champions League 2026/27</strong>. Con su sede en el <strong>${esc(team.stadium.name)}</strong> (${team.stadium.capacity.toLocaleString('es-ES')} espectadores), el club afronta 8 partidos determinantes para clasificar a los octavos de final.`}</p>

<h2>${en ? 'European pedigree & history' : 'Palmarés e historia en Champions League'}</h2>
<p><strong>${en ? 'European Cups won:' : 'Títulos de Champions:'}</strong> ${team.uclTitles > 0 ? `${team.uclTitles} (${esc(team.uclBest)})` : (en ? 'Seeking first European title' : 'Buscando su primera Copa de Europa')}.</p>
<p>${esc(historyText)}</p>

<h2>${en ? 'Confirmed League-Phase Fixtures (8 matches)' : 'Los 8 partidos de la Fase Liga'}</h2>
<ul>
${matchRows}
</ul>

${squadHtml}

<h2>${en ? 'Predict every match' : 'Pronostica todos sus partidos'}</h2>
<p>${en
    ? `Join the free Champions League prediction game! Enter your forecast for ${esc(name)}'s upcoming fixtures, compete in private leagues with friends, and follow live standings updates.`
    : `¡Únete a la porra gratuita de la Champions League! Pronostica los resultados de ${esc(name)}, crea ligas privadas con tus amigos y sigue la tabla de clasificación en directo.`}</p>

<p>${L(P.groupsHub, en ? 'League table' : 'Tabla general')} · ${L(P.calendar, en ? 'Full schedule' : 'Calendario completo')} · ${L(P.stadiums, en ? 'All stadiums' : 'Todos los estadios')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.team(team),
    lang,
    title,
    description,
    keywords: en
      ? `${name.toLowerCase()} champions league, ${name.toLowerCase()} fixtures 2026 2027, ${name.toLowerCase()} ucl schedule, ${name.toLowerCase()} squad`
      : `${name.toLowerCase()} champions league, partidos ${name.toLowerCase()} champions 2026, rivales ${name.toLowerCase()} champions, plantilla ${name.toLowerCase()}`,
    jsonLd: [
      {
        '@type': 'SportsTeam',
        name,
        sport: 'Football',
        memberOf: {
          '@type': 'SportsOrganization',
          name: 'UEFA Champions League 2026/27',
          url: 'https://www.uefa.com/uefachampionsleague/',
        },
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Squads' : 'Plantillas', path: P.squads },
        { name, path: P.team(team) },
      ]),
    ],
    body,
  };
}

function mdLabel(d, en) {
  return en ? `Matchday ${d}` : `Jornada ${d}`;
}

// ---- 7. PÁGINAS TRANSACCIONALES (PORRA, IMPRIMIR, SIMULADOR) -------------

function buildPoolPage(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'Champions League 2026/27 Pool — Create Private League with Friends | Free'
    : 'Porra Champions League 2026/27 — Crea tu Liga Privada con Amigos | Gratis';
  const description = en
    ? 'Create a Champions League 2026/27 pool with friends or coworkers. Predict all 144 league phase matches and knockout rounds. Free, no download, private leagues.'
    : 'Crea tu porra de la Champions League 2026/27 con amigos o compañeros de trabajo. Pronostica las 8 jornadas y eliminatorias. Gratis, sin descargas, ligas privadas.';

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Champions Pool' : 'Porra Champions League'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The ultimate <strong>Champions League 2026/27 pool game</strong>. Predict every matchday with friends, coworkers or family — 100% free, no app store download required, directly in your browser.'
    : 'La mejor <strong>porra de la Champions League 2026/27</strong> para jugar con amigos, familia o compañeros de oficina — 100% gratis, sin descargas obligatorias, directamente desde el navegador.'}</p>

<h2>${en ? 'How the scoring system works' : 'Sistema de puntuación'}</h2>
<ul>
  <li><strong>${en ? 'Exact scoreline (5 points):' : 'Marcador exacto (5 puntos):'}</strong> ${en ? 'Predicting the exact scoreline (e.g. 2-1).' : 'Acertar el resultado exacto (ej. 2-1).'}</li>
  <li><strong>${en ? 'Goal difference (3 points):' : 'Diferencia de goles (3 puntos):'}</strong> ${en ? 'Predicting winner and correct goal margin (e.g. 3-1 instead of 2-0).' : 'Acertar ganador y la misma diferencia de goles (ej. 3-1 en lugar de 2-0).'}</li>
  <li><strong>${en ? 'Correct 1X2 result (2 points):' : 'Signo 1X2 (2 puntos):'}</strong> ${en ? 'Predicting home win, draw or away win.' : 'Acertar quién gana o empata el encuentro.'}</li>
</ul>

<h2>${en ? 'How to start in 3 steps' : 'Cómo empezar en 3 pasos'}</h2>
<ol>
  <li>${en ? `<strong>Create your private league:</strong> open the ${L(P.root, 'simulator')}, sign up in 10 seconds, and create your league.` : `<strong>Crea tu liga privada:</strong> abre el ${L(P.root, 'simulador')}, inicia sesión en 10 segundos y crea tu liga.`}</li>
  <li>${en ? '<strong>Invite friends:</strong> share your private link or invite code via WhatsApp, Telegram or Slack.' : '<strong>Invita a tus amigos:</strong> comparte el enlace privado o tu código por WhatsApp o redes.'}</li>
  <li>${en ? '<strong>Fill in the matchday:</strong> enter your 18 score predictions before the opening match kicks off.' : '<strong>Rellena la jornada:</strong> introduce tus 18 marcadores antes de que ruede el balón.'}</li>
</ol>

<p>${L(P.calendar, en ? 'View full schedule' : 'Ver calendario completo')} · ${L(P.groupsHub, en ? 'League table' : 'Tabla de clasificación')} · ${L(P.root, en ? 'Play now' : 'Jugar ahora')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.pool,
    lang,
    title,
    description,
    keywords: en
      ? 'champions league pool, ucl prediction game, private champions league league, predict champions league with friends'
      : 'porra champions league, porra champions con amigos, juego predicciones champions, liga privada champions league',
    jsonLd: [
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Champions Pool' : 'Porra Champions League', path: P.pool },
      ]),
    ],
    body,
  };
}

function buildPrintablePage(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'Champions League 2026/27 Printable Schedule & Table — Free PDF Download'
    : 'Plantilla Champions League 2026/27 para Imprimir — Calendario y Tabla en PDF | Gratis';
  const description = en
    ? 'Download and print the UEFA Champions League 2026/27 schedule and 36-club table template. Perfect for tracking results on paper. Free PDF.'
    : 'Descarga e imprime el calendario y la tabla de 36 clubes de la Champions League 2026/27. Ideal para seguir los resultados en papel. Gratis en PDF.';

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Printable Template' : 'Plantilla para imprimir'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'Download our <strong>printable UEFA Champions League 2026/27 template</strong>. Print the 8 matchdays and 36-club standings tracker to follow every clash on paper.'
    : 'Consigue tu <strong>plantilla de la UEFA Champions League 2026/27 para imprimir</strong>. Imprime las 8 jornadas de la fase liga y la tabla de clasificación para seguir el torneo en papel.'}</p>
<ul>
  <li>${en ? 'Full 8-matchday schedule with 144 fixtures' : 'Calendario completo de las 8 jornadas con los 144 partidos'}</li>
  <li>${en ? '36-club standings table with qualification cutoffs' : 'Tabla de 36 clubes con las franjas de clasificación'}</li>
  <li>${en ? 'Space to write your matchday predictions' : 'Espacio para anotar pronósticos y resultados reales'}</li>
</ul>
<p>${L(P.root, en ? 'Open online simulator' : 'Abrir simulador online')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')} · ${L(P.pool, en ? 'Champions Pool' : 'Porra Champions')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.printable,
    lang,
    title,
    description,
    keywords: en
      ? 'printable champions league schedule, ucl 2026 2027 pdf, champions league bracket printable'
      : 'calendario champions league para imprimir, plantilla champions league pdf, tabla champions 2026 para imprimir',
    jsonLd: [
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Printable Template' : 'Plantilla para imprimir', path: P.printable },
      ]),
    ],
    body,
  };
}

function buildSimulatorPage(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'Champions League 2026/27 Simulator — League Table, Playoffs & Final | Free'
    : 'Simulador Champions League 2026/27 — Tabla, Playoffs y Final | Gratis';
  const description = en
    ? 'Interactive simulator for the UEFA Champions League 2026/27: simulate the 36-club league phase, compute standings, and predict the playoffs all the way to Madrid.'
    : 'Simulador interactivo de la Champions League 2026/27: calcula la tabla de 36 clubes, proyecta los cortes a playoffs y predice el camino hasta la final en Madrid.';

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Simulator' : 'Simulador'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'Simulate every result of the <strong>UEFA Champions League 2026/27</strong> with our real-time interactive engine. Test match scenarios, view automated UEFA tiebreakers, and see which 8 clubs earn direct Round of 16 tickets.'
    : 'Simula cada resultado de la <strong>UEFA Champions League 2026/27</strong> con nuestro motor interactivo en tiempo real. Prueba marcadores, calcula los desempates UEFA automáticos y descubre qué 8 clubes pasan directo a octavos.'}</p>
<p>${L(P.root, en ? 'Launch simulator now' : 'Iniciar simulador ahora')} · ${L(P.groupsHub, en ? 'League table' : 'Tabla de clasificación')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.simulator,
    lang,
    title,
    description,
    keywords: en
      ? 'champions league simulator, ucl league phase simulator, ucl bracket predictor 2026 2027'
      : 'simulador champions league, simulador fase liga champions, predictor cruces champions league',
    jsonLd: [
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Simulator' : 'Simulador', path: P.simulator },
      ]),
    ],
    body,
  };
}

// ---- 8. HOME EN (INDEX EN) -----------------------------------------------

function buildHomeEn(data) {
  const lang = 'en';
  const t = TXT[lang];
  const P = paths(lang);
  const title = 'Bracket Champions | UEFA Champions League 2026/27 Pool & Bracket';
  const description =
    'Predict every UEFA Champions League 26/27 matchday: 36 clubs, single table, 8 matchdays. Create a private pool with friends and track live standings. Free.';

  const topClubs = data.teams
    .slice(0, 12)
    .map((tm) => `<li>${L(P.team(tm), tm.nameEn)} (${tm.stadium.name})</li>`)
    .join('\n');

  const body = `
<h1>Bracket Champions — UEFA Champions League 2026/27 Pool</h1>
<p>Predict every matchday of the UEFA Champions League 2026/27: <strong>36 clubs in a single table, 8 matchdays and 144 fixtures</strong>. Create a private league with friends, submit your scorelines, and follow live standings updates.</p>

<h2>How does the pool work?</h2>
<p>No downloads required. Play straight from your browser:</p>
<ul>
  <li><strong>Step 1: Create a private league.</strong> Invite friends with a short link or code.</li>
  <li><strong>Step 2: Predict the matchday.</strong> Submit scores for all 18 fixtures. Points: 5 for exact scoreline, 3 for goal difference, 2 for match outcome (1X2).</li>
  <li><strong>Step 3: Compete & rank.</strong> Standings update with official results. Positions 1–8 advance straight to Round of 16, 9–24 enter the playoffs, and 25–36 are knocked out.</li>
</ul>

<h2>Featured Clubs</h2>
<ul>
${topClubs}
</ul>

<h2>Resources & Tools</h2>
<p>${L(P.calendar, 'Schedule & Matchdays')} · ${L(P.groupsHub, '36-Club League Table')} · ${L(P.stadiums, 'Stadiums & Venues')} · ${L(P.squads, 'Club Squads & Players')}</p>

<h2>Frequently Asked Questions</h2>
<details><summary><strong>How many clubs play in the new Champions League format?</strong></summary><p>36 clubs compete in a single league phase. Each club plays 8 matches against 8 different opponents (4 at home, 4 away).</p></details>
<details><summary><strong>When does the 2026/27 Champions League start?</strong></summary><p>Matchday 1 kicks off on September 8–10, 2026. The final is played on June 5, 2027 at the Estadio Metropolitano in Madrid.</p></details>
<details><summary><strong>How do qualifications work?</strong></summary><p>Teams finishing 1–8 qualify directly for the Round of 16. Teams 9–24 play a two-legged knockout playoff. Teams 25–36 are eliminated.</p></details>
<details><summary><strong>Is the prediction pool free?</strong></summary><p>Yes, 100% free with no downloads required. You can predict every match and create as many private leagues with friends as you want.</p></details>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.root,
    lang,
    title,
    description,
    keywords:
      'champions league pool, ucl 2026 2027 bracket, ucl prediction game, ucl league phase simulator, champions league table 36 teams',
    jsonLd: [
      {
        '@type': 'SportsEvent',
        name: 'UEFA Champions League 2026/27',
        description: 'UEFA Champions League 2026/27 league phase featuring 36 clubs from September 8, 2026 to June 5, 2027.',
        image: OG_IMAGE,
        startDate: '2026-09-08',
        endDate: '2027-06-05',
        eventStatus: 'https://schema.org/EventScheduled',
        sport: 'Football',
        performer: {
          '@type': 'SportsTeam',
          name: '36 participating clubs',
        },
        organizer: UEFA_ORGANIZER,
        location: [
          { '@type': 'Place', name: 'Estadio Metropolitano', address: { '@type': 'PostalAddress', addressLocality: 'Madrid', addressCountry: 'ES' } },
        ],
        url: `${SITE_URL}/en/`,
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/en/`,
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          validFrom: '2024-01-01T00:00:00Z',
        },
      },
      {
        '@type': 'WebApplication',
        name: 'Bracket Champions',
        url: `${SITE_URL}/en/`,
        image: OG_IMAGE,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Any',
        inLanguage: 'en',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', validFrom: '2024-01-01T00:00:00Z' },
      },
      breadcrumb([{ name: 'Home', path: '/en/' }]),
    ],
    body,
  };
}

// ---- ORQUESTADOR PRINCIPAL -----------------------------------------------

export function buildAllPages(data) {
  const pages = [];

  // 1. Hub de la Fase Liga (Tabla de 36 clubes)
  pages.push(pair(buildGroupsHub(data, 'es'), buildGroupsHub(data, 'en')));

  // 2. Ruta grupo-lp para mantener URLs existentes
  pages.push(pair(buildGroupPage(data, 'es', 'LP'), buildGroupPage(data, 'en', 'LP')));

  // 3. Calendario general
  pages.push(pair(buildCalendar(data, 'es'), buildCalendar(data, 'en')));

  // 4. Páginas individuales de Jornada (1 a 8) - alto volumen SEO
  for (let d = 1; d <= 8; d++) {
    pages.push(pair(buildMatchdayPage(data, 'es', d), buildMatchdayPage(data, 'en', d)));
  }

  // 5. Estadios
  pages.push(pair(buildStadiums(data, 'es'), buildStadiums(data, 'en')));

  // 6. Hub de Plantillas
  pages.push(pair(buildSquadsHub(data, 'es'), buildSquadsHub(data, 'en')));

  // 7. Páginas individuales de los 36 Clubes
  for (const tm of data.teams) {
    pages.push(pair(buildTeamPage(data, 'es', tm), buildTeamPage(data, 'en', tm)));
  }

  // 8. Landings de valor (porra, plantilla para imprimir, simulador)
  pages.push(pair(buildPoolPage(data, 'es'), buildPoolPage(data, 'en')));
  pages.push(pair(buildPrintablePage(data, 'es'), buildPrintablePage(data, 'en')));
  pages.push(pair(buildSimulatorPage(data, 'es'), buildSimulatorPage(data, 'en')));

  // Home: ES es index.html; EN es /en/
  const homeEn = buildHomeEn(data);
  homeEn.canonical = `${SITE_URL}/en/`;
  homeEn.altEs = `${SITE_URL}/`;
  homeEn.altEn = `${SITE_URL}/en/`;

  const flat = pages.flat();
  flat.push(homeEn);
  return flat;
}

function pair(es, en) {
  es.canonical = `${SITE_URL}${es.path}`;
  es.altEs = `${SITE_URL}${es.path}`;
  es.altEn = `${SITE_URL}${en.path}`;
  en.canonical = `${SITE_URL}${en.path}`;
  en.altEs = `${SITE_URL}${es.path}`;
  en.altEn = `${SITE_URL}${en.path}`;
  return [es, en];
}

export { slugify };

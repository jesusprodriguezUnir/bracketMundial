// Genera el descriptor de cada página estática (ES + EN) a partir de los
// datos del torneo: ruta, meta, JSON-LD y cuerpo HTML único (>300 palabras).

import { SITE_URL, esc, slugify } from './seo-i18n.mjs';
import { countryEn } from './seo-i18n.mjs';

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'en'
    ? `${MONTHS_EN[m - 1]} ${d}, ${y}`
    : `${d} ${MONTHS_ES[m - 1]} ${y}`;
}

const L = (href, text) => `<a href="${href}">${esc(text)}</a>`;

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
    groups: 'Grupos',
    calendar: 'Calendario',
    stadiums: 'Estadios',
    squads: 'Plantillas',
    backHome: '← Volver al simulador',
    siteName: 'Bracket Mundial 2026',
    disclaimer:
      'Datos basados en el sorteo oficial de la FIFA (diciembre 2025). Este sitio no tiene afiliación oficial con la FIFA.',
  },
  en: {
    home: 'Home',
    groups: 'Groups',
    calendar: 'Schedule',
    stadiums: 'Stadiums',
    squads: 'Squads',
    backHome: '← Back to the simulator',
    siteName: 'World Cup 2026 Bracket',
    disclaimer:
      'Data based on the official FIFA draw (December 2025). This site is not officially affiliated with FIFA.',
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
    stadiums: en ? '/en/stadiums/' : '/estadios/',
    squads: en ? '/en/squads/' : '/plantillas/',
    team: (t) => (en ? `/en/team/${t.slugEn}/` : `/seleccion/${t.slugEs}/`),
  };
}

function teamName(t, lang) {
  return lang === 'en' ? t.nameEn : t.nameEs;
}

// ---- Builders ------------------------------------------------------------

function buildGroupsHub(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'World Cup 2026 Groups — All 48 Teams & Group Stage Draw'
    : 'Grupos del Mundial 2026 — Las 48 selecciones y el sorteo';
  const description = en
    ? 'The 12 groups of the FIFA World Cup 2026 with all 48 national teams. Browse each group, fixtures, dates and venues, and simulate the group stage.'
    : 'Los 12 grupos del Mundial FIFA 2026 con las 48 selecciones. Explora cada grupo, partidos, fechas y sedes, y simula la fase de grupos.';

  const list = data.groupLetters
    .map((g) => {
      const teams = data.groups[g].map((x) => teamName(x, lang)).join(', ');
      const label = en ? `Group ${g}` : `Grupo ${g}`;
      return `<li>${L(P.group(g), label)}: ${esc(teams)}</li>`;
    })
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Groups' : 'Grupos'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The FIFA World Cup 2026 features <strong>48 national teams</strong> split into <strong>12 groups</strong> of four (A–L) following the official draw held on December 5, 2025 in Washington D.C. The group stage runs from June 11 to June 27, 2026. The top two of each group plus the eight best third-placed teams (32 teams) advance to the knockout bracket.'
    : 'El Mundial FIFA 2026 reúne a <strong>48 selecciones</strong> repartidas en <strong>12 grupos</strong> de cuatro (A–L) según el sorteo oficial del 5 de diciembre de 2025 en Washington D.C. La fase de grupos se disputa del 11 al 27 de junio de 2026. Los dos primeros de cada grupo más los ocho mejores terceros (32 equipos) avanzan al cuadro eliminatorio.'}</p>
<h2>${en ? 'The 12 groups' : 'Los 12 grupos'}</h2>
<ul>
${list}
</ul>
<p>${L(P.calendar, en ? 'See the full match schedule' : 'Consulta el calendario completo')} · ${L(P.stadiums, en ? 'Host stadiums' : 'Sedes y estadios')} · ${L(P.squads, en ? 'Team squads' : 'Plantillas')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.groupsHub,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup 2026 groups, group stage 2026, world cup draw 2026'
      : 'grupos mundial 2026, fase de grupos 2026, sorteo mundial 2026',
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: data.groupLetters.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: en ? `Group ${g}` : `Grupo ${g}`,
          url: `${SITE_URL}${P.group(g)}`,
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Groups' : 'Grupos', path: P.groupsHub },
      ]),
    ],
    body,
  };
}

function buildGroupPage(data, lang, letter) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const teams = data.groups[letter];
  const matches = data.matchesByGroup[letter] ?? [];
  const label = en ? `Group ${letter}` : `Grupo ${letter}`;
  const teamNames = teams.map((x) => teamName(x, lang));

  const title = en
    ? `${label} World Cup 2026: ${teamNames.join(', ')} — Fixtures & Predictions`
    : `${label} Mundial 2026: ${teamNames.join(', ')} — Partidos y predicciones`;
  const description = en
    ? `${label} of the FIFA World Cup 2026: ${teamNames.join(', ')}. Full fixtures, dates, venues and group standings simulator.`
    : `${label} del Mundial FIFA 2026: ${teamNames.join(', ')}. Calendario completo, fechas, sedes y simulador de la clasificación.`;

  const matchRows = matches
    .map(
      (m) =>
        `<li><strong>${esc(teamName(m.teamA, lang))} vs ${esc(teamName(m.teamB, lang))}</strong> — ${fmtDate(m.date, lang)} · ${esc(m.stadium.name)}, ${esc(en ? countryEn(m.stadium.country) : m.stadium.country)} (${esc(m.stadium.city)})</li>`,
    )
    .join('\n');

  const teamLinks = teams.map((x) => L(P.team(x), teamName(x, lang))).join(' · ');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${L(P.groupsHub, en ? 'Groups' : 'Grupos')} › ${esc(label)}</nav>
<h1>${esc(label)} — ${en ? 'World Cup 2026' : 'Mundial 2026'}</h1>
<p>${en
    ? `${label} of the FIFA World Cup 2026 is made up of <strong>${esc(teamNames.join(', '))}</strong>. Below are all six group-stage fixtures with confirmed dates, kick-off venues and host cities. Use the simulator to enter results and compute the standings automatically.`
    : `El ${label} del Mundial FIFA 2026 está formado por <strong>${esc(teamNames.join(', '))}</strong>. A continuación están los seis partidos de la fase de grupos con fechas confirmadas, estadios y ciudades sede. Usa el simulador para introducir resultados y calcular la clasificación automáticamente.`}</p>
<h2>${en ? 'Teams' : 'Selecciones'}</h2>
<p>${teamLinks}</p>
<h2>${en ? 'Fixtures' : 'Partidos'}</h2>
<ul>
${matchRows}
</ul>
<p>${en
    ? 'The top two teams qualify directly for the round of 32; third place can still advance as one of the eight best third-placed teams.'
    : 'Los dos primeros se clasifican directamente a los dieciseisavos; el tercero aún puede avanzar como uno de los ocho mejores terceros.'}</p>
<p>${L(P.groupsHub, en ? 'All groups' : 'Todos los grupos')} · ${L(P.calendar, en ? 'Full schedule' : 'Calendario completo')} · ${L(P.stadiums, en ? 'Stadiums' : 'Estadios')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.group(letter),
    lang,
    title,
    description,
    keywords: en
      ? `group ${letter} world cup 2026, ${teamNames.join(', ').toLowerCase()} world cup`
      : `grupo ${letter} mundial 2026, ${teamNames.join(', ').toLowerCase()} mundial`,
    jsonLd: [
      {
        '@type': 'ItemList',
        name: `${label} — ${en ? 'World Cup 2026 fixtures' : 'Partidos Mundial 2026'}`,
        itemListElement: matches.map((m, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'SportsEvent',
            name: `${teamName(m.teamA, lang)} vs ${teamName(m.teamB, lang)}`,
            startDate: m.date,
            sport: 'Football',
            location: { '@type': 'Place', name: m.stadium.name, address: m.stadium.city },
          },
        })),
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Groups' : 'Grupos', path: P.groupsHub },
        { name: label, path: P.group(letter) },
      ]),
    ],
    body,
  };
}

function buildCalendar(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'World Cup 2026 Schedule — All 104 Matches, Dates & Venues'
    : 'Calendario Mundial 2026 — Los 104 partidos, fechas y sedes';
  const description = en
    ? 'Complete FIFA World Cup 2026 schedule: 104 matches from June 11 to July 19, 2026. Group stage and knockout dates, kick-off venues and host cities.'
    : 'Calendario completo del Mundial FIFA 2026: 104 partidos del 11 de junio al 19 de julio de 2026. Fechas de grupos y eliminatorias, estadios y ciudades sede.';

  const phases = data.matchDays
    .map((d) => `<li><strong>${esc(d.label)}</strong> — ${fmtDate(d.date, lang)}</li>`)
    .join('\n');

  const firstMatches = data.matches
    .slice(0, 12)
    .map(
      (m) =>
        `<li>${esc(teamName(m.teamA, lang))} vs ${esc(teamName(m.teamB, lang))} — ${fmtDate(m.date, lang)} · ${esc(m.stadium.city)}</li>`,
    )
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Schedule' : 'Calendario'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The FIFA World Cup 2026 is played across <strong>104 matches</strong> from <strong>June 11 to July 19, 2026</strong> in the United States, Mexico and Canada. The group stage (72 matches) runs June 11–27; the knockout stage (32 matches) runs June 28 to July 19, ending with the final at MetLife Stadium, New Jersey.'
    : 'El Mundial FIFA 2026 se disputa en <strong>104 partidos</strong> del <strong>11 de junio al 19 de julio de 2026</strong> en Estados Unidos, México y Canadá. La fase de grupos (72 partidos) va del 11 al 27 de junio; la fase eliminatoria (32 partidos) del 28 de junio al 19 de julio, terminando con la final en el MetLife Stadium, Nueva Jersey.'}</p>
<h2>${en ? 'Key dates' : 'Fechas clave'}</h2>
<ul>
${phases}
</ul>
<h2>${en ? 'Opening matches' : 'Primeros partidos'}</h2>
<ul>
${firstMatches}
</ul>
<p>${L(P.groupsHub, en ? 'Browse groups' : 'Explora los grupos')} · ${L(P.stadiums, en ? 'Host stadiums' : 'Sedes')} · ${L(P.squads, en ? 'Squads' : 'Plantillas')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.calendar,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup 2026 schedule, world cup 2026 fixtures, match dates 2026'
      : 'calendario mundial 2026, fixture mundial 2026, fechas partidos 2026',
    jsonLd: [
      {
        '@type': 'ItemList',
        name: title,
        itemListElement: data.matchDays.map((d, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: d.label,
          item: `${SITE_URL}${P.calendar}#${d.id}`,
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

function buildStadiums(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'World Cup 2026 Stadiums — All 16 Host Venues in USA, Mexico & Canada'
    : 'Estadios del Mundial 2026 — Las 16 sedes en EE.UU., México y Canadá';
  const description = en
    ? 'All 16 FIFA World Cup 2026 stadiums across the United States, Mexico and Canada: capacity, host city, country and the matches each venue hosts.'
    : 'Los 16 estadios del Mundial FIFA 2026 en Estados Unidos, México y Canadá: capacidad, ciudad sede, país y los partidos de cada recinto.';

  const rows = data.stadiums
    .map(
      (s) =>
        `<li><strong>${esc(s.name)}</strong> — ${esc(s.city)}, ${esc(en ? countryEn(s.country) : s.country)} · ${s.capacity.toLocaleString(en ? 'en-US' : 'es-ES')} ${en ? 'seats' : 'asientos'}. ${esc(en ? s.highlight : s.highlight)}</li>`,
    )
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Stadiums' : 'Estadios'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The FIFA World Cup 2026 is hosted across <strong>16 stadiums</strong> in three countries: the United States (11 venues), Mexico (3) and Canada (2). It is the first World Cup with three host nations. Below is every venue with capacity, host city and what it will host.'
    : 'El Mundial FIFA 2026 se reparte en <strong>16 estadios</strong> de tres países: Estados Unidos (11 sedes), México (3) y Canadá (2). Es el primer Mundial con tres países anfitriones. A continuación cada sede con capacidad, ciudad y lo que albergará.'}</p>
<ul>
${rows}
</ul>
<p>${L(P.groupsHub, en ? 'Groups' : 'Grupos')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')} · ${L(P.squads, en ? 'Squads' : 'Plantillas')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.stadiums,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup 2026 stadiums, host cities 2026, world cup venues usa mexico canada'
      : 'estadios mundial 2026, sedes mundial 2026, ciudades mundial 2026',
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

function buildSquadsHub(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'World Cup 2026 Squads — All 48 National Teams'
    : 'Plantillas Mundial 2026 — Las 48 selecciones';
  const description = en
    ? 'Squads, line-ups and player data for all 48 national teams at the FIFA World Cup 2026, organised by group.'
    : 'Plantillas, alineaciones y datos de jugadores de las 48 selecciones del Mundial FIFA 2026, organizadas por grupo.';

  const byGroup = data.groupLetters
    .map((g) => {
      const links = data.groups[g].map((x) => L(P.team(x), teamName(x, lang))).join(' · ');
      return `<li><strong>${en ? `Group ${g}` : `Grupo ${g}`}:</strong> ${links}</li>`;
    })
    .join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Squads' : 'Plantillas'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'Explore the squads of all <strong>48 teams</strong> qualified for the FIFA World Cup 2026. Each team page lists its group, full group-stage fixtures and squad information.'
    : 'Explora las plantillas de las <strong>48 selecciones</strong> clasificadas al Mundial FIFA 2026. Cada página de equipo incluye su grupo, calendario completo de la fase de grupos e información de la plantilla.'}</p>
<ul>
${byGroup}
</ul>
<p>${L(P.groupsHub, en ? 'Groups' : 'Grupos')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')} · ${L(P.stadiums, en ? 'Stadiums' : 'Estadios')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.squads,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup 2026 squads, world cup 2026 lineups, national teams 2026'
      : 'plantillas mundial 2026, convocatorias mundial 2026, selecciones 2026',
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

function buildTeamPage(data, lang, team) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const name = teamName(team, lang);
  const g = team.group;
  const rivals = data.groups[g].filter((x) => x.id !== team.id).map((x) => teamName(x, lang));
  const matches = (data.matchesByTeam[team.id] ?? []).filter((m) => m.group === g);

  const title = en
    ? `${name} at the World Cup 2026 — Group ${g}, Fixtures & Squad`
    : `${name} en el Mundial 2026 — Grupo ${g}, partidos y plantilla`;
  const description = en
    ? `${name} plays in Group ${g} of the FIFA World Cup 2026 against ${rivals.join(', ')}. Full fixtures, dates, venues and squad.`
    : `${name} juega en el Grupo ${g} del Mundial FIFA 2026 ante ${rivals.join(', ')}. Calendario completo, fechas, sedes y plantilla.`;

  const matchRows = matches
    .map(
      (m) =>
        `<li><strong>${esc(teamName(m.teamA, lang))} vs ${esc(teamName(m.teamB, lang))}</strong> — ${fmtDate(m.date, lang)} · ${esc(m.stadium.name)}, ${esc(m.stadium.city)}</li>`,
    )
    .join('\n');

  let squadHtml = '';
  const squad = data.getSquad(team.id);
  if (Array.isArray(squad) && squad.length) {
    const players = squad
      .slice(0, 26)
      .map((pl) => `<li>${pl.number ? `#${pl.number} ` : ''}${esc(pl.name)}${pl.position ? ` — ${esc(pl.position)}` : ''}${pl.club ? ` (${esc(pl.club)})` : ''}</li>`)
      .join('\n');
    squadHtml = `<h2>${en ? 'Squad' : 'Plantilla'}</h2>\n<ul>\n${players}\n</ul>`;
  }

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${L(P.squads, en ? 'Squads' : 'Plantillas')} › ${esc(name)}</nav>
<h1>${esc(name)} — ${en ? 'World Cup 2026' : 'Mundial 2026'}</h1>
<p>${en
    ? `<strong>${esc(name)}</strong> competes in <strong>${L(P.group(g), `Group ${g}`)}</strong> of the FIFA World Cup 2026, facing ${esc(rivals.join(', '))}. Below are ${esc(name)}'s group-stage fixtures with confirmed dates and venues. Predict every result in the simulator and follow the team through the knockout bracket.`
    : `<strong>${esc(name)}</strong> compite en el <strong>${L(P.group(g), `Grupo ${g}`)}</strong> del Mundial FIFA 2026, ante ${esc(rivals.join(', '))}. A continuación los partidos de la fase de grupos de ${esc(name)} con fechas y sedes confirmadas. Predice cada resultado en el simulador y sigue al equipo por el cuadro eliminatorio.`}</p>
<h2>${en ? 'Group-stage fixtures' : 'Partidos de la fase de grupos'}</h2>
<ul>
${matchRows}
</ul>
${squadHtml}
<p>${L(P.group(g), en ? `Full Group ${g}` : `Grupo ${g} completo`)} · ${L(P.squads, en ? 'All squads' : 'Todas las plantillas')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.team(team),
    lang,
    title,
    description,
    keywords: en
      ? `${name.toLowerCase()} world cup 2026, ${name.toLowerCase()} group ${g}, ${name.toLowerCase()} fixtures`
      : `${name.toLowerCase()} mundial 2026, ${name.toLowerCase()} grupo ${g}, ${name.toLowerCase()} partidos`,
    jsonLd: [
      {
        '@type': 'SportsTeam',
        name,
        sport: 'Football',
        memberOf: {
          '@type': 'SportsOrganization',
          name: en ? 'FIFA World Cup 2026' : 'Copa Mundial de la FIFA 2026',
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

function buildHomeEn(data) {
  const lang = 'en';
  const t = TXT[lang];
  const P = paths(lang);
  const title = 'World Cup 2026 Bracket — Free Interactive Group & Knockout Simulator';
  const description =
    'Free FIFA World Cup 2026 bracket simulator. Predict the 12 groups, simulate the knockout stage of 48 teams and share your prediction.';

  const groupList = data.groupLetters
    .map((g) => `<li>${L(P.group(g), `Group ${g}`)}: ${esc(data.groups[g].map((x) => x.nameEn).join(', '))}</li>`)
    .join('\n');

  const body = `
<h1>World Cup 2026 Bracket — Interactive FIFA World Cup Simulator</h1>
<p>Predict the results of all <strong>104 matches</strong> of the FIFA World Cup 2026 with our free simulator. Complete the group stage, qualify the 48 national teams and advance through the knockout rounds to crown your champion. Save your prediction and share it.</p>
<h2>World Cup 2026 Groups — The 48 teams</h2>
<ul>
${groupList}
</ul>
<h2>Explore</h2>
<p>${L(P.groupsHub, 'All groups')} · ${L(P.calendar, 'Match schedule')} · ${L(P.stadiums, 'Host stadiums')} · ${L(P.squads, 'Team squads')}</p>
<h2>Frequently asked questions</h2>
<details><summary><strong>How many teams play at the 2026 World Cup?</strong></summary><p>48 national teams compete at the FIFA World Cup 2026, split into 12 groups of 4 — the first time the tournament expands from 32 to 48 teams.</p></details>
<details><summary><strong>When does the 2026 World Cup start?</strong></summary><p>The FIFA World Cup 2026 begins on June 11, 2026 with Mexico vs South Africa at Estadio Azteca. The final is on July 19 at MetLife Stadium, New Jersey.</p></details>
<details><summary><strong>Where is the 2026 World Cup played?</strong></summary><p>Across three countries: the United States (11 stadiums), Mexico (3) and Canada (2) — the first World Cup with three host nations and 16 venues.</p></details>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.root,
    lang,
    title,
    description,
    keywords:
      'world cup 2026 bracket, world cup 2026 simulator, world cup 2026 groups, world cup 2026 predictions',
    jsonLd: [
      {
        '@type': 'WebApplication',
        name: 'World Cup 2026 Bracket',
        url: `${SITE_URL}/en/`,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Any',
        inLanguage: 'en',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How many teams play at the 2026 World Cup?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '48 national teams compete at the FIFA World Cup 2026, split into 12 groups of 4.',
            },
          },
          {
            '@type': 'Question',
            name: 'When does the 2026 World Cup start?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The FIFA World Cup 2026 begins on June 11, 2026 and the final is on July 19, 2026.',
            },
          },
        ],
      },
      breadcrumb([{ name: 'Home', path: '/en/' }]),
    ],
    body,
  };
}

// ---- Orquestador ---------------------------------------------------------

/**
 * Devuelve la lista completa de páginas a generar, con su alterno ES/EN
 * resuelto para los hreflang recíprocos.
 */
export function buildAllPages(data) {
  const pages = [];

  // Pares topic → builders ES/EN, para resolver hreflang.
  pages.push(pair(buildGroupsHub(data, 'es'), buildGroupsHub(data, 'en')));
  for (const g of data.groupLetters) {
    pages.push(pair(buildGroupPage(data, 'es', g), buildGroupPage(data, 'en', g)));
  }
  pages.push(pair(buildCalendar(data, 'es'), buildCalendar(data, 'en')));
  pages.push(pair(buildStadiums(data, 'es'), buildStadiums(data, 'en')));
  pages.push(pair(buildSquadsHub(data, 'es'), buildSquadsHub(data, 'en')));
  for (const tm of data.teams) {
    pages.push(pair(buildTeamPage(data, 'es', tm), buildTeamPage(data, 'en', tm)));
  }

  // Home: ES es index.html (no se regenera aquí); EN sí.
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

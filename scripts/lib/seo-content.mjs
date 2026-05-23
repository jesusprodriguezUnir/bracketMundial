// Genera el descriptor de cada página estática (ES + EN) a partir de los
// datos del torneo: ruta, meta, JSON-LD y cuerpo HTML único (>300 palabras).

import { SITE_URL, OG_IMAGE, esc, slugify } from './seo-i18n.mjs';
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

const FIFA_ORGANIZER = {
  '@type': 'Organization',
  name: 'FIFA',
  url: 'https://www.fifa.com',
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
    pool: en ? '/en/world-cup-pool/' : '/porra-mundial-2026/',
    printable: en ? '/en/printable-bracket/' : '/plantilla-imprimir/',
    simulator: en ? '/en/knockout-simulator/' : '/simulador-eliminatorias/',
    classroom: en ? '/en/world-cup-classroom/' : '/mundial-para-clase/',
  };
}

function teamName(t, lang) {
  return lang === 'en' ? t.nameEn : t.nameEs;
}

function sportsEventDescription(match, lang) {
  const teamA = teamName(match.teamA, lang);
  const teamB = teamName(match.teamB, lang);
  const stadium = match.stadium.name;
  const city = match.stadium.city;

  return lang === 'en'
    ? `${teamA} vs ${teamB} in the FIFA World Cup 2026 group stage at ${stadium}, ${city}.`
    : `${teamA} vs ${teamB} en la fase de grupos del Mundial FIFA 2026 en ${stadium}, ${city}.`;
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
            description: sportsEventDescription(m, lang),
            startDate: m.date,
            endDate: m.date,
            eventStatus: 'https://schema.org/EventScheduled',
            sport: 'Football',
            organizer: FIFA_ORGANIZER,
            location: { '@type': 'Place', name: m.stadium.name, address: m.stadium.city },
            performer: [
              { '@type': 'SportsTeam', name: teamName(m.teamA, lang) },
              { '@type': 'SportsTeam', name: teamName(m.teamB, lang) },
            ],
            image: OG_IMAGE,
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}${P.group(letter)}`,
              availability: 'https://schema.org/InStock',
              price: '0',
              priceCurrency: 'USD',
              validFrom: '2024-01-01T00:00:00Z',
            },
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

  const knockoutRivals = data.groupLetters
    .filter((lg) => lg !== g)
    .map((lg) => data.groups[lg].map((x) => teamName(x, lang)))
    .flat()
    .sort();

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
<h2>${en ? 'Possible knockout rivals' : 'Posibles rivales en las eliminatorias'}</h2>
<p>${en
    ? `If ${esc(name)} advances from Group ${g}, the team's path through the knockout bracket could cross any of the following nations depending on the final standings and third-place rankings: ${esc(knockoutRivals.join(', '))}. Simulate the full bracket to see every possible matchup.`
    : `Si ${esc(name)} avanza desde el Grupo ${g}, el camino de la selección por el cuadro eliminatorio podría cruzar a cualquiera de las siguientes selecciones dependiendo de la clasificación final y el orden de mejores terceros: ${esc(knockoutRivals.join(', '))}. Simula el bracket completo con el ${L(P.simulator, 'simulador de cruces')} para ver cada posible cruce.`}</p>
<p>${L(P.group(g), en ? `Full Group ${g}` : `Grupo ${g} completo`)} · ${L(P.squads, en ? 'All squads' : 'Todas las plantillas')} · ${L(P.calendar, en ? 'Schedule' : 'Calendario')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.team(team),
    lang,
    title,
    description,
    keywords: en
      ? `${name.toLowerCase()} world cup 2026, ${name.toLowerCase()} group ${g}, ${name.toLowerCase()} fixtures, ${name.toLowerCase()} possible opponents world cup 2026, ${name.toLowerCase()} knockout path`
      : `${name.toLowerCase()} mundial 2026, ${name.toLowerCase()} grupo ${g}, ${name.toLowerCase()} partidos, cruces ${name.toLowerCase()} mundial 2026, posibles rivales ${name.toLowerCase()} mundial 2026`,
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

function buildPoolPage(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'World Cup 2026 Pool — Create Your Bracket With Friends | Free'
    : 'Porra del Mundial 2026 — Crea Tu Bracket con Amigos | Gratis';
  const description = en
    ? 'Create a World Cup 2026 pool with friends, coworkers or classmates. Fill in group stage scores, generate the knockout bracket and share your prediction. Free, no sign-up.'
    : 'Crea una porra del Mundial 2026 con amigos, compañeros de trabajo o de clase. Rellena los marcadores de la fase de grupos, genera las eliminatorias y comparte tu predicción. Gratis y sin registro.';

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'World Cup Pool' : 'Porra del Mundial 2026'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The ultimate <strong>World Cup 2026 pool tool</strong> for playing with friends, family or colleagues. Our free simulator lets everyone fill in their own bracket and compare predictions — no spreadsheets, no downloads, no sign-up required.'
    : 'La herramienta definitiva para hacer tu <strong>porra del Mundial 2026</strong> con amigos, familia o compañeros de trabajo. Nuestro simulador gratis permite que cada persona rellene su propio bracket y compare predicciones — sin Excel, sin descargas, sin registros.'}</p>
<h2>${en ? 'How to run a World Cup pool in 3 steps' : 'Cómo organizar una porra del Mundial en 3 pasos'}</h2>
<ol>
  <li>${en ? `<strong>Predict the group stage:</strong> open the ${L(P.root, 'simulator')}, fill in all 72 group-stage scores and check the standings.` : `<strong>Predice los grupos:</strong> abre el ${L(P.root, 'simulador')}, rellena los 72 marcadores de la fase de grupos y revisa la clasificación.`}</li>
  <li>${en ? `<strong>Simulate the knockout:</strong> go to the ${L(P.root, 'knockout tab')}, generate the bracket and advance teams to crown your champion.` : `<strong>Simula las eliminatorias:</strong> ve a la pestaña ${L(P.root, 'Cruces')}, genera el cuadro y avanza equipos hasta coronar a tu campeón.`}</li>
  <li>${en ? '<strong>Share:</strong> export your bracket as an image (PNG) or copy the link and share it in the group chat — everyone can compare their picks.' : '<strong>Comparte:</strong> exporta tu cuadro como imagen (PNG) o copia el enlace y compártelo en el grupo de WhatsApp — todos pueden comparar sus pronósticos.'}</li>
</ol>
<h2>${en ? 'Pool ideas for the 2026 World Cup' : 'Ideas para tu porra del Mundial 2026'}</h2>
<ul>
  <li>${en ? '<strong>Office / workplace pool:</strong> create a league for your team using the Leagues feature. Each colleague fills their own bracket; the system scores predictions against real results.' : '<strong>Porra del trabajo:</strong> crea una liga para tu equipo con la función Ligas. Cada compañero rellena su bracket; el sistema puntúa las predicciones contra los resultados reales.'}</li>
  <li>${en ? '<strong>Friends & family:</strong> set up a WhatsApp group, share your bracket images and vote on the best prediction.' : '<strong>Amigos y familia:</strong> monta un grupo de WhatsApp, compartid las imágenes del bracket y votad la mejor predicción.'}</li>
  <li>${en ? `<strong>Classroom activity:</strong> use the ${L(P.classroom, 'World Cup for classrooms')} page with printable materials for students.` : `<strong>Actividad escolar:</strong> usa la página de ${L(P.classroom, 'Mundial para clase')} con materiales imprimibles para alumnos.`}</li>
  <li>${en ? `<strong>Printable template:</strong> want to do it on paper? Check our ${L(P.printable, 'printable bracket template')} ready to download as PDF.` : `<strong>Plantilla para imprimir:</strong> ¿prefieres hacerlo en papel? Mira nuestra ${L(P.printable, 'plantilla para imprimir')} lista para descargar en PDF.`}</li>
</ul>
<h2>${en ? 'Why use our pool?' : 'Por qué usar nuestra porra'}</h2>
<p>${en
    ? 'No Excel formulas, no manual calculations, no PDFs to print unless you want to. The simulator automatically computes group standings with tiebreakers (goal difference, goals scored, fair play), qualifies the best third-placed teams following FIFA rules and generates a real knockout bracket. And everything is free.'
    : 'Sin fórmulas de Excel, sin cálculos manuales, sin PDFs que imprimir (salvo que quieras). El simulador calcula automáticamente las clasificaciones de grupo con criterios de desempate (diferencia de goles, goles a favor, fair play), clasifica a los mejores terceros siguiendo las reglas FIFA y genera un cuadro eliminatorio real. Y todo gratis.'}</p>
<p>${L(P.root, en ? 'Start your pool now' : 'Empieza tu porra ahora')} · ${L(P.simulator, en ? 'Knockout simulator' : 'Simulador de cruces')} · ${L(P.printable, en ? 'Printable template' : 'Plantilla para imprimir')} · ${L(P.classroom, en ? 'For classrooms' : 'Para clase')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.pool,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup 2026 pool, world cup bracket pool, office world cup pool, world cup prediction game, create world cup pool with friends'
      : 'porra mundial 2026, crear porra mundial 2026, porra del mundial para amigos, porra del trabajo mundial, juego predicciones mundial 2026',
    jsonLd: [
      {
        '@type': 'HowTo',
        name: en ? 'How to create a World Cup 2026 pool with friends' : 'Cómo crear una porra del Mundial 2026 con amigos',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: en ? 'Predict the group stage' : 'Predice la fase de grupos',
            text: en ? 'Fill in all 72 group-stage scores in the simulator and check the standings.' : 'Rellena los 72 marcadores de la fase de grupos en el simulador y revisa la clasificación.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: en ? 'Simulate the knockout' : 'Simula las eliminatorias',
            text: en ? 'Go to the knockout tab, generate the bracket and advance teams to crown your champion.' : 'Ve a la pestaña Cruces, genera el cuadro y avanza equipos hasta coronar a tu campeón.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: en ? 'Share and compare' : 'Comparte y compara',
            text: en ? 'Export your bracket as an image or copy the link and share it with your group.' : 'Exporta tu cuadro como imagen o copia el enlace y compártelo con tu grupo.',
          },
        ],
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'World Cup Pool' : 'Porra del Mundial 2026', path: P.pool },
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
    ? 'World Cup 2026 Printable Bracket — Download PDF Template | Free'
    : 'Plantilla Porra Mundial 2026 para Imprimir — Descarga el Cuadro en PDF | Gratis';
  const description = en
    ? 'Download and print the World Cup 2026 bracket template. Fill in your predictions on paper, share with friends or use in the classroom. Free PDF and PNG downloads.'
    : 'Descarga e imprime la plantilla del bracket del Mundial 2026. Rellena tus predicciones en papel, comparte con amigos o usa en clase. Descarga gratis en PDF y PNG.';

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Printable Bracket' : 'Plantilla para imprimir'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'Get your <strong>printable World Cup 2026 bracket template</strong>. Whether you prefer filling it in on paper, sharing a printed version at a watch party, or using it as a classroom handout — we have you covered.'
    : 'Consigue tu <strong>plantilla del Mundial 2026 para imprimir</strong>. Tanto si prefieres rellenarla en papel, repartirla en una quedada para ver los partidos o usarla como material de clase — aquí la tienes.'}</p>
<h2>${en ? 'How to get your printable bracket' : 'Cómo conseguir tu cuadro para imprimir'}</h2>
<ol>
  <li>${en ? `<strong>Fill in your bracket</strong> in the ${L(P.root, 'online simulator')} — group stage and knockout.` : `<strong>Rellena tu bracket</strong> en el ${L(P.root, 'simulador online')} — fase de grupos y eliminatorias.`}</li>
  <li>${en ? '<strong>Export as image:</strong> click the SHARE button and download a high-resolution PNG of your complete bracket.' : '<strong>Exporta como imagen:</strong> pulsa el botón COMPARTIR y descarga un PNG de alta resolución de tu cuadro completo.'}</li>
  <li>${en ? '<strong>Print:</strong> open the PNG and print it (Ctrl+P / Cmd+P). For a multi-page PDF, use the Guide tab to generate the Official Guide.' : '<strong>Imprime:</strong> abre el PNG e imprímelo (Ctrl+P / Cmd+P). Para un PDF multipágina, usa la pestaña Guía para generar la Guía Oficial.'}</li>
  <li>${en ? '<strong>Export to Excel:</strong> download the full schedule as an Excel spreadsheet from the Schedule tab for further editing.' : '<strong>Exporta a Excel:</strong> descarga el calendario completo como hoja Excel desde la pestaña Calendario para editarlo a tu gusto.'}</li>
</ol>
<h2>${en ? 'What the printable template includes' : 'Qué incluye la plantilla para imprimir'}</h2>
<ul>
  <li>${en ? 'All 12 groups (A to L) with the 4 teams each' : 'Los 12 grupos (A a L) con sus 4 selecciones'}</li>
  <li>${en ? '48 group-stage matches with date, venue and kick-off time' : '48 partidos de fase de grupos con fecha, sede y hora'}</li>
  <li>${en ? 'Complete knockout bracket from round of 32 to the final' : 'Cuadro eliminatorio completo desde dieciseisavos hasta la final'}</li>
  <li>${en ? 'Space to write scores, group standings and your champion pick' : 'Espacio para escribir marcadores, clasificación de grupo y tu campeón'}</li>
  <li>${en ? 'FIFA World Cup 2026 official branding and disclaimer' : 'Marca oficial del Mundial FIFA 2026 y descargo de responsabilidad'}</li>
</ul>
<p>${en
    ? 'No Excel skills needed. The online simulator does the math — you just download and print.'
    : 'Sin necesidad de saber Excel. El simulador online hace los cálculos — tú solo descargas e imprimes.'}</p>
<p>${L(P.root, en ? 'Open the simulator' : 'Abrir el simulador')} · ${L(P.pool, en ? 'World Cup pool' : 'Porra del Mundial')} · ${L(P.simulator, en ? 'Knockout simulator' : 'Simulador de cruces')} · ${L(P.classroom, en ? 'For classrooms' : 'Para clase')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.printable,
    lang,
    title,
    description,
    keywords: en
      ? 'printable world cup 2026 bracket, world cup 2026 bracket pdf, world cup bracket template, world cup bracket excel, download world cup bracket pdf'
      : 'plantilla porra mundial 2026, cuadro mundial 2026 para imprimir, descargar bracket mundial 2026 pdf, plantilla excel porra mundial, imprimir cuadro mundial 2026',
    jsonLd: [
      {
        '@type': 'HowTo',
        name: en ? 'How to print the World Cup 2026 bracket' : 'Cómo imprimir el cuadro del Mundial 2026',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: en ? 'Fill in your bracket' : 'Rellena tu bracket',
            text: en ? 'Use the free online simulator to fill in group stage scores and knockout picks.' : 'Usa el simulador gratis online para rellenar marcadores de grupos y eliminatorias.',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: en ? 'Download the bracket' : 'Descarga el cuadro',
            text: en ? 'Click SHARE to download a high-resolution PNG image of your completed bracket.' : 'Pulsa COMPARTIR para descargar una imagen PNG de alta resolución de tu cuadro.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: en ? 'Print it' : 'Imprímelo',
            text: en ? 'Open the downloaded image and print it (Ctrl+P). Use the Guide tab for a full PDF.' : 'Abre la imagen descargada e imprímela (Ctrl+P). Usa la pestaña Guía para un PDF completo.',
          },
        ],
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Printable Bracket' : 'Plantilla para imprimir', path: P.printable },
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
    ? 'World Cup 2026 Knockout Simulator — Predict the Full Bracket | Free'
    : 'Simulador de Cruces Mundial 2026 — Predice las Eliminatorias Completas | Gratis';
  const description = en
    ? 'Simulate the complete World Cup 2026 knockout bracket: round of 32 to the final. Generate matchups automatically from group standings or pick your winners manually. Free, no sign-up.'
    : 'Simula las eliminatorias completas del Mundial 2026: de dieciseisavos a la final. Genera los cruces automáticamente desde la clasificación de grupos o elige tus ganadores manualmente. Gratis y sin registro.';

  const knockoutRounds = en
    ? ['Round of 32 (32 teams)', 'Round of 16', 'Quarterfinals', 'Semifinals', '3rd place match', 'Final']
    : ['Dieciseisavos de final (32 equipos)', 'Octavos de final', 'Cuartos de final', 'Semifinales', '3er puesto', 'Final'];

  const roundsHtml = knockoutRounds.map((r) => `<li>${esc(r)}</li>`).join('\n');

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'Knockout Simulator' : 'Simulador de Cruces'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'Our <strong>World Cup 2026 knockout simulator</strong> lets you predict every single match from the round of 32 all the way to the final whistle at MetLife Stadium. Generate the bracket automatically from group-stage results or pick each winner manually — the choice is yours.'
    : 'Nuestro <strong>simulador de cruces del Mundial 2026</strong> te permite predecir cada partido desde los dieciseisavos hasta el pitido final en el MetLife Stadium. Genera el cuadro automáticamente desde los resultados de grupos o elige cada ganador manualmente — tú decides.'}</p>
<h2>${en ? 'Knockout rounds' : 'Rondas eliminatorias'}</h2>
<ul>
${roundsHtml}
</ul>
<h2>${en ? 'How the bracket generator works' : 'Cómo funciona el generador de cuadros'}</h2>
<p>${en
    ? 'First, fill in the group-stage scores. Our algorithm ranks the 48 teams, selects the 8 best third-placed teams according to FIFA rules, and automatically assigns teams to their correct bracket positions. Then you pick winners in each round — or use the "simulate rest" button to auto-fill based on betting odds.'
    : 'Primero, rellena los marcadores de la fase de grupos. Nuestro algoritmo ordena las 48 selecciones, selecciona los 8 mejores terceros según las reglas FIFA y asigna automáticamente cada equipo a su posición correcta en el cuadro. Luego eliges ganadores en cada ronda — o usas el botón "simular resto" para auto-rellenar según cuotas de apuestas.'}</p>
<h2>${en ? 'Why use our knockout simulator?' : 'Por qué usar nuestro simulador de cruces'}</h2>
<ul>
  <li>${en ? 'Automatic bracket generation from group standings — follows real FIFA rules for third-place qualifiers' : 'Generación automática del cuadro desde la clasificación de grupos — sigue las reglas reales FIFA para los mejores terceros'}</li>
  <li>${en ? 'Manual or auto-simulate mode — pick winners yourself or let the odds decide' : 'Modo manual o auto-simular — elige ganadores tú mismo o deja que las cuotas decidan'}</li>
  <li>${en ? 'Penalty shootout support for tied knockout matches' : 'Soporte de penaltis para partidos empatados en eliminatorias'}</li>
  <li>${en ? 'Share your complete bracket as an image or link' : 'Comparte tu cuadro completo como imagen o enlace'}</li>
  <li>${en ? 'Export to Excel for further analysis' : 'Exporta a Excel para análisis adicional'}</li>
</ul>
<p>${L(P.root, en ? 'Open the simulator' : 'Abrir el simulador')} · ${L(P.pool, en ? 'World Cup pool' : 'Porra del Mundial')} · ${L(P.printable, en ? 'Printable bracket' : 'Plantilla para imprimir')} · ${L(P.groupsHub, en ? 'All groups' : 'Todos los grupos')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.simulator,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup 2026 knockout simulator, world cup bracket generator, knockout stage predictor, world cup round of 32 simulator, fill in world cup knockout bracket'
      : 'simulador de cruces mundial 2026, generador de cuadros mundial 2026, simulador eliminatorias mundial, rellenar bracket eliminatorias, predecir cruces mundial 2026',
    jsonLd: [
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'Knockout Simulator' : 'Simulador de Cruces', path: P.simulator },
      ]),
    ],
    body,
  };
}

function buildClassroomPage(data, lang) {
  const t = TXT[lang];
  const P = paths(lang);
  const en = lang === 'en';
  const title = en
    ? 'World Cup 2026 for Classrooms — Printable Activities & Bracket | Free'
    : 'Mundial 2026 para Clase — Actividades Imprimibles y Porra Escolar | Gratis';
  const description = en
    ? 'Bring the FIFA World Cup 2026 into your classroom. Printable bracket templates, geography and math activities, and a free prediction game for students. Ideal for K-12 and language classes.'
    : 'Lleva el Mundial FIFA 2026 a tu aula. Plantillas de bracket para imprimir, actividades de geografía y matemáticas, y un juego de predicciones gratis para alumnos. Ideal para primaria, secundaria y clases de idiomas.';

  const body = `
<nav style="font-size:14px;margin-bottom:1rem;">${L(P.root, t.siteName)} › ${en ? 'World Cup Classroom' : 'Mundial para Clase'}</nav>
<h1>${esc(title)}</h1>
<p>${en
    ? 'The <strong>FIFA World Cup 2026</strong> is a perfect opportunity to bring real-world excitement into the classroom. Our free printable bracket and interactive simulator turn the tournament into engaging lessons in geography, math, statistics and language learning — no registration required.'
    : 'El <strong>Mundial FIFA 2026</strong> es una oportunidad perfecta para llevar la emoción del fútbol al aula. Nuestra plantilla imprimible gratis y el simulador interactivo convierten el torneo en lecciones de geografía, matemáticas, estadística e idiomas — sin necesidad de registro.'}</p>
<h2>${en ? 'Classroom activity ideas' : 'Ideas de actividades para clase'}</h2>
<h3>${en ? 'Geography & flags' : 'Geografía y banderas'}</h3>
<p>${en ? '48 national teams from 6 continents. Have students locate each country on a world map, identify its capital and draw its flag. Group teams by continent and discuss cultural diversity.' : '48 selecciones de 6 continentes. Haz que los alumnos localicen cada país en un mapamundi, identifiquen su capital y dibujen su bandera. Agrupa equipos por continente y debate sobre diversidad cultural.'}</p>
<h3>${en ? 'Math & statistics' : 'Matemáticas y estadística'}</h3>
<p>${en ? 'Use group standings to teach point systems (3 for a win, 1 for a draw), goal difference calculations, tiebreakers and probability. Compare predicted vs actual results and calculate prediction accuracy as a percentage.' : 'Usa las clasificaciones de grupo para enseñar sistemas de puntuación (3 por victoria, 1 por empate), diferencia de goles, criterios de desempate y probabilidad. Compara resultados predichos vs reales y calcula el porcentaje de acierto.'}</p>
<h3>${en ? 'Language learning' : 'Aprendizaje de idiomas'}</h3>
<p>${en ? 'The simulator is available in Spanish and English — switch between languages to practice vocabulary, player positions, countries and tournament terminology. Have students write match previews in the target language.' : 'El simulador está disponible en español e inglés — cambia de idioma para practicar vocabulario, posiciones de jugadores, países y terminología del torneo. Haz que los alumnos escriban previas de partidos en el idioma meta.'}</p>
<h3>${en ? 'Classroom bracket pool' : 'Porra de clase'}</h3>
<p>${en ? 'Each student (or group) fills in their own bracket prediction. Display the brackets on a classroom wall and update real results as the tournament progresses. Award points for correct group standings and knockout predictions.' : 'Cada alumno (o grupo) rellena su propia predicción del bracket. Exhibe los cuadros en la pared del aula y actualiza los resultados reales según avanza el torneo. Otorga puntos por aciertos en clasificación de grupos y eliminatorias.'}</p>
<h2>${en ? 'How to get started' : 'Cómo empezar'}</h2>
<ol>
  <li>${en ? `<strong>Download the template:</strong> visit our ${L(P.printable, 'printable bracket page')} to download a blank template. Print one per student or group.` : `<strong>Descarga la plantilla:</strong> visita nuestra ${L(P.printable, 'página de plantilla para imprimir')} para descargar un cuadro en blanco. Imprime uno por alumno o grupo.`}</li>
  <li>${en ? `<strong>Use the simulator:</strong> open the ${L(P.root, 'online simulator')} on a classroom projector or individual devices to fill in predictions together.` : `<strong>Usa el simulador:</strong> abre el ${L(P.root, 'simulador online')} en el proyector del aula o en dispositivos individuales para rellenar predicciones juntos.`}</li>
  <li>${en ? `<strong>Create a league:</strong> use the Leagues feature to create a private classroom league where everyone can compare their picks.` : `<strong>Crea una liga:</strong> usa la función Ligas para crear una liga privada de clase donde todos puedan comparar sus pronósticos.`}</li>
  <li>${en ? '<strong>Follow the tournament:</strong> as real matches are played, update the classroom bracket and calculate scores.' : '<strong>Sigue el torneo:</strong> según se juegan los partidos reales, actualizad el bracket de clase y calculad puntuaciones.'}</li>
</ol>
<p>${en
    ? 'All tools are completely free with no sign-up required. Works on any device with a browser — computers, tablets or smartphones.'
    : 'Todas las herramientas son completamente gratis y sin registro. Funciona en cualquier dispositivo con navegador — ordenadores, tabletas o móviles.'}</p>
<p>${L(P.root, en ? 'Open the simulator' : 'Abrir el simulador')} · ${L(P.pool, en ? 'World Cup pool' : 'Porra del Mundial')} · ${L(P.printable, en ? 'Printable bracket' : 'Plantilla para imprimir')} · ${L(P.simulator, en ? 'Knockout simulator' : 'Simulador de cruces')}</p>
<p>${L(P.root, t.backHome)}</p>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.classroom,
    lang,
    title,
    description,
    keywords: en
      ? 'world cup classroom activities, world cup 2026 for schools, printable world cup bracket for kids, world cup lesson plans, world cup pool for students'
      : 'mundial 2026 para clase, porra del mundial para colegios, actividades mundial 2026 alumnos, plantilla mundial para niños, mundial para primaria y secundaria',
    jsonLd: [
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: en ? 'How to use the World Cup 2026 in the classroom?' : '¿Cómo usar el Mundial 2026 en clase?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: en ? 'Use our free printable bracket templates and online simulator to create geography, math, statistics and language learning activities around the 48 national teams and the tournament.' : 'Usa nuestras plantillas de bracket imprimibles gratis y el simulador online para crear actividades de geografía, matemáticas, estadística e idiomas alrededor de las 48 selecciones y el torneo.',
            },
          },
          {
            '@type': 'Question',
            name: en ? 'Is it free for schools?' : '¿Es gratis para colegios?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: en ? 'Yes — the simulator, printable templates and all tools are completely free. No sign-up, no payment, no ads that interfere with classroom use.' : 'Sí — el simulador, las plantillas imprimibles y todas las herramientas son completamente gratis. Sin registro, sin pago, sin anuncios que interfieran con el uso en clase.',
            },
          },
        ],
      },
      breadcrumb([
        { name: t.home, path: P.root },
        { name: en ? 'World Cup Classroom' : 'Mundial para Clase', path: P.classroom },
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
    'Free FIFA World Cup 2026 bracket simulator. Create your pool with friends, download a printable bracket PDF and predict all 104 matches from groups to final. No sign-up.';

  const groupList = data.groupLetters
    .map((g) => `<li>${L(P.group(g), `Group ${g}`)}: ${esc(data.groups[g].map((x) => x.nameEn).join(', '))}</li>`)
    .join('\n');

  const body = `
<h1>World Cup 2026 Bracket — Interactive FIFA World Cup Simulator</h1>
<p>Predict the results of all <strong>104 matches</strong> of the FIFA World Cup 2026 with our free simulator. Complete the group stage, qualify the 48 national teams and advance through the knockout rounds to crown your champion. Save your prediction and share it with friends — perfect for your World Cup pool or office bracket.</p>
<h2>World Cup 2026 Groups — The 48 teams</h2>
<ul>
${groupList}
</ul>
<h2>Tools & Resources</h2>
<p>${L(P.pool, 'World Cup Pool for friends')} · ${L(P.printable, 'Printable bracket PDF')} · ${L(P.simulator, 'Knockout simulator')} · ${L(P.classroom, 'World Cup classroom activities')}</p>
<h2>Explore</h2>
<p>${L(P.groupsHub, 'All groups')} · ${L(P.calendar, 'Match schedule')} · ${L(P.stadiums, 'Host stadiums')} · ${L(P.squads, 'Team squads')}</p>
<h2>Frequently asked questions</h2>
<details><summary><strong>How many teams play at the 2026 World Cup?</strong></summary><p>48 national teams compete at the FIFA World Cup 2026, split into 12 groups of 4 — the first time the tournament expands from 32 to 48 teams.</p></details>
<details><summary><strong>When does the 2026 World Cup start?</strong></summary><p>The FIFA World Cup 2026 begins on June 11, 2026 with Mexico vs South Africa at Estadio Azteca. The final is on July 19 at MetLife Stadium, New Jersey.</p></details>
<details><summary><strong>Where is the 2026 World Cup played?</strong></summary><p>Across three countries: the United States (11 stadiums), Mexico (3) and Canada (2) — the first World Cup with three host nations and 16 venues.</p></details>
<details><summary><strong>How does the World Cup 2026 bracket work?</strong></summary><p>The top 2 of each group (24 teams) plus the 8 best third-placed teams advance to the knockout stage — 32 teams total. The bracket includes round of 32, round of 16, quarterfinals, semifinals and the final.</p></details>
<details><summary><strong>How to create a World Cup pool with friends?</strong></summary><p>Create your bracket in the free simulator: fill in group stage scores, generate the knockout bracket and share your prediction via link or bracket image. Perfect for office pools, friend groups or classroom activities. No sign-up, no downloads.</p></details>
<details><summary><strong>How to download the World Cup 2026 bracket as PDF?</strong></summary><p>From the SHARE button you can download a PNG image of your bracket. For PDF, use the browser Print option (Ctrl+P) or generate the Official Guide. You can also export to Excel.</p></details>
<p><small>${t.disclaimer}</small></p>`;

  return {
    path: P.root,
    lang,
    title,
    description,
    keywords:
      'world cup 2026 bracket, world cup 2026 simulator, world cup 2026 groups, world cup 2026 predictions, world cup 2026 pool, printable world cup bracket, world cup 2026 pdf, world cup knockout simulator',
    jsonLd: [
      {
        '@type': 'WebApplication',
        name: 'World Cup 2026 Bracket',
        url: `${SITE_URL}/en/`,
        image: OG_IMAGE,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Any',
        inLanguage: 'en',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', validFrom: '2024-01-01T00:00:00Z' },
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
          {
            '@type': 'Question',
            name: 'Where is the World Cup 2026 played?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Across three countries: the United States (11 stadiums), Mexico (3) and Canada (2) — the first World Cup with three host nations.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the World Cup 2026 bracket work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The top 2 of each group plus the 8 best third-placed teams advance — 32 teams in the knockout stage from round of 32 to the final.',
            },
          },
          {
            '@type': 'Question',
            name: 'How to create a World Cup pool with friends?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Create your bracket in the free simulator, share the link or bracket image, and compare predictions. No sign-up needed.',
            },
          },
          {
            '@type': 'Question',
            name: 'How to download the World Cup 2026 bracket as PDF?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Download a PNG from the SHARE button, use browser Print (Ctrl+P) for PDF, or generate the Official Guide from the Guide tab.',
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

  // Nuevas landings transaccionales y de nicho
  pages.push(pair(buildPoolPage(data, 'es'), buildPoolPage(data, 'en')));
  pages.push(pair(buildPrintablePage(data, 'es'), buildPrintablePage(data, 'en')));
  pages.push(pair(buildSimulatorPage(data, 'es'), buildSimulatorPage(data, 'en')));
  pages.push(pair(buildClassroomPage(data, 'es'), buildClassroomPage(data, 'en')));

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

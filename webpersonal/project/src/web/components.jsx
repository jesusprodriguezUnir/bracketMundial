/* Guía Mundial 2026 — Web App
   React + Babel. Estilo retro-editorial.
   Usa window.MUNDIAL_DATA (cargado desde data.js). */

const { useState, useMemo, useEffect, useCallback, useRef } = React;
const D = window.MUNDIAL_DATA;

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
const teamById = (id) => D.teams.find(t => t.id === id);
const venueById = (id) => D.venues[id];

const MATCH_OBJ = D.groupMatches.map(([id, group, a, b, day, date, time, venue]) => ({
  id, group, teamA: a, teamB: b, day, date, time, venue
}));

const matchesForTeam = (teamId) =>
  MATCH_OBJ.filter(m => m.teamA === teamId || m.teamB === teamId)
           .sort((x,y) => x.day - y.day);

const matchesForGroup = (groupLetter) =>
  MATCH_OBJ.filter(m => m.group === groupLetter)
           .sort((x,y) => x.day - y.day || x.date.localeCompare(y.date) || x.time.localeCompare(y.time));

const teamsForGroup = (groupLetter) =>
  D.teams.filter(t => t.group === groupLetter);

const fmtDate = (iso, opts = {}) => {
  const [y,m,d] = iso.split('-').map(Number);
  const date = new Date(y, m-1, d);
  const dayNames = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB'];
  const monthNames = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  if (opts.short) return `${dayNames[date.getDay()]} ${d}`;
  return `${dayNames[date.getDay()]} ${d} ${monthNames[m-1]}`;
};

const fmtDateLong = (iso) => {
  const [y,m,d] = iso.split('-').map(Number);
  const date = new Date(y, m-1, d);
  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${dayNames[date.getDay()]} ${d} de ${monthNames[m-1]}`;
};

// ═══════════════════════════════════════════════════════════════
// TeamCard — compact team summary
// ═══════════════════════════════════════════════════════════════
function TeamCard({ team, onOpen }) {
  const myMatches = matchesForTeam(team.id);
  const matchdays = [1,2,3];

  return (
    <button className="team-card" style={{'--team-color': team.color}} onClick={() => onOpen(team.id)}>
      <div className="tc-row1">
        <div className="tc-flag">{team.flag}</div>
        <div>
          <div className="tc-name">{team.name}</div>
        </div>
        <div className="tc-rank">FIFA #{team.rank}</div>
      </div>
      <div className="tc-statbar">
        <div><span className="sb-l">Mundiales</span><span className="sb-v">{team.mundiales}</span></div>
        <div><span className="sb-l">Estrellas</span><span className="sb-v">{team.estrellas}★</span></div>
        <div><span className="sb-l">Plantilla</span><span className="sb-v">{team.stars.length}+</span></div>
      </div>
      <div className="tc-coach-star">
        <div>
          <div className="label">DT</div>
          <div className="value">{team.coach}</div>
        </div>
        <div>
          <div className="label">Estrella</div>
          <div className="value">{team.stars[0]}</div>
        </div>
      </div>
      <div className="tc-matches">
        {matchdays.map(day => {
          const m = myMatches.find(mm => mm.day === day);
          if (!m) return <div key={day} className="tc-match" style={{opacity: 0.4}}><span className="m-day">J{day}</span></div>;
          const rival = m.teamA === team.id ? teamById(m.teamB) : teamById(m.teamA);
          const v = venueById(m.venue);
          return (
            <div className="tc-match" key={day}>
              <span className="m-day">J{day} · {fmtDate(m.date, {short:true})}</span>
              <span className="m-vs">
                <span className="vs-flag">vs</span>
                <span>{rival.flag} {rival.id}</span>
              </span>
              <span className="m-venue">{v.city}</span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// GroupView — current group page
// ═══════════════════════════════════════════════════════════════
function GroupView({ group, onOpenTeam }) {
  const teams = teamsForGroup(group);
  const matches = matchesForGroup(group);
  const dates = [...new Set(matches.map(m => m.date))].sort();
  const groupNames = {
    A: 'Grupo del anfitrión',
    B: 'Grupo del segundo anfitrión',
    C: 'Grupo de Brasil',
    D: 'Grupo del anfitrión USA',
    E: 'Grupo de Alemania',
    F: 'Grupo de los Países Bajos',
    G: 'Grupo de Bélgica',
    H: 'Grupo de España',
    I: 'Grupo de la muerte',
    J: 'Grupo de Argentina',
    K: 'Grupo de Portugal',
    L: 'Grupo de Inglaterra',
  };

  // Average rank for fun
  const avgRank = Math.round(teams.reduce((s,t) => s + t.rank, 0) / teams.length);
  const totalMundiales = teams.reduce((s,t) => s + t.mundiales, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-group-mark">
          <div>
            <div className="pg-eyebrow">Mundial 2026 · Grupo</div>
            <div className="pg-letter">{group}</div>
          </div>
          <div>
            <div className="pg-name">{groupNames[group]}</div>
            <div className="pg-eyebrow" style={{marginTop: 6}}>{teams.map(t => t.name).join(' · ')}</div>
          </div>
        </div>
        <div className="page-meta">
          <div>Pg. {D.groups.indexOf(group) + 1} / {D.groups.length}</div>
          <div>Rank medio: <strong>#{avgRank}</strong></div>
          <div>{totalMundiales} Mundiales acum.</div>
        </div>
      </div>

      <div className="team-grid">
        {teams.map(t => <TeamCard key={t.id} team={t} onOpen={onOpenTeam} />)}
      </div>

      <div className="group-recap">
        <span className="gr-label">★ Calendario del grupo</span>
        <span className="gr-dates">
          J1 {fmtDate(matches[0]?.date)} → J2 {fmtDate(matches[8]?.date || matches[matches.length-4]?.date)} → J3 {fmtDate(matches[matches.length-1]?.date)} · {matches.length} partidos
        </span>
        <div className="gr-actions">
          <button className="gr-btn" onClick={() => onOpenTeam('__matches_'+group)}>Ver todos</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SearchResults — when user is typing in the search box
// ═══════════════════════════════════════════════════════════════
function SearchResults({ query, onOpenTeam }) {
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    return D.teams.map(t => {
      let matchedField = null;
      let matchedValue = null;

      const nameLow = t.name.toLowerCase();
      if (nameLow.includes(q) || t.id.toLowerCase().includes(q)) {
        matchedField = 'país';
        matchedValue = t.name;
      } else if (t.coach.toLowerCase().includes(q)) {
        matchedField = 'entrenador';
        matchedValue = t.coach;
      } else {
        const player = t.stars.find(p => p.toLowerCase().includes(q));
        if (player) {
          matchedField = 'jugador';
          matchedValue = player;
        }
      }

      return matchedField ? { team: t, matchedField, matchedValue } : null;
    }).filter(Boolean);
  }, [query]);

  if (query.length < 2) {
    return (
      <div className="search-results-page">
        <div className="sr-empty">Escribe al menos 2 letras...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results-page">
        <div className="sr-summary">Buscando: <strong>"{query}"</strong></div>
        <div className="sr-empty">↓<br/>Sin resultados.<br/><small style={{fontFamily:'var(--font-mono)',fontSize:11,letterSpacing:'0.1em'}}>Prueba con un país, jugador o entrenador.</small></div>
      </div>
    );
  }

  const highlight = (text, q) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
  };

  return (
    <div className="search-results-page">
      <div className="sr-summary">
        <strong>{results.length}</strong> resultado{results.length === 1 ? '' : 's'} para "{query}"
      </div>
      <div className="sr-list">
        {results.map(({ team, matchedField, matchedValue }) => (
          <button key={team.id} className="sr-item" onClick={() => onOpenTeam(team.id)}>
            <div className="sri-flag">{team.flag}</div>
            <div>
              <div className="sri-name">{team.name}</div>
              <div className="sri-meta">{matchedField} · {highlight(matchedValue, query)}</div>
            </div>
            <div className="sri-rank">FIFA #{team.rank}</div>
            <div className="sri-group">{team.group}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Export to window so the rest of the components can find them
Object.assign(window, { TeamCard, GroupView, SearchResults, teamById, venueById, matchesForTeam, matchesForGroup, teamsForGroup, MATCH_OBJ, fmtDate, fmtDateLong });

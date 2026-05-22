/* Vistas adicionales: Modal de equipo, Bracket, Calendario, Comparador */
const { useState: useStateV, useMemo: useMemoV, useEffect: useEffectV } = React;
const DV = window.MUNDIAL_DATA;

// ═══════════════════════════════════════════════════════════════
// TeamModal
// ═══════════════════════════════════════════════════════════════
function TeamModal({ teamId, onClose, onCompare, onJumpToGroup }) {
  if (!teamId) return null;

  // Group matches summary (special teamId)
  if (teamId.startsWith('__matches_')) {
    const group = teamId.replace('__matches_','');
    return <GroupMatchesModal group={group} onClose={onClose} />;
  }

  const team = window.teamById(teamId);
  if (!team) return null;
  const matches = window.matchesForTeam(team.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} title="Cerrar">×</button>

        <div className="modal-hero">
          <div className="modal-flag">{team.flag}</div>
          <div className="modal-titles">
            <div className="eyebrow">Selección · Mundial 2026</div>
            <h2>{team.name}</h2>
            <div className="fact">{team.fact}</div>
          </div>
          <div className="modal-group-badge" style={{background: team.color}}>
            <span className="gb-label">Grupo</span>
            <span className="gb-letter">{team.group}</span>
          </div>
        </div>

        <div className="modal-stats">
          <div>
            <div className="sb-l">FIFA Rank</div>
            <div className="sb-v">#{team.rank}</div>
          </div>
          <div>
            <div className="sb-l">Mundiales</div>
            <div className="sb-v">{team.mundiales}</div>
          </div>
          <div>
            <div className="sb-l">Títulos</div>
            <div className="sb-v">{team.estrellas}★</div>
          </div>
          <div>
            <div className="sb-l">Debut</div>
            <div className="sb-v">{team.debut}</div>
          </div>
          <div>
            <div className="sb-l">Confederación</div>
            <div className="sb-v">{getConfederation(team.id)}</div>
          </div>
        </div>

        <div className="modal-cols">
          <div className="modal-block">
            <div className="mb-head"><span>★ Entrenador</span></div>
            <div className="mb-body">
              <div className="coach-card">
                <div className="c-name">{team.coach}</div>
                <div className="c-row">
                  <span className="c-label">Filosofía</span>
                  <span>{guessPhilosophy(team)}</span>
                </div>
                <div className="c-row">
                  <span className="c-label">Reto</span>
                  <span>Liderar a {team.name} en su {ordinal(team.mundiales+1)} Mundial</span>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-block">
            <div className="mb-head"><span>★ Plantilla clave</span><span className="mb-extra">{team.stars.length} jugadores destacados</span></div>
            <div className="mb-body">
              <ol className="players-list">
                {team.stars.map((p, i) => (
                  <li key={i} className={i === 0 ? 'star' : ''}>
                    <span className="p-num">{i === 0 ? '★' : String(i+1).padStart(2,'0')}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <PitchField team={team} />

        <div className="modal-block modal-matches">
          <div className="mb-head"><span>★ Calendario fase de grupos</span><span className="mb-extra">Hora España (CEST)</span></div>
          <table>
            <thead>
              <tr><th>Jornada</th><th>Partido</th><th>Fecha</th><th>Hora</th><th>Sede</th></tr>
            </thead>
            <tbody>
              {matches.map(m => {
                const rival = m.teamA === team.id ? window.teamById(m.teamB) : window.teamById(m.teamA);
                const v = window.venueById(m.venue);
                const home = m.teamA === team.id;
                return (
                  <tr key={m.id}>
                    <td className="mm-day">J{m.day}</td>
                    <td>
                      <div className="mm-vs">
                        <span>{home ? team.flag : rival.flag}</span>
                        <span style={{fontWeight: home ? 800 : 500}}>{home ? team.name : rival.name}</span>
                        <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'var(--dim)'}}>vs</span>
                        <span style={{fontWeight: !home ? 800 : 500}}>{home ? rival.name : team.name}</span>
                        <span>{home ? rival.flag : team.flag}</span>
                      </div>
                    </td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:11}}>{window.fmtDateLong(m.date)}</td>
                    <td style={{fontFamily:'var(--font-head)',fontSize:12,color:'var(--retro-orange)'}}>{m.time}</td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:11}}>{v.name}<br/><span style={{color:'var(--dim)'}}>{v.city}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button className="modal-action-btn primary" onClick={() => { onCompare(team.id); onClose(); }}>
            ⚖ Comparar con otro equipo
          </button>
          <button className="modal-action-btn" onClick={() => { onJumpToGroup(team.group); onClose(); }}>
            ↔ Ver Grupo {team.group} completo
          </button>
          <a className="modal-action-btn" href="Guia Mundial 2026.html" target="_blank" rel="noopener" style={{textDecoration:'none', display:'inline-block'}}>
            📖 Ficha completa (imprimible)
          </a>
        </div>
      </div>
    </div>
  );
}

function GroupMatchesModal({ group, onClose }) {
  const matches = window.matchesForGroup(group);
  const teams = window.teamsForGroup(group);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-hero">
          <div className="modal-flag" style={{fontSize: 56, fontFamily:'var(--font-var)', color:'var(--retro-orange)'}}>{group}</div>
          <div className="modal-titles">
            <div className="eyebrow">Mundial 2026 · Calendario completo</div>
            <h2>Grupo {group}</h2>
            <div className="fact">{teams.map(t => t.name).join(' · ')}</div>
          </div>
          <div className="modal-group-badge">
            <span className="gb-label">Partidos</span>
            <span className="gb-letter" style={{fontSize:32}}>{matches.length}</span>
          </div>
        </div>
        <div className="modal-block modal-matches">
          <div className="mb-head"><span>★ Los 6 partidos del Grupo {group}</span><span className="mb-extra">Hora España (CEST)</span></div>
          <table>
            <thead><tr><th>J</th><th>Partido</th><th>Fecha</th><th>Hora</th><th>Sede</th></tr></thead>
            <tbody>
              {matches.map(m => {
                const a = window.teamById(m.teamA);
                const b = window.teamById(m.teamB);
                const v = window.venueById(m.venue);
                return (
                  <tr key={m.id}>
                    <td className="mm-day">J{m.day}</td>
                    <td><div className="mm-vs"><span>{a.flag}</span><span>{a.name}</span><span style={{color:'var(--dim)',fontFamily:'var(--font-mono)'}}>vs</span><span>{b.name}</span><span>{b.flag}</span></div></td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:11}}>{window.fmtDateLong(m.date)}</td>
                    <td style={{fontFamily:'var(--font-head)',fontSize:12,color:'var(--retro-orange)'}}>{m.time}</td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:11}}>{v.name} · {v.city}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// helpers for modal
function getConfederation(id) {
  const conf = {
    MEX:'CONCACAF', USA:'CONCACAF', CAN:'CONCACAF', PAN:'CONCACAF', HAI:'CONCACAF', CUW:'CONCACAF',
    BRA:'CONMEBOL', ARG:'CONMEBOL', URU:'CONMEBOL', COL:'CONMEBOL', ECU:'CONMEBOL', PAR:'CONMEBOL',
    ESP:'UEFA', FRA:'UEFA', GER:'UEFA', POR:'UEFA', NED:'UEFA', BEL:'UEFA', ENG:'UEFA', CRO:'UEFA',
    SUI:'UEFA', AUT:'UEFA', NOR:'UEFA', CZE:'UEFA', BIH:'UEFA', SWE:'UEFA', TUR:'UEFA', SCO:'UEFA',
    JPN:'AFC', KOR:'AFC', AUS:'AFC', IRN:'AFC', KSA:'AFC', QAT:'AFC', IRQ:'AFC', UZB:'AFC', JOR:'AFC',
    MAR:'CAF', SEN:'CAF', EGY:'CAF', CIV:'CAF', GHA:'CAF', RSA:'CAF', TUN:'CAF', ALG:'CAF', CPV:'CAF', COD:'CAF',
    NZL:'OFC',
  };
  return conf[id] || '—';
}

function ordinal(n) {
  if (n === 1) return '1er';
  if (n === 2) return '2º';
  if (n === 3) return '3er';
  return `${n}º`;
}

function guessPhilosophy(team) {
  const id = team.id;
  if (['ESP','FRA','GER','BRA','ARG','POR','NED','ENG','ITA'].includes(id)) return 'Tiki-taka / posesión + pressing alto';
  if (['BEL','CRO','URU'].includes(id)) return 'Bloque alto + transiciones rápidas';
  if (['MAR','SEN','CIV','EGY','GHA','TUN','RSA','ALG','CPV','COD'].includes(id)) return 'Físico + transiciones';
  if (['JPN','KOR','UZB','JOR','IRN','IRQ','KSA','QAT','AUS'].includes(id)) return 'Disciplina táctica + contragolpe';
  if (['USA','MEX','CAN','PAN','HAI','CUW'].includes(id)) return 'Intensidad + presión';
  return 'Pragmatismo competitivo';
}

// ═══════════════════════════════════════════════════════════════
// BracketView — 32 → 16 → 8 → 4 → 2 → 1
// ═══════════════════════════════════════════════════════════════
function BracketView() {
  const rounds = [
    { title: '16avos', range: ['R32-01','R32-02','R32-03','R32-04','R32-05','R32-06','R32-07','R32-08','R32-09','R32-10','R32-11','R32-12','R32-13','R32-14','R32-15','R32-16'] },
    { title: 'Octavos', range: ['R16-01','R16-02','R16-03','R16-04','R16-05','R16-06','R16-07','R16-08'] },
    { title: 'Cuartos', range: ['QF-01','QF-02','QF-03','QF-04'] },
    { title: 'Semifinales', range: ['SF-01','SF-02'] },
    { title: '3er puesto', range: ['TP-01'] },
    { title: 'Final', range: ['FIN-01'] },
  ];

  return (
    <div className="bracket-page">
      <div className="page-header" style={{marginBottom: 16}}>
        <div className="page-group-mark">
          <div>
            <div className="pg-eyebrow">Mundial 2026 · Eliminatoria</div>
            <div className="pg-letter" style={{fontSize: 40, color:'var(--retro-orange)'}}>★</div>
          </div>
          <div>
            <div className="pg-name">Cruces · 32 → Final</div>
            <div className="pg-eyebrow" style={{marginTop: 6}}>Por primera vez: ronda de 16avos · 32 equipos cruzan</div>
          </div>
        </div>
        <div className="page-meta">
          <div>32 partidos eliminatoria</div>
          <div>11 sedes</div>
          <div>26/06 — 19/07</div>
        </div>
      </div>

      <div className="bracket-canvas">
        {rounds.map((r, i) => (
          <div key={r.title} className="bracket-col">
            <div className="bracket-col-head">{r.title}<br/><span style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--dim)',letterSpacing:'0.1em'}}>{r.range.length} {r.range.length === 1 ? 'partido' : 'partidos'}</span></div>
            {r.range.map(id => {
              const k = DV.knockout[id];
              const v = DV.venues[k.venue];
              return (
                <div key={id} className={`bracket-match ${r.title === 'Final' ? 'final' : ''}`}>
                  <div className="bm-id">{id} · {window.fmtDate(k.date,{short:true})} · {k.time}</div>
                  <div className="bm-slot">{k.slot[0]}</div>
                  <div className="bm-slot" style={{opacity:0.7}}>vs {k.slot[1]}</div>
                  <div className="bm-venue">{v ? v.city : k.venue}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="group-recap" style={{marginTop: 18}}>
        <span className="gr-label">★ Final</span>
        <span className="gr-dates">Domingo 19 de julio · MetLife Stadium · Nueva York / Nueva Jersey · 21:00 h España</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CalendarView — filterable schedule
// ═══════════════════════════════════════════════════════════════
function CalendarView({ onOpenTeam }) {
  const [filterPhase, setFilterPhase] = useStateV('grupos');
  const [filterVenue, setFilterVenue] = useStateV('todas');
  const [filterDay, setFilterDay] = useStateV('todos');

  // Build dataset
  const allMatches = useMemoV(() => {
    const group = window.MATCH_OBJ.map(m => ({...m, phase: 'grupos'}));
    const knockout = Object.entries(DV.knockout).map(([id, k]) => ({
      id, group: '—', teamA: null, teamB: null, day: '—', date: k.date, time: k.time,
      venue: k.venue, phase: 'eliminatoria',
      slot: k.slot, round: k.round,
    }));
    return [...group, ...knockout].sort((x,y) => x.date.localeCompare(y.date) || x.time.localeCompare(y.time));
  }, []);

  const filtered = useMemoV(() => allMatches.filter(m => {
    if (filterPhase !== 'todas' && m.phase !== filterPhase) return false;
    if (filterVenue !== 'todas' && m.venue !== filterVenue) return false;
    if (filterDay !== 'todos' && m.date !== filterDay) return false;
    return true;
  }), [allMatches, filterPhase, filterVenue, filterDay]);

  const byDay = useMemoV(() => {
    const map = {};
    filtered.forEach(m => {
      (map[m.date] ||= []).push(m);
    });
    return Object.entries(map).sort((a,b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const allDates = useMemoV(() => [...new Set(allMatches.map(m => m.date))].sort(), [allMatches]);
  const venueList = Object.keys(DV.venues);

  return (
    <div className="cal-page">
      <div className="page-header" style={{marginBottom: 16}}>
        <div className="page-group-mark">
          <div>
            <div className="pg-eyebrow">Mundial 2026 · Calendario</div>
            <div className="pg-letter" style={{fontSize: 40}}>☷</div>
          </div>
          <div>
            <div className="pg-name">104 partidos · 39 días</div>
            <div className="pg-eyebrow" style={{marginTop: 6}}>Hora España (CEST · UTC+2)</div>
          </div>
        </div>
        <div className="page-meta">
          <div>{filtered.length} partidos</div>
          <div>{byDay.length} día{byDay.length === 1 ? '' : 's'}</div>
        </div>
      </div>

      <div className="cal-filters">
        <div className="cal-filter-group">
          <span className="cal-filter-label">Fase</span>
          {['todas','grupos','eliminatoria'].map(f => (
            <button key={f} className={`cal-filter ${filterPhase === f ? 'active' : ''}`} onClick={() => setFilterPhase(f)}>{f}</button>
          ))}
        </div>
        <div className="cal-filter-group">
          <span className="cal-filter-label">Sede</span>
          <select className="cal-select" value={filterVenue} onChange={e => setFilterVenue(e.target.value)}>
            <option value="todas">Todas las sedes</option>
            {venueList.map(vid => <option key={vid} value={vid}>{DV.venues[vid].city}</option>)}
          </select>
        </div>
        <div className="cal-filter-group">
          <span className="cal-filter-label">Día</span>
          <select className="cal-select" value={filterDay} onChange={e => setFilterDay(e.target.value)}>
            <option value="todos">Todos los días</option>
            {allDates.map(d => <option key={d} value={d}>{window.fmtDateLong(d)}</option>)}
          </select>
        </div>
        {(filterPhase !== 'todas' || filterVenue !== 'todas' || filterDay !== 'todos') && (
          <button className="cal-filter" style={{background:'var(--retro-red)', color:'var(--paper)'}} onClick={() => { setFilterPhase('todas'); setFilterVenue('todas'); setFilterDay('todos'); }}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {byDay.length === 0 && <div className="sr-empty">Sin partidos con esos filtros.</div>}

      <div className="cal-days">
        {byDay.map(([date, ms]) => (
          <div key={date} className="cal-day">
            <div className="cal-day-head">
              <span>{window.fmtDateLong(date)}</span>
              <span className="cd-count">{ms.length} partido{ms.length === 1 ? '' : 's'}</span>
            </div>
            <div className="cal-matches-grid">
              {ms.map(m => {
                const v = DV.venues[m.venue];
                if (m.phase === 'eliminatoria') {
                  return (
                    <div className="cal-match" key={m.id}>
                      <div className="cm-time">{m.time}</div>
                      <div className="cm-pair">
                        <span style={{fontFamily:'var(--font-head)',color:'var(--retro-orange)'}}>{m.round}</span>
                        <span className="vs">·</span>
                        <span>{m.slot[0]} <span className="vs">vs</span> {m.slot[1]}</span>
                      </div>
                      <div className="cm-group" style={{textAlign:'center'}}>{m.id}</div>
                      <div></div>
                      <div className="cm-venue">{v.name}<br/><span style={{color:'var(--dim)'}}>{v.city}</span></div>
                    </div>
                  );
                }
                const a = window.teamById(m.teamA);
                const b = window.teamById(m.teamB);
                return (
                  <div className="cal-match" key={m.id}>
                    <div className="cm-time">{m.time}</div>
                    <div className="cm-pair" onClick={() => onOpenTeam(a.id)} style={{cursor:'pointer'}}>
                      <span className="cm-flag">{a.flag}</span>
                      <span>{a.name}</span>
                    </div>
                    <div className="cm-pair" onClick={() => onOpenTeam(b.id)} style={{cursor:'pointer'}}>
                      <span className="vs">vs</span>
                      <span className="cm-flag">{b.flag}</span>
                      <span>{b.name}</span>
                    </div>
                    <div className="cm-group">Grupo {m.group} · J{m.day}</div>
                    <div className="cm-venue">{v.name}<br/><span style={{color:'var(--dim)'}}>{v.city}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CompareView
// ═══════════════════════════════════════════════════════════════
function CompareView({ leftId, rightId, onSetLeft, onSetRight, onOpenTeam }) {
  const left = leftId ? window.teamById(leftId) : null;
  const right = rightId ? window.teamById(rightId) : null;

  const rows = [
    { label: 'FIFA Rank', key: 'rank', better: 'min', fmt: v => `#${v}` },
    { label: 'Mundiales', key: 'mundiales', better: 'max' },
    { label: 'Títulos mundiales', key: 'estrellas', better: 'max', fmt: v => `${v} ★` },
    { label: 'Debut Mundial', key: 'debut', better: 'min' },
    { label: 'Confederación', key: '__conf', better: 'eq' },
    { label: 'Seleccionador', key: 'coach', better: 'eq', text: true },
    { label: 'Estrella', key: '__star', better: 'eq', text: true },
    { label: 'Plantilla destacada', key: '__squad', better: 'max' },
  ];

  const getVal = (t, key) => {
    if (!t) return null;
    if (key === '__conf') return getConfederation(t.id);
    if (key === '__star') return t.stars[0];
    if (key === '__squad') return t.stars.length;
    return t[key];
  };

  return (
    <div className="compare-page">
      <div className="page-header" style={{marginBottom: 16}}>
        <div className="page-group-mark">
          <div>
            <div className="pg-eyebrow">Mundial 2026 · Comparador</div>
            <div className="pg-letter" style={{fontSize: 40}}>⚖</div>
          </div>
          <div>
            <div className="pg-name">Dos equipos · cara a cara</div>
            <div className="pg-eyebrow" style={{marginTop: 6}}>Elige dos selecciones para ver sus stats lado a lado</div>
          </div>
        </div>
        <div className="page-meta">
          <div>{left && right ? 'Comparando' : 'Selecciona equipos'}</div>
        </div>
      </div>

      <div className="compare-grid">
        <CompareSide team={left} otherTeam={right} onChange={onSetLeft} side="left" rows={rows} getVal={getVal} onOpen={onOpenTeam} />
        <div className="compare-vs">vs</div>
        <CompareSide team={right} otherTeam={left} onChange={onSetRight} side="right" rows={rows} getVal={getVal} onOpen={onOpenTeam} />
      </div>
    </div>
  );
}

function CompareSide({ team, otherTeam, onChange, side, rows, getVal, onOpen }) {
  if (!team) {
    return (
      <div className="compare-side">
        <div className="compare-picker">
          <div className="cp-msg">↓ Equipo {side === 'left' ? '1' : '2'}</div>
          <select className="cp-select" defaultValue="" onChange={e => e.target.value && onChange(e.target.value)}>
            <option value="">— Elige una selección —</option>
            {DV.groups.map(g => (
              <optgroup label={`Grupo ${g}`} key={g}>
                {window.teamsForGroup(g).map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-side">
      <div className="compare-team-head">
        <div style={{fontSize:48}}>{team.flag}</div>
        <div>
          <div className="ct-name">{team.name}</div>
          <div className="ct-group">Grupo {team.group} · FIFA #{team.rank}</div>
        </div>
        <button className="ct-change" onClick={() => onChange(null)}>cambiar</button>
      </div>
      <div className="compare-rows">
        {rows.map(r => {
          const myVal = getVal(team, r.key);
          const otherVal = otherTeam ? getVal(otherTeam, r.key) : null;
          const display = r.fmt ? r.fmt(myVal) : myVal;
          let isWinner = false;
          if (otherVal != null && r.better === 'min' && typeof myVal === 'number' && myVal < otherVal) isWinner = true;
          if (otherVal != null && r.better === 'max' && typeof myVal === 'number' && myVal > otherVal) isWinner = true;
          return (
            <div key={r.key}>
              <span className="cr-label">{r.label}</span>
              <span className={`cr-val ${isWinner ? 'win' : ''} ${r.text ? 'text' : ''}`}>{display}</span>
            </div>
          );
        })}
      </div>
      <div style={{padding:'10px 14px', borderTop:'2px dashed var(--ink)'}}>
        <button className="modal-action-btn primary" style={{width:'100%'}} onClick={() => onOpen(team.id)}>Ver ficha completa</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PitchField — campo de fútbol con XI tipo
// ═══════════════════════════════════════════════════════════════
function PitchField({ team }) {
  const lineup = window.LINEUPS?.[team.id];
  if (!lineup) return null;
  const positions = window.FORMATIONS[lineup.f] || window.FORMATIONS['4-3-3'];

  return (
    <div className="pitch-block">
      <div className="pb-head">
        <span>★ Alineación ideal · XI Tipo</span>
        <span className="pb-formation">{lineup.f.split('-').join(' — ')}</span>
      </div>
      <div className="pitch-wrap">
        <svg className="pitch-svg" viewBox="0 0 100 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          {/* Perimeter */}
          <rect x="3" y="3" width="94" height="144" className="line-bold" />
          {/* Halfway */}
          <line x1="3" y1="75" x2="97" y2="75" className="line" />
          <circle cx="50" cy="75" r="11" className="line" />
          <circle cx="50" cy="75" r="0.9" className="spot" />
          {/* Top (attack) box */}
          <rect x="20" y="3" width="60" height="16" className="line" />
          <rect x="36" y="3" width="28" height="6" className="line" />
          <circle cx="50" cy="12" r="0.9" className="spot" />
          <path d="M 39 19 A 11 11 0 0 0 61 19" className="line" />
          {/* Bottom (defense) box */}
          <rect x="20" y="131" width="60" height="16" className="line" />
          <rect x="36" y="141" width="28" height="6" className="line" />
          <circle cx="50" cy="138" r="0.9" className="spot" />
          <path d="M 39 131 A 11 11 0 0 1 61 131" className="line" />
          {/* Corner arcs */}
          <path d="M 5 3 A 2 2 0 0 1 3 5" className="line" />
          <path d="M 97 5 A 2 2 0 0 1 95 3" className="line" />
          <path d="M 3 145 A 2 2 0 0 1 5 147" className="line" />
          <path d="M 95 147 A 2 2 0 0 1 97 145" className="line" />
        </svg>

        {lineup.xi.map((surname, i) => {
          const [x, y] = positions[i] || [50, 75];
          const isGK = i === 0;
          return (
            <div
              key={i}
              className={`player-card ${isGK ? 'gk' : ''}`}
              style={{
                left: `${x}%`,
                top: `${(y / 150) * 100}%`,
                '--player-bg': team.color,
              }}
            >
              <div className="player-photo">
                <span className="pc-flag">{team.flag}</span>
              </div>
              <div className="player-name" title={surname}>{surname}</div>
            </div>
          );
        })}
      </div>
      <div className="pitch-bench">
        <span className="pb-label">★ Banquillo destacado</span>
        <span className="pb-list">
          {lineup.bench.map((n, i) => (
            <span key={i} className="b-item">
              <span className="num">{String(12 + i).padStart(2, '0')}</span>
              <span>{n}</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

Object.assign(window, { TeamModal, BracketView, CalendarView, CompareView, getConfederation, PitchField });

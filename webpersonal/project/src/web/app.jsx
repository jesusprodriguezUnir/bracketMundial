/* App principal — root component */
const { useState: useS, useEffect: useE, useCallback: useCB, useMemo: useM, useRef: useR } = React;

const DA = window.MUNDIAL_DATA;

const NOTEBOOK_STYLES = ['espiral','archivador','libro'];

function App() {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "notebookStyle": "espiral",
    "showFootnote": true
  }/*EDITMODE-END*/);

  const [currentGroup, setCurrentGroup] = useS('A');
  const [currentView, setCurrentView] = useS('groups'); // 'groups' | 'bracket' | 'calendar' | 'compare'
  const [searchQuery, setSearchQuery] = useS('');
  const [selectedTeam, setSelectedTeam] = useS(null);
  const [compareLeft, setCompareLeft] = useS(null);
  const [compareRight, setCompareRight] = useS(null);
  const searchRef = useR(null);

  const isSearching = searchQuery.trim().length >= 2;

  // Keyboard shortcuts
  useE(() => {
    const onKey = (e) => {
      // "/" focuses search
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === 'Escape') {
        if (selectedTeam) { setSelectedTeam(null); return; }
        if (searchQuery) { setSearchQuery(''); searchRef.current?.blur(); return; }
      }
      // Arrow keys cycle groups
      if (currentView === 'groups' && !isSearching && document.activeElement.tagName !== 'INPUT' && !selectedTeam) {
        const idx = DA.groups.indexOf(currentGroup);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setCurrentGroup(DA.groups[(idx + 1) % DA.groups.length]);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setCurrentGroup(DA.groups[(idx - 1 + DA.groups.length) % DA.groups.length]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentGroup, currentView, isSearching, selectedTeam, searchQuery]);

  // Open a team modal
  const handleOpenTeam = useCB((teamId) => {
    if (teamId == null) return;
    setSelectedTeam(teamId);
  }, []);

  // Trigger comparator
  const handleCompare = useCB((teamId) => {
    setCurrentView('compare');
    if (!compareLeft) setCompareLeft(teamId);
    else if (!compareRight) setCompareRight(teamId);
    else setCompareLeft(teamId);
  }, [compareLeft, compareRight]);

  const handleJumpToGroup = useCB((g) => {
    setCurrentView('groups');
    setSearchQuery('');
    setCurrentGroup(g);
  }, []);

  return (
    <div className="app">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchRef={searchRef}
      />

      <div className="notebook" data-style={tweaks.notebookStyle || 'espiral'}>
        <NotebookSpine
          style={tweaks.notebookStyle || 'espiral'}
          currentGroup={currentGroup}
          setCurrentGroup={(g) => { setSearchQuery(''); setCurrentView('groups'); setCurrentGroup(g); }}
        />

        <div className="notebook-page" key={currentView + currentGroup + (isSearching ? 'S' : '')}>
          {isSearching ? (
            <SearchResults query={searchQuery} onOpenTeam={handleOpenTeam} />
          ) : currentView === 'groups' ? (
            <GroupView group={currentGroup} onOpenTeam={handleOpenTeam} />
          ) : currentView === 'bracket' ? (
            <BracketView />
          ) : currentView === 'calendar' ? (
            <CalendarView onOpenTeam={handleOpenTeam} />
          ) : currentView === 'compare' ? (
            <CompareView
              leftId={compareLeft}
              rightId={compareRight}
              onSetLeft={setCompareLeft}
              onSetRight={setCompareRight}
              onOpenTeam={handleOpenTeam}
            />
          ) : null}
        </div>
      </div>

      {tweaks.showFootnote && (
        <div className="app-footer">
          <div>
            ★ Guía Mundial 2026 · jesusrodriguez.dev · datos a 22 may. 2026
          </div>
          <div className="legend">
            <span><kbd>/</kbd> buscar</span>
            <span><kbd>←</kbd><kbd>→</kbd> cambiar grupo</span>
            <span><kbd>Esc</kbd> cerrar</span>
            <span>·</span>
            <span><a href="Guia Mundial 2026.html" target="_blank">📖 versión imprimible completa →</a></span>
            <span>·</span>
            <span><button onClick={() => window.print()} style={{background:'transparent',border:'none',color:'inherit',font:'inherit',cursor:'pointer',textTransform:'inherit',letterSpacing:'inherit'}}>🖨 imprimir esta vista</button></span>
          </div>
        </div>
      )}

      <TeamModal
        teamId={selectedTeam}
        onClose={() => setSelectedTeam(null)}
        onCompare={(id) => { handleCompare(id); }}
        onJumpToGroup={handleJumpToGroup}
      />

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks · Guía Web">
        <TweakSection label="Estilo cuaderno">
          <TweakRadio
            label="Variante"
            value={tweaks.notebookStyle}
            options={[
              { value: 'espiral', label: 'Espiral' },
              { value: 'archivador', label: 'Archivador' },
              { value: 'libro', label: 'Libro' },
            ]}
            onChange={(v) => setTweak('notebookStyle', v)}
          />
          <p style={{fontFamily:'var(--font-mono,monospace)', fontSize:10, color:'#7a6f54', letterSpacing:'0.05em', marginTop:8, lineHeight:1.45, padding:'0 12px'}}>
            <strong>Espiral</strong>: pestañas verticales con anillas, estilo agenda.<br/>
            <strong>Archivador</strong>: solapas tipo carpeta de archivo arriba.<br/>
            <strong>Libro</strong>: lengüetas al borde derecho de la página.
          </p>
        </TweakSection>
        <TweakSection label="Pie de página">
          <TweakToggle
            label="Mostrar atajos + enlaces"
            value={tweaks.showFootnote}
            onChange={(v) => setTweak('showFootnote', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════════════════════
function Header({ searchQuery, setSearchQuery, currentView, setCurrentView, searchRef }) {
  return (
    <div className="app-header">
      <div className="brand">
        <div className="brand-eyebrow">★ FIFA World Cup · 2026 · Estados Unidos · México · Canadá</div>
        <h1 className="brand-title">
          GUÍA <span className="accent">MUNDIAL</span><br/>
          2026 · WEB
        </h1>
        <div className="brand-sub">48 selecciones · 12 grupos · 104 partidos · 16 sedes</div>
      </div>

      <div className="search">
        <span className="search-icon">🔍</span>
        <input
          ref={searchRef}
          className="search-input"
          placeholder="Busca por país, jugador o entrenador..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery ? (
          <button className="search-clear" onClick={() => setSearchQuery('')}>×</button>
        ) : (
          <span className="search-shortcut">/</span>
        )}
      </div>

      <nav className="main-nav">
        <button className={`main-nav-btn ${currentView === 'groups' && !searchQuery ? 'active' : ''}`} onClick={() => { setCurrentView('groups'); setSearchQuery(''); }}>
          <span className="ic">📓</span>Grupos
        </button>
        <button className={`main-nav-btn ${currentView === 'bracket' ? 'active' : ''}`} onClick={() => { setCurrentView('bracket'); setSearchQuery(''); }}>
          <span className="ic">⚡</span>Bracket
        </button>
        <button className={`main-nav-btn ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => { setCurrentView('calendar'); setSearchQuery(''); }}>
          <span className="ic">🗓</span>Calendario
        </button>
        <button className={`main-nav-btn ${currentView === 'compare' ? 'active' : ''}`} onClick={() => { setCurrentView('compare'); setSearchQuery(''); }}>
          <span className="ic">⚖</span>Comparar
        </button>
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NotebookSpine — the side/top tabs
// ═══════════════════════════════════════════════════════════════
function NotebookSpine({ style, currentGroup, setCurrentGroup }) {
  return (
    <div className="spine">
      {style === 'espiral' && (
        <div className="spine-rings">
          {Array.from({length: 13}).map((_, i) => <div key={i} className="spine-ring" />)}
        </div>
      )}
      {DA.groups.map(g => {
        const teams = window.teamsForGroup(g);
        const head = teams[0];
        return (
          <button
            key={g}
            className={`group-tab ${g === currentGroup ? 'active' : ''}`}
            onClick={() => setCurrentGroup(g)}
            style={{'--tab-color': head?.color}}
          >
            <span className="gt-letter">{g}</span>
            <span>
              <span className="gt-label">Grupo</span>
              <span className="gt-teams">{teams.map(t => t.id).join(' · ')}</span>
              <span className="gt-color-strip" style={{background: head?.color}}></span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type GroupMatchResult, type ViewMode } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { renderFlag } from '../lib/render-flag';
import { TEAMS_2026 } from '../data/fifa-2026';
import { COMPETITION } from '../data/competition';
import { formatShortDate, isMatchPending } from '../lib/date-utils';
import { isMatchLive } from '../lib/match-window';
import { openMatchModal } from '../lib/match-modal-service';
import { showToast } from '../lib/interaction';
import { t, useLocaleStore } from '../i18n';
import './score-stepper';

function teamById(id: string) {
  return TEAMS_2026.find(x => x.id === id);
}

function currentMatchday(matches: GroupMatchResult[]): number {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = matches.find(m => (m.date ?? '') >= today);
  return upcoming?.matchDay ?? 1;
}

@customElement('matchday-view')
export class MatchdayView extends LitElement {
  @state() private _matches: GroupMatchResult[] = [];
  @state() private _matchday = 1;
  @state() private _flash: string | null = null;
  @state() private _viewMode: ViewMode = 'predictions';
  private _unsub?: () => void;
  private _unsubLocale?: () => void;

  static readonly styles = css`
    :host { display: block; }
    .toolbar-wrap {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 16px;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    @media (max-width: 768px) {
      .toolbar {
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .toolbar::-webkit-scrollbar { display: none; }
      .md-btn { flex-shrink: 0; }
    }
    .md-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 8px 12px;
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      background: var(--fill);
      color: var(--ink-muted);
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s, border-color 0.12s, color 0.12s;
    }
    .md-btn:hover { color: var(--ink); border-color: var(--accent); }
    .md-btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--on-accent);
      font-weight: 700;
      box-shadow: var(--glow-accent-sm);
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .action-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 7px 11px;
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      background: var(--fill);
      color: var(--ink-soft);
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s, border-color 0.12s;
    }
    .action-btn:hover { background: var(--fill-soft); border-color: var(--accent); }
    .action-btn.primary-action {
      background: var(--accent);
      color: var(--on-accent);
      border-color: var(--accent);
      box-shadow: var(--glow-accent-sm);
    }
    .action-btn.primary-action:hover {
      filter: brightness(1.08);
      border-color: var(--accent);
    }
    .action-btn.clear { color: var(--retro-red); }
    .progress-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink-muted);
      padding: 5px 9px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-pill);
      background: var(--fill);
    }
    .lock {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink-soft);
      padding: 10px 12px;
      margin-bottom: 14px;
      border: 1px dashed var(--hairline-strong);
      border-radius: var(--radius-md);
      background: var(--fill);
    }
    .list { display: grid; gap: 10px; }
    .row {
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      background: var(--card-grad);
      padding: 11px 13px;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: border-color 0.12s, transform 0.06s;
    }
    .row:hover { border-color: var(--hairline-strong); }
    .row.flash { outline: 2px solid var(--accent); outline-offset: 1px; }
    .teams {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 8px;
    }
    .side { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .side.away { justify-content: flex-end; }
    .side img { width: 24px; height: 24px; object-fit: contain; }
    .name { font-family: var(--font-body); font-weight: 800; font-size: 13px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .score { font-family: var(--font-var); font-weight: 800; font-size: 20px; letter-spacing: 0.04em; color: var(--ink); }
    .meta {
      margin-top: 6px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--ink-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .meta-details { display: flex; gap: 8px; align-items: center; }
    .meta-hint { font-size: 9px; color: var(--ink-muted); opacity: 0.8; }
    .live-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: var(--retro-red);
      border: 1px solid var(--retro-red);
      border-radius: var(--radius-pill);
      padding: 2px 6px;
    }
    @media (max-width: 768px) {
      .toolbar-actions { width: 100%; flex-wrap: wrap; }
      .action-btn { font-size: 9px; padding: 7px 9px; }
    }
    .inline-score-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }
    .inline-dash { font-family: var(--font-var); }
  `;

  connectedCallback() {
    super.connectedCallback();
    const read = () => {
      const st = useTournamentStore.getState();
      this._matches = st.groupMatches;
      this._viewMode = st.viewMode;
      if (!this._matchday) this._matchday = currentMatchday(st.groupMatches);
    };
    const s = useTournamentStore.getState();
    this._matches = s.groupMatches;
    this._viewMode = s.viewMode;
    this._matchday = currentMatchday(s.groupMatches);
    this._unsub = subscribeSlice(
      useTournamentStore,
      st => `${st.viewMode}|${st.groupMatches.map(m => `${m.matchId}:${m.scoreA}-${m.scoreB}`).join(',')}`,
      () => read(),
    );
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this._unsub?.();
    this._unsubLocale?.();
    super.disconnectedCallback();
  }

  private _bump(m: GroupMatchResult, side: 'A' | 'B', delta: number, e: Event) {
    e.stopPropagation();
    const store = useTournamentStore.getState();
    if (!store.isMatchEditable(m.matchId)) return;
    const a = side === 'A' ? Math.max(0, (m.scoreA ?? 0) + delta) : (m.scoreA ?? 0);
    const b = side === 'B' ? Math.max(0, (m.scoreB ?? 0) + delta) : (m.scoreB ?? 0);
    store.setGroupMatchResult(m.matchId, a, b);
    this._flash = m.matchId;
    setTimeout(() => { if (this._flash === m.matchId) this._flash = null; }, 500);
  }

  private _simulateCurrentMatchday() {
    const store = useTournamentStore.getState();
    store.autoSimulateMatchday(this._matchday);
    const locale = useLocaleStore.getState().locale;
    showToast(locale === 'es' ? `Jornada ${this._matchday} simulada con cuotas 🎲` : `Matchday ${this._matchday} simulated with odds 🎲`);
  }

  private _simulateAllMatchdays() {
    useTournamentStore.getState().autoSimulateGroups();
    const locale = useLocaleStore.getState().locale;
    showToast(locale === 'es' ? 'Todas las jornadas simuladas con éxito 🎲' : 'All matchdays simulated successfully 🎲');
  }

  private _clearCurrentMatchday() {
    const store = useTournamentStore.getState();
    const rows = this._matches.filter(m => m.matchDay === this._matchday && store.isMatchEditable(m.matchId));
    for (const m of rows) {
      store.setGroupMatchResult(m.matchId, null, null);
    }
    const locale = useLocaleStore.getState().locale;
    showToast(locale === 'es' ? `Jornada ${this._matchday} reiniciada ↺` : `Matchday ${this._matchday} reset ↺`);
  }

  private _openModal(m: GroupMatchResult) {
    openMatchModal({
      matchId: m.matchId,
      teamA: m.teamA,
      teamB: m.teamB,
      initialScoreA: m.scoreA,
      initialScoreB: m.scoreB,
      phase: 'group',
      goalScorers: m.goalScorers,
      date: m.date,
      venue: m.venue ?? '',
      timeSpain: m.timeSpain ?? '',
      hideFooter: false,
      onSave: ({ scoreA, scoreB }) => {
        useTournamentStore.getState().setGroupMatchResult(m.matchId, scoreA, scoreB);
      },
    });
  }

  render() {
    const store = useTournamentStore.getState();
    const open = COMPETITION.predictionsOpen;
    const locale = useLocaleStore.getState().locale;
    const rows = this._matches
      .filter(m => m.matchDay === this._matchday)
      .sort((a, b) => `${a.date}${a.timeSpain}`.localeCompare(`${b.date}${b.timeSpain}`));

    const totalCount = rows.length;
    const filledCount = rows.filter(m => m.scoreA !== null && m.scoreB !== null).length;

    return html`
      ${open ? '' : html`<div class="lock">${t('matchday.locked')}</div>`}
      <div class="toolbar-wrap">
        <div class="toolbar">
          ${Array.from({ length: COMPETITION.matchdays }, (_, i) => i + 1).map(d => html`
            <button class="md-btn ${this._matchday === d ? 'active' : ''}" @click=${() => { this._matchday = d; }}>
              ${t('matchday.short', { n: String(d) })}
            </button>
          `)}
        </div>
        <div class="toolbar-actions">
          <span class="progress-pill">${filledCount}/${totalCount}</span>
          ${open && this._viewMode !== 'real' ? html`
            <button class="action-btn" @click=${this._simulateCurrentMatchday}>
              🎲 ${locale === 'es' ? `Simular J${this._matchday}` : `Simulate MD${this._matchday}`}
            </button>
            <button class="action-btn primary-action" @click=${this._simulateAllMatchdays}>
              ⚡ ${locale === 'es' ? 'Simular todas' : 'Simulate all'}
            </button>
            <button class="action-btn clear" @click=${this._clearCurrentMatchday}>
              ↺ ${locale === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          ` : ''}
        </div>
      </div>
      <div class="list">
        ${rows.map(m => {
          const tA = teamById(m.teamA);
          const tB = teamById(m.teamB);
          const pending = isMatchPending(m.date ?? '', m.timeSpain ?? '');
          const live = isMatchLive(m.date ?? '', m.timeSpain ?? '');
          const editable = open && this._viewMode !== 'real' && store.isMatchEditable(m.matchId) && pending;
          const played = m.scoreA !== null && m.scoreB !== null;
          return html`
            <div
              class="row ${this._flash === m.matchId ? 'flash' : ''}"
              @click=${() => this._openModal(m)}>
              <div class="teams">
                <div class="side">
                  ${renderFlag(tA, { size: 'md' })}
                  <span class="name">${tA?.name ?? m.teamA}</span>
                </div>
                <div class="score">${played ? `${m.scoreA}–${m.scoreB}` : '–'}</div>
                <div class="side away">
                  <span class="name">${tB?.name ?? m.teamB}</span>
                  ${renderFlag(tB, { size: 'md' })}
                </div>
              </div>
              ${editable ? html`
                <div class="inline-score-row">
                  <score-stepper
                    .value=${m.scoreA ?? 0}
                    decrementLabel=${t('groups.decScore')}
                    incrementLabel=${t('groups.incScore')}
                    variant="inline"
                    @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this._bump(m, 'A', e.detail.delta, e)}></score-stepper>
                  <span class="inline-dash">−</span>
                  <score-stepper
                    .value=${m.scoreB ?? 0}
                    decrementLabel=${t('groups.decScore')}
                    incrementLabel=${t('groups.incScore')}
                    variant="inline"
                    @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this._bump(m, 'B', e.detail.delta, e)}></score-stepper>
                </div>
              ` : ''}
              <div class="meta">
                <div class="meta-details">
                  <span>${m.date ? formatShortDate(m.date) : ''}</span>
                  ${m.timeSpain ? html`<span>${m.timeSpain}</span>` : ''}
                  ${live ? html`<span class="live-badge">${t('matchday.live')}</span>` : ''}
                  ${m.venue ? html`<span>${m.venue}</span>` : ''}
                </div>
                <span class="meta-hint">${locale === 'es' ? 'Detalle ▶' : 'Detail ▶'}</span>
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'matchday-view': MatchdayView;
  }
}

import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getAllOdds, type MatchOdds } from '../lib/odds-service';
import { useTournamentStore, type GroupMatchResult } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { renderFlag } from '../lib/render-flag';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import { formatShortDate, isMatchPending } from '../lib/date-utils';
import { t, useLocaleStore } from '../i18n';
import './score-stepper';
import './odds-bar';
import './groups-bracket-view';

function formatDate(iso?: string): string {
  return iso ? formatShortDate(iso) : '';
}

// Colores de cabecera de grupo — rotan entre los 4 retro
const GROUP_COLORS = [
  'var(--retro-orange)',
  'var(--retro-blue)',
  'var(--retro-green)',
  'var(--retro-red)',
];

const GROUPS = 'ABCDEFGHIJKL'.split('');

@customElement('groups-view')
export class GroupsView extends LitElement {
  private unsubscribeStore?: () => void;
  private _oddsLoaded = false;

  @state() private _odds: Record<string, MatchOdds> = {};
  @state() private _activeGroup = 'A';
  @state() private _bracketMode = false;
  @state() private _flashMatchId: string | null = null;

  static readonly styles = css`
    :host { display: block; }

    /* Acciones de grupo */
    .group-actions {
      display: flex;
      gap: 10px;
      padding: 0 0 22px;
      margin-bottom: 22px;
      border-bottom: 3px dashed var(--ink);
      flex-wrap: wrap;
    }

    .go-knockout-btn {
      margin-left: auto;
    }
    .go-knockout-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: var(--shadow-hard-sm);
    }
    .go-knockout-count {
      font-family: var(--font-mono);
      font-size: 0.7em;
      opacity: 0.85;
      margin-left: 6px;
    }

    /* ──────── Cuaderno modo archivador ──────── */
    .notebook {
      position: relative;
      background: var(--paper);
      background-image: var(--paper-texture);
      background-size: var(--paper-texture-size, 5px 5px);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      display: grid;
      grid-template-rows: auto 1fr;
      overflow: hidden;
    }

    /* Barra de solapas tipo carpeta de archivo */
    .archive-tabs {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      padding: 10px 14px 0;
      border-bottom: 3px solid var(--ink);
      background-image: var(--halftone-soft);
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .archive-tabs::-webkit-scrollbar { display: none; }

    .archive-tab {
      all: unset;
      box-sizing: border-box;
      cursor: pointer;
      flex: 1 1 auto;
      min-width: 64px;
      padding: 9px 6px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      text-align: center;
      background: var(--paper-2);
      border: 2px solid var(--ink);
      border-bottom: none;
      border-top-left-radius: 11px;
      border-top-right-radius: 11px;
      position: relative;
      transition: transform 0.12s ease, background 0.12s ease;
      touch-action: manipulation;
    }
    .archive-tab + .archive-tab { margin-left: -2px; }
    @media (hover: hover) {
      .archive-tab:hover { transform: translateY(-2px); }
    }
    .archive-tab.active {
      background: var(--paper);
      transform: translateY(3px);
      z-index: 2;
    }
    /* La solapa activa tapa el borde inferior del cuaderno */
    .archive-tab.active::after {
      content: "";
      position: absolute;
      left: -2px;
      right: -2px;
      bottom: -3px;
      height: 3px;
      background: var(--paper);
    }
    .archive-tab .at-letter {
      font-family: var(--font-var);
      font-size: 18px;
      line-height: 1;
      color: var(--ink);
    }
    .archive-tab.active .at-letter { color: var(--retro-orange); }
    .archive-tab .at-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.14em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .archive-tab .at-strip {
      width: 22px;
      height: 4px;
      border: 1px solid var(--ink);
    }

    /* Página del cuaderno */
    .notebook-page {
      padding: 18px 18px 20px;
    }
    /* La tarjeta de grupo ya vive dentro del cuaderno: sin sombra flotante */
    .notebook-page .group-card {
      box-shadow: var(--shadow-hard-sm);
      display: grid;
      grid-template-columns: 280px 1fr;
    }
    .notebook-page .group-card .group-header {
      grid-column: 1 / -1;
    }
    .notebook-page .group-card .standings {
      grid-column: 1;
      padding: 12px;
    }
    .notebook-page .group-card .matches-list {
      grid-column: 2;
      border-top: none;
      border-left: 3px solid var(--ink);
      padding: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      align-content: start;
    }
    .notebook-page .group-card .matches-list .match-item {
      margin-bottom: 0;
    }
    .notebook-page .groups-grid {
      grid-template-columns: 1fr;
    }

    /* Cabecera de la ficha del grupo */
    .folder-head {
      display: flex;
      align-items: center;
      gap: 14px;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 3px solid var(--ink);
    }
    .folder-letter {
      font-family: var(--font-var);
      font-size: 34px;
      line-height: 1;
      color: var(--paper);
      background-image: var(--halftone);
      border: 3px solid var(--ink);
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .folder-titles { flex: 1; min-width: 0; }
    .folder-eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.16em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .folder-title {
      font-family: var(--font-var);
      font-size: 24px;
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--ink);
    }
    .folder-teams {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      color: var(--dim);
      text-transform: uppercase;
      margin-top: 2px;
    }
    .folder-nav {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .folder-nav button {
      all: unset;
      cursor: pointer;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--paper);
      background: var(--ink);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      touch-action: manipulation;
    }
    .folder-nav button:hover { background: var(--retro-orange); }
    .folder-nav button:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }

    /* Grid de grupos */
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    /* Card Panini sticker */
    .group-card {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Cabecera con color + halftone */
    .group-header {
      padding: 8px 12px;
      border-bottom: 3px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* color e imagen vienen como style inline */
      color: var(--paper);
      background-image: var(--halftone);
    }
    .group-header-title {
      font-family: var(--font-var);
      font-size: 20px;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .group-header-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--paper);
      color: var(--ink);
      padding: 2px 6px;
      letter-spacing: 0.1em;
    }

    /* Tabla de clasificación */
    .standings {
      padding: 8px 10px;
    }
    .standing-row {
      display: grid;
      grid-template-columns: 20px 1fr auto auto;
      gap: 8px;
      align-items: center;
      padding: 4px 0;
    }
    .standing-row + .standing-row {
      border-top: 1px dotted rgba(26,25,51,0.2);
    }
    .standing-row.muted {
      opacity: 0.6;
    }

    .rank-badge {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--dim);
    }
    .rank-badge.qualify {
      border: 2px solid var(--retro-red);
      color: var(--retro-red);
      font-size: 11px;
    }

    .team-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 15px; flex-shrink: 0; }
    .flag-img {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .team-short {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pos-badge {
      font-family: var(--font-mono);
      font-size: 8px;
      background: var(--retro-yellow);
      color: var(--ink);
      padding: 1px 4px;
      border: 1px solid var(--ink);
      letter-spacing: 0.1em;
      margin-left: auto;
      flex-shrink: 0;
    }

    .wdl {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .pts {
      font-family: var(--font-var);
      font-size: 18px;
      line-height: 1;
      color: var(--ink);
      min-width: 18px;
      text-align: right;
    }
    .pts.muted { color: var(--dim); }

    /* Lista de partidos */
    .matches-list {
      padding: 8px;
      background: rgba(26,25,51,0.04);
      border-top: 2px solid var(--ink);
    }

    .match-item {
      padding: 6px 8px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      cursor: pointer;
      background: var(--paper-3);
      margin-bottom: 6px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .match-item:last-child { margin-bottom: 0; }
    @media (hover: hover) {
      .match-item:hover {
        transform: translate(-1px, -1px);
        box-shadow: 3px 3px 0 0 var(--ink);
      }
    }
    .match-item:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }

    .match-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .match-teams {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      flex: 1;
      overflow: hidden;
    }
    .match-teams .vs {
      color: var(--dim);
      font-weight: 400;
    }
    .match-score {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--paper);
      background: var(--retro-blue);
      border: 2px solid var(--ink);
      padding: 2px 8px;
      min-width: 44px;
      text-align: center;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .match-score.pending {
      background: var(--paper-2);
      color: var(--dim);
      font-size: 11px;
    }

    /* Marcador XL para partidos ya jugados */
    .score-xl {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: var(--retro-yellow);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 8px 12px;
    }
    .score-xl .sx-side {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      font-family: var(--font-head);
      font-size: 14px;
      color: var(--ink);
    }
    .score-xl .sx-side.lose,
    .score-xl .sx-num.lose {
      opacity: 0.5;
    }
    .score-xl .sx-score {
      display: flex;
      align-items: baseline;
      gap: 8px;
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1;
      color: var(--ink);
      flex-shrink: 0;
    }
    .score-xl .sx-dash {
      font-size: 18px;
    }

    .match-meta {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
      letter-spacing: 0.05em;
    }
    .badge {
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 1px 5px;
      border: 1px solid var(--ink);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .badge-played {
      background: var(--retro-yellow);
      color: var(--ink);
    }
    .badge-upcoming {
      background: var(--paper-2);
      color: var(--dim);
    }
    .mode-badge {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      padding: 1px 4px;
      border: 1px solid var(--ink);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-left: 4px;
    }
    .mode-badge.real {
      background: var(--retro-green);
      color: var(--paper);
    }
    .mode-badge.prediction {
      background: var(--retro-blue);
      color: var(--paper);
    }

    /* Tabla de mejores terceros */
    .thirds-section {
      margin-top: 24px;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow: hidden;
    }
    .thirds-header {
      background: var(--retro-red);
      background-image: var(--halftone);
      color: var(--paper);
      padding: 8px 14px;
      border-bottom: 3px solid var(--ink);
      font-family: var(--font-var);
      font-size: 18px;
      letter-spacing: 0.02em;
    }
    .thirds-tables-container {
      display: flex;
      gap: 0;
    }
    .thirds-tables-container > table {
      flex: 1;
      width: 100%;
    }
    .thirds-tables-container > table:first-child:not(:last-child) {
      border-right: 2px solid var(--ink);
    }
    .thirds-table {
      border-collapse: collapse;
      font-size: 12px;
    }
    .thirds-table th {
      text-align: left;
      padding: 5px 10px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border-bottom: 2px solid var(--ink);
      background: var(--paper);
    }
    .thirds-table td {
      padding: 5px 10px;
      border-bottom: 1px dotted rgba(26,25,51,0.2);
    }
    .thirds-table tr:last-child td { border-bottom: none; }
    .col-rank {
      width: 28px;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--retro-red);
      text-align: center;
    }
    .col-pts-val {
      font-family: var(--font-var);
      font-size: 16px;
      width: 30px;
      text-align: center;
    }
    .col-stat {
      width: 28px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
    }
    .qualify-check { color: var(--retro-green); font-weight: 700; }

    /* Editor de marcador inline */
    .inline-score-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 0 2px;
    }
    .inline-stepper {
      display: inline-flex;
      align-items: center;
      border: 3px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 3px 3px 0 0 var(--retro-orange);
    }
    .inline-stepper button {
      all: unset;
      cursor: pointer;
      padding: 2px 8px;
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--paper);
      background: var(--ink);
      line-height: 1.4;
    }
    .inline-stepper button:hover { background: var(--retro-red); }
    .inline-stepper button:active { opacity: 0.8; }
    .inline-val {
      font-family: var(--font-var);
      font-size: 22px;
      line-height: 1;
      padding: 2px 10px;
      min-width: 24px;
      text-align: center;
      color: var(--ink);
    }
    .inline-dash {
      font-family: var(--font-var);
      font-size: 18px;
      color: var(--dim);
    }

    /* Probabilidad 1X2 */
    .odds-wrap { margin-top: 6px; }
    .odds-legend {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--dim);
      margin-bottom: 2px;
    }
    .odds-legend .odds-home { color: var(--retro-blue); }
    .odds-legend .odds-away { color: var(--retro-red); }
    .odds-bar {
      display: flex;
      height: 6px;
      border: 2px solid var(--ink);
      overflow: hidden;
    }
    .odds-seg { height: 100%; }
    .odds-figs {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
    }
    .odds-figs .odds-home { color: var(--retro-blue); }
    .odds-figs .odds-away { color: var(--retro-red); }

    @media (max-width: 768px) {
      .group-actions { gap: 8px; }
      .go-knockout-btn {
        margin-left: 0;
        flex-basis: 100%;
        justify-content: center;
        order: 10;
      }
      .groups-grid { grid-template-columns: 1fr; }
      .notebook-page .group-card {
        display: flex;
        flex-direction: column;
      }
      .notebook-page .group-card .group-header {
        grid-column: auto;
      }
      .notebook-page .group-card .standings {
        grid-column: auto;
        padding: 8px 10px;
      }
      .notebook-page .group-card .matches-list {
        grid-column: auto;
        border-top: 2px solid var(--ink);
        border-left: none;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .notebook-page .group-card .matches-list .match-item {
        margin-bottom: 6px;
      }
      .notebook-page .group-card .matches-list .match-item:last-child {
        margin-bottom: 0;
      }
      .group-card { box-shadow: var(--shadow-hard-sm); }
      .notebook { box-shadow: var(--shadow-hard-md); }
      .notebook-page { padding: 14px 12px 16px; }
      /* Solapas como letra suelta — sin etiqueta para que quepan las 12 */
      .archive-tabs { padding: 8px 10px 0; gap: 1px; }
      .archive-tab {
        min-width: 38px;
        padding: 7px 2px 6px;
      }
      .archive-tab .at-label { display: none; }
      .archive-tab .at-strip { width: 16px; }
      .folder-letter { width: 44px; height: 44px; font-size: 26px; }
      .folder-title { font-size: 18px; }
      .inline-stepper button {
        padding: 4px 8px;
        font-size: 14px;
        min-width: 36px;
        min-height: 36px;
      }
      .inline-val { font-size: 18px; padding: 2px 6px; }
      .thirds-tables-container {
        flex-direction: column;
      }
      .thirds-tables-container > table:first-child:not(:last-child) {
        border-right: none;
        border-bottom: 2px solid var(--ink);
      }
      .thirds-table th, .thirds-table td {
        padding: 4px 8px;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .group-card {
        animation: fadeSlideIn 0.3s ease both;
        animation-delay: calc(var(--i, 0) * 40ms);
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    }
  `;

  private unsubscribeLocale?: () => void;

  // Flechas ←/→ cambian de grupo en el cuaderno (no si el foco está en un input).
  private _onKeyNav = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); this._stepGroup(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); this._stepGroup(-1); }
  };

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => ({ gm: s.groupMatches, gs: s.groupStandings, vm: s.viewMode }),
      () => this.requestUpdate(),
      (a, b) => a.gm === b.gm && a.gs === b.gs && a.vm === b.vm,
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    window.addEventListener('keydown', this._onKeyNav);
    if (!this._oddsLoaded) {
      this._oddsLoaded = true;
      getAllOdds().then(odds => {
        if (this.isConnected) this._odds = odds;
      });
    }
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    window.removeEventListener('keydown', this._onKeyNav);
    super.disconnectedCallback();
  }

  private getTeam(id: string) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private openMatch(matchId: string, date?: string, timeSpain?: string) {
    const store = useTournamentStore.getState();
    if (store.viewMode === 'real') return;
    if (!isMatchPending(date ?? '', timeSpain ?? '')) return;
    this.dispatchEvent(new CustomEvent('open-match', {
      detail: { matchId },
      bubbles: true,
      composed: true
    }));
  }

  private adjustInline(e: Event, m: GroupMatchResult, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const store = useTournamentStore.getState();
    if (store.viewMode === 'real') return;
    if (!isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.scoreA ?? 0, curB = m.scoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setGroupMatchResult(m.matchId, nextA, nextB);
    this._flashMatchId = m.matchId;
    setTimeout(() => {
      if (this._flashMatchId === m.matchId) this._flashMatchId = null;
    }, 600);
  }

  private handleSimulateAll() {
    useTournamentStore.getState().autoSimulateGroups();
  }

  private handleReset() {
    useTournamentStore.getState().resetTournament();
  }

  private handleGoToKnockout() {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: 'knockout',
      bubbles: true,
      composed: true,
    }));
  }

  private _selectGroup(g: string) {
    this._activeGroup = g;
  }

  private _stepGroup(delta: number) {
    const idx = GROUPS.indexOf(this._activeGroup);
    const next = (idx + delta + GROUPS.length) % GROUPS.length;
    this._activeGroup = GROUPS[next];
  }

  /** Una tarjeta de grupo (standings + partidos), reutilizada en el cuaderno. */
  private renderGroupCard(g: string, gIdx: number): TemplateResult {
    const store = useTournamentStore.getState();
    const standings = store.groupStandings[g] || [];
    const matches = store.groupMatches
      .filter(m => m.group === g)
      .sort((a, b) => {
        const da = a.date ?? '';
        const db = b.date ?? '';
        if (da !== db) return da < db ? -1 : 1;
        return (a.matchDay ?? 0) - (b.matchDay ?? 0);
      });
    const playedCount = matches.filter(m => m.scoreA !== null).length;
    const accentColor = GROUP_COLORS[gIdx % 4];

    return html`
            <div class="group-card" id="group-${g}" style="--i:${gIdx}">
              <!-- Cabecera coloreada con halftone -->
              <div class="group-header" style="background-color: ${accentColor}">
                <span class="group-header-title">${t('groups.group', { letter: g })}</span>
                <span class="group-header-badge">${t('groups.played', { n: playedCount })}</span>
              </div>

              <!-- Standings retro -->
              <div class="standings">
                ${standings.map((s, idx) => {
                  const team = this.getTeam(s.teamId);
                  const top2 = idx < 2;
                  let posLabel: string | null = null;
                  if (idx === 0) posLabel = '1°';
                  else if (idx === 1) posLabel = '2°';
                  const standingRowClass = top2 ? '' : 'muted';
                  const rankBadgeClass = top2 ? 'qualify' : '';
                  const pointsClass = top2 ? '' : 'muted';
                  const posBadge = posLabel ? html`<span class="pos-badge">${posLabel}</span>` : '';
                  return html`
                    <div class="standing-row ${standingRowClass}">
                      <div class="rank-badge ${rankBadgeClass}">${idx + 1}</div>
                      <div class="team-cell">
                        ${renderFlag(team, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
                        <span class="team-short">${team?.shortName ?? s.teamId}</span>
                        ${posBadge}
                      </div>
                      <span class="wdl">${s.won}-${s.drawn}-${s.lost}</span>
                      <span class="pts ${pointsClass}">${s.points}</span>
                    </div>
                  `;
                })}
              </div>

              <!-- Partidos -->
              <div class="matches-list">
                ${matches.map(m => {
                  const tA = this.getTeam(m.teamA);
                  const tB = this.getTeam(m.teamB);
                  const isPlayed = m.scoreA !== null;
                  const pending = isMatchPending(m.date ?? '', m.timeSpain ?? '');
                  const isEditable = store.isMatchEditable(m.matchId);
                  const showScoreSummary = pending === false || !isEditable;
                  const matchScoreClass = isPlayed ? '' : 'pending';
                  const matchScoreText = isPlayed ? `${m.scoreA} - ${m.scoreB}` : (isEditable ? t('groups.edit') : '🔒');
                  const venueStadium = m.venue ? STADIUMS.find(st => st.name === m.venue) : null;
                  const venueThumb = venueStadium
                    ? html`<img src="${venueStadium.image}" style="width: 20px; height: 12px; object-fit: cover; border: 1px solid var(--ink);" alt="">`
                    : '';
                  let venueMeta: TemplateResult | string = '';
                  if (m.venue) {
                    venueMeta = html`
                      <div style="display: flex; align-items: center; gap: 4px; margin-left: auto;">
                        ${venueThumb}
                        <span style="font-size: 8px; opacity: 0.7;">${m.venue}</span>
                      </div>
                    `;
                  }
                  const scoreSummary = showScoreSummary
                    ? html`
                        <div class="match-score ${matchScoreClass}">
                          ${matchScoreText}
                        </div>
                      `
                    : '';
                  const winA = isPlayed && (m.scoreA ?? 0) > (m.scoreB ?? 0);
                  const winB = isPlayed && (m.scoreB ?? 0) > (m.scoreA ?? 0);
                  const hasWinner = winA || winB;
                  const matchTop = isPlayed
                    ? html`
                        <div class="score-xl">
                          <div class="sx-side ${hasWinner && !winA ? 'lose' : ''}">
                            ${renderFlag(tA, { size: 'md', imgClass: 'flag-img', flagClass: 'team-flag' })}
                            <span class="sx-name">${tA?.shortName ?? m.teamA}</span>
                          </div>
                          <div class="sx-score">
                            <span class="sx-num ${hasWinner && !winA ? 'lose' : ''}">${m.scoreA}</span>
                            <span class="sx-dash">–</span>
                            <span class="sx-num ${hasWinner && !winB ? 'lose' : ''}">${m.scoreB}</span>
                          </div>
                          <div class="sx-side ${hasWinner && !winB ? 'lose' : ''}">
                            <span class="sx-name">${tB?.shortName ?? m.teamB}</span>
                            ${renderFlag(tB, { size: 'md', imgClass: 'flag-img', flagClass: 'team-flag' })}
                          </div>
                        </div>
                      `
                    : html`
                        <div class="match-top">
                          <div class="match-teams">
                            ${renderFlag(tA, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
                            <strong>${tA?.shortName ?? m.teamA}</strong>
                            <span class="vs">${t('groups.vs')}</span>
                            ${renderFlag(tB, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
                            <strong>${tB?.shortName ?? m.teamB}</strong>
                          </div>
                          ${scoreSummary}
                        </div>
                      `;
                  const inlineScoreRow = (pending && isEditable)
                    ? html`
                        <div class="inline-score-row">
                          <score-stepper
                            .value=${m.scoreA ?? 0}
                            decrementLabel=${t('groups.decScore')}
                            incrementLabel=${t('groups.incScore')}
                            variant="inline"
                            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustInline(e, m, 'A', e.detail.delta)}></score-stepper>
                          <span class="inline-dash">−</span>
                          <score-stepper
                            .value=${m.scoreB ?? 0}
                            decrementLabel=${t('groups.decScore')}
                            incrementLabel=${t('groups.incScore')}
                            variant="inline"
                            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustInline(e, m, 'B', e.detail.delta)}></score-stepper>
                        </div>
                      `
                    : '';
                  const odds = this._odds[m.matchId];
                  let oddsMeta: TemplateResult | string = '';
                  if (odds) {
                    const srcLabel = odds.source === 'market'
                      ? t('groups.oddsBookmakers', { n: String(odds.bookmakers) })
                      : t('groups.oddsEstimate');
                    oddsMeta = html`
                      <div class="odds-wrap" title="${t('groups.oddsTitle', { source: srcLabel })}">
                        <odds-bar
                          .home=${odds.home}
                          .draw=${odds.draw}
                          .away=${odds.away}
                          variant="default"
                          .showLegend=${true}
                          .showFigures=${true}></odds-bar>
                      </div>
                    `;
                  }
                  const badgeClass = isPlayed ? 'badge-played' : 'badge-upcoming';
                  const badgeText = isPlayed ? t('groups.badgePlayed') : t('groups.badgeNext');
                  const isRealMode = useTournamentStore.getState().viewMode === 'real';
                  const modeBadgeClass = isRealMode ? 'mode-badge real' : 'mode-badge prediction';
                  const modeBadgeText = isRealMode ? 'REAL' : 'PRED';
                  return html`
                    <div class="match-item ${this._flashMatchId === m.matchId ? 'row-flash' : ''}" role="button" tabindex="0"
                      @click="${() => this.openMatch(m.matchId, m.date, m.timeSpain)}"
                      @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.openMatch(m.matchId, m.date, m.timeSpain); } }}"
                    >
                      ${matchTop}
                      ${inlineScoreRow}
                      ${oddsMeta}
                      <div class="match-meta">
                        ${m.date ? html`<span>${formatDate(m.date)}</span>` : ''}
                        ${m.timeSpain ? html`<span style="color: var(--retro-yellow); font-weight: bold;">· ${m.timeSpain} ESP</span>` : ''}
                        ${m.city ? html`<span>· ${m.city}</span>` : ''}
                        ${venueMeta}
                        <span class="badge ${badgeClass}">${badgeText}</span>
                        ${isPlayed ? html`<span class="${modeBadgeClass}">${modeBadgeText}</span>` : ''}
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          `;
  }

  render() {
    const store = useTournamentStore.getState();
    const activeIdx = GROUPS.indexOf(this._activeGroup);
    const activeStandings = store.groupStandings[this._activeGroup] || [];
    const activeTeamNames: string[] = [];
    for (const s of activeStandings) {
      const tm = this.getTeam(s.teamId);
      activeTeamNames.push(tm?.shortName ?? s.teamId);
    }
    const headTeamName = activeTeamNames[0];

    const playedTotal = store.groupMatches.filter(m => m.scoreA !== null).length;
    const totalMatches = store.groupMatches.length;
    const allGroupsComplete = playedTotal === totalMatches;
    const showThirds = playedTotal > 0;
    const bestThirds = showThirds ? store.getBestThirds() : [];
    const half = Math.ceil(bestThirds.length / 2);
    const leftThirds = bestThirds.slice(0, half);
    const rightThirds = bestThirds.slice(half);
    const isRealMode = store.viewMode === 'real';

    return html`
      <div class="group-actions">
        <button class="btn btn-primary" ?disabled=${isRealMode} @click="${this.handleSimulateAll}">${t('groups.simulate')}</button>
        <button class="btn" style="color: var(--retro-red)" ?disabled=${isRealMode} @click="${this.handleReset}">${t('groups.reset')}</button>
        <button class="btn" @click=${() => { this._bracketMode = !this._bracketMode; }}>
          ${this._bracketMode ? t('groups.classicView') : t('groups.resultsBracket')}
        </button>
        <button
          class="btn ${allGroupsComplete ? 'btn-primary' : ''} go-knockout-btn"
          ?disabled=${!allGroupsComplete}
          title=${allGroupsComplete ? '' : t('groups.completeGroupsFirst')}
          @click=${this.handleGoToKnockout}>
          ${t('groups.goToKnockout')}${!allGroupsComplete ? html`<span class="go-knockout-count">${playedTotal}/${totalMatches}</span>` : ''}
        </button>
      </div>

      ${this._bracketMode ? html`<groups-bracket-view></groups-bracket-view>` : html`
        <!-- Solapas tipo carpeta de archivo -->
        <div class="archive-tabs" role="tablist">
          ${GROUPS.map((g, gIdx) => {
            const isActive = g === this._activeGroup;
            const accentColor = GROUP_COLORS[gIdx % 4];
            return html`
              <button
                class="archive-tab ${isActive ? 'active' : ''}"
                role="tab"
                aria-selected="${isActive}"
                aria-label="${t('groups.tabAria', { letter: g })}"
                @click="${() => this._selectGroup(g)}">
                <span class="at-letter">${g}</span>
                <span class="at-label">${t('groups.group', { letter: g })}</span>
                <span class="at-strip" style="background:${accentColor}"></span>
              </button>
            `;
          })}
        </div>

        <!-- Página del grupo activo -->
        <div class="notebook-page" role="tabpanel" key="${this._activeGroup}">
          <div class="folder-head">
            <div class="folder-letter" style="background-color:${GROUP_COLORS[activeIdx % 4]}">
              ${this._activeGroup}
            </div>
            <div class="folder-titles">
              <div class="folder-eyebrow">${t('groups.folderEyebrow')}</div>
              <div class="folder-title">
                ${headTeamName
                  ? t('groups.folderTitle', { team: headTeamName.toUpperCase() })
                  : t('groups.group', { letter: this._activeGroup })}
              </div>
              <div class="folder-teams">
                ${activeTeamNames.join(' · ')}
              </div>
            </div>
            <div class="folder-nav">
              <button aria-label="${t('groups.prevGroup')}" @click="${() => this._stepGroup(-1)}">‹</button>
              <button aria-label="${t('groups.nextGroup')}" @click="${() => this._stepGroup(1)}">›</button>
            </div>
          </div>

          <div class="groups-grid">
            ${this.renderGroupCard(this._activeGroup, activeIdx)}
          </div>
        </div>
      </div>

      ${showThirds && bestThirds.length > 0 ? html`
        <div class="thirds-section">
          <div class="thirds-header">${t('groups.thirdsHeader')}</div>
          <div class="thirds-tables-container">
            <table class="thirds-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th>${t('groups.tableTeam')}</th>
                  <th class="col-stat">${t('groups.tableGroup')}</th>
                  <th class="col-stat">${t('groups.statGD')}</th>
                  <th class="col-pts-val">${t('groups.statPTS')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${leftThirds.map((t, idx) => {
                  const team = this.getTeam(t.id);
                  const rank = idx + 1;
                  return html`
                    <tr>
                      <td class="col-rank">${rank}</td>
                      <td>
                        <div class="team-cell">
                          ${renderFlag(team, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
                          <span class="team-short">${team?.shortName ?? t.id}</span>
                        </div>
                      </td>
                      <td class="col-stat">${t.group}</td>
                      <td class="col-stat">${t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
                      <td class="col-pts-val">${t.points}</td>
                      <td>${rank <= 8 ? html`<span class="qualify-check">✓</span>` : ''}</td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>

            ${rightThirds.length > 0 ? html`
              <table class="thirds-table">
                <thead>
                  <tr>
                    <th class="col-rank">#</th>
                    <th>${t('groups.tableTeam')}</th>
                    <th class="col-stat">${t('groups.tableGroup')}</th>
                    <th class="col-stat">${t('groups.statGD')}</th>
                    <th class="col-pts-val">${t('groups.statPTS')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${rightThirds.map((t, idx) => {
                    const team = this.getTeam(t.id);
                    const rank = idx + 1 + half;
                    return html`
                      <tr>
                        <td class="col-rank">${rank}</td>
                        <td>
                          <div class="team-cell">
                            ${renderFlag(team, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
                            <span class="team-short">${team?.shortName ?? t.id}</span>
                          </div>
                        </td>
                        <td class="col-stat">${t.group}</td>
                        <td class="col-stat">${t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
                        <td class="col-pts-val">${t.points}</td>
                        <td>${rank <= 8 ? html`<span class="qualify-check">✓</span>` : ''}</td>
                      </tr>
                    `;
                  })}
                </tbody>
              </table>
            ` : ''}
          </div>
        </div>
      ` : ''}
      `}
    `;
  }
}

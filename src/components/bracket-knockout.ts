import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { TEAMS_2026, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import { SQUADS, type Player } from '../data/squads/index';
import './match-modal';
import { STADIUMS } from '../data/stadiums';
import { t, useLocaleStore } from '../i18n';
import { isMatchPending, formatShortDate } from '../lib/date-utils';
import { getAllOdds, getOddsForMatch, type MatchOdds } from '../lib/odds-service';
import { openMatchModal } from '../lib/match-modal-service';
import { renderFlag } from '../lib/render-flag';
import { lightTap } from '../lib/interaction';
import './score-stepper';
import './odds-bar';

// Colores por ronda — retro Panini
const ROUND_COLORS: Record<string, string> = {
  r32:   'var(--retro-blue)',
  r16:   'var(--retro-orange)',
  qf:    'var(--retro-green)',
  sf:    'var(--retro-red)',
  final: 'var(--ink)',
};

// Aristas del árbol de cruces derivadas de KNOCKOUT_BRACKET
const BRACKET_EDGES: Array<{ src: string; dst: string }> = [
  ...KNOCKOUT_BRACKET.roundOf16.flatMap(m => [
    { src: m.prevMatchA, dst: m.id },
    { src: m.prevMatchB, dst: m.id },
  ]),
  ...KNOCKOUT_BRACKET.quarterfinals.flatMap(m => [
    { src: m.prevMatchA, dst: m.id },
    { src: m.prevMatchB, dst: m.id },
  ]),
  ...KNOCKOUT_BRACKET.semifinals.flatMap(m => [
    { src: m.prevMatchA, dst: m.id },
    { src: m.prevMatchB, dst: m.id },
  ]),
  { src: KNOCKOUT_BRACKET.final.prevMatchA, dst: KNOCKOUT_BRACKET.final.id },
  { src: KNOCKOUT_BRACKET.final.prevMatchB, dst: KNOCKOUT_BRACKET.final.id },
];

// IDs de partidos por fase (para el layout móvil)
const genIds = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix}-${String(i + 1).padStart(2, '0')}`);

const MOBILE_STAGES = [
  { label: '1/16',    abbr: '16', color: ROUND_COLORS.r32,   matchIds: genIds('R32', 16) },
  { label: 'OCTAVOS', abbr: '8',  color: ROUND_COLORS.r16,   matchIds: genIds('R16', 8)  },
  { label: 'CUARTOS', abbr: '4',  color: ROUND_COLORS.qf,    matchIds: genIds('QF', 4)   },
  { label: 'SEMIS',   abbr: '2',  color: ROUND_COLORS.sf,    matchIds: ['SF-01', 'SF-02'] },
  { label: 'FINAL',   abbr: '1',  color: ROUND_COLORS.final, matchIds: ['FIN-01'] },
] as const;

type ConnectorPath = {
  d: string;
  stroke: string;
  strokeWidth: string;
  opacity: string;
  dashArray?: string;
};

@customElement('bracket-knockout')
export class BracketKnockout extends LitElement {
  private unsubscribeStore?: () => void;
  private unsubscribeLocale?: () => void;
  private _ro?: ResizeObserver;
  private _mql?: MediaQueryList;
  private _desktopInited = false;
  private _centerDone = false;

  private readonly _onResize = () => requestAnimationFrame(() => this._drawConnectors());
  private readonly _onMqlChange = (e: MediaQueryListEvent) => { this._isMobile = e.matches; };

  @state() private _pulseId: string | null = null;
  @state() private _flashMobId: string | null = null;
  @state() private _isMobile = false;
  @state() private _odds: Record<string, MatchOdds> = {};
  private _oddsLoaded = false;
  @state() private _mobileMode: 'all' | 'path' = 'all';
  @state() private _mobileStage = 0;
  @state() private _pathTeamId: string | null = null;
  // Swipe interno entre fases del bracket (solo en modo móvil / "all")
  private _mobSwipeStartX = 0;
  @state() private _showTeamPicker = false;
  @state() private _pickerSearch = '';
  @state() private _connectorPaths: ConnectorPath[] = [];
  private _connectorSignature = '';
  @state() private _showAwardsModal: 'topScorer' | 'mvp' | null = null;
  @state() private _selectedTeamIdForSelector = '';
  @state() private _awardsSearchQuery = '';

  public static readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    /* ── Acciones desktop (barra compacta sobre el poster) ── */
    .bracket-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding: 5px 10px;
      border: 2px solid var(--ink);
      background: var(--paper-3);
      box-shadow: 2px 2px 0 0 var(--ink);
      flex-shrink: 0;
    }
    .bracket-actions-label {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .bracket-actions-btns { display: flex; gap: 8px; }

    /* ── Poster header V3 (compacto) ── */
    .poster-header {
      text-align: center;
      margin-bottom: 6px;
      padding: 6px 16px;
      border: 3px solid var(--ink);
      background: var(--ink);
      color: var(--retro-yellow);
      position: relative;
      box-shadow: 4px 4px 0 0 var(--retro-orange);
      flex-shrink: 0;
    }
    .poster-eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.3em;
      color: var(--retro-yellow);
      margin-bottom: 2px;
    }
    .poster-h1 {
      font-family: var(--font-var);
      font-size: clamp(14px, 1.8vw, 22px);
      margin: 0;
      line-height: 1;
      color: var(--paper);
      letter-spacing: -0.02em;
    }
    .poster-h1 .gloria { color: var(--retro-orange); }
    .poster-corner {
      position: absolute;
      top: 6px;
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.15em;
      color: rgba(236,223,192,0.5);
    }
    .poster-corner.left  { left: 10px; }
    .poster-corner.right { right: 10px; }

    /* ── Scroll del bracket ── */
    .bracket-scroll {
      overflow-x: auto;
      overflow-y: hidden;
      padding: 8px 0 10px;
      cursor: grab;
      user-select: none;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
    }
    .bracket-scroll::-webkit-scrollbar { display: none; }
    .bracket-scroll.is-dragging { cursor: grabbing; }

    .bracket-container {
      display: flex;
      gap: 18px;
      padding: 0 12px;
      min-width: fit-content;
      align-items: stretch;
      position: relative;
    }

    .round-col {
      display: flex;
      flex-direction: column;
      gap: 5px;
      justify-content: space-around;
      min-width: 156px;
      scroll-snap-align: start;
    }
    .round-col.is-final {
      justify-content: center;
      gap: 12px;
    }
    .matches-wrap {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }

    /* Header coloreado con halftone + sombra doble V3 */
    .round-title {
      padding: 3px 7px;
      text-align: center;
      font-family: var(--font-var);
      font-size: 12px;
      letter-spacing: 0.14em;
      border: 2px dashed var(--ink);
      box-shadow: 2px 2px 0 0 var(--retro-orange), 2px 2px 0 1px var(--ink);
      color: var(--paper);
      background-image: radial-gradient(circle, rgba(0,0,0,0.18) 1.2px, transparent 1.4px);
      background-size: 6px 6px;
      margin-bottom: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      position: relative;
    }
    .round-title.is-final { color: var(--retro-yellow); }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Match box */
    .match-box {
      background: var(--paper-2);
      border: 1.5px solid var(--ink);
      border-left-width: 4px;
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }
    @media (hover: hover) {
      .match-box:hover {
        transform: translate(-2px, -2px);
        box-shadow: 3px 3px 0 0 var(--retro-orange), 3px 3px 0 1.5px var(--ink);
      }
    }
    .match-box:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .match-box.pulse {
      box-shadow: 0 0 0 3px var(--retro-yellow), var(--shadow-hard-sm);
    }
    .match-box.right-side {
      border-left-width: 1.5px;
      border-right-width: 4px;
    }
    .mode-badge {
      display: block;
      font-family: var(--font-mono);
      font-size: 7px;
      font-weight: 700;
      padding: 1px 4px;
      border: 1px solid var(--ink);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: center;
      margin: 2px 6px;
    }
    .mode-badge.real {
      background: var(--retro-green);
      color: #ffffff;
    }
    .mode-badge.prediction {
      background: var(--accent);
      color: var(--on-accent);
    }

    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      min-height: 30px;
    }
    .team-row.winner-row { color: #ffffff; font-weight: 800; }
    .team-row.loser-row  { opacity: 0.5; }
    .team-separator { height: 1px; background: var(--ink); margin: 0 5px; }

    .team-info {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 11px; flex-shrink: 0; }
    .flag-img {
      width: 17px;
      height: 11px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .team-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    @media (min-width: 769px) {
      .bracket-scroll {
        overflow-x: hidden;
        overflow-y: visible;
        padding: 8px 0 10px;
      }

      .bracket-container {
        width: 100%;
        min-width: 0;
        gap: clamp(6px, 0.7vw, 12px);
        padding: 0 8px;
        min-height: 780px;
      }

      .round-col {
        min-width: 0;
        flex: 1 1 0;
      }

      .round-col.is-final {
        flex: 1.18 1 0;
        min-width: 0;
      }

      .round-title {
        padding: 3px 5px;
        font-size: clamp(9px, 0.72vw, 12px);
      }
      .round-title::before,
      .round-title::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
      }
      .round-title::before {
        top: 3px;
        left: 3px;
        border-top: 2px solid var(--round-color);
        border-left: 2px solid var(--round-color);
      }
      .round-title::after {
        bottom: 3px;
        right: 3px;
        border-bottom: 2px solid var(--round-color);
        border-right: 2px solid var(--round-color);
      }

      .matches-wrap {
        gap: clamp(4px, 0.45vw, 8px);
      }

      .match-box {
        min-width: 0;
      }

      .team-row {
        padding: 3px 5px;
        min-height: 28px;
      }

      .team-info {
        gap: 4px;
        font-size: clamp(9px, 0.78vw, 11px);
      }

      .team-flag {
        font-size: 10px;
      }

      .flag-img {
        width: 15px;
        height: 10px;
      }

      .score {
        font-size: clamp(11px, 0.95vw, 13px);
      }

      .champion-box {
        min-width: 0;
      }

      .champion-team {
        font-size: clamp(13px, 0.95vw, 15px);
      }
    }

    .score { font-family: var(--font-var); font-size: 13px; flex-shrink: 0; }
    .score.pending { color: var(--dim); opacity: 0.4; font-size: 11px; }

    .match-note {
      padding: 2px 5px;
      border-top: 1px solid var(--ink);
      background: rgba(0,0,0,0.05);
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* Fecha y hora exactas de cada partido del bracket */
    .ko-schedule {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 2px 6px;
      border-top: 1px solid var(--ink);
      background: var(--retro-yellow);
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--ink);
      white-space: nowrap;
    }
    .ko-sched-date { text-transform: uppercase; }
    .ko-sched-time { opacity: 0.85; }

    /* Champion box — V3 double shadow + halftone overlay in template */
    .champion-box {
      background: var(--retro-yellow);
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-orange), 4px 4px 0 3px var(--ink);
      padding: 8px 10px;
      text-align: center;
      min-width: 148px;
      position: relative;
      overflow: hidden;
    }
    .champion-halftone {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(0,0,0,0.10) 1.4px, transparent 1.6px);
      background-size: 7px 7px;
      pointer-events: none;
    }
    .champion-inner { position: relative; }
    .champion-title {
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--ink);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .flag-img-champion {
      width: 20px;
      height: 13px;
      object-fit: cover;
      border: 1.5px solid var(--ink);
      margin-right: 4px;
      vertical-align: middle;
    }
    .champion-team { font-family: var(--font-var); font-size: 15px; color: var(--ink); line-height: 1.1; }
    .champion-team.tbd { opacity: 0.35; font-size: 13px; }
    .champion-trophy { font-size: 22px; line-height: 1; margin-bottom: 2px; }

    .third-place-title {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.18em;
      text-align: center;
      margin-top: 8px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    svg.connectors {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      overflow: visible;
    }

    .ko-stepper {
      display: inline-flex;
      align-items: center;
      border: 1.5px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 1px 1px 0 0 var(--retro-orange);
      flex-shrink: 0;
    }
    .ko-stepper button {
      all: unset;
      cursor: pointer;
      padding: 0px 4px;
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--paper);
      background: var(--ink);
      line-height: 1.4;
    }
    .ko-stepper button:hover { background: var(--retro-red); }
    .ko-val {
      font-family: var(--font-var);
      font-size: 13px;
      padding: 0 4px;
      min-width: 14px;
      text-align: center;
      color: var(--ink);
    }
    .ko-pen-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 2px 4px;
      border-top: 1px dashed var(--ink);
      background: var(--paper);
    }
    .ko-pen-label { font-family: var(--font-mono); font-size: 7px; letter-spacing: 0.1em; color: var(--dim); }
    .ko-pen-sep   { font-family: var(--font-mono); font-size: 10px; color: var(--dim); }

    /* Barra 1X2 compacta dentro del match-box */
    .ko-odds-bar {
      display: flex;
      height: 4px;
      margin: 0 2px 2px;
      border: 1px solid var(--ink);
      overflow: hidden;
    }
    .ko-odds-seg { height: 100%; }
    .ko-odds-figs {
      display: flex;
      justify-content: space-between;
      padding: 0 4px 2px;
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--dim);
    }
    .ko-odds-figs .odds-home { color: var(--retro-blue); }
    .ko-odds-figs .odds-away { color: var(--retro-red); }

    @media (prefers-reduced-motion: no-preference) {
      .match-box {
        animation: fadeSlideIn 0.3s ease both;
        animation-delay: calc(var(--i, 0) * 30ms);
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    }

    /* ══════════════════════════════════════════════
       MOBILE V3 CROMO — MobileBracketFull
       ══════════════════════════════════════════════ */

    .mob-layout {
      display: flex;
      flex-direction: column;
      background: var(--paper);
      background-image:
        radial-gradient(circle, rgba(26,25,51,0.10) 1.2px, transparent 1.4px) 0 0 / 6px 6px,
        repeating-linear-gradient(135deg, rgba(232,84,31,0.06) 0 6px, transparent 6px 22px);
    }

    .mob-header {
      padding: 12px 16px 14px;
      background: var(--paper);
      border-bottom: 3px solid var(--ink);
      flex-shrink: 0;
    }
    .mob-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .mob-header-eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.3em;
      color: var(--dim);
      font-weight: 700;
    }
    .mob-header-action {
      all: unset;
      cursor: pointer;
      padding: 6px 12px;
      background: var(--retro-yellow);
      border: 2.5px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--retro-orange), 3px 3px 0 1.5px var(--ink);
      font-family: var(--font-var);
      font-size: 11px;
      letter-spacing: 0.05em;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .mob-header-title {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: var(--ink);
    }
    .mob-header-sub {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.1em;
      margin-top: 4px;
    }

    .mob-toggle-row {
      padding: 10px 16px 0;
      border-bottom: 1.5px dashed rgba(26,25,51,0.25);
    }
    .mob-toggle {
      display: inline-flex;
      border: 2.5px solid var(--ink);
      background: var(--paper-3);
      box-shadow: 3px 3px 0 0 var(--ink);
    }
    .mob-toggle-btn {
      all: unset;
      cursor: pointer;
      padding: 7px 14px;
      font-family: var(--font-var);
      font-size: 11px;
      letter-spacing: 0.06em;
      color: var(--ink);
      white-space: nowrap;
    }
    .mob-toggle-btn:first-child {
      border-right: 2px solid var(--ink);
    }
    .mob-toggle-btn.active {
      background: var(--ink);
      color: var(--retro-yellow);
    }

    .mob-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding: 10px 16px 12px;
      border-bottom: 2px solid var(--ink);
      background: var(--paper);
      flex-shrink: 0;
    }
    .mob-chips::-webkit-scrollbar { display: none; }
    .mob-chip {
      all: unset;
      cursor: pointer;
      flex-shrink: 0;
      /* Target táctil cómodo: mínimo 40px de alto */
      min-height: 40px;
      padding: 9px 14px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      color: var(--ink);
      font-family: var(--font-var);
      font-size: 12px;
      letter-spacing: 0.05em;
      white-space: nowrap;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .mob-chip.active { color: #fff; }

    .mob-body { padding: 14px 16px 24px; }

    /* ─── Banner de fase con navegación prev/next ─── */
    .mob-stage-nav {
      display: flex;
      align-items: stretch;
      gap: 0;
      margin-bottom: 12px;
    }
    .mob-stage-nav-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: 2.5px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 3px 3px 0 0 var(--ink);
      font-size: 18px;
      flex-shrink: 0;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .mob-stage-nav-btn:active:not(:disabled) {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .mob-stage-nav-btn:disabled {
      opacity: 0.3;
      cursor: default;
    }
    .mob-stage-nav-btn.prev { margin-right: -2.5px; }
    .mob-stage-nav-btn.next { margin-left: -2.5px; }
    .mob-stage-banner-wrap {
      flex: 1;
      min-width: 0;
      /* Banner heredado — sin margin-bottom propio, lo gestiona mob-stage-nav */
    }

    .mob-stage-banner {
      padding: 10px 14px;
      margin-bottom: 12px;
      color: #fff;
      border: 2.5px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-orange), 4px 4px 0 2.5px var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      overflow: hidden;
    }
    .mob-banner-dots {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1.4px, transparent 1.6px);
      background-size: 8px 8px;
      pointer-events: none;
    }
    .mob-banner-label {
      font-family: var(--font-var);
      font-size: 16px;
      letter-spacing: 0.05em;
      position: relative;
    }
    .mob-banner-count {
      font-family: var(--font-mono);
      font-size: 10px;
      opacity: 0.9;
      position: relative;
    }

    .mob-match-card {
      background: var(--paper-3);
      border: 2.5px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      overflow: hidden;
      cursor: pointer;
      margin-bottom: 10px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .mob-match-card:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .mob-match-card.mob-flash {
      animation: mobFlash 0.5s ease both;
    }
    @keyframes mobFlash {
      0%   { box-shadow: 3px 3px 0 0 var(--ink); }
      40%  { box-shadow: 3px 3px 0 0 var(--retro-green); border-color: var(--retro-green); }
      100% { box-shadow: 3px 3px 0 0 var(--ink); border-color: var(--ink); }
    }
    .mob-team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 11px 12px;
      min-height: 44px;
    }
    .mob-team-row.winner { color: #fff; }
    .mob-team-row.loser  { opacity: 0.4; }
    .mob-team-row + .mob-team-row { border-top: 1.5px solid var(--ink); }
    .mob-team-info {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 700;
      overflow: hidden;
    }
    .mob-team-info .flag { font-size: 20px; flex-shrink: 0; }
    .mob-team-info .flag-img {
      width: 24px;
      height: 16px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .mob-team-info .code { white-space: nowrap; }
    .mob-team-info .name {
      font-weight: 400;
      opacity: 0.75;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mob-score {
      font-family: var(--font-var);
      font-size: 20px;
      flex-shrink: 0;
    }
    .mob-score.pending { color: var(--dim); opacity: 0.4; font-size: 14px; }
    .mob-pen-note {
      padding: 4px 12px;
      border-top: 1px solid var(--ink);
      background: rgba(0,0,0,0.04);
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .mob-stepper {
      display: inline-flex;
      align-items: center;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 2px 2px 0 0 var(--retro-orange);
      flex-shrink: 0;
    }
    .mob-stepper button {
      all: unset;
      cursor: pointer;
      padding: 2px 8px;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--paper);
      background: var(--ink);
      line-height: 1.4;
      min-width: 28px;
      min-height: 28px;
      text-align: center;
      touch-action: manipulation;
    }
    .mob-stepper button:active { background: var(--retro-red); }
    .mob-stepper-val {
      font-family: var(--font-var);
      font-size: 16px;
      padding: 0 6px;
      min-width: 22px;
      text-align: center;
      color: var(--ink);
    }
    .mob-pen-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 8px 12px;
      border-top: 2px dashed var(--ink);
      background: var(--paper-2);
    }
    .mob-pen-label {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--ink);
      text-transform: uppercase;
      background: var(--retro-orange);
      padding: 2px 6px;
      border: 1.5px solid var(--ink);
    }
    .mob-pen-sep   { font-family: var(--font-var); font-size: 18px; color: var(--dim); font-weight: 700; }
    .mob-pen-team-code {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.08em;
      color: var(--dim);
      text-align: center;
    }
    .mob-match-venue {
      padding: 5px 12px;
      border-top: 1.5px solid var(--ink);
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0,0,0,0.03);
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mob-venue-img {
      width: 20px;
      height: 13px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }

    .mob-champion-card {
      background: var(--retro-yellow);
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-orange), 4px 4px 0 2.5px var(--ink);
      padding: 22px 16px;
      text-align: center;
      margin-top: 18px;
      position: relative;
      overflow: hidden;
    }
    .mob-third-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.25em;
      color: var(--dim);
      margin-top: 16px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    /* Mi camino — path mode */
    .mob-path-body { padding: 14px 16px 24px; }

    .mob-team-hero {
      border: 2.5px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-orange), 4px 4px 0 2.5px var(--ink);
      padding: 18px 16px;
      margin-bottom: 20px;
      display: flex;
      gap: 14px;
      align-items: center;
      position: relative;
      overflow: hidden;
      color: #fff;
    }
    .mob-team-hero .hero-flag-box {
      width: 60px;
      height: 60px;
      background: #fff;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      flex-shrink: 0;
    }
    .mob-team-hero .hero-flag-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .mob-team-hero .hero-info { flex: 1; }
    .mob-team-hero .hero-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.25em;
      opacity: 0.9;
      margin-bottom: 2px;
    }
    .mob-team-hero .hero-name {
      font-family: var(--font-var);
      font-size: 24px;
      line-height: 0.95;
    }
    .mob-hero-change {
      all: unset;
      cursor: pointer;
      position: absolute;
      top: -1px;
      right: -1px;
      padding: 5px 10px;
      background: var(--retro-yellow);
      border: 2.5px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
    }
    .mob-hero-halftone {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1.6px, transparent 1.8px);
      background-size: 8px 8px;
      pointer-events: none;
    }

    .mob-timeline { position: relative; }
    .mob-timeline-line {
      position: absolute;
      left: 24px; top: 6px; bottom: 0;
      width: 3px;
      background: var(--ink);
    }
    .mob-timeline-item {
      position: relative;
      margin-bottom: 12px;
      padding-left: 60px;
    }
    .mob-node {
      position: absolute;
      left: 8px; top: 0;
      width: 34px; height: 34px;
      color: #fff;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 9px;
      letter-spacing: 0.04em;
      z-index: 2;
    }
    .mob-item-card {
      background: var(--paper-3);
      border: 2.5px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mob-item-opponent {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
    }
    .mob-result-badge {
      padding: 4px 9px;
      color: #fff;
      font-family: var(--font-var);
      font-size: 11px;
      box-shadow: 2px 2px 0 0 var(--ink);
      border: 2px solid var(--ink);
      flex-shrink: 0;
    }
    .mob-trophy-item {
      position: relative;
      padding-left: 60px;
      margin-top: 4px;
    }
    .mob-trophy-node {
      position: absolute;
      left: 8px; top: 0;
      width: 34px; height: 34px;
      border-radius: 50%;
      background: var(--retro-yellow);
      color: var(--ink);
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      z-index: 2;
    }
    .mob-trophy-card {
      background: var(--retro-yellow);
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--ink);
      padding: 12px 14px;
    }

    /* Team picker overlay */
    .mob-picker-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(26,25,51,0.55);
      z-index: 300;
      display: flex;
      align-items: flex-end;
    }
    .mob-picker-sheet {
      width: 100%;
      max-height: 65vh;
      background: var(--paper-3);
      border-top: 3px solid var(--ink);
      box-shadow: 0 -4px 0 0 var(--retro-orange);
      display: flex;
      flex-direction: column;
    }
    .mob-picker-header {
      padding: 12px 16px;
      border-bottom: 2px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .mob-picker-title {
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--ink);
    }
    .mob-picker-close {
      all: unset;
      cursor: pointer;
      padding: 4px 10px;
      background: var(--ink);
      color: var(--retro-yellow);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
    }
    .mob-team-chip {
      all: unset;
      cursor: pointer;
      padding: 7px 12px;
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      transition: background 0.1s;
    }
    .mob-team-chip.selected {
      background: var(--ink);
      color: var(--retro-yellow);
    }
    .mob-team-chip:active { opacity: 0.7; }

    .mob-picker-search {
      padding: 10px 16px;
      border-bottom: 2px solid var(--ink);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .mob-picker-input {
      flex: 1;
      all: unset;
      padding: 8px 12px;
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 rgba(26,25,51,0.15);
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink);
      min-height: 44px;
      box-sizing: border-box;
    }
    .mob-picker-input::placeholder {
      color: var(--dim);
      opacity: 0.6;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.06em;
    }
    .mob-picker-clear {
      all: unset;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ink);
      color: var(--retro-yellow);
      font-family: var(--font-mono);
      font-size: 14px;
    }
    .mob-picker-empty {
      padding: 24px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.15em;
    }
    .mob-picker-group {
      margin-bottom: 14px;
    }
    .mob-picker-group-title {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      color: var(--dim);
      margin-bottom: 8px;
      padding: 0 4px;
    }
    .mob-picker-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .mob-picker-list {
      overflow-y: auto;
      padding: 12px 16px;
      -webkit-overflow-scrolling: touch;
    }

    /* ── Barra / Panel de Premios Individuales ── */
    .awards-panel {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      margin: 4px 8px 8px;
      padding: 6px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .awards-title {
      font-family: var(--font-var);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 3px;
      color: var(--ink);
      text-transform: uppercase;
    }
    .awards-grid {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .award-card {
      flex: 1;
      min-width: 0;
      background: var(--paper);
      border: 1.5px solid var(--ink);
      padding: 4px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .award-main {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .award-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    .award-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .award-category {
      color: var(--dim);
      font-size: 7px;
      text-transform: uppercase;
      font-family: var(--font-mono);
      letter-spacing: 0.05em;
      line-height: 1;
      margin-bottom: 2px;
    }
    .award-value {
      font-family: var(--font-var);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--ink);
      line-height: 1.1;
    }
    .award-btn {
      all: unset;
      cursor: pointer;
      padding: 3px 6px;
      background: var(--ink);
      color: var(--retro-yellow);
      border: 1.5px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 1.5px 1.5px 0 0 var(--retro-orange);
      flex-shrink: 0;
      text-align: center;
      transition: transform 0.1s, background-color 0.1s;
    }
    .award-btn:active {
      transform: translate(1px, 1px);
      box-shadow: none;
    }

    @media (min-width: 769px) {
      .awards-panel {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        margin: 4px 10px 6px;
        gap: 12px;
      }
      .awards-title {
        border-bottom: none;
        padding-bottom: 0;
        margin-right: 4px;
        font-size: 10px;
        white-space: nowrap;
      }
      .awards-grid {
        flex: 1;
        gap: 8px;
      }
      .award-card {
        padding: 3px 6px;
      }
    }
    @media (max-width: 768px) {
      .awards-grid {
        flex-wrap: wrap;
      }
      .award-card {
        min-width: 130px;
      }
    }

    /* ── Modal de Selección de Premios ── */
    .awards-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(26,25,51,0.65);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .awards-modal {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      width: 100%;
      max-width: 600px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
    .awards-modal-header {
      background: var(--retro-yellow);
      border-bottom: 3px solid var(--ink);
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .awards-modal-title {
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--ink);
    }
    .awards-modal-close {
      all: unset;
      cursor: pointer;
      padding: 4px 10px;
      background: var(--ink);
      color: var(--retro-yellow);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
    }
    .awards-modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .awards-modal-step {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      text-transform: uppercase;
      margin-bottom: 6px;
      letter-spacing: 0.05em;
    }
    .teams-grid-scroll {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 6px;
      max-height: 180px;
      overflow-y: auto;
      border: 2px solid var(--ink);
      padding: 8px;
      background: var(--paper);
    }
    .team-picker-item {
      all: unset;
      cursor: pointer;
      padding: 6px;
      border: 1px solid var(--ink);
      background: var(--paper);
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-var);
      font-size: 11px;
      min-width: 0;
      box-sizing: border-box;
    }
    .team-picker-item.active {
      background: var(--retro-yellow);
      border-color: var(--retro-orange);
      box-shadow: inset 0 0 0 1px var(--retro-orange);
    }
    .team-picker-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--ink);
      font-weight: 700;
    }
    .players-grid-scroll {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 8px;
      max-height: 220px;
      overflow-y: auto;
      border: 2px solid var(--ink);
      padding: 8px;
      background: var(--paper);
    }
    .no-players-placeholder {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      padding: 12px;
      text-align: center;
      grid-column: 1 / -1;
    }
    .player-picker-item {
      all: unset;
      cursor: pointer;
      padding: 8px;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 2px 2px 0 0 var(--ink);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      min-width: 0;
      box-sizing: border-box;
    }
    .player-picker-item:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .player-picker-name {
      font-family: var(--font-var);
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .player-picker-sub {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Buscador de Premios en Modal ── */
    .awards-search-bar {
      margin-bottom: 12px;
      flex-shrink: 0;
    }
    .awards-search-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      font-family: var(--font-var);
      font-size: 14px;
      font-weight: 700;
      border: 2px solid var(--ink);
      background: var(--paper);
      color: var(--ink);
      outline: none;
      box-shadow: 2px 2px 0 0 var(--ink);
      border-radius: 0;
    }
    .awards-search-input:focus {
      background: var(--paper-2);
      border-color: var(--retro-orange);
    }
    .awards-search-results-label {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      text-transform: uppercase;
      margin-bottom: 6px;
      letter-spacing: 0.05em;
    }
    .awards-search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 8px;
      max-height: 380px;
      overflow-y: auto;
      border: 2px solid var(--ink);
      padding: 8px;
      background: var(--paper);
    }
    .search-player-item {
      all: unset;
      cursor: pointer;
      padding: 8px;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 2px 2px 0 0 var(--ink);
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-mono);
      font-size: 10px;
      box-sizing: border-box;
      min-width: 0;
    }
    .search-player-item:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .search-player-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1.5px solid var(--ink);
      background: var(--paper);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 10px;
      font-weight: bold;
      overflow: hidden;
      font-family: var(--font-var);
    }
    .search-player-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .search-player-info {
      min-width: 0;
      flex: 1;
    }
    .search-player-name {
      font-family: var(--font-var);
      font-size: 12px;
      font-weight: bold;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .search-player-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }
    .search-player-team {
      color: var(--dim);
      font-weight: bold;
    }
    .search-player-position {
      margin-left: auto;
      font-size: 9px;
      color: var(--dim);
    }
    .search-player-club {
      font-size: 9px;
      color: var(--dim);
      margin-top: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .search-no-results {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      text-align: center;
      padding: 32px;
      border: 2px dashed var(--ink);
      background: var(--paper-2);
      grid-column: 1 / -1;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => [
        s.knockoutMatches,
        s.myTopScorerPrediction ? `${s.myTopScorerPrediction.teamId}:${s.myTopScorerPrediction.playerName}` : '',
        s.myMvpPrediction ? `${s.myMvpPrediction.teamId}:${s.myMvpPrediction.playerName}` : '',
        s.viewMode
      ] as const,
      () => this.requestUpdate(),
      (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3],
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._mql = globalThis.matchMedia('(max-width: 768px)');
    this._isMobile = this._mql.matches;
    this._mql.addEventListener('change', this._onMqlChange);
    if (!this._oddsLoaded) {
      this._oddsLoaded = true;
      getAllOdds().then(o => { if (this.isConnected) this._odds = o; });
    }
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    this._mql?.removeEventListener('change', this._onMqlChange);
    this._ro?.disconnect();
    window.removeEventListener('resize', this._onResize);
    super.disconnectedCallback();
  }

  override updated() {
    if (this._isMobile) {
      if (this._desktopInited) {
        this._desktopInited = false;
        this._centerDone = false;
        this._ro?.disconnect();
        this._ro = undefined;
      }
    } else {
      if (!this._desktopInited) {
        this._desktopInited = true;
        this._centerDone = false;
        this._initDragScroll();
        const scrollEl = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
        if (scrollEl) {
          this._ro = new ResizeObserver(() => requestAnimationFrame(() => this._drawConnectors()));
          this._ro.observe(scrollEl);
        }
        window.addEventListener('resize', this._onResize);
      }
      requestAnimationFrame(() => {
        // En desktop intentamos mostrar toda la llave desde el inicio.
        if (!this._centerDone) {
          const scrollEl = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
          if (scrollEl && scrollEl.clientWidth > 0) {
            scrollEl.scrollLeft = 0;
            this._centerDone = true;
          }
        }
        this._drawConnectors();
      });
    }
  }

  private _drawConnectors() {
    const svg = this.shadowRoot?.querySelector<SVGElement>('svg.connectors');
    const container = this.shadowRoot?.querySelector<HTMLElement>('.bracket-container');
    if (!svg || !container) {
      this._connectorPaths = [];
      this._connectorSignature = '';
      return;
    }

    const cr = container.getBoundingClientRect();
    if (cr.width === 0) return;

    const getBox = (mid: string) => {
      const el = container.querySelector<HTMLElement>(`[data-mid="${mid}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        right: r.right - cr.left,
        left:  r.left  - cr.left,
        cy:    r.top   - cr.top + r.height / 2,
      };
    };

    const km = useTournamentStore.getState().knockoutMatches;
    const champion = km['FIN-01']?.winnerId ?? null;

    const regular: ConnectorPath[] = [];
    const champ: ConnectorPath[] = [];

    for (const { src, dst } of BRACKET_EDGES) {
      const s = getBox(src);
      const d = getBox(dst);
      if (!s || !d) continue;

      const isPlayed = !!(km[src]?.isPlayed);
      const isChampPath = champion !== null && km[src]?.winnerId === champion;
      const opacity = isPlayed ? '1' : '0.3';
      const dash = isPlayed ? '' : ' stroke-dasharray="6 4"';

      const isRightToLeft = s.left > d.right;
      let pathD = '';
      if (isRightToLeft) {
        const midX = (s.left + d.right) / 2;
        pathD = `M ${s.left},${s.cy} H ${midX} V ${d.cy} H ${d.right}`;
      } else {
        const midX = (s.right + d.left) / 2;
        pathD = `M ${s.right},${s.cy} H ${midX} V ${d.cy} H ${d.left}`;
      }

      if (isChampPath) {
        champ.push({
          d: pathD,
          stroke: 'var(--retro-yellow)',
          strokeWidth: '5',
          opacity: '1',
        });
      } else {
        regular.push({
          d: pathD,
          stroke: 'var(--ink)',
          strokeWidth: '2.5',
          opacity,
          dashArray: dash ? '6 4' : undefined,
        });
      }
    }

    const nextPaths = [...regular, ...champ];
    const signature = nextPaths
      .map(path => `${path.d}|${path.stroke}|${path.strokeWidth}|${path.opacity}|${path.dashArray ?? ''}`)
      .join(';');

    if (signature === this._connectorSignature) return;

    this._connectorSignature = signature;
    this._connectorPaths = nextPaths;
  }

  private _initDragScroll() {
    const el = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
    if (!el) return;
    let startX = 0;
    let scrollLeft0 = 0;
    let dragging = false;

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.match-box')) return;
      dragging = true;
      startX = e.pageX - el.getBoundingClientRect().left;
      scrollLeft0 = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging || e.pointerType !== 'mouse') return;
      const x = e.pageX - el.getBoundingClientRect().left;
      el.scrollLeft = scrollLeft0 - (x - startX);
    });
    const stopDrag = () => { dragging = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointerleave', stopDrag);
    el.addEventListener('pointercancel', stopDrag);
  }

  private getTeam(id: string | null) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private _getAccessibleTeamName(teamId: string | null) {
    return this.getTeam(teamId)?.name ?? 'Por decidir';
  }

  private _describeMatchForAssistiveTech(matchId: string) {
    const match = useTournamentStore.getState().knockoutMatches[matchId];
    if (!match) return `${matchId}: por decidir.`;

    const teamA = this._getAccessibleTeamName(match.teamA);
    const teamB = this._getAccessibleTeamName(match.teamB);
    const score = match.scoreA !== null && match.scoreB !== null
      ? ` Resultado ${match.scoreA}-${match.scoreB}.`
      : ' Sin resultado todavía.';
    const penalties = match.penaltyScoreA !== null && match.penaltyScoreB !== null
      ? ` Penaltis ${match.penaltyScoreA}-${match.penaltyScoreB}.`
      : '';
    const venue = match.venue ? ` ${match.venue}, ${match.city ?? ''}.`.replace(',.', '.') : '';
    return `${matchId}: ${teamA} contra ${teamB}.${score}${penalties}${venue}`;
  }

  private _getBracketAccessibleSummary() {
    const orderedMatchIds = [
      ...KNOCKOUT_BRACKET.roundOf32.map(match => match.id),
      ...KNOCKOUT_BRACKET.roundOf16.map(match => match.id),
      ...KNOCKOUT_BRACKET.quarterfinals.map(match => match.id),
      ...KNOCKOUT_BRACKET.semifinals.map(match => match.id),
      KNOCKOUT_BRACKET.final.id,
      KNOCKOUT_BRACKET.thirdPlace.id,
    ];

    return orderedMatchIds.map(matchId => this._describeMatchForAssistiveTech(matchId)).join(' ');
  }

  private openMatch(matchId: string) {
    const store = useTournamentStore.getState();
    if (store.viewMode === 'real') return;
    const match = store.knockoutMatches[matchId];
    if (!match?.teamA || !match?.teamB) return;
    if (!isMatchPending(match.date ?? '', match.timeSpain ?? '')) return;

    const stadium = STADIUMS.find(st => st.name === match.venue);
    openMatchModal({
      matchId: match.matchId,
      teamA: match.teamA,
      teamB: match.teamB,
      initialScoreA: match.scoreA,
      initialScoreB: match.scoreB,
      initialPenaltyScoreA: match.penaltyScoreA ?? null,
      initialPenaltyScoreB: match.penaltyScoreB ?? null,
      phase: 'knockout',
      goalScorers: match.goalScorers,
      venue: match.venue,
      city: match.city,
      timeSpain: match.timeSpain,
      stadiumImage: stadium?.image,
      onSave: ({ scoreA, scoreB, penaltyScoreA, penaltyScoreB }) => {
      useTournamentStore.getState().setKnockoutMatchResult(matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB);
      this._pulseId = matchId;
      setTimeout(() => { this._pulseId = null; }, 700);
      },
    });
  }

  private adjustInlineKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const store = useTournamentStore.getState();
    if (store.viewMode === 'real') return;
    const m = store.knockoutMatches[matchId];
    if (!m || !isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.scoreA ?? 0;
    const curB = m.scoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setKnockoutMatchResult(
      matchId, nextA, nextB,
      m.penaltyScoreA ?? null, m.penaltyScoreB ?? null,
    );
    this._flashMobId = matchId;
    setTimeout(() => { this._flashMobId = null; }, 500);
  }

  private adjustPenaltyKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const store = useTournamentStore.getState();
    if (store.viewMode === 'real') return;
    const m = store.knockoutMatches[matchId];
    if (!m || !isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.penaltyScoreA ?? 0;
    const curB = m.penaltyScoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setKnockoutMatchResult(
      matchId, m.scoreA, m.scoreB, nextA, nextB,
    );
    this._flashMobId = matchId;
    setTimeout(() => { this._flashMobId = null; }, 500);
  }
  private renderMatch(matchId: string, accentColor: string, idx = 0, isRightSide = false) {
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    const tA = this.getTeam(m?.teamA ?? null);
    const tB = this.getTeam(m?.teamB ?? null);
    const isPlayed = m?.isPlayed ?? false;
    const winnerId = m?.winnerId ?? null;
    const penaltyScoreA = m?.penaltyScoreA ?? null;
    const penaltyScoreB = m?.penaltyScoreB ?? null;
    const decidedOnPenalties = penaltyScoreA !== null && penaltyScoreB !== null;
    const isPending = isPlayed === false;
    const label = `${tA?.shortName ?? 'TBD'} vs ${tB?.shortName ?? 'TBD'}`;
    const isEditable = useTournamentStore.getState().isMatchEditable(matchId);
    const canEdit = !!(m?.teamA && m?.teamB && isMatchPending(m?.date ?? '', m?.timeSpain ?? '') && isEditable);
    const scoreAVal = m?.scoreA ?? 0;
    const scoreBVal = m?.scoreB ?? 0;
    const isDraw = canEdit && m?.scoreA !== null && m?.scoreB !== null && m?.scoreA === m?.scoreB;
    const penAVal = m?.penaltyScoreA ?? 0;
    const penBVal = m?.penaltyScoreB ?? 0;

    const renderRow = (teamId: string | null, score: number | null, teamAB: 'A' | 'B') => {
      const team = this.getTeam(teamId);
      const isWinner = winnerId !== null && winnerId === teamId;
      const isLoser  = winnerId !== null && winnerId !== teamId;
      const stepVal  = teamAB === 'A' ? scoreAVal : scoreBVal;
      const scoreClass = isPending ? 'pending' : '';
      const scoreText = isPlayed ? score : (isEditable ? '—' : '🔒');
      const scoreContent = canEdit
        ? html`<score-stepper
            .value=${stepVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="compact"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustInlineKnockout(e, matchId, teamAB, e.detail.delta)}></score-stepper>`
        : html`<div class="score ${scoreClass}">${scoreText}</div>`;
      return html`
        <div
          class="team-row ${isWinner ? 'winner-row' : ''} ${isLoser ? 'loser-row' : ''}"
          style="${isWinner ? `background: ${accentColor};` : ''}">
          <div class="team-info">
            ${renderFlag(team, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
            <span class="team-name">${team?.shortName ?? 'TBD'}</span>
          </div>
          ${scoreContent}
        </div>
      `;
    };

    const penaltiesSuffix = decidedOnPenalties
      ? `, penaltis ${penaltyScoreA}-${penaltyScoreB}`
      : '';
    const matchAriaLabel = isPlayed
      ? `Partido ${label}, resultado ${m.scoreA}-${m.scoreB}${penaltiesSuffix}`
      : `Partido ${label}, click para editar`;
    let penaltyNote: TemplateResult | string = '';
    if (isDraw) {
      penaltyNote = html`
        <div class="ko-pen-row">
          <span class="ko-pen-label">PEN</span>
          <score-stepper
            .value=${penAVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="compact"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustPenaltyKnockout(e, matchId, 'A', e.detail.delta)}></score-stepper>
          <span class="ko-pen-sep">·</span>
          <score-stepper
            .value=${penBVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="compact"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustPenaltyKnockout(e, matchId, 'B', e.detail.delta)}></score-stepper>
        </div>
      `;
    } else if (decidedOnPenalties) {
      penaltyNote = html`<div class="match-note">Penaltis · ${penaltyScoreA}-${penaltyScoreB}</div>`;
    }
    const odds = this._getOdds(matchId, m?.teamA, m?.teamB);
    let oddsTitle = '';
    if (odds) {
      let oddsSourceLabel = ' · estimado';
      if (odds.source === 'market') {
        oddsSourceLabel = ` · ${odds.bookmakers} casas`;
      }
      oddsTitle = `Probabilidad 1X2${oddsSourceLabel}`;
    }
    const oddsContent: TemplateResult | string = !odds || m?.isPlayed
      ? ''
      : html`
          <odds-bar
            title="${oddsTitle}"
            .home=${odds.home}
            .draw=${odds.draw}
            .away=${odds.away}
            variant="compact"
            .showFigures=${true}></odds-bar>
        `;

    const isRealMode = useTournamentStore.getState().viewMode === 'real';
    const modeBadgeClass = isRealMode ? 'mode-badge real' : 'mode-badge prediction';
    const modeBadgeText = isRealMode ? 'REAL' : 'PRED';

    return html`
      <div
        data-mid="${matchId}"
        class="match-box ${this._pulseId === matchId ? 'pulse' : ''} ${isRightSide ? 'right-side' : ''}"
        style="--i:${idx}; ${isRightSide ? `border-right-color: ${accentColor};` : `border-left-color: ${accentColor};`}"
        role="button"
        tabindex="0"
        aria-label="${matchAriaLabel}"
        @click="${() => this.openMatch(matchId)}"
        @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.openMatch(matchId)}">
        ${renderRow(m?.teamA ?? null, m?.scoreA ?? null, 'A')}
        <div class="team-separator"></div>
        ${renderRow(m?.teamB ?? null, m?.scoreB ?? null, 'B')}
        ${penaltyNote}
        ${oddsContent}

        ${(m as any)?.date ? html`
          <div class="ko-schedule">
            <span class="ko-sched-date">${formatShortDate((m as any).date)}</span>
            ${(m as any).timeSpain ? html`<span class="ko-sched-time">${(m as any).timeSpain} ESP</span>` : ''}
          </div>
        ` : ''}

        ${(m as any)?.venue ? html`
          <div style="padding: 2px 8px; border-top: 1px solid var(--ink); display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.03);">
            ${(() => {
              const st = STADIUMS.find(s => s.name === (m as any).venue);
              return st ? html`<img src="${st.image}" style="width: 16px; height: 10px; object-fit: cover; border: 1px solid var(--ink);" alt="">` : '';
            })()}
            <span style="font-family: var(--font-mono); font-size: 8px; color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${(m as any).venue} · ${(m as any).city}
            </span>
          </div>
        ` : ''}
        ${isPlayed ? html`<span class="${modeBadgeClass}">${modeBadgeText}</span>` : ''}
      </div>
    `;
  }

  /** Returns odds synchronously from cache; if missing, triggers async load and re-render. */
  private _getOdds(matchId: string, teamA: string | null | undefined, teamB: string | null | undefined): MatchOdds | null {
    if (this._odds[matchId]) return this._odds[matchId];
    if (!teamA || !teamB) return null;
    getOddsForMatch(matchId, teamA, teamB).then(o => {
      if (o && this.isConnected) this._odds = { ...this._odds, [matchId]: o };
    });
    return null;
  }

  private handleSimulate() {
    useTournamentStore.getState().autoSimulateKnockout();
  }

  private handleGenerate() {
    useTournamentStore.getState().initializeKnockoutFromGroups();
  }

  // ─── Mobile helpers ───────────────────────────────────────────────

  private _getTeamsInBracket(): string[] {
    const km = useTournamentStore.getState().knockoutMatches;
    const set = new Set<string>();
    for (const m of Object.values(km)) {
      if (m.teamA) set.add(m.teamA);
      if (m.teamB) set.add(m.teamB);
    }
    return set.size > 0 ? [...set] : TEAMS_2026.map(t => t.id);
  }

  private _effectivePathTeamId(): string | null {
    if (this._pathTeamId) return this._pathTeamId;
    const km = useTournamentStore.getState().knockoutMatches;
    const champ = km['FIN-01']?.winnerId;
    if (champ) return champ;
    return this._getTeamsInBracket()[0] ?? null;
  }

  private _getTeamPath(teamId: string) {
    const km = useTournamentStore.getState().knockoutMatches;
    const path: Array<{
      stageLabel: string;
      abbr: string;
      color: string;
      opponentId: string | null;
      isWin: boolean | null;
      myScore: number | null;
      oppScore: number | null;
      hasPen: boolean;
    }> = [];
    for (const stage of MOBILE_STAGES) {
      for (const mid of stage.matchIds) {
        const m = km[mid];
        if (!m) continue;
        const teamIsA = m.teamA === teamId;
        const teamIsB = m.teamB === teamId;
        if (!teamIsA && !teamIsB) continue;
        const opponentId = teamIsA ? m.teamB : m.teamA;
        const isWin = m.winnerId === null ? null : m.winnerId === teamId;
        const myScore  = teamIsA ? m.scoreA : m.scoreB;
        const oppScore = teamIsA ? m.scoreB : m.scoreA;
        path.push({
          stageLabel: stage.label,
          abbr: stage.abbr,
          color: stage.color,
          opponentId,
          isWin,
          myScore,
          oppScore,
          hasPen: m.penaltyScoreA !== null && m.penaltyScoreA !== undefined,
        });
        break;
      }
    }
    return path;
  }

  private _renderMobileMatchCard(matchId: string, roundColor: string) {
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    if (!m) return html``;
    const tA = this.getTeam(m.teamA ?? null);
    const tB = this.getTeam(m.teamB ?? null);
    const winA = m.winnerId !== null && m.winnerId === m.teamA;
    const winB = m.winnerId !== null && m.winnerId === m.teamB;
    const isPending = !m.isPlayed;
    const isEditable = useTournamentStore.getState().isMatchEditable(matchId);
    const canEdit = !!(m.teamA && m.teamB && isMatchPending(m.date ?? '', m.timeSpain ?? '') && isEditable);
    const isDraw = canEdit && m.scoreA !== null && m.scoreB !== null && m.scoreA === m.scoreB;
    const penAVal = m.penaltyScoreA ?? 0;
    const penBVal = m.penaltyScoreB ?? 0;

    const row = (team: ReturnType<typeof this.getTeam>, score: number | null, teamAB: 'A' | 'B', isWin: boolean, isLose: boolean) => {
      const stepVal = teamAB === 'A' ? (m.scoreA ?? 0) : (m.scoreB ?? 0);
      const mobileScoreClass = isPending && score === null ? 'pending' : '';
      const mobileScoreText = m.isPlayed ? score : (isEditable ? '—' : '🔒');
      const mobileScoreContent = canEdit
        ? html`<score-stepper
            .value=${stepVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="mobile"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustInlineKnockout(e, matchId, teamAB, e.detail.delta)}></score-stepper>`
        : html`<div class="mob-score ${mobileScoreClass}">${mobileScoreText}</div>`;
      return html`
        <div
          class="mob-team-row ${isWin ? 'winner' : ''} ${isLose ? 'loser' : ''}"
          style="${isWin ? `background: ${roundColor};` : ''}">
          <div class="mob-team-info">
            ${renderFlag(team, { size: 'sm', imgClass: 'flag-img', flagClass: 'flag' })}
            <span class="code">${team?.shortName ?? 'TBD'}</span>
            <span class="name">${team?.name ?? ''}</span>
          </div>
          ${mobileScoreContent}
        </div>
      `;
    };

    const mobOdds = this._getOdds(matchId, m.teamA, m.teamB);
    const venueName = (m as any).venue;
    const cityName = (m as any).city;
    const matchDate = (m as any).date;
    const matchTime = (m as any).timeSpain;
    let mobPenaltyNote: TemplateResult | string = '';
    if (isDraw) {
      mobPenaltyNote = html`
        <div class="mob-pen-row">
          <span class="mob-pen-label">PEN</span>
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <score-stepper
              .value=${penAVal}
              decrementLabel=${t('groups.decScore')}
              incrementLabel=${t('groups.incScore')}
              variant="mobile"
              @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustPenaltyKnockout(e, matchId, 'A', e.detail.delta)}></score-stepper>
            <span class="mob-pen-team-code">${tA?.shortName ?? ''}</span>
          </div>
          <span class="mob-pen-sep">—</span>
          <div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <score-stepper
              .value=${penBVal}
              decrementLabel=${t('groups.decScore')}
              incrementLabel=${t('groups.incScore')}
              variant="mobile"
              @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustPenaltyKnockout(e, matchId, 'B', e.detail.delta)}></score-stepper>
            <span class="mob-pen-team-code">${tB?.shortName ?? ''}</span>
          </div>
        </div>
      `;
    } else if (m.penaltyScoreA !== null && m.penaltyScoreB !== null) {
      mobPenaltyNote = html`<div class="mob-pen-note">PENALTIS · ${m.penaltyScoreA}-${m.penaltyScoreB}</div>`;
    }
    let mobOddsTitle = '';
    if (mobOdds) {
      let mobOddsSourceLabel = ' · estimado';
      if (mobOdds.source === 'market') {
        mobOddsSourceLabel = ` · ${mobOdds.bookmakers} casas`;
      }
      mobOddsTitle = `Probabilidad 1X2${mobOddsSourceLabel}`;
    }
    const mobOddsContent: TemplateResult | string = mobOdds && !m.isPlayed
      ? html`
          <odds-bar
            style="margin:2px 4px 3px;"
            title="${mobOddsTitle}"
            .home=${mobOdds.home}
            .draw=${mobOdds.draw}
            .away=${mobOdds.away}
            variant="compact"
            .showFigures=${true}></odds-bar>
        `
      : '';
    const venueImage = venueName
      ? STADIUMS.find(s => s.name === venueName)?.image ?? ''
      : '';
    const venueImageContent: TemplateResult | string = venueImage ? html`<img src="${venueImage}" class="mob-venue-img" alt="">` : '';
    const matchDateLabel = matchDate ? ` · ${formatShortDate(matchDate)}` : '';
    const matchTimeLabel = matchTime ? ` · ${matchTime} ESP` : '';
    const venueContent: TemplateResult | string = venueName
      ? html`
          <div class="mob-match-venue">
            ${venueImageContent}
            <span>${venueName} · ${cityName}${matchDateLabel}${matchTimeLabel}</span>
          </div>
        `
      : '';

    return html`
      <div class="mob-match-card ${this._flashMobId === matchId ? 'mob-flash' : ''}" @click="${() => this.openMatch(matchId)}" role="button" tabindex="0"
           @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.openMatch(matchId)}">
        ${row(tA, m.scoreA, 'A', winA, winB)}
        ${row(tB, m.scoreB, 'B', winB, winA)}
        ${mobPenaltyNote}
        ${mobOddsContent}
        ${venueContent}
      </div>
    `;
  }

  // ─── Desktop V3 ──────────────────────────────────────────────────

  private _renderDesktop() {
    const km = useTournamentStore.getState().knockoutMatches;
    const hasKnockout = Object.keys(km).length > 0;
    const showGenerateButton = !hasKnockout;
    const championId = km['FIN-01']?.winnerId;
    const champion = this.getTeam(championId ?? null);

    const r32L = ['R32-01','R32-02','R32-03','R32-04','R32-05','R32-06','R32-07','R32-08'];
    const r32R = ['R32-09','R32-10','R32-11','R32-12','R32-13','R32-14','R32-15','R32-16'];
    const r16L = ['R16-01','R16-02','R16-03','R16-04'];
    const r16R = ['R16-05','R16-06','R16-07','R16-08'];
    const qfL  = ['QF-01','QF-02'];
    const qfR  = ['QF-03','QF-04'];

    return html`
      <!-- Barra de acciones cromo (Generar / Simular) -->
      <div class="bracket-actions">
        <div class="bracket-actions-label">${t('knockout.desktopLabel')}</div>
        <div class="bracket-actions-btns">
          ${showGenerateButton
            ? html`<button class="btn btn-primary" @click="${this.handleGenerate}">${t('knockout.generate')}</button>`
            : html`<button class="btn" @click="${this.handleSimulate}">${t('knockout.simulate')}</button>`
          }
        </div>
      </div>

      <!-- Cabecera tipo póster V3 -->
      <div class="poster-header">
        <div class="poster-eyebrow">${t('knockout.posterEyebrow')}</div>
        <h1 class="poster-h1">${t('knockout.posterTitlePrefix')} <span class="gloria">${t('knockout.posterTitleGlory')}</span></h1>
        <span class="poster-corner left">N° 01</span>
        <span class="poster-corner right">USA · MEX · CAN</span>
      </div>

      ${this._renderAwardsPanel()}

      <!-- Bracket con fondo cromo fuerte -->
      <div class="bracket-scroll" style="
        background: var(--paper);
        background-image:
          radial-gradient(circle, rgba(26,25,51,0.10) 1.4px, transparent 1.6px) 0 0 / 7px 7px,
          repeating-linear-gradient(135deg, rgba(232,84,31,0.05) 0 6px, transparent 6px 22px),
          radial-gradient(ellipse 1000px 700px at 50% 0%, rgba(34,65,140,0.10), transparent 60%);
      ">
        <div class="bracket-container">
          <svg class="connectors" aria-hidden="true">
            ${this._connectorPaths.map(path => html`
              <path
                d="${path.d}"
                stroke="${path.stroke}"
                stroke-width="${path.strokeWidth}"
                fill="none"
                stroke-linejoin="miter"
                opacity="${path.opacity}"
                stroke-dasharray="${path.dashArray ?? ''}"></path>
            `)}
          </svg>

          <!-- LADO IZQUIERDO -->
          <div class="round-col" id="col-r32-left">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.r32}; background-color: ${ROUND_COLORS.r32}">
              <span>1/16</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[8]</span>
            </div>
            <div class="matches-wrap">
              ${r32L.map((id, i) => this.renderMatch(id, ROUND_COLORS.r32, i, false))}
            </div>
          </div>
          <div class="round-col" id="col-r16-left">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.r16}; background-color: ${ROUND_COLORS.r16}">
              <span>OCTAVOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[4]</span>
            </div>
            <div class="matches-wrap">
              ${r16L.map((id, i) => this.renderMatch(id, ROUND_COLORS.r16, i, false))}
            </div>
          </div>
          <div class="round-col" id="col-qf-left">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.qf}; background-color: ${ROUND_COLORS.qf}">
              <span>CUARTOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[2]</span>
            </div>
            <div class="matches-wrap">
              ${qfL.map((id, i) => this.renderMatch(id, ROUND_COLORS.qf, i, false))}
            </div>
          </div>
          <div class="round-col" id="col-sf-left">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.sf}; background-color: ${ROUND_COLORS.sf}">
              <span>SEMIS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            <div class="matches-wrap">
              ${this.renderMatch('SF-01', ROUND_COLORS.sf, 0, false)}
            </div>
          </div>

          <!-- CENTRO: Final + Campeón + Tercer puesto -->
          <div class="round-col is-final" id="col-final">
            <div class="round-title is-final" style="--round-color: ${ROUND_COLORS.final}; background-color: ${ROUND_COLORS.final}">
              <span>FINAL</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            ${this.renderMatch('FIN-01', ROUND_COLORS.final, 0, false)}

            <!-- Caja campeón V3 con halftone overlay y sombra doble -->
            <div class="champion-box">
              <div class="champion-halftone"></div>
              <div class="champion-inner">
                <div class="champion-trophy">🏆</div>
                <div class="champion-title">${t('knockout.desktopChampionTitle')}</div>
                ${champion
                  ? html`<div class="champion-team">${renderFlag(champion, { size: 'sm', imgClass: 'flag-img-champion', flagClass: 'team-flag' })} ${champion.name.toUpperCase()}</div>`
                  : html`<div class="champion-team tbd">${t('knockout.toBeDefined')}</div>`
                }
              </div>
            </div>

            <div class="third-place-title">${t('knockout.thirdPlace')}</div>
            ${this.renderMatch('TP-01', ROUND_COLORS.sf, 1, false)}
          </div>

          <!-- LADO DERECHO (espejado) -->
          <div class="round-col" id="col-sf-right">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.sf}; background-color: ${ROUND_COLORS.sf}">
              <span>SEMIS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            <div class="matches-wrap">
              ${this.renderMatch('SF-02', ROUND_COLORS.sf, 0, true)}
            </div>
          </div>
          <div class="round-col" id="col-qf-right">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.qf}; background-color: ${ROUND_COLORS.qf}">
              <span>CUARTOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[2]</span>
            </div>
            <div class="matches-wrap">
              ${qfR.map((id, i) => this.renderMatch(id, ROUND_COLORS.qf, i, true))}
            </div>
          </div>
          <div class="round-col" id="col-r16-right">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.r16}; background-color: ${ROUND_COLORS.r16}">
              <span>OCTAVOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[4]</span>
            </div>
            <div class="matches-wrap">
              ${r16R.map((id, i) => this.renderMatch(id, ROUND_COLORS.r16, i, true))}
            </div>
          </div>
          <div class="round-col" id="col-r32-right">
            <div class="round-title" style="--round-color: ${ROUND_COLORS.r32}; background-color: ${ROUND_COLORS.r32}">
              <span>1/16</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[8]</span>
            </div>
            <div class="matches-wrap">
              ${r32R.map((id, i) => this.renderMatch(id, ROUND_COLORS.r32, i, true))}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Mobile V3 cromo ─────────────────────────────────────────────

  private _renderMobile() {
    const km = useTournamentStore.getState().knockoutMatches;
    const hasKnockout = Object.keys(km).length > 0;
    const totalMatches = MOBILE_STAGES.reduce((s, st) => s + st.matchIds.length, 0) + 1; // +TP-01
    const stage = MOBILE_STAGES[this._mobileStage];
    const championId = km['FIN-01']?.winnerId;
    const champion = this.getTeam(championId ?? null);
    let stageMatchLabel = t('knockout.matchPlural');
    if (stage.matchIds.length === 1) {
      stageMatchLabel = t('knockout.matchSingular');
    }
    let championVisual: TemplateResult = html`<div style="font-family:var(--font-var);font-size:18px;color:var(--ink);opacity:0.4;">${t('knockout.toBeDefined')}</div>`;
    if (champion) {
      const championFlag = champion.flagUrl
        ? html`<img src="${champion.flagUrl}" alt="${champion.name}" style="width:48px;height:32px;object-fit:cover;border:2px solid var(--ink);box-shadow:2px 2px 0 0 var(--ink);">`
        : html`<span style="font-size:40px">${(champion as any).flag}</span>`;
      championVisual = html`
        <div style="margin-bottom:6px;">${championFlag}</div>
        <div style="font-family:var(--font-var);font-size:26px;color:var(--ink);">${champion.name.toUpperCase()}</div>
      `;
    }
    let championStageContent: TemplateResult | string = '';
    if (this._mobileStage === 4) {
      championStageContent = html`
        <div class="mob-champion-card">
          <div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(0,0,0,0.10) 1.4px,transparent 1.6px);background-size:7px 7px;pointer-events:none;"></div>
          <div style="position:relative;text-align:center;">
            <div style="font-size:40px;line-height:1;margin-bottom:4px;">🏆</div>
            <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.3em;font-weight:700;color:var(--ink);margin-bottom:8px;">${t('knockout.worldChampion26')}</div>
            ${championVisual}
          </div>
        </div>
        <div class="mob-third-label">${t('knockout.thirdPlace')}</div>
        ${this._renderMobileMatchCard('TP-01', ROUND_COLORS.sf)}
      `;
    }
    let mobileModeContent: TemplateResult = this._renderPathMode();
    if (this._mobileMode === 'all') {
      mobileModeContent = html`
        <div class="mob-chips">
          ${MOBILE_STAGES.map((s, i) => html`
            <button
              class="mob-chip ${i === this._mobileStage ? 'active' : ''}"
              style="${i === this._mobileStage ? `background: ${s.color};` : ''}"
              @click="${() => { this._mobileStage = i; lightTap(); requestAnimationFrame(() => { const chips = this.shadowRoot?.querySelector('.mob-chips'); const active = chips?.querySelector<HTMLElement>('.mob-chip.active'); active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }); }); }}">
              ${s.label}
              <span style="font-family: var(--font-mono); font-size: 9px; opacity: 0.7;">[${s.abbr}]</span>
            </button>
          `)}
        </div>

        <div
          class="mob-body"
          @touchstart="${this._onMobBodyTouchStart}"
          @touchend="${this._onMobBodyTouchEnd}">

          <!-- Banner de fase con botones prev/next y contador -->
          <div class="mob-stage-nav">
            <button
              class="mob-stage-nav-btn prev"
              ?disabled="${this._mobileStage === 0}"
              @click="${() => this._goToStage(-1)}"
              aria-label="Fase anterior">‹</button>
            <div class="mob-stage-banner mob-stage-banner-wrap" style="background: ${stage.color}; margin-bottom: 0;">
              <div class="mob-banner-dots"></div>
              <span class="mob-banner-label">${stage.label}</span>
              <span class="mob-banner-count">
                ${this._mobileStage + 1}/${MOBILE_STAGES.length}
                · ${stage.matchIds.length} ${stageMatchLabel}
              </span>
            </div>
            <button
              class="mob-stage-nav-btn next"
              ?disabled="${this._mobileStage === MOBILE_STAGES.length - 1}"
              @click="${() => this._goToStage(1)}"
              aria-label="Fase siguiente">›</button>
          </div>

          ${stage.matchIds.map(id => this._renderMobileMatchCard(id, stage.color))}
          ${championStageContent}
        </div>
      `;
    }
    let pickerOverlay: TemplateResult | string = '';
    if (this._showTeamPicker) {
      pickerOverlay = this._renderTeamPicker();
    }
    let headerAction: TemplateResult;
    if (hasKnockout) {
      headerAction = html`<button class="mob-header-action" @click="${this.handleSimulate}">🎲 ${t('knockout.simulate')}</button>`;
    } else {
      headerAction = html`<button class="mob-header-action" @click="${this.handleGenerate}">⚡ ${t('knockout.generate')}</button>`;
    }

    return html`
      <div class="mob-layout">
        <!-- Cabecera cromo -->
        <div class="mob-header">
          <div class="mob-header-top">
            <div class="mob-header-eyebrow">★ CHAMPIONS 26/27 ★</div>
            ${headerAction}
          </div>
          <div class="mob-header-title">${t('knockout.mobileTitle')}</div>
          <div class="mob-header-sub">${t('knockout.mobileSubtitle', { n: totalMatches })}</div>
        </div>

        <!-- Toggle TODO EL BRACKET / MI CAMINO -->
        <div class="mob-toggle-row" style="padding-bottom:10px;">
          <div class="mob-toggle">
            <button
              class="mob-toggle-btn ${this._mobileMode === 'all' ? 'active' : ''}"
              @click="${() => { this._mobileMode = 'all'; }}">
              ${t('knockout.mobileViewAll')}
            </button>
            <button
              class="mob-toggle-btn ${this._mobileMode === 'path' ? 'active' : ''}"
              @click="${() => { this._mobileMode = 'path'; }}">
              ${t('knockout.mobileViewPath')}
            </button>
          </div>
        </div>

        ${this._renderAwardsPanel()}

        ${mobileModeContent}

        <!-- Team picker overlay -->
        ${pickerOverlay}
      </div>
    `;
  }

  // ─── Swipe interno entre fases del bracket (modo "all" en móvil) ───

  /** Avanza o retrocede una fase y hace scroll del chip activo a la vista. */
  private _goToStage(delta: 1 | -1) {
    const next = Math.min(MOBILE_STAGES.length - 1, Math.max(0, this._mobileStage + delta));
    if (next === this._mobileStage) return;
    this._mobileStage = next;
    lightTap();
    // Scroll del chip activo a la vista tras el render
    requestAnimationFrame(() => {
      const chips = this.shadowRoot?.querySelector('.mob-chips');
      const active = chips?.querySelector<HTMLElement>('.mob-chip.active');
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  }

  private _onMobBodyTouchStart(e: TouchEvent) {
    this._mobSwipeStartX = e.touches[0].clientX;
  }

  private _onMobBodyTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this._mobSwipeStartX;
    if (Math.abs(dx) < 48) return;  // umbral: gesto intencional
    this._goToStage(dx < 0 ? 1 : -1);
  }

  private _renderPathMode() {
    const teamId = this._effectivePathTeamId();
    const team = teamId ? this.getTeam(teamId) : null;
    const path = teamId ? this._getTeamPath(teamId) : [];
    const km = useTournamentStore.getState().knockoutMatches;
    const isChampion = teamId !== null && km['FIN-01']?.winnerId === teamId;
    const teamFlagContent = team?.flagUrl
      ? html`<img src="${team.flagUrl}" alt="${team.name}" style="width:100%;height:100%;object-fit:cover;">`
      : html`<span style="font-size:36px">?</span>`;
    const championBadge = isChampion
      ? html`<div style="font-family:var(--font-mono);font-size:10px;opacity:0.9;margin-top:4px;letter-spacing:0.1em;">🏆 ${t('knockout.championBadge', { n: path.length })}</div>`
      : '';
    const emptyPathContent = html`<div style="font-family:var(--font-mono);font-size:11px;color:var(--dim);letter-spacing:0.15em;text-align:center;padding:24px 0;">${t('knockout.noMatchesAvailable')}</div>`;
    const trophyContent = isChampion
      ? html`
          <div class="mob-trophy-item">
            <div class="mob-trophy-node">🏆</div>
            <div class="mob-trophy-card">
              <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.25em;font-weight:700;color:var(--ink);">${t('knockout.worldChampion')}</div>
              <div style="font-family:var(--font-var);font-size:20px;line-height:1;margin-top:2px;color:var(--ink);">${team?.name.toUpperCase()} 2026</div>
            </div>
          </div>
        `
      : '';
    const timelineContent = path.length === 0
      ? emptyPathContent
      : html`
          <div class="mob-timeline">
            <div class="mob-timeline-line"></div>
            ${path.map(p => {
              const opp = p.opponentId ? this.getTeam(p.opponentId) : null;
              let resultLabel = '—';
              if (p.isWin === true) {
                resultLabel = t('knockout.resultWin', { score: `${p.myScore}-${p.oppScore}` });
              } else if (p.isWin === false) {
                resultLabel = t('knockout.resultLose', { score: `${p.myScore}-${p.oppScore}` });
              }
              let resultBg = 'var(--dim)';
              if (p.isWin === true) {
                resultBg = p.color;
              } else if (p.isWin === false) {
                resultBg = 'var(--retro-red)';
              }
              const opponentVisual = opp?.flagUrl
                ? html`<img src="${opp.flagUrl}" alt="${opp.name}" style="width:24px;height:16px;object-fit:cover;border:1px solid var(--ink);flex-shrink:0;">`
                : html`<span style="font-size:22px;flex-shrink:0;">?</span>`;
              return html`
                <div class="mob-timeline-item">
                  <div class="mob-node" style="background: ${p.color};">${p.abbr}</div>
                  <div class="mob-item-card">
                    <div class="mob-item-opponent">
                      ${opponentVisual}
                      <div>
                        <div style="font-family:var(--font-var);font-size:14px;line-height:1;">vs ${opp?.shortName ?? 'TBD'}</div>
                        <div style="font-family:var(--font-mono);font-size:9px;color:var(--dim);letter-spacing:0.1em;margin-top:2px;">${p.stageLabel}</div>
                      </div>
                    </div>
                    <div class="mob-result-badge" style="background: ${resultBg};">${resultLabel}</div>
                  </div>
                </div>
              `;
            })}
            ${trophyContent}
          </div>
        `;

    return html`
      <div class="mob-path-body">
        <!-- Equipo hero -->
        <div class="mob-team-hero" style="background: var(--retro-green);">
          <div class="mob-hero-halftone"></div>
          <div class="hero-flag-box">
            ${teamFlagContent}
          </div>
          <div class="hero-info">
            <div class="hero-label">${t('knockout.following')}</div>
            <div class="hero-name">${team?.name.toUpperCase() ?? t('knockout.none')}</div>
            ${championBadge}
          </div>
          <button class="mob-hero-change"
            aria-expanded="${this._showTeamPicker}"
            aria-controls="team-picker-panel"
            @click="${() => { this._showTeamPicker = true; }}">${t('knockout.changeTeam')}</button>
        </div>

        <!-- Timeline -->
        ${timelineContent}
      </div>
    `;
  }

  private _renderTeamPicker() {
    const teams = this._getTeamsInBracket();
    const currentId = this._effectivePathTeamId();
    const q = this._pickerSearch.trim().toLowerCase();
    const filtered = q.length > 0
      ? teams.filter(id => {
          const t = this.getTeam(id);
          return t && (t.name.toLowerCase().includes(q) || t.shortName.toLowerCase().includes(q) || id.toLowerCase().includes(q));
        })
      : teams;

    const groups = 'ABCDEFGHIJKL'.split('');
    const teamsByGroup = new Map<string, string[]>();
    if (q.length > 0) {
      teamsByGroup.set('RESULTS', filtered);
    } else {
      for (const group of groups) {
        const groupTeams = filtered.filter(id => {
          const t = this.getTeam(id);
          return t?.group === group;
        });
        if (groupTeams.length > 0) teamsByGroup.set(group, groupTeams);
      }
    }

    return html`
      <div class="mob-picker-backdrop" @click="${(e: Event) => {
        if (e.target === e.currentTarget) { this._showTeamPicker = false; this._pickerSearch = ''; }
      }}">
        <div id="team-picker-panel" class="mob-picker-sheet" role="dialog" aria-modal="true">
          <div class="mob-picker-header">
            <span class="mob-picker-title">${t('knockout.selectTeam')}</span>
            <button class="mob-picker-close" @click="${() => { this._showTeamPicker = false; this._pickerSearch = ''; }}">${t('knockout.closePicker')}</button>
          </div>
          <div class="mob-picker-search">
            <input
              type="search"
              class="mob-picker-input"
              placeholder="${t('knockout.searchTeamPlaceholder')}"
              .value="${this._pickerSearch}"
              @input="${(e: InputEvent) => { this._pickerSearch = (e.target as HTMLInputElement).value; }}"
            >
            ${this._pickerSearch.length > 0 ? html`
              <button class="mob-picker-clear" @click="${() => { this._pickerSearch = ''; }}">✕</button>
            ` : ''}
          </div>
          <div class="mob-picker-list">
            ${q.length > 0 && filtered.length === 0 ? html`
              <div class="mob-picker-empty">${t('knockout.noResults')}</div>
            ` : [...teamsByGroup.entries()].map(([groupLabel, groupTeams]) => html`
              <div class="mob-picker-group">
                <div class="mob-picker-group-title">${q.length > 0 ? t('knockout.results') : t('knockout.groupLabel', { letter: groupLabel })}</div>
                <div class="mob-picker-chips">
                  ${groupTeams.map(id => {
                    const team = this.getTeam(id);
                    if (!team) return '';
                    return html`
                      <button
                        class="mob-team-chip ${id === currentId ? 'selected' : ''}"
                        @click="${() => { this._pathTeamId = id; this._showTeamPicker = false; this._pickerSearch = ''; }}">
                        ${team.flagUrl
                          ? html`<img src="${team.flagUrl}" alt="${team.name}" style="width:20px;height:13px;object-fit:cover;border:1px solid var(--ink);">`
                          : html`<span>?</span>`
                        }
                        ${team.shortName}
                      </button>
                    `;
                  })}
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private _openAwardsSelector(type: 'topScorer' | 'mvp') {
    this._showAwardsModal = type;
    this._selectedTeamIdForSelector = '';
    this._awardsSearchQuery = '';
    this.requestUpdate();
  }

  private _closeAwardsSelector() {
    this._showAwardsModal = null;
    this._selectedTeamIdForSelector = '';
    this._awardsSearchQuery = '';
    this.requestUpdate();
  }

  private _selectPlayer(player: Player, teamId?: string) {
    const type = this._showAwardsModal;
    if (!type) return;

    const resolvedTeamId = teamId ?? this._selectedTeamIdForSelector;
    const awardVal = { teamId: resolvedTeamId, playerName: player.name };

    const store = useTournamentStore.getState();
    if (type === 'topScorer') {
      store.setMyTopScorerPrediction(awardVal);
    } else {
      store.setMyMvpPrediction(awardVal);
    }

    this._closeAwardsSelector();
  }

  private _renderAwardsPanel() {
    const store = useTournamentStore.getState();
    const topScorer = store.myTopScorerPrediction;
    const mvp = store.myMvpPrediction;

    return html`
      <div class="awards-panel">
        <div class="awards-title">
          🏅 ${t('knockout.awardsTitle')}
        </div>
        <div class="awards-grid">
          <div class="award-card">
            <div class="award-main">
              <span class="award-icon">👟</span>
              <div class="award-info">
                <div class="award-category">${t('knockout.topScorerLabel')}</div>
                <div class="award-value">
                  ${topScorer ? `${topScorer.playerName} (${topScorer.teamId})` : t('knockout.notSelected')}
                </div>
              </div>
            </div>
            <button class="award-btn" @click=${() => this._openAwardsSelector('topScorer')}>
              ${topScorer ? t('knockout.change') : t('knockout.select')}
            </button>
          </div>

          <div class="award-card">
            <div class="award-main">
              <span class="award-icon">⭐</span>
              <div class="award-info">
                <div class="award-category">${t('knockout.mvpLabel')}</div>
                <div class="award-value">
                  ${mvp ? `${mvp.playerName} (${mvp.teamId})` : t('knockout.notSelected')}
                </div>
              </div>
            </div>
            <button class="award-btn" @click=${() => this._openAwardsSelector('mvp')}>
              ${mvp ? t('knockout.change') : t('knockout.select')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _renderAwardsSelectionModal() {
    if (!this._showAwardsModal) return '';
    const typeLabel = this._showAwardsModal === 'topScorer'
      ? t('knockout.topScorerLabel').toUpperCase()
      : t('knockout.mvpLabel').toUpperCase();
    const teams = TEAMS_2026;
    const selectedTeamId = this._selectedTeamIdForSelector;
    const squad = selectedTeamId ? SQUADS[selectedTeamId] || [] : [];

    return html`
      <div class="awards-modal-backdrop" @click=${this._closeAwardsSelector}>
        <div class="awards-modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="awards-modal-header">
            <span class="awards-modal-title">
              🏅 ${t('knockout.awardsSelectionTitle', { award: typeLabel })}
            </span>
            <button class="awards-modal-close" @click=${this._closeAwardsSelector}>✕</button>
          </div>

          <div class="awards-modal-body">
            <!-- Buscador híbrido -->
            <div class="awards-search-bar" style="position: relative;">
              <input
                type="search"
                class="awards-search-input"
                .value=${this._awardsSearchQuery}
                @input=${(e: InputEvent) => { this._awardsSearchQuery = (e.target as HTMLInputElement).value; this.requestUpdate(); }}
                placeholder="Buscar jugador, selección o club…"
                autofocus
              />
              ${this._awardsSearchQuery.length > 0 ? html`
                <button 
                  style="all: unset; cursor: pointer; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-family: var(--font-mono); font-size: 14px; font-weight: bold; color: var(--dim); padding: 4px;"
                  @click=${() => { this._awardsSearchQuery = ''; this.requestUpdate(); }}
                >✕</button>
              ` : ''}
            </div>

            ${this._awardsSearchQuery.trim().length >= 2 ? (() => {
              const query = this._awardsSearchQuery.trim();
              const normalizedQuery = query
                .toLowerCase()
                .normalize('NFD')
                .replace(/\p{Diacritic}/gu, '');

              const allPlayers = Object.entries(SQUADS).flatMap(([teamId, players]) =>
                players.map(p => ({
                  ...p,
                  teamId,
                  teamName: TEAMS_2026.find(t => t.id === teamId)?.name ?? teamId,
                }))
              );

              const results = allPlayers.filter(p => {
                const haystack = `${p.name} ${p.teamName} ${p.teamId} ${p.club}`
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/\p{Diacritic}/gu, '');
                return haystack.includes(normalizedQuery);
              });

              const totalMatches = results.length;
              const displayed = results.slice(0, 80);

              if (displayed.length === 0) {
                return html`
                  <div class="search-no-results">
                    Sin resultados para «${query}»
                  </div>
                `;
              }

              return html`
                <div class="awards-search-results-label">
                  Mostrando ${displayed.length} de ${totalMatches} jugadores
                </div>
                <div class="awards-search-grid">
                  ${displayed.map(p => {
                    const team = TEAMS_2026.find(t => t.id === p.teamId);
                    return html`
                      <button
                        class="search-player-item"
                        @click=${() => this._selectPlayer(p, p.teamId)}
                      >
                        <div class="search-player-avatar">
                          ${p.photoUrl
                            ? html`<img src=${p.photoUrl} alt="" loading="lazy">`
                            : p.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="search-player-info">
                          <div class="search-player-name">${p.name}</div>
                          <div class="search-player-meta">
                            ${team ? renderFlag(team, { size: 'xs' }) : ''}
                            <span class="search-player-team">${p.teamId}</span>
                            <span class="search-player-position">#${p.number} · ${p.position}</span>
                          </div>
                          <div class="search-player-club">${p.club}</div>
                        </div>
                      </button>
                    `;
                  })}
                </div>
              `;
            })() : html`
              <!-- Búsqueda vacía / corta: Flujo clásico por pasos -->
              <div>
                <div class="awards-modal-step">${t('knockout.step1')}</div>
                <div class="teams-grid-scroll">
                  ${teams.map(t => html`
                    <button
                      class="team-picker-item ${selectedTeamId === t.id ? 'active' : ''}"
                      @click=${() => { this._selectedTeamIdForSelector = t.id; this.requestUpdate(); }}
                    >
                      ${renderFlag(t, { size: 'xs' })}
                      <span class="team-picker-name">${t.name}</span>
                    </button>
                  `)}
                </div>
              </div>

              ${selectedTeamId ? html`
                <div>
                  <div class="awards-modal-step">${t('knockout.step2')}</div>
                  <div class="players-grid-scroll">
                    ${squad.length === 0 ? html`
                      <div class="no-players-placeholder">${t('knockout.noPlayers')}</div>
                    ` : squad.map(p => html`
                      <button
                        class="player-picker-item"
                        @click=${() => this._selectPlayer(p)}
                      >
                        <span class="player-picker-name">${p.name}</span>
                        <span class="player-picker-sub">${p.club} · ${p.position}</span>
                      </button>
                    `)}
                  </div>
                </div>
              ` : ''}
            `}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const bracketSummary = this._getBracketAccessibleSummary();
    return html`
      <section aria-label="Bracket eliminatorio" aria-describedby="knockout-summary">
        <div id="knockout-summary" class="sr-only">${bracketSummary}</div>
        ${this._isMobile ? this._renderMobile() : this._renderDesktop()}
        ${this._renderAwardsSelectionModal()}
      </section>
    `;
  }
}

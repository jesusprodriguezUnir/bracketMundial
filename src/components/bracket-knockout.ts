import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { TEAMS_2026, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import type { MatchModal } from './match-modal';
import './match-modal';
import { STADIUMS } from '../data/stadiums';
import { t, useLocaleStore } from '../i18n';
import { isMatchPending } from '../lib/date-utils';

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

@customElement('bracket-knockout')
export class BracketKnockout extends LitElement {
  private unsubscribeStore?: () => void;
  private unsubscribeLocale?: () => void;
  private _ro?: ResizeObserver;
  private _mql?: MediaQueryList;
  private _desktopInited = false;

  private readonly _onResize = () => requestAnimationFrame(() => this._drawConnectors());
  private readonly _onMqlChange = (e: MediaQueryListEvent) => { this._isMobile = e.matches; };

  @state() private _pulseId: string | null = null;
  @state() private _isMobile = false;
  @state() private _mobileMode: 'all' | 'path' = 'all';
  @state() private _mobileStage = 0;
  @state() private _pathTeamId: string | null = null;
  @state() private _showTeamPicker = false;

  public static readonly styles = css`
    :host { display: block; width: 100%; overflow: hidden; }

    /* ── Acciones desktop (barra compacta sobre el poster) ── */
    .bracket-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 8px 12px;
      border: 2.5px solid var(--ink);
      background: var(--paper-3);
      box-shadow: 3px 3px 0 0 var(--ink);
    }
    .bracket-actions-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .bracket-actions-btns { display: flex; gap: 10px; }

    /* ── Poster header V3 ── */
    .poster-header {
      text-align: center;
      margin-bottom: 16px;
      padding: 16px 20px;
      border: 4px solid var(--ink);
      background: var(--ink);
      color: var(--retro-yellow);
      position: relative;
      box-shadow: 6px 6px 0 0 var(--retro-orange);
    }
    .poster-eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.35em;
      color: var(--retro-yellow);
      margin-bottom: 6px;
    }
    .poster-h1 {
      font-family: var(--font-var);
      font-size: clamp(24px, 3vw, 40px);
      margin: 0;
      line-height: 0.95;
      color: var(--paper);
      letter-spacing: -0.02em;
    }
    .poster-h1 .gloria { color: var(--retro-orange); }
    .poster-corner {
      position: absolute;
      top: 8px;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      color: rgba(236,223,192,0.55);
    }
    .poster-corner.left  { left: 12px; }
    .poster-corner.right { right: 12px; }

    /* ── Scroll del bracket ── */
    .bracket-scroll {
      overflow-x: auto;
      padding: 32px 0 40px;
      cursor: grab;
      user-select: none;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
    }
    .bracket-scroll.is-dragging { cursor: grabbing; }

    .bracket-container {
      display: flex;
      gap: 56px;
      padding: 0 32px;
      min-width: fit-content;
      align-items: center;
      position: relative;
    }

    .round-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: space-around;
      min-width: 220px;
      scroll-snap-align: start;
    }

    /* Header coloreado con halftone + sombra doble V3 */
    .round-title {
      padding: 6px 10px;
      text-align: center;
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.1em;
      border: 2px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-orange), 4px 4px 0 2px var(--ink);
      color: var(--paper);
      background-image: radial-gradient(circle, rgba(0,0,0,0.18) 1.2px, transparent 1.4px);
      background-size: 6px 6px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .round-title.is-final { color: var(--retro-yellow); }

    /* Match box */
    .match-box {
      background: var(--paper-2);
      border: 2px solid var(--ink);
      border-left-width: 6px;
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
        box-shadow: 4px 4px 0 0 var(--retro-orange), 4px 4px 0 2px var(--ink);
      }
    }
    .match-box:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .match-box.pulse {
      box-shadow: 0 0 0 4px var(--retro-yellow), var(--shadow-hard-sm);
    }
    .match-box.right-side {
      border-left-width: 2px;
      border-right-width: 6px;
    }

    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      min-height: 42px;
    }
    .team-row.winner-row { color: var(--paper); }
    .team-row.loser-row  { opacity: 0.5; }
    .team-separator { height: 2px; background: var(--ink); margin: 0 8px; }

    .team-info {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 14px; flex-shrink: 0; }
    .flag-img {
      width: 20px;
      height: 13px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .team-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .score { font-family: var(--font-var); font-size: 16px; flex-shrink: 0; }
    .score.pending { color: var(--dim); opacity: 0.4; font-size: 13px; }

    .match-note {
      padding: 4px 8px;
      border-top: 1px solid var(--ink);
      background: rgba(0,0,0,0.05);
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* Champion box — V3 double shadow + halftone overlay in template */
    .champion-box {
      background: var(--retro-yellow);
      border: 4px solid var(--ink);
      box-shadow: 6px 6px 0 0 var(--retro-orange), 6px 6px 0 4px var(--ink);
      padding: 20px 16px;
      text-align: center;
      min-width: 220px;
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
      font-size: 9px;
      color: var(--ink);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .flag-img-champion {
      width: 28px;
      height: 18px;
      object-fit: cover;
      border: 2px solid var(--ink);
      margin-right: 6px;
      vertical-align: middle;
    }
    .champion-team { font-family: var(--font-var); font-size: 22px; color: var(--ink); line-height: 1.1; }
    .champion-team.tbd { opacity: 0.35; font-size: 18px; }
    .champion-trophy { font-size: 36px; line-height: 1; margin-bottom: 6px; }

    .third-place-title {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-align: center;
      margin-top: 18px;
      margin-bottom: 6px;
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
      border: 2px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 2px 2px 0 0 var(--retro-orange);
      flex-shrink: 0;
    }
    .ko-stepper button {
      all: unset;
      cursor: pointer;
      padding: 1px 5px;
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--paper);
      background: var(--ink);
      line-height: 1.4;
    }
    .ko-stepper button:hover { background: var(--retro-red); }
    .ko-val {
      font-family: var(--font-var);
      font-size: 16px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
      color: var(--ink);
    }
    .ko-pen-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 4px 6px;
      border-top: 1px dashed var(--ink);
      background: var(--paper);
    }
    .ko-pen-label { font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.1em; color: var(--dim); }
    .ko-pen-sep   { font-family: var(--font-mono); font-size: 12px; color: var(--dim); }

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
      padding: 6px 11px;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      color: var(--ink);
      font-family: var(--font-var);
      font-size: 10px;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .mob-chip.active { color: #fff; }

    .mob-body { padding: 14px 16px 24px; }

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
    .mob-picker-list {
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      -webkit-overflow-scrolling: touch;
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
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => s.knockoutMatches,
      () => this.requestUpdate(),
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._mql = window.matchMedia('(max-width: 768px)');
    this._isMobile = this._mql.matches;
    this._mql.addEventListener('change', this._onMqlChange);
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
        this._ro?.disconnect();
        this._ro = undefined;
      }
    } else {
      if (!this._desktopInited) {
        this._desktopInited = true;
        this._initDragScroll();
        const scrollEl = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
        if (scrollEl) {
          this._ro = new ResizeObserver(() => requestAnimationFrame(() => this._drawConnectors()));
          this._ro.observe(scrollEl);
        }
        window.addEventListener('resize', this._onResize);
      }
      requestAnimationFrame(() => this._drawConnectors());
    }
  }

  private _drawConnectors() {
    const svg = this.shadowRoot?.querySelector<SVGElement>('svg.connectors');
    const container = this.shadowRoot?.querySelector<HTMLElement>('.bracket-container');
    if (!svg || !container) return;

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

    let regular = '';
    let champ = '';

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
        champ += `<path d="${pathD}" stroke="var(--retro-yellow)" stroke-width="5" fill="none" stroke-linejoin="miter" opacity="1"/>`;
      } else {
        regular += `<path d="${pathD}" stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linejoin="miter" opacity="${opacity}"${dash}/>`;
      }
    }

    svg.innerHTML = regular + champ;
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

  private renderFlag(team?: ReturnType<typeof this.getTeam>, isChampion = false) {
    if (!team) return html``;
    if (team.flagUrl) {
      return html`<img src="${team.flagUrl}" alt="${team.name}" class="${isChampion ? 'flag-img-champion' : 'flag-img'}">`;
    }
    return html`<span class="team-flag">${(team as any).flag}</span>`;
  }

  private openMatch(matchId: string) {
    const match = useTournamentStore.getState().knockoutMatches[matchId];
    if (!match?.teamA || !match?.teamB) return;
    if (!isMatchPending(match.date ?? '', match.timeSpain ?? '')) return;

    const modal = document.createElement('match-modal') as MatchModal;
    modal.matchId = match.matchId;
    modal.teamA = match.teamA;
    modal.teamB = match.teamB;
    modal.initialScoreA = match.scoreA;
    modal.initialScoreB = match.scoreB;
    modal.initialPenaltyScoreA = match.penaltyScoreA ?? null;
    modal.initialPenaltyScoreB = match.penaltyScoreB ?? null;
    modal.phase = 'knockout';
    (modal as any).venue = (match as any).venue || '';
    (modal as any).city = (match as any).city || '';
    (modal as any).timeSpain = (match as any).timeSpain || '';
    const s = STADIUMS.find(st => st.name === (match as any).venue);
    if (s) (modal as any).stadiumImage = s.image;

    const handler = (ev: Event) => {
      const { scoreA, scoreB, penaltyScoreA, penaltyScoreB } = (ev as CustomEvent).detail;
      useTournamentStore.getState().setKnockoutMatchResult(matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB);
      this._pulseId = matchId;
      setTimeout(() => { this._pulseId = null; }, 700);
      modal.remove();
    };
    modal.addEventListener('save', handler);
    modal.addEventListener('close', () => modal.remove());
    document.body.appendChild(modal);
  }

  private adjustInlineKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    if (!m || !isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.scoreA ?? 0;
    const curB = m.scoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setKnockoutMatchResult(
      matchId, nextA, nextB,
      m.penaltyScoreA ?? null, m.penaltyScoreB ?? null,
    );
  }

  private adjustPenaltyKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    if (!m || !isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.penaltyScoreA ?? 0;
    const curB = m.penaltyScoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setKnockoutMatchResult(
      matchId, m.scoreA, m.scoreB, nextA, nextB,
    );
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
    const canEdit = !!(m?.teamA && m?.teamB && isMatchPending(m?.date ?? '', m?.timeSpain ?? ''));
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
      return html`
        <div
          class="team-row ${isWinner ? 'winner-row' : ''} ${isLoser ? 'loser-row' : ''}"
          style="${isWinner ? `background: ${accentColor};` : ''}">
          <div class="team-info">
            ${this.renderFlag(team)}
            <span class="team-name">${team?.shortName ?? 'TBD'}</span>
          </div>
          ${canEdit
            ? html`<div class="ko-stepper">
                <button @click="${(e: Event) => this.adjustInlineKnockout(e, matchId, teamAB, -1)}" aria-label="${t('groups.decScore')}">−</button>
                <span class="ko-val">${stepVal}</span>
                <button @click="${(e: Event) => this.adjustInlineKnockout(e, matchId, teamAB, 1)}" aria-label="${t('groups.incScore')}">+</button>
              </div>`
            : html`<div class="score ${isPending ? 'pending' : ''}">${isPlayed ? score : '—'}</div>`
          }
        </div>
      `;
    };

    return html`
      <div
        data-mid="${matchId}"
        class="match-box ${this._pulseId === matchId ? 'pulse' : ''} ${isRightSide ? 'right-side' : ''}"
        style="--i:${idx}; ${isRightSide ? `border-right-color: ${accentColor};` : `border-left-color: ${accentColor};`}"
        role="button"
        tabindex="0"
        aria-label="Partido ${label}${isPlayed ? `, resultado ${m.scoreA}-${m.scoreB}${decidedOnPenalties ? `, penaltis ${penaltyScoreA}-${penaltyScoreB}` : ''}` : ', click para editar'}"
        @click="${() => this.openMatch(matchId)}"
        @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.openMatch(matchId)}">
        ${renderRow(m?.teamA ?? null, m?.scoreA ?? null, 'A')}
        <div class="team-separator"></div>
        ${renderRow(m?.teamB ?? null, m?.scoreB ?? null, 'B')}
        ${isDraw ? html`
          <div class="ko-pen-row">
            <span class="ko-pen-label">PEN</span>
            <div class="ko-stepper">
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'A', -1)}" aria-label="${t('groups.decScore')}">−</button>
              <span class="ko-val">${penAVal}</span>
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'A', 1)}" aria-label="${t('groups.incScore')}">+</button>
            </div>
            <span class="ko-pen-sep">·</span>
            <div class="ko-stepper">
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'B', -1)}" aria-label="${t('groups.decScore')}">−</button>
              <span class="ko-val">${penBVal}</span>
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'B', 1)}" aria-label="${t('groups.incScore')}">+</button>
            </div>
          </div>
        ` : (decidedOnPenalties ? html`<div class="match-note">Penaltis · ${penaltyScoreA}-${penaltyScoreB}</div>` : '')}

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
      </div>
    `;
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

    const row = (team: ReturnType<typeof this.getTeam>, score: number | null, isWin: boolean, isLose: boolean) => html`
      <div
        class="mob-team-row ${isWin ? 'winner' : ''} ${isLose ? 'loser' : ''}"
        style="${isWin ? `background: ${roundColor};` : ''}">
        <div class="mob-team-info">
          ${team?.flagUrl
            ? html`<img src="${team.flagUrl}" alt="${team.name ?? ''}" class="flag-img">`
            : html`<span class="flag">${(team as any)?.flag ?? '?'}</span>`
          }
          <span class="code">${team?.shortName ?? 'TBD'}</span>
          <span class="name">${team?.name ?? ''}</span>
        </div>
        <div class="mob-score ${isPending && score === null ? 'pending' : ''}">${m.isPlayed ? score : '—'}</div>
      </div>
    `;

    return html`
      <div class="mob-match-card" @click="${() => this.openMatch(matchId)}">
        ${row(tA, m.scoreA, winA, winB)}
        ${row(tB, m.scoreB, winB, winA)}
        ${m.penaltyScoreA !== null && m.penaltyScoreB !== null
          ? html`<div class="mob-pen-note">PENALTIS · ${m.penaltyScoreA}-${m.penaltyScoreB}</div>`
          : ''
        }
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
        <div class="bracket-actions-label">★ BRACKET · ELIMINATORIAS</div>
        <div class="bracket-actions-btns">
          ${showGenerateButton
            ? html`<button class="btn btn-primary" @click="${this.handleGenerate}">${t('knockout.generate')}</button>`
            : html`<button class="btn" @click="${this.handleSimulate}">${t('knockout.simulate')}</button>`
          }
        </div>
      </div>

      <!-- Cabecera tipo póster V3 -->
      <div class="poster-header">
        <div class="poster-eyebrow">★ MUNDIAL 26 · CUADRO FINAL ★</div>
        <h1 class="poster-h1">EL CAMINO A LA <span class="gloria">GLORIA</span></h1>
        <span class="poster-corner left">N° 01</span>
        <span class="poster-corner right">USA · MEX · CAN</span>
      </div>

      <!-- Bracket con fondo cromo fuerte -->
      <div class="bracket-scroll" style="
        background: var(--paper);
        background-image:
          radial-gradient(circle, rgba(26,25,51,0.10) 1.4px, transparent 1.6px) 0 0 / 7px 7px,
          repeating-linear-gradient(135deg, rgba(232,84,31,0.05) 0 6px, transparent 6px 22px),
          radial-gradient(ellipse 1000px 700px at 50% 0%, rgba(34,65,140,0.10), transparent 60%);
      ">
        <div class="bracket-container">
          <svg class="connectors" aria-hidden="true"></svg>

          <!-- LADO IZQUIERDO -->
          <div class="round-col" id="col-r32-left">
            <div class="round-title" style="background-color: ${ROUND_COLORS.r32}">
              <span>1/16</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[8]</span>
            </div>
            ${r32L.map((id, i) => this.renderMatch(id, ROUND_COLORS.r32, i, false))}
          </div>
          <div class="round-col" id="col-r16-left">
            <div class="round-title" style="background-color: ${ROUND_COLORS.r16}">
              <span>OCTAVOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[4]</span>
            </div>
            ${r16L.map((id, i) => this.renderMatch(id, ROUND_COLORS.r16, i, false))}
          </div>
          <div class="round-col" id="col-qf-left">
            <div class="round-title" style="background-color: ${ROUND_COLORS.qf}">
              <span>CUARTOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[2]</span>
            </div>
            ${qfL.map((id, i) => this.renderMatch(id, ROUND_COLORS.qf, i, false))}
          </div>
          <div class="round-col" id="col-sf-left">
            <div class="round-title" style="background-color: ${ROUND_COLORS.sf}">
              <span>SEMIS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            ${this.renderMatch('SF-01', ROUND_COLORS.sf, 0, false)}
          </div>

          <!-- CENTRO: Final + Campeón + Tercer puesto -->
          <div class="round-col" id="col-final">
            <div class="round-title is-final" style="background-color: ${ROUND_COLORS.final}">
              <span>FINAL</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            ${this.renderMatch('FIN-01', ROUND_COLORS.final, 0, false)}

            <!-- Caja campeón V3 con halftone overlay y sombra doble -->
            <div class="champion-box">
              <div class="champion-halftone"></div>
              <div class="champion-inner">
                <div class="champion-trophy">🏆</div>
                <div class="champion-title">CAMPEÓN MUNDIAL 2026</div>
                ${champion
                  ? html`<div class="champion-team">${this.renderFlag(champion, true)} ${champion.name.toUpperCase()}</div>`
                  : html`<div class="champion-team tbd">POR DEFINIR</div>`
                }
              </div>
            </div>

            <div class="third-place-title">★ TERCER PUESTO ★</div>
            ${this.renderMatch('TP-01', ROUND_COLORS.sf, 1, false)}
          </div>

          <!-- LADO DERECHO (espejado) -->
          <div class="round-col" id="col-sf-right">
            <div class="round-title" style="background-color: ${ROUND_COLORS.sf}">
              <span>SEMIS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            ${this.renderMatch('SF-02', ROUND_COLORS.sf, 0, true)}
          </div>
          <div class="round-col" id="col-qf-right">
            <div class="round-title" style="background-color: ${ROUND_COLORS.qf}">
              <span>CUARTOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[2]</span>
            </div>
            ${qfR.map((id, i) => this.renderMatch(id, ROUND_COLORS.qf, i, true))}
          </div>
          <div class="round-col" id="col-r16-right">
            <div class="round-title" style="background-color: ${ROUND_COLORS.r16}">
              <span>OCTAVOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[4]</span>
            </div>
            ${r16R.map((id, i) => this.renderMatch(id, ROUND_COLORS.r16, i, true))}
          </div>
          <div class="round-col" id="col-r32-right">
            <div class="round-title" style="background-color: ${ROUND_COLORS.r32}">
              <span>1/16</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[8]</span>
            </div>
            ${r32R.map((id, i) => this.renderMatch(id, ROUND_COLORS.r32, i, true))}
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

    return html`
      <div class="mob-layout">
        <!-- Cabecera cromo -->
        <div class="mob-header">
          <div class="mob-header-top">
            <div class="mob-header-eyebrow">★ MUNDIAL 26 ★</div>
            ${hasKnockout
              ? html`<button class="mob-header-action" @click="${this.handleSimulate}">🎲 ${t('knockout.simulate')}</button>`
              : html`<button class="mob-header-action" @click="${this.handleGenerate}">⚡ ${t('knockout.generate')}</button>`
            }
          </div>
          <div class="mob-header-title">BRACKET</div>
          <div class="mob-header-sub">${totalMatches} partidos · final 19 jul · MetLife</div>
        </div>

        <!-- Toggle TODO EL BRACKET / MI CAMINO -->
        <div class="mob-toggle-row" style="padding-bottom:10px;">
          <div class="mob-toggle">
            <button
              class="mob-toggle-btn ${this._mobileMode === 'all' ? 'active' : ''}"
              @click="${() => { this._mobileMode = 'all'; }}">
              TODO EL BRACKET
            </button>
            <button
              class="mob-toggle-btn ${this._mobileMode === 'path' ? 'active' : ''}"
              @click="${() => { this._mobileMode = 'path'; }}">
              ★ MI CAMINO
            </button>
          </div>
        </div>

        ${this._mobileMode === 'all' ? html`
          <!-- Chips de fases -->
          <div class="mob-chips">
            ${MOBILE_STAGES.map((s, i) => html`
              <button
                class="mob-chip ${i === this._mobileStage ? 'active' : ''}"
                style="${i === this._mobileStage ? `background: ${s.color};` : ''}"
                @click="${() => { this._mobileStage = i; }}">
                ${s.label}
                <span style="font-family: var(--font-mono); font-size: 8px; opacity: 0.7;">[${s.abbr}]</span>
              </button>
            `)}
          </div>

          <!-- Lista de partidos de la fase activa -->
          <div class="mob-body">
            <div class="mob-stage-banner" style="background: ${stage.color};">
              <div class="mob-banner-dots"></div>
              <span class="mob-banner-label">${stage.label}</span>
              <span class="mob-banner-count">${stage.matchIds.length} ${stage.matchIds.length === 1 ? 'PARTIDO' : 'PARTIDOS'}</span>
            </div>

            ${stage.matchIds.map(id => this._renderMobileMatchCard(id, stage.color))}

            ${this._mobileStage === 4 ? html`
              <!-- Campeón -->
              <div class="mob-champion-card">
                <div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(0,0,0,0.10) 1.4px,transparent 1.6px);background-size:7px 7px;pointer-events:none;"></div>
                <div style="position:relative;text-align:center;">
                  <div style="font-size:40px;line-height:1;margin-bottom:4px;">🏆</div>
                  <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.3em;font-weight:700;color:var(--ink);margin-bottom:8px;">★ CAMPEÓN MUNDIAL 26 ★</div>
                  ${champion
                    ? html`
                      <div style="font-size:40px;line-height:1;margin-bottom:4px;">${(champion as any).flag}</div>
                      <div style="font-family:var(--font-var);font-size:26px;color:var(--ink);">${champion.name.toUpperCase()}</div>
                    `
                    : html`<div style="font-family:var(--font-var);font-size:18px;color:var(--ink);opacity:0.4;">POR DEFINIR</div>`
                  }
                </div>
              </div>
              <!-- Tercer puesto -->
              <div class="mob-third-label">★ TERCER PUESTO ★</div>
              ${this._renderMobileMatchCard('TP-01', ROUND_COLORS.sf)}
            ` : ''}
          </div>
        ` : html`
          <!-- MI CAMINO — path mode -->
          ${this._renderPathMode()}
        `}

        <!-- Team picker overlay -->
        ${this._showTeamPicker ? this._renderTeamPicker() : ''}
      </div>
    `;
  }

  private _renderPathMode() {
    const teamId = this._effectivePathTeamId();
    const team = teamId ? this.getTeam(teamId) : null;
    const path = teamId ? this._getTeamPath(teamId) : [];
    const km = useTournamentStore.getState().knockoutMatches;
    const isChampion = teamId !== null && km['FIN-01']?.winnerId === teamId;

    return html`
      <div class="mob-path-body">
        <!-- Equipo hero -->
        <div class="mob-team-hero" style="background: var(--retro-green);">
          <div class="mob-hero-halftone"></div>
          <div class="hero-flag-box">
            ${team?.flagUrl
              ? html`<img src="${team.flagUrl}" alt="${team.name}">`
              : html`<span style="font-size:36px">${(team as any)?.flag ?? '?'}</span>`
            }
          </div>
          <div class="hero-info">
            <div class="hero-label">SIGUIENDO</div>
            <div class="hero-name">${team?.name.toUpperCase() ?? 'NINGUNO'}</div>
            ${isChampion ? html`<div style="font-family:var(--font-mono);font-size:10px;opacity:0.9;margin-top:4px;letter-spacing:0.1em;">🏆 CAMPEÓN · ${path.length} PARTIDOS</div>` : ''}
          </div>
          <button class="mob-hero-change" @click="${() => { this._showTeamPicker = true; }}">★ CAMBIAR</button>
        </div>

        <!-- Timeline -->
        ${path.length === 0
          ? html`<div style="font-family:var(--font-mono);font-size:11px;color:var(--dim);letter-spacing:0.15em;text-align:center;padding:24px 0;">
              SIN PARTIDOS DISPONIBLES
            </div>`
          : html`
            <div class="mob-timeline">
              <div class="mob-timeline-line"></div>
              ${path.map(p => {
                const opp = p.opponentId ? this.getTeam(p.opponentId) : null;
                const resultLabel = p.isWin === null
                  ? '—'
                  : p.isWin
                    ? `GANA ${p.myScore}-${p.oppScore}`
                    : `PIERDE ${p.myScore}-${p.oppScore}`;
                const resultBg = p.isWin === null
                  ? 'var(--dim)'
                  : p.isWin ? p.color : 'var(--retro-red)';
                return html`
                  <div class="mob-timeline-item">
                    <div class="mob-node" style="background: ${p.color};">${p.abbr}</div>
                    <div class="mob-item-card">
                      <div class="mob-item-opponent">
                        ${opp?.flagUrl
                          ? html`<img src="${opp.flagUrl}" alt="${opp.name}" style="width:24px;height:16px;object-fit:cover;border:1px solid var(--ink);flex-shrink:0;">`
                          : html`<span style="font-size:22px;flex-shrink:0;">${(opp as any)?.flag ?? '?'}</span>`
                        }
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
              ${isChampion ? html`
                <div class="mob-trophy-item">
                  <div class="mob-trophy-node">🏆</div>
                  <div class="mob-trophy-card">
                    <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.25em;font-weight:700;color:var(--ink);">CAMPEÓN MUNDIAL</div>
                    <div style="font-family:var(--font-var);font-size:20px;line-height:1;margin-top:2px;color:var(--ink);">${team?.name.toUpperCase()} 2026</div>
                  </div>
                </div>
              ` : ''}
            </div>
          `
        }
      </div>
    `;
  }

  private _renderTeamPicker() {
    const teams = this._getTeamsInBracket();
    const currentId = this._effectivePathTeamId();
    return html`
      <div class="mob-picker-backdrop" @click="${(e: Event) => {
        if (e.target === e.currentTarget) this._showTeamPicker = false;
      }}">
        <div class="mob-picker-sheet">
          <div class="mob-picker-header">
            <span class="mob-picker-title">SELECCIONAR EQUIPO</span>
            <button class="mob-picker-close" @click="${() => { this._showTeamPicker = false; }}">CERRAR</button>
          </div>
          <div class="mob-picker-list">
            ${teams.map(id => {
              const team = this.getTeam(id);
              if (!team) return '';
              return html`
                <button
                  class="mob-team-chip ${id === currentId ? 'selected' : ''}"
                  @click="${() => { this._pathTeamId = id; this._showTeamPicker = false; }}">
                  ${team.flagUrl
                    ? html`<img src="${team.flagUrl}" alt="${team.name}" style="width:20px;height:13px;object-fit:cover;border:1px solid var(--ink);">`
                    : html`<span>${(team as any).flag}</span>`
                  }
                  ${team.shortName}
                </button>
              `;
            })}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return this._isMobile ? this._renderMobile() : this._renderDesktop();
  }
}

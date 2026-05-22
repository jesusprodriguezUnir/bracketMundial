import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { generateGuideData, type GuideData, type GuideTeamData, type GuideMatch } from '../lib/guide-service';
import { t, useLocaleStore } from '../i18n';
import { subscribeSlice } from '../store/store-utils';
import { useTournamentStore } from '../store/tournament-store';

const GROUPS = 'ABCDEFGHIJKL'.split('');

// Colores de acento por grupo (rotan los 4 retro), igual que groups-view.
const GROUP_COLORS = [
  'var(--retro-orange)',
  'var(--retro-blue)',
  'var(--retro-green)',
  'var(--retro-red)',
];

// Coordenadas [x,y] del XI por formación — viewBox 100×150 (portado del prototipo).
const FORMATIONS: Record<string, ReadonlyArray<readonly [number, number]>> = {
  '4-3-3': [
    [50, 140],
    [14, 108], [37, 108], [63, 108], [86, 108],
    [24, 80], [50, 80], [76, 80],
    [20, 40], [50, 32], [80, 40],
  ],
  '4-4-2': [
    [50, 140],
    [14, 108], [37, 108], [63, 108], [86, 108],
    [14, 78], [37, 80], [63, 80], [86, 78],
    [36, 38], [64, 38],
  ],
  '4-2-3-1': [
    [50, 140],
    [14, 108], [37, 108], [63, 108], [86, 108],
    [35, 88], [65, 88],
    [20, 60], [50, 58], [80, 60],
    [50, 32],
  ],
  '3-5-2': [
    [50, 140],
    [25, 108], [50, 108], [75, 108],
    [10, 82], [30, 80], [50, 76], [70, 80], [90, 82],
    [36, 38], [64, 38],
  ],
  '3-4-3': [
    [50, 140],
    [25, 108], [50, 108], [75, 108],
    [14, 80], [37, 82], [63, 82], [86, 80],
    [22, 40], [50, 32], [78, 40],
  ],
  '5-3-2': [
    [50, 140],
    [8, 103], [29, 110], [50, 113], [71, 110], [92, 103],
    [28, 80], [50, 80], [72, 80],
    [36, 38], [64, 38],
  ],
};

// Confederación por código FIFA (portado del prototipo).
const CONFEDERATIONS: Record<string, string> = {
  MEX: 'CONCACAF', USA: 'CONCACAF', CAN: 'CONCACAF', PAN: 'CONCACAF', HAI: 'CONCACAF', CUW: 'CONCACAF',
  BRA: 'CONMEBOL', ARG: 'CONMEBOL', URU: 'CONMEBOL', COL: 'CONMEBOL', ECU: 'CONMEBOL', PAR: 'CONMEBOL',
  ESP: 'UEFA', FRA: 'UEFA', GER: 'UEFA', POR: 'UEFA', NED: 'UEFA', BEL: 'UEFA', ENG: 'UEFA', CRO: 'UEFA',
  SUI: 'UEFA', AUT: 'UEFA', NOR: 'UEFA', CZE: 'UEFA', BIH: 'UEFA', SWE: 'UEFA', TUR: 'UEFA', SCO: 'UEFA',
  JPN: 'AFC', KOR: 'AFC', AUS: 'AFC', IRN: 'AFC', KSA: 'AFC', QAT: 'AFC', IRQ: 'AFC', UZB: 'AFC', JOR: 'AFC',
  MAR: 'CAF', SEN: 'CAF', EGY: 'CAF', CIV: 'CAF', GHA: 'CAF', RSA: 'CAF', TUN: 'CAF', ALG: 'CAF',
  CPV: 'CAF', COD: 'CAF',
  NZL: 'OFC',
};

const confederationOf = (id: string): string => CONFEDERATIONS[id] ?? '—';

// Etiqueta i18n de ronda eliminatoria a partir del prefijo del matchId.
function roundLabelOf(matchId: string): string {
  if (matchId.startsWith('R32')) return t('guide.r32');
  if (matchId.startsWith('R16')) return t('guide.r16');
  if (matchId.startsWith('QF')) return t('guide.qf');
  if (matchId.startsWith('SF')) return t('guide.sf');
  if (matchId === 'TP-01') return t('guide.tp');
  return t('guide.final');
}

const lastName = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return parts.at(-1) ?? name;
};

/** "2026-06-11" -> { day: "JUE 11 JUN" }. Local-date safe. */
function fmtDate(iso: string, locale: string, short = false): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = locale === 'es'
    ? ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = locale === 'es'
    ? ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
    : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  if (short) return `${days[date.getDay()]} ${d}`;
  return `${days[date.getDay()]} ${d} ${months[m - 1]}`;
}

function fmtDateLong(iso: string, locale: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = locale === 'es'
    ? ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = locale === 'es'
    ? ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return locale === 'es'
    ? `${days[date.getDay()]} ${d} de ${months[m - 1]}`
    : `${days[date.getDay()]}, ${months[m - 1]} ${d}`;
}

type GuideWebView = 'groups' | 'bracket' | 'calendar' | 'compare';

@customElement('guide-view')
export class GuideView extends LitElement {
  @state() private _data: GuideData | null = null;
  @state() private _view: GuideWebView = 'groups';
  @state() private _activeGroup = 'A';
  @state() private _query = '';
  @state() private _selectedTeam: string | null = null;
  @state() private _compareLeft: string | null = null;
  @state() private _compareRight: string | null = null;
  @state() private _calPhase: 'todas' | 'grupos' | 'eliminatoria' = 'grupos';
  @state() private _calVenue = 'todas';
  @state() private _calDay = 'todos';

  private _unsubscribeLocale?: () => void;
  private _unsubscribeStore?: () => void;

  static readonly styles = css`
    :host { display: block; }

    /* ───────── Cabecera de la guía ───────── */
    .gw-header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 14px 22px;
      align-items: start;
      margin-bottom: 16px;
    }
    .gw-brand-eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.12em;
      color: var(--retro-yellow);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .gw-brand-title {
      font-family: var(--font-var);
      font-size: clamp(30px, 6vw, 52px);
      line-height: 0.92;
      letter-spacing: -0.01em;
      color: var(--ink);
    }
    .gw-brand-title .accent { color: var(--retro-orange); }
    .gw-brand-sub {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
      margin-top: 6px;
    }

    /* Buscador */
    .gw-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 6px 10px;
      min-width: 240px;
    }
    .gw-search input {
      all: unset;
      flex: 1;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--ink);
      min-width: 0;
    }
    .gw-search input::placeholder { color: var(--dim); }
    .gw-search .gw-search-clear {
      all: unset;
      cursor: pointer;
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--dim);
      line-height: 1;
    }
    .gw-search .gw-search-clear:hover { color: var(--retro-red); }
    .gw-search-key {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      border: 1.5px solid var(--ink);
      padding: 0 5px;
    }

    /* Navegación de vistas */
    .gw-nav {
      grid-column: 1 / -1;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .gw-nav-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.02em;
      padding: 7px 14px;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      color: var(--ink);
      box-shadow: var(--shadow-hard-sm);
      transition: transform 0.1s, background 0.1s;
      touch-action: manipulation;
    }
    @media (hover: hover) {
      .gw-nav-btn:hover { transform: translate(-1px, -1px); }
    }
    .gw-nav-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 0 var(--ink); }
    .gw-nav-btn.active {
      background: var(--ink);
      color: var(--paper);
    }
    .gw-nav-spacer { flex: 1; }
    .gw-nav-link {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.04em;
      color: var(--retro-blue);
      align-self: center;
      text-decoration: underline;
    }

    /* ───────── Cuaderno ───────── */
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
      min-height: 540px;
    }

    /* Solapas tipo carpeta de archivo */
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
    .archive-tab.active::after {
      content: "";
      position: absolute;
      left: -2px;
      right: -2px;
      bottom: -3px;
      height: 3px;
      background: var(--paper);
    }
    .at-letter {
      font-family: var(--font-var);
      font-size: 18px;
      line-height: 1;
      color: var(--ink);
    }
    .archive-tab.active .at-letter { color: var(--retro-orange); }
    .at-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.14em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .at-strip {
      width: 22px;
      height: 4px;
      border: 1px solid var(--ink);
    }

    .notebook-page {
      padding: 20px 20px 22px;
    }
    @media (prefers-reduced-motion: no-preference) {
      .notebook-page { animation: pageIn 0.25s ease both; }
      @keyframes pageIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    }

    /* Cabecera de página de grupo / vista */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 12px;
      margin-bottom: 16px;
      border-bottom: 3px solid var(--ink);
      flex-wrap: wrap;
    }
    .page-mark { display: flex; gap: 14px; align-items: center; }
    .pg-letter {
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
    .pg-eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.16em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .pg-name {
      font-family: var(--font-var);
      font-size: 22px;
      line-height: 1.05;
      letter-spacing: -0.01em;
      color: var(--ink);
    }
    .pg-teams {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      color: var(--dim);
      text-transform: uppercase;
      margin-top: 2px;
    }
    .page-meta {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.05em;
      color: var(--dim);
      text-align: right;
      line-height: 1.6;
    }
    .page-meta strong { color: var(--ink); }

    /* ───────── Tarjetas de equipo ───────── */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .team-card {
      all: unset;
      box-sizing: border-box;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      overflow: hidden;
      transition: transform 0.1s, box-shadow 0.1s;
      touch-action: manipulation;
    }
    @media (hover: hover) {
      .team-card:hover {
        transform: translate(-2px, -2px);
        box-shadow: var(--shadow-hard-lg);
      }
    }
    .team-card:active { transform: translate(1px, 1px); box-shadow: var(--shadow-hard-sm); }
    .tc-row1 {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-bottom: 3px solid var(--ink);
      border-left: 8px solid var(--team-color, var(--retro-orange));
    }
    .tc-flag {
      width: 30px;
      height: 30px;
      border: 2px solid var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--ink);
      background: var(--paper);
      flex-shrink: 0;
    }
    .tc-name {
      font-family: var(--font-var);
      font-size: 17px;
      line-height: 1;
      color: var(--ink);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tc-rank {
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--ink);
      color: var(--paper);
      padding: 3px 6px;
      letter-spacing: 0.06em;
      flex-shrink: 0;
    }
    .tc-statbar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
    .tc-statbar > div {
      padding: 6px 8px;
      text-align: center;
    }
    .tc-statbar > div + div { border-left: 1.5px solid rgba(26,25,51,0.2); }
    .sb-l {
      display: block;
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .sb-v {
      display: block;
      font-family: var(--font-var);
      font-size: 17px;
      color: var(--ink);
      margin-top: 2px;
    }
    .tc-coach-star {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-top: 2px solid var(--ink);
      background: rgba(26,25,51,0.04);
    }
    .tc-coach-star > div { padding: 5px 8px; }
    .tc-coach-star > div + div { border-left: 1.5px solid rgba(26,25,51,0.2); }
    .tc-coach-star .label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .tc-coach-star .value {
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tc-matches {
      border-top: 2px solid var(--ink);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .tc-match {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 6px;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
    }
    .tc-match .m-day {
      color: var(--retro-red);
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .tc-match .m-vs {
      display: flex;
      gap: 4px;
      align-items: center;
      color: var(--ink);
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 11px;
    }
    .tc-match .m-vs .vs-flag { color: var(--dim); font-weight: 400; }
    .tc-match .m-venue { font-size: 8px; }

    /* Recap del grupo */
    .group-recap {
      margin-top: 16px;
      background: var(--ink);
      color: var(--paper);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .gr-label {
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--retro-yellow);
    }
    .gr-dates {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.04em;
      flex: 1;
    }
    .gr-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-var);
      font-size: 11px;
      background: var(--retro-orange);
      color: var(--paper);
      border: 2px solid var(--paper);
      padding: 4px 12px;
      touch-action: manipulation;
    }
    .gr-btn:active { opacity: 0.8; }

    /* ───────── Resultados de búsqueda ───────── */
    .sr-summary {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.05em;
      color: var(--dim);
      margin-bottom: 12px;
    }
    .sr-summary strong { color: var(--ink); }
    .sr-empty {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dim);
      text-align: center;
      padding: 40px 12px;
    }
    .sr-list { display: flex; flex-direction: column; gap: 8px; }
    .sr-item {
      all: unset;
      cursor: pointer;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 10px;
      align-items: center;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 8px 10px;
      touch-action: manipulation;
    }
    .sr-item:active { transform: translate(1px, 1px); }
    .sri-flag {
      width: 28px; height: 28px;
      border: 2px solid var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var); font-size: 11px;
      background: var(--paper);
    }
    .sri-name { font-family: var(--font-var); font-size: 15px; color: var(--ink); }
    .sri-meta { font-family: var(--font-mono); font-size: 10px; color: var(--dim); }
    .sri-meta mark { background: var(--retro-yellow); color: var(--ink); }
    .sri-rank {
      font-family: var(--font-mono); font-size: 9px;
      background: var(--ink); color: var(--paper); padding: 3px 6px;
    }
    .sri-group {
      font-family: var(--font-var); font-size: 16px;
      color: var(--retro-orange);
      width: 26px; text-align: center;
    }

    /* ───────── Bracket ───────── */
    .bracket-canvas {
      display: flex;
      gap: 14px;
      overflow-x: auto;
      padding-bottom: 8px;
      -webkit-overflow-scrolling: touch;
    }
    .bracket-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 150px;
    }
    .bracket-col-head {
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--ink);
      text-align: center;
      border-bottom: 3px solid var(--ink);
      padding-bottom: 4px;
    }
    .bracket-col-head .sub {
      display: block;
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.1em;
      margin-top: 1px;
    }
    .bracket-match {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 6px 8px;
    }
    .bracket-match.final {
      border-color: var(--retro-orange);
      box-shadow: 3px 3px 0 0 var(--retro-orange);
    }
    .bm-id {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.04em;
      margin-bottom: 3px;
    }
    .bm-slot {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      color: var(--ink);
    }
    .bm-slot.b { color: var(--dim); font-weight: 500; }
    .bm-slot.winner { color: var(--retro-green); }
    .bm-score {
      font-family: var(--font-var);
      font-size: 11px;
      margin-left: auto;
      color: var(--retro-orange);
    }
    .bm-venue {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      margin-top: 3px;
    }

    /* ───────── Calendario ───────── */
    .cal-filters {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 3px dashed var(--ink);
    }
    .cal-filter-group {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .cal-filter-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .cal-filter {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 9px;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      color: var(--ink);
      text-transform: capitalize;
      touch-action: manipulation;
    }
    .cal-filter.active { background: var(--retro-orange); color: var(--paper); }
    .cal-select {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 4px 6px;
      border: 2px solid var(--ink);
      background: var(--paper-3);
      color: var(--ink);
    }
    .cal-days { display: flex; flex-direction: column; gap: 14px; }
    .cal-day-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
      border-bottom: 2px solid var(--ink);
      padding-bottom: 3px;
      margin-bottom: 8px;
    }
    .cal-day-head .cd-count {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.06em;
    }
    .cal-matches-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 8px;
    }
    .cal-match {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 6px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .cm-time {
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--retro-orange);
    }
    .cm-pair {
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .cm-pair .vs { color: var(--dim); font-weight: 400; font-family: var(--font-mono); }
    .cm-meta {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      margin-top: 2px;
    }

    /* ───────── Comparador ───────── */
    .compare-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 10px;
      align-items: start;
    }
    .compare-vs {
      font-family: var(--font-var);
      font-size: 22px;
      color: var(--retro-orange);
      align-self: center;
    }
    .compare-side {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
    }
    .compare-picker {
      padding: 28px 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .cp-msg {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--dim);
    }
    .cp-select {
      font-family: var(--font-body);
      font-size: 12px;
      padding: 6px;
      border: 2px solid var(--ink);
      background: var(--paper);
      color: var(--ink);
    }
    .compare-team-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-bottom: 3px solid var(--ink);
    }
    .ct-flag {
      width: 38px; height: 38px;
      border: 2px solid var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var); font-size: 13px;
      background: var(--paper);
    }
    .ct-name { font-family: var(--font-var); font-size: 16px; color: var(--ink); }
    .ct-group { font-family: var(--font-mono); font-size: 9px; color: var(--dim); }
    .ct-change {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--retro-blue);
      text-decoration: underline;
      margin-left: auto;
    }
    .compare-rows > div {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 10px;
      font-size: 12px;
    }
    .compare-rows > div + div { border-top: 1px dotted rgba(26,25,51,0.25); }
    .cr-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.06em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .cr-val {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
    }
    .cr-val.text { font-family: var(--font-body); font-size: 11px; font-weight: 700; }
    .cr-val.win { color: var(--retro-green); }
    .compare-foot {
      padding: 10px;
      border-top: 2px dashed var(--ink);
    }

    /* ───────── Modal de equipo ───────── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(26,25,51,0.72);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 24px 12px;
      overflow-y: auto;
      z-index: 1000;
    }
    .modal {
      background: var(--paper);
      background-image: var(--paper-texture);
      background-size: var(--paper-texture-size, 5px 5px);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      max-width: 720px;
      width: 100%;
      position: relative;
    }
    .modal-close {
      all: unset;
      cursor: pointer;
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 18px;
      color: var(--paper);
      background: var(--retro-red);
      border: 2px solid var(--ink);
      z-index: 2;
      touch-action: manipulation;
    }
    .modal-close:active { transform: translate(1px, 1px); }
    .modal-hero {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-bottom: 3px solid var(--ink);
    }
    .modal-flag {
      width: 50px; height: 50px;
      border: 3px solid var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var); font-size: 16px;
      background: var(--paper-3);
      flex-shrink: 0;
    }
    .modal-titles { flex: 1; min-width: 0; }
    .modal-titles .eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.12em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .modal-titles h2 {
      font-family: var(--font-var);
      font-size: 26px;
      line-height: 1;
      color: var(--ink);
      margin: 2px 0 0;
    }
    .modal-group-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 3px solid var(--ink);
      color: var(--paper);
      padding: 5px 12px;
      flex-shrink: 0;
    }
    .gb-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .gb-letter { font-family: var(--font-var); font-size: 26px; line-height: 1; }
    .modal-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border-bottom: 3px solid var(--ink);
    }
    .modal-stats > div {
      padding: 8px;
      text-align: center;
    }
    .modal-stats > div + div { border-left: 1.5px solid rgba(26,25,51,0.2); }
    .modal-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 3px solid var(--ink);
    }
    .modal-block + .modal-block { border-left: 1.5px solid rgba(26,25,51,0.2); }
    .mb-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 6px 10px;
      background: rgba(26,25,51,0.06);
      border-bottom: 1.5px solid rgba(26,25,51,0.2);
    }
    .mb-head span:first-child {
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--ink);
    }
    .mb-extra {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.05em;
    }
    .mb-body { padding: 8px 10px; }
    .c-name {
      font-family: var(--font-var);
      font-size: 15px;
      color: var(--ink);
      margin-bottom: 4px;
    }
    .c-row {
      display: flex;
      gap: 6px;
      font-size: 11px;
      color: var(--ink);
      padding: 2px 0;
    }
    .c-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      text-transform: uppercase;
      min-width: 58px;
      flex-shrink: 0;
    }
    .players-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .players-list li {
      display: flex;
      gap: 8px;
      align-items: center;
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--ink);
    }
    .players-list li.star { font-weight: 800; }
    .p-num {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      width: 22px;
      text-align: center;
    }
    .players-list li.star .p-num { color: var(--retro-orange); }
    .modal-matches {
      border-bottom: 3px solid var(--ink);
    }
    .modal-matches table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .modal-matches th {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.08em;
      color: var(--dim);
      text-transform: uppercase;
      text-align: left;
      padding: 5px 8px;
      border-bottom: 2px solid var(--ink);
      background: var(--paper-2);
    }
    .modal-matches td {
      padding: 5px 8px;
      border-bottom: 1px dotted rgba(26,25,51,0.25);
    }
    .modal-matches tr:last-child td { border-bottom: none; }
    .mm-day {
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--retro-red);
    }
    .mm-vs {
      display: flex;
      gap: 5px;
      align-items: center;
      font-family: var(--font-body);
      font-weight: 700;
    }
    .mm-vs .vs { color: var(--dim); font-weight: 400; font-family: var(--font-mono); font-size: 9px; }
    .mm-mono { font-family: var(--font-mono); font-size: 10px; color: var(--dim); }
    .modal-actions {
      display: flex;
      gap: 8px;
      padding: 12px;
      flex-wrap: wrap;
    }
    .modal-action-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-var);
      font-size: 12px;
      padding: 7px 14px;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      color: var(--ink);
      box-shadow: var(--shadow-hard-sm);
      touch-action: manipulation;
    }
    .modal-action-btn.primary { background: var(--retro-orange); color: var(--paper); }
    .modal-action-btn:active { transform: translate(1px, 1px); box-shadow: 1px 1px 0 0 var(--ink); }

    /* ───────── Campo de fútbol ───────── */
    .pitch-block { border-bottom: 3px solid var(--ink); }
    .pb-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 6px 10px;
      background: rgba(26,25,51,0.06);
      border-bottom: 1.5px solid rgba(26,25,51,0.2);
    }
    .pb-head span:first-child {
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--ink);
    }
    .pb-formation {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-orange);
      letter-spacing: 0.1em;
    }
    .pitch-wrap {
      position: relative;
      margin: 10px auto;
      max-width: 360px;
      background: var(--retro-green);
      border: 3px solid var(--ink);
      aspect-ratio: 100 / 150;
    }
    .pitch-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .pitch-svg .line { fill: none; stroke: rgba(255,255,255,0.55); stroke-width: 0.6; }
    .pitch-svg .line-bold { fill: none; stroke: rgba(255,255,255,0.7); stroke-width: 0.8; }
    .pitch-svg .spot { fill: rgba(255,255,255,0.7); }
    .player-card {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 17%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .player-photo {
      width: 30px;
      height: 30px;
      border: 2px solid var(--ink);
      background: var(--player-bg, var(--retro-blue));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 9px;
      color: var(--paper);
      box-shadow: var(--shadow-hard-sm);
    }
    .player-card.gk .player-photo { background: var(--retro-yellow); color: var(--ink); }
    .player-photo img { width: 100%; height: 100%; object-fit: cover; }
    .player-name {
      font-family: var(--font-body);
      font-size: 9px;
      font-weight: 700;
      color: var(--paper);
      background: var(--ink);
      padding: 1px 4px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pitch-bench {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      padding: 8px 10px;
    }
    .pb-label {
      font-family: var(--font-var);
      font-size: 11px;
      color: var(--ink);
    }
    .pb-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .b-item {
      display: flex;
      gap: 4px;
      align-items: center;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      color: var(--ink);
    }
    .b-item .num {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--paper);
      background: var(--dim);
      padding: 1px 4px;
    }
    .pitch-empty {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      padding: 20px;
      text-align: center;
      border-bottom: 3px solid var(--ink);
    }

    /* ───────── Pie ───────── */
    .gw-footer {
      margin-top: 14px;
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.04em;
    }
    .gw-footer kbd {
      font-family: var(--font-mono);
      font-size: 9px;
      border: 1.5px solid var(--ink);
      padding: 0 4px;
      color: var(--ink);
      background: var(--paper-3);
    }

    @media (max-width: 768px) {
      .gw-header { grid-template-columns: 1fr; }
      .gw-search { min-width: 0; }
      .notebook { box-shadow: var(--shadow-hard-md); }
      .notebook-page { padding: 14px 12px 16px; }
      .archive-tabs { padding: 8px 10px 0; gap: 1px; }
      .archive-tab { min-width: 38px; padding: 7px 2px 6px; }
      .at-label { display: none; }
      .at-strip { width: 16px; }
      .team-grid { grid-template-columns: 1fr; }
      .pg-letter { width: 44px; height: 44px; font-size: 26px; }
      .pg-name { font-size: 18px; }
      .modal-cols { grid-template-columns: 1fr; }
      .modal-block + .modal-block { border-left: none; border-top: 1.5px solid rgba(26,25,51,0.2); }
      .modal-stats { grid-template-columns: repeat(2, 1fr); }
      .modal-stats > div:nth-child(3) { border-left: none; }
      .compare-grid { grid-template-columns: 1fr; }
      .compare-vs { justify-self: center; }
      .modal-matches { overflow-x: auto; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._data = generateGuideData('user');
    this._unsubscribeLocale = useLocaleStore.subscribe(() => {
      this._data = generateGuideData('user');
      this.requestUpdate();
    });
    this._unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => ({ gm: s.groupMatches, km: s.knockoutMatches }),
      () => { this._data = generateGuideData('user'); },
      (a, b) => a.gm === b.gm && a.km === b.km,
    );
    window.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    this._unsubscribeLocale?.();
    this._unsubscribeStore?.();
    window.removeEventListener('keydown', this._onKey);
    super.disconnectedCallback();
  }

  /** Atajos de teclado: `/` busca, ←/→ cambian de grupo, Esc cierra. */
  private _onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === '/' && !inField) {
      e.preventDefault();
      const input = this.shadowRoot?.querySelector('.gw-search input') as HTMLInputElement | null;
      input?.focus();
      return;
    }
    if (e.key === 'Escape') {
      if (this._selectedTeam) { this._selectedTeam = null; return; }
      if (this._query) { this._query = ''; return; }
    }
    if (inField || this._selectedTeam) return;
    if (this._view === 'groups' && !this._isSearching) {
      if (e.key === 'ArrowRight') { e.preventDefault(); this._stepGroup(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this._stepGroup(-1); }
    }
  };

  /** bracket-view llama esto al re-pulsar la pestaña: vuelve al estado inicial. */
  goBack() {
    if (this._selectedTeam) { this._selectedTeam = null; return; }
    if (this._query) { this._query = ''; return; }
    this._view = 'groups';
  }

  private get _isSearching(): boolean {
    return this._query.trim().length >= 2;
  }

  private _stepGroup(delta: number) {
    const idx = GROUPS.indexOf(this._activeGroup);
    this._activeGroup = GROUPS[(idx + delta + GROUPS.length) % GROUPS.length];
  }

  private _teamById(id: string | null): GuideTeamData | undefined {
    if (!id || !this._data) return undefined;
    return this._data.teams.find(tm => tm.teamId === id);
  }

  private _teamsForGroup(letter: string): GuideTeamData[] {
    return this._data ? this._data.teams.filter(tm => tm.group === letter) : [];
  }

  private _openTeam(id: string) { this._selectedTeam = id; }

  private _jumpToGroup(letter: string) {
    this._view = 'groups';
    this._query = '';
    this._activeGroup = letter;
    this._selectedTeam = null;
  }

  private _startCompare(id: string) {
    this._view = 'compare';
    this._selectedTeam = null;
    if (!this._compareLeft) this._compareLeft = id;
    else if (!this._compareRight) this._compareRight = id;
    else this._compareLeft = id;
  }

  private _openPrintable() {
    globalThis.print();
  }

  // ───────── Render principal ─────────
  render() {
    const data = this._data;
    if (!data) return html``;

    return html`
      ${this._renderHeader()}
      <div class="notebook">
        ${this._renderTabs()}
        <div class="notebook-page" data-key="${this._view}-${this._activeGroup}-${this._isSearching ? 'S' : ''}">
          ${this._renderPage(data)}
        </div>
      </div>
      ${this._renderFooter()}
      ${this._selectedTeam ? this._renderModal() : ''}
    `;
  }

  private _renderHeader(): TemplateResult {
    const views: GuideWebView[] = ['groups', 'bracket', 'calendar', 'compare'];
    const navLabel: Record<GuideWebView, string> = {
      groups: t('gw.navGroups'),
      bracket: t('gw.navBracket'),
      calendar: t('gw.navCalendar'),
      compare: t('gw.navCompare'),
    };
    return html`
      <div class="gw-header">
        <div>
          <div class="gw-brand-eyebrow">${t('gw.brandEyebrow')}</div>
          <h1 class="gw-brand-title">
            ${t('gw.brandTitle1')} <span class="accent">${t('gw.brandTitle2')}</span><br />
            ${t('gw.brandTitle3')}
          </h1>
          <div class="gw-brand-sub">${t('gw.brandSub')}</div>
        </div>
        <div class="gw-search">
          <span aria-hidden="true">🔍</span>
          <input
            type="search"
            .value=${this._query}
            placeholder="${t('gw.searchPlaceholder')}"
            @input=${(e: Event) => { this._query = (e.target as HTMLInputElement).value; }}
          />
          ${this._query
            ? html`<button class="gw-search-clear" @click=${() => { this._query = ''; }} aria-label="✕">✕</button>`
            : html`<span class="gw-search-key">/</span>`}
        </div>
        <nav class="gw-nav">
          ${views.map(v => html`
            <button
              class="gw-nav-btn ${this._view === v && !this._isSearching ? 'active' : ''}"
              @click=${() => { this._view = v; this._query = ''; }}>
              ${navLabel[v]}
            </button>
          `)}
          <span class="gw-nav-spacer"></span>
          <button class="gw-nav-link" @click=${this._openPrintable}>${t('gw.openPrintable')}</button>
        </nav>
      </div>
    `;
  }

  private _renderTabs(): TemplateResult {
    return html`
      <div class="archive-tabs" role="tablist">
        ${GROUPS.map((g, i) => {
          const active = g === this._activeGroup && this._view === 'groups' && !this._isSearching;
          return html`
            <button
              class="archive-tab ${active ? 'active' : ''}"
              role="tab"
              aria-selected="${active}"
              aria-label="${t('gw.tabAria', { letter: g })}"
              @click=${() => { this._view = 'groups'; this._query = ''; this._activeGroup = g; }}>
              <span class="at-letter">${g}</span>
              <span class="at-label">${t('guide.group', { letter: g })}</span>
              <span class="at-strip" style="background:${GROUP_COLORS[i % 4]}"></span>
            </button>
          `;
        })}
      </div>
    `;
  }

  private _renderPage(data: GuideData): TemplateResult {
    if (this._isSearching) return this._renderSearch(data);
    switch (this._view) {
      case 'bracket': return this._renderBracket(data);
      case 'calendar': return this._renderCalendar(data);
      case 'compare': return this._renderCompare();
      default: return this._renderGroup(data);
    }
  }

  // ───────── Vista: grupo ─────────
  private _renderGroup(data: GuideData): TemplateResult {
    const letter = this._activeGroup;
    const teams = this._teamsForGroup(letter);
    const matches = data.groupMatches
      .filter(m => m.group === letter)
      .sort((a, b) => (a.matchDay ?? 0) - (b.matchDay ?? 0) || a.date.localeCompare(b.date));
    const avgRank = teams.length
      ? Math.round(teams.reduce((s, tm) => s + tm.meta.fifaRank, 0) / teams.length)
      : 0;
    const totalWC = teams.reduce((s, tm) => s + tm.meta.worldCups, 0);
    const firstDate = matches[0]?.date ?? '';
    const lastDate = matches.at(-1)?.date ?? '';
    const midMatch = matches.find(m => m.matchDay === 2);

    return html`
      <div class="page-header">
        <div class="page-mark">
          <div class="pg-letter" style="background-color:${GROUP_COLORS[GROUPS.indexOf(letter) % 4]}">
            ${letter}
          </div>
          <div>
            <div class="pg-eyebrow">${t('gw.groupEyebrow')}</div>
            <div class="pg-name">${t('guide.group', { letter })}</div>
            <div class="pg-teams">${teams.map(tm => tm.name).join(' · ')}</div>
          </div>
        </div>
        <div class="page-meta">
          <div>${t('gw.groupPage', { n: String(GROUPS.indexOf(letter) + 1) })}</div>
          <div>${t('gw.groupAvgRank')}: <strong>#${avgRank}</strong></div>
          <div>${t('gw.groupWorldCups', { n: String(totalWC) })}</div>
        </div>
      </div>

      <div class="team-grid">
        ${teams.map((tm, i) => this._renderTeamCard(tm, data, GROUP_COLORS[i % 4]))}
      </div>

      <div class="group-recap">
        <span class="gr-label">${t('gw.groupCalendar')}</span>
        <span class="gr-dates">
          J1 ${fmtDate(firstDate, data.locale)}
          ${midMatch ? ` → J2 ${fmtDate(midMatch.date, data.locale)}` : ''}
          → J3 ${fmtDate(lastDate, data.locale)} · ${matches.length} ${t('gw.calMatches', { n: String(matches.length) }).replace(/^\d+\s*/, '')}
        </span>
      </div>
    `;
  }

  private _renderTeamCard(tm: GuideTeamData, data: GuideData, color: string): TemplateResult {
    const ownMatches = data.groupMatches
      .filter(m => m.teamA === tm.teamId || m.teamB === tm.teamId)
      .sort((a, b) => (a.matchDay ?? 0) - (b.matchDay ?? 0));
    const star = tm.starPlayer?.name ?? tm.captain?.name ?? '—';
    const coachName = tm.coach?.name ?? '—';

    return html`
      <button class="team-card" style="--team-color:${color}" @click=${() => this._openTeam(tm.teamId)}>
        <div class="tc-row1">
          <span class="tc-flag">${tm.shortName}</span>
          <span class="tc-name">${tm.name}</span>
          <span class="tc-rank">FIFA #${tm.meta.fifaRank}</span>
        </div>
        <div class="tc-statbar">
          <div><span class="sb-l">${t('gw.cardWorldCups')}</span><span class="sb-v">${tm.meta.worldCups}</span></div>
          <div><span class="sb-l">${t('gw.cardStars')}</span><span class="sb-v">${tm.meta.stars}★</span></div>
          <div><span class="sb-l">${t('gw.cardSquad')}</span><span class="sb-v">${tm.squadStats.count}</span></div>
        </div>
        <div class="tc-coach-star">
          <div>
            <div class="label">${t('gw.cardCoach')}</div>
            <div class="value">${coachName}</div>
          </div>
          <div>
            <div class="label">${t('gw.cardStar')}</div>
            <div class="value">${star}</div>
          </div>
        </div>
        <div class="tc-matches">
          ${[1, 2, 3].map(day => {
            const m = ownMatches.find(mm => mm.matchDay === day);
            if (!m) {
              return html`<div class="tc-match" style="opacity:0.4"><span class="m-day">J${day}</span></div>`;
            }
            const rivalId = m.teamA === tm.teamId ? m.teamB : m.teamA;
            const rival = this._teamById(rivalId);
            return html`
              <div class="tc-match">
                <span class="m-day">J${day} · ${fmtDate(m.date, data.locale, true)}</span>
                <span class="m-vs">
                  <span class="vs-flag">${t('guide.vs')}</span>
                  <span>${rival?.shortName ?? rivalId}</span>
                </span>
                <span class="m-venue">${m.city}</span>
              </div>
            `;
          })}
        </div>
      </button>
    `;
  }

  // ───────── Vista: búsqueda ─────────
  private _renderSearch(data: GuideData): TemplateResult {
    const q = this._query.toLowerCase().trim();
    type Hit = { team: GuideTeamData; field: string; value: string };
    const hits: Hit[] = [];
    for (const tm of data.teams) {
      if (tm.name.toLowerCase().includes(q) || tm.teamId.toLowerCase().includes(q)) {
        hits.push({ team: tm, field: t('gw.matchField'), value: tm.name });
        continue;
      }
      if (tm.coach?.name.toLowerCase().includes(q)) {
        hits.push({ team: tm, field: t('gw.matchCoach'), value: tm.coach.name });
        continue;
      }
      const player = tm.squad.find(p => p.name.toLowerCase().includes(q));
      if (player) {
        hits.push({ team: tm, field: t('gw.matchPlayer'), value: player.name });
      }
    }

    if (hits.length === 0) {
      return html`
        <div class="sr-summary">«${this._query}»</div>
        <div class="sr-empty">${t('gw.searchNone')}</div>
      `;
    }

    const highlight = (text: string): TemplateResult => {
      const idx = text.toLowerCase().indexOf(q);
      if (idx === -1) return html`${text}`;
      return html`${text.slice(0, idx)}<mark>${text.slice(idx, idx + q.length)}</mark>${text.slice(idx + q.length)}`;
    };

    return html`
      <div class="sr-summary">${t('gw.searchCount', { n: String(hits.length), q: this._query })}</div>
      <div class="sr-list">
        ${hits.map(({ team, field, value }) => html`
          <button class="sr-item" @click=${() => this._openTeam(team.teamId)}>
            <span class="sri-flag">${team.shortName}</span>
            <div>
              <div class="sri-name">${team.name}</div>
              <div class="sri-meta">${field} · ${highlight(value)}</div>
            </div>
            <span class="sri-rank">FIFA #${team.meta.fifaRank}</span>
            <span class="sri-group">${team.group}</span>
          </button>
        `)}
      </div>
    `;
  }

  // ───────── Vista: bracket ─────────
  private _renderBracket(data: GuideData): TemplateResult {
    const rounds: Array<{ key: string; prefix: string }> = [
      { key: 'guide.r32', prefix: 'R32' },
      { key: 'guide.r16', prefix: 'R16' },
      { key: 'guide.qf', prefix: 'QF' },
      { key: 'guide.sf', prefix: 'SF' },
      { key: 'guide.tp', prefix: 'TP' },
      { key: 'guide.final', prefix: 'FIN' },
    ];
    return html`
      <div class="page-header">
        <div class="page-mark">
          <div class="pg-letter" style="background-color:var(--retro-orange)">★</div>
          <div>
            <div class="pg-eyebrow">${t('gw.bracketEyebrow')}</div>
            <div class="pg-name">${t('gw.bracketTitle')}</div>
            <div class="pg-teams">${t('gw.bracketSub')}</div>
          </div>
        </div>
      </div>
      <div class="bracket-canvas">
        ${rounds.map(r => {
          const ms = data.knockoutMatches.filter(m => m.matchId.startsWith(r.prefix));
          return html`
            <div class="bracket-col">
              <div class="bracket-col-head">
                ${t(r.key as 'guide.r32')}
                <span class="sub">${ms.length} ${ms.length === 1 ? t('gw.colMatch') : t('gw.calMatches', { n: '' }).replace(/[\d()\s]/g, '')}</span>
              </div>
              ${ms.map(m => {
                const played = m.scoreA !== null && m.scoreB !== null;
                const pen = m.penaltyScoreA != null && m.penaltyScoreB != null
                  ? ` (${m.penaltyScoreA}-${m.penaltyScoreB})` : '';
                return html`
                  <div class="bracket-match ${r.prefix === 'FIN' ? 'final' : ''}">
                    <div class="bm-id">${m.matchId} · ${fmtDate(m.date, data.locale, true)} · ${m.timeSpain}</div>
                    <div class="bm-slot ${m.winnerId && m.winnerId === m.teamA ? 'winner' : ''}">
                      ${m.teamAName}
                      ${played ? html`<span class="bm-score">${m.scoreA}</span>` : ''}
                    </div>
                    <div class="bm-slot b ${m.winnerId && m.winnerId === m.teamB ? 'winner' : ''}">
                      ${t('guide.vs')} ${m.teamBName}
                      ${played ? html`<span class="bm-score">${m.scoreB}${pen}</span>` : ''}
                    </div>
                    <div class="bm-venue">${m.city || m.venue}</div>
                  </div>
                `;
              })}
            </div>
          `;
        })}
      </div>
    `;
  }

  // ───────── Vista: calendario ─────────
  private _renderCalendar(data: GuideData): TemplateResult {
    type CalMatch = GuideMatch & { phase: 'grupos' | 'eliminatoria' };
    const all: CalMatch[] = [
      ...data.groupMatches.map(m => ({ ...m, phase: 'grupos' as const })),
      ...data.knockoutMatches.map(m => ({ ...m, phase: 'eliminatoria' as const })),
    ].sort((a, b) => a.date.localeCompare(b.date) || a.timeSpain.localeCompare(b.timeSpain));

    const filtered = all.filter(m => {
      if (this._calPhase !== 'todas' && m.phase !== this._calPhase) return false;
      if (this._calVenue !== 'todas' && m.city !== this._calVenue) return false;
      if (this._calDay !== 'todos' && m.date !== this._calDay) return false;
      return true;
    });

    const byDay = new Map<string, CalMatch[]>();
    for (const m of filtered) {
      if (!m.date) continue;
      const arr = byDay.get(m.date) ?? [];
      arr.push(m);
      byDay.set(m.date, arr);
    }
    const days = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    const allDates = [...new Set(all.map(m => m.date).filter(Boolean))].sort();
    const allCities = [...new Set(all.map(m => m.city).filter(Boolean))].sort();
    const phases: Array<typeof this._calPhase> = ['todas', 'grupos', 'eliminatoria'];
    const phaseLabel: Record<string, string> = {
      todas: t('gw.calPhaseAll'),
      grupos: t('gw.calPhaseGroups'),
      eliminatoria: t('gw.calPhaseKnockout'),
    };
    const hasFilter = this._calPhase !== 'todas' || this._calVenue !== 'todas' || this._calDay !== 'todos';

    return html`
      <div class="page-header">
        <div class="page-mark">
          <div class="pg-letter" style="background-color:var(--retro-blue)">☷</div>
          <div>
            <div class="pg-eyebrow">${t('gw.calEyebrow')}</div>
            <div class="pg-name">${t('gw.calTitle')}</div>
            <div class="pg-teams">${t('gw.calSub')}</div>
          </div>
        </div>
        <div class="page-meta">
          <div>${t('gw.calMatches', { n: String(filtered.length) })}</div>
        </div>
      </div>

      <div class="cal-filters">
        <div class="cal-filter-group">
          <span class="cal-filter-label">${t('gw.calPhase')}</span>
          ${phases.map(p => html`
            <button
              class="cal-filter ${this._calPhase === p ? 'active' : ''}"
              @click=${() => { this._calPhase = p; }}>${phaseLabel[p]}</button>
          `)}
        </div>
        <div class="cal-filter-group">
          <span class="cal-filter-label">${t('gw.colVenue')}</span>
          <select class="cal-select" .value=${this._calVenue}
                  @change=${(e: Event) => { this._calVenue = (e.target as HTMLSelectElement).value; }}>
            <option value="todas">${t('gw.calVenueAll')}</option>
            ${allCities.map(c => html`<option value="${c}">${c}</option>`)}
          </select>
        </div>
        <div class="cal-filter-group">
          <span class="cal-filter-label">${t('gw.colDate')}</span>
          <select class="cal-select" .value=${this._calDay}
                  @change=${(e: Event) => { this._calDay = (e.target as HTMLSelectElement).value; }}>
            <option value="todos">${t('gw.calDayAll')}</option>
            ${allDates.map(d => html`<option value="${d}">${fmtDateLong(d, data.locale)}</option>`)}
          </select>
        </div>
        ${hasFilter ? html`
          <button class="cal-filter" style="background:var(--retro-red);color:var(--paper)"
                  @click=${() => { this._calPhase = 'todas'; this._calVenue = 'todas'; this._calDay = 'todos'; }}>
            ${t('gw.calClear')}
          </button>
        ` : ''}
      </div>

      ${days.length === 0
        ? html`<div class="sr-empty">${t('gw.calEmpty')}</div>`
        : html`
          <div class="cal-days">
            ${days.map(([date, ms]) => html`
              <div class="cal-day">
                <div class="cal-day-head">
                  <span>${fmtDateLong(date, data.locale)}</span>
                  <span class="cd-count">${t('gw.calMatches', { n: String(ms.length) })}</span>
                </div>
                <div class="cal-matches-grid">
                  ${ms.map(m => html`
                    <div class="cal-match">
                      <div class="cm-time">${m.timeSpain}</div>
                      ${m.phase === 'eliminatoria'
                        ? html`
                          <div class="cm-pair">
                            <span style="color:var(--retro-orange)">${roundLabelOf(m.matchId)}</span>
                          </div>
                          <div class="cm-pair">
                            <span>${m.teamAName}</span>
                            <span class="vs">${t('guide.vs')}</span>
                            <span>${m.teamBName}</span>
                          </div>
                          <div class="cm-meta">${m.matchId} · ${m.venue}</div>
                        `
                        : html`
                          <div class="cm-pair" @click=${() => m.teamA && this._openTeam(m.teamA)}>
                            <span>${m.teamAName}</span>
                            <span class="vs">${t('guide.vs')}</span>
                            <span>${m.teamBName}</span>
                          </div>
                          <div class="cm-meta">${t('guide.group', { letter: m.group ?? '' })} · J${m.matchDay} · ${m.venue}</div>
                        `}
                    </div>
                  `)}
                </div>
              </div>
            `)}
          </div>
        `}
    `;
  }

  // ───────── Vista: comparador ─────────
  private _renderCompare(): TemplateResult {
    const left = this._teamById(this._compareLeft);
    const right = this._teamById(this._compareRight);
    return html`
      <div class="page-header">
        <div class="page-mark">
          <div class="pg-letter" style="background-color:var(--retro-green)">⚖</div>
          <div>
            <div class="pg-eyebrow">${t('gw.compareEyebrow')}</div>
            <div class="pg-name">${t('gw.compareTitle')}</div>
            <div class="pg-teams">${t('gw.compareSub')}</div>
          </div>
        </div>
      </div>
      <div class="compare-grid">
        ${this._renderCompareSide(left, right, 'left')}
        <div class="compare-vs">${t('guide.vs')}</div>
        ${this._renderCompareSide(right, left, 'right')}
      </div>
    `;
  }

  private _renderCompareSide(
    team: GuideTeamData | undefined,
    other: GuideTeamData | undefined,
    side: 'left' | 'right',
  ): TemplateResult {
    const setTeam = (id: string | null) => {
      if (side === 'left') this._compareLeft = id;
      else this._compareRight = id;
    };

    if (!team) {
      return html`
        <div class="compare-side">
          <div class="compare-picker">
            <div class="cp-msg">${t('gw.comparePick', { n: side === 'left' ? '1' : '2' })}</div>
            <select class="cp-select"
                    @change=${(e: Event) => {
                      const v = (e.target as HTMLSelectElement).value;
                      if (v) setTeam(v);
                    }}>
              <option value="">${t('gw.comparePickOption')}</option>
              ${GROUPS.map(g => html`
                <optgroup label="${t('guide.group', { letter: g })}">
                  ${this._teamsForGroup(g).map(tm => html`
                    <option value="${tm.teamId}">${tm.name}</option>
                  `)}
                </optgroup>
              `)}
            </select>
          </div>
        </div>
      `;
    }

    type Row = { label: string; value: string | number; numeric?: number; better?: 'min' | 'max'; text?: boolean };
    const rows: Row[] = [
      { label: t('gw.compareFifaRank'), value: `#${team.meta.fifaRank}`, numeric: team.meta.fifaRank, better: 'min' },
      { label: t('gw.compareWorldCups'), value: team.meta.worldCups, numeric: team.meta.worldCups, better: 'max' },
      { label: t('gw.compareStars'), value: `${team.meta.stars} ★`, numeric: team.meta.stars, better: 'max' },
      { label: t('gw.compareConfederation'), value: confederationOf(team.teamId), text: true },
      { label: t('gw.compareCoach'), value: team.coach?.name ?? '—', text: true },
      { label: t('gw.compareStar'), value: team.starPlayer?.name ?? team.captain?.name ?? '—', text: true },
      { label: t('gw.compareSquad'), value: team.squadStats.count, numeric: team.squadStats.count, better: 'max' },
    ];
    const otherNumeric = (label: string): number | undefined => {
      if (!other) return undefined;
      if (label === t('gw.compareFifaRank')) return other.meta.fifaRank;
      if (label === t('gw.compareWorldCups')) return other.meta.worldCups;
      if (label === t('gw.compareStars')) return other.meta.stars;
      if (label === t('gw.compareSquad')) return other.squadStats.count;
      return undefined;
    };

    return html`
      <div class="compare-side">
        <div class="compare-team-head">
          <span class="ct-flag">${team.shortName}</span>
          <div>
            <div class="ct-name">${team.name}</div>
            <div class="ct-group">${t('guide.group', { letter: team.group })} · FIFA #${team.meta.fifaRank}</div>
          </div>
          <button class="ct-change" @click=${() => setTeam(null)}>${t('gw.compareChange')}</button>
        </div>
        <div class="compare-rows">
          ${rows.map(r => {
            const ov = otherNumeric(r.label);
            let win = false;
            if (ov != null && r.numeric != null && r.better) {
              win = r.better === 'min' ? r.numeric < ov : r.numeric > ov;
            }
            return html`
              <div>
                <span class="cr-label">${r.label}</span>
                <span class="cr-val ${win ? 'win' : ''} ${r.text ? 'text' : ''}">${r.value}</span>
              </div>
            `;
          })}
        </div>
        <div class="compare-foot">
          <button class="modal-action-btn primary" style="width:100%;box-sizing:border-box;text-align:center"
                  @click=${() => this._openTeam(team.teamId)}>
            ${t('gw.compareViewSheet')}
          </button>
        </div>
      </div>
    `;
  }

  // ───────── Modal de equipo ─────────
  private _renderModal(): TemplateResult {
    const tm = this._teamById(this._selectedTeam);
    const data = this._data;
    if (!tm || !data) return html``;

    const stars = tm.squad
      .filter(p => lineupNumbers(tm).includes(p.number))
      .slice(0, 8);
    const ownMatches = data.groupMatches
      .filter(m => m.teamA === tm.teamId || m.teamB === tm.teamId)
      .sort((a, b) => (a.matchDay ?? 0) - (b.matchDay ?? 0));
    const groupColor = GROUP_COLORS[GROUPS.indexOf(tm.group) % 4];

    return html`
      <div class="modal-overlay" @click=${() => { this._selectedTeam = null; }}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <button class="modal-close" @click=${() => { this._selectedTeam = null; }} aria-label="✕">✕</button>

          <div class="modal-hero">
            <span class="modal-flag">${tm.shortName}</span>
            <div class="modal-titles">
              <div class="eyebrow">${t('gw.modalEyebrow')}</div>
              <h2>${tm.name}</h2>
            </div>
            <div class="modal-group-badge" style="background:${groupColor}">
              <span class="gb-label">${t('guide.groupBadgeLabel')}</span>
              <span class="gb-letter">${tm.group}</span>
            </div>
          </div>

          <div class="modal-stats">
            <div>
              <div class="sb-l">${t('gw.compareFifaRank')}</div>
              <div class="sb-v">#${tm.meta.fifaRank}</div>
            </div>
            <div>
              <div class="sb-l">${t('gw.cardWorldCups')}</div>
              <div class="sb-v">${tm.meta.worldCups}</div>
            </div>
            <div>
              <div class="sb-l">${t('gw.compareStars')}</div>
              <div class="sb-v">${tm.meta.stars}★</div>
            </div>
            <div>
              <div class="sb-l">${t('gw.modalConfederation')}</div>
              <div class="sb-v" style="font-size:13px">${confederationOf(tm.teamId)}</div>
            </div>
          </div>

          <div class="modal-cols">
            <div class="modal-block">
              <div class="mb-head"><span>${t('gw.modalCoachBlock')}</span></div>
              <div class="mb-body">
                <div class="c-name">${tm.coach?.name ?? '—'}</div>
                ${tm.coach ? html`
                  <div class="c-row">
                    <span class="c-label">${t('guide.coach')}</span>
                    <span>${tm.coach.nationality ?? ''}</span>
                  </div>
                ` : ''}
                <div class="c-row">
                  <span class="c-label">${t('guide.formation')}</span>
                  <span>${tm.lineup?.formation ?? '—'}</span>
                </div>
              </div>
            </div>
            <div class="modal-block">
              <div class="mb-head">
                <span>${t('gw.modalSquadBlock')}</span>
                <span class="mb-extra">${t('gw.modalSquadExtra', { n: String(stars.length) })}</span>
              </div>
              <div class="mb-body">
                <ol class="players-list">
                  ${stars.map((p, i) => html`
                    <li class="${i === 0 ? 'star' : ''}">
                      <span class="p-num">${i === 0 ? '★' : String(i + 1).padStart(2, '0')}</span>
                      <span>${p.name}${p.captain ? html` <small style="color:var(--dim)">${t('guide.captainBadge')}</small>` : ''}</span>
                    </li>
                  `)}
                </ol>
              </div>
            </div>
          </div>

          ${this._renderPitch(tm)}

          <div class="modal-block modal-matches">
            <div class="mb-head">
              <span>${t('gw.modalCalendar')}</span>
              <span class="mb-extra">${t('gw.modalCalendarSub')}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>${t('gw.colJornada')}</th>
                  <th>${t('gw.colMatch')}</th>
                  <th>${t('gw.colDate')}</th>
                  <th>${t('gw.colTime')}</th>
                  <th>${t('gw.colVenue')}</th>
                </tr>
              </thead>
              <tbody>
                ${ownMatches.map(m => {
                  const home = m.teamA === tm.teamId;
                  const rival = this._teamById(home ? m.teamB : m.teamA);
                  return html`
                    <tr>
                      <td class="mm-day">J${m.matchDay}</td>
                      <td>
                        <div class="mm-vs">
                          <span>${home ? tm.shortName : rival?.shortName}</span>
                          <span class="vs">${t('guide.vs')}</span>
                          <span>${home ? rival?.shortName : tm.shortName}</span>
                        </div>
                      </td>
                      <td class="mm-mono">${fmtDate(m.date, data.locale)}</td>
                      <td style="font-family:var(--font-var);font-size:12px;color:var(--retro-orange)">${m.timeSpain}</td>
                      <td class="mm-mono">${m.city}</td>
                    </tr>
                  `;
                })}
              </tbody>
            </table>
          </div>

          <div class="modal-actions">
            <button class="modal-action-btn primary" @click=${() => this._startCompare(tm.teamId)}>
              ${t('gw.modalCompareBtn')}
            </button>
            <button class="modal-action-btn" @click=${() => this._jumpToGroup(tm.group)}>
              ${t('gw.modalGroupBtn', { letter: tm.group })}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ───────── Campo de fútbol ─────────
  private _renderPitch(tm: GuideTeamData): TemplateResult {
    const lineup = tm.lineup;
    if (!lineup) {
      return html`<div class="pitch-empty">${t('gw.pitchNoLineup')}</div>`;
    }
    const coords = FORMATIONS[lineup.formation] ?? FORMATIONS['4-3-3'];
    const xi = lineup.startingXI
      .map(num => tm.squad.find(p => p.number === num))
      .filter((p): p is NonNullable<typeof p> => p != null);
    const benchPlayers = tm.squad
      .filter(p => !lineup.startingXI.includes(p.number))
      .slice(0, 7);

    return html`
      <div class="pitch-block">
        <div class="pb-head">
          <span>${t('gw.pitchTitle')}</span>
          <span class="pb-formation">${lineup.formation.split('-').join(' — ')}</span>
        </div>
        <div class="pitch-wrap">
          <svg class="pitch-svg" viewBox="0 0 100 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="94" height="144" class="line-bold"></rect>
            <line x1="3" y1="75" x2="97" y2="75" class="line"></line>
            <circle cx="50" cy="75" r="11" class="line"></circle>
            <circle cx="50" cy="75" r="0.9" class="spot"></circle>
            <rect x="20" y="3" width="60" height="16" class="line"></rect>
            <rect x="36" y="3" width="28" height="6" class="line"></rect>
            <circle cx="50" cy="12" r="0.9" class="spot"></circle>
            <path d="M 39 19 A 11 11 0 0 0 61 19" class="line"></path>
            <rect x="20" y="131" width="60" height="16" class="line"></rect>
            <rect x="36" y="141" width="28" height="6" class="line"></rect>
            <circle cx="50" cy="138" r="0.9" class="spot"></circle>
            <path d="M 39 131 A 11 11 0 0 1 61 131" class="line"></path>
          </svg>
          ${xi.map((p, i) => {
            const [x, y] = coords[i] ?? [50, 75];
            return html`
              <div
                class="player-card ${p.position === 'GK' ? 'gk' : ''}"
                style="left:${x}%;top:${(y / 150) * 100}%;--player-bg:var(--retro-blue)"
                title="${p.name}">
                <div class="player-photo">${p.number}</div>
                <div class="player-name">${lastName(p.name)}</div>
              </div>
            `;
          })}
        </div>
        ${benchPlayers.length ? html`
          <div class="pitch-bench">
            <span class="pb-label">${t('gw.pitchBench')}</span>
            <span class="pb-list">
              ${benchPlayers.map(p => html`
                <span class="b-item">
                  <span class="num">${String(p.number).padStart(2, '0')}</span>
                  <span>${lastName(p.name)}</span>
                </span>
              `)}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderFooter(): TemplateResult {
    return html`
      <div class="gw-footer">
        <span>★ ${t('guide.brandFooter')}</span>
        <span><kbd>/</kbd> ${t('gw.kbSearch')}</span>
        <span><kbd>←</kbd><kbd>→</kbd> ${t('gw.kbGroup')}</span>
        <span><kbd>Esc</kbd> ${t('gw.kbClose')}</span>
      </div>
    `;
  }
}

/** Números del XI titular, con fallback al orden de plantilla. */
function lineupNumbers(tm: GuideTeamData): number[] {
  if (tm.lineup?.startingXI?.length) return tm.lineup.startingXI;
  return tm.squad.slice(0, 11).map(p => p.number);
}

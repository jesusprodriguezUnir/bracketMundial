import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { generateGuideData, type GuideData, type GuideTeamData, type GuideMatch } from '../lib/guide-service';
import { t, useLocaleStore } from '../i18n';
import { subscribeSlice } from '../store/store-utils';
import { STADIUMS } from '../data/stadiums';
import { TEAMS_2026 } from '../data/fifa-2026';

// GROUPS variable removed as it is declared inside render()

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

/** Historical World Cup winners for the history section */
const WORLD_CUP_HISTORY = [
  { year: 1930, host: 'Uruguay', winner: 'URU', runnerUp: 'ARG', score: '4-2' },
  { year: 1934, host: 'Italia', winner: 'ITA', runnerUp: 'CZE', score: '2-1' },
  { year: 1938, host: 'Francia', winner: 'ITA', runnerUp: 'HUN', score: '4-2' },
  { year: 1950, host: 'Brasil', winner: 'URU', runnerUp: 'BRA', score: '2-1' },
  { year: 1954, host: 'Suiza', winner: 'GER', runnerUp: 'HUN', score: '3-2' },
  { year: 1958, host: 'Suecia', winner: 'BRA', runnerUp: 'SWE', score: '5-2' },
  { year: 1962, host: 'Chile', winner: 'BRA', runnerUp: 'CZE', score: '3-1' },
  { year: 1966, host: 'Inglaterra', winner: 'ENG', runnerUp: 'GER', score: '4-2' },
  { year: 1970, host: 'México', winner: 'BRA', runnerUp: 'ITA', score: '4-1' },
  { year: 1974, host: 'Alemania', winner: 'GER', runnerUp: 'NED', score: '2-1' },
  { year: 1978, host: 'Argentina', winner: 'ARG', runnerUp: 'NED', score: '3-1' },
  { year: 1982, host: 'España', winner: 'ITA', runnerUp: 'GER', score: '3-1' },
  { year: 1986, host: 'México', winner: 'ARG', runnerUp: 'GER', score: '3-2' },
  { year: 1990, host: 'Italia', winner: 'GER', runnerUp: 'ARG', score: '1-0' },
  { year: 1994, host: 'EE. UU.', winner: 'BRA', runnerUp: 'ITA', score: '0-0 (3-2 pen.)' },
  { year: 1998, host: 'Francia', winner: 'FRA', runnerUp: 'BRA', score: '3-0' },
  { year: 2002, host: 'Corea/Japón', winner: 'BRA', runnerUp: 'GER', score: '2-0' },
  { year: 2006, host: 'Alemania', winner: 'ITA', runnerUp: 'FRA', score: '1-1 (5-3 pen.)' },
  { year: 2010, host: 'Sudáfrica', winner: 'ESP', runnerUp: 'NED', score: '1-0' },
  { year: 2014, host: 'Brasil', winner: 'GER', runnerUp: 'ARG', score: '1-0' },
  { year: 2018, host: 'Rusia', winner: 'FRA', runnerUp: 'CRO', score: '4-2' },
  { year: 2022, host: 'Catar', winner: 'ARG', runnerUp: 'FRA', score: '3-3 (4-2 pen.)' },
];

/** Get flag URL for historical teams (some may not be in TEAMS_2026) */
function getHistoryFlagUrl(teamId: string): string {
  const team = TEAMS_2026.find(t => t.id === teamId);
  if (team?.flagUrl) return team.flagUrl;
  return `/assets/flags/${teamId.toLowerCase()}.svg`;
}

const lastName = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return parts.at(-1) ?? name;
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}/${m}/${y}`;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function posLabel(pos: string, locale: string): string {
  const map: Record<string, Record<string, string>> = {
    GK: { es: 'POR', en: 'GK' },
    DF: { es: 'DEF', en: 'DF' },
    MF: { es: 'MED', en: 'MF' },
    FW: { es: 'DEL', en: 'FW' },
  };
  return map[pos]?.[locale] ?? pos;
}

@customElement('guide-print-view')
export class GuidePrintView extends LitElement {
  @state() private _mode: 'auto' | 'user' = 'auto';
  @state() private _data: GuideData | null = null;
  @state() private _generating = false;
  @state() private _genProgress: { current: number; total: number } | null = null;
  private _unsubscribeLocale?: () => void;

  static readonly styles = css`
    :host { display: block; }

    /* ── Controles (solo pantalla) ── */
    .guide-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 var(--ink);
      margin-bottom: 24px;
    }
    .mode-group {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .mode-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .mode-btn {
      all: unset;
      cursor: pointer;
      padding: 8px 14px;
      font-family: var(--font-var);
      font-size: 13px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper);
      color: var(--ink);
      transition: background 0.1s;
    }
    .mode-btn.active {
      background: var(--retro-yellow);
    }
    .mode-btn:hover {
      background: var(--retro-yellow);
    }
    .mode-desc {
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--dim);
      width: 100%;
    }
    .print-btn {
      all: unset;
      cursor: pointer;
      padding: 10px 18px;
      font-family: var(--font-var);
      font-size: 14px;
      background: var(--retro-green);
      color: #fff;
      border: 2px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .print-btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 var(--ink);
    }
    .print-btn:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 var(--ink);
    }
    .pdf-btn {
      all: unset;
      cursor: pointer;
      padding: 10px 18px;
      font-family: var(--font-var);
      font-size: 14px;
      background: var(--retro-orange);
      color: #fff;
      border: 2px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .pdf-btn:hover:not(:disabled) {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 var(--ink);
    }
    .pdf-btn:active:not(:disabled) {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 var(--ink);
    }
    .pdf-btn:disabled {
      opacity: 0.65;
      cursor: wait;
    }

    /* ── Documento de guía ── */
    .guide-document {
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-body);
    }
    .guide-document.pdf-exporting .stadiums-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .guide-document.pdf-exporting .stadium-card-image {
      height: 130px;
    }
    .guide-document.pdf-exporting .stadium-card-name {
      font-size: 14px;
    }
    .guide-document.pdf-exporting .stadium-card-desc {
      font-size: 9px;
    }
    .guide-document.pdf-exporting .kits-grid {
      grid-template-columns: repeat(4, 1fr);
    }
    .guide-document.pdf-exporting .history-item {
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .guide-document.pdf-exporting .history-year {
      font-size: 14px;
      min-width: 40px;
    }
    .guide-document.pdf-exporting .calendar-match {
      grid-template-columns: 45px minmax(0, 1fr) 70px minmax(0, 1fr) 55px;
      gap: 6px;
      font-size: 11px;
    }
    .guide-document.pdf-exporting .calendar-team,
    .guide-document.pdf-exporting .calendar-venue {
      min-width: 0;
    }
    .guide-document.pdf-exporting .calendar-venue {
      font-size: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .guide-document.pdf-exporting {
      padding: 0 36px;
      box-sizing: border-box;
    }
    .guide-document.pdf-exporting .section-header {
      margin-bottom: 24px;
      padding-bottom: 12px;
    }
    .guide-document.pdf-exporting .cover-page {
      min-height: auto;
      height: 1100px;
      justify-content: flex-start;
      padding-top: 60px;
    }
    .guide-document.pdf-exporting .cover-eyebrow {
      font-size: 14px;
      letter-spacing: 0.35em;
      margin-bottom: 20px;
    }
    .guide-document.pdf-exporting .cover-title {
      font-size: 60px;
    }
    .guide-document.pdf-exporting .cover-subtitle {
      font-size: 22px;
      margin-bottom: 28px;
    }
    .guide-document.pdf-exporting .cover-badge {
      font-size: 12px;
      padding: 12px 28px;
      margin-bottom: 24px;
    }
    .guide-document.pdf-exporting .cover-stats-bar {
      gap: 20px;
      margin-bottom: 20px;
    }
    .guide-document.pdf-exporting .cover-stat-num {
      font-size: 30px;
    }
    .guide-document.pdf-exporting .cover-flags {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 6px;
      max-width: 100%;
      margin-top: 12px;
    }
    .guide-document.pdf-exporting .cover-flag {
      width: 100%;
      height: auto;
      aspect-ratio: 3 / 2;
    }
    .guide-document.pdf-exporting .cover-bottom-bar {
      margin-top: 16px;
      font-size: 10px;
    }

    /* ── Cabecera y pie de página para PDF ── */
    .pdf-running-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px dotted var(--ink);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 16px;
    }
    .pdf-page-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 0;
      border-top: 1px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--dim);
      margin-top: 16px;
    }

    /* ── Portada Premium ── */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      text-align: center;
      padding: 40px 40px 20px;
      border: 4px solid var(--ink);
      box-shadow: inset 0 0 80px rgba(26,25,51,0.04);
      position: relative;
      overflow: hidden;
    }
    .cover-page::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 50% 30%, rgba(255,200,50,0.08) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 70%, rgba(230,70,50,0.05) 0%, transparent 50%);
      pointer-events: none;
    }
    .cover-top-strip {
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, var(--retro-orange), var(--retro-yellow), var(--retro-green));
      border-bottom: 2px solid var(--ink);
      margin-bottom: 24px;
    }
    .cover-eyebrow {
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.35em;
      color: var(--retro-orange);
      margin-bottom: 16px;
      position: relative;
    }
    .cover-title {
      font-family: var(--font-var);
      font-size: clamp(42px, 7vw, 72px);
      line-height: 0.95;
      color: var(--ink);
      margin-bottom: 12px;
      position: relative;
      text-shadow: 2px 2px 0 var(--retro-yellow);
    }
    .cover-subtitle {
      font-family: var(--font-var);
      font-size: clamp(16px, 2.5vw, 24px);
      color: var(--dim);
      margin-bottom: 24px;
      position: relative;
    }
    .cover-badge {
      display: inline-block;
      padding: 10px 24px;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.15em;
      background: var(--retro-yellow);
      color: var(--ink);
      margin-bottom: 28px;
      position: relative;
    }
    .cover-stats-bar {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      position: relative;
    }
    .cover-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 18px;
      border: 2px solid var(--ink);
      background: var(--paper-2);
    }
    .cover-stat-num {
      font-family: var(--font-var);
      font-size: 28px;
      font-weight: 900;
      line-height: 1;
      color: var(--retro-orange);
    }
    .cover-stat-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
      margin-top: 2px;
    }
    .cover-flags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5px;
      max-width: 640px;
      margin-top: 8px;
      position: relative;
    }
    .cover-flag {
      width: 36px;
      height: 24px;
      object-fit: cover;
      border: 1px solid var(--ink);
      box-shadow: 1px 1px 0 var(--ink);
    }
    .cover-bottom-bar {
      width: 100%;
      margin-top: 20px;
      padding: 8px 0;
      border-top: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--dim);
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
      position: relative;
    }

    /* ── Secciones ── */
    .section-page {
      page-break-before: always;
      padding: 24px 0;
    }
    .section-header {
      border-bottom: 3px dashed var(--ink);
      margin-bottom: 24px;
      padding-bottom: 12px;
    }
    .section-eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.25em;
      color: var(--retro-orange);
      text-transform: uppercase;
    }
    .section-title {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1.1;
      color: var(--ink);
      margin-top: 4px;
    }

    /* ── Calendario ── */
    .calendar-date {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .calendar-date-header {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      background: var(--ink);
      color: var(--paper);
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .calendar-match {
      display: grid;
      grid-template-columns: 50px 1fr 80px 1fr 60px;
      gap: 8px;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(26,25,51,0.15);
      font-size: 13px;
    }
    .calendar-time {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
    }
    .calendar-team {
      font-family: var(--font-var);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .calendar-flag {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border: 1px solid var(--ink);
    }
    .calendar-score {
      font-family: var(--font-mono);
      font-size: 12px;
      text-align: center;
      background: var(--paper-2);
      padding: 2px 6px;
      border: 1px solid var(--ink);
    }
    .calendar-venue {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      text-align: right;
    }
    .calendar-group-label {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--retro-yellow);
      color: var(--ink);
      padding: 1px 5px;
      margin-left: 6px;
    }
    .calendar-round-label {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--retro-orange);
      color: var(--paper);
      padding: 1px 5px;
      margin-left: 6px;
    }

    /* ── Ficha de equipo (1 pág unificada) ── */
    .team-sheet {
      page-break-after: always;
      padding: 16px 0;
      box-sizing: border-box;
    }
    .team-sheet:last-of-type {
      page-break-after: auto;
    }
    .team-sheet-header {
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 3.5px solid var(--ink);
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .team-sheet-flag {
      width: 44px;
      height: 30px;
      object-fit: cover;
      border: 2px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
    }
    .team-sheet-title {
      flex: 1;
    }
    .team-sheet-name {
      font-family: var(--font-var);
      font-size: 20px;
      line-height: 1;
      font-weight: bold;
    }
    .team-sheet-meta {
      font-family: var(--font-mono);
      font-size: 8.5px;
      color: var(--dim);
      letter-spacing: 0.05em;
      margin-top: 3px;
    }

    /* Distribución en 2 columnas para el bloque superior */
    .team-top-row {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 16px;
      margin-bottom: 10px;
      align-items: start;
    }

    /* Entrenador ultra compacto */
    .coach-block-mini {
      display: flex;
      gap: 8px;
      align-items: center;
      background: var(--paper-2);
      border: 1.5px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
      padding: 6px;
      margin-bottom: 8px;
    }
    .coach-photo-mini {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border: 1px solid var(--ink);
      border-radius: 50%;
    }
    .coach-info-mini {
      flex: 1;
      min-width: 0;
    }
    .coach-name-mini {
      font-family: var(--font-var);
      font-size: 11px;
      font-weight: bold;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .coach-detail-mini {
      font-family: var(--font-mono);
      font-size: 7.5px;
      color: var(--dim);
    }

    /* Partidos ultra compactos */
    .matches-block-mini {
      background: var(--paper-3);
      border: 1.5px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
      padding: 6px;
    }
    .matches-title-mini {
      font-family: var(--font-var);
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 4px;
      color: var(--retro-orange);
    }
    .match-row-mini {
      display: grid;
      grid-template-columns: 20px 1fr auto;
      gap: 6px;
      align-items: center;
      padding: 3px 0;
      border-bottom: 1px dashed rgba(26,25,51,0.1);
      font-size: 8.5px;
      font-family: var(--font-body);
    }
    .match-row-mini:last-child {
      border-bottom: none;
    }
    .match-day-mini {
      font-family: var(--font-mono);
      font-weight: bold;
      color: var(--dim);
    }
    .match-teams-mini {
      display: flex;
      align-items: center;
      gap: 3px;
      min-width: 0;
    }
    .match-flag-mini {
      width: 14px;
      height: 10px;
      object-fit: cover;
      border: 0.5px solid var(--ink);
      flex-shrink: 0;
    }
    .match-team-name-mini {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 60px;
      font-weight: bold;
    }
    .match-score-mini {
      font-family: var(--font-mono);
      background: rgba(26,25,51,0.06);
      padding: 0px 3px;
      border: 0.5px solid var(--ink);
      font-size: 8px;
      flex-shrink: 0;
    }
    .match-time-mini {
      font-family: var(--font-mono);
      color: var(--dim);
      font-size: 7.5px;
    }

    /* Campo de fútbol ultra-compacto (Chalkboard style) */
    .pitch-block-mini {
      background:
        repeating-linear-gradient(
          to bottom,
          var(--retro-green) 0 10%,
          color-mix(in srgb, var(--retro-green) 86%, #000) 10% 20%
        );
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      aspect-ratio: 100 / 150;
      position: relative;
      width: 100%;
      max-width: 190px;
      margin: 0 auto;
    }
    .pitch-svg-mini {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .pitch-svg-mini .line { fill: none; stroke: rgba(255,255,255,0.48); stroke-width: 0.7; }
    .pitch-svg-mini .line-bold { fill: none; stroke: rgba(255,255,255,0.64); stroke-width: 1.0; }
    .pitch-svg-mini .spot { fill: rgba(255,255,255,0.64); }
    
    .player-card-pitch {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    .player-photo-pitch {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1.5px solid var(--ink);
      background: var(--player-bg, var(--retro-blue));
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: bold;
      color: var(--paper);
      box-shadow: 1px 1px 0 rgba(0,0,0,0.15);
      position: relative;
    }
    .player-card-pitch.gk .player-photo-pitch { background: var(--retro-yellow); color: var(--ink); }
    .player-name-pitch {
      font-family: var(--font-body);
      font-size: 6.5px;
      font-weight: 800;
      color: var(--paper);
      background: var(--ink);
      border: 0.5px solid var(--paper);
      padding: 0px 2px;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1;
      text-align: center;
    }

    /* Roster de jugadores: rejilla extremadamente densa (6 columnas) */
    .players-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      margin-top: 10px;
    }
    .player-card-mini {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 4px;
      border: 1.5px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
      background: var(--paper-2);
      padding: 3px;
      height: 32px;
      page-break-inside: avoid;
    }
    .player-photo-mini {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid var(--ink);
      object-fit: cover;
      background: var(--paper-3);
      flex-shrink: 0;
    }
    .player-photo-placeholder-mini {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: var(--dim);
      background: var(--paper-3);
      flex-shrink: 0;
    }
    .player-info-mini {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }
    .player-meta-mini {
      display: flex;
      align-items: center;
      gap: 3px;
      font-family: var(--font-mono);
      font-size: 7.5px;
      line-height: 1;
    }
    .player-number-mini {
      font-weight: bold;
      color: var(--retro-orange);
    }
    .player-pos-mini {
      background: var(--ink);
      color: var(--paper);
      padding: 0px 2px;
      font-size: 7px;
    }
    .player-pos-mini.captain {
      background: var(--retro-yellow);
      color: var(--ink);
    }
    .player-name-mini {
      font-family: var(--font-var);
      font-size: 8px;
      font-weight: bold;
      line-height: 1.1;
      color: var(--ink);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      margin-top: 2px;
    }

    /* ── Predicción ── */
    .prediction-page {
      page-break-before: always;
      padding: 24px 0;
    }
    .prediction-podium {
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      gap: 16px;
      margin: 24px 0;
      align-items: end;
    }
    .podium-item {
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      padding: 16px;
      text-align: center;
      background: var(--paper-2);
    }
    .podium-item.champion {
      background: var(--retro-yellow);
      order: 2;
    }
    .podium-item.runner-up {
      order: 1;
    }
    .podium-item.third {
      order: 3;
    }
    .podium-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      margin-bottom: 8px;
    }
    .podium-flag {
      width: 48px;
      height: 32px;
      object-fit: cover;
      border: 1px solid var(--ink);
      margin-bottom: 8px;
    }
    .podium-name {
      font-family: var(--font-var);
      font-size: 16px;
    }
    .bracket-summary {
      margin-top: 24px;
    }
    .bracket-round {
      margin-bottom: 16px;
    }
    .bracket-round-title {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      background: var(--ink);
      color: var(--paper);
      padding: 4px 10px;
      margin-bottom: 8px;
    }
    .bracket-match {
      display: grid;
      grid-template-columns: 1fr 50px 1fr;
      gap: 8px;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(26,25,51,0.15);
      font-size: 13px;
    }
    .bracket-team {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bracket-team.winner {
      font-weight: bold;
    }
    .bracket-score {
      font-family: var(--font-mono);
      text-align: center;
      background: var(--paper-2);
      border: 1px solid var(--ink);
      padding: 2px 6px;
    }

    .footer-line {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      text-align: center;
      letter-spacing: 0.1em;
    }

    /* ── Estadios ── */
    .stadiums-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .stadium-card {
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-2);
      page-break-inside: avoid;
    }
    .stadium-card-image {
      width: 100%;
      height: 140px;
      object-fit: cover;
      border-bottom: 2px solid var(--ink);
      display: block;
    }
    .stadium-card-body {
      padding: 10px 12px;
    }
    .stadium-card-name {
      font-family: var(--font-var);
      font-size: 15px;
      font-weight: bold;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .stadium-card-location {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .stadium-card-capacity {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 10px;
      background: var(--ink);
      color: var(--paper);
      padding: 2px 8px;
      margin-bottom: 6px;
    }
    .stadium-card-desc {
      font-family: var(--font-body);
      font-size: 10px;
      line-height: 1.4;
      color: var(--ink);
      margin-bottom: 6px;
    }
    .stadium-card-matches {
      font-family: var(--font-mono);
      font-size: 8.5px;
      color: var(--dim);
      border-top: 1px dashed rgba(26,25,51,0.2);
      padding-top: 5px;
    }
    .stadium-card-highlight {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 8px;
      background: var(--retro-yellow);
      color: var(--ink);
      padding: 1px 5px;
      margin-top: 4px;
    }

    /* ── Kits (crest-based since no kit photos) ── */
    .kits-group-block {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .kits-group-header {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      background: var(--ink);
      color: var(--paper);
      padding: 5px 10px;
      margin-bottom: 8px;
    }
    .kits-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .kit-card {
      border: 1.5px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
      background: var(--paper-2);
      padding: 8px;
      text-align: center;
      page-break-inside: avoid;
    }
    .kit-crest {
      width: 48px;
      height: 48px;
      object-fit: contain;
      margin-bottom: 6px;
    }
    .kit-team-name {
      font-family: var(--font-var);
      font-size: 10px;
      font-weight: bold;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .kit-color-bar {
      display: flex;
      gap: 3px;
      justify-content: center;
      margin-top: 4px;
    }
    .kit-color-swatch {
      width: 20px;
      height: 10px;
      border: 1px solid var(--ink);
    }
    .kit-label {
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Historia ── */
    .history-timeline {
      position: relative;
      padding-left: 30px;
    }
    .history-timeline::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--ink);
    }
    .history-item {
      position: relative;
      margin-bottom: 10px;
      padding: 8px 12px;
      border: 1.5px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
      background: var(--paper-2);
      page-break-inside: avoid;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .history-item::before {
      content: '';
      position: absolute;
      left: -26px;
      top: 50%;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--retro-orange);
      border: 2px solid var(--ink);
    }
    .history-item.champion-item::before {
      background: var(--retro-yellow);
    }
    .history-year {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: bold;
      color: var(--retro-orange);
      min-width: 48px;
    }
    .history-flags {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
    }
    .history-flag {
      width: 28px;
      height: 19px;
      object-fit: cover;
      border: 1px solid var(--ink);
    }
    .history-vs {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
    }
    .history-score {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: bold;
      background: var(--ink);
      color: var(--paper);
      padding: 1px 6px;
    }
    .history-host {
      font-family: var(--font-body);
      font-size: 9px;
      color: var(--dim);
      margin-left: auto;
      white-space: nowrap;
    }

    /* ── Impresión ── */
    @media print {
      @page {
        size: A4;
        margin: 10mm;
      }
      .no-print {
        display: none !important;
      }
      .guide-document {
        background: #fff;
        color: #1a1933;
      }
      .cover-page {
        min-height: 100vh;
        border: 4px solid #1a1933;
        page-break-after: always;
      }
      .section-page,
      .team-sheet,
      .prediction-page {
        page-break-before: always;
      }
      .team-sheet:first-of-type {
        page-break-before: always;
      }
      .player-card-mini,
      .calendar-date,
      .coach-block-mini,
      .matches-block-mini,
      .podium-item {
        page-break-inside: avoid;
      }
      .players-grid {
        grid-template-columns: repeat(6, 1fr);
      }
      .calendar-match {
        grid-template-columns: 45px 1fr 70px 1fr 55px;
        font-size: 11px;
      }
    }

    @media (max-width: 768px) {
      .players-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .team-top-row {
        grid-template-columns: 1fr;
      }
      .prediction-podium {
        grid-template-columns: 1fr;
      }
      .podium-item.champion { order: 1; }
      .podium-item.runner-up { order: 2; }
      .podium-item.third { order: 3; }
      .calendar-match {
        grid-template-columns: 40px 1fr 60px 1fr 50px;
        gap: 4px;
        font-size: 11px;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._regenerate();
    this._unsubscribeLocale = subscribeSlice(
      useLocaleStore,
      s => s.locale,
      () => { this._regenerate(); this.requestUpdate(); }
    );
  }

  disconnectedCallback() {
    this._unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private _regenerate() {
    this._data = generateGuideData(this._mode);
  }

  private _setMode(mode: 'auto' | 'user') {
    this._mode = mode;
    this._regenerate();
  }

  private _print() {
    window.print();
  }

  private async _downloadPdf() {
    if (!this._data || this._generating) return;
    this._generating = true;
    this._genProgress = null;
    this.requestUpdate();
    try {
      const { triggerGuidePdfDownload } = await import('../lib/guide-pdf-export');
      await triggerGuidePdfDownload(
        this.shadowRoot!,
        this._data.locale,
        (current, total) => {
          this._genProgress = { current, total };
          this.requestUpdate();
        }
      );
    } finally {
      this._generating = false;
      this._genProgress = null;
      this.requestUpdate();
    }
  }

  goBack() {
    // No-op: guide-view has no internal navigation state
  }

  render() {
    const data = this._data;
    if (!data) return html``;
    const locale = data.locale;

    const teamsByGroup = groupBy(data.teams, team => team.group);
    const groupLetters = 'ABCDEFGHIJKL'.split('');

    const groupDates = groupBy(data.groupMatches, m => m.date);
    const sortedDates = Object.keys(groupDates).sort();

    const knockoutByRound: Record<string, GuideMatch[]> = {
      roundOf32: [],
      roundOf16: [],
      quarterfinals: [],
      semifinals: [],
      thirdPlace: [],
      final: [],
    };
    for (const m of data.knockoutMatches) {
      if (m.round && knockoutByRound[m.round]) {
        knockoutByRound[m.round].push(m);
      }
    }

    const roundLabels: Record<string, string> = {
      roundOf32: t('guide.r32'),
      roundOf16: t('guide.r16'),
      quarterfinals: t('guide.qf'),
      semifinals: t('guide.sf'),
      thirdPlace: t('guide.tp'),
      final: t('guide.final'),
    };

    return html`
      <div class="guide-controls no-print">
        <div class="mode-group">
          <span class="mode-label">${locale === 'es' ? 'Modo' : 'Mode'}</span>
          <button
            class="mode-btn ${this._mode === 'auto' ? 'active' : ''}"
            @click="${() => this._setMode('auto')}">
            ${t('guide.modeAuto')}
          </button>
          <button
            class="mode-btn ${this._mode === 'user' ? 'active' : ''}"
            @click="${() => this._setMode('user')}">
            ${t('guide.modeUser')}
          </button>
          <span class="mode-desc">
            ${this._mode === 'auto' ? t('guide.modeAutoDesc') : t('guide.modeUserDesc')}
          </span>
        </div>
        <button class="print-btn" @click="${this._print}">
          🖨 ${t('guide.print')}
        </button>
        <button class="pdf-btn" @click="${this._downloadPdf}" ?disabled="${this._generating}">
          ${this._generating
            ? (this._genProgress
                ? html`⏳ ${this._genProgress.current}/${this._genProgress.total}`
                : html`⏳ ${locale === 'es' ? 'Preparando...' : 'Preparing...'}`)
            : html`📥 ${locale === 'es' ? 'Descargar PDF' : 'Download PDF'}`}
        </button>
      </div>

      <div class="guide-document">
        <!-- PORTADA PREMIUM -->
        <div class="cover-page">
          <div class="cover-top-strip"></div>
          <div class="cover-eyebrow">FIFA WORLD CUP 2026</div>
          <div class="cover-title">${t('section.guide.title')}</div>
          <div class="cover-subtitle">${t('guide.coverSubtitle')}</div>
          <div class="cover-badge">${this._mode === 'auto' ? t('guide.modeAuto') : t('guide.modeUser')}</div>
          <div class="cover-stats-bar">
            <div class="cover-stat">
              <span class="cover-stat-num">48</span>
              <span class="cover-stat-label">${locale === 'es' ? 'Selecciones' : 'Teams'}</span>
            </div>
            <div class="cover-stat">
              <span class="cover-stat-num">16</span>
              <span class="cover-stat-label">${locale === 'es' ? 'Estadios' : 'Stadiums'}</span>
            </div>
            <div class="cover-stat">
              <span class="cover-stat-num">104</span>
              <span class="cover-stat-label">${locale === 'es' ? 'Partidos' : 'Matches'}</span>
            </div>
          </div>
          <div class="cover-flags">
            ${data.teams.slice(0, 48).map(t => html`
              <img class="cover-flag" src="${t.flagUrl}" alt="${t.name}" loading="lazy" />
            `)}
          </div>
          <div class="cover-bottom-bar">
            <span>${locale === 'es' ? 'Guía oficial de bracketmundial.com' : 'Official guide by bracketmundial.com'}</span>
            <span>· 11 Jun · 19 Jul 2026 ·</span>
            <span>${locale === 'es' ? 'EE.UU. · México · Canadá' : 'USA · Mexico · Canada'}</span>
          </div>
        </div>

        <!-- CALENDARIO -->
        <div class="section-page">
          <div class="section-header">
            <div class="section-eyebrow">${t('guide.calendarSection')}</div>
            <div class="section-title">${t('guide.calendarSection')}</div>
          </div>

          <div class="section-header" style="margin-top: 24px;">
            <div class="section-eyebrow">⚽ ${t('tabs.groups')}</div>
          </div>
          ${sortedDates.map(date => html`
            <div class="calendar-date">
              <div class="calendar-date-header">${formatDate(date)}</div>
              ${groupDates[date].map(m => html`
                <div class="calendar-match">
                  <span class="calendar-time">${m.timeSpain}</span>
                  <span class="calendar-team">
                    <img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />
                    ${m.teamAName}
                  </span>
                  <span class="calendar-score">
                    ${m.scoreA !== null && m.scoreB !== null ? `${m.scoreA}-${m.scoreB}` : 'vs'}
                  </span>
                  <span class="calendar-team">
                    <img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />
                    ${m.teamBName}
                  </span>
                  <span class="calendar-venue">
                    ${m.venue}
                    <span class="calendar-group-label">${m.group}</span>
                  </span>
                </div>
              `)}
            </div>
          `)}

          <div class="section-header" style="margin-top: 32px;">
            <div class="section-eyebrow">★ ${t('tabs.knockout')}</div>
          </div>
          ${Object.entries(knockoutByRound).map(([round, matches]) => html`
            <div class="calendar-date">
              <div class="calendar-date-header">${roundLabels[round]}</div>
              ${matches.map(m => html`
                <div class="calendar-match">
                  <span class="calendar-time">${m.timeSpain ? formatDate(m.date) + ' ' + m.timeSpain : formatDate(m.date)}</span>
                  <span class="calendar-team">
                    ${m.teamA ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />` : ''}
                    ${m.teamAName}
                  </span>
                  <span class="calendar-score">
                    ${m.scoreA !== null && m.scoreB !== null
                      ? html`${m.scoreA}-${m.scoreB}${m.penaltyScoreA !== null && m.penaltyScoreB !== null ? html`<span style="font-size:9px;display:block;">(${m.penaltyScoreA}-${m.penaltyScoreB})</span>` : ''}`
                      : 'vs'}
                  </span>
                  <span class="calendar-team">
                    ${m.teamB ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />` : ''}
                    ${m.teamBName}
                  </span>
                  <span class="calendar-venue">
                    ${m.venue}
                    <span class="calendar-round-label">${roundLabels[round]}</span>
                  </span>
                </div>
              `)}
            </div>
          `)}
        </div>

        <!-- FICHAS DE EQUIPOS -->
        <div class="section-page">
          <div class="section-header">
            <div class="section-eyebrow">${t('guide.teamsSection')}</div>
            <div class="section-title">${t('guide.teamsSection')}</div>
          </div>
        </div>

        ${groupLetters.map(letter => {
          const groupTeams = teamsByGroup[letter] ?? [];
          return groupTeams.map(team => this._renderTeamSheet(team, locale, data));
        })}

        <!-- ESTADIOS -->
        ${this._renderStadiumsSection(locale)}

        <!-- ESCUDOS Y COLORES -->
        ${this._renderKitsSection(locale, data)}

        <!-- HISTORIA -->
        ${this._renderHistorySection(locale)}

        <!-- PREDICCIÓN -->
        <div class="prediction-page">
          <div class="section-header">
            <div class="section-eyebrow">${t('guide.predictionSection')}</div>
            <div class="section-title">${t('guide.predictionSection')}</div>
          </div>

          <div class="prediction-podium">
            <div class="podium-item runner-up">
              <div class="podium-label">${t('guide.runnerUp')}</div>
              ${data.prediction.runnerUp
                ? html`
                  <img class="podium-flag" src="${data.teams.find(t => t.teamId === data.prediction.runnerUp)?.flagUrl ?? ''}" alt="" />
                  <div class="podium-name">${data.teams.find(t => t.teamId === data.prediction.runnerUp)?.name ?? data.prediction.runnerUp}</div>
                `
                : html`<div class="podium-name">TBD</div>`}
            </div>
            <div class="podium-item champion">
              <div class="podium-label">🏆 ${t('guide.champion')}</div>
              ${data.prediction.champion
                ? html`
                  <img class="podium-flag" src="${data.teams.find(t => t.teamId === data.prediction.champion)?.flagUrl ?? ''}" alt="" />
                  <div class="podium-name">${data.teams.find(t => t.teamId === data.prediction.champion)?.name ?? data.prediction.champion}</div>
                `
                : html`<div class="podium-name">TBD</div>`}
            </div>
            <div class="podium-item third">
              <div class="podium-label">${t('guide.thirdPlace')}</div>
              ${data.prediction.thirdPlace
                ? html`
                  <img class="podium-flag" src="${data.teams.find(t => t.teamId === data.prediction.thirdPlace)?.flagUrl ?? ''}" alt="" />
                  <div class="podium-name">${data.teams.find(t => t.teamId === data.prediction.thirdPlace)?.name ?? data.prediction.thirdPlace}</div>
                `
                : html`<div class="podium-name">TBD</div>`}
            </div>
          </div>

          <div class="bracket-summary">
            ${Object.entries(knockoutByRound).map(([round, matches]) => html`
              <div class="bracket-round">
                <div class="bracket-round-title">${roundLabels[round]}</div>
                ${matches.map(m => html`
                  <div class="bracket-match">
                    <span class="bracket-team ${m.winnerId === m.teamA ? 'winner' : ''}">
                      ${m.teamA ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />` : ''}
                      ${m.teamAName}
                    </span>
                    <span class="bracket-score">
                      ${m.scoreA !== null && m.scoreB !== null
                        ? html`${m.scoreA}-${m.scoreB}${m.penaltyScoreA !== null ? html`<span style="font-size:9px;display:block;">(${m.penaltyScoreA}-${m.penaltyScoreB})</span>` : ''}`
                        : '-'}
                    </span>
                    <span class="bracket-team ${m.winnerId === m.teamB ? 'winner' : ''}">
                      ${m.teamB ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />` : ''}
                      ${m.teamBName}
                    </span>
                  </div>
                `)}
              </div>
            `)}
          </div>

          <div class="footer-line">
            ${t('guide.generatedBy')} · ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderTeamSheet(team: GuideTeamData, locale: string, data: GuideData) {
    const formation = team.lineup?.formation ?? '';
    const sortedPlayers = [...team.players].sort((a, b) => {
      const posOrder = { GK: 0, DF: 1, MF: 2, FW: 3 };
      return (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9) || a.number - b.number;
    });

    return html`
      <div class="team-sheet">
        <div class="team-sheet-header">
          <img class="team-sheet-flag" src="${team.flagUrl}" alt="${team.name}" />
          <div class="team-sheet-title">
            <div class="team-sheet-name">${team.name}</div>
            <div class="team-sheet-meta">
              ${t('guide.group', { letter: team.group })} · FIFA Rank: #${team.meta.fifaRank}
              ${formation ? '· ' + t('guide.formation') + ' ' + formation : ''}
              · ${team.meta.worldCups} ${locale === 'es' ? 'Títulos' : 'Titles'}
            </div>
          </div>
        </div>

        <div class="team-top-row">
          <!-- Columna Izquierda: Entrenador y Calendario -->
          <div>
            ${team.coach ? html`
              <div class="coach-block-mini">
                ${team.hasCoachPhoto
                  ? html`<img class="coach-photo-mini" src="${this._upscaledUrl(team.coachPhotoUrl)}" alt="${team.coach.name}" />`
                  : html`<div class="coach-photo-mini" style="display:flex;align-items:center;justify-content:center;font-size:14px;background:var(--paper-3);">👤</div>`}
                <div class="coach-info-mini">
                  <div class="coach-name-mini">${team.coach.name}</div>
                  <div class="coach-detail-mini">${t('guide.coach')} · ${team.coach.nationality}</div>
                </div>
              </div>
            ` : ''}

            <!-- Calendario de sus 3 partidos de grupo -->
            <div class="matches-block-mini">
              <div class="matches-title-mini">📅 ${t('guide.calendarSection')}</div>
              ${team.groupMatches.map(m => html`
                <div class="match-row-mini">
                  <span class="match-day-mini">J${m.matchDay}</span>
                  <span class="match-teams-mini">
                    <img class="match-flag-mini" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />
                    <span class="match-team-name-mini">${m.teamAName}</span>
                    <span class="match-score-mini">${m.scoreA !== null ? `${m.scoreA}-${m.scoreB}` : 'vs'}</span>
                    <img class="match-flag-mini" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />
                    <span class="match-team-name-mini">${m.teamBName}</span>
                  </span>
                  <span class="match-time-mini">${m.timeSpain}</span>
                </div>
              `)}
            </div>
          </div>

          <!-- Columna Derecha: Cancha táctica (Chalkboard) -->
          <div>
            ${this._renderPitchMini(team)}
          </div>
        </div>

        <!-- Fila Inferior: Rejilla densa de 26 jugadores con fotos redimensionadas -->
        <div class="players-grid">
          ${sortedPlayers.map(p => html`
            <div class="player-card-mini">
              ${p.hasPhoto
                ? html`<img class="player-photo-mini" src="${this._upscaledUrl(p.photoUrl)}" alt="${p.name}" />`
                : html`<div class="player-photo-placeholder-mini">⚽</div>`}
              <div class="player-info-mini">
                <div class="player-meta-mini">
                  <span class="player-number-mini">#${p.number}</span>
                  <span class="player-pos-mini ${p.captain ? 'captain' : ''}">
                    ${p.captain ? t('guide.captain') : posLabel(p.position, locale)}
                  </span>
                </div>
                <div class="player-name-mini" title="${p.name}">${lastName(p.name)}</div>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private _renderPitchMini(team: GuideTeamData): TemplateResult {
    const lineup = team.lineup;
    if (!lineup) {
      return html`<div class="pitch-empty" style="font-size: 8px; padding: 10px;">${t('gw.pitchNoLineup')}</div>`;
    }
    const coords = FORMATIONS[lineup.formation] ?? FORMATIONS['4-3-3'];
    const xi = lineup.startingXI
      .map(num => team.squad.find(p => p.number === num))
      .filter((p): p is NonNullable<typeof p> => p != null);

    return html`
      <div class="pitch-block-mini">
        <svg class="pitch-svg-mini" viewBox="0 0 100 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
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
              class="player-card-pitch ${p.position === 'GK' ? 'gk' : ''}"
              style="left:${x}%;top:${(y / 150) * 100}%;--player-bg:var(--ink)"
              title="${p.name}">
              <div class="player-photo-pitch">${p.number}</div>
              <div class="player-name-pitch">${lastName(p.name)}</div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _upscaledUrl(url: string): string {
    return url.replace('/players/', '/players-upscaled/');
  }

  private _renderStadiumsSection(locale: string): TemplateResult {
    const title = locale === 'es' ? 'Estadios' : 'Stadiums';
    const subtitle = locale === 'es'
      ? 'Las 16 sedes que albergarán la Copa del Mundo 2026'
      : 'The 16 venues hosting the 2026 World Cup';
    const capLabel = locale === 'es' ? 'Capacidad' : 'Capacity';
    const matchesLabel = locale === 'es' ? 'Partidos' : 'Matches';
    return html`
      <div class="section-page">
        <div class="section-header">
          <div class="section-eyebrow">🏟 ${title}</div>
          <div class="section-title">${subtitle}</div>
        </div>
        <div class="stadiums-grid">
          ${STADIUMS.map(s => html`
            <div class="stadium-card">
              <img class="stadium-card-image" src="${s.image}" alt="${s.name}" loading="lazy" crossorigin="anonymous" />
              <div class="stadium-card-body">
                <div class="stadium-card-name">${s.name}</div>
                <div class="stadium-card-location">${s.city}, ${s.country}</div>
                <div class="stadium-card-capacity">${capLabel}: ${s.capacity.toLocaleString()}</div>
                <div class="stadium-card-desc">${s.description}</div>
                <div class="stadium-card-matches">${matchesLabel}: ${s.matchesSummary}</div>
                <div class="stadium-card-highlight">${s.highlight}</div>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private _renderKitsSection(locale: string, data: GuideData): TemplateResult {
    const title = locale === 'es' ? 'Escudos y Países' : 'Crests & Countries';
    const subtitle = locale === 'es'
      ? 'Las 48 selecciones participantes agrupadas por grupo'
      : 'All 48 participating nations grouped by stage';
    const homeLabel = locale === 'es' ? 'Local' : 'Home';
    const awayLabel = locale === 'es' ? 'Visitante' : 'Away';
    const teamColors: Record<string, [string, string]> = {
      ARG: ['#75AADB', '#fff'], AUS: ['#FFD700', '#00843D'], AUT: ['#ED2939', '#fff'],
      BEL: ['#E42B2B', '#000'], BOL: ['#1D7D3A', '#FFD700'], BRA: ['#FFD700', '#009739'],
      CAN: ['#E42B2B', '#fff'], CHI: ['#E42B2B', '#0047AB'], COL: ['#FFD700', '#003893'],
      CRC: ['#E42B2B', '#0015FF'], CRO: ['#E42B2B', '#fff'], CZE: ['#003399', '#E42B2B'],
      DEN: ['#E42B2B', '#fff'], ECU: ['#FFD700', '#034EA2'], EGY: ['#E42B2B', '#fff'],
      ENG: ['#fff', '#C8102E'], ESP: ['#E42B2B', '#FFC400'], FRA: ['#002395', '#E42B2B'],
      GER: ['#fff', '#000'], GHA: ['#E42B2B', '#00843D'], GRE: ['#0035BC', '#fff'],
      HUN: ['#E42B2B', '#477050'], IRN: ['#fff', '#239F40'], ITA: ['#008FD7', '#fff'],
      JAM: ['#009B3A', '#FFD200'], JOR: ['#fff', '#E42B2B'], JPN: ['#0044AD', '#fff'],
      KSA: ['#fff', '#006C35'], KOR: ['#E42B2B', '#0047AB'], MAR: ['#E42B2B', '#006233'],
      MEX: ['#006847', '#E42B2B'], NGA: ['#008751', '#fff'], NED: ['#FF6600', '#fff'],
      NOR: ['#E42B2B', '#00205B'], NZL: ['#fff', '#000'], PAR: ['#E42B2B', '#0035BC'],
      PER: ['#E42B2B', '#fff'], POL: ['#fff', '#DC143C'], POR: ['#006600', '#E42B2B'],
      QAT: ['#fff', '#731A22'], IRL: ['#169B62', '#fff'], ROU: ['#FFD700', '#0035BC'],
      SEN: ['#00853F', '#FFD700'], SRB: ['#E42B2B', '#003399'], SVK: ['#fff', '#003399'],
      SLO: ['#fff', '#005DA4'], RSA: ['#FFD700', '#00843D'], SWE: ['#FFD700', '#005B99'],
      SUI: ['#E42B2B', '#fff'], TUN: ['#E42B2B', '#fff'], UKR: ['#0057B7', '#FFD700'],
      URU: ['#75AADB', '#fff'], USA: ['#E42B2B', '#fff'], VEN: ['#FFD700', '#003893'],
      WAL: ['#E42B2B', '#fff'],
    };

    const teamsByGroup = groupBy(data.teams, team => team.group);
    const groupLetters = 'ABCDEFGHIJKL'.split('');

    return html`
      <div class="section-page">
        <div class="section-header">
          <div class="section-eyebrow">🎨 ${title}</div>
          <div class="section-title">${subtitle}</div>
        </div>
        ${groupLetters.map(letter => {
          const groupTeams = teamsByGroup[letter] ?? [];
          if (groupTeams.length === 0) return html``;
          return html`
            <div class="kits-group-block">
              <div class="kits-group-header">${locale === 'es' ? 'Grupo' : 'Group'} ${letter}</div>
              <div class="kits-grid">
                ${groupTeams.map(t => {
                  const colors = teamColors[t.teamId] ?? ['#ccc', '#999'];
                  return html`
                    <div class="kit-card">
                      <img class="kit-crest" src="${t.flagUrl.replace('/flags/', '/crests/').replace('.svg', '.png')}" alt="${t.name}" loading="lazy" @error="${(e: Event) => { (e.target as HTMLImageElement).src = t.flagUrl; }}" />
                      <div class="kit-team-name">${t.shortName || t.name}</div>
                      <div class="kit-color-bar">
                        <span class="kit-color-swatch" style="background:${colors[0]};"></span>
                        <span class="kit-color-swatch" style="background:${colors[1]};"></span>
                      </div>
                      <div class="kit-label">${homeLabel} / ${awayLabel}</div>
                    </div>
                  `;
                })}
              </div>
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderHistorySection(locale: string): TemplateResult {
    const title = locale === 'es' ? 'Historia de la Copa del Mundo' : 'World Cup History';
    const subtitle = locale === 'es'
      ? 'Todos los campeones desde 1930 hasta 2022'
      : 'Every champion from 1930 to 2022';
    return html`
      <div class="section-page">
        <div class="section-header">
          <div class="section-eyebrow">🏆 ${title}</div>
          <div class="section-title">${subtitle}</div>
        </div>
        <div class="history-timeline">
          ${WORLD_CUP_HISTORY.map(h => html`
            <div class="history-item ${h.winner === 'ARG' || h.winner === 'BRA' || h.winner === 'GER' || h.winner === 'ITA' || h.winner === 'FRA' || h.winner === 'ESP' || h.winner === 'ENG' || h.winner === 'URU' ? 'champion-item' : ''}">
              <div class="history-year">${h.year}</div>
              <div class="history-flags">
                <img class="history-flag" src="${getHistoryFlagUrl(h.winner)}" alt="${h.winner}" loading="lazy" />
                <span class="history-vs">vs</span>
                <img class="history-flag" src="${getHistoryFlagUrl(h.runnerUp)}" alt="${h.runnerUp}" loading="lazy" />
                <span class="history-score">${h.score}</span>
              </div>
              <div class="history-host">${h.host}</div>
            </div>
          `)}
        </div>
        <div class="footer-line" style="margin-top: 24px;">
          ${locale === 'es'
            ? '2026 será el año en que la historia se escriba de nuevo'
            : '2026 will be the year history is rewritten'}
        </div>
      </div>
    `;
  }
}

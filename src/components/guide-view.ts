import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { generateGuideData, type GuideData, type GuideTeamData, type GuideMatch, type GuideKeyPlayer } from '../lib/guide-service';
import { t, useLocaleStore } from '../i18n';
import { subscribeSlice } from '../store/store-utils';
import { getInitials } from '../lib/text-utils';
import type { Coach } from '../data/coaches/index';

const POS_ORDER: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 };

function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1];
}

function posLabel(pos: string): string {
  const key = ('guide.position' + pos) as
    | 'guide.positionGK' | 'guide.positionDF' | 'guide.positionMF' | 'guide.positionFW';
  return t(key);
}

function computeAge(born: string): number {
  const birth = new Date(born);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** "2026-06-11" + "21:00" -> { day: "JUE 11 JUN", time: "21:00 CEST" } */
function formatMatchDate(dateStr: string, time: string, locale: string): { day: string; time: string } {
  if (!dateStr) return { day: '', time: time ? `${time} CEST` : '' };
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const days = locale === 'es'
    ? ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
    : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = locale === 'es'
    ? ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
    : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    day: `${days[date.getDay()]} ${d} ${months[m - 1]}`,
    time: time ? `${time} CEST` : '',
  };
}

function ordinal(n: number, locale: string): string {
  return locale === 'es' ? `${n}º` : `${n}${['th', 'st', 'nd', 'rd'][n] ?? 'th'}`;
}

@customElement('guide-view')
export class GuideView extends LitElement {
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
    .mode-group { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
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
    .mode-btn.active { background: var(--retro-yellow); }
    .mode-btn:hover { background: var(--retro-yellow); }
    .mode-desc {
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--dim);
      width: 100%;
    }
    .print-btn, .pdf-btn {
      all: unset;
      cursor: pointer;
      padding: 10px 18px;
      font-family: var(--font-var);
      font-size: 14px;
      color: #fff;
      border: 2px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .print-btn { background: var(--retro-green); }
    .pdf-btn { background: var(--retro-orange); }
    .print-btn:hover, .pdf-btn:hover:not(:disabled) {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 var(--ink);
    }
    .print-btn:active, .pdf-btn:active:not(:disabled) {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 var(--ink);
    }
    .pdf-btn:disabled { opacity: 0.65; cursor: wait; }

    /* ── Documento ── */
    .guide-document {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      font-family: var(--font-body);
    }

    /* ── Página A4 ── */
    .page {
      width: 794px;
      min-height: 1123px;
      max-width: 100%;
      background: var(--paper);
      background-image:
        radial-gradient(circle, rgba(26,25,51,0.08) 1px, transparent 1.2px) 0 0 / 5px 5px;
      color: var(--ink);
      padding: 18px 28px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .running-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0 6px;
      border-bottom: 1px dashed rgba(26,25,51,0.3);
      font-family: var(--font-mono);
      font-size: 9.5px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 12px;
    }
    .running-header .breadcrumbs { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .running-header .breadcrumbs span:nth-child(even) { color: var(--retro-orange); }

    .running-footer {
      margin-top: auto;
      padding-top: 8px;
      border-top: 2px solid var(--ink);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 8.5px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .running-footer .pagenum {
      background: var(--ink);
      color: var(--paper);
      padding: 3px 9px;
      font-weight: 700;
      letter-spacing: 0.15em;
    }

    /* ── Portada ── */
    .cover-page {
      justify-content: flex-start;
      align-items: center;
      text-align: center;
      padding: 80px 56px 56px;
    }
    .cover-page::before, .cover-page::after {
      content: '';
      position: absolute;
      width: 180px; height: 180px;
      border: 4px solid var(--ink);
    }
    .cover-page::before { top: 24px; left: 24px; border-right: none; border-bottom: none; }
    .cover-page::after { bottom: 24px; right: 24px; border-left: none; border-top: none; }
    .cover-eyebrow {
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.4em;
      color: var(--retro-orange);
      margin-bottom: 14px;
      font-weight: 700;
    }
    .cover-title {
      font-family: var(--font-var);
      font-size: 92px;
      line-height: 0.88;
      color: var(--ink);
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .cover-title .yr {
      display: block;
      color: var(--retro-orange);
      -webkit-text-stroke: 3px var(--ink);
      font-size: 160px;
      line-height: 1;
      margin-top: 6px;
    }
    .cover-subtitle {
      font-family: var(--font-body);
      font-size: 17px;
      color: var(--dim);
      margin-top: 14px;
      max-width: 500px;
      letter-spacing: 0.04em;
    }
    .cover-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 22px;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.2em;
      background: var(--retro-yellow);
      color: var(--ink);
      margin-top: 26px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .cover-flags {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 7px;
      width: 100%;
      max-width: 540px;
      margin: 28px auto 18px;
    }
    .cover-flag {
      aspect-ratio: 3 / 2;
      width: 100%;
      border: 2px solid var(--ink);
      box-shadow: 1.5px 1.5px 0 var(--ink);
      object-fit: cover;
      background: var(--paper-3);
    }
    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
      margin-top: 32px;
      width: 100%;
      max-width: 560px;
    }
    .cover-meta {
      border: 3px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-3);
      padding: 12px 8px;
      text-align: center;
    }
    .cover-meta .v {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1;
    }
    .cover-meta .l {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.15em;
      color: var(--dim);
      margin-top: 4px;
      text-transform: uppercase;
    }
    .cover-mode-line {
      margin-top: 28px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.18em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .cover-mode-line strong { color: var(--ink); }

    /* ── Ficha — masthead ── */
    .team-masthead {
      display: grid;
      grid-template-columns: 64px 1fr 64px;
      gap: 14px;
      align-items: stretch;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      padding: 10px 14px;
      background: var(--paper-3);
      margin-bottom: 10px;
    }
    .team-flag {
      width: 64px; height: 46px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      object-fit: cover;
      align-self: center;
      background: var(--paper-3);
    }
    .team-titles { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
    .team-eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--retro-orange);
      text-transform: uppercase;
      font-weight: 700;
    }
    .team-name {
      font-family: var(--font-var);
      font-size: 32px;
      line-height: 0.95;
      letter-spacing: -0.01em;
    }
    .group-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      align-self: stretch;
      background: var(--ink);
      color: var(--paper);
      padding: 4px 0;
      font-family: var(--font-var);
    }
    .group-badge .g-label {
      font-family: var(--font-mono);
      font-size: 8.5px;
      letter-spacing: 0.2em;
      opacity: 0.7;
    }
    .group-badge .g-letter {
      font-size: 30px;
      line-height: 1;
      color: var(--retro-yellow);
    }

    .team-statbar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-2);
      margin-bottom: 10px;
    }
    .team-statbar > div {
      padding: 6px 10px;
      border-right: 1px dashed rgba(26,25,51,0.3);
      text-align: center;
    }
    .team-statbar > div:last-child { border-right: none; }
    .sb-l {
      font-family: var(--font-mono);
      font-size: 8.5px;
      letter-spacing: 0.15em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .sb-v {
      font-family: var(--font-var);
      font-size: 19px;
      line-height: 1.1;
    }

    .team-grid {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 12px;
      flex: 1;
      min-height: 0;
      margin-bottom: 10px;
    }
    .team-grid-left { display: flex; flex-direction: column; gap: 14px; }

    /* Entrenador */
    .coach-block {
      background: var(--paper-2);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .coach-block-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 5px;
      border-bottom: 1.5px dashed rgba(26,25,51,0.3);
    }
    .coach-block-head .label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--retro-orange);
      font-weight: 700;
    }
    .coach-block-head .badge {
      background: var(--retro-green);
      color: var(--paper-3);
      padding: 2px 8px;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      border: 1.5px solid var(--ink);
    }
    .coach-photo-row { display: flex; gap: 10px; align-items: flex-start; }
    .coach-photo {
      width: 70px; height: 90px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      object-fit: cover;
      object-position: top center;
      flex-shrink: 0;
      background: var(--paper-3);
    }
    .coach-photo-fallback {
      width: 70px; height: 90px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      flex-shrink: 0;
      background: var(--paper-3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 26px;
      color: var(--dim);
    }
    .coach-info { flex: 1; min-width: 0; }
    .coach-name {
      font-family: var(--font-var);
      font-size: 16px;
      line-height: 1.05;
      letter-spacing: -0.01em;
    }
    .coach-meta {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.08em;
      color: var(--dim);
      margin-top: 3px;
      text-transform: uppercase;
    }
    .coach-bio {
      font-family: var(--font-body);
      font-size: 10.5px;
      line-height: 1.5;
      margin-top: 4px;
    }

    /* Tácticas */
    .tactics-panel {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      padding: 9px 10px;
    }
    .panel-eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      color: var(--retro-orange);
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .tactics-panel .body {
      font-family: var(--font-body);
      font-size: 10px;
      line-height: 1.5;
    }
    .tactics-panel .body strong {
      font-family: var(--font-var);
      font-weight: normal;
      color: var(--retro-blue);
    }

    /* Campo */
    .pitch-wrap { display: flex; flex-direction: column; gap: 8px; min-height: 0; }
    .pitch-label {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 4px;
    }
    .pitch-label .eyebrow {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      color: var(--retro-orange);
      font-weight: 700;
      text-transform: uppercase;
    }
    .pitch-label .title { font-family: var(--font-var); font-size: 18px; line-height: 1; }
    .pitch-label .formation {
      font-family: var(--font-mono);
      font-size: 10px;
      background: var(--ink);
      color: var(--paper);
      padding: 3px 7px;
      letter-spacing: 0.15em;
    }
    .pitch {
      position: relative;
      background: var(--retro-green);
      border: 3px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      flex: 1;
      min-height: 320px;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-evenly;
      padding: 14px 0;
      overflow: hidden;
    }
    .pitch::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        repeating-linear-gradient(to bottom, transparent 0 28px, rgba(255,255,255,0.05) 28px 56px);
      z-index: 0;
    }
    .line-center {
      position: absolute; top: 50%; left: 0; right: 0; height: 2.5px;
      background: rgba(255,255,255,0.65);
      transform: translateY(-50%); z-index: 1;
    }
    .circle-center {
      position: absolute; top: 50%; left: 50%;
      width: 90px; height: 90px;
      border: 2.5px solid rgba(255,255,255,0.65);
      border-radius: 50%;
      transform: translate(-50%, -50%); z-index: 1;
    }
    .box-top, .box-bottom {
      position: absolute; left: 50%; width: 150px; height: 56px;
      border: 2.5px solid rgba(255,255,255,0.65);
      transform: translateX(-50%); z-index: 1;
    }
    .box-top { top: 0; border-top: none; }
    .box-bottom { bottom: 0; border-bottom: none; }
    .small-box-top, .small-box-bottom {
      position: absolute; left: 50%; width: 68px; height: 18px;
      border: 2.5px solid rgba(255,255,255,0.65);
      transform: translateX(-50%); z-index: 1;
    }
    .small-box-top { top: 0; border-top: none; }
    .small-box-bottom { bottom: 0; border-bottom: none; }
    .pitch-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      z-index: 2;
      position: relative;
    }
    .player {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      width: 64px;
    }
    .player-token {
      position: relative;
      width: 44px; height: 44px;
      background: var(--paper);
      border: 2px solid var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); font-size: 11px; font-weight: 700;
      color: var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      overflow: hidden;
    }
    .player-token.gk { background: var(--retro-yellow); }
    .player-token .photo-frame {
      position: absolute; inset: 0;
      background-size: cover;
      background-position: top center;
    }
    .number-sticker {
      position: absolute;
      bottom: -5px; right: -5px;
      background: var(--retro-yellow);
      color: var(--ink);
      border: 1.5px solid var(--ink);
      padding: 1px 3px;
      font-family: var(--font-var);
      font-size: 8.5px;
      line-height: 1;
      z-index: 2;
    }
    .captain-mark {
      position: absolute;
      top: -6px; left: -6px;
      background: var(--retro-red);
      color: var(--paper);
      border: 1.5px solid var(--ink);
      padding: 1px 3px;
      font-family: var(--font-mono);
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 0.05em;
      line-height: 1;
      z-index: 2;
    }
    .player-name {
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--paper);
      background: var(--ink);
      padding: 1.5px 3px;
      letter-spacing: 0.03em;
      white-space: nowrap;
      text-align: center;
      max-width: 64px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pitch-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: rgba(255,255,255,0.8);
      z-index: 2;
    }

    /* Banquillo */
    .bench {
      background: var(--paper-3);
      border: 1.5px solid var(--ink);
      padding: 5px 8px;
      box-shadow: 2px 2px 0 var(--ink);
    }
    .bench-list {
      display: flex;
      flex-wrap: wrap;
      gap: 3px 10px;
      font-family: var(--font-body);
      font-size: 9.5px;
      line-height: 1.3;
    }
    .bench-list span { white-space: nowrap; }
    .bench-list .n {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--retro-orange);
      margin-right: 4px;
    }

    /* Calendario del equipo */
    .team-calendar {
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-3);
    }
    .team-calendar-head {
      background: var(--ink);
      color: var(--paper);
      padding: 5px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .team-calendar-head .t {
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.02em;
    }
    .team-calendar-head .e {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.18em;
      color: var(--retro-yellow);
    }
    .cal-row {
      display: grid;
      grid-template-columns: 86px 1fr 56px 1fr 96px;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      border-bottom: 1px dashed rgba(26,25,51,0.25);
    }
    .cal-row:last-child { border-bottom: none; }
    .cal-date {
      font-family: var(--font-mono);
      font-size: 9px;
      line-height: 1.25;
    }
    .cal-date .d { font-weight: 700; }
    .cal-date .ct { color: var(--dim); }
    .cal-team {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 600;
      min-width: 0;
    }
    .cal-team.away { justify-content: flex-end; text-align: right; }
    .cal-team .mini-flag {
      width: 20px; height: 14px;
      border: 1px solid var(--ink);
      object-fit: cover;
      flex-shrink: 0;
      background: var(--paper-3);
    }
    .cal-team .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cal-team.is-self .nm { color: var(--retro-orange); font-family: var(--font-var); }
    .cal-score {
      text-align: center;
      font-family: var(--font-var);
      font-size: 15px;
      line-height: 1;
      background: var(--paper);
      border: 1.5px solid var(--ink);
      padding: 3px 0;
    }
    .cal-score.tbd { font-size: 10px; font-family: var(--font-mono); color: var(--dim); }
    .cal-venue {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      text-align: right;
      line-height: 1.25;
    }
    .cal-venue .stage {
      display: inline-block;
      background: var(--retro-yellow);
      color: var(--ink);
      padding: 1px 4px;
      letter-spacing: 0.08em;
      font-weight: 700;
      margin-top: 2px;
    }

    /* ── Plantilla ── */
    .squad-head {
      display: grid;
      grid-template-columns: 48px 1fr auto;
      align-items: center;
      gap: 12px;
      border-bottom: 2.5px solid var(--ink);
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .squad-head .mini-flag {
      width: 48px; height: 34px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      object-fit: cover;
      background: var(--paper-3);
    }
    .squad-head .e {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.18em;
      color: var(--retro-orange);
      font-weight: 700;
      text-transform: uppercase;
    }
    .squad-head .ttl { font-family: var(--font-var); font-size: 24px; line-height: 1; }
    .squad-head .count { text-align: right; }
    .squad-head .count .v {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1;
      color: var(--retro-orange);
    }
    .squad-head .count .l {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.18em;
      color: var(--dim);
    }

    .squad-layout {
      display: grid;
      grid-template-columns: 1fr 160px;
      gap: 10px;
      flex: 1;
      min-height: 0;
      margin-bottom: 8px;
    }
    .position-row { margin-bottom: 6px; }
    .position-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
    }
    .position-label .chip {
      background: var(--ink);
      color: var(--paper);
      font-family: var(--font-var);
      font-size: 10.5px;
      padding: 2.5px 10px;
      letter-spacing: 0.04em;
    }
    .position-label.GK .chip { background: var(--retro-yellow); color: var(--ink); }
    .position-label.DF .chip { background: var(--retro-blue); }
    .position-label.MF .chip { background: var(--retro-green); }
    .position-label.FW .chip { background: var(--retro-red); }
    .position-label .line { flex: 1; height: 2px; background: var(--ink); }
    .position-label .pcount {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.1em;
    }

    .player-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 5px;
    }
    .player-card {
      border: 1.5px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-2);
      padding: 4px 4px 5px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      position: relative;
    }
    .player-card.captain { background: var(--retro-yellow); }
    .player-card.captain::before {
      content: 'CAP';
      position: absolute;
      top: -6px; left: 3px;
      background: var(--retro-red);
      color: var(--paper);
      padding: 1px 4px;
      font-family: var(--font-mono);
      font-size: 7px;
      letter-spacing: 0.08em;
      border: 1px solid var(--ink);
      font-weight: 700;
      z-index: 2;
    }
    .pc-photo {
      width: 100%;
      aspect-ratio: 1;
      background: var(--paper-3);
      border: 1px solid var(--ink);
      position: relative;
      overflow: hidden;
    }
    .pc-photo img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
    .pc-photo .placeholder-icon {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--dim);
      font-size: 20px;
    }
    .pc-number {
      position: absolute;
      top: -3px; right: -3px;
      background: var(--retro-red);
      color: var(--paper);
      width: 21px; height: 21px;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var);
      font-size: 11px;
      border: 1.5px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      z-index: 2;
    }
    .pc-pos {
      position: absolute;
      bottom: 0; left: 0;
      background: var(--ink);
      color: var(--paper);
      font-family: var(--font-mono);
      font-size: 7px;
      padding: 1.5px 4px;
      letter-spacing: 0.12em;
      font-weight: 700;
      z-index: 2;
    }
    .pc-name {
      font-family: var(--font-var);
      font-size: 10px;
      line-height: 1.05;
      letter-spacing: -0.01em;
    }
    .pc-meta {
      font-family: var(--font-mono);
      font-size: 7.5px;
      color: var(--dim);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .pc-club {
      font-family: var(--font-body);
      font-size: 8.5px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .squad-sidebar { display: flex; flex-direction: column; gap: 8px; }
    .sidebar-block {
      border: 1.5px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-3);
      padding: 7px 8px;
    }
    .sidebar-block h4 {
      font-family: var(--font-mono);
      font-size: 8.5px;
      letter-spacing: 0.18em;
      color: var(--retro-orange);
      margin: 0 0 4px;
      font-weight: 700;
      padding-bottom: 3px;
      border-bottom: 1px dashed rgba(26,25,51,0.3);
    }
    .key-player { display: flex; gap: 8px; align-items: flex-start; }
    .key-player-photo {
      width: 36px; height: 46px;
      border: 1.5px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      flex-shrink: 0;
      background: var(--paper);
      object-fit: cover;
      object-position: top center;
    }
    .key-player-fallback {
      width: 36px; height: 46px;
      border: 1.5px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      flex-shrink: 0;
      background: var(--paper);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--dim);
    }
    .key-player-info { flex: 1; min-width: 0; }
    .kp-n { font-family: var(--font-var); font-size: 12px; line-height: 1.05; }
    .kp-r {
      font-family: var(--font-body);
      font-size: 9px;
      color: var(--dim);
      margin-top: 3px;
      line-height: 1.35;
    }
    .sb-stat-list { display: flex; flex-direction: column; gap: 4px; }
    .sb-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
    }
    .sb-stat-row .v {
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--ink);
      letter-spacing: -0.01em;
    }
    .sb-stat-row.highlight .v { color: var(--retro-orange); }

    /* ── Predicción — cubierta ── */
    .prediction-cover {
      background: var(--ink);
      color: var(--paper);
      padding: 56px 40px;
      justify-content: center;
    }
    .prediction-cover .eyebrow {
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.4em;
      color: var(--retro-yellow);
      margin-bottom: 16px;
    }
    .prediction-cover .title {
      font-family: var(--font-var);
      font-size: 72px;
      line-height: 0.9;
      letter-spacing: -0.02em;
      max-width: 600px;
    }
    .prediction-cover .lede {
      max-width: 540px;
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      color: rgba(236,223,192,0.8);
      margin-top: 18px;
    }
    .prediction-cover .steps {
      margin-top: 56px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      color: rgba(236,223,192,0.6);
      text-transform: uppercase;
    }
    .prediction-cover .steps .num {
      font-family: var(--font-var);
      font-size: 56px;
      line-height: 1;
    }
    .prediction-cover .steps .num.y { color: var(--retro-yellow); }
    .prediction-cover .steps .num.o { color: var(--retro-orange); }
    .prediction-cover .steps .txt { margin-top: 8px; }
    .prediction-cover .running-footer {
      border-color: rgba(236,223,192,0.3);
      color: rgba(236,223,192,0.6);
    }
    .prediction-cover .running-footer .pagenum {
      background: var(--retro-yellow);
      color: var(--ink);
    }

    /* ── Predicción — detalle ── */
    .prediction-title-block {
      border-bottom: 3px dashed var(--ink);
      padding-bottom: 12px;
      margin-bottom: 22px;
    }
    .prediction-title-block .eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.25em;
      color: var(--retro-orange);
      text-transform: uppercase;
      font-weight: 700;
    }
    .prediction-title-block .ttl {
      font-family: var(--font-var);
      font-size: 32px;
      line-height: 1;
      margin-top: 6px;
    }
    .podium {
      display: grid;
      grid-template-columns: 1fr 1.3fr 1fr;
      gap: 14px;
      align-items: end;
      margin: 32px 0 20px;
    }
    .podium-item {
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 var(--ink);
      padding: 16px 12px;
      text-align: center;
      background: var(--paper-2);
      position: relative;
    }
    .podium-item.champion { background: var(--retro-yellow); padding-top: 22px; }
    .podium-rank {
      position: absolute;
      top: -16px; left: 50%;
      transform: translateX(-50%);
      background: var(--ink);
      color: var(--paper);
      padding: 4px 16px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      border: 2px solid var(--ink);
      font-weight: 700;
      white-space: nowrap;
    }
    .podium-item.champion .podium-rank { background: var(--retro-orange); }
    .podium-flag-big {
      width: 64px; height: 44px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      margin: 8px auto;
      object-fit: cover;
      background: var(--paper-3);
    }
    .podium-name {
      font-family: var(--font-var);
      font-size: 22px;
      line-height: 1;
      letter-spacing: -0.01em;
      margin-top: 6px;
    }
    .podium-item.champion .podium-name { font-size: 28px; }
    .podium-trophy { font-size: 32px; margin-bottom: 4px; }

    .bracket-summary { margin-top: 18px; }
    .bracket-round { margin-bottom: 12px; }
    .br-title {
      background: var(--ink);
      color: var(--paper);
      padding: 6px 14px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      font-weight: 700;
    }
    .br-matches {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
    .br-match {
      display: grid;
      grid-template-columns: 1fr 52px 1fr;
      gap: 8px;
      align-items: center;
      padding: 6px 10px;
      border-bottom: 1px dashed rgba(26,25,51,0.2);
      border-right: 1px dashed rgba(26,25,51,0.2);
      font-size: 11px;
    }
    .br-match:nth-child(2n) { border-right: none; }
    .br-match.is-final { background: var(--retro-yellow); }
    .br-team {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      min-width: 0;
    }
    .br-team .mini-flag {
      width: 18px; height: 13px;
      border: 1px solid var(--ink);
      object-fit: cover;
      flex-shrink: 0;
      background: var(--paper-3);
    }
    .br-team.winner { font-family: var(--font-var); letter-spacing: -0.01em; }
    .br-team .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .br-score {
      text-align: center;
      font-family: var(--font-mono);
      font-size: 10.5px;
      background: var(--paper-2);
      border: 1.5px solid var(--ink);
      padding: 2px 0;
      font-weight: 700;
    }
    .br-match.is-final .br-score { background: var(--ink); color: var(--paper-3); }

    /* ── Estado vacío ── */
    .guide-empty {
      padding: 40px;
      text-align: center;
      font-family: var(--font-mono);
      color: var(--dim);
    }

    /* ── Impresión ── */
    @page { size: A4 portrait; margin: 0; }
    @media print {
      :host { background: #fff; }
      .no-print { display: none !important; }
      .guide-document { gap: 0; }
      .page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
        break-after: page;
      }
      .page:last-child { page-break-after: auto; }
    }

    @media (max-width: 840px) {
      .page {
        width: 100%;
        padding: 14px 16px 12px;
        min-height: auto;
      }
      .cover-page { padding: 48px 20px; }
      .cover-title { font-size: 56px; }
      .cover-title .yr { font-size: 96px; }
      .team-grid { grid-template-columns: 1fr; }
      .team-statbar { grid-template-columns: repeat(2, 1fr); }
      .player-grid { grid-template-columns: repeat(3, 1fr); }
      .squad-layout { grid-template-columns: 1fr; }
      .podium { grid-template-columns: 1fr; }
      .br-matches { grid-template-columns: 1fr; }
      .br-match { border-right: none; }
      .prediction-cover .title { font-size: 48px; }
      .prediction-cover .steps { grid-template-columns: 1fr; }
      .cal-row { grid-template-columns: 70px 1fr 48px 1fr; }
      .cal-venue { display: none; }
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

    const teamsByGroup: Record<string, GuideTeamData[]> = {};
    for (const team of data.teams) {
      (teamsByGroup[team.group] ??= []).push(team);
    }
    const groupLetters = 'ABCDEFGHIJKL'.split('');
    const orderedTeams = groupLetters.flatMap(letter => teamsByGroup[letter] ?? []);

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
            : html`📥 ${t('guide.downloadPdf')}`}
        </button>
      </div>

      <div class="guide-document">
        ${this._renderCover(data)}
        ${orderedTeams.map((team, i) => [
          this._renderTeamProfile(team, locale, i, orderedTeams.length),
          this._renderTeamSquad(team, i, orderedTeams.length),
        ])}
        ${this._renderPredictionCover()}
        ${this._renderPredictionDetail(data)}
      </div>
    `;
  }

  private _renderCover(data: GuideData) {
    const flags = data.teams.slice(0, 48);
    const today = new Date().toLocaleDateString(data.locale === 'es' ? 'es-ES' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).toUpperCase();

    return html`
      <section class="page cover-page">
        <div class="cover-eyebrow">${t('guide.coverEyebrow')}</div>
        <h1 class="cover-title">
          ${t('guide.coverTitle1')}<br />${t('guide.coverTitle2')}
          <span class="yr">2026</span>
        </h1>
        <p class="cover-subtitle">${t('guide.coverDesc')}</p>
        <div class="cover-badge">★ ${this._mode === 'auto' ? t('guide.modeAuto') : t('guide.modeUser')} ★</div>

        <div class="cover-flags">
          ${flags.map(team => html`
            <img class="cover-flag" src="${team.flagUrl}" alt="${team.name}" loading="lazy" />
          `)}
        </div>

        <div class="cover-meta-grid">
          <div class="cover-meta"><div class="v">48</div><div class="l">${t('guide.metaTeams')}</div></div>
          <div class="cover-meta"><div class="v">104</div><div class="l">${t('guide.metaMatches')}</div></div>
          <div class="cover-meta"><div class="v">16</div><div class="l">${t('guide.metaVenues')}</div></div>
          <div class="cover-meta"><div class="v">39</div><div class="l">${t('guide.metaDays')}</div></div>
        </div>

        <div class="cover-mode-line">
          ${t('guide.coverGenerated', { date: '' })}<strong>${today}</strong>
        </div>
      </section>
    `;
  }

  private _renderTeamProfile(team: GuideTeamData, locale: string, index: number, total: number) {
    const eyebrowParts: string[] = [];
    if (team.teamId === 'MEX' || team.teamId === 'USA' || team.teamId === 'CAN') {
      eyebrowParts.push(t('guide.host'));
    }
    if (team.meta.stars > 0) eyebrowParts.push(t('guide.champion2010'));
    eyebrowParts.push(t('guide.worldCupParticipation', { n: team.meta.worldCups }));

    return html`
      <section class="page team-sheet">
        <div class="running-header">
          <div class="breadcrumbs">
            <span>${t('section.guide.eyebrow')}</span>
            <span>›</span>
            <span>${t('guide.group', { letter: team.group })}</span>
            <span>›</span>
            <span>${team.name}</span>
          </div>
          <span>${index + 1} / ${total}</span>
        </div>

        <div class="team-masthead">
          <img class="team-flag" src="${team.flagUrl}" alt="${team.name}" />
          <div class="team-titles">
            <div class="team-eyebrow">★ ${eyebrowParts.join(' · ')}</div>
            <h2 class="team-name">${team.name}</h2>
          </div>
          <div class="group-badge">
            <span class="g-label">${locale === 'es' ? 'GRUPO' : 'GROUP'}</span>
            <span class="g-letter">${team.group}</span>
          </div>
        </div>

        <div class="team-statbar">
          <div>
            <div class="sb-l">${t('guide.statRank')}</div>
            <div class="sb-v">${team.meta.fifaRank > 0 ? '#' + team.meta.fifaRank : '—'}</div>
          </div>
          <div>
            <div class="sb-l">${t('guide.statGroupPred')}</div>
            <div class="sb-v">${ordinal(team.groupPosition, locale)}</div>
          </div>
          <div>
            <div class="sb-l">${t('guide.statWorldCups')}</div>
            <div class="sb-v">${team.meta.worldCups}</div>
          </div>
          <div>
            <div class="sb-l">${t('guide.statStars')}</div>
            <div class="sb-v">${team.meta.stars}</div>
          </div>
        </div>

        <div class="team-grid">
          <div class="team-grid-left">
            ${this._renderCoachBlock(team.coach, team.hasCoachPhoto, team.coachPhotoUrl, locale)}
            ${this._renderTacticsPanel(team)}
          </div>
          ${this._renderPitch(team)}
        </div>

        ${this._renderTeamCalendar(team, locale)}

        <div class="running-footer">
          <span>BRACKET MUNDIAL · bracketmundial.com</span>
          <span class="pagenum">${String(index + 1).padStart(2, '0')}A</span>
          <span>${team.name} · ${t('guide.group', { letter: team.group })}</span>
        </div>
      </section>
    `;
  }

  private _renderCoachBlock(coach: Coach | null, hasPhoto: boolean, photoUrl: string, locale: string) {
    if (!coach) return html``;
    const age = computeAge(coach.born);
    return html`
      <div class="coach-block">
        <div class="coach-block-head">
          <span class="label">★ ${t('guide.coach')}</span>
        </div>
        <div class="coach-photo-row">
          ${hasPhoto || coach.photoUrl
            ? html`<img class="coach-photo" src="${hasPhoto ? photoUrl : coach.photoUrl}"
                alt="${coach.name}" loading="lazy" />`
            : html`<div class="coach-photo-fallback">${getInitials(coach.name)}</div>`}
          <div class="coach-info">
            <div class="coach-name">${coach.name}</div>
            <div class="coach-meta">${age} ${t('guide.years')} · ${coach.nationality}</div>
          </div>
        </div>
        <div class="coach-bio">${coach.bio[locale as 'es' | 'en']}</div>
      </div>
    `;
  }

  private _renderTacticsPanel(team: GuideTeamData) {
    const formation = team.lineup?.formation ?? '4-3-3';
    const captainName = team.captain ? getLastName(team.captain.name) : '—';
    const wonderkidName = team.wonderkid ? getLastName(team.wonderkid.name) : '—';
    return html`
      <div class="tactics-panel">
        <div class="panel-eyebrow">★ ${t('guide.tacticsNotes')}</div>
        <div class="body">
          ${t('guide.tacticsDerived', {
            formation,
            captain: captainName,
            wonderkid: wonderkidName,
          })}
        </div>
      </div>
    `;
  }

  private _renderPitch(team: GuideTeamData) {
    const lineup = team.lineup;
    const formation = lineup?.formation ?? '';

    let pitchBody;
    if (lineup && team.squad.length) {
      const rows = formation.split('-').map(n => parseInt(n, 10));
      const groups: number[][] = [];
      let idx = 0;
      groups.push([lineup.startingXI[idx]]);
      idx++;
      for (const count of rows) {
        groups.push(lineup.startingXI.slice(idx, idx + count));
        idx += count;
      }
      const benchNumbers = lineup.startingXI;
      const bench = team.players
        .filter(p => !benchNumbers.includes(p.number))
        .sort((a, b) => (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9))
        .slice(0, 6);

      pitchBody = html`
        <div class="pitch">
          <div class="line-center"></div>
          <div class="circle-center"></div>
          <div class="box-top"></div>
          <div class="small-box-top"></div>
          <div class="box-bottom"></div>
          <div class="small-box-bottom"></div>
          ${groups.map((group, rowIndex) => html`
            <div class="pitch-row">
              ${group.map(num => {
                const player = team.players.find(p => p.number === num);
                if (!player) return html``;
                const photo = player.hasPhoto ? player.photoUrl : '';
                return html`
                  <div class="player">
                    <div class="player-token ${rowIndex === 0 ? 'gk' : ''}">
                      ${photo
                        ? html`<div class="photo-frame" style="background-image:url('${photo}')"></div>`
                        : getInitials(player.name)}
                      <div class="number-sticker">${num}</div>
                      ${player.captain ? html`<div class="captain-mark">CAP</div>` : ''}
                    </div>
                    <div class="player-name">${getLastName(player.name)}</div>
                  </div>
                `;
              })}
            </div>
          `)}
        </div>
        <div class="bench">
          <div class="panel-eyebrow">★ ${t('guide.bench')}</div>
          <div class="bench-list">
            ${bench.map(p => html`
              <span><span class="n">${p.number}</span>${getLastName(p.name).toUpperCase()}</span>
            `)}
          </div>
        </div>
      `;
    } else {
      pitchBody = html`
        <div class="pitch">
          <div class="line-center"></div>
          <div class="circle-center"></div>
          <div class="pitch-empty">${t('guide.noLineup')}</div>
        </div>
      `;
    }

    return html`
      <div class="pitch-wrap">
        <div class="pitch-label">
          <div>
            <div class="eyebrow">★ ${t('guide.bestXI')}</div>
            <div class="title">${t('guide.bestXITitle')}</div>
          </div>
          ${formation ? html`<div class="formation">${formation.split('-').join(' — ')}</div>` : ''}
        </div>
        ${pitchBody}
      </div>
    `;
  }

  private _renderTeamCalendar(team: GuideTeamData, locale: string) {
    if (team.groupMatches.length === 0) return html``;
    return html`
      <div class="team-calendar">
        <div class="team-calendar-head">
          <span class="t">${t('guide.teamCalendar')}</span>
          <span class="e">${t('guide.teamCalendarSub')}</span>
        </div>
        <div>
          ${team.groupMatches.map(m => {
            const isHome = m.teamA === team.teamId;
            const flagA = this._data?.teams.find(tt => tt.teamId === m.teamA)?.flagUrl ?? '';
            const flagB = this._data?.teams.find(tt => tt.teamId === m.teamB)?.flagUrl ?? '';
            const { day, time } = formatMatchDate(m.date, m.timeSpain, locale);
            const played = m.scoreA !== null && m.scoreB !== null;
            return html`
              <div class="cal-row">
                <div class="cal-date">
                  <div class="d">${day}</div>
                  <div class="ct">${time}</div>
                </div>
                <div class="cal-team ${isHome ? 'is-self' : ''}">
                  <img class="mini-flag" src="${flagA}" alt="" />
                  <span class="nm">${m.teamAName}</span>
                </div>
                <div class="cal-score ${played ? '' : 'tbd'}">
                  ${played ? `${m.scoreA}–${m.scoreB}` : 'vs'}
                </div>
                <div class="cal-team away ${!isHome ? 'is-self' : ''}">
                  <span class="nm">${m.teamBName}</span>
                  <img class="mini-flag" src="${flagB}" alt="" />
                </div>
                <div class="cal-venue">
                  ${m.city || m.venue}<br />
                  <span class="stage">${team.group} · J${m.matchDay ?? ''}</span>
                </div>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _renderTeamSquad(team: GuideTeamData, index: number, total: number) {
    const byPosition: Record<string, typeof team.players> = { GK: [], DF: [], MF: [], FW: [] };
    for (const p of team.players) {
      (byPosition[p.position] ??= []).push(p);
    }
    for (const key of Object.keys(byPosition)) {
      byPosition[key].sort((a, b) => a.number - b.number);
    }
    const positions: Array<['GK' | 'DF' | 'MF' | 'FW', string]> = [
      ['GK', t('guide.positionGK')],
      ['DF', t('guide.positionDF')],
      ['MF', t('guide.positionMF')],
      ['FW', t('guide.positionFW')],
    ];

    return html`
      <section class="page team-sheet">
        <div class="running-header">
          <div class="breadcrumbs">
            <span>${t('section.guide.eyebrow')}</span>
            <span>›</span>
            <span>${team.name}</span>
            <span>›</span>
            <span>${t('guide.squadTitle')}</span>
          </div>
          <span>${index + 1} / ${total}</span>
        </div>

        <div class="squad-head">
          <img class="mini-flag" src="${team.flagUrl}" alt="${team.name}" />
          <div>
            <div class="e">★ ${t('guide.squadPreliminary')}</div>
            <div class="ttl">${team.name}</div>
          </div>
          <div class="count">
            <div class="v">${team.squad.length}</div>
            <div class="l">${t('guide.players')}</div>
          </div>
        </div>

        <div class="squad-layout">
          <div>
            ${positions.map(([pos, label]) => {
              const players = byPosition[pos] ?? [];
              if (players.length === 0) return html``;
              return html`
                <div class="position-row">
                  <div class="position-label ${pos}">
                    <span class="chip">${label}</span>
                    <span class="line"></span>
                    <span class="pcount">${players.length}</span>
                  </div>
                  <div class="player-grid">
                    ${players.map(p => html`
                      <div class="player-card ${p.captain ? 'captain' : ''}">
                        <div class="pc-photo">
                          ${p.hasPhoto
                            ? html`<img src="${p.photoUrl}" alt="${p.name}" loading="lazy" />`
                            : html`<div class="placeholder-icon">⚽</div>`}
                          <div class="pc-number">${p.number}</div>
                          <div class="pc-pos">${posLabel(p.position)}</div>
                        </div>
                        <div class="pc-name">${p.name}</div>
                        <div class="pc-meta">${p.age} ${t('guide.age').toUpperCase()}</div>
                        <div class="pc-club">${p.club}</div>
                      </div>
                    `)}
                  </div>
                </div>
              `;
            })}
          </div>

          <div class="squad-sidebar">
            ${this._renderKeyPlayer(t('guide.keyCaptain'), team.captain, t('guide.captainRole'), team)}
            ${this._renderKeyPlayer(t('guide.keyStar'), team.starPlayer, t('guide.starRole'), team)}
            ${team.wonderkid
              ? this._renderKeyPlayer(
                  t('guide.keyWonderkid'),
                  team.wonderkid,
                  t('guide.wonderkidRole', { age: team.wonderkid.age }),
                  team,
                )
              : ''}
            <div class="sidebar-block">
              <h4>★ ${t('guide.quickStats')}</h4>
              <div class="sb-stat-list">
                <div class="sb-stat-row highlight">
                  <span>${t('guide.avgAge')}</span>
                  <span class="v">${team.squadStats.avgAge}</span>
                </div>
                <div class="sb-stat-row">
                  <span>${t('guide.squadSize')}</span>
                  <span class="v">${team.squadStats.count}</span>
                </div>
                <div class="sb-stat-row">
                  <span>${t('guide.formation')}</span>
                  <span class="v">${team.lineup?.formation ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="running-footer">
          <span>BRACKET MUNDIAL · bracketmundial.com</span>
          <span class="pagenum">${String(index + 1).padStart(2, '0')}B</span>
          <span>${team.name} · ${t('guide.squadTitle')}</span>
        </div>
      </section>
    `;
  }

  private _renderKeyPlayer(title: string, player: GuideKeyPlayer | null, role: string, team: GuideTeamData) {
    if (!player) return html``;
    const full = team.players.find(p => p.number === player.number);
    const photo = full?.hasPhoto ? full.photoUrl : '';
    return html`
      <div class="sidebar-block">
        <h4>★ ${title}</h4>
        <div class="key-player">
          ${photo
            ? html`<img class="key-player-photo" src="${photo}" alt="${player.name}" loading="lazy" />`
            : html`<div class="key-player-fallback">${getInitials(player.name)}</div>`}
          <div class="key-player-info">
            <div class="kp-n">${player.name}</div>
            <div class="kp-r">${role}</div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderPredictionCover() {
    return html`
      <section class="page prediction-cover prediction-page">
        <div>
          <div class="eyebrow">${t('guide.predictionCoverEyebrow')}</div>
          <h2 class="title">${t('guide.predictionCoverTitle')}</h2>
          <p class="lede">${t('guide.predictionCoverLede')}</p>
          <div class="steps">
            <div>
              <div class="num y">01</div>
              <div class="txt">${this._data?.locale === 'es'
                ? 'Simulación con consenso de odds'
                : 'Simulation from odds consensus'}</div>
            </div>
            <div>
              <div class="num o">02</div>
              <div class="txt">${this._data?.locale === 'es'
                ? 'Penaltis cuando hay empate'
                : 'Penalties on a draw'}</div>
            </div>
            <div>
              <div class="num y">03</div>
              <div class="txt">${this._data?.locale === 'es'
                ? 'Recálculo en cada actualización'
                : 'Recomputed on every update'}</div>
            </div>
          </div>
        </div>
        <div class="running-footer">
          <span>BRACKET MUNDIAL · bracketmundial.com</span>
          <span class="pagenum">★</span>
          <span>${t('guide.predictionSection')}</span>
        </div>
      </section>
    `;
  }

  private _renderPredictionDetail(data: GuideData) {
    const teamById = (id: string | null | undefined) =>
      id ? data.teams.find(tt => tt.teamId === id) : undefined;

    const knockoutByRound: Record<string, GuideMatch[]> = {
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
      quarterfinals: t('guide.qf'),
      semifinals: t('guide.sf'),
      thirdPlace: t('guide.tp'),
      final: t('guide.final'),
    };

    const champion = teamById(data.prediction.champion);
    const runnerUp = teamById(data.prediction.runnerUp);
    const third = teamById(data.prediction.thirdPlace);

    const renderPodiumItem = (
      cls: string, rank: string, team: GuideTeamData | undefined, trophy: boolean,
    ) => html`
      <div class="podium-item ${cls}">
        <div class="podium-rank">${rank}</div>
        ${trophy ? html`<div class="podium-trophy">🏆</div>` : ''}
        ${team
          ? html`<img class="podium-flag-big" src="${team.flagUrl}" alt="${team.name}" />
                 <div class="podium-name">${team.name}</div>`
          : html`<div class="podium-name">${t('guide.tbd')}</div>`}
      </div>
    `;

    return html`
      <section class="page prediction-page">
        <div class="running-header">
          <div class="breadcrumbs">
            <span>${t('section.guide.eyebrow')}</span>
            <span>›</span>
            <span>${t('guide.predictionSection')}</span>
          </div>
          <span>${t('guide.final')}</span>
        </div>

        <div class="prediction-title-block">
          <div class="eyebrow">${t('guide.predictionPodiumEyebrow')}</div>
          <h2 class="ttl">${t('guide.predictionPodiumTitle')}</h2>
        </div>

        <div class="podium">
          ${renderPodiumItem('runner-up', '2º · ' + t('guide.podiumRunnerUp'), runnerUp, false)}
          ${renderPodiumItem('champion', '★ 1º · ' + t('guide.podiumChampion'), champion, true)}
          ${renderPodiumItem('third', '3º · ' + t('guide.podiumThird'), third, false)}
        </div>

        <div class="bracket-summary">
          ${Object.entries(knockoutByRound).map(([round, matches]) => {
            if (matches.length === 0) return html``;
            return html`
              <div class="bracket-round">
                <div class="br-title">★ ${roundLabels[round]}</div>
                <div class="br-matches">
                  ${matches.map(m => {
                    const flagA = teamById(m.teamA)?.flagUrl ?? '';
                    const flagB = teamById(m.teamB)?.flagUrl ?? '';
                    const played = m.scoreA !== null && m.scoreB !== null;
                    const scoreText = played
                      ? `${m.scoreA}–${m.scoreB}` +
                        (m.penaltyScoreA != null && m.penaltyScoreB != null
                          ? ` (${m.penaltyScoreA}–${m.penaltyScoreB})`
                          : '')
                      : '—';
                    const isFinal = round === 'final';
                    return html`
                      <div class="br-match ${isFinal ? 'is-final' : ''}">
                        <div class="br-team ${m.winnerId === m.teamA ? 'winner' : ''}">
                          ${m.teamA ? html`<img class="mini-flag" src="${flagA}" alt="" />` : ''}
                          <span class="nm">${m.teamAName}</span>
                        </div>
                        <div class="br-score">${scoreText}</div>
                        <div class="br-team ${m.winnerId === m.teamB ? 'winner' : ''}">
                          ${m.teamB ? html`<img class="mini-flag" src="${flagB}" alt="" />` : ''}
                          <span class="nm">${m.teamBName}</span>
                        </div>
                      </div>
                    `;
                  })}
                </div>
              </div>
            `;
          })}
        </div>

        <div class="running-footer">
          <span>${t('guide.generatedBy')}</span>
          <span class="pagenum">★</span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
      </section>
    `;
  }
}

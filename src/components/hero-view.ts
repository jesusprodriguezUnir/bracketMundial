import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';
import './logo-crest';

/** Opening match: June 11 2026, 21:00 CEST = 19:00 UTC */
const KICKOFF_UTC = Date.UTC(2026, 5, 11, 19, 0, 0);

interface CountdownValues { days: number; hours: number; minutes: number; seconds: number; started: boolean; }

function calcCountdown(): CountdownValues {
  const diff = KICKOFF_UTC - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    started: false,
  };
}

@customElement('hero-view')
export class HeroView extends LitElement {
  @state() private _cd: CountdownValues = calcCountdown();
  private _timer?: ReturnType<typeof setInterval>;

  connectedCallback() {
    super.connectedCallback();
    this._timer = setInterval(() => { this._cd = calcCountdown(); }, 1000);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    super.disconnectedCallback();
  }

  static styles = css`
    :host { display: block; }

    .hero {
      position: relative;
      overflow: hidden;
      min-height: 520px;
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 28px;
      padding: 36px 40px 28px;
    }

    /* Panini confetti background */
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg opacity='0.55'%3E%3Ccircle cx='30' cy='40' r='3' fill='%23e8541f'/%3E%3Ccircle cx='120' cy='15' r='2' fill='%2322418c'/%3E%3Ccircle cx='200' cy='55' r='3.5' fill='%23f0b021'/%3E%3Ccircle cx='60' cy='110' r='2' fill='%23c41e2c'/%3E%3Ccircle cx='160' cy='130' r='2.5' fill='%231f6b3a'/%3E%3Ccircle cx='95' cy='180' r='3' fill='%23e8541f'/%3E%3Ccircle cx='215' cy='195' r='2' fill='%2322418c'/%3E%3Ccircle cx='20' cy='220' r='2.5' fill='%23f0b021'/%3E%3Crect x='180' y='100' width='4' height='10' fill='%23c41e2c' transform='rotate(25 182 105)'/%3E%3Crect x='40' y='150' width='3' height='8' fill='%231f6b3a' transform='rotate(-20 41 154)'/%3E%3Crect x='130' y='75' width='3' height='8' fill='%23e8541f' transform='rotate(45 131 79)'/%3E%3Cpolygon points='75,55 78,62 71,62' fill='%23c41e2c'/%3E%3Cpolygon points='175,205 178,212 171,212' fill='%2322418c'/%3E%3Cpolygon points='100,135 103,142 96,142' fill='%23f0b021'/%3E%3C/g%3E%3C/svg%3E"),
        radial-gradient(circle, rgba(26,25,51,0.08) 1px, transparent 1.2px) 0 0 / 5px 5px,
        repeating-linear-gradient(45deg, rgba(26,25,51,0.04) 0 2px, transparent 2px 32px);
      background-size: 240px 240px, 5px 5px, auto;
      pointer-events: none;
      z-index: 0;
    }

    .hero-left,
    .hero-right {
      position: relative;
      z-index: 1;
    }

    /* Left column */
    .hero-left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.3em;
      color: var(--retro-red);
      margin-bottom: 14px;
    }

    h1 {
      font-family: var(--font-var);
      font-size: clamp(52px, 7vw, 88px);
      line-height: 0.82;
      letter-spacing: -0.03em;
      margin: 0 0 18px;
      color: var(--ink);
    }
    h1 .line-accent {
      color: var(--retro-orange);
    }
    h1 .line-highlight {
      position: relative;
      display: inline-block;
    }
    h1 .line-highlight::before {
      content: '';
      position: absolute;
      left: 0; right: 0;
      top: 52%; height: 8px;
      background: var(--retro-yellow);
      z-index: -1;
    }

    .hero-desc {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.45;
      color: rgba(26,25,51,0.75);
      max-width: 460px;
      font-weight: 500;
      margin-bottom: 22px;
    }
    .hero-desc b { color: var(--ink); }

    /* CTA buttons */
    .cta-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 28px;
    }
    .btn-cta-primary {
      all: unset;
      cursor: pointer;
      background: var(--retro-orange);
      color: var(--paper-3);
      font-family: var(--font-var);
      font-size: 16px;
      letter-spacing: 0.06em;
      padding: 14px 24px;
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--ink);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn-cta-primary:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 0 var(--ink);
    }
    .btn-cta-secondary {
      all: unset;
      cursor: pointer;
      background: var(--paper-3);
      color: var(--ink);
      font-family: var(--font-var);
      font-size: 16px;
      letter-spacing: 0.06em;
      padding: 14px 24px;
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-yellow);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn-cta-secondary:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 0 var(--retro-yellow);
    }

    /* Countdown */
    .countdown {
      display: flex;
      gap: 8px;
      margin-bottom: 22px;
    }
    .cd-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 56px;
      padding: 10px 8px 8px;
      background: var(--ink);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
    }
    .cd-num {
      font-family: var(--font-var);
      font-size: 32px;
      line-height: 1;
      color: var(--retro-yellow);
      letter-spacing: 0.04em;
    }
    .cd-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.2em;
      color: var(--paper-2);
      margin-top: 4px;
    }
    .cd-sep {
      font-family: var(--font-var);
      font-size: 28px;
      color: var(--dim);
      align-self: flex-start;
      padding-top: 10px;
    }
    .cd-live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: var(--retro-red);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--paper-3);
      letter-spacing: 0.08em;
      animation: pulse-live 2s ease-in-out infinite;
    }
    @keyframes pulse-live {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Stats strip */
    .stats-strip {
      display: flex;
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--ink);
    }
    .stat-cell {
      flex: 1;
      padding: 10px 14px;
      border-right: 2px solid var(--ink);
    }
    .stat-cell:last-child { border-right: none; }
    .stat-cell:nth-child(odd)  { background: var(--paper-2); }
    .stat-cell:nth-child(even) { background: var(--paper-3); }
    .stat-num {
      font-family: var(--font-var);
      font-size: 30px;
      line-height: 1;
      color: var(--ink);
    }
    .stat-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.18em;
      color: rgba(26,25,51,0.6);
      margin-top: 4px;
    }

    /* Right column: crest area */
    .hero-right {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .crest-sunburst {
      position: absolute;
      width: 420px;
      height: 420px;
      background: repeating-conic-gradient(
        rgba(240,176,33,0.35) 0deg 6deg,
        transparent 6deg 18deg
      );
      border-radius: 50%;
      animation: spin 90s linear infinite;
      pointer-events: none;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .crest-wrapper {
      position: relative;
      transform: rotate(-5deg);
      filter: drop-shadow(8px 8px 0 var(--ink));
    }

    .sticker-new {
      position: absolute;
      top: 24px; right: 8px;
      background: var(--retro-red);
      color: var(--paper-3);
      font-family: var(--font-var);
      font-size: 14px;
      padding: 6px 12px;
      transform: rotate(8deg);
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      letter-spacing: 0.06em;
    }
    .sticker-free {
      position: absolute;
      bottom: 32px; left: 8px;
      background: var(--paper-3);
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 6px 12px;
      transform: rotate(-6deg);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--retro-orange);
      letter-spacing: 0.12em;
    }

    /* Animated ticker marquee */
    .ticker {
      position: relative;
      z-index: 1;
      background: var(--ink);
      color: var(--paper);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      border-top: 3px solid var(--retro-orange);
      overflow: hidden;
      display: flex;
      align-items: center;
      height: 36px;
    }
    .ticker-label {
      flex-shrink: 0;
      padding: 0 14px;
      color: var(--retro-yellow);
      z-index: 1;
      background: var(--ink);
      border-right: 2px solid var(--retro-orange);
      height: 100%;
      display: flex;
      align-items: center;
    }
    .ticker-track {
      display: flex;
      animation: marquee 30s linear infinite;
      white-space: nowrap;
    }
    .ticker-track:hover {
      animation-play-state: paused;
    }
    .ticker-item {
      flex-shrink: 0;
      padding: 0 24px;
    }
    .ticker-score {
      color: var(--retro-yellow);
      font-weight: 700;
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    @media (max-width: 768px) {
      .hero {
        grid-template-columns: 1fr;
        padding: 24px 16px 20px;
        min-height: auto;
      }
      .hero-right { display: none; }
      h1 { font-size: 48px; }
      .hero-desc { font-size: 14px; }
      .btn-cta-primary,
      .btn-cta-secondary { font-size: 14px; padding: 12px 18px; }
      .stat-num { font-size: 22px; }
      .cd-cell { min-width: 44px; padding: 8px 6px 6px; }
      .cd-num { font-size: 24px; }
      .countdown { gap: 5px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .ticker-track { animation: none; }
      .cd-live { animation: none; }
    }
  `;

  private _getTickerItems(): Array<{ label: string; score: string }> {
    const store = useTournamentStore.getState();
    const played = store.groupMatches.filter(m => m.scoreA !== null && m.scoreB !== null);
    if (played.length > 0) {
      // Show last 12 played matches
      return played.slice(-12).map(m => {
        const a = TEAMS_2026.find(t => t.id === m.teamA);
        const b = TEAMS_2026.find(t => t.id === m.teamB);
        return {
          label: `${a?.id ?? '??'} vs ${b?.id ?? '??'}`,
          score: `${m.scoreA}-${m.scoreB}`,
        };
      });
    }
    // No matches played — show day 1 fixture
    const day1 = store.groupMatches.filter(m => m.date === '2026-06-11');
    if (day1.length > 0) {
      return day1.map(m => {
        const a = TEAMS_2026.find(t => t.id === m.teamA);
        const b = TEAMS_2026.find(t => t.id === m.teamB);
        return { label: `${a?.id ?? '??'} vs ${b?.id ?? '??'}`, score: m.timeSpain ?? '' };
      });
    }
    return [
      { label: 'MEX vs RSA', score: '11 JUN' },
      { label: 'KOR vs CZE', score: '12 JUN' },
      { label: 'CAN vs BIH', score: '12 JUN' },
    ];
  }

  private _renderCountdown() {
    const cd = this._cd;
    if (cd.started) {
      return html`<div class="cd-live">⚽ EN CURSO</div>`;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return html`
      <div class="countdown">
        <div class="cd-cell"><div class="cd-num">${cd.days}</div><div class="cd-label">DÍAS</div></div>
        <div class="cd-sep">:</div>
        <div class="cd-cell"><div class="cd-num">${pad(cd.hours)}</div><div class="cd-label">HORAS</div></div>
        <div class="cd-sep">:</div>
        <div class="cd-cell"><div class="cd-num">${pad(cd.minutes)}</div><div class="cd-label">MIN</div></div>
        <div class="cd-sep">:</div>
        <div class="cd-cell"><div class="cd-num">${pad(cd.seconds)}</div><div class="cd-label">SEG</div></div>
      </div>
    `;
  }

  render() {
    const tickerItems = this._getTickerItems();
    const hasPlayed = useTournamentStore.getState().groupMatches.some(m => m.scoreA !== null);
    const tickerLabel = hasPlayed ? '◉ RESULTADOS' : '◉ PRÓXIMO';

    return html`
      <section>
        <div class="hero">
          <!-- Left column -->
          <div class="hero-left">
            <div>
              <div class="eyebrow">★ ★ ★ COPA DEL MUNDO 2026 ★ ★ ★</div>
              <h1>
                <span style="display:block">PREDICE</span>
                <span style="display:block" class="line-accent">EL CAMINO</span>
                <span style="display:block"><span class="line-highlight">AL TÍTULO.</span></span>
              </h1>
              <p class="hero-desc">
                Simula la fase de grupos, monta tu bracket eliminatoria y comparte tu predicción del Mundial.
                <b>48 selecciones, 12 grupos, una copa.</b>
              </p>
              <div class="cta-row">
                <button class="btn-cta-primary" @click="${this._goToBracket}">▶ EMPEZAR MI BRACKET</button>
                <button class="btn-cta-secondary" @click="${this._goToGroups}">VER GRUPOS</button>
              </div>
              ${this._renderCountdown()}
            </div>
            <!-- Stats strip -->
            <div class="stats-strip">
              <div class="stat-cell"><div class="stat-num">48</div><div class="stat-label">SELECCIONES</div></div>
              <div class="stat-cell"><div class="stat-num">12</div><div class="stat-label">GRUPOS</div></div>
              <div class="stat-cell"><div class="stat-num">16</div><div class="stat-label">SEDES</div></div>
              <div class="stat-cell"><div class="stat-num">104</div><div class="stat-label">PARTIDOS</div></div>
              <div class="stat-cell"><div class="stat-num">1</div><div class="stat-label">CAMPEÓN</div></div>
            </div>
          </div>

          <!-- Right column: crest -->
          <div class="hero-right">
            <div class="crest-sunburst"></div>
            <div class="crest-wrapper">
              <logo-crest size="340"></logo-crest>
            </div>
            <div class="sticker-new">★ NUEVO</div>
            <div class="sticker-free">GRATIS · SIN REGISTRO</div>
          </div>
        </div>

        <!-- Animated ticker -->
        <div class="ticker">
          <span class="ticker-label">${tickerLabel}</span>
          <div class="ticker-track">
            ${tickerItems.map(item => html`
              <span class="ticker-item">${item.label} <span class="ticker-score">${item.score}</span></span>
            `)}
            ${tickerItems.map(item => html`
              <span class="ticker-item">${item.label} <span class="ticker-score">${item.score}</span></span>
            `)}
          </div>
        </div>
      </section>
    `;
  }

  private _goToBracket() {
    this.dispatchEvent(new CustomEvent('navigate', { detail: 'groups', bubbles: true, composed: true }));
  }

  private _goToGroups() {
    this.dispatchEvent(new CustomEvent('navigate', { detail: 'groups', bubbles: true, composed: true }));
  }
}

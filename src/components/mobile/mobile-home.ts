import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { t } from '../../i18n';
import { mobileShared } from './mobile-shared.css';

/** Partido inaugural: 11 jun 2026, 21:00 CEST = 19:00 UTC */
const KICKOFF_UTC = Date.UTC(2026, 5, 11, 19, 0, 0);

interface Countdown { days: number; started: boolean }

function calcCountdown(): Countdown {
  const diff = KICKOFF_UTC - Date.now();
  if (diff <= 0) return { days: 0, started: true };
  return { days: Math.floor(diff / 86400000), started: false };
}

/**
 * Vista de inicio del shell móvil: hero, stats, countdown y quick-grid.
 * Cableada al store real (resultados, estadísticas del torneo).
 */
@customElement('mobile-home')
export class MobileHome extends LitElement {
  @state() private _cd: Countdown = calcCountdown();
  @state() private _played = 0;

  private _timer?: ReturnType<typeof setInterval>;
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._timer = setInterval(() => { this._cd = calcCountdown(); }, 60_000);
    this._unsub = subscribeSlice(
      useTournamentStore,
      s => s.groupMatches.filter(m => m.scoreA !== null).length + Object.values(s.knockoutMatches).filter(m => m.isPlayed).length,
      played => { this._played = played; },
    );
    this._played =
      useTournamentStore.getState().groupMatches.filter(m => m.scoreA !== null).length +
      Object.values(useTournamentStore.getState().knockoutMatches).filter(m => m.isPlayed).length;
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    this._unsub?.();
    super.disconnectedCallback();
  }

  private _navigate(view: string) {
    this.dispatchEvent(new CustomEvent('mobile-navigate', { detail: view, bubbles: true, composed: true }));
  }

  static readonly styles = [
    mobileShared,
    css`
      :host { display: block; }

      /* ── Hero ── */
      .hero {
        background: var(--ink);
        background-image: radial-gradient(circle, rgba(236,223,192,0.10) 1.5px, transparent 1.6px) 0 0 / 6px 6px;
        color: var(--paper);
        padding: 26px 18px 24px;
        border-bottom: 4px solid var(--ink);
        position: relative;
        overflow: hidden;
      }
      .hero-eyebrow {
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.3em;
        color: var(--retro-yellow);
        font-weight: 700;
        margin-bottom: 10px;
      }
      .hero-title {
        font-family: var(--font-var);
        font-size: 46px;
        line-height: 0.86;
        letter-spacing: -0.02em;
        color: var(--paper);
      }
      .hero-title .accent { color: var(--retro-yellow); display: block; }
      .hero-sub {
        font-family: var(--font-body);
        font-size: 13.5px;
        line-height: 1.45;
        color: rgba(236,223,192,0.82);
        margin-top: 14px;
        max-width: 30ch;
      }
      .hero-flags {
        display: flex;
        gap: 6px;
        margin-top: 16px;
        font-size: 20px;
        flex-wrap: wrap;
      }
      .hero-cta { margin-top: 20px; }

      /* ── Stats strip ── */
      .hero-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-top: 3px solid var(--ink);
      }
      .hstat {
        padding: 12px 6px;
        text-align: center;
        background: var(--paper-2);
        border-right: 2px solid var(--ink);
      }
      .hstat:last-child { border-right: none; }
      .hstat .num {
        font-family: var(--font-var);
        font-size: 24px;
        line-height: 1;
        color: var(--ink);
      }
      .hstat .lbl {
        font-family: var(--font-mono);
        font-size: 8px;
        letter-spacing: 0.12em;
        color: var(--dim);
        margin-top: 4px;
        text-transform: uppercase;
      }

      /* ── Countdown ── */
      .countdown {
        margin: 0 16px 16px;
        background: var(--retro-yellow);
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-md);
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cd-label {
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.18em;
        color: var(--ink);
        text-transform: uppercase;
      }
      .cd-days {
        font-family: var(--font-var);
        font-size: 34px;
        line-height: 1;
        color: var(--ink);
      }
      .cd-date {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--ink);
        text-align: right;
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
        margin: 0 16px 16px;
        animation: pulse-live 2s ease-in-out infinite;
      }
      @keyframes pulse-live {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @media (prefers-reduced-motion: reduce) { .cd-live { animation: none; } }

      /* ── Quick grid ── */
      .quick-grid {
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .quick-card {
        all: unset;
        cursor: pointer;
        background: var(--paper-3);
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-md);
        padding: 16px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 104px;
        transition: transform 0.08s, box-shadow 0.08s;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .quick-card:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 var(--ink); }
      .qc-glyph {
        width: 34px; height: 34px;
        display: grid; place-items: center;
        border: 2px solid var(--ink);
        font-size: 18px;
        color: var(--paper);
      }
      .qc-title { font-family: var(--font-var); font-size: 16px; line-height: 1; color: var(--ink); }
      .qc-desc {
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--dim);
        letter-spacing: 0.05em;
        margin-top: auto;
      }

      /* ── Jugados banner ── */
      .played-banner {
        margin: 16px 16px 0;
        padding: 10px 14px;
        background: var(--retro-green);
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-sm);
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--paper);
        letter-spacing: 0.08em;
        text-align: center;
      }
    `,
  ];

  render() {
    const cd = this._cd;
    const played = this._played;

    return html`
      <!-- Hero oscuro -->
      <section class="hero">
        <div class="hero-eyebrow">★ FIFA WORLD CUP · 26 ★</div>
        <h1 class="hero-title">
          PREDICE<span class="accent">EL MUNDIAL</span>
        </h1>
        <p class="hero-sub">
          Simula los 12 grupos, avanza por las eliminatorias de 48 selecciones y corona a tu campeón.
        </p>
        <div class="hero-flags">
          ${['🇪🇸','🇧🇷','🇦🇷','🇫🇷','🇩🇪','🇲🇽','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🇵🇹'].map(f => html`<span>${f}</span>`)}
        </div>
        <div class="hero-cta">
          <button class="btn btn-primary btn-block" @click="${() => this._navigate('groups')}">
            <span class="btn-icon">⚡</span> ${t('hero.ctaPrimary')}
          </button>
        </div>
      </section>

      <!-- Stats strip -->
      <div class="hero-stats">
        <div class="hstat"><div class="num">48</div><div class="lbl">${t('hero.statTeams')}</div></div>
        <div class="hstat"><div class="num">12</div><div class="lbl">${t('hero.statGroups')}</div></div>
        <div class="hstat"><div class="num">104</div><div class="lbl">${t('hero.statMatches')}</div></div>
        <div class="hstat"><div class="num">16</div><div class="lbl">${t('hero.statVenues')}</div></div>
      </div>

      <!-- Jugados (si hay resultados) -->
      ${played > 0 ? html`
        <div class="played-banner">⚽ ${played}/104 partidos disputados</div>
      ` : ''}

      <!-- Countdown o EN CURSO -->
      ${cd.started
        ? html`<div class="cd-live">⚽ EN CURSO — MUNDIAL 2026</div>`
        : html`
          <div class="countdown">
            <div>
              <div class="cd-label">Faltan</div>
              <div class="cd-days">${cd.days} días</div>
            </div>
            <div class="cd-date">
              11 JUN 2026<br>
              México vs Sudáfrica<br>
              Estadio Azteca
            </div>
          </div>
        `}

      <!-- Quick grid -->
      <div class="quick-grid">
        <button class="quick-card" @click="${() => this._navigate('groups')}">
          <div class="qc-glyph" style="background:var(--retro-orange)">▦</div>
          <div class="qc-title">GRUPOS</div>
          <div class="qc-desc">12 grupos · clasificación</div>
        </button>
        <button class="quick-card" @click="${() => this._navigate('bracket')}">
          <div class="qc-glyph" style="background:var(--retro-green)">🏆</div>
          <div class="qc-title">BRACKET</div>
          <div class="qc-desc">De 1/16 a la Final</div>
        </button>
        <button class="quick-card" @click="${() => this._navigate('squads')}">
          <div class="qc-glyph" style="background:var(--retro-blue)">★</div>
          <div class="qc-title">PLANTILLAS</div>
          <div class="qc-desc">48 convocatorias</div>
        </button>
        <button class="quick-card" @click="${() => this._navigate('stadiums')}">
          <div class="qc-glyph" style="background:var(--retro-red)">◍</div>
          <div class="qc-title">ESTADIOS</div>
          <div class="qc-desc">16 sedes · 3 países</div>
        </button>
      </div>
    `;
  }
}

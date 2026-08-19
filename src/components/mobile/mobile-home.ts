import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { t, useLocaleStore } from '../../i18n';
import { mobileShared } from './mobile-shared.css';
import { showToast } from '../../lib/interaction';
import { getCountdownValues, getTournamentPhase, type TournamentPhase } from '../../lib/tournament-phase';

/**
 * Vista de inicio del shell móvil: hero, stats, countdown, simulación y quick-grid.
 * Cableada al store real (resultados, estadísticas del torneo).
 */
@customElement('mobile-home')
export class MobileHome extends LitElement {
  @state() private _phase: TournamentPhase = getTournamentPhase();
  @state() private _cd = getCountdownValues();
  @state() private _played = 0;

  private _timer?: ReturnType<typeof setInterval>;
  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    if (this._phase === 'countdown') {
      this._timer = setInterval(() => {
        this._cd = getCountdownValues();
        this._phase = getTournamentPhase();
        if (this._phase !== 'countdown') clearInterval(this._timer);
      }, 60_000);
    }
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

  private _simulateAll() {
    const store = useTournamentStore.getState();
    store.autoSimulateGroups();
    store.autoSimulateKnockout();
    this._played =
      store.groupMatches.filter(m => m.scoreA !== null).length +
      Object.values(store.knockoutMatches).filter(m => m.isPlayed).length;
    const locale = useLocaleStore.getState().locale;
    showToast(locale === 'es' ? 'Torneo completo simulado 🎲' : 'Full tournament simulated 🎲');
  }

  private _resetAll() {
    const locale = useLocaleStore.getState().locale;
    if (confirm(locale === 'es' ? '¿Reiniciar todo el torneo?' : 'Reset the whole tournament?')) {
      const store = useTournamentStore.getState();
      store.resetTournament();
      this._played = 0;
      showToast(locale === 'es' ? 'Torneo reiniciado 🔄' : 'Tournament reset 🔄');
    }
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
        margin: 16px 16px 16px;
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
      .cd-live,
      .cd-archive {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 18px;
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-md);
        font-family: var(--font-var);
        font-size: 16px;
        letter-spacing: 0.08em;
        margin: 16px 16px 16px;
      }
      .cd-live {
        background: var(--retro-red);
        color: var(--paper-3);
        animation: pulse-live 2s ease-in-out infinite;
      }
      .cd-archive {
        background: var(--retro-yellow);
        color: var(--ink);
      }
      .cd-archive-hint {
        font-family: var(--font-body);
        font-size: 12px;
        letter-spacing: 0;
        font-weight: 500;
        line-height: 1.35;
      }
      @keyframes pulse-live {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @media (prefers-reduced-motion: reduce) { .cd-live { animation: none; } }

      /* ── Simulación Rápida ── */
      .sim-card {
        margin: 0 16px 16px;
        background: var(--paper-2);
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-md);
        padding: 14px 16px;
      }
      .sim-title {
        font-family: var(--font-var);
        font-size: 16px;
        color: var(--ink);
        margin-bottom: 4px;
        letter-spacing: 0.02em;
      }
      .sim-desc {
        font-family: var(--font-body);
        font-size: 11px;
        color: var(--dim);
        line-height: 1.45;
        margin-bottom: 12px;
      }
      .sim-actions {
        display: flex;
        gap: 9px;
      }
      .sim-actions .btn {
        flex: 1;
      }

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
    const locale = useLocaleStore.getState().locale;

    return html`
      <!-- Hero oscuro -->
      <section class="hero">
        <div class="hero-eyebrow">★ FIFA WORLD CUP · 26 ★</div>
        <h1 class="hero-title">
          ${locale === 'es' ? html`PREDICE<span class="accent">EL MUNDIAL</span>` : html`PREDICT<span class="accent">THE WORLD CUP</span>`}
        </h1>
        <p class="hero-sub">
          ${locale === 'es'
            ? 'Simula los 12 grupos, avanza por las eliminatorias de 48 selecciones y corona a tu campeón.'
            : 'Simulate the 12 groups, advance through the 48-team knockout rounds and crown your champion.'}
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
        <div class="played-banner">⚽ ${locale === 'es' ? `${played}/104 partidos disputados` : `${played}/104 matches played`}</div>
      ` : ''}

      ${this._phase === 'archive'
        ? html`
          <div class="cd-archive">
            <span>${t('hero.archive')}</span>
            <span class="cd-archive-hint">${t('hero.archiveHint')}</span>
          </div>
        `
        : this._phase === 'live'
          ? html`<div class="cd-live">${t('hero.live')}</div>`
          : html`
            <div class="countdown">
              <div>
                <div class="cd-label">${locale === 'es' ? 'Faltan' : 'Countdown'}</div>
                <div class="cd-days">${cd.days} ${locale === 'es' ? 'días' : 'days'}</div>
              </div>
              <div class="cd-date">
                11 JUN 2026<br>
                ${locale === 'es' ? 'México vs Sudáfrica' : 'Mexico vs South Africa'}<br>
                ${locale === 'es' ? 'Estadio Azteca' : 'Azteca Stadium'}
              </div>
            </div>
          `}

      <!-- Bloque de Simulación Rápida -->
      <div class="sim-card">
        <div class="sim-title">⚡ ${locale === 'es' ? 'SIMULACIÓN DEL TORNEO' : 'TOURNAMENT SIMULATION'}</div>
        <div class="sim-desc">
          ${locale === 'es'
            ? '¿Quieres rellenar todo el torneo al instante? Simula los 104 partidos (tanto en grupos como en la fase eliminatoria) de una sola vez desde aquí.'
            : 'Want to fill the entire tournament instantly? Simulate all 104 matches (both group stage and knockout rounds) at once from here.'}
        </div>
        <div class="sim-actions">
          <button class="btn btn-primary" @click="${this._simulateAll}">
            <span class="btn-icon">🎲</span> ${locale === 'es' ? 'SIMULAR TODO' : 'SIMULATE ALL'}
          </button>
          <button class="btn" style="color: var(--retro-red)" @click="${this._resetAll}">
            ${t('groups.reset').toUpperCase()}
          </button>
        </div>
      </div>

      <!-- Quick grid -->
      <div class="quick-grid">
        <button class="quick-card" @click="${() => this._navigate('groups')}">
          <div class="qc-glyph" style="background:var(--retro-orange)">▦</div>
          <div class="qc-title">${t('tabs.groups').toUpperCase()}</div>
          <div class="qc-desc">${locale === 'es' ? '12 grupos · clasificación' : '12 groups · standings'}</div>
        </button>
        <button class="quick-card" @click="${() => this._navigate('bracket')}">
          <div class="qc-glyph" style="background:var(--retro-green)">🏆</div>
          <div class="qc-title">${t('knockout.mobileTitle').toUpperCase()}</div>
          <div class="qc-desc">${locale === 'es' ? 'De 1/16 a la Final' : 'From R32 to the Final'}</div>
        </button>
        <button class="quick-card" @click="${() => this._navigate('squads')}">
          <div class="qc-glyph" style="background:var(--retro-blue)">★</div>
          <div class="qc-title">${t('tabs.squads').toUpperCase()}</div>
          <div class="qc-desc">${locale === 'es' ? '48 convocatorias' : '48 squads'}</div>
        </button>
        <button class="quick-card" @click="${() => this._navigate('stadiums')}">
          <div class="qc-glyph" style="background:var(--retro-red)">◍</div>
          <div class="qc-title">${t('tabs.stadiums').toUpperCase()}</div>
          <div class="qc-desc">${locale === 'es' ? '16 sedes · 3 países' : '16 venues · 3 countries'}</div>
        </button>
      </div>
    `;
  }
}

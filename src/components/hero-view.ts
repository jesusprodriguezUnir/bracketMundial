import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { TEAMS_2026 } from '../data/fifa-2026';
import { t } from '../i18n';
import { getCountdownValues, getTournamentPhase, type TournamentPhase } from '../lib/tournament-phase';
import './logo-crest';

@customElement('hero-view')
export class HeroView extends LitElement {
  @state() private _phase: TournamentPhase = getTournamentPhase();
  @state() private _cd = getCountdownValues();
  private _timer?: ReturnType<typeof setInterval>;
  private _unsubscribeStore?: () => void;

  connectedCallback() {
    super.connectedCallback();
    if (this._phase === 'countdown') {
      this._timer = setInterval(() => {
        this._cd = getCountdownValues();
        this._phase = getTournamentPhase();
        if (this._phase !== 'countdown') clearInterval(this._timer);
      }, 1000);
    }
    this._unsubscribeStore = subscribeSlice(
      useTournamentStore,
      state => state.groupMatches,
      () => this.requestUpdate(),
    );
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    this._unsubscribeStore?.();
    super.disconnectedCallback();
  }

  static readonly styles = css`
    :host { display: block; }

    .hero {
      position: relative;
      overflow: hidden;
      min-height: 520px;
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 28px;
      padding: 36px 40px 28px;
      background: var(--card-grad);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-xl);
    }

    /* Night-sky glow background */
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(ellipse 900px 420px at 78% -120px, rgba(77,163,255,0.20), transparent 70%),
        radial-gradient(ellipse 600px 340px at 0% 110%, rgba(120,90,255,0.12), transparent 70%),
        radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1.4px);
      background-size: auto, auto, 22px 22px;
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
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 14px;
    }

    h1 {
      font-family: var(--font-var);
      font-size: clamp(52px, 7vw, 88px);
      font-weight: 800;
      text-transform: uppercase;
      line-height: 0.86;
      letter-spacing: -0.02em;
      margin: 0 0 18px;
      color: var(--ink);
    }
    h1 .line-accent {
      color: var(--accent);
    }
    h1 .line-highlight {
      position: relative;
      display: inline-block;
    }
    h1 .line-highlight::before {
      content: '';
      position: absolute;
      left: 0; right: 0;
      bottom: 4%; height: 6px;
      background: var(--accent);
      border-radius: var(--radius-pill);
      box-shadow: 0 0 14px rgba(77,163,255,0.6);
      z-index: -1;
    }

    .hero-tagline {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.4;
      color: var(--ink-soft);
      max-width: 460px;
      font-weight: 600;
      letter-spacing: 0.02em;
      margin: -10px 0 20px;
    }

    .hero-desc {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.45;
      color: var(--ink-muted);
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
      background: var(--accent);
      color: var(--on-accent);
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 14px 24px;
      border-radius: var(--radius-sm);
      box-shadow: var(--glow-accent-sm);
      transition: transform 0.12s, background 0.12s, box-shadow 0.12s;
    }
    .btn-cta-primary:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
      box-shadow: var(--glow-accent);
    }
    .btn-cta-secondary {
      all: unset;
      cursor: pointer;
      background: var(--fill);
      color: var(--ink);
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 14px 24px;
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      transition: transform 0.12s, border-color 0.12s;
    }
    .btn-cta-secondary:hover {
      transform: translateY(-1px);
      border-color: var(--accent);
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
      background: var(--inset-bg);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
    }
    .cd-num {
      font-family: var(--font-var);
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      color: var(--accent);
      letter-spacing: 0.04em;
    }
    .cd-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.2em;
      color: var(--ink-muted);
      margin-top: 4px;
    }
    .cd-sep {
      font-family: var(--font-var);
      font-size: 28px;
      color: var(--ink-muted);
      align-self: flex-start;
      padding-top: 10px;
    }
    .cd-live,
    .cd-archive {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 11px 18px;
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-md);
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 22px;
    }
    .cd-live {
      background: var(--retro-red);
      border-color: var(--retro-red);
      color: #fff;
      animation: pulse-live 2s ease-in-out infinite;
    }
    .cd-archive {
      background: color-mix(in srgb, var(--band-gold) 22%, var(--paper-2));
      border-color: var(--band-gold);
      color: var(--ink);
    }
    .cd-archive-hint {
      font-family: var(--font-body);
      font-size: 12px;
      letter-spacing: 0;
      font-weight: 500;
      max-width: 36ch;
    }
    @keyframes pulse-live {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @media (prefers-reduced-motion: reduce) { .cd-live { animation: none; } }

    /* Stats strip */
    .stats-strip {
      display: flex;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .stat-cell {
      flex: 1;
      padding: 10px 14px;
      border-right: 1px solid var(--hairline);
    }
    .stat-cell:last-child { border-right: none; }
    .stat-cell:nth-child(odd)  { background: var(--fill); }
    .stat-cell:nth-child(even) { background: var(--fill-soft); }
    .stat-num {
      font-family: var(--font-var);
      font-size: 30px;
      font-weight: 800;
      line-height: 1;
      color: var(--ink);
    }
    .stat-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-muted);
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
        rgba(77,163,255,0.22) 0deg 6deg,
        transparent 6deg 18deg
      );
      border-radius: 50%;
      animation: spin 90s linear infinite;
      pointer-events: none;
      filter: blur(0.4px);
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .crest-wrapper {
      position: relative;
      filter: drop-shadow(0 20px 48px rgba(77,163,255,0.35));
    }

    .sticker-new {
      position: absolute;
      top: 24px; right: 8px;
      background: var(--accent);
      color: var(--on-accent);
      font-family: var(--font-var);
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      box-shadow: var(--glow-accent-sm);
      letter-spacing: 0.06em;
    }
    .sticker-free {
      position: absolute;
      bottom: 32px; left: 8px;
      background: var(--fill);
      color: var(--ink-soft);
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 6px 12px;
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      letter-spacing: 0.12em;
    }

    /* Animated ticker marquee */
    .ticker {
      position: relative;
      z-index: 1;
      background: var(--chrome-bg);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: var(--ink-soft);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      margin-top: 14px;
      overflow: hidden;
      display: flex;
      align-items: center;
      height: 36px;
    }
    .ticker-label {
      flex-shrink: 0;
      padding: 0 14px;
      color: var(--accent);
      text-transform: uppercase;
      font-weight: 600;
      z-index: 1;
      background: var(--chrome-bg);
      border-right: 1px solid var(--hairline);
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
      color: var(--accent);
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
    if (this._phase === 'archive') {
      return html`
        <div class="cd-archive">
          <span>${t('hero.archive')}</span>
          <span class="cd-archive-hint">${t('hero.archiveHint')}</span>
        </div>
      `;
    }
    if (this._phase === 'live') {
      return html`<div class="cd-live">${t('hero.live')}</div>`;
    }
    const cd = this._cd;
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
    const tickerLabel = hasPlayed ? t('hero.tickerResults') : t('hero.tickerNext');

    return html`
      <section>
        <div class="hero">
          <!-- Left column -->
          <div class="hero-left">
            <div>
              <div class="eyebrow">${t('hero.eyebrow')}</div>
              <h1>
                <span style="display:block">${t('hero.titleLine1')}</span>
                <span style="display:block" class="line-accent">${t('hero.titleLine2')}</span>
                <span style="display:block"><span class="line-highlight">${t('hero.titleLine3')}</span></span>
              </h1>
              <p class="hero-tagline">${t('hero.titleSlogan')}</p>
              ${this._renderCountdown()}
              <p class="hero-desc">
                ${t('hero.description')}
                <b>${t('hero.descriptionHighlight')}</b>
              </p>
              <div class="cta-row">
                <button class="btn-cta-primary" @click="${this._goToBracket}">${t('hero.ctaPrimary')}</button>
                <button class="btn-cta-secondary" @click="${this._goToGroups}">${t('hero.ctaSecondary')}</button>
              </div>
            </div>
            <!-- Stats strip -->
            <div class="stats-strip">
              <div class="stat-cell"><div class="stat-num">36</div><div class="stat-label">${t('hero.statTeams')}</div></div>
              <div class="stat-cell"><div class="stat-num">8</div><div class="stat-label">${t('hero.statGroups')}</div></div>
              <div class="stat-cell"><div class="stat-num">1</div><div class="stat-label">${t('hero.statVenues')}</div></div>
              <div class="stat-cell"><div class="stat-num">144</div><div class="stat-label">${t('hero.statMatches')}</div></div>
              <div class="stat-cell"><div class="stat-num">1</div><div class="stat-label">${t('hero.statChampion')}</div></div>
            </div>
          </div>

          <!-- Right column: crest -->
          <div class="hero-right">
            <div class="crest-sunburst"></div>
            <div class="crest-wrapper">
              <logo-crest size="340"></logo-crest>
            </div>
            <div class="sticker-new">${this._phase === 'archive' ? t('hero.stickerArchive') : t('hero.stickerNew')}</div>
            <div class="sticker-free">${t('hero.stickerFree')}</div>
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

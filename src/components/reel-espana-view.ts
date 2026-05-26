import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

const PLAYERS = {
  gk: 'UNAI SIMÓN',
  rb: 'PEDRO PORRO',
  cb1: 'PAU CUBARSÍ',
  cb2: 'A. LAPORTE',
  lb: 'M. CUCURELLA',
  cm: 'RODRI',
  cmL: 'PEDRI',
  cmR: 'FABIÁN RUIZ',
  rw: 'LAMINE YAMAL',
  st: 'M. OYARZABAL',
  lw: 'NICO WILLIAMS',
};

const SCENE_TIMING = [0, 3000, 6000, 10000, 15000, 23000];

@customElement('reel-espana-view')
export class ReelEspanaView extends LitElement {
  @state() private _scene = 0;

  private _timers: ReturnType<typeof setTimeout>[] = [];

  static readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 100vh;
      min-height: 100dvh;
      background: linear-gradient(180deg, #1a5c2a 0%, #0f3d18 30%, #1a5c2a 60%, #0f3d18 100%);
      overflow: hidden;
      position: relative;
      font-family: var(--font-head, 'Archivo Black', sans-serif);
    }

    :host::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 18px,
        rgba(255,255,255,0.03) 18px,
        rgba(255,255,255,0.03) 20px
      );
      pointer-events: none;
      z-index: 0;
    }

    :host::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(circle at 50% 48%, transparent 10%, rgba(255,255,255,0.15) 10.1%, rgba(255,255,255,0.15) 10.5%, transparent 10.6%) no-repeat,
        linear-gradient(90deg, transparent calc(50% - 0.5px), rgba(255,255,255,0.25) calc(50% - 0.5px), rgba(255,255,255,0.25) calc(50% + 0.5px), transparent calc(50% + 0.5px)) no-repeat 0 48% / 100% 100%,
        linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.2) 100%) no-repeat 0 8% / 70% 1px,
        linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.2) 100%) no-repeat 0 88% / 70% 1px;
    }

    .reel {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 500px;
      padding: 12px 16px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .scene-overlay {
      width: 100%;
      text-align: center;
      position: relative;
      z-index: 2;
      min-height: 56px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .scene-block {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.35s ease, transform 0.35s ease;
      pointer-events: none;
    }

    .scene-block.active {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .intro-emoji {
      font-size: 44px;
      line-height: 1;
    }

    .intro-title {
      font-family: var(--font-var, 'Bowlby One', 'Impact', sans-serif);
      font-size: 27px;
      color: #ffc400;
      text-align: center;
      margin: 4px 0 0;
      text-shadow:
        2px 2px 0 #b71c1c,
        3px 3px 0 rgba(0,0,0,0.5);
      letter-spacing: 0.02em;
      line-height: 1.15;
    }

    .intro-subtitle {
      font-family: var(--font-head, 'Archivo Black', sans-serif);
      font-size: 20px;
      color: #fff;
      margin: 2px 0 0;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.6);
      letter-spacing: 0.08em;
    }

    .section-label {
      font-family: var(--font-var, 'Bowlby One', 'Impact', sans-serif);
      font-size: 28px;
      color: #ffc400;
      text-shadow:
        2px 2px 0 #c41e2c,
        3px 3px 0 rgba(0,0,0,0.4);
      letter-spacing: 0.04em;
      line-height: 1.2;
    }

    .cta-title {
      font-family: var(--font-var, 'Bowlby One', 'Impact', sans-serif);
      font-size: 30px;
      color: #fff;
      text-shadow: 2px 2px 0 #c41e2c,
                   3px 3px 0 rgba(0,0,0,0.5);
      margin: 0;
      line-height: 1.15;
    }

    .cta-sub {
      font-family: var(--font-head, 'Archivo Black', sans-serif);
      font-size: 20px;
      color: #ffc400;
      margin: 8px 0 0;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.6);
      letter-spacing: 0.03em;
    }

    .cta-link {
      font-family: var(--font-body, 'Archivo', sans-serif);
      font-size: 15px;
      color: rgba(255,255,255,0.85);
      margin-top: 8px;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.6);
      font-weight: 700;
    }

    .spain-badge {
      width: 56px;
      height: 56px;
      background: #c41e2c;
      border: 3px solid #ffc400;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin: 6px 0 0;
    }

    /* ── field with players ── */
    .field {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 4;
      max-height: 52vh;
      max-height: 52dvh;
      z-index: 1;
    }

    .player-card {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0);
      transition: opacity 0.15s ease, transform 0.15s ease;
      pointer-events: none;
      z-index: 2;
    }

    .player-card.reveal {
      opacity: 1;
      transform: scale(1);
    }

    .player-dot {
      width: 46px;
      height: 46px;
      background: #c41e2c;
      border: 2px solid #ffc400;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      color: #ffc400;
      font-weight: 900;
      font-family: var(--font-head, 'Archivo Black', sans-serif);
    }

    .player-name {
      margin-top: 3px;
      font-size: 10px;
      font-weight: 700;
      font-family: var(--font-head, 'Archivo Black', sans-serif);
      color: #fff;
      text-align: center;
      text-shadow: 1px 1px 0 rgba(0,0,0,0.7);
      letter-spacing: 0.03em;
      white-space: nowrap;
      background: rgba(26,25,51,0.7);
      padding: 2px 6px;
    }

    /* ── pop animations ── */
    .player-card.pop-bounce.reveal {
      animation: bouncePop 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
    }

    .player-card.pop-glow.reveal {
      animation: glowPop 0.5s ease-out forwards;
    }

    .player-card.pop-slide.reveal {
      animation: slidePop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.1) forwards;
    }

    @keyframes bouncePop {
      0%   { transform: scale(0); opacity: 0; }
      50%  { transform: scale(1.3); opacity: 1; }
      70%  { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes glowPop {
      0%   { transform: scale(0); opacity: 0; filter: brightness(3); }
      55%  { transform: scale(1.12); opacity: 1; filter: brightness(1.8); }
      100% { transform: scale(1); opacity: 1; filter: brightness(1); }
    }

    @keyframes slidePop {
      0%   { transform: translateY(28px) scale(0.4); opacity: 0; }
      60%  { transform: translateY(-4px) scale(1.1); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }

    /* ── final zoom ── */
    .field.zoom-in {
      animation: zoomField 7s ease-in-out forwards;
    }

    @keyframes zoomField {
      0%   { transform: scale(1); }
      100% { transform: scale(1.06); }
    }

    /* ── player positions ── */
    .player-card.gk  { left: 50%; top: 6%;  transform-origin: center center; }
    .player-card.rb  { left: 84%; top: 25%; transform-origin: center center; }
    .player-card.cb1 { left: 58%; top: 25%; transform-origin: center center; }
    .player-card.cb2 { left: 42%; top: 25%; transform-origin: center center; }
    .player-card.lb  { left: 16%; top: 25%; transform-origin: center center; }
    .player-card.cm  { left: 50%; top: 45%; transform-origin: center center; }
    .player-card.cmL { left: 24%; top: 45%; transform-origin: center center; }
    .player-card.cmR { left: 76%; top: 45%; transform-origin: center center; }
    .player-card.rw  { left: 82%; top: 66%; transform-origin: center center; }
    .player-card.st  { left: 50%; top: 62%; transform-origin: center center; }
    .player-card.lw  { left: 18%; top: 66%; transform-origin: center center; }

    @media (min-width: 500px) {
      .intro-title { font-size: 32px; }
      .section-label { font-size: 32px; }
      .cta-title { font-size: 34px; }
      .player-dot { width: 54px; height: 54px; font-size: 19px; }
      .player-name { font-size: 11px; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._startTimeline();
  }

  disconnectedCallback() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    super.disconnectedCallback();
  }

  private _startTimeline() {
    this._scene = 0;
    for (let i = 1; i < SCENE_TIMING.length; i++) {
      this._timers.push(
        setTimeout(() => {
          this._scene = i;
        }, SCENE_TIMING[i]),
      );
    }
  }

  render() {
    const s = this._scene;
    return html`
      <div class="reel">
        <!-- Scene text overlay -->
        <div class="scene-overlay">
          <div class="scene-block ${s === 0 ? 'active' : ''}">
            <span class="intro-emoji">&#x1F6A8;</span>
            <h1 class="intro-title">ESTE ES MI 11 DE ESPAÑA</h1>
            <p class="intro-subtitle">PARA EL MUNDIAL</p>
            <div class="spain-badge">&#x1F1EA;&#x1F1F8;</div>
          </div>
          <div class="scene-block ${s === 1 ? 'active' : ''}">
            <span class="section-label">PORTERÍA Y DEFENSA</span>
          </div>
          <div class="scene-block ${s === 2 ? 'active' : ''}">
            <span class="section-label">EL CENTRO DEL CAMPO</span>
          </div>
          <div class="scene-block ${s === 3 ? 'active' : ''}">
            <span class="section-label">ATAQUE TITULAR</span>
          </div>
          <div class="scene-block ${s === 4 ? 'active' : ''}">
            <p class="cta-title">¿CAMBIARÍAS A ALGUIEN?</p>
          </div>
          <div class="scene-block ${s >= 5 ? 'active' : ''}">
            <p class="cta-sub">Comenta tu 11 &#x1F447;</p>
            <p class="cta-link">Análisis y debate en bracketmundial.com</p>
          </div>
        </div>

        <!-- Field + players -->
        <div class="field ${s >= 4 ? 'zoom-in' : ''}">
          <!-- GK (scene 1+) -->
          <div class="player-card gk pop-bounce ${s >= 1 ? 'reveal' : ''}">
            <div class="player-dot">1</div>
            <span class="player-name">${PLAYERS.gk}</span>
          </div>
          <!-- Defense (scene 1+) -->
          <div class="player-card rb pop-bounce ${s >= 1 ? 'reveal' : ''}" style="animation-delay:0.12s">
            <div class="player-dot">2</div>
            <span class="player-name">${PLAYERS.rb}</span>
          </div>
          <div class="player-card cb1 pop-bounce ${s >= 1 ? 'reveal' : ''}" style="animation-delay:0.28s">
            <div class="player-dot">4</div>
            <span class="player-name">${PLAYERS.cb1}</span>
          </div>
          <div class="player-card cb2 pop-bounce ${s >= 1 ? 'reveal' : ''}" style="animation-delay:0.44s">
            <div class="player-dot">3</div>
            <span class="player-name">${PLAYERS.cb2}</span>
          </div>
          <div class="player-card lb pop-bounce ${s >= 1 ? 'reveal' : ''}" style="animation-delay:0.6s">
            <div class="player-dot">5</div>
            <span class="player-name">${PLAYERS.lb}</span>
          </div>
          <!-- Midfield (scene 2+) -->
          <div class="player-card cm pop-glow ${s >= 2 ? 'reveal' : ''}">
            <div class="player-dot">6</div>
            <span class="player-name">${PLAYERS.cm}</span>
          </div>
          <div class="player-card cmL pop-glow ${s >= 2 ? 'reveal' : ''}" style="animation-delay:0.25s">
            <div class="player-dot">8</div>
            <span class="player-name">${PLAYERS.cmL}</span>
          </div>
          <div class="player-card cmR pop-glow ${s >= 2 ? 'reveal' : ''}" style="animation-delay:0.5s">
            <div class="player-dot">7</div>
            <span class="player-name">${PLAYERS.cmR}</span>
          </div>
          <!-- Attack (scene 3+) -->
          <div class="player-card rw pop-slide ${s >= 3 ? 'reveal' : ''}">
            <div class="player-dot">10</div>
            <span class="player-name">${PLAYERS.rw}</span>
          </div>
          <div class="player-card st pop-slide ${s >= 3 ? 'reveal' : ''}" style="animation-delay:0.22s">
            <div class="player-dot">9</div>
            <span class="player-name">${PLAYERS.st}</span>
          </div>
          <div class="player-card lw pop-slide ${s >= 3 ? 'reveal' : ''}" style="animation-delay:0.44s">
            <div class="player-dot">11</div>
            <span class="player-name">${PLAYERS.lw}</span>
          </div>
        </div>
      </div>
    `;
  }
}

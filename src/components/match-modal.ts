import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { TEAMS_2026 } from '../data/fifa-2026';
import { t, useLocaleStore } from '../i18n';
import { getBroadcastInfo } from '../lib/broadcasting';
import { retroButton } from '../styles/retro-button';


@customElement('match-modal')
export class MatchModal extends LitElement {
  @property({ attribute: 'match-id' }) matchId = '';
  @property({ attribute: 'team-a' }) teamA = '';
  @property({ attribute: 'team-b' }) teamB = '';
  @property({ attribute: 'initial-score-a', type: Number }) initialScoreA: number | null = null;
  @property({ attribute: 'initial-score-b', type: Number }) initialScoreB: number | null = null;
  @property({ attribute: 'initial-penalty-score-a', type: Number }) initialPenaltyScoreA: number | null = null;
  @property({ attribute: 'initial-penalty-score-b', type: Number }) initialPenaltyScoreB: number | null = null;
  @property() phase: 'group' | 'knockout' = 'group';
  @property() venue = '';
  @property() city = '';
  @property() timeSpain = '';
  @property() stadiumImage = '';

  @state() private _scoreA: number | null = null;
  @state() private _scoreB: number | null = null;
  @state() private _penaltyScoreA: number | null = null;
  @state() private _penaltyScoreB: number | null = null;

  get scoreA() { return this._scoreA; }
  get scoreB() { return this._scoreB; }

  protected override updated(changedProps: PropertyValues) {
    if (changedProps.has('initialScoreA')) this._scoreA = this.initialScoreA;
    if (changedProps.has('initialScoreB')) this._scoreB = this.initialScoreB;
    if (changedProps.has('initialPenaltyScoreA')) this._penaltyScoreA = this.initialPenaltyScoreA;
    if (changedProps.has('initialPenaltyScoreB')) this._penaltyScoreB = this.initialPenaltyScoreB;
  }

  override firstUpdated() {
    const addBtn = this.shadowRoot?.querySelector<HTMLButtonElement>('.score-add-a');
    addBtn?.focus();
  }

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
    if (e.key === 'Tab') this._trapFocus(e);
  };

  private _trapFocus(e: KeyboardEvent) {
    const focusable = Array.from(
      this.shadowRoot?.querySelectorAll<HTMLElement>('button') ?? []
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!last) return;
    if (e.shiftKey && this.shadowRoot?.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && this.shadowRoot?.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  private readonly _handleHostClick = (e: MouseEvent) => {
    if (e.target === this) this.close();
  };

  private _unsubscribeLocale?: () => void;

  private _startY = 0;
  private _currentY = 0;
  private _isDragging = false;

  private readonly _handleTouchStart = (e: TouchEvent) => {
    if (this.scrollTop > 0) return;
    this._startY = e.touches[0].clientY;
    this._currentY = this._startY;
    this._isDragging = true;
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) modal.style.transition = 'none';
  };

  private readonly _handleTouchMove = (e: TouchEvent) => {
    if (!this._isDragging) return;
    this._currentY = e.touches[0].clientY;
    const deltaY = this._currentY - this._startY;
    if (deltaY > 0) {
      // Evitar scroll nativo al deslizar hacia abajo
      if (e.cancelable) e.preventDefault();
      const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
      if (modal) modal.style.transform = `translateY(${deltaY}px)`;
    } else {
      this._isDragging = false;
    }
  };

  private readonly _handleTouchEnd = () => {
    if (!this._isDragging) return;
    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.transition = 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
      if (deltaY > 120) {
        modal.style.transform = `translateY(100vh)`;
        setTimeout(() => this.close(), 200);
      } else {
        modal.style.transform = '';
      }
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
    this.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    this.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    this.addEventListener('touchend', this._handleTouchEnd);
    this.addEventListener('touchcancel', this._handleTouchEnd);
    this._unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    this.removeEventListener('touchstart', this._handleTouchStart);
    this.removeEventListener('touchmove', this._handleTouchMove);
    this.removeEventListener('touchend', this._handleTouchEnd);
    this.removeEventListener('touchcancel', this._handleTouchEnd);
    this._unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private clear() {
    this._scoreA = null;
    this._scoreB = null;
    this._penaltyScoreA = null;
    this._penaltyScoreB = null;
    this.dispatchEvent(new CustomEvent('save', {
      detail: {
        matchId: this.matchId,
        scoreA: null,
        scoreB: null,
        penaltyScoreA: null,
        penaltyScoreB: null,
      },
      bubbles: true,
      composed: true,
    }));
  }

  private adjustScore(team: 'A' | 'B', delta: number) {
    const nextScoreA = team === 'A'
      ? Math.max(0, (this._scoreA ?? 0) + delta)
      : (this._scoreA ?? 0);
    const nextScoreB = team === 'B'
      ? Math.max(0, (this._scoreB ?? 0) + delta)
      : (this._scoreB ?? 0);

    this._scoreA = nextScoreA;
    this._scoreB = nextScoreB;

    if (this.phase === 'knockout' && nextScoreA !== nextScoreB) {
      this._penaltyScoreA = null;
      this._penaltyScoreB = null;
    }
  }

  private adjustPenalty(team: 'A' | 'B', delta: number) {
    const nextPenaltyA = team === 'A'
      ? Math.max(0, (this._penaltyScoreA ?? 0) + delta)
      : (this._penaltyScoreA ?? 0);
    const nextPenaltyB = team === 'B'
      ? Math.max(0, (this._penaltyScoreB ?? 0) + delta)
      : (this._penaltyScoreB ?? 0);

    this._penaltyScoreA = nextPenaltyA;
    this._penaltyScoreB = nextPenaltyB;
  }

  private save() {
    if (this.phase === 'knockout' && this._scoreA !== null && this._scoreA === this._scoreB) {
      if (this._penaltyScoreA === null || this._penaltyScoreB === null || this._penaltyScoreA === this._penaltyScoreB) {
        return;
      }
    }

    this.dispatchEvent(new CustomEvent('save', {
      detail: {
        matchId: this.matchId,
        scoreA: this._scoreA,
        scoreB: this._scoreB,
        penaltyScoreA: this._penaltyScoreA,
        penaltyScoreB: this._penaltyScoreB,
      },
      bubbles: true, composed: true,
    }));
  }

  static readonly styles = [retroButton, css`
    /* Backdrop ink semitransparente */
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 25, 51, 0.75);
      padding: 20px;
      overflow: auto;
    }

    /* Panel modal — grande, Panini retro */
    .modal {
      background: var(--paper);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      max-width: 860px;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: calc(100dvh - 40px);
    }

    /* ─── Ticket header ─── */
    .ticket-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 16px;
      background: var(--ink);
      color: var(--paper);
      border-bottom: 3px solid var(--ink);
      box-shadow: 4px 4px 0 0 var(--retro-orange);
    }
    .ticket-label {
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.1em;
      color: var(--retro-yellow);
      flex-shrink: 0;
    }
    .ticket-info {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      color: var(--paper);
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .ticket-group {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-yellow);
      letter-spacing: 0.15em;
      flex-shrink: 0;
    }
    .ticket-broadcast {
      background: var(--retro-blue);
      color: var(--paper);
      padding: 2px 8px;
      font-family: var(--font-var);
      font-size: 11px;
      border: 1px solid var(--paper);
      margin-left: 8px;
    }
    .ticket-broadcast.exclusive {
      background: var(--ink);
      color: var(--retro-yellow);
    }
    .ticket-close {
      all: unset;
      cursor: pointer;
      background: transparent;
      border: 2px solid var(--paper);
      color: var(--paper);
      font-family: var(--font-var);
      font-size: 16px;
      line-height: 1;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: 10px;
      box-shadow: 2px 2px 0 0 rgba(255,255,255,0.3);
      transition: transform 0.1s, box-shadow 0.1s, background 0.1s;
    }
    .ticket-close:hover {
      background: var(--retro-red);
      border-color: var(--retro-red);
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 0 rgba(0,0,0,0.4);
    }
    .ticket-close:active {
      transform: translate(2px, 2px);
      box-shadow: 0 0 0 0 rgba(0,0,0,0.4);
    }
    .ticket-close:focus-visible {
      outline: 3px solid var(--retro-yellow);
      outline-offset: 2px;
    }

    /* ─── Showdown grande con stickers ─── */
    .showdown {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 24px;
      align-items: center;
      padding: 24px;
      background: var(--paper-2);
      border: 4px solid var(--ink);
      margin: 16px;
      box-shadow: var(--shadow-hard-xl);
      position: relative;
    }

    .sticker-side-left {
      display: flex;
      justify-content: flex-end;
    }
    .sticker-side-right {
      display: flex;
      justify-content: flex-start;
    }

    /* Sticker Panini — tarjeta rotada con sombra dura */
    .sticker {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      background: var(--paper-3);
      border: 4px solid var(--ink);
      padding: 12px 14px;
      box-shadow: 4px 4px 0 0 var(--ink);
      min-width: 110px;
    }
    .sticker.left  { transform: rotate(-3deg); }
    .sticker.right { transform: rotate(4deg); }

    .sticker-flag { font-size: 48px; line-height: 1; }
    .flag-img-big {
      width: 70px;
      height: 46px;
      object-fit: cover;
      border: 3px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
    }
    .sticker-name {
      font-family: var(--font-head);
      font-size: 13px;
      margin-top: 6px;
      letter-spacing: 0.04em;
      text-align: center;
    }

    /* Marcador central */
    .score-center {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .score-big {
      font-family: var(--font-var);
      font-size: 88px;
      line-height: 0.9;
      letter-spacing: -0.04em;
      display: flex;
      gap: 12px;
      align-items: center;
      color: var(--ink);
    }
    .score-sep {
      font-family: var(--font-var);
      font-size: 56px;
      color: var(--retro-red);
    }
    .score-final-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.3em;
      color: var(--paper);
      background: var(--retro-red);
      padding: 3px 10px;
      border: 2px solid var(--ink);
      text-transform: uppercase;
    }
    .score-tbd {
      font-family: var(--font-var);
      font-size: 36px;
      color: var(--dim);
      opacity: 0.5;
    }


    /* ─── Editor de marcador ─── */
    .editor-section {
      padding: 14px 16px 16px;
      border-top: 2px solid var(--ink);
      background: var(--paper-3);
    }
    .editor-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .editor-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .editor-stack {
      display: grid;
      gap: 14px;
    }

    .penalties-block {
      display: grid;
      gap: 10px;
      padding-top: 12px;
      border-top: 2px dashed var(--ink);
      margin-top: 12px;
    }

    .penalties-title {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .penalties-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .penalties-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      color: var(--paper);
      background: var(--ink);
      border: 2px solid var(--ink);
      padding: 3px 8px;
      text-transform: uppercase;
    }

    /* Score input retro — botones ink + display Bowlby */
    .score-input {
      display: inline-flex;
      align-items: stretch;
      border: 3px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 3px 3px 0 0 var(--retro-orange);
    }
    .score-input button {
      all: unset;
      cursor: pointer;
      padding: 5px 12px;
      font-family: var(--font-var);
      font-size: 18px;
      color: var(--paper);
      background: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .score-input button:hover { background: var(--retro-red); }
    .score-input button:active { background: var(--retro-orange); }
    .score-display {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1;
      padding: 4px 16px;
      min-width: 28px;
      text-align: center;
      align-self: center;
      color: var(--ink);
    }

    .vs-sep {
      font-family: var(--font-var);
      font-size: 22px;
      color: var(--dim);
    }

    /* Aviso empate en knockout */
    .warn {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--paper);
      background: var(--retro-red);
      border: 2px solid var(--ink);
      padding: 4px 10px;
      letter-spacing: 0.08em;
      margin-top: 10px;
      min-height: 1.6em;
      display: inline-block;
    }
    .warn:empty { display: none; }

    /* Footer de acciones */
    .modal-footer {
      display: flex;
      gap: 10px;
      padding: 0 16px 16px;
      background: var(--paper);
    }
    .modal-footer .btn { flex: 1; }
    .limpiar-btn {
      flex: 0;
      min-width: 90px;
      margin-left: auto;
    }
    .btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none;
      box-shadow: var(--shadow-hard-sm);
    }

    @media (max-width: 768px) {
      :host {
        align-items: center;
        padding: 10px;
      }
      .modal {
        max-height: calc(100dvh - 20px);
      }
      .ticket-header {
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px 12px;
      }
      .ticket-info {
        white-space: normal;
        font-size: 10px;
      }
      .showdown {
        grid-template-columns: 1fr;
        gap: 8px;
        margin: 8px;
        padding: 12px 8px;
        border-width: 3px;
      }
      .sticker-side-left,
      .sticker-side-right {
        justify-content: center;
      }
      .sticker.left,
      .sticker.right {
        transform: none;
      }
      .sticker {
        min-width: 0;
        padding: 6px;
        border-width: 2px;
        box-shadow: 2px 2px 0 0 var(--ink);
      }
      .sticker-flag { font-size: 32px; }
      .flag-img-big {
        width: 44px;
        height: 30px;
        border-width: 2px;
        box-shadow: 1px 1px 0 0 var(--ink);
      }
      .sticker-name {
        font-size: 10px;
        margin-top: 4px;
        letter-spacing: 0;
      }
      .score-big { font-size: 44px; gap: 8px; }
      .score-sep { font-size: 24px; }
      .score-tbd { font-size: 24px; }
      .editor-section { padding: 12px 10px 12px; }
      .editor-row,
      .penalties-row {
        gap: 10px;
      }
      .score-input {
        flex: 1 1 120px;
        justify-content: space-between;
      }
      .score-input button {
        padding: 10px 16px;
        min-width: 48px;
        min-height: 48px;
        font-size: 22px;
      }
      .score-display {
        padding: 8px 12px;
      }
      .modal-footer {
        padding: 0 10px calc(12px + env(safe-area-inset-bottom));
        flex-direction: column-reverse;
        position: sticky;
        bottom: 0;
      }
      .modal-footer .btn,
      .limpiar-btn {
        width: 100%;
        margin-left: 0;
      }
    }
  `];

  private renderFlag(team?: any, size: 'small' | 'big' = 'small') {
    if (!team) return '';
    if (team.flagUrl) {
      return html`<img src="${team.flagUrl}" alt="${team.name}" class="${size === 'big' ? 'flag-img-big' : 'flag-img'}">`;
    }
    return html`<span class="sticker-flag">${team.flag}</span>`;
  }

  private getPenaltyBadgeText() {
    if (this._penaltyScoreA === null || this._penaltyScoreB === null) {
      return t('modal.finalTime');
    }
    return t('modal.penScore', { a: this._penaltyScoreA, b: this._penaltyScoreB });
  }

  render() {
    const tA = TEAMS_2026.find(t => t.id === this.teamA);
    const tB = TEAMS_2026.find(t => t.id === this.teamB);
    const hasCompleteScore = this._scoreA !== null && this._scoreB !== null;
    const penaltiesVisible = this.phase === 'knockout'
      && hasCompleteScore
      && (this._scoreA === this._scoreB || this._penaltyScoreA !== null || this._penaltyScoreB !== null);
    const hasCompletePenalties = this._penaltyScoreA !== null && this._penaltyScoreB !== null;
    const isDraw = this.phase === 'knockout'
      && hasCompleteScore
      && this._scoreA === this._scoreB;
    const penaltiesAreValid = !isDraw || (hasCompletePenalties && this._penaltyScoreA !== this._penaltyScoreB);
    const canSave = hasCompleteScore && penaltiesAreValid;
    const groupLetter = tA?.group ?? '?';
    const phaseLabel = this.phase === 'group'
      ? t('modal.phaseGroup', { letter: groupLetter })
      : t('modal.phaseKnockout');
    const scoreBadgeText = this.getPenaltyBadgeText();

    return html`
      <div class="modal" @click="${(e: MouseEvent) => e.stopPropagation()}">

        <!-- Ticket header -->
        <div class="ticket-header">
          <span class="ticket-label">${t('modal.ticket')}</span>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${this.stadiumImage ? html`<img src="${this.stadiumImage}" style="width: 40px; height: 25px; object-fit: cover; border: 1px solid var(--ink); box-shadow: 2px 2px 0 0 var(--ink);" alt="${t('modal.stadium')}">` : ''}
            <span class="ticket-info">№ ${this.matchId} · ${this.city} · ${this.venue} · ${this.timeSpain ? html`<span style="color: var(--retro-yellow)">${this.timeSpain} ${t('modal.timeLabel')}</span>` : ''}</span>
          </div>
          <span class="ticket-group">${phaseLabel}</span>
          ${(() => {
            const info = getBroadcastInfo(this.matchId, this.teamA, this.teamB);
            if (info === 'BOTH') {
              return html`<span class="ticket-broadcast">RTVE + DAZN</span>`;
            }
            return html`<span class="ticket-broadcast exclusive">DAZN</span>`;
          })()}
          <button class="ticket-close" @click="${this.close}" aria-label="${t('modal.close')}">✕</button>
        </div>

        <!-- Showdown grande con stickers -->
        <div class="showdown">
          <div class="sticker-side-left">
            <div class="sticker left">
              ${this.renderFlag(tA, 'big')}
              <span class="sticker-name">${tA?.shortName ?? this.teamA}</span>
            </div>
          </div>

          <div class="score-center">
            ${this._scoreA !== null && this._scoreB !== null
              ? html`
                <div class="score-big">
                  <span>${this._scoreA}</span>
                  <span class="score-sep">×</span>
                  <span>${this._scoreB}</span>
                </div>
                <span class="score-final-badge">${scoreBadgeText}</span>
              `
              : html`<div class="score-tbd">vs</div>`
            }
          </div>

          <div class="sticker-side-right">
            <div class="sticker right">
              ${this.renderFlag(tB, 'big')}
              <span class="sticker-name">${tB?.shortName ?? this.teamB}</span>
            </div>
          </div>
        </div>


        <!-- Editor de marcador -->
        <div class="editor-section">
          <div class="editor-label">${t('modal.editScore')}</div>
          <div class="editor-stack">
            <div class="editor-row">
              <div class="score-input">
                <button
                  class="score-add-a"
                  @click="${() => this.adjustScore('A', -1)}"
                  aria-label="${t('modal.subtractGoal', { team: tA?.shortName ?? '' })}">−</button>
                <span class="score-display" aria-live="polite">${this._scoreA ?? '-'}</span>
                <button
                  @click="${() => this.adjustScore('A', 1)}"
                  aria-label="${t('modal.addGoal', { team: tA?.shortName ?? '' })}">+</button>
              </div>

              <span class="vs-sep">×</span>

              <div class="score-input">
                <button
                  @click="${() => this.adjustScore('B', -1)}"
                  aria-label="${t('modal.subtractGoal', { team: tB?.shortName ?? '' })}">−</button>
                <span class="score-display" aria-live="polite">${this._scoreB ?? '-'}</span>
                <button
                  @click="${() => this.adjustScore('B', 1)}"
                  aria-label="${t('modal.addGoal', { team: tB?.shortName ?? '' })}">+</button>
              </div>

              <button class="btn btn-danger limpiar-btn" @click="${this.clear}">${t('modal.clear')}</button>
            </div>

            ${penaltiesVisible ? html`
              <div class="penalties-block">
                <div class="penalties-title">${t('modal.penalties')}</div>
                <div class="penalties-row">
                  <div class="score-input">
                    <button
                      @click="${() => this.adjustPenalty('A', -1)}"
                      aria-label="${t('modal.subtractPen', { team: tA?.shortName ?? '' })}">−</button>
                    <span class="score-display" aria-live="polite">${this._penaltyScoreA ?? '-'}</span>
                    <button
                      @click="${() => this.adjustPenalty('A', 1)}"
                      aria-label="${t('modal.addPen', { team: tA?.shortName ?? '' })}">+</button>
                  </div>

                  <span class="penalties-badge">Pen</span>

                  <div class="score-input">
                    <button
                      @click="${() => this.adjustPenalty('B', -1)}"
                      aria-label="${t('modal.subtractPen', { team: tB?.shortName ?? '' })}">−</button>
                    <span class="score-display" aria-live="polite">${this._penaltyScoreB ?? '-'}</span>
                    <button
                      @click="${() => this.adjustPenalty('B', 1)}"
                      aria-label="${t('modal.addPen', { team: tB?.shortName ?? '' })}">+</button>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>

          ${isDraw
            ? html`<div class="warn">${t('modal.penRequired')}</div>`
            : ''
          }
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="${this.close}">${t('modal.cancel')}</button>
          <button
            class="btn btn-primary"
            ?disabled="${!canSave}"
            @click="${this.save}">${t('modal.save')}</button>
        </div>
      </div>
    `;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { TEAMS_2026 } from '../data/fifa-2026';
import { t, useLocaleStore } from '../i18n';
import { getBroadcastInfo } from '../lib/broadcasting';
import { retroButton } from '../styles/retro-button';
import { getOddsForMatch, type MatchOdds } from '../lib/odds-service';
import { showToast, lightTap, mediumTap } from '../lib/interaction';


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
  @state() private _odds: MatchOdds | null = null;

  get scoreA() { return this._scoreA; }
  get scoreB() { return this._scoreB; }

  protected override updated(changedProps: PropertyValues) {
    if (changedProps.has('initialScoreA')) this._scoreA = this.initialScoreA;
    if (changedProps.has('initialScoreB')) this._scoreB = this.initialScoreB;
    if (changedProps.has('initialPenaltyScoreA')) this._penaltyScoreA = this.initialPenaltyScoreA;
    if (changedProps.has('initialPenaltyScoreB')) this._penaltyScoreB = this.initialPenaltyScoreB;
    if (changedProps.has('matchId') || changedProps.has('teamA') || changedProps.has('teamB')) {
      if (this.matchId && this.teamA && this.teamB) {
        getOddsForMatch(this.matchId, this.teamA, this.teamB).then(o => {
          if (this.isConnected) this._odds = o;
        });
      }
    }
  }

  override firstUpdated() {
    this._addDragListeners();
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
  private _startTime = 0;
  private _isDragging = false;
  private _dragEl: HTMLElement | null = null;

  private readonly _handleTouchStart = (e: TouchEvent) => {
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (!modal || modal.scrollTop > 5) return;
    this._dragEl = modal;
    this._startY = e.touches[0].clientY;
    this._currentY = this._startY;
    this._startTime = Date.now();
    this._isDragging = true;
    this._dragEl.style.transition = 'none';
  };

  private readonly _handleTouchMove = (e: TouchEvent) => {
    if (!this._isDragging || !this._dragEl) return;
    this._currentY = e.touches[0].clientY;
    const deltaY = this._currentY - this._startY;
    if (deltaY > 0) {
      if (e.cancelable) e.preventDefault();
      this._dragEl.style.transform = `translateY(${deltaY}px)`;
      const progress = Math.min(deltaY / 200, 1);
      this.style.background = `rgba(26,25,51,${0.65 * (1 - progress)})`;
    } else {
      this._isDragging = false;
    }
  };

  private readonly _handleTouchEnd = () => {
    if (!this._isDragging || !this._dragEl) return;
    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const velocity = deltaY / Math.max(Date.now() - this._startTime, 1);
    const modal = this._dragEl;
    this._dragEl = null;

    modal.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';

    if (deltaY > 100 || velocity > 0.5) {
      modal.style.transform = `translateY(110vh)`;
      this.style.background = 'rgba(26,25,51,0)';
      this.style.transition = 'background 0.25s ease';
      setTimeout(() => this.close(), 250);
    } else {
      modal.style.transform = '';
      this.style.background = '';
      modal.addEventListener('transitionend', () => {
        modal.style.transition = '';
      }, { once: true });
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
    this._unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    this._removeDragListeners();
    this._unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private _addDragListeners() {
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (!modal) return;
    modal.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    modal.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    modal.addEventListener('touchend', this._handleTouchEnd);
    modal.addEventListener('touchcancel', this._handleTouchEnd);
  }

  private _removeDragListeners() {
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (!modal) return;
    modal.removeEventListener('touchstart', this._handleTouchStart);
    modal.removeEventListener('touchmove', this._handleTouchMove);
    modal.removeEventListener('touchend', this._handleTouchEnd);
    modal.removeEventListener('touchcancel', this._handleTouchEnd);
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
    showToast(t('modal.cleared'));
    lightTap();
  }

  private adjustScore(team: 'A' | 'B', delta: number) {
    lightTap();
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

    this._popScoreElement(team);
  }

  private adjustPenalty(team: 'A' | 'B', delta: number) {
    lightTap();
    const nextPenaltyA = team === 'A'
      ? Math.max(0, (this._penaltyScoreA ?? 0) + delta)
      : (this._penaltyScoreA ?? 0);
    const nextPenaltyB = team === 'B'
      ? Math.max(0, (this._penaltyScoreB ?? 0) + delta)
      : (this._penaltyScoreB ?? 0);

    this._penaltyScoreA = nextPenaltyA;
    this._penaltyScoreB = nextPenaltyB;

    this._popScoreElement(team, true);
  }

  private _popScoreElement(team: 'A' | 'B', penalty = false) {
    this.updateComplete.then(() => {
      const sel = penalty ? '.penalties-block' : '.editor-row';
      const row = this.shadowRoot?.querySelector(sel);
      const displays = row?.querySelectorAll<HTMLElement>('.score-display');
      if (!displays) return;
      const el = team === 'A' ? displays[0] : displays[1];
      if (!el) return;
      el.classList.remove('pop');
      requestAnimationFrame(() => {
        el.classList.add('pop');
        el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
      });
    });
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
    showToast(t('modal.saved'));
    mediumTap();
    requestAnimationFrame(() => this.close());
  }

  static readonly styles = [retroButton, css`
    /* ─── Backdrop ─── */
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
      animation: mmFadeIn 0.2s ease both;
    }
    @keyframes mmFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ─── Modal panel ─── */
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

    /* ─── Drag handle (mobile) ─── */
    .drag-handle {
      display: none;
      width: 40px;
      height: 5px;
      background: var(--dim);
      opacity: 0.45;
      border-radius: 0;
      margin: 8px auto 4px;
      flex-shrink: 0;
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
      font-size: 20px;
      line-height: 1;
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
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
    .score-display.pop {
      animation: scorePop 0.15s ease both;
    }
    @keyframes scorePop {
      0%   { transform: scale(1); }
      50%  { transform: scale(1.2); }
      100% { transform: scale(1); }
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

    /* Barra de probabilidad 1X2 */
    .odds-block {
      padding: 10px 16px 0;
    }
    .odds-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .odds-label .odds-src {
      font-size: 7px;
      opacity: 0.7;
    }
    .odds-legend {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--dim);
      margin-bottom: 2px;
    }
    .odds-legend .odds-home { color: var(--retro-blue); }
    .odds-legend .odds-away { color: var(--retro-red); }
    .odds-bar {
      display: flex;
      height: 8px;
      border: 2px solid var(--ink);
      overflow: hidden;
    }
    .odds-seg { height: 100%; }
    .odds-figs {
      display: flex;
      justify-content: space-between;
      margin-top: 3px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
    }
    .odds-figs .odds-home { color: var(--retro-blue); font-weight: 700; }
    .odds-figs .odds-away { color: var(--retro-red); font-weight: 700; }

    @media (max-width: 768px) {
      :host {
        align-items: flex-end;
        padding: 0;
        background: rgba(26, 25, 51, 0.65);
        animation: mmFadeIn 0.22s ease both;
      }
      @keyframes mmSlideUp {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }
      .modal {
        max-height: calc(90dvh);
        max-width: 100%;
        border-width: 3px;
        border-bottom: none;
        animation: mmSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
        will-change: transform;
      }
      .drag-handle {
        display: block;
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
      .ticket-close {
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        font-size: 22px;
      }
      .showdown {
        grid-template-columns: 1fr;
        gap: 6px;
        margin: 0;
        padding: 14px 10px;
        border-width: 3px;
        border-left: none;
        border-right: none;
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
        padding: 8px 10px;
        border-width: 2px;
        box-shadow: 2px 2px 0 0 var(--ink);
      }
      .sticker-flag { font-size: 32px; }
      .flag-img-big {
        width: 56px;
        height: 37px;
        border-width: 2px;
        box-shadow: 1px 1px 0 0 var(--ink);
      }
      .sticker-name {
        font-size: 11px;
        margin-top: 4px;
        letter-spacing: 0;
      }
      .score-big { font-size: 48px; gap: 8px; }
      .score-sep { font-size: 26px; }
      .score-tbd { font-size: 24px; }
      .score-final-badge { font-size: 9px; padding: 3px 8px; }
      .editor-section {
        padding: 14px 10px 12px;
        border-top-width: 2px;
      }
      .editor-label {
        margin-bottom: 8px;
      }
      .editor-row,
      .penalties-row {
        gap: 10px;
      }
      .score-input {
        flex: 1 1 0;
        min-width: 0;
        justify-content: space-between;
      }
      .score-input button {
        padding: 6px 14px;
        min-width: 48px;
        min-height: 48px;
        font-size: 18px;
      }
      .score-display {
        font-size: 22px;
        padding: 4px 12px;
        min-width: 28px;
      }
      .vs-sep {
        font-size: 20px;
        flex-shrink: 0;
      }
      .penalties-block {
        padding-top: 10px;
        margin-top: 10px;
        gap: 8px;
      }
      .penalties-badge {
        font-size: 9px;
        padding: 4px 8px;
        flex-shrink: 0;
      }
      .modal-footer {
        position: sticky;
        bottom: 0;
        padding: 0 10px calc(16px + env(safe-area-inset-bottom));
        flex-direction: column-reverse;
        gap: 8px;
        z-index: 1;
      }
      .modal-footer .btn {
        width: 100%;
        min-height: 52px;
        font-size: 15px;
      }
      .modal-footer .btn.btn-primary {
        order: -1;
      }
      .limpiar-btn {
        width: auto;
        min-width: 60px;
        min-height: 48px;
        margin-left: 0;
        font-size: 11px;
        padding: 4px 12px;
      }
      .odds-block {
        padding: 10px 10px 0;
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
        <div class="drag-handle"></div>

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


        <!-- Barra 1X2 -->
        ${this._odds ? html`
          <div class="odds-block">
            <div class="odds-label">
              Probabilidad 1X2
              <span class="odds-src">${this._odds.source === 'market'
                ? `(${this._odds.bookmakers} casas)`
                : '(estimado)'}</span>
            </div>
            <div class="odds-legend">
              <span class="odds-home">1</span>
              <span>X</span>
              <span class="odds-away">2</span>
            </div>
            <div class="odds-bar">
              <div class="odds-seg" style="width:${this._odds.home}%;background:var(--retro-blue)"></div>
              <div class="odds-seg" style="width:${this._odds.draw}%;background:var(--dim)"></div>
              <div class="odds-seg" style="width:${this._odds.away}%;background:var(--retro-red)"></div>
            </div>
            <div class="odds-figs">
              <span class="odds-home">${this._odds.home}%</span>
              <span>${this._odds.draw}%</span>
              <span class="odds-away">${this._odds.away}%</span>
            </div>
          </div>
        ` : ''}

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

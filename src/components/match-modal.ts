import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { DragToDismissMixin } from '../mixins/drag-to-dismiss';
import type { PropertyValues } from 'lit';
import { TEAMS_2026 } from '../data/fifa-2026';
import { t, useLocaleStore } from '../i18n';
import { getBroadcastInfo } from '../lib/broadcasting';
import { renderFlag } from '../lib/render-flag';
import { retroButton } from '../styles/retro-button';
import { getOddsForMatch, type MatchOdds } from '../lib/odds-service';
import { getLineup, getSquad } from '../data/squads';
import { COACHES } from '../data/coaches';
import { getPreview, type Preview } from '../data/previews';
import { showToast, lightTap, mediumTap } from '../lib/interaction';
import type { GoalEvent } from '../types';
import './odds-bar';


@customElement('match-modal')
export class MatchModal extends DragToDismissMixin(LitElement) {
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
  @property({ type: Boolean }) hideFooter = false;
  @property({ attribute: false }) goalScorers: GoalEvent[] | undefined;

  @state() private _scoreA: number | null = null;
  @state() private _scoreB: number | null = null;
  @state() private _penaltyScoreA: number | null = null;
  @state() private _penaltyScoreB: number | null = null;
  @state() private _odds: MatchOdds | null = null;
  @state() private _preview: Preview | null = null;
  @state() private _chronicleOpen = false;
  @state() private _infoTab: 'preview' | 'lineups' | 'edit' = 'preview';
  @state() private _confirmClose = false;

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
    if (changedProps.has('matchId')) {
      this._preview = getPreview(this.matchId);
      this._chronicleOpen = false;
      this._infoTab = 'preview';
      this._confirmClose = false;
    }
  }

  override firstUpdated() {
    const addBtn = this.shadowRoot?.querySelector<HTMLButtonElement>('.score-add-a');
    addBtn?.focus({ preventScroll: true });
  }

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this._confirmClose) {
        this._confirmClose = false;
        return;
      }
      this.close();
    }
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
  _dragThreshold = 100;

  override _getDragTarget(): HTMLElement | null {
    return this.shadowRoot?.querySelector('.modal') as HTMLElement | null;
  }

  override _getDragAnimateTarget(): HTMLElement | null {
    return this._getDragTarget();
  }

  override _dragCanStart(target: HTMLElement): boolean {
    const body = this.shadowRoot?.querySelector('.modal-body') as HTMLElement;
    return (body ?? target).scrollTop <= 5;
  }

  override _onDragMove(deltaY: number): void {
    const progress = Math.min(deltaY / 200, 1);
    this.style.background = `rgba(26,25,51,${0.65 * (1 - progress)})`;
  }

  override _onDragEnd(deltaY: number, elapsed: number): boolean | void {
    const velocity = deltaY / Math.max(elapsed, 1);
    if (deltaY > 100 || velocity > 0.5) {
      const modal = this._getDragAnimateTarget();
      if (modal) {
        modal.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
        modal.style.transform = `translateY(110vh)`;
      }
      this.style.background = 'rgba(26,25,51,0)';
      this.style.transition = 'background 0.25s ease';
      setTimeout(() => this.close(), 250);
      return true;
    }
    return false;
  }

  _dragDismiss(): void {
    this.close();
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
    this._unsubscribeLocale = useLocaleStore.subscribe(() => {
      this._preview = getPreview(this.matchId);
      this.requestUpdate();
    });
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    this._unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private close() {
    if (this._hasUnsavedChanges()) {
      this._confirmClose = true;
      return;
    }
    this._dispatchClose();
  }

  private _hasUnsavedChanges(): boolean {
    const scoreChanged = this._scoreA !== this.initialScoreA || this._scoreB !== this.initialScoreB;
    const penaltyChanged = this._penaltyScoreA !== this.initialPenaltyScoreA || this._penaltyScoreB !== this.initialPenaltyScoreB;
    return scoreChanged || penaltyChanged;
  }

  private _dispatchClose() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _discardAndClose() {
    // Auto-save current state to not lose the edit
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
    requestAnimationFrame(() => this._dispatchClose());
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
    this._confirmClose = false;
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
    this._confirmClose = false;
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

    /* Confirmación cambios sin guardar */
    .confirm-bar {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      padding: 12px;
      border: 2px solid var(--retro-yellow);
      background: var(--paper-2);
    }
    .confirm-msg {
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.04em;
      color: var(--ink);
    }
    .confirm-hint {
      font-family: var(--font-body);
      font-size: 11px;
      color: var(--dim);
      line-height: 1.4;
    }
    .confirm-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .confirm-actions .btn {
      flex: 1;
      font-size: 0.75rem;
    }
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
      .cronica-block { padding: 14px 12px 16px; }
      .cronica-text { font-size: 13px; }
      .prob-block { padding: 12px 12px 14px; }
      .prob-bar-large { height: 30px; }
      .prob-seg-large { font-size: 12px; }
      .pitch-block { padding: 12px 12px 16px; }
      .pitch-field { height: 320px; }
      .player-circle { width: 22px; height: 22px; font-size: 10px; }
      .player-label { font-size: 7px; max-width: 55px; }
      .pitch-dt { font-size: 8px; padding: 3px 5px; }
    }

    /* ─── Modal body scrollable ─── */
    .modal-body {
      flex: 1;
      overflow-y: auto;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }

    /* ─── Info tabs ─── */
    .info-tab-bar {
      display: flex;
      gap: 4px;
      padding: 8px 10px;
      border-top: 2px solid var(--ink);
      border-bottom: 2px solid var(--ink);
      background: var(--paper-2);
    }
    .info-tab-btn {
      all: unset;
      cursor: pointer;
      flex: 1;
      text-align: center;
      padding: 8px 4px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      color: var(--dim);
      border-bottom: 3px solid transparent;
      text-transform: uppercase;
      touch-action: manipulation;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info-tab-btn.active {
      color: var(--ink);
      border-bottom-color: var(--retro-orange);
      font-weight: 700;
      background: var(--paper);
    }
    .info-tab-content {
      display: none;
    }
    .info-tab-content.active {
      display: block;
    }

    /* ─── V2-Cancha: Section labels ─── */
    .section-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .section-num {
      font-family: var(--font-var);
      font-size: 11px;
      padding: 3px 7px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      letter-spacing: 0.08em;
      color: var(--paper-3);
      flex-shrink: 0;
    }
    .section-title {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.18em;
      color: var(--ink);
      font-weight: 700;
      white-space: nowrap;
    }
    .section-rule {
      flex: 1;
      height: 0;
      border-top: 1.5px dashed rgba(26, 25, 51, 0.35);
    }

    /* ─── V2-Cancha: Crónica ─── */
    .cronica-block {
      padding: 18px 20px 16px;
      border-top: 2px solid var(--ink);
      background: var(--paper-3);
    }
    .cronica-text {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.55;
      color: var(--ink);
      margin: 8px 0 8px;
    }
    .cronica-link {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--retro-blue);
      font-weight: 700;
      text-decoration: underline;
    }
    .cronica-headline {
      font-family: var(--font-display);
      font-size: 12px;
      color: var(--retro-blue);
      margin-left: 6px;
      text-transform: uppercase;
    }
    .cronica-full {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed var(--ink);
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.6;
    }
    .cronica-full p { margin: 0 0 10px; }
    .cronica-full strong { color: var(--retro-red); }
    .cronica-full ul { padding-left: 20px; }

    /* ─── V2-Cancha: Probabilidades expandidas ─── */
    .prob-block {
      padding: 14px 20px 16px;
      border-top: 2px solid var(--ink);
      background: var(--paper);
    }
    .prob-bar-large {
      display: flex;
      height: 36px;
      border: 2.5px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      margin-top: 10px;
      overflow: hidden;
    }
    .prob-seg-large {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-head);
      font-size: 14px;
      color: var(--ink);
      border-right: 2px solid var(--ink);
      min-width: 0;
      overflow: hidden;
    }
    .prob-seg-large:last-child { border-right: none; }
    .prob-legend-large {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.1em;
      margin-top: 5px;
      font-weight: 700;
    }

    /* ─── V2-Cancha: Cancha con formaciones ─── */
    .pitch-block {
      padding: 14px 20px 20px;
      border-top: 2px solid var(--ink);
      background: var(--paper);
    }
    .pitch-field {
      position: relative;
      background: #1f6b3a;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      height: 440px;
      overflow: hidden;
      margin-top: 10px;
    }
    .pitch-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .player-layer {
      position: absolute;
      left: 0; right: 0;
      height: 50%;
      pointer-events: none;
    }
    .player-layer.top { top: 0; }
    .player-layer.bottom { top: 50%; }
    .player-pin {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      transform: translate(-50%, -50%);
    }
    .player-circle {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2.5px solid var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 12px;
      line-height: 1;
      box-shadow: 2px 2px 0 0 var(--ink);
      color: var(--ink);
      flex-shrink: 0;
    }
    .player-label {
      font-family: var(--font-mono);
      font-size: 8px;
      color: #fff;
      background: rgba(26, 25, 51, 0.88);
      padding: 1px 4px;
      white-space: nowrap;
      font-weight: 700;
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pitch-dt {
      position: absolute;
      background: var(--paper-3);
      color: var(--ink);
      padding: 4px 7px;
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.07em;
      font-weight: 700;
      z-index: 2;
      white-space: nowrap;
    }
    .pitch-dt.home { top: 7px; left: 7px; }
    .pitch-dt.away { bottom: 7px; right: 7px; }

    /* ─── Goleadores ─── */
    .scorers-block {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px 0;
      gap: 20px;
    }
    .scorers-side {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .scorers-side.left { align-items: flex-end; text-align: right; }
    .scorers-side.right { align-items: flex-start; text-align: left; }
    .scorer-item {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .scorer-name { font-weight: 700; }
    .scorer-min { color: var(--dim); font-size: 10px; }
    .scorer-pen { color: var(--retro-red); font-size: 9px; font-weight: 700; }
    .scorers-divider { width: 1px; background: rgba(26,25,51,0.15); }
  `];

  // ─── V2-Cancha helpers ────────────────────────────────────────────

  private _getFormationPositions(formation: string): { x: number; y: number }[] {
    const parts = formation.split('-').map(Number).filter(n => !Number.isNaN(n) && n > 0);
    if (parts.length === 0) return [];
    const rows = [1, ...parts];
    const fieldRowCount = parts.length;
    const positions: { x: number; y: number }[] = [];
    rows.forEach((count, rowIdx) => {
      const y = rowIdx === 0 ? 7 : 22 + ((rowIdx - 1) / Math.max(1, fieldRowCount - 1)) * 66;
      for (let i = 0; i < count; i++) {
        const x = count === 1 ? 50 : ((i + 1) / (count + 1)) * 100;
        positions.push({ x, y });
      }
    });
    return positions;
  }

  private _buildPitchPlayers(teamId: string): { n: number; name: string; x: number; y: number }[] {
    const lineup = getLineup(teamId);
    const squad = getSquad(teamId);
    if (!lineup || squad.length === 0) return [];
    const positions = this._getFormationPositions(lineup.formation);
    return lineup.startingXI.slice(0, 11).map((num, i) => {
      const player = squad.find(p => p.number === num);
      const pos = positions[i] ?? { x: 50, y: 50 };
      return { n: num, name: player?.name ?? `#${num}`, x: pos.x, y: pos.y };
    });
  }

  private _shortPlayerName(name: string): string {
    const parts = name.split(' ');
    if (parts.length <= 1) return name;
    const last = parts.at(-1) ?? name;
    return last.length > 10 ? last.substring(0, 9) + '.' : last;
  }

  private _generatePreview(teamAName: string, teamBName: string, coachAName: string | undefined, coachBName: string | undefined): string {
    const group = TEAMS_2026.find(t => t.name === teamAName)?.group;
    let text = group
      ? t('modal.previewIntroGroup', { teamA: teamAName, teamB: teamBName, group })
      : t('modal.previewIntroNoGroup', { teamA: teamAName, teamB: teamBName });
    if (this.venue) text += t('modal.previewVenueSuffix', { venue: this.venue });
    text += '. ';
    if (coachAName) text += `${t('modal.previewCoachA', { coach: coachAName })} `;
    if (coachBName) text += t('modal.previewCoachB', { team: teamBName, coach: coachBName });
    return text;
  }

  private _renderFieldSvg() {
    return html`
      <svg class="pitch-svg" viewBox="0 0 400 440" preserveAspectRatio="none">
        <rect x="5" y="5" width="390" height="430" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <line x1="5" y1="220" x2="395" y2="220" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <circle cx="200" cy="220" r="40" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <circle cx="200" cy="220" r="3" fill="rgba(255,255,255,0.4)"/>
        <rect x="120" y="5" width="160" height="52" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <rect x="158" y="5" width="84" height="18" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <circle cx="200" cy="48" r="2.5" fill="rgba(255,255,255,0.4)"/>
        <rect x="120" y="383" width="160" height="52" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <rect x="158" y="417" width="84" height="18" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
        <circle cx="200" cy="392" r="2.5" fill="rgba(255,255,255,0.4)"/>
      </svg>
    `;
  }

  private _renderGoalScorers(_tA: ReturnType<typeof TEAMS_2026.find>, _tB: ReturnType<typeof TEAMS_2026.find>) {
    if (!this.goalScorers || this.goalScorers.length === 0) return '';
    const homeScorers = this.goalScorers.filter(g => g.teamId === this.teamA);
    const awayScorers = this.goalScorers.filter(g => g.teamId === this.teamB);
    return html`
      <div class="scorers-block">
        <div class="scorers-side left">
          ${homeScorers.map(g => html`
            <span class="scorer-item">
              <span class="scorer-name">${g.playerName}</span>
              <span class="scorer-min">${g.minute}'</span>
              ${g.type === 'penalty' ? html`<span class="scorer-pen">${t('modal.penaltyMark')}</span>` : ''}
            </span>
          `)}
        </div>
        <div class="scorers-divider"></div>
        <div class="scorers-side right">
          ${awayScorers.map(g => html`
            <span class="scorer-item">
              <span class="scorer-name">${g.playerName}</span>
              <span class="scorer-min">${g.minute}'</span>
              ${g.type === 'penalty' ? html`<span class="scorer-pen">${t('modal.penaltyMark')}</span>` : ''}
            </span>
          `)}
        </div>
      </div>
    `;
  }

  private _renderCronica(tA: ReturnType<typeof TEAMS_2026.find>, tB: ReturnType<typeof TEAMS_2026.find>) {
    if (!tA || !tB) return '';
    const text = this._preview?.previewText
      ?? this._generatePreview(tA.name, tB.name, COACHES[this.teamA]?.name, COACHES[this.teamB]?.name);
    const hasChronicle = !!this._preview?.chronicleHtml;
    const chronicleToggleLabel = this._chronicleOpen ? t('modal.hideChronicle') : t('modal.readChronicle');
    const chronicleContent = this._chronicleOpen
      ? html`<div class="cronica-full" .innerHTML="${this._preview!.chronicleHtml}"></div>`
      : '';
    return html`
      <div class="cronica-block">
        <div class="section-label">
          <span class="section-num" style="background:var(--retro-blue)">01</span>
          <span class="section-title">${t('modal.previewSection')}</span>
          ${this._preview?.title ? html`<span class="cronica-headline">${this._preview.title}</span>` : ''}
          <div class="section-rule"></div>
        </div>
        <p class="cronica-text">${text}</p>
        ${hasChronicle ? html`
          <button class="cronica-link" @click="${() => { this._chronicleOpen = !this._chronicleOpen; }}">
            ${chronicleToggleLabel}
          </button>
          ${chronicleContent}
        ` : ''}
      </div>
    `;
  }

  private _renderProbBlock(tA: ReturnType<typeof TEAMS_2026.find>, tB: ReturnType<typeof TEAMS_2026.find>) {
    if (!this._odds || !tA || !tB) return '';
    const { home, draw, away } = this._odds;
    return html`
      <div class="prob-block">
        <div class="section-label">
          <span class="section-num" style="background:var(--retro-orange)">02</span>
          <span class="section-title">${t('modal.probabilitiesSection')}</span>
          <span style="font-family:var(--font-mono);font-size:8px;color:var(--dim);margin-left:4px">
            ${this._odds.source === 'market'
              ? t('modal.oddsBookmakers', { n: String(this._odds.bookmakers) })
              : t('modal.oddsEstimate')}
          </span>
          <div class="section-rule"></div>
        </div>
        <odds-bar
          .home=${home}
          .draw=${draw}
          .away=${away}
          variant="large"
          .showLegend=${true}
          .showFigures=${false}
          .inBarValues=${true}
          homeLabel=${t('modal.oddsHomeLabel', { team: tA.shortName })}
          drawLabel=${t('modal.oddsDrawLabel')}
          awayLabel=${t('modal.oddsAwayLabel', { team: tB.shortName })}></odds-bar>
      </div>
    `;
  }

  private _renderPitchBlock(tA: ReturnType<typeof TEAMS_2026.find>, tB: ReturnType<typeof TEAMS_2026.find>) {
    if (!tA || !tB) return '';
    const homePlayers = this._buildPitchPlayers(this.teamA);
    const awayPlayers = this._buildPitchPlayers(this.teamB);
    if (homePlayers.length === 0 && awayPlayers.length === 0) return '';
    const homeLineup = getLineup(this.teamA);
    const awayLineup = getLineup(this.teamB);
    const homeCoach = COACHES[this.teamA];
    const awayCoach = COACHES[this.teamB];
    const homeFormation = homeLineup?.formation ?? '';
    const awayFormation = awayLineup?.formation ?? '';
    const homeCoachSuffix = homeCoach ? ` · ${homeCoach.name}` : '';
    const awayCoachSuffix = awayCoach ? ` · ${awayCoach.name}` : '';
    return html`
      <div class="pitch-block">
        <div class="section-label">
          <span class="section-num" style="background:var(--retro-green)">03</span>
          <span class="section-title">${t('modal.lineupsSection')}</span>
          <div class="section-rule"></div>
        </div>
        <div class="pitch-field">
          ${this._renderFieldSvg()}

          <!-- Local (top) -->
          <div class="player-layer top">
            ${homePlayers.map(p => html`
              <div class="player-pin" style="left:${p.x}%;top:${p.y}%">
                <div class="player-circle" style="background:#fff9ec">${p.n}</div>
                <div class="player-label">${this._shortPlayerName(p.name)}</div>
              </div>
            `)}
          </div>

          <!-- Visitante (bottom, invertido) -->
          <div class="player-layer bottom">
            ${awayPlayers.map(p => html`
              <div class="player-pin" style="left:${p.x}%;top:${100 - p.y}%">
                <div class="player-circle" style="background:#f0b021">${p.n}</div>
                <div class="player-label">${this._shortPlayerName(p.name)}</div>
              </div>
            `)}
          </div>

          ${homeLineup || homeCoach ? html`
            <div class="pitch-dt home">
              ${tA.flag}&nbsp;${homeFormation}${homeCoachSuffix}
            </div>
          ` : ''}
          ${awayLineup || awayCoach ? html`
            <div class="pitch-dt away">
              ${awayFormation}${awayCoachSuffix}&nbsp;${tB.flag}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────

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
              return html`<span class="ticket-broadcast">${t('modal.broadcastShared')}</span>`;
            }
            return html`<span class="ticket-broadcast exclusive">${t('modal.broadcastExclusive')}</span>`;
          })()}
          <button class="ticket-close" @click="${this.close}" aria-label="${t('modal.close')}">✕</button>
        </div>

        <!-- Scrollable body -->
        <div class="modal-body">

        <!-- Showdown grande con stickers -->
        <div class="showdown">
          <div class="sticker-side-left">
            <div class="sticker left">
              ${renderFlag(tA, { size: 'lg', imgClass: 'flag-img-big', flagClass: 'sticker-flag' })}
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
              : html`<div class="score-tbd">${t('modal.vs')}</div>`
            }
          </div>

          <div class="sticker-side-right">
            <div class="sticker right">
              ${renderFlag(tB, { size: 'lg', imgClass: 'flag-img-big', flagClass: 'sticker-flag' })}
              <span class="sticker-name">${tB?.shortName ?? this.teamB}</span>
            </div>
          </div>
        </div>

        <!-- Goleadores -->
        ${this._renderGoalScorers(tA, tB)}

        <!-- Info tab bar -->
        <div class="info-tab-bar">
          <button class="info-tab-btn ${this._infoTab === 'preview' ? 'active' : ''}"
                  @click=${() => { this._infoTab = 'preview'; }}>
            ${t('modal.tabPreview')}
          </button>
          <button class="info-tab-btn ${this._infoTab === 'lineups' ? 'active' : ''}"
                  @click=${() => { this._infoTab = 'lineups'; }}>
            ${t('modal.tabLineups')}
          </button>
          <button class="info-tab-btn ${this._infoTab === 'edit' ? 'active' : ''}"
                  @click=${() => { this._infoTab = 'edit'; }}>
            ${t('modal.tabScore')}
          </button>
        </div>

        <!-- Tab: Preview -->
        <div class="info-tab-content ${this._infoTab === 'preview' ? 'active' : ''}">
          ${this._renderCronica(tA, tB)}
          ${this._renderProbBlock(tA, tB)}
        </div>

        <!-- Tab: Lineups -->
        <div class="info-tab-content ${this._infoTab === 'lineups' ? 'active' : ''}">
          ${this._renderPitchBlock(tA, tB)}
        </div>

        <!-- Tab: Edit -->
        <div class="info-tab-content ${this._infoTab === 'edit' ? 'active' : ''}">
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

                    <span class="penalties-badge">${t('modal.penShort')}</span>

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
        </div>

        </div><!-- /modal-body -->

        <!-- Footer -->
        ${!this.hideFooter ? html`
        <div class="modal-footer">
          ${this._confirmClose
            ? html`
              <div class="confirm-bar">
                <span class="confirm-msg">${t('modal.unsaved')}</span>
                <span class="confirm-hint">${t('modal.unsavedMessage')}</span>
                <div class="confirm-actions">
                  <button class="btn btn-secondary" @click=${() => { this._confirmClose = false; this._dispatchClose(); }}>${t('modal.discard')}</button>
                  <button class="btn btn-primary" @click=${this._discardAndClose}>${t('modal.saveClose')}</button>
                </div>
              </div>
            `
            : html`
              <button class="btn btn-secondary" @click="${this.close}">${t('modal.cancel')}</button>
              <button
                class="btn btn-primary"
                ?disabled="${!canSave}"
                @click="${this.save}">${t('modal.save')}</button>
            `}
        </div>
        ` : ''}
      </div>
    `;
  }
}

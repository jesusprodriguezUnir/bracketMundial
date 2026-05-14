import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { TEAMS_2026 } from '../data/fifa-2026';

// Stats placeholder — solo flavor visual, igual que el diseño dir2-retro.jsx
const STATS_STRIP = [
  { label: 'POSESIÓN', value: '58 — 42', accent: 'var(--retro-blue)' },
  { label: 'REMATES',  value: '14 — 9',  accent: 'var(--retro-orange)' },
  { label: 'CÓRNERS',  value: '6 — 4',   accent: 'var(--retro-green)' },
  { label: 'ASIST.',   value: '78 215',  accent: 'var(--retro-red)' },
];

@customElement('match-modal')
export class MatchModal extends LitElement {
  @property({ attribute: 'match-id' }) matchId = '';
  @property({ attribute: 'team-a' }) teamA = '';
  @property({ attribute: 'team-b' }) teamB = '';
  @property({ attribute: 'initial-score-a', type: Number }) initialScoreA: number | null = null;
  @property({ attribute: 'initial-score-b', type: Number }) initialScoreB: number | null = null;
  @property() phase: 'group' | 'knockout' = 'group';
  @property() venue = '';
  @property() city = '';
  @property() timeSpain = '';
  @property() stadiumImage = '';

  @state() private _scoreA: number | null = null;
  @state() private _scoreB: number | null = null;

  get scoreA() { return this._scoreA; }
  get scoreB() { return this._scoreB; }

  protected override updated(changedProps: PropertyValues) {
    if (changedProps.has('initialScoreA')) this._scoreA = this.initialScoreA;
    if (changedProps.has('initialScoreB')) this._scoreB = this.initialScoreB;
  }

  override firstUpdated() {
    const addBtn = this.shadowRoot?.querySelector<HTMLButtonElement>('.score-add-a');
    addBtn?.focus();
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
    if (e.key === 'Tab') this._trapFocus(e);
  };

  private _trapFocus(e: KeyboardEvent) {
    const focusable = Array.from(
      this.shadowRoot?.querySelectorAll<HTMLElement>('button') ?? []
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && this.shadowRoot?.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && this.shadowRoot?.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  private _handleHostClick = (e: MouseEvent) => {
    if (e.target === this) this.close();
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    super.disconnectedCallback();
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private clear() {
    this._scoreA = null;
    this._scoreB = null;
  }

  private save() {
    if (this.phase === 'knockout' && this._scoreA !== null && this._scoreA === this._scoreB) return;
    this.dispatchEvent(new CustomEvent('save', {
      detail: { matchId: this.matchId, scoreA: this._scoreA, scoreB: this._scoreB },
      bubbles: true, composed: true,
    }));
  }

  static styles = css`
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
    .ticket-close {
      all: unset;
      cursor: pointer;
      color: var(--paper);
      font-family: var(--font-var);
      font-size: 18px;
      opacity: 0.7;
      margin-left: 10px;
      flex-shrink: 0;
      line-height: 1;
    }
    .ticket-close:hover { opacity: 1; }

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

    /* ─── Stats strip (flavor visual) ─── */
    .stats-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding: 0 16px 16px;
    }
    .stat-card {
      border: 3px solid var(--ink);
      background: var(--paper-2);
      padding: 8px 12px;
    }
    .stat-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .stat-value {
      font-family: var(--font-var);
      font-size: 22px;
      color: var(--ink);
      line-height: 1.1;
      margin-top: 2px;
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
    }
    .score-input button:hover { background: var(--retro-red); }
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
    }
    .modal-footer .btn { flex: 1; }
    .btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none;
      box-shadow: var(--shadow-hard-sm);
    }

    @media (max-width: 768px) {
      .showdown {
        grid-template-columns: 1fr;
        gap: 16px;
        margin: 10px;
        padding: 16px;
      }
      .sticker-side-left,
      .sticker-side-right {
        justify-content: center;
      }
      .sticker.left,
      .sticker.right {
        transform: none;
      }
      .score-big { font-size: 60px; }
      .stats-strip {
        grid-template-columns: 1fr 1fr;
        padding: 0 10px 12px;
      }
      .editor-section { padding: 12px 10px 12px; }
      .modal-footer { padding: 0 10px 12px; }
    }
  `;

  private renderFlag(team?: any, size: 'small' | 'big' = 'small') {
    if (!team) return '';
    if (team.flagUrl) {
      return html`<img src="${team.flagUrl}" alt="${team.name}" class="${size === 'big' ? 'flag-img-big' : 'flag-img'}">`;
    }
    return html`<span class="sticker-flag">${team.flag}</span>`;
  }

  render() {
    const tA = TEAMS_2026.find(t => t.id === this.teamA);
    const tB = TEAMS_2026.find(t => t.id === this.teamB);
    const isDraw = this.phase === 'knockout' && this._scoreA === this._scoreB;
    const isPlayed = this.initialScoreA !== null || this.initialScoreB !== null;
    const showStats = this.phase === 'group' && isPlayed;
    const groupLetter = tA?.group ?? '?';
    const phaseLabel = this.phase === 'group'
      ? `GRUPO ${groupLetter}`
      : 'ELIMINATORIAS';

    return html`
      <div class="modal" @click="${(e: MouseEvent) => e.stopPropagation()}">

        <!-- Ticket header -->
        <div class="ticket-header">
          <span class="ticket-label">★ TICKET</span>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${this.stadiumImage ? html`<img src="${this.stadiumImage}" style="width: 40px; height: 25px; object-fit: cover; border: 1px solid var(--ink); box-shadow: 2px 2px 0 0 var(--ink);" alt="Estadio">` : ''}
            <span class="ticket-info">№ ${this.matchId} · ${this.city} · ${this.venue} · ${this.timeSpain ? html`<span style="color: var(--retro-yellow)">${this.timeSpain} ESP</span>` : ''}</span>
          </div>
          <span class="ticket-group">${phaseLabel}</span>
          <button class="ticket-close" @click="${this.close}" aria-label="Cerrar">✕</button>
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
                <span class="score-final-badge">FINAL · 90+5</span>
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

        <!-- Stats strip — flavor visual solamente -->
        ${showStats ? html`
          <div class="stats-strip">
            ${STATS_STRIP.map(s => html`
              <div class="stat-card" style="box-shadow: 3px 3px 0 0 ${s.accent}">
                <div class="stat-label">${s.label}</div>
                <div class="stat-value">${s.value}</div>
              </div>
            `)}
          </div>
        ` : ''}

        <!-- Editor de marcador -->
        <div class="editor-section">
          <div class="editor-label">EDITAR MARCADOR ▶</div>
          <div class="editor-row">
            <!-- Score A -->
            <div class="score-input">
              <button
                class="score-add-a"
                @click="${() => { this._scoreA = Math.max(0, (this._scoreA ?? 0) - 1); }}"
                aria-label="Restar gol ${tA?.shortName}">−</button>
              <span class="score-display" aria-live="polite">${this._scoreA ?? '-'}</span>
              <button
                @click="${() => { this._scoreA = (this._scoreA ?? 0) + 1; }}"
                aria-label="Añadir gol ${tA?.shortName}">+</button>
            </div>

            <span class="vs-sep">×</span>

            <!-- Score B -->
            <div class="score-input">
              <button
                @click="${() => { this._scoreB = Math.max(0, (this._scoreB ?? 0) - 1); }}"
                aria-label="Restar gol ${tB?.shortName}">−</button>
              <span class="score-display" aria-live="polite">${this._scoreB ?? '-'}</span>
              <button
                @click="${() => { this._scoreB = (this._scoreB ?? 0) + 1; }}"
                aria-label="Añadir gol ${tB?.shortName}">+</button>
            </div>
            
            <button class="btn btn-secondary" style="margin-left: auto; flex: 0; min-width: 80px;" @click="${this.clear}">LIMPIAR</button>
          </div>

          ${isDraw
            ? html`<div class="warn">En eliminatorias debe haber un ganador.</div>`
            : ''
          }
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn" @click="${this.close}">CANCELAR</button>
          <button
            class="btn btn-primary"
            ?disabled="${isDraw}"
            @click="${this.save}">GUARDAR</button>
        </div>
      </div>
    `;
  }
}

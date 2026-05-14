import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { TEAMS_2026 } from '../data/fifa-2026';

@customElement('match-modal')
export class MatchModal extends LitElement {
  @property({ attribute: 'match-id' }) matchId = '';
  @property({ attribute: 'team-a' }) teamA = '';
  @property({ attribute: 'team-b' }) teamB = '';
  @property({ attribute: 'initial-score-a', type: Number }) initialScoreA = 0;
  @property({ attribute: 'initial-score-b', type: Number }) initialScoreB = 0;
  @property() phase: 'group' | 'knockout' = 'group';

  private _scoreA = 0;
  private _scoreB = 0;

  get scoreA() { return this._scoreA; }
  get scoreB() { return this._scoreB; }

  protected override updated(changedProps: PropertyValues) {
    if (changedProps.has('initialScoreA')) this._scoreA = this.initialScoreA;
    if (changedProps.has('initialScoreB')) this._scoreB = this.initialScoreB;
  }

  override firstUpdated() {
    const inputA = this.shadowRoot?.querySelector<HTMLInputElement>('input');
    inputA?.focus();
    inputA?.select();
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this.close();
    if (e.key === 'Tab') this._trapFocus(e);
  };

  private _trapFocus(e: KeyboardEvent) {
    const focusable = Array.from(
      this.shadowRoot?.querySelectorAll<HTMLElement>('input, button') ?? []
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

  private save() {
    if (this.phase === 'knockout' && this._scoreA === this._scoreB) return;
    this.dispatchEvent(new CustomEvent('save', {
      detail: { matchId: this.matchId, scoreA: this._scoreA, scoreB: this._scoreB },
      bubbles: true, composed: true,
    }));
  }

  private onInputA(e: Event) {
    this._scoreA = parseInt((e.target as HTMLInputElement).value) || 0;
    this.requestUpdate();
  }

  private onInputB(e: Event) {
    this._scoreB = parseInt((e.target as HTMLInputElement).value) || 0;
    this.requestUpdate();
  }

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(8px);
      padding: 20px;
    }
    .modal {
      background: var(--navy-dark);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .modal-header {
      text-align: center;
      margin-bottom: 24px;
    }
    .modal-header h2 {
      font-family: var(--font-display);
      font-size: 0.8rem;
      color: var(--text-dim);
      margin: 0;
    }
    .teams-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
    }
    .team-box { text-align: center; }
    .team-flag { font-size: 2.5rem; margin-bottom: 8px; display: block; }
    .team-name { font-weight: 800; font-size: 0.9rem; text-transform: uppercase; }
    .vs-label { font-family: var(--font-display); color: var(--text-dim); opacity: 0.5; }

    .score-inputs {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    input {
      width: 60px;
      height: 60px;
      background: var(--navy-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--neon-lime);
      font-size: 1.5rem;
      font-weight: 800;
      text-align: center;
      outline: none;
    }
    input:focus { border-color: var(--neon-lime); }

    .warn {
      text-align: center;
      font-size: 0.72rem;
      color: var(--neon-magenta);
      margin-bottom: 16px;
      min-height: 1.2em;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
    }
    .btn { flex: 1; }
    .btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .btn-primary:disabled:hover {
      background: var(--navy-surface);
      border-color: var(--border-color);
      color: var(--off-white);
      box-shadow: none;
    }
  `;

  render() {
    const tA = TEAMS_2026.find(t => t.id === this.teamA);
    const tB = TEAMS_2026.find(t => t.id === this.teamB);
    const isDraw = this.phase === 'knockout' && this._scoreA === this._scoreB;

    return html`
      <div class="modal" @click="${(e: MouseEvent) => e.stopPropagation()}">
        <div class="modal-header">
          <h2>RESULTADO DEL PARTIDO</h2>
        </div>
        <div class="teams-grid">
          <div class="team-box">
            <span class="team-flag">${tA?.flag}</span>
            <span class="team-name">${tA?.name}</span>
          </div>
          <div class="vs-label">VS</div>
          <div class="team-box">
            <span class="team-flag">${tB?.flag}</span>
            <span class="team-name">${tB?.name}</span>
          </div>
        </div>
        <div class="score-inputs">
          <input type="number" min="0" .value="${String(this._scoreA)}"
            @input="${this.onInputA}" aria-label="Goles ${tA?.name ?? ''}">
          <span class="vs-label">—</span>
          <input type="number" min="0" .value="${String(this._scoreB)}"
            @input="${this.onInputB}" aria-label="Goles ${tB?.name ?? ''}">
        </div>
        <p class="warn">${isDraw ? 'En eliminatorias debe haber un ganador.' : ''}</p>
        <div class="modal-footer">
          <button class="btn" @click="${this.close}">CANCELAR</button>
          <button class="btn btn-primary" ?disabled="${isDraw}" @click="${this.save}">GUARDAR</button>
        </div>
      </div>
    `;
  }
}

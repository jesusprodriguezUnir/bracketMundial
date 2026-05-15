import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Player } from '../data/squads';
import { searchPlayer } from '../lib/player-service';
import type { PlayerDetail } from '../lib/player-service';
import { TEAMS_2026 } from '../data/fifa-2026';
import { renderFlag } from '../lib/render-flag';

function formatBirthDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function footLabel(foot: string): string {
  if (foot === 'Right') return 'Derecho';
  if (foot === 'Left') return 'Izquierdo';
  return foot;
}

@customElement('player-card')
export class PlayerCard extends LitElement {
  @property({ type: Object }) player: Player | null = null;
  @property({ attribute: false }) teamId = '';

  @state() private _detail: PlayerDetail | null | 'loading' = 'loading';

  override connectedCallback() {
    super.connectedCallback();
    this._fetchDetail();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('player') && this.player) {
      this._fetchDetail();
    }
  }

  private async _fetchDetail() {
    if (!this.player) return;
    
    // Si ya tenemos una foto directa, podemos saltarnos la búsqueda o usarla como fallback prioritario
    // Pero por ahora, el servicio gestiona el enriquecimiento completo (bio, redes, etc)
    this._detail = 'loading';
    const result = await searchPlayer(
      this.player.name, 
      this.teamId, 
      this.player.number, 
      this.player.thesportsdbId
    );

    // Si el jugador tiene un photoUrl personalizado, lo sobreescribimos en el detalle
    if (result && this.player.photoUrl) {
      result.photoUrl = this.player.photoUrl;
    } else if (!result && this.player.photoUrl) {
       // Si no hay resultado de API pero sí foto manual, creamos un detalle mínimo
       this._detail = {
         id: 'manual',
         name: this.player.name,
         position: this.player.position,
         photoUrl: this.player.photoUrl
       };
       return;
    }

    this._detail = result;
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _posLabel(pos: string) {
    const map: Record<string, string> = {
      GK: 'Portero',
      DF: 'Defensa',
      MF: 'Centrocampista',
      FW: 'Delantero',
    };
    return map[pos] ?? pos;
  }

  static styles = css`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(26, 25, 51, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .card {
      background: var(--paper);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.16s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--retro-blue);
      color: var(--paper);
      border-bottom: 4px solid var(--ink);
    }

    .close-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      padding: 5px 12px;
      border: 2px solid var(--paper);
      color: var(--paper);
    }
    .close-btn:hover { background: rgba(255, 255, 255, 0.18); }

    .card-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--dim);
    }

    .card-body {
      padding: 18px;
    }

    .player-hero {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .player-photo {
      width: 108px;
      min-width: 108px;
      height: 128px;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: var(--paper-2);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .player-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-placeholder {
      font-size: 42px;
      opacity: 0.3;
    }

    .player-name {
      font-family: var(--font-var);
      font-size: 24px;
      line-height: 1.05;
      color: var(--ink);
      margin-bottom: 6px;
    }

    .player-team {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .player-club {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.05em;
    }

    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      margin-bottom: 14px;
    }

    .data-cell {
      padding: 8px 10px;
      border-right: 2px solid var(--ink);
      border-bottom: 2px solid var(--ink);
    }

    .data-cell:nth-child(even) { border-right: none; }
    .data-cell:nth-last-child(-n+2) { border-bottom: none; }

    .data-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 2px;
    }

    .data-value {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
    }

    .divider {
      border: none;
      border-top: 2px solid var(--ink);
      margin: 14px 0;
    }

    .bio {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.6;
      color: var(--ink);
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .socials {
      display: flex;
      gap: 8px;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.05em;
      color: var(--ink);
      text-decoration: none;
    }

    .social-link:hover {
      background: var(--retro-yellow);
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-hard-md);
    }

    @media (max-width: 480px) {
      .player-hero { flex-direction: column; align-items: center; }
      .player-name { font-size: 20px; text-align: center; }
      .player-team { justify-content: center; }
      .player-club { text-align: center; }
    }
  `;

  render() {
    if (!this.player) return nothing;
    const team = TEAMS_2026.find(t => t.id === this.teamId);
    const detail = this._detail;

    return html`
      <div
        class="overlay"
        @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}
      >
        <div class="card" role="dialog" aria-modal="true">
          <div class="card-header">
            <button class="close-btn" @click=${() => this._close()}>← Cerrar</button>
            <span class="card-badge">#${this.player.number} · ${this.player.position}</span>
          </div>

          ${detail === 'loading'
            ? html`<div class="loading">CARGANDO DATOS...</div>`
            : html`
              <div class="card-body">
                <div class="player-hero">
                  <div class="player-photo">
                    ${detail?.photoUrl
                      ? html`<img src="${detail.photoUrl}" alt="${this.player.name}" loading="lazy">`
                      : html`<span class="photo-placeholder">👤</span>`}
                  </div>
                  <div>
                    <div class="player-name">${this.player.name}</div>
                    <div class="player-team">
                      ${renderFlag(team, 'sm')}
                      ${team?.name ?? this.teamId}
                    </div>
                    <div class="player-club">${this.player.club}</div>
                  </div>
                </div>

                ${this._renderDataGrid(detail)}

                ${detail?.description ? html`
                  <hr class="divider">
                  <p class="bio">${detail.description}</p>
                ` : ''}

                ${(detail?.twitter || detail?.instagram) ? html`
                  <div class="socials">
                    ${detail.twitter ? html`<a class="social-link" href="${detail.twitter}" target="_blank" rel="noopener">𝕏 Twitter</a>` : ''}
                    ${detail.instagram ? html`<a class="social-link" href="${detail.instagram}" target="_blank" rel="noopener">📷 Instagram</a>` : ''}
                  </div>
                ` : ''}
              </div>
            `}
        </div>
      </div>
    `;
  }

  private _renderDataGrid(detail: PlayerDetail | null) {
    const p = this.player!;
    const cells: Array<{ label: string; value: string }> = [];

    cells.push({ label: 'Posición', value: this._posLabel(p.position) });
    cells.push({ label: 'Edad', value: `${p.age} años` });

    if (detail?.height) cells.push({ label: 'Altura', value: detail.height });
    if (detail?.birthDate) cells.push({ label: 'Nacimiento', value: formatBirthDate(detail.birthDate) });
    if (detail?.foot) cells.push({ label: 'Pie', value: footLabel(detail.foot) });
    if (detail?.weight) cells.push({ label: 'Peso', value: detail.weight });
    if (detail?.birthPlace) cells.push({ label: 'Ciudad natal', value: detail.birthPlace });

    if (cells.length % 2 !== 0) cells.push({ label: '', value: '' });

    return html`
      <div class="data-grid">
        ${cells.map(c => html`
          <div class="data-cell">
            <div class="data-label">${c.label}</div>
            <div class="data-value">${c.value}</div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'player-card': PlayerCard;
  }
}

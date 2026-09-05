import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Stadium } from '../data/stadiums';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';

@customElement('stadium-modal')
export class StadiumModal extends LitElement {
  @property({ type: Object }) stadium: Stadium | null = null;
  @property({ type: Boolean }) open = false;

  static styles = css`
    :host {
      display: contents;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(3,6,16,0.66);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    :host([open]) .modal-overlay {
      opacity: 1;
      pointer-events: auto;
    }

    .modal-content {
      background: var(--card-grad);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      position: relative;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    :host([open]) .modal-content {
      transform: scale(1);
    }

    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: color-mix(in srgb, var(--retro-red) 18%, var(--paper-2));
      color: var(--ink);
      border: 1px solid var(--retro-red);
      border-radius: var(--radius-sm);
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-family: var(--font-mono);
      font-weight: bold;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      z-index: 10;
    }

    .close-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: var(--shadow-md);
    }

    .hero-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-bottom: 1px solid var(--hairline);
    }

    .stadium-header {
      padding: 30px;
      background-image: var(--halftone);
      border-bottom: 1px dashed var(--hairline);
    }

    .stadium-name {
      font-family: var(--font-var);
      font-size: 3rem;
      margin: 0;
      color: var(--accent);
      line-height: 0.9;
      text-transform: uppercase;
      font-weight: 800;
    }

    .stadium-location {
      font-family: var(--font-mono);
      font-size: 1.2rem;
      color: var(--accent);
      margin-top: 10px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 30px;
    }

    .section-title {
      font-family: var(--font-var);
      font-size: 1.5rem;
      color: var(--ink);
      margin-bottom: 15px;
      border-bottom: 1px solid var(--accent);
      display: inline-block;
      text-transform: uppercase;
      font-weight: 800;
    }

    .stadium-description {
      font-family: var(--font-body);
      line-height: 1.6;
      font-size: 1.1rem;
      color: var(--ink);
    }

    .stadium-stats {
      background: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      padding: 20px;
      box-shadow: var(--shadow-md);
    }

    .stat-item {
      margin-bottom: 15px;
    }

    .stat-label {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--ink-muted);
      display: block;
    }

    .stat-value {
      font-family: var(--font-mono);
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--ink);
    }

    .matches-section {
      padding: 0 30px 30px;
    }

    .matches-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .match-row {
      display: flex;
      align-items: center;
      padding: 12px;
      background: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.9rem;
    }

    .match-id {
      background: var(--card-grad);
      color: var(--on-dark);
      border-radius: var(--radius-sm);
      padding: 2px 8px;
      margin-right: 15px;
      font-size: 0.8rem;
    }

    .match-teams {
      flex-grow: 1;
      font-weight: bold;
    }

    .match-date {
      color: var(--ink-muted);
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
      .stadium-name {
        font-size: 2rem;
      }
      .modal-content {
        width: 95%;
        max-height: 95vh;
      }
    }
  `;

  render() {
    if (!this.stadium) return html``;

    const groupMatches = GROUP_MATCHES.filter(m => m.venueId === this.stadium?.id);
    const knockoutMatches = Object.values(KNOCKOUT_SCHEDULE).filter(m => m.venueId === this.stadium?.id);

    return html`
      <div class="modal-overlay" @click="${this._close}">
        <div class="modal-content" @click="${(e: Event) => e.stopPropagation()}">
          <button class="close-btn" @click="${this._close}">×</button>
          
          <img class="hero-image" src="${this.stadium.image}" alt="${this.stadium.name}"
            @error=${(e: Event) => { (e.target as HTMLImageElement).src = '/assets/images/stadium-placeholder.svg'; }}>
          
          <div class="stadium-header">
            <h2 class="stadium-name">${this.stadium.name}</h2>
            <div class="stadium-location">📍 ${this.stadium.city}, ${this.stadium.country}</div>
          </div>

          <div class="info-grid">
            <div class="info-left">
              <h3 class="section-title">HISTORIA Y DISEÑO</h3>
              <div class="stadium-description">
                ${this.stadium.description}
              </div>
            </div>
            
            <div class="info-right">
              <div class="stadium-stats">
                <div class="stat-item">
                  <span class="stat-label">Capacidad</span>
                  <span class="stat-value">${this.stadium.capacity.toLocaleString()} espectadores</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Zona Horaria</span>
                  <span class="stat-value">${this.stadium.timezone}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Dato Clave</span>
                  <span class="stat-value" style="color: var(--retro-red)">${this.stadium.highlight}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="matches-section">
            <h3 class="section-title">PARTIDOS PROGRAMADOS</h3>
            <div class="stadium-description" style="margin-bottom: 15px; font-style: italic;">
              ${this.stadium.matchesSummary}
            </div>
            
            <div class="matches-list">
              ${groupMatches.map(m => html`
                <div class="match-row">
                  <span class="match-id">${m.matchId}</span>
                  <span class="match-teams">${m.teamA} vs ${m.teamB}</span>
                  <span class="match-date">📅 ${m.date}</span>
                </div>
              `)}
              ${knockoutMatches.map(m => html`
                <div class="match-row" style="background: var(--paper-3)">
                  <span class="match-id" style="background: var(--retro-orange)">${m.matchId}</span>
                  <span class="match-teams">${this._getKnockoutLabel(m.matchId)}</span>
                  <span class="match-date">📅 ${m.date}</span>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _getKnockoutLabel(id: string) {
    if (id.startsWith('R32')) return 'Dieciseisavos de Final';
    if (id.startsWith('R16')) return 'Octavos de Final';
    if (id.startsWith('QF')) return 'Cuartos de Final';
    if (id.startsWith('SF')) return 'Semifinal';
    if (id.startsWith('TP')) return 'Tercer Puesto';
    if (id.startsWith('FIN')) return 'GRAN FINAL';
    return 'Fase Eliminatoria';
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close-stadium-modal', {
      bubbles: true,
      composed: true
    }));
  }
}

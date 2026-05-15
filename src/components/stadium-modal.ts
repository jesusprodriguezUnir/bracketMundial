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
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(4px);
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
      background: var(--paper, #fdfdfd);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      border: 4px solid var(--ink, #1a1933);
      box-shadow: 20px 20px 0 0 var(--ink, #1a1933);
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
      background: var(--retro-red, #e63946);
      color: white;
      border: 3px solid var(--ink, #1a1933);
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-family: var(--font-mono);
      font-weight: bold;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 4px 4px 0 0 var(--ink, #1a1933);
      z-index: 10;
    }

    .close-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 0 var(--ink, #1a1933);
    }

    .hero-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-bottom: 4px solid var(--ink, #1a1933);
    }

    .stadium-header {
      padding: 30px;
      background-image: var(--halftone);
      border-bottom: 2px dashed var(--ink, #1a1933);
    }

    .stadium-name {
      font-family: var(--font-var);
      font-size: 3rem;
      margin: 0;
      color: var(--retro-orange);
      line-height: 0.9;
      text-transform: uppercase;
    }

    .stadium-location {
      font-family: var(--font-mono);
      font-size: 1.2rem;
      color: var(--retro-blue);
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
      border-bottom: 3px solid var(--retro-yellow);
      display: inline-block;
    }

    .stadium-description {
      font-family: var(--font-body);
      line-height: 1.6;
      font-size: 1.1rem;
      color: var(--ink);
    }

    .stadium-stats {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      padding: 20px;
      box-shadow: 6px 6px 0 0 var(--ink);
    }

    .stat-item {
      margin-bottom: 15px;
    }

    .stat-label {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--dim);
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
      background: white;
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 0.9rem;
    }

    .match-id {
      background: var(--ink);
      color: white;
      padding: 2px 8px;
      margin-right: 15px;
      font-size: 0.8rem;
    }

    .match-teams {
      flex-grow: 1;
      font-weight: bold;
    }

    .match-date {
      color: var(--dim);
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
          
          <img class="hero-image" src="${this.stadium.image}" alt="${this.stadium.name}">
          
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
                  <span class="stat-label">Capacidad Mundial</span>
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

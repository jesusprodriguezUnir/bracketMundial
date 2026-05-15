import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { STADIUMS } from '../data/stadiums';
import type { Stadium } from '../data/stadiums';
import { t } from '../i18n';
import './stadium-modal';

@customElement('stadiums-view')
export class StadiumsView extends LitElement {
  @state() private _selectedStadium: Stadium | null = null;

  static styles = css`
    :host {
      display: block;
      padding: 0 20px 40px;
      color: var(--retro-white, #f0f0f0);
    }

    .stadiums-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .stadiums-hero {
      background: var(--ink, #1a1933);
      color: var(--paper, #fdfdfd);
      padding: 40px;
      margin-bottom: 40px;
      border: 4px solid var(--ink, #1a1933);
      box-shadow: var(--shadow-hard-xl);
      text-align: center;
      background-image: var(--halftone);
      position: relative;
    }

    .hero-eyebrow {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--retro-yellow);
      letter-spacing: 0.3em;
      margin-bottom: 10px;
    }

    .hero-title {
      font-family: var(--font-var);
      font-size: 42px;
      margin: 0;
      line-height: 1;
    }

    .stadiums-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 30px;
    }

    .stadium-card {
      background: var(--paper-2, #1e1e28);
      border: 3px solid var(--ink, #1a1933);
      box-shadow: var(--shadow-hard-lg, 8px 8px 0 0 #1a1933);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.2s;
      cursor: pointer;
    }

    .stadium-card:hover {
      transform: translate(-4px, -4px);
      box-shadow: 12px 12px 0 0 var(--ink, #1a1933);
    }

    .image-container {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      border-bottom: 3px solid var(--ink, #1a1933);
    }

    .stadium-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .stadium-card:hover .stadium-image {
      transform: scale(1.05);
    }

    .capacity-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: var(--retro-yellow, #fff000);
      color: var(--ink, #1a1933);
      padding: 4px 10px;
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: bold;
      border: 2px solid var(--ink, #1a1933);
      box-shadow: 3px 3px 0 0 var(--ink, #1a1933);
      z-index: 2;
    }

    .stadium-info {
      padding: 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      background-image: var(--halftone, radial-gradient(circle, #ccc 1px, transparent 1px));
      background-size: 10px 10px;
      background-color: var(--paper-2);
    }

    .stadium-name {
      font-family: var(--font-var, 'Bowlby One SC', sans-serif);
      font-size: 1.4rem;
      margin: 0 0 4px 0;
      color: var(--retro-orange, #ff5e00);
      line-height: 1.1;
      text-transform: uppercase;
    }

    .stadium-location {
      font-family: var(--font-mono, monospace);
      font-size: 0.9rem;
      color: var(--retro-blue, #00d2ff);
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .stadium-highlight {
      font-family: var(--font-body, sans-serif);
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--ink, #1a1933);
      background: var(--paper-3, #fdfdfd);
      border: 2px solid var(--ink, #1a1933);
      padding: 12px;
      margin-bottom: 15px;
      flex-grow: 1;
      box-shadow: inset 2px 2px 0 0 rgba(0,0,0,0.1);
    }

    .stadium-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .country-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border: 2px solid var(--ink, #1a1933);
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      box-shadow: 2px 2px 0 0 var(--ink);
    }

    .country-mex { background: #006847; color: white; }
    .country-usa { background: #002868; color: white; }
    .country-can { background: #FF0000; color: white; }

    .timezone-info {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim, #666);
    }

    @media (max-width: 600px) {
      .stadiums-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  render() {
    return html`
      <div class="stadiums-container">
        <div class="stadiums-hero">
          <div class="hero-eyebrow">WORLD CUP 2026</div>
          <h2 class="hero-title">${t('stadiums.title')}</h2>
        </div>

        <div class="stadiums-grid">
          ${STADIUMS.map(stadium => html`
            <div class="stadium-card" @click="${() => this._selectStadium(stadium)}">
              <div class="image-container">
                <div class="capacity-badge">${stadium.capacity.toLocaleString()} ASIENTOS</div>
                <img class="stadium-image" src="${stadium.image}" alt="${stadium.name}" loading="lazy">
              </div>
              
              <div class="stadium-info">
                <h3 class="stadium-name">${stadium.name}</h3>
                <div class="stadium-location">
                  📍 ${stadium.city}, ${stadium.country}
                </div>
                
                <div class="stadium-highlight">
                  ${stadium.highlight}
                </div>

                <div class="stadium-footer">
                  <span class="country-tag ${this._getCountryClass(stadium.country)}">
                    ${stadium.country}
                  </span>
                  <span class="timezone-info">🕒 ${stadium.timezone}</span>
                </div>
              </div>
            </div>
          `)}
        </div>
      </div>

      <stadium-modal 
        .stadium="${this._selectedStadium}" 
        ?open="${!!this._selectedStadium}"
        @close-stadium-modal="${() => this._selectStadium(null)}">
      </stadium-modal>
    `;
  }

  private _selectStadium(stadium: Stadium | null) {
    this._selectedStadium = stadium;
  }

  private _getCountryClass(country: string) {
    if (country === 'México') return 'country-mex';
    if (country === 'USA') return 'country-usa';
    if (country === 'Canadá') return 'country-can';
    return '';
  }
}

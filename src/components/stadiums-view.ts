import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { STADIUMS } from '../data/stadiums';
import type { Stadium } from '../data/stadiums';
import { GROUP_MATCHES, KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { t, useLocaleStore } from '../i18n';

// ─────────────────────────────────────────────────────────────
// Helpers: derivar fases del torneo desde matchesSummary
// (mantenemos el tipo Stadium intacto)
// ─────────────────────────────────────────────────────────────
type Phase = 'G' | 'R32' | 'R16' | 'QF' | 'SF' | '3RD' | 'F';

const PHASE_LABEL: Record<Phase, string> = {
  G: 'Grupos', R32: '1/16', R16: 'Octavos', QF: 'Cuartos', SF: 'Semis', '3RD': '3.º', F: 'Final',
};

function getPhases(stadium: Stadium): Phase[] {
  const s = `${stadium.matchesSummary} ${stadium.highlight}`.toLowerCase();
  const phases: Phase[] = [];
  if (s.includes('grupo')) phases.push('G');
  if (s.includes('dieciseisavos') || s.includes('1/16') || s.includes('treintaidos')) phases.push('R32');
  if (s.includes('octavos')) phases.push('R16');
  if (s.includes('cuartos')) phases.push('QF');
  if (s.includes('semifinal') || s.includes('semis')) phases.push('SF');
  if (s.includes('tercer puesto')) phases.push('3RD');
  if (s.includes('gran final') || s.includes('la final')) phases.push('F');
  return phases;
}

function countryCode(country: string): 'USA' | 'MEX' | 'CAN' | 'OTHER' {
  if (country === 'USA') return 'USA';
  if (country === 'México') return 'MEX';
  if (country === 'Canadá') return 'CAN';
  return 'OTHER';
}

const COUNTRY_FLAG: Record<string, string> = { USA: '🇺🇸', MEX: '🇲🇽', CAN: '🇨🇦' };
const COUNTRY_NAME: Record<string, string> = { USA: 'EE. UU.', MEX: 'México', CAN: 'Canadá' };

@customElement('stadiums-view')
export class StadiumsView extends LitElement {
  @state() private _selectedStadium: Stadium | null = null;
  @state() private _country: 'ALL' | 'USA' | 'MEX' | 'CAN' = 'ALL';
  @state() private _phase: 'ALL' | Phase = 'ALL';

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  static styles = css`
    :host {
      display: block;
      padding: 0 20px 40px;
      color: var(--ink);
    }

    .stadiums-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ── Hero ── */
    .stadiums-hero {
      background: var(--ink);
      color: var(--paper);
      padding: 28px 32px;
      margin-bottom: 18px;
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      background-image: var(--halftone);
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      flex-wrap: wrap;
    }
    .hero-left {
      display: grid; gap: 6px;
    }
    .hero-eyebrow {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--retro-yellow);
      letter-spacing: 0.3em;
      font-weight: 700;
    }
    .hero-title {
      font-family: var(--font-var);
      font-size: 42px;
      line-height: 0.95;
      letter-spacing: -0.01em;
    }
    .hero-stats {
      display: flex; gap: 14px; flex-wrap: wrap;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--paper);
    }
    .hero-stats b {
      display: inline-block;
      background: var(--retro-yellow); color: var(--ink);
      padding: 1px 7px; margin-right: 5px;
      font-family: var(--font-var); font-size: 14px;
      letter-spacing: 0;
    }

    /* ── Filtros ── */
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      align-items: center;
      padding: 12px 14px;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      margin-bottom: 14px;
    }
    .filters-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--dim);
      font-weight: 700;
    }
    .filter-group {
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .filter-btn {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      background: transparent;
      color: var(--ink);
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      font-weight: 700;
      text-transform: uppercase;
      transition: transform 0.08s, box-shadow 0.08s;
    }
    .filter-btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-hard-sm);
    }
    .filter-btn.active {
      background: var(--ink);
      color: var(--paper);
    }
    .filter-btn.active.phase-g    { background: var(--retro-blue);   color: #fff; }
    .filter-btn.active.phase-r16  { background: var(--retro-orange); color: #fff; }
    .filter-btn.active.phase-qf   { background: var(--retro-green);  color: #fff; }
    .filter-btn.active.phase-sf   { background: var(--retro-red);    color: #fff; }
    .filter-btn.active.phase-f    { background: var(--retro-yellow); color: var(--ink); }

    /* ── Mapa schematic ── */
    .map-strip {
      position: relative;
      height: 110px;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      margin-bottom: 14px;
      overflow: hidden;
      background-image:
        repeating-linear-gradient(90deg, rgba(26,25,51,0.06) 0 1px, transparent 1px 60px),
        repeating-linear-gradient(0deg,  rgba(26,25,51,0.06) 0 1px, transparent 1px 30px);
    }
    .map-label {
      position: absolute;
      top: 8px;
      transform: translateX(-50%);
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
      background: var(--paper);
      padding: 2px 8px;
      border: 1.5px solid var(--ink);
    }
    .map-dot {
      position: absolute;
      width: 14px;
      height: 14px;
      border: 2px solid var(--ink);
      transform: translate(-50%, -50%);
      cursor: pointer;
      transition: transform 0.1s;
    }
    .map-dot:hover {
      transform: translate(-50%, -50%) scale(1.4);
    }
    .map-legend {
      position: absolute;
      bottom: 6px;
      right: 10px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.12em;
    }

    /* ── Lista ── */
    .results-count {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.12em;
      color: var(--dim);
      margin-bottom: 10px;
    }

    .stadiums-list {
      display: grid;
      gap: 10px;
    }

    .stadium-row {
      display: grid;
      grid-template-columns: 180px 80px 1fr 110px 1fr;
      align-items: stretch;
      gap: 0;
      background: var(--paper-3);
      border: 2.5px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .stadium-row:hover {
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-hard-md);
    }

    .row-img {
      height: 100%;
      min-height: 100px;
      object-fit: cover;
      width: 100%;
      border-right: 2px solid var(--ink);
      display: block;
    }
    .row-flag {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-right: 2px solid var(--ink);
      background: var(--paper-2);
      padding: 8px 4px;
    }
    .row-flag .emoji {
      font-size: 24px;
      line-height: 1;
    }
    .row-flag .code {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--dim);
      font-weight: 700;
    }

    .row-info {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 3px;
      border-right: 2px solid var(--ink);
      min-width: 0;
    }
    .row-name {
      font-family: var(--font-var);
      font-size: 17px;
      color: var(--ink);
      line-height: 1.05;
    }
    .row-city {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .row-note {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      color: var(--retro-orange);
      font-weight: 700;
      text-transform: uppercase;
    }

    .row-meta {
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 2px;
      border-right: 2px solid var(--ink);
      background: var(--paper-2);
    }
    .row-meta .big {
      font-family: var(--font-var);
      font-size: 26px;
      line-height: 1;
      color: var(--ink);
    }
    .row-meta .label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.12em;
      color: var(--dim);
    }
    .row-meta .cap {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.04em;
    }

    .row-phases {
      padding: 10px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
    .phase-chip {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.08em;
      font-weight: 700;
      padding: 2px 6px;
      border: 1.5px solid var(--ink);
      color: #fff;
    }
    .phase-chip.G    { background: var(--retro-blue); }
    .phase-chip.R32  { background: var(--retro-blue); }
    .phase-chip.R16  { background: var(--retro-orange); }
    .phase-chip.QF   { background: var(--retro-green); }
    .phase-chip.SF   { background: var(--retro-red); }
    .phase-chip.\\33 RD,
    .phase-chip[data-phase="3RD"] {
      background: var(--dim);
    }
    .phase-chip.F    { background: var(--retro-yellow); color: var(--ink); }

    .empty {
      padding: 28px;
      text-align: center;
      border: 3px dashed var(--ink);
      background: var(--paper-2);
      font-family: var(--font-mono);
      color: var(--dim);
      letter-spacing: 0.1em;
    }

    /* ── Detail view ── */
    .back-btn {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin-bottom: 16px;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink);
    }

    .back-btn:hover {
      background: var(--retro-yellow);
    }

    .detail-panel {
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      background: var(--paper);
      overflow: hidden;
    }

    .detail-header {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 18px 22px;
      border-bottom: 4px solid var(--ink);
      background: var(--retro-green);
      color: var(--paper);
    }

    .detail-title {
      font-family: var(--font-var);
      font-size: 34px;
      line-height: 1;
    }

    .detail-sub {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      opacity: 0.85;
    }

    .detail-body {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 0;
    }

    .detail-photo-col {
      border-right: 4px solid var(--ink);
      background: var(--ink);
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .detail-photo-wrap {
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ink);
    }

    .detail-photo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .detail-info-col {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .detail-name-block {
      padding: 18px 20px 14px;
      border-bottom: 3px solid var(--ink);
      background: var(--paper-2);
    }

    .detail-stadium-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 6px;
    }

    .detail-stadium-name {
      font-family: var(--font-display);
      font-size: 26px;
      color: var(--ink);
      line-height: 1.1;
    }

    .detail-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 3px solid var(--ink);
    }

    .stat-cell {
      padding: 14px 18px;
      border-right: 2px solid var(--paper-2);
      border-bottom: 2px solid var(--paper-2);
    }

    .stat-cell:nth-child(even) {
      border-right: none;
    }

    .stat-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 4px;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 15px;
      color: var(--ink);
      line-height: 1.2;
    }

    .stat-value-large {
      font-family: var(--font-var);
      font-size: 36px;
      color: var(--ink);
      line-height: 1;
    }

    .detail-description-block {
      padding: 20px;
      flex: 1;
      background: var(--paper);
    }

    .detail-description-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 10px;
    }

    .detail-description-text {
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--ink);
      line-height: 1.7;
    }

    .detail-matches-block {
      padding: 0 20px 20px;
      background: var(--paper);
    }

    .detail-matches-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 12px;
    }

    .matches-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .match-row {
      display: flex;
      align-items: center;
      padding: 10px 14px;
      background: white;
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 0.85rem;
      gap: 12px;
    }

    .match-row.knockout {
      background: var(--paper-3);
    }

    .match-id {
      background: var(--ink);
      color: white;
      padding: 2px 8px;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .match-row.knockout .match-id {
      background: var(--retro-orange);
    }

    .match-teams {
      flex-grow: 1;
      font-weight: bold;
    }

    .match-date {
      color: var(--dim);
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .match-time {
      color: var(--dim);
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      :host {
        padding: 0 14px 32px;
      }
      .stadiums-hero {
        padding: 16px 18px;
        margin-bottom: 12px;
      }
      .hero-title {
        font-size: 28px;
      }
      .hero-stats {
        gap: 8px;
      }
      .filters {
        gap: 8px;
        padding: 10px 10px;
      }
      .filter-group {
        flex: 1 1 100%;
      }
      .map-strip {
        display: none;
      }
      .stadium-row {
        grid-template-columns: 1fr;
      }
      .row-img { grid-column: 1; grid-row: 1; min-height: 140px; border-right: none; border-bottom: 2px solid var(--ink); }
      .row-flag { display: none; }
      .row-info { grid-column: 1; grid-row: 2; border-right: none; }
      .row-meta { grid-column: 1; grid-row: 3; flex-direction: row; justify-content: space-between; border-right: none; border-top: 2px solid var(--ink); padding: 6px 12px; }
      .row-phases { grid-column: 1; grid-row: 4; border-top: 2px solid var(--ink); padding: 6px 10px; }

      .detail-title {
        font-size: 26px;
      }
      .detail-body {
        grid-template-columns: 1fr;
      }
      .detail-photo-col {
        border-right: none;
        border-bottom: 4px solid var(--ink);
      }
      .detail-photo-wrap {
        aspect-ratio: 2 / 1;
        max-height: 200px;
      }
      .detail-stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      .stat-value-large {
        font-size: 28px;
      }
      .detail-stadium-name {
        font-size: 22px;
      }
      .match-row {
        flex-wrap: wrap;
        gap: 6px;
      }
    }
  `;

  render() {
    if (this._selectedStadium) {
      return this._renderDetail();
    }

    const filtered = STADIUMS.filter(s => {
      if (this._country !== 'ALL' && countryCode(s.country) !== this._country) return false;
      if (this._phase !== 'ALL' && !getPhases(s).includes(this._phase)) return false;
      return true;
    });

    return html`
      <div class="stadiums-container">
        ${this._renderHero()}
        ${this._renderFilters()}
        ${this._renderMap(filtered)}

        <div class="results-count">
          MOSTRANDO <b style="color: var(--ink);">${filtered.length}</b> DE ${STADIUMS.length} ESTADIOS
        </div>

        ${filtered.length === 0
          ? html`<div class="empty">SIN ESTADIOS · prueba con otro filtro</div>`
          : html`
            <div class="stadiums-list">
              ${filtered.map(s => this._renderRow(s))}
            </div>
          `}
      </div>
    `;
  }

  goBack() {
    this._selectedStadium = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private _renderDetail() {
    const stadium = this._selectedStadium!;
    const groupMatches = GROUP_MATCHES.filter(m => m.venueId === stadium.id);
    const knockoutMatches = Object.values(KNOCKOUT_SCHEDULE).filter(m => m.venueId === stadium.id);
    const cc = countryCode(stadium.country);
    const phases = getPhases(stadium);

    return html`
      <div class="stadiums-container">
        <button class="back-btn" @click=${() => this.goBack()}>${t('stadiums.back')}</button>

        <section class="detail-panel">
          <div class="detail-header">
            <div>
              <div class="detail-title">${stadium.name}</div>
              <div class="detail-sub">
                ${COUNTRY_FLAG[cc] || '🏟️'} ${stadium.city}, ${stadium.country} · ${phases.length} fases
              </div>
            </div>
          </div>

          <div class="detail-body">
            <div class="detail-photo-col">
              <div class="detail-photo-wrap">
                <img src="${stadium.image}" alt="${stadium.name}" loading="lazy">
              </div>
            </div>

            <div class="detail-info-col">
              <div class="detail-name-block">
                <div class="detail-stadium-label">Estadio Mundialista</div>
                <div class="detail-stadium-name">${stadium.name}</div>
              </div>

              <div class="detail-stats-grid">
                <div class="stat-cell">
                  <div class="stat-label">Capacidad</div>
                  <div class="stat-value-large">${(stadium.capacity / 1000).toFixed(0)}K</div>
                </div>
                <div class="stat-cell">
                  <div class="stat-label">Espectadores</div>
                  <div class="stat-value">${stadium.capacity.toLocaleString()}</div>
                </div>
                <div class="stat-cell">
                  <div class="stat-label">Zona Horaria</div>
                  <div class="stat-value">${stadium.timezone}</div>
                </div>
                <div class="stat-cell">
                  <div class="stat-label">Dato Clave</div>
                  <div class="stat-value" style="color: var(--retro-red)">${stadium.highlight}</div>
                </div>
              </div>

              <div class="detail-description-block">
                <div class="detail-description-label">Historia y diseño</div>
                <div class="detail-description-text">${stadium.description}</div>
              </div>

              <div class="detail-description-block" style="padding-bottom: 0;">
                <div class="detail-description-label" style="margin-bottom: 6px;">Resumen de partidos</div>
                <div class="detail-description-text" style="font-style: italic; font-size: 14px;">${stadium.matchesSummary}</div>
              </div>

              ${groupMatches.length > 0 || knockoutMatches.length > 0 ? html`
                <div class="detail-matches-block">
                  <div class="detail-matches-label">Partidos programados</div>
                  <div class="matches-list">
                    ${groupMatches.map(m => html`
                      <div class="match-row">
                        <span class="match-id">${m.matchId}</span>
                        <span class="match-teams">${m.teamA} vs ${m.teamB}</span>
                        <span class="match-date">📅 ${m.date}</span>
                        <span class="match-time">${m.timeSpain}</span>
                      </div>
                    `)}
                    ${knockoutMatches.map(m => html`
                      <div class="match-row knockout">
                        <span class="match-id">${m.matchId}</span>
                        <span class="match-teams">${this._getKnockoutLabel(m.matchId)}</span>
                        <span class="match-date">📅 ${m.date}</span>
                        <span class="match-time">${m.timeSpain}</span>
                      </div>
                    `)}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </section>
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

  private _renderHero() {
    return html`
      <div class="stadiums-hero">
        <div class="hero-left">
          <div class="hero-eyebrow">★ WORLD CUP 2026 ★</div>
          <div class="hero-title">${t('stadiums.title')}</div>
        </div>
        <div class="hero-stats">
          <span><b>16</b> ESTADIOS</span>
          <span><b>3</b> PAÍSES</span>
          <span><b>104</b> PARTIDOS</span>
          <span><b>11/06 – 19/07</b></span>
        </div>
      </div>
    `;
  }

  private _renderFilters() {
    const countries: Array<'ALL' | 'USA' | 'MEX' | 'CAN'> = ['ALL', 'USA', 'MEX', 'CAN'];
    const phases: Array<'ALL' | Phase> = ['ALL', 'G', 'R16', 'QF', 'SF', 'F'];

    return html`
      <div class="filters">
        <span class="filters-label">FILTROS ▸</span>

        <div class="filter-group">
          ${countries.map(c => html`
            <button
              class="filter-btn ${this._country === c ? 'active' : ''}"
              @click=${() => { this._country = c; }}>
              ${c === 'ALL' ? '🌎 Todos' : `${COUNTRY_FLAG[c]} ${COUNTRY_NAME[c]}`}
            </button>
          `)}
        </div>

        <div style="flex: 1"></div>

        <div class="filter-group">
          ${phases.map(p => {
            const cls = p === 'ALL' ? '' : `phase-${p === 'R16' ? 'r16' : p === 'QF' ? 'qf' : p === 'SF' ? 'sf' : p === 'F' ? 'f' : 'g'}`;
            return html`
              <button
                class="filter-btn ${this._phase === p ? 'active ' + cls : ''}"
                @click=${() => { this._phase = p; }}>
                ${p === 'ALL' ? 'Todas las fases' : PHASE_LABEL[p as Phase]}
              </button>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _renderMap(filtered: Stadium[]) {
    // Position dots within fake regions: CAN left, USA centre, MEX right
    return html`
      <div class="map-strip" aria-hidden="true">
        <div class="map-label" style="left: 20%">CAN</div>
        <div class="map-label" style="left: 50%">USA</div>
        <div class="map-label" style="left: 78%">MEX</div>
        ${filtered.map((s, i) => {
          const cc = countryCode(s.country);
          const xBase = cc === 'CAN' ? 15 : cc === 'MEX' ? 73 : 38;
          const x = xBase + ((i % 6) * 4);
          const y = 45 + ((i % 4) * 14);
          const phases = getPhases(s);
          const color =
            phases.includes('F')   ? 'var(--retro-yellow)' :
            phases.includes('SF')  ? 'var(--retro-red)'    :
            phases.includes('QF')  ? 'var(--retro-green)'  :
            phases.includes('R16') ? 'var(--retro-orange)' :
                                     'var(--retro-blue)';
          return html`
            <div
              class="map-dot"
              style="left: ${x}%; top: ${y}px; background: ${color};"
              title="${s.name} · ${s.city}"
              @click=${() => this._selectStadium(s)}>
            </div>
          `;
        })}
        <div class="map-legend">16 PUNTOS · 3 PAÍSES · COLOR = FASE MÁX.</div>
      </div>
    `;
  }

  private _renderRow(s: Stadium) {
    const cc = countryCode(s.country);
    const phases = getPhases(s);
    const hasHighlight = /final|semifinal|tercer puesto|inaugural|debut/i.test(s.highlight);

    return html`
      <div class="stadium-row" @click=${() => this._selectStadium(s)}>
        <img class="row-img" src="${s.image}" alt="${s.name}" loading="lazy">

        <div class="row-flag">
          <div class="emoji">${COUNTRY_FLAG[cc] || '🏟️'}</div>
          <div class="code">${cc}</div>
        </div>

        <div class="row-info">
          <div class="row-name">${s.name}</div>
          <div class="row-city">${s.city.toUpperCase()}</div>
          ${hasHighlight
            ? html`<div class="row-note">★ ${s.highlight}</div>`
            : ''}
        </div>

        <div class="row-meta">
          <div class="big">${phases.length || '—'}</div>
          <div class="label">FASES</div>
          <div class="cap">${(s.capacity / 1000).toFixed(0)}K asientos</div>
        </div>

        <div class="row-phases">
          ${phases.length === 0
            ? html`<span style="font-family: var(--font-mono); font-size: 10px; color: var(--dim);">Fases por confirmar</span>`
            : phases.map(p => html`
                <span class="phase-chip ${p}" data-phase="${p}">${PHASE_LABEL[p]}</span>
              `)}
        </div>
      </div>
    `;
  }

  private _selectStadium(stadium: Stadium | null) {
    this._selectedStadium = stadium;
  }
}

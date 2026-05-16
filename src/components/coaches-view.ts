import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { COACHES } from '../data/coaches/index';
import { TEAMS_2026 } from '../data/fifa-2026';
import { renderFlag } from '../lib/render-flag';
import { coachAge, formatFullDate } from '../lib/date-utils';
import { t, useLocaleStore } from '../i18n';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

@customElement('coaches-view')
export class CoachesView extends LitElement {
  @state() private selectedTeamId: string | null = null;

  static styles = css`
    :host {
      display: block;
    }

    /* ── Groups list ── */
    .groups-stack {
      display: grid;
      gap: 20px;
    }

    .group-block {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: var(--paper);
      overflow: hidden;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 3px solid var(--ink);
      background: var(--retro-blue);
      color: var(--paper);
    }

    .group-title {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1;
    }

    .group-sub {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 14px;
      padding: 16px;
      background: radial-gradient(circle at top left, rgba(255,255,255,0.45), transparent 48%),
                  var(--paper-2);
    }

    /* ── Coach card (gallery) ── */
    .coach-card-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 3px solid var(--ink);
      background: var(--paper);
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }

    .coach-card-btn:hover {
      background: var(--retro-yellow);
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 var(--ink);
    }

    .card-photo {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: var(--retro-blue);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 3px solid var(--ink);
      position: relative;
    }

    .card-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    .card-photo-initials {
      font-family: var(--font-mono);
      font-size: 40px;
      font-weight: bold;
      color: var(--paper);
      letter-spacing: -0.02em;
    }

    .card-country-stripe {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px 4px;
    }

    .card-country-name {
      font-family: var(--font-display);
      font-size: 13px;
      color: var(--ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-coach-name {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink);
      padding: 0 10px 4px;
      font-weight: bold;
      letter-spacing: 0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-meta {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      padding: 0 10px 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .card-no-coach {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      padding: 0 10px 10px;
      letter-spacing: 0.04em;
      font-style: italic;
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
      background: var(--retro-orange);
      color: var(--paper);
    }

    .detail-title {
      display: flex;
      align-items: center;
      gap: 12px;
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

    /* ── Coach detail body ── */
    .detail-body {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 0;
    }

    .detail-photo-col {
      border-right: 4px solid var(--ink);
      background: var(--retro-blue);
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .detail-photo-wrap {
      width: 100%;
      aspect-ratio: 3 / 4;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--retro-blue);
      flex: 1;
    }

    .detail-photo-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    .detail-photo-initials {
      font-family: var(--font-mono);
      font-size: 64px;
      font-weight: bold;
      color: var(--paper);
      letter-spacing: -0.02em;
    }

    .detail-info-col {
      display: flex;
      flex-direction: column;
      gap: 0;
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

    .detail-name-block {
      padding: 18px 20px 14px;
      border-bottom: 3px solid var(--ink);
      background: var(--paper-2);
    }

    .detail-coach-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 6px;
    }

    .detail-coach-name {
      font-family: var(--font-display);
      font-size: 26px;
      color: var(--ink);
      line-height: 1.1;
    }

    .detail-bio-block {
      padding: 20px;
      flex: 1;
      background: var(--paper);
    }

    .detail-bio-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 10px;
    }

    .detail-bio-text {
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--ink);
      line-height: 1.7;
    }

    .detail-pending {
      padding: 24px 20px;
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--dim);
      line-height: 1.6;
      font-style: italic;
    }

    @media (max-width: 768px) {
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

      .detail-photo-initials {
        font-size: 48px;
      }

      .detail-stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .stat-value-large {
        font-size: 28px;
      }

      .detail-coach-name {
        font-size: 22px;
      }

      .teams-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 12px;
      }
    }
  `;

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private selectTeam(id: string) {
    this.selectedTeamId = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private goBack() {
    this.selectedTeamId = null;
  }

  private renderGroupsList() {
    const groups = 'ABCDEFGHIJKL'.split('');

    return html`
      <div class="groups-stack">
        ${groups.map(group => {
          const teamsInGroup = TEAMS_2026.filter(t => t.group === group);
          return html`
            <section class="group-block">
              <div class="group-header">
                <div class="group-title">Grupo ${group}</div>
                <div class="group-sub">${teamsInGroup.length} selecciones</div>
              </div>
              <div class="teams-grid">
                ${teamsInGroup.map(team => {
                  const coach = COACHES[team.id];
                  return html`
                    <button class="coach-card-btn" @click=${() => this.selectTeam(team.id)}>
                      <div class="card-photo">
                        ${coach?.photoUrl
                          ? html`<img src="${coach.photoUrl}" alt="${coach.name}" loading="lazy">`
                          : html`<div class="card-photo-initials">${getInitials(coach ? coach.name : team.name)}</div>`}
                      </div>
                      <div class="card-country-stripe">
                        ${renderFlag(team, 'sm')}
                        <span class="card-country-name">${team.name}</span>
                      </div>
                      ${coach ? html`
                        <div class="card-coach-name">${coach.name}</div>
                        <div class="card-meta">${coach.nationality} · ${coachAge(coach.born)} años</div>
                      ` : html`
                        <div class="card-no-coach">Por definir</div>
                      `}
                    </button>
                  `;
                })}
              </div>
            </section>
          `;
        })}
      </div>
    `;
  }

  render() {
    if (!this.selectedTeamId) {
      return this.renderGroupsList();
    }

    const selectedTeam = TEAMS_2026.find(t => t.id === this.selectedTeamId);
    if (!selectedTeam) {
      return this.renderGroupsList();
    }

    const coach = COACHES[selectedTeam.id];
    const locale = useLocaleStore.getState().locale;

    return html`
      <button class="back-btn" @click=${() => this.goBack()}>${t('squads.back')}</button>

      <section class="detail-panel">
        <div class="detail-header">
          <div>
            <div class="detail-title">${renderFlag(selectedTeam, 'lg')} ${selectedTeam.name}</div>
            <div class="detail-sub">
              Grupo ${selectedTeam.group} · ${t('squads.coach.title')}
            </div>
          </div>
        </div>

        <div class="detail-body">
          <!-- Photo column -->
          <div class="detail-photo-col">
            <div class="detail-photo-wrap">
              ${coach?.photoUrl
                ? html`<img src="${coach.photoUrl}" alt="${coach?.name}" loading="lazy">`
                : html`<div class="detail-photo-initials">${getInitials(coach ? coach.name : selectedTeam.name)}</div>`}
            </div>
          </div>

          <!-- Info column -->
          <div class="detail-info-col">
            <div class="detail-name-block">
              <div class="detail-coach-label">${t('squads.coach.title')}</div>
              <div class="detail-coach-name">${coach ? coach.name : 'Por definir'}</div>
            </div>

            ${coach ? html`
              <div class="detail-stats-grid">
                <div class="stat-cell">
                  <div class="stat-label">Edad</div>
                  <div class="stat-value-large">${coachAge(coach.born)}</div>
                </div>
                <div class="stat-cell">
                  <div class="stat-label">Nacionalidad</div>
                  <div class="stat-value">${coach.nationality}</div>
                </div>
                <div class="stat-cell">
                  <div class="stat-label">Fecha de nacimiento</div>
                  <div class="stat-value">${formatFullDate(coach.born)}</div>
                </div>
                <div class="stat-cell">
                  <div class="stat-label">Grupo</div>
                  <div class="stat-value">Grupo ${selectedTeam.group}</div>
                </div>
              </div>
              <div class="detail-bio-block">
                <div class="detail-bio-label">Trayectoria</div>
                <div class="detail-bio-text">${coach.bio[locale] ?? coach.bio.es}</div>
              </div>
            ` : html`
              <div class="detail-pending">
                La federación de ${selectedTeam.name} aún no ha confirmado a su seleccionador
                oficial para el torneo.
              </div>
            `}
          </div>
        </div>
      </section>
    `;
  }
}

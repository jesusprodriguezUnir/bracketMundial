import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { COACHES } from '../data/coaches/index';
import { TEAMS_2026 } from '../data/fifa-2026';
import { renderFlag } from '../lib/render-flag';
import { coachAge } from '../lib/date-utils';
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
      gap: 18px;
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
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      padding: 14px;
      background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.45), transparent 48%), var(--paper-2);
    }

    .team-card {
      all: unset;
      cursor: pointer;
      display: grid;
      gap: 8px;
      padding: 14px;
      border: 3px solid var(--ink);
      background: var(--paper);
      box-shadow: var(--shadow-hard-sm);
      min-height: 92px;
    }

    .team-card:hover {
      background: var(--retro-yellow);
    }

    .team-name {
      font-family: var(--font-display);
      font-size: 16px;
      color: var(--ink);
    }

    .team-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* ── Detail view ── */
    .back-btn {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin-bottom: 14px;
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
      padding: 18px;
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
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    /* ── Coach card ── */
    .coach-card {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      padding: 24px;
      background: var(--paper-2);
    }

    .coach-avatar {
      flex-shrink: 0;
      width: 140px;
      height: 140px;
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--retro-blue);
      color: var(--paper);
      font-family: var(--font-mono);
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 0;
    }

    .coach-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(1) contrast(1.1);
    }

    .coach-body {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .coach-label {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
    }

    .coach-name {
      font-family: var(--font-display);
      font-size: 28px;
      color: var(--ink);
      line-height: 1.1;
    }

    .coach-meta {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--dim);
      letter-spacing: 0.06em;
    }

    .coach-bio {
      margin-top: 12px;
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--ink);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .detail-title {
        font-size: 28px;
      }
      .coach-card {
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
      }
      .coach-avatar {
        width: 100px;
        height: 100px;
        font-size: 24px;
      }
      .coach-name {
        font-size: 22px;
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
    // Hacemos scroll al inicio cuando cambiamos de vista
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
                <div class="group-sub">4 entrenadores</div>
              </div>
              <div class="teams-grid">
                ${teamsInGroup.map(team => {
                  const coach = COACHES[team.id];
                  return html`
                    <button class="team-card" @click=${() => this.selectTeam(team.id)}>
                      ${renderFlag(team, 'md')}
                      <div class="team-name">${team.name}</div>
                      <div class="team-meta">
                        ${coach ? coach.name : 'Por definir'}
                      </div>
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
              Grupo ${selectedTeam.group} · Entrenador
            </div>
          </div>
        </div>

        <div class="coach-card">
          <div class="coach-avatar">
            ${coach && coach.photoUrl
              ? html`<img src="${coach.photoUrl}" alt="${coach.name}" loading="lazy">`
              : html`${getInitials(coach ? coach.name : 'Por definir')}`}
          </div>
          <div class="coach-body">
            <div class="coach-label">${t('squads.coach.title')}</div>
            <div class="coach-name">${coach ? coach.name : 'Por definir'}</div>
            ${coach ? html`
              <div class="coach-meta">${coach.nationality} · ${coachAge(coach.born)} años</div>
              <div class="coach-bio">${(coach.bio as any)[locale] || coach.bio.es}</div>
            ` : html`
              <div class="coach-bio">La federación de ${selectedTeam.name} aún no ha confirmado a su seleccionador oficial para el torneo.</div>
            `}
          </div>
        </div>
      </section>
    `;
  }
}

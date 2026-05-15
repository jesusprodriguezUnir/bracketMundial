import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import { getSquad } from '../data/squads';
import { renderFlag } from '../lib/render-flag';
import { formatShortDate } from '../lib/date-utils';
import { useTournamentStore } from '../store/tournament-store';

interface TeamMatchSummary {
  id: string;
  phase: string;
  date: string;
  timeSpain: string;
  venue: string;
  city: string;
  opponentId: string | null;
}

@customElement('squads-view')
export class SquadsView extends LitElement {
  @state() private selectedTeamId: string | null = null;
  @state() private activeTab: 'squad' | 'matches' | 'venues' = 'squad';

  private unsubscribeStore?: () => void;

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
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    /* ── Mobile tabs (hidden on desktop) ── */

    .tabs {
      display: none;
      border-bottom: 4px solid var(--ink);
    }

    .tabs button {
      all: unset;
      cursor: pointer;
      flex: 1;
      padding: 12px 8px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink);
      border-right: 3px solid var(--ink);
      background: var(--paper-2);
    }

    .tabs button:last-child {
      border-right: none;
    }

    .tabs button.active {
      background: var(--retro-orange);
      color: var(--paper);
    }

    /* ── Detail grid: 3 columns ── */

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
    }

    .panel-block {
      padding: 18px;
      border-right: 3px solid var(--ink);
      min-height: 0;
    }

    .panel-block:last-child {
      border-right: none;
    }

    .panel-title {
      font-family: var(--font-var);
      font-size: 22px;
      color: var(--ink);
      margin-bottom: 12px;
    }

    .table-wrap {
      overflow-x: auto;
      border: 2px solid var(--ink);
      background: var(--paper-2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 380px;
    }

    th,
    td {
      padding: 10px 12px;
      border-bottom: 2px solid var(--ink);
      text-align: left;
    }

    th {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: var(--paper);
      color: var(--dim);
    }

    td {
      font-family: var(--font-display);
      font-size: 14px;
      color: var(--ink);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .captain {
      color: var(--retro-red);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.06em;
      margin-left: 6px;
    }

    .matches-list,
    .venues-grid {
      display: grid;
      gap: 12px;
    }

    .match-card,
    .venue-card {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      overflow: hidden;
    }

    .match-card {
      padding: 14px;
    }

    .match-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .match-opponent {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 16px;
      color: var(--ink);
    }

    .match-venue {
      margin-top: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.05em;
    }

    .venue-card img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-bottom: 3px solid var(--ink);
    }

    .venue-copy {
      padding: 12px;
      display: grid;
      gap: 4px;
    }

    .venue-name {
      font-family: var(--font-display);
      font-size: 15px;
      color: var(--ink);
    }

    .venue-city {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.05em;
    }

    .empty {
      padding: 28px 20px;
      border: 3px dashed var(--ink);
      background: var(--paper-2);
      font-family: var(--font-display);
      text-align: center;
      color: var(--ink);
    }

    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .panel-block {
        border-right: none;
        border-bottom: 3px solid var(--ink);
      }

      .panel-block:last-child {
        border-bottom: none;
      }

      .panel-block.tab-hidden {
        display: none;
      }

      .detail-title {
        font-size: 28px;
      }

      .tabs {
        display: flex;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = useTournamentStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    super.disconnectedCallback();
  }

  private getTeam(teamId: string | null) {
    return TEAMS_2026.find(team => team.id === teamId);
  }

  private getTeamMatches(teamId: string): TeamMatchSummary[] {
    const store = useTournamentStore.getState();

    const groupMatches = store.groupMatches
      .filter(match => match.teamA === teamId || match.teamB === teamId)
      .map(match => ({
        id: match.matchId,
        phase: `Grupo ${match.group}`,
        date: match.date ?? '',
        timeSpain: match.timeSpain ?? '',
        venue: match.venue ?? 'TBD',
        city: match.city ?? 'TBD',
        opponentId: match.teamA === teamId ? match.teamB : match.teamA,
      }));

    const knockoutMatches = Object.values(store.knockoutMatches)
      .filter(match => match.isPlayed && (match.teamA === teamId || match.teamB === teamId))
      .map(match => ({
        id: match.matchId,
        phase: this.labelKnockout(match.matchId),
        date: match.date ?? '',
        timeSpain: match.timeSpain ?? '',
        venue: match.venue ?? 'TBD',
        city: match.city ?? 'TBD',
        opponentId: match.teamA === teamId ? match.teamB : match.teamA,
      }));

    return [...groupMatches, ...knockoutMatches].sort((left, right) => {
      const leftKey = `${left.date || '9999-12-31'}T${left.timeSpain || '23:59'}`;
      const rightKey = `${right.date || '9999-12-31'}T${right.timeSpain || '23:59'}`;
      return leftKey.localeCompare(rightKey);
    });
  }

  private labelKnockout(matchId: string) {
    if (matchId.startsWith('R32')) return '1/16';
    if (matchId.startsWith('R16')) return 'Octavos';
    if (matchId.startsWith('QF')) return 'Cuartos';
    if (matchId.startsWith('SF')) return 'Semifinal';
    if (matchId.startsWith('TP')) return '3er puesto';
    return 'Final';
  }

  private formatDate(date: string, timeSpain: string) {
    if (!date) return 'Fecha por confirmar';
    const base = formatShortDate(date);
    return `${base} · ${timeSpain || '--:--'} ESP`;
  }

  private selectTeam(id: string) {
    this.selectedTeamId = id;
    this.activeTab = 'squad';
  }

  private goBack() {
    this.selectedTeamId = null;
    this.activeTab = 'squad';
  }

  render() {
    if (!this.selectedTeamId) {
      return this.renderGroupsList();
    }

    const selectedTeam = this.getTeam(this.selectedTeamId);
    if (!selectedTeam) {
      return this.renderGroupsList();
    }

    const squad = getSquad(selectedTeam.id);
    const teamMatches = this.getTeamMatches(selectedTeam.id);
    const venueMap = teamMatches.reduce<Map<string, (typeof STADIUMS)[number]>>((map, match) => {
      const stadium = STADIUMS.find(item => item.name === match.venue);
      if (stadium) map.set(stadium.id, stadium);
      return map;
    }, new Map());

    return html`
      <button class="back-btn" @click=${() => this.goBack()}>← Volver a equipos</button>

      <section class="detail-panel">
        <div class="detail-header">
          <div>
            <div class="detail-title">${renderFlag(selectedTeam, 'lg')} ${selectedTeam.name}</div>
            <div class="detail-sub">Grupo ${selectedTeam.group} · ${squad.length} jugadores · ${teamMatches.length} partidos visibles</div>
          </div>
        </div>

        <nav class="tabs" role="tablist">
          <button class=${this.activeTab === 'squad' ? 'active' : ''} @click=${() => { this.activeTab = 'squad'; }}>Plantilla</button>
          <button class=${this.activeTab === 'matches' ? 'active' : ''} @click=${() => { this.activeTab = 'matches'; }}>Partidos</button>
          <button class=${this.activeTab === 'venues' ? 'active' : ''} @click=${() => { this.activeTab = 'venues'; }}>Sedes</button>
        </nav>

        <div class="detail-grid">
          <div class="panel-block ${this.activeTab !== 'squad' ? 'tab-hidden' : ''}">
            <div class="panel-title">Plantilla</div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Pos</th>
                    <th>Edad</th>
                    <th>Club</th>
                  </tr>
                </thead>
                <tbody>
                  ${squad.map(player => html`
                    <tr>
                      <td>${player.number}</td>
                      <td>
                        ${player.name}
                        ${player.captain ? html`<span class="captain">CAP</span>` : ''}
                      </td>
                      <td>${player.position}</td>
                      <td>${player.age}</td>
                      <td>${player.club}</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>

          <div class="panel-block ${this.activeTab !== 'matches' ? 'tab-hidden' : ''}">
            <div class="panel-title">Partidos</div>
            <div class="matches-list">
              ${teamMatches.map(match => {
                const opponent = this.getTeam(match.opponentId);
                return html`
                  <article class="match-card">
                    <div class="match-top">
                      <span>${match.phase}</span>
                      <span>${this.formatDate(match.date, match.timeSpain)}</span>
                    </div>
                    <div class="match-opponent">
                      ${renderFlag(opponent, 'sm')}
                      <span>${opponent?.name ?? 'Rival por decidir'}</span>
                    </div>
                    <div class="match-venue">${match.venue} · ${match.city}</div>
                  </article>
                `;
              })}
            </div>
          </div>

          <div class="panel-block ${this.activeTab !== 'venues' ? 'tab-hidden' : ''}">
            <div class="panel-title">Sedes</div>
            ${venueMap.size === 0
              ? html`<div class="empty">Todavía no hay sedes confirmadas para esta selección.</div>`
              : html`
                <div class="venues-grid">
                  ${[...venueMap.values()].map(stadium => html`
                    <article class="venue-card">
                      <img src="${stadium.image}" alt="${stadium.name}">
                      <div class="venue-copy">
                        <div class="venue-name">${stadium.name}</div>
                        <div class="venue-city">${stadium.city} · ${stadium.country}</div>
                      </div>
                    </article>
                  `)}
                </div>
              `}
          </div>
        </div>
      </section>
    `;
  }

  private renderGroupsList() {
    const groups = 'ABCDEFGHIJKL'.split('');
    return html`
      <div class="groups-stack">
        ${groups.map(group => html`
          <section class="group-block">
            <div class="group-header">
              <div class="group-title">Grupo ${group}</div>
              <div class="group-sub">4 selecciones</div>
            </div>
            <div class="teams-grid">
              ${TEAMS_2026.filter(team => team.group === group).map(team => html`
                <button class="team-card" @click=${() => this.selectTeam(team.id)}>
                  ${renderFlag(team, 'md')}
                  <div class="team-name">${team.name}</div>
                  <div class="team-meta">${getSquad(team.id).length} jugadores cargados</div>
                </button>
              `)}
            </div>
          </section>
        `)}
      </div>
    `;
  }
}

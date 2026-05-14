import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';

const fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function formatDate(iso?: string): string {
  if (!iso) return '';
  return fmt.format(new Date(iso));
}

@customElement('groups-view')
export class GroupsView extends LitElement {
  private unsubscribeStore?: () => void;

  static styles = css`
    :host { display: block; }
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .group-card {
      background: var(--navy-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .group-header {
      background: rgba(255, 255, 255, 0.03);
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .group-header h3 {
      font-size: 0.9rem;
      margin: 0;
      color: var(--neon-lime);
      font-family: var(--font-display);
    }
    .group-badge {
      font-size: 0.7rem;
      color: var(--text-dim);
      font-weight: 800;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
    }
    th {
      text-align: left;
      padding: 8px 12px;
      color: var(--text-dim);
      font-weight: 400;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border-color);
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
    .col-num { width: 20px; text-align: center; color: var(--text-dim); }
    .col-pts { font-weight: 800; color: var(--off-white); width: 30px; text-align: center; }
    .col-stat { width: 24px; text-align: center; color: var(--text-dim); }
    .team-cell { display: flex; align-items: center; gap: 8px; }
    .team-flag { font-size: 1rem; }
    .team-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
      font-weight: 600;
    }

    .matches-list {
      padding: 8px;
      background: rgba(0, 0, 0, 0.2);
    }
    .match-item {
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.75rem;
      margin-bottom: 4px;
    }
    .match-item:hover {
      background: rgba(255, 255, 255, 0.05);
      transform: translateX(4px);
    }
    .match-item:last-child { margin-bottom: 0; }

    .match-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .match-teams { display: flex; align-items: center; gap: 8px; flex: 1; color: var(--text-dim); }
    .match-teams strong { color: var(--off-white); font-weight: 600; }
    .match-score {
      font-family: var(--font-display);
      font-weight: 800;
      color: var(--neon-blue);
      background: rgba(0, 240, 255, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      min-width: 44px;
      text-align: center;
    }
    .match-score.pending {
      color: var(--text-dim);
      background: rgba(255, 255, 255, 0.05);
    }
    .match-meta {
      margin-top: 3px;
      font-size: 0.65rem;
      color: var(--text-dim);
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }
    .match-meta .jornada {
      color: rgba(212,255,0,0.7);
      font-weight: 700;
    }
    .badge-played {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(0, 240, 255, 0.15);
      color: var(--neon-blue);
      text-transform: uppercase;
    }
    .badge-upcoming {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      background: rgba(255,255,255,0.06);
      color: var(--text-dim);
      text-transform: uppercase;
    }

    .qualified-1 { border-left: 3px solid var(--neon-lime); }
    .qualified-2 { border-left: 3px solid var(--neon-blue); }

    .group-actions {
      display: flex;
      gap: 8px;
      padding: 24px 0;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--border-color);
    }

    /* --- Tabla de mejores terceros --- */
    .thirds-section {
      margin-top: 40px;
      padding: 24px;
      background: var(--navy-surface);
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    .thirds-title {
      font-family: var(--font-display);
      font-size: 0.85rem;
      color: var(--neon-magenta);
      margin: 0 0 16px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .thirds-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.75rem;
    }
    .thirds-table th {
      text-align: left;
      padding: 6px 10px;
      color: var(--text-dim);
      font-weight: 400;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border-color);
    }
    .thirds-table td {
      padding: 7px 10px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .thirds-table .rank { width: 24px; text-align: center; color: var(--neon-magenta); font-weight: 800; }
    .thirds-table .col-pts { font-weight: 800; color: var(--off-white); width: 30px; text-align: center; }
    .thirds-table .col-stat { width: 30px; text-align: center; color: var(--text-dim); }
    .thirds-table .qualify { color: var(--neon-lime); }

    @media (max-width: 768px) {
      .groups-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .group-card {
        animation: fadeSlideIn 0.3s ease both;
        animation-delay: calc(var(--i, 0) * 40ms);
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
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

  private getTeam(id: string) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private openMatch(matchId: string) {
    this.dispatchEvent(new CustomEvent('open-match', {
      detail: { matchId },
      bubbles: true,
      composed: true
    }));
  }

  private handleSimulateAll() {
    useTournamentStore.getState().autoSimulateGroups();
  }

  private handleReset() {
    useTournamentStore.getState().resetTournament();
  }

  render() {
    const store = useTournamentStore.getState();
    const groups = 'ABCDEFGHIJKL'.split('');

    const playedTotal = store.groupMatches.filter(m => m.scoreA !== null).length;
    const showThirds = playedTotal > 0;
    const bestThirds = showThirds ? store.getBestThirds() : [];

    return html`
      <div class="group-actions">
        <button class="btn" @click="${this.handleSimulateAll}">Simular Fase de Grupos</button>
        <button class="btn" style="color: var(--neon-magenta)" @click="${this.handleReset}">Reiniciar Todo</button>
      </div>

      <div class="groups-grid">
        ${groups.map((g, gIdx) => {
          const standings = store.groupStandings[g] || [];
          const matches = store.groupMatches.filter(m => m.group === g);
          const playedCount = matches.filter(m => m.scoreA !== null).length;

          return html`
            <div class="group-card" id="group-${g}" style="--i:${gIdx}">
              <div class="group-header">
                <h3>GRUPO ${g}</h3>
                <span class="group-badge">${playedCount}/6 JUGADOS</span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th class="col-num">#</th>
                    <th>EQUIPO</th>
                    <th class="col-stat">PJ</th>
                    <th class="col-stat">DG</th>
                    <th class="col-pts">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  ${standings.map((s, idx) => {
                    const team = this.getTeam(s.teamId);
                    return html`
                      <tr class="${idx < 2 ? `qualified-${idx+1}` : ''}">
                        <td class="col-num">${idx + 1}</td>
                        <td>
                          <div class="team-cell">
                            <span class="team-flag">${team?.flag}</span>
                            <span class="team-name">${team?.shortName}</span>
                          </div>
                        </td>
                        <td class="col-stat">${s.played}</td>
                        <td class="col-stat">${s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                        <td class="col-pts">${s.points}</td>
                      </tr>
                    `;
                  })}
                </tbody>
              </table>
              <div class="matches-list">
                ${matches.map(m => {
                  const tA = this.getTeam(m.teamA);
                  const tB = this.getTeam(m.teamB);
                  const isPlayed = m.scoreA !== null;
                  return html`
                    <div class="match-item" @click="${() => this.openMatch(m.matchId)}">
                      <div class="match-top">
                        <div class="match-teams">
                          <strong>${tA?.shortName}</strong>
                          <span>vs</span>
                          <strong>${tB?.shortName}</strong>
                        </div>
                        <div class="match-score ${!isPlayed ? 'pending' : ''}">
                          ${isPlayed ? `${m.scoreA} - ${m.scoreB}` : 'EDITAR'}
                        </div>
                      </div>
                      <div class="match-meta">
                        <span class="jornada">J${m.matchDay}</span>
                        ${m.date ? html`<span>${formatDate(m.date)}</span>` : ''}
                        ${m.city ? html`<span>· ${m.city}</span>` : ''}
                        <span class="${isPlayed ? 'badge-played' : 'badge-upcoming'}">${isPlayed ? 'JUGADO' : 'PRÓXIMO'}</span>
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          `;
        })}
      </div>

      ${showThirds && bestThirds.length > 0 ? html`
        <div class="thirds-section">
          <h3 class="thirds-title">Mejores 8 Terceros clasificados</h3>
          <table class="thirds-table">
            <thead>
              <tr>
                <th class="rank">#</th>
                <th>EQUIPO</th>
                <th class="col-stat">GRP</th>
                <th class="col-stat">DG</th>
                <th class="col-pts">PTS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${bestThirds.map((t, idx) => {
                const team = this.getTeam(t.id);
                return html`
                  <tr>
                    <td class="rank">${idx + 1}</td>
                    <td>
                      <div class="team-cell">
                        <span class="team-flag">${team?.flag}</span>
                        <span class="team-name">${team?.shortName}</span>
                      </div>
                    </td>
                    <td class="col-stat">${t.group}</td>
                    <td class="col-stat">${t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
                    <td class="col-pts">${t.points}</td>
                    <td>${idx < 8 ? html`<span class="qualify">✓</span>` : ''}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  }
}

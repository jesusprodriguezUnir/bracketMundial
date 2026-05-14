import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';

const fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function formatDate(iso?: string): string {
  if (!iso) return '';
  return fmt.format(new Date(iso));
}

// Colores de cabecera de grupo — rotan entre los 4 retro
const GROUP_COLORS = [
  'var(--retro-orange)',
  'var(--retro-blue)',
  'var(--retro-green)',
  'var(--retro-red)',
];

@customElement('groups-view')
export class GroupsView extends LitElement {
  private unsubscribeStore?: () => void;

  static styles = css`
    :host { display: block; }

    /* Acciones de grupo */
    .group-actions {
      display: flex;
      gap: 10px;
      padding: 0 0 22px;
      margin-bottom: 22px;
      border-bottom: 3px dashed var(--ink);
    }

    /* Grid de grupos */
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    /* Card Panini sticker */
    .group-card {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Cabecera con color + halftone */
    .group-header {
      padding: 8px 12px;
      border-bottom: 3px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* color e imagen vienen como style inline */
      color: var(--paper);
      background-image: var(--halftone);
    }
    .group-header-title {
      font-family: var(--font-var);
      font-size: 20px;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .group-header-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--paper);
      color: var(--ink);
      padding: 2px 6px;
      letter-spacing: 0.1em;
    }

    /* Tabla de clasificación */
    .standings {
      padding: 8px 10px;
    }
    .standing-row {
      display: grid;
      grid-template-columns: 20px 1fr auto auto;
      gap: 8px;
      align-items: center;
      padding: 4px 0;
    }
    .standing-row + .standing-row {
      border-top: 1px dotted rgba(26,25,51,0.2);
    }
    .standing-row.muted {
      opacity: 0.6;
    }

    .rank-badge {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--dim);
    }
    .rank-badge.qualify {
      border: 2px solid var(--retro-red);
      color: var(--retro-red);
      font-size: 11px;
    }

    .team-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 15px; flex-shrink: 0; }
    .team-short {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wdl {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .pts {
      font-family: var(--font-var);
      font-size: 18px;
      line-height: 1;
      color: var(--ink);
      min-width: 18px;
      text-align: right;
    }
    .pts.muted { color: var(--dim); }

    /* Lista de partidos */
    .matches-list {
      padding: 8px;
      background: rgba(26,25,51,0.04);
      border-top: 2px solid var(--ink);
    }

    .match-item {
      padding: 6px 8px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      cursor: pointer;
      background: var(--paper-3);
      margin-bottom: 6px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .match-item:last-child { margin-bottom: 0; }
    .match-item:hover {
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 0 var(--ink);
    }
    .match-item:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }

    .match-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .match-teams {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      flex: 1;
      overflow: hidden;
    }
    .match-teams .vs {
      color: var(--dim);
      font-weight: 400;
    }
    .match-score {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--paper);
      background: var(--retro-blue);
      border: 2px solid var(--ink);
      padding: 2px 8px;
      min-width: 44px;
      text-align: center;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .match-score.pending {
      background: var(--paper-2);
      color: var(--dim);
      font-size: 11px;
    }

    .match-meta {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
      letter-spacing: 0.05em;
    }
    .jornada {
      color: var(--retro-red);
      font-weight: 700;
    }

    .badge {
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 1px 5px;
      border: 1px solid var(--ink);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .badge-played {
      background: var(--retro-yellow);
      color: var(--ink);
    }
    .badge-upcoming {
      background: var(--paper-2);
      color: var(--dim);
    }

    /* Tabla de mejores terceros */
    .thirds-section {
      margin-top: 32px;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow: hidden;
    }
    .thirds-header {
      background: var(--retro-red);
      background-image: var(--halftone);
      color: var(--paper);
      padding: 8px 14px;
      border-bottom: 3px solid var(--ink);
      font-family: var(--font-var);
      font-size: 18px;
      letter-spacing: 0.02em;
    }
    .thirds-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .thirds-table th {
      text-align: left;
      padding: 6px 12px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border-bottom: 2px solid var(--ink);
      background: var(--paper);
    }
    .thirds-table td {
      padding: 6px 12px;
      border-bottom: 1px dotted rgba(26,25,51,0.2);
    }
    .thirds-table tr:last-child td { border-bottom: none; }
    .col-rank {
      width: 28px;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--retro-red);
      text-align: center;
    }
    .col-pts-val {
      font-family: var(--font-var);
      font-size: 16px;
      width: 30px;
      text-align: center;
    }
    .col-stat {
      width: 28px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
    }
    .qualify-check { color: var(--retro-green); font-weight: 700; }

    @media (max-width: 768px) {
      .groups-grid { grid-template-columns: 1fr; }
      .group-card { box-shadow: var(--shadow-hard-sm); }
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
        <button class="btn btn-primary" @click="${this.handleSimulateAll}">SIMULAR GRUPOS</button>
        <button class="btn" style="color: var(--retro-red)" @click="${this.handleReset}">REINICIAR TODO</button>
      </div>

      <div class="groups-grid">
        ${groups.map((g, gIdx) => {
          const standings = store.groupStandings[g] || [];
          const matches = store.groupMatches.filter(m => m.group === g);
          const playedCount = matches.filter(m => m.scoreA !== null).length;
          const accentColor = GROUP_COLORS[gIdx % 4];

          return html`
            <div class="group-card" id="group-${g}" style="--i:${gIdx}">
              <!-- Cabecera coloreada con halftone -->
              <div class="group-header" style="background-color: ${accentColor}">
                <span class="group-header-title">GRUPO ${g}</span>
                <span class="group-header-badge">${playedCount}/6 JUGADOS</span>
              </div>

              <!-- Standings retro -->
              <div class="standings">
                ${standings.map((s, idx) => {
                  const team = this.getTeam(s.teamId);
                  const top2 = idx < 2;
                  return html`
                    <div class="standing-row ${top2 ? '' : 'muted'}">
                      <div class="rank-badge ${top2 ? 'qualify' : ''}">${idx + 1}</div>
                      <div class="team-cell">
                        <span class="team-flag">${team?.flag ?? ''}</span>
                        <span class="team-short">${team?.shortName ?? s.teamId}</span>
                      </div>
                      <span class="wdl">${s.won}-${s.drawn}-${s.lost}</span>
                      <span class="pts ${top2 ? '' : 'muted'}">${s.points}</span>
                    </div>
                  `;
                })}
              </div>

              <!-- Partidos -->
              <div class="matches-list">
                ${matches.map(m => {
                  const tA = this.getTeam(m.teamA);
                  const tB = this.getTeam(m.teamB);
                  const isPlayed = m.scoreA !== null;
                  return html`
                    <div class="match-item" @click="${() => this.openMatch(m.matchId)}">
                      <div class="match-top">
                        <div class="match-teams">
                          <strong>${tA?.shortName ?? m.teamA}</strong>
                          <span class="vs">vs</span>
                          <strong>${tB?.shortName ?? m.teamB}</strong>
                        </div>
                        <div class="match-score ${!isPlayed ? 'pending' : ''}">
                          ${isPlayed ? `${m.scoreA} - ${m.scoreB}` : 'EDITAR'}
                        </div>
                      </div>
                      <div class="match-meta">
                        <span class="jornada">J${m.matchDay}</span>
                        ${m.date ? html`<span>${formatDate(m.date)}</span>` : ''}
                        ${m.city ? html`<span>· ${m.city}</span>` : ''}
                        <span class="badge ${isPlayed ? 'badge-played' : 'badge-upcoming'}">${isPlayed ? 'JUGADO' : 'PRÓXIMO'}</span>
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
          <div class="thirds-header">★ MEJORES 8 TERCEROS CLASIFICADOS</div>
          <table class="thirds-table">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th>EQUIPO</th>
                <th class="col-stat">GRP</th>
                <th class="col-stat">DG</th>
                <th class="col-pts-val">PTS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${bestThirds.map((t, idx) => {
                const team = this.getTeam(t.id);
                return html`
                  <tr>
                    <td class="col-rank">${idx + 1}</td>
                    <td>
                      <div class="team-cell">
                        <span class="team-flag">${team?.flag ?? ''}</span>
                        <span class="team-short">${team?.shortName ?? t.id}</span>
                      </div>
                    </td>
                    <td class="col-stat">${t.group}</td>
                    <td class="col-stat">${t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
                    <td class="col-pts-val">${t.points}</td>
                    <td>${idx < 8 ? html`<span class="qualify-check">✓</span>` : ''}</td>
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

import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { STADIUMS } from '../data/stadiums';
import { renderFlag } from '../lib/render-flag';
import { useTournamentStore } from '../store/tournament-store';
import type { MatchModal } from './match-modal';
import './match-modal';

interface CalendarRow {
  id: string;
  kind: 'group' | 'knockout';
  phaseKey: string;
  phaseLabel: string;
  date: string;
  timeSpain: string;
  venue: string;
  city: string;
  venueId: string;
  teamA: string | null;
  teamB: string | null;
  scoreA: number | null;
  scoreB: number | null;
  penaltyScoreA: number | null;
  penaltyScoreB: number | null;
}

const KNOCKOUT_LABELS: Array<{ key: string; label: string }> = [
  { key: 'R32', label: '1/16' },
  { key: 'R16', label: 'Octavos' },
  { key: 'QF', label: 'Cuartos' },
  { key: 'SF', label: 'Semis' },
  { key: 'TP', label: '3er puesto' },
  { key: 'FIN', label: 'Final' },
];

@customElement('calendar-view')
export class CalendarView extends LitElement {
  @state() private selectedDate = 'all';
  @state() private selectedVenue = 'all';
  @state() private selectedPhase = 'all';

  private unsubscribeStore?: () => void;

  public static readonly styles = css`
    :host {
      display: block;
    }

    .filters {
      display: grid;
      gap: 18px;
      margin-bottom: 22px;
      padding: 18px;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
    }

    .filter-block {
      display: grid;
      gap: 10px;
    }

    .filter-label {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      all: unset;
      cursor: pointer;
      padding: 8px 12px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper);
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink);
    }

    .chip.active {
      background: var(--retro-orange);
      color: var(--paper);
    }

    .summary {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      margin-bottom: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .day-group {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      margin-bottom: 18px;
      overflow: hidden;
      background: var(--paper);
    }

    .day-strip {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 12px 16px;
      background: var(--retro-blue);
      color: var(--paper);
      border-bottom: 3px solid var(--ink);
    }

    .day-title {
      font-family: var(--font-var);
      font-size: 26px;
      line-height: 1;
    }

    .day-count {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .matches {
      display: grid;
    }

    .match-row {
      all: unset;
      cursor: pointer;
      display: grid;
      grid-template-columns: 96px minmax(0, 1fr) 110px 180px;
      gap: 16px;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 2px solid var(--ink);
      background: var(--paper);
    }

    .match-row:nth-child(even) {
      background: var(--paper-2);
    }

    .match-row:last-child {
      border-bottom: none;
    }

    .match-row.disabled {
      cursor: default;
      opacity: 0.8;
    }

    .time-block {
      display: grid;
      gap: 4px;
    }

    .time {
      font-family: var(--font-var);
      font-size: 24px;
      line-height: 1;
      color: var(--ink);
    }

    .phase-badge {
      width: fit-content;
      padding: 4px 8px;
      border: 2px solid var(--ink);
      background: var(--retro-yellow);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .teams-block {
      display: grid;
      gap: 10px;
      min-width: 0;
    }

    .team-line {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      font-family: var(--font-display);
      font-size: 15px;
      color: var(--ink);
    }

    .team-line span:last-child {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .score {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 64px;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper);
      font-family: var(--font-var);
      font-size: 28px;
      color: var(--ink);
    }

    .venue-block {
      display: grid;
      gap: 4px;
      justify-items: start;
    }

    .venue {
      font-family: var(--font-display);
      font-size: 14px;
      color: var(--ink);
    }

    .city {
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
      color: var(--ink);
      text-align: center;
    }

    @media (max-width: 900px) {
      .match-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .score {
        justify-self: start;
        min-width: 110px;
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

  private getScoreLabel(row: CalendarRow) {
    if (row.scoreA === null || row.scoreB === null) {
      return 'vs';
    }

    const penaltiesLabel = row.penaltyScoreA !== null && row.penaltyScoreB !== null
      ? ` · pen ${row.penaltyScoreA}-${row.penaltyScoreB}`
      : '';

    return `${row.scoreA} × ${row.scoreB}${penaltiesLabel}`;
  }

  private getRows(): CalendarRow[] {
    const store = useTournamentStore.getState();

    const groupRows = store.groupMatches.map(match => {
      const stadium = STADIUMS.find(item => item.name === match.venue);
      return {
        id: match.matchId,
        kind: 'group' as const,
        phaseKey: match.group,
        phaseLabel: `Grupo ${match.group}`,
        date: match.date ?? '',
        timeSpain: match.timeSpain ?? '',
        venue: match.venue ?? 'TBD',
        city: match.city ?? 'TBD',
        venueId: stadium?.id ?? '',
        teamA: match.teamA,
        teamB: match.teamB,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        penaltyScoreA: null,
        penaltyScoreB: null,
      };
    });

    const knockoutRows = Object.entries(KNOCKOUT_SCHEDULE).map(([matchId, scheduled]) => {
      const match = store.knockoutMatches[matchId];
      const phaseKey = this.getKnockoutPhaseKey(matchId);
      return {
        id: matchId,
        kind: 'knockout' as const,
        phaseKey,
        phaseLabel: this.getKnockoutPhaseLabel(phaseKey),
        date: match?.date ?? scheduled.date,
        timeSpain: match?.timeSpain ?? scheduled.timeSpain,
        venue: match?.venue ?? scheduled.venue,
        city: match?.city ?? scheduled.city,
        venueId: scheduled.venueId,
        teamA: match?.teamA ?? null,
        teamB: match?.teamB ?? null,
        scoreA: match?.scoreA ?? null,
        scoreB: match?.scoreB ?? null,
        penaltyScoreA: match?.penaltyScoreA ?? null,
        penaltyScoreB: match?.penaltyScoreB ?? null,
      };
    });

    return [...groupRows, ...knockoutRows].sort((left, right) => {
      const leftKey = `${left.date}T${left.timeSpain}`;
      const rightKey = `${right.date}T${right.timeSpain}`;
      return leftKey.localeCompare(rightKey);
    });
  }

  private getKnockoutPhaseKey(matchId: string) {
    if (matchId.startsWith('R32')) return 'R32';
    if (matchId.startsWith('R16')) return 'R16';
    if (matchId.startsWith('QF')) return 'QF';
    if (matchId.startsWith('SF')) return 'SF';
    if (matchId.startsWith('TP')) return 'TP';
    return 'FIN';
  }

  private getKnockoutPhaseLabel(phaseKey: string) {
    return KNOCKOUT_LABELS.find(item => item.key === phaseKey)?.label ?? phaseKey;
  }

  private formatDateLabel(date: string) {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
    }).format(new Date(`${date}T00:00:00`));
  }

  private getFilteredRows() {
    return this.getRows().filter(row => {
      if (this.selectedDate !== 'all' && row.date !== this.selectedDate) return false;
      if (this.selectedVenue !== 'all' && row.venueId !== this.selectedVenue) return false;
      if (this.selectedPhase !== 'all' && row.phaseKey !== this.selectedPhase) return false;
      return true;
    });
  }

  private getGroupedRows(rows: CalendarRow[]) {
    return rows.reduce<Record<string, CalendarRow[]>>((groups, row) => {
      groups[row.date] = [...(groups[row.date] ?? []), row];
      return groups;
    }, {});
  }

  private openMatch(row: CalendarRow) {
    const teamA = row.teamA;
    const teamB = row.teamB;
    if (!teamA || !teamB) return;

    const modal = document.createElement('match-modal') as MatchModal;
    modal.matchId = row.id;
    modal.teamA = teamA;
    modal.teamB = teamB;
    modal.initialScoreA = row.scoreA;
    modal.initialScoreB = row.scoreB;
    modal.initialPenaltyScoreA = row.penaltyScoreA;
    modal.initialPenaltyScoreB = row.penaltyScoreB;
    modal.phase = row.kind === 'group' ? 'group' : 'knockout';
    modal.venue = row.venue;
    modal.city = row.city;
    modal.timeSpain = row.timeSpain;
    const stadium = STADIUMS.find(item => item.id === row.venueId || item.name === row.venue);
    if (stadium) {
      modal.stadiumImage = stadium.image;
    }

    const handleSave = (event: Event) => {
      const { scoreA, scoreB, penaltyScoreA, penaltyScoreB } = (event as CustomEvent).detail;
      const store = useTournamentStore.getState();
      if (row.kind === 'group') {
        store.setGroupMatchResult(row.id, scoreA, scoreB);
      } else {
        store.setKnockoutMatchResult(row.id, scoreA, scoreB, penaltyScoreA, penaltyScoreB);
      }
      modal.remove();
    };

    modal.addEventListener('save', handleSave);
    modal.addEventListener('close', () => modal.remove());
    document.body.appendChild(modal);
  }

  render() {
    const rows = this.getFilteredRows();
    const groupedRows = this.getGroupedRows(rows);
    const availableDates = [...new Set(this.getRows().map(row => row.date))];

    return html`
      <div class="filters">
        <div class="filter-block">
          <div class="filter-label">Día</div>
          <div class="chips">
            <button class="chip ${this.selectedDate === 'all' ? 'active' : ''}" @click=${() => { this.selectedDate = 'all'; }}>Todos</button>
            ${availableDates.map(date => html`
              <button class="chip ${this.selectedDate === date ? 'active' : ''}" @click=${() => { this.selectedDate = date; }}>
                ${this.formatDateLabel(date)}
              </button>
            `)}
          </div>
        </div>

        <div class="filter-block">
          <div class="filter-label">Sede</div>
          <div class="chips">
            <button class="chip ${this.selectedVenue === 'all' ? 'active' : ''}" @click=${() => { this.selectedVenue = 'all'; }}>Todas</button>
            ${STADIUMS.map(stadium => html`
              <button class="chip ${this.selectedVenue === stadium.id ? 'active' : ''}" @click=${() => { this.selectedVenue = stadium.id; }}>
                ${stadium.city}
              </button>
            `)}
          </div>
        </div>

        <div class="filter-block">
          <div class="filter-label">Grupo o ronda</div>
          <div class="chips">
            <button class="chip ${this.selectedPhase === 'all' ? 'active' : ''}" @click=${() => { this.selectedPhase = 'all'; }}>Todo</button>
            ${'ABCDEFGHIJKL'.split('').map(group => html`
              <button class="chip ${this.selectedPhase === group ? 'active' : ''}" @click=${() => { this.selectedPhase = group; }}>
                Grupo ${group}
              </button>
            `)}
            ${KNOCKOUT_LABELS.map(phase => html`
              <button class="chip ${this.selectedPhase === phase.key ? 'active' : ''}" @click=${() => { this.selectedPhase = phase.key; }}>
                ${phase.label}
              </button>
            `)}
          </div>
        </div>
      </div>

      <div class="summary">${rows.length} partidos visibles</div>

      ${rows.length === 0 ? html`<div class="empty">No hay partidos para los filtros activos.</div>` : ''}

      ${Object.entries(groupedRows).map(([date, dateRows]) => html`
        <section class="day-group">
          <div class="day-strip">
            <div class="day-title">${this.formatDateLabel(date)}</div>
            <div class="day-count">${dateRows.length} partidos</div>
          </div>

          <div class="matches">
            ${dateRows.map(row => {
              const teamA = this.getTeam(row.teamA);
              const teamB = this.getTeam(row.teamB);
              const clickable = Boolean(row.teamA && row.teamB);
              return html`
                <button class="match-row ${clickable ? '' : 'disabled'}" ?disabled=${!clickable} @click=${() => this.openMatch(row)}>
                  <div class="time-block">
                    <div class="time">${row.timeSpain || '--:--'}</div>
                    <div class="phase-badge">${row.phaseLabel}</div>
                  </div>

                  <div class="teams-block">
                    <div class="team-line">
                      ${renderFlag(teamA, 'sm')}
                      <span>${teamA?.name ?? 'Por decidir'}</span>
                    </div>
                    <div class="team-line">
                      ${renderFlag(teamB, 'sm')}
                      <span>${teamB?.name ?? 'Por decidir'}</span>
                    </div>
                  </div>

                  <div class="score">
                    ${this.getScoreLabel(row)}
                  </div>

                  <div class="venue-block">
                    <div class="venue">${row.venue}</div>
                    <div class="city">${row.city}</div>
                  </div>
                </button>
              `;
            })}
          </div>
        </section>
      `)}
    `;
  }
}
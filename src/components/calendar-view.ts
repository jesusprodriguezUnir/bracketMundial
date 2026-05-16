import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../data/match-schedule';
import { STADIUMS } from '../data/stadiums';
import { renderFlag } from '../lib/render-flag';
import { formatFullDate } from '../lib/date-utils';
import { useTournamentStore } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import type { MatchModal } from './match-modal';
import './match-modal';
import { t, useLocaleStore } from '../i18n';
import { getBroadcastInfo } from '../lib/broadcasting';

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

const KNOCKOUT_LABEL_KEYS: Array<{ key: string; i18nKey: 'calendar.r32' | 'calendar.r16' | 'calendar.qf' | 'calendar.sf' | 'calendar.tp' | 'tabs.final' }> = [
  { key: 'R32', i18nKey: 'calendar.r32' },
  { key: 'R16', i18nKey: 'calendar.r16' },
  { key: 'QF',  i18nKey: 'calendar.qf' },
  { key: 'SF',  i18nKey: 'calendar.sf' },
  { key: 'TP',  i18nKey: 'calendar.tp' },
  { key: 'FIN', i18nKey: 'tabs.final' },
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

    .broadcast-badge {
      display: inline-flex;
      gap: 4px;
      margin-top: 4px;
    }

    .badge-tv {
      padding: 2px 6px;
      border: 1px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: bold;
      letter-spacing: 0.05em;
    }

    .badge-rtve { background: var(--retro-red); color: var(--paper); }
    .badge-dazn { background: var(--ink); color: var(--retro-yellow); }

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

    .gcal-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 8px;
      padding: 4px 8px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--ink);
      text-decoration: none;
      white-space: nowrap;
    }

    .gcal-btn:hover {
      background: var(--retro-blue);
      color: var(--paper);
    }

    .gcal-btn svg {
      flex-shrink: 0;
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

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => ({ gm: s.groupMatches, km: s.knockoutMatches }),
      () => this.requestUpdate(),
      (a, b) => a.gm === b.gm && a.km === b.km,
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
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
        phaseLabel: t('groups.group', { letter: match.group }),
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
        teamA: (match?.isPlayed) ? match.teamA : null,
        teamB: (match?.isPlayed) ? match.teamB : null,
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
    const entry = KNOCKOUT_LABEL_KEYS.find(item => item.key === phaseKey);
    return entry ? t(entry.i18nKey) : phaseKey;
  }

  private formatDateLabel(date: string) {
    return formatFullDate(date);
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

  private buildGCalUrl(row: CalendarRow): string | null {
    if (!row.date || !row.timeSpain) return null;
    const [year, month, day] = row.date.split('-').map(Number);
    const [hour, minute] = row.timeSpain.split(':').map(Number);
    // World Cup is during CEST (UTC+2)
    const startUtc = new Date(Date.UTC(year, month - 1, day, hour - 2, minute));
    const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const teamAName = this.getTeam(row.teamA)?.name ?? 'Por decidir';
    const teamBName = this.getTeam(row.teamB)?.name ?? 'Por decidir';
    const text = encodeURIComponent(`${teamAName} vs ${teamBName} · FIFA Mundial 2026`);
    const dates = `${fmt(startUtc)}/${fmt(endUtc)}`;
    const details = encodeURIComponent(`${row.phaseLabel} · ${row.venue}, ${row.city}`);
    const location = encodeURIComponent(`${row.venue}, ${row.city}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
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
            ${KNOCKOUT_LABEL_KEYS.map(phase => html`
              <button class="chip ${this.selectedPhase === phase.key ? 'active' : ''}" @click=${() => { this.selectedPhase = phase.key; }}>
                ${t(phase.i18nKey)}
              </button>
            `)}
          </div>
        </div>
      </div>

      <div class="summary">${rows.length} partidos visibles</div>

      ${rows.length === 0 ? html`<div class="empty">${t('calendar.empty')}</div>` : ''}

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
              const gcalUrl = this.buildGCalUrl(row);
              return html`
                <div class="match-row ${clickable ? '' : 'disabled'}"
                     role="button"
                     tabindex=${clickable ? '0' : '-1'}
                     @click=${() => { if (clickable) this.openMatch(row); }}
                     @keydown=${(e: KeyboardEvent) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.openMatch(row); } }}>
                  <div class="time-block">
                    <div class="time">${row.timeSpain || '--:--'}</div>
                    <div class="phase-badge">${row.phaseLabel}</div>
                    <div class="broadcast-badge">
                      ${getBroadcastInfo(row.id, row.teamA ?? undefined, row.teamB ?? undefined) === 'BOTH' ? html`
                        <span class="badge-tv badge-rtve">RTVE</span>
                        <span class="badge-tv badge-dazn">DAZN</span>
                      ` : html`
                        <span class="badge-tv badge-dazn">DAZN</span>
                      `}
                    </div>
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
                    ${gcalUrl ? html`
                      <a class="gcal-btn"
                         href=${gcalUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         @click=${(e: Event) => e.stopPropagation()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <rect x="3" y="4" width="18" height="18"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                          <line x1="12" y1="14" x2="12" y2="20"/>
                          <line x1="9" y1="17" x2="15" y2="17"/>
                        </svg>
                        Google Calendar
                      </a>
                    ` : ''}
                  </div>
                </div>
              `;
            })}
          </div>
        </section>
      `)}
    `;
  }
}
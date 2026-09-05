import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { KNOCKOUT_SCHEDULE } from '../../data/match-schedule';
import { STADIUMS } from '../../data/stadiums';
import { COMPETITION } from '../../data/competition';
import { renderFlag } from '../../lib/render-flag';
import { formatFullDate } from '../../lib/date-utils';
import { getBroadcastInfo } from '../../lib/broadcasting';
import { openMatchModal } from '../../lib/match-modal-service';
import { useTournamentStore } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { t, useLocaleStore } from '../../i18n';
import type { TranslationKey } from '../../i18n/es';
import { mobileShared } from './mobile-shared.css';
import '../match-modal';

interface CalendarRow {
  id: string;
  kind: 'group' | 'knockout';
  phaseKey: string;
  phaseLabel: string;
  matchDay?: number;
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
  goalScorers: import('../../types').GoalEvent[] | undefined;
}

const KNOCKOUT_LABEL_KEYS: Array<{ key: string; i18nKey: TranslationKey }> = [
  { key: 'R32', i18nKey: 'calendar.r32' },
  { key: 'R16', i18nKey: 'calendar.r16' },
  { key: 'QF',  i18nKey: 'calendar.qf' },
  { key: 'SF',  i18nKey: 'calendar.sf' },
  { key: 'TP',  i18nKey: 'calendar.tp' },
  { key: 'FIN', i18nKey: 'calendar.final' },
];

const MADRID_TIME_ZONE = 'Europe/Madrid';

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function getZonedParts(date: Date, timeZone: string) {
  const parts = getFormatter(timeZone).formatToParts(date);
  const read = (type: string) => Number(parts.find(part => part.type === type)?.value ?? '0');
  return {
    year: read('year'), month: read('month'), day: read('day'),
    hour: read('hour'), minute: read('minute'), second: read('second'),
  };
}

function zonedTimeToUtc(dateIso: string, timeValue: string, timeZone: string): Date {
  const [year, month, day] = dateIso.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let index = 0; index < 3; index += 1) {
    const parts = getZonedParts(candidate, timeZone);
    const expected = Date.UTC(year, month - 1, day, hour, minute, 0);
    const actual = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const delta = expected - actual;
    if (delta === 0) break;
    candidate = new Date(candidate.getTime() + delta);
  }
  return candidate;
}

function formatGoogleCalendarLocal(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parts.year}${pad(parts.month)}${pad(parts.day)}T${pad(parts.hour)}${pad(parts.minute)}${pad(parts.second)}`;
}

/** Calendario nativo móvil: tarjetas-cromo, acordeón día a día con foco en hoy,
 *  filtros por ronda/sede y exportación Excel/PDF. */
@customElement('mobile-calendar')
export class MobileCalendar extends LitElement {
  @state() private _selectedDate = 'all';
  @state() private _selectedVenue = 'all';
  @state() private _selectedPhase = 'all';
  @state() private _toggledDays = new Set<string>();
  @state() private _exporting: string | null = null;
  @state() private _showExport = false;

  private _unsubStore?: () => void;
  private _unsubLocale?: () => void;
  private _didScrollToToday = false;

  connectedCallback() {
    super.connectedCallback();
    this._unsubStore = subscribeSlice(
      useTournamentStore,
      s => ({ gm: s.groupMatches, km: s.knockoutMatches }),
      () => this.requestUpdate(),
      (a, b) => a.gm === b.gm && a.km === b.km,
    );
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this._unsubStore?.();
    this._unsubLocale?.();
    super.disconnectedCallback();
  }

  protected firstUpdated() { this._scrollToToday(); }
  protected updated() { if (!this._didScrollToToday) this._scrollToToday(); }

  // ── Datos ──
  private _getTeam(teamId: string | null) {
    return TEAMS_2026.find(team => team.id === teamId);
  }

  private _getKnockoutPhaseKey(matchId: string) {
    if (matchId.startsWith('R32')) return 'R32';
    if (matchId.startsWith('R16')) return 'R16';
    if (matchId.startsWith('QF')) return 'QF';
    if (matchId.startsWith('SF')) return 'SF';
    if (matchId.startsWith('TP')) return 'TP';
    return 'FIN';
  }

  private _getKnockoutPhaseLabel(phaseKey: string) {
    const entry = KNOCKOUT_LABEL_KEYS.find(item => item.key === phaseKey);
    return entry ? t(entry.i18nKey) : phaseKey;
  }

  private _getRows(): CalendarRow[] {
    const store = useTournamentStore.getState();
    const locale = useLocaleStore.getState().locale;

    const groupRows: CalendarRow[] = store.groupMatches.map(match => {
      const matchDay = match.matchDay ?? 1;
      const phaseLabel = locale === 'en' ? `Matchday ${matchDay}` : `Jornada ${matchDay}`;
      return {
        id: match.matchId,
        kind: 'group' as const,
        phaseKey: `MD${matchDay}`,
        phaseLabel,
        matchDay,
        date: match.date ?? '',
        timeSpain: match.timeSpain ?? '',
        venue: match.venue ?? 'TBD',
        city: match.city ?? '',
        venueId: match.venueId ?? '',
        teamA: match.teamA,
        teamB: match.teamB,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        penaltyScoreA: null,
        penaltyScoreB: null,
        goalScorers: match.goalScorers,
      };
    });

    const knockoutRows: CalendarRow[] = COMPETITION.knockoutEnabled
      ? Object.entries(KNOCKOUT_SCHEDULE).map(([matchId, scheduled]) => {
          const match = store.knockoutMatches[matchId];
          const phaseKey = this._getKnockoutPhaseKey(matchId);
          return {
            id: matchId,
            kind: 'knockout' as const,
            phaseKey,
            phaseLabel: this._getKnockoutPhaseLabel(phaseKey),
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
            goalScorers: match?.goalScorers,
          };
        })
      : [];

    return [...groupRows, ...knockoutRows].sort((left, right) => {
      const leftKey = `${left.date}T${left.timeSpain}`;
      const rightKey = `${right.date}T${right.timeSpain}`;
      return leftKey.localeCompare(rightKey);
    });
  }

  private _getFilteredRows() {
    return this._getRows().filter(row => {
      if (this._selectedDate !== 'all' && row.date !== this._selectedDate) return false;
      if (this._selectedVenue !== 'all' && row.city !== this._selectedVenue && row.venue !== this._selectedVenue && row.venueId !== this._selectedVenue) return false;
      if (this._selectedPhase !== 'all' && row.phaseKey !== this._selectedPhase) return false;
      return true;
    });
  }

  private _getGroupedRows(rows: CalendarRow[]) {
    return rows.reduce<Record<string, CalendarRow[]>>((groups, row) => {
      groups[row.date] = [...(groups[row.date] ?? []), row];
      return groups;
    }, {});
  }

  // ── Hoy / acordeón ──
  private _getTodayKey(): string {
    const { year, month, day } = getZonedParts(new Date(), MADRID_TIME_ZONE);
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  private get _hasActiveFilter(): boolean {
    return this._selectedDate !== 'all' || this._selectedVenue !== 'all' || this._selectedPhase !== 'all';
  }

  private _isDayCollapsed(date: string): boolean {
    if (this._hasActiveFilter) return false;
    const past = date < this._getTodayKey();
    return past !== this._toggledDays.has(date);
  }

  private _toggleDay(date: string) {
    const next = new Set(this._toggledDays);
    if (next.has(date)) next.delete(date); else next.add(date);
    this._toggledDays = next;
  }

  private _findTodaySection(): HTMLElement | null {
    const todayKey = this._getTodayKey();
    const sections = [...this.renderRoot.querySelectorAll<HTMLElement>('.cal-day[data-date]')];
    return (
      sections.find(s => s.dataset.date === todayKey) ??
      sections.find(s => (s.dataset.date ?? '') >= todayKey) ??
      null
    );
  }

  private _scrollToToday() {
    if (this._didScrollToToday) return;
    const section = this._findTodaySection();
    if (!section) return;
    this._didScrollToToday = true;
    let frame = 0;
    const settle = () => {
      this._findTodaySection()?.scrollIntoView({ block: 'start' });
      frame += 1;
      if (frame < 6) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  }

  // ── Acciones de partido ──
  private _buildGCalUrl(row: CalendarRow): string | null {
    if (!row.date || !row.timeSpain) return null;
    const stadium = STADIUMS.find(item => item.id === row.venueId || item.name === row.venue);
    const tz = stadium?.timezone ?? MADRID_TIME_ZONE;
    const startUtc = zonedTimeToUtc(row.date, row.timeSpain, MADRID_TIME_ZONE);
    const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60 * 1000);
    const teamAName = this._getTeam(row.teamA)?.name ?? 'Por decidir';
    const teamBName = this._getTeam(row.teamB)?.name ?? 'Por decidir';
    const text = encodeURIComponent(`${teamAName} vs ${teamBName} · Champions League 26/27`);
    const dates = `${formatGoogleCalendarLocal(startUtc, tz)}/${formatGoogleCalendarLocal(endUtc, tz)}`;
    const details = encodeURIComponent(`${row.phaseLabel} · ${row.venue}, ${row.city}`);
    const location = encodeURIComponent(`${row.venue}, ${row.city}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&ctz=${encodeURIComponent(tz)}&details=${details}&location=${location}`;
  }

  private _openMatch(row: CalendarRow) {
    if (!row.teamA || !row.teamB) return;
    const stadium = STADIUMS.find(item => item.id === row.venueId || item.name === row.venue);
    openMatchModal({
      matchId: row.id,
      teamA: row.teamA,
      teamB: row.teamB,
      initialScoreA: row.scoreA,
      initialScoreB: row.scoreB,
      initialPenaltyScoreA: row.penaltyScoreA,
      initialPenaltyScoreB: row.penaltyScoreB,
      phase: row.kind === 'group' ? 'group' : 'knockout',
      goalScorers: row.goalScorers,
      venue: row.venue,
      city: row.city,
      timeSpain: row.timeSpain,
      stadiumImage: stadium?.image,
      hideFooter: true,
      onSave: ({ scoreA, scoreB, penaltyScoreA, penaltyScoreB }) => {
        const store = useTournamentStore.getState();
        if (row.kind === 'group') store.setGroupMatchResult(row.id, scoreA, scoreB);
        else store.setKnockoutMatchResult(row.id, scoreA, scoreB, penaltyScoreA, penaltyScoreB);
      },
    });
  }

  private async _exportCalendar(phase: 'all' | 'groups' | 'knockout', format: 'excel' | 'pdf') {
    const key = `${phase}-${format}`;
    if (this._exporting) return;
    this._exporting = key;
    try {
      const { exportCalendarExcel, exportCalendarPdf, fileNameBase, triggerDownload } =
        await import('../../lib/calendar-export-service');
      const locale = useLocaleStore.getState().locale;
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      const blob = format === 'excel'
        ? await exportCalendarExcel(phase, locale)
        : await exportCalendarPdf(phase, locale);
      triggerDownload(blob, `${fileNameBase(phase, locale)}.${ext}`);
    } catch (err) {
      console.error(err);
    } finally {
      this._exporting = null;
    }
  }

  static readonly styles = [
    mobileShared,
    css`
      :host { display: block; }

      /* ── Filtros ── */
      .cal-filters {
        display: grid;
        gap: 10px;
        padding: 0 16px 12px;
      }
      .cal-filter-label {
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--ink-muted);
        margin-bottom: 5px;
      }
      .cal-chips {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 2px;
      }
      .cal-chips::-webkit-scrollbar { display: none; }
      .cal-chip {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        min-height: 38px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        background: var(--fill);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-pill);
        box-shadow: var(--shadow-sm);
        color: var(--ink);
        font-family: var(--font-var);
        font-size: 12px;
        letter-spacing: 0.04em;
        white-space: nowrap;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .cal-chip.active { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
      .cal-chip.today { background: color-mix(in srgb, var(--retro-red) 18%, var(--paper-2)); border-color: var(--retro-red); color: var(--ink); font-weight: 700; }
      .cal-chip.today.active { box-shadow: inset 0 0 0 2px var(--accent); }

      /* ── Exportación ── */
      .cal-export { padding: 0 16px 14px; }
      .cal-export-toggle {
        all: unset;
        cursor: pointer;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 11px 14px;
        background: var(--fill);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        font-family: var(--font-var);
        font-size: 13px;
        color: var(--ink);
        touch-action: manipulation;
      }
      .cal-export-panel {
        margin-top: 10px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        background: var(--card-grad);
        padding: 10px;
        display: grid;
        gap: 10px;
      }
      .cal-export-card-title {
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-muted);
        margin-bottom: 6px;
      }
      .cal-export-row { display: flex; gap: 8px; }
      .cal-export-row .btn { flex: 1; min-height: 40px; padding: 8px; font-size: 12px; }
      .btn.excel { background: color-mix(in srgb, var(--retro-green) 18%, var(--paper-2)); border-color: var(--retro-green); color: var(--ink); }
      .btn.pdf { background: color-mix(in srgb, var(--retro-red) 18%, var(--paper-2)); border-color: var(--retro-red); color: var(--ink); }

      .cal-summary {
        padding: 4px 16px 10px;
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.1em;
        color: var(--ink-muted);
        text-transform: uppercase;
      }

      /* ── Acordeón de día ── */
      .cal-day {
        margin: 0 16px 12px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        background: var(--card-grad);
        overflow: hidden;
      }
      .cal-day-head {
        all: unset;
        box-sizing: border-box;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 13px;
        background: var(--card-grad);
        color: var(--on-dark);
        border-bottom: 1px solid var(--hairline);
        cursor: pointer;
        touch-action: manipulation;
      }
      .cal-day.collapsed .cal-day-head { border-bottom: none; }
      .cal-day.today > .cal-day-head { background: var(--retro-red); }
      .cal-day-chevron { flex: 0 0 auto; transition: transform 0.15s ease; }
      .cal-day.collapsed .cal-day-chevron { transform: rotate(-90deg); }
      .cal-day-title {
        font-family: var(--font-var);
        font-size: 17px;
        line-height: 1;
        text-transform: capitalize;
        font-weight: 800;
      }
      .cal-day-tag {
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.1em;
        padding: 2px 6px;
        background: var(--fill);
        color: var(--retro-red);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-pill);
      }
      .cal-day-count {
        margin-left: auto;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      /* ── Tarjeta de partido ── */
      .cal-card {
        border-bottom: 1px solid var(--hairline);
        padding: 9px 12px;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .cal-card:last-child { border-bottom: none; }
      .cal-card:active { background: var(--fill); }
      .cal-card.disabled { cursor: default; opacity: 0.85; }
      .cal-card-top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 7px;
      }
      .cal-time {
        font-family: var(--font-var);
        font-size: 15px;
        color: var(--ink);
        line-height: 1;
      }
      .cal-phase {
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 2px 6px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-pill);
        background: var(--fill);
        color: var(--ink);
      }
      .cal-tv { margin-left: auto; display: flex; gap: 4px; }
      .badge-tv {
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        padding: 2px 5px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-pill);
      }
      .badge-rtve { background: var(--accent); color: var(--on-accent); border-color: var(--accent); }
      .badge-dazn { background: var(--fill); color: var(--ink); }

      .cal-teams { display: grid; gap: 4px; }
      .cal-team-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .cal-team-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-body);
        font-size: 14px;
        font-weight: 700;
        color: var(--ink);
        overflow: hidden;
      }
      .cal-team-name span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cal-score {
        font-family: var(--font-var);
        font-size: 15px;
        color: var(--ink);
        flex-shrink: 0;
        white-space: nowrap;
      }
      .cal-score.vs { color: var(--ink-muted); font-size: 12px; }

      .cal-foot {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        padding-top: 7px;
        border-top: 1px solid var(--hairline);
      }
      .cal-venue {
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--ink-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
      }
      .gcal-btn {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 8px;
        background: var(--fill);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        font-family: var(--font-mono);
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--ink);
        text-decoration: none;
        touch-action: manipulation;
      }

      .cal-empty {
        margin: 0 16px;
        padding: 28px 16px;
        text-align: center;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.12em;
        color: var(--ink-muted);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
      }

      .flag-img {
        width: 22px; height: 22px;
        object-fit: contain;
        flex-shrink: 0;
      }
    `,
  ];

  private _renderFilters(availableDates: string[], todayKey: string, locale: string) {
    const hasToday = availableDates.includes(todayKey);
    const matchDays = Array.from({ length: COMPETITION.matchdays }, (_, i) => i + 1);
    const availableCities = [...new Set(this._getRows().map(r => r.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    return html`
      <div class="cal-filters">
        <div>
          <div class="cal-filter-label">${locale === 'en' ? 'Day' : 'Día'}</div>
          <div class="cal-chips">
            <button class="cal-chip ${this._selectedDate === 'all' ? 'active' : ''}"
                    @click=${() => { this._selectedDate = 'all'; }}>${locale === 'en' ? 'All' : 'Todos'}</button>
            ${hasToday ? html`
              <button class="cal-chip today ${this._selectedDate === todayKey ? 'active' : ''}"
                      @click=${() => { this._selectedDate = todayKey; }}>${locale === 'en' ? 'Today' : 'Hoy'}</button>
            ` : ''}
            ${availableDates.map(d => html`
              <button class="cal-chip ${this._selectedDate === d ? 'active' : ''}"
                      @click=${() => { this._selectedDate = d; }}>${formatFullDate(d)}</button>
            `)}
          </div>
        </div>

        <div>
          <div class="cal-filter-label">${locale === 'en' ? 'Matchday or round' : 'Jornada o ronda'}</div>
          <div class="cal-chips">
            <button class="cal-chip ${this._selectedPhase === 'all' ? 'active' : ''}"
                    @click=${() => { this._selectedPhase = 'all'; }}>${locale === 'en' ? 'All' : 'Todo'}</button>
            ${matchDays.map(md => html`
              <button class="cal-chip ${this._selectedPhase === `MD${md}` ? 'active' : ''}"
                      @click=${() => { this._selectedPhase = `MD${md}`; }}>
                ${locale === 'en' ? `Matchday ${md}` : `Jornada ${md}`}
              </button>
            `)}
            ${COMPETITION.knockoutEnabled ? KNOCKOUT_LABEL_KEYS.map(phase => html`
              <button class="cal-chip ${this._selectedPhase === phase.key ? 'active' : ''}"
                      @click=${() => { this._selectedPhase = phase.key; }}>${t(phase.i18nKey)}</button>
            `) : ''}
          </div>
        </div>

        <div>
          <div class="cal-filter-label">${locale === 'en' ? 'Host city' : 'Ciudad sede'}</div>
          <div class="cal-chips">
            <button class="cal-chip ${this._selectedVenue === 'all' ? 'active' : ''}"
                    @click=${() => { this._selectedVenue = 'all'; }}>${locale === 'en' ? 'All' : 'Todas'}</button>
            ${availableCities.map(city => html`
              <button class="cal-chip ${this._selectedVenue === city ? 'active' : ''}"
                      @click=${() => { this._selectedVenue = city; }}>${city}</button>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private _renderExport(locale: string) {
    const card = (label: string, phase: 'all' | 'groups' | 'knockout') => html`
      <div>
        <div class="cal-export-card-title">${label}</div>
        <div class="cal-export-row">
          <button class="btn excel" ?disabled=${this._exporting !== null}
                  @click=${() => this._exportCalendar(phase, 'excel')}>
            ${this._exporting === `${phase}-excel` ? '...' : 'EXCEL'}
          </button>
          <button class="btn pdf" ?disabled=${this._exporting !== null}
                  @click=${() => this._exportCalendar(phase, 'pdf')}>
            ${this._exporting === `${phase}-pdf` ? '...' : 'PDF'}
          </button>
        </div>
      </div>
    `;
    return html`
      <div class="cal-export">
        <button class="cal-export-toggle" @click=${() => { this._showExport = !this._showExport; }}>
          <span>⬇ ${locale === 'en' ? 'DOWNLOAD CALENDAR' : 'DESCARGAR CALENDARIO'}</span>
          <span>${this._showExport ? '▲' : '▼'}</span>
        </button>
        ${this._showExport ? html`
          <div class="cal-export-panel">
            ${card(locale === 'en' ? 'Full tournament (144 matches)' : 'Torneo completo (144 partidos)', 'all')}
            ${card(locale === 'en' ? 'League phase (144 matches)' : 'Fase liga (144 partidos)', 'groups')}
            ${COMPETITION.knockoutEnabled ? card(locale === 'en' ? 'Knockout stage' : 'Fase eliminatoria', 'knockout') : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  private _renderCard(row: CalendarRow) {
    const teamA = this._getTeam(row.teamA);
    const teamB = this._getTeam(row.teamB);
    const clickable = Boolean(row.teamA && row.teamB);
    const gcalUrl = this._buildGCalUrl(row);
    const played = row.scoreA !== null && row.scoreB !== null;
    const cellA = played ? String(row.scoreA) : '–';
    const cellB = played ? String(row.scoreB) : '–';
    const both = getBroadcastInfo(row.id, row.teamA ?? undefined, row.teamB ?? undefined) === 'BOTH';
    return html`
      <div class="cal-card ${clickable ? '' : 'disabled'}"
           role="button"
           tabindex=${clickable ? '0' : '-1'}
           @click=${() => { if (clickable) this._openMatch(row); }}
           @keydown=${(e: KeyboardEvent) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this._openMatch(row); } }}>
        <div class="cal-card-top">
          <span class="cal-time">${row.timeSpain || '--:--'}</span>
          <span class="cal-phase">${row.phaseLabel}</span>
          <span class="cal-tv">
            ${both ? html`<span class="badge-tv badge-rtve">RTVE</span>` : ''}
            <span class="badge-tv badge-dazn">DAZN</span>
          </span>
        </div>
        <div class="cal-teams">
          <div class="cal-team-line">
            <span class="cal-team-name">${renderFlag(teamA, 'sm')}<span>${teamA?.name ?? 'Por decidir'}</span></span>
            <span class="cal-score ${played ? '' : 'vs'}">${cellA}</span>
          </div>
          <div class="cal-team-line">
            <span class="cal-team-name">${renderFlag(teamB, 'sm')}<span>${teamB?.name ?? 'Por decidir'}</span></span>
            <span class="cal-score ${played ? '' : 'vs'}">${cellB}</span>
          </div>
        </div>
        ${row.penaltyScoreA !== null && row.penaltyScoreB !== null ? html`
          <div class="cal-venue" style="margin-top:4px">PEN ${row.penaltyScoreA}-${row.penaltyScoreB}</div>
        ` : ''}
        <div class="cal-foot">
          <span class="cal-venue">${row.venue} · ${row.city}</span>
          ${gcalUrl ? html`
            <a class="gcal-btn" href=${gcalUrl} target="_blank" rel="noopener noreferrer"
               @click=${(e: Event) => e.stopPropagation()}>📅 ${locale_gcal()}</a>
          ` : ''}
        </div>
      </div>
    `;
  }

  render() {
    const rows = this._getFilteredRows();
    const grouped = this._getGroupedRows(rows);
    const availableDates = [...new Set(this._getRows().map(row => row.date))];
    const locale = useLocaleStore.getState().locale;
    const todayKey = this._getTodayKey();

    return html`
      ${this._renderExport(locale)}
      ${this._renderFilters(availableDates, todayKey, locale)}

      <div class="cal-summary">${rows.length} ${locale === 'en' ? 'matches' : 'partidos'}</div>

      ${rows.length === 0 ? html`<div class="cal-empty">${t('calendar.empty')}</div>` : ''}

      ${Object.entries(grouped).map(([date, dateRows]) => {
        const collapsed = this._isDayCollapsed(date);
        const isToday = date === todayKey;
        return html`
          <section class="cal-day ${collapsed ? 'collapsed' : ''} ${isToday ? 'today' : ''}" data-date=${date}>
            <button class="cal-day-head" type="button" aria-expanded=${collapsed ? 'false' : 'true'}
                    @click=${() => this._toggleDay(date)}>
              <svg class="cal-day-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span class="cal-day-title">${formatFullDate(date)}</span>
              ${isToday ? html`<span class="cal-day-tag">${locale === 'en' ? 'TODAY' : 'HOY'}</span>` : ''}
              <span class="cal-day-count">${dateRows.length}</span>
            </button>
            ${collapsed ? '' : dateRows.map(row => this._renderCard(row))}
          </section>
        `;
      })}
    `;
  }
}

// Etiqueta corta del botón Google Calendar según locale.
function locale_gcal(): string {
  return useLocaleStore.getState().locale === 'en' ? 'Calendar' : 'Calendario';
}

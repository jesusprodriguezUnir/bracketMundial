import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import { GROUP_MATCHES } from '../data/match-schedule';
import { getSquad, getLineup, SQUADS, isOfficialSquad } from '../data/squads';
import type { Player } from '../data/squads';
import { getCoach } from '../data/coaches';
import type { Coach } from '../data/coaches';
import { renderFlag } from '../lib/render-flag';
import { formatShortDate, isMatchPending, coachAge } from '../lib/date-utils';
import { getTeamNews } from '../lib/news-service';
import type { NewsItem } from '../lib/news-service';
import { useTournamentStore } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { hasPlayerPhoto, playerPhotoSrc } from '../lib/player-photo';
import { hasCoachPhoto, coachPhotoSrc } from '../lib/coach-photo';
import '../components/player-card';
import '../components/lineup-view';
import { t, useLocaleStore } from '../i18n';

function normalize(str: string): string {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  @property() targetTeamId: string | null = null;

  @state() private selectedTeamId: string | null = null;
  @state() private activeTab: 'squad' | 'matches' | 'venues' | 'news' = 'squad';
  @state() private squadViewMode: 'list' | 'pitch' = 'list';
  @state() private searchQuery = '';
  @state() private _openPlayer: { player: Player; teamId: string } | null = null;
  @state() private _news: NewsItem[] | null = null;
  @state() private _newsLoading = false;
  @state() private _newsKey: string | null = null;

  private unsubscribeStore?: () => void;

  override updated(changedProps: PropertyValues) {
    if (changedProps.has('targetTeamId') && this.targetTeamId) {
      const tid = this.targetTeamId;
      this.selectedTeamId = tid;
      this.activeTab = 'squad';
      this.targetTeamId = null;
      this._loadNewsForTeam(tid, useLocaleStore.getState().locale);
    }
  }

  private _loadNewsForTeam(teamId: string, locale: 'es' | 'en') {
    const key = `${teamId}:${locale}`;
    if (this._newsKey === key) return;
    this._newsKey = key;
    this._news = null;
    this._newsLoading = true;
    getTeamNews(teamId, locale).then(items => {
      if (this._newsKey === key) {
        this._news = items;
        this._newsLoading = false;
      }
    });
  }

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

    .official-badge {
      display: inline-block;
      padding: 2px 6px;
      background: var(--retro-green);
      color: var(--paper);
      font-size: 9px;
      font-weight: bold;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
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

    /* ── Coach card ── */

    .coach-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      padding: 14px 18px;
      border-bottom: 4px solid var(--ink);
      background: var(--paper-2);
    }

    .coach-avatar {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--retro-blue);
      color: var(--paper);
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 0;
    }

    .coach-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .coach-body {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .coach-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
    }

    .coach-name {
      font-family: var(--font-display);
      font-size: 18px;
      color: var(--ink);
      line-height: 1.1;
    }

    .coach-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.06em;
    }

    .coach-bio {
      margin-top: 4px;
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--ink);
      line-height: 1.55;
    }

    /* ── News panel ── */

    .news-list {
      display: grid;
      gap: 10px;
    }

    .news-card {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      overflow: hidden;
    }

    .news-link {
      display: block;
      padding: 12px 14px;
      text-decoration: none;
      color: inherit;
    }

    .news-link:hover {
      background: var(--retro-yellow);
    }

    .news-headline {
      font-family: var(--font-display);
      font-size: 14px;
      color: var(--ink);
      line-height: 1.35;
    }

    .news-footer {
      margin-top: 6px;
      display: flex;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .news-loading {
      padding: 28px 20px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-align: center;
      color: var(--dim);
    }

    /* ── Detail grid: 4 columns ── */

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
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
    }

    .panel-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .view-toggle {
      display: flex;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      box-shadow: var(--shadow-hard-sm);
    }

    .view-toggle button {
      all: unset;
      cursor: pointer;
      padding: 4px 10px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--dim);
    }

    .view-toggle button.active {
      background: var(--retro-yellow);
      color: var(--ink);
      font-weight: bold;
    }

    .view-toggle button:first-child {
      border-right: 2px solid var(--ink);
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

    .player-row {
      cursor: pointer;
    }

    .player-row:hover td {
      background: var(--retro-yellow);
    }

    .player-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 2px solid var(--ink);
      background: var(--retro-blue);
      color: var(--paper);
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: 0;
      overflow: hidden;
    }

    .player-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
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

    /* ── Buscador ── */
    .search-bar {
      margin-bottom: 18px;
    }
    .search-input {
      width: 100%;
      padding: 10px 14px;
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--ink);
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      outline: none;
      box-sizing: border-box;
    }
    .search-input:focus {
      box-shadow: var(--shadow-hard-md);
    }
    .player-results {
      margin-top: 10px;
      display: grid;
      gap: 6px;
    }
    .player-result-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.04em;
      color: var(--ink);
    }
    .player-result-btn:hover {
      background: var(--retro-yellow);
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-hard-md);
    }
    .player-result-btn:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .player-number {
      font-family: var(--font-var);
      font-size: 14px;
      min-width: 20px;
      text-align: center;
      color: var(--retro-orange);
    }
    .player-pos {
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 1px 5px;
      border: 1px solid var(--ink);
      background: var(--ink);
      color: var(--paper);
      letter-spacing: 0.08em;
    }
    .player-team-flag {
      margin-left: auto;
      font-size: 13px;
    }
    .no-results {
      padding: 20px;
      border: 3px dashed var(--ink);
      background: var(--paper-2);
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dim);
      text-align: center;
      letter-spacing: 0.08em;
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
        flex-wrap: wrap;
      }

      .tabs button {
        flex: 1 1 calc(50% - 1px);
        border-bottom: 3px solid var(--ink);
      }

      .tabs button:nth-child(odd):last-child {
        flex: 1 1 100%;
      }

      .coach-card {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `;

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => s.groupStandings,
      () => this.requestUpdate(),
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => {
      this.requestUpdate();
      if (this.selectedTeamId) {
        this._loadNewsForTeam(this.selectedTeamId, useLocaleStore.getState().locale);
      }
    });
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private getTeam(teamId: string | null) {
    return TEAMS_2026.find(team => team.id === teamId);
  }

  private getTeamMatches(teamId: string): TeamMatchSummary[] {
    return GROUP_MATCHES
      .filter(match =>
        (match.teamA === teamId || match.teamB === teamId) &&
        isMatchPending(match.date, match.timeSpain)
      )
      .map(match => {
        const stadium = STADIUMS.find(s => s.id === match.venueId);
        return {
          id: match.matchId,
          phase: `Grupo ${match.group}`,
          date: match.date,
          timeSpain: match.timeSpain,
          venue: stadium?.name ?? match.venueId,
          city: stadium?.city ?? '',
          opponentId: match.teamA === teamId ? match.teamB : match.teamA,
        };
      })
      .sort((a, b) => {
        const ak = `${a.date}T${a.timeSpain}`;
        const bk = `${b.date}T${b.timeSpain}`;
        return ak.localeCompare(bk);
      });
  }

  private formatDate(date: string, timeSpain: string) {
    if (!date) return 'Fecha por confirmar';
    const base = formatShortDate(date);
    return `${base} · ${timeSpain || '--:--'} ESP`;
  }

  private selectTeam(id: string) {
    this.selectedTeamId = id;
    this.activeTab = 'squad';
    this._loadNewsForTeam(id, useLocaleStore.getState().locale);
  }

  private goBack() {
    this.selectedTeamId = null;
    this.activeTab = 'squad';
    this._newsKey = null;
    this._news = null;
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
    const isOfficial = isOfficialSquad(selectedTeam.id);
    const teamMatches = this.getTeamMatches(selectedTeam.id);
    const coach: Coach | null = getCoach(selectedTeam.id);
    const locale = useLocaleStore.getState().locale;
    const venueMap = teamMatches.reduce<Map<string, (typeof STADIUMS)[number]>>((map, match) => {
      const stadium = STADIUMS.find(item => item.name === match.venue);
      if (stadium) map.set(stadium.id, stadium);
      return map;
    }, new Map());

    return html`
      ${this._openPlayer ? html`
        <player-card
          .player=${this._openPlayer.player}
          .teamId=${this._openPlayer.teamId}
          @close=${() => { this._openPlayer = null; }}
        ></player-card>
      ` : ''}

      <button class="back-btn" @click=${() => this.goBack()}>${t('squads.back')}</button>

      <section class="detail-panel">
        <div class="detail-header">
          <div>
            <div class="detail-title">${renderFlag(selectedTeam, 'lg')} ${selectedTeam.name}</div>
            <div class="detail-sub">
              ${isOfficial ? html`<span class="official-badge">${t('squads.official')}</span>` : ''}
              Grupo ${selectedTeam.group} · ${squad.length} jugadores · ${t('squads.matches.pending', { n: String(teamMatches.length) })}
            </div>
          </div>
        </div>

        ${coach ? html`
          <div class="coach-card">
            <div class="coach-avatar">
              ${hasCoachPhoto(selectedTeam.id)
                ? html`<img src="${coachPhotoSrc(selectedTeam.id)}" alt="${coach.name}" loading="lazy">`
                : coach.photoUrl
                  ? html`<img src="${coach.photoUrl}" alt="${coach.name}" loading="lazy">`
                  : getInitials(coach.name)}
            </div>
            <div class="coach-body">
              <div class="coach-label">${t('squads.coach.title')}</div>
              <div class="coach-name">${coach.name}</div>
              <div class="coach-meta">${coach.nationality} · ${coachAge(coach.born)} años</div>
              <div class="coach-bio">${coach.bio[locale]}</div>
            </div>
          </div>
        ` : ''}

        <nav class="tabs" role="tablist">
          <button class=${this.activeTab === 'squad' ? 'active' : ''} @click=${() => { this.activeTab = 'squad'; }}>${t('squads.tab.squad')}</button>
          <button class=${this.activeTab === 'matches' ? 'active' : ''} @click=${() => { this.activeTab = 'matches'; }}>${t('squads.tab.matches')}</button>
          <button class=${this.activeTab === 'venues' ? 'active' : ''} @click=${() => { this.activeTab = 'venues'; }}>${t('squads.tab.venues')}</button>
          <button class=${this.activeTab === 'news' ? 'active' : ''} @click=${() => { this.activeTab = 'news'; }}>${t('squads.tab.news')}</button>
        </nav>

        <div class="detail-grid">
          <div class="panel-block ${this.activeTab !== 'squad' ? 'tab-hidden' : ''}">
            <div class="panel-header-row">
              <div class="panel-title">${t('squads.tab.squad')}</div>
              ${getLineup(selectedTeam.id) ? html`
                <div class="view-toggle">
                  <button class=${this.squadViewMode === 'list' ? 'active' : ''} @click=${() => { this.squadViewMode = 'list'; }}>Lista</button>
                  <button class=${this.squadViewMode === 'pitch' ? 'active' : ''} @click=${() => { this.squadViewMode = 'pitch'; }}>Cancha</button>
                </div>
              ` : ''}
            </div>
            
            ${this.squadViewMode === 'pitch' && getLineup(selectedTeam.id) ? html`
              <lineup-view .squad=${squad} .lineup=${getLineup(selectedTeam.id)} .teamId=${selectedTeam.id}></lineup-view>
            ` : html`
              <div class="table-wrap">
                <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>#</th>
                    <th>Jugador</th>
                    <th>Pos</th>
                    <th>Edad</th>
                    <th>Club</th>
                  </tr>
                </thead>
                <tbody>
                  ${squad.map(player => html`
                    <tr
                      class="player-row"
                      @click=${() => { this._openPlayer = { player, teamId: selectedTeam.id }; }}
                    >
                      <td><div class="player-avatar">
                        ${hasPlayerPhoto(selectedTeam.id, player.number)
                          ? html`<img src="${playerPhotoSrc(selectedTeam.id, player.number)}" alt="${player.name}" loading="lazy">`
                          : getInitials(player.name)}
                      </div></td>
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
            `}
          </div>

          <div class="panel-block ${this.activeTab !== 'matches' ? 'tab-hidden' : ''}">
            <div class="panel-title">${t('squads.tab.matches')}</div>
            ${teamMatches.length === 0
              ? html`<div class="empty">${t('squads.matches.empty')}</div>`
              : html`
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
              `}
          </div>

          <div class="panel-block ${this.activeTab !== 'venues' ? 'tab-hidden' : ''}">
            <div class="panel-title">${t('squads.tab.venues')}</div>
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

          <div class="panel-block ${this.activeTab !== 'news' ? 'tab-hidden' : ''}">
            <div class="panel-title">${t('squads.tab.news')}</div>
            ${this._newsLoading
              ? html`<div class="news-loading">${t('squads.news.loading')}</div>`
              : this._news === null || this._news.length === 0
                ? html`<div class="empty">${t('squads.news.empty')}</div>`
                : html`
                  <div class="news-list">
                    ${this._news.map(item => html`
                      <article class="news-card">
                        <a class="news-link" href="${item.url}" target="_blank" rel="noopener noreferrer">
                          <div class="news-headline">${item.title}</div>
                          <div class="news-footer">
                            <span>${formatShortDate(item.date)}</span>
                            <span>·</span>
                            <span>${t('squads.news.source')} ${item.source}</span>
                          </div>
                        </a>
                      </article>
                    `)}
                  </div>
                `}
          </div>
        </div>
      </section>
    `;
  }

  private _getPlayerResults() {
    const q = normalize(this.searchQuery.trim());
    if (q.length < 2) return [];
    const results: Array<{ teamId: string; number: number; name: string; position: string; club: string }> = [];
    for (const [teamId, players] of Object.entries(SQUADS)) {
      for (const player of players) {
        if (normalize(player.name).includes(q) || normalize(player.club).includes(q)) {
          results.push({ teamId, number: player.number, name: player.name, position: player.position, club: player.club });
          if (results.length >= 8) return results;
        }
      }
    }
    return results;
  }

  private _teamMatchesQuery(teamId: string): boolean {
    const q = normalize(this.searchQuery.trim());
    if (q.length < 2) return true;
    const team = TEAMS_2026.find(t => t.id === teamId);
    if (!team) return false;
    return normalize(team.name).includes(q) || normalize(team.shortName).includes(q);
  }

  private renderGroupsList() {
    const groups = 'ABCDEFGHIJKL'.split('');
    const q = this.searchQuery.trim();
    const isFiltering = q.length >= 2;
    const playerResults = this._getPlayerResults();

    const groupsWithMatch = isFiltering
      ? groups.filter(group => TEAMS_2026.filter(t => t.group === group).some(t => this._teamMatchesQuery(t.id)))
      : groups;

    const showNoResults = isFiltering && groupsWithMatch.length === 0 && playerResults.length === 0;

    return html`
      <div class="search-bar">
        <input
          type="search"
          class="search-input"
          placeholder="Buscar equipo o jugador…"
          aria-label="Buscar equipo o jugador"
          .value=${this.searchQuery}
          @input=${(e: InputEvent) => { this.searchQuery = (e.target as HTMLInputElement).value; }}
        >
        ${playerResults.length > 0 ? html`
          <div class="player-results">
            ${playerResults.map(p => {
              const team = TEAMS_2026.find(t => t.id === p.teamId);
              return html`
                <button class="player-result-btn" @click=${() => this.selectTeam(p.teamId)}>
                  <span class="player-number">${p.number}</span>
                  <span class="player-pos">${p.position}</span>
                  <span>${p.name}</span>
                  <span style="color: var(--dim); font-size: 11px;">· ${p.club}</span>
                  <span class="player-team-flag">${renderFlag(team, 'sm')}</span>
                </button>
              `;
            })}
          </div>
        ` : ''}
      </div>

      ${showNoResults ? html`<div class="no-results">SIN RESULTADOS · Prueba con otro nombre</div>` : ''}

      <div class="groups-stack">
        ${groupsWithMatch.map(group => {
          const teamsInGroup = TEAMS_2026.filter(t => t.group === group);
          return html`
            <section class="group-block">
              <div class="group-header">
                <div class="group-title">Grupo ${group}</div>
                <div class="group-sub">4 selecciones</div>
              </div>
              <div class="teams-grid">
                ${teamsInGroup.map(team => {
                  const dimmed = isFiltering && !this._teamMatchesQuery(team.id);
                  return html`
                    <button
                      class="team-card"
                      style="${dimmed ? 'opacity: 0.25; pointer-events: none;' : ''}"
                      @click=${() => this.selectTeam(team.id)}>
                      ${renderFlag(team, 'md')}
                      <div class="team-name">${team.name}</div>
                      <div class="team-meta">
                        ${isOfficialSquad(team.id) 
                          ? html`<span style="color: var(--retro-green);">✓ ${getSquad(team.id).length} ${getSquad(team.id).length !== 1 ? t('squads.officials.many') : t('squads.officials.one')}</span>`
                          : html`${getSquad(team.id).length} pendientes`}
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
}

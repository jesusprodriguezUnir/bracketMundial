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
import { resolvePlayerPhoto } from '../lib/player-photo';
import { resolveCoachPhoto } from '../lib/coach-photo';
import '../components/player-card';
import '../components/lineup-view';
import { t, useLocaleStore } from '../i18n';
import { getOddsForMatch } from '../lib/odds-service';
import type { MatchOdds } from '../lib/odds-service';
import { getInitials, normalize } from '../lib/text-utils';
import { TEAM_COLORS } from '../data/team-colors';
import { crestSrc, kitSrc } from '../lib/team-assets';
import { WORLD_TITLES } from '../data/world-titles';

interface TeamMatchSummary {
  id: string;
  matchId: string;
  phase: string;
  date: string;
  timeSpain: string;
  venue: string;
  venueId: string;
  city: string;
  opponentId: string | null;
  matchDay: number;
  teamId: string;
  isHome: boolean;
}

@customElement('squads-view')
export class SquadsView extends LitElement {
  @property() targetTeamId: string | null = null;

  @state() private selectedTeamId: string | null = null;
  @state() private activeTab: 'squad' | 'matches' | 'news' = 'squad';
  @state() private squadViewMode: 'list' | 'pitch' = 'list';
  @state() private searchQuery = '';
  @state() private _openPlayer: { player: Player; teamId: string } | null = null;
  @state() private _news: NewsItem[] | null = null;
  @state() private _newsLoading = false;
  @state() private _newsError = false;
  @state() private _newsKey: string | null = null;
  @state() private _openMatchId: string | null = null;
  @state() private _matchOddsCache: Map<string, MatchOdds> = new Map();

  private unsubscribeStore?: () => void;
  private _swipeStartX = 0;
  private _swipeStartY = 0;
  private _isSwiping = false;

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
    this._newsError = false;
    getTeamNews(teamId, locale).then(items => {
      if (this._newsKey === key) {
        this._news = items;
        this._newsLoading = false;
      }
    }).catch(() => {
      if (this._newsKey === key) {
        this._newsError = true;
        this._newsLoading = false;
      }
    });
  }

  private _retryNews() {
    if (this.selectedTeamId) {
      this._loadNewsForTeam(this.selectedTeamId, useLocaleStore.getState().locale);
    }
  }

  static readonly styles = css`
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
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      background: #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      min-height: 92px;
      touch-action: manipulation;
      border: none;
    }
    .team-card:active {
      transform: scale(0.98);
    }
    @media (hover: hover) {
      .team-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.14);
        transform: translateY(-2px);
      }
    }
    .tc-strip {
      height: 6px;
      flex-shrink: 0;
    }
    .tc-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .tc-flag-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F5F5F5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .tc-flag-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .team-flag-img {
      width: 48px;
      height: 32px;
      object-fit: cover;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
    }

    .team-name {
      font-family: var(--font-display);
      font-size: 14px;
      font-weight: 700;
      color: #1A1933;
      line-height: 1.2;
    }

    .team-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .tc-group {
      font-size: 11px;
      color: #888888;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      font-family: var(--font-mono);
    }
    .tc-players {
      font-size: 11px;
      color: #888888;
      font-family: var(--font-mono);
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

    /* ════ Cabecera ficha V1 — escudo + camiseta ════ */
    .detail-header {
      --kit: var(--retro-blue);
      --kit-trim: var(--ink);
      --kit-num: var(--retro-yellow);
      border-bottom: 4px solid var(--ink);
      background: var(--paper);
    }

    .kit-stripe {
      height: 8px;
      background: var(--kit);
      border-bottom: 3px solid var(--ink);
    }

    .ficha-grid {
      display: grid;
      grid-template-columns: 150px minmax(0, 1fr) 168px;
      gap: 22px;
      align-items: center;
      padding: 24px 22px;
    }

    /* Medallón del escudo */
    .crest-medallion {
      position: relative;
      width: 140px;
      height: 140px;
      justify-self: center;
    }

    .crest-medallion .disc-shadow {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--ink);
      transform: translate(3px, 3px);
    }

    .crest-medallion .disc {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(
        circle at 35% 30%,
        color-mix(in srgb, var(--kit) 70%, #fff),
        var(--kit) 72%
      );
      border: 3px solid var(--ink);
      overflow: hidden;
    }

    .crest-medallion .disc::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--halftone);
      opacity: 0.5;
    }

    .crest-medallion .disc-ring {
      position: absolute;
      inset: 10px;
      border-radius: 50%;
      border: 2px dashed color-mix(in srgb, var(--kit-trim) 55%, #fff);
      opacity: 0.5;
    }

    .crest-medallion .crest-img {
      position: absolute;
      inset: 26px;
      width: calc(100% - 52px);
      height: calc(100% - 52px);
      object-fit: contain;
      filter: drop-shadow(1.5px 2px 0 rgba(26, 25, 51, 0.35));
    }

    .crest-stars {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 2px;
      padding: 2px 7px;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      font-size: 11px;
      line-height: 1;
      color: var(--kit-num);
      letter-spacing: 1px;
      white-space: nowrap;
    }

    /* Identidad textual */
    .ficha-identity {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }

    .ficha-name {
      font-family: var(--font-var);
      font-size: 48px;
      line-height: 0.86;
      letter-spacing: -0.01em;
      color: var(--ink);
    }

    .ficha-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .ficha-chips .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 4px 8px;
      border: 2px solid var(--ink);
      background: var(--paper-3);
      color: var(--ink);
      box-shadow: var(--shadow-hard-sm);
    }

    .ficha-chips .chip.solid {
      background: var(--retro-yellow);
    }

    .ficha-chips .chip.green {
      background: var(--retro-green);
      color: var(--paper);
    }

    /* Expositor de camiseta */
    .jersey-display {
      position: relative;
      justify-self: end;
      width: 168px;
      padding: 14px 14px 0;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: var(--halftone-soft),
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--kit) 14%, var(--paper-3)) 0%,
          var(--paper-3) 78%
        );
    }

    .jersey-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
      background: var(--ink);
      color: var(--paper-3);
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.14em;
      padding: 3px 7px;
    }

    .jersey-display img {
      display: block;
      width: 100%;
      height: 224px;
      object-fit: contain;
    }

    .jersey-plinth {
      height: 4px;
      background: var(--ink);
      margin-top: 2px;
    }

    .jersey-shadow {
      height: 10px;
      background: linear-gradient(180deg, rgba(26, 25, 51, 0.18), transparent);
    }

    /* ── Mobile tabs (hidden on desktop) ── */

    .tabs {
      display: none;
      border-bottom: 3px solid var(--ink);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tabs::-webkit-scrollbar { display: none; }

    .tabs button {
      all: unset;
      cursor: pointer;
      flex: 1;
      min-width: 80px;
      padding: 12px 8px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink);
      border-right: 2px solid var(--ink);
      background: var(--paper-2);
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.15s, color 0.15s;
    }

    .tabs button:last-child {
      border-right: none;
    }

    .tabs button.active {
      background: #1A1933;
      color: var(--paper);
      font-weight: 700;
      border-bottom: 3px solid #E84B1A;
    }
    .tabs button.active:last-child {
      border-bottom: 3px solid #E84B1A;
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
      border: none;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      box-shadow: none;
      background: transparent;
      overflow: hidden;
      display: flex;
      transition: background 0.15s;
    }
    .news-card:last-child {
      border-bottom: none;
    }
    @media (hover: hover) {
      .news-card:hover {
        background: rgba(0,0,0,0.03);
        cursor: pointer;
      }
    }

    .news-thumb {
      flex: 0 0 60px;
      width: 60px;
      height: 60px;
      border-right: none;
      border-radius: 6px;
      margin: 12px 0 12px 12px;
      background: var(--paper-1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-size: 24px;
      color: var(--dim);
      flex-shrink: 0;
    }

    .news-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .news-body {
      flex: 1;
      min-width: 0;
    }

    .news-link {
      display: block;
      padding: 12px 14px;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }

    .news-link:hover {
      background: var(--retro-yellow);
    }

    .news-headline {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      color: #1A1933;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-desc {
      margin-top: 4px;
      font-size: 11px;
      color: var(--dim);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-footer {
      margin-top: 4px;
      display: flex;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: #888888;
      letter-spacing: 0.06em;
      flex-wrap: wrap;
    }

    .news-source-link {
      color: var(--ink);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .news-source-link:hover {
      color: var(--retro-red);
    }

    .news-loading {
      padding: 28px 20px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-align: center;
      color: var(--dim);
    }

    /* ── Detail grid: 3 columns ── */

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.3fr) minmax(0, 1fr);
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

    .mob-player-cards {
      display: none;
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
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #E84B1A;
      font-size: 16px;
      pointer-events: none;
      line-height: 1;
      z-index: 1;
    }
    .search-input {
      width: 100%;
      padding: 10px 14px 10px 40px;
      font-family: var(--font-body);
      font-size: 14px;
      color: #1A1933;
      background: var(--paper-3);
      border: 1px solid rgba(26,25,51,0.2);
      border-radius: 8px;
      outline: none;
      box-shadow: none;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-input::placeholder {
      color: rgba(26,25,51,0.4);
    }
    .search-input:focus {
      border-color: #E84B1A;
      box-shadow: 0 0 0 3px rgba(232,75,26,0.15);
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

    /* ── Match expandable ── */

    .match-card-expand {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      overflow: hidden;
      transition: box-shadow 0.15s, transform 0.15s;
    }

    .match-card-expand.collapsed {
      cursor: pointer;
    }

    .match-card-expand.collapsed:hover {
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-hard-md);
    }

    .match-card-header {
      padding: 14px 18px;
      cursor: pointer;
    }

    .match-card-expand.open .match-card-header {
      border-bottom: 3px solid var(--ink);
      background: var(--paper);
    }

    .match-card-meta {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      color: var(--dim);
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .match-card-opponent {
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: var(--font-display);
      font-size: 26px;
      color: var(--ink);
    }

    .match-card-footer {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--dim);
    }

    .match-toggle-pill {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.12em;
      font-weight: 700;
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      padding: 3px 8px;
      color: var(--ink);
    }

    .match-card-expand.open .match-toggle-pill {
      background: var(--retro-orange);
      color: var(--paper);
      box-shadow: none;
      transform: translate(2px, 2px);
    }

    /* ── Match detail (expanded) ── */

    .match-detail {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .match-section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .match-section-num {
      background: var(--retro-blue);
      color: var(--paper);
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 3px 6px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      letter-spacing: 0.06em;
      font-weight: 700;
    }

    .match-section-num.orange { background: var(--retro-orange); }
    .match-section-num.green  { background: var(--retro-green);  }

    .match-section-title {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.18em;
      font-weight: 700;
      text-transform: uppercase;
    }

    .match-section-dash {
      flex: 1;
      border-top: 1.5px dashed rgba(26, 25, 51, 0.3);
    }

    .match-cronica {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.6;
      color: var(--ink);
      margin: 0;
    }

    /* Odds bar */
    .odds-bar {
      display: flex;
      height: 44px;
      border: 2.5px solid var(--ink);
      box-shadow: 3px 3px 0 0 var(--ink);
      overflow: hidden;
    }

    .odds-bar-seg {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 17px;
      transition: width 0.3s ease;
    }

    .odds-bar-seg + .odds-bar-seg {
      border-left: 2px solid var(--ink);
    }

    .odds-legend {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.1em;
      font-weight: 700;
      margin-top: 8px;
    }

    /* Probable scorers */
    .scorers-title {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.2em;
      color: var(--dim);
      font-weight: 700;
      text-transform: uppercase;
      margin: 12px 0 8px;
    }

    .scorers-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .scorer-chip {
      padding: 5px 10px;
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 12px;
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }

    .scorer-chip b {
      font-family: var(--font-display);
      font-size: 13px;
    }

    /* Pitch (match-detail) */
    .match-pitch-wrap {
      position: relative;
      background: linear-gradient(to bottom, var(--retro-green) 0%, #2a8048 50%, var(--retro-green) 100%);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      height: 640px;
      overflow: hidden;
    }

    .match-pitch-wrap svg.lines {
      position: absolute;
      inset: 0;
    }

    .pitch-tag {
      position: absolute;
      background: var(--paper);
      color: var(--ink);
      padding: 4px 8px;
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      font-weight: 700;
    }

    .pitch-dot {
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .pitch-dot .pdnum {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2.5px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-size: 13px;
      color: var(--paper);
    }

    .pitch-dot .pdname {
      background: rgba(26, 25, 51, 0.85);
      color: #fff;
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 2px 5px;
      white-space: nowrap;
      font-weight: 700;
    }

    /* ── Venue detail (inline) ── */

    .venue-detail-wrap {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: var(--paper-2);
      overflow: hidden;
    }

    .vd-photo {
      height: 180px;
      background-size: cover;
      background-position: center;
      border-bottom: 3px solid var(--ink);
      position: relative;
    }

    .vd-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .vd-back {
      all: unset;
      cursor: pointer;
      position: absolute;
      top: 10px;
      left: 10px;
      background: var(--paper);
      color: var(--ink);
      padding: 6px 10px;
      border: 2.5px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      font-weight: 700;
    }

    .vd-back:hover { background: var(--retro-yellow); }

    .vd-body {
      padding: 14px;
    }

    .vd-sub {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--dim);
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .vd-name {
      font-family: var(--font-display);
      font-size: 22px;
      line-height: 1;
      color: var(--ink);
      margin-bottom: 10px;
    }

    .vd-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border: 2px solid var(--ink);
      margin-bottom: 12px;
    }

    .vd-stat {
      padding: 8px 10px;
      text-align: center;
    }

    .vd-stat + .vd-stat {
      border-left: 2px solid var(--ink);
    }

    .vd-stat b {
      font-family: var(--font-display);
      font-size: 20px;
      display: block;
      color: var(--ink);
    }

    .vd-stat span {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.14em;
      color: var(--dim);
      font-weight: 700;
    }

    .vd-desc {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.55;
      color: var(--ink);
      margin: 0 0 12px;
    }

    .vd-matches-title {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--dim);
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .vd-match-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 10px;
      background: var(--paper);
      border: 2px solid var(--ink);
      margin-bottom: 5px;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    .vd-match-row b {
      font-family: var(--font-display);
      font-size: 13px;
    }

    .vd-phase-badge {
      background: var(--retro-blue);
      color: var(--paper);
      padding: 2px 7px;
      font-size: 9px;
      letter-spacing: 0.1em;
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-weight: 700;
    }

    .vd-goto-btn {
      all: unset;
      cursor: pointer;
      display: block;
      width: 100%;
      text-align: center;
      padding: 10px 12px;
      margin-top: 10px;
      background: var(--paper);
      color: var(--ink);
      border: 2.5px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.14em;
      font-weight: 700;
      box-sizing: border-box;
    }

    .vd-goto-btn:hover { background: var(--retro-yellow); }

    @media (max-width: 768px) {
      /* Cabecera ficha V1 — mobile */
      .ficha-grid {
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
        gap: 16px;
        padding: 20px 16px;
      }

      .ficha-name {
        font-size: 38px;
      }

      .ficha-chips {
        justify-content: center;
      }

      .jersey-display {
        justify-self: center;
      }

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

      .tabs {
        display: flex;
        flex-wrap: nowrap;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .tabs::-webkit-scrollbar { display: none; }

      .tabs button {
        flex: 0 0 auto;
        white-space: nowrap;
        min-height: 44px;
        border-bottom: 3px solid var(--ink);
        padding: 12px 16px;
      }

      .coach-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .table-wrap {
        display: none;
      }

      .mob-player-cards {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .panel-header-row {
        flex-wrap: wrap;
        gap: 8px;
      }

      .view-toggle button {
        min-height: 44px;
        padding: 6px 14px;
        touch-action: manipulation;
      }

      .mob-player-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border: 2px solid var(--ink);
        box-shadow: var(--shadow-hard-sm);
        background: var(--paper-2);
        cursor: pointer;
        min-height: 56px;
        transition: transform 0.1s, box-shadow 0.1s;
        touch-action: manipulation;
      }
      .mob-player-card:active {
        transform: translate(1px, 1px);
        box-shadow: 1px 1px 0 0 var(--ink);
      }
      .mob-player-avatar {
        width: 42px;
        height: 42px;
        flex-shrink: 0;
        border-radius: 50%;
        border: 2px solid var(--ink);
        background: var(--retro-blue);
        color: var(--paper);
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .mob-player-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
      }
      .mob-player-info {
        min-width: 0;
        flex: 1;
      }
      .mob-player-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .mob-player-number {
        font-family: var(--font-var);
        font-size: 16px;
        color: var(--retro-orange);
        min-width: 24px;
        text-align: center;
      }
      .mob-player-name {
        font-family: var(--font-display);
        font-size: 14px;
        color: var(--ink);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .mob-player-secondary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 32px;
      }
      .mob-player-pos-badge {
        font-family: var(--font-mono);
        font-size: 9px;
        padding: 1px 5px;
        border: 1.5px solid var(--ink);
        background: var(--ink);
        color: var(--paper);
        letter-spacing: 0.06em;
        flex-shrink: 0;
      }
      .mob-player-age {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--dim);
      }
      .mob-player-club {
        font-family: var(--font-mono);
        font-size: 10px;
        color: var(--dim);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
    this.addEventListener('touchstart', this._onSwipeStart, { passive: true });
    this.addEventListener('touchmove', this._onSwipeMove, { passive: false });
    this.addEventListener('touchend', this._onSwipeEnd, { passive: true });
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    this.removeEventListener('touchstart', this._onSwipeStart);
    this.removeEventListener('touchmove', this._onSwipeMove);
    this.removeEventListener('touchend', this._onSwipeEnd);
    super.disconnectedCallback();
  }

  private readonly _onSwipeStart = (e: TouchEvent) => {
    if (!this.selectedTeamId) return;
    this._swipeStartX = e.touches[0].clientX;
    this._swipeStartY = e.touches[0].clientY;
    this._isSwiping = false;
  };

  private readonly _onSwipeMove = (e: TouchEvent) => {
    if (!this.selectedTeamId) return;
    if (!this._isSwiping) {
      const dx = Math.abs(e.touches[0].clientX - this._swipeStartX);
      const dy = Math.abs(e.touches[0].clientY - this._swipeStartY);
      if (dx > 20 && dx > dy * 1.5) {
        this._isSwiping = true;
      }
      return;
    }
    if (e.cancelable) e.preventDefault();
  };

  private readonly _onSwipeEnd = (e: TouchEvent) => {
    if (!this.selectedTeamId || !this._isSwiping) return;
    this._isSwiping = false;
    const dx = e.changedTouches[0].clientX - this._swipeStartX;
    if (Math.abs(dx) < 60) return;

    const currentTeam = TEAMS_2026.find(t => t.id === this.selectedTeamId);
    if (!currentTeam) return;
    const groupTeams = TEAMS_2026.filter(t => t.group === currentTeam.group);
    const currentIdx = groupTeams.findIndex(t => t.id === this.selectedTeamId);
    if (currentIdx === -1) return;

    const nextIdx = dx < 0 ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx < 0 || nextIdx >= groupTeams.length) return;
    this.selectTeam(groupTeams[nextIdx].id);
  };

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
          matchId: match.matchId,
          phase: `Grupo ${match.group}`,
          date: match.date,
          timeSpain: match.timeSpain,
          venue: stadium?.name ?? match.venueId,
          venueId: match.venueId,
          city: stadium?.city ?? '',
          opponentId: match.teamA === teamId ? match.teamB : match.teamA,
          matchDay: match.matchDay,
          teamId,
          isHome: match.teamA === teamId,
        };
      })
      .sort((a, b) => {
        const ak = `${a.date}T${a.timeSpain}`;
        const bk = `${b.date}T${b.timeSpain}`;
        return ak.localeCompare(bk);
      });
  }

  private _toggleMatch(matchId: string, teamAId: string, opponentId: string | null) {
    if (this._openMatchId === matchId) {
      this._openMatchId = null;
      return;
    }
    this._openMatchId = matchId;
    if (!this._matchOddsCache.has(matchId)) {
      getOddsForMatch(matchId, teamAId, opponentId ?? undefined).then(odds => {
        if (odds) {
          this._matchOddsCache = new Map(this._matchOddsCache).set(matchId, odds);
        }
      });
    }
  }

  private formatDate(date: string, timeSpain: string) {
    if (!date) return t('squads.matchDetail.dateTBD');
    const base = formatShortDate(date);
    return `${base} · ${timeSpain || '--:--'} ESP`;
  }

  private selectTeam(id: string) {
    this.selectedTeamId = id;
    this.activeTab = 'squad';
    this._loadNewsForTeam(id, useLocaleStore.getState().locale);
  }

  goBack() {
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
    const coachPhoto = resolveCoachPhoto(selectedTeam.id, coach);
    const coachName = coach ? coach.name : selectedTeam.name;
    const coachAvatar = coachPhoto
      ? html`<img src="${coachPhoto}" alt="${coachName}" loading="lazy" decoding="async" class="coach-img">`
      : getInitials(coachName);
    const locale = useLocaleStore.getState().locale;

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
        ${this._renderTeamHeader(selectedTeam, squad, isOfficial, teamMatches.length)}

        ${coach ? html`
          <div class="coach-card">
            <div class="coach-avatar">${coachAvatar}</div>
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
          <button class=${this.activeTab === 'news' ? 'active' : ''} @click=${() => { this.activeTab = 'news'; }}>${t('squads.tab.news')}</button>
        </nav>

        <div class="detail-grid">
          <div class="panel-block ${this.activeTab !== 'squad' ? 'tab-hidden' : ''}">
            <div class="panel-header-row">
              <div class="panel-title">${t('squads.tab.squad')}</div>
              ${getLineup(selectedTeam.id) ? html`
                <div class="view-toggle">
                  <button class=${this.squadViewMode === 'list' ? 'active' : ''} @click=${() => { this.squadViewMode = 'list'; }}>${t('squads.list.viewList')}</button>
                  <button class=${this.squadViewMode === 'pitch' ? 'active' : ''} @click=${() => { this.squadViewMode = 'pitch'; }}>${t('squads.list.viewPitch')}</button>
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
                    <th>${t('squads.table.player')}</th>
                    <th>${t('squads.table.pos')}</th>
                    <th>${t('player.labelAge')}</th>
                    <th>${t('squads.table.club')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${squad.map(player => {
                    const photo = resolvePlayerPhoto(selectedTeam.id, player);
                    return html`
                    <tr
                      class="player-row"
                      @click=${() => { this._openPlayer = { player, teamId: selectedTeam.id }; }}
                    >
                      <td><div class="player-avatar">
                        ${photo
                          ? html`<img src="${photo}" alt="${player.name}" loading="lazy" decoding="async">`
                          : getInitials(player.name)}
                      </div></td>
                      <td>${player.number}</td>
                      <td>
                        ${player.name}
                        ${player.captain ? html`<span class="captain">${t('squads.table.captain')}</span>` : ''}
                      </td>
                      <td>${player.position}</td>
                      <td>${player.age}</td>
                      <td>${player.club}</td>
                    </tr>
                  `;
                  })}
                </tbody>
              </table>
            </div>
            <div class="mob-player-cards">
              ${squad.map(player => {
                const photo = resolvePlayerPhoto(selectedTeam.id, player);
                return html`
                <div
                  class="mob-player-card"
                  @click=${() => { this._openPlayer = { player, teamId: selectedTeam.id }; }}
                >
                  <div class="mob-player-avatar">
                    ${photo
                      ? html`<img src="${photo}" alt="${player.name}" loading="lazy" decoding="async">`
                      : getInitials(player.name)}
                  </div>
                  <div class="mob-player-info">
                    <div class="mob-player-primary">
                      <span class="mob-player-number">${player.number}</span>
                      <span class="mob-player-name">${player.name}</span>
                      ${player.captain ? html`<span class="captain">CAP</span>` : ''}
                    </div>
                    <div class="mob-player-secondary">
                      <span class="mob-player-pos-badge">${player.position}</span>
                      <span class="mob-player-age">${t('player.ageSuffix', { n: player.age })}</span>
                      <span class="mob-player-club">${player.club}</span>
                    </div>
                  </div>
                </div>
              `;
              })}
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
                    const isOpen = this._openMatchId === match.matchId;
                    const odds = this._matchOddsCache.get(match.matchId);
                    const lineup = getLineup(selectedTeam.id);
                    const opponentLineup = match.opponentId ? getLineup(match.opponentId) : null;
                    return html`
                      <article class="match-card-expand ${isOpen ? 'open' : 'collapsed'}">
                        <div
                          class="match-card-header"
                          @click=${() => this._toggleMatch(match.matchId, match.teamId, match.opponentId)}
                        >
                          <div class="match-card-meta">
                            <span>${match.phase} · ${t('squads.matchDetail.matchday', { n: String(match.matchDay) })}</span>
                            <span>${this.formatDate(match.date, match.timeSpain)}</span>
                          </div>
                          <div class="match-card-opponent">
                            ${renderFlag(opponent, 'sm')}
                            <span>${opponent?.name ?? t('squads.matchDetail.unknownOpp')}</span>
                          </div>
                          <div class="match-card-footer">
                            <span>${match.venue} · ${match.city}</span>
                            <span class="match-toggle-pill">${isOpen ? t('squads.matchDetail.collapse') : t('squads.matchDetail.expand')}</span>
                          </div>
                        </div>

                        ${isOpen ? html`
                          <div class="match-detail">
                            <!-- Probabilidades -->
                            ${odds ? html`
                              <div>
                                <div class="match-section-label">
                                  <span class="match-section-num orange">01</span>
                                  <span class="match-section-title">${t('squads.matchDetail.oddsLabel')}</span>
                                  <span class="match-section-dash"></span>
                                </div>
                                <div class="odds-bar">
                                  <div class="odds-bar-seg"
                                    style="width:${match.isHome ? odds.home : odds.away}%;background:var(--retro-orange);color:var(--paper)">
                                    ${match.isHome ? odds.home : odds.away}%
                                  </div>
                                  <div class="odds-bar-seg"
                                    style="width:${odds.draw}%;background:var(--paper-2);color:var(--ink)">
                                    ${odds.draw}%
                                  </div>
                                  <div class="odds-bar-seg"
                                    style="width:${match.isHome ? odds.away : odds.home}%;background:var(--retro-blue);color:var(--paper)">
                                    ${match.isHome ? odds.away : odds.home}%
                                  </div>
                                </div>
                                <div class="odds-legend">
                                  <span>${t('squads.matchDetail.oddsHome', { team: selectedTeam.name.toUpperCase() })}</span>
                                  <span>${t('squads.matchDetail.oddsDraw')}</span>
                                  <span>${t('squads.matchDetail.oddsAway', { team: (opponent?.name ?? '').toUpperCase() })}</span>
                                </div>
                              </div>
                            ` : html`
                              <div>
                                <div class="match-section-label">
                                  <span class="match-section-num orange">01</span>
                                  <span class="match-section-title">${t('squads.matchDetail.oddsLabel')}</span>
                                  <span class="match-section-dash"></span>
                                </div>
                                <div style="display:flex;flex-direction:column;gap:6px;padding:8px 0">
                                  <div class="skeleton skeleton-line" style="width:100%"></div>
                                  <div class="skeleton skeleton-line" style="width:60%"></div>
                                </div>
                              </div>
                            `}

                            <!-- Alineaciones / cancha -->
                            ${(lineup || opponentLineup) ? html`
                              <div>
                                <div class="match-section-label">
                                  <span class="match-section-num green">02</span>
                                  <span class="match-section-title">${t('squads.matchDetail.lineups')}</span>
                                  <span class="match-section-dash"></span>
                                </div>
                                <div class="match-pitch-wrap">
                                  <svg class="lines" viewBox="0 0 400 640" preserveAspectRatio="none">
                                    <rect x="5" y="5" width="390" height="630" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
                                    <line x1="5" y1="320" x2="395" y2="320" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
                                    <circle cx="200" cy="320" r="48" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
                                    <circle cx="200" cy="320" r="3" fill="rgba(255,255,255,0.45)"/>
                                    <rect x="120" y="5"   width="160" height="78" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
                                    <rect x="120" y="557" width="160" height="78" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
                                  </svg>
                                  ${lineup ? this._renderPitchTeam(squad, lineup, true, 'var(--retro-orange)') : ''}
                                  ${opponentLineup && match.opponentId
                                    ? this._renderPitchTeam(getSquad(match.opponentId), opponentLineup, false, 'var(--retro-blue)')
                                    : ''}
                                  <div class="pitch-tag" style="top:8px;left:8px">
                                    ${selectedTeam.name} · ${lineup?.formation ?? ''}
                                  </div>
                                  ${match.opponentId ? html`
                                    <div class="pitch-tag" style="bottom:8px;right:8px">
                                      ${opponentLineup?.formation ?? ''} · ${opponent?.name ?? ''}
                                    </div>
                                  ` : ''}
                                </div>
                              </div>
                            ` : ''}

                          </div>
                        ` : ''}
                      </article>
                    `;
                  })}
                </div>
              `}
          </div>

          <div class="panel-block ${this.activeTab !== 'news' ? 'tab-hidden' : ''}">
            <div class="panel-title">${t('squads.tab.news')}</div>
            ${this._newsLoading
              ? html`
                <div class="news-list">
                  ${[1, 2, 3].map(() => html`
                    <div class="news-card skeleton-card">
                      <div class="skeleton skeleton-img" style="width:100px;height:70px;flex-shrink:0"></div>
                      <div class="news-body" style="padding:12px">
                        <div class="skeleton skeleton-line" style="width:80%"></div>
                        <div class="skeleton skeleton-line" style="width:60%"></div>
                        <div class="skeleton skeleton-line" style="width:40%"></div>
                      </div>
                    </div>
                  `)}
                </div>
              `
              : this._newsError
                ? html`
                  <div class="error-state">
                    <span class="empty-state-icon">⚠</span>
                    <span>${t('squads.news.error')}</span>
                    <button class="btn btn-secondary" @click=${() => this._retryNews()}>${t('squads.news.retry')}</button>
                  </div>
                `
              : this._news === null || this._news.length === 0
                ? html`<div class="empty-state">
                    <span class="empty-state-icon">📰</span>
                    <span>${t('squads.news.empty')}</span>
                  </div>`
                : html`
                  <div class="news-list">
                    ${this._news.map(item => html`
                      <article class="news-card">
                        <div class="news-thumb" style="${!item.image ? `background: linear-gradient(135deg, ${(TEAM_COLORS[selectedTeam.id] ?? ['#888','#555']).join(',')}); justify-content: center;` : ''}">
                          ${item.image
                            ? html`<img src="${item.image}" alt="" loading="lazy" decoding="async" />`
                            : html`<span style="color: #fff; font-family: var(--font-var); font-size: 18px; font-weight: 700;">${selectedTeam.id.substring(0, 3)}</span>`
                          }
                        </div>
                        <div class="news-body">
                          <a class="news-link" href="${item.url}" target="_blank" rel="noopener noreferrer">
                            <div class="news-headline">${item.title}</div>
                            ${item.description ? html`<div class="news-desc">${item.description}</div>` : ''}
                            <div class="news-footer">
                              <span>${formatShortDate(item.date)}</span>
                              <span>·</span>
                              ${item.sourceUrl
                                ? html`<a class="news-source-link" href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer" @click=${(e: Event) => e.stopPropagation()}>${item.source}</a>`
                                : html`<span>${item.source}</span>`}
                            </div>
                          </a>
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

  private _renderTeamHeader(
    team: (typeof TEAMS_2026)[number],
    squad: Player[],
    isOfficial: boolean,
    pendingMatches: number,
  ) {
    const id = team.id;
    const colors = TEAM_COLORS[id] ?? ['#22418c', '#f0b021'];
    // Si el color base es casi-blanco, intercambiar para que la franja sea visible
    let [base, accent] = colors;
    if (base.toUpperCase() === '#FFFFFF' || base.toUpperCase() === '#FFF') {
      [base, accent] = [accent, base];
    }

    const titles = WORLD_TITLES[id] ?? 0;
    const stars = titles ? '★'.repeat(titles) : '';

    return html`
      <div class="detail-header"
        style="--kit:${base}; --kit-trim:var(--ink); --kit-num:${accent};">
        <div class="kit-stripe"></div>
        <div class="ficha-grid">

          <!-- Medallón del escudo -->
          <div class="crest-medallion">
            <div class="disc-shadow"></div>
            <div class="disc"><div class="disc-ring"></div></div>
            <img
              class="crest-img"
              src="${crestSrc(id)}"
              alt="${team.name}"
              loading="lazy"
              decoding="async"
              @error=${(e: Event) => { (e.target as HTMLElement).style.display = 'none'; }}
            >
            ${titles ? html`
              <div class="crest-stars" title="${titles} títulos mundiales">${stars}</div>
            ` : ''}
          </div>

          <!-- Identidad -->
          <div class="ficha-identity">
            <div class="ficha-name">${team.name}</div>
            <div class="ficha-chips">
              <span class="chip solid">★ ${t('squads.list.groupTitle', { letter: team.group })}</span>
              ${isOfficial ? html`<span class="chip green">✓ ${t('squads.official')}</span>` : ''}
              <span class="chip">${t('squads.card.playersMany', { n: squad.length })}</span>
              <span class="chip">${t('squads.matches.pending', { n: String(pendingMatches) })}</span>
            </div>
          </div>

          <!-- Expositor de camiseta titular -->
          <div class="jersey-display">
            <span class="jersey-tag">TITULAR</span>
            <img
              src="${kitSrc(id)}"
              alt="Camiseta titular ${team.name}"
              loading="lazy"
              decoding="async"
              @error=${(e: Event) => { (e.target as HTMLElement).style.opacity = '0'; }}
            >
            <div class="jersey-plinth"></div>
            <div class="jersey-shadow"></div>
          </div>

        </div>
      </div>
    `;
  }

  private _renderPitchTeam(squad: Player[], lineup: { formation: string; startingXI: number[] }, isTop: boolean, color: string) {
    const FORMATIONS: Record<string, number[][]> = {
      '4-3-3':   [[50,8],[12,28],[38,26],[62,26],[88,28],[25,55],[50,50],[75,55],[18,88],[50,90],[82,88]],
      '4-2-3-1': [[50,8],[12,28],[38,26],[62,26],[88,28],[32,45],[68,45],[22,72],[50,72],[78,72],[50,90]],
      '4-4-2':   [[50,8],[12,28],[38,26],[62,26],[88,28],[15,55],[40,52],[60,52],[85,55],[30,88],[70,88]],
      '3-5-2':   [[50,8],[22,26],[50,22],[78,26],[12,50],[35,55],[62,55],[88,50],[50,40],[30,88],[70,88]],
      '5-3-2':   [[50,8],[8,26],[28,22],[50,18],[72,22],[92,26],[22,55],[50,50],[78,55],[32,88],[68,88]],
    };
    const slots = FORMATIONS[lineup.formation] ?? FORMATIONS['4-3-3'];
    const starters = lineup.startingXI
      .map(n => squad.find(p => p.number === n))
      .filter((p): p is Player => !!p);

    return starters.map((player, i) => {
      const slot = slots[i];
      if (!slot) return '';
      const [sx, sy] = slot;
      const x = sx;
      // cada equipo ocupa 3%–47% (arriba) o 53%–97% (abajo), dejando margen en el centro
      const y = isTop ? 3 + sy * 0.44 : 97 - sy * 0.44;
      const lastName = player.name.trim().split(/\s+/).at(-1) ?? player.name;
      return html`
        <div class="pitch-dot" style="left:${x}%;top:${y}%">
          <div class="pdnum" style="background:${color}">${player.number}</div>
          <div class="pdname">${lastName}</div>
        </div>
      `;
    });
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
        <span class="search-icon">🔍</span>
        <input
          type="search"
          class="search-input"
          placeholder=${t('squads.list.searchPlaceholder')}
          aria-label=${t('squads.list.searchLabel')}
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

      ${showNoResults ? html`<div class="no-results">${t('squads.list.noResults')}</div>` : ''}

      <div class="groups-stack">
        ${groupsWithMatch.map(group => {
          const teamsInGroup = TEAMS_2026.filter(t => t.group === group);
          return html`
            <section class="group-block">
              <div class="group-header">
                <div class="group-title">${t('squads.list.groupTitle', { letter: group })}</div>
                <div class="group-sub">${t('squads.list.groups', { n: 4 })}</div>
              </div>
              <div class="teams-grid">
                ${teamsInGroup.map(team => {
                  const dimmed = isFiltering && !this._teamMatchesQuery(team.id);
                  const colors = TEAM_COLORS[team.id] ?? ['#ccc', '#999'];
                  const squadLen = getSquad(team.id).length;
                  return html`
                    <button
                      class="team-card"
                      style="${dimmed ? 'opacity: 0.25; pointer-events: none;' : ''}"
                      @click=${() => this.selectTeam(team.id)}>
                      <div class="tc-strip" style="background: linear-gradient(90deg, ${colors[0]}, ${colors[1]})"></div>
                      <div class="tc-body">
                        <div class="tc-flag-circle">
                          ${team.flagUrl
                            ? html`<img src="${team.flagUrl}" alt="${team.name}">`
                            : (team as any).flag ?? '?'}
                        </div>
                        <div class="team-name">${team.name}</div>
                        <div class="tc-group">${t('squads.list.groupTitle', { letter: team.group })}</div>
                        <div class="tc-players">
                          ${isOfficialSquad(team.id)
                            ? html`✓ ${squadLen} ${t('squads.card.playersMany', { n: squadLen })}`
                            : html`${squadLen} ${t('squads.card.playersMany', { n: squadLen })}`}
                        </div>
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

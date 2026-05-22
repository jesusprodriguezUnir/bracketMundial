import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, initialGroupMatches, getKnockoutMatchOrder, recalculateStandings, getWinnerId } from '../store/tournament-store';
import { useLeaguesStore, type League, type LeagueParticipant } from '../store/leagues-store';
import { scoreParticipant, rankParticipants } from '../lib/mini-league';
import type { ParticipantScore, MatchPoints } from '../lib/mini-league';
import { buildResolvedKnockout } from '../lib/bracket-logic';
import { KNOCKOUT_BRACKET, TEAMS_2026 } from '../data/fifa-2026';
import { GROUP_MATCHES } from '../data/match-schedule';
import { renderFlag } from '../lib/render-flag';
import { t, useLocaleStore } from '../i18n';
import type { DecodedBracket } from '../lib/bracket-codec';
import { ExcelService } from '../lib/excel-service';

const TOTAL_MATCHES = 104;

const groupMatchById = new Map(GROUP_MATCHES.map(m => [m.matchId, m]));
const teamById = new Map<string, (typeof TEAMS_2026)[number]>(TEAMS_2026.map(t => [t.id as string, t]));

function getTeam(id: string) {
  return teamById.get(id);
}

function realGroupScoresFromStore() {
  return useTournamentStore.getState().groupMatches.map(m => ({
    matchId: m.matchId,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
  }));
}

type Screen = 'list' | 'detail' | 'bracket';

interface BracketScreenData {
  participant: LeagueParticipant;
  name: string;
}

function deriveYouParticipant(): LeagueParticipant {
  const st = useTournamentStore.getState();
  const groupScores: DecodedBracket['groupScores'] = st.groupMatches.map(m => ({
    matchId: m.matchId,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
  }));
  const knockoutOrder = getKnockoutMatchOrder();
  const knockoutScores: DecodedBracket['knockoutScores'] = knockoutOrder.map(matchId => {
    const m = st.knockoutMatches[matchId];
    return {
      matchId,
      scoreA: m?.scoreA ?? null,
      scoreB: m?.scoreB ?? null,
      penaltyScoreA: m?.penaltyScoreA ?? null,
      penaltyScoreB: m?.penaltyScoreB ?? null,
    };
  });
  return {
    id: '__me__',
    name: t('league.you'),
    addedAt: 0,
    source: 'link' as const,
    groupScores,
    knockoutScores,
  };
}

function getGroupScores(participant: LeagueParticipant): DecodedBracket['groupScores'] {
  return participant.groupScores;
}

function getKnockoutScores(participant: LeagueParticipant): DecodedBracket['knockoutScores'] {
  return participant.knockoutScores;
}

@customElement('leagues-view')
export class LeaguesView extends LitElement {
  @state() private _screen: Screen = 'list';
  @state() private _leagues: League[] = [];
  @state() private _activeLeagueId: string | null = null;
  @state() private _scores: ParticipantScore[] = [];
  @state() private _playedCount = 0;
  @state() private _expandedId: string | null = null;
  @state() private _newName = '';
  @state() private _newUrl = '';
  @state() private _error: string | null = null;
  @state() private _uploadError: string | null = null;
  @state() private _newLeagueName = '';
  @state() private _confirmDeleteLeague: string | null = null;
  @state() private _confirmClearResults = false;
  @state() private _bracketData: BracketScreenData | null = null;
  @state() private _editMode = false;
  private _editBuffer: Map<string, { scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }> = new Map();

  private _unsubTournament?: () => void;
  private _unsubLeagues?: () => void;
  private _unsubLocale?: () => void;

  static readonly styles = css`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px;
      font-family: var(--font-body);
      color: var(--ink);
    }

    .lg-header {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 24px;
      margin-bottom: 28px;
    }
    .lg-title {
      font-family: var(--font-var);
      font-size: 28px;
      letter-spacing: 0.02em;
      color: var(--ink);
      margin-bottom: 6px;
    }
    .lg-subtitle {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .lg-progress {
      background: var(--paper-2);
      border: 2px solid var(--ink);
      padding: 12px 16px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .lg-progress-bar {
      flex: 1;
      min-width: 120px;
      height: 14px;
      background: var(--paper);
      border: 2px solid var(--ink);
    }
    .lg-progress-fill {
      height: 100%;
      background: var(--retro-green);
      transition: width 0.3s;
    }
    .lg-progress-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.04em;
      white-space: nowrap;
    }

    /* ── LIST ── */
    .lg-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .lg-card {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 20px;
      cursor: pointer;
      transition: background 0.1s;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .lg-card:hover {
      background: var(--retro-yellow);
    }
    .lg-card-main {
      flex: 1;
    }
    .lg-card-name {
      font-family: var(--font-var);
      font-size: 20px;
      letter-spacing: 0.04em;
    }
    .lg-card-meta {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.06em;
      margin-top: 4px;
    }
    .lg-card-leader {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.04em;
      text-align: right;
    }
    .lg-card-leader strong {
      font-family: var(--font-var);
      color: var(--retro-red);
      font-size: 14px;
    }
    .lg-card-actions {
      display: flex;
      gap: 8px;
    }
    .lg-small-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.06em;
      padding: 6px 10px;
      border: 1px solid var(--ink);
      background: var(--paper);
    }
    .lg-small-btn:hover {
      background: var(--retro-red);
      color: var(--paper);
      border-color: var(--retro-red);
    }

    .lg-create-section {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .lg-create-section input {
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 10px 12px;
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink);
      outline: none;
      box-shadow: var(--shadow-hard-sm);
      flex: 1;
      min-width: 200px;
    }
    .lg-create-section input:focus {
      border-color: var(--retro-orange);
    }

    .lg-empty {
      text-align: center;
      padding: 40px 20px;
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--dim);
      letter-spacing: 0.04em;
    }

    /* ── BUTTONS ── */
    .lg-btn {
      all: unset;
      cursor: pointer;
      background: var(--retro-yellow);
      border: 2px solid var(--ink);
      padding: 10px 20px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.06em;
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
      min-height: 42px;
      display: inline-flex;
      align-items: center;
    }
    .lg-btn:hover {
      background: var(--retro-orange);
      color: var(--paper);
    }
    .lg-btn-sm {
      all: unset;
      cursor: pointer;
      background: var(--retro-yellow);
      border: 2px solid var(--ink);
      padding: 6px 14px;
      font-family: var(--font-var);
      font-size: 11px;
      letter-spacing: 0.04em;
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
      min-height: 32px;
      display: inline-flex;
      align-items: center;
    }
    .lg-btn-sm:hover {
      background: var(--retro-orange);
      color: var(--paper);
    }
    .lg-btn-back {
      all: unset;
      cursor: pointer;
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 10px 20px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.06em;
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .lg-btn-back:hover {
      background: var(--ink);
      color: var(--retro-yellow);
    }
    .lg-upload-btn {
      all: unset;
      cursor: pointer;
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 10px 20px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.06em;
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
      min-height: 42px;
      display: flex;
      align-items: center;
    }
    .lg-upload-btn:hover {
      background: var(--retro-blue);
      color: var(--paper);
    }
    .lg-upload-btn-sm {
      all: unset;
      cursor: pointer;
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 6px 14px;
      font-family: var(--font-var);
      font-size: 11px;
      letter-spacing: 0.04em;
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
      min-height: 32px;
      display: flex;
      align-items: center;
    }
    .lg-upload-btn-sm:hover {
      background: var(--retro-blue);
      color: var(--paper);
    }
    .lg-danger-btn {
      all: unset;
      cursor: pointer;
      background: var(--retro-red);
      color: var(--paper);
      border: 2px solid var(--ink);
      padding: 10px 20px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.06em;
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
      min-height: 42px;
      display: inline-flex;
      align-items: center;
    }
    .lg-danger-btn:hover {
      background: var(--retro-orange);
    }

    /* ── DETAIL / ADD ── */
    .lg-detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;
    }
    .lg-detail-name {
      font-family: var(--font-var);
      font-size: 24px;
      letter-spacing: 0.04em;
    }
    .lg-add-section {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      padding: 20px;
      margin-bottom: 28px;
    }
    .lg-add-section h3 {
      font-family: var(--font-var);
      font-size: 16px;
      margin-bottom: 16px;
      letter-spacing: 0.04em;
    }
    .lg-add-row {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .lg-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 160px;
    }
    .lg-field label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-field input {
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 10px 12px;
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink);
      outline: none;
      box-shadow: var(--shadow-hard-sm);
    }
    .lg-field input:focus {
      border-color: var(--retro-orange);
    }
    .lg-error {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--retro-red);
      margin-top: 8px;
    }
    .lg-confirm-box {
      background: var(--paper-3);
      border: 2px solid var(--retro-red);
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .lg-confirm-box span {
      font-family: var(--font-var);
      font-size: 14px;
    }

    /* ── RANKING ── */
    .lg-ranking {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow-x: auto;
    }
    .lg-ranking-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .lg-ranking-table th {
      background: var(--ink);
      color: var(--retro-yellow);
      font-family: var(--font-var);
      font-size: 11px;
      letter-spacing: 0.06em;
      padding: 12px 14px;
      text-align: left;
      white-space: nowrap;
    }
    .lg-ranking-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.02em;
    }
    .lg-ranking-table td.lg-rank-pos,
    .lg-ranking-table td.lg-rank-total,
    .lg-ranking-table td.lg-rank-phase { white-space: nowrap; }
    .lg-ranking-table tr:nth-child(even) td {
      background: var(--paper-2);
    }
    .lg-ranking-table tr:last-child td {
      border-bottom: none;
    }
    .lg-rank-pos {
      font-family: var(--font-var);
      font-size: 18px;
      width: 50px;
      text-align: center;
    }
    .lg-rank-leader td {
      background: var(--retro-yellow) !important;
      font-weight: bold;
    }
    .lg-rank-me td {
      background: var(--paper-3) !important;
    }
    .lg-rank-silver td {
      background: var(--paper) !important;
    }
    .lg-rank-bronze td {
      background: var(--paper-2) !important;
    }
    .lg-rank-name {
      font-family: var(--font-var);
      letter-spacing: 0.04em;
      font-size: 15px;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lg-rank-total {
      font-family: var(--font-var);
      font-size: 20px;
      color: var(--retro-red);
    }
    .lg-rank-phase {
      font-size: 12px;
      color: var(--dim);
    }
    .lg-expand-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      padding: 4px 8px;
      background: var(--paper);
      border: 1px solid var(--ink);
      margin-right: 6px;
    }
    .lg-expand-btn:hover {
      background: var(--ink);
      color: var(--retro-yellow);
    }
    .lg-delete-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-red);
      letter-spacing: 0.06em;
      padding: 4px 8px;
    }
    .lg-delete-btn:hover {
      background: var(--retro-red);
      color: var(--paper);
    }
    .lg-bracket-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      padding: 4px 8px;
      background: var(--paper);
      border: 1px solid var(--ink);
      margin-right: 6px;
      color: var(--retro-blue);
    }
    .lg-bracket-btn:hover {
      background: var(--retro-blue);
      color: var(--paper);
    }

    /* ── BREAKDOWN ── */
    .lg-detail {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      margin: 0 0 24px 0;
      padding: 16px;
    }
    .lg-detail-header-text {
      font-family: var(--font-var);
      font-size: 16px;
      margin-bottom: 12px;
      letter-spacing: 0.04em;
    }
    .lg-detail-subs {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .lg-detail-sub {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.04em;
    }
    .lg-detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 6px;
    }
    .lg-detail-item {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.03em;
      padding: 6px 8px;
      border: 1px solid var(--ink);
    }
    .lg-kind-exact { background: var(--retro-green); color: var(--paper); }
    .lg-kind-diff { background: var(--retro-blue); color: var(--paper); }
    .lg-kind-sign { background: var(--retro-yellow); }
    .lg-kind-miss { background: var(--paper-2); color: var(--dim); }
    .lg-kind-pending { background: var(--paper); color: var(--dim); opacity: 0.6; }

    /* ── BRACKET SCREEN ── */
    .lg-bracket-screen { }
    .lg-bracket-phase-title {
      font-family: var(--font-var);
      font-size: 18px;
      letter-spacing: 0.04em;
      margin: 20px 0 12px;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 6px;
    }
    .lg-bracket-match {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      padding: 12px 16px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .lg-bracket-teams {
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.03em;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .lg-bracket-team-name {
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.03em;
    }
    .lg-bracket-vs {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      padding: 0 4px;
    }
    .lg-bracket-score {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: bold;
    }
    .lg-bracket-result {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.04em;
    }
    .lg-bracket-points {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 2px 8px;
      border: 1px solid var(--ink);
    }
    .lg-section-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    .lg-bracket-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0 12px;
    }
    @media (min-width: 900px) {
      .lg-bracket-grid {
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      }
    }

    .lg-hint {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.04em;
      margin-top: 12px;
    }

    /* ── EDIT MODE ── */
    .lg-edit-input {
      width: 42px;
      padding: 4px 6px;
      font-family: var(--font-mono);
      font-size: 14px;
      text-align: center;
      background: var(--retro-yellow);
      border: 2px solid var(--ink);
      color: var(--ink);
      outline: none;
    }
    .lg-edit-input:focus {
      border-color: var(--retro-orange);
    }
    .lg-edit-sep {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: bold;
      padding: 0 2px;
    }
    .lg-edit-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: center;
    }
    .lg-action-row {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .lg-clear-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      color: var(--dim);
      padding: 6px 12px;
      border: 1px solid var(--dim);
    }
    .lg-clear-btn:hover {
      color: var(--retro-red);
      border-color: var(--retro-red);
    }
    .lg-clear {
      margin-top: 24px;
      text-align: right;
    }

    @media (max-width: 768px) {
      :host { padding: 16px 12px; }
      .lg-title { font-size: 22px; }
      .lg-ranking-table th, .lg-ranking-table td { padding: 8px 10px; font-size: 11px; }
      .lg-add-row { flex-direction: column; }
      .lg-field { min-width: 100%; }
      .lg-detail-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._unsubTournament = useTournamentStore.subscribe(() => this._recalc());
    this._unsubLeagues = useLeaguesStore.subscribe(() => this._recalc());
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._recalc();
  }

  disconnectedCallback() {
    this._unsubTournament?.();
    this._unsubLeagues?.();
    this._unsubLocale?.();
    super.disconnectedCallback();
  }

  private _recalc() {
    const leaguesState = useLeaguesStore.getState();
    this._leagues = leaguesState.leagues;
    this._activeLeagueId = leaguesState.activeLeagueId;

    if (this._screen === 'list') return;

    const tournament = useTournamentStore.getState();

    const realGroupScores = realGroupScoresFromStore();

    const realKnockoutOrder = getKnockoutMatchOrder();
    const realKnockoutScores = realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return {
        matchId,
        scoreA: m?.scoreA ?? null,
        scoreB: m?.scoreB ?? null,
      };
    });

    let played = 0;
    for (const r of realGroupScores) {
      if (r.scoreA !== null && r.scoreB !== null) played++;
    }
    for (const r of realKnockoutScores) {
      if (r.scoreA !== null && r.scoreB !== null) played++;
    }
    this._playedCount = played;

    if (this._screen === 'detail') {
      const league = this._leagues.find(l => l.id === this._activeLeagueId);
      if (!league) return;

      const you = deriveYouParticipant();
      const allParticipants = [you, ...league.participants];

      const scored: ParticipantScore[] = [];
      for (const p of allParticipants) {
        scored.push(scoreParticipant(p, realGroupScores, realKnockoutScores));
      }

      this._scores = rankParticipants(scored);
    }
  }

  private _goToList() {
    this._screen = 'list';
    this._bracketData = null;
  }

  private _goToDetail(leagueId: string) {
    useLeaguesStore.getState().setActiveLeague(leagueId);
    this._screen = 'detail';
    this._bracketData = null;
  }

  private _createLeague() {
    const name = this._newLeagueName.trim();
    if (!name) return;
    useLeaguesStore.getState().createLeague(name);
    this._newLeagueName = '';
  }

  private _renameLeague(id: string) {
    const name = prompt(t('league.leagueName'), this._leagues.find(l => l.id === id)?.name ?? '');
    if (name && name.trim()) {
      useLeaguesStore.getState().renameLeague(id, name.trim());
    }
  }

  private _requestDeleteLeague(id: string) {
    this._confirmDeleteLeague = id;
  }

  private _confirmDelete() {
    if (this._confirmDeleteLeague) {
      useLeaguesStore.getState().deleteLeague(this._confirmDeleteLeague);
      useTournamentStore.getState().resetTournament();
      this._confirmDeleteLeague = null;
      this._screen = 'list';
    }
  }

  private _cancelDelete() {
    this._confirmDeleteLeague = null;
  }

  private _addFromUrl() {
    const name = this._newName.trim();
    if (!name) { this._error = t('league.errorNoName'); return; }
    const url = this._newUrl.trim();
    if (!url) { this._error = t('league.errorNoLink'); return; }
    const leagueId = this._activeLeagueId;
    if (!leagueId) return;
    const ok = useLeaguesStore.getState().addParticipantFromUrl(leagueId, name, url);
    if (!ok) { this._error = t('league.errorInvalidLink'); return; }
    this._newName = '';
    this._newUrl = '';
    this._error = null;
    this._uploadError = null;
  }

  private async _handleFileUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const name = this._newName.trim();
    if (!name) { this._uploadError = t('league.errorNoName'); input.value = ''; return; }
    const leagueId = this._activeLeagueId;
    if (!leagueId) { input.value = ''; return; }
    try {
      const ok = await useLeaguesStore.getState().addParticipantFromExcel(leagueId, name, file);
      if (!ok) {
        this._uploadError = t('league.errorInvalidExcel');
      } else {
        this._newName = '';
        this._uploadError = null;
        this._error = null;
      }
    } catch {
      this._uploadError = t('league.errorInvalidExcel');
    }
    input.value = '';
  }

  private _removeParticipant(participantId: string) {
    const leagueId = this._activeLeagueId;
    if (!leagueId) return;
    useLeaguesStore.getState().removeParticipant(leagueId, participantId);
    if (this._expandedId === participantId) this._expandedId = null;
  }

  private _toggleExpand(id: string) {
    this._expandedId = this._expandedId === id ? null : id;
  }

  private _kindLabel(kind: MatchPoints['kind']): string {
    switch (kind) {
      case 'exact': return t('league.kindExact');
      case 'diff': return t('league.kindDiff');
      case 'sign': return t('league.kindSign');
      case 'miss': return t('league.kindMiss');
      case 'pending': return t('league.kindPending');
    }
  }

  private _viewBracket(pid: string, pName: string) {
    if (pid === '__me__') {
      const p = deriveYouParticipant();
      this._bracketData = { participant: p, name: t('league.you') };
    } else {
      const league = this._leagues.find(l => l.id === this._activeLeagueId);
      const p = league?.participants.find(pp => pp.id === pid);
      if (!p) return;
      this._bracketData = { participant: p, name: pName };
    }
    this._screen = 'bracket';
    this._editMode = false;
    this._editBuffer = new Map();
  }

  private _toggleEdit() {
    if (!this._bracketData) return;
    this._editMode = !this._editMode;
    if (this._editMode) {
      this._editBuffer = new Map();
      const p = this._bracketData.participant;
      for (const s of p.groupScores) {
        this._editBuffer.set(s.matchId, { scoreA: s.scoreA, scoreB: s.scoreB });
      }
      for (const s of p.knockoutScores) {
        this._editBuffer.set(s.matchId, { scoreA: s.scoreA, scoreB: s.scoreB, penaltyScoreA: s.penaltyScoreA, penaltyScoreB: s.penaltyScoreB });
      }
    }
  }

  private _saveEdits() {
    if (!this._bracketData || !this._activeLeagueId) return;
    const p = this._bracketData.participant;

    if (p.id === '__me__') {
      const st = useTournamentStore.getState();
      for (const s of p.groupScores) {
        const b = this._editBuffer.get(s.matchId);
        if (b) st.setGroupMatchResult(s.matchId, b.scoreA, b.scoreB);
      }
      for (const s of p.knockoutScores) {
        const b = this._editBuffer.get(s.matchId);
        if (b) st.setKnockoutMatchResult(s.matchId, b.scoreA, b.scoreB, (b as any)?.penaltyScoreA ?? null, (b as any)?.penaltyScoreB ?? null);
      }
      this._bracketData = { participant: deriveYouParticipant(), name: this._bracketData.name };
      this._editMode = false;
      this._editBuffer = new Map();
      return;
    }

    const groupScores: DecodedBracket['groupScores'] = p.groupScores.map(s => {
      const b = this._editBuffer.get(s.matchId);
      if (b) return { ...s, scoreA: b.scoreA, scoreB: b.scoreB };
      return s;
    });
    const knockoutScores: DecodedBracket['knockoutScores'] = p.knockoutScores.map(s => {
      const b = this._editBuffer.get(s.matchId);
      if (b) return { ...s, scoreA: b.scoreA, scoreB: b.scoreB, penaltyScoreA: (b as any)?.penaltyScoreA ?? s.penaltyScoreA, penaltyScoreB: (b as any)?.penaltyScoreB ?? s.penaltyScoreB };
      return s;
    });

    useLeaguesStore.getState().updateParticipantScores(this._activeLeagueId, p.id, groupScores, knockoutScores);
    this._bracketData = { participant: { ...p, groupScores, knockoutScores }, name: this._bracketData.name };
    this._editMode = false;
    this._editBuffer = new Map();
  }

  private _cancelEdits() {
    this._editMode = false;
    this._editBuffer = new Map();
  }

  private _simulateDemo() {
    const st = useTournamentStore.getState();
    st.autoSimulateGroups();
    st.autoSimulateKnockout();
  }

  private _requestClearResults() {
    this._confirmClearResults = true;
  }

  private _confirmClear() {
    useTournamentStore.getState().resetTournament();
    this._confirmClearResults = false;
  }

  private _cancelClear() {
    this._confirmClearResults = false;
  }

  private async _handleReplaceExcel(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this._bracketData || !this._activeLeagueId) { input.value = ''; return; }
    const p = this._bracketData.participant;
    if (p.id === '__me__') {
      try {
        const data = await ExcelService.importFromExcel(file);
        if (data.groupScores.length === 0 && data.knockoutScores.length === 0) {
          this._uploadError = t('league.errorInvalidExcel');
          input.value = '';
          return;
        }
        useTournamentStore.getState().applySharedBracket(data);
        this._uploadError = null;
        this._bracketData = { participant: deriveYouParticipant(), name: this._bracketData.name };
      } catch {
        this._uploadError = t('league.errorInvalidExcel');
      }
      input.value = '';
      return;
    }
    try {
      const ok = await useLeaguesStore.getState().replaceParticipantFromExcel(this._activeLeagueId, p.id, file);
      if (!ok) {
        this._uploadError = t('league.errorInvalidExcel');
      } else {
        this._uploadError = null;
        const league = useLeaguesStore.getState().leagues.find(l => l.id === this._activeLeagueId);
        const updated = league?.participants.find(pp => pp.id === p.id);
        if (updated) {
          this._bracketData = { participant: updated, name: this._bracketData.name };
        }
      }
    } catch {
      this._uploadError = t('league.errorInvalidExcel');
    }
    input.value = '';
  }

  private _handleImportResults(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const ok = useTournamentStore.getState().importTournament(content);
        if (!ok) {
          this._uploadError = t('league.errorInvalidJson');
        } else {
          this._uploadError = null;
        }
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  private async _exportLeagueExcel() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;

    const tournament = useTournamentStore.getState();
    const realGroupScores = realGroupScoresFromStore();
    const realKnockoutOrder = getKnockoutMatchOrder();
    const realKnockoutScores = realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return { matchId, scoreA: m?.scoreA ?? null, scoreB: m?.scoreB ?? null };
    });

    const you = deriveYouParticipant();

    try {
      const locale = useLocaleStore.getState().locale;
      const blob = await ExcelService.exportLeaguePredictions(
        league,
        realGroupScores,
        realKnockoutScores,
        you,
        locale,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liga-${league.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting league Excel:', err);
    }
  }

  // ── RENDER LIST ──
  private _renderList() {
    const leagues = this._leagues;

    return html`
      <div class="lg-header">
        <div class="lg-title">${t('league.title')}</div>
        <div class="lg-subtitle">${t('tabs.league')}</div>
      </div>

      <div class="lg-create-section">
        <input
          type="text"
          .value=${this._newLeagueName}
          @input=${(e: InputEvent) => { this._newLeagueName = (e.target as HTMLInputElement).value; }}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._createLeague(); }}
          placeholder=${t('league.namePlaceholder')}
        />
        <button class="lg-btn" @click=${this._createLeague}>${t('league.createBtn')}</button>
      </div>

      ${leagues.length === 0
        ? html`<div class="lg-empty">${t('league.empty')}</div>`
        : html`
          <div class="lg-list">
            ${leagues.map(l => {
              const participantCount = l.participants.length + 1;
              return html`
                <div class="lg-card" @click=${() => this._goToDetail(l.id)}>
                  <div class="lg-card-main">
                    <div class="lg-card-name">${l.name}</div>
                    <div class="lg-card-meta">
                      ${t('league.participants', { n: participantCount })} · ${t('league.leader')}: ${this._getLeaderName(l)}
                    </div>
                  </div>
                  <div class="lg-card-actions">
                    <button class="lg-small-btn" @click=${(e: Event) => { e.stopPropagation(); this._renameLeague(l.id); }}>
                      ${t('league.renameBtn')}
                    </button>
                    <button class="lg-small-btn" @click=${(e: Event) => { e.stopPropagation(); this._requestDeleteLeague(l.id); }}>
                      ${t('league.delete')}
                    </button>
                  </div>
                </div>
              `;
            })}
          </div>
        `}

      ${this._confirmDeleteLeague ? html`
        <div class="lg-confirm-box">
          <span>${t('league.confirmDelete')}</span>
          <button class="lg-danger-btn" @click=${this._confirmDelete}>${t('league.confirmYes')}</button>
          <button class="lg-btn-back" @click=${this._cancelDelete}>${t('league.confirmNo')}</button>
        </div>
      ` : ''}
    `;
  }

  private _getLeaderName(_l: League): string {
    const you = deriveYouParticipant();
    const allParticipants = [you, ..._l.participants];

    const realGroupScores = realGroupScoresFromStore();
    const realKnockoutOrder = getKnockoutMatchOrder();
    const tournament = useTournamentStore.getState();
    const realKnockoutScores = realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return { matchId, scoreA: m?.scoreA ?? null, scoreB: m?.scoreB ?? null };
    });

    const scored: ParticipantScore[] = [];
    for (const p of allParticipants) {
      scored.push(scoreParticipant(p, realGroupScores, realKnockoutScores));
    }
    const ranked = rankParticipants(scored);
    return ranked.length > 0 ? ranked[0].participant.name : '—';
  }

  // ── RENDER DETAIL ──
  private _renderDetail() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) {
      this._screen = 'list';
      return html``;
    }

    const played = this._playedCount;
    const pct = TOTAL_MATCHES > 0 ? Math.round((played / TOTAL_MATCHES) * 100) : 0;

    return html`
      <button class="lg-btn-back" @click=${this._goToList}>← ${t('league.back')}</button>

      <div class="lg-header">
        <div class="lg-detail-header">
          <div class="lg-detail-name">${league.name}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-start;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="lg-btn-sm" @click=${this._exportLeagueExcel}>${t('league.downloadLeagueExcel')}</button>
              <label class="lg-upload-btn-sm">
                ${t('league.loadOfficialResults')}
                <input type="file" accept=".json" hidden @change=${this._handleImportResults} />
              </label>
              <button class="lg-btn-sm" @click=${this._simulateDemo} ?disabled=${this._playedCount > 0}>
                ${t('league.simulateDemo')}
              </button>
              <button class="lg-btn-sm" @click=${this._requestClearResults} ?disabled=${this._playedCount === 0}>
                ${t('league.clearResults')}
              </button>
            </div>
            <button class="lg-danger-btn" @click=${() => this._requestDeleteLeague(league.id)}>${t('league.delete')}</button>
          </div>
        </div>
        <div class="lg-hint">${t('league.demoHint')}</div>
      </div>

      ${this._confirmClearResults ? html`
        <div class="lg-confirm-box">
          <span>${t('league.confirmClearResults')}</span>
          <button class="lg-danger-btn" @click=${this._confirmClear}>${t('league.confirmYes')}</button>
          <button class="lg-btn-back" @click=${this._cancelClear}>${t('league.confirmNo')}</button>
        </div>
      ` : ''}

      ${this._confirmDeleteLeague ? html`
        <div class="lg-confirm-box">
          <span>${t('league.confirmDelete')}</span>
          <button class="lg-danger-btn" @click=${this._confirmDelete}>${t('league.confirmYes')}</button>
          <button class="lg-btn-back" @click=${this._cancelDelete}>${t('league.confirmNo')}</button>
        </div>
      ` : ''}

      <div class="lg-progress">
        <div class="lg-progress-bar">
          <div class="lg-progress-fill" style="width:${pct}%"></div>
        </div>
        <span class="lg-progress-label">${t('league.progress', { played, total: TOTAL_MATCHES })}</span>
      </div>

      <div class="lg-add-section">
        <h3>${t('league.addTitle')}</h3>
        <div class="lg-add-row">
          <div class="lg-field">
            <label>${t('league.nameLabel')}</label>
            <input
              type="text"
              .value=${this._newName}
              @input=${(e: InputEvent) => { this._newName = (e.target as HTMLInputElement).value; }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._addFromUrl(); }}
              placeholder=${t('league.namePlaceholderFriend')}
            />
          </div>
          <div class="lg-field">
            <label>${t('league.linkLabel')}</label>
            <input
              type="text"
              .value=${this._newUrl}
              @input=${(e: InputEvent) => { this._newUrl = (e.target as HTMLInputElement).value; }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._addFromUrl(); }}
              placeholder=${t('league.linkPlaceholder')}
            />
          </div>
          <button class="lg-btn" @click=${this._addFromUrl}>${t('league.addBtn')}</button>
          <label class="lg-upload-btn">
            ${t('league.uploadBtn')}
            <input type="file" accept=".xlsx" hidden @change=${this._handleFileUpload} />
          </label>
        </div>
        ${this._error ? html`<div class="lg-error">${this._error}</div>` : ''}
        ${this._uploadError ? html`<div class="lg-error">${this._uploadError}</div>` : ''}
      </div>

      ${this._scores.length === 0
        ? html`<div class="lg-empty">${t('league.emptyParticipants')}</div>`
        : html`
          <div class="lg-ranking">
            <table class="lg-ranking-table">
              <thead>
                <tr>
                  <th>${t('league.colRank')}</th>
                  <th>${t('league.colName')}</th>
                  <th>${t('league.colTotal')}</th>
                  <th>${t('league.colGroups')}</th>
                  <th>${t('league.colKnockout')}</th>
                  <th>${t('league.colExact')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${this._scores.map((s, i) => {
                  const isMe = s.participant.id === '__me__';
                  let rowClass = '';
                  if (i === 0) rowClass = 'lg-rank-leader';
                  else if (i === 1) rowClass = 'lg-rank-silver';
                  else if (i === 2) rowClass = 'lg-rank-bronze';
                  if (isMe) rowClass += ' lg-rank-me';

                  return html`
                    <tr class=${rowClass}>
                      <td class="lg-rank-pos">${i + 1}</td>
                      <td class="lg-rank-name">${s.participant.name}${isMe ? ' ★' : ''}</td>
                      <td class="lg-rank-total">${s.total}</td>
                      <td class="lg-rank-phase">${s.byPhase.groups}</td>
                      <td class="lg-rank-phase">${s.byPhase.knockout}</td>
                      <td class="lg-rank-phase">${s.exactCount}</td>
                      <td>
                        <button class="lg-bracket-btn" @click=${() => this._viewBracket(s.participant.id, s.participant.name)}>
                          ${t('league.viewBracket')}
                        </button>
                        <button class="lg-expand-btn" @click=${() => this._toggleExpand(s.participant.id)}>
                          ${this._expandedId === s.participant.id ? '▲' : '▼'}
                        </button>
                        ${!isMe ? html`
                          <button class="lg-delete-btn" @click=${() => this._removeParticipant(s.participant.id)}>
                            ${t('league.removeBtn')}
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                    ${this._expandedId === s.participant.id ? html`
                      <tr>
                        <td colspan="7">
                          <div class="lg-detail">
                            <div class="lg-detail-header-text">${s.participant.name} — ${t('league.detailTitle')}</div>
                            <div class="lg-detail-subs">
                              <span class="lg-detail-sub">${t('league.detailExact')}: ${s.exactCount}</span>
                              <span class="lg-detail-sub">${t('league.detailDiff')}: ${s.diffCount}</span>
                              <span class="lg-detail-sub">${t('league.detailSign')}: ${s.signCount}</span>
                            </div>
                            <div class="lg-detail-grid">
                              ${s.breakdown.map(mp => {
                                const gm = groupMatchById.get(mp.matchId);
                                const displayName = gm
                                  ? `${gm.teamA} vs ${gm.teamB}`
                                  : mp.matchId;
                                return html`
                                  <div class="lg-detail-item lg-kind-${mp.kind}">
                                    ${displayName} — ${this._kindLabel(mp.kind)}
                                  </div>
                                `;
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ` : ''}
                  `;
                })}
              </tbody>
            </table>
          </div>
        `}
    `;
  }

  // ── RENDER BRACKET ──
  private _renderBracket() {
    if (!this._bracketData) {
      this._screen = 'detail';
      return html``;
    }

    const { participant, name } = this._bracketData;
    const groupScores = getGroupScores(participant);
    const knockoutScores = getKnockoutScores(participant);

    const decoded: DecodedBracket = {
      groupScores: groupScores as DecodedBracket['groupScores'],
      knockoutScores: knockoutScores as DecodedBracket['knockoutScores'],
    };

    let resolvedKnockout: Record<string, { teamA?: string | null; teamB?: string | null; winnerId?: string | null; scoreA?: number | null; scoreB?: number | null }> = {};
    try {
      resolvedKnockout = buildResolvedKnockout(
        decoded,
        initialGroupMatches,
        recalculateStandings as unknown as (matches: Array<{ matchId: string; scoreA: number | null; scoreB: number | null; teamA: string; teamB: string }>) => Record<string, { teamId: string; points?: number; goalDiff?: number; goalsFor?: number }[]>,
        getWinnerId as unknown as (teamA: string, teamB: string, scoreA: number, scoreB: number, penaltyScoreA?: number | null, penaltyScoreB?: number | null) => string | null,
        getKnockoutMatchOrder,
        KNOCKOUT_BRACKET,
        {},
      ) as Record<string, { teamA?: string | null; teamB?: string | null; winnerId?: string | null; scoreA?: number | null; scoreB?: number | null }>;
    } catch { /* ignore */ }

    const realGroupScores = realGroupScoresFromStore();
    const realKnockoutOrder = getKnockoutMatchOrder();
    const tournament = useTournamentStore.getState();
    const realKnockoutScores = realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return { matchId, scoreA: m?.scoreA ?? null, scoreB: m?.scoreB ?? null };
    });

    const predictionScores = scoreParticipant(
      participant,
      realGroupScores,
      realKnockoutScores,
    );
    const breakdownByMatchId = new Map(predictionScores.breakdown.map(b => [b.matchId, b]));

    const renderScoreInputs = (matchId: string, scoreA: number | null, scoreB: number | null) => {
      if (!this._editMode) {
        return html`<div class="lg-bracket-score">${scoreA ?? '-'} - ${scoreB ?? '-'}</div>`;
      }
      const b = this._editBuffer.get(matchId);
      const a = b?.scoreA;
      const bb = b?.scoreB;
      return html`
        <div class="lg-bracket-score" style="display:flex;align-items:center;gap:4px;">
          <input class="lg-edit-input" type="number" .value=${a !== null && a !== undefined ? String(a) : ''} @input=${(e: InputEvent) => {
            const v = (e.target as HTMLInputElement).value;
            const n = v === '' ? null : parseInt(v, 10);
            const cur = this._editBuffer.get(matchId) || { scoreA: null, scoreB: null };
            this._editBuffer.set(matchId, { ...cur, scoreA: n !== null && !isNaN(n) ? n : null });
            if (isNaN(n as any)) return;
            this.requestUpdate();
          }} placeholder="-" />
          <span class="lg-edit-sep">-</span>
          <input class="lg-edit-input" type="number" .value=${bb !== null && bb !== undefined ? String(bb) : ''} @input=${(e: InputEvent) => {
            const v = (e.target as HTMLInputElement).value;
            const n = v === '' ? null : parseInt(v, 10);
            const cur = this._editBuffer.get(matchId) || { scoreA: null, scoreB: null };
            this._editBuffer.set(matchId, { ...cur, scoreB: n !== null && !isNaN(n) ? n : null });
            if (isNaN(n as any)) return;
            this.requestUpdate();
          }} placeholder="-" />
        </div>
      `;
    };

    return html`
      <button class="lg-btn-back" @click=${() => { this._screen = 'detail'; this._bracketData = null; this._editMode = false; }}>
        ← ${t('league.backToDetail')}
      </button>

      <div class="lg-header">
        <div class="lg-title">${t('league.bracketOf', { name })}</div>
        <div class="lg-subtitle">${predictionScores.total} ${t('league.points')}</div>
      </div>

      <div class="lg-action-row">
        ${this._editMode ? html`
          <button class="lg-btn" @click=${this._saveEdits}>${t('league.save')}</button>
          <button class="lg-btn-back" @click=${this._cancelEdits}>${t('league.cancel')}</button>
        ` : html`
          <button class="lg-btn" @click=${this._toggleEdit}>${t('league.editResults')}</button>
          <label class="lg-upload-btn">
            ${t('league.replacePrediction')}
            <input type="file" accept=".xlsx" hidden @change=${this._handleReplaceExcel} />
          </label>
        `}
        ${this._uploadError ? html`<span class="lg-error">${this._uploadError}</span>` : ''}
      </div>

      <div class="lg-bracket-phase-title">${t('league.phaseGroups')}</div>
      <div class="lg-bracket-grid">
      ${groupScores.map(s => {
        const bd = breakdownByMatchId.get(s.matchId);
        const gm = groupMatchById.get(s.matchId);
        const teamA = gm ? getTeam(gm.teamA) : null;
        const teamB = gm ? getTeam(gm.teamB) : null;
        return html`
          <div class="lg-bracket-match">
            <div class="lg-bracket-teams">
              ${teamA ? html`${renderFlag(teamA, 'sm')}<span class="lg-bracket-team-name">${teamA.name}</span>` : s.matchId}
              <span class="lg-bracket-vs">${t('groups.vs')}</span>
              ${teamB ? html`${renderFlag(teamB, 'sm')}<span class="lg-bracket-team-name">${teamB.name}</span>` : ''}
            </div>
            ${renderScoreInputs(s.matchId, s.scoreA, s.scoreB)}
            ${bd ? html`
              <span class="lg-bracket-result lg-kind-${bd.kind}">${this._kindLabel(bd.kind)} (+${bd.points})</span>
            ` : html`<span class="lg-bracket-result">—</span>`}
          </div>
        `;
      })}
      </div>

      <div class="lg-bracket-phase-title">${t('league.phaseKnockout')}</div>
      <div class="lg-bracket-grid">
      ${knockoutScores.map(s => {
        const resolved = resolvedKnockout[s.matchId];
        const bd = breakdownByMatchId.get(s.matchId);
        const teamAId = resolved?.teamA;
        const teamBId = resolved?.teamB;
        const teamA = typeof teamAId === 'string' ? getTeam(teamAId) : null;
        const teamB = typeof teamBId === 'string' ? getTeam(teamBId) : null;
        return html`
          <div class="lg-bracket-match">
            <div class="lg-bracket-teams">
              ${teamA ? html`${renderFlag(teamA, 'sm')}<span class="lg-bracket-team-name">${teamA.name}</span>` : (resolved?.teamA ?? '—')}
              <span class="lg-bracket-vs">${t('groups.vs')}</span>
              ${teamB ? html`${renderFlag(teamB, 'sm')}<span class="lg-bracket-team-name">${teamB.name}</span>` : (resolved?.teamB ?? '—')}
            </div>
            ${renderScoreInputs(s.matchId, s.scoreA, s.scoreB)}
            ${s.penaltyScoreA !== null && s.penaltyScoreB !== null ? html`<span class="lg-bracket-result">(p. ${s.penaltyScoreA}-${s.penaltyScoreB})</span>` : ''}
            ${bd ? html`
              <span class="lg-bracket-result lg-kind-${bd.kind}">${this._kindLabel(bd.kind)} (+${bd.points})</span>
            ` : html`<span class="lg-bracket-result">—</span>`}
          </div>
        `;
      })}
      </div>
    `;
  }

  render() {
    switch (this._screen) {
      case 'list': return this._renderList();
      case 'detail': return this._renderDetail();
      case 'bracket': return this._renderBracket();
      default: return html``;
    }
  }
}

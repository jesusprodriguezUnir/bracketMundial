import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, getKnockoutMatchOrder, recalculateStandings, getWinnerId, extractBracketData } from '../store/tournament-store';
import { useLeaguesStore, isMyParticipant, findMyParticipant, type League, type LeagueParticipant } from '../store/leagues-store';
import { scoreParticipant, rankParticipants, REAL_AWARDS } from '../lib/mini-league';
import type { ParticipantScore, MatchPoints } from '../lib/mini-league';
import { buildResolvedKnockout } from '../lib/bracket-logic';
import { KNOCKOUT_BRACKET, TEAMS_2026 } from '../data/fifa-2026';
import { GROUP_MATCHES } from '../data/match-schedule';
import { renderFlag } from '../lib/render-flag';
import { t, useLocaleStore } from '../i18n';
import type { DecodedBracket } from '../lib/bracket-codec';
import { buildParticipantShareUrl, decodeParticipantShare } from '../lib/league-codec';
import { refreshLeagueMembers, updateMyPredictionsInCloud, updateMyNameInCloud, deleteLeagueFromCloud, leaveLeagueInCloud, findLeagueByCode, joinLeagueInCloud, removeParticipantFromCloud } from '../lib/league-sync';
import { useAuthStore } from '../store/auth-store';
import { ExcelService } from '../lib/excel-service';
import { getCurrentMatchday, filterRealByDate, hasMatchDatePassed, getLeagueLockedMatchIds } from '../lib/league-fixture';
import type { RealScores } from '../lib/league-projection';
import { SQUADS, type Player } from '../data/squads';
import { loadOfficialResults } from '../lib/official-results';
import './league-rules-modal';

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

function getGroupScores(participant: LeagueParticipant): DecodedBracket['groupScores'] {
  return participant.groupScores;
}

function getKnockoutScores(participant: LeagueParticipant): DecodedBracket['knockoutScores'] {
  return participant.knockoutScores;
}

@customElement('leagues-view')
export class LeaguesView extends LitElement {
  @state() private _screen: Screen = 'list';
  @state() private _manualListMode = false;
  @state() private _leagues: League[] = [];
  @state() private _activeLeagueId: string | null = null;
  @state() private _scores: ParticipantScore[] = [];
  @state() private _playedCount = 0;
  @state() private _expandedId: string | null = null;
  @state() private _newName = '';
  @state() private _uploadError: string | null = null;
  @state() private _newLeagueName = '';
  @state() private _newOwnerName = '';
  @state() private _confirmDeleteLeague: string | null = null;
  @state() private _confirmRemoveParticipant: { id: string; name: string } | null = null;
  @state() private _bracketData: BracketScreenData | null = null;
  @state() private _showInvite = false;
  @state() private _copiedInvite = false;
  @state() private _showSharePredictions = false;
  @state() private _copiedShare = false;
  @state() private _importUrl = '';
  @state() private _importFeedback: string | null = null;
  @state() private _syncing = false;
  @state() private _showJoinModal = false;
  @state() private _showRulesModal = false;
  @state() private _joinCode = '';
  @state() private _joinError: string | null = null;
  @state() private _joinLoading = false;
  @state() private _syncFeedback: string | null = null;
  @state() private _showAwardsModal: 'topScorer' | 'mvp' | null = null;
  @state() private _selectedTeamIdForSelector = '';
  @state()   private _officialBracket: DecodedBracket | null = null;
  private _initialMount = true;
  @state() private _awardsSearchQuery = '';
  @state() private _participantForModal: LeagueParticipant | null = null;
  @state() private _createFrozen = false;
  @state() private _lockFromToday = false;
  private _leagueSummaries: Map<string, { leaderName: string; leaderPoints: number; participantCount: number }> = new Map();
  private _knockoutDisplayScores: RealScores[] = [];

  private _unsubTournament?: () => void;
  private _unsubLeagues?: () => void;
  private _unsubLocale?: () => void;
  private _unsubAuth?: () => void;
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

    .lg-editorial-shell {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .lg-hero {
      background:
        linear-gradient(180deg, color-mix(in srgb, var(--retro-yellow) 18%, var(--paper-3)) 0%, var(--paper-3) 100%);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      padding: 22px;
      position: relative;
      overflow: hidden;
    }
    .lg-hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--halftone-soft);
      opacity: 0.4;
      pointer-events: none;
    }
    .lg-hero > * {
      position: relative;
      z-index: 1;
    }
    .lg-hero-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .lg-hero-kicker {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      color: var(--dim);
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .lg-hero-title {
      font-family: var(--font-var);
      font-size: clamp(28px, 5vw, 42px);
      line-height: 0.95;
      letter-spacing: -0.02em;
      max-width: 10ch;
    }
    .lg-hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .lg-hero-chip {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 5px 8px;
      border: 1px solid var(--ink);
      background: color-mix(in srgb, var(--paper) 82%, transparent);
    }
    .lg-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: flex-start;
      max-width: 520px;
    }
    .lg-actions .lg-btn-sm,
    .lg-actions .lg-danger-btn {
      min-height: 30px;
      padding: 5px 10px;
      font-size: 10px;
      letter-spacing: 0.03em;
      box-shadow: 2px 2px 0 0 var(--ink);
    }
    .lg-summary-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) repeat(3, minmax(150px, 1fr));
      gap: 14px;
      align-items: stretch;
    }
    .lg-summary-card {
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 14px;
      min-width: 0;
    }
    .lg-summary-card.leader {
      background: linear-gradient(180deg, color-mix(in srgb, var(--retro-yellow) 36%, var(--paper)) 0%, var(--paper) 100%);
    }
    .lg-summary-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.14em;
      color: var(--dim);
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .lg-summary-value {
      font-family: var(--font-var);
      font-size: clamp(24px, 4vw, 34px);
      line-height: 0.95;
      letter-spacing: -0.02em;
    }
    .lg-summary-meta {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.04em;
      margin-top: 6px;
    }
    .lg-summary-line {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: baseline;
    }
    .lg-summary-inline {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
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

    .lg-rules-panel {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .lg-rules-title {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      color: var(--dim);
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .lg-rules-chips {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .lg-rules-chip {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.04em;
      padding: 6px 14px;
      border: 1px solid var(--ink);
    }

    .lg-rules-chip-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 10px;
    }

    /* ── FANTASY HEADER ── */
    .lg-fantasy-header {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }
    @media (max-width: 768px) {
      .lg-fantasy-header {
        grid-template-columns: 1fr;
      }
    }
    .lg-fantasy-block {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 20px;
    }
    .lg-fantasy-block h3 {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      color: var(--dim);
      text-transform: uppercase;
      margin: 0 0 12px 0;
    }
    .lg-leader-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .lg-leader-card .lg-leader-name {
      font-family: var(--font-var);
      font-size: 22px;
      letter-spacing: 0.04em;
    }
    .lg-leader-card .lg-leader-pts {
      font-family: var(--font-var);
      font-size: 36px;
      color: var(--retro-red);
      letter-spacing: 0.02em;
    }
    .lg-leader-card .lg-leader-gap {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--dim);
    }
    .lg-leader-card .lg-leader-stats {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.04em;
      color: var(--ink);
    }
    .lg-upcoming-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .lg-upcoming-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.03em;
      padding: 6px 0;
      border-bottom: 1px dashed var(--ink);
    }
    .lg-upcoming-item:last-child {
      border-bottom: none;
    }
    .lg-upcoming-teams {
      flex: 1;
      font-family: var(--font-var);
      letter-spacing: 0.03em;
    }
    .lg-upcoming-date {
      font-size: 10px;
      color: var(--dim);
      white-space: nowrap;
    }
    .lg-normal {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--dim);
    }

    .lg-results-board {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
      gap: 18px;
    }
    .lg-results-board.single-panel {
      grid-template-columns: minmax(0, 1fr);
    }
    .lg-section-panel {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 18px;
    }
    .lg-section-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .lg-section-title {
      font-family: var(--font-var);
      font-size: 20px;
      letter-spacing: 0.02em;
    }
    .lg-section-kicker {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.14em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-results-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
    }
    .lg-result-card {
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .lg-result-top {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
    }
    .lg-result-id {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.14em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-result-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.08em;
      border: 1px solid var(--ink);
      padding: 2px 6px;
      background: var(--paper-2);
    }
    .lg-result-badge.live {
      background: var(--retro-yellow);
    }
    .lg-result-teams {
      display: grid;
      gap: 8px;
    }
    .lg-result-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: center;
    }
    .lg-result-team {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.03em;
    }
    .lg-result-score {
      font-family: var(--font-var);
      font-size: 18px;
      min-width: 18px;
      text-align: center;
    }
    .lg-result-team-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .lg-result-foot {
      border-top: 1px dashed var(--ink);
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
      align-items: baseline;
      flex-wrap: wrap;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
    }
    .lg-next-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .lg-next-item {
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 12px;
      display: grid;
      gap: 7px;
    }
    .lg-next-item-head {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.12em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-next-teams {
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.03em;
    }
    .lg-next-meta {
      font-family: var(--font-mono);
      font-size: 10px;
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
    .lg-upload-btn.compact {
      padding: 8px 14px;
      min-height: 36px;
      font-size: 12px;
      letter-spacing: 0.04em;
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

    /* ── PARTICIPANTS ── */
    .lg-ranking {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .lg-ranking-head {
      padding: 18px;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: linear-gradient(180deg, color-mix(in srgb, var(--retro-blue) 10%, var(--paper-3)) 0%, var(--paper-3) 100%);
    }
    .lg-ranking-title {
      font-family: var(--font-var);
      font-size: 22px;
      letter-spacing: 0.02em;
    }
    .lg-ranking-subtitle {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .lg-ranking-overview {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 14px;
    }
    .lg-ranking-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .lg-ranking-stat {
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 10px 12px;
    }
    .lg-ranking-stat strong {
      display: block;
      font-family: var(--font-var);
      font-size: 22px;
      line-height: 1;
      margin-top: 6px;
    }
    .lg-participants-board {
      display: grid;
      gap: 16px;
    }
    .lg-participant-card {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      display: grid;
      overflow: hidden;
    }
    .lg-participant-card.leader {
      background: linear-gradient(180deg, color-mix(in srgb, var(--retro-yellow) 25%, var(--paper-3)) 0%, var(--paper-3) 100%);
    }
    .lg-participant-card.silver {
      background: linear-gradient(180deg, color-mix(in srgb, white 28%, var(--paper-3)) 0%, var(--paper-3) 100%);
    }
    .lg-participant-card.bronze {
      background: linear-gradient(180deg, color-mix(in srgb, var(--retro-orange) 18%, var(--paper-3)) 0%, var(--paper-3) 100%);
    }
    .lg-participant-card.me {
      outline: 2px solid var(--retro-blue);
      outline-offset: -4px;
    }
    .lg-participant-summary {
      all: unset;
      box-sizing: border-box;
      width: 100%;
      cursor: pointer;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      gap: 14px;
      align-items: center;
      padding: 14px 16px;
    }
    .lg-participant-summary:hover {
      background: color-mix(in srgb, var(--retro-yellow) 12%, var(--paper-3));
    }
    .lg-participant-rank-badge {
      min-width: 44px;
      min-height: 44px;
      display: grid;
      place-items: center;
      border: 2px solid var(--ink);
      background: var(--paper);
      box-shadow: var(--shadow-hard-sm);
      font-family: var(--font-var);
      font-size: 22px;
      line-height: 1;
    }
    .lg-participant-main {
      min-width: 0;
      display: grid;
      gap: 8px;
    }
    .lg-participant-kicker {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--dim);
      margin-bottom: 6px;
    }
    .lg-participant-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .lg-participant-name {
      font-family: var(--font-var);
      font-size: clamp(18px, 2.5vw, 24px);
      line-height: 0.95;
      letter-spacing: -0.02em;
    }
    .lg-participant-source {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 6px;
      border: 1px solid var(--ink);
      background: var(--paper);
    }
    .lg-participant-mini-stats {
      display: grid;
      grid-template-columns: repeat(4, auto);
      gap: 8px;
      align-items: center;
    }
    .lg-participant-mini-stat {
      display: grid;
      gap: 2px;
      min-width: 54px;
      padding: 6px 8px;
      background: var(--paper);
      border: 1px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--dim);
      text-align: center;
    }
    .lg-participant-mini-stat strong {
      font-family: var(--font-var);
      font-size: 18px;
      line-height: 1;
      color: var(--ink);
    }
    .lg-participant-scorebox {
      display: grid;
      gap: 4px;
      justify-items: end;
    }
    .lg-participant-total {
      font-family: var(--font-var);
      font-size: clamp(30px, 4vw, 42px);
      line-height: 0.85;
      color: var(--retro-red);
      text-align: right;
    }
    .lg-participant-total-unit {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--dim);
      text-align: right;
      margin-top: 4px;
    }
    .lg-participant-expanded {
      display: grid;
      gap: 12px;
      padding: 0 16px 16px;
      border-top: 2px solid var(--ink);
      background: color-mix(in srgb, var(--paper) 84%, white);
    }
    .lg-participant-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      padding-top: 12px;
    }
    .lg-score-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .lg-score-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.05em;
      padding: 4px 6px;
      border: 1px solid var(--ink);
      background: var(--paper);
    }
    .lg-predictions-locked {
      padding: 20px 12px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 13px;
      letter-spacing: 0.04em;
      color: var(--ink);
      opacity: 0.6;
      border: 2px dashed var(--ink);
      margin-top: 12px;
    }
    .lg-inline-bracket-wrap {
      display: grid;
      gap: 10px;
      padding-top: 12px;
    }
    .lg-inline-bracket {
      display: grid;
      grid-template-columns: repeat(6, minmax(160px, 1fr));
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .lg-inline-round {
      display: grid;
      gap: 8px;
      align-content: start;
      min-width: 160px;
    }
    .lg-inline-round-title {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--dim);
      padding-bottom: 6px;
      border-bottom: 1px dashed var(--ink);
    }
    .lg-inline-match {
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 9px;
      display: grid;
      gap: 6px;
      min-height: 116px;
    }
    .lg-inline-match.tone-exact {
      background: color-mix(in srgb, var(--retro-green) 16%, var(--paper));
    }
    .lg-inline-match.tone-diff {
      background: color-mix(in srgb, var(--retro-blue) 14%, var(--paper));
    }
    .lg-inline-match.tone-sign {
      background: color-mix(in srgb, var(--retro-yellow) 20%, var(--paper));
    }
    .lg-inline-match.tone-miss {
      background: color-mix(in srgb, var(--paper-2) 88%, white);
    }
    .lg-inline-match-header {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      align-items: center;
    }
    .lg-inline-match-id,
    .lg-inline-match-kind,
    .lg-inline-real,
    .lg-inline-pen {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.06em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-inline-match-kind {
      border: 1px solid var(--ink);
      padding: 2px 5px;
      background: var(--paper-2);
      color: var(--ink);
    }
    .lg-inline-teams {
      display: grid;
      gap: 6px;
    }
    .lg-inline-team-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: center;
    }
    .lg-inline-team {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      font-family: var(--font-var);
      font-size: 12px;
    }
    .lg-inline-team-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .lg-inline-score {
      font-family: var(--font-var);
      font-size: 19px;
      line-height: 1;
      min-width: 34px;
      text-align: right;
    }
    .lg-inline-foot {
      border-top: 1px dashed var(--ink);
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
      align-items: baseline;
    }
    .lg-inline-real.pending {
      opacity: 0.7;
    }
    .lg-expand-btn {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--dim);
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
    .lg-league-switcher {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .lg-league-chip-btn {
      all: unset;
      cursor: pointer;
      box-sizing: border-box;
      padding: 6px 10px;
      border: 1px solid var(--ink);
      background: var(--paper);
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .lg-league-chip-btn.active {
      background: var(--retro-blue);
      color: var(--paper);
    }
    .lg-league-chip-btn:hover {
      background: color-mix(in srgb, var(--retro-blue) 18%, var(--paper));
    }

    .lg-mode-toggle {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      align-items: center;
    }
    .lg-projection-banner {
      background: color-mix(in srgb, var(--retro-yellow) 30%, var(--paper-3));
      border: 2px solid var(--ink);
      padding: 10px 16px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 16px;
    }
    .lg-inline-projected {
      background: color-mix(in srgb, var(--retro-yellow) 16%, transparent);
      border: 1px solid var(--ink);
      padding: 2px 5px;
    }

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
    .lg-bracket-real {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
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
      .lg-hero { padding: 18px; }
      .lg-summary-grid { grid-template-columns: 1fr; }
      .lg-results-board { grid-template-columns: 1fr; }
      .lg-actions { 
        justify-content: flex-start; 
        flex-direction: column; 
        width: 100%; 
        align-items: stretch;
      }
      .lg-actions button, .lg-actions .lg-btn, .lg-actions .lg-upload-btn, .lg-actions .lg-danger-btn { 
        width: 100%; 
        box-sizing: border-box; 
        justify-content: center; 
      }
      .lg-ranking-overview { grid-template-columns: 1fr; }
      .lg-ranking-toolbar { flex-direction: column; }
      .lg-participant-summary {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: flex-start;
      }
      .lg-participant-mini-stats {
        grid-column: 1 / -1;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .lg-participant-scorebox {
        grid-column: 1 / -1;
        justify-items: flex-start;
      }
      .lg-inline-bracket { grid-template-columns: repeat(6, minmax(140px, 1fr)); }
      .lg-add-row { flex-direction: column; }
      .lg-field { min-width: 100%; }
      .lg-league-switcher { width: 100%; }
    }

    /* ════════════════════════════════════════════════════════
       v2 · Rediseño retro-editorial (Ligas - Diseño.html)
       Prefijo lg-v2-* para no chocar con clases legacy.
       ════════════════════════════════════════════════════════ */
    .lg-v2-shell {
      background: var(--paper);
      background-image: var(--paper-texture);
      border: 3px solid var(--ink);
      box-shadow: 0 12px 32px rgba(0,0,0,0.18), var(--shadow-hard-lg);
      padding: 28px 32px 32px;
      position: relative;
      overflow: hidden;
    }

    .lg-v2-hero {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: end;
      gap: 20px;
      padding-bottom: 16px;
      border-bottom: 3px solid var(--ink);
      margin-bottom: 22px;
    }
    .lg-v2-eyebrow {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--dim);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }
    .lg-v2-live-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--retro-red);
      color: var(--paper);
      padding: 3px 9px 3px 8px;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.22em;
      font-weight: 700;
    }
    .lg-v2-live-pill::before {
      content: "";
      width: 6px; height: 6px;
      background: var(--paper);
      border-radius: 50%;
      animation: lg-v2-pulse 1.4s infinite;
    }
    @keyframes lg-v2-pulse {
      0%,100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .lg-v2-h1 {
      font-family: var(--font-var);
      font-size: 56px;
      line-height: 0.85;
      letter-spacing: -0.015em;
      color: var(--ink);
      margin: 0;
    }
    .lg-v2-h1 .accent { color: var(--retro-orange); display: block; }
    .lg-v2-tagline {
      margin-top: 14px;
      font-size: 13px;
      line-height: 1.45;
      max-width: 460px;
      color: var(--ink-soft);
    }
    .lg-v2-hero-meta {
      text-align: right;
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim);
      line-height: 1.6;
    }
    .lg-v2-hero-meta .bignum {
      font-family: var(--font-var);
      font-size: 64px;
      color: var(--ink);
      line-height: 0.9;
      display: block;
      letter-spacing: -0.02em;
    }
    .lg-v2-hero-meta .bignum em {
      font-style: normal;
      color: var(--retro-orange);
    }

    .lg-v2-actions {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr;
      gap: 14px;
      margin-bottom: 22px;
    }
    .lg-v2-btn {
      border: 2.5px solid var(--ink);
      padding: 14px 18px;
      font-family: var(--font-head);
      font-size: 13px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      box-shadow: var(--shadow-hard-md);
      background: var(--paper-3);
      color: var(--ink);
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: center;
      text-align: left;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      cursor: pointer;
    }
    .lg-v2-btn:hover { transform: translate(-2px,-2px); box-shadow: 5px 5px 0 var(--ink); }
    .lg-v2-btn.primary { background: var(--retro-orange); color: var(--paper); }
    .lg-v2-btn .lg-v2-btn-ic {
      width: 36px; height: 36px;
      background: var(--ink);
      color: var(--retro-yellow);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var);
      font-size: 20px;
    }
    .lg-v2-btn.primary .lg-v2-btn-ic {
      background: var(--paper);
      color: var(--retro-orange);
    }
    .lg-v2-btn .lg-v2-btn-sub {
      display: block;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.18em;
      color: var(--dim);
      text-transform: uppercase;
      margin-top: 2px;
      font-weight: 400;
    }
    .lg-v2-btn.primary .lg-v2-btn-sub { color: rgba(255,255,255,0.78); }
    .lg-v2-btn-arrow {
      font-family: var(--font-mono);
      font-size: 18px;
      color: inherit;
    }

    .lg-v2-section-bar {
      display: flex;
      align-items: baseline;
      gap: 14px;
      margin-bottom: 14px;
      border-bottom: 2px dashed rgba(26,25,51,0.25);
      padding-bottom: 10px;
      flex-wrap: wrap;
    }
    .lg-v2-section-bar h3 {
      font-family: var(--font-head);
      font-size: 14px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink);
      margin: 0;
    }
    .lg-v2-section-bar .count {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .lg-v2-section-bar .sort {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-v2-section-bar .sort b { color: var(--ink); }

    .lg-v2-help-link {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink);
      background: var(--paper-2);
      border: 1.5px solid var(--ink);
      padding: 3px 8px;
      box-shadow: 1.5px 1.5px 0 0 var(--ink);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.1s, transform 0.1s;
    }
    .lg-v2-help-link:hover {
      background: var(--retro-yellow);
      transform: translate(-0.5px, -0.5px);
      box-shadow: 2px 2px 0 0 var(--ink);
    }
    .lg-v2-help-link:active {
      transform: translate(1px, 1px);
      box-shadow: 0 0 0 0 var(--ink);
    }

    .lg-v2-list { display: grid; gap: 14px; }
    .lg-v2-card {
      background: var(--paper-3);
      border: 2.5px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 16px 18px 16px 26px;
      position: relative;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr auto;
      gap: 18px;
      align-items: center;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      cursor: pointer;
    }
    .lg-v2-card:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--ink); }
    .lg-v2-card::before {
      content: "";
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 10px;
      background: var(--card-color, var(--retro-orange));
    }
    .lg-v2-card-title {
      font-family: var(--font-var);
      font-size: 26px;
      line-height: 0.95;
      letter-spacing: -0.01em;
      color: var(--ink);
    }
    .lg-v2-card-meta {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .lg-v2-code {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.18em;
      background: var(--paper);
      color: var(--ink);
      border: 1.5px dashed var(--ink);
      padding: 4px 8px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .lg-v2-members {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.12em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .lg-v2-members b { color: var(--ink); font-weight: 700; }

    .lg-v2-leader {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 10px;
      align-items: center;
    }
    .lg-v2-avatar {
      width: 38px; height: 38px;
      background: var(--paper);
      border: 2px solid var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      box-shadow: 2px 2px 0 var(--ink);
      flex: none;
    }
    .lg-v2-leader-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dim);
      display: block;
      margin-bottom: 2px;
    }
    .lg-v2-leader-name {
      font-family: var(--font-head);
      font-size: 13px;
      line-height: 1.05;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--ink);
    }
    .lg-v2-leader-points {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-orange);
      letter-spacing: 0.08em;
      margin-top: 2px;
      font-weight: 700;
    }

    .lg-v2-rosette {
      display: grid;
      grid-template-columns: 1fr;
      justify-items: end;
      gap: 6px;
    }
    .lg-v2-rosette-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .lg-v2-pos {
      font-family: var(--font-var);
      font-size: 32px;
      line-height: 0.85;
      color: var(--ink);
      background: var(--paper);
      border: 2.5px solid var(--ink);
      padding: 6px 14px 4px;
      box-shadow: var(--shadow-hard-sm);
      letter-spacing: -0.02em;
    }
    .lg-v2-pos.win { background: var(--retro-orange); color: var(--paper); }
    .lg-v2-pos.podium { background: var(--retro-yellow); color: var(--ink); }
    .lg-v2-pos .hash {
      font-family: var(--font-mono);
      font-size: 12px;
      vertical-align: top;
      letter-spacing: 0;
      margin-right: 2px;
      opacity: 0.6;
    }

    .lg-v2-card-status { position: absolute; top: -10px; right: 16px; }

    .lg-v2-delta {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      color: var(--retro-green);
      margin-top: 4px;
    }
    .lg-v2-delta.down { color: var(--retro-red); }
    .lg-v2-delta.same { color: var(--dim); }

    .lg-v2-card-actions-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      grid-column: 1 / -1;
      padding-top: 10px;
      border-top: 1px dashed rgba(26,25,51,0.18);
    }
    .lg-v2-card-actions-row button {
      font-family: var(--font-mono);
      font-size: 9.5px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      background: var(--paper);
      border: 1.5px solid var(--ink);
      padding: 4px 8px;
      color: var(--ink);
      cursor: pointer;
    }
    .lg-v2-card-actions-row button:hover { background: var(--retro-yellow); }

    /* ── Detail ── */
    .lg-v2-detail-top {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      align-items: end;
      padding-bottom: 16px;
      border-bottom: 3px solid var(--ink);
      margin-bottom: 22px;
    }
    .lg-v2-back {
      font-family: var(--font-mono);
      font-size: 10.5px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dim);
      display: inline-block;
      margin-bottom: 12px;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
    }
    .lg-v2-back:hover { color: var(--ink); }
    .lg-v2-detail-h1 {
      font-family: var(--font-var);
      font-size: 52px;
      line-height: 0.85;
      letter-spacing: -0.01em;
      color: var(--ink);
      margin: 0;
    }
    .lg-v2-stamp {
      display: inline-block;
      transform: rotate(-3deg);
      background: var(--retro-red);
      color: var(--paper);
      font-family: var(--font-head);
      font-size: 14px;
      letter-spacing: 0.18em;
      padding: 5px 10px;
      vertical-align: middle;
      margin-left: 12px;
      border: 2.5px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
    }
    .lg-v2-codeblock {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .lg-v2-codeblock .label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .lg-v2-codeblock .lg-v2-code { font-size: 13px; padding: 5px 11px; }
    .lg-v2-copy {
      width: 30px; height: 30px;
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px;
      cursor: pointer;
    }
    .lg-v2-copy:hover { background: var(--retro-yellow); }

    .lg-v2-detail-stats {
      text-align: right;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim);
      line-height: 1.6;
    }
    .lg-v2-detail-stats .row { display: flex; justify-content: flex-end; gap: 8px; align-items: baseline; }
    .lg-v2-detail-stats .v {
      font-family: var(--font-head);
      font-size: 14px;
      color: var(--ink);
      letter-spacing: 0.02em;
    }

    .lg-v2-legend {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }
    .lg-v2-legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--paper);
      border: 1.5px solid var(--ink);
      padding: 4px 9px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink);
    }
    .lg-v2-legend-item .dot {
      width: 9px; height: 9px;
      border: 1.5px solid var(--ink);
      display: inline-block;
    }
    .lg-v2-legend-item b {
      font-family: var(--font-head);
      font-size: 11px;
      color: var(--ink);
    }

    .lg-v2-podium-wrap {
      background: var(--paper);
      border: 2.5px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 22px 24px 0;
      margin-bottom: 22px;
      position: relative;
      overflow: hidden;
      background-image:
        repeating-linear-gradient(0deg,
          transparent 0 22px,
          rgba(26,25,51,0.05) 22px 23px);
    }
    .lg-v2-podium-title {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.32em;
      color: var(--dim);
      text-transform: uppercase;
      white-space: nowrap;
    }
    .lg-v2-podium {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 14px;
      align-items: end;
      padding-top: 26px;
    }
    .lg-v2-pod {
      text-align: center;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .lg-v2-pod .pod-figure {
      width: 86px; height: 86px;
      border: 3px solid var(--ink);
      background: var(--paper-3);
      display: flex; align-items: center; justify-content: center;
      font-size: 48px;
      box-shadow: var(--shadow-hard-md);
      position: relative;
      margin-bottom: 10px;
    }
    .lg-v2-pod.first .pod-figure {
      width: 108px; height: 108px;
      font-size: 60px;
      background: var(--retro-orange);
      border-width: 3.5px;
      box-shadow: 5px 5px 0 var(--ink);
    }
    .lg-v2-pod .pod-medal {
      position: absolute;
      bottom: -10px; right: -10px;
      width: 30px; height: 30px;
      border-radius: 50%;
      border: 2.5px solid var(--ink);
      background: var(--retro-yellow);
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      line-height: 1;
      padding-top: 1px;
    }
    .lg-v2-pod.first .pod-medal {
      width: 38px; height: 38px;
      background: var(--retro-red);
      color: var(--paper);
      font-size: 17px;
      border-width: 3px;
    }
    .lg-v2-pod.second .pod-medal { background: #d8d8d8; }
    .lg-v2-pod.third .pod-medal { background: #d4a25a; }
    .lg-v2-pod-name {
      font-family: var(--font-var);
      font-size: 17px;
      line-height: 1;
      color: var(--ink);
      margin-bottom: 4px;
      letter-spacing: -0.01em;
    }
    .lg-v2-pod.first .lg-v2-pod-name { font-size: 20px; }
    .lg-v2-pod-pts {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--retro-orange);
      font-weight: 700;
    }
    .lg-v2-pod-step {
      width: 100%;
      margin-top: 14px;
      background: var(--paper-2);
      border: 2px solid var(--ink);
      border-bottom: none;
      padding: 10px 0 14px;
      font-family: var(--font-var);
      font-size: 38px;
      line-height: 1;
      color: var(--ink);
      background-image:
        repeating-linear-gradient(45deg,
          transparent 0 6px,
          rgba(26,25,51,0.05) 6px 7px);
    }
    .lg-v2-pod.first .lg-v2-pod-step {
      background: var(--ink);
      color: var(--paper);
      font-size: 52px;
      padding: 18px 0 22px;
      background-image:
        repeating-linear-gradient(45deg,
          transparent 0 6px,
          rgba(255,255,255,0.06) 6px 7px);
    }
    .lg-v2-pod.second .lg-v2-pod-step { padding-top: 14px; padding-bottom: 18px; font-size: 44px; }
    .lg-v2-pod.third .lg-v2-pod-step { padding-top: 8px; padding-bottom: 12px; font-size: 32px; }

    .lg-v2-board {
      border: 2.5px solid var(--ink);
      background: var(--paper-3);
      overflow: hidden;
      box-shadow: var(--shadow-hard-md);
      margin-bottom: 18px;
    }
    .lg-v2-board .head {
      background: var(--ink);
      color: var(--paper);
      padding: 8px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-head);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      flex-wrap: wrap;
      gap: 6px;
    }
    .lg-v2-board .head .extra {
      font-family: var(--font-mono);
      font-size: 9.5px;
      color: var(--retro-yellow);
      letter-spacing: 0.12em;
    }
    .lg-v2-table { width: 100%; border-collapse: collapse; }
    .lg-v2-table th {
      background: var(--paper-2);
      font-family: var(--font-mono);
      font-size: 9.5px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dim);
      padding: 8px 12px;
      text-align: left;
      border-bottom: 2px solid var(--ink);
    }
    .lg-v2-table th.num { text-align: right; }
    .lg-v2-table td {
      padding: 11px 12px;
      border-bottom: 1px dashed rgba(26,25,51,0.18);
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--ink);
      vertical-align: middle;
    }
    .lg-v2-table tr:last-child td { border-bottom: none; }
    .lg-v2-table tr.row-click { cursor: pointer; }
    .lg-v2-table tr.row-click:hover td { background: rgba(232,84,31,0.07); }
    .lg-v2-table .rank {
      font-family: var(--font-head);
      font-size: 13px;
      letter-spacing: 0.04em;
      color: var(--dim);
      width: 36px;
    }
    .lg-v2-table .user { display: flex; align-items: center; gap: 10px; }
    .lg-v2-table .av {
      width: 30px; height: 30px;
      background: var(--paper);
      border: 1.5px solid var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      flex: none;
    }
    .lg-v2-table .name {
      font-family: var(--font-head);
      font-size: 13px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .lg-v2-table tr.you td {
      background: rgba(240,176,33,0.18);
      border-color: var(--retro-orange);
    }
    .lg-v2-table tr.you .name { color: var(--retro-orange); }
    .lg-v2-table tr.you .rank { color: var(--retro-orange); }
    .lg-v2-table .exact {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--retro-orange);
      font-weight: 700;
      text-align: right;
      letter-spacing: 0.04em;
    }
    .lg-v2-table .pts {
      font-family: var(--font-head);
      font-size: 14px;
      text-align: right;
      letter-spacing: 0.02em;
    }
    .lg-v2-table .var {
      text-align: right;
      font-family: var(--font-mono);
      font-size: 11px;
      width: 60px;
    }
    .lg-v2-table .var.up    { color: var(--retro-green); }
    .lg-v2-table .var.down  { color: var(--retro-red); }
    .lg-v2-table .var.same  { color: var(--dim); }
    .lg-v2-table .var.na    { color: var(--dim); }

    .lg-v2-board-foot {
      background: var(--paper-2);
      padding: 8px 14px;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dim);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 2px solid var(--ink);
      flex-wrap: wrap;
      gap: 6px;
    }
    .lg-v2-board-foot .live {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .lg-v2-board-foot .live::before {
      content: "";
      width: 7px; height: 7px;
      background: var(--retro-red);
      border-radius: 50%;
      animation: lg-v2-pulse 1.4s infinite;
    }

    .lg-v2-edit-prediction-row {
      margin-bottom: 14px;
    }
    .lg-v2-edit-prediction-row .lg-v2-btn {
      width: 100%;
      box-sizing: border-box;
      padding: 14px 18px;
    }
    .lg-v2-cta-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 18px;
    }
    .lg-v2-cta-row .lg-v2-btn { padding: 12px 14px; }
    .lg-v2-cta-row .lg-v2-btn .lg-v2-btn-ic { width: 32px; height: 32px; font-size: 17px; }

    .lg-v2-foot {
      margin-top: 18px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 9.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--dim);
    }
    .lg-v2-foot .star { color: var(--retro-orange); }

    .lg-v2-empty {
      border: 2.5px dashed var(--ink);
      padding: 28px 24px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--dim);
      background: var(--paper-3);
    }

    .lg-v2-create-inline {
      display: flex;
      gap: 10px;
      margin-bottom: 22px;
      align-items: stretch;
    }
    .lg-v2-create-inline input {
      flex: 1;
      border: 2.5px solid var(--ink);
      background: var(--paper);
      padding: 10px 14px;
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink);
      box-shadow: var(--shadow-hard-sm);
      outline: none;
    }
    .lg-v2-create-inline input:focus { background: var(--paper-2); }

    /* Join-by-code modal */
    .lg-v2-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .lg-v2-modal {
      background: var(--paper);
      background-image: var(--paper-texture);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      padding: 24px 26px;
      max-width: 380px;
      width: calc(100% - 40px);
      display: grid;
      gap: 14px;
    }
    .lg-v2-modal h3 {
      font-family: var(--font-head);
      font-size: 16px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin: 0;
      color: var(--ink);
    }
    .lg-v2-modal input {
      border: 2.5px solid var(--ink);
      background: var(--paper);
      padding: 10px 14px;
      font-family: var(--font-mono);
      font-size: 14px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink);
      box-shadow: var(--shadow-hard-sm);
      outline: none;
      text-align: center;
    }
    .lg-v2-modal .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
    .lg-v2-modal .modal-actions button {
      font-family: var(--font-head);
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      border: 2.5px solid var(--ink);
      background: var(--paper-3);
      padding: 8px 14px;
      color: var(--ink);
      box-shadow: var(--shadow-hard-sm);
      cursor: pointer;
    }
    .lg-v2-modal .modal-actions button.primary { background: var(--retro-orange); color: var(--paper); }
    .lg-v2-modal .modal-error {
      font-family: var(--font-mono);
      font-size: 10.5px;
      color: var(--retro-red);
      letter-spacing: 0.1em;
    }

    @media (max-width: 768px) {
      .lg-v2-shell { padding: 20px 18px 22px; }
      .lg-v2-hero { grid-template-columns: 1fr; align-items: start; }
      .lg-v2-hero-meta { text-align: left; }
      .lg-v2-h1 { font-size: 42px; }
      .lg-v2-detail-h1 { font-size: 36px; }
      .lg-v2-actions { grid-template-columns: 1fr; }
      .lg-v2-card { grid-template-columns: 1fr; }
      .lg-v2-card-status { position: static; margin-bottom: 6px; }
      .lg-v2-rosette { justify-items: start; }
      .lg-v2-detail-top { grid-template-columns: 1fr; }
      .lg-v2-detail-stats { text-align: left; }
      .lg-v2-detail-stats .row { justify-content: flex-start; }
      .lg-v2-podium { grid-template-columns: 1fr; gap: 18px; }
      .lg-v2-pod .pod-figure { width: 72px; height: 72px; font-size: 38px; }
      .lg-v2-pod.first .pod-figure { width: 92px; height: 92px; font-size: 50px; }
      .lg-v2-cta-row { grid-template-columns: 1fr; }
      .lg-v2-create-inline { flex-direction: column; }
    }

    /* ── Barra / Panel de Premios Individuales en Ligas ── */
    .lg-awards-panel {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 6px 12px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      position: relative;
    }
    .lg-awards-title {
      font-family: var(--font-var);
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 0.02em;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--ink);
    }
    .lg-awards-grid {
      display: flex;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .lg-award-card {
      flex: 1;
      min-width: 0;
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 4px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .lg-award-main {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .lg-award-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    .lg-award-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .lg-award-category {
      color: var(--dim);
      font-size: 7px;
      text-transform: uppercase;
      font-family: var(--font-mono);
      line-height: 1;
      margin-bottom: 2px;
    }
    .lg-award-value {
      font-family: var(--font-var);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--ink);
      line-height: 1.1;
    }

    @media (min-width: 769px) {
      .lg-awards-panel {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 5px 10px;
        gap: 12px;
      }
      .lg-awards-title {
        border-bottom: none;
        padding-bottom: 0;
        margin-right: 4px;
        font-size: 10px;
        white-space: nowrap;
      }
      .lg-awards-grid {
        flex: 1;
        gap: 8px;
      }
      .lg-award-card {
        padding: 3px 6px;
      }
    }
    @media (max-width: 768px) {
      .lg-awards-grid {
        flex-wrap: wrap;
      }
      .lg-award-card {
        min-width: 130px;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._unsubTournament = useTournamentStore.subscribe(() => this._recalc());
    this._unsubLeagues = useLeaguesStore.subscribe(() => this._recalc());
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._unsubAuth = useAuthStore.subscribe(() => this.requestUpdate());
    loadOfficialResults().then(bracket => {
      this._officialBracket = bracket;
      this._recalc();
    }).catch(() => { this._recalc(); });
    this._recalc();
  }

  disconnectedCallback() {
    this._unsubTournament?.();
    this._unsubLeagues?.();
    this._unsubLocale?.();
    this._unsubAuth?.();
    super.disconnectedCallback();
  }

  private _getOfficialRealScores(): { groupScores: RealScores[]; knockoutScores: RealScores[] } {
    if (this._officialBracket) {
      const groupScores: RealScores[] = this._officialBracket.groupScores.map(s => ({
        matchId: s.matchId,
        scoreA: s.scoreA,
        scoreB: s.scoreB,
      }));
      const knockoutOrder = getKnockoutMatchOrder();
      const koMap = new Map(this._officialBracket.knockoutScores.map(s => [s.matchId, s]));
      const knockoutScores: RealScores[] = knockoutOrder.map(matchId => {
        const s = koMap.get(matchId);
        return { matchId, scoreA: s?.scoreA ?? null, scoreB: s?.scoreB ?? null };
      });
      return { groupScores, knockoutScores };
    }
    const groupScores: RealScores[] = GROUP_MATCHES.map(m => ({
      matchId: m.matchId,
      scoreA: null,
      scoreB: null,
    }));
    const knockoutOrder = getKnockoutMatchOrder();
    const knockoutScores: RealScores[] = knockoutOrder.map(matchId => ({
      matchId,
      scoreA: null,
      scoreB: null,
    }));
    return { groupScores, knockoutScores };
  }

  private _recalc() {
    const leaguesState = useLeaguesStore.getState();
    this._leagues = leaguesState.leagues;
    this._activeLeagueId = leaguesState.activeLeagueId;

    if (this._screen !== 'bracket') {
      if (this._initialMount) {
        this._initialMount = false;
        if (this._leagues.length > 0) {
          this._manualListMode = true;
          this._screen = 'list';
        }
      }
      if (this._leagues.length === 0) {
        this._screen = 'list';
        this._manualListMode = false;
      } else {
        const activeLeagueExists = this._activeLeagueId
          ? this._leagues.some(league => league.id === this._activeLeagueId)
          : false;
        if (!activeLeagueExists) {
          const fallbackLeagueId = this._leagues[0].id;
          useLeaguesStore.getState().setActiveLeague(fallbackLeagueId);
          this._activeLeagueId = fallbackLeagueId;
        }
        if (!this._manualListMode) {
          this._screen = 'detail';
        }
      }
    }

    const { groupScores: rawRealGroupScores, knockoutScores: rawRealKnockoutScores } = this._getOfficialRealScores();

    const realGroupScores = filterRealByDate(rawRealGroupScores);
    const realKnockoutScores = filterRealByDate(rawRealKnockoutScores);

    const groupScoresForRanking: readonly RealScores[] = realGroupScores;
    const knockoutScoresForRanking: readonly RealScores[] = realKnockoutScores;

    this._knockoutDisplayScores = realKnockoutScores;

    let played = 0;
    for (const r of realGroupScores) {
      if (r.scoreA !== null && r.scoreB !== null) played++;
    }
    for (const r of realKnockoutScores) {
      if (r.scoreA !== null && r.scoreB !== null) played++;
    }
    this._playedCount = played;

    this._leagueSummaries = new Map();
    for (const l of this._leagues) {
      const excludedMatchIds = getLeagueLockedMatchIds(l);
      const allParticipants = l.participants;
      const scored: ParticipantScore[] = [];
      for (const p of allParticipants) {
        scored.push(scoreParticipant(p, groupScoresForRanking, knockoutScoresForRanking, { excludedMatchIds }));
      }
      const ranked = rankParticipants(scored);
      const leader = ranked[0];
      this._leagueSummaries.set(l.id, {
        leaderName: leader?.participant.name ?? '—',
        leaderPoints: leader?.total ?? 0,
        participantCount: l.participants.length,
      });
    }

    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (league) {
      const excludedMatchIds = getLeagueLockedMatchIds(league);
      const scored: ParticipantScore[] = [];
      for (const participant of league.participants) {
        scored.push(scoreParticipant(participant, groupScoresForRanking, knockoutScoresForRanking, { excludedMatchIds }));
      }
      this._scores = rankParticipants(scored);
    } else {
      this._scores = [];
    }

    this.requestUpdate();
  }

  private async _editPredictionForLeague() {
    if (!this._activeLeagueId) return;
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    // No abrir editor si la liga está congelada (el bloqueo por partido lo gestiona el store)
    if (league?.frozen) return;
    await useTournamentStore.getState().switchContext({ kind: 'league', leagueId: this._activeLeagueId });
    this.dispatchEvent(new CustomEvent('navigate', { detail: 'groups', bubbles: true, composed: true }));
  }

  /** Como _editPredictionForLeague, pero abre directamente el predictor de premios (goleador/MVP). */
  private async _editAwardsForLeague() {
    if (!this._activeLeagueId) return;
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (league?.frozen) return;
    await useTournamentStore.getState().switchContext({ kind: 'league', leagueId: this._activeLeagueId });
    // En móvil abre la vista 'awards'; en desktop bracket-view lo mapea a 'knockout' (donde vive el panel)
    this.dispatchEvent(new CustomEvent('navigate', { detail: 'awards', bubbles: true, composed: true }));
  }

  // ── v2 design helpers ──
  private static readonly _AVATAR_POOL = ['⚽','⭐','🏆','🔥','🎯','🚀','🐯','🐎','🎉','🥇','🎨','🦁','🐺','🐉','⚡'];
  private static readonly _COLOR_POOL = ['var(--retro-orange)','var(--retro-green)','var(--retro-blue)','var(--retro-red)','var(--retro-yellow)'];

  private _codeForLeague(league: League): string {
    // Preferir el código persistido en la nube; derivar del UUID solo como fallback
    if (league.joinCode) return league.joinCode;
    const slug = league.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const head = slug.slice(0, 3).padEnd(3, 'X');
    const tail = slug.slice(3, 7).padEnd(4, 'X');
    return `${head}-${tail}`;
  }

  private _hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  private _avatarForName(name: string): string {
    const pool = LeaguesView._AVATAR_POOL;
    return pool[this._hashStr(name) % pool.length];
  }

  private _paletteForLeague(league: League, idx: number): string {
    const pool = LeaguesView._COLOR_POOL;
    const i = (this._hashStr(league.id) + idx) % pool.length;
    return pool[i];
  }

  private _isLeagueLive(league: League): boolean {
    if (this._playedCount > 0 && this._playedCount < TOTAL_MATCHES) return true;
    if (league.participants.length > 1) return true;
    return false;
  }

  private get _tournamentStarted(): boolean {
    return hasMatchDatePassed('M1');
  }

  private _yourPositionInLeague(leagueId: string): { pos: number; total: number; isOwnerPresent: boolean } | null {
    const league = this._leagues.find(l => l.id === leagueId);
    if (!league || league.participants.length === 0) return null;
    try {
      const { groupScores: rawGroup, knockoutScores: rawKo } = this._getOfficialRealScores();
      const realGroupScores = filterRealByDate(rawGroup);
      const realKnockoutScores = filterRealByDate(rawKo);
      const scored = league.participants.map(p => scoreParticipant(p, realGroupScores, realKnockoutScores));
      const ranked = rankParticipants(scored);
      const sessionUserId = useAuthStore.getState().session?.user?.id;
      const myIdx = ranked.findIndex(p => isMyParticipant(p.participant, sessionUserId));
      if (myIdx === -1) return { pos: ranked.length, total: ranked.length, isOwnerPresent: false };
      return { pos: myIdx + 1, total: ranked.length, isOwnerPresent: true };
    } catch {
      return null;
    }
  }

  private _openRulesModal = () => { this._showRulesModal = true; };
  private _closeRulesModal = () => { this._showRulesModal = false; };

  private _openJoinModal = () => { this._showJoinModal = true; this._joinError = null; this._joinCode = ''; this._joinLoading = false; };
  private _closeJoinModal = () => { this._showJoinModal = false; this._joinError = null; this._joinCode = ''; this._joinLoading = false; };
  private _submitJoinCode = async () => {
    const session = useAuthStore.getState().session;
    if (!session) { this._joinError = t('league.loginRequired'); return; }

    const raw = this._joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (raw.length < 6) { this._joinError = t('league.joinCodeNotFound'); return; }
    const formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}`;

    const userId = session.user?.id;
    const displayName = session?.user?.email?.split('@')[0] ?? t('league.you');

    // 1) Buscar primero en ligas locales (atajo offline / ya miembro)
    const localMatch = this._leagues.find(l => this._codeForLeague(l) === formatted);
    if (localMatch) {
      const alreadyParticipant = localMatch.participants.some(
        p => p.isOwner === true || (userId && p.userId === userId),
      );
      if (alreadyParticipant) {
        this._closeJoinModal();
        this._goToDetail(localMatch.id);
        return;
      }
      useLeaguesStore.getState().joinLeagueFromInvite(localMatch.id, localMatch.name, displayName, localMatch.joinCode);
      void joinLeagueInCloud(localMatch.id, displayName);
      this._closeJoinModal();
      this._goToDetail(localMatch.id);
      return;
    }

    // 2) Consultar la nube mediante la RPC SECURITY DEFINER
    this._joinLoading = true;
    this._joinError = null;
    let cloudMatch: { id: string; name: string } | null = null;
    try {
      cloudMatch = await findLeagueByCode(formatted);
    } catch {
      this._joinLoading = false;
      this._joinError = t('league.joinCodeError');
      return;
    }
    this._joinLoading = false;

    if (!cloudMatch) {
      this._joinError = t('league.joinCodeNotFound');
      return;
    }

    // 3) Unirse localmente y en la nube
    useLeaguesStore.getState().joinLeagueFromInvite(cloudMatch.id, cloudMatch.name, displayName, formatted);
    const ok = await joinLeagueInCloud(cloudMatch.id, displayName);
    if (!ok) {
      // Revertir local si la nube falla
      useLeaguesStore.getState().deleteLeague(cloudMatch.id);
      this._joinError = t('league.joinCodeError');
      return;
    }
    this._closeJoinModal();
    this._goToDetail(cloudMatch.id);
  };

  private _goToList() {
    this._manualListMode = true;
    this._screen = 'list';
    this._bracketData = null;
  }

  private _goToDetail(leagueId: string) {
    useLeaguesStore.getState().setActiveLeague(leagueId);
    this._manualListMode = false;
    this._screen = 'detail';
    this._bracketData = null;
  }

  private _createLeague() {
    const name = this._newLeagueName.trim();
    if (!name) return;
    const ownerName = this._newOwnerName.trim() || this._defaultOwnerName();
    const opts = {
      frozen: this._createFrozen,
      lockFromToday: this._lockFromToday && this._tournamentStarted,
    };
    const leagueId = useLeaguesStore.getState().createLeague(name, ownerName, opts);
    // Sincronizar a la nube con los opts si hay sesión
    const session = useAuthStore.getState().session;
    if (session) {
      const league = useLeaguesStore.getState().leagues.find(l => l.id === leagueId);
      import('../lib/league-sync').then(({ createLeagueInCloud }) => {
        createLeagueInCloud(name, ownerName, leagueId, {
          frozen: opts.frozen || false,
          lockedBeforeDate: league?.lockedBeforeDate,
        }).then(result => {
          if (result?.joinCode) {
            useLeaguesStore.getState()._patchLeague(leagueId, { joinCode: result.joinCode });
          }
        });
      });
    }
    this._newLeagueName = '';
    this._newOwnerName = '';
    this._createFrozen = false;
    this._lockFromToday = false;
    this._manualListMode = false;
    this._screen = 'detail';
  }

  /** El owner activa/desactiva el congelado de la liga. */
  private async _toggleLeagueFrozen(league: League) {
    const newFrozen = !league.frozen;
    useLeaguesStore.getState().setLeagueFrozen(league.id, newFrozen);
    try {
      const { updateLeagueConfigInCloud } = await import('../lib/league-sync');
      await updateLeagueConfigInCloud(league.id, { frozen: newFrozen });
      await import('../lib/league-sync').then(m => m.refreshLeagueMembers(league.id));
    } catch (err) {
      console.warn('[leagues-view] _toggleLeagueFrozen cloud update failed:', err);
    }
  }

  private _defaultOwnerName(): string {
    const email = useAuthStore.getState().email;
    if (email) {
      const local = email.split('@')[0];
      if (local) return local;
    }
    return t('league.you');
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

  private async _confirmDelete() {
    if (this._confirmDeleteLeague) {
      const leagueId = this._confirmDeleteLeague;
      const league = this._leagues.find(l => l.id === leagueId);
      
      if (league) {
        const session = useAuthStore.getState().session;
        if (session) {
          const userId = session.user.id;
          const me = findMyParticipant(league, userId);
          const isOwner = me?.isOwner === true;
          
          try {
            if (isOwner) {
              await deleteLeagueFromCloud(leagueId);
            } else {
              await leaveLeagueInCloud(leagueId);
            }
          } catch (err) {
            console.error('[leagues-view] Error deleting league from cloud:', err);
          }
        }
      }

      useLeaguesStore.getState().deleteLeague(leagueId);
      this._confirmDeleteLeague = null;
      this._screen = 'list';
    }
  }

  private _cancelDelete() {
    this._confirmDeleteLeague = null;
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
        this._uploadError = null;
        this._newName = '';
      }
    } catch {
      this._uploadError = t('league.errorInvalidExcel');
    }
    input.value = '';
  }

  private _requestRemoveParticipant(participantId: string, name: string) {
    this._confirmRemoveParticipant = { id: participantId, name };
  }

  private _cancelRemove() {
    this._confirmRemoveParticipant = null;
  }

  private async _confirmRemove() {
    if (!this._confirmRemoveParticipant) return;
    const { id, name } = this._confirmRemoveParticipant;
    const leagueId = this._activeLeagueId;
    if (!leagueId) {
      this._confirmRemoveParticipant = null;
      return;
    }

    const league = this._leagues.find(l => l.id === leagueId);
    if (!league) {
      this._confirmRemoveParticipant = null;
      return;
    }

    const participant = league.participants.find(p => p.id === id);
    if (participant?.userId && useAuthStore.getState().session) {
      this._syncing = true;
      const ok = await removeParticipantFromCloud(leagueId, participant.userId);
      if (ok) {
        useLeaguesStore.getState().removeParticipant(leagueId, id);
        if (this._expandedId === id) this._expandedId = null;
        await refreshLeagueMembers(leagueId);
        this._syncFeedback = `✓ ${name} ha sido eliminado de la liga.`;
      } else {
        this._syncFeedback = `✕ No se pudo eliminar a ${name} de la nube.`;
      }
      this._syncing = false;
    } else {
      // Participante local o modo sin sesión
      useLeaguesStore.getState().removeParticipant(leagueId, id);
      if (this._expandedId === id) this._expandedId = null;
      this._syncFeedback = `✓ ${name} ha sido eliminado.`;
    }

    this._confirmRemoveParticipant = null;
  }

  private async _renameParticipantPrompt(participantId: string, currentName: string) {
    const leagueId = this._activeLeagueId;
    if (!leagueId) return;
    const next = window.prompt(t('league.editNamePrompt'), currentName);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === currentName) return;
    useLeaguesStore.getState().renameParticipant(leagueId, participantId, trimmed);
    const ok = await updateMyNameInCloud(leagueId, trimmed);
    if (ok) {
      await refreshLeagueMembers(leagueId);
    }
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
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    const p = league?.participants.find(pp => pp.id === pid);
    if (!p) return;
    const sessionUserId = useAuthStore.getState().session?.user?.id;
    if (!isMyParticipant(p, sessionUserId) && !this._tournamentStarted) return;
    this._bracketData = { participant: p, name: pName };
    this._screen = 'bracket';
  }

  private async _publishMyBracketToLeague() {
    if (!this._activeLeagueId) return;
    const session = useAuthStore.getState().session;
    if (!session) {
      const { openAuthModal } = await import('./auth-modal');
      openAuthModal();
      return;
    }

    const league = useLeaguesStore.getState().leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;
    const me = findMyParticipant(league, session.user.id);
    if (!me) return;

    // Detectar si ya tiene predicciones para pedir confirmación antes de reemplazar.
    const hasExisting = me.groupScores.some(s => s.scoreA !== null || s.scoreB !== null)
      || me.knockoutScores.some(s => s.scoreA !== null || s.scoreB !== null);
    if (hasExisting) {
      const ok = window.confirm(t('league.confirmPublish'));
      if (!ok) return;
    }

    // Asegurar que el store tenga cargadas las predicciones de ESTA liga
    // (groupMatches, knockoutMatches, MVP y goleador) antes de serializar.
    // switchContext hace early-return si ya estamos en el contexto correcto.
    await useTournamentStore.getState().switchContext({
      kind: 'league',
      leagueId: this._activeLeagueId,
    });

    // Tomar el bracket actual del store (ya con el contexto de la liga).
    const bracket = extractBracketData(useTournamentStore.getState());

    // Guardar en local.
    useLeaguesStore.getState().updateParticipantScores(
      this._activeLeagueId,
      me.id,
      bracket.groupScores,
      bracket.knockoutScores,
      bracket.topScorer,
      bracket.mvp,
    );

    // Publicar en la nube.
    this._syncing = true;
    this._syncFeedback = t('sync.banner.feedback.publishing');
    try {
      const ok = await updateMyPredictionsInCloud(
        this._activeLeagueId,
        bracket.groupScores,
        bracket.knockoutScores,
        bracket.topScorer,
        bracket.mvp,
      );
      if (ok) {
        this._syncFeedback = t('sync.banner.feedback.published');
        await refreshLeagueMembers(this._activeLeagueId);
      } else {
        this._syncFeedback = t('sync.banner.feedback.publishFailed');
      }
    } catch (err) {
      console.error('[leagues-view] _publishMyBracketToLeague failed:', err);
      this._syncFeedback = `✕ Error: ${err instanceof Error ? err.message : String(err)}`;
    }
    this._syncing = false;
  }

  private async _handleMeExcelReplace(e: Event, participantId: string) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this._activeLeagueId) { input.value = ''; return; }
    try {
      const ok = await useLeaguesStore.getState().replaceParticipantFromExcel(
        this._activeLeagueId, participantId, file,
      );
      if (!ok) {
        this._uploadError = t('league.errorInvalidExcel');
      } else {
        this._uploadError = null;
      }
    } catch {
      this._uploadError = t('league.errorInvalidExcel');
    }
    input.value = '';
  }

  private async _handleReplaceExcel(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this._bracketData || !this._activeLeagueId) { input.value = ''; return; }
    const p = this._bracketData.participant;
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

  private async _exportLeagueExcel() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;

    const tournament = useTournamentStore.getState();

    try {
      const locale = useLocaleStore.getState().locale;
      const tournamentStarted = this._tournamentStarted;

      // Filtrar resultados reales por fecha, igual que hace la app en la UI.
      // Partidos cuya fecha aún no ha pasado salen con scoreA/scoreB = null.
      const filteredGroupMatches = tournament.groupMatches.map(m =>
        hasMatchDatePassed(m.matchId) ? m : { ...m, scoreA: null, scoreB: null },
      );
      const filteredKnockoutMatches: typeof tournament.knockoutMatches = Object.fromEntries(
        Object.entries(tournament.knockoutMatches).map(([id, m]) =>
          hasMatchDatePassed(id)
            ? [id, m]
            : [id, { ...m, scoreA: null, scoreB: null, penaltyScoreA: null, penaltyScoreB: null }],
        ),
      );

      // Identificar al participante propio para el filtro pre-torneo.
      const sessionUserId = useAuthStore.getState().session?.user?.id ?? null;
      const myParticipant = findMyParticipant(league, sessionUserId);

      const blob = await ExcelService.exportLeaguePredictions(
        league,
        filteredGroupMatches,
        filteredKnockoutMatches,
        locale,
        { tournamentStarted, myParticipantId: myParticipant?.id },
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

  private async _showInviteModal() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;

    const session = useAuthStore.getState().session;
    if (!session) {
      this._importFeedback = t('league.inviteRequiresLogin');
      const { openAuthModal } = await import('./auth-modal');
      openAuthModal();
      return;
    }

    this._syncing = true;
    try {
      const { getSupabase } = await import('../lib/supabase-client');
      const sb = getSupabase();
      const userId = session.user.id;
      if (sb && userId) {
        await sb.from('leagues').upsert(
          { id: league.id, name: league.name, owner_id: userId },
          { onConflict: 'id' },
        );
        const me = findMyParticipant(league, userId) ?? league.participants[0];
        if (me) {
          await sb.from('league_members').upsert(
            { league_id: league.id, user_id: userId, name: me.name },
            { onConflict: 'league_id, user_id' },
          );
        }
      }
    } catch (err) {
      console.error('[leagues-view] invite upsert failed:', err);
    }
    this._syncing = false;

    this._showInvite = true;
    this._copiedInvite = false;
  }

  private _inviteUrl(leagueId: string): string {
    return `${window.location.origin}${window.location.pathname}#league/join/${leagueId}`;
  }

  private _copyInviteLink() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;
    navigator.clipboard.writeText(this._inviteUrl(league.id)).catch(() => {});
    this._copiedInvite = true;
  }

  private _showSharePredictionsModal() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;
    const me = findMyParticipant(league, useAuthStore.getState().session?.user?.id);
    if (!me) return;
    const hasPredictions = me.groupScores.some(s => s.scoreA !== null && s.scoreB !== null)
      || me.knockoutScores.some(s => s.scoreA !== null && s.scoreB !== null);
    if (!hasPredictions) {
      this._importFeedback = t('league.importError');
      return;
    }
    this._showSharePredictions = true;
    this._copiedShare = false;
  }

  private _copyShareLink() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) return;
    const me = findMyParticipant(league, useAuthStore.getState().session?.user?.id);
    if (!me) return;
    const url = buildParticipantShareUrl(league.id, me.name, me.groupScores, me.knockoutScores, me.topScorer, me.mvp);
    navigator.clipboard.writeText(url).catch(() => {});
    this._copiedShare = true;
  }

  private async _forcePushAll() {
    if (!useAuthStore.getState().session) {
      this._syncFeedback = t('sync.banner.feedback.signinFirst');
      this._openAuthFromBanner();
      return;
    }
    this._syncing = true;
    this._syncFeedback = t('sync.banner.feedback.uploadingCloud');
    try {
      const { forcePushAll } = await import('../lib/league-sync');
      const result = await forcePushAll();
      if (result.ok) {
        this._syncFeedback = t('sync.banner.feedback.synced', { count: result.count });
      } else {
        this._syncFeedback = t('sync.banner.feedback.syncFailedNoSession');
      }
    } catch (err) {
      console.error('[leagues-view] forcePushAll failed:', err);
      this._syncFeedback = `✕ Error: ${err instanceof Error ? err.message : String(err)}`;
    }
    this._syncing = false;
  }

  private async _openAuthFromBanner() {
    const { openAuthModal } = await import('./auth-modal');
    openAuthModal();
  }

  private _renderSyncBanner() {
    const session = useAuthStore.getState().session;
    const email = useAuthStore.getState().email;
    if (!session) {
      return html`
        <div class="lg-confirm-box" style="border-color: var(--retro-orange); background: color-mix(in srgb, var(--retro-orange) 8%, var(--paper));">
          <span style="flex:1;">
            ⚠ <strong>${t('sync.banner.noSession')}</strong> ${t('sync.banner.noSessionText')}
          </span>
          <button class="lg-btn-sm" @click=${this._openAuthFromBanner}>${t('header.signInTitle')}</button>
        </div>
      `;
    }
    return html`
      <div class="lg-confirm-box" style="border-color: var(--retro-green, #2a8a3a); background: color-mix(in srgb, var(--retro-green, #2a8a3a) 8%, var(--paper)); flex-wrap: wrap;">
        <span style="flex:1; min-width: 200px;">
          ✓ ${t('sync.banner.session')} <strong>${email ?? ''}</strong>
        </span>
        <button class="lg-btn-sm" @click=${this._forcePushAll} ?disabled=${this._syncing}>
          ${this._syncing ? t('sync.banner.uploading') : t('sync.banner.uploadCloud')}
        </button>
        ${this._syncFeedback ? html`<span style="flex-basis:100%; font-family:var(--font-mono); font-size:11px;">${this._syncFeedback}</span>` : ''}
      </div>
    `;
  }

  private async _refreshFromCloud() {
    if (!this._activeLeagueId) return;
    this._syncing = true;
    try {
      await refreshLeagueMembers(this._activeLeagueId);
    } finally {
      this._syncing = false;
    }
  }

  private _importFriendPrediction() {
    const raw = this._importUrl.trim();
    if (!raw) return;

    const payload = raw.includes('#lp=') ? raw.split('#lp=')[1]?.trim() : raw.trim();
    if (!payload) { this._importFeedback = t('league.importError'); return; }

    const share = decodeParticipantShare(payload);
    if (!share) { this._importFeedback = t('league.importError'); return; }

    const leagueId = this._activeLeagueId;
    if (!leagueId) { this._importFeedback = t('league.importError'); return; }

    const result = useLeaguesStore.getState().importParticipantFromShare(
      share.leagueId, share.participantName, share.groupScores, share.knockoutScores, share.topScorer, share.mvp,
    );
    if (!result.created && result.participantId) {
      this._importFeedback = t('league.importSuccess', { name: share.participantName });
    } else if (result.created) {
      this._importFeedback = t('league.importSuccess', { name: share.participantName });
    } else {
      this._importFeedback = t('league.importError');
    }
    this._importUrl = '';
  }

  // ── RENDER LIST ──
  private _renderList() {
    const leagues = this._leagues;
    const totalMembers = leagues.reduce((s, l) => s + l.participants.length, 0);
    const anyLive = leagues.some(l => this._isLeagueLive(l));
    const myPredictionsSummary = (() => {
      let pts = 0;
      let exact = 0;
      for (const l of leagues) {
        const ranked = this._yourPositionInLeague(l.id);
        if (!ranked?.isOwnerPresent) continue;
        const summary = this._leagueSummaries.get(l.id);
        if (summary) pts = Math.max(pts, summary.leaderPoints);
        exact += 1;
      }
      return { pts, exact };
    })();

    return html`
      <div class="lg-v2-shell">
        <header class="lg-v2-hero">
          <div>
            <div class="lg-v2-eyebrow">
              ${anyLive ? html`<span class="lg-v2-live-pill">${t('league.liveLong')}</span>` : ''}
              <span>${t('league.heroEyebrow')}</span>
            </div>
            <h1 class="lg-v2-h1">
              ${t('league.heroTitleA')}<br/>
              <span class="accent">${t('league.heroTitleB')}</span>
            </h1>
            <p class="lg-v2-tagline">${t('league.heroTagline')}</p>
          </div>
          <div class="lg-v2-hero-meta">
            <span class="bignum"><em>${leagues.length}</em></span>
            ${t('league.heroActiveLeagues')}<br/>
            ${t('league.heroMembersLine', { m: String(totalMembers), n: String(this._playedCount) })}
          </div>
        </header>

        <div class="lg-v2-actions">
          <button class="lg-v2-btn primary" @click=${() => { const el = this.renderRoot.querySelector<HTMLInputElement>('.lg-v2-create-inline input'); el?.focus(); }}>
            <span class="lg-v2-btn-ic">＋</span>
            <span>
              ${t('league.actionCreate')}<br/>
              <span class="lg-v2-btn-sub">${t('league.actionCreateSub')}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          <button class="lg-v2-btn" @click=${this._openJoinModal}>
            <span class="lg-v2-btn-ic">⇲</span>
            <span>
              ${t('league.actionJoin')}<br/>
              <span class="lg-v2-btn-sub">${t('league.actionJoinSub')}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          <button class="lg-v2-btn" @click=${() => { if (leagues.length > 0) this._goToDetail(leagues[0].id); }}>
            <span class="lg-v2-btn-ic">★</span>
            <span>
              ${t('league.actionPredictions')}<br/>
              <span class="lg-v2-btn-sub">${t('league.actionPredictionsSub', { pts: String(myPredictionsSummary.pts), exact: String(myPredictionsSummary.exact) })}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
        </div>

        <div class="lg-v2-create-inline">
          <input
            type="text"
            .value=${this._newLeagueName}
            @input=${(e: InputEvent) => { this._newLeagueName = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._createLeague(); }}
            placeholder=${t('league.namePlaceholder')}
          />
          <input
            type="text"
            .value=${this._newOwnerName}
            @input=${(e: InputEvent) => { this._newOwnerName = (e.target as HTMLInputElement).value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._createLeague(); }}
            placeholder=${t('league.ownerNamePlaceholder')}
            aria-label=${t('league.ownerNameLabel')}
          />
          <button class="lg-v2-btn primary" style="grid-template-columns:auto auto;" @click=${this._createLeague}>
            <span class="lg-v2-btn-ic">＋</span>
            <span>${t('league.createBtn')}</span>
          </button>
        </div>

        ${this._tournamentStarted ? html`
          <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:8px;margin-bottom:4px;padding:0 2px;">
            <label style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.1em;cursor:pointer;color:var(--ink);">
              <input type="checkbox"
                .checked=${this._lockFromToday}
                @change=${(e: Event) => { this._lockFromToday = (e.target as HTMLInputElement).checked; }}
              />
              ${t('league.cfgLockPlayedLabel')}
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:10.5px;letter-spacing:0.1em;cursor:pointer;color:var(--ink);">
              <input type="checkbox"
                .checked=${this._createFrozen}
                @change=${(e: Event) => { this._createFrozen = (e.target as HTMLInputElement).checked; }}
              />
              🔒 ${t('league.cfgFreezeLabel')} (iniciar bloqueada)
            </label>
          </div>
        ` : ''}

        ${this._renderSyncBanner()}

        <div class="lg-v2-section-bar">
          <h3>${t('league.sectionMyLeagues')}</h3>
          <span class="count">${t('league.sectionCount', { n: String(leagues.length), m: String(totalMembers) })}</span>
          <button class="lg-v2-help-link" style="margin-left: 8px;" @click=${this._openRulesModal}>
            ℹ️ ${t('league.rulesBtn')}
          </button>
          <span class="sort">${t('league.sortLabel')} <b>${t('league.sortByActivity')}</b></span>
        </div>

        ${leagues.length === 0
          ? html`<div class="lg-v2-empty">${t('league.empty')}</div>`
          : html`
            <div class="lg-v2-list">
              ${leagues.map((l, idx) => {
                const summary = this._leagueSummaries.get(l.id);
                const live = this._isLeagueLive(l);
                const myPos = this._yourPositionInLeague(l.id);
                const leaderName = summary?.leaderName ?? '—';
                const leaderPts = summary?.leaderPoints ?? 0;
                const color = this._paletteForLeague(l, idx);
                const posClass = myPos?.pos === 1 ? 'win' : (myPos && myPos.pos <= 3 ? 'podium' : '');
                return html`
                  <article
                    class="lg-v2-card"
                    style="--card-color:${color}"
                    @click=${() => this._goToDetail(l.id)}
                  >
                    ${live ? html`<div class="lg-v2-card-status"><span class="lg-v2-live-pill">${t('league.live')}</span></div>` : ''}

                    <div>
                      <div class="lg-v2-card-title">${l.name}</div>
                      <div class="lg-v2-card-meta">
                        <span class="lg-v2-code">${this._codeForLeague(l)}</span>
                        <span class="lg-v2-members"><b>${l.participants.length}</b> ${t('league.membersWord')}</span>
                      </div>
                    </div>

                    <div class="lg-v2-leader">
                      <div class="lg-v2-avatar">${this._avatarForName(leaderName)}</div>
                      <div>
                        <span class="lg-v2-leader-label">${t('league.leaderLabel')}</span>
                        <div class="lg-v2-leader-name">${leaderName}</div>
                        <div class="lg-v2-leader-points">${leaderPts} ${t('league.points')}</div>
                      </div>
                    </div>

                    <div>
                      <span class="lg-v2-leader-label">${t('league.predictionsLabel')}</span>
                      <div class="lg-v2-leader-name">
                        ${myPos?.isOwnerPresent
                          ? (myPos.pos === 1
                              ? t('league.youLead')
                              : t('league.youBehindStats', { below: String(myPos.total - myPos.pos), above: String(myPos.pos - 1) }))
                          : '—'}
                      </div>
                      <div class="lg-v2-delta same">${t('league.deltaSame')}</div>
                    </div>

                    <div class="lg-v2-rosette">
                      <span class="lg-v2-rosette-label">${t('league.yourPos')}</span>
                      ${myPos?.isOwnerPresent
                        ? html`<span class="lg-v2-pos ${posClass}"><span class="hash">#</span>${myPos.pos}</span>`
                        : html`<span class="lg-v2-pos"><span class="hash">#</span>—</span>`}
                    </div>

                    ${(() => {
                      const authUserId = useAuthStore.getState().session?.user?.id;
                      const ownerParticipant = l.participants.find(p => p.isOwner);
                      const myParticipant = authUserId ? l.participants.find(p => p.userId === authUserId) : null;
                      const displayParticipant = myParticipant ?? ownerParticipant ?? l.participants[0];
                      if (!displayParticipant) return '';
                      return html`
                        <div style="grid-column:1/-1; display:flex; gap:14px; flex-wrap:wrap; padding-top:8px; border-top:1px dashed rgba(26,25,51,0.18); font-family:var(--font-mono); font-size:10px;">
                          <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size:13px;">👟</span>
                            <span style="color:var(--dim); text-transform:uppercase; letter-spacing:0.04em;">${t('league.awardTopScorer')}</span>
                            <b>${displayParticipant.topScorer ? html`${displayParticipant.topScorer.teamId} · ${displayParticipant.topScorer.playerName}` : '—'}</b>
                          </div>
                          <div style="display:flex; align-items:center; gap:4px;">
                            <span style="font-size:13px;">⭐</span>
                            <span style="color:var(--dim); text-transform:uppercase; letter-spacing:0.04em;">${t('league.awardMvp')}</span>
                            <b>${displayParticipant.mvp ? html`${displayParticipant.mvp.teamId} · ${displayParticipant.mvp.playerName}` : '—'}</b>
                          </div>
                        </div>
                      `;
                    })()}

                    ${(() => {
                      const session = useAuthStore.getState().session;
                      const userId = session?.user?.id;
                      const me = findMyParticipant(l, userId);
                      const isOwnerOfCard = me?.isOwner === true;
                      
                      return html`
                        <div class="lg-v2-card-actions-row">
                          ${isOwnerOfCard ? html`
                            <button @click=${(e: Event) => { e.stopPropagation(); this._renameLeague(l.id); }}>${t('league.renameBtn')}</button>
                            <button @click=${(e: Event) => { e.stopPropagation(); this._requestDeleteLeague(l.id); }}>${t('league.delete')}</button>
                          ` : html`
                            <button @click=${(e: Event) => { e.stopPropagation(); this._requestDeleteLeague(l.id); }}>${t('league.leave')}</button>
                          `}
                        </div>
                      `;
                    })()}
                  </article>
                `;
              })}
            </div>
          `}

        ${this._confirmDeleteLeague ? (() => {
          const l = this._leagues.find(item => item.id === this._confirmDeleteLeague);
          if (!l) return '';
          const session = useAuthStore.getState().session;
          const userId = session?.user?.id;
          const me = findMyParticipant(l, userId);
          const isOwnerOfConfirm = me?.isOwner === true;
          
          return html`
            <div class="lg-confirm-box">
              <span>${isOwnerOfConfirm ? t('league.confirmDelete') : t('league.confirmLeave')}</span>
              <button class="lg-danger-btn" @click=${this._confirmDelete}>${t('league.confirmYes')}</button>
              <button class="lg-btn-back" @click=${this._cancelDelete}>${t('league.confirmNo')}</button>
            </div>
          `;
        })() : ''}

        <div class="lg-v2-foot">
          <span class="star">★</span> ${t('league.footNote')} <span class="star">★</span>
        </div>
      </div>

      ${this._renderJoinModal()}
    `;
  }

  private _renderJoinModal(): TemplateResult {
    if (!this._showJoinModal) return html``;
    return html`
      <div class="lg-v2-modal-backdrop" @click=${(e: Event) => { if (e.target === e.currentTarget) this._closeJoinModal(); }}>
        <div class="lg-v2-modal" role="dialog" aria-modal="true">
          <h3>${t('league.joinModalTitle')}</h3>
          <input
            type="text"
            .value=${this._joinCode}
            placeholder=${t('league.joinCodePlaceholder')}
            @input=${(e: InputEvent) => { this._joinCode = (e.target as HTMLInputElement).value; this._joinError = null; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._submitJoinCode(); }}
            autofocus
          />
          ${this._joinError ? html`<div class="modal-error">${this._joinError}</div>` : ''}
          <div class="modal-actions">
            <button ?disabled=${this._joinLoading} @click=${this._closeJoinModal}>${t('league.confirmNo')}</button>
            <button class="primary" ?disabled=${this._joinLoading} @click=${this._submitJoinCode}>
              ${this._joinLoading ? '…' : t('league.joinBtn')}
            </button>
          </div>
        </div>
      </div>
    `;
  }



  private _renderScoreBadges(score: ParticipantScore): TemplateResult {
    return html`
      <div class="lg-score-badges">
        <span class="lg-score-badge lg-kind-exact">${t('league.detailExact')} · ${score.exactCount}</span>
        <span class="lg-score-badge lg-kind-diff">${t('league.detailDiff')} · ${score.diffCount}</span>
        <span class="lg-score-badge lg-kind-sign">${t('league.detailSign')} · ${score.signCount}</span>
      </div>
    `;
  }

  private _rankTone(index: number, isOwner: boolean): string {
    const tones: string[] = [];
    if (index === 0) tones.push('leader');
    else if (index === 1) tones.push('silver');
    else if (index === 2) tones.push('bronze');
    if (isOwner) tones.push('me');
    return tones.join(' ');
  }

  private _getLeagueParticipant(participantId: string): LeagueParticipant | null {
    const league = this._leagues.find(item => item.id === this._activeLeagueId);
    return league?.participants.find(participant => participant.id === participantId) ?? null;
  }

  private _resolveParticipantKnockout(participant: LeagueParticipant) {
    const decoded: DecodedBracket = {
      groupScores: participant.groupScores as DecodedBracket['groupScores'],
      knockoutScores: participant.knockoutScores as DecodedBracket['knockoutScores'],
    };

    try {
      const tournament = useTournamentStore.getState();
      return buildResolvedKnockout(
        decoded,
        tournament.groupMatches,
        recalculateStandings as unknown as (matches: Array<{ matchId: string; scoreA: number | null; scoreB: number | null; teamA: string; teamB: string }>) => Record<string, { teamId: string; points?: number; goalDiff?: number; goalsFor?: number }[]>,
        getWinnerId as unknown as (teamA: string, teamB: string, scoreA: number, scoreB: number, penaltyScoreA?: number | null, penaltyScoreB?: number | null) => string | null,
        getKnockoutMatchOrder,
        KNOCKOUT_BRACKET,
        {},
      ) as Record<string, { teamA?: string | null; teamB?: string | null; winnerId?: string | null; scoreA?: number | null; scoreB?: number | null }>;
    } catch {
      return {} as Record<string, { teamA?: string | null; teamB?: string | null; winnerId?: string | null; scoreA?: number | null; scoreB?: number | null }>;
    }
  }

  private _renderInlineBracket(score: ParticipantScore, realKnockoutByMatchId: Map<string, { matchId: string; scoreA: number | null; scoreB: number | null }>): TemplateResult {
    const participant = this._getLeagueParticipant(score.participant.id);
    if (!participant) {
      return html``;
    }

    const breakdownByMatchId = new Map(score.breakdown.map(item => [item.matchId, item]));
    const resolvedKnockout = this._resolveParticipantKnockout(participant);
    const rounds = [
      { title: '1/16', matches: participant.knockoutScores.filter(match => match.matchId.startsWith('R32')) },
      { title: '1/8', matches: participant.knockoutScores.filter(match => match.matchId.startsWith('R16')) },
      { title: 'QF', matches: participant.knockoutScores.filter(match => match.matchId.startsWith('QF')) },
      { title: 'SF', matches: participant.knockoutScores.filter(match => match.matchId.startsWith('SF')) },
      { title: '3P', matches: participant.knockoutScores.filter(match => match.matchId === 'TP-01') },
      { title: 'FIN', matches: participant.knockoutScores.filter(match => match.matchId === 'FIN-01') },
    ].filter(round => round.matches.length > 0);

    return html`
      <div class="lg-inline-bracket">
        ${rounds.map(round => html`
          <section class="lg-inline-round">
            <div class="lg-inline-round-title">${round.title}</div>
            ${round.matches.map(match => {
              const resolved = resolvedKnockout[match.matchId];
              const teamAId = resolved?.teamA;
              const teamBId = resolved?.teamB;
              const teamA = typeof teamAId === 'string' ? getTeam(teamAId) : null;
              const teamB = typeof teamBId === 'string' ? getTeam(teamBId) : null;
              const breakdown = breakdownByMatchId.get(match.matchId);
              const realScore = realKnockoutByMatchId.get(match.matchId);
              const tone = breakdown?.kind ?? 'pending';
              const showReal = realScore && realScore.scoreA !== null && realScore.scoreB !== null;

              return html`
                <article class=${`lg-inline-match tone-${tone}`}>
                  <div class="lg-inline-match-header">
                    <span class="lg-inline-match-id">${match.matchId}</span>
                    <span class="lg-inline-match-kind">${breakdown ? `+${breakdown.points}` : t('league.kindPending')}</span>
                  </div>

                  <div class="lg-inline-teams">
                    <div class="lg-inline-team-row">
                      <div class="lg-inline-team">
                        ${teamA ? renderFlag(teamA, 'xs') : ''}
                        <span class="lg-inline-team-name">${teamA?.name ?? resolved?.teamA ?? '—'}</span>
                      </div>
                      <span class="lg-inline-score">${match.scoreA ?? '-'}</span>
                    </div>
                    <div class="lg-inline-team-row">
                      <div class="lg-inline-team">
                        ${teamB ? renderFlag(teamB, 'xs') : ''}
                        <span class="lg-inline-team-name">${teamB?.name ?? resolved?.teamB ?? '—'}</span>
                      </div>
                      <span class="lg-inline-score">${match.scoreB ?? '-'}</span>
                    </div>
                  </div>

                  <div class="lg-inline-foot">
                    ${match.penaltyScoreA !== null && match.penaltyScoreB !== null
                      ? html`<span class="lg-inline-pen">PEN ${match.penaltyScoreA}-${match.penaltyScoreB}</span>`
                      : html`<span class="lg-inline-real pending">${t('league.kindPending')}</span>`}
                    ${showReal
                      ? html`<span class="lg-inline-real">Real ${realScore.scoreA}-${realScore.scoreB}</span>`
                      : html`<span class="lg-inline-real pending">Real —</span>`}
                  </div>
                </article>
              `;
            })}
          </section>
        `)}
      </div>
    `;
  }

  private _renderAwardsAndProgression(score: ParticipantScore): TemplateResult {
    const kt = score.koCorrectTeams || { roundOf32: [], roundOf16: [], quarterfinals: [], semifinals: [], final: [], winner: [] };
    const ac = score.awardsCorrect || { topScorer: false, mvp: false };
    const participant = score.participant;

    return html`
      <div class="lg-progression-wrap" style="background:var(--paper); border:2px solid var(--ink); box-shadow:var(--shadow-hard-sm); padding:16px; margin: 16px 0; display:flex; flex-direction:column; gap:12px; font-family:var(--font-mono); font-size:11px;">
        <div style="font-family:var(--font-var); font-size:14px; border-bottom: 2px solid var(--ink); padding-bottom:6px; text-transform:uppercase; letter-spacing:0.04em;">
          🏆 PROGRESIÓN Y PREMIOS INDIVIDUALES
        </div>
        
        <div class="lg-progression-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          <div style="padding:6px; border:1px dashed var(--ink); background:var(--paper-2);">
            <div style="color:var(--dim); font-size:9px;">1/16 DE FINAL (R32)</div>
            <div style="font-size:16px; font-family:var(--font-var); margin-top:2px;">${kt.roundOf32.length} <span style="font-size:10px; color:var(--dim);">/ 32</span></div>
          </div>
          <div style="padding:6px; border:1px dashed var(--ink); background:var(--paper-2);">
            <div style="color:var(--dim); font-size:9px;">OCTAVOS (R16)</div>
            <div style="font-size:16px; font-family:var(--font-var); margin-top:2px;">${kt.roundOf16.length} <span style="font-size:10px; color:var(--dim);">/ 16</span></div>
          </div>
          <div style="padding:6px; border:1px dashed var(--ink); background:var(--paper-2);">
            <div style="color:var(--dim); font-size:9px;">CUARTOS DE FINAL</div>
            <div style="font-size:16px; font-family:var(--font-var); margin-top:2px;">${kt.quarterfinals.length} <span style="font-size:10px; color:var(--dim);">/ 8</span></div>
          </div>
          <div style="padding:6px; border:1px dashed var(--ink); background:var(--paper-2);">
            <div style="color:var(--dim); font-size:9px;">SEMIFINALES</div>
            <div style="font-size:16px; font-family:var(--font-var); margin-top:2px;">${kt.semifinals.length} <span style="font-size:10px; color:var(--dim);">/ 4</span></div>
          </div>
          <div style="padding:6px; border:1px dashed var(--ink); background:var(--paper-2);">
            <div style="color:var(--dim); font-size:9px;">FINALISTAS</div>
            <div style="font-size:16px; font-family:var(--font-var); margin-top:2px;">${kt.final.length} <span style="font-size:10px; color:var(--dim);">/ 2</span></div>
          </div>
          <div style="padding:6px; border:1px dashed var(--ink); background:var(--paper-2); border-color:var(--retro-yellow);">
            <div style="color:var(--dim); font-size:9px; font-weight:bold;">🏆 CAMPEÓN</div>
            <div style="font-size:16px; font-family:var(--font-var); margin-top:2px;">${kt.winner.length > 0 ? '¡ACERTADO! 🌟' : 'NO ACERTADO'}</div>
          </div>
        </div>

        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-top:4px; padding-top:10px; border-top:1px dashed var(--ink);">
          <div style="flex:1; min-width:200px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">👟</span>
            <div>
              <div style="color:var(--dim); font-size:9px; text-transform:uppercase;">Predicción Goleador</div>
              <div style="font-family:var(--font-var); font-size:12px; display:flex; align-items:center; gap:4px;">
                ${participant?.topScorer ? html`
                  <b>${participant.topScorer.playerName}</b>
                  <span style="color:var(--dim); font-size:10px;">(${participant.topScorer.teamId})</span>
                  ${REAL_AWARDS.topScorer ? html`
                    <span style="color:${ac.topScorer ? 'var(--retro-green)' : 'var(--retro-red)'}; font-weight:bold;">${ac.topScorer ? '✓ (+15)' : '✗'}</span>
                  ` : ''}
                ` : '—'}
                ${isMyParticipant(participant as LeagueParticipant, useAuthStore.getState().session?.user?.id) && !this._tournamentStarted ? html`
                  <button style="all:unset; cursor:pointer; color:var(--retro-orange); text-decoration:underline; font-size:10px; margin-left:6px; font-weight:bold;" @click=${(e: Event) => { e.stopPropagation(); this._openAwardsSelector('topScorer', participant as LeagueParticipant); }}>Editar</button>
                ` : ''}
              </div>
            </div>
          </div>
          <div style="flex:1; min-width:200px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">⭐</span>
            <div>
              <div style="color:var(--dim); font-size:9px; text-transform:uppercase;">Predicción MVP</div>
              <div style="font-family:var(--font-var); font-size:12px; display:flex; align-items:center; gap:4px;">
                ${participant?.mvp ? html`
                  <b>${participant.mvp.playerName}</b>
                  <span style="color:var(--dim); font-size:10px;">(${participant.mvp.teamId})</span>
                  ${REAL_AWARDS.mvp ? html`
                    <span style="color:${ac.mvp ? 'var(--retro-green)' : 'var(--retro-red)'}; font-weight:bold;">${ac.mvp ? '✓ (+15)' : '✗'}</span>
                  ` : ''}
                ` : '—'}
                ${isMyParticipant(participant as LeagueParticipant, useAuthStore.getState().session?.user?.id) && !this._tournamentStarted ? html`
                  <button style="all:unset; cursor:pointer; color:var(--retro-orange); text-decoration:underline; font-size:10px; margin-left:6px; font-weight:bold;" @click=${(e: Event) => { e.stopPropagation(); this._openAwardsSelector('mvp', participant as LeagueParticipant); }}>Editar</button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderParticipantCard(
    score: ParticipantScore,
    index: number,
    _hasSnapshot: boolean,
    realKnockoutByMatchId: Map<string, { matchId: string; scoreA: number | null; scoreB: number | null }>,
  ): TemplateResult {
    const isOwner = score.participant.isOwner === true;
    const participant = this._getLeagueParticipant(score.participant.id);
    const isExpanded = this._expandedId === score.participant.id;
    const sessionUserId = useAuthStore.getState().session?.user?.id;
    const isMe = participant ? isMyParticipant(participant, sessionUserId) : isOwner;
    const showPredictions = isMe || this._tournamentStarted;

    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    const me = findMyParticipant(league, sessionUserId);
    const currentUserIsOwner = me?.isOwner === true;

    return html`
      <article class=${`lg-participant-card ${this._rankTone(index, isMe)}`}>
        <button
          class="lg-participant-summary"
          @click=${() => this._toggleExpand(score.participant.id)}
          aria-expanded=${isExpanded ? 'true' : 'false'}
        >
          <div class="lg-participant-rank-badge">${index + 1}</div>

          <div class="lg-participant-main">
            <div>
              <div class="lg-participant-kicker">${t('league.colRank')} ${index + 1}</div>
              <div class="lg-participant-name-row">
                <div class="lg-participant-name">${score.participant.name}${isMe ? ' ★' : ''}</div>
                ${participant ? html`<span class="lg-participant-source">${participant.source}</span>` : ''}
              </div>
            </div>
            ${this._renderScoreBadges(score)}
          </div>

          <div class="lg-participant-mini-stats">
            <div class="lg-participant-mini-stat">${t('league.colGroups')}<strong>${score.byPhase.groups}</strong></div>
            <div class="lg-participant-mini-stat">${t('league.colKnockout')}<strong>${score.byPhase.knockout}</strong></div>
            <div class="lg-participant-mini-stat">Premios<strong>${score.byPhase.awards ?? 0}</strong></div>
            <div class="lg-participant-mini-stat">${t('league.detailExact')}<strong>${score.exactCount}</strong></div>
          </div>

          <div class="lg-participant-scorebox">
            <div class="lg-participant-total">${score.total}</div>
            <div class="lg-participant-total-unit">${t('league.points')}</div>
            <div class="lg-expand-btn">${isExpanded ? 'Ocultar bracket ▲' : 'Ver bracket ▼'}</div>
          </div>
        </button>

        ${isExpanded ? html`
          <div class="lg-participant-expanded">
            ${showPredictions ? html`
              ${this._renderAwardsAndProgression(score)}
              <div class="lg-inline-bracket-wrap">
                ${this._renderInlineBracket(score, realKnockoutByMatchId)}
              </div>
            ` : html`
              <div class="lg-predictions-locked">
                🔒 ${t('league.predictionsLocked')}
              </div>
            `}

            <div class="lg-participant-actions">
              ${showPredictions ? html`
                <button class="lg-bracket-btn" @click=${() => this._viewBracket(score.participant.id, score.participant.name)}>
                  ${t('league.viewBracket')}
                </button>
              ` : ''}
              ${isMe ? html`
                <button class="lg-bracket-btn" @click=${() => { void this._renameParticipantPrompt(score.participant.id, score.participant.name); }}>
                  ${t('league.editNameBtn')}
                </button>
                <label class="lg-upload-btn-sm">
                  ${t('league.replacePrediction')}
                  <input type="file" accept=".xlsx" hidden @change=${(e: Event) => { void this._handleMeExcelReplace(e, score.participant.id); }} />
                </label>
              ` : ''}
              ${currentUserIsOwner && !isMe ? html`
                <button class="lg-delete-btn" @click=${() => this._requestRemoveParticipant(score.participant.id, score.participant.name)}>
                  ${t('league.removeBtn')}
                </button>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }

  // ── RENDER DETAIL ──
  private _renderDetail() {
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    if (!league) {
      this._screen = 'list';
      return html``;
    }

    const session = useAuthStore.getState().session;
    const userId = session?.user?.id;
    const me = findMyParticipant(league, userId);
    const isOwner = me?.isOwner === true;

    const played = this._playedCount;

    const realGroupScores = filterRealByDate(realGroupScoresFromStore());
    const realKnockoutOrder = getKnockoutMatchOrder();
    const tournament = useTournamentStore.getState();
    const realKnockoutScores = filterRealByDate(realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return { matchId, scoreA: m?.scoreA ?? null, scoreB: m?.scoreB ?? null };
    }));

    const { current, next3 } = getCurrentMatchday(realGroupScores, realKnockoutScores);
    const editorialGroupScores = realGroupScores;
    const editorialKnockoutScores = realKnockoutScores;

    const recentResults = [
      ...editorialGroupScores
        .filter(match => match.scoreA !== null && match.scoreB !== null)
        .map(match => {
          const fixture = groupMatchById.get(match.matchId);
          return {
            matchId: match.matchId,
            teamA: fixture?.teamA ?? '',
            teamB: fixture?.teamB ?? '',
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            label: fixture?.matchDay ? `MD${fixture.matchDay}` : 'GR',
          };
        }),
      ...editorialKnockoutScores
        .map(matchScore => {
          if (matchScore.scoreA === null || matchScore.scoreB === null) return null;
          const match = tournament.knockoutMatches[matchScore.matchId];
          const round = matchScore.matchId.startsWith('R32') ? '1/16'
            : matchScore.matchId.startsWith('R16') ? 'R16'
            : matchScore.matchId.startsWith('QF') ? 'QF'
            : matchScore.matchId.startsWith('SF') ? 'SF'
            : matchScore.matchId === 'TP-01' ? 'TP'
            : 'FIN';
          return {
            matchId: matchScore.matchId,
            teamA: match.teamA ?? '',
            teamB: match.teamB ?? '',
            scoreA: matchScore.scoreA,
            scoreB: matchScore.scoreB,
            label: round,
          };
        })
        .filter((match): match is { matchId: string; teamA: string; teamB: string; scoreA: number; scoreB: number; label: string } => match !== null),
    ].slice(-3).reverse();
    const displayKnockoutByMatchId = new Map(this._knockoutDisplayScores.map(match => [match.matchId, match]));
    const hasRealMatches = played > 0;
    const shouldShowRealEmptyState = !hasRealMatches;
    const leftPanelKicker = hasRealMatches ? t('league.currentMatchday') : t('league.latestMatches');
    const leftPanelTitle = hasRealMatches ? t('league.latestMatches') : t('league.worldCupNotStarted');
    const resultFootLabel = t('league.latestMatches');

    const live = this._isLeagueLive(league);
    const top3 = this._scores.slice(0, 3);
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as typeof top3;
    const createdLabel = new Date(league.createdAt).toLocaleDateString();
    const ownerScore = this._scores.find(s => s.participant.isOwner === true);

    return html`
      <div class="lg-v2-shell">
        <section class="lg-v2-detail-top">
          <div>
            <button class="lg-v2-back" @click=${this._goToList}>${t('league.backToLeagues')}</button>
            <h1 class="lg-v2-detail-h1">
              ${league.name}
              ${live ? html`<span class="lg-v2-stamp">${t('league.live')}</span>` : ''}
            </h1>
            <div class="lg-v2-codeblock">
              <span class="label">${t('league.inviteCode')}</span>
              <span class="lg-v2-code">${this._codeForLeague(league)}</span>
              <button class="lg-v2-copy" title=${t('league.copyInvite')} @click=${this._showInviteModal}>⎘</button>
            </div>
          </div>
          <div class="lg-v2-detail-stats">
            <div class="row"><span>${t('league.matchday')}</span><span class="v">${played} / ${TOTAL_MATCHES}</span></div>
            <div class="row"><span>${t('league.participants', { n: '' }).trim() || 'Miembros'}</span><span class="v">${league.participants.length}</span></div>
            <div class="row"><span>${t('league.changesToday')}</span><span class="v">${this._scores.length > 0 ? '—' : '0'}</span></div>
            <div class="row"><span>${t('league.createdOn')}</span><span class="v">${createdLabel}</span></div>
          </div>
        </section>

        <div class="lg-v2-legend">
          <span class="lg-v2-legend-item"><span class="dot" style="background:var(--retro-orange)"></span><b>+5</b> · ${t('league.legendExact')}</span>
          <span class="lg-v2-legend-item"><span class="dot" style="background:var(--retro-yellow)"></span><b>+3</b> · ${t('league.kindDiff')}</span>
          <span class="lg-v2-legend-item"><span class="dot" style="background:var(--paper-2);border:1.5px solid var(--ink);"></span><b>+2</b> · ${t('league.kindSign')}</span>
          <span class="lg-v2-legend-item"><span class="dot" style="background:var(--paper);border:1.5px solid var(--ink);"></span><b>0</b> · ${t('league.legendMiss')}</span>
          <button class="lg-v2-help-link" style="margin-left: auto;" @click=${this._openRulesModal}>
            ℹ️ ${t('league.rulesBtn')}
          </button>
          <span class="lg-v2-legend-item" style="margin-left: 12px;">${t('league.lastUpdate')} · <b>${live ? t('league.minutesAgo', { n: String(Math.floor((Date.now() % 3600000) / 60000)) }) : '—'}</b></span>
        </div>

        ${podiumOrder.length === 3 ? html`
          <div class="lg-v2-podium-wrap">
            <div class="lg-v2-podium-title">${t('league.podiumTitle')}</div>
            <div class="lg-v2-podium">
              ${podiumOrder.map(p => {
                const place = p === top3[0] ? 'first' : p === top3[1] ? 'second' : 'third';
                const label = place === 'first' ? '1' : place === 'second' ? '2' : '3';
                const av = this._avatarForName(p.participant.name);
                return html`
                  <div class="lg-v2-pod ${place}">
                    <div class="pod-figure">
                      ${place === 'first' ? '⚽' : av}
                      <span class="pod-medal">${label}</span>
                    </div>
                    <div class="lg-v2-pod-name">${p.participant.name}${p.participant.isOwner ? ' ★' : ''}</div>
                    <div class="lg-v2-pod-pts">${p.total} ${t('league.points')} · ${p.exactCount} ${t('league.colExact').toLowerCase()}</div>
                    <div class="lg-v2-pod-step">#${label}</div>
                  </div>
                `;
              })}
            </div>
          </div>
        ` : ''}

        <div class="lg-v2-board">
          <div class="head">
            <span>${t('league.boardTitle')}</span>
            <span class="extra">${t('league.boardSubtitle', { n: String(this._scores.length) })}</span>
          </div>
          ${this._scores.length === 0
            ? html`<div class="lg-v2-empty" style="border:none;">${t('league.emptyParticipants2')}</div>`
            : html`
              <table class="lg-v2-table">
                <thead>
                  <tr>
                    <th>${t('league.colRank')}</th>
                    <th>${t('league.colName')}</th>
                    <th class="num">${t('league.detailExact')}</th>
                    <th class="num">${t('league.colTotal')}</th>
                    <th class="num">${t('league.colVar')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${this._scores.map((row, idx) => {
                    const av = this._avatarForName(row.participant.name);
                    const isYou = isMyParticipant(row.participant, userId);
                    const isExpanded = this._expandedId === row.participant.id;
                    return html`
                      <tr
                        class=${`row-click ${isYou ? 'you' : ''}`}
                        @click=${() => this._toggleExpand(row.participant.id)}
                      >
                        <td class="rank">#${String(idx + 1).padStart(2, '0')}</td>
                        <td>
                          <div class="user">
                            <span class="av">${av}</span>
                            <span class="name">${row.participant.name}${isYou ? ' ★' : ''}</span>
                          </div>
                        </td>
                        <td class="exact">${row.exactCount}</td>
                        <td class="pts">${row.total}</td>
                        <td class="var na">—</td>
                      </tr>
                      ${isExpanded ? html`
                        <tr class="expand-row">
                          <td colspan="5" style="padding:0;background:var(--paper-2);">
                            ${this._renderParticipantCard(row, idx, false, displayKnockoutByMatchId)}
                          </td>
                        </tr>
                      ` : ''}
                    `;
                  })}
                </tbody>
              </table>
            `}
          <div class="lg-v2-board-foot">
            <span class="live">${t('league.boardFootLive')}</span>
            <span>${t('league.boardFootSchedule', { time: '—' })}</span>
          </div>
        </div>

        <div class="lg-v2-edit-prediction-row">
          ${league.frozen ? html`
            <div style="background:color-mix(in srgb,var(--retro-orange) 18%,var(--paper-3));border:2.5px solid var(--ink);padding:8px 14px;font-family:var(--font-mono);font-size:11px;letter-spacing:0.1em;display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              🔒 ${t('league.cfgFrozenBanner')}
            </div>
          ` : ''}
          <button class="lg-v2-btn primary" @click=${this._editPredictionForLeague} ?disabled=${!!league.frozen}>
            <span class="lg-v2-btn-ic">✎</span>
            <span>
              Editar mi predicción en esta liga<br/>
              <span class="lg-v2-btn-sub">${league.frozen ? t('league.cfgFrozenBanner') : 'Grupos, eliminatorias, MVP y goleador independientes'}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          <button class="lg-v2-btn" @click=${this._editAwardsForLeague} ?disabled=${!!league.frozen}>
            <span class="lg-v2-btn-ic">🏅</span>
            <span>
              Elegir goleador y MVP<br/>
              <span class="lg-v2-btn-sub">${league.frozen ? t('league.cfgFrozenBanner') : 'Premios individuales · +15 pts por acierto'}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          ${me ? html`
          <button class="lg-v2-btn" @click=${this._publishMyBracketToLeague} ?disabled=${this._syncing}>
            <span class="lg-v2-btn-ic">☁</span>
            <span>
              Guardar y publicar en la liga<br/>
              <span class="lg-v2-btn-sub">Sube tus predicciones actuales a la liga para que los demás las vean</span>
            </span>
            <span class="lg-v2-btn-arrow">↑</span>
          </button>
          ` : ''}
        </div>
        <div class="lg-v2-cta-row">
          <button class="lg-v2-btn primary" @click=${this._showSharePredictionsModal}>
            <span class="lg-v2-btn-ic">★</span>
            <span>
              ${t('league.shareMyPredictions')}<br/>
              <span class="lg-v2-btn-sub">${t('league.ctaSharePredictionsSub', { exact: String(ownerScore?.exactCount ?? 0), pts: String(ownerScore?.total ?? 0) })}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          <button class="lg-v2-btn" @click=${this._showInviteModal}>
            <span class="lg-v2-btn-ic">⎘</span>
            <span>
              ${t('league.inviteTitle')}<br/>
              <span class="lg-v2-btn-sub">${t('league.ctaShareSub')}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          <button class="lg-v2-btn" @click=${() => this._requestDeleteLeague(league.id)}>
            <span class="lg-v2-btn-ic">⚙</span>
            <span>
              ${isOwner ? t('league.ctaSettings') : t('league.leave')}<br/>
              <span class="lg-v2-btn-sub">${isOwner ? t('league.ctaSettingsSub') : t('league.ctaSettingsSubNotOwner')}</span>
            </span>
            <span class="lg-v2-btn-arrow">→</span>
          </button>
          ${isOwner ? html`
            <button class="lg-v2-btn" @click=${() => this._toggleLeagueFrozen(league)}
              style="${league.frozen ? 'border-color:var(--retro-orange);' : ''}">
              <span class="lg-v2-btn-ic">${league.frozen ? '🔓' : '🔒'}</span>
              <span>
                ${league.frozen ? 'Descongelar predicciones' : 'Congelar predicciones'}<br/>
                <span class="lg-v2-btn-sub">${league.frozen ? 'Permitir editar de nuevo' : 'Bloquear edición para todos'}</span>
              </span>
              <span class="lg-v2-btn-arrow">→</span>
            </button>
          ` : ''}
        </div>


        <div class="lg-v2-section-bar">
          <h3>${t('league.modeReal')}</h3>
          <span class="sort">
            ${useAuthStore.getState().session
              ? html`<button class="lg-btn-sm" @click=${this._refreshFromCloud} ?disabled=${this._syncing}>${t(this._syncing ? 'league.syncing' : 'league.refresh')}</button>`
              : ''}
            <button class="lg-btn-sm" @click=${this._exportLeagueExcel}>${t('league.downloadLeagueExcel')}</button>
          </span>
        </div>

        ${this._leagues.length > 1 ? html`
          <div class="lg-league-switcher">
            ${this._leagues.map(item => html`
              <button
                class=${`lg-league-chip-btn ${item.id === league.id ? 'active' : ''}`}
                @click=${() => this._goToDetail(item.id)}
              >
                ${item.name}
              </button>
            `)}
          </div>
        ` : ''}

        ${!this._officialBracket ? html`
          <div class="lg-projection-banner" style="background:color-mix(in srgb, var(--retro-orange) 22%, var(--paper-3));">
            <span>Aún sin resultados oficiales — el ranking se actualizará cuando comiencen los partidos.</span>
          </div>
        ` : ''}

        ${this._confirmRemoveParticipant ? html`
          <div class="lg-confirm-box">
            <span>${t('league.confirmRemoveParticipant', { name: this._confirmRemoveParticipant.name })}</span>
            <button class="lg-danger-btn" @click=${this._confirmRemove}>${t('league.confirmYes')}</button>
            <button class="lg-btn-back" @click=${this._cancelRemove}>${t('league.confirmNo')}</button>
          </div>
        ` : ''}

        ${this._confirmDeleteLeague ? html`
          <div class="lg-confirm-box">
            <span>${isOwner ? t('league.confirmDelete') : t('league.confirmLeave')}</span>
            <button class="lg-danger-btn" @click=${this._confirmDelete}>${t('league.confirmYes')}</button>
            <button class="lg-btn-back" @click=${this._cancelDelete}>${t('league.confirmNo')}</button>
          </div>
        ` : ''}

        ${this._showInvite ? html`
          <div class="lg-confirm-box" style="border-color: var(--retro-yellow); flex-direction: column; align-items: stretch;">
            <span>${t('league.inviteBody')}</span>
            <code style="font-family: var(--font-mono); font-size: 11px; padding: 8px; background: var(--paper); border: 1px solid var(--ink); word-break: break-all; user-select: all;">${this._inviteUrl(league.id)}</code>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${this._copiedInvite
                ? html`<button class="lg-btn-sm" disabled>${t('league.copied')}</button>`
                : html`<button class="lg-btn-sm" @click=${this._copyInviteLink}>${t('league.copyLink')}</button>`}
              <button class="lg-btn-back" @click=${() => { this._showInvite = false; this._copiedInvite = false; }}>✕</button>
            </div>
          </div>
        ` : ''}

        ${this._showSharePredictions ? html`
          <div class="lg-confirm-box" style="border-color: var(--retro-green);">
            <span>${t('league.sharePredictionsBody')}</span>
            ${this._copiedShare
              ? html`<button class="lg-btn-sm" disabled>${t('league.copied')}</button>`
              : html`<button class="lg-btn-sm" @click=${this._copyShareLink}>${t('league.copyLink')}</button>`}
            <button class="lg-btn-back" @click=${() => { this._showSharePredictions = false; this._copiedShare = false; }}>✕</button>
          </div>
        ` : ''}

        <section class="lg-results-board">
          <div class="lg-section-panel">
            <div class="lg-section-head">
              <div>
                <div class="lg-section-kicker">${leftPanelKicker}</div>
                <div class="lg-section-title">${leftPanelTitle}</div>
              </div>
              <div class="lg-section-kicker">${t('league.progress', { played, total: TOTAL_MATCHES })}</div>
            </div>

            <div class="lg-results-list">
              ${recentResults.length > 0 ? recentResults.map(result => {
                const teamA = getTeam(result.teamA);
                const teamB = getTeam(result.teamB);
                return html`
                  <article class="lg-result-card">
                    <div class="lg-result-top">
                      <span class="lg-result-id">${result.matchId}</span>
                      <span class="lg-result-badge live">${result.label}</span>
                    </div>
                    <div class="lg-result-teams">
                      <div class="lg-result-row">
                        <div class="lg-result-team">
                          ${teamA ? renderFlag(teamA, 'xs') : ''}
                          <span class="lg-result-team-name">${teamA?.name ?? result.teamA}</span>
                        </div>
                        <span class="lg-result-score">${result.scoreA}</span>
                      </div>
                      <div class="lg-result-row">
                        <div class="lg-result-team">
                          ${teamB ? renderFlag(teamB, 'xs') : ''}
                          <span class="lg-result-team-name">${teamB?.name ?? result.teamB}</span>
                        </div>
                        <span class="lg-result-score">${result.scoreB}</span>
                      </div>
                    </div>
                    <div class="lg-result-foot">
                      <span>${resultFootLabel}</span>
                      <span>${t('league.points')}</span>
                    </div>
                  </article>
                `;
              }) : html`<div class="lg-normal">${shouldShowRealEmptyState ? t('league.worldCupNotStarted') : t('league.noMatchesPlayedYet')}</div>`}
            </div>
          </div>

          <div class="lg-section-panel">
            <div class="lg-section-head">
              <div>
                <div class="lg-section-kicker">${t('league.nextMatches')}</div>
                <div class="lg-section-title">${current ? current.label : t('league.nextMatches')}</div>
              </div>
            </div>

            <div class="lg-next-list">
              ${next3.length === 0 ? html`
                <div class="lg-normal">${t('league.noMatchesPlayedYet')}</div>
              ` : next3.map(match => {
                const teamA = getTeam(match.teamA);
                const teamB = getTeam(match.teamB);
                return html`
                  <article class="lg-next-item">
                    <div class="lg-next-item-head">
                      <span>${match.matchId}</span>
                      <span>${match.date.slice(5)} · ${match.timeSpain}</span>
                    </div>
                    <div class="lg-next-teams">${teamA?.name ?? match.teamA} vs ${teamB?.name ?? match.teamB}</div>
                    <div class="lg-next-meta">${match.venueId || t('league.phaseGroups')}</div>
                  </article>
                `;
              })}
            </div>
          </div>
        </section>

        <div class="lg-add-section">
          <h3>${t('league.addTitle')}</h3>
          <div class="lg-add-row">
            <div class="lg-field">
              <label>${t('league.nameLabel')}</label>
              <input
                type="text"
                .value=${this._newName}
                @input=${(e: InputEvent) => { this._newName = (e.target as HTMLInputElement).value; }}
                placeholder=${t('league.namePlaceholderFriend')}
              />
            </div>
            <label class="lg-upload-btn compact">
              ${t('league.uploadBtn')}
              <input type="file" accept=".xlsx" hidden @change=${this._handleFileUpload} />
            </label>
          </div>
          ${this._uploadError ? html`<div class="lg-error">${this._uploadError}</div>` : ''}
        </div>

        <div class="lg-add-section">
          <h3>${t('league.importFriendTitle')}</h3>
          <div class="lg-add-row">
            <div class="lg-field">
              <input
                type="text"
                .value=${this._importUrl}
                @input=${(e: InputEvent) => { this._importUrl = (e.target as HTMLInputElement).value; }}
                @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this._importFriendPrediction(); }}
                placeholder=${t('league.importPlaceholder')}
              />
            </div>
            <button class="lg-btn-sm" @click=${this._importFriendPrediction}>${t('league.importBtn')}</button>
          </div>
          ${this._importFeedback ? html`<div class="lg-error">${this._importFeedback}</div>` : ''}
        </div>
      </div>
    `;
  }

  private _openAwardsSelector(type: 'topScorer' | 'mvp', participant: LeagueParticipant) {
    this._showAwardsModal = type;
    this._participantForModal = participant;
    this._selectedTeamIdForSelector = '';
    this._awardsSearchQuery = '';
    this.requestUpdate();
  }

  private _closeAwardsSelector() {
    this._showAwardsModal = null;
    this._selectedTeamIdForSelector = '';
    this._awardsSearchQuery = '';
    this.requestUpdate();
  }

  private async _selectPlayer(participant: LeagueParticipant, player: Player, teamId?: string) {
    const type = this._showAwardsModal;
    if (!type) return;

    const resolvedTeamId = teamId ?? this._selectedTeamIdForSelector;
    const awardVal = { teamId: resolvedTeamId, playerName: player.name };

    const store = useTournamentStore.getState();
    if (type === 'topScorer') {
      store.setMyTopScorerPrediction(awardVal);
      participant.topScorer = awardVal;
    } else {
      store.setMyMvpPrediction(awardVal);
      participant.mvp = awardVal;
    }

    const leaguesStore = useLeaguesStore.getState();
    leaguesStore.updateParticipantScores(
      this._activeLeagueId!,
      participant.id,
      participant.groupScores,
      participant.knockoutScores,
      participant.topScorer,
      participant.mvp
    );

    if (useAuthStore.getState().session) {
      await updateMyPredictionsInCloud(
        this._activeLeagueId!,
        participant.groupScores,
        participant.knockoutScores,
        participant.topScorer,
        participant.mvp
      );
    }

    this._closeAwardsSelector();
    this._goToDetail(this._activeLeagueId!);
  }

  private _renderInteractiveAwardsSelector(participant: LeagueParticipant): TemplateResult {
    const isYou = isMyParticipant(participant, useAuthStore.getState().session?.user?.id);
    
    if (!isYou) {
      return html`
        <div class="lg-awards-panel" style="flex-direction: row; align-items: center;">
          <div class="lg-awards-grid" style="width: 100%;">
            <div class="lg-award-card" style="border: none; background: transparent; padding: 0; box-shadow: none;">
              <div class="lg-award-main">
                <span class="lg-award-icon">👟</span>
                <div class="lg-award-info">
                  <div class="lg-award-category">Máximo Goleador</div>
                  <div class="lg-award-value">
                    ${participant.topScorer ? `${participant.topScorer.playerName} (${participant.topScorer.teamId})` : 'Sin elegir'}
                  </div>
                </div>
              </div>
            </div>
            <div class="lg-award-card" style="border: none; background: transparent; padding: 0; box-shadow: none;">
              <div class="lg-award-main">
                <span class="lg-award-icon">⭐</span>
                <div class="lg-award-info">
                  <div class="lg-award-category">MVP del Campeonato</div>
                  <div class="lg-award-value">
                    ${participant.mvp ? `${participant.mvp.playerName} (${participant.mvp.teamId})` : 'Sin elegir'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="lg-awards-panel">
        <div class="lg-awards-title">
          🏅 PREDICTOR DE PREMIOS INDIVIDUALES
        </div>
        <div class="lg-awards-grid">
          <div class="lg-award-card">
            <div class="lg-award-main">
              <span class="lg-award-icon">👟</span>
              <div class="lg-award-info">
                <div class="lg-award-category">Máximo Goleador</div>
                <div class="lg-award-value">
                  ${participant.topScorer ? `${participant.topScorer.playerName} (${participant.topScorer.teamId})` : 'Sin seleccionar'}
                </div>
              </div>
            </div>
            <button class="lg-btn-sm" @click=${() => this._openAwardsSelector('topScorer', participant)}>
              ${participant.topScorer ? 'Cambiar' : 'Seleccionar'}
            </button>
          </div>

          <div class="lg-award-card">
            <div class="lg-award-main">
              <span class="lg-award-icon">⭐</span>
              <div class="lg-award-info">
                <div class="lg-award-category">MVP del Campeonato</div>
                <div class="lg-award-value">
                  ${participant.mvp ? `${participant.mvp.playerName} (${participant.mvp.teamId})` : 'Sin seleccionar'}
                </div>
              </div>
            </div>
            <button class="lg-btn-sm" @click=${() => this._openAwardsSelector('mvp', participant)}>
              ${participant.mvp ? 'Cambiar' : 'Seleccionar'}
            </button>
          </div>
        </div>

        ${this._showAwardsModal ? this._renderAwardsSelectionModal(participant) : ''}
      </div>
    `;
  }

  private _renderAwardsSelectionModal(participant: LeagueParticipant): TemplateResult {
    const typeLabel = this._showAwardsModal === 'topScorer' ? 'MÁXIMO GOLEADOR' : 'MVP DEL CAMPEONATO';
    const query = this._awardsSearchQuery.trim();
    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');

    const allPlayers = Object.entries(SQUADS).flatMap(([teamId, players]) =>
      players.map(p => ({
        ...p,
        teamId,
        teamName: TEAMS_2026.find(t => t.id === teamId)?.name ?? teamId,
      }))
    );

    let results: typeof allPlayers = [];
    if (query.length >= 2) {
      results = allPlayers.filter(p => {
        const haystack = `${p.name} ${p.teamName} ${p.teamId} ${p.club}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '');
        return haystack.includes(normalizedQuery);
      });
    }
    const totalMatches = results.length;
    const displayed = results.slice(0, 80);
    const showPrompt = query.length < 2;

    return html`
      <div style="position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; padding:16px;">
        <div style="background:var(--paper-3); border:3px solid var(--ink); box-shadow:var(--shadow-hard-lg); width:100%; max-width:700px; max-height:85vh; display:flex; flex-direction:column; overflow:hidden;">
          <div style="background:var(--retro-yellow); border-bottom:3px solid var(--ink); padding:16px; display:flex; align-items:center; justify-content:space-between;">
            <div style="font-family:var(--font-var); font-size:18px; font-weight:bold; letter-spacing:0.02em;">
              🏅 SELECCIONAR ${typeLabel}
            </div>
            <button class="lg-small-btn" @click=${this._closeAwardsSelector} style="font-size:14px; font-weight:bold;">✕</button>
          </div>

          <div style="padding:16px; border-bottom:2px solid var(--ink); background:var(--paper);">
            <input
              type="search"
              .value=${this._awardsSearchQuery}
              @input=${(e: InputEvent) => { this._awardsSearchQuery = (e.target as HTMLInputElement).value; }}
              placeholder="Buscar jugador, equipo o club…"
              autofocus
              style="width:100%; box-sizing:border-box; padding:10px 12px; font-family:var(--font-var); font-size:15px; border:2px solid var(--ink); background:var(--paper); color:var(--ink); outline:none;"
            />
          </div>

          <div style="flex:1; overflow-y:auto; padding:16px;">
            ${showPrompt
              ? html`
                <div style="font-family:var(--font-mono); font-size:11px; color:var(--dim); text-align:center; padding:32px; border:2px dashed var(--ink); background:var(--paper-2);">
                  Empieza a escribir el nombre del jugador…
                </div>
              `
              : displayed.length === 0
              ? html`
                <div style="font-family:var(--font-mono); font-size:11px; color:var(--dim); text-align:center; padding:32px; border:2px dashed var(--ink); background:var(--paper-2);">
                  Sin resultados para «${query}»
                </div>
              `
              : html`
                <div style="font-family:var(--font-mono); font-size:9px; color:var(--dim); margin-bottom:8px;">
                  Mostrando ${displayed.length} de ${totalMatches} jugadores
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:6px;">
                  ${displayed.map(p => html`
                    <button
                      style="all:unset; cursor:pointer; padding:8px; border:2px solid var(--ink); background:var(--paper-2); box-shadow:2px 2px 0 0 var(--ink); display:flex; align-items:center; gap:8px; font-family:var(--font-mono); font-size:10px;"
                      @click=${() => this._selectPlayer(participant, p, p.teamId)}
                    >
                      <div style="width:28px; height:28px; border-radius:50%; border:1.5px solid var(--ink); background:var(--paper); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:9px; font-weight:bold; overflow:hidden;">
                        ${p.photoUrl
                          ? html`<img src=${p.photoUrl} alt="" style="width:100%;height:100%;object-fit:cover;">`
                          : p.name.charAt(0).toUpperCase()}
                      </div>
                      <div style="min-width:0; flex:1;">
                        <div style="font-family:var(--font-var); font-size:12px; font-weight:bold; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.name}</div>
                        <div style="display:flex; align-items:center; gap:4px; margin-top:2px;">
                          ${renderFlag(TEAMS_2026.find(t => t.id === p.teamId)!, 'xs')}
                          <span style="color:var(--dim);">${p.teamId}</span>
                          <span style="margin-left:auto; font-size:9px;">#${p.number} · ${p.position}</span>
                        </div>
                        <div style="font-size:9px; color:var(--dim); margin-top:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.club}</div>
                      </div>
                    </button>
                  `)}
                </div>
              `}
          </div>

          <div style="border-top:3px solid var(--ink); padding:12px; display:flex; justify-content:flex-end;">
            <button class="lg-btn-back" @click=${this._closeAwardsSelector} style="margin-bottom:0;">Cancelar</button>
          </div>
        </div>
      </div>
    `;
  }

  // ── RENDER BRACKET (solo lectura) ──
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
      const st = useTournamentStore.getState();
      resolvedKnockout = buildResolvedKnockout(
        decoded,
        st.groupMatches,
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

    const realGroupByMatchId = new Map(realGroupScores.map(r => [r.matchId, r]));
    const realKoByMatchId = new Map(realKnockoutScores.map(r => [r.matchId, r]));

    const renderScore = (scoreA: number | null, scoreB: number | null) =>
      html`<div class="lg-bracket-score">${scoreA ?? '-'} - ${scoreB ?? '-'}</div>`;

    return html`
      <button class="lg-btn-back" @click=${() => { this._screen = 'detail'; this._bracketData = null; }}>
        ← ${t('league.backToDetail')}
      </button>

      <div class="lg-header">
        <div class="lg-title">${t('league.bracketOf', { name })}</div>
        <div class="lg-subtitle">${predictionScores.total} ${t('league.points')}</div>
      </div>

      ${this._renderInteractiveAwardsSelector(participant)}

      <div class="lg-action-row">
        <label class="lg-upload-btn">
          ${t('league.replacePrediction')}
          <input type="file" accept=".xlsx" hidden @change=${this._handleReplaceExcel} />
        </label>
        ${this._uploadError ? html`<span class="lg-error">${this._uploadError}</span>` : ''}
      </div>

      <div class="lg-bracket-phase-title">${t('league.phaseGroups')}</div>
      <div class="lg-bracket-grid">
      ${groupScores.map(s => {
        const bd = breakdownByMatchId.get(s.matchId);
        const gm = groupMatchById.get(s.matchId);
        const teamA = gm ? getTeam(gm.teamA) : null;
        const teamB = gm ? getTeam(gm.teamB) : null;
        const real = realGroupByMatchId.get(s.matchId);
        const showReal = real && real.scoreA !== null && real.scoreB !== null;
        return html`
          <div class="lg-bracket-match">
            <div class="lg-bracket-teams">
              ${teamA ? html`${renderFlag(teamA, 'sm')}<span class="lg-bracket-team-name">${teamA.name}</span>` : s.matchId}
              <span class="lg-bracket-vs">${t('groups.vs')}</span>
              ${teamB ? html`${renderFlag(teamB, 'sm')}<span class="lg-bracket-team-name">${teamB.name}</span>` : ''}
            </div>
            ${renderScore(s.scoreA, s.scoreB)}
            ${showReal ? html`<span class="lg-bracket-real">(real: ${real!.scoreA}-${real!.scoreB})</span>` : ''}
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
        const real = realKoByMatchId.get(s.matchId);
        const showReal = real && real.scoreA !== null && real.scoreB !== null;
        return html`
          <div class="lg-bracket-match">
            <div class="lg-bracket-teams">
              ${teamA ? html`${renderFlag(teamA, 'sm')}<span class="lg-bracket-team-name">${teamA.name}</span>` : (resolved?.teamA ?? '—')}
              <span class="lg-bracket-vs">${t('groups.vs')}</span>
              ${teamB ? html`${renderFlag(teamB, 'sm')}<span class="lg-bracket-team-name">${teamB.name}</span>` : (resolved?.teamB ?? '—')}
            </div>
            ${renderScore(s.scoreA, s.scoreB)}
            ${s.penaltyScoreA !== null && s.penaltyScoreB !== null ? html`<span class="lg-bracket-result">(p. ${s.penaltyScoreA}-${s.penaltyScoreB})</span>` : ''}
            ${showReal ? html`<span class="lg-bracket-real">(real: ${real!.scoreA}-${real!.scoreB})</span>` : ''}
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
    let content;
    switch (this._screen) {
      case 'list': content = this._renderList(); break;
      case 'detail': content = this._renderDetail(); break;
      case 'bracket': content = this._renderBracket(); break;
      default: content = html``;
    }
    return html`
      ${content}
      <league-rules-modal ?open=${this._showRulesModal} @close=${this._closeRulesModal}></league-rules-modal>
      ${this._showAwardsModal && this._participantForModal ? this._renderAwardsSelectionModal(this._participantForModal) : ''}
    `;
  }
}

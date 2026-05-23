import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, getKnockoutMatchOrder, recalculateStandings, getWinnerId } from '../store/tournament-store';
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
import { getCurrentMatchday, simulateEmptyPredictions, filterRealByDate } from '../lib/league-fixture';
import { buildProjectedScores } from '../lib/league-projection';
import type { RealScores } from '../lib/league-projection';

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
  @state() private _confirmDeleteLeague: string | null = null;
  @state() private _bracketData: BracketScreenData | null = null;
  @state() private _editMode = false;
  @state() private _viewMode: 'real' | 'projection' = 'real';
  private _leagueSummaries: Map<string, { leaderName: string; leaderPoints: number; participantCount: number }> = new Map();
  private _editBuffer: Map<string, { scoreA: number | null; scoreB: number | null; penaltyScoreA?: number | null; penaltyScoreB?: number | null }> = new Map();
  private _knockoutDisplayScores: RealScores[] = [];

  private _unsubTournament?: () => void;
  private _unsubLeagues?: () => void;
  private _unsubLocale?: () => void;
  private get _isReadOnly(): boolean { return this._viewMode === 'real'; }

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
    .lg-simulate-world-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-var);
      font-size: 10px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 6px 12px;
      background: var(--retro-yellow);
      color: var(--ink);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      white-space: nowrap;
    }
    .lg-simulate-world-btn:hover {
      background: color-mix(in srgb, var(--retro-yellow) 70%, var(--paper));
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
    .lg-card-simulated {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.06em;
      color: var(--retro-red);
      text-transform: uppercase;
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
  `;

  connectedCallback() {
    super.connectedCallback();
    try {
      const saved = localStorage.getItem('leagues-view-mode');
      if (saved === 'real' || saved === 'projection') this._viewMode = saved;
    } catch { /* localStorage disabled */ }
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

  private _setViewMode(mode: 'real' | 'projection') {
    this._viewMode = mode;
    try { localStorage.setItem('leagues-view-mode', mode); } catch { /* ignore */ }
    this._recalc();
  }

  private _recalc() {
    const leaguesState = useLeaguesStore.getState();
    this._leagues = leaguesState.leagues;
    this._activeLeagueId = leaguesState.activeLeagueId;

    if (this._screen !== 'bracket') {
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

    const tournament = useTournamentStore.getState();

    const rawRealGroupScores = realGroupScoresFromStore();
    const realKnockoutOrder = getKnockoutMatchOrder();
    const rawRealKnockoutScores = realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return {
        matchId,
        scoreA: m?.scoreA ?? null,
        scoreB: m?.scoreB ?? null,
      };
    });

    const realGroupScores = filterRealByDate(rawRealGroupScores);
    const realKnockoutScores = filterRealByDate(rawRealKnockoutScores);

    let groupScoresForRanking: readonly RealScores[] = realGroupScores;
    let knockoutScoresForRanking: readonly RealScores[] = realKnockoutScores;

    if (this._viewMode === 'projection') {
      const projected = buildProjectedScores(realGroupScores, realKnockoutScores);
      groupScoresForRanking = projected.groupScores;
      knockoutScoresForRanking = projected.knockoutScores;
    }

    this._knockoutDisplayScores = this._viewMode === 'projection'
      ? [...knockoutScoresForRanking]
      : realKnockoutScores;

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
      const allParticipants = l.participants;
      const scored: ParticipantScore[] = [];
      for (const p of allParticipants) {
        scored.push(scoreParticipant(p, groupScoresForRanking, knockoutScoresForRanking));
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
      const scored: ParticipantScore[] = [];
      for (const participant of league.participants) {
        scored.push(scoreParticipant(participant, groupScoresForRanking, knockoutScoresForRanking));
      }
      this._scores = rankParticipants(scored);
    } else {
      this._scores = [];
    }

    this.requestUpdate();
  }

  private _cancelEdits() {
    this._editMode = false;
    this._editBuffer = new Map();
  }

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
    useLeaguesStore.getState().createLeague(name);
    this._newLeagueName = '';
    this._manualListMode = false;
    this._screen = 'detail';
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
    const league = this._leagues.find(l => l.id === this._activeLeagueId);
    const p = league?.participants.find(pp => pp.id === pid);
    if (!p) return;
    this._bracketData = { participant: p, name: pName };
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

  private _simulateWorld() {
    const st = useTournamentStore.getState();
    st.autoSimulateGroups();
    st.autoSimulateKnockout();

    const leagueId = this._activeLeagueId;
    if (!leagueId) return;
    const league = useLeaguesStore.getState().leagues.find(l => l.id === leagueId);
    if (!league) return;

    const tournament = useTournamentStore.getState();
    const resolvedKo: Record<string, { teamA?: string | null; teamB?: string | null }> = {};
    for (const [matchId, m] of Object.entries(tournament.knockoutMatches)) {
      resolvedKo[matchId] = { teamA: m.teamA, teamB: m.teamB };
    }

    for (const p of league.participants) {
      const hasEmpty = p.groupScores.some(s => s.scoreA === null && s.scoreB === null)
        || p.knockoutScores.some(s => s.scoreA === null && s.scoreB === null);
      if (!hasEmpty) continue;

      const { groupScores, knockoutScores } = simulateEmptyPredictions(p, resolvedKo);
      useLeaguesStore.getState().updateParticipantScores(leagueId, p.id, groupScores, knockoutScores);
    }
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
      const blob = await ExcelService.exportLeaguePredictions(
        league,
        tournament.groupMatches,
        tournament.knockoutMatches,
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
              const summary = this._leagueSummaries.get(l.id);
              return html`
                <div class="lg-card" @click=${() => this._goToDetail(l.id)}>
                  <div class="lg-card-main">
                    <div class="lg-card-name">${l.name}</div>
                    <div class="lg-card-meta">
                      ${t('league.cardLeaderLine', {
                        name: summary?.leaderName ?? '—',
                        pts: String(summary?.leaderPoints ?? 0),
                        n: String(summary?.participantCount ?? 1),
                      })}
                      ${this._viewMode === 'projection' ? html` <span class="lg-card-simulated">${t('league.projectionTagSuffix')}</span>` : ''}
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
                      ? html`<span class=${`lg-inline-real ${this._viewMode === 'projection' ? 'lg-inline-projected' : ''}`}>${this._viewMode === 'projection' ? t('league.projectionLabel') : 'Real'} ${realScore.scoreA}-${realScore.scoreB}</span>`
                      : html`<span class="lg-inline-real pending">${this._viewMode === 'projection' ? t('league.projectionLabel') : 'Real'} —</span>`}
                  </div>
                </article>
              `;
            })}
          </section>
        `)}
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

    return html`
      <article class=${`lg-participant-card ${this._rankTone(index, isOwner)}`}>
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
                <div class="lg-participant-name">${score.participant.name}${isOwner ? ' ★' : ''}</div>
                ${participant ? html`<span class="lg-participant-source">${participant.source}</span>` : ''}
              </div>
            </div>
            ${this._renderScoreBadges(score)}
          </div>

          <div class="lg-participant-mini-stats">
            <div class="lg-participant-mini-stat">${t('league.colGroups')}<strong>${score.byPhase.groups}</strong></div>
            <div class="lg-participant-mini-stat">${t('league.colKnockout')}<strong>${score.byPhase.knockout}</strong></div>
            <div class="lg-participant-mini-stat">${t('league.detailExact')}<strong>${score.exactCount}</strong></div>
            <div class="lg-participant-mini-stat">${t('league.detailSign')}<strong>${score.signCount}</strong></div>
          </div>

          <div class="lg-participant-scorebox">
            <div class="lg-participant-total">${score.total}</div>
            <div class="lg-participant-total-unit">${t('league.points')}</div>
            <div class="lg-expand-btn">${isExpanded ? 'Ocultar bracket ▲' : 'Ver bracket ▼'}</div>
          </div>
        </button>

        ${isExpanded ? html`
          <div class="lg-participant-expanded">
            <div class="lg-inline-bracket-wrap">
              ${this._renderInlineBracket(score, realKnockoutByMatchId)}
            </div>

            <div class="lg-participant-actions">
              <button class="lg-bracket-btn" @click=${() => this._viewBracket(score.participant.id, score.participant.name)}>
                ${t('league.viewBracket')}
              </button>
              ${isOwner ? html`
                <label class="lg-upload-btn-sm">
                  ${t('league.replacePrediction')}
                  <input type="file" accept=".xlsx" hidden @change=${(e: Event) => { void this._handleMeExcelReplace(e, score.participant.id); }} />
                </label>
              ` : ''}
              ${!isOwner ? html`
                <button class="lg-delete-btn" @click=${() => this._removeParticipant(score.participant.id)}>
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

    const played = this._playedCount;
    const pct = TOTAL_MATCHES > 0 ? Math.round((played / TOTAL_MATCHES) * 100) : 0;

    const realGroupScores = filterRealByDate(realGroupScoresFromStore());
    const realKnockoutOrder = getKnockoutMatchOrder();
    const tournament = useTournamentStore.getState();
    const realKnockoutScores = filterRealByDate(realKnockoutOrder.map(matchId => {
      const m = tournament.knockoutMatches[matchId];
      return { matchId, scoreA: m?.scoreA ?? null, scoreB: m?.scoreB ?? null };
    }));

    const { current, next3 } = getCurrentMatchday(realGroupScores, realKnockoutScores);

    const leader = this._scores[0];
    const second = this._scores[1];
    const recentResults = [
      ...realGroupScores
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
      ...realKnockoutOrder
        .map(matchId => {
          const match = tournament.knockoutMatches[matchId];
          if (!match || match.scoreA === null || match.scoreB === null) return null;
          const round = matchId.startsWith('R32') ? '1/16'
            : matchId.startsWith('R16') ? 'R16'
            : matchId.startsWith('QF') ? 'QF'
            : matchId.startsWith('SF') ? 'SF'
            : matchId === 'TP-01' ? 'TP'
            : 'FIN';
          return {
            matchId,
            teamA: match.teamA ?? '',
            teamB: match.teamB ?? '',
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            label: round,
          };
        })
        .filter((match): match is { matchId: string; teamA: string; teamB: string; scoreA: number; scoreB: number; label: string } => match !== null),
    ].slice(-3).reverse();
    const displayKnockoutByMatchId = new Map(this._knockoutDisplayScores.map(match => [match.matchId, match]));

    return html`
      <div class="lg-editorial-shell">
        <section class="lg-hero">
          <div class="lg-hero-top">
            <div>
              <div class="lg-hero-kicker">${t('league.title')}</div>
              <div class="lg-hero-title">${league.name}</div>
              <div class="lg-hero-meta">
                <span class="lg-hero-chip">${t('league.participants', { n: String(league.participants.length) })}</span>
                ${leader ? html`<span class="lg-hero-chip">${t('league.leader')}: ${leader.participant.name}</span>` : ''}
                ${current ? html`<span class="lg-hero-chip">${t('league.currentMatchday')}: ${current.label}</span>` : ''}
                <span class="lg-hero-chip">${played} / ${TOTAL_MATCHES}</span>
              </div>
              <div class="lg-mode-toggle">
                <button
                  class=${`lg-league-chip-btn ${this._viewMode === 'real' ? 'active' : ''}`}
                  @click=${() => this._setViewMode('real')}
                >
                  ${t('league.modeReal')}
                </button>
                <button
                  class=${`lg-league-chip-btn ${this._viewMode === 'projection' ? 'active' : ''}`}
                  @click=${() => this._setViewMode('projection')}
                >
                  ${t('league.modeSimulation')}
                </button>
                ${this._viewMode === 'projection' ? html`
                  <button class="lg-simulate-world-btn" @click=${this._simulateWorld}>${t('league.simulateAll')}</button>
                ` : ''}
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
            </div>

            <div class="lg-actions">
              <button class="lg-btn-sm" @click=${this._goToList}>${t('league.myLeagues')}</button>
              <button class="lg-btn-sm" @click=${this._exportLeagueExcel}>${t('league.downloadLeagueExcel')}</button>
              <button class="lg-danger-btn" @click=${() => this._requestDeleteLeague(league.id)}>${t('league.delete')}</button>
            </div>
          </div>

          <div class="lg-summary-grid">
            <div class="lg-summary-card leader">
              <div class="lg-summary-label">${t('league.leaderCardTitle')}</div>
              ${leader ? html`
                <div class="lg-summary-value">${leader.participant.name}${leader.participant.isOwner ? ' ★' : ''}</div>
                <div class="lg-summary-line">
                  <div class="lg-summary-meta">${second ? t('league.leaderLead', { n: String(leader.total - second.total), name: second.participant.name }) : t('league.points')}</div>
                </div>
                ${this._renderScoreBadges(leader)}
              ` : html`<div class="lg-normal">—</div>`}
            </div>

            <div class="lg-summary-card">
              <div class="lg-summary-label">${t('league.colTotal')}</div>
              <div class="lg-summary-value">${leader?.total ?? 0}</div>
              <div class="lg-summary-meta">${t('league.points')}</div>
            </div>

            <div class="lg-summary-card">
              <div class="lg-summary-label">${t('league.progress', { played, total: TOTAL_MATCHES })}</div>
              <div class="lg-progress">
                <div class="lg-progress-bar">
                  <div class="lg-progress-fill" style="width:${pct}%"></div>
                </div>
                <span class="lg-progress-label">${pct}%</span>
              </div>
              <div class="lg-summary-meta">${t('league.demoHint')}</div>
            </div>
          </div>
        </section>

        ${this._viewMode === 'projection' ? html`
          <div class="lg-projection-banner">
            <span>${t('league.projectionBanner')}</span>
          </div>
        ` : ''}

        ${this._confirmDeleteLeague ? html`
          <div class="lg-confirm-box">
            <span>${t('league.confirmDelete')}</span>
            <button class="lg-danger-btn" @click=${this._confirmDelete}>${t('league.confirmYes')}</button>
            <button class="lg-btn-back" @click=${this._cancelDelete}>${t('league.confirmNo')}</button>
          </div>
        ` : ''}

        ${this._scores.length === 0
          ? html`<div class="lg-empty">${t('league.emptyParticipants2')}</div>`
          : html`
            <section class="lg-ranking">
              <div class="lg-ranking-head">
                <div class="lg-ranking-title">${t('league.participants', { n: String(this._scores.length) })}</div>
                <div class="lg-ranking-subtitle">${t('league.progress', { played, total: TOTAL_MATCHES })}</div>

                <div class="lg-ranking-toolbar">
                  <div class="lg-ranking-overview">
                    <div class="lg-ranking-stat">
                      <span class="lg-section-kicker">${t('league.leader')}</span>
                      <strong>${leader?.participant.name ?? '—'}</strong>
                    </div>
                    <div class="lg-ranking-stat">
                      <span class="lg-section-kicker">${t('league.colTotal')}</span>
                      <strong>${leader?.total ?? 0}</strong>
                    </div>
                    <div class="lg-ranking-stat">
                      <span class="lg-section-kicker">${t('league.detailExact')}</span>
                      <strong>${leader?.exactCount ?? 0}</strong>
                    </div>
                    <div class="lg-ranking-stat">
                      <span class="lg-section-kicker">${t('league.colKnockout')}</span>
                      <strong>${leader?.byPhase.knockout ?? 0}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="lg-participants-board">
                ${this._scores.map((score, index) => this._renderParticipantCard(score, index, false, displayKnockoutByMatchId))}
              </div>

            </section>
          `}

        <section class="lg-results-board">
          <div class="lg-section-panel">
            <div class="lg-section-head">
              <div>
                <div class="lg-section-kicker">${t('league.currentMatchday')}</div>
                <div class="lg-section-title">${current ? `${current.label} · ${current.lastMatchId}` : t('league.nextMatches')}</div>
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
                      <span>${t('league.currentMatchday')}</span>
                      <span>${t('league.points')}</span>
                    </div>
                  </article>
                `;
              }) : html`<div class="lg-normal">${this._isReadOnly ? t('league.noResultsRealMode') : t('league.nextMatches')}</div>`}
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
              ${next3.map(match => {
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
      </div>
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
          ${this._isReadOnly ? '' : html`<button class="lg-btn" @click=${this._toggleEdit}>${t('league.editResults')}</button>`}
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
        const real = realGroupByMatchId.get(s.matchId);
        const showReal = real && real.scoreA !== null && real.scoreB !== null;
        return html`
          <div class="lg-bracket-match">
            <div class="lg-bracket-teams">
              ${teamA ? html`${renderFlag(teamA, 'sm')}<span class="lg-bracket-team-name">${teamA.name}</span>` : s.matchId}
              <span class="lg-bracket-vs">${t('groups.vs')}</span>
              ${teamB ? html`${renderFlag(teamB, 'sm')}<span class="lg-bracket-team-name">${teamB.name}</span>` : ''}
            </div>
            ${renderScoreInputs(s.matchId, s.scoreA, s.scoreB)}
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
            ${renderScoreInputs(s.matchId, s.scoreA, s.scoreB)}
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
    switch (this._screen) {
      case 'list': return this._renderList();
      case 'detail': return this._renderDetail();
      case 'bracket': return this._renderBracket();
      default: return html``;
    }
  }
}

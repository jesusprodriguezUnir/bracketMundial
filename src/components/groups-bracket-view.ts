import { LitElement, html, css, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { renderFlag } from '../lib/render-flag';
import { TEAMS_2026 } from '../data/fifa-2026';
import { t, useLocaleStore } from '../i18n';

const GROUP_COLORS = [
  'var(--retro-orange)',
  'var(--retro-blue)',
  'var(--retro-green)',
  'var(--retro-red)',
];

const GROUPS = 'ABCDEFGHIJKL'.split('');
const teamById = new Map(TEAMS_2026.map(t => [t.id as string, t]));

@customElement('groups-bracket-view')
export class GroupsBracketView extends LitElement {
  private _unsubStore?: () => void;
  private _unsubLocale?: () => void;

  @state() private _standings: Record<string, Array<{ teamId: string; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number }>> = {};
  @state() private _matches: Array<{ matchId: string; group: string; matchDay: number; teamA: string; teamB: string; scoreA: number | null; scoreB: number | null }> = [];

  static readonly styles = css`
    :host {
      display: block;
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 16px;
      font-family: var(--font-body);
      color: var(--ink);
    }

    .gb-header {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 24px;
      margin-bottom: 28px;
    }
    .gb-title {
      font-family: var(--font-var);
      font-size: 28px;
      letter-spacing: 0.02em;
      color: var(--ink);
      margin-bottom: 6px;
    }
    .gb-subtitle {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--dim);
      text-transform: uppercase;
    }

    .gb-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .gb-group-card {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      min-width: 0;
    }

    .gb-group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.05em;
      color: #fff;
    }
    .gb-group-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      background: rgba(0,0,0,0.25);
      padding: 2px 8px;
      border-radius: 3px;
    }

    .gb-standings {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      gap: 0;
      font-size: 10px;
    }
    .gb-standing-row {
      display: contents;
    }
    .gb-standing-row > div {
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      border-bottom: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
    }
    .gb-standing-row:nth-child(1) > div,
    .gb-standing-row:nth-child(2) > div {
      font-weight: bold;
    }
    .gb-standing-row:nth-child(1) > div:first-child,
    .gb-standing-row:nth-child(2) > div:first-child {
      color: var(--retro-red);
      font-weight: bold;
    }
    .gb-standing-row:nth-child(3) > div,
    .gb-standing-row:nth-child(4) > div {
      opacity: 0.6;
    }
    .gb-standing-row:nth-child(5) > div {
      border-bottom: none;
    }
    .gb-rank {
      justify-content: center;
      min-width: 24px;
      font-family: var(--font-mono);
    }
    .gb-team {
      font-size: 10px;
      font-weight: inherit;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gb-wdl {
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 9px;
      white-space: nowrap;
    }
    .gb-pts {
      justify-content: center;
      font-family: var(--font-var);
      font-size: 12px;
      font-weight: bold;
      min-width: 28px;
    }

    .gb-matches {
      padding: 8px;
      display: grid;
      gap: 4px;
      border-top: 2px solid var(--ink);
    }
    .gb-match {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto;
      align-items: center;
      gap: 2px;
      padding: 3px 4px;
      font-size: 9px;
      background: var(--paper);
      border: 1px solid color-mix(in srgb, var(--ink) 20%, transparent);
    }
    .gb-match .flag {
      width: 16px;
      height: 11px;
      flex-shrink: 0;
    }
    .gb-match-team {
      font-size: 9px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gb-match-team.home { text-align: right; }
    .gb-match-team.away { text-align: left; }
    .gb-match-score {
      font-family: var(--font-var);
      font-weight: bold;
      font-size: 11px;
      padding: 1px 6px;
      background: color-mix(in srgb, var(--retro-green) 20%, var(--paper));
      border-radius: 2px;
      white-space: nowrap;
    }
    .gb-match-score.pending {
      background: color-mix(in srgb, var(--dim) 15%, var(--paper));
      color: var(--dim);
      font-weight: normal;
      font-size: 8px;
    }
    .gb-match-score.result {
      background: color-mix(in srgb, var(--retro-green) 20%, var(--paper));
      color: var(--ink);
      font-weight: bold;
    }

    .gb-best-thirds {
      margin-top: 28px;
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 20px;
    }
    .gb-best-thirds-title {
      font-family: var(--font-var);
      font-size: 16px;
      letter-spacing: 0.04em;
      margin-bottom: 14px;
      color: var(--retro-orange);
    }
    .gb-bt-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
    }
    .gb-bt-card {
      background: var(--paper);
      border: 2px solid var(--ink);
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
    }
    .gb-bt-card.qualify {
      border-color: var(--retro-green);
      background: color-mix(in srgb, var(--retro-green) 12%, var(--paper));
    }
    .gb-bt-rank {
      font-family: var(--font-var);
      font-weight: bold;
      font-size: 14px;
      color: var(--retro-green);
      min-width: 20px;
    }

    @media (max-width: 1100px) {
      .gb-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .gb-bt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .gb-grid { grid-template-columns: minmax(0, 1fr); }
      .gb-bt-grid { grid-template-columns: minmax(0, 1fr); }
      .gb-match {
        grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._unsubStore = useTournamentStore.subscribe(() => this._refresh());
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._refresh();
  }

  disconnectedCallback() {
    this._unsubStore?.();
    this._unsubLocale?.();
    super.disconnectedCallback();
  }

  private _refresh() {
    const store = useTournamentStore.getState();
    this._standings = store.groupStandings;
    this._matches = store.groupMatches;
    this.requestUpdate();
  }

  private getTeam(id: string) {
    return teamById.get(id);
  }

  private renderGroupCard(letter: string, idx: number): TemplateResult {
    const standings = this._standings[letter] || [];
    const matches = this._matches
      .filter(m => m.group === letter)
      .sort((a, b) => (a.matchDay ?? 0) - (b.matchDay ?? 0));
    const played = matches.filter(m => m.scoreA !== null).length;
    const accentColor = GROUP_COLORS[idx % 4];
    const allPlayed = played === 6;

    return html`
      <div class="gb-group-card">
        <div class="gb-group-header" style="background-color: ${accentColor}">
          <span>${t('groups.group', { letter })}</span>
          <span class="gb-group-badge">${allPlayed ? t('groups.allPlayed') : t('groups.played', { n: played })}</span>
        </div>

        <div class="gb-standings">
          ${standings.map((s, si) => {
            const team = this.getTeam(s.teamId);
            return html`
              <div class="gb-standing-row">
                <div class="gb-rank">${(si === 0 || si === 1) ? html`<strong>${si + 1}°</strong>` : si + 1}</div>
                <div class="gb-team">
                  ${renderFlag(team, 'xs')}
                  <span>${team?.shortName ?? s.teamId}</span>
                </div>
                <div class="gb-wdl">${s.won}-${s.drawn}-${s.lost}</div>
                <div class="gb-pts">${s.points}</div>
              </div>
            `;
          })}
          ${standings.length === 0 ? html`<div style="padding:12px;text-align:center;font-size:10px;opacity:0.5">—</div>` : ''}
        </div>

        ${matches.length > 0 ? html`
          <div class="gb-matches">
            ${matches.map(m => {
              const tA = this.getTeam(m.teamA);
              const tB = this.getTeam(m.teamB);
              const isPlayed = m.scoreA !== null;
              return html`
                <div class="gb-match">
                  ${renderFlag(tA, 'xs')}
                  <span class="gb-match-team home">${tA?.shortName ?? m.teamA}</span>
                  <span class=${`gb-match-score ${isPlayed ? 'result' : 'pending'}`}>
                    ${isPlayed ? `${m.scoreA}–${m.scoreB}` : t('groups.pending')}
                  </span>
                  <span class="gb-match-team away">${tB?.shortName ?? m.teamB}</span>
                  ${renderFlag(tB, 'xs')}
                </div>
              `;
            })}
          </div>
        ` : ''}
      </div>
    `;
  }

  render() {
    const store = useTournamentStore.getState();
    const bestThirds = store.getBestThirds();

    const totalPlayed = this._matches.filter(m => m.scoreA !== null).length;

    return html`
      <div class="gb-header">
        <div class="gb-title">${t('groups.resultsBracket')}</div>
        <div class="gb-subtitle">${t('groups.resultsSubtitle', { played: String(totalPlayed), total: '72' })}</div>
      </div>

      <div class="gb-grid">
        ${GROUPS.map((letter, idx) => this.renderGroupCard(letter, idx))}
      </div>

      ${bestThirds.length > 0 ? html`
        <div class="gb-best-thirds">
          <div class="gb-best-thirds-title">${t('groups.bestThirds')}</div>
          <div class="gb-bt-grid">
            ${bestThirds.slice(0, 8).map((bt, idx) => {
              const team = this.getTeam(bt.id);
              const isQualify = idx < 8;
              return html`
                <div class=${`gb-bt-card ${isQualify ? 'qualify' : ''}`}>
                  <div class="gb-bt-rank">${idx + 1}</div>
                  ${renderFlag(team, 'xs')}
                  <span>${team?.shortName ?? bt.id}</span>
                  <span style="font-family:var(--font-mono);font-size:9px;margin-left:auto">${bt.points}pts ${bt.goalDifference >= 0 ? `+${bt.goalDifference}` : bt.goalDifference}</span>
                </div>
              `;
            })}
          </div>
        </div>
      ` : ''}
    `;
  }
}

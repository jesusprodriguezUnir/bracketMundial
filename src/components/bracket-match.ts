import { LitElement, html, css, type TemplateResult, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import { t, useLocaleStore } from '../i18n';
import { isMatchPending } from '../lib/date-utils';
import { getOddsForMatch, type MatchOdds } from '../lib/odds-service';
import { renderFlag } from '../lib/render-flag';
import type { KnockoutMatchResult } from '../store/tournament-store';
import { useTournamentStore } from '../store/tournament-store';
import './score-stepper';
import './odds-bar';

@customElement('bracket-match')
export class BracketMatch extends LitElement {
  @property({ type: String }) matchId = '';
  @property({ type: Object }) match: KnockoutMatchResult | null = null;
  @property({ type: String }) accentColor = 'var(--retro-blue)';
  @property({ type: Boolean }) isRightSide = false;
  @property({ type: Boolean }) interactive = false;
  @property({ type: Boolean }) showOdds = false;
  @property({ type: Boolean }) showVenue = false;
  @property({ type: Boolean }) pulse = false;

  @state() private _odds: MatchOdds | null = null;

  private _unsubscribeLocale?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._loadOdds();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeLocale?.();
  }

  override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('match') || changedProperties.has('matchId') || changedProperties.has('showOdds')) {
      this._loadOdds();
    }
  }

  private _loadOdds() {
    if (!this.showOdds || !this.match || !this.match.teamA || !this.match.teamB || this.match.isPlayed) {
      this._odds = null;
      return;
    }
    getOddsForMatch(this.matchId, this.match.teamA, this.match.teamB).then(o => {
      if (o && this.isConnected) {
        this._odds = o;
      }
    });
  }

  private getTeam(id: string | null) {
    if (!id) return undefined;
    return TEAMS_2026.find(team => team.id === id);
  }

  private openMatch() {
    if (!this.interactive) return;
    this.dispatchEvent(new CustomEvent('match-click', {
      detail: { matchId: this.matchId },
      bubbles: true,
      composed: true
    }));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.openMatch();
    }
  }

  private adjustInlineKnockout(e: Event, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    if (!this.match || !isMatchPending(this.match.date ?? '', this.match.timeSpain ?? '')) return;
    const curA = this.match.scoreA ?? 0;
    const curB = this.match.scoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    
    useTournamentStore.getState().setKnockoutMatchResult(
      this.matchId, nextA, nextB,
      this.match.penaltyScoreA ?? null, this.match.penaltyScoreB ?? null,
    );

    this.dispatchEvent(new CustomEvent('ko-score-change', {
      detail: { matchId: this.matchId },
      bubbles: true,
      composed: true
    }));
  }

  private adjustPenaltyKnockout(e: Event, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    if (!this.match || !isMatchPending(this.match.date ?? '', this.match.timeSpain ?? '')) return;
    const curA = this.match.penaltyScoreA ?? 0;
    const curB = this.match.penaltyScoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    
    useTournamentStore.getState().setKnockoutMatchResult(
      this.matchId, this.match.scoreA, this.match.scoreB, nextA, nextB,
    );

    this.dispatchEvent(new CustomEvent('ko-score-change', {
      detail: { matchId: this.matchId },
      bubbles: true,
      composed: true
    }));
  }

  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    /* Match box */
    .match-box {
      background: var(--paper-2);
      border: 1.5px solid var(--ink);
      border-left-width: 4px;
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      cursor: default;
      transition: transform 0.1s, box-shadow 0.1s;
      touch-action: manipulation;
      user-select: none;
      -webkit-user-select: none;
    }
    .match-box.interactive {
      cursor: pointer;
    }
    @media (hover: hover) {
      .match-box.interactive:hover {
        transform: translate(-2px, -2px);
        box-shadow: 3px 3px 0 0 var(--retro-orange), 3px 3px 0 1.5px var(--ink);
      }
    }
    .match-box.interactive:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .match-box.pulse {
      box-shadow: 0 0 0 3px var(--retro-yellow), var(--shadow-hard-sm);
    }
    .match-box.right-side {
      border-left-width: 1.5px;
      border-right-width: 4px;
    }

    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      min-height: 30px;
    }
    .team-row.winner-row { color: var(--paper); }
    .team-row.loser-row  { opacity: 0.5; }
    .team-separator { height: 1px; background: var(--ink); margin: 0 5px; }

    .team-info {
      display: flex;
      align-items: center;
      gap: 5px;
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 11px; flex-shrink: 0; }
    .flag-img {
      width: 17px;
      height: 11px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .team-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    @media (min-width: 769px) {
      .team-row {
        padding: 3px 5px;
        min-height: 28px;
      }
      .team-info {
        gap: 4px;
        font-size: clamp(9px, 0.78vw, 11px);
      }
      .team-flag {
        font-size: 10px;
      }
      .flag-img {
        width: 15px;
        height: 10px;
      }
      .score {
        font-size: clamp(11px, 0.95vw, 13px);
      }
    }

    .score { font-family: var(--font-var); font-size: 13px; flex-shrink: 0; }
    .score.pending { color: var(--dim); opacity: 0.4; font-size: 11px; }

    .match-note {
      padding: 2px 5px;
      border-top: 1px solid var(--ink);
      background: rgba(0,0,0,0.05);
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ko-pen-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 2px 4px;
      border-top: 1px dashed var(--ink);
      background: var(--paper);
    }
    .ko-pen-label { font-family: var(--font-mono); font-size: 7px; letter-spacing: 0.1em; color: var(--dim); }
    .ko-pen-sep   { font-family: var(--font-mono); font-size: 10px; color: var(--dim); }

    .venue-container {
      padding: 2px 8px;
      border-top: 1px solid var(--ink);
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(0,0,0,0.03);
    }
    .venue-img {
      width: 16px;
      height: 10px;
      object-fit: cover;
      border: 1px solid var(--ink);
    }
    .venue-text {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .odds-skeleton-bar {
      padding: 2px 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-top: 1.5px solid var(--ink);
      background: rgba(0,0,0,0.02);
    }
    .odds-skeleton-line {
      height: 4px;
      margin-bottom: 0;
      border: 1px solid var(--ink);
      background: linear-gradient(
        90deg,
        var(--paper-2) 0px,
        var(--paper-3) 40px,
        var(--paper-2) 80px
      );
      background-size: 300px 100%;
      animation: skeletonShimmer 1.2s ease-in-out infinite;
    }
    .odds-skeleton-figures {
      display: flex;
      justify-content: space-between;
      padding: 0 4px 2px;
    }
    .odds-skeleton-figures .skeleton-text {
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--dim);
      opacity: 0.4;
    }

    @keyframes skeletonShimmer {
      from { background-position: -300px 0; }
      to   { background-position: calc(300px + 100%) 0; }
    }
  `;

  override render() {
    const m = this.match;
    const tA = this.getTeam(m?.teamA ?? null);
    const tB = this.getTeam(m?.teamB ?? null);
    const isPlayed = m?.isPlayed ?? false;
    const winnerId = m?.winnerId ?? null;
    const penaltyScoreA = m?.penaltyScoreA ?? null;
    const penaltyScoreB = m?.penaltyScoreB ?? null;
    const decidedOnPenalties = penaltyScoreA !== null && penaltyScoreB !== null;
    const isPending = isPlayed === false;
    const label = `${tA?.shortName ?? 'TBD'} vs ${tB?.shortName ?? 'TBD'}`;
    const canEdit = this.interactive && !!(m?.teamA && m?.teamB && isMatchPending(m?.date ?? '', m?.timeSpain ?? ''));
    const scoreAVal = m?.scoreA ?? 0;
    const scoreBVal = m?.scoreB ?? 0;
    const isDraw = canEdit && m?.scoreA !== null && m?.scoreB !== null && m?.scoreA === m?.scoreB;
    const penAVal = m?.penaltyScoreA ?? 0;
    const penBVal = m?.penaltyScoreB ?? 0;

    const renderRow = (teamId: string | null, score: number | null, teamAB: 'A' | 'B') => {
      const team = this.getTeam(teamId);
      const isWinner = winnerId !== null && winnerId === teamId;
      const isLoser  = winnerId !== null && winnerId !== teamId;
      const stepVal  = teamAB === 'A' ? scoreAVal : scoreBVal;
      const scoreClass = isPending ? 'pending' : '';
      const scoreText = isPlayed ? score : '—';
      const scoreContent = canEdit
        ? html`<score-stepper
            .value=${stepVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="compact"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustInlineKnockout(e, teamAB, e.detail.delta)}></score-stepper>`
        : html`<div class="score ${scoreClass}">${scoreText}</div>`;

      return html`
        <div
          class="team-row ${isWinner ? 'winner-row' : ''} ${isLoser ? 'loser-row' : ''}"
          style="${isWinner ? `background: ${this.accentColor};` : ''}">
          <div class="team-info">
            ${renderFlag(team, { size: 'sm', imgClass: 'flag-img', flagClass: 'team-flag' })}
            <span class="team-name">${team?.shortName ?? 'TBD'}</span>
          </div>
          ${scoreContent}
        </div>
      `;
    };

    const penaltiesSuffix = decidedOnPenalties ? `, penaltis ${penaltyScoreA}-${penaltyScoreB}` : '';
    const matchAriaLabel = isPlayed
      ? `Partido ${label}, resultado ${m?.scoreA}-${m?.scoreB}${penaltiesSuffix}`
      : `Partido ${label}, click para editar`;

    let penaltyNote: TemplateResult | string = '';
    if (isDraw) {
      penaltyNote = html`
        <div class="ko-pen-row">
          <span class="ko-pen-label">PEN</span>
          <score-stepper
            .value=${penAVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="compact"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustPenaltyKnockout(e, 'A', e.detail.delta)}></score-stepper>
          <span class="ko-pen-sep">·</span>
          <score-stepper
            .value=${penBVal}
            decrementLabel=${t('groups.decScore')}
            incrementLabel=${t('groups.incScore')}
            variant="compact"
            @step-change=${(e: CustomEvent<{ delta: -1 | 1 }>) => this.adjustPenaltyKnockout(e, 'B', e.detail.delta)}></score-stepper>
        </div>
      `;
    } else if (decidedOnPenalties) {
      penaltyNote = html`<div class="match-note">Penaltis · ${penaltyScoreA}-${penaltyScoreB}</div>`;
    }

    let oddsTitle = '';
    if (this._odds) {
      let oddsSourceLabel = ' · estimado';
      if (this._odds.source === 'market') {
        oddsSourceLabel = ` · ${this._odds.bookmakers} casas`;
      }
      oddsTitle = `Probabilidad 1X2${oddsSourceLabel}`;
    }

    let oddsContent: TemplateResult | string = '';
    if (isPlayed) {
      oddsContent = '';
    } else if (this.showOdds && m?.teamA && m?.teamB) {
      if (this._odds) {
        let oddsSourceLabel = ' · estimado';
        if (this._odds.source === 'market') {
          oddsSourceLabel = ` · ${this._odds.bookmakers} casas`;
        }
        oddsTitle = `Probabilidad 1X2${oddsSourceLabel}`;
        oddsContent = html`
          <odds-bar
            title="${oddsTitle}"
            .home=${this._odds.home}
            .draw=${this._odds.draw}
            .away=${this._odds.away}
            variant="compact"
            .showFigures=${true}></odds-bar>
        `;
      } else {
        oddsContent = html`
          <div class="odds-skeleton-bar">
            <div class="skeleton odds-skeleton-line"></div>
            <div class="odds-skeleton-figures">
              <span class="skeleton-text">••%</span>
              <span class="skeleton-text">••%</span>
              <span class="skeleton-text">••%</span>
            </div>
          </div>
        `;
      }
    }

    const venueContent: TemplateResult | string = this.showVenue && (m as any)?.venue
      ? html`
          <div class="venue-container">
            ${(() => {
              const st = STADIUMS.find(s => s.name === (m as any).venue);
              return st ? html`<img src="${st.image}" class="venue-img" alt="">` : '';
            })()}
            <span class="venue-text">
              ${(m as any).venue} · ${(m as any).city}
            </span>
          </div>
        `
      : '';

    return html`
      <div
        class="match-box ${this.interactive ? 'interactive' : ''} ${this.pulse ? 'pulse' : ''} ${this.isRightSide ? 'right-side' : ''}"
        style="${this.isRightSide ? `border-right-color: ${this.accentColor};` : `border-left-color: ${this.accentColor};`}"
        role="${this.interactive ? 'button' : 'img'}"
        tabindex="${this.interactive ? '0' : '-1'}"
        aria-label="${matchAriaLabel}"
        @click="${this.openMatch}"
        @keydown="${this.handleKeyDown}">
        ${renderRow(m?.teamA ?? null, m?.scoreA ?? null, 'A')}
        <div class="team-separator"></div>
        ${renderRow(m?.teamB ?? null, m?.scoreB ?? null, 'B')}
        ${penaltyNote}
        ${oddsContent}
        ${venueContent}
      </div>
    `;
  }
}

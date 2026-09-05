import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';
import type { KnockoutMatchResult } from '../store/tournament-store';
import { t, useLocaleStore } from '../i18n';
import { renderFlag } from '../lib/render-flag';

const ROUND_COLORS: Record<string, string> = {
  r32:   'var(--retro-blue)',
  r16:   'var(--retro-orange)',
  qf:    'var(--retro-green)',
  sf:    'var(--retro-red)',
  final: 'var(--ink)',
};

@customElement('share-card')
export class ShareCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 1580px;
      background: var(--paper);
      font-family: var(--font-var);
      color: var(--ink);
    }

    /* ---- HEADER ---- */
    .card-header {
      height: 76px;
      background: var(--ink);
      display: flex;
      align-items: center;
      padding: 0 28px;
      border-bottom: 4px solid var(--ink);
      gap: 0;
    }
    .hd-wordmark {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .hd-title {
      font-family: var(--font-var);
      font-size: 22px;
      letter-spacing: 0.05em;
      color: var(--paper);
    }
    .hd-sub {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--retro-yellow);
      letter-spacing: 0.28em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .hd-divider {
      width: 3px;
      height: 40px;
      background: var(--retro-orange);
      margin: 0 20px;
    }
    .hd-hosts {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--paper);
      letter-spacing: 0.1em;
      opacity: 0.75;
    }
    .hd-champion {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hd-champion-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--retro-yellow);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .hd-champion-name {
      font-family: var(--font-var);
      font-size: 20px;
      color: var(--retro-yellow);
      letter-spacing: 0.04em;
    }
    .hd-flag-img {
      width: 28px;
      height: 18px;
      object-fit: cover;
      border: 2px solid var(--retro-yellow);
    }
    .hd-prediction-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-yellow);
      letter-spacing: 0.15em;
      border: 1px solid var(--retro-yellow);
      padding: 3px 8px;
    }

    /* ---- BRACKET AREA ---- */
    .card-body {
      display: flex;
      align-items: stretch;
      background: var(--paper);
      background-image:
        radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--retro-orange) 4%, transparent) 0, transparent 30%),
        radial-gradient(circle at 80% 70%, color-mix(in srgb, var(--retro-blue) 4%, transparent) 0, transparent 30%),
        var(--halftone-soft);
    }
    .bracket-wrap {
      display: flex;
      align-items: stretch;
      gap: 10px;
      padding: 12px 16px;
      min-width: 100%;
      position: relative;
    }

    /* ---- ROUND COLUMN ---- */
    .round-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 0;
      justify-content: space-around;
    }
    .round-col.is-final {
      flex: 1.18;
      justify-content: center;
      gap: 10px;
    }
    .round-title {
      padding: 4px 7px;
      font-family: var(--font-var);
      font-size: 9px;
      letter-spacing: 0.08em;
      border: 1px solid var(--hairline);
      box-shadow: 2px 2px 0 0 var(--ink);
      color: var(--paper);
      background-image: var(--halftone);
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
    }

    .matches-wrap {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      gap: 6px;
    }
    .round-title.is-final {
      color: var(--retro-yellow);
    }
    .round-count {
      font-family: var(--font-mono);
      font-size: 7px;
      opacity: 0.75;
      flex-shrink: 0;
    }

    /* ---- MATCH BOX ---- */
    .match-box {
      background: var(--paper-2);
      border: 1px solid var(--hairline);
      border-left-width: 4px;
      box-shadow: 2px 2px 0 0 var(--ink);
      overflow: hidden;
      flex-shrink: 0;
    }
    .match-box.right-side {
      border-left-width: 2px;
      border-right-width: 4px;
    }
    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      min-height: 22px;
    }
    .team-row.winner-row { color: var(--paper); }
    .team-row.loser-row { opacity: 0.45; }
    .team-separator {
      height: 1px;
      background: var(--hairline-strong);
      margin: 0 6px;
    }
    .team-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: var(--font-body);
      font-size: 8px;
      font-weight: 700;
      overflow: hidden;
    }
    .flag-img {
      width: 13px;
      height: 8px;
      object-fit: cover;
      border: 1px solid var(--hairline);
      flex-shrink: 0;
    }
    .team-flag { font-size: 9px; flex-shrink: 0; }
    .team-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .score {
      font-family: var(--font-var);
      font-size: 10px;
      flex-shrink: 0;
    }
    .score.pending { color: var(--ink-muted); opacity: 0.4; font-size: 8px; }
    .penalty-note {
      padding: 1px 6px;
      border-top: 1px solid var(--hairline);
      background: rgba(0,0,0,0.05);
      font-family: var(--font-mono);
      font-size: 6px;
      color: var(--ink-muted);
    }

    /* ---- CHAMPION BOX ---- */
    .champion-box {
      background: var(--retro-yellow);
      border: 1px solid var(--hairline-strong);
      box-shadow: 3px 3px 0 0 var(--ink);
      padding: 10px 8px;
      text-align: center;
      flex-shrink: 0;
      min-width: 0;
    }
    .champion-title {
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--ink);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .champion-team {
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--ink);
      line-height: 1.1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .champion-team.tbd { opacity: 0.35; font-size: 10px; }
    .flag-img-champion {
      width: 20px;
      height: 13px;
      object-fit: cover;
      border: 1px solid var(--hairline);
    }
    .third-place-label {
      font-family: var(--font-mono);
      font-size: 7px;
      color: var(--ink-muted);
      letter-spacing: 0.18em;
      text-align: center;
      margin-top: 8px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    /* ---- FOOTER ---- */
    .card-footer {
      height: 68px;
      background: var(--ink);
      border-top: 4px solid var(--ink);
      display: flex;
      align-items: center;
      padding: 0 28px;
      gap: 24px;
    }
    .footer-podium {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
    }
    .podium-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
    }
    .podium-medal {
      font-size: 16px;
    }
    .podium-label {
      font-size: 7px;
      color: var(--ink-muted);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      display: block;
    }
    .podium-name {
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--paper);
      display: block;
    }
    .podium-name.tbd { color: var(--ink-muted); font-size: 10px; }
    .footer-flag-img {
      width: 18px;
      height: 11px;
      object-fit: cover;
      border: 1px solid var(--hairline);
    }
    .footer-watermark {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--ink-muted);
      letter-spacing: 0.1em;
    }
  `;

  private _unsubscribeLocale?: () => void;

  override connectedCallback() {
    super.connectedCallback();
    this._unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._unsubscribeLocale?.();
  }

  private getTeam(id: string | null) {
    if (!id) return undefined;
    return TEAMS_2026.find(team => team.id === id);
  }

  private renderMatch(km: Record<string, KnockoutMatchResult>, matchId: string, accentColor: string, isRightSide = false) {
    const m = km[matchId];
    const isPlayed = m?.isPlayed ?? false;
    const winnerId = m?.winnerId ?? null;
    const penA = m?.penaltyScoreA ?? null;
    const penB = m?.penaltyScoreB ?? null;

    const renderRow = (teamId: string | null, score: number | null) => {
      const team = this.getTeam(teamId);
      const isWinner = winnerId !== null && winnerId === teamId;
      const isLoser  = winnerId !== null && winnerId !== teamId;
      return html`
        <div class="team-row ${isWinner ? 'winner-row' : ''} ${isLoser ? 'loser-row' : ''}"
          style="${isWinner ? `background:${accentColor};` : ''}">
          <div class="team-info">
            ${renderFlag(team, { imgClass: 'flag-img', flagClass: 'team-flag' })}
            <span class="team-name">${team?.shortName ?? 'TBD'}</span>
          </div>
          <div class="score ${!isPlayed ? 'pending' : ''}">${isPlayed ? score : '—'}</div>
        </div>
      `;
    };

    return html`
      <div
        class="match-box ${isRightSide ? 'right-side' : ''}"
        style="${isRightSide ? `border-right-color:${accentColor};` : `border-left-color:${accentColor};`}">
        ${renderRow(m?.teamA ?? null, m?.scoreA ?? null)}
        <div class="team-separator"></div>
        ${renderRow(m?.teamB ?? null, m?.scoreB ?? null)}
        ${penA !== null && penB !== null ? html`<div class="penalty-note">Pen. ${penA}–${penB}</div>` : ''}
      </div>
    `;
  }

  override render() {
    const { knockoutMatches: km, myTopScorerPrediction, myMvpPrediction } = useTournamentStore.getState();

    const finMatch = km['FIN-01'];
    const tpMatch  = km['TP-01'];
    const championId  = finMatch?.winnerId ?? null;
    const runnerUpId  = championId ? (finMatch.teamA === championId ? finMatch.teamB : finMatch.teamA) : null;
    const thirdId     = tpMatch?.winnerId ?? null;

    const champion = this.getTeam(championId);
    const runnerUp = this.getTeam(runnerUpId ?? null);
    const third    = this.getTeam(thirdId);
    const tsTeam   = myTopScorerPrediction ? this.getTeam(myTopScorerPrediction.teamId) : null;
    const mvpTeam  = myMvpPrediction ? this.getTeam(myMvpPrediction.teamId) : null;

    const r32L = ['R32-01','R32-02','R32-03','R32-04','R32-05','R32-06','R32-07','R32-08'];
    const r32R = ['R32-09','R32-10','R32-11','R32-12','R32-13','R32-14','R32-15','R32-16'];
    const r16L = ['R16-01','R16-02','R16-03','R16-04'];
    const r16R = ['R16-05','R16-06','R16-07','R16-08'];
    const qfL  = ['QF-01','QF-02'];
    const qfR  = ['QF-03','QF-04'];

    return html`
      <!-- HEADER -->
      <div class="card-header">
        <div class="hd-wordmark">
          <span class="hd-title">${t('card.title')}</span>
          <span class="hd-sub">${t('card.subtitle')}</span>
        </div>
        <div class="hd-divider"></div>
        <div class="hd-hosts">${t('card.hosts')}</div>

        <div class="hd-champion">
          ${champion
            ? html`
              <div>
                <div class="hd-champion-label">${t('card.champion')}</div>
                <div class="hd-champion-name">
                  ${renderFlag(champion, { imgClass: 'hd-flag-img', flagClass: 'team-flag' })} ${champion.name.toUpperCase()}
                </div>
              </div>`
            : html`<div class="hd-prediction-badge">${t('card.prediction')}</div>`
          }
        </div>
      </div>

      <!-- BODY: bracket -->
      <div class="card-body">
        <div class="bracket-wrap">
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.r32}">
              <span>${t('card.r32')}</span><span class="round-count">[8]</span>
            </div>
            <div class="matches-wrap">
              ${r32L.map(id => this.renderMatch(km, id, ROUND_COLORS.r32))}
            </div>
          </div>
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.r16}">
              <span>${t('card.r16')}</span><span class="round-count">[4]</span>
            </div>
            <div class="matches-wrap">
              ${r16L.map(id => this.renderMatch(km, id, ROUND_COLORS.r16))}
            </div>
          </div>
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.qf}">
              <span>${t('card.qf')}</span><span class="round-count">[2]</span>
            </div>
            <div class="matches-wrap">
              ${qfL.map(id => this.renderMatch(km, id, ROUND_COLORS.qf))}
            </div>
          </div>
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.sf}">
              <span>${t('card.sf')}</span><span class="round-count">[1]</span>
            </div>
            <div class="matches-wrap">
              ${this.renderMatch(km, 'SF-01', ROUND_COLORS.sf)}
            </div>
          </div>
          <div class="round-col is-final">
            <div class="round-title is-final" style="background-color:${ROUND_COLORS.final}">
              <span>${t('card.final')}</span><span class="round-count">[1]</span>
            </div>
            ${this.renderMatch(km, 'FIN-01', ROUND_COLORS.final)}

            <div class="champion-box">
              <div class="champion-title">${t('card.champion')}</div>
              ${champion
                ? html`<div class="champion-team">${renderFlag(champion, { imgClass: 'flag-img-champion', flagClass: 'team-flag' })} ${champion.name.toUpperCase()}</div>`
                : html`<div class="champion-team tbd">${t('card.tbd')}</div>`}
            </div>

            <div class="third-place-label">${t('card.thirdPlace')}</div>
            ${this.renderMatch(km, 'TP-01', ROUND_COLORS.sf)}
          </div>

          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.sf}">
              <span>${t('card.sf')}</span><span class="round-count">[1]</span>
            </div>
            <div class="matches-wrap">
              ${this.renderMatch(km, 'SF-02', ROUND_COLORS.sf, true)}
            </div>
          </div>
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.qf}">
              <span>${t('card.qf')}</span><span class="round-count">[2]</span>
            </div>
            <div class="matches-wrap">
              ${qfR.map(id => this.renderMatch(km, id, ROUND_COLORS.qf, true))}
            </div>
          </div>
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.r16}">
              <span>${t('card.r16')}</span><span class="round-count">[4]</span>
            </div>
            <div class="matches-wrap">
              ${r16R.map(id => this.renderMatch(km, id, ROUND_COLORS.r16, true))}
            </div>
          </div>
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.r32}">
              <span>${t('card.r32')}</span><span class="round-count">[8]</span>
            </div>
            <div class="matches-wrap">
              ${r32R.map(id => this.renderMatch(km, id, ROUND_COLORS.r32, true))}
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="card-footer">
        <div class="footer-podium">
          <div class="podium-item">
            <span class="podium-medal">🥇</span>
            <div>
              <span class="podium-label">${t('card.championLabel')}</span>
              <span class="podium-name ${!champion ? 'tbd' : ''}">
                ${champion ? html`${renderFlag(champion, { imgClass: 'footer-flag-img', flagClass: 'team-flag' })} ${champion.name.toUpperCase()}` : '???'}
              </span>
            </div>
          </div>
          <div class="podium-item">
            <span class="podium-medal">🥈</span>
            <div>
              <span class="podium-label">${t('card.runnerUp')}</span>
              <span class="podium-name ${!runnerUp ? 'tbd' : ''}">
                ${runnerUp ? html`${renderFlag(runnerUp, { imgClass: 'footer-flag-img', flagClass: 'team-flag' })} ${runnerUp.name.toUpperCase()}` : '???'}
              </span>
            </div>
          </div>
          <div class="podium-item">
            <span class="podium-medal">🥉</span>
            <div>
              <span class="podium-label">${t('card.thirdLabel')}</span>
              <span class="podium-name ${!third ? 'tbd' : ''}">
                ${third ? html`${renderFlag(third, { imgClass: 'footer-flag-img', flagClass: 'team-flag' })} ${third.name.toUpperCase()}` : '???'}
              </span>
            </div>
          </div>
          ${myTopScorerPrediction
            ? html`
              <div class="podium-item">
                <span class="podium-medal">⚽</span>
                <div>
                  <span class="podium-label">${t('knockout.topScorerLabel')}</span>
                  <span class="podium-name">
                    ${tsTeam ? html`${renderFlag(tsTeam, { imgClass: 'footer-flag-img', flagClass: 'team-flag' })} ` : ''}${myTopScorerPrediction.playerName.toUpperCase()}
                  </span>
                </div>
              </div>`
            : ''}
          ${myMvpPrediction
            ? html`
              <div class="podium-item">
                <span class="podium-medal">🌟</span>
                <div>
                  <span class="podium-label">${t('knockout.mvpLabel')}</span>
                  <span class="podium-name">
                    ${mvpTeam ? html`${renderFlag(mvpTeam, { imgClass: 'footer-flag-img', flagClass: 'team-flag' })} ` : ''}${myMvpPrediction.playerName.toUpperCase()}
                  </span>
                </div>
              </div>`
            : ''}
        </div>
        <div class="footer-watermark">#CHAMPIONSLEAGUE · #UCL · #BRACKETNIGHTS</div>
      </div>
    `;
  }
}

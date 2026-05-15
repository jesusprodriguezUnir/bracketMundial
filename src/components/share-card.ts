import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';
import type { KnockoutMatchResult } from '../store/tournament-store';
import { t, useLocaleStore } from '../i18n';

const ROUND_COLORS: Record<string, string> = {
  r32:   '#22418c',
  r16:   '#e8541f',
  qf:    '#1f6b3a',
  sf:    '#c41e2c',
  final: '#1a1933',
};

@customElement('share-card')
export class ShareCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 1200px;
      height: 675px;
      overflow: hidden;
      background: #ecdfc0;
      font-family: 'Bowlby One', 'Anton', Impact, sans-serif;
      color: #1a1933;
      position: relative;
    }

    /* ---- HEADER ---- */
    .card-header {
      height: 76px;
      background: #1a1933;
      display: flex;
      align-items: center;
      padding: 0 28px;
      border-bottom: 4px solid #1a1933;
      gap: 0;
    }
    .hd-wordmark {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .hd-title {
      font-family: 'Bowlby One', Impact, sans-serif;
      font-size: 22px;
      letter-spacing: 0.05em;
      color: #ecdfc0;
    }
    .hd-sub {
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      color: #f0b021;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .hd-divider {
      width: 3px;
      height: 40px;
      background: #e8541f;
      margin: 0 20px;
    }
    .hd-hosts {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #ecdfc0;
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
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      color: #f0b021;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .hd-champion-name {
      font-family: 'Bowlby One', Impact, sans-serif;
      font-size: 20px;
      color: #f0b021;
      letter-spacing: 0.04em;
    }
    .hd-flag-img {
      width: 28px;
      height: 18px;
      object-fit: cover;
      border: 2px solid #f0b021;
    }
    .hd-prediction-badge {
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      color: #f0b021;
      letter-spacing: 0.15em;
      border: 1px solid #f0b021;
      padding: 3px 8px;
    }

    /* ---- BRACKET AREA ---- */
    .card-body {
      height: 531px;
      display: flex;
      align-items: stretch;
      overflow: hidden;
      background: #ecdfc0;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(232,84,31,0.04) 0, transparent 30%),
        radial-gradient(circle at 80% 70%, rgba(34,65,140,0.04) 0, transparent 30%),
        radial-gradient(circle, rgba(26,25,51,0.08) 1px, transparent 1.2px) 0 0 / 5px 5px;
    }
    .bracket-wrap {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 22px;
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
    }
    .round-title {
      padding: 4px 7px;
      font-family: 'Bowlby One', Impact, sans-serif;
      font-size: 9px;
      letter-spacing: 0.08em;
      border: 2px solid #1a1933;
      box-shadow: 2px 2px 0 0 #1a1933;
      color: #ecdfc0;
      background-image: radial-gradient(circle, rgba(26,25,51,0.13) 1.5px, transparent 1.6px) 0 0 / 6px 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
    }
    .round-title.is-final {
      color: #f0b021;
    }
    .round-count {
      font-family: 'Space Mono', monospace;
      font-size: 7px;
      opacity: 0.75;
      flex-shrink: 0;
    }

    /* ---- MATCH BOX ---- */
    .match-box {
      background: #e6d6b1;
      border: 2px solid #1a1933;
      box-shadow: 2px 2px 0 0 #1a1933;
      overflow: hidden;
      flex-shrink: 0;
    }
    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      min-height: 22px;
    }
    .team-row.winner-row { color: #ecdfc0; }
    .team-row.loser-row { opacity: 0.45; }
    .team-separator {
      height: 1px;
      background: #1a1933;
      margin: 0 6px;
    }
    .team-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-family: 'Archivo', sans-serif;
      font-size: 8px;
      font-weight: 700;
      overflow: hidden;
    }
    .flag-img {
      width: 13px;
      height: 8px;
      object-fit: cover;
      border: 1px solid #1a1933;
      flex-shrink: 0;
    }
    .team-flag { font-size: 9px; flex-shrink: 0; }
    .team-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .score {
      font-family: 'Bowlby One', Impact, sans-serif;
      font-size: 10px;
      flex-shrink: 0;
    }
    .score.pending { color: #7a6f54; opacity: 0.4; font-size: 8px; }
    .penalty-note {
      padding: 1px 6px;
      border-top: 1px solid #1a1933;
      background: rgba(0,0,0,0.05);
      font-family: 'Space Mono', monospace;
      font-size: 6px;
      color: #7a6f54;
    }

    /* ---- CHAMPION BOX ---- */
    .champion-box {
      background: #f0b021;
      border: 3px solid #1a1933;
      box-shadow: 3px 3px 0 0 #1a1933;
      padding: 10px 8px;
      text-align: center;
      flex-shrink: 0;
    }
    .champion-title {
      font-family: 'Space Mono', monospace;
      font-size: 7px;
      color: #1a1933;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .champion-team {
      font-family: 'Bowlby One', Impact, sans-serif;
      font-size: 13px;
      color: #1a1933;
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
      border: 2px solid #1a1933;
    }
    .third-place-label {
      font-family: 'Space Mono', monospace;
      font-size: 7px;
      color: #7a6f54;
      letter-spacing: 0.18em;
      text-align: center;
      margin-top: 8px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    /* ---- FOOTER ---- */
    .card-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 68px;
      background: #1a1933;
      border-top: 4px solid #1a1933;
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
      font-family: 'Space Mono', monospace;
    }
    .podium-medal {
      font-size: 16px;
    }
    .podium-label {
      font-size: 7px;
      color: #7a6f54;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      display: block;
    }
    .podium-name {
      font-family: 'Bowlby One', Impact, sans-serif;
      font-size: 12px;
      color: #ecdfc0;
      display: block;
    }
    .podium-name.tbd { color: #7a6f54; font-size: 10px; }
    .footer-flag-img {
      width: 18px;
      height: 11px;
      object-fit: cover;
      border: 1px solid #7a6f54;
    }
    .footer-watermark {
      margin-left: auto;
      font-family: 'Space Mono', monospace;
      font-size: 9px;
      color: #7a6f54;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private renderFlag(team: any, cls = 'flag-img') {
    if (!team) return html``;
    if (team.flagUrl) {
      return html`<img src="${team.flagUrl}" alt="${team.name}" class="${cls}">`;
    }
    return html`<span class="team-flag">${team.flag}</span>`;
  }

  private renderMatch(km: Record<string, KnockoutMatchResult>, matchId: string, accentColor: string) {
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
            ${this.renderFlag(team)}
            <span class="team-name">${team?.shortName ?? 'TBD'}</span>
          </div>
          <div class="score ${!isPlayed ? 'pending' : ''}">${isPlayed ? score : '—'}</div>
        </div>
      `;
    };

    return html`
      <div class="match-box">
        ${renderRow(m?.teamA ?? null, m?.scoreA ?? null)}
        <div class="team-separator"></div>
        ${renderRow(m?.teamB ?? null, m?.scoreB ?? null)}
        ${penA !== null && penB !== null ? html`<div class="penalty-note">Pen. ${penA}–${penB}</div>` : ''}
      </div>
    `;
  }

  override render() {
    const { knockoutMatches: km } = useTournamentStore.getState();

    const finMatch = km['FIN-01'];
    const tpMatch  = km['TP-01'];
    const championId  = finMatch?.winnerId ?? null;
    const runnerUpId  = championId ? (finMatch.teamA === championId ? finMatch.teamB : finMatch.teamA) : null;
    const thirdId     = tpMatch?.winnerId ?? null;

    const champion = this.getTeam(championId);
    const runnerUp = this.getTeam(runnerUpId ?? null);
    const third    = this.getTeam(thirdId);

    const r32 = ['R32-01','R32-02','R32-03','R32-04','R32-05','R32-06','R32-07','R32-08',
                 'R32-09','R32-10','R32-11','R32-12','R32-13','R32-14','R32-15','R32-16'];
    const r16 = ['R16-01','R16-02','R16-03','R16-04','R16-05','R16-06','R16-07','R16-08'];
    const qf  = ['QF-01','QF-02','QF-03','QF-04'];
    const sf  = ['SF-01','SF-02'];

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
                  ${this.renderFlag(champion, 'hd-flag-img')} ${champion.name.toUpperCase()}
                </div>
              </div>`
            : html`<div class="hd-prediction-badge">${t('card.prediction')}</div>`
          }
        </div>
      </div>

      <!-- BODY: bracket -->
      <div class="card-body">
        <div class="bracket-wrap">
          <!-- R32 -->
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.r32}">
              <span>${t('card.r32')}</span><span class="round-count">[16]</span>
            </div>
            ${r32.map(id => this.renderMatch(km, id, ROUND_COLORS.r32))}
          </div>
          <!-- R16 -->
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.r16}">
              <span>${t('card.r16')}</span><span class="round-count">[8]</span>
            </div>
            ${r16.map(id => this.renderMatch(km, id, ROUND_COLORS.r16))}
          </div>
          <!-- QF -->
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.qf}">
              <span>${t('card.qf')}</span><span class="round-count">[4]</span>
            </div>
            ${qf.map(id => this.renderMatch(km, id, ROUND_COLORS.qf))}
          </div>
          <!-- SF -->
          <div class="round-col">
            <div class="round-title" style="background-color:${ROUND_COLORS.sf}">
              <span>${t('card.sf')}</span><span class="round-count">[2]</span>
            </div>
            ${sf.map(id => this.renderMatch(km, id, ROUND_COLORS.sf))}
          </div>
          <!-- FINAL + CHAMPION + 3P -->
          <div class="round-col">
            <div class="round-title is-final" style="background-color:${ROUND_COLORS.final}">
              <span>${t('card.final')}</span><span class="round-count">[1]</span>
            </div>
            ${this.renderMatch(km, 'FIN-01', ROUND_COLORS.final)}

            <div class="champion-box">
              <div class="champion-title">${t('card.champion')}</div>
              ${champion
                ? html`<div class="champion-team">${this.renderFlag(champion, 'flag-img-champion')} ${champion.name.toUpperCase()}</div>`
                : html`<div class="champion-team tbd">${t('card.tbd')}</div>`}
            </div>

            <div class="third-place-label">${t('card.thirdPlace')}</div>
            ${this.renderMatch(km, 'TP-01', ROUND_COLORS.sf)}
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
                ${champion ? html`${this.renderFlag(champion, 'footer-flag-img')} ${champion.name.toUpperCase()}` : '???'}
              </span>
            </div>
          </div>
          <div class="podium-item">
            <span class="podium-medal">🥈</span>
            <div>
              <span class="podium-label">${t('card.runnerUp')}</span>
              <span class="podium-name ${!runnerUp ? 'tbd' : ''}">
                ${runnerUp ? html`${this.renderFlag(runnerUp, 'footer-flag-img')} ${runnerUp.name.toUpperCase()}` : '???'}
              </span>
            </div>
          </div>
          <div class="podium-item">
            <span class="podium-medal">🥉</span>
            <div>
              <span class="podium-label">${t('card.thirdLabel')}</span>
              <span class="podium-name ${!third ? 'tbd' : ''}">
                ${third ? html`${this.renderFlag(third, 'footer-flag-img')} ${third.name.toUpperCase()}` : '???'}
              </span>
            </div>
          </div>
        </div>
        <div class="footer-watermark">#MUNDIAL2026 · #FIFAWORLDCUP</div>
      </div>
    `;
  }
}

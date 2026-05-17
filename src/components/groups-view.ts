import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getAllOdds, type MatchOdds } from '../lib/odds-service';
import { useTournamentStore, type GroupMatchResult } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { TEAMS_2026 } from '../data/fifa-2026';
import { STADIUMS } from '../data/stadiums';
import { formatShortDate, isMatchPending } from '../lib/date-utils';
import { t, useLocaleStore } from '../i18n';

function formatDate(iso?: string): string {
  return iso ? formatShortDate(iso) : '';
}

// Colores de cabecera de grupo — rotan entre los 4 retro
const GROUP_COLORS = [
  'var(--retro-orange)',
  'var(--retro-blue)',
  'var(--retro-green)',
  'var(--retro-red)',
];

@customElement('groups-view')
export class GroupsView extends LitElement {
  private unsubscribeStore?: () => void;
  private _oddsLoaded = false;

  @state() private _odds: Record<string, MatchOdds> = {};

  static styles = css`
    :host { display: block; }

    /* Acciones de grupo */
    .group-actions {
      display: flex;
      gap: 10px;
      padding: 0 0 22px;
      margin-bottom: 22px;
      border-bottom: 3px dashed var(--ink);
    }

    /* Grid de grupos */
    .groups-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 18px;
    }

    /* Card Panini sticker */
    .group-card {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Cabecera con color + halftone */
    .group-header {
      padding: 8px 12px;
      border-bottom: 3px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
      /* color e imagen vienen como style inline */
      color: var(--paper);
      background-image: var(--halftone);
    }
    .group-header-title {
      font-family: var(--font-var);
      font-size: 20px;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .group-header-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--paper);
      color: var(--ink);
      padding: 2px 6px;
      letter-spacing: 0.1em;
    }

    /* Tabla de clasificación */
    .standings {
      padding: 8px 10px;
    }
    .standing-row {
      display: grid;
      grid-template-columns: 20px 1fr auto auto;
      gap: 8px;
      align-items: center;
      padding: 4px 0;
    }
    .standing-row + .standing-row {
      border-top: 1px dotted rgba(26,25,51,0.2);
    }
    .standing-row.muted {
      opacity: 0.6;
    }

    .rank-badge {
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 12px;
      color: var(--dim);
    }
    .rank-badge.qualify {
      border: 2px solid var(--retro-red);
      color: var(--retro-red);
      font-size: 11px;
    }

    .team-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 15px; flex-shrink: 0; }
    .flag-img {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .team-short {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pos-badge {
      font-family: var(--font-mono);
      font-size: 8px;
      background: var(--retro-yellow);
      color: var(--ink);
      padding: 1px 4px;
      border: 1px solid var(--ink);
      letter-spacing: 0.1em;
      margin-left: auto;
      flex-shrink: 0;
    }

    .wdl {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .pts {
      font-family: var(--font-var);
      font-size: 18px;
      line-height: 1;
      color: var(--ink);
      min-width: 18px;
      text-align: right;
    }
    .pts.muted { color: var(--dim); }

    /* Lista de partidos */
    .matches-list {
      padding: 8px;
      background: rgba(26,25,51,0.04);
      border-top: 2px solid var(--ink);
    }

    .match-item {
      padding: 6px 8px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      cursor: pointer;
      background: var(--paper-3);
      margin-bottom: 6px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .match-item:last-child { margin-bottom: 0; }
    @media (hover: hover) {
      .match-item:hover {
        transform: translate(-1px, -1px);
        box-shadow: 3px 3px 0 0 var(--ink);
      }
    }
    .match-item:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }

    .match-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .match-teams {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-body);
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      flex: 1;
      overflow: hidden;
    }
    .match-teams .vs {
      color: var(--dim);
      font-weight: 400;
    }
    .match-score {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--paper);
      background: var(--retro-blue);
      border: 2px solid var(--ink);
      padding: 2px 8px;
      min-width: 44px;
      text-align: center;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .match-score.pending {
      background: var(--paper-2);
      color: var(--dim);
      font-size: 11px;
    }

    .match-meta {
      margin-top: 4px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
      letter-spacing: 0.05em;
    }
    .jornada {
      color: var(--retro-red);
      font-weight: 700;
    }

    .badge {
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 1px 5px;
      border: 1px solid var(--ink);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .badge-played {
      background: var(--retro-yellow);
      color: var(--ink);
    }
    .badge-upcoming {
      background: var(--paper-2);
      color: var(--dim);
    }

    /* Tabla de mejores terceros */
    .thirds-section {
      margin-top: 32px;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      overflow: hidden;
    }
    .thirds-header {
      background: var(--retro-red);
      background-image: var(--halftone);
      color: var(--paper);
      padding: 8px 14px;
      border-bottom: 3px solid var(--ink);
      font-family: var(--font-var);
      font-size: 18px;
      letter-spacing: 0.02em;
    }
    .thirds-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .thirds-table th {
      text-align: left;
      padding: 6px 12px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      font-weight: 400;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border-bottom: 2px solid var(--ink);
      background: var(--paper);
    }
    .thirds-table td {
      padding: 6px 12px;
      border-bottom: 1px dotted rgba(26,25,51,0.2);
    }
    .thirds-table tr:last-child td { border-bottom: none; }
    .col-rank {
      width: 28px;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--retro-red);
      text-align: center;
    }
    .col-pts-val {
      font-family: var(--font-var);
      font-size: 16px;
      width: 30px;
      text-align: center;
    }
    .col-stat {
      width: 28px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
    }
    .qualify-check { color: var(--retro-green); font-weight: 700; }

    /* Editor de marcador inline */
    .inline-score-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 6px 0 2px;
    }
    .inline-stepper {
      display: inline-flex;
      align-items: center;
      border: 3px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 3px 3px 0 0 var(--retro-orange);
    }
    .inline-stepper button {
      all: unset;
      cursor: pointer;
      padding: 2px 8px;
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--paper);
      background: var(--ink);
      line-height: 1.4;
    }
    .inline-stepper button:hover { background: var(--retro-red); }
    .inline-stepper button:active { opacity: 0.8; }
    .inline-val {
      font-family: var(--font-var);
      font-size: 22px;
      line-height: 1;
      padding: 2px 10px;
      min-width: 24px;
      text-align: center;
      color: var(--ink);
    }
    .inline-dash {
      font-family: var(--font-var);
      font-size: 18px;
      color: var(--dim);
    }

    /* Probabilidad 1X2 de casas de apuestas */
    .odds-bar {
      display: flex;
      height: 6px;
      border: 2px solid var(--ink);
      margin-top: 5px;
      overflow: hidden;
    }
    .odds-seg { height: 100%; }
    .odds-figs {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
    }
    .odds-figs .odds-home { color: var(--retro-blue); }
    .odds-figs .odds-away { color: var(--retro-red); }

    @media (max-width: 768px) {
      .groups-grid { grid-template-columns: 1fr; }
      .group-card { box-shadow: var(--shadow-hard-sm); }
      .inline-stepper button { padding: 2px 6px; font-size: 14px; }
      .inline-val { font-size: 18px; padding: 2px 6px; }
    }

    @media (prefers-reduced-motion: no-preference) {
      .group-card {
        animation: fadeSlideIn 0.3s ease both;
        animation-delay: calc(var(--i, 0) * 40ms);
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    }
  `;

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => ({ gm: s.groupMatches, gs: s.groupStandings }),
      () => this.requestUpdate(),
      (a, b) => a.gm === b.gm && a.gs === b.gs,
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    if (!this._oddsLoaded) {
      this._oddsLoaded = true;
      getAllOdds().then(odds => {
        if (this.isConnected) this._odds = odds;
      });
    }
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private getTeam(id: string) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private openMatch(matchId: string, date?: string, timeSpain?: string) {
    if (!isMatchPending(date ?? '', timeSpain ?? '')) return;
    this.dispatchEvent(new CustomEvent('open-match', {
      detail: { matchId },
      bubbles: true,
      composed: true
    }));
  }

  private adjustInline(e: Event, m: GroupMatchResult, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    if (!isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.scoreA ?? 0, curB = m.scoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setGroupMatchResult(m.matchId, nextA, nextB);
  }

  private handleSimulateAll() {
    useTournamentStore.getState().autoSimulateGroups();
  }

  private handleReset() {
    useTournamentStore.getState().resetTournament();
  }

  private renderFlag(team?: any) {
    if (!team) return '';
    if (team.flagUrl) {
      return html`<img src="${team.flagUrl}" alt="${team.name}" class="flag-img">`;
    }
    return html`<span class="team-flag">${team.flag}</span>`;
  }

  render() {
    const store = useTournamentStore.getState();
    const groups = 'ABCDEFGHIJKL'.split('');

    const playedTotal = store.groupMatches.filter(m => m.scoreA !== null).length;
    const showThirds = playedTotal > 0;
    const bestThirds = showThirds ? store.getBestThirds() : [];

    return html`
      <div class="group-actions">
        <button class="btn btn-primary" @click="${this.handleSimulateAll}">${t('groups.simulate')}</button>
        <button class="btn" style="color: var(--retro-red)" @click="${this.handleReset}">${t('groups.reset')}</button>
      </div>

      <div class="groups-grid">
        ${groups.map((g, gIdx) => {
          const standings = store.groupStandings[g] || [];
          const matches = store.groupMatches
            .filter(m => m.group === g)
            .sort((a, b) => {
              const da = a.date ?? '';
              const db = b.date ?? '';
              if (da !== db) return da < db ? -1 : 1;
              return (a.matchDay ?? 0) - (b.matchDay ?? 0);
            });
          const playedCount = matches.filter(m => m.scoreA !== null).length;
          const accentColor = GROUP_COLORS[gIdx % 4];

          return html`
            <div class="group-card" id="group-${g}" style="--i:${gIdx}">
              <!-- Cabecera coloreada con halftone -->
              <div class="group-header" style="background-color: ${accentColor}">
                <span class="group-header-title">${t('groups.group', { letter: g })}</span>
                <span class="group-header-badge">${t('groups.played', { n: playedCount })}</span>
              </div>

              <!-- Standings retro -->
              <div class="standings">
                ${standings.map((s, idx) => {
                  const team = this.getTeam(s.teamId);
                  const top2 = idx < 2;
                  const posLabel = idx === 0 ? '1°' : idx === 1 ? '2°' : null;
                  return html`
                    <div class="standing-row ${top2 ? '' : 'muted'}">
                      <div class="rank-badge ${top2 ? 'qualify' : ''}">${idx + 1}</div>
                      <div class="team-cell">
                        ${this.renderFlag(team)}
                        <span class="team-short">${team?.shortName ?? s.teamId}</span>
                        ${posLabel ? html`<span class="pos-badge">${posLabel}</span>` : ''}
                      </div>
                      <span class="wdl">${s.won}-${s.drawn}-${s.lost}</span>
                      <span class="pts ${top2 ? '' : 'muted'}">${s.points}</span>
                    </div>
                  `;
                })}
              </div>

              <!-- Partidos -->
              <div class="matches-list">
                ${matches.map(m => {
                  const tA = this.getTeam(m.teamA);
                  const tB = this.getTeam(m.teamB);
                  const isPlayed = m.scoreA !== null;
                  const pending = isMatchPending(m.date ?? '', m.timeSpain ?? '');
                  return html`
                    <div class="match-item" @click="${() => this.openMatch(m.matchId, m.date, m.timeSpain)}">
                      <div class="match-top">
                        <div class="match-teams">
                          ${this.renderFlag(tA)}
                          <strong>${tA?.shortName ?? m.teamA}</strong>
                          <span class="vs">vs</span>
                          ${this.renderFlag(tB)}
                          <strong>${tB?.shortName ?? m.teamB}</strong>
                        </div>
                        ${!pending ? html`
                          <div class="match-score ${!isPlayed ? 'pending' : ''}">
                            ${isPlayed ? `${m.scoreA} - ${m.scoreB}` : t('groups.edit')}
                          </div>
                        ` : ''}
                      </div>
                      ${pending ? html`
                        <div class="inline-score-row">
                          <div class="inline-stepper">
                            <button @click="${(e: Event) => this.adjustInline(e, m, 'A', -1)}" aria-label="${t('groups.decScore')}">−</button>
                            <span class="inline-val">${m.scoreA ?? 0}</span>
                            <button @click="${(e: Event) => this.adjustInline(e, m, 'A', 1)}" aria-label="${t('groups.incScore')}">+</button>
                          </div>
                          <span class="inline-dash">−</span>
                          <div class="inline-stepper">
                            <button @click="${(e: Event) => this.adjustInline(e, m, 'B', -1)}" aria-label="${t('groups.decScore')}">−</button>
                            <span class="inline-val">${m.scoreB ?? 0}</span>
                            <button @click="${(e: Event) => this.adjustInline(e, m, 'B', 1)}" aria-label="${t('groups.incScore')}">+</button>
                          </div>
                        </div>
                      ` : ''}

                      ${(() => {
                        const o = this._odds[m.matchId];
                        return o ? html`
                          <div title="${t('groups.oddsSource', { n: o.bookmakers })}">
                            <div class="odds-bar">
                              <div class="odds-seg" style="width:${o.home}%;background:var(--retro-blue)"></div>
                              <div class="odds-seg" style="width:${o.draw}%;background:var(--dim)"></div>
                              <div class="odds-seg" style="width:${o.away}%;background:var(--retro-red)"></div>
                            </div>
                            <div class="odds-figs">
                              <span class="odds-home">${o.home}%</span>
                              <span>${o.draw}%</span>
                              <span class="odds-away">${o.away}%</span>
                            </div>
                          </div>
                        ` : '';
                      })()}
                      <div class="match-meta">
                        <span class="jornada">J${m.matchDay}</span>
                        ${m.date ? html`<span>${formatDate(m.date)}</span>` : ''}
                        ${m.timeSpain ? html`<span style="color: var(--retro-yellow); font-weight: bold;">· ${m.timeSpain} ESP</span>` : ''}
                        ${m.city ? html`<span>· ${m.city}</span>` : ''}
                        ${m.venue ? html`
                          <div style="display: flex; align-items: center; gap: 4px; margin-left: auto;">
                            ${(() => {
                              const s = STADIUMS.find(st => st.name === m.venue);
                              return s ? html`<img src="${s.image}" style="width: 20px; height: 12px; object-fit: cover; border: 1px solid var(--ink);" alt="">` : '';
                            })()}
                            <span style="font-size: 8px; opacity: 0.7;">${m.venue}</span>
                          </div>
                        ` : ''}
                        <span class="badge ${isPlayed ? 'badge-played' : 'badge-upcoming'}">${isPlayed ? t('groups.badgePlayed') : t('groups.badgeNext')}</span>
                      </div>
                    </div>
                  `;
                })}
              </div>
            </div>
          `;
        })}
      </div>

      ${showThirds && bestThirds.length > 0 ? html`
        <div class="thirds-section">
          <div class="thirds-header">★ MEJORES 8 TERCEROS CLASIFICADOS</div>
          <table class="thirds-table">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th>EQUIPO</th>
                <th class="col-stat">GRP</th>
                <th class="col-stat">${t('groups.statGD')}</th>
                <th class="col-pts-val">${t('groups.statPTS')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${bestThirds.map((t, idx) => {
                const team = this.getTeam(t.id);
                return html`
                  <tr>
                    <td class="col-rank">${idx + 1}</td>
                    <td>
                      <div class="team-cell">
                        ${this.renderFlag(team)}
                        <span class="team-short">${team?.shortName ?? t.id}</span>
                      </div>
                    </td>
                    <td class="col-stat">${t.group}</td>
                    <td class="col-stat">${t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
                    <td class="col-pts-val">${t.points}</td>
                    <td>${idx < 8 ? html`<span class="qualify-check">✓</span>` : ''}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      ` : ''}
    `;
  }
}

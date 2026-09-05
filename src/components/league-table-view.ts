import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type GroupStanding } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { renderFlag } from '../lib/render-flag';
import { TEAMS_2026 } from '../data/fifa-2026';
import { COMPETITION_GROUP, rankBand } from '../data/competition';
import { t, useLocaleStore } from '../i18n';

function teamById(id: string) {
  return TEAMS_2026.find(x => x.id === id);
}

@customElement('league-table-view')
export class LeagueTableView extends LitElement {
  @state() private _standings: GroupStanding[] = [];
  private _unsub?: () => void;
  private _unsubLocale?: () => void;

  static readonly styles = css`
    :host { display: block; }
    .wrap {
      background: var(--card-grad);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }
    .head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--hairline);
      background: var(--fill);
    }
    .title {
      font-family: var(--font-var);
      font-size: 22px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: var(--ink);
    }
    .legend { display: flex; gap: 10px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-muted); }
    .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 4px; vertical-align: -1px; }
    .swatch.auto { background: var(--band-gold); }
    .swatch.playoff { background: var(--band-amber); }
    .swatch.out { background: var(--band-grey); }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 9px 6px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--ink-soft);
      border-bottom: 1px solid var(--hairline-soft);
    }
    th {
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-muted);
      background: var(--fill);
    }
    td.team { text-align: left; font-family: var(--font-body); font-weight: 700; font-size: 13px; color: var(--ink); }
    .team-cell { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .team-cell img { width: 22px; height: 22px; object-fit: contain; }
    .pos { font-family: var(--font-var); font-weight: 800; font-size: 14px; width: 36px; color: var(--ink); }
    tr.band-automatic { background: color-mix(in srgb, var(--band-gold) 16%, transparent); }
    tr.band-playoff { background: color-mix(in srgb, var(--band-amber) 12%, transparent); }
    tr.band-out { background: color-mix(in srgb, var(--band-grey) 12%, transparent); }
    tr.band-automatic td.pos { color: var(--band-gold); }
    tr.band-playoff td.pos { color: var(--band-amber); }
    .pts { font-weight: 800; color: var(--ink); }
    .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    @media (max-width: 768px) {
      .hide-md { display: none; }
      .title { font-size: 18px; }
      td.team { font-size: 12px; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    const read = () => {
      this._standings = useTournamentStore.getState().groupStandings[COMPETITION_GROUP] ?? [];
    };
    read();
    this._unsub = subscribeSlice(
      useTournamentStore,
      s => s.groupStandings,
      () => read(),
    );
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this._unsub?.();
    this._unsubLocale?.();
    super.disconnectedCallback();
  }

  render() {
    return html`
      <div class="wrap">
        <div class="head">
          <div class="title">${t('table.title')}</div>
          <div class="legend">
            <span><i class="swatch auto"></i>${t('table.bandAuto')}</span>
            <span><i class="swatch playoff"></i>${t('table.bandPlayoff')}</span>
            <span><i class="swatch out"></i>${t('table.bandOut')}</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th style="text-align:left">${t('table.club')}</th>
              <th>PJ</th>
              <th class="hide-md">G</th>
              <th class="hide-md">E</th>
              <th class="hide-md">P</th>
              <th class="hide-md">GF</th>
              <th class="hide-md">GC</th>
              <th>DG</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            ${this._standings.map((s, i) => {
              const pos = i + 1;
              const band = rankBand(pos);
              const team = teamById(s.teamId);
              return html`
                <tr class="band-${band}">
                  <td class="pos">${pos}</td>
                  <td class="team">
                    <div class="team-cell">
                      ${renderFlag(team, { size: 'sm', imgClass: 'crest' })}
                      <span class="name">${team?.name ?? s.teamId}</span>
                    </div>
                  </td>
                  <td>${s.played}</td>
                  <td class="hide-md">${s.won}</td>
                  <td class="hide-md">${s.drawn}</td>
                  <td class="hide-md">${s.lost}</td>
                  <td class="hide-md">${s.goalsFor}</td>
                  <td class="hide-md">${s.goalsAgainst}</td>
                  <td>${s.goalDiff > 0 ? '+' : ''}${s.goalDiff}</td>
                  <td class="pts">${s.points}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'league-table-view': LeagueTableView;
  }
}

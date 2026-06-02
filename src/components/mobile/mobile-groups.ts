import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type GroupMatchResult, type GroupStanding } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { calculateBestThirds, type TeamStats } from '../../lib/bracket-logic';
import { getAllOdds, type MatchOdds } from '../../lib/odds-service';
import { formatShortDate } from '../../lib/date-utils';
import { showToast } from '../../lib/interaction';
import { t } from '../../i18n';
import { mobileShared } from './mobile-shared.css';

const GROUPS = 'ABCDEFGHIJKL'.split('');
const GROUP_COLORS = ['var(--retro-orange)','var(--retro-blue)','var(--retro-green)','var(--retro-red)'];

function teamById(id: string) { return TEAMS_2026.find(t => t.id === id); }
function teamFlag(id: string) { return teamById(id)?.flag ?? '?'; }
function teamShort(id: string) { return teamById(id)?.shortName ?? id; }

/** Vista de grupos del shell móvil con steppers +/- inline (sin modal) */
@customElement('mobile-groups')
export class MobileGroups extends LitElement {
  @state() private _activeGroup = 'A';
  @state() private _standings: Record<string, GroupStanding[]> = {};
  @state() private _matches: GroupMatchResult[] = [];
  @state() private _thirds: TeamStats[] = [];
  @state() private _odds: Record<string, MatchOdds> = {};

  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._unsub = subscribeSlice(
      useTournamentStore,
      s => ({ standings: s.groupStandings, matches: s.groupMatches }),
      ({ standings, matches }) => {
        this._standings = standings;
        this._matches = matches;
        this._thirds = calculateBestThirds(
          useTournamentStore.getState().getBestThirds(),
        );
      },
    );
    const s = useTournamentStore.getState();
    this._standings = s.groupStandings;
    this._matches = s.groupMatches;
    this._thirds = calculateBestThirds(s.getBestThirds());
    void getAllOdds().then(odds => { this._odds = odds; });
  }

  disconnectedCallback() { this._unsub?.(); super.disconnectedCallback(); }

  private _bump(matchId: string, side: 0 | 1, delta: number) {
    const m = this._matches.find(m => m.matchId === matchId);
    if (!m) return;
    let a = m.scoreA ?? 0;
    let b = m.scoreB ?? 0;
    if (side === 0) a = Math.max(0, a + delta);
    else b = Math.max(0, b + delta);
    useTournamentStore.getState().setGroupMatchResult(matchId, a, b);
  }

  private _resetScore(matchId: string) {
    useTournamentStore.getState().setGroupMatchResult(matchId, null, null);
  }

  private _simulate() {
    useTournamentStore.getState().autoSimulateGroups();
    showToast('Grupos simulados 🎲');
  }

  private _reset() {
    if (confirm('¿Reiniciar todo el torneo?')) {
      useTournamentStore.getState().resetTournament();
      showToast('Torneo reiniciado');
    }
  }

  private _renderStandings(letter: string) {
    const rows = (this._standings[letter] ?? []).map((s, idx) => {
      const qualify = idx < 2;
      const team = teamById(s.teamId);
      const gd = s.goalDiff;
      return html`
        <div class="standing-row ${qualify ? '' : 'muted'}">
          <div class="rank-badge ${qualify ? 'qualify' : ''}">${idx + 1}</div>
          <div class="team-cell">
            <span class="flag-box">${team?.flag ?? '?'}</span>
            <span class="nm">${team?.name ?? s.teamId}</span>
            ${qualify ? html`<span class="pos-badge">${idx === 0 ? '1°' : '2°'}</span>` : ''}
          </div>
          <span class="gd">${gd > 0 ? '+' + gd : gd}</span>
          <span class="wdl">${s.won}-${s.drawn}-${s.lost}</span>
          <span class="pts ${qualify ? '' : 'muted'}">${s.points}</span>
        </div>`;
    });
    return html`<div class="standings">${rows}</div>`;
  }

  private _renderMatches(letter: string) {
    const matches = this._matches.filter(m => m.group === letter);
    const items = matches.map(m => {
      const played = m.scoreA !== null && m.scoreB !== null;
      const sa = m.scoreA;
      const sb = m.scoreB;
      const winA = played && sa! > sb!;
      const winB = played && sb! > sa!;
      const odds = this._odds[m.matchId];
      const dateStr = m.date ? formatShortDate(m.date) : '';
      const shortA = teamShort(m.teamA);
      const shortB = teamShort(m.teamB);

      return html`
        <div class="match-item ${played ? 'is-played' : ''}">
          <div class="match-meta">
            <span class="jornada">J${m.matchDay}</span>
            ${dateStr ? html`<span>${dateStr}</span>` : ''}
            ${m.timeSpain ? html`<span class="match-time">· ${m.timeSpain}</span>` : ''}
            <span class="badge ${played ? 'badge-played' : 'badge-upcoming'}">${played ? 'Jugado' : 'Próx.'}</span>
            ${played ? html`<button class="meta-clear" @click="${(e: Event) => { e.stopPropagation(); this._resetScore(m.matchId); }}" aria-label="Borrar resultado">✕</button>` : ''}
          </div>
          <div class="score-editor">
            <div class="se-team ${winA ? 'win' : ''}">
              <span class="se-id"><span class="flag-box">${teamFlag(m.teamA)}</span><strong>${shortA}</strong></span>
              <div class="stepper">
                <button class="step minus" @click="${() => this._bump(m.matchId, 0, -1)}" aria-label="Menos">−</button>
                <span class="step-val ${played ? '' : 'pending'}">${played ? sa : '–'}</span>
                <button class="step plus" @click="${() => this._bump(m.matchId, 0, 1)}" aria-label="Más">+</button>
              </div>
            </div>
            <div class="se-sep">–</div>
            <div class="se-team ${winB ? 'win' : ''}">
              <span class="se-id"><span class="flag-box">${teamFlag(m.teamB)}</span><strong>${shortB}</strong></span>
              <div class="stepper">
                <button class="step minus" @click="${() => this._bump(m.matchId, 1, -1)}" aria-label="Menos">−</button>
                <span class="step-val ${played ? '' : 'pending'}">${played ? sb : '–'}</span>
                <button class="step plus" @click="${() => this._bump(m.matchId, 1, 1)}" aria-label="Más">+</button>
              </div>
            </div>
          </div>
          ${odds ? html`
            <div class="odds-row">
              <span class="odds-seg" style="width:${odds.home}%;background:var(--retro-blue)" title="1 – ${m.teamA}: ${odds.home}%">${odds.home}%</span>
              <span class="odds-seg" style="width:${odds.draw}%;background:var(--dim)" title="X – Empate: ${odds.draw}%">${odds.draw}%</span>
              <span class="odds-seg" style="width:${odds.away}%;background:var(--retro-red)" title="2 – ${m.teamB}: ${odds.away}%">${odds.away}%</span>
            </div>
          ` : ''}
        </div>`;
    });
    const playedCount = matches.filter(m => m.scoreA !== null).length;
    return html`
      <div class="matches-header">PARTIDOS · ${playedCount}/6 JUGADOS</div>
      <div class="matches-list">${items}</div>`;
  }

  private _renderThirds() {
    if (!this._thirds.length) return html``;
    const rows = this._thirds.map((t, i) => {
      const team = teamById(t.id);
      return html`
        <div class="thirds-row">
          <span class="t-rank">${i + 1}</span>
          <div class="team-cell">
            <span class="flag-box">${team?.flag ?? '?'}</span>
            <span class="nm">${team?.name ?? t.id}</span>
          </div>
          <span class="t-stat">${t.group}</span>
          <span class="t-stat">${t.goalDifference > 0 ? '+' : ''}${t.goalDifference}</span>
          <span class="t-pts">${t.points}</span>
          ${i < 8 ? html`<span class="qualify-check">✓</span>` : html`<span></span>`}
        </div>`;
    });
    return html`
      <div class="thirds">
        <div class="thirds-header">★ MEJORES 8 TERCEROS</div>
        <div class="thirds-row head">
          <span>#</span><span>EQUIPO</span>
          <span class="t-stat">GRP</span><span class="t-stat">DIF</span>
          <span style="text-align:center">PTS</span><span></span>
        </div>
        ${rows}
      </div>`;
  }

  static readonly styles = [
    mobileShared,
    css`
      :host { display: block; }

      /* ── Toolbar ── */
      .toolbar {
        display: flex;
        gap: 9px;
        padding: 0 16px 16px;
      }
      .toolbar .btn { flex: 1; }

      /* ── Chips ── */
      .group-chips {
        display: flex;
        gap: 7px;
        padding: 0 16px 14px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .group-chips::-webkit-scrollbar { display: none; }
      .gchip {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        width: 38px; height: 38px;
        display: grid; place-items: center;
        font-family: var(--font-var);
        font-size: 17px;
        color: var(--ink);
        border: 2.5px solid var(--ink);
        background: var(--paper-3);
        box-shadow: var(--shadow-hard-sm);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .gchip.active { background: var(--retro-orange); color: var(--paper); }

      /* ── Group card ── */
      .group-card {
        margin: 0 16px 16px;
        background: var(--paper-2);
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-lg);
        overflow: hidden;
      }
      .group-header {
        padding: 9px 14px;
        border-bottom: 3px solid var(--ink);
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--paper);
        background-image: radial-gradient(circle, rgba(236,223,192,0.13) 1.5px, transparent 1.6px) 0 0 / 6px 6px;
      }
      .group-header-title { font-family: var(--font-var); font-size: 22px; line-height: 1; }
      .group-header-badge {
        font-family: var(--font-mono);
        font-size: 9px;
        background: var(--paper);
        color: var(--ink);
        padding: 3px 7px;
        letter-spacing: 0.1em;
      }

      /* ── Standings (con columna GD) ── */
      .standings { padding: 6px 10px; }
      .standing-row {
        display: grid;
        grid-template-columns: 22px 1fr auto auto auto;
        gap: 9px;
        align-items: center;
        padding: 7px 0;
        min-height: 40px;
      }
      .standing-row + .standing-row { border-top: 1px dotted rgba(26,25,51,0.22); }
      .standing-row.muted { opacity: 0.55; }
      .rank-badge {
        width: 20px; height: 20px;
        display: grid; place-items: center;
        font-family: var(--font-var); font-size: 12px; color: var(--dim);
      }
      .rank-badge.qualify { border: 2px solid var(--retro-red); color: var(--retro-red); font-size: 11px; }
      .pos-badge {
        font-family: var(--font-mono); font-size: 8px;
        background: var(--retro-yellow); color: var(--ink);
        padding: 1px 4px; border: 1px solid var(--ink); margin-left: auto;
        white-space: nowrap;
      }
      .gd { font-family: var(--font-mono); font-size: 10px; color: var(--dim); white-space: nowrap; min-width: 22px; text-align: right; }
      .wdl { font-family: var(--font-mono); font-size: 11px; color: var(--dim); white-space: nowrap; }
      .pts { font-family: var(--font-var); font-size: 19px; color: var(--ink); min-width: 20px; text-align: right; }
      .pts.muted { color: var(--dim); }

      /* ── Matches list ── */
      .matches-header {
        font-family: var(--font-mono); font-size: 9px; color: var(--dim);
        letter-spacing: 0.12em; padding: 8px 10px 4px;
        border-top: 2px solid var(--ink);
        background: rgba(26,25,51,0.04);
      }
      .matches-list {
        padding: 10px;
        background: rgba(26,25,51,0.05);
        display: grid; gap: 8px;
      }
      .match-item {
        padding: 10px 11px;
        border: 2px solid var(--ink);
        box-shadow: var(--shadow-hard-sm);
        background: var(--paper-3);
      }
      .match-item.is-played { background: var(--paper); }

      /* ── Match meta ── */
      .match-meta {
        font-family: var(--font-mono); font-size: 9.5px;
        color: var(--dim); display: flex; gap: 7px;
        flex-wrap: wrap; align-items: center;
      }
      .match-meta .jornada { color: var(--retro-red); font-weight: 700; }
      .match-time { color: var(--retro-yellow); font-weight: 700; }
      .badge { font-family: var(--font-mono); font-size: 8px; padding: 1px 5px; border: 1px solid var(--ink); text-transform: uppercase; letter-spacing: 0.06em; }
      .badge-played { background: var(--retro-yellow); color: var(--ink); }
      .badge-upcoming { background: var(--paper-2); color: var(--dim); }
      .meta-clear {
        margin-left: auto; width: 22px; height: 22px; flex-shrink: 0;
        border: 1.5px solid var(--ink); background: var(--paper-2); color: var(--ink);
        font-family: var(--font-mono); font-size: 10px; line-height: 1; cursor: pointer;
        display: grid; place-items: center;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .meta-clear:active { background: var(--ink); color: var(--paper); }

      /* ── Score editor con steppers ── */
      .score-editor {
        display: grid; grid-template-columns: 1fr auto 1fr;
        align-items: start; gap: 8px; margin-top: 9px;
      }
      .se-team { display: flex; flex-direction: column; align-items: center; gap: 8px; }
      .se-id {
        display: flex; align-items: center; gap: 6px;
        font-family: var(--font-body); font-weight: 800; font-size: 13px;
      }
      .se-team.win .se-id { color: var(--retro-blue); }
      .se-sep {
        align-self: center; font-family: var(--font-var);
        font-size: 20px; color: var(--dim); padding-top: 22px;
      }

      /* ── Stepper (compartido grupos y bracket) ── */
      .stepper {
        display: flex; align-items: center;
        border: 2px solid var(--ink);
        background: var(--paper);
        box-shadow: 2px 2px 0 0 var(--ink);
      }
      .step {
        width: 40px; height: 40px; border: none; background: var(--paper);
        font-family: var(--font-var); font-size: 22px; line-height: 1; color: var(--ink);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .step.minus { border-right: 2px solid var(--ink); }
      .step.plus  { border-left: 2px solid var(--ink); }
      .step:active { background: var(--ink); color: var(--paper); }
      .step-val {
        min-width: 38px; text-align: center;
        font-family: var(--font-var); font-size: 22px; font-weight: 700; color: var(--ink);
      }
      .step-val.pending { color: var(--dim); opacity: 0.55; }

      /* ── Odds bar ── */
      .odds-row {
        display: flex; margin-top: 8px; overflow: hidden;
        border: 1px solid var(--ink); height: 14px;
      }
      .odds-seg {
        font-family: var(--font-mono); font-size: 7px; color: var(--paper);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; letter-spacing: 0.04em; flex-shrink: 0;
      }

      /* ── Thirds ── */
      .thirds {
        margin: 22px 16px 16px;
        background: var(--paper-2);
        border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-lg);
        overflow: hidden;
      }
      .thirds-header {
        background: var(--retro-red);
        background-image: radial-gradient(circle, rgba(236,223,192,0.13) 1.5px, transparent 1.6px) 0 0 / 6px 6px;
        color: var(--paper);
        padding: 9px 14px;
        border-bottom: 3px solid var(--ink);
        font-family: var(--font-var); font-size: 16px;
      }
      .thirds-row {
        display: grid;
        grid-template-columns: 24px 1fr 34px 34px 30px 20px;
        gap: 6px; align-items: center;
        padding: 8px 12px; font-size: 12px;
      }
      .thirds-row + .thirds-row { border-top: 1px dotted rgba(26,25,51,0.22); }
      .thirds-row.head {
        background: var(--paper);
        font-family: var(--font-mono); font-size: 8px; color: var(--dim);
        letter-spacing: 0.1em; text-transform: uppercase;
        border-bottom: 2px solid var(--ink);
      }
      .t-rank { font-family: var(--font-var); color: var(--retro-red); text-align: center; }
      .t-stat { text-align: center; font-family: var(--font-mono); color: var(--dim); }
      .t-pts { text-align: center; font-family: var(--font-var); font-size: 15px; }
      .qualify-check { color: var(--retro-green); font-weight: 700; text-align: center; }
    `,
  ];

  render() {
    const letter = this._activeGroup;
    const colorIdx = GROUPS.indexOf(letter);
    const color = GROUP_COLORS[colorIdx % 4];
    const matches = this._matches.filter(m => m.group === letter);
    const playedCount = matches.filter(m => m.scoreA !== null).length;

    return html`
      <!-- Toolbar -->
      <div class="toolbar">
        <button class="btn btn-primary" @click="${this._simulate}">
          <span class="btn-icon">🎲</span> ${t('groups.simulate')}
        </button>
        <button class="btn" style="color:var(--retro-red)" @click="${this._reset}">
          ${t('groups.reset')}
        </button>
      </div>

      <!-- Chips de grupo -->
      <div class="group-chips">
        ${GROUPS.map(l => html`
          <button
            class="gchip ${l === letter ? 'active' : ''}"
            @click="${() => { this._activeGroup = l; }}"
          >${l}</button>
        `)}
      </div>

      <!-- Tarjeta del grupo -->
      <div class="group-card">
        <div class="group-header" style="background-color:${color}">
          <span class="group-header-title">GRUPO ${letter}</span>
          <span class="group-header-badge">${playedCount}/6 JUGADOS</span>
        </div>
        ${this._renderStandings(letter)}
        ${this._renderMatches(letter)}
      </div>

      <!-- Mejores terceros -->
      ${this._renderThirds()}
    `;
  }
}

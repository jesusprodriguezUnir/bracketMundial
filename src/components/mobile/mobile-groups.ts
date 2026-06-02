import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type GroupMatchResult, type GroupStanding } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { STADIUMS } from '../../data/stadiums';
import { calculateBestThirds, type TeamStats } from '../../lib/bracket-logic';
import { getAllOdds, type MatchOdds } from '../../lib/odds-service';
import { openMatchModal } from '../../lib/match-modal-service';
import { formatShortDate } from '../../lib/date-utils';
import { showToast } from '../../lib/interaction';
import { t } from '../../i18n';
import { mobileShared } from './mobile-shared.css';



const GROUPS = 'ABCDEFGHIJKL'.split('');
const GROUP_COLORS = ['var(--retro-orange)','var(--retro-blue)','var(--retro-green)','var(--retro-red)'];

function teamById(id: string) { return TEAMS_2026.find(t => t.id === id); }
function teamFlag(id: string) { return teamById(id)?.flag ?? '?'; }

/** Vista de grupos del shell móvil — calca el diseño de Bracket Móvil.html */
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
    // Cargar odds (async, no bloqueante)
    void getAllOdds().then(odds => { this._odds = odds; });
  }

  disconnectedCallback() { this._unsub?.(); super.disconnectedCallback(); }

  private _openMatch(m: GroupMatchResult) {
    const stadium = STADIUMS.find(st => st.name === m.venue);
    openMatchModal({
      matchId: m.matchId,
      teamA: m.teamA,
      teamB: m.teamB,
      initialScoreA: m.scoreA,
      initialScoreB: m.scoreB,
      phase: 'group',
      goalScorers: m.goalScorers,
      venue: m.venue ?? '',
      city: m.city ?? '',
      timeSpain: m.timeSpain ?? '',
      stadiumImage: stadium?.image,
      onSave: ({ scoreA, scoreB }) => {
        useTournamentStore.getState().setGroupMatchResult(m.matchId, scoreA, scoreB);
      },
    });
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
      const t = teamById(s.teamId);
      return html`
        <div class="standing-row ${qualify ? '' : 'muted'}">
          <div class="rank-badge ${qualify ? 'qualify' : ''}">${idx + 1}</div>
          <div class="team-cell">
            <span class="flag-box">${t?.flag ?? '?'}</span>
            <span class="nm">${t?.name ?? s.teamId}</span>
            ${qualify ? html`<span class="pos-badge">${idx === 0 ? '1°' : '2°'}</span>` : ''}
          </div>
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
      const odds = this._odds[m.matchId];
      const dateStr = m.date ? formatShortDate(m.date) : '';
      return html`
        <div class="match-item" @click="${() => this._openMatch(m)}">
          <div class="match-top">
            <div class="match-teams">
              <span class="flag-box">${teamFlag(m.teamA)}</span>
              <strong>${m.teamA}</strong>
              <span class="vs">vs</span>
              <span class="flag-box">${teamFlag(m.teamB)}</span>
              <strong>${m.teamB}</strong>
            </div>
            <div class="match-score ${played ? '' : 'pending'}">
              ${played ? `${m.scoreA} - ${m.scoreB}` : 'EDITAR'}
            </div>
          </div>
          <div class="match-meta">
            <span class="jornada">J${m.matchDay}</span>
            ${dateStr ? html`<span>${dateStr}</span>` : ''}
            ${m.timeSpain ? html`<span style="color:var(--retro-yellow);font-weight:700">· ${m.timeSpain}</span>` : ''}
            <span class="badge ${played ? 'badge-played' : 'badge-upcoming'}">${played ? 'Jugado' : 'Próx.'}</span>
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

      /* ── Standings ── */
      .standings { padding: 6px 10px; }
      .standing-row {
        display: grid;
        grid-template-columns: 22px 1fr auto auto;
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
      .wdl { font-family: var(--font-mono); font-size: 11px; color: var(--dim); white-space: nowrap; }
      .pts { font-family: var(--font-var); font-size: 19px; color: var(--ink); min-width: 20px; text-align: right; }
      .pts.muted { color: var(--dim); }

      /* ── Matches ── */
      .matches-header {
        font-family: var(--font-mono); font-size: 9px; color: var(--dim);
        letter-spacing: 0.12em; padding: 8px 10px 4px;
        border-top: 2px solid var(--ink);
        background: rgba(26,25,51,0.04);
      }
      .matches-list {
        padding: 10px;
        background: rgba(26,25,51,0.04);
        display: grid; gap: 8px;
      }
      .match-item {
        padding: 9px 10px;
        border: 2px solid var(--ink);
        box-shadow: var(--shadow-hard-sm);
        background: var(--paper-3);
        cursor: pointer;
        transition: transform 0.08s, box-shadow 0.08s;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .match-item:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 0 var(--ink); }
      .match-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .match-teams {
        display: flex; align-items: center; gap: 6px;
        font-family: var(--font-body); font-size: 13px; font-weight: 800;
        flex: 1; overflow: hidden;
      }
      .match-teams .vs { color: var(--dim); font-weight: 400; font-size: 11px; }
      .match-score {
        font-family: var(--font-var); font-size: 15px; color: var(--paper);
        background: var(--retro-blue); border: 2px solid var(--ink);
        padding: 3px 9px; min-width: 46px; text-align: center; flex-shrink: 0;
      }
      .match-score.pending { background: var(--paper-2); color: var(--dim); font-size: 11px; }
      .match-meta {
        margin-top: 6px; font-family: var(--font-mono); font-size: 9.5px;
        color: var(--dim); display: flex; gap: 7px; flex-wrap: wrap; align-items: center;
      }
      .match-meta .jornada { color: var(--retro-red); font-weight: 700; }
      .badge { font-family: var(--font-mono); font-size: 8px; padding: 1px 5px; border: 1px solid var(--ink); text-transform: uppercase; letter-spacing: 0.06em; }
      .badge-played { background: var(--retro-yellow); color: var(--ink); }
      .badge-upcoming { background: var(--paper-2); color: var(--dim); }

      /* ── Odds ── */
      .odds-row {
        display: flex; margin-top: 7px; overflow: hidden;
        border: 1px solid var(--ink); height: 14px;
      }
      .odds-seg {
        font-family: var(--font-mono); font-size: 7px; color: var(--paper);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden; letter-spacing: 0.04em;
        flex-shrink: 0;
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

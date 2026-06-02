import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type KnockoutMatchResult, getWinnerId } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { KNOCKOUT_BRACKET } from '../../data/fifa-2026';
import { STADIUMS } from '../../data/stadiums';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { openMatchModal } from '../../lib/match-modal-service';
import { showToast } from '../../lib/interaction';
import { mobileShared } from './mobile-shared.css';

interface Round {
  id: string;
  name: string;
  short: string;
  color: string;
  accent: string;
  matchIds: string[];
}

const ROUNDS: Round[] = [
  { id: 'r32',   name: '1/16 · DIECISÉIS', short: '1/16',    color: 'c-blue',   accent: 'var(--retro-blue)',   matchIds: KNOCKOUT_BRACKET.roundOf32.map(m => m.id) },
  { id: 'r16',   name: 'OCTAVOS DE FINAL',  short: 'OCTAVOS', color: 'c-orange', accent: 'var(--retro-orange)', matchIds: KNOCKOUT_BRACKET.roundOf16.map(m => m.id) },
  { id: 'qf',    name: 'CUARTOS DE FINAL',  short: 'CUARTOS', color: 'c-green',  accent: 'var(--retro-green)',  matchIds: KNOCKOUT_BRACKET.quarterfinals.map(m => m.id) },
  { id: 'sf',    name: 'SEMIFINALES',        short: 'SEMIS',   color: 'c-red',    accent: 'var(--retro-red)',    matchIds: KNOCKOUT_BRACKET.semifinals.map(m => m.id) },
  { id: 'final', name: 'LA GRAN FINAL',      short: 'FINAL',   color: 'c-ink',    accent: 'var(--ink)',          matchIds: [KNOCKOUT_BRACKET.final.id] },
];

function teamFlag(id: string | null) {
  if (!id) return '?';
  return TEAMS_2026.find(t => t.id === id)?.flag ?? '?';
}
function teamName(id: string | null) {
  if (!id) return 'POR DEFINIR';
  return TEAMS_2026.find(t => t.id === id)?.name ?? id;
}

/** Vista de Bracket eliminatorio del shell móvil */
@customElement('mobile-bracket')
export class MobileBracket extends LitElement {
  @state() private _activeRound = 'r32';
  @state() private _knockoutMatches: Record<string, KnockoutMatchResult> = {};

  private _unsub?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._unsub = subscribeSlice(
      useTournamentStore,
      s => s.knockoutMatches,
      km => { this._knockoutMatches = km; },
    );
    this._knockoutMatches = useTournamentStore.getState().knockoutMatches;
  }

  disconnectedCallback() { this._unsub?.(); super.disconnectedCallback(); }

  private _openKnockoutMatch(m: KnockoutMatchResult) {
    const stadium = STADIUMS.find(st => st.name === m.venue);
    openMatchModal({
      matchId: m.matchId,
      teamA: m.teamA ?? 'TBD',
      teamB: m.teamB ?? 'TBD',
      initialScoreA: m.scoreA,
      initialScoreB: m.scoreB,
      initialPenaltyScoreA: m.penaltyScoreA ?? null,
      initialPenaltyScoreB: m.penaltyScoreB ?? null,
      phase: 'knockout',
      goalScorers: m.goalScorers,
      venue: m.venue ?? '',
      city: m.city ?? '',
      timeSpain: m.timeSpain ?? '',
      stadiumImage: stadium?.image,
      onSave: ({ scoreA, scoreB, penaltyScoreA, penaltyScoreB }) => {
        useTournamentStore.getState().setKnockoutMatchResult(
          m.matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB,
        );
      },
    });
  }

  private _simulate() {
    useTournamentStore.getState().autoSimulateKnockout();
    showToast('Bracket simulado 🎲');
  }

  private _generate() {
    useTournamentStore.getState().initializeKnockoutFromGroups();
    showToast('Bracket generado ⚡');
  }

  private _roundIndex() { return ROUNDS.findIndex(r => r.id === this._activeRound); }

  private _renderMatch(matchId: string, accent: string, label: string) {
    const m = this._knockoutMatches[matchId];
    if (!m) return html``;
    const played = m.isPlayed && m.scoreA !== null;
    const winner = played ? getWinnerId(m.teamA, m.teamB, m.scoreA, m.scoreB, m.penaltyScoreA ?? null, m.penaltyScoreB ?? null) : null;

    const row = (id: string | null, score: number | null) => {
      const isW = winner && winner === id;
      const isL = winner && winner !== id;
      return html`
        <div class="krow ${isW ? 'winner' : ''} ${isL ? 'loser' : ''}" style="${isW ? `background:${accent}` : ''}">
          <div class="team-info">
            <span class="flag-box">${teamFlag(id)}</span>
            <span class="nm">${teamName(id)}</span>
          </div>
          <div class="kscore ${played ? '' : 'pending'}">${played ? String(score ?? 0) : '—'}</div>
        </div>`;
    };

    const hasPens = m.penaltyScoreA !== null && m.penaltyScoreA !== undefined;

    return html`
      <div class="kmatch" @click="${() => this._openKnockoutMatch(m)}">
        <div class="kmatch-tag">
          <span>${label}</span>
          ${hasPens ? html`<span>PENALTIS</span>` : ''}
        </div>
        ${row(m.teamA, m.scoreA)}
        <div class="ksep"></div>
        ${row(m.teamB, m.scoreB)}
        ${hasPens ? html`<div class="kmatch-note">Penaltis · ${m.penaltyScoreA}-${m.penaltyScoreB}</div>` : ''}
      </div>`;
  }

  private _renderRound() {
    const idx = this._roundIndex();
    const round = ROUNDS[idx];
    const prev = idx > 0 ? ROUNDS[idx - 1] : null;
    const next = idx < ROUNDS.length - 1 ? ROUNDS[idx + 1] : null;

    const nav = html`
      <div class="round-nav">
        <button class="rn-arrow" ?disabled="${!prev}" @click="${() => prev && (this._activeRound = prev.id)}">‹</button>
        <div class="rn-center">
          <div class="rn-name">${round.name}</div>
          <div class="rn-count">${round.matchIds.length} ${round.matchIds.length === 1 ? 'PARTIDO' : 'PARTIDOS'}</div>
        </div>
        <button class="rn-arrow" ?disabled="${!next}" @click="${() => next && (this._activeRound = next.id)}">›</button>
      </div>`;

    const matches = round.matchIds.map((id, i) =>
      this._renderMatch(id, round.accent, `${round.short} ${i + 1}`),
    );

    let extra = html``;
    if (round.id === 'final') {
      const tp = this._knockoutMatches[KNOCKOUT_BRACKET.thirdPlace.id];
      if (tp) extra = html`
        ${this._renderMatch(KNOCKOUT_BRACKET.thirdPlace.id, 'var(--retro-red)', 'TERCER PUESTO')}
        ${this._renderChampion()}
      `;
    }

    return html`${nav}<div class="bracket-list">${matches}</div>${extra}`;
  }

  private _renderChampion() {
    const fin = this._knockoutMatches[KNOCKOUT_BRACKET.final.id];
    const winnerId = fin ? getWinnerId(fin.teamA, fin.teamB, fin.scoreA, fin.scoreB, fin.penaltyScoreA ?? null, fin.penaltyScoreB ?? null) : null;
    return html`
      <div class="champion-box">
        <div class="champion-title">🏆 CAMPEÓN DEL MUNDO</div>
        <div class="champion-team ${winnerId ? '' : 'tbd'}">
          ${winnerId ? html`<span class="flag-box big">${teamFlag(winnerId)}</span> ${teamName(winnerId)}` : 'POR DEFINIR'}
        </div>
      </div>`;
  }

  static readonly styles = [
    mobileShared,
    css`
      :host { display: block; }

      /* ── Acciones ── */
      .bracket-actions {
        display: flex; gap: 9px; padding: 0 16px 14px;
      }
      .bracket-actions .btn { flex: 1; }

      /* ── Banner final ── */
      .final-banner {
        margin: 0 16px 14px;
        padding: 9px 14px;
        background: var(--ink);
        color: var(--retro-yellow);
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.14em;
        text-align: center;
        border: 3px solid var(--ink);
      }

      /* ── Steps ── */
      .round-steps {
        display: flex; gap: 5px; padding: 10px 16px 14px;
        overflow-x: auto; scrollbar-width: none;
      }
      .round-steps::-webkit-scrollbar { display: none; }
      .rstep {
        all: unset; cursor: pointer; flex-shrink: 0;
        font-family: var(--font-mono); font-size: 9px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        padding: 6px 9px; border: 2px solid var(--ink);
        color: var(--ink); background: var(--paper-3);
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .rstep.active { color: var(--paper); }
      .rstep.active.c-blue   { background: var(--retro-blue); }
      .rstep.active.c-orange { background: var(--retro-orange); }
      .rstep.active.c-green  { background: var(--retro-green); }
      .rstep.active.c-red    { background: var(--retro-red); }
      .rstep.active.c-ink    { background: var(--ink); color: var(--retro-yellow); }

      /* ── Round nav ── */
      .round-nav {
        display: flex; align-items: stretch;
        margin: 0 16px 4px; border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-sm); background: var(--ink);
      }
      .rn-arrow {
        all: unset; cursor: pointer; width: 44px;
        display: grid; place-items: center;
        color: var(--paper); font-size: 20px; background: var(--ink);
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .rn-arrow:active { background: var(--retro-orange); }
      .rn-arrow[disabled] { opacity: 0.3; pointer-events: none; }
      .rn-center { flex: 1; text-align: center; padding: 8px 4px; color: var(--paper); }
      .rn-name { font-family: var(--font-var); font-size: 18px; line-height: 1; }
      .rn-count { font-family: var(--font-mono); font-size: 9px; color: var(--retro-yellow); letter-spacing: 0.15em; margin-top: 3px; }

      /* ── Matches ── */
      .bracket-list { padding: 8px 16px; display: grid; gap: 11px; }
      .kmatch {
        background: var(--paper-2); border: 2.5px solid var(--ink);
        box-shadow: var(--shadow-hard-sm); overflow: hidden; cursor: pointer;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
        transition: transform 0.08s, box-shadow 0.08s;
      }
      .kmatch:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 0 var(--ink); }
      .kmatch-tag {
        font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.14em;
        color: var(--dim); padding: 5px 12px 0; text-transform: uppercase;
        display: flex; justify-content: space-between;
      }
      .krow {
        display: flex; justify-content: space-between; align-items: center;
        padding: 11px 12px; min-height: 46px;
      }
      .krow.winner { color: var(--paper); }
      .krow.loser { opacity: 0.5; }
      .krow .team-info { display: flex; align-items: center; gap: 9px; font-family: var(--font-body); font-size: 14px; font-weight: 800; overflow: hidden; }
      .krow .team-info .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .krow .kscore { font-family: var(--font-var); font-size: 17px; flex-shrink: 0; }
      .krow .kscore.pending { color: var(--dim); opacity: 0.5; font-size: 14px; }
      .ksep { height: 2px; background: var(--ink); margin: 0 12px; }
      .kmatch-note {
        padding: 5px 12px; border-top: 1px solid var(--ink); background: rgba(0,0,0,0.05);
        font-family: var(--font-mono); font-size: 8px; color: var(--dim);
        letter-spacing: 0.08em; text-transform: uppercase;
        display: flex; align-items: center; gap: 6px;
      }

      /* ── Champion ── */
      .champion-box {
        margin: 18px 16px 16px;
        background: var(--retro-yellow);
        background-image: radial-gradient(circle, rgba(26,25,51,0.13) 1.5px, transparent 1.6px) 0 0 / 6px 6px;
        border: 4px solid var(--ink); box-shadow: var(--shadow-hard-lg);
        padding: 22px 18px; text-align: center;
      }
      .champion-title { font-family: var(--font-mono); font-size: 9px; color: var(--ink); letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 10px; }
      .champion-team { font-family: var(--font-var); font-size: 26px; color: var(--ink); line-height: 1.05; display: flex; align-items: center; justify-content: center; gap: 10px; }
      .champion-team.tbd { opacity: 0.35; font-size: 20px; }
    `,
  ];

  render() {
    return html`
      <!-- Acciones -->
      <div class="bracket-actions">
        <button class="btn btn-primary" @click="${this._generate}"><span class="btn-icon">⚡</span> GENERAR</button>
        <button class="btn" @click="${this._simulate}"><span class="btn-icon">🎲</span> SIMULAR</button>
      </div>

      <!-- Banner final -->
      <div class="final-banner">★ DOM 19 JUL · METLIFE STADIUM · NUEVA JERSEY ★</div>

      <!-- Steps de ronda -->
      <div class="round-steps">
        ${ROUNDS.map(r => html`
          <button
            class="rstep ${r.id === this._activeRound ? 'active ' + r.color : ''}"
            @click="${() => { this._activeRound = r.id; }}"
          >${r.short}</button>
        `)}
      </div>

      <!-- Contenido de la ronda -->
      ${this._renderRound()}

      <!-- Indicador de swipe para navegar -->
      <div style="text-align:center;font-family:var(--font-mono);font-size:8px;color:var(--dim);padding:18px 16px;letter-spacing:0.12em">
        TOCA LAS FLECHAS PARA CAMBIAR DE RONDA
      </div>
    `;
  }
}

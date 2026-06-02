import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type KnockoutMatchResult, getWinnerId } from '../../store/tournament-store';
import { subscribeSlice } from '../../store/store-utils';
import { KNOCKOUT_BRACKET } from '../../data/fifa-2026';
import { TEAMS_2026 } from '../../data/fifa-2026';
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
function teamShort(id: string | null) {
  if (!id) return '?';
  return TEAMS_2026.find(t => t.id === id)?.shortName ?? id;
}

/** Vista de Bracket eliminatorio con steppers +/- inline y editor de penaltis (sin modal) */
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

  private _bump(matchId: string, side: 0 | 1, delta: number) {
    const m = this._knockoutMatches[matchId];
    if (!m) return;
    let a = m.scoreA ?? 0;
    let b = m.scoreB ?? 0;
    if (side === 0) a = Math.max(0, a + delta);
    else b = Math.max(0, b + delta);
    const penA = a === b ? (m.penaltyScoreA ?? null) : null;
    const penB = a === b ? (m.penaltyScoreB ?? null) : null;
    useTournamentStore.getState().setKnockoutMatchResult(matchId, a, b, penA, penB);
  }

  private _bumpPens(matchId: string, side: 0 | 1, delta: number) {
    const m = this._knockoutMatches[matchId];
    if (!m) return;
    const penA = side === 0 ? Math.max(0, (m.penaltyScoreA ?? 0) + delta) : (m.penaltyScoreA ?? 0);
    const penB = side === 1 ? Math.max(0, (m.penaltyScoreB ?? 0) + delta) : (m.penaltyScoreB ?? 0);
    useTournamentStore.getState().setKnockoutMatchResult(matchId, m.scoreA, m.scoreB, penA, penB);
  }

  private _resetMatch(matchId: string) {
    useTournamentStore.getState().setKnockoutMatchResult(matchId, null, null, null, null);
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
    const tied = m.scoreA !== null && m.scoreB !== null && m.scoreA === m.scoreB;

    const row = (id: string | null, score: number | null, side: 0 | 1) => {
      const isW = winner !== null && winner === id;
      const isL = winner !== null && winner !== id;
      return html`
        <div class="krow ${isW ? 'winner' : ''} ${isL ? 'loser' : ''}" style="${isW ? `background:${accent}` : ''}">
          <div class="team-info">
            <span class="flag-box">${teamFlag(id)}</span>
            <span class="nm">${teamName(id)}</span>
          </div>
          <div class="kstepper stepper">
            <button class="step minus" @click="${() => this._bump(matchId, side, -1)}" aria-label="Menos">−</button>
            <span class="step-val ${m.scoreA !== null ? '' : 'pending'}">${m.scoreA !== null ? String(score ?? 0) : '–'}</span>
            <button class="step plus" @click="${() => this._bump(matchId, side, 1)}" aria-label="Más">+</button>
          </div>
        </div>`;
    };

    const penEditor = tied ? html`
      <div class="pen-editor">
        <span class="pen-lbl">PENALTIS · DESEMPATE</span>
        <div class="pen-steppers">
          <div class="stepper">
            <button class="step minus" @click="${() => this._bumpPens(matchId, 0, -1)}">−</button>
            <span class="step-val">${m.penaltyScoreA ?? 0}</span>
            <button class="step plus" @click="${() => this._bumpPens(matchId, 0, 1)}">+</button>
          </div>
          <span class="pen-mid">${teamShort(m.teamA)} · ${teamShort(m.teamB)}</span>
          <div class="stepper">
            <button class="step minus" @click="${() => this._bumpPens(matchId, 1, -1)}">−</button>
            <span class="step-val">${m.penaltyScoreB ?? 0}</span>
            <button class="step plus" @click="${() => this._bumpPens(matchId, 1, 1)}">+</button>
          </div>
        </div>
      </div>` : html``;

    return html`
      <div class="kmatch">
        <div class="kmatch-tag">
          <span>${label}</span>
          ${played ? html`<button class="meta-clear" @click="${() => this._resetMatch(matchId)}" aria-label="Borrar resultado">✕</button>` : ''}
        </div>
        ${m.venue ? html`
          <div class="kmatch-meta">
            <span>📍 ${m.venue}</span>
            ${m.timeSpain ? html`<span class="kmatch-date">· ${m.timeSpain}</span>` : ''}
          </div>` : ''}
        ${row(m.teamA, m.scoreA, 0)}
        <div class="ksep"></div>
        ${row(m.teamB, m.scoreB, 1)}
        ${penEditor}
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
          ${winnerId ? html`<span class="flag-box big">${teamFlag(winnerId)}</span> ${teamName(winnerId).toUpperCase()}` : 'POR DEFINIR'}
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

      /* ── Steps de ronda ── */
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

      /* ── Bracket list ── */
      .bracket-list { padding: 8px 16px; display: grid; gap: 11px; }

      /* ── kmatch (tarjeta de partido eliminatorio) ── */
      .kmatch {
        background: var(--paper-2); border: 2.5px solid var(--ink);
        box-shadow: var(--shadow-hard-sm); overflow: hidden;
      }
      .kmatch-tag {
        font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.14em;
        color: var(--dim); padding: 6px 12px 0; text-transform: uppercase;
        display: flex; justify-content: space-between; align-items: center;
      }
      .kmatch-meta {
        font-family: var(--font-mono); font-size: 9px; color: var(--dim);
        padding: 3px 12px 7px; display: flex; gap: 7px; flex-wrap: wrap; align-items: center;
        border-bottom: 1.5px dashed rgba(26,25,51,0.25);
      }
      .kmatch-date { color: var(--retro-yellow); font-weight: 700; }

      /* ── krow (fila de equipo) ── */
      .krow {
        display: flex; justify-content: space-between; align-items: center; gap: 10px;
        padding: 8px 12px; min-height: 52px;
      }
      .krow.winner { color: var(--paper); }
      .krow.loser { opacity: 0.5; }
      .krow .team-info { display: flex; align-items: center; gap: 9px; font-family: var(--font-body); font-size: 14px; font-weight: 800; overflow: hidden; }
      .krow .team-info .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .kstepper { flex-shrink: 0; }
      .ksep { height: 2px; background: var(--ink); margin: 0 12px; }

      /* ── Stepper (compartido) ── */
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

      /* ── Clear button ── */
      .meta-clear {
        width: 22px; height: 22px; flex-shrink: 0;
        border: 1.5px solid var(--ink); background: var(--paper-2); color: var(--ink);
        font-family: var(--font-mono); font-size: 10px; line-height: 1; cursor: pointer;
        display: grid; place-items: center;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .meta-clear:active { background: var(--ink); color: var(--paper); }

      /* ── Penalty editor ── */
      .pen-editor {
        border-top: 1.5px solid var(--ink);
        background: rgba(196,30,44,0.08);
        padding: 8px 12px 10px;
      }
      .pen-lbl {
        font-family: var(--font-mono); font-size: 8px; letter-spacing: 0.12em;
        color: var(--retro-red); font-weight: 700; text-transform: uppercase;
      }
      .pen-steppers {
        display: flex; align-items: center; justify-content: center;
        gap: 10px; margin-top: 7px;
      }
      .pen-steppers .stepper { box-shadow: 1.5px 1.5px 0 0 var(--ink); }
      .pen-steppers .step { width: 34px; height: 34px; font-size: 18px; }
      .pen-steppers .step-val { min-width: 30px; font-size: 18px; }
      .pen-mid {
        font-family: var(--font-mono); font-size: 9px;
        color: var(--dim); font-weight: 700;
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
    `;
  }
}

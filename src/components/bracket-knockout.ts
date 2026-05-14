import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';
import type { MatchModal } from './match-modal';
import './match-modal';

@customElement('bracket-knockout')
export class BracketKnockout extends LitElement {
  private unsubscribeStore?: () => void;
  @state() private _pulseId: string | null = null;

  static styles = css`
    :host { display: block; width: 100%; overflow: hidden; }
    .bracket-scroll {
      overflow-x: auto;
      padding: 40px 0;
      cursor: grab;
      user-select: none;
    }
    .bracket-scroll.is-dragging { cursor: grabbing; }
    .bracket-container {
      display: flex;
      gap: 60px;
      padding: 0 40px;
      min-width: fit-content;
      align-items: center;
      position: relative;
    }
    .round-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
      justify-content: space-around;
      min-width: 200px;
    }
    .round-title {
      font-family: var(--font-display);
      font-size: 0.7rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      text-align: center;
      margin-bottom: 20px;
    }
    .match-box {
      background: var(--navy-surface);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
    }
    .match-box:hover {
      border-color: var(--neon-lime);
      transform: scale(1.02);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .match-box.pulse {
      border-color: var(--neon-lime);
      box-shadow: 0 0 16px rgba(212, 255, 0, 0.4);
    }
    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-color);
      min-height: 40px;
    }
    .team-row:last-child { border-bottom: none; }
    .team-info { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
    .team-flag { font-size: 1rem; }
    .team-name { font-weight: 600; color: var(--text-dim); }
    .team-name.winner { color: var(--off-white); }
    .score { font-family: var(--font-display); font-weight: 800; color: var(--neon-blue); }
    .score.pending { color: var(--text-dim); opacity: 0.3; }

    .bracket-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 24px;
    }

    .champion-box {
      background: linear-gradient(180deg, rgba(212, 255, 0, 0.1), transparent);
      border: 2px solid var(--neon-lime);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      min-width: 200px;
    }
    .champion-title { font-family: var(--font-display); font-size: 0.8rem; color: var(--neon-lime); margin-bottom: 12px; }
    .champion-team { font-size: 1.2rem; font-weight: 800; }

    svg.connectors {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      overflow: visible;
    }

    @media (max-width: 768px) {
      .bracket-scroll { padding: 20px 0; }
      svg.connectors { display: none; }
    }

    @media (prefers-reduced-motion: no-preference) {
      .match-box {
        animation: fadeSlideIn 0.3s ease both;
        animation-delay: calc(var(--i, 0) * 30ms);
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = useTournamentStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._initDragScroll();
  }

  private _initDragScroll() {
    const el = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
    if (!el) return;
    let startX = 0;
    let scrollLeft0 = 0;
    let dragging = false;

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      startX = e.pageX - el.getBoundingClientRect().left;
      scrollLeft0 = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging || e.pointerType !== 'mouse') return;
      const x = e.pageX - el.getBoundingClientRect().left;
      el.scrollLeft = scrollLeft0 - (x - startX);
    });
    const stopDrag = () => { dragging = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointerleave', stopDrag);
    el.addEventListener('pointercancel', stopDrag);
  }

  private getTeam(id: string | null) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private openMatch(matchId: string) {
    const match = useTournamentStore.getState().knockoutMatches[matchId];
    if (!match?.teamA || !match?.teamB) return;

    const modal = document.createElement('match-modal') as MatchModal;
    modal.matchId = match.matchId;
    modal.teamA = match.teamA;
    modal.teamB = match.teamB;
    modal.initialScoreA = match.scoreA ?? 0;
    modal.initialScoreB = match.scoreB ?? 0;
    modal.phase = 'knockout';

    const handler = (ev: Event) => {
      const { scoreA, scoreB } = (ev as CustomEvent).detail;
      useTournamentStore.getState().setKnockoutMatchResult(matchId, scoreA, scoreB);
      this._pulseId = matchId;
      setTimeout(() => { this._pulseId = null; }, 700);
      modal.remove();
    };
    modal.addEventListener('save', handler);
    modal.addEventListener('close', () => modal.remove());
    document.body.appendChild(modal);
  }

  private renderMatch(matchId: string, idx = 0) {
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    const tA = this.getTeam(m?.teamA ?? null);
    const tB = this.getTeam(m?.teamB ?? null);
    const isPlayed = m?.isPlayed ?? false;
    const label = `${tA?.shortName ?? 'TBD'} vs ${tB?.shortName ?? 'TBD'}`;

    return html`
      <div class="match-box ${this._pulseId === matchId ? 'pulse' : ''}"
        style="--i:${idx}"
        role="button"
        tabindex="0"
        aria-label="Partido ${label}${isPlayed ? `, resultado ${m.scoreA}-${m.scoreB}` : ', click para editar'}"
        @click="${() => this.openMatch(matchId)}"
        @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.openMatch(matchId)}">
        <div class="team-row">
          <div class="team-info">
            <span class="team-flag">${tA?.flag ?? '🏁'}</span>
            <span class="team-name ${m?.winnerId === m?.teamA ? 'winner' : ''}">${tA?.shortName ?? 'TBD'}</span>
          </div>
          <div class="score ${!isPlayed ? 'pending' : ''}">${isPlayed ? m.scoreA : '-'}</div>
        </div>
        <div class="team-row">
          <div class="team-info">
            <span class="team-flag">${tB?.flag ?? '🏁'}</span>
            <span class="team-name ${m?.winnerId === m?.teamB ? 'winner' : ''}">${tB?.shortName ?? 'TBD'}</span>
          </div>
          <div class="score ${!isPlayed ? 'pending' : ''}">${isPlayed ? m.scoreB : '-'}</div>
        </div>
      </div>
    `;
  }

  private handleSimulate() {
    useTournamentStore.getState().autoSimulateKnockout();
  }

  private handleGenerate() {
    useTournamentStore.getState().initializeKnockoutFromGroups();
  }

  render() {
    const km = useTournamentStore.getState().knockoutMatches;
    const hasKnockout = Object.keys(km).length > 0;
    const championId = km['FIN-01']?.winnerId;
    const champion = this.getTeam(championId ?? null);

    const r32Ids = ['R32-01','R32-02','R32-03','R32-04','R32-05','R32-06','R32-07','R32-08',
                    'R32-09','R32-10','R32-11','R32-12','R32-13','R32-14','R32-15','R32-16'];
    const r16Ids = ['R16-01','R16-02','R16-03','R16-04','R16-05','R16-06','R16-07','R16-08'];
    const qfIds  = ['QF-01','QF-02','QF-03','QF-04'];
    const sfIds  = ['SF-01','SF-02'];

    return html`
      <div class="bracket-actions">
        ${!hasKnockout
          ? html`<button class="btn btn-primary" @click="${this.handleGenerate}">Generar Eliminatorias</button>`
          : html`<button class="btn" @click="${this.handleSimulate}">Simular Resto</button>`
        }
      </div>

      <div class="bracket-scroll">
        <div class="bracket-container">
          <svg class="connectors" aria-hidden="true"></svg>

          <div class="round-col" id="col-r32">
            <div class="round-title">Dieciséis Avos</div>
            ${r32Ids.map((id, i) => this.renderMatch(id, i))}
          </div>

          <div class="round-col" id="col-r16">
            <div class="round-title">Octavos</div>
            ${r16Ids.map((id, i) => this.renderMatch(id, i))}
          </div>

          <div class="round-col" id="col-qf">
            <div class="round-title">Cuartos</div>
            ${qfIds.map((id, i) => this.renderMatch(id, i))}
          </div>

          <div class="round-col" id="col-sf">
            <div class="round-title">Semifinales</div>
            ${sfIds.map((id, i) => this.renderMatch(id, i))}
          </div>

          <div class="round-col" id="col-final">
            <div class="round-title">Final</div>
            ${this.renderMatch('FIN-01', 0)}

            <div class="champion-box">
              <div class="champion-title">CAMPEÓN</div>
              ${champion
                ? html`<div class="champion-team">${champion.flag} ${champion.name}</div>`
                : html`<div class="champion-team" style="opacity: 0.3">🏆 TBD</div>`
              }
            </div>

            <div class="round-title" style="margin-top: 20px">Tercer Puesto</div>
            ${this.renderMatch('TP-01', 1)}
          </div>
        </div>
      </div>
    `;
  }
}

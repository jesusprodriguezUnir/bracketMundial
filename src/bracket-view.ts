import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from './store/tournament-store';
import './components/groups-view';
import './components/bracket-knockout';
import type { MatchModal } from './components/match-modal';
import './components/match-modal';

type PhaseTab = 'groups' | 'r32' | 'r16' | 'qf' | 'sf' | 'final';

const PHASE_LABELS: Record<PhaseTab, string> = {
  groups: 'Grupos',
  r32:    '1/16',
  r16:    'Octavos',
  qf:     'Cuartos',
  sf:     'Semis',
  final:  'Final',
};

@customElement('bracket-view')
export class BracketView extends LitElement {
  @state() private _activeTab: PhaseTab = 'groups';

  private unsubscribeStore?: () => void;

  static styles = css`
    :host { display: block; }

    .phase-tabs {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin: 0 0 24px;
      position: sticky;
      top: 72px;
      z-index: 90;
      background: var(--navy-dark);
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .phase-tabs::-webkit-scrollbar { display: none; }

    .phase-tab {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-color);
      color: var(--text-dim);
      padding: 6px 14px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 0.72rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .phase-tab:hover {
      color: var(--neon-lime);
      border-color: var(--neon-lime);
    }
    .phase-tab.active {
      background: rgba(212, 255, 0, 0.12);
      border-color: var(--neon-lime);
      color: var(--neon-lime);
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 1.8rem;
      color: var(--off-white);
      margin: 48px 0 24px;
      text-align: center;
    }
    .section-title:first-of-type { margin-top: 0; }

    .knockout-sections { }
    .knockout-section { }

    /* En móvil solo se muestra la sección activa */
    @media (max-width: 768px) {
      .section-groups,
      .knockout-section {
        display: none;
      }
      .section-groups.visible,
      .knockout-section.visible {
        display: block;
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

  private _selectTab(tab: PhaseTab) {
    this._activeTab = tab;
    // En desktop hacemos scroll suave a la sección
    this.updateComplete.then(() => {
      const targetId = tab === 'groups'
        ? 'section-groups'
        : `section-knockout-${tab}`;
      const el = this.shadowRoot?.getElementById(targetId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private openMatchFromGroups(e: CustomEvent) {
    const { matchId } = e.detail;
    const store = useTournamentStore.getState();
    const match = store.groupMatches.find((m: { matchId: string }) => m.matchId === matchId);
    if (!match) return;

    const modal = document.createElement('match-modal') as MatchModal;
    modal.matchId = match.matchId;
    modal.teamA = match.teamA;
    modal.teamB = match.teamB;
    modal.initialScoreA = match.scoreA ?? 0;
    modal.initialScoreB = match.scoreB ?? 0;
    modal.phase = 'group';

    const handler = (ev: Event) => {
      const { scoreA, scoreB } = (ev as CustomEvent).detail;
      store.setGroupMatchResult(matchId, scoreA, scoreB);
      modal.remove();
    };
    modal.addEventListener('save', handler);
    modal.addEventListener('close', () => modal.remove());
    document.body.appendChild(modal);
  }

  render() {
    const tabs: PhaseTab[] = ['groups', 'r32', 'r16', 'qf', 'sf', 'final'];
    const at = this._activeTab;

    return html`
      <div>
        <nav class="phase-tabs" aria-label="Fases del torneo">
          ${tabs.map(tab => html`
            <button
              class="phase-tab ${at === tab ? 'active' : ''}"
              aria-label="Ver ${PHASE_LABELS[tab]}"
              aria-pressed="${at === tab}"
              @click="${() => this._selectTab(tab)}">
              ${PHASE_LABELS[tab]}
            </button>
          `)}
        </nav>

        <!-- Fase de Grupos -->
        <div
          id="section-groups"
          class="section-groups ${at === 'groups' ? 'visible' : ''}">
          <h2 class="section-title">Fase de Grupos</h2>
          <groups-view @open-match="${this.openMatchFromGroups}"></groups-view>
        </div>

        <!-- Eliminatorias: todas visibles en desktop, filtradas en móvil -->
        <div class="knockout-sections">
          ${(['r32', 'r16', 'qf', 'sf', 'final'] as PhaseTab[]).map(phase => html`
            <div
              id="section-knockout-${phase}"
              class="knockout-section ${at === phase ? 'visible' : ''}">
            </div>
          `)}
          <!-- El bracket knockout renderiza todo internamente, lo envolvemos en un bloque visible -->
          <div
            id="section-knockout-bracket"
            class="knockout-section ${at !== 'groups' ? 'visible' : ''}">
            <h2 class="section-title">Eliminatorias</h2>
            <bracket-knockout></bracket-knockout>
          </div>
        </div>
      </div>
    `;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from './store/tournament-store';
import './components/groups-view';
import './components/bracket-knockout';
import type { MatchModal } from './components/match-modal';
import './components/match-modal';
import './components/stadiums-view';
import './components/squads-view';
import './components/calendar-view';
import { STADIUMS } from './data/stadiums';

type PhaseTab = 'groups' | 'squads' | 'calendar' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'stadiums';

const PHASE_LABELS: Record<PhaseTab, string> = {
  groups: 'Grupos',
  squads: 'Equipos',
  calendar: 'Calendario',
  r32:    '1/16',
  r16:    'Octavos',
  qf:     'Cuartos',
  sf:     'Semis',
  final:  'Final',
  stadiums: 'Estadios',
};

@customElement('bracket-view')
export class BracketView extends LitElement {
  @state() private _activeTab: PhaseTab = 'groups';

  private unsubscribeStore?: () => void;

  static readonly styles = css`
    :host { display: block; }

    /* Barra de phase tabs — estética retro, botones Bowlby One */
    .phase-tabs {
      display: flex;
      background: var(--paper-2);
      border-bottom: 4px solid var(--ink);
      position: sticky;
      top: 73px; /* altura topbar retro */
      z-index: 90;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .phase-tabs::-webkit-scrollbar { display: none; }

    .phase-tab {
      all: unset;
      cursor: pointer;
      padding: 14px 22px;
      font-family: var(--font-var);
      font-size: 15px;
      letter-spacing: 0.04em;
      color: var(--ink);
      border-left: 2px solid var(--ink);
      display: flex;
      align-items: center;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background 0.1s;
    }
    .phase-tab:first-child { border-left: none; }
    .phase-tab:hover { background: var(--retro-yellow); }
    .phase-tab.active {
      background: var(--retro-orange);
      color: var(--paper);
    }

    /* Títulos de sección */
    .section-heading {
      padding: 22px 0 18px;
      border-bottom: 3px dashed var(--ink);
      margin-bottom: 24px;
    }
    .section-heading.knockout {
      border-bottom-style: solid;
    }
    .section-eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .section-title {
      font-family: var(--font-var);
      font-size: 34px;
      line-height: 1;
      color: var(--ink);
    }

    .section-groups,
    .knockout-sections,
    .section-stadiums,
    .section-squads,
    .section-calendar {
      display: none;
    }
    .section-groups.visible,
    .knockout-sections.visible,
    .section-stadiums.visible,
    .section-squads.visible,
    .section-calendar.visible {
      display: block;
    }

    @media (max-width: 768px) {
      .section-groups,
      .knockout-section,
      .section-stadiums,
      .section-squads,
      .section-calendar {
        display: none;
      }
      .section-groups.visible,
      .knockout-section.visible,
      .section-stadiums.visible,
      .section-squads.visible,
      .section-calendar.visible {
        display: block;
      }
      .phase-tab {
        padding: 12px 16px;
        font-size: 13px;
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
    this.updateComplete.then(() => {
      let targetId = `section-knockout-${tab}`;
      if (tab === 'groups') targetId = 'section-groups';
      if (tab === 'stadiums') targetId = 'section-stadiums';
      if (tab === 'squads') targetId = 'section-squads';
      if (tab === 'calendar') targetId = 'section-calendar';
      
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
    (modal as any).venue = match.venue;
    (modal as any).city = match.city;
    (modal as any).timeSpain = match.timeSpain;
    const s = STADIUMS.find(st => st.name === match.venue);
    if (s) (modal as any).stadiumImage = s.image;

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
    const tabs: PhaseTab[] = ['groups', 'squads', 'calendar', 'r32', 'r16', 'qf', 'sf', 'final', 'stadiums'];
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
          <div class="section-heading">
            <div class="section-eyebrow">⚽ FASE DE GRUPOS</div>
            <div class="section-title">12 GRUPOS · 48 EQUIPOS</div>
          </div>
          <groups-view @open-match="${this.openMatchFromGroups}"></groups-view>
        </div>

        <div id="section-squads" class="section-squads ${at === 'squads' ? 'visible' : ''}">
          <div class="section-heading">
            <div class="section-eyebrow">✦ EQUIPOS Y PLANTILLAS</div>
            <div class="section-title">48 SELECCIONES · ROSTERS + SEDES</div>
          </div>
          <squads-view></squads-view>
        </div>

        <div id="section-calendar" class="section-calendar ${at === 'calendar' ? 'visible' : ''}">
          <div class="section-heading">
            <div class="section-eyebrow">🗓️ CALENDARIO GLOBAL</div>
            <div class="section-title">104 PARTIDOS · 11 JUN A 19 JUL</div>
          </div>
          <calendar-view></calendar-view>
        </div>

        <!-- Eliminatorias -->
        <div class="knockout-sections ${at !== 'groups' && at !== 'squads' && at !== 'calendar' && at !== 'stadiums' ? 'visible' : ''}">
          ${(['r32', 'r16', 'qf', 'sf', 'final'] as PhaseTab[]).map(phase => html`
            <div
              id="section-knockout-${phase}"
              class="knockout-section ${at === phase ? 'visible' : ''}">
            </div>
          `)}
          <div
            id="section-knockout-bracket"
            class="knockout-section ${at !== 'groups' && at !== 'squads' && at !== 'calendar' && at !== 'stadiums' ? 'visible' : ''}">
            <div class="section-heading knockout">
              <div class="section-eyebrow">★ ELIMINATORIAS ★</div>
              <div class="section-title">EL CAMINO A LA GLORIA</div>
            </div>
            <bracket-knockout></bracket-knockout>
          </div>
        </div>

        <!-- Vista de Estadios -->
        <div
          id="section-stadiums"
          class="section-stadiums ${at === 'stadiums' ? 'visible' : ''}">
          <div class="section-heading">
            <div class="section-eyebrow">🏟️ SEDES OFICIALES</div>
            <div class="section-title">16 ESTADIOS · 3 PAÍSES</div>
          </div>
          <stadiums-view></stadiums-view>
        </div>
      </div>
    `;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from './store/tournament-store';
// Hero y match-modal se cargan síncronos (above-the-fold / modal global)
import './components/hero-view';
import type { MatchModal } from './components/match-modal';
import './components/match-modal';
import './components/ad-block';
import { STADIUMS } from './data/stadiums';
import { t, useLocaleStore } from './i18n';
import type { TranslationKey } from './i18n/es';

type PhaseTab = 'hero' | 'groups' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'coaches';

// Mapa de vista → módulo lazy
type LazyView = 'groups' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'tv' | 'coaches';

const VIEW_IMPORTS: Record<LazyView, () => Promise<unknown>> = {
  groups:   () => import('./components/groups-view'),
  knockout: () => import('./components/bracket-knockout'),
  squads:   () => import('./components/squads-view'),
  calendar: () => import('./components/calendar-view'),
  stadiums: () => import('./components/stadiums-view'),
  tv:       () => import('./components/broadcasting-view'),
  coaches:  () => import('./components/coaches-view'),
};

/** Mapea cada tab a la vista lazy que necesita (hero no necesita lazy) */
function tabToView(tab: PhaseTab): LazyView | null {
  if (tab === 'hero') return null;
  if (tab === 'groups') return 'groups';
  if (tab === 'knockout') return 'knockout';
  if (tab === 'squads') return 'squads';
  if (tab === 'calendar') return 'calendar';
  if (tab === 'stadiums') return 'stadiums';
  if (tab === 'coaches') return 'coaches';
  return null;
}

const PHASE_TAB_KEYS: Record<PhaseTab, TranslationKey> = {
  hero:     'tabs.hero',
  groups:   'tabs.groups',
  knockout: 'tabs.knockout',
  squads:   'tabs.squads',
  calendar: 'tabs.calendar',
  stadiums: 'tabs.stadiums',
  coaches:  'tabs.coaches',
};

@customElement('bracket-view')
export class BracketView extends LitElement {
  @state() private _activeTab: PhaseTab = 'hero';
  @state() private _loadedViews = new Set<LazyView>();


  static readonly styles = css`
    :host { display: block; }

    /* Barra de phase tabs — estética retro, botones Bowlby One */
    .phase-tabs {
      display: flex;
      background: var(--paper-2);
      border-bottom: 4px solid var(--ink);
      position: sticky;
      top: 61px; /* topbar 56px + progress-bar 5px */
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
    .section-calendar,
    .section-tv {
      display: none;
      scroll-margin-top: 120px;
    }
    .section-groups.visible,
    .knockout-sections.visible,
    .section-stadiums.visible,
    .section-squads.visible,
    .section-calendar.visible,
    .section-tv.visible {
      display: block;
    }

    /* SEO Info Section - solo en hero */
    .seo-info {
      max-width: 1200px;
      margin: 60px auto 0;
      padding: 40px;
      background: var(--paper);
      border: 3px solid var(--ink);
      box-shadow: 8px 8px 0 var(--ink);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .seo-card h2 {
      font-family: var(--font-var);
      font-size: 24px;
      color: var(--ink);
      margin-bottom: 12px;
      border-bottom: 2px solid var(--retro-orange);
      display: inline-block;
    }
    .seo-card p {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.6;
      color: var(--dim);
    }

    /* Franja de anuncio entre secciones */
    .ad-inline {
      margin: 32px 0;
      min-height: 90px;
    }

    @media (max-width: 768px) {
      .section-groups,
      .knockout-section,
      .section-stadiums,
      .section-squads,
      .section-calendar,
      .section-tv {
        display: none;
      }
      .section-groups.visible,
      .knockout-section.visible,
      .section-stadiums.visible,
      .section-squads.visible,
      .section-calendar.visible,
      .section-tv.visible {
        display: block;
      }
      .phase-tab {
        padding: 12px 16px;
        font-size: 13px;
      }
      .seo-info {
        grid-template-columns: 1fr;
        margin: 40px 16px 0;
        padding: 24px;
      }
      .ad-inline {
        margin: 20px 0;
        min-height: 60px;
      }
    }
  `;

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // bracket-view no necesita reaccionar al store — usa getState() imperativo en openMatchFromGroups
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    // Pre-cargar groups en idle (el tab más visitado tras hero)
    this._ensureView('groups');
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  /** Carga el módulo de una vista si aún no se cargó */
  private async _ensureView(view: LazyView): Promise<void> {
    if (this._loadedViews.has(view)) return;
    await VIEW_IMPORTS[view]();
    // Mutar una copia del Set para disparar @state reactivo
    this._loadedViews = new Set([...this._loadedViews, view]);
  }

  private async _selectTab(tab: PhaseTab) {
    const view = tabToView(tab);
    if (view) {
      await this._ensureView(view);
    }
    this._activeTab = tab;
    this.updateComplete.then(() => {
      let targetId = `section-knockout-${tab}`;
      if (tab === 'groups') targetId = 'section-groups';
      if (tab === 'stadiums') targetId = 'section-stadiums';
      if (tab === 'squads') targetId = 'section-squads';
      if (tab === 'calendar') targetId = 'section-calendar';
      if (tab === 'coaches') targetId = 'section-coaches';
      
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
    modal.initialScoreA = match.scoreA;
    modal.initialScoreB = match.scoreB;
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
    const tabs: PhaseTab[] = ['hero', 'groups', 'knockout', 'squads', 'calendar', 'stadiums', 'coaches'];
    const at = this._activeTab;
    const loaded = this._loadedViews;
    const isKnockoutTab = at === 'knockout';

    return html`
      <div @navigate="${(e: CustomEvent) => this._selectTab(e.detail as PhaseTab)}">
        <nav class="phase-tabs" aria-label="${t('tabs.label')}">
          ${tabs.map(tab => html`
            <button
              class="phase-tab ${at === tab ? 'active' : ''}"
              aria-label="${t('tabs.view', { tab: t(PHASE_TAB_KEYS[tab]) })}"
              aria-pressed="${at === tab}"
              @click="${() => this._selectTab(tab)}">
              ${t(PHASE_TAB_KEYS[tab])}
            </button>
          `)}
        </nav>

        <!-- Hero / Inicio -->
        <div class="section-groups ${at === 'hero' ? 'visible' : ''}">
          ${at === 'hero' ? html`
            <hero-view></hero-view>
            <section class="seo-info" aria-labelledby="seo-title">
              <div class="seo-card">
                <h2 id="seo-title">${t('seo.aboutTitle')}</h2>
                <p>${t('seo.aboutText')}</p>
              </div>
              <div class="seo-card">
                <h2>${t('seo.formatTitle')}</h2>
                <p>${t('seo.formatText')}</p>
              </div>
            </section>
          ` : ''}
        </div>

        <!-- Fase de Grupos (lazy) -->
        <div
          id="section-groups"
          class="section-groups ${at === 'groups' ? 'visible' : ''}">
          ${at === 'groups' && loaded.has('groups') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.groups.eyebrow')}</div>
              <div class="section-title">${t('section.groups.title')}</div>
            </div>
            <groups-view @open-match="${this.openMatchFromGroups}"></groups-view>
            <div class="ad-inline">
              <ad-block></ad-block>
            </div>
          ` : ''}
        </div>

        <!-- Equipos (lazy) -->
        <div id="section-squads" class="section-squads ${at === 'squads' ? 'visible' : ''}">
          ${at === 'squads' && loaded.has('squads') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.squads.eyebrow')}</div>
              <div class="section-title">${t('section.squads.title')}</div>
            </div>
            <squads-view></squads-view>
          ` : ''}
        </div>

        <!-- Calendario (lazy) -->
        <div id="section-calendar" class="section-calendar ${at === 'calendar' ? 'visible' : ''}">
          ${at === 'calendar' && loaded.has('calendar') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.calendar.eyebrow')}</div>
              <div class="section-title">${t('section.calendar.title')}</div>
            </div>
            <calendar-view></calendar-view>
          ` : ''}
        </div>

        <!-- Eliminatorias (lazy) -->
        <div class="knockout-sections ${isKnockoutTab ? 'visible' : ''}">
          ${isKnockoutTab && loaded.has('knockout') ? html`
            <div
              id="section-knockout-bracket"
              class="knockout-section visible">
              <div class="section-heading knockout">
                <div class="section-eyebrow">${t('section.knockout.eyebrow')}</div>
                <div class="section-title">${t('section.knockout.title')}</div>
              </div>
              <bracket-knockout></bracket-knockout>
              <div class="ad-inline">
                <ad-block></ad-block>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Vista de Estadios (lazy) -->
        <div
          id="section-stadiums"
          class="section-stadiums ${at === 'stadiums' ? 'visible' : ''}">
          ${at === 'stadiums' && loaded.has('stadiums') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.stadiums.eyebrow')}</div>
              <div class="section-title">${t('section.stadiums.title')}</div>
            </div>
            <stadiums-view></stadiums-view>
          ` : ''}
        </div>

        <!-- Dónde ver (lazy) -->
        <div
          id="section-tv"
          class="section-tv">
          <!-- tab 'tv' removed from PhaseTab -->
        </div>

        <!-- Vista de Entrenadores (lazy) -->
        <div
          id="section-coaches"
          class="section-coaches ${at === 'coaches' ? 'visible' : ''}">
          ${at === 'coaches' && loaded.has('coaches') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.coaches.eyebrow')}</div>
              <div class="section-title">${t('section.coaches.title')}</div>
            </div>
            <coaches-view></coaches-view>
          ` : ''}
        </div>
      </div>
    `;
  }
}


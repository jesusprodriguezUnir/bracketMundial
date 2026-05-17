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

const MORE_TABS: PhaseTab[] = ['calendar', 'stadiums', 'coaches'];

/** Orden de tabs para swipe */
const TAB_ORDER: PhaseTab[] = ['hero', 'groups', 'knockout', 'squads', 'calendar', 'stadiums', 'coaches'];

@customElement('bracket-view')
export class BracketView extends LitElement {
  @state() private _activeTab: PhaseTab = 'hero';
  @state() private _loadedViews = new Set<LazyView>();
  @state() private _moreOpen = false;

  private _swipeStartX = 0;
  private _swipeStartY = 0;
  private _isSwiping = false;


  static readonly styles = css`
    :host { display: block; }

    @media (max-width: 768px) {
      :host {
        padding-bottom: 72px;
      }
    }

    /* Contenedor con touch area para swipe */
    .view-container {
      position: relative;
      touch-action: pan-y;
    }

    /* Barra de phase tabs — estética retro, botones Bowlby One (desktop) */
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

    /* ─── Bottom Navigation (mobile) ─── */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 200;
      background: var(--ink);
      border-top: 4px solid var(--retro-yellow);
      padding: 6px 0;
      padding-bottom: calc(6px + env(safe-area-inset-bottom));
      justify-content: space-around;
      align-items: stretch;
      box-shadow: 0 -4px 0 0 rgba(0,0,0,0.15);
    }
    .bottom-nav-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 4px 6px;
      min-width: 48px;
      min-height: 44px;
      border-radius: 0;
      transition: opacity 0.1s;
      position: relative;
      -webkit-tap-highlight-color: transparent;
    }
    .bottom-nav-btn:active {
      opacity: 0.7;
    }
    .bottom-nav-btn .nav-icon {
      font-size: 20px;
      line-height: 1;
      color: rgba(236,223,192,0.5);
      transition: color 0.15s;
    }
    .bottom-nav-btn .nav-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.08em;
      color: rgba(236,223,192,0.5);
      text-transform: uppercase;
      transition: color 0.15s;
    }
    .bottom-nav-btn.active .nav-icon,
    .bottom-nav-btn.active .nav-label {
      color: var(--retro-yellow);
    }
    .bottom-nav-btn.active::after {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 3px;
      background: var(--retro-yellow);
      border-radius: 0;
    }

    /* ─── More Overlay ─── */
    .more-overlay {
      display: none;
      position: fixed;
      bottom: calc(68px + env(safe-area-inset-bottom));
      right: 12px;
      z-index: 199;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      min-width: 180px;
    }
    .more-overlay.open {
      display: block;
    }
    .more-overlay-item {
      all: unset;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 14px 18px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.04em;
      color: var(--ink);
      border-bottom: 1px solid var(--ink);
      transition: background 0.1s;
      min-height: 44px;
      box-sizing: border-box;
    }
    .more-overlay-item:last-child {
      border-bottom: none;
    }
    .more-overlay-item:hover {
      background: var(--retro-yellow);
    }
    .more-overlay-item .mo-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    .more-overlay-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 198;
      background: transparent;
    }
    .more-overlay-backdrop.open {
      display: block;
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
      .phase-tabs {
        display: none;
      }
      .bottom-nav {
        display: flex;
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

    @media (max-width: 375px) {
      .bottom-nav-btn {
        min-width: 40px;
        padding: 4px 3px;
      }
      .bottom-nav-btn .nav-icon {
        font-size: 17px;
      }
      .bottom-nav-btn .nav-label {
        font-size: 7px;
      }
      .more-overlay {
        right: 6px;
        min-width: 160px;
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
    this.addEventListener('touchstart', this._onSwipeStart, { passive: true });
    this.addEventListener('touchmove', this._onSwipeMove, { passive: false });
    this.addEventListener('touchend', this._onSwipeEnd, { passive: true });
    this.addEventListener('close-more', () => { this._moreOpen = false; this.requestUpdate(); });
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this._onSwipeStart);
    this.removeEventListener('touchmove', this._onSwipeMove);
    this.removeEventListener('touchend', this._onSwipeEnd);
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
    this._moreOpen = false;
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

  private get _isMoreTab() {
    return MORE_TABS.includes(this._activeTab);
  }

  private _closeMore() {
    this._moreOpen = false;
  }

  private _toggleMore() {
    this._moreOpen = !this._moreOpen;
  }

  private _onSwipeStart(e: TouchEvent) {
    this._swipeStartX = e.touches[0].clientX;
    this._swipeStartY = e.touches[0].clientY;
    this._isSwiping = false;
  }

  private _onSwipeMove(e: TouchEvent) {
    if (!this._isSwiping) {
      const dx = Math.abs(e.touches[0].clientX - this._swipeStartX);
      const dy = Math.abs(e.touches[0].clientY - this._swipeStartY);
      if (dx > 20 && dx > dy * 1.5) {
        this._isSwiping = true;
      }
      return;
    }
    if (e.cancelable) e.preventDefault();
  }

  private _onSwipeEnd(e: TouchEvent) {
    if (!this._isSwiping) return;
    this._isSwiping = false;
    const dx = e.changedTouches[0].clientX - this._swipeStartX;
    if (Math.abs(dx) < 50) return;
    const idx = TAB_ORDER.indexOf(this._activeTab);
    if (idx === -1) return;
    const nextIdx = dx < 0 ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= TAB_ORDER.length) return;
    this._moreOpen = false;
    this._selectTab(TAB_ORDER[nextIdx]);
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
    const mainTabs: Array<{ tab: PhaseTab; icon: string; label: string }> = [
      { tab: 'hero',     icon: '🏠', label: t('tabs.hero') },
      { tab: 'groups',   icon: '⚽', label: t('tabs.groups') },
      { tab: 'knockout', icon: '🏆', label: t('tabs.knockout') },
      { tab: 'squads',   icon: '👥', label: t('tabs.squads') },
    ];
    const at = this._activeTab;
    const loaded = this._loadedViews;
    const isKnockoutTab = at === 'knockout';
    const isMore = this._isMoreTab;

    return html`
      <div class="view-container" @navigate="${(e: CustomEvent) => this._selectTab(e.detail as PhaseTab)}">
        <!-- Desktop: phase-tabs -->
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

        <!-- Mobile: bottom navigation -->
        <nav class="bottom-nav" aria-label="${t('tabs.label')}">
          ${mainTabs.map(item => html`
            <button
              class="bottom-nav-btn ${at === item.tab ? 'active' : ''}"
              aria-label="${t('tabs.view', { tab: item.label })}"
              aria-current="${at === item.tab ? 'page' : undefined}"
              @click="${() => this._selectTab(item.tab)}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </button>
          `)}
          <button
            class="bottom-nav-btn ${isMore ? 'active' : ''}"
            aria-label="${t('tabs.more')}"
            aria-expanded="${this._moreOpen}"
            aria-haspopup="menu"
            @click="${this._toggleMore}">
            <span class="nav-icon">${isMore ? '●' : '⋯'}</span>
            <span class="nav-label">${t('tabs.more')}</span>
          </button>
        </nav>

        <!-- More overlay backdrop -->
        <div
          class="more-overlay-backdrop ${this._moreOpen ? 'open' : ''}"
          @click="${this._closeMore}"
          @touchstart="${this._closeMore}"></div>

        <!-- More overlay menu -->
        <div class="more-overlay ${this._moreOpen ? 'open' : ''}" role="menu">
          ${MORE_TABS.map(tab => html`
            <button
              class="more-overlay-item"
              role="menuitem"
              @click="${() => this._selectTab(tab)}">
              <span class="mo-icon">${tab === 'calendar' ? '🗓️' : tab === 'stadiums' ? '🏟️' : '📋'}</span>
              ${t(PHASE_TAB_KEYS[tab])}
            </button>
          `)}
        </div>

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


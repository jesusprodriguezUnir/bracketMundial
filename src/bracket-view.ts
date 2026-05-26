import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from './store/tournament-store';
// Hero y match-modal se cargan síncronos (above-the-fold / modal global)
import './components/hero-view';
import './components/match-modal';
import './components/ad-block';
import { STADIUMS } from './data/stadiums';
import { openMatchModal } from './lib/match-modal-service';
import { t, useLocaleStore } from './i18n';
import type { TranslationKey } from './i18n/es';

type PhaseTab = 'hero' | 'groups' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'coaches' | 'guide' | 'league';

// Mapa de vista → módulo lazy
type LazyView = 'groups' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'tv' | 'coaches' | 'guide' | 'league';

const VIEW_IMPORTS: Record<LazyView, () => Promise<unknown>> = {
  groups:     () => import('./components/groups-view'),
  knockout:   () => import('./components/bracket-knockout'),
  squads:     () => import('./components/squads-view'),
  calendar:   () => import('./components/calendar-view'),
  stadiums:   () => import('./components/stadiums-view'),
  tv:         () => import('./components/broadcasting-view'),
  coaches:    () => import('./components/coaches-view'),
  guide:      () => import('./components/guide-view'),
  league: () => import('./components/leagues-view'),
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
  if (tab === 'guide') return 'guide';
  if (tab === 'league') return 'league';
  return null;
}

const PHASE_TAB_KEYS: Record<PhaseTab, TranslationKey> = {
  hero:      'tabs.hero',
  groups:    'tabs.groups',
  knockout:  'tabs.knockout',
  squads:    'tabs.squads',
  calendar:  'tabs.calendar',
  stadiums:  'tabs.stadiums',
  coaches:   'tabs.coaches',
  guide:     'tabs.guide',
  league: 'tabs.league',
};

const MORE_TABS: PhaseTab[] = ['calendar', 'stadiums', 'coaches', 'guide', 'league'];

/** Orden de tabs para swipe */
const TAB_ORDER: PhaseTab[] = ['hero', 'groups', 'knockout', 'squads', 'calendar', 'stadiums', 'coaches', 'guide', 'league'];

@customElement('bracket-view')
export class BracketView extends LitElement {
  @state() private _activeTab: PhaseTab = 'hero';
  @state() private _loadedViews = new Set<LazyView>();
  @state() private _loadingView: LazyView | null = null;
  @state() private _moreOpen = false;

  private _swipeStartX = 0;
  private _swipeStartY = 0;
  private _isSwiping = false;
  private _swipeBlocked = false;
  private _tabHistory: PhaseTab[] = ['hero'];


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
      touch-action: auto;
    }

    /* ─── Bottom Navigation (mobile) ─── */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 200;
      background: var(--surface-dark);
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
      gap: 4px;
      flex: 1;
      padding: 8px 4px;
      min-width: 0;
      color: var(--on-dark);
      font-family: var(--font-var);
      font-size: 10px;
      position: relative;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .bottom-nav-btn:active {
      opacity: 0.7;
    }
    .bottom-nav-btn .nav-icon {
      font-size: 20px;
      line-height: 1;
      color: var(--on-dark-soft);
      transition: color 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bottom-nav-btn .nav-icon svg {
      display: block;
      width: 20px;
      height: 20px;
    }
    .bottom-nav-btn .nav-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.08em;
      color: var(--on-dark-soft);
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

    /* ─── More Bottom Sheet (mobile) ─── */
    .more-sheet-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 198;
      background: rgba(26,25,51,0.55);
    }
    .more-sheet-backdrop.open {
      display: block;
    }
    .more-sheet {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 199;
      background: var(--paper-3);
      border-top: 4px solid var(--ink);
      box-shadow: 0 -6px 0 0 var(--retro-orange);
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
      max-height: 75vh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .more-sheet.open {
      display: flex;
      flex-direction: column;
      animation: sheetSlideUp 0.25s ease both;
    }
    @keyframes sheetSlideUp {
      from { transform: translateY(100%); }
      to   { transform: translateY(0); }
    }
    .more-sheet-header {
      padding: 14px 18px;
      border-bottom: 2px solid var(--ink);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .more-sheet-title {
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--ink);
      letter-spacing: 0.04em;
    }
    .more-sheet-close {
      all: unset;
      cursor: pointer;
      padding: 6px 12px;
      background: var(--surface-dark);
      color: var(--retro-yellow);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      min-height: 32px;
    }
    .more-sheet-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 16px;
      gap: 12px;
    }
    .more-sheet-item {
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 16px 12px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.04em;
      color: var(--ink);
      background: var(--paper-2);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      min-height: 70px;
      box-sizing: border-box;
      transition: background 0.1s, transform 0.1s;
      text-align: center;
    }
    .more-sheet-item:active {
      background: var(--retro-yellow);
      transform: translate(2px, 2px);
      box-shadow: 0 0 0 0 var(--ink);
    }
    .more-sheet-item .ms-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .more-sheet-item .ms-icon svg {
      width: 24px;
      height: 24px;
    }
    @media (max-width: 375px) {
      .more-sheet-item {
        padding: 14px 10px;
        font-size: 12px;
      }
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
    .section-coaches,
    .section-guide,
    .section-tv,
    .section-league {
      display: none;
      scroll-margin-top: 110px;
    }
    .section-groups.visible,
    .knockout-sections.visible,
    .section-stadiums.visible,
    .section-squads.visible,
    .section-calendar.visible,
    .section-coaches.visible,
    .section-guide.visible,
    .section-tv.visible,
      .section-league.visible {
      display: block;
      animation: viewFadeIn 0.2s ease both;
    }
    @keyframes viewFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
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

    .seo-faq {
      grid-column: 1 / -1;
      border-top: 3px dashed var(--ink);
      padding-top: 32px;
    }
    .seo-faq h2 {
      font-family: var(--font-var);
      font-size: 24px;
      color: var(--ink);
      margin-bottom: 20px;
      border-bottom: 2px solid var(--retro-orange);
      display: inline-block;
    }
    .seo-faq details {
      border: 2px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      margin-bottom: 10px;
      background: var(--paper-3);
    }
    .seo-faq summary {
      font-family: var(--font-var);
      font-size: 15px;
      letter-spacing: 0.03em;
      padding: 14px 18px;
      cursor: pointer;
      color: var(--ink);
      list-style: none;
      user-select: none;
    }
    .seo-faq summary::-webkit-details-marker { display: none; }
    .seo-faq summary::before {
      content: '▶ ';
      color: var(--retro-orange);
      font-size: 11px;
    }
    .seo-faq details[open] summary::before {
      content: '▼ ';
    }
    .seo-faq details[open] summary {
      background: var(--retro-yellow);
    }
    .seo-faq .faq-answer {
      padding: 0 18px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      color: var(--dim);
    }

    .seo-links {
      grid-column: 1 / -1;
      border-top: 3px dashed var(--ink);
      padding-top: 24px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px 32px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.04em;
    }
    .seo-links a {
      color: var(--ink);
      text-underline-offset: 4px;
    }
    .seo-links a:hover {
      color: var(--retro-orange);
    }

    /* Franja de anuncio entre secciones */
    .ad-inline {
      margin: 32px 0;
      min-height: 90px;
    }

    @media (max-width: 768px) {
      .section-groups,
      .knockout-section,
      .knockout-sections,
      .section-stadiums,
      .section-squads,
      .section-calendar,
      .section-coaches,
      .section-guide,
      .section-tv,
      .section-league {
        display: none;
      }
      .section-groups.visible,
      .knockout-section.visible,
      .knockout-sections.visible,
      .section-stadiums.visible,
      .section-squads.visible,
      .section-calendar.visible,
      .section-coaches.visible,
      .section-guide.visible,
      .section-tv.visible,
  .section-league.visible {
        display: block;
        animation: viewFadeIn 0.2s ease both;
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
      .bottom-nav-btn .nav-icon svg {
        width: 17px;
        height: 17px;
      }
      .bottom-nav-btn .nav-label {
        font-size: 7px;
      }
    }
  `;

  private unsubscribeLocale?: () => void;
  private _hashChangeHandler?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // bracket-view no necesita reaccionar al store — usa getState() imperativo en openMatchFromGroups
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    // Pre-cargar groups en idle (el tab más visitado tras hero)
    this._ensureView('groups');

    // Hash routing
    this._restoreFromHash();
    this._hashChangeHandler = () => this._restoreFromHash();
    window.addEventListener('hashchange', this._hashChangeHandler);

    this.addEventListener('touchstart', this._onSwipeStart, { passive: true });
    this.addEventListener('touchmove', this._onSwipeMove, { passive: false });
    this.addEventListener('touchend', this._onSwipeEnd, { passive: true });
    this.addEventListener('close-more', () => { this._moreOpen = false; this.requestUpdate(); });
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
    }
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this._onSwipeStart);
    this.removeEventListener('touchmove', this._onSwipeMove);
    this.removeEventListener('touchend', this._onSwipeEnd);
  }

  /** Sincroniza la pestaña activa con location.hash */
  private _restoreFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const validTabs: PhaseTab[] = ['hero', 'groups', 'knockout', 'squads', 'calendar', 'stadiums', 'coaches', 'guide', 'league'];
    if (validTabs.includes(hash as PhaseTab) && this._activeTab !== hash) {
      // Usar requestAnimationFrame para evitar conflictos con el render inicial
      requestAnimationFrame(() => this._selectTab(hash as PhaseTab));
    }
    // Soporte para sub-vistas: #squads/ARG → squads con targetTeamId
    if (hash.startsWith('squads/')) {
      const teamId = hash.split('/')[1];
      if (teamId && this._activeTab !== 'squads') {
        requestAnimationFrame(() => this._selectTabSquads(teamId));
      }
    }
  }

  private _updateHash(tab: PhaseTab) {
    const current = window.location.hash.replace('#', '');
    if (current !== tab) {
      window.location.hash = `#${tab}`;
    }
  }

  private async _selectTabSquads(teamId: string) {
    await this._selectTab('squads');
    this.updateComplete.then(() => {
      const squadsEl = this.shadowRoot?.querySelector('squads-view') as HTMLElement & { targetTeamId?: string } | null;
      if (squadsEl) squadsEl.targetTeamId = teamId;
    });
  }

  /** Carga el módulo de una vista si aún no se cargó */
  private async _ensureView(view: LazyView): Promise<void> {
    if (this._loadedViews.has(view)) return;
    this._loadingView = view;
    try {
      await VIEW_IMPORTS[view]();
      this._loadedViews = new Set([...this._loadedViews, view]);
    } finally {
      if (this._loadingView === view) this._loadingView = null;
    }
  }

  private async _selectTab(tab: PhaseTab) {
    this._activeTab = tab;
    this._moreOpen = false;
    this._updateHash(tab);

    // Reset internal state for navigable views
    if (tab === 'squads') {
      const squadsEl = this.shadowRoot?.querySelector('squads-view') as HTMLElement & { goBack?: () => void } | null;
      squadsEl?.goBack?.();
    }
    if (tab === 'coaches') {
      const coachesEl = this.shadowRoot?.querySelector('coaches-view') as HTMLElement & { goBack?: () => void } | null;
      coachesEl?.goBack?.();
    }
    if (tab === 'guide') {
      const guideEl = this.shadowRoot?.querySelector('guide-view') as HTMLElement & { goBack?: () => void } | null;
      guideEl?.goBack?.();
    }
    if (tab === 'stadiums') {
      const stadiumsEl = this.shadowRoot?.querySelector('stadiums-view') as HTMLElement & { goBack?: () => void } | null;
      stadiumsEl?.goBack?.();
    }

    if (this._tabHistory[this._tabHistory.length - 1] !== tab) {
      this._tabHistory = [...this._tabHistory.slice(-9), tab];
    }

    const view = tabToView(tab);
    if (view) {
      await this._ensureView(view);
    }

    this.updateComplete.then(() => {
      let targetId = `section-knockout-${tab}`;
      if (tab === 'groups') targetId = 'section-groups';
      if (tab === 'stadiums') targetId = 'section-stadiums';
      if (tab === 'squads') targetId = 'section-squads';
      if (tab === 'calendar') targetId = 'section-calendar';
      if (tab === 'coaches') targetId = 'section-coaches';
      if (tab === 'guide') targetId = 'section-guide';
      if (tab === 'league') targetId = 'section-league';

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
    this._swipeBlocked = this._isInsideHorizontalScroller(e);
  }

  private _isInsideHorizontalScroller(e: TouchEvent): boolean {
    // composedPath cruza shadow boundaries — necesario porque el target real
    // (p.ej. .mob-chips dentro de <bracket-knockout>) vive en otro shadow root.
    const path = e.composedPath();
    for (const node of path) {
      if (node === this) break;
      if (!(node instanceof HTMLElement)) continue;
      if (node.scrollWidth <= node.clientWidth) continue;
      const ox = getComputedStyle(node).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  }

  private _onSwipeMove(e: TouchEvent) {
    if (this._swipeBlocked) return;
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
    if (this._swipeBlocked) {
      this._swipeBlocked = false;
      this._isSwiping = false;
      return;
    }
    if (!this._isSwiping) return;
    this._isSwiping = false;
    const dx = e.changedTouches[0].clientX - this._swipeStartX;
    if (Math.abs(dx) < 50) return;

    // Swipe from left edge (iOS back gesture): always go to previous tab
    if (this._swipeStartX < 32 && dx > 0) {
      const prevIdx = this._tabHistory.length - 2;
      if (prevIdx >= 0) {
        const prev = this._tabHistory[prevIdx];
        this._tabHistory = this._tabHistory.slice(0, -1);
        this._moreOpen = false;
        this._selectTab(prev);
        return;
      }
    }

    // Horizontal swipe between adjacent tabs
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

    const s = STADIUMS.find(st => st.name === match.venue);

    openMatchModal({
      matchId: match.matchId,
      teamA: match.teamA,
      teamB: match.teamB,
      initialScoreA: match.scoreA,
      initialScoreB: match.scoreB,
      phase: 'group',
      goalScorers: match.goalScorers,
      venue: match.venue,
      city: match.city,
      timeSpain: match.timeSpain,
      stadiumImage: s?.image,
      onSave: ({ scoreA, scoreB }) => {
      store.setGroupMatchResult(matchId, scoreA, scoreB);
      },
    });
  }

  render() {
    const mainTabs: Array<{ tab: PhaseTab; icon: string; svg: unknown; label: string }> = [
      { tab: 'hero',     icon: '🏠', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/><rect x="9" y="14" width="2" height="6"/><rect x="13" y="14" width="2" height="6"/></svg>`, label: t('tabs.hero') },
      { tab: 'groups',   icon: '⚽', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`, label: t('tabs.groups') },
      { tab: 'knockout', icon: '🏆', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2Z"/></svg>`, label: t('tabs.knockout') },
      { tab: 'squads',   icon: '👥', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="17" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>`, label: t('tabs.squads') },
    ];
    const at = this._activeTab;
    const loaded = this._loadedViews;
    const isKnockoutTab = at === 'knockout';
    const isMore = this._isMoreTab;

    return html`
      <div class="view-container" @navigate="${(e: CustomEvent) => this._selectTab(e.detail as PhaseTab)}">
        <!-- Mobile: bottom navigation -->
        <nav class="bottom-nav" aria-label="${t('tabs.label')}">
          ${mainTabs.map(item => html`
            <button
              class="bottom-nav-btn ${at === item.tab ? 'active' : ''}"
              aria-label="${t('tabs.view', { tab: item.label })}"
              aria-current="${at === item.tab ? 'page' : undefined}"
              @click="${() => this._selectTab(item.tab)}">
              <span class="nav-icon">${item.svg}</span>
              <span class="nav-label">${item.label}</span>
            </button>
          `)}
          <button
            class="bottom-nav-btn ${isMore ? 'active' : ''}"
            aria-label="${t('tabs.more')}"
            aria-expanded="${this._moreOpen}"
            aria-haspopup="menu"
            @click="${this._toggleMore}">
            <span class="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </span>
            <span class="nav-label">${t('tabs.more')}</span>
          </button>
        </nav>

        <!-- More bottom sheet backdrop -->
        <div
          class="more-sheet-backdrop ${this._moreOpen ? 'open' : ''}"
          @click="${this._closeMore}"
          @touchstart="${this._closeMore}"></div>

        <!-- More bottom sheet -->
        <div class="more-sheet ${this._moreOpen ? 'open' : ''}" role="menu">
          <div class="more-sheet-header">
            <span class="more-sheet-title">${t('tabs.more')}</span>
            <button class="more-sheet-close" @click="${this._closeMore}">${t('modal.close')}</button>
          </div>
          <div class="more-sheet-grid">
            ${MORE_TABS.map(tab => html`
              <button
                class="more-sheet-item"
                role="menuitem"
                @click="${() => this._selectTab(tab)}">
                <span class="ms-icon">${tab === 'calendar'
                  ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
                  : tab === 'stadiums'
                    ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 22h20L12 2Z"/><path d="M12 10l-2 6h4l-2-6Z"/></svg>`
                    : html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>`
                }</span>
                ${t(PHASE_TAB_KEYS[tab])}
              </button>
            `)}
          </div>
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
              <div class="seo-faq" aria-labelledby="seo-faq-title">
                <h2 id="seo-faq-title">${t('seo.faqTitle')}</h2>
                <details>
                  <summary>${t('seo.faqQ1')}</summary>
                  <div class="faq-answer">${t('seo.faqA1')}</div>
                </details>
                <details>
                  <summary>${t('seo.faqQ2')}</summary>
                  <div class="faq-answer">${t('seo.faqA2')}</div>
                </details>
                <details>
                  <summary>${t('seo.faqQ3')}</summary>
                  <div class="faq-answer">${t('seo.faqA3')}</div>
                </details>
                <details>
                  <summary>${t('seo.faqQ4')}</summary>
                  <div class="faq-answer">${t('seo.faqA4')}</div>
                </details>
                <details>
                  <summary>${t('seo.faqQ5')}</summary>
                  <div class="faq-answer">${t('seo.faqA5')}</div>
                </details>
                <details>
                  <summary>${t('seo.faqQ6')}</summary>
                  <div class="faq-answer">${t('seo.faqA6')}</div>
                </details>
              </div>
              <div class="seo-links">
                <strong>${t('seo.linksTitle')}:</strong>
                <a href="/porra-mundial-2026/">${t('seo.linkPorra')}</a>
                <a href="/plantilla-imprimir/">${t('seo.linkPlantilla')}</a>
                <a href="/simulador-eliminatorias/">${t('seo.linkSimulador')}</a>
                <a href="/mundial-para-clase/">${t('seo.linkClase')}</a>
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
          ` : at === 'groups' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

        <!-- Equipos (lazy) -->
        <div id="section-squads" class="section-squads ${at === 'squads' ? 'visible' : ''}">
          ${at === 'squads' && loaded.has('squads') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.squads.eyebrow')}</div>
              <div class="section-title">${t('section.squads.title')}</div>
            </div>
            <squads-view></squads-view>
          ` : at === 'squads' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

        <!-- Calendario (lazy) -->
        <div id="section-calendar" class="section-calendar ${at === 'calendar' ? 'visible' : ''}">
          ${at === 'calendar' && loaded.has('calendar') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.calendar.eyebrow')}</div>
              <div class="section-title">${t('section.calendar.title')}</div>
            </div>
            <calendar-view></calendar-view>
          ` : at === 'calendar' ? html`<div class="loading-spinner"></div>` : ''}
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
          ` : isKnockoutTab ? html`<div class="loading-spinner"></div>` : ''}
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
          ` : at === 'stadiums' ? html`<div class="loading-spinner"></div>` : ''}
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
          ` : at === 'coaches' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

        <!-- Guía del Mundial (lazy) -->
        <div
          id="section-guide"
          class="section-guide ${at === 'guide' ? 'visible' : ''}">
          ${at === 'guide' && loaded.has('guide') ? html`
            <guide-view></guide-view>
          ` : at === 'guide' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

        <!-- Liga (lazy) -->
        <div
          id="section-league"
          class="section-league ${at === 'league' ? 'visible' : ''}">
          ${at === 'league' && loaded.has('league') ? html`
            <leagues-view></leagues-view>
          ` : at === 'league' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

      </div>
    `;
  }
}


import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore, type ViewMode } from './store/tournament-store';
import { subscribeSlice } from './store/store-utils';
// Hero y match-modal se cargan síncronos (above-the-fold / modal global)
import './components/hero-view';
import './components/match-modal';
import './components/ad-block';
import { t, useLocaleStore } from './i18n';
import type { TranslationKey } from './i18n/es';
import { COMPETITION } from './data/competition';

type PhaseTab = 'hero' | 'groups' | 'matchday' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'coaches' | 'guide' | 'guide-print';

// Mapa de vista → módulo lazy
type LazyView = 'groups' | 'matchday' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'tv' | 'coaches' | 'guide' | 'guide-print';

const VIEW_IMPORTS: Record<LazyView, () => Promise<unknown>> = {
  groups:     () => import('./components/league-table-view'),
  matchday:   () => import('./components/matchday-view'),
  knockout:   () => import('./components/bracket-knockout'),
  squads:     () => import('./components/squads-view'),
  calendar:   () => import('./components/calendar-view'),
  stadiums:   () => import('./components/stadiums-view'),
  tv:         () => import('./components/broadcasting-view'),
  coaches:    () => import('./components/coaches-view'),
  guide:      () => import('./components/guide-view'),
  'guide-print': () => import('./components/guide-print-view'),
};

/** Mapea cada tab a la vista lazy que necesita (hero no necesita lazy) */
function tabToView(tab: PhaseTab): LazyView | null {
  if (tab === 'hero') return null;
  if (tab === 'groups') return 'groups';
  if (tab === 'matchday') return 'matchday';
  if (tab === 'knockout') return 'knockout';
  if (tab === 'squads') return 'squads';
  if (tab === 'calendar') return 'calendar';
  if (tab === 'stadiums') return 'stadiums';
  if (tab === 'coaches') return 'coaches';
  if (tab === 'guide') return 'guide';
  if (tab === 'guide-print') return 'guide-print';
  return null;
}

const PHASE_TAB_KEYS: Record<PhaseTab, TranslationKey> = {
  hero:      'tabs.hero',
  groups:    'tabs.table',
  matchday:  'tabs.matchday',
  knockout:  'tabs.knockout',
  squads:    'tabs.squads',
  calendar:  'tabs.calendar',
  stadiums:  'tabs.stadiums',
  coaches:   'tabs.coaches',
  guide:     'tabs.guide',
  'guide-print': 'tabs.guide',
};

/**
 * Una tab esta oculta cuando la competicion activa aun no contempla esa
 * superficie (COMPETITION.hiddenViews). Filtra la barra inferior, el swipe
 * y la restauracion por hash de una sola vez.
 */
function isHiddenTab(tab: PhaseTab): boolean {
  return (COMPETITION.hiddenViews as readonly string[]).includes(tab);
}

const MORE_TABS: PhaseTab[] = (['squads', 'calendar', 'stadiums', 'coaches'] as PhaseTab[])
  .filter(tab => !isHiddenTab(tab));

/** Orden de tabs para swipe */
const TAB_ORDER: PhaseTab[] = (['hero', 'groups', 'matchday', 'knockout'] as PhaseTab[])
  .filter(tab => !isHiddenTab(tab));

@customElement('bracket-view')
export class BracketView extends LitElement {
  @state() private _activeTab: PhaseTab = 'hero';
  @state() private _loadedViews = new Set<LazyView>();
  @state() private _loadingView: LazyView | null = null;
  @state() private _moreOpen = false;
  @state() private _viewMode: ViewMode = 'predictions';

  private _swipeStartX = 0;
  private _swipeStartY = 0;
  private _isSwiping = false;
  private _swipeBlocked = false;
  private _tabHistory: PhaseTab[] = ['hero'];
  private _unsubViewMode?: () => void;


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

    /* ─── View Mode Bar (predictions vs real + share) ─── */
    .view-mode-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 14px auto 10px;
      flex-wrap: wrap;
    }
    .view-mode-toggle {
      display: flex;
      gap: 3px;
      margin: 0;
      max-width: 360px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-pill);
      overflow: hidden;
      padding: 3px;
      background: var(--fill);
    }
    .share-trigger-btn {
      all: unset;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-pill);
      background: var(--accent);
      color: var(--on-accent);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: var(--shadow-sm);
      transition: opacity 0.15s, transform 0.1s;
    }
    .share-trigger-btn:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .view-mode-btn {
      flex: 1;
      padding: 9px 12px;
      border: none;
      border-radius: var(--radius-pill);
      background: transparent;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      color: var(--ink-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .view-mode-btn.active {
      background: var(--accent);
      color: var(--on-accent);
      box-shadow: var(--glow-accent-sm);
    }
    .view-mode-btn:not(.active):hover {
      background: var(--fill-soft);
      color: var(--ink);
    }
    .view-mode-btn.real.active {
      background: var(--retro-green);
      color: #04121c;
    }

    /* ─── Bottom Navigation (mobile) ─── */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 200;
      background: var(--chrome-bg);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-top: 1px solid var(--hairline);
      padding: 4px 0;
      padding-bottom: calc(4px + env(safe-area-inset-bottom));
      justify-content: space-around;
      align-items: stretch;
      box-shadow: 0 -8px 24px rgba(0,0,0,0.35);
    }
    .bottom-nav-btn {
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      flex: 1;
      padding: 8px 4px;
      min-width: 0;
      min-height: 52px;
      color: var(--ink-soft);
      font-family: var(--font-var);
      font-size: 10px;
      position: relative;
      transition: color 0.15s, background 0.12s;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .bottom-nav-btn:active {
      opacity: 0.7;
    }
    .bottom-nav-btn.active {
      background: color-mix(in srgb, var(--accent) 12%, transparent);
    }
    .bottom-nav-btn .nav-icon {
      font-size: 22px;
      line-height: 1;
      color: var(--ink-muted);
      transition: color 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bottom-nav-btn .nav-icon svg {
      display: block;
      width: 22px;
      height: 22px;
    }
    .bottom-nav-btn .nav-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.06em;
      color: var(--ink-muted);
      text-transform: uppercase;
      transition: color 0.15s;
    }
    .bottom-nav-btn.active .nav-icon,
    .bottom-nav-btn.active .nav-label {
      color: var(--accent);
    }
    .bottom-nav-btn.active::after {
      content: '';
      position: absolute;
      top: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 28px;
      height: 3px;
      background: var(--accent);
      border-radius: var(--radius-pill);
      box-shadow: 0 0 10px rgba(77,163,255,0.6);
    }

    /* ─── Botón central destacado (Bracket) — diseño pr-movil ─── */
    .bottom-nav-btn.center { justify-content: flex-start; }
    .bottom-nav-btn.center .nav-icon {
      width: 48px;
      height: 48px;
      margin-top: -18px;
      border-radius: 14px;
      background: linear-gradient(150deg, var(--accent), var(--accent-deep));
      border: 3px solid var(--paper);
      box-shadow: 0 8px 20px rgba(77,163,255,0.4);
      color: var(--on-accent);
      display: grid;
      place-items: center;
    }
    .bottom-nav-btn.center .nav-icon svg { color: var(--on-accent); }
    .bottom-nav-btn.center.active .nav-icon { background: linear-gradient(150deg, var(--accent-hover), var(--accent)); }
    .bottom-nav-btn.center.active .nav-icon svg { color: var(--on-accent); }
    .bottom-nav-btn.center .nav-label { color: var(--ink-muted); }
    .bottom-nav-btn.center.active .nav-label { color: var(--accent); }
    /* El medallón ya indica el activo — sin barra superior adicional */
    .bottom-nav-btn.center.active::after { display: none; }

    /* ─── More Bottom Sheet (mobile) ─── */
    .more-sheet-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 290;
      background: rgba(3,6,16,0.66);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
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
      z-index: 300;
      background: var(--paper-2);
      border-top: 1px solid var(--hairline-strong);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      box-shadow: 0 -16px 40px rgba(0,0,0,0.45);
      padding-bottom: calc(24px + env(safe-area-inset-bottom));
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
      border-bottom: 1px solid var(--hairline);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .more-sheet-title {
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--ink);
      letter-spacing: 0.04em;
    }
    .more-sheet-close {
      all: unset;
      cursor: pointer;
      padding: 7px 13px;
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      background: var(--fill);
      color: var(--ink-soft);
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
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ink-soft);
      background: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      min-height: 70px;
      box-sizing: border-box;
      transition: background 0.1s, border-color 0.1s, color 0.1s;
      text-align: center;
    }
    .more-sheet-item:active {
      background: color-mix(in srgb, var(--accent) 16%, transparent);
      border-color: var(--accent);
      color: var(--ink);
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
      border-bottom: 1px solid var(--hairline);
      margin-bottom: 24px;
    }
    .section-heading.knockout {
      border-bottom-style: solid;
    }
    .section-eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--accent);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .section-title {
      font-family: var(--font-var);
      font-size: 34px;
      font-weight: 800;
      text-transform: uppercase;
      line-height: 1;
      color: var(--ink);
    }

    .section-groups,
    .section-matchday,
    .knockout-sections,
    .section-stadiums,
    .section-squads,
    .section-calendar,
    .section-coaches,
    .section-guide,
    .section-guide-print,
    .section-tv,
    .section-league {
      display: none;
      scroll-margin-top: 110px;
    }
    .section-groups.visible,
    .section-matchday.visible,
    .knockout-sections.visible,
    .section-stadiums.visible,
    .section-squads.visible,
    .section-calendar.visible,
    .section-coaches.visible,
    .section-guide.visible,
    .section-guide-print.visible,
    .section-tv.visible,
      .section-league.visible {
      display: block;
      animation: viewFadeIn 0.2s ease both;
    }
    @keyframes viewFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: none; }
    }

    /* SEO Info Section - solo en hero */
    .seo-info {
      max-width: 1200px;
      margin: 60px auto 0;
      padding: 40px;
      background: var(--card-grad);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .seo-card h2 {
      font-family: var(--font-var);
      font-size: 24px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--ink);
      margin-bottom: 12px;
      border-bottom: 2px solid var(--accent);
      display: inline-block;
    }
    .seo-card p {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.6;
      color: var(--ink-muted);
    }

    .seo-faq {
      grid-column: 1 / -1;
      border-top: 1px dashed var(--hairline);
      padding-top: 32px;
    }
    .seo-faq h2 {
      font-family: var(--font-var);
      font-size: 24px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--ink);
      margin-bottom: 20px;
      border-bottom: 2px solid var(--accent);
      display: inline-block;
    }
    .seo-faq details {
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
      margin-bottom: 10px;
      background: var(--fill);
    }
    .seo-faq summary {
      font-family: var(--font-var);
      font-size: 15px;
      text-transform: uppercase;
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
      color: var(--accent);
      font-size: 11px;
    }
    .seo-faq details[open] summary::before {
      content: '▼ ';
    }
    .seo-faq details[open] summary {
      background: color-mix(in srgb, var(--accent) 14%, transparent);
    }
    .seo-faq .faq-answer {
      padding: 0 18px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      color: var(--ink-muted);
    }

    .seo-links {
      grid-column: 1 / -1;
      border-top: 1px dashed var(--hairline);
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
      color: var(--accent);
    }

    /* Franja de anuncio entre secciones */
    .ad-inline {
      margin: 32px 0;
      min-height: 90px;
    }

    @media (max-width: 768px) {
      .section-groups,
      .section-matchday,
      .knockout-section,
      .knockout-sections,
      .section-stadiums,
      .section-squads,
      .section-calendar,
      .section-coaches,
      .section-guide,
      .section-guide-print,
      .section-tv,
      .section-league {
        display: none;
      }
      .section-groups.visible,
      .section-matchday.visible,
      .knockout-section.visible,
      .knockout-sections.visible,
      .section-stadiums.visible,
      .section-squads.visible,
      .section-calendar.visible,
      .section-coaches.visible,
      .section-guide.visible,
      .section-guide-print.visible,
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
        padding: 6px 2px;
        min-height: 52px;
      }
      .bottom-nav-btn .nav-icon {
        font-size: 19px;
      }
      .bottom-nav-btn .nav-icon svg {
        width: 19px;
        height: 19px;
      }
      .bottom-nav-btn .nav-label {
        font-size: 8px;
        letter-spacing: 0.04em;
      }
      /* Medallón central: mantener tamaño usable en pantallas muy estrechas */
      .bottom-nav-btn.center .nav-icon { width: 44px; height: 44px; }
      .bottom-nav-btn.center .nav-icon svg { width: 22px; height: 22px; }
    }
  `;

  private unsubscribeLocale?: () => void;
  private _hashChangeHandler?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._viewMode = useTournamentStore.getState().viewMode;
    this._unsubViewMode = subscribeSlice(
      useTournamentStore,
      s => s.viewMode,
      (mode) => { this._viewMode = mode; }
    );
    this._ensureView('groups');

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
    this._unsubViewMode?.();
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
    }
    super.disconnectedCallback();
    this.removeEventListener('touchstart', this._onSwipeStart);
    this.removeEventListener('touchmove', this._onSwipeMove);
    this.removeEventListener('touchend', this._onSwipeEnd);
  }

  private async _handleShare() {
    const { openShareModal } = await import('./components/share-modal');
    openShareModal();
  }

  /** Sincroniza la pestaña activa con location.hash */
  private _restoreFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const validTabs: PhaseTab[] = (['hero', 'groups', 'matchday', 'knockout', 'squads', 'calendar', 'stadiums', 'coaches', 'guide', 'guide-print'] as PhaseTab[])
      .filter(tab => !isHiddenTab(tab));
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
    // Guarda unica: ninguna ruta (hash, swipe, evento navigate o click)
    // puede abrir una vista que la competicion activa aun no contempla.
    if (isHiddenTab(tab)) return;
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
    if (tab === 'guide-print') {
      const guidePrintEl = this.shadowRoot?.querySelector('guide-print-view') as HTMLElement & { goBack?: () => void } | null;
      guidePrintEl?.goBack?.();
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
      if (tab === 'matchday') targetId = 'section-matchday';
      if (tab === 'stadiums') targetId = 'section-stadiums';
      if (tab === 'squads') targetId = 'section-squads';
      if (tab === 'calendar') targetId = 'section-calendar';
      if (tab === 'coaches') targetId = 'section-coaches';
      if (tab === 'guide') targetId = 'section-guide';
      if (tab === 'guide-print') targetId = 'section-guide-print';

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
      // Umbral endurecido: requiere gesto más pronunciado para evitar falsos positivos
      if (dx > 36 && dx > dy * 2) {
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

    // En la vista knockout el bracket gestiona sus propios gestos de fase —
    // no cambiar de pestaña principal con swipe para evitar conflictos.
    if (this._activeTab === 'knockout') return;

    // Horizontal swipe between adjacent tabs
    const idx = TAB_ORDER.indexOf(this._activeTab);
    if (idx === -1) return;
    const nextIdx = dx < 0 ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= TAB_ORDER.length) return;
    this._moreOpen = false;
    this._selectTab(TAB_ORDER[nextIdx]);
  }

  render() {
    const allMainTabs: Array<{ tab: PhaseTab; icon: string; svg: unknown; label: string }> = [
      { tab: 'hero',   icon: '🏠', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12L12 3l9 9"/><path d="M5 10v10h14V10"/><rect x="9" y="14" width="2" height="6"/><rect x="13" y="14" width="2" height="6"/></svg>`, label: t('tabs.hero') },
      { tab: 'groups',   icon: '⚽', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`, label: t('tabs.table') },
      { tab: 'matchday', icon: '📅', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, label: t('tabs.matchday') },
      { tab: 'knockout', icon: '🏆', svg: html`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`, label: t('tabs.knockout') },
    ];
    const mainTabs = allMainTabs.filter(item => !isHiddenTab(item.tab));
    const at = this._activeTab;
    const loaded = this._loadedViews;
    const isKnockoutTab = at === 'knockout';
    const isMore = this._isMoreTab;

    return html`
      <div class="view-container" @navigate="${(e: CustomEvent) => this._selectTab(e.detail === 'awards' ? 'knockout' : e.detail as PhaseTab)}">
        ${(at === 'groups' || at === 'matchday') ? html`
          <div class="view-mode-bar">
            <div class="view-mode-toggle">
              <button 
                class="view-mode-btn ${this._viewMode === 'predictions' ? 'active' : ''}"
                @click=${() => useTournamentStore.getState().setViewMode('predictions')}>
                Mis Predicciones
              </button>
              <button 
                class="view-mode-btn real ${this._viewMode === 'real' ? 'active' : ''}"
                @click=${() => useTournamentStore.getState().setViewMode('real')}>
                Resultados Reales
              </button>
            </div>
            <button class="share-trigger-btn" @click="${this._handleShare}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              ${t('header.share')}
            </button>
          </div>
        ` : ''}
        <!-- Mobile: bottom navigation -->
        <nav class="bottom-nav" aria-label="${t('tabs.label')}">
          ${mainTabs.map(item => html`
            <button
              class="bottom-nav-btn ${at === item.tab ? 'active' : ''} ${item.tab === 'knockout' ? 'center' : ''}"
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
                <span class="ms-icon">${
                  tab === 'squads'
                    ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
                    : tab === 'calendar'
                      ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
                      : tab === 'stadiums'
                        ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="7"/><ellipse cx="12" cy="12" rx="6" ry="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`
                        : tab === 'coaches'
                          ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/><circle cx="7.5" cy="7.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M7.5 16.5l3-3 6 3.5"/></svg>`
                          : tab === 'guide'
                            ? html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`
                            : html`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6M3 20h18"/></svg>`
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
            <league-table-view></league-table-view>
            <div class="ad-inline">
              <ad-block></ad-block>
            </div>
          ` : at === 'groups' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

        <div
          id="section-matchday"
          class="section-matchday ${at === 'matchday' ? 'visible' : ''}">
          ${at === 'matchday' && loaded.has('matchday') ? html`
            <div class="section-heading">
              <div class="section-eyebrow">${t('section.matchday.eyebrow')}</div>
              <div class="section-title">${t('section.matchday.title')}</div>
            </div>
            <matchday-view></matchday-view>
          ` : at === 'matchday' ? html`<div class="loading-spinner"></div>` : ''}
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
              <div class="section-title">${COMPETITION.id === 'ucl-2027' ? '36 ESTADIOS · FASE LIGA' : t('section.stadiums.title')}</div>
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

        <!-- Guía (lazy) -->
        <div
          id="section-guide"
          class="section-guide ${at === 'guide' ? 'visible' : ''}">
          ${at === 'guide' && loaded.has('guide') ? html`
            <guide-view></guide-view>
          ` : at === 'guide' ? html`<div class="loading-spinner"></div>` : ''}
        </div>

        <!-- Guía Imprimible (lazy) -->
        <div
          id="section-guide-print"
          class="section-guide-print ${at === 'guide-print' ? 'visible' : ''}">
          ${at === 'guide-print' && loaded.has('guide-print') ? html`
            <guide-print-view></guide-print-view>
          ` : at === 'guide-print' ? html`<div class="loading-spinner"></div>` : ''}
        </div>


      </div>
    `;
  }
}


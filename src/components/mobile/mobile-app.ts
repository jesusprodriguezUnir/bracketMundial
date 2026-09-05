import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { t, toggleLocale, useLocaleStore } from '../../i18n';
import { onToast, type ToastEventDetail } from '../../lib/interaction';
import { useTournamentStore } from '../../store/tournament-store';
import { useAuthStore } from '../../store/auth-store';
import { subscribeUnpublished, getUnpublished, publishNow } from '../../lib/prediction-sync';
import { COMPETITION } from '../../data/competition';

// Vistas de bottom-nav (siempre disponibles)
import './mobile-home';
import '../league-table-view';
import '../matchday-view';

type MobileView =
  | 'home' | 'groups' | 'matchday' | 'bracket' | 'squads'
  | 'awards' | 'calendar' | 'stadiums' | 'coaches' | 'guide';

/** El shell movil llama 'bracket' a la vista que el resto de la app llama 'knockout'. */
const VIEW_ALIASES: Partial<Record<MobileView, string>> = { bracket: 'knockout' };

/** Una vista esta oculta cuando la competicion activa aun no la contempla. */
function isHiddenView(v: MobileView): boolean {
  return (COMPETITION.hiddenViews as readonly string[]).includes(VIEW_ALIASES[v] ?? v);
}

const MAIN_VIEWS: MobileView[] = (['home', 'groups', 'matchday'] as MobileView[])
  .filter(v => !isHiddenView(v));
const SHEET_VIEWS: MobileView[] = (['calendar', 'squads', 'coaches'] as MobileView[])
  .filter(v => !isHiddenView(v));
const ALL_VIEWS: MobileView[] = ([...MAIN_VIEWS, ...SHEET_VIEWS, 'bracket'] as MobileView[])
  .filter(v => !isHiddenView(v));

const LAZY_VIEWS: Record<string, () => Promise<unknown>> = {
  calendar: () => import('./mobile-calendar'),
  squads:   () => import('../squads-view'),
  coaches:  () => import('../coaches-view'),
  bracket:  () => import('../bracket-knockout'),
};

function validView(v: string): v is MobileView {
  return (ALL_VIEWS as string[]).includes(v);
}

/**
 * Shell del bracket móvil: header slim, bottom-nav con botón central,
 * bottom-sheet "Más" y sistema de vistas.
 * Activo solo en viewport ≤768px (conmutado por app-root.ts).
 */
@customElement('mobile-app')
export class MobileApp extends LitElement {
  @state() private _view: MobileView = 'home';
  @state() private _sheetOpen = false;
  @state() private _toastMsg = '';
  @state() private _loadedViews = new Set<MobileView>(MAIN_VIEWS as MobileView[]);
  @state() private _authEmail: string | null = null;
  @state() private _hasUnpublished = false;

  private _toastTimer?: ReturnType<typeof setTimeout>;
  private _unsubToast?: () => void;
  private _unsubLocale?: () => void;
  private _unsubAuth?: () => void;
  private _unsubUnpublished?: () => void;

  connectedCallback() {
    super.connectedCallback();
    // Restaurar vista desde hash / localStorage
    this._restoreView();
    window.addEventListener('hashchange', this._onHashChange);

    // Toast global
    this._unsubToast = onToast(this._onToast.bind(this));

    // Locale reactivo
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());

    // Auth
    this._authEmail = useAuthStore.getState().session?.user.email ?? null;
    this._unsubAuth = useAuthStore.subscribe(s => {
      this._authEmail = s.session?.user.email ?? null;
      this.requestUpdate();
    });

    // Unpublished indicator
    this._hasUnpublished = getUnpublished();
    this._unsubUnpublished = subscribeUnpublished(d => { this._hasUnpublished = d; });

    // Evento de navegación de vistas hijas
    this.addEventListener('mobile-navigate', this._onNavigate as EventListener);
    this.addEventListener('navigate', this._onStandardNavigate as EventListener);
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this._onHashChange);
    this._unsubToast?.();
    this._unsubLocale?.();
    this._unsubAuth?.();
    this._unsubUnpublished?.();
    this.removeEventListener('mobile-navigate', this._onNavigate as EventListener);
    this.removeEventListener('navigate', this._onStandardNavigate as EventListener);
    super.disconnectedCallback();
  }

  private _onHashChange = () => this._restoreView();

  private _onNavigate = (e: CustomEvent<string>) => {
    const v = e.detail;
    if (validView(v)) this._go(v);
  };

  private _onStandardNavigate = (e: CustomEvent<string>) => {
    const v = e.detail;
    let targetView = v;
    if (v === 'hero') {
      targetView = 'home';
    } else if (v === 'knockout') {
      targetView = 'bracket';
    }
    if (validView(targetView)) {
      this._go(targetView);
    }
  };

  private _restoreView() {
    let hash = window.location.hash.replace('#', '');
    if (hash === 'knockout') hash = 'bracket';
    if (hash === 'hero') hash = 'home';
    if (validView(hash) && hash !== this._view) {
      void this._go(hash as MobileView, false);
    } else {
      const saved = localStorage.getItem('bm-mobile-view');
      if (saved && validView(saved) && this._view === 'home') {
        void this._go(saved as MobileView, false);
      }
    }
  }

  private async _go(view: MobileView, updateHash = true) {
    this._sheetOpen = false;
    this._view = view;
    localStorage.setItem('bm-mobile-view', view);
    if (updateHash) {
      const cur = window.location.hash.replace('#', '');
      if (cur !== view) window.location.hash = `#${view}`;
    }
    // Lazy-load vistas secundarias
    if (!this._loadedViews.has(view) && LAZY_VIEWS[view]) {
      await LAZY_VIEWS[view]();
      this._loadedViews = new Set([...this._loadedViews, view]);
    }
    this.requestUpdate();
    // Scroll top del main
    this.shadowRoot?.querySelector('.app-main')?.scrollTo({ top: 0, behavior: 'instant' });
  }

  private _onToast(e: CustomEvent<ToastEventDetail>) {
    this._toastMsg = e.detail.message;
    requestAnimationFrame(() => {
      this.shadowRoot?.querySelector('.toast')?.classList.add('show');
    });
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.shadowRoot?.querySelector('.toast')?.classList.remove('show');
      setTimeout(() => { this._toastMsg = ''; this.requestUpdate(); }, 300);
    }, e.detail.duration ?? 2000);
  }

  private async _handleShare() {
    const { openShareModal } = await import('../../components/share-modal');
    openShareModal();
    this._sheetOpen = false;
  }

  private _handleExport() {
    void useTournamentStore.getState().exportExcel();
    this._sheetOpen = false;
  }

  private _handleImport() {
    const inp = this.shadowRoot?.querySelector<HTMLInputElement>('#mobile-file-import');
    inp?.click();
    this._sheetOpen = false;
  }

  private _handleImportFile(e: Event) {
    const inp = e.target as HTMLInputElement;
    if (!inp.files?.length) return;
    void useTournamentStore.getState().importExcel(inp.files[0]);
    inp.value = '';
  }

  private _toggleTheme() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const next = isDark ? 'light' : 'dark';
    if (next === 'dark') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    localStorage.setItem('bm-theme', next);
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = next === 'dark' ? '#070a18' : '#f4f2ec';
    this.requestUpdate();
  }

  private async _handleAuth() {
    this._sheetOpen = false;
    const { openAuthModal } = await import('../../components/auth-modal');
    openAuthModal();
  }

  private async _handlePublish() {
    this._sheetOpen = false;
    await publishNow();
  }

  private get _isDark() { return document.documentElement.dataset.theme === 'dark'; }

  private _navActive(v: string) { return this._view === v || (v === 'more' && SHEET_VIEWS.includes(this._view as MobileView)); }

  /** Render de la vista activa dentro del main */
  private _renderView() {
    const v = this._view;
    const loaded = this._loadedViews;

    // Vistas nativas móviles (siempre cargadas)
    if (v === 'home')   return html`<mobile-home class="view-slot active"></mobile-home>`;
    if (v === 'groups') return html`<league-table-view class="view-slot active"></league-table-view>`;
    if (v === 'matchday') return html`<matchday-view class="view-slot active"></matchday-view>`;

    // Vistas secundarias (reusan los componentes existentes)
    if (!loaded.has(v)) {
      return html`<div class="loading-spinner"></div>`;
    }
    if (v === 'calendar') return html`
      <div class="secondary-view">
        <div class="section-heading">
          <div class="section-eyebrow">${t('section.calendar.eyebrow')}</div>
          <div class="section-title">${t('section.calendar.title')}</div>
        </div>
        <mobile-calendar></mobile-calendar>
      </div>`;
    if (v === 'squads') return html`
      <div class="secondary-view">
        <div class="section-heading">
          <div class="section-eyebrow">${t('section.squads.eyebrow')}</div>
          <div class="section-title">${t('section.squads.title')}</div>
        </div>
        <squads-view></squads-view>
      </div>`;
    if (v === 'coaches') return html`
      <div class="secondary-view">
        <div class="section-heading">
          <div class="section-eyebrow">${t('section.coaches.eyebrow')}</div>
          <div class="section-title">${t('section.coaches.title')}</div>
        </div>
        <coaches-view></coaches-view>
      </div>`;
    if (v === 'bracket') return html`
      <div class="secondary-view">
        <div class="section-heading">
          <div class="section-eyebrow">${t('section.knockout.eyebrow')}</div>
          <div class="section-title">${t('section.knockout.title')}</div>
        </div>
        <bracket-knockout></bracket-knockout>
      </div>`;

    return html``;
  }

  static readonly styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      background: transparent;
      overflow: hidden;
      position: relative;
    }

    /* ── Header slim Champions ── */
    .app-header {
      flex-shrink: 0;
      height: 56px;
      background: linear-gradient(180deg, rgba(9, 15, 42, 0.94) 0%, rgba(5, 8, 22, 0.90) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(61, 149, 255, 0.20);
      box-shadow: 0 4px 18px rgba(0, 2, 16, 0.45);
      display: flex;
      align-items: center;
      padding: 0 8px 0 14px;
      gap: 10px;
      z-index: 50;
      padding-top: env(safe-area-inset-top, 0);
    }
    .logo-lockup {
      display: flex;
      align-items: center;
      gap: 9px;
      text-decoration: none;
      flex: 1;
      min-width: 0;
    }
    .logo-crest {
      width: 34px; height: 34px;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      background: linear-gradient(150deg, var(--accent), var(--accent-deep));
      border: 1px solid var(--hairline-strong);
      display: grid;
      place-items: center;
    }
    .logo-crest::after {
      content: "";
      width: 13px; height: 13px;
      border-radius: 3px;
      background: var(--paper);
      transform: rotate(45deg);
    }
    .logo-text { display: flex; flex-direction: column; line-height: 0.82; min-width: 0; }
    .logo-main {
      font-family: var(--font-var);
      font-size: 19px;
      font-weight: 800;
      color: var(--on-dark);
      letter-spacing: -0.02em;
    }
    .logo-sub {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--accent);
      letter-spacing: 0.18em;
      margin-top: 3px;
    }
    .header-btn {
      all: unset;
      cursor: pointer;
      width: 44px; height: 44px;
      display: grid;
      place-items: center;
      color: var(--on-dark-soft);
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .header-btn:active { background: color-mix(in srgb, var(--accent) 18%, transparent); }
    .header-btn svg { width: 22px; height: 22px; }

    /* ── Main scroll ── */
    .app-main {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      position: relative;
      /* Avoid content hiding behind bottom-nav */
      padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
    }
    .app-main::-webkit-scrollbar { width: 0; }

    .view-slot { display: block; animation: viewIn 0.25s ease both; }
    @keyframes viewIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }

    .secondary-view { padding: 0 0 32px; }
    .section-heading {
      padding: 18px 16px 14px;
      border-bottom: 1px solid var(--hairline);
      margin-bottom: 16px;
    }
    .section-eyebrow {
      font-family: var(--font-mono);
      font-size: 9px; color: var(--accent);
      letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 5px;
    }
    .section-title {
      font-family: var(--font-var);
      font-size: 30px; font-weight: 800; text-transform: uppercase;
      line-height: 0.95; color: var(--ink);
    }

    /* ── Spinner ── */
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-spinner {
      display: flex; align-items: center; justify-content: center;
      padding: 60px 20px; min-height: 120px;
    }
    .loading-spinner::after {
      content: '';
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 3px solid var(--hairline-strong);
      border-top-color: var(--accent);
      animation: spin 0.7s linear infinite;
    }

    /* ── Bottom nav Champions ── */
    .bottom-nav {
      flex-shrink: 0;
      height: calc(64px + env(safe-area-inset-bottom, 0px));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: linear-gradient(0deg, rgba(7, 12, 34, 0.96) 0%, rgba(5, 8, 22, 0.92) 100%);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(61, 149, 255, 0.20);
      box-shadow: 0 -8px 26px rgba(0, 2, 16, 0.55);
      display: flex;
      align-items: stretch;
      z-index: 50;
      position: fixed;
      bottom: 0; left: 0; right: 0;
    }
    .nav-item {
      all: unset;
      cursor: pointer;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: var(--on-dark-soft);
      position: relative;
      transition: color 0.1s;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-item svg { width: 23px; height: 23px; }
    .nav-item .nav-label {
      font-family: var(--font-mono);
      font-size: 8.5px; letter-spacing: 0.08em;
      text-transform: uppercase; font-weight: 700;
    }
    .nav-item.active { color: var(--accent); }
    .nav-item.active::before {
      content: "";
      position: absolute;
      top: -1px; left: 22%; right: 22%;
      height: 3px;
      border-radius: var(--radius-pill);
      background: var(--accent);
      box-shadow: 0 0 10px rgba(77,163,255,0.6);
    }
    /* Botón central (Bracket) */
    .nav-item.center { color: var(--on-accent); }
    .nav-icon-wrap {
      width: 50px; height: 50px;
      margin-top: -16px;
      border-radius: 16px;
      background: linear-gradient(150deg, var(--accent), var(--accent-deep));
      border: 3px solid var(--paper);
      display: grid;
      place-items: center;
      box-shadow: 0 8px 20px rgba(77,163,255,0.4);
    }
    .nav-item.center.active::before { display: none; }
    .nav-item.center.active .nav-icon-wrap { background: linear-gradient(150deg, var(--accent-hover), var(--accent)); }
    .nav-item.center.active .nav-label { color: var(--accent); }
    .nav-item.center .nav-label { color: var(--on-dark-soft); }

    /* ── Scrim ── */
    .scrim {
      position: fixed; inset: 0;
      background: rgba(3,6,16,0.66);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      z-index: 80;
      display: none; opacity: 0;
      transition: opacity 0.2s;
    }
    .scrim.open { display: block; opacity: 1; }

    /* ── Bottom sheet (Más) ── */
    .sheet {
      position: fixed;
      left: 0; right: 0; bottom: 0;
      background: var(--paper-2);
      border-top: 1px solid var(--hairline-strong);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      box-shadow: 0 -16px 40px rgba(0,0,0,0.45);
      z-index: 85;
      transform: translateY(100%);
      transition: transform 0.25s cubic-bezier(0.2,0.8,0.2,1);
      padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      max-height: 86%;
      overflow-y: auto;
    }
    .sheet.open { transform: translateY(0); }
    .sheet-handle { width: 44px; height: 5px; border-radius: var(--radius-pill); background: var(--ink-muted); margin: 12px auto 4px; opacity: 0.5; }
    .sheet-title { font-family: var(--font-var); font-size: 20px; font-weight: 800; text-transform: uppercase; padding: 8px 18px 4px; color: var(--ink); }
    .sheet-section-label {
      font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em;
      color: var(--accent); text-transform: uppercase; padding: 14px 18px 6px;
    }
    .sheet-item {
      all: unset; cursor: pointer; box-sizing: border-box;
      display: flex; align-items: center; gap: 13px;
      padding: 14px 18px; width: 100%;
      border-top: 1px solid var(--hairline);
      font-family: var(--font-body); font-weight: 700; font-size: 15px; color: var(--ink-soft);
      min-height: 52px;
      touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    .sheet-item:active { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--ink); }
    .si-glyph {
      width: 36px; height: 36px; flex-shrink: 0;
      display: grid; place-items: center;
      border-radius: var(--radius-sm);
      border: 1px solid var(--hairline); background: var(--fill);
      font-size: 17px;
    }
    .si-arrow { margin-left: auto; color: var(--ink-muted); font-family: var(--font-mono); }
    .si-sub {
      font-family: var(--font-mono); font-size: 9px;
      color: var(--ink-muted); font-weight: 400; margin-top: 2px; letter-spacing: 0.04em;
    }
    .si-text { display: flex; flex-direction: column; min-width: 0; }

    /* ── Toast ── */
    .toast {
      position: fixed;
      left: 50%; bottom: calc(72px + env(safe-area-inset-bottom, 0px) + 16px);
      transform: translateX(-50%) translateY(12px);
      background: var(--chrome-bg);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      color: var(--on-dark);
      border: 1px solid var(--accent);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
      padding: 11px 18px; z-index: 95;
      opacity: 0; pointer-events: none;
      transition: opacity 0.2s, transform 0.2s;
      white-space: nowrap; max-width: 86%;
      overflow: hidden; text-overflow: ellipsis;
    }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  `;

  render() {
    const sheetOpen = this._sheetOpen;
    const isDark = this._isDark;

    return html`
      <!-- Header -->
      <header class="app-header">
        <a class="logo-lockup" href="/" aria-label="Bracket Champions">
          <div class="logo-crest"></div>
          <div class="logo-text">
            <span class="logo-main">BRACKET</span>
            <span class="logo-sub">★ CHAMPIONS · 26/27 ★</span>
          </div>
        </a>
        <button class="header-btn" aria-label="${t('header.share')}" @click="${this._handleShare}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/>
            <line x1="8.3" y1="10.7" x2="15.7" y2="6.3"/><line x1="8.3" y1="13.3" x2="15.7" y2="17.7"/>
          </svg>
        </button>
        <button class="header-btn" aria-label="${t('tabs.more')}" @click="${() => { this._sheetOpen = !sheetOpen; }}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
            <line x1="4" y1="7" x2="20" y2="7"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="17" x2="20" y2="17"/>
          </svg>
        </button>
      </header>

      <!-- Main -->
      <main class="app-main" role="main">
        ${this._renderView()}
      </main>

      <!-- Bottom nav -->
      <nav class="bottom-nav" aria-label="${t('tabs.label')}">
        <button class="nav-item ${this._navActive('home') ? 'active' : ''}" @click="${() => this._go('home')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>
          </svg>
          <span class="nav-label">${t('tabs.hero')}</span>
        </button>
        <button class="nav-item ${this._navActive('groups') ? 'active' : ''}" @click="${() => this._go('groups')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
            <rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/>
            <rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>
          </svg>
          <span class="nav-label">${t('tabs.table')}</span>
        </button>
        <button class="nav-item center ${this._navActive('matchday') ? 'active' : ''}" @click="${() => this._go('matchday')}">
          <div class="nav-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span class="nav-label">${t('tabs.matchday')}</span>
        </button>
        <button class="nav-item" @click="${this._handleShare}" aria-label="${t('header.share')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span class="nav-label">${t('header.share')}</span>
        </button>
        <button class="nav-item ${this._navActive('more') ? 'active' : ''}" @click="${() => { this._sheetOpen = true; }}">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          <span class="nav-label">${t('tabs.more')}</span>
        </button>
      </nav>

      <!-- Scrim -->
      <div class="scrim ${sheetOpen ? 'open' : ''}" @click="${() => { this._sheetOpen = false; }}"></div>

      <!-- Sheet "Más" -->
      <div class="sheet ${sheetOpen ? 'open' : ''}" role="dialog" aria-label="${t('tabs.more')}">
        <div class="sheet-handle"></div>
        <div class="sheet-title">${t('tabs.more')}</div>

        ${(() => {
          const locale = useLocaleStore.getState().locale;
          return html`
            <div class="sheet-section-label">${locale === 'es' ? 'Explorar' : 'Explore'}</div>
            <button class="sheet-item" @click="${() => this._go('calendar')}">
              <span class="si-glyph">🗓️</span>
              <span class="si-text">
                <span>${t('tabs.calendar')}</span>
                <span class="si-sub">${locale === 'es' ? '144 partidos · 8 jornadas' : '144 matches · 8 matchdays'}</span>
              </span>
              <span class="si-arrow">›</span>
            </button>
            <button class="sheet-item" @click="${() => this._go('squads')}">
              <span class="si-glyph">👥</span>
              <span class="si-text">
                <span>${t('tabs.squads')}</span>
                <span class="si-sub">${locale === 'es' ? '36 clubes y plantillas' : '36 clubs & squads'}</span>
              </span>
              <span class="si-arrow">›</span>
            </button>
            <button class="sheet-item" @click="${() => this._go('coaches')}">
              <span class="si-glyph">👔</span>
              <span class="si-text">
                <span>${t('tabs.coaches')}</span>
                <span class="si-sub">${locale === 'es' ? '36 entrenadores' : '36 coaches'}</span>
              </span>
              <span class="si-arrow">›</span>
            </button>
            <div class="sheet-section-label">${locale === 'es' ? 'Tu predicción' : 'Your prediction'}</div>
            <button class="sheet-item" @click="${() => this._go('awards')}">
              <span class="si-glyph">🏅</span>
              <span class="si-text">
                <span>${locale === 'es' ? 'Premios individuales' : 'Individual awards'}</span>
                <span class="si-sub">${locale === 'es' ? 'Goleador y MVP del torneo' : 'Top scorer & tournament MVP'}</span>
              </span>
              <span class="si-arrow">›</span>
            </button>
            <button class="sheet-item" @click="${this._handleShare}">
              <span class="si-glyph">↗</span>
              <span class="si-text">
                <span>${t('header.share')}</span>
                <span class="si-sub">${locale === 'es' ? 'Genera un enlace' : 'Generate a link'}</span>
              </span>
            </button>
            <button class="sheet-item" @click="${this._handleExport}">
              <span class="si-glyph">⤓</span>
              <span class="si-text">
                <span>${t('header.excel')}</span>
                <span class="si-sub">${locale === 'es' ? 'Exportar como archivo' : 'Export as file'}</span>
              </span>
            </button>
            <button class="sheet-item" @click="${this._handleImport}">
              <span class="si-glyph">⤒</span>
              <span class="si-text">
                <span>${t('header.importExcel')}</span>
                <span class="si-sub">${locale === 'es' ? 'Cargar predicción' : 'Load prediction'}</span>
              </span>
            </button>
            ${this._authEmail ? html`
              <button class="sheet-item" @click="${this._handlePublish}">
                <span class="si-glyph">☁</span>
                <span class="si-text">
                  <span>${locale === 'es' ? 'Publicar' : 'Publish'}${this._hasUnpublished ? ' ●' : ''}</span>
                  <span class="si-sub">${this._authEmail}</span>
                </span>
              </button>
            ` : ''}

            <div class="sheet-section-label">${locale === 'es' ? 'Ajustes' : 'Settings'}</div>
            <button class="sheet-item" @click="${() => { toggleLocale(); this._sheetOpen = false; }}">
              <span class="si-glyph">🌐</span>
              <span class="si-text">
                <span>${t('header.langToggle')}</span>
                <span class="si-sub">Español · English</span>
              </span>
            </button>
            <button class="sheet-item" @click="${this._toggleTheme}">
              <span class="si-glyph">${isDark ? '☀️' : '🌙'}</span>
              <span class="si-text">
                <span>${isDark ? t('header.dayTitle') : t('header.nightTitle')}</span>
                <span class="si-sub">${locale === 'es' ? `Tema ${isDark ? 'claro' : 'oscuro'}` : `${isDark ? 'Light' : 'Dark'} theme`}</span>
              </span>
            </button>
            ${this._authEmail
              ? html`<button class="sheet-item" @click="${this._handleAuth}">
                  <span class="si-glyph">👤</span>
                  <span class="si-text">
                    <span>${t('account.signOut')}</span>
                    <span class="si-sub">${this._authEmail}</span>
                  </span>
                </button>`
              : html`<button class="sheet-item" @click="${this._handleAuth}">
                  <span class="si-glyph">👤</span>
                  <span class="si-text">
                    <span>${t('account.signIn')}</span>
                    <span class="si-sub">${locale === 'es' ? 'Sincroniza tu bracket' : 'Sync your bracket'}</span>
                  </span>
                </button>`}
          `;
        })()}
      </div>

      <!-- Toast -->
      ${this._toastMsg ? html`<div class="toast" role="status" aria-live="polite">${this._toastMsg}</div>` : ''}

      <!-- Input de importación oculto -->
      <input type="file" id="mobile-file-import" style="display:none" accept=".xlsx" @change="${this._handleImportFile}">
    `;
  }
}

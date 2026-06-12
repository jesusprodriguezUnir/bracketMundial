import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './bracket-view';
import './components/logo-crest';
import { useTournamentStore } from './store/tournament-store';
import { subscribeSlice } from './store/store-utils';
import { t, toggleLocale, useLocaleStore } from './i18n';
import { useAuthStore, waitForAuthReady, popPendingInviteHash } from './store/auth-store';
import { onToast, showToast, type ToastEventDetail } from './lib/interaction';
import { refreshOfficialResults, subscribeOfficialResults } from './lib/official-results';
import { hasMatchDatePassed } from './lib/league-fixture';
import './components/ad-block';

/** Media query para conmutación desktop ↔ móvil */
const MQ_MOBILE = window.matchMedia('(max-width: 768px)');
let _mobileImportDone = false;
async function ensureMobileApp() {
  if (_mobileImportDone) return;
  _mobileImportDone = true;
  await import('./components/mobile/mobile-app');
}

type PhaseTab = 'hero' | 'groups' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'coaches' | 'guide' | 'league';

const PHASE_TABS: PhaseTab[] = ['hero', 'groups', 'knockout', 'squads', 'calendar', 'stadiums', 'coaches', 'guide', 'league'];

function hashToTab(hash: string): PhaseTab | null {
  const clean = hash.replace('#', '');
  if (PHASE_TABS.includes(clean as PhaseTab)) return clean as PhaseTab;
  return null;
}

@customElement('app-root')
export class AppRoot extends LitElement {
  private unsubscribeStore?: () => void;
  private unsubscribeLocale?: () => void;

  /** true cuando el viewport es ≤768px — activa el shell móvil dedicado */
  @state() private _isMobile = MQ_MOBILE.matches;
  private _mqListener = (e: MediaQueryListEvent) => {
    this._isMobile = e.matches;
    if (e.matches) void ensureMobileApp();
  };

  @state() private _isOffline = !navigator.onLine;
  @state() private _toastMessage = '';
  @state() private _calendarMenuOpen = false;
  @state() private _shopMenuOpen = false;
  @state() private _moreMenuOpen = false;
  @state() private _activeTab: PhaseTab = 'hero';
  @state() private _authEmail: string | null = null;
  private _unsubAuth?: () => void;
  private _toastTimer: ReturnType<typeof setTimeout> | null = null;
  private _unsubscribeToast?: () => void;
  private _hashChangeHandler?: () => void;
  private _processedInviteHash = '';

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    .shell {
      min-height: 100vh;
      position: relative;
    }

    /* ── Topbar oscura ── */
    .topbar {
      display: flex;
      flex-direction: column;
      background: var(--surface-dark);
      position: sticky;
      top: 0;
      z-index: 110;
      padding-top: env(safe-area-inset-top);
    }

    .topbar-main {
      display: flex;
      align-items: stretch;
      min-height: 52px;
    }

    /* ── Bloque logo lockup ── */
    .logo-lockup {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 20px 6px 18px;
      flex-shrink: 0;
      text-decoration: none;
      margin-right: 32px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #E84B1A;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
    }
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .logo-main {
      font-family: var(--font-var);
      font-size: 14px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 0.04em;
      line-height: 1;
    }
    .logo-sub {
      font-family: var(--font-var);
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.75);
      letter-spacing: 0.1em;
      line-height: 1;
    }

    /* ── Stats pill-badges ── */
    .topbar-stats {
      display: flex;
      align-items: center;
      padding: 0 18px;
      gap: 20px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }
    .stat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .stat-num {
      font-family: var(--font-var);
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1;
    }
    .stat-lbl {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1;
    }
    .stat-sep {
      color: rgba(255,255,255,0.2);
      font-family: var(--font-mono);
      font-size: 14px;
      user-select: none;
      flex-shrink: 0;
    }

    /* ── Header actions ── */
    .header-actions {
      display: flex;
      align-items: stretch;
      margin-left: auto;
      flex-shrink: 0;
    }
    .header-actions > button,
    .header-actions > a.header-link {
      all: unset;
      cursor: pointer;
      padding: 0 14px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      color: rgba(255,255,255,0.75);
      background: transparent;
      transition: background 0.15s, color 0.15s;
      text-decoration: none;
      box-sizing: border-box;
      white-space: nowrap;
    }
    @media (hover: hover) {
      .header-actions > button:hover {
        background: rgba(255,255,255,0.08);
        color: #FFFFFF;
      }
    }
    .ha-btn-sm {
      padding: 0 10px !important;
      font-size: 14px !important;
    }
    /* Primary CTA — Compartir */
    .ha-btn-primary {
      background: #E84B1A !important;
      color: #FFFFFF !important;
      border-radius: 6px !important;
      margin: 8px 4px;
      padding: 0 16px !important;
      font-weight: 700 !important;
      border: none !important;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    @media (hover: hover) {
      .ha-btn-primary:hover {
        background: #C43A14 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.25);
      }
    }
    /* Secondary CTA — Excel ghost */
    .ha-btn-ghost {
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 4px;
      margin: 8px 4px;
      padding: 0 14px !important;
    }
    @media (hover: hover) {
      .ha-btn-ghost:hover {
        border-color: rgba(255,255,255,0.55);
        color: #FFFFFF !important;
      }
    }

    /* ── More (...) menu ── */
    .dropdown-wrap {
      position: relative;
      display: flex;
      align-items: stretch;
    }
    .more-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      min-width: 220px;
      background: var(--surface-dark);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
      z-index: 200;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dropdown-section {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid rgba(236,223,192,0.1);
    }
    .dropdown-section:last-child {
      border-bottom: none;
    }
    .dropdown-section > span {
      padding: 8px 14px 4px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: #E84B1A;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 700;
    }
    .more-dropdown button,
    .more-dropdown a {
      all: unset;
      cursor: pointer;
      padding: 10px 14px;
      font-family: var(--font-body);
      font-size: 13px;
      color: rgba(255,255,255,0.75);
      text-align: left;
      transition: background 0.1s;
      text-decoration: none;
      box-sizing: border-box;
      display: block;
    }
    @media (hover: hover) {
      .more-dropdown button:hover,
      .more-dropdown a:hover {
        background: rgba(255,255,255,0.08);
        color: #FFFFFF;
      }
    }

    /* ── Nav tabs integradas en el header ── */
    .topbar-nav {
      display: flex;
      border-top: 1px solid rgba(255,255,255,0.1);
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .topbar-nav::-webkit-scrollbar { display: none; }
    .topbar-nav-btn {
      all: unset;
      cursor: pointer;
      padding: 12px 18px;
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.05em;
      color: rgba(255,255,255,0.55);
      white-space: nowrap;
      flex-shrink: 0;
      transition: color 0.15s, background 0.15s, border-color 0.15s;
      border-bottom: 3px solid transparent;
      display: flex;
      align-items: center;
    }
    .topbar-nav-btn:first-child { padding-left: 20px; }
    @media (hover: hover) {
      .topbar-nav-btn:hover {
        color: rgba(255,255,255,0.85);
        background: rgba(255,255,255,0.08);
      }
    }
    .topbar-nav-btn.active {
      color: #FFFFFF;
      font-weight: 700;
      border-bottom-color: #E84B1A;
    }

    /* ── Content ── */
    .content {
      max-width: 1600px;
      margin: 0 auto;
      padding: 10px 20px 24px;
    }

    /* ── Offline banner ── */
    .offline-banner {
      background: var(--retro-yellow);
      color: var(--ink);
      text-align: center;
      padding: 6px 16px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.06em;
      border-bottom: 2px solid var(--ink);
      position: sticky;
      top: 88px;
      z-index: 89;
    }

    /* ── Tournament progress bar ── */
    .progress-bar {
      height: 5px;
      background: rgba(26,25,51,0.2);
      position: sticky;
      top: 56px;
      z-index: 109;
    }
    .progress-fill {
      height: 100%;
      background: var(--retro-yellow);
      transition: width 0.4s ease;
      box-shadow: 0 0 6px rgba(240,176,33,0.5);
    }

    /* ── Footer ── */
    .site-footer {
      border-top: 4px solid var(--ink);
      background: var(--paper-2);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 14px 32px;
      margin-top: 40px;
    }
    .footer-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .footer-social {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-social a,
    .footer-email {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.05em;
      text-decoration: none;
      color: var(--ink);
      border: 2px solid var(--ink);
      padding: 4px 10px;
      box-shadow: 2px 2px 0 var(--ink);
      transition: background 0.1s, box-shadow 0.1s, transform 0.1s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 44px;
      justify-content: center;
    }
    @media (hover: hover) {
      .footer-social a:hover,
      .footer-email:hover {
        background: var(--retro-yellow);
        box-shadow: 3px 3px 0 var(--ink);
        transform: translate(-1px, -1px);
      }
    }
    .footer-sep {
      color: var(--dim);
      font-family: var(--font-mono);
      font-size: 14px;
      user-select: none;
    }
    .footer-copy {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    /* ── Ad strips ── */
    .ad-strip {
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
      padding: 0 20px;
      box-sizing: border-box;
      min-height: 0;
    }

    /* ── Mobile ── */
    @media (max-width: 768px) {
      .topbar-stats {
        display: none;
      }
      .topbar-nav {
        display: none;
      }
      .content {
        padding: 10px 12px;
        padding-bottom: calc(12px + env(safe-area-inset-bottom));
      }
      .logo-main {
        font-size: 12px;
      }
      .logo-sub {
        font-size: 9px;
      }
      .logo-icon {
        width: 34px;
        height: 34px;
        font-size: 17px;
      }
      .logo-lockup {
        padding: 4px 12px 4px 12px;
        gap: 8px;
        margin-right: 0;
      }
      .header-actions {
        overflow: hidden;
      }
      .header-actions > button,
      .header-actions > a.header-link {
        padding: 0 10px;
        font-size: 11px;
      }
      .ha-btn-primary {
        margin: 6px 2px;
        padding: 0 12px !important;
        font-size: 11px !important;
      }
      .ha-btn-ghost {
        display: none;
      }
      .site-footer {
        flex-direction: column;
        align-items: flex-start;
        padding: 14px 16px;
        padding-bottom: calc(14px + env(safe-area-inset-bottom));
        gap: 12px;
      }
      .footer-section {
        flex-direction: column;
        align-items: flex-start;
      }
      .footer-social {
        flex-wrap: wrap;
      }
      .footer-sep { display: none; }
      .footer-email {
        word-break: break-word;
        max-width: 100%;
      }
      .footer-copy { margin-left: 0; }
      .ad-strip {
        padding: 0 12px;
        min-height: 0;
      }
      .progress-bar { top: 48px; }
      .offline-banner { top: 48px; }
      .more-dropdown { min-width: 180px; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    // Registrar media query para shell móvil
    MQ_MOBILE.addEventListener('change', this._mqListener);
    if (MQ_MOBILE.matches) void ensureMobileApp();

    window.addEventListener('online', this._onOnline);
    window.addEventListener('offline', this._onOffline);
    window.addEventListener('click', this._closeMenusOnOutsideClick);
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => {
        const gp = s.groupMatches.filter(m => m.scoreA !== null).length;
        const kp = Object.values(s.knockoutMatches).filter(m => m.isPlayed).length;
        return gp + kp;
      },
      () => this.requestUpdate(),
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._unsubAuth = useAuthStore.subscribe(s => {
      const hadNoEmail = !this._authEmail;
      this._authEmail = s.session?.user.email ?? null;
      this.requestUpdate();
      // Si acaba de iniciar sesión y hay un hash de invitación pendiente, reintentarlo.
      if (this._authEmail && hadNoEmail) {
        const pending = window.location.hash;
        const hasPendingHash = pending.startsWith('#league/join/') || pending.startsWith('#lg=');
        if (hasPendingHash && pending !== this._processedInviteHash) {
          this._loadSharedBracketIfPresent();
        }
      }
    });
    this._authEmail = useAuthStore.getState().session?.user.email ?? null;

    this._syncTabFromHash();
    this._hashChangeHandler = () => {
      this._syncTabFromHash();
      this.requestUpdate();
      const h = window.location.hash;
      if ((h.startsWith('#league/join/') || h.startsWith('#lg=')) && h !== this._processedInviteHash) {
        this._loadSharedBracketIfPresent();
      }
    };
    window.addEventListener('hashchange', this._hashChangeHandler);

    this._loadSharedBracketIfPresent();
    this._unsubscribeToast = onToast(this._onToast.bind(this));

    // Resultados oficiales: cargar al arrancar y re-aplicar en cada refresco.
    // Con el Mundial ya en marcha, la app arranca en "Resultados Reales"
    // (el usuario puede volver a "Mis Predicciones" durante la sesión).
    this._unsubOfficialResults = subscribeOfficialResults(bracket => {
      const store = useTournamentStore.getState();
      store.applyOfficialResults(bracket);
      if (!this._realModeForced && hasMatchDatePassed('M1')) {
        this._realModeForced = true;
        store.setViewMode('real');
      }
    });
    void refreshOfficialResults();
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  override firstUpdated() {
    const splash = document.getElementById('app-splash');
    if (splash) {
      requestAnimationFrame(() => {
        splash.classList.add('fade-out');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      });
    }
    const landing = document.getElementById('seo-landing');
    if (landing) {
      landing.remove();
    }
  }

  private _syncTabFromHash() {
    const tab = hashToTab(window.location.hash);
    if (tab && tab !== this._activeTab) {
      this._activeTab = tab;
    }
  }

  private _selectTab(tab: PhaseTab) {
    this._activeTab = tab;
    this._moreMenuOpen = false;
    if (window.location.hash !== `#${tab}`) {
      window.location.hash = `#${tab}`;
    }
  }

  private async _loadSharedBracketIfPresent() {
    // Primero: recuperar hash de invitación guardado en sessionStorage por _cleanAuthParams
    // (ocurre cuando el usuario llegó con un magic-link que contenía también #league/join/).
    const pendingHash = popPendingInviteHash();
    if (pendingHash && pendingHash !== this._processedInviteHash) {
      history.replaceState(null, '', window.location.pathname + pendingHash);
    }

    const hash = window.location.hash;

    // Cloud league join: #league/join/<uuid>
    if (hash.startsWith('#league/join/')) {
      // Marcar como procesado antes de await para evitar doble disparo por hashchange.
      this._processedInviteHash = hash;

      const leagueId = hash.slice('#league/join/'.length).trim();
      if (!leagueId) return;

      // Esperar a que la sesión esté resuelta (evita la race-condition de connectedCallback).
      const session = await waitForAuthReady();

      const locale = useLocaleStore.getState().locale;
      if (!session) {
        // Sin sesión: avisar y conservar el hash para que se procese tras login.
        // _onSignedIn → onLeagueSignedIn ya recarga la liga; nosotros guardamos el hash
        // en sessionStorage para retomarlo si el usuario hace login con magic-link.
        try { sessionStorage.setItem('wm2026_pending_invite_hash', hash); } catch (_) { /* noop */ }
        showToast(
          locale === 'es'
            ? 'Inicia sesión para unirte a la liga. El enlace se retomará tras el login.'
            : 'Please sign in to join the league. The invite link will be resumed after login.'
        );
        return;
      }

      const name = prompt(
        locale === 'es'
          ? '¿Quieres unirte a esta liga?\n\nEscribe tu nombre:'
          : 'Do you want to join this league?\n\nEnter your name:'
      );
      if (!name?.trim()) return;

      const { joinLeagueInCloud, fetchLeagueNameFromCloud, refreshLeagueMembers } = await import('./lib/league-sync');
      const ok = await joinLeagueInCloud(leagueId, name.trim());
      if (ok) {
        const leagueName = await fetchLeagueNameFromCloud(leagueId) ?? '';
        const { useLeaguesStore } = await import('./store/leagues-store');
        useLeaguesStore.getState().joinLeagueFromInvite(leagueId, leagueName, name.trim());
        await refreshLeagueMembers(leagueId);
        this._activeTab = 'league';
        window.location.hash = '#league';
      } else {
        showToast(
          locale === 'es'
            ? 'No se pudo unir a la liga. Comprueba que el enlace es válido e inténtalo de nuevo.'
            : 'Could not join the league. Please check that the link is valid and try again.'
        );
      }
      return;
    }

    const { detectLeagueHash, decodeLeagueInvite, decodeParticipantShare } = await import('./lib/league-codec');
    const leagueHash = detectLeagueHash(hash);

    if (leagueHash) {
      if (leagueHash.type === 'invite') {
        const invite = decodeLeagueInvite(leagueHash.raw);
        if (invite) {
          const locale = useLocaleStore.getState().locale;
          const name = prompt(
            locale === 'es'
              ? `¿Quieres unirte a la liga "${invite.name}"?\n\nEscribe tu nombre:`
              : `Do you want to join the league "${invite.name}"?\n\nEnter your name:`
          );
          if (name && name.trim()) {
            const { useLeaguesStore } = await import('./store/leagues-store');
            useLeaguesStore.getState().joinLeagueFromInvite(invite.leagueId, invite.name, name.trim());
            this._activeTab = 'league';
            window.location.hash = '#league';
          }
        }
      } else if (leagueHash.type === 'participant') {
        const share = decodeParticipantShare(leagueHash.raw);
        if (share) {
          const locale = useLocaleStore.getState().locale;
          const ok = window.confirm(
            locale === 'es'
              ? `¿Importar las predicciones de "${share.participantName}" a la liga?`
              : `Import predictions from "${share.participantName}" to the league?`
          );
          if (ok) {
            const { useLeaguesStore } = await import('./store/leagues-store');
            const result = useLeaguesStore.getState().importParticipantFromShare(
              share.leagueId, share.participantName, share.groupScores, share.knockoutScores, share.topScorer, share.mvp,
            );
            if (result.created || result.participantId) {
              this._activeTab = 'league';
              window.location.hash = '#league';
            }
          }
        }
      }
      return;
    }

    const { readSharedBracketFromHash } = await import('./lib/bracket-codec');
    const data = readSharedBracketFromHash();
    if (!data) return;
    const locale = useLocaleStore.getState().locale;
    const ok = window.confirm(
      locale === 'es'
        ? '¿Cargar el bracket compartido? Esto sobrescribirá tu predicción actual.'
        : 'Load the shared bracket? This will overwrite your current prediction.'
    );
    if (ok) {
      useTournamentStore.getState().applySharedBracket(data);
    }
    history.replaceState(null, '', window.location.pathname);
  }

  disconnectedCallback() {
    MQ_MOBILE.removeEventListener('change', this._mqListener);
    window.removeEventListener('online', this._onOnline);
    window.removeEventListener('offline', this._onOffline);
    window.removeEventListener('click', this._closeMenusOnOutsideClick);
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
    }
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    this._unsubAuth?.();
    this._unsubscribeToast?.();
    this._unsubOfficialResults?.();
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    super.disconnectedCallback();
  }

  private _unsubOfficialResults?: () => void;
  private _realModeForced = false;
  private _onVisibilityChange = () => {
    if (document.visibilityState === 'visible') void refreshOfficialResults();
  };

  private _onOnline = () => { this._isOffline = false; this.requestUpdate(); };
  private _onOffline = () => { this._isOffline = true; this.requestUpdate(); };
  private _closeMenusOnOutsideClick = (e: MouseEvent) => {
    if (!this._calendarMenuOpen && !this._shopMenuOpen && !this._moreMenuOpen) return;
    const dropdowns = this.shadowRoot?.querySelectorAll('.dropdown-wrap');
    const clickedInside = dropdowns ? [...dropdowns].some(d => e.composedPath().includes(d)) : false;
    if (!clickedInside) {
      this._moreMenuOpen = false;
      this._calendarMenuOpen = false;
      this._shopMenuOpen = false;
      this.requestUpdate();
    }
  };

  private _onToast(e: CustomEvent<ToastEventDetail>) {
    this._toastMessage = e.detail.message;
    requestAnimationFrame(() => {
      const el = this.shadowRoot?.querySelector('.toast-bar');
      el?.classList.add('show');
    });
    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      const el = this.shadowRoot?.querySelector('.toast-bar');
      el?.classList.remove('show');
      this._toastTimer = setTimeout(() => {
        this._toastMessage = '';
      }, 300);
    }, e.detail.duration ?? 2200);
  }

  private get _isDark() {
    return document.documentElement.dataset.theme === 'dark';
  }

  private _toggleTheme() {
    const next = this._isDark ? 'light' : 'dark';
    if (next === 'dark') {
      document.documentElement.dataset.theme = 'dark';
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem('bm-theme', next);
    const metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (metaTheme) metaTheme.content = next === 'dark' ? '#231d3e' : '#1A1933';
    this.requestUpdate();
  }

  private handleExcelExport() {
    useTournamentStore.getState().exportExcel();
  }

  private _toggleMoreMenu(e: Event) {
    e.stopPropagation();
    this._moreMenuOpen = !this._moreMenuOpen;
    this._calendarMenuOpen = false;
    this._shopMenuOpen = false;
  }

  private async _exportCalendar(phase: 'all' | 'groups' | 'knockout', format: 'excel' | 'pdf') {
    this._calendarMenuOpen = false;
    this._moreMenuOpen = false;
    const {
      exportCalendarExcel,
      exportCalendarPdf,
      fileNameBase,
      triggerDownload,
    } = await import('./lib/calendar-export-service');
    const locale = useLocaleStore.getState().locale;
    const ext = format === 'excel' ? 'xlsx' : 'pdf';
    const blob = format === 'excel'
      ? await exportCalendarExcel(phase, locale)
      : await exportCalendarPdf(phase, locale);
    triggerDownload(blob, `${fileNameBase(phase, locale)}.${ext}`);
  }

  private async handleShare() {
    const { openShareModal } = await import('./components/share-modal');
    openShareModal();
  }

  private async _handleAuth() {
    const { openAuthModal } = await import('./components/auth-modal');
    openAuthModal();
  }

  private triggerImportExcel() {
    const fileInput = this.shadowRoot?.querySelector('#excel-upload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  private handleExcelFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    useTournamentStore.getState().importExcel(file);
    input.value = '';
  }

  render() {
    // ── Shell móvil dedicado (viewport ≤768px) ──────────────────────
    if (this._isMobile) {
      return html`<mobile-app></mobile-app>`;
    }

    // ── Shell de escritorio (sin cambios) ───────────────────────────
    const state = useTournamentStore.getState();
    const groupPlayed = state.groupMatches.filter(m => m.scoreA !== null).length;
    const knockoutPlayed = Object.values(state.knockoutMatches).filter(m => m.isPlayed).length;
    const totalPlayed = groupPlayed + knockoutPlayed;
    const at = this._activeTab;

    return html`
      <div class="shell">
        <header class="topbar" role="banner">
          <!-- Fila principal: logo + stats + acciones -->
          <div class="topbar-main">
            <a href="/" class="logo-lockup" aria-label="Bracket Mundial 2026 Home">
              <div class="logo-icon">⚽</div>
              <div class="logo-text">
                <span class="logo-main">BRACKET</span>
                <span class="logo-sub">MUNDIAL 2026</span>
              </div>
            </a>

            <div class="topbar-stats">
              <div class="stat-pill">
                <span class="stat-num">48</span>
                <span class="stat-lbl">${t('header.statsTeams')}</span>
              </div>
              <span class="stat-sep">/</span>
              <div class="stat-pill">
                <span class="stat-num">12</span>
                <span class="stat-lbl">${t('header.statsGroups')}</span>
              </div>
              <span class="stat-sep">/</span>
              <div class="stat-pill">
                <span class="stat-num">104</span>
                <span class="stat-lbl">${t('header.statsMatches')}</span>
              </div>
              <span class="stat-sep">/</span>
              <div class="stat-pill">
                <span class="stat-num">${totalPlayed}</span>
                <span class="stat-lbl">${t('header.played', { n: totalPlayed })}</span>
              </div>
            </div>

            <div class="header-actions">
              ${this._authEmail
                ? html`<button class="ha-btn-sm" @click="${this._handleAuth}" title="${this._authEmail}">${this._authEmail}</button>`
                : html`<button class="ha-btn-primary" @click="${this._handleAuth}">${t('header.signInTitle')}</button>`}
              <input type="file" id="excel-upload" style="display:none" accept=".xlsx" @change="${this.handleExcelFileChange}">
              <button class="ha-btn-sm" @click="${this._toggleTheme}" title="${this._isDark ? t('header.dayTitle') : t('header.nightTitle')}">
                ${this._isDark ? html`☀️` : html`🌙`}
              </button>
              <button class="ha-btn-sm" @click="${toggleLocale}" title="${t('header.langToggle')}">${t('header.langToggle')}</button>
              <button
                class="ha-btn-primary"
                @click="${this.handleShare}"
                title="${t('header.share')}">
                ${t('header.share')}
              </button>
              <button
                class="ha-btn-ghost"
                @click="${this.handleExcelExport}"
                title="${t('header.exportExcelTitle')}">
                ⬇ ${t('header.excel')}
              </button>
              <div class="dropdown-wrap">
                <button
                  class="ha-btn-sm"
                  @click="${this._toggleMoreMenu}"
                  title="${t('tabs.more')}"
                  style="font-size:18px;padding:0 12px;">
                  ⋯
                </button>
                ${this._moreMenuOpen ? html`
                  <div class="more-dropdown">
                    <div class="dropdown-section">
                      <span>${t('header.excel')}</span>
                      <button @click="${() => { this._moreMenuOpen = false; this.handleExcelExport(); }}">
                        ⬇ ${t('header.exportExcel')}
                      </button>
                      <button @click="${() => { this._moreMenuOpen = false; this.triggerImportExcel(); }}">
                        ⬆ ${t('header.importExcel')}
                      </button>
                    </div>
                    <div class="dropdown-section">
                      <span>${t('tabs.calendar')}</span>
                      <button @click="${() => this._exportCalendar('all', 'excel')}">${t('calendar.exportAllExcel')}</button>
                      <button @click="${() => this._exportCalendar('all', 'pdf')}">${t('calendar.exportAllPdf')}</button>
                    </div>
                    <div class="dropdown-section">
                      <span>${t('header.shop')}</span>
                      <a href="https://amzn.to/4tS2QrW" target="_blank" rel="noopener noreferrer">${t('shop.panini')}</a>
                      <a href="https://amzn.to/4nQq3JI" target="_blank" rel="noopener noreferrer">${t('shop.poster')}</a>
                      <a href="https://amzn.to/4tPCjvi" target="_blank" rel="noopener noreferrer">${t('shop.book')}</a>
                      <a href="https://amzn.to/3Ro0Wlf" target="_blank" rel="noopener noreferrer">${t('shop.fifa')}</a>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Fila de navegación (desktop) -->
          <nav class="topbar-nav" aria-label="${t('tabs.label')}">
            ${PHASE_TABS.map(tab => html`
              <button
                class="topbar-nav-btn ${at === tab ? 'active' : ''}"
                aria-pressed="${at === tab}"
                @click="${() => this._selectTab(tab)}">
                ${tab === 'hero' ? '⚽' : ''}
                ${tab === 'groups' ? '📋' : ''}
                ${tab === 'knockout' ? '🏆' : ''}
                ${tab === 'squads' ? '👥' : ''}
                ${tab === 'calendar' ? '📅' : ''}
                ${tab === 'stadiums' ? '🏟' : ''}
                ${tab === 'coaches' ? '👔' : ''}
                ${tab === 'guide' ? '📖' : ''}
                ${tab === 'league' ? '📊' : ''}
                ${tab === 'hero' ? t('tabs.hero')
                  : tab === 'groups' ? t('tabs.groups')
                  : tab === 'knockout' ? t('tabs.knockout')
                  : tab === 'squads' ? t('tabs.squads')
                  : tab === 'calendar' ? t('tabs.calendar')
                  : tab === 'stadiums' ? t('tabs.stadiums')
                  : tab === 'coaches' ? t('tabs.coaches')
                  : tab === 'guide' ? t('tabs.guide')
                  : t('tabs.league')}
              </button>
            `)}
          </nav>
        </header>

        <!-- Tournament progress -->
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.round((totalPlayed / 104) * 100)}%"></div>
        </div>

        <!-- Offline banner -->
        ${this._isOffline ? html`
          <div class="offline-banner">
            <span>${t('view.offline')}</span>
          </div>
        ` : ''}

        <!-- AdSense -->
        <div class="ad-strip">
          <ad-block></ad-block>
        </div>

        <main class="content">
          <bracket-view></bracket-view>
        </main>

        <!-- AdSense -->
        <div class="ad-strip">
          <ad-block></ad-block>
        </div>

        <footer class="site-footer">
          <div class="footer-section">
            <span class="footer-label">${t('header.shop')}</span>
            <div class="footer-social">
              <a href="https://amzn.to/4tS2QrW" target="_blank" rel="noopener noreferrer" aria-label="${t('header.shopTitle')}">
                ${t('shop.panini')}
              </a>
              <a href="https://amzn.to/4nQq3JI" target="_blank" rel="noopener noreferrer" aria-label="${t('header.shopTitle')}">
                ${t('shop.poster')}
              </a>
              <a href="https://amzn.to/4tPCjvi" target="_blank" rel="noopener noreferrer" aria-label="${t('header.shopTitle')}">
                ${t('shop.book')}
              </a>
              <a href="https://amzn.to/3Ro0Wlf" target="_blank" rel="noopener noreferrer" aria-label="${t('header.shopTitle')}">
                ${t('shop.fifa')}
              </a>
            </div>
          </div>

          <span class="footer-sep">·</span>

          <div class="footer-section">
            <span class="footer-label">${t('footer.follow')}</span>
            <div class="footer-social">
              <a href="https://x.com/bracketmundial" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter) @bracketmundial">
                𝕏 @bracketmundial
              </a>
              <a href="https://www.tiktok.com/@bracketmundial" target="_blank" rel="noopener noreferrer" aria-label="TikTok @bracketmundial">
                🎬 @bracketmundial
              </a>
              <a href="https://www.instagram.com/bracketmundial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @bracketmundial">
                📸 @bracketmundial
              </a>
              <a href="https://t.me/bracketmundial" target="_blank" rel="noopener noreferrer" aria-label="Telegram @bracketmundial">
                ✈ @bracketmundial
              </a>
            </div>
          </div>

          <span class="footer-sep">·</span>

          <div class="footer-section">
            <span class="footer-label">${t('footer.legal')}</span>
            <div class="footer-social">
              <a href="/acerca-de.html" aria-label="${t('footer.about')}">
                ${t('footer.about')}
              </a>
              <a href="/aviso-legal.html" aria-label="${t('footer.legalNotice')}">
                ${t('footer.legalNotice')}
              </a>
              <a href="/privacy-policy.html" aria-label="${t('footer.privacy')}">
                ${t('footer.privacy')}
              </a>
              <a href="/politica-cookies.html" aria-label="${t('footer.cookies')}">
                ${t('footer.cookies')}
              </a>
            </div>
          </div>

          <span class="footer-sep">·</span>

          <div class="footer-section">
            <span class="footer-label">${t('footer.contact')}</span>
            <a class="footer-email" href="mailto:bracketmundial@gmail.com" aria-label="Email bracketmundial@gmail.com">
              ✉ bracketmundial@gmail.com
            </a>
          </div>

          <span class="footer-copy">© BRACKET MUNDIAL 2026</span>
        </footer>

        ${this._toastMessage ? html`<div class="toast-bar" role="status" aria-live="polite" aria-atomic="true">${this._toastMessage}</div>` : ''}
      </div>
    `;
  }
}

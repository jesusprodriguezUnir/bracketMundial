import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './bracket-view';
import './components/logo-crest';
import { useTournamentStore } from './store/tournament-store';
import { subscribeSlice } from './store/store-utils';
import { t, toggleLocale, useLocaleStore } from './i18n';
import { useAuthStore, waitForAuthReady, popPendingInviteHash } from './store/auth-store';
import { onToast, showToast, type ToastEventDetail } from './lib/interaction';
import { refreshOfficialResults, subscribeOfficialResults, startOfficialResultsPolling, stopOfficialResultsPolling } from './lib/official-results';
import { hasMatchDatePassed } from './lib/league-fixture';
import { COMPETITION } from './data/competition';
import './components/ad-block';

/** Media query para conmutación desktop ↔ móvil */
const MQ_MOBILE = window.matchMedia('(max-width: 768px)');
let _mobileImportDone = false;
async function ensureMobileApp() {
  if (_mobileImportDone) return;
  _mobileImportDone = true;
  await import('./components/mobile/mobile-app');
}

type PhaseTab = 'hero' | 'groups' | 'matchday' | 'knockout' | 'squads' | 'calendar' | 'stadiums' | 'coaches' | 'guide';

const ALL_PHASE_TABS: PhaseTab[] = ['hero', 'groups', 'matchday', 'knockout', 'squads', 'calendar', 'coaches'];

/**
 * Tabs realmente navegables. La competicion activa decide que superficies
 * existen: COMPETITION.hiddenViews las retira de la barra y, al filtrar
 * tambien hashToTab, deja de resolver el deep link correspondiente.
 */
const PHASE_TABS: PhaseTab[] = ALL_PHASE_TABS.filter(
  tab => !(COMPETITION.hiddenViews as readonly string[]).includes(tab),
);

function hashToTab(hash: string): PhaseTab | null {
  const clean = hash.replace('#', '');
  if (clean === 'league') return 'groups';
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

    /* ── Topbar Champions (sigue el tema activo) ── */
    .topbar {
      display: flex;
      flex-direction: column;
      background: var(--shell-grad);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--shell-border);
      box-shadow: var(--shell-shadow);
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
      border-radius: 12px;
      background: linear-gradient(150deg, var(--accent), var(--accent-deep));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: var(--glow-accent-sm);
    }
    .logo-diamond {
      width: 14px;
      height: 14px;
      background: var(--paper);
      transform: rotate(45deg);
      border-radius: 2px;
    }
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .logo-main {
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 800;
      color: var(--ink);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1;
    }
    .logo-sub {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 500;
      color: var(--ink-muted);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      line-height: 1;
      margin-top: 3px;
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
      font-size: 17px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1;
    }
    .stat-lbl {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 500;
      color: var(--ink-muted);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      line-height: 1;
    }
    .stat-sep {
      width: 1px;
      height: 22px;
      background: var(--hairline);
      font-size: 0;
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
      color: var(--ink-soft);
      background: transparent;
      transition: background 0.15s, color 0.15s;
      text-decoration: none;
      box-sizing: border-box;
      white-space: nowrap;
    }
    @media (hover: hover) {
      .header-actions > button:hover {
        background: var(--fill);
        color: var(--ink);
      }
    }
    .ha-btn-sm {
      padding: 0 10px !important;
      font-size: 14px !important;
    }
    /* Primary CTA — Compartir */
    .ha-btn-primary {
      background: var(--accent) !important;
      color: var(--on-accent) !important;
      border-radius: var(--radius-sm) !important;
      margin: 8px 4px;
      padding: 0 16px !important;
      font-weight: 800 !important;
      border: none !important;
      box-shadow: var(--glow-accent-sm);
    }
    @media (hover: hover) {
      .ha-btn-primary:hover {
        background: var(--accent-hover) !important;
        transform: translateY(-1px);
      }
    }
    /* Secondary CTA — Excel ghost */
    .ha-btn-ghost {
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      margin: 8px 4px;
      padding: 0 14px !important;
    }
    @media (hover: hover) {
      .ha-btn-ghost:hover {
        border-color: var(--accent);
        color: var(--ink) !important;
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
      background: var(--surface-dark-2);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 200;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dropdown-section {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--hairline);
    }
    .dropdown-section:last-child {
      border-bottom: none;
    }
    .dropdown-section > span {
      padding: 8px 14px 4px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--accent);
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
      color: var(--shell-ink);
      text-align: left;
      transition: background 0.1s;
      text-decoration: none;
      box-sizing: border-box;
      display: block;
    }
    @media (hover: hover) {
      .more-dropdown button:hover,
      .more-dropdown a:hover {
        background: var(--shell-fill-hover);
        color: var(--shell-ink-hover);
      }
    }

    /* ── Nav tabs integradas en el header ── */
    .topbar-nav {
      display: flex;
      gap: 2px;
      border-top: 1px solid var(--hairline);
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .topbar-nav::-webkit-scrollbar { display: none; }
    .topbar-nav-btn {
      all: unset;
      cursor: pointer;
      padding: 12px 16px;
      font-family: var(--font-var);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--ink-muted);
      white-space: nowrap;
      flex-shrink: 0;
      transition: color 0.15s, background 0.15s, border-color 0.15s;
      border-bottom: 2px solid transparent;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .topbar-nav-btn:first-child { padding-left: 20px; }
    @media (hover: hover) {
      .topbar-nav-btn:hover {
        color: var(--ink);
        background: var(--fill);
      }
    }
    .topbar-nav-btn.active {
      color: var(--ink);
      font-weight: 700;
      border-bottom-color: var(--accent);
    }

    /* ── Content ── */
    .content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 22px 20px 40px;
    }

    /* ── Offline banner ── */
    .offline-banner {
      background: var(--accent);
      color: var(--on-accent);
      text-align: center;
      padding: 6px 16px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.06em;
      border-bottom: 1px solid var(--hairline);
      position: sticky;
      top: 88px;
      z-index: 89;
    }

    /* ── Tournament progress bar ── */
    .progress-bar {
      height: 3px;
      background: var(--hairline);
      position: sticky;
      top: 56px;
      z-index: 109;
    }
    .progress-fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.4s ease;
      box-shadow: var(--glow-dot);
    }

    /* ── Footer ── */
    .site-footer {
      border-top: 1px solid var(--shell-border);
      background: var(--shell-grad-up);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: var(--shell-shadow-up);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px 32px;
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
      color: var(--ink-muted);
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
      color: var(--ink-soft);
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      padding: 4px 10px;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 44px;
      justify-content: center;
    }
    @media (hover: hover) {
      .footer-social a:hover,
      .footer-email:hover {
        background: var(--fill);
        border-color: var(--accent);
        color: var(--ink);
      }
    }
    .footer-sep {
      color: var(--ink-muted);
      font-family: var(--font-mono);
      font-size: 14px;
      user-select: none;
    }
    .footer-copy {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--ink-muted);
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .footer-webdespega {
      font-family: var(--font-body);
      font-size: 11px;
      letter-spacing: 0.02em;
      text-decoration: none;
      color: var(--ink-soft);
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-sm);
      padding: 5px 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      background: var(--fill-soft);
      transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
    }
    .footer-webdespega strong {
      font-family: var(--font-display);
      font-size: 13px;
      color: var(--accent);
      letter-spacing: -0.01em;
    }
    .footer-webdespega .wd-logo-icon {
      flex-shrink: 0;
    }
    @media (hover: hover) {
      .footer-webdespega:hover {
        background: var(--fill);
        border-color: var(--accent);
        color: var(--ink);
        transform: translateY(-1px);
      }
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
    // Tras el primer partido (M1), la app arranca en "Resultados Reales"
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
    startOfficialResultsPolling();
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

  /** Enlace `#league/join/` y compacto `#lg=` unen en la nube con el mismo flujo. */
  private async _joinCloudLeague(hash: string, leagueId: string, knownName?: string): Promise<void> {
    this._processedInviteHash = hash;
    if (!leagueId) return;

    const session = await waitForAuthReady();
    const locale = useLocaleStore.getState().locale;
    if (!session) {
      try { sessionStorage.setItem('wm2026_pending_invite_hash', hash); } catch (_) { /* noop */ }
      showToast(
        locale === 'es'
          ? 'Inicia sesión para unirte a la liga. El enlace se retomará tras el login.'
          : 'Please sign in to join the league. The invite link will be resumed after login.'
      );
      return;
    }

    const name = prompt(
      knownName
        ? (locale === 'es'
          ? `¿Quieres unirte a la liga "${knownName}"?\n\nEscribe tu nombre:`
          : `Do you want to join the league "${knownName}"?\n\nEnter your name:`)
        : (locale === 'es'
          ? '¿Quieres unirte a esta liga?\n\nEscribe tu nombre:'
          : 'Do you want to join this league?\n\nEnter your name:')
    );
    if (!name?.trim()) return;

    const { joinLeagueInCloud, fetchLeagueNameFromCloud, refreshLeagueMembers } = await import('./lib/league-sync');
    const ok = await joinLeagueInCloud(leagueId, name.trim());
    if (ok) {
      const leagueName = knownName || (await fetchLeagueNameFromCloud(leagueId)) || '';
      const { useLeaguesStore } = await import('./store/leagues-store');
      useLeaguesStore.getState().joinLeagueFromInvite(leagueId, leagueName, name.trim());
      await refreshLeagueMembers(leagueId);
      this._activeTab = 'groups';
      window.location.hash = '#groups';
    } else {
      showToast(
        locale === 'es'
          ? 'No se pudo unir a la liga. Comprueba que el enlace es válido e inténtalo de nuevo.'
          : 'Could not join the league. Please check that the link is valid and try again.'
      );
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

    if (hash.startsWith('#league/join/')) {
      await this._joinCloudLeague(hash, hash.slice('#league/join/'.length).trim());
      return;
    }

    const { detectLeagueHash, decodeLeagueInvite, decodeParticipantShare } = await import('./lib/league-codec');
    const leagueHash = detectLeagueHash(hash);

    if (leagueHash) {
      if (leagueHash.type === 'invite') {
        const invite = decodeLeagueInvite(leagueHash.raw);
        if (invite) {
          await this._joinCloudLeague(hash, invite.leagueId, invite.name);
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
              this._activeTab = 'groups';
              window.location.hash = '#groups';
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
    stopOfficialResultsPolling();
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
    if (!this._calendarMenuOpen && !this._moreMenuOpen) return;
    const dropdowns = this.shadowRoot?.querySelectorAll('.dropdown-wrap');
    const clickedInside = dropdowns ? [...dropdowns].some(d => e.composedPath().includes(d)) : false;
    if (!clickedInside) {
      this._moreMenuOpen = false;
      this._calendarMenuOpen = false;
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
    if (metaTheme) {
      // Se lee del token en lugar de fijarlo aqui: antes ambas ramas
      // devolvian un azul oscuro (la "clara" era incluso mas oscura),
      // asi que la barra del navegador nunca seguia al tema.
      const shellColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--shell-theme-color').trim();
      if (shellColor) metaTheme.content = shellColor;
    }
    this.requestUpdate();
  }

  private handleExcelExport() {
    useTournamentStore.getState().exportExcel();
  }

  private _toggleMoreMenu(e: Event) {
    e.stopPropagation();
    this._moreMenuOpen = !this._moreMenuOpen;
    this._calendarMenuOpen = false;
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
            <a href="/" class="logo-lockup" aria-label="Bracket Champions">
              <div class="logo-icon"><span class="logo-diamond"></span></div>
              <div class="logo-text">
                <span class="logo-main">BRACKET</span>
                <span class="logo-sub">CHAMPIONS 26/27</span>
              </div>
            </a>

            <div class="topbar-stats">
              <div class="stat-pill">
                <span class="stat-num">36</span>
                <span class="stat-lbl">${t('header.statsTeams')}</span>
              </div>
              <span class="stat-sep">/</span>
              <div class="stat-pill">
                <span class="stat-num">8</span>
                <span class="stat-lbl">${t('header.statsGroups')}</span>
              </div>
              <span class="stat-sep">/</span>
              <div class="stat-pill">
                <span class="stat-num">144</span>
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
                ${tab === 'hero' ? '🏠' : ''}
                ${tab === 'groups' ? '⚽' : ''}
                ${tab === 'matchday' ? '📅' : ''}
                ${tab === 'knockout' ? '🏆' : ''}
                ${tab === 'squads' ? '👥' : ''}
                ${tab === 'calendar' ? '🗓️' : ''}
                ${tab === 'stadiums' ? '🏟' : ''}
                ${tab === 'coaches' ? '👔' : ''}
                ${tab === 'guide' ? '📖' : ''}
                ${tab === 'hero' ? t('tabs.hero')
                  : tab === 'groups' ? t('tabs.table')
                  : tab === 'matchday' ? t('tabs.matchday')
                  : tab === 'knockout' ? t('tabs.knockout')
                  : tab === 'squads' ? t('tabs.squads')
                  : tab === 'calendar' ? t('tabs.calendar')
                  : tab === 'stadiums' ? t('tabs.stadiums')
                  : tab === 'coaches' ? t('tabs.coaches')
                  : t('tabs.guide')}
              </button>
            `)}
          </nav>
        </header>

        <!-- Tournament progress -->
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.round((totalPlayed / 144) * 100)}%"></div>
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

          <div class="footer-section">
            <span class="footer-label">${t('footer.contact')}</span>
            <a class="footer-email" href="mailto:bracketmundial@gmail.com" aria-label="Email bracketmundial@gmail.com">
              ✉ bracketmundial@gmail.com
            </a>
          </div>

          <span class="footer-sep">·</span>

          <div class="footer-section">
            <a class="footer-webdespega" href="https://webdespega.com" target="_blank" rel="noopener noreferrer" title="Web Despega · Diseño web profesional">
              <svg viewBox="0 0 64 64" width="16" height="16" aria-hidden="true" class="wd-logo-icon">
                <polygon points="56,8 22,24 37,32" fill="#0C447C"></polygon>
                <polygon points="56,8 37,32 31,45" fill="#4C7BA8"></polygon>
                <rect x="9" y="50" width="46" height="8" rx="4" fill="#EF9F27"></rect>
              </svg>
              <span>Web creada por <strong>webdespega</strong></span>
            </a>
          </div>

          <span class="footer-copy">© BRACKET CHAMPIONS 26/27</span>
        </footer>

        ${this._toastMessage ? html`<div class="toast-bar" role="status" aria-live="polite" aria-atomic="true">${this._toastMessage}</div>` : ''}
      </div>
    `;
  }
}

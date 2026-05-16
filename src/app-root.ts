import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './bracket-view';
import './components/logo-crest';
import { useTournamentStore } from './store/tournament-store';
import { subscribeSlice } from './store/store-utils';
import { t, toggleLocale, useLocaleStore } from './i18n';
import { useAuthStore } from './store/auth-store';
import { isSupabaseConfigured } from './lib/supabase-client';
import { isAdmin, saveOfficialResults } from './lib/official-results';
import './components/ad-block';

@customElement('app-root')
export class AppRoot extends LitElement {
  private unsubscribeStore?: () => void;
  private unsubscribeLocale?: () => void;
  private unsubscribeAuth?: () => void;
  private _authEmail: string | null = null;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    .shell {
      min-height: 100vh;
      position: relative;
    }

    /* Topbar oscura retro Panini v2 */
    .topbar {
      display: flex;
      align-items: stretch;
      border-bottom: 4px solid #1a1933;
      background: #1a1933;
      position: sticky;
      top: 0;
      z-index: 100;
      padding-top: env(safe-area-inset-top);
    }

    /* Bloque logo lockup: crest + wordmark */
    .logo-lockup {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 20px 8px 18px;
      border-right: 1px solid rgba(236,223,192,0.13);
      flex-shrink: 0;
      text-decoration: none;
    }
    .logo-text {
      display: flex;
      flex-direction: column;
      line-height: 0.85;
    }
    .logo-main {
      font-family: var(--font-var);
      font-size: 26px;
      color: #ecdfc0;
      letter-spacing: -0.02em;
    }
    .logo-sub {
      font-family: var(--font-var);
      font-size: 10px;
      color: #f0b021;
      letter-spacing: 0.18em;
      margin-top: 2px;
    }

    /* Bloque edición */
    .edition-badge {
      padding: 0 18px;
      display: flex;
      align-items: center;
      border-right: 1px solid rgba(236,223,192,0.13);
      font-family: var(--font-mono);
      font-size: 10px;
      color: rgba(236,223,192,0.6);
      letter-spacing: 0.2em;
      flex-shrink: 0;
    }
    .edition-badge span {
      color: #f0b021;
    }

    /* Stats en la barra */
    .topbar-stats {
      display: flex;
      align-items: center;
      padding: 0 18px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: rgba(236,223,192,0.5);
      letter-spacing: 0.1em;
      gap: 16px;
      flex: 1;
    }
    .stats-played {
      font-family: var(--font-var);
      font-size: 14px;
      color: #ecdfc0;
    }

    /* Acciones pegadas a la derecha */
    .header-actions {
      display: flex;
      align-items: stretch;
      margin-left: auto;
    }
    .header-actions button {
      all: unset;
      cursor: pointer;
      padding: 0 18px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.04em;
      border-left: 1px solid rgba(236,223,192,0.13);
      display: flex;
      align-items: center;
      color: #ecdfc0;
      background: transparent;
      transition: background 0.1s;
    }
    @media (hover: hover) {
      .header-actions button:hover {
        background: rgba(240,176,33,0.15);
      }
    }
    .header-actions button.primary {
      background: var(--retro-yellow);
      color: #1a1933;
      border: 2px solid #1a1933;
      box-shadow: 2px 2px 0 0 var(--retro-orange);
      margin: 8px 12px;
      padding: 0 14px;
    }
    @media (hover: hover) {
      .header-actions button.primary:hover {
        background: var(--retro-orange);
        color: #ecdfc0;
      }
    }
    .header-actions button.account-btn {
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .content {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px 40px;
    }

    /* Tournament progress bar */
    .progress-bar {
      height: 5px;
      background: rgba(26,25,51,0.2);
      position: sticky;
      top: 56px;
      z-index: 99;
    }
    .progress-fill {
      height: 100%;
      background: var(--retro-yellow);
      transition: width 0.4s ease;
      box-shadow: 0 0 6px rgba(240,176,33,0.5);
    }

    /* ---- FOOTER ---- */
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

    @media (max-width: 768px) {
      .edition-badge,
      .topbar-stats {
        display: none;
      }
      .content {
        padding: 16px 16px;
        padding-bottom: calc(16px + env(safe-area-inset-bottom));
      }
      .logo-main {
        font-size: 20px;
      }
      .logo-sub {
        font-size: 8px;
      }
      .header-actions button {
        padding: 0 12px;
        font-size: 11px;
      }
      .site-footer {
        flex-direction: column;
        align-items: flex-start;
        padding: 14px 16px;
        padding-bottom: calc(14px + env(safe-area-inset-bottom));
        gap: 12px;
      }
      .footer-copy {
        margin-left: 0;
      }
    }

    /* Franja de anuncio global */
    .ad-strip {
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
      padding: 8px 40px;
      box-sizing: border-box;
      min-height: 90px; /* Reserva espacio mientras AdSense carga */
    }
    @media (max-width: 768px) {
      .ad-strip {
        padding: 8px 16px;
        min-height: 60px;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
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
    this.unsubscribeAuth = useAuthStore.subscribe(() => {
      this._authEmail = useAuthStore.getState().email;
      this.requestUpdate();
    });
    this._authEmail = useAuthStore.getState().email;
    this._loadSharedBracketIfPresent();
  }

  private async _loadSharedBracketIfPresent() {
    const { extractHashPayload, decodeBracket } = await import('./lib/bracket-codec');
    const payload = extractHashPayload();
    if (!payload) return;
    const data = decodeBracket(payload);
    if (!data) return;
    const ok = window.confirm('¿Cargar el bracket compartido? Esto sobrescribirá tu predicción actual.');
    if (ok) {
      useTournamentStore.getState().applySharedBracket(data);
    }
    history.replaceState(null, '', window.location.pathname);
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    this.unsubscribeAuth?.();
    super.disconnectedCallback();
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
    if (metaTheme) metaTheme.content = next === 'dark' ? '#231d3e' : '#1a1933';
    this.requestUpdate();
  }

  private handleExport() {
    useTournamentStore.getState().exportTournament();
  }

  private handleExcelExport() {
    useTournamentStore.getState().exportExcel();
  }

  private async handleShare() {
    const { openShareModal } = await import('./components/share-modal');
    openShareModal();
  }

  private async handleAccount() {
    const { openAuthModal } = await import('./components/auth-modal');
    openAuthModal();
  }

  private async handleLeagues() {
    const { openLeaguesModal } = await import('./components/leagues-modal');
    openLeaguesModal();
  }

  private async handlePublishResults() {
    const ok = await saveOfficialResults();
    alert(ok ? t('admin.publishOk') : t('admin.publishErr'));
  }

  private triggerImport() {
    const fileInput = this.shadowRoot?.querySelector('#file-upload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  private triggerImportExcel() {
    const fileInput = this.shadowRoot?.querySelector('#excel-upload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  private handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        useTournamentStore.getState().importTournament(content);
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  private handleExcelFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    useTournamentStore.getState().importExcel(file);
    input.value = '';
  }

  render() {
    const state = useTournamentStore.getState();
    const groupPlayed = state.groupMatches.filter(m => m.scoreA !== null).length;
    const knockoutPlayed = Object.values(state.knockoutMatches).filter(m => m.isPlayed).length;
    const totalPlayed = groupPlayed + knockoutPlayed;

    return html`
      <div class="shell">
        <header class="topbar" role="banner">
          <!-- Logo lockup: crest + wordmark -->
          <a href="/" class="logo-lockup" aria-label="Bracket Mundial 2026 Home">
            <logo-crest size="44"></logo-crest>
            <div class="logo-text">
              <div class="logo-main">BRACKET</div>
              <div class="logo-sub">★ MUNDIAL · 2026 ★</div>
            </div>
          </a>

          <!-- Edición -->
          <div class="edition-badge"><span>★ </span>EDICIÓN XXIII</div>

          <!-- Stats mini -->
          <div class="topbar-stats">
            <span>${t('header.stats')}</span>
            <span class="stats-played">${t('header.played', { n: totalPlayed })}</span>
          </div>

          <!-- Acciones -->
          <div class="header-actions">
            <input type="file" id="file-upload" style="display:none" accept=".json" @change="${this.handleFileChange}">
            <input type="file" id="excel-upload" style="display:none" accept=".xlsx" @change="${this.handleExcelFileChange}">
            <button @click="${this._toggleTheme}" title="${this._isDark ? t('header.dayTitle') : t('header.nightTitle')}">${this._isDark ? t('header.dayMode') : t('header.nightMode')}</button>
            <button @click="${toggleLocale}" title="${t('header.langToggle')}">${t('header.langToggle')}</button>
            <button @click="${this.triggerImportExcel}" title="Importar desde Excel">${t('header.importExcel')}</button>
            <button @click="${this.handleExcelExport}" title="Descargar plantilla Excel">${t('header.exportExcel')}</button>
            <button @click="${this.triggerImport}">${t('header.import')}</button>
            ${isSupabaseConfigured ? html`
              ${isAdmin() ? html`<button @click="${this.handlePublishResults}" title="${t('admin.publishResults')}">${t('admin.publishResults')}</button>` : ''}
              <button @click="${this.handleLeagues}" title="${t('leagues.title')}">${t('leagues.headerBtn')}</button>
              <button class="account-btn" @click="${this.handleAccount}" title="${t('account.title')}">
                ${this._authEmail ?? t('account.signIn')}
              </button>` : ''}
            <button @click="${this.handleShare}">${t('header.share')}</button>
            <button class="primary" @click="${this.handleExport}">${t('header.export')}</button>
          </div>
        </header>

        <!-- Tournament progress -->
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.round((totalPlayed / 104) * 100)}%"></div>
        </div>

        <!-- AdSense — debajo del topbar, visible en todas las vistas -->
        <div class="ad-strip">
          <ad-block></ad-block>
        </div>

        <main class="content">
          <bracket-view></bracket-view>
        </main>

        <footer class="site-footer">
          <!-- Redes sociales -->
          <div class="footer-section">
            <span class="footer-label">${t('footer.follow')}</span>
            <div class="footer-social">
              <a href="https://x.com/bracketmundial" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter) @bracketmundial">
                𝕏 @bracketmundial
              </a>
              <a href="https://www.tiktok.com/@bracketmundial" target="_blank" rel="noopener noreferrer" aria-label="TikTok @bracketmundial">
                ▶ @bracketmundial
              </a>
              <a href="https://www.instagram.com/bracketmundial/" target="_blank" rel="noopener noreferrer" aria-label="Instagram @bracketmundial">
                ◈ @bracketmundial
              </a>
            </div>
          </div>

          <span class="footer-sep">·</span>

          <!-- Contacto -->
          <div class="footer-section">
            <span class="footer-label">${t('footer.contact')}</span>
            <a class="footer-email" href="mailto:bracketmundial@gmail.com" aria-label="Email bracketmundial@gmail.com">
              ✉ bracketmundial@gmail.com
            </a>
          </div>

          <span class="footer-copy">© BRACKET MUNDIAL 2026</span>
        </footer>
      </div>
    `;
  }
}

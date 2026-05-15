import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './bracket-view';
import { useTournamentStore } from './store/tournament-store';
import { t, toggleLocale, useLocaleStore } from './i18n';

@customElement('app-root')
export class AppRoot extends LitElement {
  private unsubscribeStore?: () => void;
  private unsubscribeLocale?: () => void;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    .shell {
      min-height: 100vh;
      position: relative;
    }

    /* Topbar multi-bloque varsity retro */
    .topbar {
      display: flex;
      align-items: stretch;
      border-bottom: 4px solid var(--ink);
      background: var(--paper-2);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    /* Bloque wordmark ink */
    .wordmark {
      background: var(--ink);
      color: var(--paper);
      padding: 14px 22px 12px;
      border-right: 4px solid var(--ink);
      flex-shrink: 0;
    }
    .wordmark-title {
      font-family: var(--font-var);
      font-size: 32px;
      line-height: 0.9;
      letter-spacing: -0.02em;
    }
    .wordmark-sub {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      color: var(--retro-yellow);
      margin-top: 3px;
    }

    /* Bloque stamp edición */
    .stamp {
      padding: 12px 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-right: 2px solid var(--ink);
      flex-shrink: 0;
    }
    .stamp-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .stamp-num {
      font-family: var(--font-var);
      font-size: 22px;
      color: var(--retro-red);
      line-height: 0.9;
    }

    /* Country chips */
    .host-chips {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 18px;
      border-right: 2px solid var(--ink);
      flex-shrink: 0;
    }
    .host-chip {
      font-family: var(--font-mono);
      font-size: 10px;
      padding: 4px 8px;
      border: 2px solid var(--ink);
      background: var(--retro-yellow);
      color: var(--ink);
      letter-spacing: 0.05em;
    }

    /* Stats en la barra */
    .topbar-stats {
      display: flex;
      align-items: center;
      padding: 0 18px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.1em;
      gap: 16px;
      flex: 1;
    }
    .stats-played {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
    }

    /* Acciones (import/export) pegadas a la derecha */
    .header-actions {
      display: flex;
      align-items: stretch;
      margin-left: auto;
    }
    .header-actions button {
      all: unset;
      cursor: pointer;
      padding: 0 22px;
      font-family: var(--font-var);
      font-size: 15px;
      letter-spacing: 0.04em;
      border-left: 2px solid var(--ink);
      display: flex;
      align-items: center;
      color: var(--ink);
      background: transparent;
      transition: background 0.1s;
    }
    .header-actions button:hover {
      background: var(--retro-yellow);
    }
    .header-actions button.primary {
      background: var(--retro-orange);
      color: var(--paper);
    }
    .header-actions button.primary:hover {
      background: var(--retro-red);
    }

    .content {
      max-width: 1600px;
      margin: 0 auto;
      padding: 24px 40px;
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
    }
    .footer-social a:hover,
    .footer-email:hover {
      background: var(--retro-yellow);
      box-shadow: 3px 3px 0 var(--ink);
      transform: translate(-1px, -1px);
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
      .stamp,
      .host-chips,
      .topbar-stats {
        display: none;
      }
      .content {
        padding: 16px 16px;
      }
      .wordmark-title {
        font-size: 24px;
      }
      .header-actions button {
        padding: 0 14px;
        font-size: 13px;
      }
      .site-footer {
        flex-direction: column;
        align-items: flex-start;
        padding: 14px 16px;
        gap: 12px;
      }
      .footer-copy {
        margin-left: 0;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = useTournamentStore.subscribe(() => this.requestUpdate());
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
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

  private async handleShare() {
    const { openShareModal } = await import('./components/share-modal');
    openShareModal();
  }

  private triggerImport() {
    const fileInput = this.shadowRoot?.querySelector('#file-upload') as HTMLInputElement;
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

  render() {
    const state = useTournamentStore.getState();
    const groupPlayed = state.groupMatches.filter(m => m.scoreA !== null).length;
    const knockoutPlayed = Object.values(state.knockoutMatches).filter(m => m.isPlayed).length;
    const totalPlayed = groupPlayed + knockoutPlayed;

    return html`
      <div class="shell">
        <header class="topbar">
          <!-- Wordmark en ink -->
          <div class="wordmark">
            <div class="wordmark-title">${t('header.title')}</div>
            <div class="wordmark-sub">${t('header.subtitle')}</div>
          </div>

          <!-- Stamp edición -->
          <div class="stamp">
            <div class="stamp-label">${t('header.edition')}</div>
            <div class="stamp-num">XXIII</div>
          </div>

          <!-- Sedes anfitrionas -->
          <div class="host-chips">
            <span class="host-chip">🇲🇽 MEX</span>
            <span class="host-chip">🇺🇸 USA</span>
            <span class="host-chip">🇨🇦 CAN</span>
          </div>

          <!-- Stats mini -->
          <div class="topbar-stats">
            <span>${t('header.stats')}</span>
            <span class="stats-played">${t('header.played', { n: totalPlayed })}</span>
          </div>

          <!-- Acciones -->
          <div class="header-actions">
            <input type="file" id="file-upload" style="display:none" accept=".json" @change="${this.handleFileChange}">
            <button @click="${this._toggleTheme}" title="${this._isDark ? t('header.dayTitle') : t('header.nightTitle')}">${this._isDark ? t('header.dayMode') : t('header.nightMode')}</button>
            <button @click="${toggleLocale}" title="${t('header.langToggle')}">${t('header.langToggle')}</button>
            <button @click="${this.triggerImport}">${t('header.import')}</button>
            <button class="primary" @click="${this.handleExport}">${t('header.export')}</button>
            <button @click="${this.handleShare}">${t('header.share')}</button>
          </div>
        </header>

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
              <a href="https://www.instagram.com/bracketmun33918" target="_blank" rel="noopener noreferrer" aria-label="Instagram @bracketmun33918">
                ◈ @bracketmun33918
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

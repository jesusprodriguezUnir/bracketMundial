import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import './bracket-view';
import { useTournamentStore } from './store/tournament-store';

@customElement('app-root')
export class AppRoot extends LitElement {
  private unsubscribeStore?: () => void;

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
            <div class="wordmark-title">BRACKET</div>
            <div class="wordmark-sub">MUNDIAL · 2026</div>
          </div>

          <!-- Stamp edición -->
          <div class="stamp">
            <div class="stamp-label">EDICIÓN</div>
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
            <span>48 selecciones · 12 grupos · 104 partidos</span>
            <span class="stats-played">${totalPlayed} / 104 jugados</span>
          </div>

          <!-- Acciones -->
          <div class="header-actions">
            <input type="file" id="file-upload" style="display:none" accept=".json" @change="${this.handleFileChange}">
            <button @click="${this.triggerImport}">IMPORTAR</button>
            <button class="primary" @click="${this.handleExport}">EXPORTAR</button>
            <button @click="${this.handleShare}">COMPARTIR</button>
          </div>
        </header>

        <main class="content">
          <bracket-view></bracket-view>
        </main>
      </div>
    `;
  }
}

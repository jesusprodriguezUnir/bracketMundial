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

    .topbar {
      padding: 16px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--navy-dark);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand h1 {
      font-size: 1.4rem;
      color: var(--neon-lime);
      margin: 0;
    }

    .subtitle {
      font-size: 0.7rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .progress {
      font-size: 0.65rem;
      font-family: var(--font-display);
      font-weight: 800;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .content {
      max-width: 1500px;
      margin: 0 auto;
      padding: 24px 40px;
    }

    @media (max-width: 768px) {
      .topbar {
        padding: 16px 20px;
      }
      .content {
        padding: 16px 20px;
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
      <header class="topbar">
        <div class="brand">
          <h1>MUNDIAL 2026</h1>
          <div class="subtitle">Bracket Predictor</div>
        </div>
        <div class="progress" aria-label="Partidos jugados">${totalPlayed} / 104</div>
        <div class="header-actions">
          <input type="file" id="file-upload" style="display:none" accept=".json" @change="${this.handleFileChange}">
          <button class="btn" @click="${this.triggerImport}">Importar</button>
          <button class="btn btn-primary" @click="${this.handleExport}">Exportar</button>
        </div>
      </header>

      <main class="content">
        <bracket-view></bracket-view>
      </main>
    `;
  }
}


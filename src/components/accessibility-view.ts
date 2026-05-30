import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { t } from '../i18n';

type ColorblindProfile = 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';
type TextScale = 'normal' | 'large' | 'extra-large';

@customElement('accessibility-view')
export class AccessibilityView extends LitElement {
  @state() private activeProfile: ColorblindProfile = 'default';
  @state() private enablePatterns = false;
  @state() private highLegibility = false;
  @state() private textScale: TextScale = 'normal';
  @state() private showSavedNotification = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }

    /* Branded Container */
    .accessibility-container {
      background: var(--paper-3);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      padding: 30px;
      margin-bottom: 40px;
      position: relative;
    }
    .accessibility-container::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: var(--halftone-soft);
      pointer-events: none;
    }

    .header-block {
      border-bottom: 3px dashed var(--ink);
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .header-title {
      font-family: var(--font-var);
      font-size: 28px;
      color: var(--ink);
      margin: 0 0 6px 0;
      letter-spacing: -0.01em;
    }
    .header-subtitle {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--ink-soft);
      margin: 0;
    }

    /* Form Layout Grid */
    .settings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 32px;
    }
    @media (max-width: 768px) {
      .settings-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
    }

    /* Option Sections */
    .settings-section {
      background: var(--paper-2);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      padding: 20px;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .section-title {
      font-family: var(--font-var);
      font-size: 16px;
      color: var(--ink);
      margin: 0;
      letter-spacing: 0.02em;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Profile Buttons */
    .profile-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .profile-btn {
      all: unset;
      cursor: pointer;
      border: 2px solid var(--ink);
      background: var(--paper-3);
      padding: 12px 16px;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: bold;
      color: var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .profile-btn:hover {
      background: var(--paper-2);
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 var(--ink);
    }
    .profile-btn.active {
      background: var(--retro-yellow);
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 var(--ink);
    }
    .profile-name {
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.02em;
    }
    .profile-desc {
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: normal;
      color: var(--ink-soft);
    }

    /* Switch Toggles */
    .toggle-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px dashed rgba(26,25,51,0.15);
      padding-bottom: 14px;
    }
    .toggle-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .toggle-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .toggle-label {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
      letter-spacing: 0.02em;
    }
    .toggle-desc {
      font-family: var(--font-body);
      font-size: 11px;
      color: var(--ink-soft);
      line-height: 1.4;
    }

    /* Custom Checkbox as Hard Retro Toggle */
    .retro-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 26px;
      flex-shrink: 0;
    }
    .retro-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      inset: 0;
      background-color: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      transition: .2s;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: var(--ink);
      transition: .2s;
    }
    input:checked + .slider {
      background-color: var(--retro-yellow);
    }
    input:checked + .slider:before {
      transform: translateX(24px);
    }

    /* Text Scale Select */
    .select-wrap {
      position: relative;
      width: 100%;
    }
    .retro-select {
      width: 100%;
      background: var(--paper-3);
      border: 2px solid var(--ink);
      color: var(--ink);
      padding: 10px 14px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.05em;
      cursor: pointer;
      outline: none;
      box-shadow: 2px 2px 0 var(--ink);
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
    }
    .select-wrap::after {
      content: '▼';
      font-size: 10px;
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--ink);
    }

    /* Arena de Pruebas (Interactive Preview Arena) */
    .preview-arena {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 24px;
      position: relative;
    }
    .preview-title {
      font-family: var(--font-var);
      font-size: 16px;
      letter-spacing: 0.04em;
      color: var(--ink);
      margin-bottom: 16px;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Table Mockup */
    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-body);
      font-size: 13px;
      margin-bottom: 24px;
    }
    .preview-table th {
      font-family: var(--font-var);
      background: var(--ink);
      color: var(--paper-3);
      padding: 8px;
      text-align: left;
      font-size: 11px;
      letter-spacing: 0.05em;
    }
    .preview-table td {
      border-bottom: 2px solid var(--ink);
      padding: 10px 8px;
      vertical-align: middle;
    }
    .preview-table tr.qualify {
      background-color: color-mix(in srgb, var(--retro-green) 12%, var(--paper-3));
    }
    .preview-table tr.eliminate {
      background-color: color-mix(in srgb, var(--retro-red) 8%, var(--paper-3));
    }

    /* Apply patterns directly in mockup if active */
    :host([enable-patterns]) .qualify {
      background-image: repeating-linear-gradient(45deg, rgba(13, 123, 196, 0.06) 0 4px, transparent 4px 12px) !important;
    }
    :host([enable-patterns]) .eliminate {
      background-image: repeating-linear-gradient(-45deg, rgba(196, 60, 30, 0.06) 0 4px, transparent 4px 12px) !important;
    }

    .pos-pill {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: bold;
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--ink);
      margin-right: 6px;
    }
    .qualify .pos-pill {
      background: var(--retro-green);
      color: var(--paper-3);
    }
    .eliminate .pos-pill {
      background: var(--retro-red);
      color: var(--paper-3);
    }

    .team-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
    }
    .pts-val {
      font-family: var(--font-mono);
      font-weight: bold;
    }

    /* Bracket Match Node Mockup */
    .preview-bracket {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px 0;
    }
    .bracket-match {
      width: 240px;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-3);
      position: relative;
    }
    .match-header {
      background: var(--ink);
      color: var(--retro-orange);
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 4px 8px;
      font-weight: bold;
      letter-spacing: 0.1em;
      display: flex;
      justify-content: space-between;
    }
    .match-team {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-bottom: 2px solid var(--ink);
      font-family: var(--font-body);
      font-size: 12px;
    }
    .match-team:last-child {
      border-bottom: none;
    }
    .match-team.winner {
      font-weight: bold;
      background: color-mix(in srgb, var(--retro-green) 10%, var(--paper-3));
    }
    .match-score {
      font-family: var(--font-mono);
      font-weight: bold;
      font-size: 13px;
    }
    .winner-badge {
      background: var(--retro-green);
      color: var(--paper-3);
      font-family: var(--font-var);
      font-size: 8px;
      padding: 1px 4px;
      letter-spacing: 0.04em;
      margin-left: 6px;
    }

    /* Action Buttons */
    .actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
      border-top: 3px dashed var(--ink);
      padding-top: 24px;
    }

    .notification-bar {
      position: absolute;
      top: 15px;
      right: 30px;
      background: var(--retro-green);
      color: var(--paper-3);
      border: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: bold;
      padding: 8px 16px;
      box-shadow: 2px 2px 0 var(--ink);
      z-index: 10;
      animation: notifySlide 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes notifySlide {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: none; opacity: 1; }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._loadSettings();
  }

  private _loadSettings() {
    this.activeProfile = (localStorage.getItem('bm-colorblind') as ColorblindProfile) || 'default';
    this.enablePatterns = localStorage.getItem('bm-accessibility-patterns') === 'true';
    this.highLegibility = localStorage.getItem('bm-high-legibility') === 'true';
    this.textScale = (localStorage.getItem('bm-text-scale') as TextScale) || 'normal';
    this._reflectHostAttributes();
  }

  private _reflectHostAttributes() {
    // Reflect attributes onto host element for mockup style bindings
    if (this.enablePatterns) {
      this.setAttribute('enable-patterns', '');
    } else {
      this.removeAttribute('enable-patterns');
    }
  }

  private _saveSettings() {
    // Save to localStorage
    if (this.activeProfile !== 'default') {
      localStorage.setItem('bm-colorblind', this.activeProfile);
      document.documentElement.dataset.colorblind = this.activeProfile;
    } else {
      localStorage.removeItem('bm-colorblind');
      delete document.documentElement.dataset.colorblind;
    }

    if (this.enablePatterns) {
      localStorage.setItem('bm-accessibility-patterns', 'true');
      document.documentElement.dataset.accessibilityPatterns = 'true';
    } else {
      localStorage.removeItem('bm-accessibility-patterns');
      delete document.documentElement.dataset.accessibilityPatterns;
    }

    if (this.highLegibility) {
      localStorage.setItem('bm-high-legibility', 'true');
      document.documentElement.dataset.highLegibility = 'true';
    } else {
      localStorage.removeItem('bm-high-legibility');
      delete document.documentElement.dataset.highLegibility;
    }

    if (this.textScale !== 'normal') {
      localStorage.setItem('bm-text-scale', this.textScale);
      document.documentElement.dataset.textScale = this.textScale;
    } else {
      localStorage.removeItem('bm-text-scale');
      delete document.documentElement.dataset.textScale;
    }

    this._reflectHostAttributes();

    // Trigger feedback notification
    this.showSavedNotification = true;
    setTimeout(() => {
      this.showSavedNotification = false;
    }, 2500);

    // Dispatch global changes event for components to adapt if listening
    this.dispatchEvent(new CustomEvent('accessibility-changed', {
      bubbles: true,
      composed: true,
      detail: {
        profile: this.activeProfile,
        patterns: this.enablePatterns,
        legibility: this.highLegibility,
        scale: this.textScale
      }
    }));
  }

  private _selectProfile(profile: ColorblindProfile) {
    this.activeProfile = profile;
    this._saveSettings();
  }

  private _togglePatterns() {
    this.enablePatterns = !this.enablePatterns;
    this._saveSettings();
  }

  private _toggleLegibility() {
    this.highLegibility = !this.highLegibility;
    this._saveSettings();
  }

  private _changeTextScale(e: Event) {
    const el = e.target as HTMLSelectElement;
    this.textScale = el.value as TextScale;
    this._saveSettings();
  }

  private _resetSettings() {
    this.activeProfile = 'default';
    this.enablePatterns = false;
    this.highLegibility = false;
    this.textScale = 'normal';
    this._saveSettings();
  }

  render() {
    const ap = this.activeProfile;
    const pat = this.enablePatterns;
    const hl = this.highLegibility;
    const scale = this.textScale;

    return html`
      <div class="accessibility-container">
        ${this.showSavedNotification ? html`
          <div class="notification-bar" role="alert">
            ✓ ${t('accessibility.savedFeedback')}
          </div>
        ` : ''}

        <div class="header-block">
          <h1 class="header-title">👁️ ${t('accessibility.title')}</h1>
          <p class="header-subtitle">${t('accessibility.subtitle')}</p>
        </div>

        <div class="settings-grid">
          <!-- Columna Izquierda: Perfiles de Color -->
          <div class="settings-section">
            <h2 class="section-title">🎨 ${t('accessibility.profileLabel')}</h2>
            <div class="profile-buttons">
              <button class="profile-btn ${ap === 'default' ? 'active' : ''}" @click="${() => this._selectProfile('default')}">
                <span class="profile-name">🌈 ${t('accessibility.profileDefault')}</span>
                <span class="profile-desc">${t('accessibility.normalVisionDesc')}</span>
              </button>

              <button class="profile-btn ${ap === 'deuteranopia' ? 'active' : ''}" @click="${() => this._selectProfile('deuteranopia')}">
                <span class="profile-name">👁️‍🗨️ ${t('accessibility.profileDeuteranopia')}</span>
                <span class="profile-desc">${t('accessibility.deuteranopiaDesc')}</span>
              </button>

              <button class="profile-btn ${ap === 'protanopia' ? 'active' : ''}" @click="${() => this._selectProfile('protanopia')}">
                <span class="profile-name">👁️‍🗨️ ${t('accessibility.profileProtanopia')}</span>
                <span class="profile-desc">${t('accessibility.protanopiaDesc')}</span>
              </button>

              <button class="profile-btn ${ap === 'tritanopia' ? 'active' : ''}" @click="${() => this._selectProfile('tritanopia')}">
                <span class="profile-name">👁️‍🗨️ ${t('accessibility.profileTritanopia')}</span>
                <span class="profile-desc">${t('accessibility.tritanopiaDesc')}</span>
              </button>

              <button class="profile-btn ${ap === 'achromatopsia' ? 'active' : ''}" @click="${() => this._selectProfile('achromatopsia')}">
                <span class="profile-name">🏁 ${t('accessibility.profileAchromatopsia')}</span>
                <span class="profile-desc">${t('accessibility.achromatopsiaDesc')}</span>
              </button>
            </div>
          </div>

          <!-- Columna Derecha: Ayudas Visuales y Texto -->
          <div class="settings-section" style="justify-content: flex-start; gap: 20px;">
            <h2 class="section-title">⚙️ ${t('accessibility.patternsLabel')}</h2>

            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">🏁 ${t('accessibility.patternsLabel')}</span>
                <span class="toggle-desc">${t('accessibility.patternsDesc')}</span>
              </div>
              <label class="retro-switch" aria-label="${t('accessibility.patternsLabel')}">
                <input type="checkbox" .checked="${pat}" @change="${this._togglePatterns}">
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-label">📖 ${t('accessibility.fontLabel')}</span>
                <span class="toggle-desc">${t('accessibility.fontDesc')}</span>
              </div>
              <label class="retro-switch" aria-label="${t('accessibility.fontLabel')}">
                <input type="checkbox" .checked="${hl}" @change="${this._toggleLegibility}">
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-row" style="border-bottom: none; padding-bottom: 0;">
              <div class="toggle-info" style="width: 60%;">
                <span class="toggle-label">🔍 ${t('accessibility.scaleLabel')}</span>
                <span class="toggle-desc">Escala tipográfica para facilitar la lectura.</span>
              </div>
              <div style="width: 35%;">
                <div class="select-wrap">
                  <select class="retro-select" .value="${scale}" @change="${this._changeTextScale}" aria-label="${t('accessibility.scaleLabel')}">
                    <option value="normal">${t('accessibility.scaleNormal')}</option>
                    <option value="large">${t('accessibility.scaleLarge')}</option>
                    <option value="extra-large">${t('accessibility.scaleExtra')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Arena de Pruebas -->
        <div class="preview-arena">
          <h3 class="preview-title">🎮 ${t('accessibility.previewTitle')}</h3>
          
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px;">
            <!-- Simulación de Tabla de Grupos -->
            <div>
              <div style="font-family: var(--font-var); font-size: 12px; margin-bottom: 6px; color: var(--ink);">
                📊 ${t('accessibility.previewGroup')}
              </div>
              <table class="preview-table">
                <thead>
                  <tr>
                    <th style="width: 70%;">${t('groups.tableTeam')}</th>
                    <th style="width: 15%; text-align: center;">DG</th>
                    <th style="width: 15%; text-align: center;">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="qualify">
                    <td>
                      <span class="pos-pill">1</span>
                      <span class="team-badge">🇪🇸 ESP ${pat ? html`<span style="font-family: var(--font-mono); font-size:9px; font-weight:normal;">[Q]</span>` : ''}</span>
                    </td>
                    <td style="text-align: center; font-family: var(--font-mono);">+5</td>
                    <td class="pts-val" style="text-align: center;">9</td>
                  </tr>
                  <tr class="qualify">
                    <td>
                      <span class="pos-pill">2</span>
                      <span class="team-badge">🇵🇹 POR ${pat ? html`<span style="font-family: var(--font-mono); font-size:9px; font-weight:normal;">[Q]</span>` : ''}</span>
                    </td>
                    <td style="text-align: center; font-family: var(--font-mono);">+2</td>
                    <td class="pts-val" style="text-align: center;">6</td>
                  </tr>
                  <tr class="eliminate">
                    <td>
                      <span class="pos-pill">3</span>
                      <span class="team-badge">🇲🇦 MAR ${pat ? html`<span style="font-family: var(--font-mono); font-size:9px; font-weight:normal;">[E]</span>` : ''}</span>
                    </td>
                    <td style="text-align: center; font-family: var(--font-mono);">-1</td>
                    <td class="pts-val" style="text-align: center;">3</td>
                  </tr>
                  <tr class="eliminate">
                    <td>
                      <span class="pos-pill">4</span>
                      <span class="team-badge">🇮🇷 IRN ${pat ? html`<span style="font-family: var(--font-mono); font-size:9px; font-weight:normal;">[E]</span>` : ''}</span>
                    </td>
                    <td style="text-align: center; font-family: var(--font-mono);">-6</td>
                    <td class="pts-val" style="text-align: center;">0</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Simulación de Codo de Eliminatorias -->
            <div>
              <div style="font-family: var(--font-var); font-size: 12px; margin-bottom: 6px; color: var(--ink);">
                🏆 ${t('accessibility.previewMatch')}
              </div>
              <div class="preview-bracket">
                <div class="bracket-match">
                  <div class="match-header">
                    <span>MATCH 81</span>
                    <span>METLIFE</span>
                  </div>
                  <div class="match-team winner">
                    <span class="team-badge">
                      🇪🇸 ESP
                      <span class="winner-badge">ADVANCE</span>
                    </span>
                    <span class="match-score">2</span>
                  </div>
                  <div class="match-team">
                    <span class="team-badge">🇺🇾 URU</span>
                    <span class="match-score">1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-row">
          <button class="btn btn-secondary" @click="${this._resetSettings}">
            ${t('accessibility.resetBtn')}
          </button>
        </div>
      </div>
    `;
  }
}

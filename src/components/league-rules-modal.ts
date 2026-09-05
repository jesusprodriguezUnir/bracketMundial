import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '../i18n';
import { MUNDIAL_POINTS } from '../lib/mini-league';

@customElement('league-rules-modal')
export class LeagueRulesModal extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;

  static styles = css`
    :host {
      display: contents;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(3,6,16,0.66);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      display: flex;
      align-items: flex-start;
      padding-top: 4vh;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    :host([open]) .modal-backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    .modal-content {
      background: var(--card-grad);
      background-image: none;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      max-width: 600px;
      width: calc(100% - 40px);
      max-height: 80vh;
      overflow-y: auto;
      position: relative;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transform: scale(0.92);
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.25);
    }

    :host([open]) .modal-content {
      transform: scale(1);
    }

    /* Scrollbar retro */
    .modal-content::-webkit-scrollbar {
      width: 8px;
    }
    .modal-content::-webkit-scrollbar-track {
      background: var(--fill);
      border-left: 1px solid var(--hairline);
    }
    .modal-content::-webkit-scrollbar-thumb {
      background: var(--accent);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-pill);
    }

    .close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: color-mix(in srgb, var(--retro-red) 18%, var(--paper-2));
      color: var(--ink);
      border: 1px solid var(--retro-red);
      border-radius: var(--radius-sm);
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-family: var(--font-mono, monospace);
      font-weight: bold;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      z-index: 10;
      transition: transform 0.1s, box-shadow 0.1s;
    }

    .close-btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-md);
    }

    .close-btn:active {
      opacity: 0.7;
    }

    .modal-title {
      font-family: var(--font-var, sans-serif);
      font-size: 18px;
      letter-spacing: 0.04em;
      color: var(--ink, #1a1933);
      margin: 0;
      border-bottom: 1px solid var(--accent);
      padding-bottom: 4px;
      text-transform: uppercase;
      font-weight: 800;
      margin-right: 28px;
    }

    .intro-text {
      font-family: var(--font-body, sans-serif);
      font-size: 12px;
      line-height: 1.4;
      color: var(--ink-soft, rgba(26,25,51,0.85));
      margin: 0;
    }

    .section-title {
      font-family: var(--font-head, sans-serif);
      font-size: 11.5px;
      letter-spacing: 0.08em;
      color: var(--ink, #1a1933);
      margin: 6px 0 4px 0;
      text-transform: uppercase;
    }

    .rules-card-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    @media (max-width: 580px) {
      .rules-card-list {
        grid-template-columns: 1fr;
      }
    }

    .rules-card {
      background: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      padding: 8px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pts-badge {
      font-family: var(--font-var, sans-serif);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
    }

    .pts-badge.exact { background: var(--accent); color: var(--on-accent); }
    .pts-badge.diff { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--ink, #1a1933); }
    .pts-badge.sign { background: var(--fill); color: var(--ink, #1a1933); }
    .pts-badge.miss { background: var(--fill-soft); color: var(--ink-muted); }

    .card-text {
      font-family: var(--font-body, sans-serif);
      font-size: 11.5px;
      line-height: 1.35;
      color: var(--ink, #1a1933);
    }

    /* Eliminatorias Grid */
    .ko-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 4px;
    }

    @media (max-width: 480px) {
      .ko-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .ko-item {
      background: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      padding: 6px 4px;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .ko-round {
      font-family: var(--font-mono, monospace);
      font-size: 9px;
      color: var(--ink-muted);
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }

    .ko-pts {
      font-family: var(--font-var, sans-serif);
      font-size: 16px;
      color: var(--retro-red, #c41e2c);
    }

    .ko-callout {
      background: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      padding: 8px 10px;
      font-family: var(--font-body, sans-serif);
      font-size: 11px;
      line-height: 1.35;
      color: var(--ink, #1a1933);
      margin-top: 4px;
      position: relative;
    }

    .ko-callout::before {
      content: '★ ';
      font-weight: bold;
      color: var(--accent);
    }

    /* List element style */
    .trophy-badge {
      background: var(--accent);
      color: var(--on-accent);
      font-family: var(--font-var);
      font-size: 12px;
      padding: 5px 8px;
      border: 1px solid var(--accent);
      border-radius: var(--radius-pill);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: var(--shadow-sm);
      margin-top: 2px;
    }

    .tie-list {
      list-style-type: none;
      padding: 0;
      margin: 4px 0 0 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .tie-item {
      font-family: var(--font-body, sans-serif);
      font-size: 12px;
      color: var(--ink, #1a1933);
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .separator {
      border-top: 1px dashed var(--hairline);
      margin: 6px 0;
      opacity: 0.75;
    }
  `;

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('open') && this.open) {
      const content = this.renderRoot.querySelector('.modal-content');
      if (content) {
        content.scrollTop = 0;
      }
    }
  }

  render() {
    return html`
      <div class="modal-backdrop" @click="${this._handleBackdropClick}">
        <div class="modal-content" @click="${(e: Event) => e.stopPropagation()}">
          <button class="close-btn" aria-label="Close" @click="${this._close}">×</button>
          
          <h2 class="modal-title">${t('league.rulesModalTitle')}</h2>
          
          <p class="intro-text">${t('league.rulesIntro')}</p>
          
          <!-- 1. FASE DE GRUPOS -->
          <div class="rules-section">
            <h3 class="section-title">${t('league.rulesGroupTitle')}</h3>
            <div class="rules-card-list">
              <div class="rules-card">
                <div class="pts-badge exact">+${MUNDIAL_POINTS.groupExact}</div>
                <div class="card-text">${t('league.rulesGroupExact', { pts: MUNDIAL_POINTS.groupExact })}</div>
              </div>
              <div class="rules-card">
                <div class="pts-badge diff">+${MUNDIAL_POINTS.groupDiff}</div>
                <div class="card-text">${t('league.rulesGroupDiff', { pts: MUNDIAL_POINTS.groupDiff })}</div>
              </div>
              <div class="rules-card">
                <div class="pts-badge sign">+${MUNDIAL_POINTS.groupSign}</div>
                <div class="card-text">${t('league.rulesGroupSign', { pts: MUNDIAL_POINTS.groupSign })}</div>
              </div>
              <div class="rules-card">
                <div class="pts-badge miss">+${MUNDIAL_POINTS.groupMiss}</div>
                <div class="card-text">${t('league.rulesGroupMiss', { pts: MUNDIAL_POINTS.groupMiss })}</div>
              </div>
            </div>
          </div>

          <div class="separator"></div>

          <!-- 2. ELIMINATORIAS -->
          <div class="rules-section">
            <h3 class="section-title">${t('league.rulesKnockoutTitle')}</h3>
            <div class="ko-grid">
              <div class="ko-item">
                <span class="ko-round">1/16 (R32)</span>
                <span class="ko-pts">+${MUNDIAL_POINTS.koRoundOf32}</span>
              </div>
              <div class="ko-item">
                <span class="ko-round">1/8 (R16)</span>
                <span class="ko-pts">+${MUNDIAL_POINTS.koRoundOf16}</span>
              </div>
              <div class="ko-item">
                <span class="ko-round">1/4 (QF)</span>
                <span class="ko-pts">+${MUNDIAL_POINTS.koQuarterfinals}</span>
              </div>
              <div class="ko-item">
                <span class="ko-round">1/2 (SF)</span>
                <span class="ko-pts">+${MUNDIAL_POINTS.koSemifinals}</span>
              </div>
              <div class="ko-item">
                <span class="ko-round">Finalist</span>
                <span class="ko-pts">+${MUNDIAL_POINTS.koFinal}</span>
              </div>
              <div class="ko-item" style="background: linear-gradient(180deg, color-mix(in srgb, var(--retro-yellow) 22%, var(--paper-3)) 0%, var(--paper-3) 100%)">
                <span class="ko-round">Champion</span>
                <span class="ko-pts">+${MUNDIAL_POINTS.koWinner}</span>
              </div>
            </div>
            <div class="ko-callout">
              ${t('league.rulesKnockoutDesc')}
            </div>
          </div>

          <div class="separator"></div>

          <!-- 3. PREMIOS Y DESEMPATES -->
          <div class="rules-section">
            <h3 class="section-title">${t('league.rulesAwardsTitle')}</h3>
            <p class="intro-text">${t('league.rulesAwardsDesc')}</p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px;">
              <div class="trophy-badge">
                ⚽ ${t('league.rulesAwardsPichichi', { pts: MUNDIAL_POINTS.topScorer })}
              </div>
              <div class="trophy-badge" style="background: var(--retro-orange); color: var(--paper-3)">
                🏆 ${t('league.rulesAwardsMvp', { pts: MUNDIAL_POINTS.mvp })}
              </div>
            </div>
          </div>

          <div class="separator"></div>

          <!-- 4. DESEMPATE -->
          <div class="rules-section" style="margin-bottom: 8px;">
            <h3 class="section-title">${t('league.rulesTiebreakerTitle')}</h3>
            <p class="intro-text">${t('league.rulesTiebreakerDesc')}</p>
            <ul class="tie-list">
              <li class="tie-item">🎯 ${t('league.rulesTie1')}</li>
              <li class="tie-item">🔤 ${t('league.rulesTie2')}</li>
            </ul>
          </div>

        </div>
      </div>
    `;
  }

  private _handleBackdropClick(e: Event) {
    if (e.target === e.currentTarget) {
      this._close();
    }
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'league-rules-modal': LeagueRulesModal;
  }
}

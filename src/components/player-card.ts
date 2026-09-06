import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Player } from '../data/squads';
import { searchPlayer } from '../lib/player-service';
import type { PlayerDetail } from '../lib/player-service';
import { resolvePlayerPhoto } from '../lib/player-photo';
import { TEAMS_2026 } from '../data/fifa-2026';
import { renderFlag } from '../lib/render-flag';
import { getPlayerCondition, STATUS_META } from '../data/player-status';
import { t } from '../i18n';

function formatBirthDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function footLabel(foot: string): string {
  if (foot === 'Right') return t('player.footRight');
  if (foot === 'Left') return t('player.footLeft');
  return foot;
}

@customElement('player-card')
export class PlayerCard extends LitElement {
  @property({ type: Object }) player: Player | null = null;
  @property({ attribute: false }) teamId = '';

  @state() private _detail: PlayerDetail | null | 'loading' = 'loading';

  override connectedCallback() {
    super.connectedCallback();
    this._fetchDetail();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('player') && this.player) {
      this._fetchDetail();
    }
  }

  private async _fetchDetail() {
    if (!this.player) return;
    
    // Si ya tenemos una foto directa, podemos saltarnos la búsqueda o usarla como fallback prioritario
    // Pero por ahora, el servicio gestiona el enriquecimiento completo (bio, redes, etc)
    this._detail = 'loading';
    const result = await searchPlayer(
      this.player.name,
      this.teamId,
      this.player.number,
      this.player.thesportsdbId
    );

    const resolvedPhoto = resolvePlayerPhoto(this.teamId, this.player);

    if (result) {
      if (resolvedPhoto) result.photoUrl = resolvedPhoto;
    } else if (resolvedPhoto) {
      this._detail = {
        id: 'local',
        name: this.player.name,
        position: this.player.position,
        photoUrl: resolvedPhoto,
      };
      return;
    }

    this._detail = result;
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private _posLabel(pos: string) {
    const map: Record<string, string> = {
      GK: t('player.positionGK'),
      DF: t('player.positionDF'),
      MF: t('player.positionMF'),
      FW: t('player.positionFW'),
    };
    return map[pos] ?? pos;
  }

  static readonly styles = css`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(3,6,16,0.66);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .card {
      background: var(--card-grad);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.16s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--accent);
      color: var(--on-accent);
      border-bottom: 1px solid var(--hairline);
    }

    .close-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.08em;
      padding: 5px 12px;
      border: 1px solid var(--on-accent);
      border-radius: var(--radius-sm);
      color: var(--on-accent);
    }
    .close-btn:hover { background: rgba(255, 255, 255, 0.18); }

    .card-badge {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      color: var(--ink-muted);
    }

    .card-body {
      padding: 18px;
    }

    .player-hero {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .player-photo {
      width: 108px;
      min-width: 108px;
      height: 128px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      background: var(--fill);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .player-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .photo-placeholder {
      font-size: 42px;
      opacity: 0.3;
    }

    .player-name {
      font-family: var(--font-var);
      font-size: 24px;
      line-height: 1.05;
      color: var(--ink);
      margin-bottom: 6px;
    }

    .player-team {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .player-club {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink-muted);
      letter-spacing: 0.05em;
    }

    .data-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-md);
      background: var(--fill);
      margin-bottom: 14px;
    }

    .data-cell {
      padding: 8px 10px;
      border-right: 1px solid var(--hairline);
      border-bottom: 1px solid var(--hairline);
    }

    .data-cell:nth-child(even) { border-right: none; }
    .data-cell:nth-last-child(-n+2) { border-bottom: none; }

    .data-label {
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin-bottom: 2px;
    }

    .data-value {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      color: var(--ink);
    }

    .condition-alert {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      margin-top: 14px;
      border: 1px solid var(--hairline);
      font-family: var(--font-body);
    }
    .condition-alert.status-injured {
      background: rgba(220, 38, 38, 0.1);
      border-color: rgba(220, 38, 38, 0.35);
      color: #991b1b;
    }
    .condition-alert.status-doubt {
      background: rgba(217, 119, 6, 0.1);
      border-color: rgba(217, 119, 6, 0.35);
      color: #92400e;
    }
    .condition-alert.status-suspended {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.35);
      color: #991b1b;
    }
    .condition-icon {
      font-size: 18px;
      line-height: 1;
      margin-top: 2px;
    }
    .condition-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .condition-desc {
      font-size: 13px;
      line-height: 1.4;
      margin-top: 2px;
    }
    .condition-return {
      font-family: var(--font-mono);
      font-size: 11px;
      margin-top: 4px;
      opacity: 0.85;
    }

    .divider {
      border: none;
      border-top: 1px solid var(--hairline);
      margin: 14px 0;
    }

    .bio {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.6;
      color: var(--ink);
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 14px;
    }

    .socials {
      display: flex;
      gap: 8px;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-sm);
      background: var(--fill);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.05em;
      color: var(--ink);
      text-decoration: none;
    }

    .social-link:hover {
      background: var(--accent);
      color: var(--on-accent);
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-md);
    }

    @media (max-width: 480px) {
      .player-hero { flex-direction: column; align-items: center; }
      .player-name { font-size: 20px; text-align: center; }
      .player-team { justify-content: center; }
      .player-club { text-align: center; }
    }
  `;

  render() {
    if (!this.player) return nothing;
    const team = TEAMS_2026.find(t => t.id === this.teamId);
    const detail = this._detail;

    return html`
      <div
        class="overlay"
        @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}
      >
        <div class="card" role="dialog" aria-modal="true">
          <div class="card-header">
            <button class="close-btn" @click=${() => this._close()}>${t('player.close')}</button>
            <span class="card-badge">#${this.player.number} · ${this.player.position}</span>
          </div>

          ${detail === 'loading'
            ? html`<div class="loading">${t('player.loading')}</div>`
            : html`
              <div class="card-body">
                <div class="player-hero">
                  <div class="player-photo">
                    ${detail?.photoUrl
                      ? html`<img src="${detail.photoUrl}" alt="${this.player.name}" loading="lazy">`
                      : html`<span class="photo-placeholder">👤</span>`}
                  </div>
                  <div>
                    <div class="player-name">${this.player.name}</div>
                    <div class="player-team">
                      ${renderFlag(team, 'sm')}
                      ${team?.name ?? this.teamId}
                    </div>
                    <div class="player-club">${this.player.club}</div>
                  </div>
                </div>

                ${(() => {
                  const cond = getPlayerCondition(this.teamId, this.player.name);
                  if (!cond || cond.status === 'available') return '';
                  const meta = STATUS_META[cond.status];
                  return html`
                    <div class="condition-alert status-${cond.status}">
                      <span class="condition-icon">${meta.icon}</span>
                      <div class="condition-content">
                        <div class="condition-title">${meta.label}</div>
                        <div class="condition-desc">${cond.diagnosis ?? ''}</div>
                        ${cond.expectedReturn ? html`<div class="condition-return">Regreso estimado: ${cond.expectedReturn}</div>` : ''}
                      </div>
                    </div>
                  `;
                })()}

                ${this._renderDataGrid(detail)}

                ${detail?.description ? html`
                  <hr class="divider">
                  <p class="bio">${detail.description}</p>
                ` : ''}

                ${(detail?.twitter || detail?.instagram) ? html`
                  <div class="socials">
                    ${detail.twitter ? html`<a class="social-link" href="${detail.twitter}" target="_blank" rel="noopener noreferrer">𝕏 ${t('player.socialTwitter')}</a>` : ''}
                    ${detail.instagram ? html`<a class="social-link" href="${detail.instagram}" target="_blank" rel="noopener noreferrer">📷 ${t('player.socialInstagram')}</a>` : ''}
                  </div>
                ` : ''}
              </div>
            `}
        </div>
      </div>
    `;
  }

  private _renderDataGrid(detail: PlayerDetail | null) {
    const p = this.player!;
    const cells: Array<{ label: string; value: string }> = [];

    cells.push({ label: t('player.labelPosition'), value: this._posLabel(p.position) });
    cells.push({ label: t('player.labelAge'), value: t('player.ageSuffix', { n: p.age }) });

    if (detail?.height) cells.push({ label: t('player.labelHeight'), value: detail.height });
    if (detail?.birthDate) cells.push({ label: t('player.labelBirth'), value: formatBirthDate(detail.birthDate) });
    if (detail?.foot) cells.push({ label: t('player.labelFoot'), value: footLabel(detail.foot) });
    if (detail?.weight) cells.push({ label: t('player.labelWeight'), value: detail.weight });
    if (detail?.birthPlace) cells.push({ label: t('player.labelBirthPlace'), value: detail.birthPlace });

    if (cells.length % 2 !== 0) cells.push({ label: '', value: '' });

    return html`
      <div class="data-grid">
        ${cells.map(c => html`
          <div class="data-cell">
            <div class="data-label">${c.label}</div>
            <div class="data-value">${c.value}</div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'player-card': PlayerCard;
  }
}

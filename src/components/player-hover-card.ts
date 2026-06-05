import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';
import type { Player } from '../data/squads';
import { resolvePlayerPhoto } from '../lib/player-photo';
import { t } from '../i18n';

@customElement('player-hover-card')
export class PlayerHoverCard extends LitElement {
  @property({ type: Object }) player: Player | null = null;
  @property() teamId = '';
  @property({ type: Number }) x = 0;
  @property({ type: Number }) y = 0;

  override updated(changedProps: PropertyValues) {
    if (changedProps.has('x') || changedProps.has('y')) {
      this.style.left = `${this.x}px`;
      this.style.top = `${this.y}px`;
    }
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
    :host {
      position: fixed;
      z-index: 10000;
      pointer-events: none;
      display: block;
      width: 290px;
      font-family: var(--font-body);
    }

    .hover-card {
      background: var(--paper-3);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.12s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(4px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--dim);
      border-bottom: 1px solid rgba(26, 25, 51, 0.15);
      padding-bottom: 4px;
    }

    .card-header .number {
      color: var(--retro-red);
      font-size: 11px;
    }

    .card-body-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .player-photo {
      width: 72px;
      min-width: 72px;
      height: 86px;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
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
      font-size: 28px;
      opacity: 0.3;
    }

    .info-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .name {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      line-height: 1.15;
      color: var(--ink);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stats {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 600;
      color: var(--retro-blue);
      text-transform: lowercase;
    }

    .special-badge {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      margin-top: 2px;
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 2px 5px;
      background: var(--retro-yellow);
      border: 1px solid var(--ink);
      color: var(--ink);
    }

    .bio {
      font-family: var(--font-body);
      font-size: 11px;
      line-height: 1.4;
      color: var(--ink-soft);
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed rgba(26, 25, 51, 0.15);
    }
  `;

  render() {
    if (!this.player) return html``;
    const photo = resolvePlayerPhoto(this.teamId, this.player);

    const statsParts: string[] = [];
    if (this.player.caps !== undefined) {
      statsParts.push(`${this.player.caps} ${t('player.labelCaps')}`);
    }
    if (this.player.goals !== undefined) {
      statsParts.push(`${this.player.goals} ${t('player.labelGoals')}`);
    }
    const statsStr = statsParts.join(' · ');

    return html`
      <div class="hover-card">
        <div class="card-header">
          <span class="number">#${this.player.number}</span>
          <span class="position">${this._posLabel(this.player.position)}</span>
        </div>
        <div class="card-body-row">
          <div class="player-photo">
            ${photo
              ? html`<img src="${photo}" alt="${this.player.name}" loading="lazy">`
              : html`<span class="photo-placeholder">👤</span>`}
          </div>
          <div class="info-container">
            <div class="name">${this.player.name}</div>
            <div class="meta">${this.player.club} · ${t('player.ageSuffix', { n: this.player.age })}</div>
            ${statsStr ? html`<div class="stats">${statsStr}</div>` : ''}
            ${this.player.special ? html`<div class="special-badge">⭐ ${t('player.special')}</div>` : ''}
          </div>
        </div>
        ${this.player.bio ? html`<div class="bio">${this.player.bio}</div>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'player-hover-card': PlayerHoverCard;
  }
}

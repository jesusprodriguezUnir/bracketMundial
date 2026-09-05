import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Player, Lineup } from '../data/squads';
import { resolvePlayerPhoto } from '../lib/player-photo';
import { getInitials } from '../lib/text-utils';

function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.at(-1) ?? name;
}

@customElement('lineup-view')
export class LineupView extends LitElement {
  @property({ type: Array }) squad: Player[] = [];
  @property({ type: Object }) lineup!: Lineup;
  @property() teamId = '';

  static readonly styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .pitch {
      position: relative;
      background: var(--retro-green);
      border: 1px solid var(--hairline-strong);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      aspect-ratio: 2 / 3;
      margin: 0 auto;
      max-width: 440px;
      overflow: hidden;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-evenly;
      padding: 24px 0;
    }

    /* Stripes (campo segado) */
    .pitch::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image:
        repeating-linear-gradient(to bottom, transparent 0 36px, rgba(255,255,255,0.06) 36px 72px),
        radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1.5px);
      background-size: auto, 8px 8px;
      z-index: 0;
    }

    .line-center {
      position: absolute;
      top: 50%; left: 0; right: 0; height: 3px;
      background: rgba(255,255,255,0.7);
      transform: translateY(-50%);
      z-index: 1;
    }

    .circle-center {
      position: absolute;
      top: 50%; left: 50%;
      width: 100px; height: 100px;
      border: 3px solid rgba(255,255,255,0.7);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    .penalty-box-top, .penalty-box-bottom {
      position: absolute;
      left: 50%;
      width: 180px; height: 70px;
      border: 3px solid rgba(255,255,255,0.7);
      transform: translateX(-50%);
      z-index: 1;
    }
    .penalty-box-top    { top: 0;    border-top: none; }
    .penalty-box-bottom { bottom: 0; border-bottom: none; }

    .six-yard-top, .six-yard-bottom {
      position: absolute;
      left: 50%;
      width: 80px; height: 24px;
      border: 3px solid rgba(255,255,255,0.7);
      transform: translateX(-50%);
      z-index: 1;
    }
    .six-yard-top    { top: 0;    border-top: none; }
    .six-yard-bottom { bottom: 0; border-bottom: none; }

    /* Jugadores */
    .row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      z-index: 2;
      position: relative;
    }

    .player {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 72px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .player:hover {
      transform: scale(1.05);
    }

    .player-token {
      position: relative;
      width: 52px;
      height: 52px;
      background-color: var(--fill);
      border: 1px solid var(--hairline);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      box-shadow: var(--shadow-sm);
      overflow: visible;
    }

    .player-token .photo-frame {
      position: absolute;
      inset: 0;
      background-color: var(--fill);
      background-size: cover;
      background-position: top center;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* GK sin foto */
    .row-0 .player-token:not(.has-photo) .photo-frame {
      background-color: var(--accent);
    }

    .number-sticker {
      position: absolute;
      bottom: -6px;
      right: -6px;
      background: var(--accent);
      color: var(--on-accent);
      border: 1px solid var(--accent);
      border-radius: var(--radius-sm);
      padding: 1px 4px;
      font-family: var(--font-var);
      font-size: 11px;
      line-height: 1;
    }

    .captain-mark {
      position: absolute;
      top: -6px;
      left: -6px;
      background: color-mix(in srgb, var(--retro-red) 18%, var(--paper-2));
      color: var(--ink);
      border: 1px solid var(--retro-red);
      border-radius: var(--radius-sm);
      padding: 1px 4px;
      font-family: var(--font-mono);
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.1em;
      line-height: 1;
    }

    .player-name {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--on-dark);
      background: var(--card-grad);
      border-radius: var(--radius-sm);
      padding: 2px 5px;
      letter-spacing: 0.05em;
      white-space: nowrap;
      text-align: center;
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
      .pitch {
        max-width: 100%;
        aspect-ratio: 3 / 4;
        padding: 16px 0;
      }

      .player {
        width: 52px;
        gap: 3px;
      }

      .player-token {
        width: 40px;
        height: 40px;
        font-size: 10px;
      }

      .number-sticker {
        font-size: 9px;
        padding: 1px 3px;
      }

      .captain-mark {
        font-size: 7px;
        padding: 1px 3px;
      }

      .player-name {
        font-size: 8px;
        max-width: 52px;
        padding: 1px 3px;
      }
    }
  `;

  render() {
    if (!this.lineup || !this.squad.length) return html``;

    // parse formation
    const rows = this.lineup.formation.split('-').map(n => Number.parseInt(n, 10));
    // rows is like [4, 2, 3, 1]
    
    // Group players into rows: GK (1), Defenders (rows[0]), Midfielders (rows[1])...
    const playerGroups: number[][] = [];
    let currentIndex = 0;

    // GK row
    playerGroups.push([this.lineup.startingXI[currentIndex]]);
    currentIndex++;

    for (const count of rows) {
      playerGroups.push(this.lineup.startingXI.slice(currentIndex, currentIndex + count));
      currentIndex += count;
    }

    const lineupDescription = playerGroups
      .map((group, rowIndex) => {
        const rowLabel = rowIndex === 0 ? 'Portero' : `Línea ${rowIndex}`;
        const names = group.map(playerNumber => {
          const player = this.squad.find(p => p.number === playerNumber);
          return player ? player.name : `Jugador ${playerNumber}`;
        }).join(', ');
        return `${rowLabel}: ${names}.`;
      })
      .join(' ');

    return html`
      <div
        class="pitch"
        role="img"
        aria-label="Formación ${this.lineup.formation}. ${lineupDescription}">
        <div class="line-center"></div>
        <div class="circle-center"></div>
        <div class="penalty-box-top"></div>
        <div class="six-yard-top"></div>
        <div class="penalty-box-bottom"></div>
        <div class="six-yard-bottom"></div>

        ${playerGroups.map((group, rowIndex) => html`
          <div class="row row-${rowIndex}">
            ${group.map(playerNumber => {
              const player = this.squad.find(p => p.number === playerNumber);
              const name = player ? getLastName(player.name) : '?';
              const photo = resolvePlayerPhoto(this.teamId, player);
              const fallback = player ? getInitials(player.name) : '?';

              return html`
                <div 
                  class="player"
                  @click=${() => {
                    if (player) {
                      this.dispatchEvent(new CustomEvent('player-click', {
                        detail: { player, teamId: this.teamId },
                        bubbles: true,
                        composed: true
                      }));
                    }
                  }}
                  @mouseenter=${(e: MouseEvent) => {
                    if (player) {
                      this.dispatchEvent(new CustomEvent('player-mouseenter', {
                        detail: { player, teamId: this.teamId, originalEvent: e },
                        bubbles: true,
                        composed: true
                      }));
                    }
                  }}
                  @mouseleave=${() => {
                    if (player) {
                      this.dispatchEvent(new CustomEvent('player-mouseleave', {
                        bubbles: true,
                        composed: true
                      }));
                    }
                  }}
                >
                  <div class="player-token ${photo ? 'has-photo' : ''}">
                    <div
                      class="photo-frame"
                      style="${photo ? `background-image: url('${photo}')` : ''}"
                    >
                      ${photo ? '' : fallback}
                    </div>
                    <div class="number-sticker">${playerNumber}</div>
                    ${player?.captain ? html`<div class="captain-mark">CAP</div>` : ''}
                  </div>
                  <div class="player-name">${name}</div>
                </div>
              `;
            })}
          </div>
        `)}
      </div>
    `;
  }
}

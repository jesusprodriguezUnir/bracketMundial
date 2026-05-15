import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Player, Lineup } from '../data/squads';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getLastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1];
}

@customElement('lineup-view')
export class LineupView extends LitElement {
  @property({ type: Array }) squad: Player[] = [];
  @property({ type: Object }) lineup!: Lineup;

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .pitch {
      position: relative;
      background: var(--paper-2);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      aspect-ratio: 2 / 3;
      margin: 0 auto;
      max-width: 400px;
      overflow: hidden;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-evenly;
      padding: 20px 0;
    }

    /* Pizarra táctica / pitch lines */
    .pitch::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: 
        linear-gradient(to right, rgba(26,25,51,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(26,25,51,0.05) 1px, transparent 1px);
      background-size: 20px 20px;
      z-index: 0;
    }

    .line-center {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--ink);
      transform: translateY(-50%);
      z-index: 1;
    }

    .circle-center {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      border: 3px solid var(--ink);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    .penalty-box-top, .penalty-box-bottom {
      position: absolute;
      left: 50%;
      width: 140px;
      height: 60px;
      border: 3px solid var(--ink);
      transform: translateX(-50%);
      z-index: 1;
    }

    .penalty-box-top {
      top: 0;
      border-top: none;
    }

    .penalty-box-bottom {
      bottom: 0;
      border-bottom: none;
    }

    .six-yard-top, .six-yard-bottom {
      position: absolute;
      left: 50%;
      width: 60px;
      height: 20px;
      border: 3px solid var(--ink);
      transform: translateX(-50%);
      z-index: 1;
    }

    .six-yard-top {
      top: 0;
      border-top: none;
    }

    .six-yard-bottom {
      bottom: 0;
      border-bottom: none;
    }

    /* Jugadores */
    .row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      z-index: 2;
    }

    .player {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 60px;
    }

    .player-token {
      width: 32px;
      height: 32px;
      background-color: var(--paper);
      background-size: cover;
      background-position: top center;
      border: 3px solid var(--ink);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
      overflow: hidden;
      position: relative;
    }

    .player-token.has-photo {
      color: transparent; /* Hide number if there's a photo */
    }

    /* GK is slightly different color */
    .row-0 .player-token:not(.has-photo) {
      background: var(--retro-yellow);
    }

    .player-name {
      font-family: var(--font-mono);
      font-size: 9px;
      text-transform: uppercase;
      font-weight: bold;
      color: var(--paper);
      background: var(--ink);
      padding: 2px 4px;
      letter-spacing: 0.05em;
      white-space: nowrap;
      text-align: center;
      border: 1px solid var(--ink);
    }
  `;

  render() {
    if (!this.lineup || !this.squad.length) return html``;

    // parse formation
    const rows = this.lineup.formation.split('-').map(n => parseInt(n, 10));
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

    return html`
      <div class="pitch">
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
              const photo = player?.photoUrl;
              
              return html`
                <div class="player">
                  <div 
                    class="player-token ${photo ? 'has-photo' : ''}"
                    style="${photo ? `background-image: url('${photo}')` : ''}"
                  >
                    ${!photo ? playerNumber : ''}
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

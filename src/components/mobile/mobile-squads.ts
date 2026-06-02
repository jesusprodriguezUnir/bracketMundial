import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { SQUADS, LINEUPS, type Player } from '../../data/squads/index';
import { COACHES } from '../../data/coaches/index';
import { hasPlayerPhoto, playerPhotoSrc } from '../../lib/player-photo';
import { resolveCoachPhoto } from '../../lib/coach-photo';
import { mobileShared } from './mobile-shared.css';

const POS_ORDER: Array<Player['position']> = ['GK', 'DF', 'MF', 'FW'];
const POS_NAME: Record<string, string> = {
  GK: 'Porteros', DF: 'Defensas', MF: 'Centrocampistas', FW: 'Delanteros',
};
const POS_CLASS: Record<string, string> = {
  GK: 'POR', DF: 'DEF', MF: 'MED', FW: 'DEL',
};

type SquadMode = 'list' | 'pitch';

function calcAge(born: string): number {
  const b = new Date(born);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

/** Vista de Plantillas del shell móvil — lista + vista de cancha */
@customElement('mobile-squads')
export class MobileSquads extends LitElement {
  @state() private _activeTeam = 'ESP';
  @state() private _mode: SquadMode = 'list';

  private _renderCoachBanner(teamId: string) {
    const coach = COACHES[teamId];
    if (!coach) return html``;
    const photoSrc = resolveCoachPhoto(teamId, coach);
    const age = calcAge(coach.born);
    return html`
      <div class="coach-banner">
        <div class="coach-top">
          ${photoSrc
            ? html`<img class="coach-photo" src="${photoSrc}" alt="${coach.name}" loading="lazy">`
            : html`<div class="coach-photo initials">${coach.name.split(' ').map(w => w[0]).slice(0,2).join('')}</div>`}
          <div>
            <div class="coach-name">${coach.name}</div>
            <div class="coach-role">SELECCIONADOR · ${teamId}</div>
          </div>
        </div>
        <div class="coach-meta">
          <span class="cmeta-chip"><b>${age}</b> años</span>
          <span class="cmeta-chip">${coach.nationality}</span>
        </div>
      </div>`;
  }

  private _renderList(teamId: string) {
    const squad = SQUADS[teamId] ?? [];
    const sections = POS_ORDER.map(pos => {
      const players = squad.filter(p => p.position === pos);
      if (!players.length) return html``;
      const rows = players.map(p => {
        const hasPic = hasPlayerPhoto(teamId, p.number);
        const photoSrc = hasPic ? playerPhotoSrc(teamId, p.number) : p.photoUrl;
        const initial = p.name.split(' ').pop()?.[0] ?? '?';
        return html`
          <div class="player-row">
            <div class="player-num">${p.number}</div>
            ${photoSrc
              ? html`<img class="player-photo" src="${photoSrc}" alt="${p.name}" loading="lazy">`
              : html`<div class="player-photo initials">${initial}</div>`}
            <div class="player-info">
              <div class="player-name">${p.name}${p.captain ? ' ©' : ''}</div>
              <div class="player-club">${p.club}</div>
            </div>
            <div class="player-age">${p.age}a</div>
          </div>`;
      });
      return html`
        <div class="pos-group">
          <span class="pos-label ${POS_CLASS[pos]}">${POS_NAME[pos]}</span>
          ${rows}
        </div>`;
    });
    return html`<div class="squad-list">${sections}</div>`;
  }

  private _renderPitch(teamId: string) {
    const squad = SQUADS[teamId] ?? [];
    const lineup = LINEUPS[teamId];
    // Toma la XI del lineup si existe, si no fallback 4-3-3
    let lines: Player[][];
    if (lineup) {
      const xi = new Set(lineup.startingXI);
      const starters = squad.filter(p => xi.has(p.number));
      const gk = starters.filter(p => p.position === 'GK').slice(0,1);
      const df = starters.filter(p => p.position === 'DF').slice(0,4);
      const mf = starters.filter(p => p.position === 'MF').slice(0,3);
      const fw = starters.filter(p => p.position === 'FW').slice(0,3);
      lines = [gk, df, mf, fw];
    } else {
      lines = [
        squad.filter(p => p.position === 'GK').slice(0,1),
        squad.filter(p => p.position === 'DF').slice(0,4),
        squad.filter(p => p.position === 'MF').slice(0,3),
        squad.filter(p => p.position === 'FW').slice(0,3),
      ];
    }

    const rowsHtml = [...lines].reverse().map(line => html`
      <div class="pitch-line">
        ${line.map(p => {
          const hasPic = hasPlayerPhoto(teamId, p.number);
          const photoSrc = hasPic ? playerPhotoSrc(teamId, p.number) : p.photoUrl;
          const initial = p.name.split(' ').pop()?.[0] ?? '?';
          return html`
            <div class="chip">
              <div class="chip-disc">
                ${photoSrc
                  ? html`<img src="${photoSrc}" alt="${p.name}" class="chip-photo" loading="lazy">`
                  : html`${initial}`}
                <span class="num-sticker">${p.number}</span>
              </div>
              <div class="chip-name">${p.name.split(' ').pop()}</div>
            </div>`;
        })}
      </div>`);

    return html`<div class="pitch"><div class="pitch-rows">${rowsHtml}</div></div>`;
  }

  static readonly styles = [
    mobileShared,
    css`
      :host { display: block; }

      /* ── Team selector ── */
      .team-selector {
        display: flex; gap: 8px; padding: 0 16px 14px;
        overflow-x: auto; scrollbar-width: none;
      }
      .team-selector::-webkit-scrollbar { display: none; }
      .team-pick {
        all: unset; cursor: pointer; flex-shrink: 0;
        display: flex; flex-direction: column; align-items: center; gap: 5px;
        width: 58px; padding: 8px 4px;
        border: 2px solid var(--ink);
        background: var(--paper-3);
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .team-pick.active { background: var(--retro-blue); }
      .team-pick.active .tp-code { color: var(--paper); }
      .team-pick .flag-box { width: 30px; height: 20px; font-size: 16px; }
      .team-pick .tp-code {
        font-family: var(--font-mono); font-size: 9px;
        font-weight: 700; letter-spacing: 0.06em; color: var(--ink);
      }

      /* ── Coach banner ── */
      .coach-banner {
        margin: 0 16px 16px; border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-lg); overflow: hidden; background: var(--paper-3);
      }
      .coach-top {
        display: flex; gap: 12px; padding: 14px;
        background: var(--retro-red);
        background-image: radial-gradient(circle, rgba(236,223,192,0.13) 1.5px, transparent 1.6px) 0 0 / 6px 6px;
        color: var(--paper); align-items: center;
      }
      .coach-photo {
        width: 64px; height: 64px; border: 3px solid var(--paper);
        background: var(--ink); flex-shrink: 0;
        display: grid; place-items: center; object-fit: cover;
      }
      .coach-photo.initials { font-family: var(--font-var); font-size: 22px; color: var(--paper); }
      .coach-name { font-family: var(--font-var); font-size: 21px; line-height: 0.95; }
      .coach-role { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; margin-top: 6px; opacity: 0.85; }
      .coach-meta { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 14px; border-top: 2px solid var(--ink); }
      .cmeta-chip {
        font-family: var(--font-mono); font-size: 9px;
        border: 1.5px solid var(--ink); padding: 3px 7px;
        background: var(--paper-2); letter-spacing: 0.04em;
      }

      /* ── Toggle ── */
      .squad-toggle {
        display: flex; margin: 0 16px 14px;
        border: 3px solid var(--ink); box-shadow: var(--shadow-hard-sm);
      }
      .squad-toggle button {
        all: unset; cursor: pointer; flex: 1; text-align: center;
        padding: 10px; font-family: var(--font-var); font-size: 13px; color: var(--ink);
        min-height: 44px; display: grid; place-items: center;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .squad-toggle button.active { background: var(--ink); color: var(--retro-yellow); }
      .squad-toggle button + button { border-left: 2px solid var(--ink); }

      /* ── Lista ── */
      .squad-list { padding-bottom: 16px; }
      .pos-group { margin: 0 16px 14px; }
      .pos-label {
        font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em;
        text-transform: uppercase; padding: 5px 9px; display: inline-block;
        color: var(--paper); margin-bottom: 8px;
      }
      .pos-label.POR { background: var(--retro-yellow); color: var(--ink); }
      .pos-label.DEF { background: var(--retro-blue); }
      .pos-label.MED { background: var(--retro-green); }
      .pos-label.DEL { background: var(--retro-red); }

      .player-row {
        display: flex; align-items: center; gap: 11px;
        padding: 8px 11px; border: 2px solid var(--ink);
        box-shadow: var(--shadow-hard-sm); background: var(--paper-3);
        margin-bottom: 8px;
      }
      .player-num { font-family: var(--font-var); font-size: 17px; color: var(--ink); width: 26px; text-align: center; flex-shrink: 0; }
      .player-photo {
        width: 42px; height: 42px; border: 2px solid var(--ink);
        background: var(--paper-2); flex-shrink: 0;
        display: grid; place-items: center; object-fit: cover;
      }
      .player-photo.initials { font-family: var(--font-var); font-size: 13px; color: var(--dim); }
      .player-info { flex: 1; min-width: 0; }
      .player-name { font-family: var(--font-body); font-size: 14px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .player-club { font-family: var(--font-mono); font-size: 9px; color: var(--dim); letter-spacing: 0.04em; margin-top: 2px; }
      .player-age { font-family: var(--font-mono); font-size: 11px; color: var(--dim); flex-shrink: 0; }

      /* ── Cancha ── */
      .pitch {
        margin: 0 16px 16px; border: 3px solid var(--ink);
        box-shadow: var(--shadow-hard-lg);
        background: repeating-linear-gradient(0deg, #1f6b3a 0 38px, #1c5f34 38px 76px);
        position: relative; aspect-ratio: 3 / 4; overflow: hidden; padding: 12px;
      }
      .pitch::before {
        content: ""; position: absolute; inset: 10px;
        border: 2px solid rgba(255,255,255,0.4);
      }
      .pitch-rows { position: relative; height: 100%; display: flex; flex-direction: column; justify-content: space-around; z-index: 2; }
      .pitch-line { display: flex; justify-content: space-evenly; align-items: center; }
      .chip { display: flex; flex-direction: column; align-items: center; gap: 3px; }
      .chip-disc {
        width: 38px; height: 38px; background: var(--paper-3); border: 2px solid var(--ink);
        display: grid; place-items: center; position: relative;
        font-family: var(--font-var); font-size: 14px; color: var(--ink);
        box-shadow: var(--shadow-hard-sm); overflow: hidden;
      }
      .chip-photo { width: 100%; height: 100%; object-fit: cover; }
      .num-sticker {
        position: absolute; top: -7px; right: -7px;
        background: var(--retro-yellow); border: 1.5px solid var(--ink);
        font-family: var(--font-var); font-size: 9px; color: var(--ink);
        width: 18px; height: 18px; display: grid; place-items: center;
      }
      .chip-name {
        font-family: var(--font-mono); font-size: 8.5px; font-weight: 700;
        color: var(--paper); background: var(--ink); padding: 1px 5px;
        letter-spacing: 0.04em; max-width: 64px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;
      }
    `,
  ];

  render() {
    const tid = this._activeTeam;
    // Selector de los 12 equipos featured + todos accesibles en scroll
    const featured = ['ESP','ARG','BRA','FRA','GER','ENG','POR','NED','MEX','USA','CRO','BEL'];
    const allTeamIds = TEAMS_2026.map(t => t.id);
    // Mostrar featured primero, luego el resto
    const ordered = [...new Set([...featured, ...allTeamIds])];

    const picks = ordered.map(id => {
      const team = TEAMS_2026.find(t => t.id === id);
      if (!team) return html``;
      return html`
        <button class="team-pick ${id === tid ? 'active' : ''}" @click="${() => { this._activeTeam = id; }}">
          <span class="flag-box big">${team.flag}</span>
          <span class="tp-code">${id}</span>
        </button>`;
    });

    return html`
      <!-- Selector -->
      <div class="team-selector">${picks}</div>

      <!-- Coach banner -->
      ${this._renderCoachBanner(tid)}

      <!-- Toggle lista/cancha -->
      <div class="squad-toggle">
        <button class="${this._mode === 'list' ? 'active' : ''}" @click="${() => { this._mode = 'list'; }}">▤ LISTA</button>
        <button class="${this._mode === 'pitch' ? 'active' : ''}" @click="${() => { this._mode = 'pitch'; }}">▦ CANCHA</button>
      </div>

      <!-- Contenido -->
      ${this._mode === 'list' ? this._renderList(tid) : this._renderPitch(tid)}
    `;
  }
}

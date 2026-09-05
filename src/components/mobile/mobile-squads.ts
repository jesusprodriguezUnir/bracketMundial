import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { SQUADS, LINEUPS, type Player, isOfficialSquad } from '../../data/squads/index';
import { COACHES } from '../../data/coaches/index';
import { hasPlayerPhoto, playerPhotoSrc } from '../../lib/player-photo';
import { resolveCoachPhoto } from '../../lib/coach-photo';
import { mobileShared } from './mobile-shared.css';
import { t } from '../../i18n';
import { normalize } from '../../lib/text-utils';

const POS_ORDER: Array<Player['position']> = ['GK', 'DF', 'MF', 'FW'];
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

/** Vista de Plantillas del shell móvil — lista + vista de cancha + buscador y grupos */
@customElement('mobile-squads')
export class MobileSquads extends LitElement {
  @state() private _activeTeam: string | null = null;
  @state() private _mode: SquadMode = 'list';
  @state() private searchQuery = '';

  private _getPlayerResults() {
    const q = normalize(this.searchQuery.trim());
    if (q.length < 2) return [];
    const results: Array<{ teamId: string; number: number; name: string; position: string; club: string }> = [];
    for (const [teamId, players] of Object.entries(SQUADS)) {
      for (const player of players) {
        if (normalize(player.name).includes(q) || normalize(player.club).includes(q)) {
          results.push({ teamId, number: player.number, name: player.name, position: player.position, club: player.club });
          if (results.length >= 8) return results;
        }
      }
    }
    return results;
  }

  private _teamMatchesQuery(teamId: string): boolean {
    const q = normalize(this.searchQuery.trim());
    if (q.length < 2) return true;
    const team = TEAMS_2026.find(t => t.id === teamId);
    if (!team) return false;
    return normalize(team.name).includes(q) || normalize(team.shortName).includes(q);
  }

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
            <div class="coach-role">${t('squads.coach.role')} · ${teamId}</div>
          </div>
        </div>
        <div class="coach-meta">
          <span class="cmeta-chip"><b>${age}</b> ${t('squads.years')}</span>
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
            <div class="player-age">${p.age}${t('squads.age.suffix')}</div>
          </div>`;
      });
      return html`
        <div class="pos-group">
          <span class="pos-label ${POS_CLASS[pos]}">${t(`squads.pos.${pos}` as any)}</span>
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

      /* ── Coach banner ── */
      .coach-banner {
        margin: 0 16px 16px; border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg); overflow: hidden; background: var(--card-grad);
      }
      .coach-top {
        display: flex; gap: 12px; padding: 14px;
        background: var(--card-grad);
        background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1.4px) 0 0 / 6px 6px;
        color: var(--on-dark); align-items: center;
      }
      .coach-photo {
        width: 64px; height: 64px; border: 1px solid var(--hairline-strong);
        border-radius: var(--radius-sm);
        background: var(--fill); flex-shrink: 0;
        display: grid; place-items: center; object-fit: cover;
      }
      .coach-photo.initials { font-family: var(--font-var); font-size: 22px; color: var(--on-dark); }
      .coach-name { font-family: var(--font-var); font-size: 21px; line-height: 0.95; text-transform: uppercase; font-weight: 800; }
      .coach-role { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.14em; margin-top: 6px; opacity: 0.85; }
      .coach-meta { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 14px; border-top: 1px solid var(--hairline); }
      .cmeta-chip {
        font-family: var(--font-mono); font-size: 9px;
        border: 1px solid var(--hairline); border-radius: var(--radius-pill); padding: 3px 7px;
        background: var(--fill); letter-spacing: 0.04em;
      }

      /* ── Toggle ── */
      .squad-toggle {
        display: flex; margin: 0 16px 14px;
        border: 1px solid var(--hairline); border-radius: var(--radius-sm); box-shadow: var(--shadow-sm);
      }
      .squad-toggle button {
        all: unset; cursor: pointer; flex: 1; text-align: center;
        padding: 10px; font-family: var(--font-var); font-size: 13px; color: var(--ink);
        min-height: 44px; display: grid; place-items: center;
        touch-action: manipulation; -webkit-tap-highlight-color: transparent;
      }
      .squad-toggle button.active { background: var(--accent); color: var(--on-accent); }
      .squad-toggle button + button { border-left: 1px solid var(--hairline); }

      /* ── Lista ── */
      .squad-list { padding-bottom: 16px; }
      .pos-group { margin: 0 16px 14px; }
      .pos-label {
        font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em;
        text-transform: uppercase; padding: 5px 9px; display: inline-block;
        border-radius: var(--radius-pill);
        color: var(--ink); margin-bottom: 8px;
      }
      .pos-label.POR { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--ink); }
      .pos-label.DEF { background: color-mix(in srgb, var(--accent) 16%, transparent); }
      .pos-label.MED { background: color-mix(in srgb, var(--retro-green) 18%, var(--paper-2)); }
      .pos-label.DEL { background: color-mix(in srgb, var(--retro-red) 18%, var(--paper-2)); }

      .player-row {
        display: flex; align-items: center; gap: 11px;
        padding: 8px 11px; border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm); background: var(--fill);
        margin-bottom: 8px;
      }
      .player-num { font-family: var(--font-var); font-size: 17px; color: var(--ink); width: 26px; text-align: center; flex-shrink: 0; }
      .player-photo {
        width: 42px; height: 42px; border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        background: var(--fill); flex-shrink: 0;
        display: grid; place-items: center; object-fit: cover;
      }
      .player-photo.initials { font-family: var(--font-var); font-size: 13px; color: var(--ink-muted); }
      .player-info { flex: 1; min-width: 0; }
      .player-name { font-family: var(--font-body); font-size: 14px; font-weight: 800; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .player-club { font-family: var(--font-mono); font-size: 9px; color: var(--ink-muted); letter-spacing: 0.04em; margin-top: 2px; }
      .player-age { font-family: var(--font-mono); font-size: 11px; color: var(--ink-muted); flex-shrink: 0; }

      /* ── Cancha ── */
      .pitch {
        margin: 0 16px 16px; border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
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
        width: 38px; height: 38px; background: var(--card-grad); border: 1px solid var(--hairline-strong);
        border-radius: var(--radius-sm);
        display: grid; place-items: center; position: relative;
        font-family: var(--font-var); font-size: 14px; color: var(--ink);
        box-shadow: var(--shadow-sm); overflow: hidden;
      }
      .chip-photo { width: 100%; height: 100%; object-fit: cover; }
      .num-sticker {
        position: absolute; top: -7px; right: -7px;
        background: var(--accent); border: 1px solid var(--accent);
        border-radius: var(--radius-pill);
        font-family: var(--font-var); font-size: 9px; color: var(--on-accent);
        width: 18px; height: 18px; display: grid; place-items: center;
      }
      .chip-name {
        font-family: var(--font-mono); font-size: 8.5px; font-weight: 700;
        color: var(--on-dark); background: var(--card-grad); padding: 1px 5px;
        border-radius: var(--radius-sm);
        letter-spacing: 0.04em; max-width: 64px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;
      }

      /* ── Búsqueda y grupos (modo normal adaptado a móvil) ── */
      .back-btn {
        all: unset;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        margin: 0 16px 14px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        background: var(--fill);
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--ink);
        box-sizing: border-box;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .back-btn:active {
        opacity: 0.7;
      }

      .search-bar {
        margin: 0 16px 16px;
        position: relative;
      }
      .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--accent);
        font-size: 16px;
        pointer-events: none;
        line-height: 1;
        z-index: 1;
      }
      .search-input {
        width: 100%;
        padding: 10px 14px 10px 40px;
        font-family: var(--font-body);
        font-size: 14px;
        color: var(--ink);
        background: var(--fill);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        outline: none;
        box-shadow: none;
        box-sizing: border-box;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .search-input::placeholder {
        color: var(--ink-muted);
      }
      .search-input:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
      }

      .player-results {
        margin-top: 10px;
        display: grid;
        gap: 6px;
      }
      .player-result-btn {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        background: var(--fill);
        font-family: var(--font-mono);
        font-size: 12px;
        letter-spacing: 0.04em;
        color: var(--ink);
        box-sizing: border-box;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .player-result-btn:active {
        opacity: 0.7;
      }
      .player-number {
        font-family: var(--font-var);
        font-size: 14px;
        min-width: 20px;
        text-align: center;
        color: var(--accent);
      }
      .player-pos {
        font-family: var(--font-mono);
        font-size: 9px;
        padding: 1px 5px;
        border: 1px solid var(--accent);
        border-radius: var(--radius-pill);
        background: var(--accent);
        color: var(--on-accent);
        letter-spacing: 0.08em;
      }

      .groups-stack {
        display: grid;
        gap: 16px;
        padding: 0 16px 24px;
      }
      .group-block {
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        background: var(--card-grad);
        overflow: hidden;
      }
      .group-header {
        background: var(--card-grad);
        color: var(--on-dark);
        padding: 8px 12px;
        border-bottom: 1px solid var(--hairline);
      }
      .group-title {
        font-family: var(--font-var);
        font-size: 20px;
        line-height: 1;
        text-transform: uppercase;
        font-weight: 800;
      }
      .teams-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px;
      }
      .team-card {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-sm);
        background: var(--fill);
        box-sizing: border-box;
        min-height: 48px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .team-card:active {
        opacity: 0.7;
        border-color: var(--accent);
      }
      .tc-flag {
        font-size: 24px;
        line-height: 1;
      }
      .tc-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .tc-name {
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: bold;
        color: var(--ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tc-meta {
        font-family: var(--font-mono);
        font-size: 8px;
        color: var(--ink-muted);
      }
    `,
  ];

  render() {
    const tid = this._activeTeam;

    if (!tid) {
      const groups = 'ABCDEFGHIJKL'.split('');
      const q = this.searchQuery.trim();
      const isFiltering = q.length >= 2;
      const playerResults = this._getPlayerResults();

      const groupsWithMatch = isFiltering
        ? groups.filter(group => TEAMS_2026.filter(t => t.group === group).some(t => this._teamMatchesQuery(t.id)))
        : groups;

      const showNoResults = isFiltering && groupsWithMatch.length === 0 && playerResults.length === 0;

      return html`
        <!-- Buscador -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            type="search"
            class="search-input"
            placeholder=${t('squads.list.searchPlaceholder')}
            aria-label=${t('squads.list.searchLabel')}
            .value=${this.searchQuery}
            @input=${(e: InputEvent) => { this.searchQuery = (e.target as HTMLInputElement).value; }}
          >
          ${playerResults.length > 0 ? html`
            <div class="player-results">
              ${playerResults.map(p => {
                const team = TEAMS_2026.find(t => t.id === p.teamId);
                return html`
                  <button class="player-result-btn" @click=${() => { this._activeTeam = p.teamId; this.searchQuery = ''; }}>
                    <span class="player-number">${p.number}</span>
                    <span class="player-pos">${t(`squads.pos.short.${p.position}` as any)}</span>
                    <span>${p.name}</span>
                    <span style="color: var(--dim); font-size: 10px;">· ${p.club}</span>
                    <span class="player-team-flag" style="margin-left: auto;">${team?.flag ?? ''}</span>
                  </button>
                `;
              })}
            </div>
          ` : ''}
        </div>

        ${showNoResults ? html`<div class="no-results" style="margin: 0 16px 14px; padding: 20px; border: 3px dashed var(--ink); background: var(--paper-2); font-family: var(--font-mono); font-size: 12px; color: var(--dim); text-align: center; letter-spacing: 0.08em;">${t('squads.list.noResults')}</div>` : ''}

        <!-- Lista de Grupos -->
        <div class="groups-stack">
          ${groupsWithMatch.map(group => {
            const teamsInGroup = TEAMS_2026.filter(t => t.group === group);
            return html`
              <section class="group-block">
                <div class="group-header">
                  <div class="group-title">${t('squads.list.groupTitle', { letter: group })}</div>
                </div>
                <div class="teams-grid">
                  ${teamsInGroup.map(team => {
                    const dimmed = isFiltering && !this._teamMatchesQuery(team.id);
                    const squadLen = (SQUADS[team.id] ?? []).length;
                    return html`
                      <button
                        class="team-card"
                        style="${dimmed ? 'opacity: 0.25; pointer-events: none;' : ''}"
                        @click=${() => { this._activeTeam = team.id; this.searchQuery = ''; }}>
                        <span class="tc-flag">${team.flag}</span>
                        <div class="tc-info">
                          <span class="tc-name">${team.name}</span>
                          <span class="tc-meta">
                            ${isOfficialSquad(team.id)
                              ? html`✓ ${t('squads.card.playersMany', { n: squadLen }).toUpperCase()}`
                              : html`${t('squads.card.playersMany', { n: squadLen }).toUpperCase()}`}
                          </span>
                        </div>
                      </button>
                    `;
                  })}
                </div>
              </section>
            `;
          })}
        </div>
      `;
    }

    return html`
      <!-- Botón Volver -->
      <button class="back-btn" @click="${() => { this._activeTeam = null; }}">${t('squads.back')}</button>

      <!-- Coach banner -->
      ${this._renderCoachBanner(tid)}

      <!-- Toggle lista/cancha -->
      <div class="squad-toggle">
        <button class="${this._mode === 'list' ? 'active' : ''}" @click="${() => { this._mode = 'list'; }}">▤ ${t('squads.list.viewList').toUpperCase()}</button>
        <button class="${this._mode === 'pitch' ? 'active' : ''}" @click="${() => { this._mode = 'pitch'; }}">▦ ${t('squads.list.viewPitch').toUpperCase()}</button>
      </div>

      <!-- Contenido -->
      ${this._mode === 'list' ? this._renderList(tid) : this._renderPitch(tid)}
    `;
  }
}

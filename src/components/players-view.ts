import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { TEAMS_2026 } from '../data/ucl-2027';
import { SQUADS, type Player } from '../data/squads';
import { getPlayerCondition, STATUS_META } from '../data/player-status';
import { resolvePlayerPhoto } from '../lib/player-photo';
import { crestSrc } from '../lib/team-assets';
import { TEAM_COLORS } from '../data/team-colors';
import { normalize, getInitials } from '../lib/text-utils';
import { t, useLocaleStore } from '../i18n';
import './player-card';
import './player-hover-card';

interface EnrichedPlayer {
  player: Player;
  teamId: string;
  teamName: string;
  teamShortName: string;
  flagUrl?: string;
  flag?: string;
  photoUrl?: string;
}

type PositionFilter = 'ALL' | 'GK' | 'DF' | 'MF' | 'FW';
type StatusFilter = 'ALL' | 'ISSUES' | 'AVAILABLE';
type SortOption = 'name' | 'number' | 'age-asc' | 'age-desc';

const PAGE_SIZE = 48;

@customElement('players-view')
export class PlayersView extends LitElement {
  @property() targetTeamId: string | null = null;

  @state() private searchQuery = '';
  @state() private selectedClub = 'all';
  @state() private selectedPosition: PositionFilter = 'ALL';
  @state() private selectedStatus: StatusFilter = 'ALL';
  @state() private captainOnly = false;
  @state() private sortBy: SortOption = 'name';
  @state() private displayedLimit = PAGE_SIZE;

  @state() private _openPlayer: { player: Player; teamId: string } | null = null;
  @state() private _hover: { player: Player; teamId: string; x: number; y: number } | null = null;

  private _allPlayers: EnrichedPlayer[] = [];
  private _hoverTimer: number | null = null;
  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._loadAllPlayers();
    this.unsubscribeLocale = useLocaleStore.subscribe(() => {
      this.requestUpdate();
    });

    if (this.targetTeamId) {
      this.selectedClub = this.targetTeamId;
    }
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    if (this._hoverTimer) clearTimeout(this._hoverTimer);
    super.disconnectedCallback();
  }

  private _loadAllPlayers() {
    const list: EnrichedPlayer[] = [];
    const teamMap = new Map(TEAMS_2026.map(t => [t.id, t]));

    for (const team of TEAMS_2026) {
      const squad = SQUADS[team.id] ?? [];
      for (const player of squad) {
        list.push({
          player,
          teamId: team.id,
          teamName: team.name,
          teamShortName: team.shortName,
          flagUrl: team.flagUrl,
          flag: (team as unknown as { flag?: string }).flag,
          photoUrl: resolvePlayerPhoto(team.id, player),
        });
      }
    }
    this._allPlayers = list;
  }

  private _resetFilters() {
    this.searchQuery = '';
    this.selectedClub = 'all';
    this.selectedPosition = 'ALL';
    this.selectedStatus = 'ALL';
    this.captainOnly = false;
    this.sortBy = 'name';
    this.displayedLimit = PAGE_SIZE;
  }

  private _getFilteredPlayers(): EnrichedPlayer[] {
    const q = normalize(this.searchQuery.trim());
    const isClubFilter = this.selectedClub !== 'all';
    const isPosFilter = this.selectedPosition !== 'ALL';
    const isStatusFilter = this.selectedStatus !== 'ALL';

    const filtered = this._allPlayers.filter(item => {
      const p = item.player;

      // 1. Filtro de Club UCL
      if (isClubFilter && item.teamId !== this.selectedClub) {
        return false;
      }

      // 2. Filtro de Posición
      if (isPosFilter && p.position !== this.selectedPosition) {
        return false;
      }

      // 3. Filtro de Capitanes
      if (this.captainOnly && !p.captain) {
        return false;
      }

      // 4. Filtro de Bajas / Disponibilidad
      if (isStatusFilter) {
        const cond = getPlayerCondition(item.teamId, p.name);
        const hasIssue = cond && cond.status !== 'available';
        if (this.selectedStatus === 'ISSUES' && !hasIssue) return false;
        if (this.selectedStatus === 'AVAILABLE' && hasIssue) return false;
      }

      // 5. Búsqueda de texto (Nombre, Club de origen, Nombre del equipo UCL)
      if (q.length > 0) {
        const matchName = normalize(p.name).includes(q);
        const matchClub = normalize(p.club).includes(q);
        const matchTeam = normalize(item.teamName).includes(q) || normalize(item.teamShortName).includes(q);
        if (!matchName && !matchClub && !matchTeam) {
          return false;
        }
      }

      return true;
    });

    // Ordenación
    filtered.sort((a, b) => {
      if (this.sortBy === 'number') {
        return (a.player.number || 99) - (b.player.number || 99);
      }
      if (this.sortBy === 'age-asc') {
        return a.player.age - b.player.age;
      }
      if (this.sortBy === 'age-desc') {
        return b.player.age - a.player.age;
      }
      // default: 'name'
      return a.player.name.localeCompare(b.player.name);
    });

    return filtered;
  }

  private _handlePlayerMouseEnter(e: MouseEvent, player: Player, teamId: string) {
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (this._hoverTimer) {
      clearTimeout(this._hoverTimer);
      this._hoverTimer = null;
    }
    const target = e.currentTarget as HTMLElement;
    if (!target) return;
    const rect = target.getBoundingClientRect();

    const hoverCardWidth = 290;
    const hoverCardHeight = 380;

    let x = rect.right + 12;
    if (x + hoverCardWidth > window.innerWidth) {
      x = rect.left - hoverCardWidth - 12;
    }

    let y = rect.top - 10;
    if (y + hoverCardHeight > window.innerHeight - 12) {
      y = window.innerHeight - hoverCardHeight - 12;
    }
    if (y < 12) {
      y = 12;
    }

    this._hover = { player, teamId, x, y };
  }

  private _handlePlayerMouseLeave() {
    if (this._hoverTimer) clearTimeout(this._hoverTimer);
    this._hoverTimer = window.setTimeout(() => {
      this._hover = null;
      this._hoverTimer = null;
    }, 140);
  }

  private _loadMore() {
    this.displayedLimit += PAGE_SIZE;
  }

  static readonly styles = css`
    :host {
      display: block;
      color: var(--ink);
    }

    /* ── Contenedor y estructura Panini ── */
    .catalog-wrapper {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin: 0 auto;
      max-width: 1320px;
    }

    /* ── Barra de controles y filtros ── */
    .controls-panel {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: var(--paper);
      overflow: hidden;
    }

    .controls-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 3px solid var(--ink);
      background: var(--retro-blue);
      color: var(--paper);
      flex-wrap: wrap;
      gap: 10px;
    }

    .controls-title {
      font-family: var(--font-var);
      font-size: 26px;
      line-height: 1;
      letter-spacing: 0.02em;
    }

    .controls-sub {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      opacity: 0.95;
    }

    .controls-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--paper-2);
    }

    /* ── Input de Búsqueda ── */
    .search-row {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      font-size: 16px;
      pointer-events: none;
      color: var(--ink-muted);
      z-index: 1;
    }

    .search-input {
      width: 100%;
      height: 46px;
      padding: 0 42px 0 42px;
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 500;
      color: var(--ink);
      background: var(--paper);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      border-radius: var(--radius-sm);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 4px 4px 0 var(--ink);
    }

    .search-clear {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      color: var(--ink-muted);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      line-height: 1;
    }

    .search-clear:hover {
      color: var(--retro-red);
    }

    /* ── Fila de Selectores y Filtros ── */
    .filters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-label {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--ink-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .styled-select {
      height: 42px;
      padding: 0 12px;
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 600;
      color: var(--ink);
      background: var(--paper);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      border-radius: var(--radius-sm);
      outline: none;
      cursor: pointer;
    }

    .styled-select:focus {
      border-color: var(--accent);
    }

    /* ── Píldoras de Posición y Estado ── */
    .pills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .pill-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 6px 12px;
      border: 2px solid var(--ink);
      border-radius: var(--radius-sm);
      background: var(--paper);
      color: var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      transition: transform 0.1s, background 0.1s, box-shadow 0.1s;
      white-space: nowrap;
      user-select: none;
    }

    .pill-btn:hover {
      background: var(--paper-3);
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 var(--ink);
    }

    .pill-btn.active {
      background: var(--ink);
      color: var(--paper);
      border-color: var(--ink);
    }

    .pill-btn.danger.active {
      background: var(--retro-red);
      color: #ffffff;
      border-color: var(--ink);
    }

    .pill-btn.gold.active {
      background: var(--retro-yellow);
      color: var(--ink);
      border-color: var(--ink);
    }

    /* ── Barra de resumen y estado ── */
    .stats-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-top: 2px dashed var(--hairline-strong);
      background: var(--paper);
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.04em;
      flex-wrap: wrap;
      gap: 10px;
    }

    .stats-count strong {
      color: var(--accent);
      font-size: 14px;
    }

    .clear-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--retro-red);
      text-decoration: underline;
      padding: 4px 6px;
    }

    .clear-btn:hover {
      color: #991b1b;
    }

    /* ── Grid de Cromos de Jugadores ── */
    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }

    @media (max-width: 640px) {
      .players-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }
    }

    /* ── Cromo individual (Sticker Card) ── */
    .player-sticker {
      position: relative;
      display: flex;
      flex-direction: column;
      border: 3px solid var(--ink);
      background: var(--paper);
      box-shadow: var(--shadow-hard-sm);
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease, background-color 0.12s ease;
      touch-action: manipulation;
    }

    .player-sticker:hover {
      transform: translate(-3px, -3px);
      box-shadow: 6px 6px 0 var(--ink);
      background: var(--paper-3);
    }

    .player-sticker:active {
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 var(--ink);
    }

    /* Franja superior de club */
    .sticker-strip {
      height: 6px;
      width: 100%;
      border-bottom: 2px solid var(--ink);
    }

    /* Cabecera del cromo: dorsal, capitán y escudo */
    .sticker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px 4px;
      background: var(--paper-2);
      border-bottom: 2px solid var(--hairline-strong);
    }

    .sticker-num {
      font-family: var(--font-var);
      font-size: 16px;
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
    }

    .sticker-badges {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .cap-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 800;
      padding: 1px 4px;
      background: var(--retro-yellow);
      color: var(--ink);
      border: 1px solid var(--ink);
      border-radius: var(--radius-pill);
      letter-spacing: 0.06em;
      line-height: 1.1;
    }

    .sticker-crest {
      width: 20px;
      height: 20px;
      object-fit: contain;
      flex-shrink: 0;
    }

    /* Caja de foto */
    .sticker-photo-box {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: radial-gradient(circle at center, rgba(12,68,124,0.12) 0%, transparent 70%), var(--paper-2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      border-bottom: 2px solid var(--ink);
    }

    .sticker-photo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    .photo-fallback {
      font-family: var(--font-mono);
      font-size: 34px;
      font-weight: 800;
      color: var(--ink-muted);
      opacity: 0.45;
    }

    /* Alerta médica flotante en foto */
    .sticker-cond-badge {
      position: absolute;
      bottom: 6px;
      right: 6px;
      font-size: 14px;
      padding: 2px 4px;
      background: rgba(0, 0, 0, 0.75);
      border-radius: 4px;
      line-height: 1;
    }

    /* Cuerpo del cromo */
    .sticker-body {
      padding: 8px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: var(--paper);
      flex: 1;
    }

    .sticker-name {
      font-family: var(--font-var);
      font-size: 17px;
      line-height: 1.1;
      font-weight: 700;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sticker-meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 11px;
    }

    .pos-chip {
      font-size: 9px;
      font-weight: 700;
      padding: 1px 5px;
      border: 1px solid var(--ink);
      border-radius: var(--radius-pill);
      background: var(--ink);
      color: var(--paper);
      letter-spacing: 0.05em;
    }

    .age-text {
      color: var(--ink-muted);
      font-size: 11px;
    }

    .sticker-club {
      font-family: var(--font-body);
      font-size: 11px;
      color: var(--ink-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 2px;
    }

    .sticker-team-tag {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Estado vacío ── */
    .empty-results {
      padding: 40px 20px;
      text-align: center;
      background: var(--paper);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-icon {
      font-size: 38px;
    }

    .empty-msg {
      font-family: var(--font-display);
      font-size: 18px;
      color: var(--ink);
    }

    /* ── Botón Cargar Más ── */
    .load-more-row {
      display: flex;
      justify-content: center;
      margin: 10px 0 20px;
    }

    .load-more-btn {
      all: unset;
      cursor: pointer;
      font-family: var(--font-var);
      font-size: 20px;
      letter-spacing: 0.05em;
      padding: 12px 28px;
      background: var(--retro-yellow);
      color: var(--ink);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      font-weight: 800;
      transition: transform 0.1s, box-shadow 0.1s, background-color 0.1s;
    }

    .load-more-btn:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 var(--ink);
      background: var(--paper-2);
    }
  `;

  render() {
    const locale = useLocaleStore.getState().locale;
    const filtered = this._getFilteredPlayers();
    const visiblePlayers = filtered.slice(0, this.displayedLimit);
    const hasMore = filtered.length > this.displayedLimit;
    const remaining = filtered.length - this.displayedLimit;

    const hasActiveFilters =
      this.searchQuery.trim().length > 0 ||
      this.selectedClub !== 'all' ||
      this.selectedPosition !== 'ALL' ||
      this.selectedStatus !== 'ALL' ||
      this.captainOnly ||
      this.sortBy !== 'name';

    return html`
      ${this._openPlayer ? html`
        <player-card
          .player=${this._openPlayer.player}
          .teamId=${this._openPlayer.teamId}
          @close=${() => { this._openPlayer = null; }}
        ></player-card>
      ` : ''}

      ${this._hover ? html`
        <player-hover-card
          .player=${this._hover.player}
          .teamId=${this._hover.teamId}
          .x=${this._hover.x}
          .y=${this._hover.y}
          .locale=${locale}
          @mouseenter=${() => { if (this._hoverTimer) clearTimeout(this._hoverTimer); }}
          @mouseleave=${this._handlePlayerMouseLeave}
        ></player-hover-card>
      ` : ''}

      <div class="catalog-wrapper">
        <!-- Panel de Filtros y Búsqueda -->
        <section class="controls-panel">
          <div class="controls-header">
            <div class="controls-title">${t('section.players.title')}</div>
            <div class="controls-sub">${t('section.players.eyebrow')}</div>
          </div>

          <div class="controls-body">
            <!-- Barra de búsqueda texto -->
            <div class="search-row">
              <span class="search-icon">🔍</span>
              <input
                type="search"
                class="search-input"
                placeholder=${t('players.searchPlaceholder')}
                .value=${this.searchQuery}
                @input=${(e: InputEvent) => {
                  this.searchQuery = (e.target as HTMLInputElement).value;
                  this.displayedLimit = PAGE_SIZE;
                }}
              />
              ${this.searchQuery ? html`
                <button
                  class="search-clear"
                  title="${t('players.clearFilters')}"
                  @click=${() => { this.searchQuery = ''; this.displayedLimit = PAGE_SIZE; }}
                >×</button>
              ` : ''}
            </div>

            <!-- Fila de Selectores (Club UCL y Ordenación) -->
            <div class="filters-grid">
              <div class="filter-group">
                <label class="filter-label" for="club-select">
                  <span>🛡️</span> ${t('players.filterClub')}
                </label>
                <select
                  id="club-select"
                  class="styled-select"
                  .value=${this.selectedClub}
                  @change=${(e: Event) => {
                    this.selectedClub = (e.target as HTMLSelectElement).value;
                    this.displayedLimit = PAGE_SIZE;
                  }}
                >
                  <option value="all">${t('players.allClubs')}</option>
                  ${TEAMS_2026.map(team => html`
                    <option value="${team.id}">${team.name} (${team.shortName})</option>
                  `)}
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label" for="sort-select">
                  <span>↕</span> ${t('players.filterSort')}
                </label>
                <select
                  id="sort-select"
                  class="styled-select"
                  .value=${this.sortBy}
                  @change=${(e: Event) => {
                    this.sortBy = (e.target as HTMLSelectElement).value as SortOption;
                  }}
                >
                  <option value="name">${t('players.sortNameAsc')}</option>
                  <option value="number">${t('players.sortNumber')}</option>
                  <option value="age-asc">${t('players.sortAgeAsc')}</option>
                  <option value="age-desc">${t('players.sortAgeDesc')}</option>
                </select>
              </div>
            </div>

            <!-- Píldoras de Posición -->
            <div class="filter-group">
              <span class="filter-label"><span>⚽</span> ${t('players.filterPos')}</span>
              <div class="pills-row">
                <button
                  class="pill-btn ${this.selectedPosition === 'ALL' ? 'active' : ''}"
                  @click=${() => { this.selectedPosition = 'ALL'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.posAll')}</button>
                <button
                  class="pill-btn ${this.selectedPosition === 'GK' ? 'active' : ''}"
                  @click=${() => { this.selectedPosition = 'GK'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.posGK')}</button>
                <button
                  class="pill-btn ${this.selectedPosition === 'DF' ? 'active' : ''}"
                  @click=${() => { this.selectedPosition = 'DF'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.posDF')}</button>
                <button
                  class="pill-btn ${this.selectedPosition === 'MF' ? 'active' : ''}"
                  @click=${() => { this.selectedPosition = 'MF'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.posMF')}</button>
                <button
                  class="pill-btn ${this.selectedPosition === 'FW' ? 'active' : ''}"
                  @click=${() => { this.selectedPosition = 'FW'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.posFW')}</button>
              </div>
            </div>

            <!-- Píldoras de Estado Médico y Capitanes -->
            <div class="filter-group">
              <span class="filter-label"><span>🏥</span> ${t('players.filterStatus')}</span>
              <div class="pills-row">
                <button
                  class="pill-btn ${this.selectedStatus === 'ALL' ? 'active' : ''}"
                  @click=${() => { this.selectedStatus = 'ALL'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.statusAll')}</button>
                <button
                  class="pill-btn danger ${this.selectedStatus === 'ISSUES' ? 'active' : ''}"
                  @click=${() => { this.selectedStatus = 'ISSUES'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.statusIssues')}</button>
                <button
                  class="pill-btn ${this.selectedStatus === 'AVAILABLE' ? 'active' : ''}"
                  @click=${() => { this.selectedStatus = 'AVAILABLE'; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.statusAvailable')}</button>
                <button
                  class="pill-btn gold ${this.captainOnly ? 'active' : ''}"
                  @click=${() => { this.captainOnly = !this.captainOnly; this.displayedLimit = PAGE_SIZE; }}
                >${t('players.captainsOnly')}</button>
              </div>
            </div>
          </div>

          <!-- Barra de estadísticas -->
          <div class="stats-bar">
            <span class="stats-count">
              ${t('players.resultsCount', { count: String(filtered.length), total: String(this._allPlayers.length) })}
            </span>
            ${hasActiveFilters ? html`
              <button class="clear-btn" @click=${this._resetFilters}>
                ${t('players.clearFilters')}
              </button>
            ` : ''}
          </div>
        </section>

        <!-- Grid de Tarjetas de Jugadores (Cromos) -->
        ${filtered.length === 0 ? html`
          <div class="empty-results">
            <span class="empty-icon">🔎</span>
            <div class="empty-msg">${t('players.noResults')}</div>
            <button class="pill-btn active" @click=${this._resetFilters}>
              ${t('players.clearFilters')}
            </button>
          </div>
        ` : html`
          <div class="players-grid">
            ${visiblePlayers.map(item => {
              const p = item.player;
              const colors = TEAM_COLORS[item.teamId] ?? ['#0C447C', '#EF9F27'];
              const cond = getPlayerCondition(item.teamId, p.name);
              const hasIssue = cond && cond.status !== 'available';
              const condMeta = hasIssue ? STATUS_META[cond.status] : null;

              return html`
                <article
                  class="player-sticker"
                  @click=${() => { this._openPlayer = { player: p, teamId: item.teamId }; }}
                  @mouseenter=${(e: MouseEvent) => this._handlePlayerMouseEnter(e, p, item.teamId)}
                  @mouseleave=${this._handlePlayerMouseLeave}
                  tabindex="0"
                  role="button"
                  aria-label="${p.name} (${item.teamName})"
                >
                  <div
                    class="sticker-strip"
                    style="background: linear-gradient(90deg, ${colors[0]}, ${colors[1]})"
                  ></div>

                  <div class="sticker-header">
                    <span class="sticker-num">#${p.number}</span>
                    <div class="sticker-badges">
                      ${p.captain ? html`<span class="cap-badge">CAP</span>` : ''}
                      <img
                        class="sticker-crest"
                        src="${crestSrc(item.teamId)}"
                        alt="${item.teamName}"
                        title="${item.teamName} (${t('players.viewSquad')})"
                        loading="lazy"
                        decoding="async"
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          window.location.hash = `#squads/${item.teamId}`;
                        }}
                        @error=${(e: Event) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  </div>

                  <div class="sticker-photo-box">
                    ${item.photoUrl ? html`
                      <img
                        src="${item.photoUrl}"
                        alt="${p.name}"
                        loading="lazy"
                        decoding="async"
                        @error=${(e: Event) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent && !parent.querySelector('.photo-fallback')) {
                            const span = document.createElement('span');
                            span.className = 'photo-fallback';
                            span.textContent = getInitials(p.name);
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ` : html`
                      <span class="photo-fallback">${getInitials(p.name)}</span>
                    `}

                    ${hasIssue && condMeta ? html`
                      <div class="sticker-cond-badge" title="${condMeta.label}: ${cond?.diagnosis ?? ''}">
                        ${condMeta.icon}
                      </div>
                    ` : ''}
                  </div>

                  <div class="sticker-body">
                    <div class="sticker-name" title="${p.name}">${p.name}</div>
                    <div class="sticker-meta-row">
                      <span class="pos-chip">${p.position}</span>
                      <span class="age-text">${t('player.ageSuffix', { n: p.age })}</span>
                    </div>
                    <div class="sticker-club" title="${p.club}">${p.club}</div>
                    <div
                      class="sticker-team-tag"
                      title="${item.teamName} (${t('players.viewSquad')})"
                      @click=${(e: Event) => {
                        e.stopPropagation();
                        window.location.hash = `#squads/${item.teamId}`;
                      }}
                    >
                      ${item.teamShortName || item.teamId} →
                    </div>
                  </div>
                </article>
              `;
            })}
          </div>

          ${hasMore ? html`
            <div class="load-more-row">
              <button class="load-more-btn" @click=${this._loadMore}>
                ${t('players.loadMore', { remaining: String(remaining) })}
              </button>
            </div>
          ` : ''}
        `}
      </div>
    `;
  }
}

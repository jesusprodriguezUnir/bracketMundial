import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { useTournamentStore } from '../../store/tournament-store';
import { useLeaguesStore } from '../../store/leagues-store';
import { subscribeSlice } from '../../store/store-utils';
import { TEAMS_2026 } from '../../data/fifa-2026';
import { SQUADS } from '../../data/squads';
import { renderFlag } from '../../lib/render-flag';
import { resolvePlayerPhoto } from '../../lib/player-photo';
import { getLeagueState } from '../../store/league-context-bridge';
import { showToast } from '../../lib/interaction';
import { mobileShared } from './mobile-shared.css';
import { t, useLocaleStore } from '../../i18n';

/**
 * Predictor de premios individuales (Máximo Goleador / MVP) para el shell móvil.
 * - Como vista propia (pestaña "Premios"): cabecera + tarjetas + buscador.
 * - Con el atributo `embedded` (dentro de mobile-bracket): solo el panel compacto.
 */
@customElement('mobile-awards')
export class MobileAwards extends LitElement {
  /** true cuando se incrusta dentro de otra vista (sin cabecera propia). */
  @property({ type: Boolean }) embedded = false;

  @state() private _modal: 'topScorer' | 'mvp' | null = null;
  @state() private _query = '';

  private _unsubAwards?: () => void;
  private _unsubLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this._unsubAwards = subscribeSlice(
      useTournamentStore,
      s => `${s.myTopScorerPrediction?.playerName ?? ''}|${s.myMvpPrediction?.playerName ?? ''}|${s.activeContext.kind}`,
      () => this.requestUpdate(),
    );
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this._unsubAwards?.();
    this._unsubLocale?.();
    super.disconnectedCallback();
  }

  /** true si la liga activa está congelada: predicciones no editables. */
  private get _frozen(): boolean {
    const ctx = useTournamentStore.getState().activeContext;
    if (ctx.kind !== 'league') return false;
    return getLeagueState(ctx.leagueId)?.frozen === true;
  }

  /** Nombre de la liga activa, si el contexto actual es de liga. */
  private get _activeLeagueName(): string | null {
    const ctx = useTournamentStore.getState().activeContext;
    if (ctx.kind !== 'league') return null;
    return useLeaguesStore.getState().leagues.find(l => l.id === ctx.leagueId)?.name ?? null;
  }

  private _open(type: 'topScorer' | 'mvp') {
    this._modal = type;
    this._query = '';
  }

  private _close() {
    this._modal = null;
    this._query = '';
  }

  private _pick(teamId: string, playerName: string) {
    const store = useTournamentStore.getState();
    const val = { teamId, playerName };
    if (this._modal === 'topScorer') store.setMyTopScorerPrediction(val);
    else store.setMyMvpPrediction(val);
    showToast(`🏅 ${playerName}`);
    this._close();
  }

  private _renderPanel() {
    const store = useTournamentStore.getState();
    const topScorer = store.myTopScorerPrediction;
    const mvp = store.myMvpPrediction;
    const frozen = this._frozen;

    const card = (icon: string, label: string, value: { teamId: string; playerName: string } | null, type: 'topScorer' | 'mvp') => html`
      <div class="award-card">
        <span class="award-icon">${icon}</span>
        <div class="award-info">
          <div class="award-cat">${label}</div>
          <div class="award-val">${value ? `${value.playerName} (${value.teamId})` : t('knockout.notSelected')}</div>
        </div>
        ${frozen
          ? html`<span class="award-lock">🔒</span>`
          : html`<button class="award-btn" @click="${() => this._open(type)}">${value ? t('knockout.change') : t('knockout.select')}</button>`}
      </div>
    `;

    return html`
      <div class="awards-panel">
        <div class="awards-title">🏅 ${t('knockout.awardsTitle')}</div>
        ${card('👟', t('knockout.topScorerLabel'), topScorer, 'topScorer')}
        ${card('⭐', t('knockout.mvpLabel'), mvp, 'mvp')}
      </div>
    `;
  }

  private _renderModal() {
    if (!this._modal) return html``;
    const locale = useLocaleStore.getState().locale;
    const typeLabel = this._modal === 'topScorer'
      ? t('knockout.topScorerLabel').toUpperCase()
      : t('knockout.mvpLabel').toUpperCase();

    const query = this._query.trim();
    const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

    let results: Array<{ teamId: string; name: string; number: number; position: string; club: string; photoUrl?: string }> = [];
    if (normalizedQuery.length >= 2) {
      results = Object.entries(SQUADS).flatMap(([teamId, players]) =>
        players
          .filter(p => {
            const teamName = TEAMS_2026.find(tm => tm.id === teamId)?.name ?? teamId;
            const haystack = `${p.name} ${teamName} ${teamId} ${p.club}`
              .toLowerCase()
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '');
            return haystack.includes(normalizedQuery);
          })
          .map(p => ({ teamId, name: p.name, number: p.number, position: p.position, club: p.club, photoUrl: p.photoUrl })),
      );
    }
    const totalMatches = results.length;
    const displayed = results.slice(0, 60);

    let body;
    if (normalizedQuery.length < 2) {
      body = html`<div class="awm-empty">${locale === 'es' ? 'Empieza a escribir el nombre del jugador…' : 'Start typing the player name…'}</div>`;
    } else if (displayed.length === 0) {
      body = html`<div class="awm-empty">${locale === 'es' ? `Sin resultados para «${query}»` : `No results for “${query}”`}</div>`;
    } else {
      body = html`
        <div class="awm-count">${locale === 'es' ? `Mostrando ${displayed.length} de ${totalMatches} jugadores` : `Showing ${displayed.length} of ${totalMatches} players`}</div>
        <div class="awm-list">
          ${displayed.map(p => {
            const team = TEAMS_2026.find(tm => tm.id === p.teamId);
            const photo = resolvePlayerPhoto(p.teamId, p);
            return html`
              <button class="awm-player" @click="${() => this._pick(p.teamId, p.name)}">
                <span class="awm-avatar">
                  ${photo ? html`<img src="${photo}" alt="" loading="lazy">` : p.name.charAt(0).toUpperCase()}
                </span>
                <span class="awm-player-info">
                  <span class="awm-player-name">${p.name}</span>
                  <span class="awm-player-meta">
                    ${team ? renderFlag(team, 'xs') : ''}
                    <span>${p.teamId}</span>
                    <span class="awm-player-pos">#${p.number} · ${p.position}</span>
                  </span>
                  <span class="awm-player-club">${p.club}</span>
                </span>
              </button>
            `;
          })}
        </div>
      `;
    }

    return html`
      <div class="awm-backdrop" @click="${this._close}">
        <div class="awm-sheet" @click="${(e: Event) => e.stopPropagation()}">
          <div class="awm-header">
            <span class="awm-title">🏅 ${t('knockout.awardsSelectionTitle', { award: typeLabel })}</span>
            <button class="awm-close" @click="${this._close}" aria-label="${locale === 'es' ? 'Cerrar' : 'Close'}">✕</button>
          </div>
          <div class="awm-search">
            <input
              type="search"
              .value="${this._query}"
              @input="${(e: InputEvent) => { this._query = (e.target as HTMLInputElement).value; }}"
              placeholder="${locale === 'es' ? 'Buscar jugador, selección o club…' : 'Search player, team or club…'}"
            />
          </div>
          <div class="awm-body">${body}</div>
        </div>
      </div>
    `;
  }

  static readonly styles = [
    mobileShared,
    css`
      :host { display: block; }

      /* ── Cabecera de la vista standalone ── */
      .awards-heading {
        padding: 4px 16px 14px;
      }
      .awards-eyebrow {
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: var(--ink-muted);
        margin-bottom: 6px;
      }
      .awards-h1 {
        font-family: var(--font-var);
        font-size: 30px;
        line-height: 0.95;
        color: var(--ink);
        margin: 0;
        text-transform: uppercase;
        font-weight: 800;
      }
      .awards-league-banner {
        margin: 12px 16px 0;
        background: color-mix(in srgb, var(--accent) 14%, transparent);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 8px 12px;
        font-family: var(--font-mono);
        font-size: 10px;
        letter-spacing: 0.08em;
        color: var(--ink);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .awards-hint {
        margin: 0 16px 14px;
        font-family: var(--font-mono);
        font-size: 10px;
        line-height: 1.6;
        color: var(--ink-muted);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        background: var(--fill);
        padding: 10px 12px;
      }
      .awards-hint b { color: var(--ink); }

      /* ── Panel de premios ── */
      .awards-panel {
        margin: 0 16px 14px;
        background: var(--card-grad);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        padding: 8px 12px 10px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .awards-title {
        font-family: var(--font-var);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--ink);
        border-bottom: 1px solid var(--hairline);
        padding-bottom: 4px;
      }
      .award-card {
        background: var(--fill);
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        padding: 6px 10px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .award-icon { font-size: 18px; flex-shrink: 0; }
      .award-info { flex: 1; min-width: 0; }
      .award-cat {
        color: var(--ink-muted);
        font-size: 8px;
        text-transform: uppercase;
        font-family: var(--font-mono);
        letter-spacing: 0.08em;
        line-height: 1;
        margin-bottom: 3px;
      }
      .award-val {
        font-family: var(--font-var);
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
        line-height: 1.1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .award-lock { font-size: 14px; flex-shrink: 0; }
      .award-btn {
        all: unset;
        cursor: pointer;
        flex-shrink: 0;
        padding: 7px 10px;
        background: var(--accent);
        color: var(--on-accent);
        border: 1px solid var(--accent);
        border-radius: var(--radius-sm);
        font-family: var(--font-mono);
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        box-shadow: var(--glow-accent-sm);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .award-btn:active { opacity: 0.7; }

      /* ── Modal de selección ── */
      .awm-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(7,10,24,0.7);
        z-index: 99999;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .awm-sheet {
        background: var(--card-grad);
        border: 1px solid var(--hairline);
        border-bottom: none;
        border-radius: var(--radius-md) var(--radius-md) 0 0;
        box-shadow: var(--shadow-lg);
        width: 100%;
        max-height: 88dvh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .awm-header {
        background: var(--card-grad);
        border-bottom: 1px solid var(--hairline);
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .awm-title {
        font-family: var(--font-var);
        font-size: 14px;
        font-weight: 800;
        color: var(--on-dark);
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }
      .awm-close {
        all: unset;
        cursor: pointer;
        width: 32px; height: 32px; flex-shrink: 0;
        display: grid; place-items: center;
        border: 1px solid var(--hairline-strong);
        border-radius: var(--radius-sm);
        background: var(--fill);
        color: var(--on-dark);
        font-family: var(--font-mono);
        font-size: 14px;
        font-weight: 700;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .awm-close:active { opacity: 0.7; border-color: var(--accent); }
      .awm-search {
        padding: 10px 14px;
        border-bottom: 1px solid var(--hairline);
        background: var(--fill);
      }
      .awm-search input {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 12px;
        font-family: var(--font-body);
        font-size: 16px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        background: var(--fill);
        color: var(--ink);
        outline: none;
      }
      .awm-body {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 12px 14px 20px;
      }
      .awm-empty {
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--ink-muted);
        text-align: center;
        padding: 28px 14px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-md);
        background: var(--fill);
      }
      .awm-count {
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--ink-muted);
        margin-bottom: 8px;
        letter-spacing: 0.08em;
      }
      .awm-list { display: grid; gap: 7px; }
      .awm-player {
        all: unset;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border: 1px solid var(--hairline);
        border-radius: var(--radius-sm);
        background: var(--fill);
        box-shadow: var(--shadow-sm);
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
      .awm-player:active { opacity: 0.7; border-color: var(--accent); }
      .awm-avatar {
        width: 34px; height: 34px; flex-shrink: 0;
        border-radius: 50%;
        border: 1px solid var(--hairline);
        background: var(--fill);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-var);
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
        overflow: hidden;
      }
      .awm-avatar img { width: 100%; height: 100%; object-fit: cover; }
      .awm-player-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
      .awm-player-name {
        font-family: var(--font-var);
        font-size: 13px;
        font-weight: 700;
        color: var(--ink);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .awm-player-meta {
        display: flex;
        align-items: center;
        gap: 5px;
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--ink-muted);
      }
      .awm-player-pos { margin-left: auto; }
      .awm-player-club {
        font-family: var(--font-mono);
        font-size: 9px;
        color: var(--ink-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ];

  render() {
    if (this.embedded) {
      return html`${this._renderPanel()}${this._renderModal()}`;
    }

    const locale = useLocaleStore.getState().locale;
    const leagueName = this._activeLeagueName;
    const frozen = this._frozen;

    return html`
      <div class="awards-heading">
        <div class="awards-eyebrow">★ ${locale === 'es' ? 'PREDICCIONES · MUNDIAL 2026' : 'PREDICTIONS · WORLD CUP 2026'} ★</div>
        <h1 class="awards-h1">${locale === 'es' ? 'PREMIOS INDIVIDUALES' : 'INDIVIDUAL AWARDS'}</h1>
      </div>

      ${leagueName ? html`
        <div class="awards-league-banner">
          ${frozen ? '🔒' : '📊'}
          <span>${locale === 'es'
            ? (frozen ? `Liga «${leagueName}» congelada: predicciones bloqueadas` : `Editando tu predicción de la liga «${leagueName}»`)
            : (frozen ? `League “${leagueName}” frozen: predictions locked` : `Editing your prediction for league “${leagueName}”`)}</span>
        </div>
      ` : ''}

      <div class="awards-hint" style="margin-top: 12px;">
        ${locale === 'es'
          ? html`Elige quién será el <b>Máximo Goleador</b> 👟 y el <b>MVP</b> ⭐ del torneo. En las ligas, cada acierto suma <b>+15 puntos</b> al final del Mundial.`
          : html`Pick the tournament's <b>Top Scorer</b> 👟 and <b>MVP</b> ⭐. In leagues, each correct pick earns <b>+15 points</b> at the end of the World Cup.`}
      </div>

      ${this._renderPanel()}
      ${this._renderModal()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mobile-awards': MobileAwards;
  }
}

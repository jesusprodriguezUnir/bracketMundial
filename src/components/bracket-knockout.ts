import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { subscribeSlice } from '../store/store-utils';
import { TEAMS_2026, KNOCKOUT_BRACKET } from '../data/fifa-2026';
import type { MatchModal } from './match-modal';
import './match-modal';
import { STADIUMS } from '../data/stadiums';
import { t, useLocaleStore } from '../i18n';
import { isMatchPending } from '../lib/date-utils';

// Colores por ronda — retro Panini
const ROUND_COLORS: Record<string, string> = {
  'col-r32':   'var(--retro-blue)',
  'col-r16':   'var(--retro-orange)',
  'col-qf':    'var(--retro-green)',
  'col-sf':    'var(--retro-red)',
  'col-final': 'var(--ink)',
};

// Aristas del árbol de cruces derivadas de KNOCKOUT_BRACKET (no asume orden por índice)
const BRACKET_EDGES: Array<{ src: string; dst: string }> = [
  ...KNOCKOUT_BRACKET.roundOf16.flatMap(m => [
    { src: m.prevMatchA, dst: m.id },
    { src: m.prevMatchB, dst: m.id },
  ]),
  ...KNOCKOUT_BRACKET.quarterfinals.flatMap(m => [
    { src: m.prevMatchA, dst: m.id },
    { src: m.prevMatchB, dst: m.id },
  ]),
  ...KNOCKOUT_BRACKET.semifinals.flatMap(m => [
    { src: m.prevMatchA, dst: m.id },
    { src: m.prevMatchB, dst: m.id },
  ]),
  { src: KNOCKOUT_BRACKET.final.prevMatchA, dst: KNOCKOUT_BRACKET.final.id },
  { src: KNOCKOUT_BRACKET.final.prevMatchB, dst: KNOCKOUT_BRACKET.final.id },
];

@customElement('bracket-knockout')
export class BracketKnockout extends LitElement {
  private unsubscribeStore?: () => void;
  private unsubscribeLocale?: () => void;
  private _ro?: ResizeObserver;
  private readonly _onResize = () => requestAnimationFrame(() => this._drawConnectors());

  @state() private _pulseId: string | null = null;
  @state() private _showSwipeHint = true;

  public static readonly styles = css`
    :host { display: block; width: 100%; overflow: hidden; }

    .bracket-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding: 12px 16px;
      border: 3px solid var(--ink);
      background: var(--paper-3);
      box-shadow: var(--shadow-hard-sm);
    }
    .bracket-actions-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .bracket-actions-btns {
      display: flex;
      gap: 10px;
    }

    .bracket-scroll {
      overflow-x: auto;
      padding: 32px 0 40px;
      cursor: grab;
      user-select: none;
      background: var(--paper);
      background-image: var(--paper-texture);
      scroll-snap-type: x proximity;
    }
    .bracket-scroll.is-dragging { cursor: grabbing; }

    .bracket-container {
      display: flex;
      gap: 56px;
      padding: 0 32px;
      min-width: fit-content;
      align-items: center;
      position: relative;
    }

    .round-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: space-around;
      min-width: 220px;
      scroll-snap-align: start;
    }

    /* Header coloreado de columna con halftone */
    .round-title {
      padding: 6px 10px;
      text-align: center;
      font-family: var(--font-var);
      font-size: 14px;
      letter-spacing: 0.1em;
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      color: var(--paper);
      background-image: var(--halftone);
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .round-title.is-final {
      color: var(--retro-yellow);
    }

    /* Match box retro con acento de ronda en borde izquierdo */
    .match-box {
      background: var(--paper-2);
      border: 2px solid var(--ink);
      border-left-width: 6px;
      box-shadow: var(--shadow-hard-sm);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    @media (hover: hover) {
      .match-box:hover {
        transform: translate(-1px, -1px);
        box-shadow: 3px 3px 0 0 var(--ink);
      }
    }
    .match-box:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .match-box.pulse {
      box-shadow: 0 0 0 4px var(--retro-yellow), var(--shadow-hard-sm);
    }

    /* Row de equipo dentro del match box */
    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 8px;
      min-height: 42px;
    }
    .team-row.winner-row {
      color: var(--paper);
    }
    .team-row.loser-row {
      opacity: 0.5;
    }

    .team-separator {
      height: 2px;
      background: var(--ink);
      margin: 0 8px;
    }

    .team-info {
      display: flex;
      align-items: center;
      gap: 7px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 700;
      overflow: hidden;
    }
    .team-flag { font-size: 14px; flex-shrink: 0; }
    .flag-img {
      width: 20px;
      height: 13px;
      object-fit: cover;
      border: 1px solid var(--ink);
      flex-shrink: 0;
    }
    .team-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .score {
      font-family: var(--font-var);
      font-size: 16px;
      flex-shrink: 0;
    }
    .score.pending {
      color: var(--dim);
      opacity: 0.4;
      font-size: 13px;
    }

    .match-note {
      padding: 4px 8px;
      border-top: 1px solid var(--ink);
      background: rgba(0, 0, 0, 0.05);
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--dim);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* Champion box amarilla */
    .champion-box {
      background: var(--retro-yellow);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      padding: 20px 16px;
      text-align: center;
      min-width: 220px;
    }
    .champion-title {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--ink);
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .flag-img-champion {
      width: 28px;
      height: 18px;
      object-fit: cover;
      border: 2px solid var(--ink);
      margin-right: 6px;
      vertical-align: middle;
    }
    .champion-team {
      font-family: var(--font-var);
      font-size: 22px;
      color: var(--ink);
      line-height: 1.1;
    }
    .champion-team.tbd {
      opacity: 0.35;
      font-size: 18px;
    }

    /* Tercer puesto */
    .third-place-title {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-align: center;
      margin-top: 18px;
      margin-bottom: 6px;
      text-transform: uppercase;
    }

    /* SVG connectors */
    svg.connectors {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      overflow: visible;
    }

    /* Swipe hint para móvil */
    .swipe-hint {
      display: none;
    }

    @keyframes swipeHintPulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }

    @media (max-width: 768px) {
      .bracket-scroll { padding: 20px 0; }
      .round-col { min-width: 175px; }

      .swipe-hint {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        padding: 6px 12px;
        font-family: var(--font-mono);
        font-size: 9px;
        letter-spacing: 0.15em;
        color: var(--dim);
        text-transform: uppercase;
        animation: swipeHintPulse 2s ease-in-out infinite;
      }
      .swipe-hint.hidden {
        display: none;
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      .match-box {
        animation: fadeSlideIn 0.3s ease both;
        animation-delay: calc(var(--i, 0) * 30ms);
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    }

    .ko-stepper {
      display: inline-flex;
      align-items: center;
      border: 2px solid var(--ink);
      background: var(--paper-2);
      box-shadow: 2px 2px 0 0 var(--retro-orange);
      flex-shrink: 0;
    }
    .ko-stepper button {
      all: unset;
      cursor: pointer;
      padding: 1px 5px;
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--paper);
      background: var(--ink);
      line-height: 1.4;
    }
    .ko-stepper button:hover { background: var(--retro-red); }
    .ko-val {
      font-family: var(--font-var);
      font-size: 16px;
      padding: 1px 6px;
      min-width: 18px;
      text-align: center;
      color: var(--ink);
    }
    .ko-pen-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 4px 6px;
      border-top: 1px dashed var(--ink);
      background: var(--paper);
    }
    .ko-pen-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 0.1em;
      color: var(--dim);
    }
    .ko-pen-sep {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--dim);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeStore = subscribeSlice(
      useTournamentStore,
      s => s.knockoutMatches,
      () => this.requestUpdate(),
    );
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeStore?.();
    this.unsubscribeLocale?.();
    this._ro?.disconnect();
    window.removeEventListener('resize', this._onResize);
    super.disconnectedCallback();
  }

  override firstUpdated() {
    this._initDragScroll();
    const scrollEl = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
    if (scrollEl) {
      this._ro = new ResizeObserver(() => requestAnimationFrame(() => this._drawConnectors()));
      this._ro.observe(scrollEl);
      scrollEl.addEventListener('scroll', () => { this._showSwipeHint = false; }, { once: true });
    }
    window.addEventListener('resize', this._onResize);
  }

  override updated() {
    requestAnimationFrame(() => this._drawConnectors());
  }

  private _drawConnectors() {
    const svg = this.shadowRoot?.querySelector<SVGElement>('svg.connectors');
    const container = this.shadowRoot?.querySelector<HTMLElement>('.bracket-container');
    if (!svg || !container) return;

    const cr = container.getBoundingClientRect();
    if (cr.width === 0) return;

    const getBox = (mid: string) => {
      const el = container.querySelector<HTMLElement>(`[data-mid="${mid}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        right: r.right - cr.left,
        left:  r.left  - cr.left,
        cy:    r.top   - cr.top + r.height / 2,
      };
    };

    const km = useTournamentStore.getState().knockoutMatches;
    const champion = km['FIN-01']?.winnerId ?? null;

    let regular = '';
    let champ = '';

    for (const { src, dst } of BRACKET_EDGES) {
      const s = getBox(src);
      const d = getBox(dst);
      if (!s || !d) continue;

      const midX = (s.right + d.left) / 2;
      const isPlayed = !!(km[src]?.isPlayed);
      const isChampPath = champion !== null && km[src]?.winnerId === champion;
      const opacity = isPlayed ? '1' : '0.3';
      const dash = isPlayed ? '' : ' stroke-dasharray="6 4"';
      const pathD = `M ${s.right},${s.cy} H ${midX} V ${d.cy} H ${d.left}`;

      if (isChampPath) {
        champ += `<path d="${pathD}" stroke="var(--retro-yellow)" stroke-width="5" fill="none" stroke-linejoin="miter" opacity="1"/>`;
      } else {
        regular += `<path d="${pathD}" stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linejoin="miter" opacity="${opacity}"${dash}/>`;
      }
    }

    svg.innerHTML = regular + champ;
  }

  private _initDragScroll() {
    const el = this.shadowRoot?.querySelector<HTMLElement>('.bracket-scroll');
    if (!el) return;
    let startX = 0;
    let scrollLeft0 = 0;
    let dragging = false;

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('.match-box')) return;
      dragging = true;
      startX = e.pageX - el.getBoundingClientRect().left;
      scrollLeft0 = el.scrollLeft;
      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging || e.pointerType !== 'mouse') return;
      const x = e.pageX - el.getBoundingClientRect().left;
      el.scrollLeft = scrollLeft0 - (x - startX);
    });
    const stopDrag = () => { dragging = false; el.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', stopDrag);
    el.addEventListener('pointerleave', stopDrag);
    el.addEventListener('pointercancel', stopDrag);
  }

  private getTeam(id: string | null) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private renderFlag(team?: any, isChampion = false) {
    if (!team) return '';
    if (team.flagUrl) {
      return html`<img src="${team.flagUrl}" alt="${team.name}" class="${isChampion ? 'flag-img-champion' : 'flag-img'}">`;
    }
    return html`<span class="team-flag">${team.flag}</span>`;
  }

  private openMatch(matchId: string) {
    const match = useTournamentStore.getState().knockoutMatches[matchId];
    if (!match?.teamA || !match?.teamB) return;
    if (!isMatchPending(match.date ?? '', match.timeSpain ?? '')) return;

    const modal = document.createElement('match-modal') as MatchModal;
    modal.matchId = match.matchId;
    modal.teamA = match.teamA;
    modal.teamB = match.teamB;
    modal.initialScoreA = match.scoreA;
    modal.initialScoreB = match.scoreB;
    modal.initialPenaltyScoreA = match.penaltyScoreA ?? null;
    modal.initialPenaltyScoreB = match.penaltyScoreB ?? null;
    modal.phase = 'knockout';
    (modal as any).venue = (match as any).venue || '';
    (modal as any).city = (match as any).city || '';
    (modal as any).timeSpain = (match as any).timeSpain || '';
    const s = STADIUMS.find(st => st.name === (match as any).venue);
    if (s) (modal as any).stadiumImage = s.image;

    const handler = (ev: Event) => {
      const { scoreA, scoreB, penaltyScoreA, penaltyScoreB } = (ev as CustomEvent).detail;
      useTournamentStore.getState().setKnockoutMatchResult(matchId, scoreA, scoreB, penaltyScoreA, penaltyScoreB);
      this._pulseId = matchId;
      setTimeout(() => { this._pulseId = null; }, 700);
      modal.remove();
    };
    modal.addEventListener('save', handler);
    modal.addEventListener('close', () => modal.remove());
    document.body.appendChild(modal);
  }

  private adjustInlineKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    if (!m || !isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.scoreA ?? 0;
    const curB = m.scoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setKnockoutMatchResult(
      matchId, nextA, nextB,
      m.penaltyScoreA ?? null, m.penaltyScoreB ?? null,
    );
  }

  private adjustPenaltyKnockout(e: Event, matchId: string, team: 'A' | 'B', delta: number) {
    e.stopPropagation();
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    if (!m || !isMatchPending(m.date ?? '', m.timeSpain ?? '')) return;
    const curA = m.penaltyScoreA ?? 0;
    const curB = m.penaltyScoreB ?? 0;
    const nextA = team === 'A' ? Math.max(0, curA + delta) : curA;
    const nextB = team === 'B' ? Math.max(0, curB + delta) : curB;
    useTournamentStore.getState().setKnockoutMatchResult(
      matchId, m.scoreA, m.scoreB, nextA, nextB,
    );
  }

  private renderMatch(matchId: string, accentColor: string, idx = 0) {
    const m = useTournamentStore.getState().knockoutMatches[matchId];
    const tA = this.getTeam(m?.teamA ?? null);
    const tB = this.getTeam(m?.teamB ?? null);
    const isPlayed = m?.isPlayed ?? false;
    const winnerId = m?.winnerId ?? null;
    const penaltyScoreA = m?.penaltyScoreA ?? null;
    const penaltyScoreB = m?.penaltyScoreB ?? null;
    const decidedOnPenalties = penaltyScoreA !== null && penaltyScoreB !== null;
    const isPending = isPlayed === false;
    const label = `${tA?.shortName ?? 'TBD'} vs ${tB?.shortName ?? 'TBD'}`;
    const canEdit = !!(m?.teamA && m?.teamB && isMatchPending(m?.date ?? '', m?.timeSpain ?? ''));
    const scoreAVal = m?.scoreA ?? 0;
    const scoreBVal = m?.scoreB ?? 0;
    const isDraw = canEdit && m?.scoreA !== null && m?.scoreB !== null && m?.scoreA === m?.scoreB;
    const penAVal = m?.penaltyScoreA ?? 0;
    const penBVal = m?.penaltyScoreB ?? 0;

    const renderRow = (teamId: string | null, score: number | null, teamAB: 'A' | 'B') => {
      const team = this.getTeam(teamId);
      const isWinner = winnerId !== null && winnerId === teamId;
      const isLoser  = winnerId !== null && winnerId !== teamId;
      const stepVal  = teamAB === 'A' ? scoreAVal : scoreBVal;
      return html`
        <div
          class="team-row ${isWinner ? 'winner-row' : ''} ${isLoser ? 'loser-row' : ''}"
          style="${isWinner ? `background: ${accentColor};` : ''}">
          <div class="team-info">
            ${this.renderFlag(team)}
            <span class="team-name">${team?.shortName ?? 'TBD'}</span>
          </div>
          ${canEdit
            ? html`<div class="ko-stepper">
                <button @click="${(e: Event) => this.adjustInlineKnockout(e, matchId, teamAB, -1)}" aria-label="${t('groups.decScore')}">−</button>
                <span class="ko-val">${stepVal}</span>
                <button @click="${(e: Event) => this.adjustInlineKnockout(e, matchId, teamAB, 1)}" aria-label="${t('groups.incScore')}">+</button>
              </div>`
            : html`<div class="score ${isPending ? 'pending' : ''}">${isPlayed ? score : '—'}</div>`
          }
        </div>
      `;
    };

    return html`
      <div
        data-mid="${matchId}"
        class="match-box ${this._pulseId === matchId ? 'pulse' : ''}"
        style="--i:${idx}; border-left-color: ${accentColor};"
        role="button"
        tabindex="0"
        aria-label="Partido ${label}${isPlayed ? `, resultado ${m.scoreA}-${m.scoreB}${decidedOnPenalties ? `, penaltis ${penaltyScoreA}-${penaltyScoreB}` : ''}` : ', click para editar'}"
        @click="${() => this.openMatch(matchId)}"
        @keydown="${(e: KeyboardEvent) => e.key === 'Enter' && this.openMatch(matchId)}">
        ${renderRow(m?.teamA ?? null, m?.scoreA ?? null, 'A')}
        <div class="team-separator"></div>
        ${renderRow(m?.teamB ?? null, m?.scoreB ?? null, 'B')}
        ${isDraw ? html`
          <div class="ko-pen-row">
            <span class="ko-pen-label">PEN</span>
            <div class="ko-stepper">
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'A', -1)}" aria-label="${t('groups.decScore')}">−</button>
              <span class="ko-val">${penAVal}</span>
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'A', 1)}" aria-label="${t('groups.incScore')}">+</button>
            </div>
            <span class="ko-pen-sep">·</span>
            <div class="ko-stepper">
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'B', -1)}" aria-label="${t('groups.decScore')}">−</button>
              <span class="ko-val">${penBVal}</span>
              <button @click="${(e: Event) => this.adjustPenaltyKnockout(e, matchId, 'B', 1)}" aria-label="${t('groups.incScore')}">+</button>
            </div>
          </div>
        ` : (decidedOnPenalties ? html`<div class="match-note">Penaltis · ${penaltyScoreA}-${penaltyScoreB}</div>` : '')}

        ${(m as any).venue ? html`
          <div style="padding: 2px 8px; border-top: 1px solid var(--ink); display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.03);">
            ${(() => {
              const st = STADIUMS.find(s => s.name === (m as any).venue);
              return st ? html`<img src="${st.image}" style="width: 16px; height: 10px; object-fit: cover; border: 1px solid var(--ink);" alt="">` : '';
            })()}
            <span style="font-family: var(--font-mono); font-size: 8px; color: var(--dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${(m as any).venue} · ${(m as any).city}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  private handleSimulate() {
    useTournamentStore.getState().autoSimulateKnockout();
  }

  private handleGenerate() {
    useTournamentStore.getState().initializeKnockoutFromGroups();
  }

  render() {
    const km = useTournamentStore.getState().knockoutMatches;
    const hasKnockout = Object.keys(km).length > 0;
    const showGenerateButton = hasKnockout === false;
    const championId = km['FIN-01']?.winnerId;
    const champion = this.getTeam(championId ?? null);

    const r32Ids = ['R32-01','R32-02','R32-03','R32-04','R32-05','R32-06','R32-07','R32-08',
                    'R32-09','R32-10','R32-11','R32-12','R32-13','R32-14','R32-15','R32-16'];
    const r16Ids = ['R16-01','R16-02','R16-03','R16-04','R16-05','R16-06','R16-07','R16-08'];
    const qfIds  = ['QF-01','QF-02','QF-03','QF-04'];
    const sfIds  = ['SF-01','SF-02'];

    return html`
      <div class="bracket-actions">
        <div class="bracket-actions-label">★ BRACKET · ELIMINATORIAS</div>
        <div class="bracket-actions-btns">
          ${showGenerateButton
            ? html`<button class="btn btn-primary" @click="${this.handleGenerate}">${t('knockout.generate')}</button>`
            : html`<button class="btn" @click="${this.handleSimulate}">${t('knockout.simulate')}</button>`
          }
        </div>
      </div>

      <!-- Trophy banner -->
      <div style="
        margin-bottom: 2px;
        padding: 8px 16px;
        background: var(--ink); color: var(--retro-yellow);
        font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em;
        display: flex; justify-content: space-between; align-items: center;
        border: 3px solid var(--ink);
      ">
        <span style="color: var(--paper)">◀ 1/16 · OCTAVOS · CUARTOS · SEMIFINALES</span>
        <span>★ DOM 19 JUL · METLIFE STADIUM ★</span>
        <span style="color: var(--retro-orange)">TOCA PARA PREDECIR</span>
      </div>

      <div class="bracket-scroll">
        <div class="bracket-container">
          <svg class="connectors" aria-hidden="true"></svg>

          <!-- Dieciséis avos -->
          <div class="round-col" id="col-r32">
            <div class="round-title" style="background-color: ${ROUND_COLORS['col-r32']}">
              <span>1/16 · DIECISÉIS AVOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[16]</span>
            </div>
            ${r32Ids.map((id, i) => this.renderMatch(id, ROUND_COLORS['col-r32'], i))}
          </div>

          <!-- Octavos -->
          <div class="round-col" id="col-r16">
            <div class="round-title" style="background-color: ${ROUND_COLORS['col-r16']}">
              <span>OCTAVOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[8]</span>
            </div>
            ${r16Ids.map((id, i) => this.renderMatch(id, ROUND_COLORS['col-r16'], i))}
          </div>

          <!-- Cuartos -->
          <div class="round-col" id="col-qf">
            <div class="round-title" style="background-color: ${ROUND_COLORS['col-qf']}">
              <span>CUARTOS</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[4]</span>
            </div>
            ${qfIds.map((id, i) => this.renderMatch(id, ROUND_COLORS['col-qf'], i))}
          </div>

          <!-- Semifinales -->
          <div class="round-col" id="col-sf">
            <div class="round-title" style="background-color: ${ROUND_COLORS['col-sf']}">
              <span>SEMIFINALES</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[2]</span>
            </div>
            ${sfIds.map((id, i) => this.renderMatch(id, ROUND_COLORS['col-sf'], i))}
          </div>

          <!-- Final + Campeón + 3er puesto -->
          <div class="round-col" id="col-final">
            <div class="round-title is-final" style="background-color: ${ROUND_COLORS['col-final']}">
              <span>FINAL</span>
              <span style="font-family: var(--font-mono); font-size: 10px; opacity: 0.8">[1]</span>
            </div>
            ${this.renderMatch('FIN-01', ROUND_COLORS['col-final'], 0)}

            <div class="champion-box">
              <div class="champion-title">🏆 CAMPEÓN</div>
              ${champion
                ? html`<div class="champion-team">${this.renderFlag(champion, true)} ${champion.name.toUpperCase()}</div>`
                : html`<div class="champion-team tbd">POR DEFINIR</div>`
              }
            </div>

            <div class="third-place-title">TERCER PUESTO</div>
            ${this.renderMatch('TP-01', ROUND_COLORS['col-sf'], 1)}
          </div>
        </div>
      </div>

      <div class="swipe-hint ${this._showSwipeHint ? '' : 'hidden'}">
        ◀ ${t('knockout.swipeHint')} ▶
      </div>
    `;
  }
}

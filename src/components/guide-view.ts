import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { generateGuideData, type GuideData, type GuideTeamData, type GuideMatch } from '../lib/guide-service';
import { t, useLocaleStore } from '../i18n';
import { subscribeSlice } from '../store/store-utils';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d}/${m}/${y}`;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

function posLabel(pos: string, locale: string): string {
  const map: Record<string, Record<string, string>> = {
    GK: { es: 'POR', en: 'GK' },
    DF: { es: 'DEF', en: 'DF' },
    MF: { es: 'MED', en: 'MF' },
    FW: { es: 'DEL', en: 'FW' },
  };
  return map[pos]?.[locale] ?? pos;
}

@customElement('guide-view')
export class GuideView extends LitElement {
  @state() private _mode: 'auto' | 'user' = 'auto';
  @state() private _data: GuideData | null = null;
  private _unsubscribeLocale?: () => void;

  static readonly styles = css`
    :host { display: block; }

    /* ── Controles (solo pantalla) ── */
    .guide-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 var(--ink);
      margin-bottom: 24px;
    }
    .mode-group {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .mode-label {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .mode-btn {
      all: unset;
      cursor: pointer;
      padding: 8px 14px;
      font-family: var(--font-var);
      font-size: 13px;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper);
      color: var(--ink);
      transition: background 0.1s;
    }
    .mode-btn.active {
      background: var(--retro-yellow);
    }
    .mode-btn:hover {
      background: var(--retro-yellow);
    }
    .mode-desc {
      font-family: var(--font-body);
      font-size: 12px;
      color: var(--dim);
      width: 100%;
    }
    .print-btn {
      all: unset;
      cursor: pointer;
      padding: 10px 18px;
      font-family: var(--font-var);
      font-size: 14px;
      background: var(--retro-green);
      color: #fff;
      border: 2px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .print-btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 var(--ink);
    }
    .print-btn:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 var(--ink);
    }

    /* ── Documento de guía ── */
    .guide-document {
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-body);
    }

    /* ── Portada ── */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      text-align: center;
      padding: 40px;
      border: 4px solid var(--ink);
      box-shadow: inset 0 0 60px rgba(26,25,51,0.06);
    }
    .cover-eyebrow {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.3em;
      color: var(--retro-orange);
      margin-bottom: 16px;
    }
    .cover-title {
      font-family: var(--font-var);
      font-size: clamp(36px, 6vw, 64px);
      line-height: 1;
      color: var(--ink);
      margin-bottom: 12px;
    }
    .cover-subtitle {
      font-family: var(--font-var);
      font-size: clamp(16px, 2.5vw, 24px);
      color: var(--dim);
      margin-bottom: 32px;
    }
    .cover-badge {
      display: inline-block;
      padding: 10px 24px;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.15em;
      background: var(--retro-yellow);
      color: var(--ink);
      margin-bottom: 40px;
    }
    .cover-flags {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      max-width: 600px;
      margin-top: 24px;
    }
    .cover-flag {
      width: 36px;
      height: 24px;
      object-fit: cover;
      border: 1px solid var(--ink);
      box-shadow: 1px 1px 0 var(--ink);
    }

    /* ── Secciones ── */
    .section-page {
      page-break-before: always;
      padding: 24px 0;
    }
    .section-header {
      border-bottom: 3px dashed var(--ink);
      margin-bottom: 24px;
      padding-bottom: 12px;
    }
    .section-eyebrow {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.25em;
      color: var(--retro-orange);
      text-transform: uppercase;
    }
    .section-title {
      font-family: var(--font-var);
      font-size: 28px;
      line-height: 1.1;
      color: var(--ink);
      margin-top: 4px;
    }

    /* ── Calendario ── */
    .calendar-date {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .calendar-date-header {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      background: var(--ink);
      color: var(--paper);
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .calendar-match {
      display: grid;
      grid-template-columns: 50px 1fr 80px 1fr 60px;
      gap: 8px;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(26,25,51,0.15);
      font-size: 13px;
    }
    .calendar-time {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
    }
    .calendar-team {
      font-family: var(--font-var);
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .calendar-flag {
      width: 20px;
      height: 14px;
      object-fit: cover;
      border: 1px solid var(--ink);
    }
    .calendar-score {
      font-family: var(--font-mono);
      font-size: 12px;
      text-align: center;
      background: var(--paper-2);
      padding: 2px 6px;
      border: 1px solid var(--ink);
    }
    .calendar-venue {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      text-align: right;
    }
    .calendar-group-label {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--retro-yellow);
      color: var(--ink);
      padding: 1px 5px;
      margin-left: 6px;
    }
    .calendar-round-label {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 9px;
      background: var(--retro-orange);
      color: var(--paper);
      padding: 1px 5px;
      margin-left: 6px;
    }

    /* ── Ficha de equipo ── */
    .team-sheet {
      page-break-after: always;
      padding: 16px 0;
    }
    .team-sheet:last-of-type {
      page-break-after: auto;
    }
    .team-sheet-header {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 3px solid var(--ink);
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .team-sheet-flag {
      width: 56px;
      height: 40px;
      object-fit: cover;
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
    }
    .team-sheet-title {
      flex: 1;
    }
    .team-sheet-name {
      font-family: var(--font-var);
      font-size: 24px;
      line-height: 1;
    }
    .team-sheet-meta {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.1em;
      margin-top: 4px;
    }

    /* Entrenador */
    .coach-block {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      background: var(--paper-2);
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      padding: 12px;
      margin-bottom: 16px;
    }
    .coach-photo {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border: 1px solid var(--ink);
      background: var(--paper-3);
    }
    .coach-info {
      flex: 1;
    }
    .coach-name {
      font-family: var(--font-var);
      font-size: 15px;
    }
    .coach-detail {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      margin-top: 2px;
    }
    .coach-bio {
      font-size: 12px;
      line-height: 1.5;
      color: var(--dim);
      margin-top: 4px;
    }

    /* Jugadores */
    .players-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
    }
    .player-card {
      border: 2px solid var(--ink);
      box-shadow: 2px 2px 0 var(--ink);
      background: var(--paper-2);
      padding: 8px;
      page-break-inside: avoid;
    }
    .player-photo-wrap {
      width: 100%;
      aspect-ratio: 1;
      background: var(--paper-3);
      border: 1px solid var(--ink);
      margin-bottom: 6px;
      overflow: hidden;
    }
    .player-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .player-number {
      font-family: var(--font-mono);
      font-size: 16px;
      font-weight: bold;
      color: var(--retro-orange);
    }
    .player-name {
      font-family: var(--font-var);
      font-size: 12px;
      line-height: 1.2;
      margin-top: 2px;
    }
    .player-meta {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      margin-top: 3px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .player-pos {
      display: inline-block;
      background: var(--ink);
      color: var(--paper);
      padding: 1px 4px;
      font-size: 8px;
    }
    .player-captain {
      background: var(--retro-yellow);
      color: var(--ink);
    }

    /* ── Predicción ── */
    .prediction-page {
      page-break-before: always;
      padding: 24px 0;
    }
    .prediction-podium {
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      gap: 16px;
      margin: 24px 0;
      align-items: end;
    }
    .podium-item {
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      padding: 16px;
      text-align: center;
      background: var(--paper-2);
    }
    .podium-item.champion {
      background: var(--retro-yellow);
      order: 2;
    }
    .podium-item.runner-up {
      order: 1;
    }
    .podium-item.third {
      order: 3;
    }
    .podium-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.15em;
      margin-bottom: 8px;
    }
    .podium-flag {
      width: 48px;
      height: 32px;
      object-fit: cover;
      border: 1px solid var(--ink);
      margin-bottom: 8px;
    }
    .podium-name {
      font-family: var(--font-var);
      font-size: 16px;
    }
    .bracket-summary {
      margin-top: 24px;
    }
    .bracket-round {
      margin-bottom: 16px;
    }
    .bracket-round-title {
      font-family: var(--font-mono);
      font-size: 11px;
      letter-spacing: 0.1em;
      background: var(--ink);
      color: var(--paper);
      padding: 4px 10px;
      margin-bottom: 8px;
    }
    .bracket-match {
      display: grid;
      grid-template-columns: 1fr 50px 1fr;
      gap: 8px;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px dashed rgba(26,25,51,0.15);
      font-size: 13px;
    }
    .bracket-team {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bracket-team.winner {
      font-weight: bold;
    }
    .bracket-score {
      font-family: var(--font-mono);
      text-align: center;
      background: var(--paper-2);
      border: 1px solid var(--ink);
      padding: 2px 6px;
    }

    .footer-line {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 2px solid var(--ink);
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      text-align: center;
      letter-spacing: 0.1em;
    }

    /* ── Impresión ── */
    @media print {
      @page {
        size: A4;
        margin: 12mm;
      }
      .no-print {
        display: none !important;
      }
      .guide-document {
        background: #fff;
        color: #1a1933;
      }
      .cover-page {
        min-height: 100vh;
        border: 4px solid #1a1933;
        page-break-after: always;
      }
      .section-page,
      .team-sheet,
      .prediction-page {
        page-break-before: always;
      }
      .team-sheet:first-of-type {
        page-break-before: always;
      }
      .player-card,
      .calendar-date,
      .coach-block,
      .podium-item {
        page-break-inside: avoid;
      }
      .players-grid {
        grid-template-columns: repeat(3, 1fr);
      }
      .calendar-match {
        grid-template-columns: 45px 1fr 70px 1fr 55px;
        font-size: 11px;
      }
    }

    @media (max-width: 768px) {
      .players-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .prediction-podium {
        grid-template-columns: 1fr;
      }
      .podium-item.champion { order: 1; }
      .podium-item.runner-up { order: 2; }
      .podium-item.third { order: 3; }
      .calendar-match {
        grid-template-columns: 40px 1fr 60px 1fr 50px;
        gap: 4px;
        font-size: 11px;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._regenerate();
    this._unsubscribeLocale = subscribeSlice(
      useLocaleStore,
      s => s.locale,
      () => { this._regenerate(); this.requestUpdate(); }
    );
  }

  disconnectedCallback() {
    this._unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private _regenerate() {
    this._data = generateGuideData(this._mode);
  }

  private _setMode(mode: 'auto' | 'user') {
    this._mode = mode;
    this._regenerate();
  }

  private _print() {
    window.print();
  }

  goBack() {
    // No-op: guide-view has no internal navigation state
  }

  render() {
    const data = this._data;
    if (!data) return html``;
    const locale = data.locale;

    const teamsByGroup = groupBy(data.teams, team => team.group);
    const groupLetters = 'ABCDEFGHIJKL'.split('');

    const groupDates = groupBy(data.groupMatches, m => m.date);
    const sortedDates = Object.keys(groupDates).sort();

    const knockoutByRound: Record<string, GuideMatch[]> = {
      roundOf32: [],
      roundOf16: [],
      quarterfinals: [],
      semifinals: [],
      thirdPlace: [],
      final: [],
    };
    for (const m of data.knockoutMatches) {
      if (m.round && knockoutByRound[m.round]) {
        knockoutByRound[m.round].push(m);
      }
    }

    const roundLabels: Record<string, string> = {
      roundOf32: t('guide.r32'),
      roundOf16: t('guide.r16'),
      quarterfinals: t('guide.qf'),
      semifinals: t('guide.sf'),
      thirdPlace: t('guide.tp'),
      final: t('guide.final'),
    };

    return html`
      <div class="guide-controls no-print">
        <div class="mode-group">
          <span class="mode-label">${locale === 'es' ? 'Modo' : 'Mode'}</span>
          <button
            class="mode-btn ${this._mode === 'auto' ? 'active' : ''}"
            @click="${() => this._setMode('auto')}">
            ${t('guide.modeAuto')}
          </button>
          <button
            class="mode-btn ${this._mode === 'user' ? 'active' : ''}"
            @click="${() => this._setMode('user')}">
            ${t('guide.modeUser')}
          </button>
          <span class="mode-desc">
            ${this._mode === 'auto' ? t('guide.modeAutoDesc') : t('guide.modeUserDesc')}
          </span>
        </div>
        <button class="print-btn" @click="${this._print}">
          🖨 ${t('guide.print')}
        </button>
      </div>

      <div class="guide-document">
        <!-- PORTADA -->
        <div class="cover-page">
          <div class="cover-eyebrow">FIFA WORLD CUP 2026</div>
          <div class="cover-title">${t('section.guide.title')}</div>
          <div class="cover-subtitle">${t('guide.coverSubtitle')}</div>
          <div class="cover-badge">${this._mode === 'auto' ? t('guide.modeAuto') : t('guide.modeUser')}</div>
          <div class="cover-flags">
            ${data.teams.slice(0, 48).map(t => html`
              <img class="cover-flag" src="${t.flagUrl}" alt="${t.name}" loading="lazy" />
            `)}
          </div>
        </div>

        <!-- CALENDARIO -->
        <div class="section-page">
          <div class="section-header">
            <div class="section-eyebrow">${t('guide.calendarSection')}</div>
            <div class="section-title">${t('guide.calendarSection')}</div>
          </div>

          <div class="section-header" style="margin-top: 24px;">
            <div class="section-eyebrow">⚽ ${t('tabs.groups')}</div>
          </div>
          ${sortedDates.map(date => html`
            <div class="calendar-date">
              <div class="calendar-date-header">${formatDate(date)}</div>
              ${groupDates[date].map(m => html`
                <div class="calendar-match">
                  <span class="calendar-time">${m.timeSpain}</span>
                  <span class="calendar-team">
                    <img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />
                    ${m.teamAName}
                  </span>
                  <span class="calendar-score">
                    ${m.scoreA !== null && m.scoreB !== null ? `${m.scoreA}-${m.scoreB}` : 'vs'}
                  </span>
                  <span class="calendar-team">
                    <img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />
                    ${m.teamBName}
                  </span>
                  <span class="calendar-venue">
                    ${m.venue}
                    <span class="calendar-group-label">${m.group}</span>
                  </span>
                </div>
              `)}
            </div>
          `)}

          <div class="section-header" style="margin-top: 32px;">
            <div class="section-eyebrow">★ ${t('tabs.knockout')}</div>
          </div>
          ${Object.entries(knockoutByRound).map(([round, matches]) => html`
            <div class="calendar-date">
              <div class="calendar-date-header">${roundLabels[round]}</div>
              ${matches.map(m => html`
                <div class="calendar-match">
                  <span class="calendar-time">${m.timeSpain ? formatDate(m.date) + ' ' + m.timeSpain : formatDate(m.date)}</span>
                  <span class="calendar-team">
                    ${m.teamA ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />` : ''}
                    ${m.teamAName}
                  </span>
                  <span class="calendar-score">
                    ${m.scoreA !== null && m.scoreB !== null
                      ? html`${m.scoreA}-${m.scoreB}${m.penaltyScoreA !== null && m.penaltyScoreB !== null ? html`<span style="font-size:9px;display:block;">(${m.penaltyScoreA}-${m.penaltyScoreB})</span>` : ''}`
                      : 'vs'}
                  </span>
                  <span class="calendar-team">
                    ${m.teamB ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />` : ''}
                    ${m.teamBName}
                  </span>
                  <span class="calendar-venue">
                    ${m.venue}
                    <span class="calendar-round-label">${roundLabels[round]}</span>
                  </span>
                </div>
              `)}
            </div>
          `)}
        </div>

        <!-- FICHAS DE EQUIPOS -->
        <div class="section-page">
          <div class="section-header">
            <div class="section-eyebrow">${t('guide.teamsSection')}</div>
            <div class="section-title">${t('guide.teamsSection')}</div>
          </div>
        </div>

        ${groupLetters.map(letter => {
          const groupTeams = teamsByGroup[letter] ?? [];
          return groupTeams.map(team => this._renderTeamSheet(team, locale));
        })}

        <!-- PREDICCIÓN -->
        <div class="prediction-page">
          <div class="section-header">
            <div class="section-eyebrow">${t('guide.predictionSection')}</div>
            <div class="section-title">${t('guide.predictionSection')}</div>
          </div>

          <div class="prediction-podium">
            <div class="podium-item runner-up">
              <div class="podium-label">${t('guide.runnerUp')}</div>
              ${data.prediction.runnerUp
                ? html`
                  <img class="podium-flag" src="${data.teams.find(t => t.teamId === data.prediction.runnerUp)?.flagUrl ?? ''}" alt="" />
                  <div class="podium-name">${data.teams.find(t => t.teamId === data.prediction.runnerUp)?.name ?? data.prediction.runnerUp}</div>
                `
                : html`<div class="podium-name">TBD</div>`}
            </div>
            <div class="podium-item champion">
              <div class="podium-label">🏆 ${t('guide.champion')}</div>
              ${data.prediction.champion
                ? html`
                  <img class="podium-flag" src="${data.teams.find(t => t.teamId === data.prediction.champion)?.flagUrl ?? ''}" alt="" />
                  <div class="podium-name">${data.teams.find(t => t.teamId === data.prediction.champion)?.name ?? data.prediction.champion}</div>
                `
                : html`<div class="podium-name">TBD</div>`}
            </div>
            <div class="podium-item third">
              <div class="podium-label">${t('guide.thirdPlace')}</div>
              ${data.prediction.thirdPlace
                ? html`
                  <img class="podium-flag" src="${data.teams.find(t => t.teamId === data.prediction.thirdPlace)?.flagUrl ?? ''}" alt="" />
                  <div class="podium-name">${data.teams.find(t => t.teamId === data.prediction.thirdPlace)?.name ?? data.prediction.thirdPlace}</div>
                `
                : html`<div class="podium-name">TBD</div>`}
            </div>
          </div>

          <div class="bracket-summary">
            ${Object.entries(knockoutByRound).map(([round, matches]) => html`
              <div class="bracket-round">
                <div class="bracket-round-title">${roundLabels[round]}</div>
                ${matches.map(m => html`
                  <div class="bracket-match">
                    <span class="bracket-team ${m.winnerId === m.teamA ? 'winner' : ''}">
                      ${m.teamA ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamA)?.flagUrl ?? ''}" alt="" />` : ''}
                      ${m.teamAName}
                    </span>
                    <span class="bracket-score">
                      ${m.scoreA !== null && m.scoreB !== null
                        ? html`${m.scoreA}-${m.scoreB}${m.penaltyScoreA !== null ? html`<span style="font-size:9px;display:block;">(${m.penaltyScoreA}-${m.penaltyScoreB})</span>` : ''}`
                        : '-'}
                    </span>
                    <span class="bracket-team ${m.winnerId === m.teamB ? 'winner' : ''}">
                      ${m.teamB ? html`<img class="calendar-flag" src="${data.teams.find(t => t.teamId === m.teamB)?.flagUrl ?? ''}" alt="" />` : ''}
                      ${m.teamBName}
                    </span>
                  </div>
                `)}
              </div>
            `)}
          </div>

          <div class="footer-line">
            ${t('guide.generatedBy')} · ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    `;
  }

  private _renderTeamSheet(team: GuideTeamData, locale: string) {
    const formation = team.lineup?.formation ?? '';
    const sortedPlayers = [...team.players].sort((a, b) => {
      const posOrder = { GK: 0, DF: 1, MF: 2, FW: 3 };
      return (posOrder[a.position] ?? 9) - (posOrder[b.position] ?? 9) || a.number - b.number;
    });

    return html`
      <div class="team-sheet">
        <div class="team-sheet-header">
          <img class="team-sheet-flag" src="${team.flagUrl}" alt="${team.name}" />
          <div class="team-sheet-title">
            <div class="team-sheet-name">${team.name}</div>
            <div class="team-sheet-meta">
              ${t('guide.group', { letter: team.group })} · ${team.squad.length} ${t('guide.players')}
              ${formation ? '· ' + t('guide.formation') + ' ' + formation : ''}
            </div>
          </div>
        </div>

        ${team.coach ? html`
          <div class="coach-block">
            ${team.hasCoachPhoto
              ? html`<img class="coach-photo" src="${team.coachPhotoUrl}" alt="${team.coach.name}" loading="lazy" />`
              : html`<div class="coach-photo" style="display:flex;align-items:center;justify-content:center;font-size:20px;">👤</div>`}
            <div class="coach-info">
              <div class="coach-name">${team.coach.name}</div>
              <div class="coach-detail">${t('guide.coach')} · ${team.coach.nationality}</div>
              <div class="coach-bio">${team.coach.bio[locale as 'es' | 'en']}</div>
            </div>
          </div>
        ` : ''}

        <div class="players-grid">
          ${sortedPlayers.map(p => html`
            <div class="player-card">
              <div class="player-photo-wrap">
                ${p.hasPhoto
                  ? html`<img class="player-photo" src="${p.photoUrl}" alt="${p.name}" loading="lazy" />`
                  : html`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;color:var(--dim);">⚽</div>`}
              </div>
              <div>
                <span class="player-number">${p.number}</span>
                <span class="player-pos">${posLabel(p.position, locale)}</span>
                ${p.captain ? html`<span class="player-pos player-captain">${t('guide.captain')}</span>` : ''}
              </div>
              <div class="player-name">${p.name}</div>
              <div class="player-meta">
                <span>${p.age} ${t('guide.age')}</span>
                <span>${p.club}</span>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t, useLocaleStore } from '../i18n';
import { getBroadcastInfo } from '../lib/broadcasting';
import { GROUP_MATCHES } from '../data/match-schedule';
import { TEAMS_2026 } from '../data/fifa-2026';
import { renderFlag } from '../lib/render-flag';

@customElement('broadcasting-view')
export class BroadcastingView extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 20px;
    }

    .intro-card {
      background: var(--paper-2);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 24px;
      margin-bottom: 32px;
      position: relative;
    }

    .intro-card::after {
      content: '★ ESPAÑA';
      position: absolute;
      top: -12px;
      right: 20px;
      background: var(--retro-red);
      color: var(--paper);
      padding: 4px 12px;
      font-family: var(--font-var);
      font-size: 12px;
      border: 2px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
    }

    .intro-text {
      font-family: var(--font-body);
      font-size: 16px;
      line-height: 1.5;
      color: var(--ink);
      margin: 0;
    }

    .rights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 40px;
    }

    .right-item {
      background: var(--paper);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .right-item.open {
      border-color: var(--retro-blue);
      box-shadow: 6px 6px 0 var(--retro-blue);
    }

    .right-item.pay {
      border-color: var(--retro-orange);
      box-shadow: 6px 6px 0 var(--retro-orange);
    }

    .right-title {
      font-family: var(--font-var);
      font-size: 20px;
      color: var(--ink);
      margin: 0;
    }

    .right-desc {
      font-family: var(--font-body);
      font-size: 14px;
      color: var(--dim);
      margin: 0;
    }

    .section-title {
      font-family: var(--font-var);
      font-size: 28px;
      color: var(--ink);
      margin: 0 0 20px 0;
      border-bottom: 3px dashed var(--ink);
      padding-bottom: 8px;
    }

    .table-container {
      overflow-x: auto;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      background: var(--paper);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-display);
      font-size: 14px;
    }

    th {
      background: var(--ink);
      color: var(--paper);
      text-align: left;
      padding: 12px 16px;
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    td {
      padding: 12px 16px;
      border-bottom: 2px solid var(--ink);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:nth-child(even) {
      background: var(--paper-2);
    }

    .match-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
    }

    .date-cell {
      font-family: var(--font-mono);
      font-size: 12px;
      white-space: nowrap;
    }

    .badge-mplus {
      display: inline-block;
      padding: 2px 8px;
      background: var(--fill);
      color: var(--ink);
      font-family: var(--font-var);
      font-size: 11px;
      border: 1px solid var(--hairline);
      margin-right: 4px;
    }

    .badge-featured {
      display: inline-block;
      padding: 2px 8px;
      background: var(--accent);
      color: var(--on-accent);
      font-family: var(--font-var);
      font-size: 11px;
      border: 1px solid var(--accent);
      margin-right: 4px;
    }

    .channel-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .knockout-card {
      background: var(--retro-yellow);
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-md);
      padding: 24px;
      margin-top: 40px;
    }

    .knockout-card h3 {
      font-family: var(--font-var);
      font-size: 22px;
      margin: 0 0 12px 0;
    }

    .knockout-card p {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.5;
      margin: 0;
    }

    .spain-disclaimer {
      margin-top: 24px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--retro-red);
      font-weight: bold;
      text-transform: uppercase;
    }

    @media (max-width: 768px) {
      .rights-grid {
        grid-template-columns: 1fr;
      }
      .section-title {
        font-size: 22px;
      }
    }
  `;

  private unsubscribeLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
  }

  disconnectedCallback() {
    this.unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private getTeam(id: string) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const locale = useLocaleStore.getState().locale === 'en' ? 'en-GB' : 'es-ES';
    return date.toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' });
  }

  private currentMatchday(): number {
    const iso = new Date().toISOString().slice(0, 10);
    const today = GROUP_MATCHES.find(m => m.date === iso);
    if (today) return today.matchDay;
    const upcoming = GROUP_MATCHES.find(m => m.date >= iso);
    return upcoming?.matchDay ?? 1;
  }

  render() {
    const matchDay = this.currentMatchday();
    const matches = GROUP_MATCHES.filter(m => m.matchDay === matchDay);

    return html`
      <div class="intro-card">
        <p class="intro-text">${t('tv.intro')}</p>
      </div>

      <div class="rights-grid">
        <div class="right-item pay">
          <h3 class="right-title">${t('tv.fullPackage')}</h3>
          <p class="right-desc">${t('tv.fullPackageDesc')}</p>
        </div>
        <div class="right-item open">
          <h3 class="right-title">${t('tv.openPackage')}</h3>
          <p class="right-desc">${t('tv.openPackageDesc')}</p>
        </div>
      </div>

      <h2 class="section-title">${t('tv.groupStageTitle')}</h2>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>${t('tv.colDate')}</th>
              <th>${t('tv.colTime')}</th>
              <th>${t('tv.colMatch')}</th>
              <th>${t('tv.colChannel')}</th>
            </tr>
          </thead>
          <tbody>
            ${matches.map(m => {
              const teamA = this.getTeam(m.teamA);
              const teamB = this.getTeam(m.teamB);
              const info = getBroadcastInfo(m.matchId, m.teamA, m.teamB);
              return html`
                <tr>
                  <td class="date-cell">${this.formatDate(m.date)}</td>
                  <td class="date-cell">${m.timeSpain}</td>
                  <td>
                    <div class="match-cell">
                      ${renderFlag(teamA, 'sm')}
                      <span>${teamA?.shortName ?? m.teamA} vs ${teamB?.shortName ?? m.teamB}</span>
                      ${renderFlag(teamB, 'sm')}
                    </div>
                  </td>
                  <td>
                    <div class="channel-list">
                      <span class="${info.featured ? 'badge-featured' : 'badge-mplus'}">${info.channel}</span>
                      ${info.featured ? html`<span class="badge-featured">${t('tv.featured')}</span>` : ''}
                    </div>
                  </td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>

      <p class="right-desc" style="margin-top: 12px;">${t('tv.exclusiveNote')}</p>

      <div class="knockout-card">
        <h3>${t('tv.knockoutTitle')}</h3>
        <p>${t('tv.knockoutDesc')}</p>
        <div class="spain-disclaimer">
          ★ ${t('tv.spainNote')}
        </div>
      </div>
    `;
  }
}

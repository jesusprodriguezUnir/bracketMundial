import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { t } from '../i18n';
import { RTVE_MATCH_IDS } from '../lib/broadcasting';
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

    .badge-rtve {
      display: inline-block;
      padding: 2px 8px;
      background: var(--retro-red);
      color: var(--paper);
      font-family: var(--font-var);
      font-size: 11px;
      border: 1px solid var(--ink);
    }

    .badge-dazn {
      display: inline-block;
      padding: 2px 8px;
      background: var(--ink);
      color: var(--retro-yellow);
      font-family: var(--font-var);
      font-size: 11px;
      border: 1px solid var(--ink);
      margin-left: 4px;
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

  private getTeam(id: string) {
    return TEAMS_2026.find(t => t.id === id);
  }

  private formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
  }

  render() {
    const rtveMatches = GROUP_MATCHES.filter(m => RTVE_MATCH_IDS.includes(m.matchId));

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
              <th>Fecha</th>
              <th>Hora</th>
              <th>Partido</th>
              <th>Grp</th>
              <th>Canal</th>
            </tr>
          </thead>
          <tbody>
            ${rtveMatches.map(m => {
              const teamA = this.getTeam(m.teamA);
              const teamB = this.getTeam(m.teamB);
              return html`
                <tr>
                  <td class="date-cell">${this.formatDate(m.date)}</td>
                  <td class="date-cell">${m.timeSpain}</td>
                  <td>
                    <div class="match-cell">
                      ${renderFlag(teamA, 'sm')}
                      <span>${teamA?.name} vs ${teamB?.name}</span>
                      ${renderFlag(teamB, 'sm')}
                    </div>
                  </td>
                  <td class="date-cell">${m.group}</td>
                  <td>
                    <span class="badge-rtve">RTVE</span>
                    <span class="badge-dazn">DAZN</span>
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

import { LitElement, css, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type OddsBarVariant = 'default' | 'compact' | 'large';

@customElement('odds-bar')
export class OddsBar extends LitElement {
  @property({ type: Number }) home = 0;
  @property({ type: Number }) draw = 0;
  @property({ type: Number }) away = 0;
  @property() variant: OddsBarVariant = 'default';
  @property({ type: Boolean }) showLegend = false;
  @property({ type: Boolean }) showFigures = true;
  @property({ type: Boolean }) inBarValues = false;
  @property() homeLabel = '1';
  @property() drawLabel = 'X';
  @property() awayLabel = '2';

  static readonly styles = css`
    :host {
      display: block;
    }

    .legend,
    .figures {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-mono);
      color: var(--dim);
    }

    .legend {
      margin-bottom: 2px;
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    .figures {
      margin-top: 2px;
    }

    .legend .home,
    .figures .home {
      color: var(--retro-blue);
    }

    .legend .away,
    .figures .away {
      color: var(--retro-red);
    }

    .bar {
      display: flex;
      overflow: hidden;
    }

    .segment {
      height: 100%;
      min-width: 0;
    }

    .segment.home {
      background: var(--retro-blue);
    }

    .segment.draw {
      background: var(--dim);
    }

    .segment.away {
      background: var(--retro-red);
    }

    .segment.large-draw {
      background: var(--paper-2);
      color: var(--ink);
    }

    .segment-value {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-family: var(--font-head, var(--font-var));
      color: var(--paper);
      overflow: hidden;
      white-space: nowrap;
    }

    .default .legend {
      font-size: 8px;
    }

    .default .bar {
      height: 6px;
      border: 2px solid var(--ink);
    }

    .default .figures {
      font-size: 9px;
    }

    .compact .bar {
      height: 4px;
      border: 1px solid var(--ink);
    }

    .compact .figures {
      font-size: 7px;
      padding: 0 4px 2px;
    }

    .large .bar {
      height: 36px;
      border: 2.5px solid var(--ink);
      box-shadow: 2px 2px 0 0 var(--ink);
    }

    .large .segment + .segment {
      border-left: 2px solid var(--ink);
    }

    .large .segment-value {
      font-size: 14px;
    }

    .large .figures,
    .large .legend {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-top: 5px;
    }

    .large .figures {
      margin-top: 0;
    }
  `;

  private _renderSegment(value: number, tone: 'home' | 'draw' | 'away') {
    const segmentClass = this.variant === 'large' && tone === 'draw'
      ? 'segment large-draw'
      : 'segment';
    return html`
      <div class="${segmentClass} ${tone}" style="width:${value}%">
        ${this.inBarValues
          ? html`<span class="segment-value">${value}%</span>`
          : nothing}
      </div>
    `;
  }

  render() {
    return html`
      <div class="${this.variant}">
        ${this.showLegend ? html`
          <div class="legend">
            <span class="home">${this.homeLabel}</span>
            <span>${this.drawLabel}</span>
            <span class="away">${this.awayLabel}</span>
          </div>
        ` : nothing}
        <div class="bar">
          ${this._renderSegment(this.home, 'home')}
          ${this._renderSegment(this.draw, 'draw')}
          ${this._renderSegment(this.away, 'away')}
        </div>
        ${this.showFigures && !this.inBarValues ? html`
          <div class="figures">
            <span class="home">${this.home}%</span>
            <span>${this.draw}%</span>
            <span class="away">${this.away}%</span>
          </div>
        ` : nothing}
        ${this.showLegend && this.variant === 'large' && !this.showFigures ? html`
          <div class="figures">
            <span class="home">${this.homeLabel}</span>
            <span>${this.drawLabel}</span>
            <span class="away">${this.awayLabel}</span>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
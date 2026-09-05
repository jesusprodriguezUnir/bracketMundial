import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Brand mark — rounded square badge with an inset diamond ("bracket night" identity).
// Keeps the historic `size` / `mode` API so existing call sites keep working.

@customElement('logo-crest')
export class LogoCrest extends LitElement {
  @property({ type: Number }) size = 200;
  @property({ type: String }) mode: 'color' | 'mono' = 'color';

  static styles = css`:host { display: inline-block; line-height: 0; }`;

  render() {
    const mono = this.mode === 'mono';
    const s = this.size;
    const r = Math.round(s * 0.22);
    const inset = s * 0.28;
    const diamond = s - inset * 2;
    const badgeFill = mono ? 'currentColor' : 'url(#lc-grad)';
    const diamondFill = mono ? '#ffffff' : '#070a18';

    return html`
      <svg
        viewBox="0 0 ${s} ${s}"
        width="${s}"
        height="${s}"
        style="display:block"
        role="img"
        aria-label="Bracket Nights"
      >
        <defs>
          <linearGradient id="lc-grad" x1="0" y1="0" x2="1" y2="1"
            gradientTransform="rotate(15 0.5 0.5)">
            <stop offset="0" stop-color="#4da3ff" />
            <stop offset="1" stop-color="#1e4fa8" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${s}" height="${s}" rx="${r}" ry="${r}" fill="${badgeFill}" />
        <rect
          x="${inset}"
          y="${inset}"
          width="${diamond}"
          height="${diamond}"
          rx="${Math.round(diamond * 0.14)}"
          transform="rotate(45 ${s / 2} ${s / 2})"
          fill="${diamondFill}"
        />
      </svg>
    `;
  }
}

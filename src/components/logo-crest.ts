import { LitElement, html, svg, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Escudo circular tipo sello postal — balón clásico + bandera "MUNDIAL · 2026"
@customElement('logo-crest')
export class LogoCrest extends LitElement {
  @property({ type: Number }) size = 200;
  @property({ type: String }) mode: 'color' | 'mono' = 'color';

  static styles = css`:host { display: inline-block; line-height: 0; }`;

  private _star(cx: number, cy: number, r: number, fill: string) {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.4;
      pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
    }
    return svg`<polygon points="${pts.join(' ')}" fill="${fill}" />`;
  }

  private _ball(cx: number, cy: number, r: number, dark: string, light: string) {
    const k = r / 36;
    const s = 2.2 * k;
    return svg`
      <g transform="translate(${cx} ${cy})">
        <circle r="${r}" fill="${light}" stroke="${dark}" stroke-width="${s}" />
        <polygon
          points="0,${-18*k} ${17*k},${-6*k} ${11*k},${14*k} ${-11*k},${14*k} ${-17*k},${-6*k}"
          fill="${dark}"
        />
        <line x1="0" y1="${-18*k}" x2="0" y2="${-36*k}" stroke="${dark}" stroke-width="${s}" stroke-linecap="round" />
        <line x1="${17*k}" y1="${-6*k}" x2="${34*k}" y2="${-12*k}" stroke="${dark}" stroke-width="${s}" stroke-linecap="round" />
        <line x1="${11*k}" y1="${14*k}" x2="${22*k}" y2="${28*k}" stroke="${dark}" stroke-width="${s}" stroke-linecap="round" />
        <line x1="${-11*k}" y1="${14*k}" x2="${-22*k}" y2="${28*k}" stroke="${dark}" stroke-width="${s}" stroke-linecap="round" />
        <line x1="${-17*k}" y1="${-6*k}" x2="${-34*k}" y2="${-12*k}" stroke="${dark}" stroke-width="${s}" stroke-linecap="round" />
      </g>
    `;
  }

  render() {
    const mono = this.mode === 'mono';
    const ink = '#1a1933';
    const cream = '#fff9ec';
    const orange = '#e8541f';
    const yellow = '#f0b021';
    const red = '#c41e2c';

    const A = mono
      ? { stamp: ink, ring: cream, body: cream, accent: ink, ballDark: ink, ballLight: cream, ribbon: ink, ribbonText: cream, stars: ink }
      : { stamp: cream, ring: ink, body: orange, accent: yellow, ballDark: ink, ballLight: cream, ribbon: ink, ribbonText: yellow, stars: yellow };

    const perfs = Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * Math.PI * 2;
      return svg`<circle key="${i}" cx="${100 + Math.cos(a) * 96}" cy="${100 + Math.sin(a) * 96}" r="4" fill="${A.stamp}" />`;
    });

    const starPositions: [number, number][] = [
      [100, 36], [56, 64], [144, 64], [56, 132], [144, 132], [100, 160],
    ];

    const stripeColor = mono ? ink : red;

    return html`
      <svg viewBox="0 0 200 200" width="${this.size}" height="${this.size}" style="display:block">
        <defs>
          <pattern id="cs-${this.mode}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" fill="${stripeColor}" opacity="0.08" />
          </pattern>
          <clipPath id="cc-${this.mode}">
            <circle cx="100" cy="100" r="92" />
          </clipPath>
        </defs>
        <!-- Perforations -->
        ${perfs}
        <!-- Main body -->
        <circle cx="100" cy="100" r="92" fill="${A.body}" stroke="${A.ring}" stroke-width="3" />
        <rect x="8" y="8" width="184" height="184" fill="url(#cs-${this.mode})" clip-path="url(#cc-${this.mode})" />
        <!-- Inner rings -->
        <circle cx="100" cy="100" r="82" fill="none" stroke="${A.accent}" stroke-width="1.5" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="${A.ring}" stroke-width="2.5" />
        <!-- Stars -->
        ${starPositions.map(([x, y]) => this._star(x, y, 4.5, A.stars))}
        <!-- Ball -->
        ${this._ball(100, 96, 36, A.ballDark, A.ballLight)}
        <!-- Ribbon -->
        <g transform="translate(100 158)">
          <path d="M -64 0 L -56 -10 L 56 -10 L 64 0 L 56 10 L -56 10 Z" fill="${A.ribbon}" stroke="${A.ring}" stroke-width="2" />
          <text x="0" y="4" text-anchor="middle" font-family="'Bowlby One', Impact, sans-serif" font-size="13" fill="${A.ribbonText}" letter-spacing="0.06em">MUNDIAL · 2026</text>
        </g>
      </svg>
    `;
  }
}

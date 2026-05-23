import { LitElement, html, svg, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// Escudo circular tipo sello premium — balón minimalista + banner "BracketMundial"

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

  private _pentagon(cx: number, cy: number, r: number, angleOffset: number = 0) {
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2 + angleOffset;
      pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
    }
    return svg`<polygon points="${pts.join(' ')}" fill="#1a1933" />`;
  }

  private _ballNew(cx: number, cy: number, r: number, bg: string, ink: string) {
    const pentagons: any[] = [];
    // Pentágono central
    pentagons.push(this._pentagon(cx, cy, 7.5, 0));
    
    // 5 pentágonos exteriores
    const d = 14.5;
    for (let j = 0; j < 5; j++) {
      const angle = (j * 2 * Math.PI / 5) + Math.PI / 2;
      const px = cx + Math.cos(angle) * d;
      const py = cy + Math.sin(angle) * d;
      pentagons.push(this._pentagon(px, py, 7.5, angle + Math.PI));
    }

    // Añadir unas líneas finas de costura entre vértices
    const seams: any[] = [];
    for (let j = 0; j < 5; j++) {
      const angle = (j * 2 * Math.PI / 5) - Math.PI / 2; // vértices del central
      const x1 = cx + Math.cos(angle) * 7.5;
      const y1 = cy + Math.sin(angle) * 7.5;
      const x2 = cx + Math.cos(angle) * 10.5;
      const y2 = cy + Math.sin(angle) * 10.5;
      seams.push(svg`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="1.0" stroke-dasharray="1.2,1.2" />`);
    }

    return svg`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bg}" stroke="${ink}" stroke-width="2.5" />
      ${pentagons}
      ${seams}
    `;
  }

  render() {
    const mono = this.mode === 'mono';
    const ink = '#1a1933';
    const cream = '#fff9ec';
    const orange = '#e8541f';
    const yellow = '#fcdb3a'; // Amarillo brillante del nuevo diseño

    const A = mono
      ? { stamp: ink, ring: cream, body: cream, accent: ink, ballDark: ink, ballLight: cream, ribbon: ink, ribbonText: cream, stars: ink }
      : { stamp: cream, ring: ink, body: orange, accent: yellow, ballDark: ink, ballLight: cream, ribbon: ink, ribbonText: yellow, stars: yellow };

    // 1) 36 segmentos dorados exteriores en anillo de r=86 a r=98
    const goldSegments = mono ? null : Array.from({ length: 36 }, (_, i) => {
      const a1 = (i / 36) * Math.PI * 2;
      const a2 = ((i + 1) / 36) * Math.PI * 2;
      const color = i % 2 === 0 ? '#f6d267' : '#c59218'; // Alternancia de brillos dorados 3D
      const x1_out = 100 + Math.cos(a1) * 98;
      const y1_out = 100 + Math.sin(a1) * 98;
      const x2_out = 100 + Math.cos(a2) * 98;
      const y2_out = 100 + Math.sin(a2) * 98;
      const x1_in = 100 + Math.cos(a1) * 86;
      const y1_in = 100 + Math.sin(a1) * 86;
      const x2_in = 100 + Math.cos(a2) * 86;
      const y2_in = 100 + Math.sin(a2) * 86;
      return svg`<polygon points="${x1_out},${y1_out} ${x2_out},${y2_out} ${x2_in},${y2_in} ${x1_in},${y1_in}" fill="${color}" />`;
    });

    // 2) Puntos oscuros (perforaciones) sobre el fondo dorado medio
    const perfs = Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      return svg`<circle cx="${100 + Math.cos(a) * 81}" cy="${100 + Math.sin(a) * 81}" r="2.8" fill="${mono ? A.stamp : ink}" />`;
    });

    // 3) 5 estrellas en arco arriba
    const stars = [
      { angle: -Math.PI/2 - Math.PI*58/180, r: 4.2 },
      { angle: -Math.PI/2 - Math.PI*29/180, r: 5.2 },
      { angle: -Math.PI/2, r: 6.2 },
      { angle: -Math.PI/2 + Math.PI*29/180, r: 5.2 },
      { angle: -Math.PI/2 + Math.PI*58/180, r: 4.2 },
    ].map(({ angle, r }) => {
      const cx = 100 + Math.cos(angle) * 54;
      const cy = 100 + Math.sin(angle) * 54;
      return this._star(cx, cy, r, A.stars);
    });

    return html`
      <svg viewBox="0 0 200 200" width="${this.size}" height="${this.size}" style="display:block">
        <!-- 3D Gold outer bevel segments -->
        ${goldSegments}
        
        <!-- Background under points -->
        ${!mono ? svg`<circle cx="100" cy="100" r="86" fill="#e5b53b" stroke="${ink}" stroke-width="1.5" />` : null}
        
        <!-- Dark points (postal stamp style) -->
        ${perfs}
        
        <!-- Main circle frame -->
        <circle cx="100" cy="100" r="76" fill="${A.body}" stroke="${ink}" stroke-width="3" />
        
        <!-- Inner accent ring -->
        <circle cx="100" cy="100" r="69" fill="none" stroke="${A.accent}" stroke-width="1.5" />
        
        <!-- Stars in arc -->
        ${stars}
        
        <!-- Stylized Football Ball -->
        ${this._ballNew(100, 95, 27, A.ballLight, ink)}
        
        <!-- Banner "BracketMundial" -->
        <g>
          <rect x="28" y="136" width="144" height="25" rx="12.5" ry="12.5" fill="${ink}" stroke="${mono ? A.ring : yellow}" stroke-width="2.2" />
          <text x="100" y="153.5" text-anchor="middle" font-family="'Archivo Black', 'Bowlby One', sans-serif" font-weight="900" font-size="14.2" fill="${mono ? A.ribbonText : yellow}" letter-spacing="-0.02em">BracketMundial</text>
        </g>
      </svg>
    `;
  }
}

/**
 * Estilos compartidos entre los componentes del shell móvil.
 * Lenguaje visual "noche europea": superficies oscuras, hairlines, acento azul.
 * Cada componente que los necesite los incluye en su `static styles` array.
 */
import { css } from 'lit';

/** Flag box: cuadrado de bandera emoji con borde */
export const flagBoxStyles = css`
  .flag-box {
    width: 22px; height: 15px;
    border: 1px solid var(--hairline);
    border-radius: 3px;
    display: inline-grid;
    place-items: center;
    font-size: 12px;
    line-height: 1;
    flex-shrink: 0;
    overflow: hidden;
    background: var(--fill);
  }
  .flag-box.big {
    width: 30px; height: 20px;
    font-size: 16px;
  }
`;

/** Botones del shell móvil */
export const btnStyles = css`
  .btn {
    all: unset;
    box-sizing: border-box;
    background: var(--fill);
    border: 1px solid var(--hairline-strong);
    border-radius: var(--radius-sm);
    color: var(--ink);
    padding: 11px 16px;
    font-family: var(--font-var);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    cursor: pointer;
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 46px;
    transition: transform 0.1s, background 0.12s, border-color 0.12s;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .btn:active { opacity: 0.7; }
  .btn-primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--on-accent);
    font-weight: 800;
    box-shadow: var(--glow-accent-sm);
  }
  .btn-block { display: flex; width: 100%; }
  .btn-icon { font-size: 15px; }
  .btn-danger { background: var(--retro-red); border-color: var(--retro-red); color: #fff; }
`;

/** Encabezado de sección (eyebrow + título) */
export const sectionHeadingStyles = css`
  .section-heading {
    padding: 18px 16px 14px;
    border-bottom: 1px solid var(--hairline);
    margin-bottom: 16px;
  }
  .section-heading.solid { border-bottom-style: solid; }
  .section-eyebrow {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--accent);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .section-title {
    font-family: var(--font-var);
    font-size: 30px;
    font-weight: 800;
    text-transform: uppercase;
    line-height: 0.95;
    color: var(--ink);
  }
`;

/** Celda de equipo con bandera + nombre */
export const teamCellStyles = css`
  .team-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 800;
    overflow: hidden;
  }
  .team-cell .nm {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

/** Todos los estilos compartidos combinados */
export const mobileShared = css`
  ${flagBoxStyles}
  ${btnStyles}
  ${sectionHeadingStyles}
  ${teamCellStyles}
`;

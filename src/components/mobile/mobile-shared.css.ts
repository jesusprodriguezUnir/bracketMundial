/**
 * Estilos compartidos entre los componentes del shell móvil.
 * Transpila el lenguaje visual de movil/styles.css a tokens CSS del sistema Panini.
 * Cada componente que los necesite los incluye en su `static styles` array.
 */
import { css } from 'lit';

/** Flag box: cuadrado de bandera emoji con borde */
export const flagBoxStyles = css`
  .flag-box {
    width: 22px; height: 15px;
    border: 1px solid var(--ink);
    display: inline-grid;
    place-items: center;
    font-size: 12px;
    line-height: 1;
    flex-shrink: 0;
    overflow: hidden;
    background: var(--paper-3);
  }
  .flag-box.big {
    width: 30px; height: 20px;
    font-size: 16px;
  }
`;

/** Botones Panini (retro, sombra dura) */
export const btnStyles = css`
  .btn {
    all: unset;
    box-sizing: border-box;
    background: var(--paper-2);
    border: 3px solid var(--ink);
    color: var(--ink);
    padding: 11px 16px;
    font-family: var(--font-var);
    font-size: 13px;
    letter-spacing: 0.03em;
    cursor: pointer;
    box-shadow: var(--shadow-hard-md);
    text-align: center;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 46px;
    transition: transform 0.08s, box-shadow 0.08s;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  .btn:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 var(--ink); }
  .btn-primary { background: var(--retro-yellow); }
  .btn-block { display: flex; width: 100%; }
  .btn-icon { font-size: 15px; }
  .btn-danger { background: var(--retro-red); color: var(--paper); }
`;

/** Encabezado de sección (eyebrow + título) */
export const sectionHeadingStyles = css`
  .section-heading {
    padding: 18px 16px 14px;
    border-bottom: 3px dashed var(--ink);
    margin-bottom: 16px;
  }
  .section-heading.solid { border-bottom-style: solid; }
  .section-eyebrow {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--dim);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .section-title {
    font-family: var(--font-var);
    font-size: 30px;
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

/** Ruta al escudo de un equipo. */
export const crestSrc = (id: string): string => `/assets/crests/${id}.png`;

/** Ruta a la camiseta de un equipo (titular por defecto). */
export const kitSrc = (id: string, variant: 'home' | 'away' = 'home'): string =>
  `/assets/kits/${id}_${variant}.png`;

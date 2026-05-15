import type { StoreApi } from 'zustand/vanilla';

/**
 * Suscribe a un store Zustand vanilla solo cuando el slice seleccionado cambia.
 * Usa comparación superficial por referencia — ideal para objetos inmutables de Zustand.
 *
 * @returns función de desuscripción
 */
export function subscribeSlice<TState, TSlice>(
  store: StoreApi<TState>,
  selector: (state: TState) => TSlice,
  callback: (slice: TSlice) => void,
  equalityFn: (a: TSlice, b: TSlice) => boolean = Object.is,
): () => void {
  let prev = selector(store.getState());
  return store.subscribe(() => {
    const next = selector(store.getState());
    if (!equalityFn(prev, next)) {
      prev = next;
      callback(next);
    }
  });
}

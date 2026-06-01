import { useTournamentStore, extractBracketData } from '../store/tournament-store';
import { useAuthStore } from '../store/auth-store';
import { subscribeSlice } from '../store/store-utils';
import { getSupabase } from './supabase-client';
import { encodeBracket, decodeBracket } from './bracket-codec';

// ── Upload helper (privado) ──

async function pushNow(): Promise<void> {
  const sb = getSupabase();
  const session = useAuthStore.getState().session;
  if (!sb || !session) return;

  const state = useTournamentStore.getState();
  const ctx = state.activeContext;

  if (ctx.kind === 'personal') {
    const payload = encodeBracket(
      state.groupMatches,
      state.knockoutMatches,
      state.myTopScorerPrediction,
      state.myMvpPrediction,
    );
    await sb.from('predictions').upsert(
      { user_id: session.user.id, payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  } else {
    const bracket = extractBracketData(state);
    const { updateMyPredictionsInCloud } = await import('./league-sync');
    await updateMyPredictionsInCloud(
      ctx.leagueId,
      bracket.groupScores,
      bracket.knockoutScores,
      bracket.topScorer,
      bracket.mvp,
    );
  }
}

// ── Estado de "cambios sin publicar" (pub/sub) ──

let _hasUnpublished = false;
const _unpublishedListeners = new Set<(dirty: boolean) => void>();

function _markDirty(): void {
  if (_hasUnpublished) return;
  _hasUnpublished = true;
  _unpublishedListeners.forEach(cb => cb(true));
}

function _markPublished(): void {
  if (!_hasUnpublished) return;
  _hasUnpublished = false;
  _unpublishedListeners.forEach(cb => cb(false));
}

/** Devuelve true si hay cambios locales pendientes de publicar en la nube. */
export function getUnpublished(): boolean {
  return _hasUnpublished;
}

/** Suscribe al estado de "cambios sin publicar". Devuelve la función de desuscripción. */
export function subscribeUnpublished(cb: (dirty: boolean) => void): () => void {
  _unpublishedListeners.add(cb);
  return () => _unpublishedListeners.delete(cb);
}

// ── Publicación manual ──

/**
 * Sube el estado actual a la nube. Retorna true si tuvo éxito, false si no hay
 * sesión o si falló la subida.
 */
export async function publishNow(): Promise<boolean> {
  const sb = getSupabase();
  const session = useAuthStore.getState().session;
  if (!sb || !session) return false;

  try {
    await pushNow();
    _markPublished();
    return true;
  } catch {
    // Mantener dirty en caso de error
    return false;
  }
}

// ── Suscripción al store (rastrea cambios, marca dirty) ──

let _unsub: (() => void) | null = null;

export function startSync(): void {
  if (_unsub) return;

  // Guardamos el contexto inicial para distinguir "cambio de datos" de "cambio de contexto"
  let _prevContextStr = JSON.stringify(useTournamentStore.getState().activeContext);

  _unsub = subscribeSlice(
    useTournamentStore,
    s => [
      s.groupMatches,
      s.knockoutMatches,
      s.myTopScorerPrediction ? `${s.myTopScorerPrediction.teamId}:${s.myTopScorerPrediction.playerName}` : '',
      s.myMvpPrediction ? `${s.myMvpPrediction.teamId}:${s.myMvpPrediction.playerName}` : '',
      JSON.stringify(s.activeContext),
    ] as const,
    (slice) => {
      const currentCtxStr = slice[4] as string;
      if (currentCtxStr !== _prevContextStr) {
        // El contexto cambió (ej. de liga a personal): reiniciar el indicador
        _prevContextStr = currentCtxStr;
        _markPublished();
      } else {
        // Los datos cambiaron: marcar como pendiente de publicar
        _markDirty();
      }
    },
    (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4],
  );
}

export function stopSync(): void {
  _unsub?.();
  _unsub = null;
  _markPublished();
}

// ── Helpers internos ──

function _isLocalEmpty(): boolean {
  const { groupMatches, knockoutMatches } = useTournamentStore.getState();
  const hasGroupScore = groupMatches.some(m => m.scoreA !== null);
  const hasKnockoutScore = Object.values(knockoutMatches).some(m => m.isPlayed);
  return !hasGroupScore && !hasKnockoutScore;
}

// ── Hook de autenticación ──

/**
 * Se llama cuando el usuario inicia sesión. Arranca la suscripción y reconcilia
 * el estado local con la nube SIN mostrar ningún modal:
 *
 * - Nube vacía            → conservar local, marcarlo como sin publicar si no está vacío.
 * - Idéntico              → sin acción (ya sincronizado).
 * - Local vacío y nube con datos → cargar desde la nube en silencio.
 * - Local con datos y nube diferente → conservar local, marcar sin publicar.
 *                           (El usuario decide cuándo publicar.)
 */
export async function onSignedIn(): Promise<void> {
  const sb = getSupabase();
  const session = useAuthStore.getState().session;
  if (!sb || !session) return;

  startSync();

  const ctx = useTournamentStore.getState().activeContext;

  // Para contextos de liga, la reconciliación la hace league-sync; nada más que hacer aquí.
  if (ctx.kind !== 'personal') {
    return;
  }

  const { data, error } = await sb
    .from('predictions')
    .select('payload, updated_at')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    return;
  }

  if (!data) {
    // Sin datos en la nube: el estado local es el único existente.
    // Si el usuario tiene predicciones, marcarlas como pendientes de publicar.
    if (!_isLocalEmpty()) _markDirty();
    return;
  }

  const { groupMatches, knockoutMatches, myTopScorerPrediction, myMvpPrediction } = useTournamentStore.getState();
  const localStr = encodeBracket(groupMatches, knockoutMatches, myTopScorerPrediction, myMvpPrediction);
  const cloudStr = data.payload as string;

  if (localStr === cloudStr) {
    // Ya sincronizados: no hay nada pendiente.
    return;
  }

  if (_isLocalEmpty()) {
    // Local vacío, nube con datos → cargar la nube en silencio.
    const decoded = decodeBracket(cloudStr);
    if (decoded) useTournamentStore.getState().applySharedBracket(decoded);
    return;
  }

  // Local tiene datos y difiere de la nube → conservar local sin preguntar.
  // El usuario verá el indicador "Cambios sin publicar" y podrá publicar cuando quiera.
  _markDirty();
}

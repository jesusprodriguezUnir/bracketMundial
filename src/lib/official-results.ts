import { getSupabase } from './supabase-client';
import { decodeBracket, encodeBracket } from './bracket-codec';
import { getMatchWindowInfo } from './match-window';
import { useAuthStore } from '../store/auth-store';
import { useTournamentStore } from '../store/tournament-store';
import type { DecodedBracket } from './bracket-codec';

export function isAdmin(): boolean {
  const uid = import.meta.env.VITE_ADMIN_UID;
  if (!uid) return false;
  return useAuthStore.getState().session?.user.id === uid;
}

export async function loadOfficialResults(): Promise<DecodedBracket | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from('official_results').select('payload').eq('id', 1).maybeSingle();
  if (!data?.payload) return null;
  return decodeBracket(data.payload as string);
}

// ── Notificador compartido de resultados oficiales ──
// Una única fuente para toda la app: se fetchéa con throttle y los
// suscriptores (store, leagues-view…) reciben cada bracket nuevo.

const REFRESH_THROTTLE_MS = 60_000;

type OfficialResultsListener = (bracket: DecodedBracket) => void;

let _lastBracket: DecodedBracket | null = null;
let _lastFetchAt = 0;
let _inflight: Promise<DecodedBracket | null> | null = null;
const _listeners = new Set<OfficialResultsListener>();

/**
 * Fetch + decode de `official_results` con throttle de 60 s (`force` lo salta).
 * Notifica a los suscriptores cuando hay bracket. Devuelve el último conocido.
 */
export async function refreshOfficialResults(opts?: { force?: boolean }): Promise<DecodedBracket | null> {
  if (_inflight) return _inflight;
  if (!opts?.force && Date.now() - _lastFetchAt < REFRESH_THROTTLE_MS) return _lastBracket;

  _inflight = loadOfficialResults()
    .then(bracket => {
      _lastFetchAt = Date.now();
      if (bracket) {
        _lastBracket = bracket;
        for (const cb of _listeners) cb(bracket);
      }
      return _lastBracket;
    })
    .catch(() => _lastBracket)
    .finally(() => { _inflight = null; });
  return _inflight;
}

/**
 * Suscribe a actualizaciones del bracket oficial. Si ya hay uno cacheado,
 * lo entrega inmediatamente. Devuelve la función de desuscripción.
 */
export function subscribeOfficialResults(cb: OfficialResultsListener): () => void {
  _listeners.add(cb);
  if (_lastBracket) cb(_lastBracket);
  return () => { _listeners.delete(cb); };
}

// ── Polling adaptativo ──
// Cadencia según la ventana de partidos del calendario: alta en vivo, baja en
// día de partido, solo re-chequeo en idle. Timer encadenado (setTimeout) para
// re-evaluar el estado en cada tick. La pestaña oculta no fetchéa (el
// visibilitychange de app-root refresca al volver, y el throttle dedupea).

const POLL_LIVE_MS = 90_000;            // > throttle de 60 s → cada tick fetchéa de verdad
const POLL_MATCHDAY_MS = 600_000;       // 10 min
const POLL_IDLE_RECHECK_MS = 1_800_000; // 30 min: re-evaluar ventana sin fetch

let _pollTimer: ReturnType<typeof setTimeout> | null = null;
let _polling = false;

function _scheduleNextPoll(): void {
  const info = getMatchWindowInfo();
  let delay: number;
  let doFetch: boolean;
  switch (info.state) {
    case 'live':     delay = POLL_LIVE_MS;         doFetch = true;  break;
    case 'matchday': delay = POLL_MATCHDAY_MS;     doFetch = true;  break;
    case 'idle':     delay = POLL_IDLE_RECHECK_MS; doFetch = false; break;
  }
  if (info.msToNextLiveWindow !== null) {
    // No despertar tarde: si la próxima ventana live abre antes del delay, programar ahí.
    delay = Math.max(5_000, Math.min(delay, info.msToNextLiveWindow + 1_000));
  } else if (info.state === 'idle') {
    return; // torneo terminado: no quedan partidos
  }
  _pollTimer = setTimeout(() => {
    _pollTimer = null;
    if (!_polling) return;
    const hidden = typeof document !== 'undefined' && document.hidden;
    if (doFetch && !hidden) void refreshOfficialResults();
    _scheduleNextPoll();
  }, delay);
}

/** Arranca el polling adaptativo de resultados oficiales (idempotente). */
export function startOfficialResultsPolling(): void {
  if (_polling) return;
  _polling = true;
  _scheduleNextPoll();
}

export function stopOfficialResultsPolling(): void {
  _polling = false;
  if (_pollTimer !== null) {
    clearTimeout(_pollTimer);
    _pollTimer = null;
  }
}

export async function saveOfficialResults(): Promise<boolean> {
  const sb = getSupabase();
  if (!sb || !isAdmin()) return false;
  const state = useTournamentStore.getState();
  const payload = encodeBracket(state.groupMatches, state.knockoutMatches);
  const { error } = await sb.from('official_results').upsert(
    { id: 1, payload, updated_at: new Date().toISOString() },
    { onConflict: 'id' }
  );
  return !error;
}

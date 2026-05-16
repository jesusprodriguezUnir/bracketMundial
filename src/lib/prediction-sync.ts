import { useTournamentStore } from '../store/tournament-store';
import { useAuthStore } from '../store/auth-store';
import { subscribeSlice } from '../store/store-utils';
import { getSupabase } from './supabase-client';
import { encodeBracket, decodeBracket } from './bracket-codec';

const DEBOUNCE_MS = 4000;

let _unsub: (() => void) | null = null;
let _timer: ReturnType<typeof setTimeout> | null = null;
let _pendingUpload = false;

async function pushNow(): Promise<void> {
  _timer = null;
  _pendingUpload = false;
  const sb = getSupabase();
  const session = useAuthStore.getState().session;
  if (!sb || !session) return;
  const { groupMatches, knockoutMatches } = useTournamentStore.getState();
  const payload = encodeBracket(groupMatches, knockoutMatches);
  await sb.from('predictions').upsert(
    { user_id: session.user.id, payload, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
}

function scheduleUpload(): void {
  _pendingUpload = true;
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => { void pushNow(); }, DEBOUNCE_MS);
}

function flushIfPending(): void {
  if (!_pendingUpload) return;
  if (_timer) { clearTimeout(_timer); _timer = null; }
  void pushNow();
}

export function startSync(): void {
  if (_unsub) return;
  _unsub = subscribeSlice(
    useTournamentStore,
    s => [s.groupMatches, s.knockoutMatches] as const,
    scheduleUpload,
    (a, b) => a[0] === b[0] && a[1] === b[1],
  );
  document.addEventListener('visibilitychange', _onVisibilityChange);
}

export function stopSync(): void {
  _unsub?.();
  _unsub = null;
  if (_timer) { clearTimeout(_timer); _timer = null; }
  _pendingUpload = false;
  document.removeEventListener('visibilitychange', _onVisibilityChange);
}

function _onVisibilityChange(): void {
  if (document.visibilityState === 'hidden') flushIfPending();
}

function _isLocalEmpty(): boolean {
  const { groupMatches, knockoutMatches } = useTournamentStore.getState();
  const hasGroupScore = groupMatches.some(m => m.scoreA !== null);
  const hasKnockoutScore = Object.values(knockoutMatches).some(m => m.isPlayed);
  return !hasGroupScore && !hasKnockoutScore;
}

export async function onSignedIn(): Promise<void> {
  const sb = getSupabase();
  const session = useAuthStore.getState().session;
  if (!sb || !session) return;

  const { data, error } = await sb
    .from('predictions')
    .select('payload, updated_at')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    startSync();
    return;
  }

  if (!data) {
    await pushNow();
    startSync();
    return;
  }

  const { groupMatches, knockoutMatches } = useTournamentStore.getState();
  const localStr = encodeBracket(groupMatches, knockoutMatches);
  const cloudStr = data.payload as string;

  if (localStr === cloudStr) {
    startSync();
    return;
  }

  if (_isLocalEmpty()) {
    const decoded = decodeBracket(cloudStr);
    if (decoded) useTournamentStore.getState().applySharedBracket(decoded);
    startSync();
    return;
  }

  const { openSyncConflictModal } = await import('../components/auth-modal');
  const cloudDate = new Date(data.updated_at as string).toLocaleDateString(
    useAuthStore.getState().session?.user.email ? undefined : 'es',
    { day: 'numeric', month: 'short', year: 'numeric' },
  );
  const choice = await openSyncConflictModal(cloudDate);

  if (choice === 'cloud') {
    const decoded = decodeBracket(cloudStr);
    if (decoded) useTournamentStore.getState().applySharedBracket(decoded);
  } else {
    await pushNow();
  }
  startSync();
}

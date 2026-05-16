import { getSupabase } from './supabase-client';
import { decodeBracket, encodeBracket } from './bracket-codec';
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

import { createStore } from 'zustand/vanilla';
import { getSupabase } from '../lib/supabase-client';
import { useAuthStore } from './auth-store';

export interface League {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
}

export interface LeagueMember {
  user_id: string;
  display_name: string;
  joined_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total: number;
  byRound: Record<string, number>;
}

type LeaguesStatus = 'idle' | 'loading' | 'error';

interface LeaguesState {
  displayName: string | null;
  myLeagues: League[];
  activeLeagueId: string | null;
  members: LeagueMember[];
  leaderboard: LeaderboardEntry[];
  status: LeaguesStatus;
  lastError: string | null;
  loadProfile: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  loadMyLeagues: () => Promise<void>;
  createLeague: (name: string) => Promise<League | null>;
  joinByCode: (code: string) => Promise<League | null>;
  leaveLeague: (id: string) => Promise<void>;
  deleteLeague: (id: string) => Promise<void>;
  loadMembers: (leagueId: string) => Promise<void>;
  loadLeaderboard: (leagueId: string) => Promise<void>;
  setActiveLeague: (id: string | null) => void;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

export const useLeaguesStore = createStore<LeaguesState>()((set, _get) => ({
  displayName: null,
  myLeagues: [],
  activeLeagueId: null,
  members: [],
  leaderboard: [],
  status: 'idle',
  lastError: null,

  loadProfile: async () => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return;
    const { data } = await sb
      .from('profiles')
      .select('display_name')
      .eq('user_id', session.user.id)
      .maybeSingle();
    set({ displayName: data?.display_name ?? null });
  },

  setDisplayName: async (name) => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return;
    set({ status: 'loading', lastError: null });
    const { error } = await sb.from('profiles').upsert(
      { user_id: session.user.id, display_name: name, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
    if (error) { set({ status: 'error', lastError: error.message }); return; }
    set({ displayName: name, status: 'idle' });
  },

  loadMyLeagues: async () => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return;
    set({ status: 'loading', lastError: null });
    const { data, error } = await sb
      .from('league_members')
      .select('leagues(id, name, code, owner_id, created_at)')
      .eq('user_id', session.user.id);
    if (error) { set({ status: 'error', lastError: error.message }); return; }
    const leagues: League[] = (data ?? [])
      .map((row: Record<string, unknown>) => row['leagues'])
      .filter(Boolean) as League[];
    set({ myLeagues: leagues, status: 'idle' });
  },

  createLeague: async (name) => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return null;
    set({ status: 'loading', lastError: null });
    const code = generateCode();
    const { data: league, error } = await sb
      .from('leagues')
      .insert({ name, code, owner_id: session.user.id })
      .select('id, name, code, owner_id, created_at')
      .single();
    if (error || !league) { set({ status: 'error', lastError: error?.message ?? 'Error' }); return null; }
    await sb.from('league_members').insert({ league_id: league.id, user_id: session.user.id });
    set(s => ({ myLeagues: [...s.myLeagues, league as League], status: 'idle' }));
    return league as League;
  },

  joinByCode: async (code) => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return null;
    set({ status: 'loading', lastError: null });
    const { data: league, error: leagueErr } = await sb
      .from('leagues')
      .select('id, name, code, owner_id, created_at')
      .eq('code', code.toUpperCase().trim())
      .maybeSingle();
    if (leagueErr || !league) {
      set({ status: 'error', lastError: leagueErr?.message ?? 'Liga no encontrada' });
      return null;
    }
    const { error: joinErr } = await sb
      .from('league_members')
      .upsert({ league_id: league.id, user_id: session.user.id }, { onConflict: 'league_id,user_id' });
    if (joinErr) { set({ status: 'error', lastError: joinErr.message }); return null; }
    set(s => ({
      myLeagues: s.myLeagues.some(l => l.id === (league as League).id)
        ? s.myLeagues
        : [...s.myLeagues, league as League],
      status: 'idle',
    }));
    return league as League;
  },

  leaveLeague: async (id) => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return;
    set({ status: 'loading', lastError: null });
    const { error } = await sb
      .from('league_members')
      .delete()
      .eq('league_id', id)
      .eq('user_id', session.user.id);
    if (error) { set({ status: 'error', lastError: error.message }); return; }
    set(s => ({ myLeagues: s.myLeagues.filter(l => l.id !== id), activeLeagueId: null, status: 'idle' }));
  },

  deleteLeague: async (id) => {
    const sb = getSupabase();
    const session = useAuthStore.getState().session;
    if (!sb || !session) return;
    set({ status: 'loading', lastError: null });
    const { error } = await sb
      .from('leagues')
      .delete()
      .eq('id', id)
      .eq('owner_id', session.user.id);
    if (error) { set({ status: 'error', lastError: error.message }); return; }
    set(s => ({ myLeagues: s.myLeagues.filter(l => l.id !== id), activeLeagueId: null, status: 'idle' }));
  },

  loadMembers: async (leagueId) => {
    const sb = getSupabase();
    if (!sb) return;
    set({ status: 'loading', lastError: null, members: [] });
    const { data, error } = await sb
      .from('league_members')
      .select('user_id, joined_at, profiles(display_name)')
      .eq('league_id', leagueId);
    if (error) { set({ status: 'error', lastError: error.message }); return; }
    const members: LeagueMember[] = (data ?? []).map((row: Record<string, unknown>) => ({
      user_id: row['user_id'] as string,
      display_name: (row['profiles'] as { display_name?: string } | null)?.display_name ?? '???',
      joined_at: row['joined_at'] as string,
    }));
    set({ members, status: 'idle' });
  },

  loadLeaderboard: async (leagueId) => {
    const sb = getSupabase();
    if (!sb) return;
    set({ status: 'loading', lastError: null });

    const { loadOfficialResults } = await import('../lib/official-results');
    const official = await loadOfficialResults();
    if (!official) { set({ leaderboard: [], status: 'idle' }); return; }

    const { data: memberRows, error: membErr } = await sb
      .from('league_members')
      .select('user_id, profiles(display_name)')
      .eq('league_id', leagueId);
    if (membErr) { set({ status: 'error', lastError: membErr.message }); return; }

    const userIds = (memberRows ?? []).map((r: Record<string, unknown>) => r['user_id'] as string);
    const { data: predRows, error: predErr } = await sb
      .from('predictions')
      .select('user_id, payload')
      .in('user_id', userIds);
    if (predErr) { set({ status: 'error', lastError: predErr.message }); return; }

    const { scoreBracket } = await import('../lib/scoring');
    const { decodeBracket } = await import('../lib/bracket-codec');

    const predMap = new Map((predRows ?? []).map((r: Record<string, unknown>) => [r['user_id'] as string, r['payload'] as string]));
    const entries: LeaderboardEntry[] = (memberRows ?? []).map((r: Record<string, unknown>) => {
      const userId = r['user_id'] as string;
      const displayName = (r['profiles'] as { display_name?: string } | null)?.display_name ?? '???';
      const payload = predMap.get(userId);
      const pred = payload ? decodeBracket(payload) : null;
      const score = pred ? scoreBracket(pred, official) : { total: 0, byRound: {} };
      return { user_id: userId, display_name: displayName, total: score.total, byRound: score.byRound };
    });
    entries.sort((a, b) => b.total - a.total);
    set({ leaderboard: entries, status: 'idle' });
  },

  setActiveLeague: (id) => set({ activeLeagueId: id }),
}));

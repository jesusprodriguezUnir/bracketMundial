import { createStore } from 'zustand/vanilla';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase-client';

export type AuthStatus = 'init' | 'signed_out' | 'signed_in' | 'sending' | 'sent' | 'error';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  email: string | null;
  lastError: string | null;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  _setSession: (s: Session | null) => void;
}

export const useAuthStore = createStore<AuthState>()((set, _get) => ({
  status: 'init',
  session: null,
  email: null,
  lastError: null,

  signInWithMagicLink: async (email) => {
    const sb = getSupabase();
    if (!sb) { set({ status: 'error', lastError: 'not_configured' }); return; }
    set({ status: 'sending', lastError: null });
    const { isNativePlatform, getNativeRedirectUrl } = await import('../lib/native-auth');
    const emailRedirectTo = isNativePlatform()
      ? getNativeRedirectUrl()
      : window.location.origin + window.location.pathname;
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo } });
    set(error ? { status: 'error', lastError: error.message } : { status: 'sent' });
  },

  signOut: async () => {
    const sb = getSupabase();
    await sb?.auth.signOut();
  },

  _setSession: (s) => set({
    session: s,
    email: s?.user.email ?? null,
    status: s ? 'signed_in' : 'signed_out',
    lastError: null,
  }),
}));

export function initAuth(): void {
  if (!isSupabaseConfigured) {
    useAuthStore.setState({ status: 'signed_out' });
    return;
  }
  const sb = getSupabase()!;

  sb.auth.getSession().then(({ data }) => {
    useAuthStore.getState()._setSession(data.session);
    if (data.session) {
      _onSignedIn();
    }
  });

  sb.auth.onAuthStateChange((_event, session) => {
    const prev = useAuthStore.getState().session;
    const wasInit = useAuthStore.getState().status === 'init';
    useAuthStore.getState()._setSession(session);

    if (session && (!prev || wasInit)) {
      _onSignedIn();
    }
    if (!session && prev) {
      import('../lib/prediction-sync').then(({ stopSync }) => stopSync());
    }
  });
}

function _onSignedIn() {
  import('../lib/prediction-sync').then(({ onSignedIn }) => onSignedIn());
  import('../store/leagues-store').then(({ useLeaguesStore }) => {
    useLeaguesStore.getState().loadProfile();
    useLeaguesStore.getState().loadMyLeagues();
  });
  const pendingCode = sessionStorage.getItem('bm-join-code');
  if (pendingCode) {
    sessionStorage.removeItem('bm-join-code');
    import('../components/leagues-modal').then(({ openLeaguesModal }) => {
      openLeaguesModal(pendingCode);
    });
  }
}

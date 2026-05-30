import { createStore } from 'zustand/vanilla';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase-client';

// Clave de sessionStorage para preservar un hash de invitación de liga
// a través del login (magic-link / OAuth limpian el hash).
const PENDING_INVITE_HASH_KEY = 'wm2026_pending_invite_hash';

/** Prefijos de hash que corresponden a una invitación de liga. */
function _isLeagueInviteHash(hash: string): boolean {
  return hash.startsWith('#league/join/') || hash.startsWith('#lg=');
}

/**
 * Espera a que el estado de autenticación deje de estar en 'init' y devuelve
 * la sesión resultante (o null si no hay sesión).
 */
export function waitForAuthReady(): Promise<Session | null> {
  const state = useAuthStore.getState();
  if (state.status !== 'init') return Promise.resolve(state.session);
  return new Promise(resolve => {
    const unsub = useAuthStore.subscribe(s => {
      if (s.status !== 'init') {
        unsub();
        resolve(s.session);
      }
    });
  });
}

export type AuthStatus = 'init' | 'signed_out' | 'signed_in' | 'sending' | 'sent' | 'sent_signup' | 'error';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  email: string | null;
  lastError: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  resendSignupConfirmation: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetError: () => void;
  _setSession: (s: Session | null) => void;
}

async function buildRedirectUrl(): Promise<string> {
  const { isNativePlatform, getNativeRedirectUrl } = await import('../lib/native-auth');
  return isNativePlatform()
    ? getNativeRedirectUrl()
    : window.location.origin + window.location.pathname;
}

export const useAuthStore = createStore<AuthState>()((set, _get) => ({
  status: 'init',
  session: null,
  email: null,
  lastError: null,

  signInWithPassword: async (email, password) => {
    const sb = getSupabase();
    if (!sb) { set({ status: 'error', lastError: 'not_configured' }); return; }
    set({ status: 'sending', lastError: null });
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    console.log('[auth] signIn response', {
      hasSession: !!data?.session,
      userId: data?.user?.id,
      error: error?.message,
    });
    if (error) {
      set({ status: 'error', lastError: error.message });
    }
  },

  signUpWithPassword: async (email, password) => {
    const sb = getSupabase();
    if (!sb) { set({ status: 'error', lastError: 'not_configured' }); return; }
    set({ status: 'sending', lastError: null });
    const emailRedirectTo = await buildRedirectUrl();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    console.log('[auth] signUp response', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      identitiesCount: data?.user?.identities?.length,
      emailConfirmedAt: data?.user?.email_confirmed_at,
      error: error?.message,
    });
    if (error) {
      set({ status: 'error', lastError: error.message });
      return;
    }
    if (data.session) {
      // Email confirmation disabled in Supabase — already signed in.
      // _setSession will be triggered by onAuthStateChange.
      return;
    }
    // Supabase quirk: when an email is ALREADY registered with confirmation
    // enabled, signUp returns data.user with identities: [] (no error) instead
    // of "user already exists". Treat that as a real error so the UI can react.
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      set({ status: 'error', lastError: 'User already registered' });
      return;
    }
    // Email confirmation enabled — user must open the verification link.
    set({ status: 'sent_signup' });
  },

  resendSignupConfirmation: async (email) => {
    const sb = getSupabase();
    if (!sb) { set({ status: 'error', lastError: 'not_configured' }); return; }
    set({ status: 'sending', lastError: null });
    const emailRedirectTo = await buildRedirectUrl();
    const { error } = await sb.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo },
    });
    console.log('[auth] resend signup', { email, error: error?.message });
    set(error ? { status: 'error', lastError: error.message } : { status: 'sent_signup' });
  },

  signInWithMagicLink: async (email) => {
    const sb = getSupabase();
    if (!sb) { set({ status: 'error', lastError: 'not_configured' }); return; }
    set({ status: 'sending', lastError: null });
    const emailRedirectTo = await buildRedirectUrl();
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo } });
    set(error ? { status: 'error', lastError: error.message } : { status: 'sent' });
  },

  signOut: async () => {
    const sb = getSupabase();
    await sb?.auth.signOut();
  },

  resetError: () => set({ status: 'signed_out', lastError: null }),

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

  const urlError = _detectUrlAuthError();
  if (urlError) {
    console.warn('[auth] URL error detected:', urlError);
    useAuthStore.setState({ status: 'error', lastError: urlError });
    _cleanAuthParams();
  }

  sb.auth.getSession().then(({ data }) => {
    if (data.session) {
      useAuthStore.getState()._setSession(data.session);
      _onSignedIn();
    } else if (!urlError) {
      useAuthStore.getState()._setSession(null);
    }
  });

  sb.auth.onAuthStateChange((_event, session) => {
    const prev = useAuthStore.getState().session;
    const wasInit = useAuthStore.getState().status === 'init';
    if (session || !urlError) {
      useAuthStore.getState()._setSession(session);
    }

    if (session && (!prev || wasInit)) {
      _cleanAuthParams();
      _onSignedIn();
    }
    if (!session && prev) {
      import('../lib/prediction-sync').then(({ stopSync }) => stopSync());
    }
  });
}

function _detectUrlAuthError(): string | null {
  const search = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#')
    ? new URLSearchParams(window.location.hash.slice(1))
    : null;
  const code = search.get('error_code') || hash?.get('error_code');
  const desc = search.get('error_description') || hash?.get('error_description');
  const err = search.get('error') || hash?.get('error');
  if (!code && !err) return null;
  const readable = desc ? desc.replace(/\+/g, ' ') : (err ?? code ?? 'auth_error');
  return code ? `${code}: ${readable}` : readable;
}

function _cleanAuthParams(): void {
  const url = new URL(window.location.href);
  let changed = false;
  for (const k of ['code', 'error', 'error_code', 'error_description']) {
    if (url.searchParams.has(k)) { url.searchParams.delete(k); changed = true; }
  }
  if (url.hash.includes('access_token') || url.hash.includes('error')) {
    // Si el hash mezcla tokens de auth con un enlace de invitación de liga,
    // guardamos el hash de invitación en sessionStorage antes de borrarlo.
    if (_isLeagueInviteHash(url.hash)) {
      try { sessionStorage.setItem(PENDING_INVITE_HASH_KEY, url.hash); } catch (_) { /* noop */ }
    }
    url.hash = '';
    changed = true;
  }
  if (!changed) return;
  const qs = url.searchParams.toString();
  history.replaceState(null, '', url.pathname + (qs ? '?' + qs : '') + url.hash);
}

/**
 * Recupera y borra el hash de invitación de liga guardado en sessionStorage.
 * Devuelve null si no había ninguno pendiente.
 */
export function popPendingInviteHash(): string | null {
  try {
    const val = sessionStorage.getItem(PENDING_INVITE_HASH_KEY);
    if (val) sessionStorage.removeItem(PENDING_INVITE_HASH_KEY);
    return val;
  } catch (_) {
    return null;
  }
}

function _onSignedIn() {
  import('../lib/prediction-sync').then(({ onSignedIn }) => onSignedIn());
  import('../lib/league-sync').then(({ onSignedIn: onLeagueSignedIn }) => onLeagueSignedIn());
}

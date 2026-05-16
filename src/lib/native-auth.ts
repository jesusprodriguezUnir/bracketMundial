import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { getSupabase } from './supabase-client';

const CUSTOM_SCHEME = 'com.jesusprodriguez.bracketmundial';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getNativeRedirectUrl(): string {
  return `${CUSTOM_SCHEME}://login`;
}

export function initNativeDeepLinks(): void {
  App.addListener('appUrlOpen', async ({ url }) => {
    const parsed = new URL(url);
    const code = parsed.searchParams.get('code');
    if (!code) return;

    const sb = getSupabase();
    if (!sb) return;

    await sb.auth.exchangeCodeForSession(code);
  });
}

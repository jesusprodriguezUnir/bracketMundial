import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

function initStatusBar(): void {
  if (!isNativePlatform()) return;
  StatusBar.setOverlaysWebView({ overlay: false });
  const isDark = document.documentElement.dataset.theme === 'dark';
  StatusBar.setBackgroundColor({ color: isDark ? '#231d3e' : '#1a1933' });
  StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
}

function initBackButton(): void {
  if (!isNativePlatform()) return;
  App.addListener('backButton', ({ canGoBack }) => {
    const modals = document.querySelectorAll('match-modal, share-modal, auth-modal, stadium-modal, leagues-modal');
    if (modals.length > 0) {
      const last = modals[modals.length - 1];
      last.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
      last.remove();
      return;
    }
    const moreOverlay = document.querySelector('bracket-view')?.shadowRoot?.querySelector('.more-overlay.open');
    if (moreOverlay) {
      const navEvent = new CustomEvent('close-more', { bubbles: true, composed: true });
      document.querySelector('bracket-view')?.dispatchEvent(navEvent);
      return;
    }
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}

function initSplashScreen(): void {
  if (!isNativePlatform()) return;
  SplashScreen.hide({ fadeOutDuration: 300 });
}

function initThemeObserver(): void {
  if (!isNativePlatform()) return;
  const observer = new MutationObserver(() => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    StatusBar.setBackgroundColor({ color: isDark ? '#231d3e' : '#1a1933' });
    StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

export function initNative(): void {
  if (!isNativePlatform()) return;
  initStatusBar();
  initBackButton();
  initSplashScreen();
  initThemeObserver();
}

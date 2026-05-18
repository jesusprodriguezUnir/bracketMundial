/**
 * Toast utility — dispatches a custom event that app-root listens for.
 * Usage: showToast(t('modal.saved'))
 */

export interface ToastEventDetail {
  message: string;
  duration?: number;
}

const TOAST_EVENT = 'bm-toast';

export function showToast(message: string, duration = 2200) {
  window.dispatchEvent(
    new CustomEvent<ToastEventDetail>(TOAST_EVENT, {
      detail: { message, duration },
    })
  );
}

export function onToast(handler: (e: CustomEvent<ToastEventDetail>) => void) {
  window.addEventListener(TOAST_EVENT, handler as EventListener);
  return () => window.removeEventListener(TOAST_EVENT, handler as EventListener);
}

/**
 * Haptic feedback — tries navigator.vibrate, falls back silently.
 * On iOS WebKit, vibrate is not supported, which is fine — the button
 * CSS :active state provides sufficient tactile feedback.
 */
export function lightTap() {
  try {
    navigator.vibrate?.(8);
  } catch {
    /* not supported */
  }
}

export function mediumTap() {
  try {
    navigator.vibrate?.(16);
  } catch {
    /* not supported */
  }
}

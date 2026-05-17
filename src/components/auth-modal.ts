import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAuthStore } from '../store/auth-store';
import type { AuthStatus } from '../store/auth-store';
import { t, useLocaleStore } from '../i18n';
import { retroButton } from '../styles/retro-button';

const RESEND_COOLDOWN = 60;

@customElement('auth-modal')
export class AuthModal extends LitElement {
  @state() private _status: AuthStatus = useAuthStore.getState().status;
  @state() private _email = '';
  @state() private _emailForDisplay = '';
  @state() private _resendCountdown = 0;

  private _unsubAuth?: () => void;
  private _unsubLocale?: () => void;
  private _resendTimer?: ReturnType<typeof setInterval>;

  static override styles = [retroButton, css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 25, 51, 0.85);
      padding: 20px;
    }

    .modal {
      background: var(--paper);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      padding: 12px 18px;
      background: var(--ink);
      color: var(--paper);
      gap: 12px;
      box-shadow: 4px 4px 0 0 var(--retro-orange);
    }
    .modal-title {
      font-family: var(--font-var);
      font-size: 16px;
      letter-spacing: 0.08em;
      color: var(--retro-yellow);
      flex: 1;
    }
    .modal-close {
      all: unset;
      cursor: pointer;
      color: var(--paper);
      font-size: 20px;
      opacity: 0.7;
      line-height: 1;
    }
    .modal-close:hover { opacity: 1; }

    .modal-body {
      padding: 24px 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .field-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      font-family: var(--font-body);
      font-size: 15px;
      border: 3px solid var(--ink);
      background: var(--paper-2);
      color: var(--ink);
      outline: none;
      box-shadow: 3px 3px 0 var(--ink);
    }
    .field-input:focus {
      border-color: var(--retro-orange);
      box-shadow: 3px 3px 0 var(--retro-orange);
    }

    .btn {
      all: unset;
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
      padding: 12px 18px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.08em;
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 var(--ink);
      text-align: center;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn:hover:not(:disabled) {
      transform: translate(-1px, -1px);
      box-shadow: 5px 5px 0 var(--ink);
    }
    .btn:active:not(:disabled) {
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0 var(--ink);
    }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary {
      background: var(--retro-orange);
      color: var(--paper);
    }
    .btn-secondary {
      background: var(--paper-2);
      color: var(--ink);
    }
    .btn-danger {
      background: var(--paper-2);
      color: var(--retro-red, #c0392b);
      border-color: var(--retro-red, #c0392b);
      box-shadow: 4px 4px 0 var(--retro-red, #c0392b);
    }

    .error-text {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-red, #c0392b);
      letter-spacing: 0.1em;
      border: 2px solid var(--retro-red, #c0392b);
      padding: 8px 12px;
    }

    .info-block {
      border: 3px solid var(--ink);
      background: var(--paper-2);
      padding: 16px;
      box-shadow: 4px 4px 0 var(--ink);
    }
    .info-title {
      font-family: var(--font-var);
      font-size: 15px;
      color: var(--ink);
      margin-bottom: 8px;
    }
    .info-text {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--dim);
      line-height: 1.5;
    }

    .signed-email {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.1em;
      padding: 0 0 4px;
      border-bottom: 2px solid var(--ink);
      margin-bottom: 4px;
    }
    .signed-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
  `];

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._close();
  };
  private readonly _handleHostClick = (e: MouseEvent) => {
    if (e.composedPath()[0] === this) this._close();
  };

  private _startY = 0;
  private _currentY = 0;
  private _isDragging = false;

  private readonly _handleTouchStart = (e: TouchEvent) => {
    if (this.scrollTop > 0) return;
    this._startY = e.touches[0].clientY;
    this._currentY = this._startY;
    this._isDragging = true;
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) modal.style.transition = 'none';
  };

  private readonly _handleTouchMove = (e: TouchEvent) => {
    if (!this._isDragging) return;
    this._currentY = e.touches[0].clientY;
    const deltaY = this._currentY - this._startY;
    if (deltaY > 0) {
      if (e.cancelable) e.preventDefault();
      const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
      if (modal) modal.style.transform = `translateY(${deltaY}px)`;
    } else {
      this._isDragging = false;
    }
  };

  private readonly _handleTouchEnd = () => {
    if (!this._isDragging) return;
    this._isDragging = false;
    const deltaY = this._currentY - this._startY;
    const modal = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.transition = 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
      if (deltaY > 120) {
        modal.style.transform = `translateY(100vh)`;
        setTimeout(() => this._close(), 200);
      } else {
        modal.style.transform = '';
      }
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
    this.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    this.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    this.addEventListener('touchend', this._handleTouchEnd);
    this.addEventListener('touchcancel', this._handleTouchEnd);
    this._unsubAuth = useAuthStore.subscribe(() => {
      this._status = useAuthStore.getState().status;
      this.requestUpdate();
    });
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._status = useAuthStore.getState().status;
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    this.removeEventListener('touchstart', this._handleTouchStart);
    this.removeEventListener('touchmove', this._handleTouchMove);
    this.removeEventListener('touchend', this._handleTouchEnd);
    this.removeEventListener('touchcancel', this._handleTouchEnd);
    this._unsubAuth?.();
    this._unsubLocale?.();
    if (this._resendTimer) clearInterval(this._resendTimer);
    super.disconnectedCallback();
  }

  private _close() {
    this.remove();
  }

  private _onEmailInput(e: Event) {
    this._email = (e.target as HTMLInputElement).value;
  }

  private async _submit(e: Event) {
    e.preventDefault();
    if (!this._email) return;
    this._emailForDisplay = this._email;
    await useAuthStore.getState().signInWithMagicLink(this._email);
    if (useAuthStore.getState().status === 'sent') {
      this._startResendCooldown();
    }
  }

  private async _resend() {
    await useAuthStore.getState().signInWithMagicLink(this._emailForDisplay);
    this._startResendCooldown();
  }

  private _startResendCooldown() {
    this._resendCountdown = RESEND_COOLDOWN;
    if (this._resendTimer) clearInterval(this._resendTimer);
    this._resendTimer = setInterval(() => {
      this._resendCountdown--;
      this.requestUpdate();
      if (this._resendCountdown <= 0) {
        clearInterval(this._resendTimer);
        this._resendTimer = undefined;
      }
    }, 1000);
  }

  private async _signOut() {
    await useAuthStore.getState().signOut();
    this._close();
  }

  override render() {
    return html`
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">${t('auth.title')}</div>
          <button class="modal-close" @click="${this._close}" aria-label="${t('auth.closeLabel')}">✕</button>
        </div>
        <div class="modal-body">
          ${this._renderBody()}
        </div>
      </div>
    `;
  }

  private _renderBody() {
    if (this._status === 'signed_in') {
      const email = useAuthStore.getState().email ?? '';
      return html`
        <div>
          <div class="signed-label">${t('account.signedInAs')}</div>
          <div class="signed-email">${email}</div>
        </div>
        <button class="btn btn-danger" @click="${this._signOut}">${t('account.signOut')}</button>
      `;
    }

    if (this._status === 'sent') {
      const canResend = this._resendCountdown <= 0;
      const resendLabel = canResend
        ? t('auth.resend')
        : t('auth.resendIn', { s: this._resendCountdown });
      return html`
        <div class="info-block">
          <div class="info-title">✉</div>
          <div class="info-text">
            ${t('auth.checkInbox', { email: this._emailForDisplay })}
          </div>
        </div>
        <button class="btn btn-secondary" ?disabled="${!canResend}" @click="${this._resend}">
          ${resendLabel}
        </button>
      `;
    }

    const isSending = this._status === 'sending';
    const hasError = this._status === 'error';
    const errorMsg = useAuthStore.getState().lastError;

    return html`
      <form @submit="${this._submit}">
        <div class="field-label">${t('auth.emailLabel')}</div>
        <input
          class="field-input"
          type="email"
          required
          autocomplete="email"
          placeholder="${t('auth.emailPlaceholder')}"
          .value="${this._email}"
          @input="${this._onEmailInput}"
          ?disabled="${isSending}"
        >
        ${hasError ? html`<div class="error-text">${errorMsg ?? t('auth.errorGeneric')}</div>` : ''}
        <br>
        <button class="btn btn-primary" type="submit" ?disabled="${isSending || !this._email}">
          ${isSending ? t('auth.sending') : t('auth.sendLink')}
        </button>
      </form>
    `;
  }
}

export function openAuthModal(): void {
  const existing = document.querySelector('auth-modal');
  if (existing) { existing.remove(); }
  const modal = document.createElement('auth-modal');
  document.body.appendChild(modal);
}

// -----------------------------------------------------------------------
// Sync conflict modal — returns a Promise resolved by user choice
// -----------------------------------------------------------------------

@customElement('sync-conflict-modal')
class SyncConflictModal extends LitElement {
  cloudDate = '';
  private _resolve?: (choice: 'cloud' | 'local') => void;

  static override styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1200;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 25, 51, 0.9);
      padding: 20px;
    }
    .modal {
      background: var(--paper);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      width: 100%;
      max-width: 380px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .title {
      font-family: var(--font-var);
      font-size: 15px;
      letter-spacing: 0.08em;
      color: var(--ink);
      border-bottom: 3px solid var(--retro-orange);
      padding-bottom: 8px;
    }
    .body {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--dim);
      line-height: 1.55;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn {
      all: unset;
      cursor: pointer;
      flex: 1;
      padding: 10px 12px;
      font-family: var(--font-var);
      font-size: 12px;
      letter-spacing: 0.06em;
      border: 3px solid var(--ink);
      box-shadow: 3px 3px 0 var(--ink);
      text-align: center;
      transition: transform 0.1s;
    }
    .btn:hover { transform: translate(-1px, -1px); }
    .btn-cloud { background: var(--retro-orange); color: var(--paper); }
    .btn-local { background: var(--paper-2); color: var(--ink); }
  `;

  setResolve(fn: (choice: 'cloud' | 'local') => void) {
    this._resolve = fn;
  }

  private _choose(choice: 'cloud' | 'local') {
    this._resolve?.(choice);
    this.remove();
  }

  override render() {
    return html`
      <div class="modal" role="dialog" aria-modal="true">
        <div class="title">${t('sync.conflictTitle')}</div>
        <div class="body">${t('sync.conflictBody', { date: this.cloudDate })}</div>
        <div class="actions">
          <button class="btn btn-cloud" @click="${() => this._choose('cloud')}">${t('sync.keepCloud')}</button>
          <button class="btn btn-local" @click="${() => this._choose('local')}">${t('sync.keepLocal')}</button>
        </div>
      </div>
    `;
  }
}

export function openSyncConflictModal(cloudDate: string): Promise<'cloud' | 'local'> {
  return new Promise((resolve) => {
    const existing = document.querySelector('sync-conflict-modal');
    if (existing) existing.remove();
    const modal = document.createElement('sync-conflict-modal') as SyncConflictModal;
    modal.cloudDate = cloudDate;
    modal.setResolve(resolve);
    document.body.appendChild(modal);
  });
}

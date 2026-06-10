import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { DragToDismissMixin } from '../mixins/drag-to-dismiss';
import { useAuthStore } from '../store/auth-store';
import type { AuthStatus } from '../store/auth-store';
import { t, useLocaleStore } from '../i18n';
import { retroButton } from '../styles/retro-button';

const RESEND_COOLDOWN = 60;

@customElement('auth-modal')
export class AuthModal extends DragToDismissMixin(LitElement) {
  @property({ type: String }) initialMode?: 'signin' | 'signup' | 'magic' | 'forgot_password' | 'reset_password';
  @state() private _status: AuthStatus = useAuthStore.getState().status;
  @state() private _mode: 'signin' | 'signup' | 'magic' | 'forgot_password' | 'reset_password' = 'signin';
  @state() private _email = '';
  @state() private _password = '';
  @state() private _currentPassword = '';
  @state() private _confirmPassword = '';
  @state() private _emailForDisplay = '';
  @state() private _resendCountdown = 0;
  @state() private _isVoluntaryChange = false;

  private _unsubAuth?: () => void;
  private _unsubLocale?: () => void;
  private _resendTimer?: ReturnType<typeof setInterval>;

  static override readonly styles = [retroButton, css`
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

    .toggle-link {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--ink);
      text-align: center;
      padding: 4px 0;
      letter-spacing: 0.04em;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .toggle-link:hover { color: var(--retro-orange); }

    .magic-link {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      text-align: center;
      padding: 4px 0;
      letter-spacing: 0.04em;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .magic-link:hover { color: var(--retro-orange); }

    .field-stack { display: flex; flex-direction: column; gap: 12px; }

    .success-text {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--retro-green, #2a8a3a);
      letter-spacing: 0.06em;
      border: 2px solid var(--retro-green, #2a8a3a);
      padding: 8px 12px;
    }
  `];

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._close();
  };
  private readonly _handleHostClick = (e: MouseEvent) => {
    if (e.composedPath()[0] === this) this._close();
  };

  override connectedCallback() {
    super.connectedCallback();
    if (this.initialMode) {
      this._mode = this.initialMode;
    }
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
    this._unsubAuth = useAuthStore.subscribe(() => {
      const prev = this._status;
      const next = useAuthStore.getState().status;
      this._status = next;
      // Cierre automático cuando se acaba de iniciar sesión correctamente.
      if (next === 'signed_in' && prev !== 'signed_in' && prev !== 'init') {
        if (this._mode === 'reset_password') {
          import('../lib/interaction').then(({ showToast }) => {
            const locale = useLocaleStore.getState().locale;
            showToast(locale === 'es' ? 'Contraseña actualizada con éxito' : 'Password updated successfully');
          });
        }
        setTimeout(() => this._close(), 350);
        return;
      }
      this.requestUpdate();
    });
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._status = useAuthStore.getState().status;
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
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

  private _onPasswordInput(e: Event) {
    this._password = (e.target as HTMLInputElement).value;
  }

  private _onCurrentPasswordInput(e: Event) {
    this._currentPassword = (e.target as HTMLInputElement).value;
  }

  private _onConfirmPasswordInput(e: Event) {
    this._confirmPassword = (e.target as HTMLInputElement).value;
  }

  private _switchMode(mode: 'signin' | 'signup' | 'magic' | 'forgot_password' | 'reset_password') {
    this._mode = mode;
    useAuthStore.getState().resetError();
  }

  private async _submit(e: Event) {
    e.preventDefault();
    const auth = useAuthStore.getState();

    if (this._mode === 'reset_password') {
      if (auth.isRecoveringPassword) {
        if (!this._password) return;
        await auth.updatePassword(this._password);
      } else if (this._isVoluntaryChange) {
        if (!this._currentPassword || !this._password || !this._confirmPassword) return;
        if (this._password !== this._confirmPassword) {
          useAuthStore.setState({ status: 'error', lastError: 'password_mismatch' });
          return;
        }
        await auth.changePassword(this._currentPassword, this._password);
      }
      return;
    }

    if (!this._email) return;
    this._emailForDisplay = this._email;

    if (this._mode === 'forgot_password') {
      await auth.sendPasswordResetEmail(this._email);
      return;
    }

    if (this._mode === 'magic') {
      await auth.signInWithMagicLink(this._email);
      const st = useAuthStore.getState().status;
      if (st === 'sent' || st === 'sent_signup') {
        this._startResendCooldown();
      }
      return;
    }
    if (!this._password) return;
    if (this._mode === 'signup') {
      await auth.signUpWithPassword(this._email, this._password);
      const st = useAuthStore.getState().status;
      if (st === 'sent' || st === 'sent_signup') {
        this._startResendCooldown();
      }
      return;
    }
    await auth.signInWithPassword(this._email, this._password);
  }

  private async _resend() {
    const auth = useAuthStore.getState();
    if (this._status === 'sent_signup' || this._mode === 'signup') {
      await auth.resendSignupConfirmation(this._emailForDisplay);
    } else {
      await auth.signInWithMagicLink(this._emailForDisplay);
    }
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
      const storeState = useAuthStore.getState();
      const email = storeState.email ?? '';
      const isRecoveringFromEmail = storeState.isRecoveringPassword;
      const isVoluntaryChange = this._isVoluntaryChange && this._mode === 'reset_password';
      const showPasswordForm = isRecoveringFromEmail || isVoluntaryChange;

      if (showPasswordForm) {
        const storeStatus = useAuthStore.getState().status;
        const isSending = storeStatus === 'sending';
        const hasError = storeStatus === 'error';
        const errorMsg = this._friendlyError(useAuthStore.getState().lastError);

        if (isRecoveringFromEmail) {
          return html`
            <form @submit="${this._submit}" class="field-stack">
              <div class="signed-label">${t('auth.resetPasswordTitle')}</div>
              <div class="signed-email">${email}</div>

              <div>
                <div class="field-label">${t('auth.newPasswordLabel')}</div>
                <input
                  class="field-input"
                  type="password"
                  required
                  minlength="6"
                  placeholder="${t('auth.newPasswordPlaceholder')}"
                  .value="${this._password}"
                  @input="${this._onPasswordInput}"
                  ?disabled="${isSending}"
                >
              </div>

              ${hasError ? html`<div class="error-text">${errorMsg}</div>` : ''}

              <button class="btn btn-primary" type="submit" ?disabled="${isSending || !this._password}">
                ${isSending ? t('auth.updatingPassword') : t('auth.updatePassword')}
              </button>

              <button type="button" class="toggle-link" @click="${() => {
                useAuthStore.setState({ isRecoveringPassword: false });
                this._switchMode('signin');
              }}">
                ${t('auth.closeLabel')}
              </button>
            </form>
          `;
        }

        return html`
          <form @submit="${this._submit}" class="field-stack">
            <div class="signed-label">${t('auth.resetPasswordTitle')}</div>
            <div class="signed-email">${email}</div>

            <div>
              <div class="field-label">${t('auth.currentPasswordLabel')}</div>
              <input
                class="field-input"
                type="password"
                required
                minlength="6"
                autocomplete="current-password"
                placeholder="${t('auth.currentPasswordPlaceholder')}"
                .value="${this._currentPassword}"
                @input="${this._onCurrentPasswordInput}"
                ?disabled="${isSending}"
              >
            </div>

            <div>
              <div class="field-label">${t('auth.newPasswordLabel')}</div>
              <input
                class="field-input"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="${t('auth.newPasswordPlaceholder')}"
                .value="${this._password}"
                @input="${this._onPasswordInput}"
                ?disabled="${isSending}"
              >
            </div>

            <div>
              <div class="field-label">${t('auth.confirmPasswordLabel')}</div>
              <input
                class="field-input"
                type="password"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="${t('auth.confirmPasswordPlaceholder')}"
                .value="${this._confirmPassword}"
                @input="${this._onConfirmPasswordInput}"
                ?disabled="${isSending}"
              >
            </div>

            ${hasError ? html`<div class="error-text">${errorMsg}</div>` : ''}

            <button class="btn btn-primary" type="submit" ?disabled="${isSending || !this._currentPassword || !this._password || !this._confirmPassword}">
              ${isSending ? t('auth.updatingPassword') : t('auth.updatePassword')}
            </button>

            <button type="button" class="toggle-link" @click="${() => {
              this._isVoluntaryChange = false;
              this._currentPassword = '';
              this._confirmPassword = '';
              useAuthStore.setState({ lastError: null });
              this.requestUpdate();
            }}">
              ${t('auth.closeLabel')}
            </button>
          </form>
        `;
      }

      return html`
        <div>
          <div class="signed-label">${t('account.signedInAs')}</div>
          <div class="signed-email">${email}</div>
        </div>
        <button class="btn btn-secondary" @click="${() => {
          this._isVoluntaryChange = true;
          this._mode = 'reset_password';
          this._currentPassword = '';
          this._password = '';
          this._confirmPassword = '';
          useAuthStore.setState({ lastError: null });
          this.requestUpdate();
        }}">${t('auth.updatePassword')}</button>
        <button class="btn btn-danger" @click="${this._signOut}">${t('account.signOut')}</button>
      `;
    }

    if (this._status === 'sent' || this._status === 'sent_signup' || this._status === 'sent_password_reset') {
      const canResend = this._resendCountdown <= 0;
      const resendLabel = canResend
        ? t('auth.resend')
        : t('auth.resendIn', { s: this._resendCountdown });
      const isSignup = this._status === 'sent_signup';
      const isReset = this._status === 'sent_password_reset';
      const bodyMsg = isReset
        ? t('auth.checkInboxReset', { email: this._emailForDisplay })
        : isSignup
        ? t('auth.checkInboxSignup', { email: this._emailForDisplay })
        : t('auth.checkInbox', { email: this._emailForDisplay });
      return html`
        <div class="info-block">
          <div class="info-title">✉</div>
          <div class="info-text">
            ${bodyMsg}
          </div>
        </div>
        ${isReset ? '' : html`
          <button class="btn btn-secondary" ?disabled="${!canResend}" @click="${this._resend}">
            ${resendLabel}
          </button>
        `}
        <button class="toggle-link" @click="${() => this._switchMode('signin')}">${t('auth.toggleToSignIn')}</button>
      `;
    }

    const isSending = this._status === 'sending';
    const hasError = this._status === 'error';
    const errorMsg = this._friendlyError(useAuthStore.getState().lastError);
    const isMagic = this._mode === 'magic';
    const isSignUp = this._mode === 'signup';
    const isForgot = this._mode === 'forgot_password';

    const submitDisabled = isSending
      || !this._email
      || (!isMagic && !isForgot && !this._password);
    const submitLabel = isSending
      ? (isForgot ? t('auth.sending') : isMagic ? t('auth.sending') : isSignUp ? t('auth.signingUp') : t('auth.signingIn'))
      : (isForgot ? t('auth.sendResetLink') : isMagic ? t('auth.sendLink') : isSignUp ? t('auth.signUp') : t('auth.signIn'));

    return html`
      <form @submit="${this._submit}" class="field-stack">
        <div>
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
        </div>

        ${(isMagic || isForgot) ? '' : html`
          <div>
            <div class="field-label">${t('auth.passwordLabel')}</div>
            <input
              class="field-input"
              type="password"
              required
              minlength="6"
              autocomplete="${isSignUp ? 'new-password' : 'current-password'}"
              placeholder="${t('auth.passwordPlaceholder')}"
              .value="${this._password}"
              @input="${this._onPasswordInput}"
              ?disabled="${isSending}"
            >
          </div>
        `}

        ${hasError ? html`<div class="error-text">${errorMsg}</div>` : ''}

        <button class="btn btn-primary" type="submit" ?disabled="${submitDisabled}">
          ${submitLabel}
        </button>

        ${isForgot
          ? html`
              <button type="button" class="toggle-link" @click="${() => this._switchMode('signin')}">
                ${t('auth.toggleToSignIn')}
              </button>
            `
          : isMagic
          ? html`
              <button type="button" class="toggle-link" @click="${() => this._switchMode('signin')}">
                ${t('auth.toggleToSignIn')}
              </button>
            `
          : html`
              <button type="button" class="toggle-link" @click="${() => this._switchMode(isSignUp ? 'signin' : 'signup')}">
                ${isSignUp ? t('auth.toggleToSignIn') : t('auth.toggleToSignUp')}
              </button>
              <button type="button" class="toggle-link" @click="${() => this._switchMode('forgot_password')}">
                ${t('auth.forgotPasswordLink')}
              </button>
              <button type="button" class="magic-link" @click="${() => this._switchMode('magic')}">
                ${t('auth.magicLinkLink')}
              </button>
            `}
      </form>
    `;
  }

  private _friendlyError(raw: string | null): string {
    if (!raw) return t('auth.errorGeneric');
    const lower = raw.toLowerCase();
    if (lower.includes('invalid login') || lower.includes('invalid credentials') || lower.includes('email not confirmed')) {
      return t('auth.errorInvalidCredentials');
    }
    if (lower.includes('already registered') || lower.includes('already exists') || lower.includes('user already')) {
      return t('auth.errorEmailTaken');
    }
    if (lower.includes('password') && (lower.includes('short') || lower.includes('6 characters') || lower.includes('weak'))) {
      return t('auth.errorWeakPassword');
    }
    if (lower.includes('otp_expired') || lower.includes('link is invalid') || lower.includes('link has expired')) {
      return t('auth.errorOtpExpired');
    }
    if (lower.includes('access_denied')) {
      return t('auth.errorOtpExpired');
    }
    if (lower === 'not_configured') return t('auth.notConfigured');
    if (lower === 'password_mismatch') return t('auth.errorPasswordMismatch');
    if (lower === 'invalid_current_password') return t('auth.errorInvalidCurrentPassword');
    if (lower.includes('new password should be different')) return t('auth.errorSamePassword');
    return raw;
  }
}

export function openAuthModal(initialMode?: 'signin' | 'signup' | 'magic' | 'forgot_password' | 'reset_password'): void {
  const existing = document.querySelector('auth-modal');
  if (existing) { existing.remove(); }
  const modal = document.createElement('auth-modal') as AuthModal;
  if (initialMode) {
    modal.initialMode = initialMode;
  }
  document.body.appendChild(modal);
}

// -----------------------------------------------------------------------
// Sync conflict modal — returns a Promise resolved by user choice
// -----------------------------------------------------------------------

type SyncConflictChoice = 'cloud' | 'local' | 'dismissed';

@customElement('sync-conflict-modal')
class SyncConflictModal extends LitElement {
  cloudDate = '';
  private _resolve?: (choice: SyncConflictChoice) => void;
  private _isSettled = false;

  private readonly _handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this._dismiss();
  };
  private readonly _handleHostClick = (event: MouseEvent) => {
    if (event.composedPath()[0] === this) this._dismiss();
  };

  static override readonly styles = css`
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

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    if (!this._isSettled) {
      this._settle('dismissed');
    }
    super.disconnectedCallback();
  }

  setResolve(fn: (choice: SyncConflictChoice) => void) {
    this._resolve = fn;
  }

  private _settle(choice: SyncConflictChoice) {
    if (this._isSettled) return;
    this._isSettled = true;
    this._resolve?.(choice);
  }

  private _dismiss() {
    this._settle('dismissed');
    this.remove();
  }

  private _choose(choice: 'cloud' | 'local') {
    this._settle(choice);
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

export function openSyncConflictModal(cloudDate: string): Promise<SyncConflictChoice> {
  return new Promise((resolve) => {
    const existing = document.querySelector('sync-conflict-modal');
    if (existing) existing.remove();
    const modal = document.createElement('sync-conflict-modal') as SyncConflictModal;
    modal.cloudDate = cloudDate;
    modal.setResolve(resolve);
    document.body.appendChild(modal);
  });
}

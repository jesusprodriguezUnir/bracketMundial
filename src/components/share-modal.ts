import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useTournamentStore } from '../store/tournament-store';
import { t, useLocaleStore } from '../i18n';
import {
  generateBracketImage,
  buildShareText,
  canShareImage,
  shareImageNative,
  shareToInstagram,
  openTwitterIntent,
  openWhatsAppIntent,
  openFacebookShare,
  downloadBlob,
} from '../lib/share-image';
import './share-card';

@customElement('share-modal')
export class ShareModal extends LitElement {
  @state() private _status: 'generating' | 'ready' | 'error' = 'generating';
  @state() private _previewUrl = '';
  @state() private _copied = false;
  @state() private _copiedLink = false;
  @state() private _igDownloaded = false;

  private _blob: Blob | null = null;
  private _shareText = '';
  private _shareUrl = '';
  private _unsubscribeLocale?: () => void;

  static override styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 25, 51, 0.8);
      padding: 20px;
      overflow: auto;
    }

    .modal {
      background: var(--paper);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      max-width: 760px;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: calc(100dvh - 40px);
    }

    /* Header */
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
      font-family: var(--font-var);
      font-size: 20px;
      opacity: 0.7;
      line-height: 1;
    }
    .modal-close:hover { opacity: 1; }

    /* Body */
    .modal-body {
      padding: 20px 20px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }

    /* Preview */
    .preview-wrap {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-lg);
      background: var(--paper-3);
      min-height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .preview-wrap img {
      display: block;
      width: 100%;
      height: auto;
    }
    .spinner-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 40px;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--ink);
      border-top-color: var(--retro-orange);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner-label {
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.2em;
      color: var(--dim);
      text-transform: uppercase;
    }
    .error-wrap {
      padding: 32px;
      text-align: center;
    }
    .error-text {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--retro-red);
      letter-spacing: 0.1em;
    }

    /* Share text block */
    .share-text-block {
      border: 2px solid var(--ink);
      background: var(--paper-2);
      padding: 10px 14px;
    }
    .share-text-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .share-text-content {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--ink);
      white-space: pre-wrap;
      line-height: 1.5;
    }

    /* Actions */
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px 20px 20px;
    }
    .btn-share {
      all: unset;
      cursor: pointer;
      padding: 10px 18px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.06em;
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      color: var(--ink);
      display: flex;
      align-items: center;
      gap: 7px;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn-share:hover {
      transform: translate(-1px, -1px);
      box-shadow: var(--shadow-hard-md);
    }
    .btn-share:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 0 var(--ink);
    }
    .btn-share.primary {
      background: var(--retro-orange);
      color: var(--paper);
    }
    .btn-share.twitter    { background: #1da1f2; color: #fff; }
    .btn-share.whatsapp   { background: #25d366; color: #fff; }
    .btn-share.facebook   { background: #1877f2; color: #fff; }
    .btn-share.instagram  { background: linear-gradient(45deg,#f09433,#e6683c,#dc2743,#bc1888); color: #fff; }
    .btn-share.tiktok     { background: #000000; color: #fff; }
    .btn-share.copied   { background: var(--retro-green); color: var(--paper); }
    .btn-share:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

    /* Instagram hint */
    .ig-hint {
      padding: 0 20px 16px;
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.1em;
    }

    /* Off-screen capture node */
    .offscreen {
      position: fixed;
      left: -99999px;
      top: 0;
      pointer-events: none;
    }
  `;

  private readonly _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') this._close();
  };
  private readonly _handleHostClick = (e: MouseEvent) => {
    if (e.composedPath()[0] === this) this._close();
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeydown);
    this.addEventListener('click', this._handleHostClick);
    this._unsubscribeLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._generate();
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    this._unsubscribeLocale?.();
    if (this._previewUrl) URL.revokeObjectURL(this._previewUrl);
    super.disconnectedCallback();
  }

  private async _generate() {
    this._status = 'generating';
    try {
      await this.updateComplete;
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      const card = this.shadowRoot?.querySelector<HTMLElement>('share-card');
      if (!card) throw new Error('share-card not found');

      const state = useTournamentStore.getState();
      const { buildShareUrl } = await import('../lib/bracket-codec');
      this._shareUrl = buildShareUrl(state.groupMatches, state.knockoutMatches);

      const blob = await generateBracketImage(card);
      this._blob = blob;
      if (this._previewUrl) URL.revokeObjectURL(this._previewUrl);
      this._previewUrl = URL.createObjectURL(blob);
      this._shareText = buildShareText(state.knockoutMatches, this._shareUrl);
      this._status = 'ready';
    } catch (_err) {
      this._status = 'error';
    }
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    this.remove();
  }

  private async _download() {
    if (!this._blob) return;
    downloadBlob(this._blob, 'bracket-mundial-2026.png');
  }

  private async _nativeShare() {
    if (!this._blob) return;
    await shareImageNative(this._blob, this._shareText);
  }

  private _twitter() {
    openTwitterIntent(this._shareText, this._shareUrl || undefined);
  }

  private _whatsapp() {
    openWhatsAppIntent(this._shareText);
  }

  private _facebook() {
    if (this._shareUrl) openFacebookShare(this._shareUrl);
  }

  private async _instagram() {
    if (!this._blob) return;
    const result = await shareToInstagram(this._blob, this._shareText);
    if (result === 'downloaded') this._igDownloaded = true;
  }

  private async _tiktok() {
    if (!this._blob) return;
    downloadBlob(this._blob, 'bracket-mundial-2026.png');
    this._igDownloaded = true; // Reutilizamos el flag de descarga para mostrar el hint
  }

  private async _copyText() {
    try {
      await navigator.clipboard.writeText(this._shareText);
      this._copied = true;
      setTimeout(() => { this._copied = false; }, 2000);
    } catch { /* clipboard unavailable */ }
  }

  private async _copyLink() {
    try {
      let url = this._shareUrl;
      if (!url) {
        const { buildShareUrl } = await import('../lib/bracket-codec');
        const state = useTournamentStore.getState();
        url = buildShareUrl(state.groupMatches, state.knockoutMatches);
      }
      await navigator.clipboard.writeText(url);
      this._copiedLink = true;
      setTimeout(() => { this._copiedLink = false; }, 2000);
    } catch { /* clipboard unavailable */ }
  }

  override render() {
    const hasNativeImageShare = canShareImage();
    const isReady = this._status === 'ready';

    return html`
      <!-- off-screen capture target -->
      <div class="offscreen">
        <share-card></share-card>
      </div>

      <div class="modal" role="dialog" aria-modal="true" aria-label="${t('share.ariaLabel')}">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">${t('share.title')}</div>
          <button class="modal-close" @click="${this._close}" aria-label="${t('share.closeLabel')}">✕</button>
        </div>

        <!-- Preview -->
        <div class="modal-body">
          <div class="preview-wrap">
            ${this._status === 'generating' ? html`
              <div class="spinner-wrap">
                <div class="spinner"></div>
                <div class="spinner-label">${t('share.generating')}</div>
              </div>` : ''}
            ${this._status === 'error' ? html`
              <div class="error-wrap">
                <div class="error-text">${t('share.error').replace('\n', '<br>')}</div>
              </div>` : ''}
            ${this._status === 'ready' ? html`
              <img src="${this._previewUrl}" alt="${t('share.preview')}">` : ''}
          </div>

          ${isReady ? html`
            <div class="share-text-block">
              <div class="share-text-label">${t('share.textLabel')}</div>
              <div class="share-text-content">${this._shareText}</div>
            </div>` : ''}
        </div>

        <!-- Actions -->
        <div class="actions">

          ${hasNativeImageShare
            ? html`
              <!-- Móvil: compartir imagen real por el share sheet del sistema -->
              <button class="btn-share primary" ?disabled="${!isReady}" @click="${this._nativeShare}" aria-label="${t('share.shareImageLabel')}">
                ${t('share.shareImage')}
              </button>
              <button class="btn-share" ?disabled="${!isReady}" @click="${this._download}" aria-label="${t('share.downloadLabel')}">
                ${t('share.download')}
              </button>`
            : html`
              <!-- Escritorio: descargar primero, luego adjuntar manualmente -->
              <button class="btn-share primary" ?disabled="${!isReady}" @click="${this._download}" aria-label="${t('share.downloadLabel')}">
                ${t('share.download')}
              </button>`}

          <button class="btn-share ${this._copied ? 'copied' : ''}" ?disabled="${!isReady}" @click="${this._copyText}" aria-label="${t('share.copyTextLabel')}">
            ${this._copied ? t('share.copied') : t('share.copyText')}
          </button>
          <button class="btn-share ${this._copiedLink ? 'copied' : ''}" @click="${this._copyLink}" aria-label="${t('share.copyLinkLabel')}">
            ${this._copiedLink ? t('share.linkCopied') : t('share.copyLink')}
          </button>
        </div>

        ${!hasNativeImageShare ? html`
          <div class="ig-hint">${t('share.desktopHint')}</div>` : ''}

        <!-- Botones de red: enlace + texto -->
        <div class="actions" style="padding-top:0; border-top: 1px solid var(--ink-20, rgba(26,25,51,0.15));">
          <div style="width:100%; font-family:var(--font-mono); font-size:9px; color:var(--dim); letter-spacing:0.18em; text-transform:uppercase; padding-bottom:4px;">
            ${t('share.networksLabel')}
          </div>
          <button class="btn-share twitter" ?disabled="${!isReady}" @click="${this._twitter}" aria-label="${t('share.twitterLabel')}">
            ${t('share.twitter')}
          </button>
          <button class="btn-share whatsapp" ?disabled="${!isReady}" @click="${this._whatsapp}" aria-label="${t('share.whatsappLabel')}">
            ${t('share.whatsapp')}
          </button>
          <button class="btn-share facebook" ?disabled="${!isReady}" @click="${this._facebook}" aria-label="${t('share.facebookLabel')}">
            ${t('share.facebook')}
          </button>
          <button class="btn-share instagram" ?disabled="${!isReady}" @click="${this._instagram}" aria-label="${t('share.instagramLabel')}">
            ${t('share.instagram')}
          </button>
          <button class="btn-share tiktok" ?disabled="${!isReady}" @click="${this._tiktok}" aria-label="${t('share.tiktokLabel')}">
            ${t('share.tiktok')}
          </button>
        </div>

        <div class="ig-hint">
          ${this._igDownloaded ? t('share.igDownloaded') : t('share.igHint')}
        </div>
      </div>
    `;
  }
}

export function openShareModal(): void {
  const existing = document.querySelector('share-modal');
  if (existing) { existing.remove(); }
  const modal = document.createElement('share-modal');
  document.body.appendChild(modal);
}

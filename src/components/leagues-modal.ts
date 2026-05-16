import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useAuthStore } from '../store/auth-store';
import { useLeaguesStore } from '../store/leagues-store';
import type { League, LeaderboardEntry } from '../store/leagues-store';
import { t, useLocaleStore } from '../i18n';
import { buildInviteUrl } from '../lib/league-invite';

type ModalView = 'nickname' | 'list' | 'create' | 'join' | 'detail';

@customElement('leagues-modal')
export class LeaguesModal extends LitElement {
  @state() private _view: ModalView = 'list';
  @state() private _nickname = '';
  @state() private _leagueName = '';
  @state() private _joinCode = '';
  @state() private _linkCopied = false;
  @state() private _confirmAction: 'leave' | 'delete' | null = null;
  @state() private _displayName: string | null = null;
  @state() private _myLeagues: League[] = [];
  @state() private _activeLeague: League | null = null;
  @state() private _members = useLeaguesStore.getState().members;
  @state() private _status = useLeaguesStore.getState().status;
  @state() private _error: string | null = null;
  @state() private _pendingJoinCode: string | null = null;
  @state() private _leaderboard: LeaderboardEntry[] = [];
  @state() private _leaderboardLoading = false;

  private _unsubLeagues?: () => void;
  private _unsubLocale?: () => void;
  private _unsubAuth?: () => void;

  static override styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(26, 25, 51, 0.85);
      padding: 20px;
      overflow: auto;
    }

    .modal {
      background: var(--paper);
      border: 4px solid var(--ink);
      box-shadow: var(--shadow-hard-xl);
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-height: calc(100dvh - 40px);
    }

    .modal-header {
      display: flex;
      align-items: center;
      padding: 12px 18px;
      background: var(--ink);
      color: var(--paper);
      gap: 12px;
      box-shadow: 4px 4px 0 0 var(--retro-orange);
      flex-shrink: 0;
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
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      overflow-y: auto;
    }

    .field-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .field-hint {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.1em;
      margin-top: 4px;
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
      padding: 11px 18px;
      font-family: var(--font-var);
      font-size: 13px;
      letter-spacing: 0.08em;
      border: 3px solid var(--ink);
      box-shadow: 4px 4px 0 var(--ink);
      text-align: center;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .btn:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--ink); }
    .btn:active:not(:disabled) { transform: translate(1px,1px); box-shadow: 2px 2px 0 var(--ink); }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary { background: var(--retro-orange); color: var(--paper); }
    .btn-secondary { background: var(--paper-2); color: var(--ink); }
    .btn-danger {
      background: var(--paper-2);
      color: var(--retro-red, #c0392b);
      border-color: var(--retro-red, #c0392b);
      box-shadow: 4px 4px 0 var(--retro-red, #c0392b);
    }
    .btn-sm {
      padding: 7px 14px;
      font-size: 11px;
      box-shadow: 3px 3px 0 var(--ink);
    }
    .btn-sm:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--ink); }
    .btn-copied { background: var(--retro-green); color: var(--paper); }

    .btn-back {
      all: unset;
      cursor: pointer;
      font-family: var(--font-mono);
      font-size: 10px;
      letter-spacing: 0.1em;
      color: var(--dim);
      text-decoration: underline;
      align-self: flex-start;
    }
    .btn-back:hover { color: var(--ink); }

    .btn-row {
      display: flex;
      gap: 10px;
    }

    .error-text {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--retro-red, #c0392b);
      letter-spacing: 0.1em;
      border: 2px solid var(--retro-red, #c0392b);
      padding: 8px 12px;
    }

    .league-list { display: flex; flex-direction: column; gap: 8px; }
    .league-item {
      border: 2px solid var(--ink);
      background: var(--paper-2);
      padding: 10px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.1s;
    }
    .league-item:hover { background: var(--paper-3); }
    .league-name {
      font-family: var(--font-var);
      font-size: 14px;
      color: var(--ink);
      letter-spacing: 0.05em;
    }
    .league-code {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
    }
    .league-chevron { color: var(--dim); font-size: 14px; }

    .members-list { display: flex; flex-direction: column; gap: 6px; }
    .member-item {
      border: 2px solid var(--ink);
      background: var(--paper-2);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .member-name {
      font-family: var(--font-var);
      font-size: 13px;
      color: var(--ink);
    }
    .member-owner {
      font-family: var(--font-mono);
      font-size: 8px;
      color: var(--retro-orange);
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .detail-section-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--dim);
      letter-spacing: 0.2em;
      text-transform: uppercase;
      border-bottom: 2px solid var(--ink);
      padding-bottom: 4px;
    }

    .invite-block {
      border: 2px solid var(--ink);
      background: var(--paper-3);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .invite-code {
      font-family: var(--font-mono);
      font-size: 14px;
      letter-spacing: 0.2em;
      color: var(--ink);
    }

    .confirm-block {
      border: 3px solid var(--retro-red, #c0392b);
      background: var(--paper-2);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .confirm-text {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--ink);
      line-height: 1.5;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid var(--ink);
      border-top-color: var(--retro-orange);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-text {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--dim);
      text-align: center;
      padding: 20px 0;
      line-height: 1.5;
    }

    .leaderboard-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-mono);
      font-size: 11px;
    }
    .leaderboard-table th {
      background: var(--ink);
      color: var(--paper);
      padding: 5px 8px;
      text-align: left;
      letter-spacing: 0.12em;
      font-size: 9px;
    }
    .leaderboard-table td {
      padding: 6px 8px;
      border-bottom: 1px solid var(--ink);
      background: var(--paper-2);
    }
    .leaderboard-table tr:nth-child(even) td { background: var(--paper-3, var(--paper-2)); }
    .lb-rank { color: var(--dim); width: 24px; }
    .lb-name { font-family: var(--font-var); font-size: 12px; color: var(--ink); }
    .lb-pts { font-weight: bold; color: var(--retro-orange); text-align: right; }
    .lb-gold { color: var(--retro-yellow, gold); font-weight: bold; }
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
    this._unsubLocale = useLocaleStore.subscribe(() => this.requestUpdate());
    this._unsubAuth = useAuthStore.subscribe(() => this.requestUpdate());
    this._unsubLeagues = useLeaguesStore.subscribe(() => {
      const s = useLeaguesStore.getState();
      this._displayName = s.displayName;
      this._myLeagues = s.myLeagues;
      this._members = s.members;
      this._leaderboard = s.leaderboard;
      this._status = s.status;
      if (s.lastError) this._error = s.lastError;
      this.requestUpdate();
    });
    const s = useLeaguesStore.getState();
    this._displayName = s.displayName;
    this._myLeagues = s.myLeagues;
    this._members = s.members;
    this._leaderboard = s.leaderboard;
    this._status = s.status;

    if (!useAuthStore.getState().session) {
      this._view = 'list';
    } else if (!this._displayName) {
      this._view = 'nickname';
    } else {
      this._view = 'list';
    }
  }

  override disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeydown);
    this.removeEventListener('click', this._handleHostClick);
    this._unsubLeagues?.();
    this._unsubLocale?.();
    this._unsubAuth?.();
    super.disconnectedCallback();
  }

  setPendingJoinCode(code: string) {
    this._pendingJoinCode = code;
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    this.remove();
  }

  private async _openAuthModal() {
    const { openAuthModal } = await import('./auth-modal');
    openAuthModal();
  }

  private async _saveNickname() {
    if (this._nickname.length < 2) return;
    await useLeaguesStore.getState().setDisplayName(this._nickname);
    if (useLeaguesStore.getState().status !== 'error') {
      if (this._pendingJoinCode) {
        await this._doJoin(this._pendingJoinCode);
      } else {
        this._view = 'list';
      }
    }
  }

  private async _doJoin(code: string) {
    const league = await useLeaguesStore.getState().joinByCode(code);
    if (league) {
      this._pendingJoinCode = null;
      this._joinCode = '';
      this._activeLeague = league;
      this._view = 'detail';
      this._leaderboardLoading = true;
      await Promise.all([
        useLeaguesStore.getState().loadMembers(league.id),
        useLeaguesStore.getState().loadLeaderboard(league.id),
      ]);
      this._leaderboardLoading = false;
    }
  }

  private async _createLeague() {
    if (!this._leagueName.trim()) return;
    const league = await useLeaguesStore.getState().createLeague(this._leagueName.trim());
    if (league) {
      this._leagueName = '';
      this._activeLeague = league;
      this._view = 'detail';
      this._leaderboardLoading = true;
      await Promise.all([
        useLeaguesStore.getState().loadMembers(league.id),
        useLeaguesStore.getState().loadLeaderboard(league.id),
      ]);
      this._leaderboardLoading = false;
    }
  }

  private async _joinLeague() {
    if (!this._joinCode.trim()) return;
    await this._doJoin(this._joinCode);
  }

  private async _openLeague(league: League) {
    this._activeLeague = league;
    useLeaguesStore.getState().setActiveLeague(league.id);
    this._view = 'detail';
    this._leaderboardLoading = true;
    await Promise.all([
      useLeaguesStore.getState().loadMembers(league.id),
      useLeaguesStore.getState().loadLeaderboard(league.id),
    ]);
    this._leaderboardLoading = false;
  }

  private async _copyInviteLink() {
    if (!this._activeLeague) return;
    await navigator.clipboard.writeText(buildInviteUrl(this._activeLeague.code));
    this._linkCopied = true;
    setTimeout(() => { this._linkCopied = false; }, 2000);
  }

  private async _confirm(action: 'leave' | 'delete') {
    if (!this._activeLeague) return;
    if (action === 'leave') {
      await useLeaguesStore.getState().leaveLeague(this._activeLeague.id);
    } else {
      await useLeaguesStore.getState().deleteLeague(this._activeLeague.id);
    }
    if (useLeaguesStore.getState().status !== 'error') {
      this._activeLeague = null;
      this._confirmAction = null;
      this._view = 'list';
    }
  }

  override render() {
    return html`
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">${t('leagues.title')}</div>
          <button class="modal-close" @click="${this._close}" aria-label="${t('leagues.closeLabel')}">✕</button>
        </div>
        <div class="modal-body">
          ${this._renderView()}
        </div>
      </div>
    `;
  }

  private _renderView() {
    const isLoading = this._status === 'loading';
    const { session, status: authStatus } = useAuthStore.getState();

    if (authStatus === 'init') {
      return html`<div class="empty-text"><span class="spinner"></span></div>`;
    }

    if (!session) {
      return html`
        <p class="empty-text">${t('leagues.notSignedIn')}</p>
        <button class="btn btn-primary" @click="${this._openAuthModal}">${t('auth.sendLink')}</button>
      `;
    }

    if (this._view === 'nickname') return this._renderNickname(isLoading);
    if (this._view === 'create') return this._renderCreate(isLoading);
    if (this._view === 'join') return this._renderJoin(isLoading);
    if (this._view === 'detail') return this._renderDetail(isLoading);
    return this._renderList();
  }

  private _renderNickname(isLoading: boolean) {
    return html`
      <div>
        <div class="field-label">${t('leagues.nicknameTitle')}</div>
      </div>
      <div>
        <div class="field-label">${t('leagues.nicknameLabel')}</div>
        <input
          class="field-input"
          type="text"
          maxlength="24"
          placeholder="${t('leagues.nicknamePlaceholder')}"
          .value="${this._nickname}"
          @input="${(e: Event) => { this._nickname = (e.target as HTMLInputElement).value; }}"
          ?disabled="${isLoading}"
          @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') this._saveNickname(); }}"
        >
        <div class="field-hint">${t('leagues.nicknameHint')}</div>
      </div>
      ${this._error ? html`<div class="error-text">${this._error}</div>` : ''}
      <button class="btn btn-primary" ?disabled="${isLoading || this._nickname.length < 2}" @click="${this._saveNickname}">
        ${isLoading ? html`<span class="spinner"></span>` : t('leagues.nicknameSave')}
      </button>
    `;
  }

  private _renderList() {
    return html`
      ${this._myLeagues.length === 0
        ? html`<p class="empty-text">${t('leagues.empty')}</p>`
        : html`
          <div class="league-list">
            ${this._myLeagues.map(l => html`
              <div class="league-item" @click="${() => this._openLeague(l)}">
                <div>
                  <div class="league-name">${l.name}</div>
                  <div class="league-code">${l.code}</div>
                </div>
                <span class="league-chevron">›</span>
              </div>
            `)}
          </div>
        `}
      <button class="btn btn-primary" @click="${() => { this._view = 'create'; this._error = null; }}">
        ${t('leagues.createBtn')}
      </button>
      <button class="btn btn-secondary" @click="${() => { this._view = 'join'; this._error = null; }}">
        ${t('leagues.joinBtn')}
      </button>
    `;
  }

  private _renderCreate(isLoading: boolean) {
    return html`
      <button class="btn-back" @click="${() => { this._view = 'list'; this._error = null; }}">${t('leagues.back')}</button>
      <div>
        <div class="field-label">${t('leagues.nameLabel')}</div>
        <input
          class="field-input"
          type="text"
          maxlength="40"
          placeholder="${t('leagues.namePlaceholder')}"
          .value="${this._leagueName}"
          @input="${(e: Event) => { this._leagueName = (e.target as HTMLInputElement).value; }}"
          ?disabled="${isLoading}"
          @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') this._createLeague(); }}"
        >
      </div>
      ${this._error ? html`<div class="error-text">${this._error}</div>` : ''}
      <button class="btn btn-primary" ?disabled="${isLoading || !this._leagueName.trim()}" @click="${this._createLeague}">
        ${isLoading ? html`<span class="spinner"></span>` : t('leagues.create')}
      </button>
    `;
  }

  private _renderJoin(isLoading: boolean) {
    return html`
      <button class="btn-back" @click="${() => { this._view = 'list'; this._error = null; }}">${t('leagues.back')}</button>
      <div>
        <div class="field-label">${t('leagues.codeLabel')}</div>
        <input
          class="field-input"
          type="text"
          maxlength="8"
          placeholder="${t('leagues.codePlaceholder')}"
          .value="${this._joinCode}"
          @input="${(e: Event) => { this._joinCode = (e.target as HTMLInputElement).value.toUpperCase(); }}"
          ?disabled="${isLoading}"
          @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') this._joinLeague(); }}"
          style="text-transform:uppercase;letter-spacing:0.2em"
        >
      </div>
      ${this._error ? html`<div class="error-text">${this._error}</div>` : ''}
      <button class="btn btn-primary" ?disabled="${isLoading || !this._joinCode.trim()}" @click="${this._joinLeague}">
        ${isLoading ? html`<span class="spinner"></span>` : t('leagues.join')}
      </button>
    `;
  }

  private _renderDetail(isLoading: boolean) {
    const league = this._activeLeague;
    if (!league) return html``;
    const session = useAuthStore.getState().session!;
    const isOwner = league.owner_id === session.user.id;

    if (this._confirmAction) {
      const isDel = this._confirmAction === 'delete';
      return html`
        <button class="btn-back" @click="${() => { this._confirmAction = null; }}">${t('leagues.back')}</button>
        <div class="confirm-block">
          <div class="confirm-text">
            ${isDel ? t('leagues.confirmDelete') : t('leagues.confirmLeave')}
          </div>
          <div class="btn-row">
            <button class="btn btn-danger btn-sm" ?disabled="${isLoading}"
              @click="${() => this._confirm(this._confirmAction!)}">
              ${isLoading ? html`<span class="spinner"></span>` : t('leagues.confirmYes')}
            </button>
            <button class="btn btn-secondary btn-sm" @click="${() => { this._confirmAction = null; }}">
              ${t('leagues.confirmNo')}
            </button>
          </div>
        </div>
        ${this._error ? html`<div class="error-text">${this._error}</div>` : ''}
      `;
    }

    return html`
      <button class="btn-back" @click="${() => { this._view = 'list'; this._error = null; useLeaguesStore.getState().setActiveLeague(null); }}">${t('leagues.back')}</button>

      <div class="invite-block">
        <span class="invite-code">${league.code}</span>
        <button class="btn btn-sm ${this._linkCopied ? 'btn-copied' : 'btn-secondary'}"
          @click="${this._copyInviteLink}">
          ${this._linkCopied ? t('leagues.linkCopied') : t('leagues.copyInvite')}
        </button>
      </div>

      <div class="detail-section-label">
        ${t('leagues.leaderboard')} · ${t('leagues.members', { n: String(this._members.length) })}
      </div>

      ${this._leaderboardLoading
        ? html`<div class="empty-text"><span class="spinner"></span> ${t('leagues.leaderboardLoading')}</div>`
        : this._leaderboard.length === 0
          ? html`<p class="empty-text">${t('leagues.noResults')}</p>`
          : html`
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th class="lb-rank">${t('leagues.rank')}</th>
                  <th></th>
                  <th style="text-align:right">${t('leagues.points')}</th>
                </tr>
              </thead>
              <tbody>
                ${this._leaderboard.map((entry, i) => html`
                  <tr>
                    <td class="lb-rank ${i === 0 ? 'lb-gold' : ''}">${i + 1}</td>
                    <td class="lb-name">${entry.display_name}${entry.user_id === league.owner_id ? html` <span class="member-owner">${t('leagues.owner')}</span>` : ''}</td>
                    <td class="lb-pts">${entry.total}</td>
                  </tr>
                `)}
              </tbody>
            </table>
          `}

      ${this._error ? html`<div class="error-text">${this._error}</div>` : ''}

      <div class="btn-row">
        ${isOwner
          ? html`<button class="btn btn-danger btn-sm" @click="${() => { this._confirmAction = 'delete'; this._error = null; }}">
              ${t('leagues.delete')}
            </button>`
          : html`<button class="btn btn-secondary btn-sm" @click="${() => { this._confirmAction = 'leave'; this._error = null; }}">
              ${t('leagues.leave')}
            </button>`}
      </div>
    `;
  }
}

export function openLeaguesModal(pendingJoinCode?: string): void {
  const existing = document.querySelector('leagues-modal');
  if (existing) { existing.remove(); }
  const modal = document.createElement('leagues-modal') as LeaguesModal;
  if (pendingJoinCode) modal.setPendingJoinCode(pendingJoinCode);
  document.body.appendChild(modal);
}

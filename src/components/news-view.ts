import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTournamentNews } from '../lib/news-service';
import type { NewsItem } from '../lib/news-service';
import { formatShortDate } from '../lib/date-utils';
import { t, useLocaleStore } from '../i18n';

@customElement('news-view')
export class NewsView extends LitElement {
  @state() private _news: NewsItem[] | null = null;
  @state() private _loading = true;

  private _unsubscribeLocale?: () => void;

  static readonly styles = css`
    :host {
      display: block;
    }

    .news-list {
      display: grid;
      gap: 10px;
      max-width: 900px;
    }

    .news-card {
      border: 3px solid var(--ink);
      box-shadow: var(--shadow-hard-sm);
      background: var(--paper-2);
      overflow: hidden;
      display: flex;
    }

    .news-thumb {
      flex: 0 0 100px;
      width: 100px;
      height: 100px;
      border-right: 3px solid var(--ink);
      background: var(--paper-1);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      font-size: 36px;
      color: var(--dim);
    }

    .news-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .news-body {
      flex: 1;
      min-width: 0;
    }

    .news-link {
      display: block;
      padding: 12px 14px;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }

    .news-link:hover {
      background: var(--retro-yellow);
    }

    .news-headline {
      font-family: var(--font-display);
      font-size: 14px;
      color: var(--ink);
      line-height: 1.35;
    }

    .news-desc {
      margin-top: 4px;
      font-size: 11px;
      color: var(--dim);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-footer {
      margin-top: 6px;
      display: flex;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--dim);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      flex-wrap: wrap;
    }

    .news-source-link {
      color: var(--ink);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .news-source-link:hover {
      color: var(--retro-red);
    }

    .news-loading {
      padding: 28px 20px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-align: center;
      color: var(--dim);
    }

    .empty {
      padding: 28px 20px;
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-align: center;
      color: var(--dim);
    }

    @media (max-width: 768px) {
      .news-thumb {
        flex: 0 0 80px;
        width: 80px;
        height: 80px;
      }

      .news-headline {
        font-size: 13px;
      }
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this._loadNews();
    this._unsubscribeLocale = useLocaleStore.subscribe(() => {
      this._loadNews();
    });
  }

  override disconnectedCallback() {
    this._unsubscribeLocale?.();
    super.disconnectedCallback();
  }

  private async _loadNews() {
    this._loading = true;
    try {
      const locale = useLocaleStore.getState().locale as 'es' | 'en';
      const items = await getTournamentNews(locale);
      this._news = items;
    } catch {
      this._news = null;
    } finally {
      this._loading = false;
    }
  }

  render() {
    if (this._loading) {
      return html`<div class="news-loading">${t('news.loading')}</div>`;
    }

    if (!this._news || this._news.length === 0) {
      return html`<div class="empty">${t('news.empty')}</div>`;
    }

    return html`
      <div class="news-list">
        ${this._news.map(item => html`
          <article class="news-card">
            ${item.image ? html`
              <div class="news-thumb">
                <img src="${item.image}" alt="" loading="lazy" />
              </div>
            ` : html`
              <div class="news-thumb">📰</div>
            `}
            <div class="news-body">
              <a class="news-link" href="${item.url}" target="_blank" rel="noopener noreferrer">
                <div class="news-headline">${item.title}</div>
                ${item.description ? html`<div class="news-desc">${item.description}</div>` : ''}
                <div class="news-footer">
                  <span>${formatShortDate(item.date)}</span>
                  <span>·</span>
                  ${item.sourceUrl
                    ? html`<a class="news-source-link" href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer" @click=${(e: Event) => e.stopPropagation()}>${item.source}</a>`
                    : html`<span>${item.source}</span>`}
                </div>
              </a>
            </div>
          </article>
        `)}
      </div>
    `;
  }
}

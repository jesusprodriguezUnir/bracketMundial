export interface Preview {
  matchId: string;
  title?: string;
  author?: string;
  publishedAt?: string;
  previewText: string;
  chronicleHtml?: string;
}

import { PREVIEWS } from './seed';
import { useLocaleStore } from '../../i18n';
export { PREVIEWS };

export function getPreview(matchId: string): Preview | null {
  const locale = useLocaleStore.getState().locale;
  const matchPreviews = PREVIEWS[matchId];
  if (!matchPreviews) return null;
  return matchPreviews[locale] ?? null;
}

export interface Preview {
  matchId: string;
  title?: string;
  author?: string;
  publishedAt?: string;
  previewText: string;
  chronicleHtml?: string;
}

import { PREVIEWS } from './seed';
export { PREVIEWS };

export function getPreview(matchId: string): Preview | null {
  return PREVIEWS[matchId] ?? null;
}

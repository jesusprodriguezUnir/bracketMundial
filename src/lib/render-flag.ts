import { html } from 'lit';
import type { Team } from '../types/index';

type FlagSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_PX: Record<FlagSize, { w: number; h: number }> = {
  xs: { w: 16, h: 11 },
  sm: { w: 20, h: 14 },
  md: { w: 28, h: 18 },
  lg: { w: 48, h: 32 },
};

export function renderFlag(team: Pick<Team, 'name' | 'flag' | 'flagUrl'> | undefined, size: FlagSize = 'sm') {
  if (!team) return html``;
  const { w, h } = SIZE_PX[size];
  if (team.flagUrl) {
    return html`<img src="${team.flagUrl}" alt="${team.name}" width="${w}" height="${h}" style="object-fit:cover;display:inline-block;vertical-align:middle;">`;
  }
  return html`<span style="font-size:${h}px;line-height:1;vertical-align:middle;">${team.flag}</span>`;
}

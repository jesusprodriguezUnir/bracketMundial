import { html } from 'lit';

export interface FlagSource {
  name?: string;
  flag?: string;
  flagUrl?: string;
}

type FlagSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_PX: Record<FlagSize, { w: number; h: number }> = {
  xs: { w: 16, h: 11 },
  sm: { w: 20, h: 14 },
  md: { w: 28, h: 18 },
  lg: { w: 48, h: 32 },
};

export interface RenderFlagOptions {
  size?: FlagSize;
  imgClass?: string;
  flagClass?: string;
}

export function renderFlag(
  team: FlagSource | undefined,
  sizeOrOptions?: FlagSize | RenderFlagOptions,
) {
  if (!team) return html``;

  const opts: RenderFlagOptions =
    typeof sizeOrOptions === 'string'
      ? { size: sizeOrOptions }
      : sizeOrOptions ?? {};

  const size = opts.size ?? 'sm';
  const { w, h } = SIZE_PX[size];

  if (team.flagUrl) {
    const hasCustomClass = opts.imgClass !== undefined;
    const inlineStyle = hasCustomClass
      ? 'object-fit:cover;display:inline-block;vertical-align:middle;'
      : 'object-fit:cover;display:inline-block;vertical-align:middle;';
    return html`<img
      src="${team.flagUrl}"
      alt="${team.name ?? ''}"
      width="${hasCustomClass ? undefined : w}"
      height="${hasCustomClass ? undefined : h}"
      class=${opts.imgClass ?? undefined}
      style=${inlineStyle}
    >`;
  }

  const spanStyle = `font-size:${h}px;line-height:1;vertical-align:middle;`;
  return html`<span
    class=${opts.flagClass ?? undefined}
    style=${spanStyle}
  >${team.flag ?? ''}</span>`;
}

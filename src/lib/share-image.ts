import { toBlob } from 'html-to-image';
import type { KnockoutMatchResult } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';

function getTeamName(id: string | null): string {
  if (!id) return '';
  return TEAMS_2026.find(t => t.id === id)?.name ?? id;
}

async function waitForImages(node: HTMLElement): Promise<void> {
  const allImgs = (root: Document | ShadowRoot | HTMLElement): HTMLImageElement[] => {
    const imgs: HTMLImageElement[] = [];
    const collect = (el: Element | DocumentFragment) => {
      if (el instanceof HTMLImageElement) imgs.push(el);
      if (el instanceof HTMLElement && el.shadowRoot) collect(el.shadowRoot);
      for (const child of el.children) collect(child);
    };
    collect(root instanceof Document ? root.documentElement : root);
    return imgs;
  };

  const imgs = allImgs(node);
  await Promise.allSettled(
    imgs.map(img => img.complete ? Promise.resolve() : img.decode().catch(() => {}))
  );
}

export async function generateBracketImage(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  await waitForImages(node);

  const opts = {
    pixelRatio: 2,
    cacheBust: true,
    style: { transform: 'none', animation: 'none' } as Partial<CSSStyleDeclaration>,
  };

  let blob = await toBlob(node, { ...opts, width: node.scrollWidth || 1200, height: node.scrollHeight || node.offsetHeight });

  // Retry once — first attempt may miss images still loading
  if (!blob || blob.size < 5_000) {
    await new Promise(r => setTimeout(r, 300));
    await waitForImages(node);
    blob = await toBlob(node, { ...opts, width: node.scrollWidth || 1200, height: node.scrollHeight || node.offsetHeight });
  }

  if (!blob) throw new Error('No se pudo generar la imagen del bracket');
  return blob;
}

export function canShareImage(): boolean {
  try {
    const probe = new File([], 'probe.png', { type: 'image/png' });
    return navigator.canShare?.({ files: [probe] }) ?? false;
  } catch {
    return false;
  }
}

export function buildShareText(
  knockoutMatches: Record<string, KnockoutMatchResult>,
  url?: string,
): string {
  const fin = knockoutMatches['FIN-01'];
  const tp  = knockoutMatches['TP-01'];

  const champion  = fin?.winnerId ? getTeamName(fin.winnerId) : null;
  const runnerUpId = fin?.winnerId
    ? (fin.teamA === fin.winnerId ? fin.teamB : fin.teamA)
    : null;
  const runnerUp  = runnerUpId ? getTeamName(runnerUpId) : null;
  const third     = tp?.winnerId ? getTeamName(tp.winnerId) : null;

  let text: string;
  if (!champion) {
    text = '🗓️ Mi predicción para el Mundial 2026 — ¿quién ganará? ¡Mira mi bracket!';
  } else {
    text = `🏆 Mi bracket del Mundial 2026:\n🥇 Campeón: ${champion}`;
    if (runnerUp) text += `\n🥈 2º: ${runnerUp}`;
    if (third)    text += `\n🥉 3º: ${third}`;
    text += '\n#Mundial2026 #FIFAWorldCup';
  }

  if (url) text += `\n${url}`;
  return text;
}

export async function shareImageNative(blob: Blob, text: string): Promise<'shared' | 'cancelled' | 'unsupported'> {
  const file = new File([blob], 'bracket-mundial-2026.png', { type: 'image/png' });
  if (!navigator.canShare?.({ files: [file] })) return 'unsupported';
  try {
    await navigator.share({ title: 'Mi Bracket Mundial 2026', text, files: [file] });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    return 'cancelled';
  }
}

export async function shareToInstagram(blob: Blob, text: string): Promise<'shared' | 'downloaded'> {
  const result = await shareImageNative(blob, text);
  if (result === 'shared') return 'shared';
  downloadBlob(blob, 'bracket-mundial-2026.png');
  return 'downloaded';
}

export function openTwitterIntent(text: string, url?: string): void {
  const params = new URLSearchParams({ text });
  if (url) params.set('url', url);
  window.open(`https://twitter.com/intent/tweet?${params}`, '_blank', 'noopener');
}

export function openWhatsAppIntent(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}

export function openFacebookShare(url: string): void {
  const params = new URLSearchParams({ u: url });
  window.open(`https://www.facebook.com/sharer/sharer.php?${params}`, '_blank', 'noopener');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

import { toBlob } from 'html-to-image';
import type { KnockoutMatchResult } from '../store/tournament-store';
import { TEAMS_2026 } from '../data/fifa-2026';

function getTeamName(id: string | null): string {
  if (!id) return '';
  return TEAMS_2026.find(t => t.id === id)?.name ?? id;
}

export async function generateBracketImage(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const blob = await toBlob(node, {
    width: 1200,
    height: 675,
    pixelRatio: 2,
    cacheBust: true,
    style: { transform: 'none', animation: 'none' },
  });
  if (!blob) throw new Error('No se pudo generar la imagen del bracket');
  return blob;
}

export function buildShareText(
  knockoutMatches: Record<string, KnockoutMatchResult>
): string {
  const fin = knockoutMatches['FIN-01'];
  const tp  = knockoutMatches['TP-01'];

  const champion  = fin?.winnerId ? getTeamName(fin.winnerId) : null;
  const runnerUpId = fin?.winnerId
    ? (fin.teamA === fin.winnerId ? fin.teamB : fin.teamA)
    : null;
  const runnerUp  = runnerUpId ? getTeamName(runnerUpId) : null;
  const third     = tp?.winnerId ? getTeamName(tp.winnerId) : null;

  if (!champion) {
    return '🗓️ Mi predicción para el Mundial 2026 — ¿quién ganará? ¡Mira mi bracket!';
  }

  let text = `🏆 Mi bracket del Mundial 2026:\n🥇 Campeón: ${champion}`;
  if (runnerUp) text += `\n🥈 2º: ${runnerUp}`;
  if (third)    text += `\n🥉 3º: ${third}`;
  text += '\n#Mundial2026 #FIFAWorldCup';
  return text;
}

export async function shareViaWebAPI(blob: Blob, text: string): Promise<boolean> {
  const file = new File([blob], 'bracket-mundial-2026.png', { type: 'image/png' });
  if (!navigator.canShare?.({ files: [file] })) return false;
  try {
    await navigator.share({
      title: 'Mi Bracket Mundial 2026',
      text,
      files: [file],
    });
    return true;
  } catch {
    return false;
  }
}

export function openTwitterIntent(text: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}

export function openWhatsAppIntent(text: string): void {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export interface PlayerDetail {
  id: string;
  name: string;
  position: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  birthPlace?: string;
  foot?: string;
  description?: string;
  photoUrl?: string;
  thumbUrl?: string;
  twitter?: string;
  instagram?: string;
}

interface CacheEntry {
  data: PlayerDetail | null;
  ts: number;
}

interface SportsDbPlayer {
  idPlayer?: string;
  strPlayer?: string;
  strPosition?: string;
  strHeight?: string;
  strWeight?: string;
  dateBorn?: string;
  strBirthLocation?: string;
  strFoot?: string;
  strDescriptionES?: string;
  strDescriptionEN?: string;
  strCutout?: string;
  strThumb?: string;
  strTwitter?: string;
  strInstagram?: string;
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
const API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
let _lastReqTime = 0;

async function _throttle(): Promise<void> {
  const elapsed = Date.now() - _lastReqTime;
  if (elapsed < 500) {
    await new Promise<void>(resolve => setTimeout(resolve, 500 - elapsed));
  }
  _lastReqTime = Date.now();
}

function _cacheKey(teamId: string, playerNumber: number): string {
  return `player:${teamId}:${playerNumber}`;
}

function _fromCache(key: string): PlayerDetail | null | undefined {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.ts > CACHE_TTL) {
      localStorage.removeItem(key);
      return undefined;
    }
    return entry.data;
  } catch {
    return undefined;
  }
}

function _toCache(key: string, data: PlayerDetail | null): void {
  try {
    const entry: CacheEntry = { data, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch { /* cuota llena */ }
}

function _mapPlayer(raw: SportsDbPlayer): PlayerDetail {
  return {
    id: raw.idPlayer ?? '',
    name: raw.strPlayer ?? '',
    position: raw.strPosition ?? '',
    height: raw.strHeight || undefined,
    weight: raw.strWeight || undefined,
    birthDate: raw.dateBorn || undefined,
    birthPlace: raw.strBirthLocation || undefined,
    foot: raw.strFoot || undefined,
    description: raw.strDescriptionES || raw.strDescriptionEN || undefined,
    photoUrl: raw.strCutout || raw.strThumb || undefined,
    thumbUrl: raw.strThumb || undefined,
    twitter: raw.strTwitter ? `https://twitter.com/${raw.strTwitter}` : undefined,
    instagram: raw.strInstagram ? `https://www.instagram.com/${raw.strInstagram}` : undefined,
  };
}

export async function searchPlayer(
  name: string,
  teamId: string,
  playerNumber: number,
  thesportsdbId?: string,
): Promise<PlayerDetail | null> {
  const key = _cacheKey(teamId, playerNumber);
  const cached = _fromCache(key);
  if (cached !== undefined) return cached;

  await _throttle();
  try {
    let url = `${API_BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
    if (thesportsdbId) {
      url = `${API_BASE}/lookupplayer.php?id=${thesportsdbId}`;
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json() as { player: SportsDbPlayer[] | null | undefined };
    const players = json.player;
    if (!Array.isArray(players) || players.length === 0) {
      _toCache(key, null);
      return null;
    }

    const selected = thesportsdbId 
      ? players[0] 
      : (players.find(p => (p.strPlayer ?? '').toLowerCase() === name.toLowerCase()) ?? players[0]);

    const detail = _mapPlayer(selected);
    _toCache(key, detail);
    return detail;
  } catch {
    return null;
  }
}

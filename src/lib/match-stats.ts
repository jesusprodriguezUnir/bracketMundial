export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
}

/** Simple 32-bit pseudo-random generator seeded from string. */
function createSeededRandom(seedStr: string): () => number {
  let hash = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    hash = Math.imul(hash ^ seedStr.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return function () {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return ((hash ^= hash >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Genera estadísticas plausibles y deterministas para un partido a partir de su ID y marcador.
 */
export function getMatchStats(
  matchId: string,
  teamA: string,
  teamB: string,
  scoreA: number | null,
  scoreB: number | null,
): MatchStats {
  const seed = `${matchId}_${teamA}_${teamB}_${scoreA ?? 0}_${scoreB ?? 0}`;
  const rand = createSeededRandom(seed);

  const sA = Math.max(0, scoreA ?? 0);
  const sB = Math.max(0, scoreB ?? 0);

  // Posesión correlacionada con el resultado (32% - 68% rango típico)
  const diff = sA - sB;
  const basePossessionA = 50 + diff * 3 + Math.floor((rand() - 0.5) * 16);
  const possessionA = Math.min(68, Math.max(32, basePossessionA));
  const possessionB = 100 - possessionA;

  // Tiros a puerta: al menos igual al número de goles marcados
  const onTargetA = sA + Math.floor(rand() * 4) + 1;
  const onTargetB = sB + Math.floor(rand() * 4) + 1;

  // Tiros totales: mayores o iguales a tiros a puerta
  const shotsA = onTargetA + Math.floor(rand() * 8) + 3;
  const shotsB = onTargetB + Math.floor(rand() * 8) + 3;

  // Córners: entre 2 y 10 por equipo
  const cornersA = Math.max(1, Math.floor((possessionA / 100) * 10 + rand() * 4));
  const cornersB = Math.max(1, Math.floor((possessionB / 100) * 10 + rand() * 4));

  // Faltas: entre 6 y 18
  const foulsA = 7 + Math.floor(rand() * 10);
  const foulsB = 7 + Math.floor(rand() * 10);

  // Tarjetas amarillas: 0 a 4
  const yellowA = Math.floor(rand() * 3.5);
  const yellowB = Math.floor(rand() * 3.5);

  // Tarjetas rojas: muy raras (< 5%)
  const redA = rand() < 0.05 ? 1 : 0;
  const redB = rand() < 0.05 ? 1 : 0;

  // Fueras de juego: 0 a 5
  const offsidesA = Math.floor(rand() * 4);
  const offsidesB = Math.floor(rand() * 4);

  return {
    possession: [possessionA, possessionB],
    shots: [shotsA, shotsB],
    shotsOnTarget: [onTargetA, onTargetB],
    corners: [cornersA, cornersB],
    fouls: [foulsA, foulsB],
    yellowCards: [yellowA, yellowB],
    redCards: [redA, redB],
    offsides: [offsidesA, offsidesB],
  };
}

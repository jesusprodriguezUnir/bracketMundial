// Pure 1X2 probability model based on Elo-style team ratings.
// Used as synthetic fallback when bookmaker odds are unavailable.
// Also drives the realistic simulation engine in the tournament store.

export interface MatchProb {
  home: number;  // % teamA wins (integer, sums to 100)
  draw: number;  // % draw
  away: number;  // % teamB wins
}

// Largest-remainder rounding: ensures home + draw + away === 100.
function roundToHundred(h: number, d: number, a: number): [number, number, number] {
  const raw = [h * 100, d * 100, a * 100];
  const floors = raw.map(Math.floor);
  const residual = 100 - floors.reduce((s, v) => s + v, 0);
  const fracs = raw.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((x, y) => y.f - x.f);
  for (let i = 0; i < residual; i++) floors[fracs[i].i]++;
  return floors as [number, number, number];
}

/**
 * Derives 1X2 probabilities from Elo-style ratings.
 * Draw rate decreases as the rating gap grows (balanced match ≈ 30%, mismatch ≈ 12%).
 */
export function expectedProbabilities(ratingA: number, ratingB: number): MatchProb {
  const pA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const diff = Math.abs(ratingA - ratingB);
  const draw = Math.max(0.12, Math.min(0.30, 0.30 - diff / 2000));
  const [home, d, away] = roundToHundred(pA * (1 - draw), draw, (1 - pA) * (1 - draw));
  return { home, draw: d, away };
}

export interface SampledResult {
  scoreA: number;
  scoreB: number;
  // Set only in knockout mode when the match ends in a draw → penalties needed
  penaltiesNeeded?: boolean;
}

// Weighted random pick: weights are relative (don't need to sum to 1).
function pick(weights: number[], rng: () => number): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * Samples a realistic scoreline given 1X2 probabilities.
 * @param prob     1X2 probabilities (integer %).
 * @param rng      Random number generator (default Math.random).
 * @param knockout If true, treats draws as extra-time → penalties needed.
 */
export function sampleResult(
  prob: MatchProb,
  rng: () => number = Math.random,
  knockout = false,
): SampledResult {
  const r = rng() * 100;
  const outcome = r < prob.home ? 'home' : r < prob.home + prob.draw ? 'draw' : 'away';

  // Goal distributions: winner gets 1–4 (skewed low), loser 0–2
  const winnerGoals = pick([38, 34, 18, 10], rng) + 1;   // 1,2,3,4
  const loserGoals  = pick([52, 32, 16], rng);             // 0,1,2
  const drawGoals   = pick([18, 42, 28, 12], rng);         // 0,1,2,3

  if (outcome === 'home') return { scoreA: winnerGoals, scoreB: Math.min(loserGoals, winnerGoals - 1) };
  if (outcome === 'away') return { scoreA: Math.min(loserGoals, winnerGoals - 1), scoreB: winnerGoals };

  // Draw
  if (knockout) return { scoreA: drawGoals, scoreB: drawGoals, penaltiesNeeded: true };
  return { scoreA: drawGoals, scoreB: drawGoals };
}

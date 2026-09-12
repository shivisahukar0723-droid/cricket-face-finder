import { euclidean } from "./face";

export type PlayerRecord = {
  id: string;
  slug: string;
  name: string;
  role: string;
  era: string;
  image_url: string;
  /** Exemplar face vectors kept for this player (the trained gallery). */
  embeddings: number[][];
  /** Mean face vector of the player's training exemplars. */
  centroid: number[];
  sample_count: number;
};

export type Calibration = {
  /** Logistic slope. */
  a: number;
  /** Logistic midpoint — the score where the model is 50/50. */
  b: number;
  /** Confidence (0-1) required to call it a match. */
  threshold: number;
};

export type Candidate = {
  player: PlayerRecord;
  /** Blended gallery distance (lower is closer). */
  distance: number;
  /** Calibrated confidence, 0-100. */
  confidence: number;
};

/** Fallback used only if the model row has not loaded yet. */
export const DEFAULT_CALIBRATION: Calibration = { a: 14, b: 0.56, threshold: 0.7 };

export const MATCH_THRESHOLD = 70;

/**
 * Blend three views of "how close is this face to that player":
 * nearest exemplar, the mean of the three nearest exemplars (noise-robust),
 * and the distance to the player's centroid (overall identity match).
 */
function galleryDistance(descriptor: Float32Array, player: PlayerRecord): number {
  const dists: number[] = [];
  for (const e of player.embeddings ?? []) dists.push(euclidean(descriptor, e));
  if (dists.length === 0) return Number.POSITIVE_INFINITY;
  dists.sort((x, y) => x - y);
  const dmin = dists[0] as number;
  const k = Math.min(3, dists.length);
  let sum = 0;
  for (let i = 0; i < k; i++) sum += dists[i] as number;
  const dk = sum / k;
  const centroid = player.centroid?.length ? euclidean(descriptor, player.centroid) : dmin;
  return 0.5 * dmin + 0.3 * dk + 0.2 * centroid;
}

function logistic(distance: number, cal: Calibration): number {
  return 1 / (1 + Math.exp(cal.a * (distance - cal.b)));
}

/**
 * Rank every known player against one face embedding, closest first.
 * Confidence comes from the calibrated logistic fitted during training, with a
 * small penalty when the runner-up is almost as close (an ambiguous face).
 */
export function rankPlayers(
  descriptor: Float32Array,
  players: PlayerRecord[],
  calibration: Calibration = DEFAULT_CALIBRATION,
): Candidate[] {
  const scored = players
    .map((player) => ({ player, distance: galleryDistance(descriptor, player) }))
    .filter((c) => Number.isFinite(c.distance))
    .sort((a, b) => a.distance - b.distance);

  const runnerUp = scored[1]?.distance;

  return scored.map((c, i) => {
    let p = logistic(c.distance, calibration);
    if (i === 0 && runnerUp !== undefined) {
      // margin between best and second best: a clear winner keeps its score,
      // a photo that fits two players equally well is damped.
      const margin = runnerUp - c.distance;
      p *= Math.min(1, 0.55 + margin * 6);
    }
    return { ...c, confidence: Math.round(Math.max(0, Math.min(1, p)) * 100) };
  });
}

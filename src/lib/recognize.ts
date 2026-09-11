import { distanceToConfidence, euclidean } from "./face";

export type PlayerRecord = {
  id: string;
  slug: string;
  name: string;
  role: string;
  era: string;
  image_url: string;
  embeddings: number[][];
};

export type Candidate = {
  player: PlayerRecord;
  distance: number;
  confidence: number;
};

export const MATCH_THRESHOLD = 70;

/** Rank every known player against one face embedding, closest first. */
export function rankPlayers(descriptor: Float32Array, players: PlayerRecord[]): Candidate[] {
  return players
    .map((player) => {
      let best = Number.POSITIVE_INFINITY;
      for (const e of player.embeddings ?? []) {
        const d = euclidean(descriptor, e);
        if (d < best) best = d;
      }
      return { player, distance: best, confidence: distanceToConfidence(best) };
    })
    .filter((c) => Number.isFinite(c.distance))
    .sort((a, b) => a.distance - b.distance);
}

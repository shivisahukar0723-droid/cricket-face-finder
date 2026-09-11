import * as faceapi from "@vladmandic/face-api";

let loading: Promise<void> | null = null;

export const MODEL_URL = "/models";

export async function loadFaceModels(): Promise<void> {
  if (!loading) {
    loading = (async () => {
      const forced = (globalThis as { __FORCE_BACKEND?: string }).__FORCE_BACKEND;
      let ok = false;
      try {
        ok = await faceapi.tf.setBackend(forced ?? "webgl");
      } catch {
        ok = false;
      }
      if (!ok || faceapi.tf.getBackend() !== (forced ?? "webgl")) {
        await faceapi.tf.setBackend("cpu");
      }
      await faceapi.tf.ready();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    })();
  }
  return loading;
}

export type DetectedFace = {
  descriptor: Float32Array;
  box: { x: number; y: number; width: number; height: number };
  score: number;
};

/** Detect every face in an image element, sorted largest-first. */
export async function detectFaces(
  input: HTMLImageElement | HTMLCanvasElement,
  minConfidence = 0.4,
): Promise<DetectedFace[]> {
  await loadFaceModels();
  const results = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  return results
    .map((r) => ({
      descriptor: r.descriptor,
      score: r.detection.score,
      box: {
        x: r.detection.box.x,
        y: r.detection.box.y,
        width: r.detection.box.width,
        height: r.detection.box.height,
      },
    }))
    .sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height);
}

export function euclidean(a: Float32Array | number[], b: Float32Array | number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] as number) - (b[i] as number);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Map a face-embedding distance onto a 0-100 confidence score.
 * Distances below ~0.30 are near-certain matches, above ~0.83 are strangers.
 */
export function distanceToConfidence(distance: number): number {
  const best = 0.30;
  const worst = 0.83;
  const t = (worst - distance) / (worst - best);
  return Math.round(Math.max(0, Math.min(1, t)) * 100);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });
}

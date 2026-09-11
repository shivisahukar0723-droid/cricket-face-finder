import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { detectFaces, loadFaceModels, loadImage } from "@/lib/face";

// TEMPORARY build-time utility route used to precompute reference embeddings.
export const Route = createFileRoute("/descgen")({
  ssr: false,
  component: DescGen,
});

function DescGen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadFaceModels();
      (window as unknown as { __RUN: unknown }).__RUN = async (file: string) => {
        const img = await loadImage(file);
        const faces = await detectFaces(img, 0.4);
        const imgArea = img.naturalWidth * img.naturalHeight;
        return faces.slice(0, 6).map((f) => ({
          file,
          rel: (f.box.width * f.box.height) / imgArea,
          box: f.box,
          score: f.score,
          descriptor: Array.from(f.descriptor),
        }));
      };
      (window as unknown as { __READY: boolean }).__READY = true;
      setReady(true);
    })();
  }, []);

  return <pre data-testid="log">{ready ? "READY" : "loading"}</pre>;
}

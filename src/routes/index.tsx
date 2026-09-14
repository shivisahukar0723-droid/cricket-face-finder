import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectFaces, loadFaceModels, loadImage } from "@/lib/face";
import {
  DEFAULT_CALIBRATION,
  rankPlayers,
  type Calibration,
  type Candidate,
  type PlayerRecord,
} from "@/lib/recognize";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cricket Face ID — Identify Indian Cricket Players from a Photo" },
      {
        name: "description",
        content:
          "Upload a photo and instantly identify Indian cricket players by face, with a confidence score. Runs entirely in your browser.",
      },
      { property: "og:title", content: "Cricket Face ID — Identify Indian Cricket Players" },
      {
        property: "og:description",
        content:
          "Drop in a photo and see which Indian cricketer it matches, with a confidence score.",
      },
    ],
  }),
  component: Home,
});

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Phase = "idle" | "reading" | "analyzing" | "done" | "error";

type Analysis = {
  faceCount: number;
  box: { x: number; y: number; width: number; height: number } | null;
  candidates: Candidate[];
  elapsedMs: number;
};

const playersQuery = {
    queryKey: ["cricket-players"] as const,
    queryFn: async (): Promise<PlayerRecord[]> => {
      const { data, error } = await supabase
        .from("cricket_players")
        .select("id, slug, name, role, era, image_url, embeddings, centroid, sample_count")
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as PlayerRecord[];
    },
    staleTime: Infinity,
};

const calibrationQuery = {
  queryKey: ["recognition-model"] as const,
  queryFn: async (): Promise<Calibration> => {
    const { data, error } = await supabase
      .from("recognition_model")
      .select("calibration")
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    const cal = (data?.calibration ?? null) as Partial<Calibration> | null;
    return cal && typeof cal.a === "number" && typeof cal.b === "number"
      ? { a: cal.a, b: cal.b, threshold: cal.threshold ?? DEFAULT_CALIBRATION.threshold }
      : DEFAULT_CALIBRATION;
  },
  staleTime: Infinity,
};

function Home() {
  const players = useQuery(playersQuery);
  const calibration = useQuery(calibrationQuery);

  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [dragging, setDragging] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    loadFaceModels()
      .then(() => setModelsReady(true))
      .catch(() => setMessage("The face engine could not start. Please refresh the page."));
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setPreviewUrl(null);
    setAnalysis(null);
    setImgSize(null);
    setMessage(null);
    setPhase("idle");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setMessage(null);
      setAnalysis(null);

      if (!ACCEPTED.includes(file.type)) {
        setPhase("error");
        setMessage("That file type isn't supported. Please use a JPG, PNG or WebP image.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setPhase("error");
        setMessage("That image is larger than 8 MB. Please try a smaller one.");
        return;
      }

      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      const url = URL.createObjectURL(file);
      objectUrl.current = url;
      setPreviewUrl(url);
      setPhase("reading");

      try {
        const img = await loadImage(url);
        setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
        if (img.naturalWidth < 80 || img.naturalHeight < 80) {
          setPhase("error");
          setMessage("That image is too small to read a face from. Try a larger photo.");
          return;
        }

        setPhase("analyzing");
        const started = performance.now();
        const faces = await detectFaces(img);

        if (faces.length === 0) {
          setAnalysis({
            faceCount: 0,
            box: null,
            candidates: [],
            elapsedMs: performance.now() - started,
          });
          setPhase("done");
          return;
        }

        const primary = faces[0]!;
        const ranked = rankPlayers(
          primary.descriptor,
          players.data ?? [],
          calibration.data ?? DEFAULT_CALIBRATION,
        ).slice(0, 4);
        console.log('DBG status', players.status, players.fetchStatus, JSON.stringify(players.error)?.slice(0,200), 'players', players.data?.length, 'cal', JSON.stringify(calibration.data), 'ranked', JSON.stringify(ranked.map(r=>[r.player.slug,r.distance,r.confidence])));
        setAnalysis({
          faceCount: faces.length,
          box: primary.box,
          candidates: ranked,
          elapsedMs: performance.now() - started,
        });
        setPhase("done");
      } catch {
        setPhase("error");
        setMessage("That image couldn't be read. It may be corrupt — try a different photo.");
      }
    },
    [players.data, calibration.data],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const best = analysis?.candidates[0];
  const thresholdPct = Math.round((calibration.data ?? DEFAULT_CALIBRATION).threshold * 100);
  const isMatch = !!best && best.confidence >= thresholdPct;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-10 sm:px-8">
      <header className="mb-10 text-center">
        <img
          src={logoUrl}
          alt="Cricket Face ID logo"
          width={768}
          height={768}
          className="mx-auto mb-4 h-20 w-20 rounded-2xl sm:h-24 sm:w-24"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
          Player recognition
        </p>
        <h1 className="mt-3 text-5xl leading-none sm:text-7xl">Cricket Face ID</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Drop in a photo of an Indian cricketer. The face is read in your browser and matched
          against {players.data?.length ?? 18} players from the dressing room, past and present.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1.05fr_1fr]">
        {/* Upload / preview */}
        <section className="stadium-panel rounded-xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl">The photo</h2>
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {modelsReady ? "Engine ready" : "Warming up…"}
            </span>
          </div>

          {!previewUrl ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
                dragging
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background/30 hover:border-primary/60"
              }`}
            >
              <img src={logoUrl} alt="" width={768} height={768} className="h-12 w-12 rounded-xl opacity-90" />
              <span className="font-display text-2xl">Drag a photo here</span>
              <span className="text-sm text-muted-foreground">
                or click to browse · JPG, PNG or WebP · up to 8 MB
              </span>
            </button>
          ) : (
            <figure className="relative overflow-hidden rounded-lg border border-border bg-black/40">
              <img
                src={previewUrl}
                alt="Uploaded photo being identified"
                className="max-h-[420px] w-full object-contain"
              />
              {analysis?.box && imgSize && (
                <FaceBox box={analysis.box} imgSize={imgSize} />
              )}
              {phase === "analyzing" && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="animate-scanline h-1 w-full bg-primary/80 shadow-[0_0_24px_6px_var(--color-primary)]" />
                </div>
              )}
            </figure>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => inputRef.current?.click()} disabled={phase === "analyzing"}>
              {previewUrl ? "Choose another photo" : "Choose a photo"}
            </Button>
            {previewUrl && (
              <Button variant="secondary" onClick={reset} disabled={phase === "analyzing"}>
                Try another image
              </Button>
            )}
          </div>

          {message && (
            <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/15 px-3 py-2 text-sm text-foreground">
              {message}
            </p>
          )}
        </section>

        {/* Result */}
        <section className="stadium-panel min-h-[320px] rounded-xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl">The verdict</h2>
            {analysis && (
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {(analysis.elapsedMs / 1000).toFixed(1)}s
              </span>
            )}
          </div>

          {players.isError && (
            <p className="text-sm text-muted-foreground">
              The player list couldn't be loaded. Please check your connection and refresh.
            </p>
          )}

          {phase === "idle" && !players.isError && (
            <p className="text-sm text-muted-foreground">
              Nothing to call yet. Upload a photo and the result appears here.
            </p>
          )}

          {(phase === "reading" || phase === "analyzing") && (
            <div className="flex items-center gap-3 py-8">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                {phase === "reading" ? "Reading the photo…" : "Scanning the face…"}
              </span>
            </div>
          )}

          {phase === "done" && analysis && analysis.faceCount === 0 && (
            <EmptyState
              title="No face found"
              body="No face could be detected in that photo. Try a clearer, closer shot of the player's face."
            />
          )}

          {phase === "done" && analysis && analysis.faceCount > 0 && !isMatch && (
            <EmptyState
              title="Player not recognised"
              body={`Confidence below the ${thresholdPct}% threshold — this face doesn't match anyone in the squad list.`}
              candidates={analysis.candidates.slice(0, 3)}
            />
          )}

          {phase === "done" && analysis && isMatch && best && (
            <div className="animate-snap-in">
              <div className="flex gap-4">
                <img
                  src={best.player.image_url}
                  alt={best.player.name}
                  className="h-24 w-24 flex-none rounded-lg border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="font-display text-3xl leading-tight">{best.player.name}</p>
                  <p className="text-sm text-muted-foreground">{best.player.role}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {best.player.era}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Confidence
                  </span>
                  <span className="font-display text-4xl text-flood">{best.confidence}%</span>
                </div>
                <ConfidenceBar value={best.confidence} />
              </div>

              {analysis.faceCount > 1 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {analysis.faceCount} faces found — the largest one was used.
                </p>
              )}

              {best.confidence < 85 && analysis.candidates.length > 1 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                    Other possibilities
                  </p>
                  <AlternativeList candidates={analysis.candidates.slice(1, 4)} />
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Reference photos are freely licensed images from Wikimedia Commons. Your uploaded photo
        never leaves your device.
      </p>
    </main>
  );
}

function FaceBox({
  box,
  imgSize,
}: {
  box: { x: number; y: number; width: number; height: number };
  imgSize: { w: number; h: number };
}) {
  const style = {
    left: `${(box.x / imgSize.w) * 100}%`,
    top: `${(box.y / imgSize.h) * 100}%`,
    width: `${(box.width / imgSize.w) * 100}%`,
    height: `${(box.height / imgSize.h) * 100}%`,
  };
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-sm border-2 border-primary shadow-[0_0_0_9999px_oklch(0_0_0/0.35)]"
      style={style}
    />
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function AlternativeList({ candidates }: { candidates: Candidate[] }) {
  return (
    <ul className="space-y-3">
      {candidates.map((c) => (
        <li key={c.player.id} className="flex items-center gap-3">
          <img
            src={c.player.image_url}
            alt={c.player.name}
            className="h-10 w-10 flex-none rounded-md border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium">{c.player.name}</span>
              <span className="text-xs text-muted-foreground">{c.confidence}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent" style={{ width: `${c.confidence}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  title,
  body,
  candidates,
}: {
  title: string;
  body: string;
  candidates?: Candidate[];
}) {
  return (
    <div className="animate-snap-in">
      <p className="font-display text-3xl text-flood">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      {candidates && candidates.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Closest anyway
          </p>
          <AlternativeList candidates={candidates} />
        </div>
      )}
    </div>
  );
}

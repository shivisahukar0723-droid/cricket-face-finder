# Cricket Face ID

Identify Indian cricket players from a photo — entirely in your browser. Drop in a picture and the app detects the face, matches it against a trained gallery of 18 Indian cricketers (past and present), and shows the player's name with a calibrated confidence score.

**No sign-up. Your photo never leaves your device.**

## Players recognised

Virat Kohli · Rohit Sharma · MS Dhoni · Sachin Tendulkar · Jasprit Bumrah · Ravindra Jadeja · KL Rahul · Hardik Pandya · Rishabh Pant · Shubman Gill · Mohammed Shami · Yuzvendra Chahal · Suryakumar Yadav · Ravichandran Ashwin · Shikhar Dhawan · Anil Kumble · Rahul Dravid · Sourav Ganguly

## How it works

1. **Upload** — drag-and-drop or file picker (JPG, PNG, WebP, up to 8 MB).
2. **Face detection** — SSD MobileNet finds all faces; the largest is used, and the count is shown when several are found.
3. **Embedding** — a ResNet-style recognition network (via `@vladmandic/face-api` on TensorFlow.js, WebGL with CPU fallback) turns the face into a 128-dimensional descriptor.
4. **Matching** — the descriptor is compared against per-player exemplar galleries and centroids stored in Supabase. Scores blend nearest-exemplar distance, top-3 mean distance and centroid distance, with a runner-up margin penalty for ambiguous faces.
5. **Calibration** — a logistic model (parameters stored in Supabase, fetched live) converts the blended distance into a 0–100% confidence. Matches below the calibrated threshold (~68%) are shown as "Player not recognised" with the closest alternatives.

## Model training & evaluation

- **Reference set**: 216 freely licensed images from Wikimedia Commons / Wikipedia (`public/players/`), yielding 684 detected faces.
- **Labelling**: faces were assigned to players conservatively using thumbnail identity anchors plus nearest-anchor distance filtering; mislabelled and contaminated images were discarded.
- **Classifier**: per-player exemplar galleries + centroids with a grid-search-fitted logistic calibration over genuine vs. hardest-impostor distances.
- **Held-out evaluation (80/20)**: ~94% top-1 accuracy; the published operating threshold was chosen for zero measured false accepts.
- **Model artefacts** (exemplars, centroids, calibration, metrics) are versioned in the `recognition_model` table in Supabase; the app always loads the active version.

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Frontend   | React 19 + TypeScript, TanStack Start (SSR), Tailwind CSS v4  |
| ML         | `@vladmandic/face-api` (TensorFlow.js), models in `public/models/` |
| Data       | Supabase (Lovable Cloud) — players, embeddings, calibration   |
| Processing | 100% client-side inference; Supabase is read-only from the browser |

## Project layout

```
src/routes/index.tsx   Upload UI, analysis flow, verdict display
src/lib/face.ts        Model loading, detection, descriptors (WebGL → CPU)
src/lib/recognize.ts   Gallery distance, blended ranking, logistic calibration
src/data/roster.ts     The 18-player roster
public/players/        Reference photos (Wikimedia Commons, freely licensed)
public/thumbs/         Player thumbnails shown in results
public/models/         face-api model weights (detector, landmarks, recognition)
```

## Database

- `cricket_players` — player metadata, thumbnail URL, exemplar embeddings (JSONB), centroid, sample count. Public read, service-role write.
- `recognition_model` — versioned calibration parameters, metrics, active flag. Public read of the active row.

## Performance notes

- Inference on a WebGL-capable device: ~2–3 s. On CPU-only (e.g. headless environments): ~15–20 s.
- Face models (~15 MB) load once in the background on page open; "ENGINE READY" appears when loaded.

## Privacy

Uploaded photos are processed locally in the browser and are never uploaded or stored. Reference photos are freely licensed images from Wikimedia Commons.

## Deploy to Vercel

The build auto-detects the hosting platform, so no config rewrite is needed — `vercel.json` is included only to pin framework detection.

1. Push this repo to GitHub and import it in Vercel (**Add New → Project**).
2. Settings:
   - Build command: `vite build`
   - Install command: `npm install` (or `bun install`)
3. Add these Environment Variables (Production + Preview):

   | Name | Value |
   | ---- | ----- |
   | `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | the Supabase anon/publishable key |
   | `VITE_SUPABASE_PROJECT_ID` | the Supabase project ref |

   Both Supabase values are public by design — the database is read-only from the browser via RLS. Never add the service-role key.
4. Deploy. Tables `cricket_players` and `recognition_model` must already exist in the Supabase project (see `supabase/migrations/`).

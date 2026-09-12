ALTER TABLE public.cricket_players
  ADD COLUMN IF NOT EXISTS centroid jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sample_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.recognition_model (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version integer NOT NULL,
  calibration jsonb NOT NULL DEFAULT '{}'::jsonb,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.recognition_model TO anon;
GRANT SELECT ON public.recognition_model TO authenticated;
GRANT ALL ON public.recognition_model TO service_role;

ALTER TABLE public.recognition_model ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recognition model is publicly readable"
  ON public.recognition_model FOR SELECT USING (true);

CREATE TRIGGER update_recognition_model_updated_at
  BEFORE UPDATE ON public.recognition_model
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
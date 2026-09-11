CREATE TABLE public.cricket_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  era text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  embeddings jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.cricket_players TO anon;
GRANT SELECT ON public.cricket_players TO authenticated;
GRANT ALL ON public.cricket_players TO service_role;

ALTER TABLE public.cricket_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Player reference data is public" ON public.cricket_players FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cricket_players_updated_at BEFORE UPDATE ON public.cricket_players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.cricket_players (slug, name, role, era, image_url) VALUES
('virat-kohli','Virat Kohli','Top-order batter','India · 2008–present','/thumbs/virat-kohli.jpg'),
('rohit-sharma','Rohit Sharma','Opening batter · Captain','India · 2007–present','/thumbs/rohit-sharma.jpg'),
('ms-dhoni','MS Dhoni','Wicket-keeper batter','India · 2004–2019','/thumbs/ms-dhoni.jpg'),
('sachin-tendulkar','Sachin Tendulkar','Top-order batter','India · 1989–2013','/thumbs/sachin-tendulkar.jpg'),
('jasprit-bumrah','Jasprit Bumrah','Fast bowler','India · 2016–present','/thumbs/jasprit-bumrah.jpg'),
('ravindra-jadeja','Ravindra Jadeja','All-rounder','India · 2009–present','/thumbs/ravindra-jadeja.jpg'),
('kl-rahul','KL Rahul','Batter · Wicket-keeper','India · 2014–present','/thumbs/kl-rahul.jpg'),
('hardik-pandya','Hardik Pandya','All-rounder','India · 2016–present','/thumbs/hardik-pandya.jpg'),
('rishabh-pant','Rishabh Pant','Wicket-keeper batter','India · 2017–present','/thumbs/rishabh-pant.jpg'),
('shubman-gill','Shubman Gill','Opening batter','India · 2019–present','/thumbs/shubman-gill.jpg'),
('mohammed-shami','Mohammed Shami','Fast bowler','India · 2013–present','/thumbs/mohammed-shami.jpg'),
('yuzvendra-chahal','Yuzvendra Chahal','Leg-spinner','India · 2016–present','/thumbs/yuzvendra-chahal.jpg'),
('suryakumar-yadav','Suryakumar Yadav','Middle-order batter','India · 2021–present','/thumbs/suryakumar-yadav.jpg'),
('ravichandran-ashwin','Ravichandran Ashwin','Off-spin all-rounder','India · 2010–2024','/thumbs/ravichandran-ashwin.jpg'),
('shikhar-dhawan','Shikhar Dhawan','Opening batter','India · 2010–2022','/thumbs/shikhar-dhawan.jpg'),
('anil-kumble','Anil Kumble','Leg-spinner','India · 1990–2008','/thumbs/anil-kumble.jpg'),
('rahul-dravid','Rahul Dravid','Top-order batter','India · 1996–2012','/thumbs/rahul-dravid.jpg'),
('sourav-ganguly','Sourav Ganguly','Opening batter · Captain','India · 1992–2007','/thumbs/sourav-ganguly.jpg');
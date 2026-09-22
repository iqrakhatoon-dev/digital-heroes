CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (
    subscription_status IN ('inactive', 'active', 'cancelled', 'lapsed')
  ),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  charity_id UUID,
  charity_percentage NUMERIC DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


--CHARITIES
CREATE TABLE charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  total_raised NUMERIC DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- SCORES (Stableford format, rolling 5)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date) -- One score per date per user
);

-- Enforce rolling 5: keep only latest 5 scores per user
CREATE OR REPLACE FUNCTION enforce_rolling_scores()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER;
  oldest_id UUID;
BEGIN
  SELECT COUNT(*) INTO score_count
  FROM scores WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    SELECT id INTO oldest_id
    FROM scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date ASC
    LIMIT 1;
    DELETE FROM scores WHERE id = oldest_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rolling_scores_trigger
  BEFORE INSERT ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_rolling_scores();


-- DRAWS
CREATE TABLE draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_month TEXT NOT NULL, -- e.g. '2026-03'
  draw_type TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithm')),
  draw_numbers INTEGER[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  prize_pool_total NUMERIC DEFAULT 0,
  prize_five_match NUMERIC DEFAULT 0,
  prize_four_match NUMERIC DEFAULT 0,
  prize_three_match NUMERIC DEFAULT 0,
  jackpot_carried_over NUMERIC DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);


-- DRAW ENTRIES (participations)
CREATE TABLE draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores_snapshot INTEGER[] NOT NULL, -- snapshot of user scores at draw time
  match_count INTEGER DEFAULT 0,
  match_tier TEXT,
  prize_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);


-- WINNERS
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  match_count INTEGER NOT NULL,
  match_tier TEXT NOT NULL,
  prize_amount NUMERIC NOT NULL,
  proof_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (
    verification_status IN ('pending', 'approved', 'rejected')
  ),
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid')
  ),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);


-- CHARITY CONTRIBUTIONS
CREATE TABLE charity_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  charity_id UUID NOT NULL REFERENCES charities(id),
  amount NUMERIC NOT NULL,
  percentage NUMERIC NOT NULL,
  billing_period TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- SUBSCRIPTION EVENTS (audit log)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_contributions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own; admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Scores: users manage own scores
CREATE POLICY "Users can manage own scores" ON scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all scores" ON scores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draws: public can view published draws; admin can manage all
CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Entries: users see own entries
CREATE POLICY "Users can view own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage draw entries" ON draw_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Winners: users see own winnings
CREATE POLICY "Users can view own winnings" ON winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage winners" ON winners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Charities: public read
CREATE POLICY "Anyone can view active charities" ON charities FOR SELECT USING (active = TRUE);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Contributions: users see own
CREATE POLICY "Users can view own contributions" ON charity_contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all contributions" ON charity_contributions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SEED: Sample Charities
INSERT INTO charities (name, description, featured, active) VALUES
  ('Children First Foundation', 'Supporting underprivileged children through education and nutrition programmes across the UK.', TRUE, TRUE),
  ('Green Earth Initiative', 'Planting trees and restoring natural habitats with community-led conservation projects.', FALSE, TRUE),
  ('Veterans Support Network', 'Mental health and housing support for military veterans and their families.', TRUE, TRUE),
  ('Sports for All', 'Making sport accessible to young people regardless of background or ability.', FALSE, TRUE),
  ('Alzheimer''s Research Trust', 'Funding breakthrough research into dementia prevention and treatment.', FALSE, TRUE);

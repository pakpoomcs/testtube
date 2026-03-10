-- Add extended profile fields used by ProfileScreen and PreferencesContext.
-- Also allow anonymous (unauthenticated) users to read exams and questions
-- so the homepage works before sign-in.

-- ── Profile columns ──

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name    text DEFAULT '',
  ADD COLUMN IF NOT EXISTS username     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS bio          text DEFAULT '',
  ADD COLUMN IF NOT EXISTS location     text DEFAULT '',
  ADD COLUMN IF NOT EXISTS website      text DEFAULT '',
  ADD COLUMN IF NOT EXISTS avatar_url   text DEFAULT '',
  ADD COLUMN IF NOT EXISTS self_assessed_level text,
  ADD COLUMN IF NOT EXISTS target_exams jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS daily_goal   integer DEFAULT 10,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- ── Allow anonymous reads on exams and questions ──
-- Current policies only allow `authenticated`. Add policies for `anon` so
-- logged-out visitors can browse the exam catalogue and take free tests.

CREATE POLICY "Anon can read exams"
  ON exams FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can read questions"
  ON questions FOR SELECT
  TO anon
  USING (true);

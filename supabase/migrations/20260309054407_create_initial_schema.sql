/*
  # Initial TestTube Database Schema

  ## Overview
  Creates the core database structure for the TestTube exam preparation platform.

  ## New Tables

  ### profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz)
  
  Stores user profile information and admin status.

  ### exams
  - `id` (uuid, primary key)
  - `name` (text) - Exam name in English (e.g., "IELTS")
  - `name_th` (text) - Exam name in Thai (optional)
  - `description` (text) - Brief description in English
  - `description_th` (text) - Brief description in Thai (optional)
  - `category` (text) - Category like "English", "Thai National", "Math", etc.
  - `difficulty` (text) - "Beginner", "Intermediate", or "Advanced"
  - `is_premium` (boolean, default false)
  - `created_at` (timestamptz)
  
  Stores exam metadata.

  ### questions
  - `id` (uuid, primary key)
  - `exam_id` (uuid, references exams)
  - `question_text` (text) - The question itself
  - `option_a` (text) - First answer option
  - `option_b` (text) - Second answer option
  - `option_c` (text) - Third answer option
  - `option_d` (text) - Fourth answer option
  - `correct_option` (text) - Letter of correct answer (a/b/c/d)
  - `explanation` (text) - Explanation of why answer is correct
  - `topic` (text) - Topic/subject area (e.g., "Grammar", "Vocabulary")
  - `difficulty` (text) - "Easy", "Medium", or "Hard"
  - `is_premium` (boolean, default false)
  - `created_at` (timestamptz)
  
  Stores individual exam questions.

  ### user_results
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `question_id` (uuid, references questions)
  - `exam_id` (uuid, references exams)
  - `selected_option` (text) - User's answer (a/b/c/d)
  - `is_correct` (boolean)
  - `created_at` (timestamptz)
  
  Tracks individual question answers by users.

  ### test_sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `exam_id` (uuid, references exams)
  - `score_percent` (integer) - Overall score percentage
  - `correct_count` (integer) - Number of correct answers
  - `total_count` (integer) - Total questions answered
  - `completed_at` (timestamptz, default now())
  
  Tracks complete test sessions and overall scores.

  ## Security (RLS)
  
  All tables have Row Level Security enabled.
  
  ### profiles
  - Users can read their own profile
  - Users can update their own profile (except is_admin field)
  - Admins can read all profiles
  
  ### exams
  - Anyone authenticated can read exams
  - Only admins can create/update/delete exams
  
  ### questions
  - Anyone authenticated can read questions
  - Only admins can create/update/delete questions
  
  ### user_results
  - Users can read their own results
  - Users can create their own results
  - Only admins can read all results
  
  ### test_sessions
  - Users can read their own sessions
  - Users can create their own sessions
  - Only admins can read all sessions

  ## Important Notes
  
  1. All tables use UUID primary keys with automatic generation
  2. All tables have created_at timestamps for auditing
  3. RLS is restrictive by default - explicit policies grant access
  4. Foreign key constraints ensure data integrity
  5. Default values prevent null-related issues
*/

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid()));

-- ============================================================================
-- EXAMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_th text DEFAULT '',
  description text NOT NULL,
  description_th text DEFAULT '',
  category text NOT NULL,
  difficulty text NOT NULL,
  is_premium boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read exams"
  ON exams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert exams"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update exams"
  ON exams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete exams"
  ON exams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL,
  explanation text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL,
  is_premium boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- USER_RESULTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  selected_option text NOT NULL,
  is_correct boolean NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own results"
  ON user_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all results"
  ON user_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert own results"
  ON user_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TEST_SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score_percent integer NOT NULL,
  correct_count integer NOT NULL,
  total_count integer NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON test_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all sessions"
  ON test_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can insert own sessions"
  ON test_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_results_user_id ON user_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_results_question_id ON user_results(question_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_exam_id ON test_sessions(exam_id);

-- ============================================================================
-- FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

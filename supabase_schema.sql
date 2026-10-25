-- =========================================================
-- MATURYTA - SUPABASE DATABASE SCHEMA WITH ROW LEVEL SECURITY
-- =========================================================

-- 1. Table: user_books
CREATE TABLE IF NOT EXISTS public.user_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  custom_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS for user_books
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own user_books"
  ON public.user_books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own user_books"
  ON public.user_books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user_books"
  ON public.user_books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own user_books"
  ON public.user_books FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Table: test_results
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for test_results
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own test_results"
  ON public.test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test_results"
  ON public.test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Table: user_missed_questions
CREATE TABLE IF NOT EXISTS public.user_missed_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options_json JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  times_failed INTEGER DEFAULT 1,
  mastered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS for user_missed_questions
ALTER TABLE public.user_missed_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own missed questions"
  ON public.user_missed_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missed questions"
  ON public.user_missed_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missed questions"
  ON public.user_missed_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missed questions"
  ON public.user_missed_questions FOR DELETE
  USING (auth.uid() = user_id);

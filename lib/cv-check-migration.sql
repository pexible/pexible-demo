-- SQL migration for the cv_check_results table.
-- Run this in the Supabase SQL Editor to enable Stufe 2 persistence.
-- Stufe 1 (free analysis) works without this table.

CREATE TABLE IF NOT EXISTS cv_check_results (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  original_score INTEGER NOT NULL DEFAULT 0,
  original_score_details JSONB,
  optimized_score INTEGER NOT NULL DEFAULT 0,
  optimized_score_details JSONB,
  changes_summary JSONB DEFAULT '[]'::jsonb,
  placeholders JSONB DEFAULT '[]'::jsonb,
  tips JSONB,
  optimized_sections JSONB DEFAULT '[]'::jsonb,
  files_expire_at TIMESTAMPTZ NOT NULL,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'expired', 'failed'))
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_cv_check_results_user_id ON cv_check_results(user_id);

-- Index for cleanup cron job
CREATE INDEX IF NOT EXISTS idx_cv_check_results_expire ON cv_check_results(files_expire_at) WHERE status = 'completed';

-- RLS policies
ALTER TABLE cv_check_results ENABLE ROW LEVEL SECURITY;

-- Users can read their own results
CREATE POLICY "Users can read own cv_check_results"
  ON cv_check_results FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (used by API routes via admin client)
-- No INSERT policy needed since we use the admin client (bypasses RLS)

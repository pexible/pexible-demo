-- SQL migration for the cv_check tables.
-- Run this in the Supabase SQL Editor.

-- Temporary token store for CV text between analysis and optimization.
-- Tokens are created anonymously during free analysis and consumed during paid optimization.
CREATE TABLE IF NOT EXISTS cv_tokens (
  token TEXT PRIMARY KEY,
  anonymized_text TEXT NOT NULL,
  contact_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'de',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If table already exists, add the language column:
-- ALTER TABLE cv_tokens ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'de';

-- Auto-delete expired tokens (older than 60 minutes)
-- If using pg_cron, schedule: SELECT delete_expired_cv_tokens();
CREATE OR REPLACE FUNCTION delete_expired_cv_tokens() RETURNS void AS $$
  DELETE FROM cv_tokens WHERE created_at < now() - interval '60 minutes';
$$ LANGUAGE sql;

-- No RLS on cv_tokens — only accessed via admin client (service role)
ALTER TABLE cv_tokens ENABLE ROW LEVEL SECURITY;

-- Results table for Stufe 2 optimization
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

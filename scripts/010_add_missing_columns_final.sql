-- Add missing columns to search_logs table to match the logger expectations
ALTER TABLE search_logs 
ADD COLUMN IF NOT EXISTS competitor_query TEXT,
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS user_ip INET,
ADD COLUMN IF NOT EXISTS presence_score INTEGER,
ADD COLUMN IF NOT EXISTS sentiment_score INTEGER,
ADD COLUMN IF NOT EXISTS coherence_score INTEGER,
ADD COLUMN IF NOT EXISTS google_results JSONB,
ADD COLUMN IF NOT EXISTS gpt_analysis JSONB;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_search_logs_session_id ON search_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_ip ON search_logs(user_ip);
CREATE INDEX IF NOT EXISTS idx_search_logs_presence_score ON search_logs(presence_score);
CREATE INDEX IF NOT EXISTS idx_search_logs_sentiment_score ON search_logs(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_search_logs_coherence_score ON search_logs(coherence_score);

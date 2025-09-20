-- Create search_logs table for storing all search analytics
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Search parameters
  type TEXT NOT NULL CHECK (type IN ('analyze', 'duel')),
  query TEXT NOT NULL,
  competitor_query TEXT, -- Only for duel mode
  language TEXT NOT NULL DEFAULT 'fr',
  
  -- Results data
  google_results JSONB,
  gpt_analysis JSONB,
  scores JSONB,
  
  -- Individual scores for easier querying
  presence_score NUMERIC,
  sentiment_score NUMERIC,
  coherence_score NUMERIC,
  
  -- Metadata
  user_ip TEXT,
  user_agent TEXT,
  session_id TEXT,
  processing_time INTEGER,
  error TEXT,
  
  -- Additional fields for analytics
  search_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED,
  search_hour INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM created_at)) STORED
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_type ON public.search_logs(type);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_date ON public.search_logs(search_date);
CREATE INDEX IF NOT EXISTS idx_search_logs_language ON public.search_logs(language);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON public.search_logs USING gin(to_tsvector('french', query));

-- Enable RLS (Row Level Security)
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on search_logs" ON public.search_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Create a view for easy analytics
CREATE OR REPLACE VIEW public.search_analytics AS
SELECT 
  search_date,
  type,
  language,
  COUNT(*) as total_searches,
  AVG(presence_score) as avg_presence_score,
  AVG(sentiment_score) as avg_sentiment_score,
  AVG(coherence_score) as avg_coherence_score,
  AVG(processing_time) as avg_processing_time,
  COUNT(DISTINCT user_ip) as unique_users,
  COUNT(CASE WHEN error IS NOT NULL THEN 1 END) as error_count
FROM public.search_logs
GROUP BY search_date, type, language
ORDER BY search_date DESC, type, language;

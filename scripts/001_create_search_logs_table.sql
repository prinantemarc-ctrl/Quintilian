-- Create search_logs table for storing all search analytics
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Search parameters
  search_type TEXT NOT NULL CHECK (search_type IN ('analyze', 'duel')),
  query TEXT NOT NULL,
  competitor_query TEXT, -- Only for duel mode
  
  -- Results data
  google_results JSONB,
  gpt_analysis JSONB,
  scores JSONB NOT NULL,
  
  -- Metadata
  user_ip TEXT,
  user_agent TEXT,
  session_id TEXT,
  processing_time_ms INTEGER,
  
  -- Additional fields for analytics
  search_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED,
  search_hour INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM created_at)) STORED
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_type ON public.search_logs(search_type);
CREATE INDEX IF NOT EXISTS idx_search_logs_search_date ON public.search_logs(search_date);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON public.search_logs USING gin(to_tsvector('french', query));

-- Enable RLS (Row Level Security) - for now allow all reads/writes
-- In production, you might want to restrict this based on admin roles
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on search_logs" ON public.search_logs
  FOR ALL USING (true) WITH CHECK (true);

-- Create a view for easy analytics
CREATE OR REPLACE VIEW public.search_analytics AS
SELECT 
  search_date,
  search_type,
  COUNT(*) as total_searches,
  AVG((scores->>'overall_score')::numeric) as avg_overall_score,
  AVG(processing_time_ms) as avg_processing_time_ms,
  COUNT(DISTINCT user_ip) as unique_users
FROM public.search_logs
GROUP BY search_date, search_type
ORDER BY search_date DESC, search_type;

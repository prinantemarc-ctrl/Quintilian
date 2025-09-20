-- Create table for shared analysis results
CREATE TABLE IF NOT EXISTS shared_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  language VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'simple',
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  view_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_shared_results_id ON shared_results(id);
CREATE INDEX IF NOT EXISTS idx_shared_results_created_at ON shared_results(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_results_expires_at ON shared_results(expires_at);

-- Enable Row Level Security
ALTER TABLE shared_results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to public results
CREATE POLICY "Allow public read access to public results" ON shared_results
  FOR SELECT USING (is_public = true AND expires_at > NOW());

-- Create policy to allow anyone to insert new shared results
CREATE POLICY "Allow public insert" ON shared_results
  FOR INSERT WITH CHECK (true);

-- Create policy to allow updating view count
CREATE POLICY "Allow view count updates" ON shared_results
  FOR UPDATE USING (true) WITH CHECK (true);

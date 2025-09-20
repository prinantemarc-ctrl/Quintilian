-- Complete database setup for SEO GPT Analyzer
-- This script creates all necessary tables, indexes, policies, and views

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create shared_results table for public sharing of analysis results
CREATE TABLE IF NOT EXISTS shared_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for shared_results
CREATE INDEX IF NOT EXISTS idx_shared_results_created_at ON shared_results(created_at);
CREATE INDEX IF NOT EXISTS idx_shared_results_expires_at ON shared_results(expires_at);
CREATE INDEX IF NOT EXISTS idx_shared_results_active ON shared_results(is_active) WHERE is_active = true;

-- Create search_logs table for admin analytics
CREATE TABLE IF NOT EXISTS search_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query TEXT NOT NULL,
    url TEXT,
    analysis_type VARCHAR(50) NOT NULL DEFAULT 'single',
    language VARCHAR(10) DEFAULT 'fr',
    results JSONB,
    scores JSONB,
    processing_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search_logs
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_analysis_type ON search_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_search_logs_language ON search_logs(language);
CREATE INDEX IF NOT EXISTS idx_search_logs_ip ON search_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_search_logs_error ON search_logs(error_message) WHERE error_message IS NOT NULL;

-- Create analytics view for search statistics
CREATE OR REPLACE VIEW search_analytics AS
SELECT 
    DATE(created_at) as date,
    analysis_type,
    language,
    COUNT(*) as total_searches,
    COUNT(CASE WHEN error_message IS NULL THEN 1 END) as successful_searches,
    COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as failed_searches,
    AVG(processing_time_ms) as avg_processing_time,
    COUNT(DISTINCT ip_address) as unique_users
FROM search_logs 
GROUP BY DATE(created_at), analysis_type, language
ORDER BY date DESC, analysis_type, language;

-- Row Level Security (RLS) policies

-- Enable RLS on shared_results
ALTER TABLE shared_results ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active shared results
CREATE POLICY "Public read access to active shared results" ON shared_results
    FOR SELECT USING (is_active = true AND expires_at > NOW());

-- Policy for insert (anyone can create shared results)
CREATE POLICY "Anyone can create shared results" ON shared_results
    FOR INSERT WITH CHECK (true);

-- Policy for update view count (anyone can increment view count)
CREATE POLICY "Anyone can update view count" ON shared_results
    FOR UPDATE USING (is_active = true AND expires_at > NOW())
    WITH CHECK (is_active = true AND expires_at > NOW());

-- Enable RLS on search_logs (admin only access)
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admin access to search logs (you'll need to implement admin role)
CREATE POLICY "Admin access to search logs" ON search_logs
    FOR ALL USING (true); -- For now, allow all access. Implement proper admin role later.

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on search_logs
CREATE TRIGGER update_search_logs_updated_at 
    BEFORE UPDATE ON search_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired shared results
CREATE OR REPLACE FUNCTION cleanup_expired_shared_results()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM shared_results 
    WHERE expires_at < NOW() OR (created_at < NOW() - INTERVAL '90 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired results (runs daily)
-- Note: This requires pg_cron extension which may not be available in all environments
-- SELECT cron.schedule('cleanup-expired-results', '0 2 * * *', 'SELECT cleanup_expired_shared_results();');

COMMENT ON TABLE shared_results IS 'Stores publicly shareable analysis results with expiration';
COMMENT ON TABLE search_logs IS 'Stores all search queries and results for analytics and debugging';
COMMENT ON VIEW search_analytics IS 'Aggregated search statistics by date, type, and language';

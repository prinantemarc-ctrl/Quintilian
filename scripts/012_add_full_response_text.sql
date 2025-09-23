-- Add full_response_text column to search_logs table
ALTER TABLE search_logs 
ADD COLUMN full_response_text TEXT;

-- Add index for better performance when searching through response text
CREATE INDEX IF NOT EXISTS idx_search_logs_full_response_text 
ON search_logs USING gin(to_tsvector('french', full_response_text));

-- Add comment to document the column
COMMENT ON COLUMN search_logs.full_response_text IS 'Complete text response from the analysis for user consultation';

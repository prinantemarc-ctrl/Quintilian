-- Add missing columns to search_logs table
ALTER TABLE search_logs 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'analyze',
ADD COLUMN IF NOT EXISTS error TEXT;

-- Update existing records to have a default type
UPDATE search_logs SET type = 'analyze' WHERE type IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_search_logs_type ON search_logs(type);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

-- Add missing columns to search_logs table
ALTER TABLE search_logs 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'search',
ADD COLUMN IF NOT EXISTS error TEXT;

-- Update existing records to have a default type
UPDATE search_logs SET type = 'search' WHERE type IS NULL;

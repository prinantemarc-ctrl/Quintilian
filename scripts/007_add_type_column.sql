-- Add missing 'type' column to search_logs table
ALTER TABLE search_logs 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'analyze';

-- Update existing records to have a default type
UPDATE search_logs 
SET type = 'analyze' 
WHERE type IS NULL;

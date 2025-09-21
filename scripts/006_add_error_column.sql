-- Add error column to search_logs table for better error tracking
ALTER TABLE search_logs 
ADD COLUMN IF NOT EXISTS error TEXT;

-- Add index for error column for faster queries
CREATE INDEX IF NOT EXISTS idx_search_logs_error ON search_logs(error);

-- Update existing records to have NULL error (successful searches)
UPDATE search_logs SET error = NULL WHERE error IS NULL;

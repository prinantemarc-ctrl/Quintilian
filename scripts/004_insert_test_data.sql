-- Insert test data for search_logs
INSERT INTO search_logs (
  id,
  query,
  url,
  analysis_type,
  language,
  results,
  scores,
  processing_time_ms,
  ip_address,
  user_agent,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'test query 1',
  'https://example.com',
  'seo',
  'fr',
  '{"title": "Test Title", "description": "Test Description"}',
  '{"seo_score": 85, "performance_score": 90}',
  1500,
  '192.168.1.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  'test query 2',
  'https://example2.com',
  'seo',
  'fr',
  '{"title": "Test Title 2", "description": "Test Description 2"}',
  '{"seo_score": 75, "performance_score": 80}',
  2000,
  '192.168.1.2',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
),
(
  gen_random_uuid(),
  'test query 3',
  'https://example3.com',
  'seo',
  'fr',
  '{"title": "Test Title 3", "description": "Test Description 3"}',
  '{"seo_score": 95, "performance_score": 85}',
  1200,
  '192.168.1.3',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
  NOW() - INTERVAL '10 minutes',
  NOW() - INTERVAL '10 minutes'
);

-- Insert test data for search_analytics
INSERT INTO search_analytics (
  date,
  analysis_type,
  language,
  total_searches,
  successful_searches,
  failed_searches,
  avg_processing_time,
  unique_users
) VALUES 
(
  CURRENT_DATE,
  'seo',
  'fr',
  3,
  3,
  0,
  1566.67,
  3
),
(
  CURRENT_DATE - INTERVAL '1 day',
  'seo',
  'fr',
  5,
  4,
  1,
  1800.00,
  4
);

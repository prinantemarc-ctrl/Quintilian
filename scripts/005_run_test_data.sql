-- Execute the test data insertion
-- This script runs the test data from 004_insert_test_data.sql

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
  'Analyse SEO site e-commerce',
  'https://boutique-exemple.fr',
  'analyze',
  'fr',
  '{"title": "Boutique en ligne - Vêtements tendance", "description": "Découvrez notre collection de vêtements à la mode", "h1": "Bienvenue dans notre boutique", "meta_keywords": "vêtements, mode, boutique"}',
  '{"seo_score": 85, "performance_score": 90, "accessibility_score": 88}',
  1500,
  '192.168.1.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'Comparaison SEO concurrents',
  'https://concurrent-exemple.fr',
  'duel',
  'fr',
  '{"title": "Site concurrent - Services", "description": "Services professionnels de qualité", "h1": "Nos services", "meta_keywords": "services, professionnel, qualité"}',
  '{"seo_score": 75, "performance_score": 80, "accessibility_score": 82}',
  2000,
  '192.168.1.2',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  'Audit technique site vitrine',
  'https://vitrine-exemple.fr',
  'analyze',
  'fr',
  '{"title": "Entreprise XYZ - Accueil", "description": "Votre partenaire de confiance depuis 20 ans", "h1": "Entreprise XYZ", "meta_keywords": "entreprise, services, confiance"}',
  '{"seo_score": 95, "performance_score": 85, "accessibility_score": 91}',
  1200,
  '192.168.1.3',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
),
(
  gen_random_uuid(),
  'Analyse mobile-first',
  'https://mobile-exemple.fr',
  'analyze',
  'fr',
  '{"title": "Site Mobile Optimisé", "description": "Expérience mobile parfaite", "h1": "Mobile First", "meta_keywords": "mobile, responsive, optimisation"}',
  '{"seo_score": 88, "performance_score": 95, "accessibility_score": 89}',
  980,
  '192.168.1.4',
  'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '15 minutes'
),
(
  gen_random_uuid(),
  'Duel SEO restaurants',
  'https://restaurant-a.fr',
  'duel',
  'fr',
  '{"title": "Restaurant Le Gourmet", "description": "Cuisine française traditionnelle", "h1": "Bienvenue au Gourmet", "meta_keywords": "restaurant, cuisine, française"}',
  '{"seo_score": 78, "performance_score": 72, "accessibility_score": 85}',
  1800,
  '192.168.1.5',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '45 minutes'
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
  'analyze',
  'fr',
  3,
  3,
  0,
  1226.67,
  3
),
(
  CURRENT_DATE,
  'duel',
  'fr',
  2,
  2,
  0,
  1900.00,
  2
),
(
  CURRENT_DATE - INTERVAL '1 day',
  'analyze',
  'fr',
  5,
  4,
  1,
  1600.00,
  4
),
(
  CURRENT_DATE - INTERVAL '1 day',
  'duel',
  'fr',
  3,
  3,
  0,
  1750.00,
  3
);

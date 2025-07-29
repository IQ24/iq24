-- Development Seed Data for IQ24.ai
-- Creates admin user: admin@iq24.ai / admin123

-- Insert development admin user
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@iq24.ai',
  '$2a$10$DGnzVg6rBZ0ZVhEjkjNzXOZmPr8.6JpkQCfKnRU9qZCkXjNzYPl6u', -- password: admin123
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "avatar_url": ""}',
  false
);

-- Insert development team
INSERT INTO public.teams (
  id,
  name,
  created_at,
  updated_at
) VALUES (
  'team_dev_001',
  'IQ24 Development Team',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert development user profile
INSERT INTO public.users (
  id,
  team_id,
  email,
  full_name,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'team_dev_001',
  'admin@iq24.ai',
  'Admin User',
  '',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create some sample data for testing dashboard features
INSERT INTO public.campaigns (
  id,
  team_id,
  name,
  status,
  created_at,
  updated_at
) VALUES 
  ('camp_001', 'team_dev_001', 'Q1 Growth Campaign', 'active', NOW(), NOW()),
  ('camp_002', 'team_dev_001', 'Lead Nurturing Sequence', 'active', NOW(), NOW()),
  ('camp_003', 'team_dev_001', 'Product Launch Campaign', 'draft', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create some sample prospects
INSERT INTO public.prospects (
  id,
  team_id,
  email,
  full_name,
  company,
  title,
  industry,
  lead_score,
  status,
  created_at,
  updated_at
) VALUES 
  ('pro_001', 'team_dev_001', 'john.doe@example.com', 'John Doe', 'Tech Corp', 'CEO', 'Technology', 85, 'qualified', NOW(), NOW()),
  ('pro_002', 'team_dev_001', 'jane.smith@example.com', 'Jane Smith', 'Growth Inc', 'CMO', 'Marketing', 92, 'hot', NOW(), NOW()),
  ('pro_003', 'team_dev_001', 'bob.wilson@example.com', 'Bob Wilson', 'Scale Co', 'VP Sales', 'SaaS', 78, 'warm', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert webhook configuration
SELECT vault.create_secret('http://localhost:3001/api', 'WEBHOOK_ENDPOINT', 'Webhook endpoint URL');
SELECT vault.create_secret('6c369443-1a88-444e-b459-7e662c1fff9e', 'WEBHOOK_SECRET', 'Webhook secret key');
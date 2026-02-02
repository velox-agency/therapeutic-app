-- ============================================
-- Demo Data for Therapeutic App
-- Run this to populate app with demo content for testing/presentation
-- ============================================

-- ============================================
-- Instructions for Manual Demo Setup:
-- ============================================
-- 
-- The best way to set up demo data is through the app itself, as it ensures
-- proper relationships and RLS policies are respected. However, you can use
-- the queries below as templates after creating accounts.
--
-- 1. Create a parent account through the app signup:
--    - Email: demo.parent@therapeutic.app
--    - Password: Demo123!
--
-- 2. Create a therapist account:
--    - Email: demo.therapist@therapeutic.app
--    - Password: Demo123!
--
-- 3. Add 2 children through the "Add Child" flow
-- 4. Complete an M-CHAT-R screening for one child
-- 5. Create 2-3 goals manually or via therapist account
-- 6. Log daily progress for a few days to show charts
-- 7. Resources are already seeded from migration 003

-- ============================================
-- Template Queries (Replace IDs after signup)
-- ============================================

-- Get parent user ID after signup:
-- SELECT id FROM auth.users WHERE email = 'demo.parent@therapeutic.app';

-- Get therapist user ID after signup:
-- SELECT id FROM auth.users WHERE email = 'demo.therapist@therapeutic.app';

-- Demo Children (replace PARENT_USER_ID with actual parent user ID)
-- INSERT INTO children (parent_id, first_name, birth_date, gender, total_stars)
-- VALUES 
--   ('PARENT_USER_ID', 'Emma', '2021-03-15', 'Female', 45),
--   ('PARENT_USER_ID', 'Liam', '2022-07-22', 'Male', 28);

-- Demo Screening (replace CHILD_ID with actual child ID)
-- INSERT INTO screenings (child_id, age_at_screening, completed_at, risk_level, total_score)
-- VALUES 
--   ('CHILD_ID', 36, NOW(), 'medium', 5);

-- Demo Patient-Therapist Relationship
-- INSERT INTO patient_therapist (child_id, therapist_id)
-- VALUES ('CHILD_ID', 'THERAPIST_USER_ID');

-- Demo Goals (replace CHILD_ID and THERAPIST_ID with actual IDs)
-- INSERT INTO goals (child_id, created_by, title, description, category, priority, target_value, unit, frequency_period, target_frequency, status)
-- VALUES
--   ('CHILD_ID', 'THERAPIST_ID', 'Eye Contact Practice', 'Maintain eye contact during conversations for 5 seconds', 'communication', 'high', 5, 'seconds', 'daily', 1, 'active'),
--   ('CHILD_ID', 'THERAPIST_ID', 'Respond to Name', 'Child responds when name is called within 3 attempts', 'communication', 'medium', 3, 'responses', 'daily', 1, 'active'),
--   ('CHILD_ID', 'THERAPIST_ID', 'Share Toys', 'Willingly shares toys with peers during play time', 'social', 'medium', 2, 'times', 'daily', 1, 'active'),
--   ('CHILD_ID', 'THERAPIST_ID', 'Follow 2-Step Instructions', 'Successfully follows two-step verbal instructions', 'communication', 'high', 3, 'instructions', 'daily', 1, 'active');

-- Demo Daily Logs (creates progress history for nice charts)
-- INSERT INTO daily_logs (goal_id, child_id, logged_by, achieved_value, stars_earned, log_date, notes)
-- VALUES
--   ('GOAL_ID', 'CHILD_ID', 'PARENT_ID', 3, 2, CURRENT_DATE - INTERVAL '4 days', 'Good focus today'),
--   ('GOAL_ID', 'CHILD_ID', 'PARENT_ID', 4, 2, CURRENT_DATE - INTERVAL '3 days', 'Making progress!'),
--   ('GOAL_ID', 'CHILD_ID', 'PARENT_ID', 5, 3, CURRENT_DATE - INTERVAL '2 days', 'Excellent session!'),
--   ('GOAL_ID', 'CHILD_ID', 'PARENT_ID', 4, 2, CURRENT_DATE - INTERVAL '1 day', 'Maintained yesterday''s progress'),
--   ('GOAL_ID', 'CHILD_ID', 'PARENT_ID', 5, 3, CURRENT_DATE, 'Goal achieved! 🎉');

-- Demo Sessions (replace PATIENT_THERAPIST_ID with actual relationship ID)
-- INSERT INTO sessions (patient_therapist_id, scheduled_at, duration_minutes, status, location)
-- VALUES
--   ('PATIENT_THERAPIST_ID', NOW() + INTERVAL '2 days', 45, 'scheduled', 'Home Visit'),
--   ('PATIENT_THERAPIST_ID', NOW() + INTERVAL '7 days', 60, 'scheduled', 'Clinic Room 3'),
--   ('PATIENT_THERAPIST_ID', NOW() - INTERVAL '7 days', 45, 'completed', 'Home Visit'),
--   ('PATIENT_THERAPIST_ID', NOW() - INTERVAL '14 days', 60, 'completed', 'Virtual Session');

-- ============================================
-- Quick Stats Check Queries
-- ============================================

-- Check parent's children count:
-- SELECT COUNT(*) FROM children WHERE parent_id = 'PARENT_USER_ID';

-- Check total screenings:
-- SELECT COUNT(*) FROM screenings s 
-- JOIN children c ON s.child_id = c.id 
-- WHERE c.parent_id = 'PARENT_USER_ID';

-- Check total sessions:
-- SELECT COUNT(*) FROM sessions s
-- JOIN patient_therapist pt ON s.patient_therapist_id = pt.id
-- JOIN children c ON pt.child_id = c.id
-- WHERE c.parent_id = 'PARENT_USER_ID';

-- Check total stars:
-- SELECT SUM(total_stars) FROM children WHERE parent_id = 'PARENT_USER_ID';

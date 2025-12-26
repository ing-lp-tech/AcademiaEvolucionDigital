-- DANGER: This script wipes all application data
-- Run this in Supabase SQL Editor to "Reset" the app

-- 1. Truncate tables (Cascade deletes dependent rows)
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- 2. Optional: If you want to delete the actual Users from Auth (requires access to auth schema)
-- DELETE FROM auth.users WHERE email NOT IN ('gonzaromero789@gmail.com', 'xphard@gmail.com', 'ing.lp.tech@gmail.com');

-- 3. Reset ID sequences if needed (optional)
-- ALTER SEQUENCE courses_id_seq RESTART WITH 1;

-- 4. Re-insert Owners/Admins if they were deleted? 
-- You will need to Sign Up again.

-- 1. Updates to profiles table
-- Add is_approved column (default true for students, will need logic/trigger for teachers or default false)
ALTER TABLE profiles 
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;

-- Update existing profiles to be approved (optional, to avoid locking out current users)
UPDATE profiles SET is_approved = TRUE;

-- Create a function/trigger to set is_approved based on role if needed
-- For now, we'll handle it via default FALSE and manual approval for teachers, 
-- or we can set default TRUE and only enforce for 'teacher' role in RLS/App logic.
-- Let's stick to: Students = Auto Approved (or default TRUE), Teachers = Pending (FALSE).
-- Ideally, we'd use a trigger, but for simplicity let's make the column default FALSE
-- and update the registration logic to set it to TRUE for students, or handle it in the app.

-- 2. Updates to lessons table
ALTER TABLE lessons 
ADD COLUMN mux_playback_id TEXT;

-- 3. RLS Policies for Admin Access
-- We need a way to identify admins. We can use a specific list of emails in the policy 
-- or add a 'role' check if we had an 'admin' role. 
-- The user specified 3 emails: gonzaromero789@gmail.com, xphard@gmail.com, ing.lp.tech@gmail.com

-- Policy to allow Admins to read/update ALL profiles
CREATE POLICY "Admins can manage all profiles"
ON profiles
FOR ALL
USING (
  auth.email() IN ('gonzaromero789@gmail.com', 'xphard@gmail.com', 'ing.lp.tech@gmail.com')
);

-- Policy to allow authenticated users to read lessons (already likely exists, but confirming)
-- The user asked for: "solo los usuarios autenticados (authenticated) puedan leer los datos de esa tabla"
CREATE POLICY "Authenticated users can view lessons"
ON lessons
FOR SELECT
TO authenticated
USING (true);

-- Ensure teachers can only update their own lessons (existing policy likely handles this by course owner)

-- 4. Set specific users as 'admin' role (Optional, if we want to use the role column)
-- UPDATE profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email IN ('...'));

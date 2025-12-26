-- 1. Create the Function to handle new user headers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student'), -- Default to student if missing
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'teacher' THEN false -- Teachers need approval
      ELSE true -- Students auto-approved
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. KEY STEP: Backfill missing profiles for existing users
-- This fixes the "Invisible Teacher" issue immediately.
INSERT INTO public.profiles (id, email, full_name, role, is_approved)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    COALESCE(raw_user_meta_data->>'role', 'student'),
    CASE 
        WHEN raw_user_meta_data->>'role' = 'teacher' THEN false 
        ELSE true 
    END
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

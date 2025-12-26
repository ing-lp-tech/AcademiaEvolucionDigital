-- 1. Add Missing Columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 2. Create/Update Trigger Function (Now that columns exist)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'teacher' THEN false -- Teachers need approval
      ELSE true -- Students auto-approved
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = EXCLUDED.role, -- Update role if it changed or was set
    is_approved = COALESCE(profiles.is_approved, EXCLUDED.is_approved); -- Preserve approval if exists
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Backfill Data (Fixing invisible users)
-- Updates existing profiles with missing email/approval, creates missing profiles
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
ON CONFLICT (id) DO UPDATE
SET 
    email = EXCLUDED.email,
    is_approved = COALESCE(profiles.is_approved, EXCLUDED.is_approved);

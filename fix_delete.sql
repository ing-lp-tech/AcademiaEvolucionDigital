-- 1. Fix Foreign Keys to Allow Deletion (Cascade)
-- This ensures that if a User is deleted, their Profile is deleted.
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- This ensures that if a Teacher (Profile) is deleted, their Courses are deleted.
ALTER TABLE public.courses
DROP CONSTRAINT IF EXISTS courses_teacher_id_fkey,
ADD CONSTRAINT courses_teacher_id_fkey
FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- (Lessons should already cascade from Courses, but let's be safe if setup manually)
-- Verify Logic: Lessons -> Courses. If Course deleted -> Lessons deleted. (Usually default, but good to know).


-- 2. Create a Secure Function to Delete Users (Only for Owner)
-- This function allows the UI to call "delete user" securely.
CREATE OR REPLACE FUNCTION delete_user_by_owner(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high privileges to delete from auth.users
AS $$
DECLARE
  requesting_user_email TEXT;
BEGIN
  -- Get the email of the user calling this function
  SELECT email INTO requesting_user_email FROM auth.users WHERE id = auth.uid();

  -- HARDCODED SECURITY CHECK: Only the specific Owner email can run this
  IF requesting_user_email = 'ing.lp.tech@gmail.com' THEN
    
    -- Delete the user from Auth (Cascade will handle public tables)
    DELETE FROM auth.users WHERE id = target_user_id;
    
  ELSE
    RAISE EXCEPTION 'Acceso denegado: Solo el dueño puede eliminar usuarios.';
  END IF;
END;
$$;

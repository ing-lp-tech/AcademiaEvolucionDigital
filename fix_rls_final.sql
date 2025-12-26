-- 1. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to be safe (avoid duplicates)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owner can update everyone" ON public.profiles;
DROP POLICY IF EXISTS "Owner can delete everyone" ON public.profiles;

-- 3. Create permissive policies for visibility
-- POLICY: Everyone can see profiles (Required for Admin Dash + Students seeing Instructor info)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING ( true );

-- POLICY: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ( auth.uid() = id );

-- POLICY: Owner can update any profile (For Approval logic)
CREATE POLICY "Owner can update everyone" 
ON public.profiles FOR UPDATE 
USING ( auth.email() = 'ing.lp.tech@gmail.com' ); 
-- Note: auth.email() is cleaner than ID for hardcoded owner logic, though auth.jwt() -> email check is standard

-- POLICY: Owner can delete profiles (though we use RPC, this allows direct table delete if needed)
CREATE POLICY "Owner can delete everyone" 
ON public.profiles FOR DELETE 
USING ( auth.email() = 'ing.lp.tech@gmail.com' );

-- 4. Insert Policy (Trigger handles insert usually, but standard insert allowed)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

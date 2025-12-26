-- Fix RLS to use JWT instead of querying auth.users table (which causes permission denied)

DROP POLICY IF EXISTS "Owner can update everyone" ON public.profiles;
DROP POLICY IF EXISTS "Owner can delete everyone" ON public.profiles;

CREATE POLICY "Owner can update everyone" 
ON public.profiles FOR UPDATE 
USING ( 
  (auth.jwt() ->> 'email') = 'ing.lp.tech@gmail.com'
);

CREATE POLICY "Owner can delete everyone" 
ON public.profiles FOR DELETE 
USING ( 
  (auth.jwt() ->> 'email') = 'ing.lp.tech@gmail.com'
);

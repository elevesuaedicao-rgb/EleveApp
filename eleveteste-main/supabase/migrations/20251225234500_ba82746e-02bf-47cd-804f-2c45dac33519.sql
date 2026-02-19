-- Add INSERT policy for user_roles to allow users to create their own role during onboarding
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
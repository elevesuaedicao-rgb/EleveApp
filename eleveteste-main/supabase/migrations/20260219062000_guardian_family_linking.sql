-- Add explicit family linking state for onboarding and anti-duplication safeguards
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS family_link_status TEXT NOT NULL DEFAULT 'none'
CHECK (family_link_status IN ('linked', 'pending', 'none')),
ADD COLUMN IF NOT EXISTS family_join_intent TEXT NOT NULL DEFAULT 'unset'
CHECK (family_join_intent IN ('create', 'join_now', 'join_later', 'unset'));

-- Backfill status for already linked users
UPDATE public.profiles p
SET family_link_status = 'linked'
WHERE EXISTS (
  SELECT 1
  FROM public.family_members fm
  WHERE fm.profile_id = p.id
);

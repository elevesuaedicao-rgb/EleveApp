-- =============================================
-- FASE 1: MIGRAÇÕES COMPLETAS
-- =============================================

-- 1.1 Criar tabela schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, city, state)
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view schools"
ON public.schools FOR SELECT
TO authenticated
USING (true);

-- 1.2 Alterar tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS grade_year TEXT,
ADD COLUMN IF NOT EXISTS age INTEGER;

-- 1.3 Criar tabela families (SEM policy ainda)
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- 1.4 Criar tabela family_members com RLS
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  member_role TEXT NOT NULL CHECK (member_role IN ('parent', 'student')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, profile_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Policy única para family_members
CREATE POLICY "Users can view their family members"
ON public.family_members FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid() 
  OR family_id IN (
    SELECT family_id FROM public.family_members WHERE profile_id = auth.uid()
  )
);

-- 1.5 Policy para families (DEPOIS de family_members existir)
CREATE POLICY "Users can view their families"
ON public.families FOR SELECT
TO authenticated
USING (
  id IN (SELECT family_id FROM public.family_members WHERE profile_id = auth.uid())
);

-- 1.6 Proteção padrão para funções
ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 1.7 RPC create_family_for_parent
CREATE OR REPLACE FUNCTION public.create_family_for_parent(parent_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_family_id UUID;
  v_attempts INTEGER := 0;
BEGIN
  -- Validar que o chamador é o próprio parent_id
  IF auth.uid() IS NULL OR auth.uid() != parent_id THEN
    RAISE EXCEPTION 'Unauthorized: caller must match parent_id';
  END IF;
  
  -- Validar que o usuário tem role = parent
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = parent_id AND role = 'parent') THEN
    RAISE EXCEPTION 'User is not a parent';
  END IF;
  
  -- Validar que o pai não pertence a outra família
  IF EXISTS (SELECT 1 FROM public.family_members WHERE profile_id = parent_id) THEN
    RAISE EXCEPTION 'Parent already belongs to a family';
  END IF;
  
  -- Gerar código único (6 chars uppercase)
  LOOP
    v_code := upper(substr(md5(random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.families WHERE code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique code';
    END IF;
  END LOOP;
  
  -- Criar família
  INSERT INTO public.families (code) VALUES (v_code) RETURNING id INTO v_family_id;
  
  -- Adicionar pai como membro
  INSERT INTO public.family_members (family_id, profile_id, member_role)
  VALUES (v_family_id, parent_id, 'parent');
  
  RETURN v_code;
END;
$$;

-- 1.8 Drop e criar RPC join_family_by_code
DROP FUNCTION IF EXISTS public.join_family_by_code(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.join_family_by_code(p_profile_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id UUID;
  v_role TEXT;
BEGIN
  -- Validar que o chamador é o próprio profile_id
  IF auth.uid() IS NULL OR auth.uid() != p_profile_id THEN
    RAISE EXCEPTION 'Unauthorized: caller must match profile_id';
  END IF;
  
  -- Buscar role do usuário
  SELECT role::TEXT INTO v_role FROM public.user_roles WHERE user_id = p_profile_id LIMIT 1;
  
  -- Validar que não é professor
  IF v_role = 'teacher' THEN
    RAISE EXCEPTION 'Teachers cannot join families';
  END IF;
  
  -- Se for pai, validar que não pertence a outra família
  IF v_role = 'parent' THEN
    IF EXISTS (SELECT 1 FROM public.family_members WHERE profile_id = p_profile_id) THEN
      RAISE EXCEPTION 'Parent already belongs to a family';
    END IF;
  END IF;
  
  -- Buscar família pelo código
  SELECT id INTO v_family_id FROM public.families WHERE code = upper(p_code);
  
  IF v_family_id IS NULL THEN
    RAISE EXCEPTION 'Family code not found';
  END IF;
  
  -- Inserir membro (ON CONFLICT DO NOTHING para evitar duplicatas)
  INSERT INTO public.family_members (family_id, profile_id, member_role)
  VALUES (v_family_id, p_profile_id, v_role)
  ON CONFLICT (family_id, profile_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- 1.9 REVOKE/GRANT nas RPCs
REVOKE ALL ON FUNCTION public.create_family_for_parent(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_family_for_parent(UUID) TO authenticated;

REVOKE ALL ON FUNCTION public.join_family_by_code(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_family_by_code(UUID, TEXT) TO authenticated;

-- 1.10 Atualizar trigger handle_new_user com UPSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$;

-- 1.11 Inserir escolas de exemplo
INSERT INTO public.schools (name, city, state) VALUES
  ('Colégio São Paulo', 'São Paulo', 'SP'),
  ('Escola Estadual Central', 'Rio de Janeiro', 'RJ'),
  ('Instituto Educacional Mineiro', 'Belo Horizonte', 'MG'),
  ('Colégio Santa Maria', 'Curitiba', 'PR'),
  ('Escola Municipal Recife', 'Recife', 'PE')
ON CONFLICT (name, city, state) DO NOTHING;
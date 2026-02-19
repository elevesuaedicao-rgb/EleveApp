-- =====================================================
-- MIGRAÇÃO COMPLETA: Sistema de Ensino
-- =====================================================

-- 1. Adicionar coluna phone em profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text;

-- 2. Criar enum para status de relacionamento
DO $$ BEGIN
    CREATE TYPE public.relationship_status AS ENUM ('active', 'pending', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Criar enum para status de ticket
DO $$ BEGIN
    CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Criar enum para tipo de transação
DO $$ BEGIN
    CREATE TYPE public.transaction_type AS ENUM ('class_fee', 'payment', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Criar enum para status de transação
DO $$ BEGIN
    CREATE TYPE public.transaction_status AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Criar enum para tipo de chave PIX
DO $$ BEGIN
    CREATE TYPE public.pix_key_type AS ENUM ('cpf', 'cnpj', 'email', 'phone', 'random');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABELA: teacher_student_relationships
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teacher_student_relationships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    status relationship_status NOT NULL DEFAULT 'pending',
    mode text CHECK (mode IN ('online', 'presencial')) DEFAULT 'presencial',
    price_per_hour numeric(10,2) DEFAULT 0,
    price_per_90min numeric(10,2) DEFAULT 0,
    price_per_2h numeric(10,2) DEFAULT 0,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(teacher_id, student_id)
);

ALTER TABLE public.teacher_student_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their relationships"
ON public.teacher_student_relationships FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage their relationships"
ON public.teacher_student_relationships FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their relationships"
ON public.teacher_student_relationships FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Parents can view children relationships"
ON public.teacher_student_relationships FOR SELECT
USING (auth.uid() = parent_id);

-- =====================================================
-- TABELA: learning_history (Histórico Pedagógico)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.learning_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes integer NOT NULL DEFAULT 60,
    topics_covered text[] DEFAULT '{}',
    observations text,
    homework text,
    student_performance text CHECK (student_performance IN ('excellent', 'good', 'regular', 'needs_improvement')),
    next_steps text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.learning_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage learning history"
ON public.learning_history FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view their history"
ON public.learning_history FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Parents can view children history"
ON public.learning_history FOR SELECT
USING (student_id IN (SELECT get_linked_students(auth.uid())));

-- =====================================================
-- TABELA: question_tickets (Sistema de Dúvidas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.question_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text NOT NULL,
    sub_topics text[] DEFAULT '{}',
    status ticket_status NOT NULL DEFAULT 'open',
    priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    
    -- Resposta do professor
    teacher_response text,
    response_steps text[] DEFAULT '{}',
    difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    media_urls text[] DEFAULT '{}',
    
    responded_at timestamptz,
    resolved_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.question_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their tickets"
ON public.question_tickets FOR ALL
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view and respond to tickets"
ON public.question_tickets FOR ALL
USING (has_role(auth.uid(), 'teacher'::user_role));

CREATE POLICY "Parents can view children tickets"
ON public.question_tickets FOR SELECT
USING (student_id IN (SELECT get_linked_students(auth.uid())));

-- =====================================================
-- TABELA: teacher_payment_info (Dados PIX do Professor)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teacher_payment_info (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    pix_key text NOT NULL,
    pix_key_type pix_key_type NOT NULL,
    holder_name text NOT NULL,
    bank_name text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.teacher_payment_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their payment info"
ON public.teacher_payment_info FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Parents can view teacher payment info for payments"
ON public.teacher_payment_info FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.teacher_student_relationships tsr
        WHERE tsr.teacher_id = teacher_payment_info.teacher_id
        AND tsr.parent_id = auth.uid()
    )
);

-- =====================================================
-- TABELA: financial_transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
    type transaction_type NOT NULL,
    amount numeric(10,2) NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    description text,
    due_date date,
    paid_at timestamptz,
    reference_month date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their transactions"
ON public.financial_transactions FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can manage transactions"
ON public.financial_transactions FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Parents can view their transactions"
ON public.financial_transactions FOR SELECT
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can update payment status"
ON public.financial_transactions FOR UPDATE
USING (auth.uid() = parent_id);

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_teacher_student_relationships') THEN
        CREATE TRIGGER set_updated_at_teacher_student_relationships
        BEFORE UPDATE ON public.teacher_student_relationships
        FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_learning_history') THEN
        CREATE TRIGGER set_updated_at_learning_history
        BEFORE UPDATE ON public.learning_history
        FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_question_tickets') THEN
        CREATE TRIGGER set_updated_at_question_tickets
        BEFORE UPDATE ON public.question_tickets
        FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_teacher_payment_info') THEN
        CREATE TRIGGER set_updated_at_teacher_payment_info
        BEFORE UPDATE ON public.teacher_payment_info
        FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_financial_transactions') THEN
        CREATE TRIGGER set_updated_at_financial_transactions
        BEFORE UPDATE ON public.financial_transactions
        FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
    END IF;
END $$;

-- =====================================================
-- ÍNDICES para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_teacher ON public.teacher_student_relationships(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_relationships_student ON public.teacher_student_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_student ON public.learning_history(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_teacher ON public.learning_history(teacher_id);
CREATE INDEX IF NOT EXISTS idx_learning_history_date ON public.learning_history(date);
CREATE INDEX IF NOT EXISTS idx_question_tickets_student ON public.question_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_question_tickets_status ON public.question_tickets(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_teacher ON public.financial_transactions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_parent ON public.financial_transactions(parent_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_student ON public.financial_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference_month ON public.financial_transactions(reference_month);
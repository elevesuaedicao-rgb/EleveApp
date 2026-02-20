
-- Create enums
DO $$ BEGIN
    CREATE TYPE public.class_modality AS ENUM ('remote', 'in_person');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.topic_trend AS ENUM ('improving', 'stable', 'worsening');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add modality to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS modality class_modality DEFAULT 'remote';

-- Student Agreements
CREATE TABLE IF NOT EXISTS public.student_agreements (
  student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  price_remote_60 NUMERIC DEFAULT 50,
  price_remote_90 NUMERIC DEFAULT 70,
  price_person_60 NUMERIC DEFAULT 60,
  price_person_90 NUMERIC DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Completion (Wizard results)
CREATE TABLE IF NOT EXISTS public.lesson_completion (
  booking_id UUID PRIMARY KEY REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_mood INTEGER CHECK (student_mood BETWEEN 0 AND 10),
  student_attention INTEGER CHECK (student_attention BETWEEN 0 AND 10),
  general_notes TEXT,
  problems_solved TEXT,
  linked_exam BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson Topics (Granular difficulty)
CREATE TABLE IF NOT EXISTS public.lesson_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL, 
  difficulty INTEGER CHECK (difficulty BETWEEN 0 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Topic Metrics (Aggregated with decay)
CREATE TABLE IF NOT EXISTS public.student_topic_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  difficulty_ema NUMERIC, -- Exponential Moving Average
  trend topic_trend DEFAULT 'stable',
  last_practiced_at TIMESTAMPTZ,
  UNIQUE(student_id, topic_name)
);

-- Billing Cycles
CREATE TABLE IF NOT EXISTS public.billing_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'paid')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing Adjustments
CREATE TABLE IF NOT EXISTS public.billing_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.billing_cycles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'discount', 'bonus')),
  amount NUMERIC NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Stats (Aggregated)
CREATE TABLE IF NOT EXISTS public.student_monthly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month
  total_minutes INTEGER DEFAULT 0,
  total_classes INTEGER DEFAULT 0,
  total_value NUMERIC DEFAULT 0,
  recurrence_rate NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, month)
);

-- Screen Time / Usage Tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Enablement
ALTER TABLE public.student_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_monthly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Teachers can manage agreements" ON public.student_agreements FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage completions" ON public.lesson_completion FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage topics" ON public.lesson_topics FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage topic metrics" ON public.student_topic_metrics FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage billing cycles" ON public.billing_cycles FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage billing adjustments" ON public.billing_adjustments FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage stats" ON public.student_monthly_stats FOR ALL USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can manage analytics" ON public.analytics_events FOR ALL USING (public.has_role(auth.uid(), 'teacher'));

-- Functions

-- 1. Create or Update Student Agreement
CREATE OR REPLACE FUNCTION public.create_or_update_student_agreement(
  p_student_id UUID,
  p_price_remote_60 NUMERIC,
  p_price_remote_90 NUMERIC,
  p_price_person_60 NUMERIC,
  p_price_person_90 NUMERIC
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.student_agreements (student_id, price_remote_60, price_remote_90, price_person_60, price_person_90)
  VALUES (p_student_id, p_price_remote_60, p_price_remote_90, p_price_person_60, p_price_person_90)
  ON CONFLICT (student_id) DO UPDATE SET
    price_remote_60 = EXCLUDED.price_remote_60,
    price_remote_90 = EXCLUDED.price_remote_90,
    price_person_60 = EXCLUDED.price_person_60,
    price_person_90 = EXCLUDED.price_person_90,
    updated_at = NOW();
END;
$$;

-- 2. Complete Lesson Wizard
CREATE OR REPLACE FUNCTION public.complete_lesson_wizard(
  p_booking_id UUID,
  p_mood INTEGER,
  p_attention INTEGER,
  p_notes TEXT,
  p_problems TEXT,
  p_exam BOOLEAN,
  p_topics JSONB -- Array of { topic: string, difficulty: int }
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_student_id UUID;
  v_topic JSONB;
  v_current_diff NUMERIC;
  v_new_ema NUMERIC;
  v_trend topic_trend;
  v_alpha NUMERIC := 0.3;
BEGIN
  -- Insert completion
  INSERT INTO public.lesson_completion (booking_id, student_mood, student_attention, general_notes, problems_solved, linked_exam)
  VALUES (p_booking_id, p_mood, p_attention, p_notes, p_problems, p_exam)
  ON CONFLICT (booking_id) DO UPDATE SET
    student_mood = EXCLUDED.student_mood,
    student_attention = EXCLUDED.student_attention,
    general_notes = EXCLUDED.general_notes,
    problems_solved = EXCLUDED.problems_solved,
    linked_exam = EXCLUDED.linked_exam;

  -- Get student id from booking
  SELECT student_id INTO v_student_id FROM public.bookings WHERE id = p_booking_id;

  -- Process topics
  FOR v_topic IN SELECT * FROM jsonb_array_elements(p_topics)
  LOOP
    -- Insert lesson topic
    INSERT INTO public.lesson_topics (booking_id, topic_name, difficulty)
    VALUES (p_booking_id, v_topic->>'topic', (v_topic->>'difficulty')::INTEGER);

    -- Update aggregated metric
    SELECT difficulty_ema INTO v_current_diff FROM public.student_topic_metrics 
    WHERE student_id = v_student_id AND topic_name = v_topic->>'topic';

    IF v_current_diff IS NULL THEN
      v_new_ema := (v_topic->>'difficulty')::NUMERIC;
      v_trend := 'stable';
    ELSE
      v_new_ema := (v_alpha * (v_topic->>'difficulty')::NUMERIC) + ((1 - v_alpha) * v_current_diff);
      IF v_new_ema < v_current_diff - 0.5 THEN v_trend := 'improving'; -- Lower difficulty is better? Usually difficulty means how hard it was for student. High difficulty = bad, Low difficulty = good. Assumption: 0=Easy, 10=Hard. Improving means difficulty goes down.
      ELSIF v_new_ema > v_current_diff + 0.5 THEN v_trend := 'worsening';
      ELSE v_trend := 'stable';
      END IF;
    END IF;

    INSERT INTO public.student_topic_metrics (student_id, topic_name, difficulty_ema, trend, last_practiced_at)
    VALUES (v_student_id, v_topic->>'topic', v_new_ema, v_trend, NOW())
    ON CONFLICT (student_id, topic_name) DO UPDATE SET
      difficulty_ema = v_new_ema,
      trend = v_trend,
      last_practiced_at = NOW();
  END LOOP;
  
  -- Update booking status to completed
  UPDATE public.bookings SET status = 'completed' WHERE id = p_booking_id;
END;
$$;

-- 3. Get Student Projection
CREATE OR REPLACE FUNCTION public.get_student_projection(
  p_student_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_scheduled_count INTEGER;
  v_scheduled_value NUMERIC := 0;
  v_historical_avg_count NUMERIC := 0;
  v_historical_avg_value NUMERIC := 0;
  v_agreement public.student_agreements%ROWTYPE;
  v_booking RECORD;
  v_price NUMERIC;
  v_duration_min INTEGER;
  v_months_back INTEGER := 3;
BEGIN
  -- Get Agreement
  SELECT * INTO v_agreement FROM public.student_agreements WHERE student_id = p_student_id;
  
  -- Default agreement if missing (fallback)
  IF v_agreement IS NULL THEN
     v_agreement.price_remote_60 := 50;
     v_agreement.price_remote_90 := 70;
     v_agreement.price_person_60 := 60;
     v_agreement.price_person_90 := 80;
  END IF;

  -- 1. Real Projection (Scheduled)
  FOR v_booking IN 
    SELECT b.*, ts.start_time, ts.end_time, ts.date 
    FROM public.bookings b
    JOIN public.time_slots ts ON b.slot_id = ts.id
    WHERE b.student_id = p_student_id 
    AND ts.date BETWEEN p_start_date AND p_end_date
    AND b.status != 'cancelled'
  LOOP
    v_duration_min := EXTRACT(EPOCH FROM (v_booking.end_time - v_booking.start_time)) / 60;
    
    -- Calculate price
    IF v_booking.modality = 'in_person' THEN
       IF v_duration_min <= 60 THEN v_price := v_agreement.price_person_60;
       ELSE v_price := v_agreement.price_person_90;
       END IF;
    ELSE -- remote
       IF v_duration_min <= 60 THEN v_price := v_agreement.price_remote_60;
       ELSE v_price := v_agreement.price_remote_90;
       END IF;
    END IF;

    v_scheduled_count := COALESCE(v_scheduled_count, 0) + 1;
    v_scheduled_value := v_scheduled_value + v_price;
  END LOOP;

  -- 2. Historical Projection (Average of last 3 months)
  -- Simplified: Get monthly stats for last 3 months
  SELECT 
    COALESCE(AVG(total_classes), 0),
    COALESCE(AVG(total_value), 0)
  INTO v_historical_avg_count, v_historical_avg_value
  FROM public.student_monthly_stats
  WHERE student_id = p_student_id
  AND month >= (p_start_date - INTERVAL '3 months')
  AND month < p_start_date;

  RETURN jsonb_build_object(
    'real_count', COALESCE(v_scheduled_count, 0),
    'real_value', COALESCE(v_scheduled_value, 0),
    'historical_avg_count', ROUND(v_historical_avg_count, 1),
    'historical_avg_value', ROUND(v_historical_avg_value, 2)
  );
END;
$$;

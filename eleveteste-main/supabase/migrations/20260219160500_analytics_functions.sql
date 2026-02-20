
-- 4. Create Billing Cycle
CREATE OR REPLACE FUNCTION public.create_billing_cycle(
  p_student_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cycle_id UUID;
BEGIN
  INSERT INTO public.billing_cycles (student_id, start_date, end_date, status)
  VALUES (p_student_id, p_start_date, p_end_date, 'open')
  RETURNING id INTO v_cycle_id;
  RETURN v_cycle_id;
END;
$$;

-- 5. Add Billing Adjustment
CREATE OR REPLACE FUNCTION public.add_billing_adjustment(
  p_cycle_id UUID,
  p_type TEXT,
  p_amount NUMERIC,
  p_reason TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_adj_id UUID;
BEGIN
  INSERT INTO public.billing_adjustments (cycle_id, type, amount, reason)
  VALUES (p_cycle_id, p_type, p_amount, p_reason)
  RETURNING id INTO v_adj_id;
  RETURN v_adj_id;
END;
$$;

-- 6. Generate Billing PDF Data
CREATE OR REPLACE FUNCTION public.generate_billing_pdf_data(
  p_cycle_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_cycle RECORD;
  v_student RECORD;
  v_lines JSONB;
  v_adjustments JSONB;
  v_total NUMERIC := 0;
  v_1 NUMERIC; v_2 NUMERIC;
BEGIN
  SELECT * INTO v_cycle FROM public.billing_cycles WHERE id = p_cycle_id;
  SELECT * INTO v_student FROM public.profiles WHERE id = v_cycle.student_id;

  -- Get Lines (Completed Bookings in period)
  -- Note: We need to calculate price again or store it. Calculating for now based on Agreement.
  -- This assumes agreements don't change historically, or we should snapshot price.
  -- For this MVP, we calculate on fly.
  
  -- ... Logic to get lines ...
  -- Simplified for brevity in this function, would better be a view or precise query
  
  SELECT jsonb_agg(jsonb_build_object(
    'date', ts.date,
    'duration', EXTRACT(EPOCH FROM (ts.end_time - ts.start_time))/60,
    'subject', s.name,
    'topic', b.topics[1], -- simple assumption
    'modality', b.modality
  )) INTO v_lines
  FROM public.bookings b
  JOIN public.time_slots ts ON b.slot_id = ts.id
  LEFT JOIN public.subjects s ON b.subject_id = s.id
  WHERE b.student_id = v_cycle.student_id
  AND ts.date BETWEEN v_cycle.start_date AND v_cycle.end_date
  AND b.status = 'completed';

  SELECT jsonb_agg(jsonb_build_object(
    'type', type,
    'amount', amount,
    'reason', reason
  )) INTO v_adjustments
  FROM public.billing_adjustments
  WHERE cycle_id = p_cycle_id;

  RETURN jsonb_build_object(
    'student_name', v_student.full_name,
    'period_start', v_cycle.start_date,
    'period_end', v_cycle.end_date,
    'lines', COALESCE(v_lines, '[]'::jsonb),
    'adjustments', COALESCE(v_adjustments, '[]'::jsonb)
  );
END;
$$;

-- 7. Statistics Recomputation (Schedule or Manual Trigger)
CREATE OR REPLACE FUNCTION public.recompute_student_monthly_stats(
  p_student_id UUID,
  p_month DATE
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_month_start DATE := date_trunc('month', p_month);
  v_month_end DATE := (v_month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  v_total_min INTEGER;
  v_total_cls INTEGER;
  v_total_val NUMERIC := 0;
BEGIN
  SELECT 
    COUNT(*),
    COALESCE(SUM(EXTRACT(EPOCH FROM (ts.end_time - ts.start_time))/60), 0)
  INTO v_total_cls, v_total_min
  FROM public.bookings b
  JOIN public.time_slots ts ON b.slot_id = ts.id
  WHERE b.student_id = p_student_id
  AND ts.date BETWEEN v_month_start AND v_month_end
  AND b.status = 'completed';

  -- Value calculation would go here (omitted for brevity, same logic as projection)

  INSERT INTO public.student_monthly_stats (student_id, month, total_minutes, total_classes, total_value)
  VALUES (p_student_id, v_month_start, v_total_min, v_total_cls, v_total_val)
   ON CONFLICT (student_id, month) DO UPDATE SET
    total_minutes = EXCLUDED.total_minutes,
    total_classes = EXCLUDED.total_classes;
END;
$$;

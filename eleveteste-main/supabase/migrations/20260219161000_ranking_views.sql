
-- View: Top Students by Usage (Screen Time / Actions)
CREATE OR REPLACE VIEW public.top_students_usage AS
SELECT 
  ae.user_id,
  p.full_name,
  COUNT(*) as action_count,
  MAX(ae.created_at) as last_active
FROM public.analytics_events ae
JOIN public.profiles p ON ae.user_id = p.id
GROUP BY ae.user_id, p.full_name
ORDER BY action_count DESC;

-- View: Top Students by Classes (Completed)
CREATE OR REPLACE VIEW public.top_students_classes AS
SELECT 
  b.student_id,
  p.full_name,
  COUNT(*) as class_count,
  SUM(EXTRACT(EPOCH FROM (ts.end_time - ts.start_time))/60) as total_minutes
FROM public.bookings b
JOIN public.time_slots ts ON b.slot_id = ts.id
JOIN public.profiles p ON b.student_id = p.id
WHERE b.status = 'completed'
GROUP BY b.student_id, p.full_name
ORDER BY class_count DESC;

-- Grant permissions (if needed, usually views inherit or need grant)
GRANT SELECT ON public.top_students_usage TO authenticated;
GRANT SELECT ON public.top_students_classes TO authenticated;

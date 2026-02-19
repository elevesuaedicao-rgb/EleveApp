import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LearningHistoryEntry {
  id: string;
  student_id: string;
  teacher_id: string;
  booking_id: string | null;
  subject_id: string | null;
  date: string;
  duration_minutes: number;
  topics_covered: string[];
  observations: string | null;
  homework: string | null;
  student_performance: 'excellent' | 'good' | 'regular' | 'needs_improvement' | null;
  next_steps: string | null;
  created_at: string;
  subject?: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  student?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  teacher?: {
    id: string;
    full_name: string;
  };
}

interface UseLearningHistoryOptions {
  studentId?: string;
  role?: 'student' | 'teacher' | 'parent';
}

export const useLearningHistory = (options: UseLearningHistoryOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { studentId, role = 'student' } = options;

  const historyQuery = useQuery({
    queryKey: ['learning-history', user?.id, studentId, role],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('learning_history')
        .select(`
          id,
          student_id,
          teacher_id,
          booking_id,
          subject_id,
          date,
          duration_minutes,
          topics_covered,
          observations,
          homework,
          student_performance,
          next_steps,
          created_at
        `)
        .order('date', { ascending: false });

      if (role === 'teacher') {
        query = query.eq('teacher_id', user.id);
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
      } else if (role === 'student') {
        query = query.eq('student_id', user.id);
      } else if (role === 'parent' && studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related data
      const subjectIds = [...new Set(data.filter(h => h.subject_id).map(h => h.subject_id))];
      const studentIds = [...new Set(data.map(h => h.student_id))];
      const teacherIds = [...new Set(data.map(h => h.teacher_id))];

      const [subjectsRes, studentsRes, teachersRes] = await Promise.all([
        subjectIds.length > 0 
          ? supabase.from('subjects').select('id, name, icon, color').in('id', subjectIds)
          : { data: [] },
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', studentIds),
        supabase.from('profiles').select('id, full_name').in('id', teacherIds),
      ]);

      return data.map(entry => ({
        ...entry,
        subject: subjectsRes.data?.find(s => s.id === entry.subject_id),
        student: studentsRes.data?.find(s => s.id === entry.student_id),
        teacher: teachersRes.data?.find(t => t.id === entry.teacher_id),
      })) as LearningHistoryEntry[];
    },
    enabled: !!user,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: Omit<LearningHistoryEntry, 'id' | 'created_at' | 'subject' | 'student' | 'teacher'>) => {
      const { data, error } = await supabase
        .from('learning_history')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-history'] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    createEntry: createEntryMutation.mutateAsync,
    isCreating: createEntryMutation.isPending,
  };
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TeacherStudent {
  id: string;
  student_id: string;
  parent_id: string | null;
  status: 'active' | 'pending' | 'inactive';
  mode: 'online' | 'presencial';
  price_per_hour: number;
  price_per_90min: number;
  price_per_2h: number;
  notes: string | null;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    email: string | null;
    avatar_url: string | null;
    grade_year: string | null;
    phone: string | null;
  };
  parent?: {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export const useTeacherStudents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ['teacher-students', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('teacher_student_relationships')
        .select(`
          id,
          student_id,
          parent_id,
          status,
          mode,
          price_per_hour,
          price_per_90min,
          price_per_2h,
          notes,
          created_at
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch student profiles separately
      const studentIds = data.map(r => r.student_id);
      const parentIds = data.filter(r => r.parent_id).map(r => r.parent_id);

      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, grade_year, phone')
        .in('id', studentIds);

      const { data: parents } = parentIds.length > 0 
        ? await supabase
            .from('profiles')
            .select('id, full_name, email, phone')
            .in('id', parentIds)
        : { data: [] };

      return data.map(rel => ({
        ...rel,
        student: students?.find(s => s.id === rel.student_id) || {
          id: rel.student_id,
          full_name: 'Aluno',
          email: null,
          avatar_url: null,
          grade_year: null,
          phone: null,
        },
        parent: parents?.find(p => p.id === rel.parent_id) || null,
      })) as TeacherStudent[];
    },
    enabled: !!user,
  });

  const updateRelationshipMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      status?: 'active' | 'pending' | 'inactive';
      price_per_hour?: number;
      price_per_90min?: number;
      price_per_2h?: number;
      notes?: string;
    }) => {
      const { id, ...updates } = data;
      const { error } = await supabase
        .from('teacher_student_relationships')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
    },
  });

  return {
    students: studentsQuery.data || [],
    isLoading: studentsQuery.isLoading,
    updateRelationship: updateRelationshipMutation.mutateAsync,
    isUpdating: updateRelationshipMutation.isPending,
  };
};

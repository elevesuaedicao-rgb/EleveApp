import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface QuestionTicket {
  id: string;
  student_id: string;
  teacher_id: string | null;
  subject_id: string | null;
  title: string;
  description: string;
  sub_topics: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  teacher_response: string | null;
  response_steps: string[];
  difficulty_level: 'easy' | 'medium' | 'hard' | null;
  media_urls: string[];
  responded_at: string | null;
  resolved_at: string | null;
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
}

interface UseQuestionTicketsOptions {
  role: 'student' | 'teacher';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export const useQuestionTickets = (options: UseQuestionTicketsOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { role, status } = options;

  const ticketsQuery = useQuery({
    queryKey: ['question-tickets', user?.id, role, status],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('question_tickets')
        .select(`
          id,
          student_id,
          teacher_id,
          subject_id,
          title,
          description,
          sub_topics,
          status,
          priority,
          teacher_response,
          response_steps,
          difficulty_level,
          media_urls,
          responded_at,
          resolved_at,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (role === 'student') {
        query = query.eq('student_id', user.id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related data
      const subjectIds = [...new Set(data.filter(t => t.subject_id).map(t => t.subject_id))];
      const studentIds = [...new Set(data.map(t => t.student_id))];

      const [subjectsRes, studentsRes] = await Promise.all([
        subjectIds.length > 0 
          ? supabase.from('subjects').select('id, name, icon, color').in('id', subjectIds)
          : { data: [] },
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', studentIds),
      ]);

      return data.map(ticket => ({
        ...ticket,
        subject: subjectsRes.data?.find(s => s.id === ticket.subject_id),
        student: studentsRes.data?.find(s => s.id === ticket.student_id),
      })) as QuestionTicket[];
    },
    enabled: !!user,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticket: {
      subject_id: string;
      title: string;
      description: string;
      sub_topics?: string[];
      priority?: 'low' | 'medium' | 'high';
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('question_tickets')
        .insert({
          ...ticket,
          student_id: user.id,
          status: 'open',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-tickets'] });
    },
  });

  const respondToTicketMutation = useMutation({
    mutationFn: async (data: {
      ticketId: string;
      response: string;
      steps: string[];
      difficulty: 'easy' | 'medium' | 'hard';
    }) => {
      const { error } = await supabase
        .from('question_tickets')
        .update({
          teacher_id: user?.id,
          teacher_response: data.response,
          response_steps: data.steps,
          difficulty_level: data.difficulty,
          status: 'resolved',
          responded_at: new Date().toISOString(),
          resolved_at: new Date().toISOString(),
        })
        .eq('id', data.ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-tickets'] });
    },
  });

  return {
    tickets: ticketsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    createTicket: createTicketMutation.mutateAsync,
    isCreating: createTicketMutation.isPending,
    respondToTicket: respondToTicketMutation.mutateAsync,
    isResponding: respondToTicketMutation.isPending,
  };
};

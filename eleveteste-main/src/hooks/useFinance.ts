import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FinancialTransaction {
  id: string;
  teacher_id: string;
  parent_id: string | null;
  student_id: string;
  booking_id: string | null;
  type: 'class_fee' | 'payment' | 'adjustment';
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  description: string | null;
  due_date: string | null;
  paid_at: string | null;
  reference_month: string | null;
  created_at: string;
  student?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  parent?: {
    id: string;
    full_name: string;
  };
}

export interface TeacherPaymentInfo {
  id: string;
  teacher_id: string;
  pix_key: string;
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  holder_name: string;
  bank_name: string | null;
}

interface UseFinanceOptions {
  role: 'teacher' | 'parent';
  studentId?: string;
}

export const useFinance = (options: UseFinanceOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { role, studentId } = options;

  const transactionsQuery = useQuery({
    queryKey: ['financial-transactions', user?.id, role, studentId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('financial_transactions')
        .select(`
          id,
          teacher_id,
          parent_id,
          student_id,
          booking_id,
          type,
          amount,
          status,
          description,
          due_date,
          paid_at,
          reference_month,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (role === 'teacher') {
        query = query.eq('teacher_id', user.id);
      } else if (role === 'parent') {
        query = query.eq('parent_id', user.id);
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch related profiles
      const studentIds = [...new Set(data.map(t => t.student_id))];
      const parentIds = [...new Set(data.filter(t => t.parent_id).map(t => t.parent_id))];

      const [studentsRes, parentsRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', studentIds),
        parentIds.length > 0 
          ? supabase.from('profiles').select('id, full_name').in('id', parentIds)
          : { data: [] },
      ]);

      return data.map(transaction => ({
        ...transaction,
        student: studentsRes.data?.find(s => s.id === transaction.student_id),
        parent: parentsRes.data?.find(p => p.id === transaction.parent_id),
      })) as FinancialTransaction[];
    },
    enabled: !!user,
  });

  const paymentInfoQuery = useQuery({
    queryKey: ['teacher-payment-info', user?.id, role],
    queryFn: async () => {
      if (!user) return null;

      if (role === 'teacher') {
        const { data, error } = await supabase
          .from('teacher_payment_info')
          .select('*')
          .eq('teacher_id', user.id)
          .maybeSingle();
        if (error) throw error;
        return data as TeacherPaymentInfo | null;
      }
      return null;
    },
    enabled: !!user && role === 'teacher',
  });

  const updatePaymentInfoMutation = useMutation({
    mutationFn: async (info: Omit<TeacherPaymentInfo, 'id' | 'teacher_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('teacher_payment_info')
        .select('id')
        .eq('teacher_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('teacher_payment_info')
          .update(info)
          .eq('teacher_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('teacher_payment_info')
          .insert({ ...info, teacher_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-payment-info'] });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('financial_transactions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
    },
  });

  // Calculate summary stats for teacher
  const stats = {
    totalRevenue: transactionsQuery.data
      ?.filter(t => t.type === 'payment' && t.status === 'paid')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    pendingAmount: transactionsQuery.data
      ?.filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
    thisMonthRevenue: transactionsQuery.data
      ?.filter(t => {
        const now = new Date();
        const txDate = new Date(t.created_at);
        return t.type === 'payment' && 
               t.status === 'paid' && 
               txDate.getMonth() === now.getMonth() &&
               txDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
  };

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    paymentInfo: paymentInfoQuery.data,
    updatePaymentInfo: updatePaymentInfoMutation.mutateAsync,
    isUpdatingPaymentInfo: updatePaymentInfoMutation.isPending,
    markAsPaid: markAsPaidMutation.mutateAsync,
    isMarkingAsPaid: markAsPaidMutation.isPending,
    stats,
  };
};

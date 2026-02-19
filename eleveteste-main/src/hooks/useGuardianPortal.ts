import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type LessonStatus =
  | 'DRAFT'
  | 'BOOKED_PENDING_CONFIRMATION'
  | 'BOOKED_CONFIRMED'
  | 'CONFIRMED_BY_GUARDIAN'
  | 'CONFIRMED_BY_TEACHER'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type SlotStatus = 'LIVRE' | 'OCUPADO' | 'INDISPONIVEL';

export interface GuardianStudent {
  id: string;
  name: string;
  grade: string;
  avatarUrl: string | null;
}

export interface GuardianSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: 'online' | 'presencial' | 'ambos';
  status: SlotStatus;
  bookingId?: string;
  bookingStatus?: string;
}

const STATUS_MAP: Record<string, LessonStatus> = {
  pending: 'BOOKED_PENDING_CONFIRMATION',
  confirmed: 'BOOKED_CONFIRMED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const BOOKED_STATES = new Set(['pending', 'confirmed', 'completed']);

export const useGuardianPortal = (studentId?: string) => {
  const { user } = useAuth();

  const linkedStudentsQuery = useQuery({
    queryKey: ['guardian-linked-students', user?.id],
    queryFn: async () => {
      if (!user) return [] as GuardianStudent[];

      const { data: linkedIds } = await supabase.rpc('get_linked_students', { _parent_id: user.id });
      if (!linkedIds || linkedIds.length === 0) return [] as GuardianStudent[];

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, grade_year, avatar_url')
        .in('id', linkedIds);

      if (error) throw error;

      return (profiles ?? []).map((profile) => ({
        id: profile.id,
        name: profile.full_name || 'Aluno',
        grade: profile.grade_year || 'Serie nao informada',
        avatarUrl: profile.avatar_url,
      }));
    },
    enabled: !!user,
  });

  const activeStudentId = studentId ?? linkedStudentsQuery.data?.[0]?.id;

  const relationshipsQuery = useQuery({
    queryKey: ['guardian-relationships', activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return [];
      const { data, error } = await supabase
        .from('teacher_student_relationships')
        .select('*')
        .eq('student_id', activeStudentId)
        .eq('status', 'active');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!activeStudentId,
  });

  const primaryRelationship = relationshipsQuery.data?.[0];
  const teacherId = primaryRelationship?.teacher_id;

  const teacherQuery = useQuery({
    queryKey: ['guardian-teacher', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('id', teacherId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });

  const bookingsQuery = useQuery({
    queryKey: ['guardian-bookings', activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select('*, time_slots(*), subjects(*)')
        .eq('student_id', activeStudentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!activeStudentId,
  });

  const slotsQuery = useQuery({
    queryKey: ['guardian-time-slots', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      const from = format(new Date(), 'yyyy-MM-dd');
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 90);
      const to = format(toDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('date', from)
        .lte('date', to)
        .order('date')
        .order('start_time');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!teacherId,
  });

  const learningHistoryQuery = useQuery({
    queryKey: ['guardian-learning-history', activeStudentId],
    queryFn: async () => {
      if (!activeStudentId) return [];
      const { data, error } = await supabase
        .from('learning_history')
        .select('*, subjects(*)')
        .eq('student_id', activeStudentId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!activeStudentId,
  });

  const financeQuery = useQuery({
    queryKey: ['guardian-finance', user?.id, activeStudentId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('financial_transactions')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (activeStudentId) {
        query = query.eq('student_id', activeStudentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const bookingBySlot = useMemo(() => {
    const map = new Map<string, (typeof bookingsQuery.data)[number]>();
    for (const booking of bookingsQuery.data ?? []) {
      if (booking.slot_id && BOOKED_STATES.has(booking.status)) {
        map.set(booking.slot_id, booking);
      }
    }
    return map;
  }, [bookingsQuery.data]);

  const modality = useMemo<'online' | 'presencial' | 'ambos'>(() => {
    const mode = primaryRelationship?.mode?.toLowerCase();
    if (mode?.includes('online') && mode?.includes('presencial')) return 'ambos';
    if (mode?.includes('online')) return 'online';
    if (mode?.includes('presencial')) return 'presencial';
    return 'ambos';
  }, [primaryRelationship?.mode]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, GuardianSlot[]>();

    for (const slot of slotsQuery.data ?? []) {
      const booking = bookingBySlot.get(slot.id);
      const status: SlotStatus = slot.is_available
        ? booking
          ? 'OCUPADO'
          : 'LIVRE'
        : 'INDISPONIVEL';

      const list = map.get(slot.date) ?? [];
      list.push({
        id: slot.id,
        date: slot.date,
        startTime: slot.start_time.slice(0, 5),
        endTime: slot.end_time.slice(0, 5),
        modality,
        status,
        bookingId: booking?.id,
        bookingStatus: booking?.status,
      });
      map.set(slot.date, list);
    }

    for (const [key, list] of map.entries()) {
      map.set(
        key,
        list.sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
    }

    return map;
  }, [slotsQuery.data, bookingBySlot, modality]);

  const lessons = useMemo(() => {
    return (bookingsQuery.data ?? []).map((booking) => ({
      id: booking.id,
      date: booking.time_slots?.date || '',
      startTime: booking.time_slots?.start_time?.slice(0, 5) || '',
      endTime: booking.time_slots?.end_time?.slice(0, 5) || '',
      status: STATUS_MAP[booking.status] || 'BOOKED_PENDING_CONFIRMATION',
      rawStatus: booking.status,
      subject: booking.subjects?.name || 'Materia',
      topics: booking.topics || [],
      notes: booking.notes,
      slotId: booking.slot_id,
      modality,
      teacherId,
    }));
  }, [bookingsQuery.data, modality, teacherId]);

  const financeSummary = useMemo(() => {
    const transactions = financeQuery.data ?? [];
    const open = transactions
      .filter((tx) => tx.status === 'pending' && tx.type !== 'payment')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const paid = transactions
      .filter((tx) => tx.status === 'paid' || tx.type === 'payment')
      .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);

    const now = new Date();
    const monthTotal = transactions
      .filter((tx) => {
        const created = new Date(tx.created_at ?? '');
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    return {
      open,
      paid,
      monthTotal,
    };
  }, [financeQuery.data]);

  return {
    students: linkedStudentsQuery.data ?? [],
    activeStudentId,
    hasStudents: (linkedStudentsQuery.data?.length ?? 0) > 0,
    teacher: teacherQuery.data,
    teacherPhoneE164: teacherQuery.data?.phone || import.meta.env.VITE_TEACHER_WHATSAPP_E164 || '',
    lessons,
    slotsByDate,
    financeTransactions: financeQuery.data ?? [],
    financeSummary,
    learningHistory: learningHistoryQuery.data ?? [],
    isLoading:
      linkedStudentsQuery.isLoading ||
      relationshipsQuery.isLoading ||
      bookingsQuery.isLoading ||
      slotsQuery.isLoading,
  };
};

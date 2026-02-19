import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TimeSlot {
  id: string;
  teacher_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  student_id: string;
  subject_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  topics: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  time_slots?: TimeSlot;
  subjects?: Subject | null;
  student_profile?: { id: string; full_name: string; email: string } | null;
}

export const useSchedule = () => {
  const { user, roles } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = roles.includes('teacher');
  const isParent = roles.includes('parent');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchData();
    
    const slotsChannel = supabase
      .channel('slots-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_slots' }, () => {
        fetchSlots();
      })
      .subscribe();

    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(slotsChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [user, roles]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchSlots(), fetchBookings(), fetchSubjects()]);
    setLoading(false);
  };

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching slots:', error);
      return;
    }
    setSlots(data || []);
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        time_slots (*),
        subjects (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return;
    }

    // Fetch student profiles separately
    const bookingsWithProfiles: Booking[] = [];
    for (const booking of data || []) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', booking.student_id)
        .maybeSingle();
      
      bookingsWithProfiles.push({
        ...booking,
        status: booking.status as Booking['status'],
        student_profile: profile
      });
    }
    setBookings(bookingsWithProfiles);
  };

  const fetchSubjects = async () => {
    const { data, error } = await supabase.from('subjects').select('*');
    if (error) {
      console.error('Error fetching subjects:', error);
      return;
    }
    setSubjects(data || []);
  };

  const createSlot = async (date: string, startTime: string, endTime: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase.from('time_slots').insert({
      teacher_id: user.id,
      date,
      start_time: startTime,
      end_time: endTime,
      is_available: true
    });

    if (error) {
      console.error('Error creating slot:', error);
      return { error };
    }

    await fetchSlots();
    return { error: null };
  };

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase.from('time_slots').delete().eq('id', slotId);
    if (error) {
      console.error('Error deleting slot:', error);
      return { error };
    }
    await fetchSlots();
    return { error: null };
  };

  const requestBooking = async (slotId: string, subjectId: string, topics: string[], notes?: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase.from('bookings').insert({
      slot_id: slotId,
      student_id: user.id,
      subject_id: subjectId,
      topics,
      notes,
      status: 'pending'
    });

    if (error) {
      console.error('Error creating booking:', error);
      return { error };
    }

    await supabase.from('time_slots').update({ is_available: false }).eq('id', slotId);
    await fetchData();
    return { error: null };
  };

  const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    
    if (error) {
      console.error('Error updating booking:', error);
      return { error };
    }

    if (status === 'cancelled') {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        await supabase.from('time_slots').update({ is_available: true }).eq('id', booking.slot_id);
      }
    }

    await fetchData();
    return { error: null };
  };

  const getAvailableSlots = () => {
    const bookedSlotIds = bookings
      .filter(b => b.status !== 'cancelled')
      .map(b => b.slot_id);
    
    return slots.filter(s => s.is_available && !bookedSlotIds.includes(s.id));
  };

  const getMyBookings = () => {
    if (!user) return [];
    return bookings.filter(b => b.student_id === user.id);
  };

  const getAllBookings = () => bookings;

  return {
    slots,
    bookings,
    subjects,
    loading,
    isTeacher,
    isParent,
    createSlot,
    deleteSlot,
    requestBooking,
    updateBookingStatus,
    getAvailableSlots,
    getMyBookings,
    getAllBookings,
    refetch: fetchData
  };
};

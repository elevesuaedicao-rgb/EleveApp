import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '@/hooks/useSchedule';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

const SUBJECT_ICONS: Record<string, string> = {
  'Matemática': '📐',
  'Física': '⚡',
  'Química': '🧪',
  'Biologia': '🌿',
  'Português': '📚',
  'História': '🏛️',
  'Geografia': '🌍',
  'Inglês': '🇺🇸',
};

export const TeacherApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, updateBookingStatus, loading } = useSchedule();
  const { createNotification } = useNotifications();
  const [processing, setProcessing] = useState<string | null>(null);

  const pendingBookings = bookings.filter(b => b.status === 'pending');

  const handleApprove = async (bookingId: string, studentId: string, subjectName: string) => {
    setProcessing(bookingId);
    const { error } = await updateBookingStatus(bookingId, 'confirmed');
    
    if (error) {
      toast.error('Erro ao aprovar aula');
    } else {
      toast.success('Aula aprovada!');
      await createNotification(
        studentId,
        'booking_approved',
        'Aula Confirmada!',
        `Sua aula de ${subjectName} foi confirmada pelo professor.`,
        '/student/booking',
        'Ver Aula'
      );
    }
    setProcessing(null);
  };

  const handleReject = async (bookingId: string, studentId: string, subjectName: string) => {
    setProcessing(bookingId);
    const { error } = await updateBookingStatus(bookingId, 'cancelled');
    
    if (error) {
      toast.error('Erro ao recusar aula');
    } else {
      toast.success('Aula recusada');
      await createNotification(
        studentId,
        'booking_rejected',
        'Aula Não Aprovada',
        `Infelizmente sua aula de ${subjectName} não pôde ser confirmada.`,
        '/student/booking',
        'Reagendar'
      );
    }
    setProcessing(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors">←</button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
          <p className="text-muted-foreground text-sm">{pendingBookings.length} solicitações pendentes</p>
        </div>
      </div>

      {pendingBookings.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-border">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-muted-foreground">Nenhuma solicitação pendente!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBookings.map(booking => {
            const slot = booking.time_slots;
            if (!slot) return null;
            const subjectName = booking.subjects?.name || 'Matéria';
            const studentName = booking.student_profile?.full_name || 'Aluno';
            
            return (
              <div key={booking.id} className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-2xl flex items-center justify-center text-2xl border border-yellow-100 dark:border-yellow-800">
                    {SUBJECT_ICONS[subjectName] || '📖'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">{subjectName}</h3>
                    <p className="text-muted-foreground text-sm">{studentName}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded-lg">{formatDate(slot.date)}</span>
                      <span className="bg-muted px-2 py-1 rounded-lg">{slot.start_time.slice(0, 5)}</span>
                    </div>
                  </div>
                </div>

                {booking.topics && booking.topics.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold text-muted-foreground mb-2">Tópicos:</p>
                    <div className="flex flex-wrap gap-1">
                      {booking.topics.map(topic => (
                        <span key={topic} className="px-2 py-1 bg-muted text-foreground text-xs rounded-lg">{topic}</span>
                      ))}
                    </div>
                  </div>
                )}

                {booking.notes && (
                  <div className="mb-4 p-3 bg-muted rounded-xl">
                    <p className="text-xs font-bold text-muted-foreground mb-1">Observações:</p>
                    <p className="text-sm text-foreground">{booking.notes}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleReject(booking.id, booking.student_id, subjectName)}
                    disabled={processing === booking.id}
                    className="flex-1 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => handleApprove(booking.id, booking.student_id, subjectName)}
                    disabled={processing === booking.id}
                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing === booking.id ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Aprovar'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '@/hooks/useSchedule';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

export const TeacherCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { slots, bookings, createSlot, deleteSlot, loading } = useSchedule();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const [submitting, setSubmitting] = useState(false);

  const dateStr = selectedDate?.toISOString().split('T')[0] || '';
  
  const daySlots = slots.filter(s => s.date === dateStr);
  const dayBookings = bookings.filter(b => b.time_slots?.date === dateStr);

  const handleAddSlot = async () => {
    if (!selectedDate) return;
    
    setSubmitting(true);
    const { error } = await createSlot(dateStr, newStartTime, newEndTime);
    
    if (error) {
      toast.error('Erro ao criar horário');
    } else {
      toast.success('Horário criado!');
      setShowAddModal(false);
    }
    setSubmitting(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await deleteSlot(slotId);
    if (error) {
      toast.error('Erro ao remover horário');
    } else {
      toast.success('Horário removido');
    }
  };

  const getSlotStatus = (slotId: string) => {
    const booking = dayBookings.find(b => b.slot_id === slotId);
    if (!booking) return 'available';
    return booking.status;
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
          <h1 className="text-2xl font-bold text-foreground">Minha Agenda</h1>
          <p className="text-muted-foreground text-sm">Gerencie seus horários</p>
        </div>
      </div>

      <div className="bg-surface rounded-3xl p-4 border border-border shadow-sm">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          + Novo Horário
        </button>
      </div>

      {daySlots.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground">Nenhum horário para este dia.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-primary font-medium hover:underline"
          >
            Adicionar horário
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {daySlots.map(slot => {
            const status = getSlotStatus(slot.id);
            const booking = dayBookings.find(b => b.slot_id === slot.id);
            
            return (
              <div key={slot.id} className="bg-surface p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-sm font-bold ${
                  status === 'available' 
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800'
                    : status === 'pending'
                    ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                }`}>
                  <span>{slot.start_time.slice(0, 5)}</span>
                </div>
                
                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </p>
                  {booking ? (
                    <p className="text-sm text-muted-foreground">
                      {booking.student_profile?.full_name} • {booking.subjects?.name}
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 dark:text-green-400">Disponível</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {status !== 'available' && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                        : status === 'confirmed'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                      {status === 'pending' ? 'Pendente' : status === 'confirmed' ? 'Confirmado' : status}
                    </span>
                  )}
                  {status === 'available' && (
                    <button
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-4">Novo Horário</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Início</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fim</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSlot}
                disabled={submitting}
                className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? (
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'Criar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

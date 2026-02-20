import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule as useScheduleHook } from '@/hooks/useSchedule';
import { useSchedule as useScheduleContext } from '@/context/ScheduleContext';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  MoreVertical,
  Trash2,
  Bell,
  User,
  LogOut,
  CalendarDays,
  ListFilter
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isWeekend, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

type ViewMode = 'monthly' | 'weekly';

export const TeacherCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { slots = [], bookings = [], createSlot, deleteSlot, loading } = useScheduleHook();
  const { notifications = [], markNotificationRead } = useScheduleContext();
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:00');
  const [submitting, setSubmitting] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const activeNotifications = (notifications || []).filter(n => !n.read);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const daySlots = useMemo(() => (slots || []).filter(s => s.date === dateStr), [slots, dateStr]);
  const dayBookings = useMemo(() => (bookings || []).filter(b => b.time_slots?.date === dateStr), [bookings, dateStr]);

  // Fixed schedule bounds
  const isHoliday = (date: Date) => false; // TODO: Implement holiday check if needed
  const isAvailableDay = (date: Date) => !isWeekend(date) && !isHoliday(date);

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const getDayAvailability = (date: Date) => {
    const dStr = format(date, 'yyyy-MM-dd');
    const dayS = (slots || []).filter(s => s.date === dStr);
    const dayB = (bookings || []).filter(b => b.time_slots?.date === dStr);
    const bookedCount = dayB.length;
    const availableCount = dayS.length - bookedCount;
    return { bookedCount, availableCount, total: dayS.length };
  };

  return (
    <div className="min-h-screen bg-background relative pb-24 overflow-x-hidden">
      {/* Custom Action Bar (Top Right Detail) */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md border border-border/50 flex items-center justify-center hover:bg-muted text-muted-foreground transition-all duration-300 relative group active:scale-95 shadow-lg shadow-black/5"
        >
          <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          {activeNotifications.length > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border border-surface animate-pulse" />
          )}
        </button>

        <button
          onClick={() => navigate('/teacher/profile')}
          className="w-10 h-10 rounded-full border border-border/50 overflow-hidden shadow-lg shadow-black/5 active:scale-95 transition-transform"
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {profile?.full_name?.charAt(0) || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
        </button>

        <button
          onClick={handleSignOut}
          className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md border border-border/50 flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300 active:scale-95 shadow-lg shadow-black/5"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-16">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-4xl font-black tracking-tight text-foreground">Minha Agenda</h1>
            <p className="text-muted-foreground font-medium">Segunda a Sexta • 14h às 19h</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center bg-surface/50 backdrop-blur-sm p-1.5 rounded-2xl border border-border/50 shadow-inner"
          >
            <button
              onClick={() => setViewMode('weekly')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                viewMode === 'weekly'
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              Semanal
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                viewMode === 'monthly'
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              Mensal
            </button>
          </motion.div>
        </div>

        {/* View Content */}
        <AnimatePresence mode="wait">
          {viewMode === 'weekly' ? (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Weekly Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex bg-surface rounded-2xl border border-border p-1 shadow-sm">
                  <button
                    onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="px-4 flex items-center font-bold text-sm">
                    {format(currentWeekStart, "dd 'de' MMMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 4), "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                  <button
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Novo Horário</span>
                </button>
              </div>

              {/* Day Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const { bookedCount, availableCount, total } = getDayAvailability(day);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "p-5 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden group",
                        isSelected
                          ? "bg-primary border-primary shadow-xl shadow-primary/10"
                          : "bg-surface border-border hover:border-primary/30"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-xs font-black uppercase tracking-widest opacity-60",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            {format(day, 'eee', { locale: ptBR })}
                          </span>
                          <span className={cn(
                            "text-2xl font-black",
                            isSelected ? "text-primary-foreground" : "text-foreground"
                          )}>
                            {format(day, 'dd')}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-primary-foreground/50" : "bg-primary")} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                              {availableCount} Livres
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-primary-foreground" : "bg-blue-500")} />
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", isSelected ? "text-primary-foreground" : "text-foreground")}>
                              {bookedCount} Aulas
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <motion.div
                            layoutId="activeDay"
                            className="absolute bottom-0 right-0 p-3"
                          >
                            <div className="bg-primary-foreground/20 w-8 h-8 rounded-full flex items-center justify-center">
                              <ChevronRight className="w-4 h-4 text-primary-foreground" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="monthly"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="bg-surface rounded-[2.5rem] p-6 border border-border shadow-xl shadow-black/5"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                fromDate={new Date()}
                className="w-full"
                locale={ptBR}
                disabled={isWeekend}
                modifiers={{
                  hasSlots: (date) => getDayAvailability(date).total > 0,
                  available: (date) => getDayAvailability(date).availableCount > 0,
                  fullyBooked: (date) => {
                    const { bookedCount, total } = getDayAvailability(date);
                    return total > 0 && bookedCount === total;
                  }
                }}
                modifiersStyles={{
                  hasSlots: { fontWeight: 'bold' },
                  available: { color: 'var(--primary)' },
                  fullyBooked: { color: '#3b82f6' }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Detail Header */}
        <div className="mt-12 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">Horários agendados e disponíveis</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Slots List */}
        {daySlots.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-12 bg-surface/40 rounded-[2.5rem] border border-dashed border-border/50 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <p className="text-foreground font-bold italic">Nenhum horário definido para hoje.</p>
              <p className="text-muted-foreground text-sm max-w-[240px] mt-1">Defina seus horários entre 14h e 19h para que seus alunos possam agendar.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Adicionar Primeiro Horário
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {daySlots
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((slot, idx) => {
                const status = getSlotStatus(slot.id);
                const booking = dayBookings.find(b => b.slot_id === slot.id);

                return (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "bg-surface p-5 rounded-[2rem] border transition-all flex items-center gap-6",
                      status === 'available' ? "border-border shadow-sm" : "border-primary/20 shadow-lg shadow-black/5"
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-inner",
                      status === 'available'
                        ? "bg-green-500/10 text-green-600 border border-green-500/20"
                        : "bg-blue-500 text-white border border-blue-600"
                    )}>
                      <span className="text-xs font-black opacity-60 uppercase">{slot.start_time.slice(0, 5)}</span>
                      <span className="text-lg font-black leading-tight">...</span>
                      <span className="text-[10px] font-bold opacity-60">{slot.end_time.slice(0, 5)}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-lg text-foreground tracking-tight">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </p>
                        {status !== 'available' && (
                          <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                            Aula Confirmada
                          </span>
                        )}
                      </div>

                      {booking ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={booking.student_profile?.avatar_url} />
                            <AvatarFallback className="text-[10px] bg-muted">{booking.student_profile?.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-bold text-muted-foreground italic">
                            {booking.student_profile?.full_name} <span className="mx-1.5 opacity-30">•</span> {booking.subjects?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <p className="text-sm font-bold text-green-600 italic uppercase tracking-wider">Livre para agendamento</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {status === 'available' ? (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12 active:scale-95 shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-surface transition-colors active:scale-95">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-surface rounded-[3rem] p-8 w-full max-w-md shadow-2xl border border-border overflow-hidden"
            >
              {/* Modal Background Decor */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl text-primary" />

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-foreground tracking-tight">Novo Horário</h3>
                    <p className="text-muted-foreground font-medium text-sm">
                      {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Clock className="w-7 h-7" />
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Início</label>
                      <input
                        type="time"
                        min="14:00"
                        max="19:00"
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="w-full h-14 rounded-2xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-black text-lg px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Fim</label>
                      <input
                        type="time"
                        min="14:00"
                        max="19:00"
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="w-full h-14 rounded-2xl bg-muted/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-black text-lg px-4"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <ListFilter className="w-3 h-3" /> Regra Sugerida
                    </p>
                    <p className="text-xs font-medium text-blue-500/80 leading-relaxed italic">
                      Seu horário padrão é das 14h às 19h. Lembre-se de deixar janelas para pausas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 h-14 bg-muted text-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all active:scale-95"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleAddSlot}
                    disabled={submitting}
                    className="flex-2 h-14 bg-primary text-primary-foreground font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-primary/20 min-w-[140px]"
                  >
                    {submitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      'Criar Horário'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notifications Backdrop */}
      <AnimatePresence>
        {showNotifs && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifs(false)}
              className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-16 right-4 w-80 bg-surface rounded-3xl border border-border shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                <span className="font-black text-sm uppercase tracking-widest text-foreground">Notificações</span>
                <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">
                  {activeNotifications.length}
                </span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {activeNotifications.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/50">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="text-muted-foreground text-sm font-medium italic">Tudo limpo por aqui.</p>
                  </div>
                ) : (
                  activeNotifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                      <p className="text-sm font-medium text-foreground mb-3">{n.message}</p>
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
                      >
                        Marcar como lida
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


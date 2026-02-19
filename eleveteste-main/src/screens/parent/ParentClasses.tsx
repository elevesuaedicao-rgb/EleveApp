import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClassSession {
  id: string;
  subject: string;
  subjectIcon: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  studentName: string;
}

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800';
    case 'confirmed': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800';
    case 'completed': return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800';
    case 'cancelled': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800';
    default: return 'bg-muted text-muted-foreground';
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'confirmed': return 'Confirmada';
    case 'completed': return 'Realizada';
    case 'cancelled': return 'Cancelada';
    default: return status;
  }
};

export const ParentClasses: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const MONTHS = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user, selectedMonth]);

  const fetchClasses = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get linked students
      const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id);

      if (!links || links.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }

      const studentIds = links.map(l => l.student_id);

      // Get bookings for linked students
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          time_slots (*),
          subjects (*)
        `)
        .in('student_id', studentIds);

      if (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
        return;
      }

      // Get student profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const formattedClasses: ClassSession[] = (bookings || [])
        .filter(b => {
          const bookingMonth = new Date(b.time_slots?.date + 'T00:00:00').getMonth() + 1;
          return bookingMonth === selectedMonth;
        })
        .map(b => ({
          id: b.id,
          subject: b.subjects?.name || 'Matéria',
          subjectIcon: SUBJECT_ICONS[b.subjects?.name || ''] || '📖',
          date: b.time_slots?.date || '',
          time: b.time_slots?.start_time?.slice(0, 5) || '',
          status: b.status as ClassSession['status'],
          studentName: profileMap.get(b.student_id) || 'Filho(a)'
        }));

      setClasses(formattedClasses);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scheduledCount = classes.filter(c => c.status === 'confirmed' || c.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Agenda de Aulas</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-foreground text-background text-xs font-bold px-2 py-0.5 rounded-md">
              {scheduledCount}
            </span>
            <span className="text-muted-foreground text-sm">aulas em {MONTHS.find(m => m.value === selectedMonth)?.label}</span>
          </div>
        </div>
        
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="bg-surface border border-border text-foreground text-sm font-medium rounded-xl focus:ring-primary focus:border-primary p-2.5 shadow-sm min-w-[140px]"
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label} {new Date().getFullYear()}</option>
          ))}
        </select>
      </div>

      <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 snap-x hide-scrollbar">
        {classes.length === 0 ? (
          <div className="bg-muted rounded-3xl p-12 text-center border border-dashed border-border w-full">
            <p className="text-muted-foreground">Nenhuma aula encontrada neste mês.</p>
            <p className="text-sm text-muted-foreground mt-2">Vincule um aluno para ver suas aulas.</p>
          </div>
        ) : (
          classes.map((session) => (
            <div 
              key={session.id} 
              className="min-w-[280px] sm:min-w-[320px] bg-surface p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300 snap-center flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-2xl border border-border">
                    {session.subjectIcon}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{session.subject}</h3>
                    <p className="text-muted-foreground text-xs font-medium">{session.studentName}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${session.status === 'confirmed' ? 'bg-blue-500' : session.status === 'pending' ? 'bg-yellow-500' : 'bg-muted-foreground/30'}`} />
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground tracking-tighter">{session.time}</span>
                </div>
                <div className="text-muted-foreground font-medium">
                  {new Date(session.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border ${getStatusColor(session.status)}`}>
                  {translateStatus(session.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

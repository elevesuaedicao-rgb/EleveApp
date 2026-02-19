import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule } from '@/hooks/useSchedule';
import { useNotifications } from '@/hooks/useNotifications';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, loading } = useSchedule();
  const { unreadCount } = useNotifications();

  const today = new Date().toISOString().split('T')[0];
  const todayClasses = bookings.filter(b => {
    const slot = b.time_slots;
    return slot && slot.date === today && (b.status === 'confirmed' || b.status === 'pending');
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-surface rounded-3xl p-6 border border-border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-foreground">Agenda de Hoje</h2>
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {todayClasses.length > 0 ? (
          <div className="space-y-3">
            {todayClasses.map((booking) => {
              const slot = booking.time_slots;
              if (!slot) return null;
              
              return (
                <div key={booking.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted border border-border">
                  <div className="w-16 text-center">
                    <span className="block text-xl font-bold text-foreground">{slot.start_time.slice(0, 5)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{booking.student_profile?.full_name || 'Aluno'}</h3>
                    <p className="text-sm text-muted-foreground">{booking.subjects?.name || 'Matéria'}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    booking.status === 'pending' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' 
                      : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  }`}>
                    {booking.status === 'pending' ? 'Pendente' : 'Confirmada'}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhuma aula para hoje.</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        
        <button onClick={() => navigate('/teacher/approvals')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group relative">
          {pendingCount > 0 && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{pendingCount}</span>
            </div>
          )}
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">✅</div>
          <h3 className="font-bold text-foreground">Aprovações</h3>
          <p className="text-xs text-muted-foreground mt-1">{pendingCount} solicitações</p>
        </button>

        <button onClick={() => navigate('/teacher/calendar')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📅</div>
          <h3 className="font-bold text-foreground">Agenda</h3>
          <p className="text-xs text-muted-foreground mt-1">Gerenciar horários</p>
        </button>

        <button onClick={() => navigate('/teacher/students')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👥</div>
          <h3 className="font-bold text-foreground">Alunos</h3>
          <p className="text-xs text-muted-foreground mt-1">Gestão de turmas</p>
        </button>

        <button onClick={() => navigate('/teacher/notifications')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group relative">
          {unreadCount > 0 && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{unreadCount}</span>
            </div>
          )}
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔔</div>
          <h3 className="font-bold text-foreground">Notificações</h3>
          <p className="text-xs text-muted-foreground mt-1">{unreadCount} não lidas</p>
        </button>

        <button onClick={() => navigate('/teacher/history')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📜</div>
          <h3 className="font-bold text-foreground">Histórico</h3>
          <p className="text-xs text-muted-foreground mt-1">Diário de classe</p>
        </button>

        <button onClick={() => navigate('/teacher/finance')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">💰</div>
          <h3 className="font-bold text-foreground">Financeiro</h3>
          <p className="text-xs text-muted-foreground mt-1">Relatórios</p>
        </button>

        <button onClick={() => navigate('/teacher/profile')} className="bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-left group">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👤</div>
          <h3 className="font-bold text-foreground">Meu Perfil</h3>
          <p className="text-xs text-muted-foreground mt-1">Configurações</p>
        </button>
      </div>
    </div>
  );
};

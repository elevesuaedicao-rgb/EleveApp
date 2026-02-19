import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JoinFamilyBanner } from '@/components/JoinFamilyBanner';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const firstName = profile?.full_name?.split(' ')[0] || 'Aluno';
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Join Family Banner for students without family */}
      <JoinFamilyBanner />

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800/50">
            <span>🎓</span> Bem-vindo de volta
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
            Olá, {firstName}! <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Vamos organizar seus estudos hoje? Escolha o que você gostaria de fazer.
          </p>
        </div>

        <button 
          onClick={() => navigate('/app/student/profile')}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-surface shadow-xl relative z-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {initials || <User className="w-10 h-10" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>

      <hr className="border-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <button 
          onClick={() => navigate('/app/student/booking')}
          className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-foreground to-foreground/80 dark:from-primary dark:to-blue-700 text-background dark:text-primary-foreground p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-left"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <span className="text-9xl">📅</span>
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-background/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-background/10">
                📅
              </div>
              <div>
                <h2 className="text-3xl font-bold leading-none">Agende seu<br/>horário</h2>
                <p className="text-background/70 dark:text-primary-foreground/70 mt-2 font-medium">Garanta sua aula com os melhores professores.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-background/20 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-background/10 group-hover:bg-background group-hover:text-foreground transition-colors">
              Acessar Calendário ➜
            </div>
          </div>
        </button>

        <button 
          onClick={() => navigate('/app/student/exams')}
          className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900 hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-purple-100 dark:border-purple-800/50 group-hover:scale-110 transition-transform">
              📝
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Minhas Provas</h2>
              <p className="text-muted-foreground mt-1 text-sm">Organize suas datas e tópicos de estudo.</p>
            </div>
          </div>
          <div className="mt-8 text-sm font-bold text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center gap-2 transition-colors">
            Ver Cronograma ➜
          </div>
        </button>

        <button 
          onClick={() => navigate('/app/student/history')}
          className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-900 hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-orange-100 dark:border-orange-800/50 group-hover:scale-110 transition-transform">
              📜
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Histórico</h2>
              <p className="text-muted-foreground mt-1 text-sm">Reveja o que você já estudou e sua evolução.</p>
            </div>
          </div>
          <div className="mt-8 text-sm font-bold text-muted-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 flex items-center gap-2 transition-colors">
            Ver Atividades ➜
          </div>
        </button>

      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
        <div className="text-3xl">💡</div>
        <div>
          <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg">Dica do dia</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1 leading-relaxed">
            Estudos mostram que revisar o conteúdo 24 horas após a aula aumenta a retenção em até 60%. Que tal agendar uma revisão rápida agora?
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParent } from './ParentLayout';
import { useAuth } from '@/hooks/useAuth';
import { useFamily } from '@/hooks/useFamily';
import { FamilyCodeBanner } from '@/components/FamilyCodeBanner';
import { Skeleton } from '@/components/ui/skeleton';

export const ParentDashboard: React.FC = () => {
  const { selectedChild, hasChildren, isLoading: isLoadingChildren } = useParent();
  const { profile } = useAuth();
  const { ensureFamilyExists } = useFamily();
  const navigate = useNavigate();

  const firstName = profile?.full_name?.split(' ')[0] || 'Responsável';

  // Ensure family exists when parent loads dashboard
  useEffect(() => {
    ensureFamilyExists();
  }, [ensureFamilyExists]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* Family Code Banner */}
      <FamilyCodeBanner />

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-6 pt-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 rounded-full text-xs font-bold uppercase tracking-wide border border-rose-100 dark:border-rose-800/50">
            <span>👨‍👩‍👧</span> Área da Família
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
            Olá, {firstName}! <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          {isLoadingChildren ? (
            <Skeleton className="h-6 w-64" />
          ) : hasChildren && selectedChild ? (
            <p className="text-lg text-muted-foreground max-w-md">
              Acompanhando o desenvolvimento de <strong className="text-foreground">{selectedChild.name}</strong> ({selectedChild.grade}).
            </p>
          ) : (
            <p className="text-lg text-muted-foreground max-w-md">
              Você ainda não possui filhos vinculados. Compartilhe o código da família para que seus filhos possam se vincular.
            </p>
          )}
        </div>

        {hasChildren && selectedChild && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-400 to-orange-400 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-surface shadow-xl overflow-hidden relative z-10 bg-muted flex items-center justify-center text-5xl">
              {selectedChild.avatarUrl.startsWith('http') ? (
                <img src={selectedChild.avatarUrl} alt={selectedChild.name} className="w-full h-full object-cover" />
              ) : (
                selectedChild.avatarUrl
              )}
            </div>
          </div>
        )}
      </div>

      <hr className="border-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <button 
          onClick={() => navigate('/parent/classes')}
          className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-700 text-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-left"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <span className="text-9xl">📅</span>
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="space-y-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10">
                📅
              </div>
              <div>
                <h2 className="text-3xl font-bold leading-none">Próximas<br/>Aulas</h2>
                <p className="text-blue-100 mt-2 font-medium">Veja o calendário completo e horários agendados.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-white/20 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/10 group-hover:bg-white group-hover:text-blue-900 transition-colors">
              Acessar Agenda ➜
            </div>
          </div>
        </button>

        <button 
          onClick={() => navigate('/parent/history')}
          className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900 hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-purple-100 dark:border-purple-800/50 group-hover:scale-110 transition-transform">
              📈
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Desempenho Pedagógico</h2>
              <p className="text-muted-foreground mt-1 text-sm">Acompanhe a evolução e histórico de atividades.</p>
            </div>
          </div>
          <div className="mt-8 text-sm font-bold text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center gap-2 transition-colors">
            Ver Histórico ➜
          </div>
        </button>

        <button 
          onClick={() => navigate('/parent/finance')}
          className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-900 hover:-translate-y-1 transition-all duration-300 text-left group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-emerald-100 dark:border-emerald-800/50 group-hover:scale-110 transition-transform">
              💰
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Financeiro</h2>
              <p className="text-muted-foreground mt-1 text-sm">Mensalidades e extratos.</p>
            </div>
          </div>
          <div className="mt-8 text-sm font-bold text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-2 transition-colors">
            Ver Situação ➜
          </div>
        </button>
      </div>

      {hasChildren && selectedChild && (
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-6 border border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-orange-900 dark:text-orange-100 text-lg">Insight Pedagógico</h3>
            <p className="text-orange-800 dark:text-orange-300 text-sm mt-1 leading-relaxed">
              {selectedChild.name} tem mostrado grande evolução em Exatas este mês. Recomendamos incentivar a leitura para equilibrar o desempenho em Português nas próximas semanas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

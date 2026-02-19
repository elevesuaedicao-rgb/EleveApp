import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Exam {
  id: string;
  subject: string;
  date: string;
  topics: string[];
  status: 'upcoming' | 'done';
}

const INITIAL_EXAMS: Exam[] = [
  { id: '1', subject: 'Matemática', date: '2024-06-25', topics: ['Função Afim', 'Geometria'], status: 'upcoming' },
  { id: '2', subject: 'Física', date: '2024-06-28', topics: ['Cinemática'], status: 'upcoming' },
  { id: '3', subject: 'Química', date: '2024-06-10', topics: ['Tabela Periódica'], status: 'done' },
];

const SUBJECT_CONFIG = [
  { name: 'Matemática', icon: '📐', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { name: 'Física', icon: '⚡', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { name: 'Química', icon: '🧪', color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { name: 'Inglês', icon: '🇺🇸', color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
  { name: 'Português', icon: '📚', color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
];

export const StudentExams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [filter, setFilter] = useState<'upcoming' | 'done'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExam, setNewExam] = useState({ subject: '', date: '', topics: [] as string[] });

  const filteredExams = exams.filter(e => e.status === filter);
  
  const getSubjectConfig = (name: string) => SUBJECT_CONFIG.find(s => s.name === name) || { icon: '📚', color: 'bg-gray-50 text-gray-600' };

  const handleAddExam = () => {
    if (!newExam.subject || !newExam.date) return;
    const exam: Exam = {
      id: Date.now().toString(),
      subject: newExam.subject,
      date: newExam.date,
      topics: newExam.topics,
      status: 'upcoming',
    };
    setExams([exam, ...exams]);
    setIsModalOpen(false);
    setNewExam({ subject: '', date: '', topics: [] });
  };

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors">←</button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Provas</h1>
            <p className="text-muted-foreground text-sm">Organize seu calendário de estudos</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-foreground text-background font-medium rounded-full shadow-lg hover:bg-foreground/90 transition-all">
          + Nova Prova
        </button>
      </div>

      <div className="flex p-1 bg-muted rounded-xl w-fit">
        <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'upcoming' ? 'bg-surface shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Próximas
        </button>
        <button onClick={() => setFilter('done')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'done' ? 'bg-surface shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Concluídas
        </button>
      </div>

      <div className="grid gap-4">
        {filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground">Nenhuma prova encontrada.</p>
          </div>
        ) : (
          filteredExams.map(exam => {
            const config = getSubjectConfig(exam.subject);
            const daysRemaining = Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={exam.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{exam.subject}</h3>
                    {daysRemaining <= 7 && daysRemaining > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">Chegando!</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(exam.date).toLocaleDateString('pt-BR')}
                    {exam.status === 'upcoming' && daysRemaining > 0 && <span className="text-xs ml-2">• Faltam {daysRemaining} dias</span>}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exam.topics.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold uppercase rounded-md border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-foreground mb-6">Cadastrar Prova</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data</label>
                <input type="date" value={newExam.date} onChange={(e) => setNewExam({...newExam, date: e.target.value})} className="w-full p-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Matéria</label>
                <div className="grid grid-cols-3 gap-2">
                  {SUBJECT_CONFIG.map(sub => (
                    <button key={sub.name} onClick={() => setNewExam({...newExam, subject: sub.name})} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${newExam.subject === sub.name ? 'bg-foreground text-background border-foreground' : `${sub.color} border-border hover:border-primary`}`}>
                      <span className="text-xl mb-1">{sub.icon}</span>
                      <span className="text-xs font-bold">{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAddExam} disabled={!newExam.subject || !newExam.date} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                Salvar Prova
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

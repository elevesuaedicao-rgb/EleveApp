import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type QuestionStatus = 'pending' | 'resolved';

interface Question {
  id: string;
  subject: string;
  topics: string[];
  description: string;
  status: QuestionStatus;
  createdAt: string;
  answer?: string;
}

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    subject: 'Matemática',
    topics: ['Equação 2º Grau'],
    description: 'Não entendi o que fazer quando o discriminante é menor que zero na equação do segundo grau.',
    status: 'pending',
    createdAt: '2024-06-18',
  },
  {
    id: '2',
    subject: 'Biologia',
    topics: ['Genética', 'Mendel'],
    description: 'Como funciona a primeira lei de Mendel na prática?',
    status: 'resolved',
    createdAt: '2024-06-10',
    answer: 'A primeira lei de Mendel trata da segregação dos fatores. Na prática, significa que cada característica é determinada por dois fatores que se separam na formação dos gametas.',
  },
];

const SUBJECT_OPTIONS = [
  { name: 'Matemática', icon: '📐', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { name: 'Física', icon: '⚡', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { name: 'Química', icon: '🧪', color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { name: 'Português', icon: '📚', color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
];

export const StudentQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ subject: '', description: '' });

  const getSubjectConfig = (name: string) => SUBJECT_OPTIONS.find(s => s.name === name) || { icon: '❓', color: 'bg-gray-100' };

  const handleAddQuestion = () => {
    if (!newQuestion.subject || !newQuestion.description) return;
    const question: Question = {
      id: Date.now().toString(),
      subject: newQuestion.subject,
      topics: [],
      description: newQuestion.description,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuestions([question, ...questions]);
    setIsModalOpen(false);
    setNewQuestion({ subject: '', description: '' });
  };

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors">←</button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Dúvidas</h1>
            <p className="text-muted-foreground text-sm">Tire dúvidas com seu professor</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-foreground text-background font-medium rounded-full shadow-lg hover:bg-foreground/90 transition-all">
          + Nova Dúvida
        </button>
      </div>

      <div className="space-y-4">
        {questions.map(q => {
          const config = getSubjectConfig(q.subject);
          return (
            <div key={q.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{q.subject}</h3>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${q.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
                        {q.status === 'pending' ? 'Pendente' : 'Resolvida'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{q.createdAt}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-foreground mb-3">{q.description}</p>
              
              {q.answer && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
                  <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-1">Resposta do Professor:</p>
                  <p className="text-sm text-green-800 dark:text-green-200">{q.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
            <h2 className="text-xl font-bold text-foreground mb-6">Nova Dúvida</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Matéria</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECT_OPTIONS.map(sub => (
                    <button key={sub.name} onClick={() => setNewQuestion({...newQuestion, subject: sub.name})} className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${newQuestion.subject === sub.name ? 'bg-foreground text-background border-foreground' : `${sub.color} border-border`}`}>
                      <span className="text-xl">{sub.icon}</span>
                      <span className="font-bold text-sm">{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sua dúvida</label>
                <textarea rows={4} value={newQuestion.description} onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})} placeholder="Descreva sua dúvida com detalhes..." className="w-full p-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>

              <button onClick={handleAddQuestion} disabled={!newQuestion.subject || !newQuestion.description} className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                Enviar Dúvida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

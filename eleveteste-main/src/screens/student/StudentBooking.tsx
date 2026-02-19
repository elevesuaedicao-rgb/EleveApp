import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchedule, TimeSlot } from '@/hooks/useSchedule';
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

const SMART_TOPICS: Record<string, string[]> = {
  'Matemática': ['Função Quadrática', 'Teorema de Tales', 'Relações Métricas', 'Potenciação'],
  'Física': ['Cinemática', 'Velocidade Média', 'Aceleração', 'Leis de Newton'],
  'Química': ['Modelos Atômicos', 'Tabela Periódica', 'Ligações Químicas', 'Ácidos e Bases'],
  'Biologia': ['Citologia', 'Genética', 'Ecologia', 'Evolução'],
  'Português': ['Oração Subordinada', 'Crase', 'Concordância Verbal', 'Interpretação de Texto'],
  'História': ['Revolução Francesa', 'Brasil Colônia', 'Era Vargas', 'Guerra Fria'],
  'Geografia': ['Geopolítica', 'Clima', 'Urbanização', 'Recursos Naturais'],
  'Inglês': ['Present Perfect', 'Passive Voice', 'Conditional Sentences', 'Phrasal Verbs'],
};

export const StudentBooking: React.FC = () => {
  const { getAvailableSlots, getMyBookings, subjects, requestBooking, loading } = useSchedule();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'available'>('available');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingSubject, setBookingSubject] = useState<{ id: string; name: string } | null>(null);
  const [bookingTopics, setBookingTopics] = useState<string[]>([]);
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableSlots = useMemo(() => getAvailableSlots(), [getAvailableSlots]);
  const myBookings = useMemo(() => getMyBookings(), [getMyBookings]);

  const openBookingModal = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setBookingStep(1);
    setBookingSubject(null);
    setBookingTopics([]);
    setBookingNotes('');
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !bookingSubject) return;
    
    setSubmitting(true);
    const { error } = await requestBooking(
      selectedSlot.id,
      bookingSubject.id,
      bookingTopics,
      bookingNotes || undefined
    );

    if (error) {
      toast.error('Erro ao agendar aula');
    } else {
      toast.success('Aula agendada com sucesso! Aguarde confirmação.');
      setIsModalOpen(false);
    }
    setSubmitting(false);
  };

  const toggleTopic = (topic: string) => {
    setBookingTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return {
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors">←</button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendar Aula</h1>
            <p className="text-muted-foreground text-sm">Escolha um horário disponível</p>
          </div>
        </div>
      </div>

      <div className="flex p-1 bg-muted rounded-xl w-fit">
        <button onClick={() => setActiveTab('available')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'available' ? 'bg-surface shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Disponíveis ({availableSlots.length})
        </button>
        <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-surface shadow-sm text-foreground' : 'text-muted-foreground'}`}>
          Minhas Aulas ({myBookings.length})
        </button>
      </div>

      {activeTab === 'available' ? (
        <div className="grid gap-3">
          {availableSlots.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground">Nenhum horário disponível no momento.</p>
            </div>
          ) : (
            availableSlots.map(slot => {
              const { weekday, day, month } = formatDate(slot.date);
              return (
                <button
                  key={slot.id}
                  onClick={() => openBookingModal(slot)}
                  className="bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all text-left group flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex flex-col items-center justify-center border border-green-100 dark:border-green-800">
                    <span className="text-xs font-bold uppercase">{weekday}</span>
                    <span className="text-xl font-bold">{day}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">{slot.start_time.slice(0, 5)}</p>
                    <p className="text-muted-foreground text-sm">{month}</p>
                  </div>
                  <div className="text-muted-foreground group-hover:text-primary transition-colors">➜</div>
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {myBookings.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-border">
              <p className="text-muted-foreground">Você ainda não tem aulas agendadas.</p>
            </div>
          ) : (
            myBookings.map(booking => {
              const slot = booking.time_slots;
              if (!slot) return null;
              const { weekday, day } = formatDate(slot.date);
              const subjectName = booking.subjects?.name || 'Matéria';
              
              return (
                <div key={booking.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${booking.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'}`}>
                    <span className="text-xs font-bold uppercase">{weekday}</span>
                    <span className="text-xl font-bold">{day}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{subjectName}</p>
                      {booking.status === 'pending' && <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-[10px] font-bold rounded-full">Pendente</span>}
                      {booking.status === 'confirmed' && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-[10px] font-bold rounded-full">Confirmada</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">{slot.date} às {slot.start_time.slice(0, 5)}</p>
                    {booking.topics && <p className="text-xs text-muted-foreground mt-1">{booking.topics.join(', ')}</p>}
                    <button
                      onClick={() => navigate(`/app/student/lessons/${booking.id}`)}
                      className="mt-2 text-xs font-semibold text-primary"
                    >
                      Vincular subassunto
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-surface rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
            
            <div className="bg-muted px-6 py-4 border-b border-border flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Agendamento • {selectedSlot.date} - {selectedSlot.start_time.slice(0, 5)}</p>
                <h2 className="text-lg font-bold text-foreground">
                  {bookingStep === 1 ? 'Qual a matéria?' : bookingStep === 2 ? 'Assuntos da Aula' : 'Detalhes Finais'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-destructive">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {bookingStep === 1 && (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-right-4">
                  {subjects.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setBookingSubject({ id: sub.id, name: sub.name }); setBookingStep(2); }}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border transition-all hover:scale-105 active:scale-95 group bg-muted hover:bg-primary/10 border-border hover:border-primary"
                    >
                      <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{SUBJECT_ICONS[sub.name] || '📖'}</span>
                      <span className="font-bold text-foreground">{sub.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {bookingStep === 2 && bookingSubject && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setBookingStep(1)} className="text-sm font-bold text-muted-foreground hover:text-foreground">← Voltar</button>
                    <span className="font-bold text-foreground text-lg">{bookingSubject.name}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(SMART_TOPICS[bookingSubject.name] || []).map(topic => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${bookingTopics.includes(topic) ? 'bg-foreground text-background border-foreground' : 'bg-surface text-muted-foreground border-border hover:border-primary'}`}
                      >
                        {topic} {bookingTopics.includes(topic) && '✓'}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setBookingStep(3)}
                    disabled={bookingTopics.length === 0}
                    className="w-full py-3.5 bg-foreground text-background font-bold rounded-xl shadow-lg hover:bg-foreground/90 transition-all disabled:opacity-50"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {bookingStep === 3 && bookingSubject && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <button onClick={() => setBookingStep(2)} className="text-sm font-bold text-muted-foreground hover:text-foreground">← Voltar</button>

                  <div>
                    <label className="block text-sm font-bold text-foreground mb-2">Observações (Opcional)</label>
                    <textarea 
                      rows={3}
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Ex: Gostaria de focar na resolução de exercícios..."
                      className="w-full p-4 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Resumo</h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li><strong>Data:</strong> {selectedSlot.date} às {selectedSlot.start_time.slice(0, 5)}</li>
                      <li><strong>Matéria:</strong> {bookingSubject.name}</li>
                      <li><strong>Tópicos:</strong> {bookingTopics.join(', ')}</li>
                    </ul>
                  </div>

                  <button 
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-xl hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>✅ Confirmar Agendamento</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

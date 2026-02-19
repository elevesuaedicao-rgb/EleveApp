import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuestionTickets } from '@/hooks/useQuestionTickets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SUB_TOPICS: Record<string, string[]> = {
  'Matemática': ['Álgebra', 'Geometria', 'Trigonometria', 'Cálculo', 'Estatística', 'Funções'],
  'Física': ['Mecânica', 'Termodinâmica', 'Óptica', 'Eletromagnetismo', 'Ondulatória'],
  'Química': ['Química Orgânica', 'Química Inorgânica', 'Físico-Química', 'Estequiometria'],
  'Biologia': ['Genética', 'Ecologia', 'Citologia', 'Fisiologia', 'Evolução'],
  'Português': ['Gramática', 'Interpretação', 'Redação', 'Literatura'],
  'Inglês': ['Grammar', 'Vocabulary', 'Reading', 'Writing', 'Listening'],
  'História': ['Brasil Colônia', 'Brasil Império', 'República', 'História Geral'],
  'Geografia': ['Geopolítica', 'Climatologia', 'Cartografia', 'Urbanização'],
};

export const StudentQuestionsPage = () => {
  const navigate = useNavigate();
  const { tickets, isLoading, createTicket, isCreating } = useQuestionTickets({ role: 'student' });
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  
  // Form state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await supabase.from('subjects').select('*').order('name');
      return data || [];
    },
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'open' && ticket.status === 'open') ||
                          (filterStatus === 'resolved' && ticket.status === 'resolved');
    return matchesSearch && matchesStatus;
  });

  const handleSubmitTicket = async () => {
    if (!selectedSubject || !title || !description) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    try {
      await createTicket({
        subject_id: selectedSubject,
        title,
        description,
        sub_topics: selectedSubTopics,
      });
      toast({ title: 'Dúvida enviada com sucesso!' });
      setShowNewTicket(false);
      resetForm();
    } catch {
      toast({ title: 'Erro ao enviar dúvida', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSubject('');
    setSelectedSubTopics([]);
    setTitle('');
    setDescription('');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { icon: Clock, label: 'Aguardando', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' };
      case 'in_progress':
        return { icon: MessageSquare, label: 'Em andamento', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
      case 'resolved':
        return { icon: CheckCircle, label: 'Resolvida', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
      default:
        return { icon: Clock, label: 'Pendente', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const selectedSubjectName = subjects?.find(s => s.id === selectedSubject)?.name || '';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/student')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Minhas Dúvidas</h1>
          </div>
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Dúvida
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar dúvida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: 'all' | 'open' | 'resolved') => setFilterStatus(v)}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="resolved">Resolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground font-medium">Nenhuma dúvida encontrada</p>
            <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Dúvida" para criar uma</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredTickets.map((ticket, index) => {
                const statusConfig = getStatusConfig(ticket.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {}}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {ticket.description}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {ticket.subject && (
                            <Badge variant="outline">{ticket.subject.name}</Badge>
                          )}
                          {ticket.sub_topics.slice(0, 2).map((topic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {/* Teacher Response */}
                        {ticket.teacher_response && (
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                              ✅ Resposta do Professor
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {ticket.teacher_response}
                            </p>
                            {ticket.response_steps.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {ticket.response_steps.map((step, i) => (
                                  <p key={i} className="text-sm text-green-600 dark:text-green-400 flex items-start gap-2">
                                    <span className="font-bold">{i + 1}.</span>
                                    {step}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={(open) => { setShowNewTicket(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Nova Dúvida - Etapa {step} de 3
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Step 1: Select Subject */}
            {step === 1 && (
              <div className="space-y-4">
                <Label>Qual matéria?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects?.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => { setSelectedSubject(subject.id); setStep(2); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedSubject === subject.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{subject.icon || '📚'}</span>
                      <span className="font-medium text-foreground">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Sub-topics */}
            {step === 2 && (
              <div className="space-y-4">
                <Label>Sobre qual assunto? (opcional)</Label>
                <div className="flex flex-wrap gap-2">
                  {(SUB_TOPICS[selectedSubjectName] || []).map(topic => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedSubTopics(prev => 
                          prev.includes(topic) 
                            ? prev.filter(t => t !== topic)
                            : [...prev, topic]
                        );
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        selectedSubTopics.includes(topic)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título da dúvida</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Como resolver equações do 2º grau?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descreva sua dúvida</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explique sua dúvida com detalhes..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmitTicket} 
                    disabled={isCreating || !title || !description}
                    className="flex-1"
                  >
                    {isCreating ? 'Enviando...' : 'Enviar Dúvida'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentQuestionsPage;

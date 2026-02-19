import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, CheckCircle, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuestionTickets, QuestionTicket } from '@/hooks/useQuestionTickets';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const TeacherQuestionsPage = () => {
  const navigate = useNavigate();
  const { tickets, isLoading, respondToTicket, isResponding } = useQuestionTickets({ role: 'teacher' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<QuestionTicket | null>(null);
  
  // Response form
  const [response, setResponse] = useState('');
  const [steps, setSteps] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.student?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'open' && ticket.status === 'open') ||
                          (filterStatus === 'resolved' && ticket.status === 'resolved');
    return matchesSearch && matchesStatus;
  });

  const openTickets = tickets.filter(t => t.status === 'open').length;

  const handleRespond = async () => {
    if (!selectedTicket || !response) {
      toast({ title: 'Preencha a resposta', variant: 'destructive' });
      return;
    }

    try {
      await respondToTicket({
        ticketId: selectedTicket.id,
        response,
        steps: steps.filter(s => s.trim() !== ''),
        difficulty,
      });
      toast({ title: 'Resposta enviada com sucesso!' });
      setSelectedTicket(null);
      resetForm();
    } catch {
      toast({ title: 'Erro ao enviar resposta', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setResponse('');
    setSteps(['']);
    setDifficulty('medium');
  };

  const addStep = () => setSteps([...steps, '']);
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dúvidas dos Alunos</h1>
              <p className="text-sm text-muted-foreground">{openTickets} pendente{openTickets !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por aluno ou dúvida..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v: 'all' | 'open' | 'resolved') => setFilterStatus(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="open">Pendentes</SelectItem>
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
                    <Card 
                      className={`hover:shadow-md transition-shadow cursor-pointer ${
                        ticket.status === 'open' ? 'border-yellow-200 dark:border-yellow-800' : ''
                      }`}
                      onClick={() => ticket.status === 'open' && setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={ticket.student?.avatar_url || undefined} />
                            <AvatarFallback>
                              {ticket.student?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) || <User className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-medium text-foreground">{ticket.student?.full_name || 'Aluno'}</p>
                                <h3 className="font-bold text-foreground">{ticket.title}</h3>
                              </div>
                              <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {ticket.description}
                            </p>
                            
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => { if (!open) { setSelectedTicket(null); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Responder Dúvida</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="py-4 space-y-4">
              {/* Question Summary */}
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedTicket.student?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {selectedTicket.student?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{selectedTicket.student?.full_name}</span>
                </div>
                <h4 className="font-bold text-foreground">{selectedTicket.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sua resposta</Label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Explique a resolução da dúvida..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passos da resolução (opcional)</Label>
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="flex items-center justify-center w-6 h-9 text-sm font-bold text-muted-foreground">
                        {index + 1}.
                      </span>
                      <Input
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder={`Passo ${index + 1}...`}
                      />
                      {steps.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeStep(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addStep}>
                    + Adicionar passo
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Nível de dificuldade</Label>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                          difficulty === level
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {level === 'easy' ? '🟢 Fácil' : level === 'medium' ? '🟡 Médio' : '🔴 Difícil'}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleRespond} 
                  disabled={isResponding || !response}
                  className="w-full"
                >
                  {isResponding ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherQuestionsPage;

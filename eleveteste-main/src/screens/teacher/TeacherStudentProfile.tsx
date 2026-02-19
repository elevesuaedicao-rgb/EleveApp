import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Calendar, MessageSquare, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeacherStudents } from '@/hooks/useTeacherStudents';
import { useLearningHistory } from '@/hooks/useLearningHistory';
import { useTrainingSessions } from '@/hooks/useTrainingSessions';
import { MonthlyStatsModal } from '@/components/teacher/MonthlyStatsModal';
import { LearningTimeline } from '@/components/history/LearningTimeline';

export const TeacherStudentProfile = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const { students, isLoading: loadingStudents } = useTeacherStudents();
  const { history, isLoading: loadingHistory } = useLearningHistory({ 
    studentId, 
    role: 'teacher' 
  });
  const { sessions: trainingSessions, stats: trainingStats } = useTrainingSessions(studentId);
  const [showStatsModal, setShowStatsModal] = useState(false);

  const student = students.find(s => s.student_id === studentId);

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Aluno não encontrado</p>
        <Button onClick={() => navigate('/teacher/students')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    );
  }

  const initials = student.student.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const thisMonthClasses = history.filter(h => {
    const now = new Date();
    const date = new Date(h.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalHoursThisMonth = thisMonthClasses.reduce((sum, h) => sum + h.duration_minutes, 0) / 60;

  const handleWhatsApp = () => {
    const phone = student.student.phone || student.parent?.phone;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/teacher/students')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Perfil do Aluno</h1>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Student Header Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={student.student.avatar_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground">{student.student.full_name}</h2>
                <p className="text-muted-foreground">{student.student.grade_year || 'Série não informada'}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status === 'active' ? 'Ativo' : student.status === 'pending' ? 'Pendente' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline">
                    {student.mode === 'online' ? '💻 Online' : '🏠 Presencial'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.student.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{student.student.email}</span>
                </div>
              )}
              {student.student.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{student.student.phone}</span>
                </div>
              )}
            </div>

            {/* Parent Info */}
            {student.parent && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm font-medium text-foreground mb-1">Responsável</p>
                <p className="text-muted-foreground">{student.parent.full_name}</p>
                {student.parent.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Phone className="w-3 h-3" />
                    {student.parent.phone}
                  </p>
                )}
              </div>
            )}

            {/* Pricing */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm font-medium text-foreground mb-2">Valores acordados</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">1 hora</p>
                  <p className="font-bold text-green-600">R$ {Number(student.price_per_hour).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">1h30</p>
                  <p className="font-bold text-green-600">R$ {Number(student.price_per_90min).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">2 horas</p>
                  <p className="font-bold text-green-600">R$ {Number(student.price_per_2h).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-foreground">{thisMonthClasses.length}</p>
            <p className="text-xs text-muted-foreground">Aulas este mês</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-foreground">{totalHoursThisMonth.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Horas este mês</p>
          </Card>
          <Card className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-foreground">{history.length}</p>
            <p className="text-xs text-muted-foreground">Total de aulas</p>
          </Card>
          <Card className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-foreground">
              {history.filter(h => h.student_performance === 'excellent' || h.student_performance === 'good').length}
            </p>
            <p className="text-xs text-muted-foreground">Bom desempenho</p>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Treinos Autonomos do Aluno</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-muted border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{trainingStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessoes</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border text-center">
                <p className="text-2xl font-bold text-foreground">{trainingStats.averageScore}%</p>
                <p className="text-xs text-muted-foreground">Media</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border text-center">
                <p className="text-sm font-semibold text-foreground">{trainingStats.mostPracticedTopic || 'Sem dados'}</p>
                <p className="text-xs text-muted-foreground mt-1">Top pratica</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border text-center">
                <p className="text-sm font-semibold text-foreground">{trainingStats.hardestTopic || 'Sem dados'}</p>
                <p className="text-xs text-muted-foreground mt-1">Dificuldade</p>
              </div>
            </div>

            {trainingSessions.length > 0 && (
              <div className="space-y-2">
                {trainingSessions.slice(0, 4).map((session) => (
                  <div key={session.id} className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="font-medium text-foreground">
                      {session.subjectName} - {session.topicName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(session.finishedAt).toLocaleDateString('pt-BR')} | {session.scorePercent}% |{' '}
                      {session.correctCount}/{session.totalTasks} acertos
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setShowStatsModal(true)} className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Ver Estatísticas do Mês
          </Button>
          <Button variant="outline" onClick={handleWhatsApp} className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </div>

        {/* Learning History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Pedagógico</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline">
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1">Timeline</TabsTrigger>
                <TabsTrigger value="list" className="flex-1">Lista</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <LearningTimeline entries={history} isLoading={loadingHistory} />
              </TabsContent>
              <TabsContent value="list" className="mt-4">
                <div className="space-y-3">
                  {history.slice(0, 10).map(entry => (
                    <div key={entry.id} className="p-4 bg-muted/50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {entry.subject?.name || 'Aula'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('pt-BR')} • {entry.duration_minutes} min
                          </p>
                        </div>
                        {entry.student_performance && (
                          <Badge variant={
                            entry.student_performance === 'excellent' ? 'default' :
                            entry.student_performance === 'good' ? 'secondary' : 'outline'
                          }>
                            {entry.student_performance === 'excellent' ? '⭐ Excelente' :
                             entry.student_performance === 'good' ? '👍 Bom' :
                             entry.student_performance === 'regular' ? '📊 Regular' : '⚠️ Precisa melhorar'}
                          </Badge>
                        )}
                      </div>
                      {entry.topics_covered.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.topics_covered.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Stats Modal */}
      {showStatsModal && student && (
        <MonthlyStatsModal
          student={student}
          history={history}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
};

export default TeacherStudentProfile;

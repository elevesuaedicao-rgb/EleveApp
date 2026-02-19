import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FamilyCodeBanner } from '@/components/FamilyCodeBanner';
import { useGuardian } from './GuardianLayout';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { formatCurrency } from './utils';

export const GuardianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudentId, hasStudents } = useGuardian();
  const { lessons, financeSummary, learningHistory, teacherPhoneE164 } = useGuardianPortal(selectedStudentId || undefined);

  const upcomingLessons = useMemo(() => {
    const now = new Date();
    return lessons
      .filter((lesson) => new Date(`${lesson.date}T${lesson.startTime}:00`) >= now)
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
      .slice(0, 3);
  }, [lessons]);

  const weeklyPendingConfirmations = useMemo(
    () => lessons.filter((lesson) => lesson.status === 'BOOKED_PENDING_CONFIRMATION').length,
    [lessons]
  );

  const weeklyLessonsDone = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return learningHistory.filter((entry) => {
      const date = new Date(entry.date);
      return date >= weekAgo && date <= now;
    }).length;
  }, [learningHistory]);

  return (
    <div className="space-y-6">
      <FamilyCodeBanner />

      {!hasStudents && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Para liberar agenda, progresso e financeiro, vincule primeiro um aluno da familia.
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Proximas aulas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingLessons.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Proximas 3 aulas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confirmacoes pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weeklyPendingConfirmations}</p>
            <p className="text-xs text-muted-foreground mt-1">Semana atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resumo academico</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weeklyLessonsDone}</p>
            <p className="text-xs text-muted-foreground mt-1">Relatorios na ultima semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Faturas em aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(financeSummary.open)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total pendente</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button onClick={() => navigate('/app/guardian/students/' + (selectedStudentId || '') + '/booking/new')} disabled={!hasStudents}>
          Agendar aula
        </Button>
        <Button onClick={() => navigate('/app/guardian/students/' + (selectedStudentId || '') + '/booking/confirmations')} variant="secondary" disabled={!hasStudents}>
          Confirmar presenca
        </Button>
        <Button onClick={() => navigate('/app/guardian/finance/invoices')} variant="outline" disabled={!hasStudents}>
          Pagar fatura
        </Button>
        <Button
          onClick={() => {
            if (!teacherPhoneE164 || !selectedStudentId) return;
            window.open(
              `https://wa.me/${teacherPhoneE164.replace(/\D/g, '')}?text=${encodeURIComponent(
                'Ola, professor! Aqui e o responsavel do aluno. Posso tirar uma duvida?'
              )}`,
              '_blank'
            );
          }}
          variant="outline"
          disabled={!teacherPhoneE164}
        >
          Enviar mensagem
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Proximas aulas</h2>
        {upcomingLessons.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aula futura encontrada.</p>}
        {upcomingLessons.map((lesson) => (
          <Card key={lesson.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{lesson.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.date} as {lesson.startTime}
                </p>
              </div>
              <Button variant="ghost" onClick={() => navigate(`/app/guardian/students/${selectedStudentId}/lessons/${lesson.id}`)}>
                Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};

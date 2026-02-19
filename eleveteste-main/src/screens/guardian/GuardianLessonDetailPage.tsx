import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { useGuardian } from './GuardianLayout';
import { formatLessonStatus } from './utils';

export const GuardianLessonDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, lessonId } = useParams();
  const { selectedStudentId } = useGuardian();
  const { lessons, teacher } = useGuardianPortal(studentId || selectedStudentId || undefined);

  const lesson = useMemo(() => lessons.find((item) => item.id === lessonId), [lessonId, lessons]);

  if (!lesson) {
    return <p className="text-sm text-muted-foreground">Aula nao encontrada.</p>;
  }

  const whatsappMessage = encodeURIComponent(
    `Ola! Sobre a aula de ${lesson.date} as ${lesson.startTime}, queria falar sobre...`
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Detalhe da aula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Data e horario:</strong> {lesson.date} as {lesson.startTime}
          </p>
          <p>
            <strong>Modalidade:</strong> {lesson.modality}
          </p>
          <p>
            <strong>Status:</strong> {formatLessonStatus(lesson.status)}
          </p>
          <p>
            <strong>Conteudo planejado:</strong> {lesson.topics.join(', ') || 'Nao informado'}
          </p>
          <p>
            <strong>Observacoes:</strong> {lesson.notes || 'Sem observacoes'}
          </p>
          <p>
            <strong>Valor da aula:</strong> Conforme tabela ativa do professor
          </p>
          <p>
            <strong>Local ou link:</strong> Definido conforme modalidade
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="destructive" onClick={() => navigate(`/app/guardian/students/${studentId}/lessons/${lesson.id}/cancel`)}>
          Cancelar
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/app/guardian/students/${studentId}/lessons/${lesson.id}/reschedule`)}>
          Remarcar
        </Button>
        <Button onClick={() => navigate(`/app/guardian/students/${studentId}/booking/confirmations?lessonId=${lesson.id}`)}>
          Confirmar presenca
        </Button>
        {teacher?.phone && (
          <Button
            variant="outline"
            onClick={() => window.open(`https://wa.me/${teacher.phone.replace(/\D/g, '')}?text=${whatsappMessage}`, '_blank')}
          >
            Falar com o professor
          </Button>
        )}
      </div>
    </div>
  );
};

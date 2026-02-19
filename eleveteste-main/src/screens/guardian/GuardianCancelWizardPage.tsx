import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';

const CANCELLATION_MIN_HOURS = 12;

export const GuardianCancelWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { studentId, lessonId } = useParams();
  const [step, setStep] = useState(1);

  const { lessons } = useGuardianPortal(studentId);
  const lesson = lessons.find((item) => item.id === lessonId);

  const hoursUntilLesson = lesson
    ? Math.floor((new Date(`${lesson.date}T${lesson.startTime}:00`).getTime() - Date.now()) / (1000 * 60 * 60))
    : 0;

  const outOfPolicy = hoursUntilLesson < CANCELLATION_MIN_HOURS;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!lessonId) throw new Error('Aula invalida');
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['guardian-bookings'] });
      toast({
        title: 'Aula cancelada',
        description: outOfPolicy
          ? 'Cancelamento fora do prazo. Um ajuste financeiro pode ser aplicado.'
          : 'Cancelamento dentro da politica.',
      });
      navigate(`/app/guardian/students/${studentId}/calendar`);
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao cancelar', variant: 'destructive' });
    },
  });

  if (!lesson) return <p className="text-sm text-muted-foreground">Aula nao encontrada.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wizard: Cancelar</h1>
      <p className="text-sm text-muted-foreground">Etapa {step} de 2</p>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 - Politica de cancelamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>Antecedencia minima configurada: {CANCELLATION_MIN_HOURS} horas.</p>
            <p>
              Sua aula esta em {hoursUntilLesson} horas.{' '}
              {outOfPolicy ? 'Esse cancelamento esta fora do prazo e pode gerar cobranca.' : 'Cancelamento dentro do prazo.'}
            </p>
            <Button onClick={() => setStep(2)}>Continuar</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 - Confirmar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Tem certeza que deseja cancelar a aula de {lesson.date} as {lesson.startTime}?</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button variant="destructive" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? 'Cancelando...' : 'Confirmar cancelamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

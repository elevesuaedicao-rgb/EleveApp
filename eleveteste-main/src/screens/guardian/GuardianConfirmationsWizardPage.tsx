import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, format, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';

export const GuardianConfirmationsWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { studentId } = useParams();
  const { lessons } = useGuardianPortal(studentId);

  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = addDays(start, 6);

  const weekLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const date = new Date(`${lesson.date}T00:00:00`);
      return date >= start && date <= end;
    });
  }, [end, lessons, start]);

  const mutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const { data: booking } = await supabase.from('bookings').select('notes').eq('id', lessonId).maybeSingle();
      const currentNotes = booking?.notes || '';
      const noteTag = `[guardian_confirmation:${new Date().toISOString()}]`;
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', notes: `${currentNotes}\n${noteTag}` })
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['guardian-bookings'] });
      toast({
        title: 'Presenca confirmada',
        description: 'Status aplicado: CONFIRMED_BY_GUARDIAN (registrado em notas).',
      });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao confirmar', variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wizard: Confirmar Presenca</h1>
      <p className="text-sm text-muted-foreground">Aulas da semana para confirmar</p>

      <Card>
        <CardHeader>
          <CardTitle>
            Semana: {format(start, 'dd/MM')} - {format(end, 'dd/MM')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weekLessons.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aula nesta semana.</p>}
          {weekLessons.map((lesson) => (
            <div key={lesson.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{lesson.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.date} as {lesson.startTime}
                </p>
              </div>
              <Button size="sm" onClick={() => mutation.mutate(lesson.id)} disabled={mutation.isPending}>
                Confirmar
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={() => navigate(`/app/guardian/students/${studentId}/calendar`)}>
            Voltar para agenda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

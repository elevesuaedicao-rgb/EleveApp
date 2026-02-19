import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';

export const GuardianRescheduleWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, lessonId } = useParams();
  const queryClient = useQueryClient();
  const { lessons, slotsByDate } = useGuardianPortal(studentId);

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [newSlotId, setNewSlotId] = useState('');

  const lesson = lessons.find((item) => item.id === lessonId);

  const availableSlots = useMemo(() => {
    return Array.from(slotsByDate.values())
      .flat()
      .filter((slot) => slot.status === 'LIVRE')
      .slice(0, 20);
  }, [slotsByDate]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!lessonId || !newSlotId) throw new Error('Escolha um novo horario');
      const { error } = await supabase
        .from('bookings')
        .update({ slot_id: newSlotId, status: 'pending', notes: `${lesson?.notes || ''}\nRemarcacao: ${reason}` })
        .eq('id', lessonId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['guardian-bookings'] });
      toast({ title: 'Remarcacao solicitada', description: 'Status atualizado para BOOKED_PENDING_CONFIRMATION' });
      navigate(`/app/guardian/students/${studentId}/calendar`);
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Nao foi possivel remarcar', variant: 'destructive' });
    },
  });

  if (!lesson) return <p className="text-sm text-muted-foreground">Aula nao encontrada.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wizard: Remarcar</h1>
      <p className="text-sm text-muted-foreground">Etapa {step} de 3</p>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 - Motivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Informe o motivo da remarcacao</Label>
            <Input value={reason} onChange={(event) => setReason(event.target.value)} />
            <Button onClick={() => setStep(2)} disabled={!reason.trim()}>
              Proximo
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 - Novo horario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setNewSlotId(slot.id)}
                className={`w-full p-3 rounded-lg border text-left ${newSlotId === slot.id ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                {slot.date} as {slot.startTime}
              </button>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} disabled={!newSlotId}>
                Proximo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 - Confirmar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Aula atual:</strong> {lesson.date} as {lesson.startTime}
            </p>
            <p>
              <strong>Motivo:</strong> {reason}
            </p>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando...' : 'Confirmar remarcacao'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

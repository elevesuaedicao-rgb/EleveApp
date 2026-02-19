import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';

export const GuardianBookingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const preselectedSlotId = searchParams.get('slotId') || '';
  const preselectedDate = searchParams.get('date') || '';

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'online' | 'presencial' | 'ambos'>('ambos');
  const [duration, setDuration] = useState('60');
  const [subjectId, setSubjectId] = useState('');
  const [goal, setGoal] = useState('');
  const [slotId, setSlotId] = useState(preselectedSlotId);
  const [topic, setTopic] = useState('');
  const [questionLink, setQuestionLink] = useState('');
  const [observation, setObservation] = useState('');

  const { slotsByDate } = useGuardianPortal(studentId);

  const subjectsQuery = useQuery({
    queryKey: ['guardian-subjects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subjects').select('id, name').order('name');
      if (error) throw error;
      return data ?? [];
    },
  });

  const availableSlots = useMemo(() => {
    const dates = Array.from(slotsByDate.keys()).sort();
    const preferred = preselectedDate && slotsByDate.get(preselectedDate) ? [preselectedDate] : [];
    const rest = dates.filter((date) => date !== preselectedDate).slice(0, 14);

    return [...preferred, ...rest].flatMap((date) =>
      (slotsByDate.get(date) || [])
        .filter((slot) => slot.status === 'LIVRE')
        .map((slot) => ({ ...slot, label: `${slot.date} as ${slot.startTime}` }))
    );
  }, [preselectedDate, slotsByDate]);

  const selectedSlot = availableSlots.find((slot) => slot.id === slotId);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!studentId || !slotId || !subjectId) {
        throw new Error('Preencha aluno, materia e horario.');
      }

      const { error } = await supabase.from('bookings').insert({
        student_id: studentId,
        slot_id: slotId,
        subject_id: subjectId,
        topics: [topic].filter(Boolean),
        notes: [goal, questionLink, observation].filter(Boolean).join('\n'),
        status: 'pending',
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['guardian-bookings'] });
      toast({
        title: 'Aula agendada',
        description: 'Status criado: BOOKED_PENDING_CONFIRMATION',
      });
      navigate(`/app/guardian/students/${studentId}/calendar`);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao agendar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wizard: Agendar Aula</h1>
      <p className="text-sm text-muted-foreground">Etapa {step} de 4</p>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 - Tipo de Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Modalidade</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ambos">Ambos</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Duracao (min)</Label>
              <Input value={duration} onChange={(event) => setDuration(event.target.value)} />
            </div>

            <div>
              <Label>Materia</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(subjectsQuery.data || []).map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Objetivo opcional</Label>
              <Textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Ex: revisar frações" />
            </div>

            <Button onClick={() => setStep(2)} disabled={!subjectId}>
              Proximo
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 - Escolher Horario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableSlots.length === 0 && <p className="text-sm text-muted-foreground">Sem horarios livres no momento.</p>}
            {availableSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSlotId(slot.id)}
                className={`w-full rounded-lg border p-3 text-left ${slotId === slot.id ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                {slot.label}
              </button>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} disabled={!slotId}>
                Proximo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 - Preparacao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Topico</Label>
              <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Ex: Regra de tres" />
            </div>
            <div>
              <Label>Vincular duvida</Label>
              <Input value={questionLink} onChange={(event) => setQuestionLink(event.target.value)} placeholder="Link/ID da duvida" />
            </div>
            <div>
              <Label>Observacao</Label>
              <Textarea value={observation} onChange={(event) => setObservation(event.target.value)} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(4)}>Proximo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4 - Revisao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Horario:</strong> {selectedSlot?.date} as {selectedSlot?.startTime}
            </p>
            <p>
              <strong>Modalidade:</strong> {mode}
            </p>
            <p>
              <strong>Duracao:</strong> {duration} minutos
            </p>
            <p>
              <strong>Politica:</strong> cancelamentos fora do prazo podem gerar ajuste financeiro.
            </p>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !slotId}>
                {createMutation.isPending ? 'Confirmando...' : 'Confirmar agendamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

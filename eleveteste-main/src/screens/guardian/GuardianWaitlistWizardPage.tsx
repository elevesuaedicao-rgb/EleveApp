import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { generateId } from '@/lib/utils';

interface WaitlistEntry {
  id: string;
  slotId: string;
  studentId: string;
  window: string;
  flexibility: string;
  reason: string;
  createdAt: string;
}

const STORAGE_KEY = 'guardian_waitlist_requests_v1';

const readEntries = (): WaitlistEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WaitlistEntry[]) : [];
  } catch {
    return [];
  }
};

const saveEntries = (entries: WaitlistEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const GuardianWaitlistWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slotId') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  const [step, setStep] = useState(1);
  const [windowChoice, setWindowChoice] = useState('15 minutos para confirmar');
  const [flexibility, setFlexibility] = useState('Apenas esse horario');
  const [reason, setReason] = useState('');
  const [joinedId, setJoinedId] = useState('');

  const entries = readEntries();

  const nextPosition = useMemo(
    () => entries.filter((entry) => entry.slotId === slotId).length + 1,
    [entries, slotId]
  );

  const joinQueue = () => {
    if (!studentId || !slotId) return;
    const newEntry: WaitlistEntry = {
      id: generateId(),
      slotId,
      studentId,
      window: windowChoice,
      flexibility,
      reason,
      createdAt: new Date().toISOString(),
    };

    const updated = [...entries, newEntry];
    saveEntries(updated);
    setJoinedId(newEntry.id);
    toast({
      title: 'Voce entrou na fila',
      description: `Posicao: #${nextPosition}`,
    });
  };

  const leaveQueue = () => {
    if (!joinedId) return;
    const updated = readEntries().filter((entry) => entry.id !== joinedId);
    saveEntries(updated);
    toast({
      title: 'Fila atualizada',
      description: 'Voce saiu da fila desse horario.',
    });
    navigate(`/app/guardian/students/${studentId}/calendar?date=${date}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wizard: Fila de Espera</h1>
      <p className="text-sm text-muted-foreground">Etapa {step} de 4</p>

      <Card>
        <CardHeader>
          <CardTitle>Horario ocupado: {time || '--:--'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Voce sera o #{nextPosition} na fila. Quando o horario liberar, voce tera uma janela de resposta.
        </CardContent>
      </Card>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 - Janela desejada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Quando liberar, voce quer quanto tempo para responder?</Label>
            <Input value={windowChoice} onChange={(event) => setWindowChoice(event.target.value)} />
            <Button onClick={() => setStep(2)}>Proximo</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 - Flexibilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={flexibility} onChange={(event) => setFlexibility(event.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(3)}>Proximo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 - Motivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Descreva por que esse horario e importante" />
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
            <CardTitle>Step 4 - Confirmar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Posicao prevista:</strong> #{nextPosition}
            </p>
            <p>
              <strong>Janela de resposta:</strong> {windowChoice}
            </p>
            <p>
              <strong>Horario:</strong> {time} ({date})
            </p>
            <Button onClick={joinQueue} disabled={!!joinedId}>
              Confirmar entrada na fila
            </Button>
            {joinedId && (
              <Button variant="outline" onClick={leaveQueue}>
                Sair da fila
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

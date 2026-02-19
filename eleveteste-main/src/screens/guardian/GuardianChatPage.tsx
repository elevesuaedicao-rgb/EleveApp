import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuardian } from './GuardianLayout';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { buildWhatsappLink } from './utils';

const THREADS = [
  { id: 'general', title: 'Conversa geral', preview: 'Atualizacoes do plano de estudo' },
  { id: 'lesson', title: 'Sobre aulas', preview: 'Remarcacoes e combinados' },
];

export const GuardianChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudentId } = useGuardian();
  const { teacherPhoneE164 } = useGuardianPortal(selectedStudentId || undefined);

  const whatsappHref = useMemo(
    () =>
      buildWhatsappLink(
        teacherPhoneE164,
        'Ola, professor! Aqui e o responsavel do(a) aluno(a). Posso tirar uma duvida?'
      ),
    [teacherPhoneE164]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chat</h1>
        <Button variant="outline" disabled={!whatsappHref} onClick={() => whatsappHref && window.open(whatsappHref, '_blank')}>
          Abrir no WhatsApp
        </Button>
      </div>

      {THREADS.map((thread) => (
        <Card key={thread.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{thread.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{thread.preview}</p>
            <Button variant="ghost" onClick={() => navigate(`/app/guardian/chat/thread/${thread.id}`)}>
              Abrir
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const GuardianChatThreadPage: React.FC = () => {
  const { threadId } = useParams();
  const { selectedStudentId } = useGuardian();
  const { teacherPhoneE164 } = useGuardianPortal(selectedStudentId || undefined);
  const whatsappHref = buildWhatsappLink(
    teacherPhoneE164,
    'Ola! Sobre a aula de {dataHora}, queria falar sobre...'
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Thread: {threadId}</h1>

      <Card>
        <CardContent className="p-4 space-y-3 text-sm">
          <p className="rounded-lg bg-muted p-3 w-fit">Professor: Olá! Em que posso ajudar?</p>
          <p className="rounded-lg bg-primary/10 p-3 w-fit ml-auto">Responsavel: Gostaria de alinhar o plano da semana.</p>
          <p className="text-xs text-muted-foreground">Suporte de chat com texto e imagem pode ser ligado neste thread.</p>
        </CardContent>
      </Card>

      <Button variant="outline" disabled={!whatsappHref} onClick={() => whatsappHref && window.open(whatsappHref, '_blank')}>
        Abrir no WhatsApp
      </Button>
    </div>
  );
};

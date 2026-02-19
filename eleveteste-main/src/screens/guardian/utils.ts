export const buildWhatsappLink = (phoneE164: string, message: string) => {
  if (!phoneE164) return '';
  return `https://wa.me/${phoneE164.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export const formatLessonStatus = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'Rascunho',
    BOOKED_PENDING_CONFIRMATION: 'Aguardando confirmacao',
    BOOKED_CONFIRMED: 'Agendada',
    CONFIRMED_BY_GUARDIAN: 'Confirmada pelo responsavel',
    CONFIRMED_BY_TEACHER: 'Confirmada pelo professor',
    COMPLETED: 'Concluida',
    CANCELLED: 'Cancelada',
    RESCHEDULED: 'Remarcada',
    NO_SHOW: 'Falta',
  };
  return map[status] || status;
};

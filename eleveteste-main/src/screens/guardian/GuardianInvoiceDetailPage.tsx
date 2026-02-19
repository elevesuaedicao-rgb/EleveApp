import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGuardian } from './GuardianLayout';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { formatCurrency } from './utils';

export const GuardianInvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const { selectedStudentId } = useGuardian();
  const { financeTransactions } = useGuardianPortal(selectedStudentId || undefined);

  const invoice = useMemo(
    () => financeTransactions.find((transaction) => transaction.id === invoiceId),
    [financeTransactions, invoiceId]
  );

  const [step, setStep] = useState(searchParams.get('pay') === 'pix' ? 1 : 0);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!invoiceId) return;
      const { error } = await supabase
        .from('financial_transactions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', invoiceId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['guardian-finance'] });
      toast({ title: 'Pagamento confirmado', description: 'Status da fatura: PAID' });
      navigate('/app/guardian/finance/invoices');
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message || 'Falha ao confirmar pagamento', variant: 'destructive' });
    },
  });

  if (!invoice) {
    return <p className="text-sm text-muted-foreground">Fatura nao encontrada.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Detalhe da fatura</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{invoice.description || 'Fatura'}</span>
            <Badge variant="outline">{invoice.status.toUpperCase()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Valor:</strong> {formatCurrency(Number(invoice.amount || 0))}
          </p>
          <p>
            <strong>Vencimento:</strong> {invoice.due_date || '-'}
          </p>
          <p>
            <strong>Referencia:</strong> {invoice.reference_month || '-'}
          </p>
        </CardContent>
      </Card>

      {invoice.status !== 'paid' && (
        <Card>
          <CardHeader>
            <CardTitle>Pagamento PIX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {step === 0 && <Button onClick={() => setStep(1)}>Iniciar pagamento PIX</Button>}
            {step === 1 && (
              <>
                <p>STEP 1 - Gerar QR Code</p>
                <div className="rounded-xl border border-border p-6 text-center bg-muted">
                  <p className="font-mono text-xs break-all">PIX|invoice:{invoice.id}|value:{invoice.amount}</p>
                </div>
                <Button onClick={() => setStep(2)}>Ja paguei, continuar</Button>
              </>
            )}
            {step === 2 && (
              <>
                <p>STEP 2 - Confirmar pagamento</p>
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                  {mutation.isPending ? 'Confirmando...' : 'Confirmar pagamento'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

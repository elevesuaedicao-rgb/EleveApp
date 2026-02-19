import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuardian } from './GuardianLayout';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { formatCurrency } from './utils';

export const GuardianPaymentsPage: React.FC = () => {
  const { selectedStudentId } = useGuardian();
  const { financeTransactions } = useGuardianPortal(selectedStudentId || undefined);

  const payments = financeTransactions.filter((transaction) => transaction.type === 'payment');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Pagamentos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Historico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {payments.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>}
          {payments.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{payment.description || 'Pagamento'}</p>
                <p className="text-xs text-muted-foreground">{payment.paid_at || payment.created_at}</p>
              </div>
              <p className="font-semibold">{formatCurrency(Math.abs(Number(payment.amount || 0)))}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

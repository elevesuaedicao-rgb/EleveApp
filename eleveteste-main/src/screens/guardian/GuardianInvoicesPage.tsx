import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuardian } from './GuardianLayout';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { formatCurrency } from './utils';

const mapInvoiceStatus = (status: string) => {
  if (status === 'paid') return 'PAID';
  if (status === 'pending') return 'OPEN';
  return 'OVERDUE';
};

export const GuardianInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudentId } = useGuardian();
  const { financeTransactions } = useGuardianPortal(selectedStudentId || undefined);

  const invoices = financeTransactions.filter((tx) => tx.type !== 'payment');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Faturas</h1>

      {invoices.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada.</p>}

      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{invoice.description || 'Fatura de aula'}</span>
              <Badge variant="outline">{mapInvoiceStatus(invoice.status)}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold">{formatCurrency(Number(invoice.amount || 0))}</p>
              <p className="text-xs text-muted-foreground">Vencimento: {invoice.due_date || '-'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/app/guardian/finance/invoices/${invoice.id}`)}>
                Detalhes
              </Button>
              {invoice.status !== 'paid' && (
                <Button onClick={() => navigate(`/app/guardian/finance/invoices/${invoice.id}?pay=pix`)}>Pagar PIX</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

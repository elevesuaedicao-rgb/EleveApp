import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGuardian } from './GuardianLayout';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { formatCurrency } from './utils';

export const GuardianFinancePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudentId } = useGuardian();
  const { financeSummary } = useGuardianPortal(selectedStudentId || undefined);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Em aberto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(financeSummary.open)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(financeSummary.paid)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total do mes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(financeSummary.monthTotal)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate('/app/guardian/finance/invoices')}>Ver faturas</Button>
        <Button variant="secondary" onClick={() => navigate('/app/guardian/finance/payments')}>
          Ver pagamentos
        </Button>
      </div>
    </div>
  );
};

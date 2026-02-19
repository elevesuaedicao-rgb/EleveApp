import React from 'react';
import { useParent } from './ParentLayout';

const FINANCE_DATA = {
  balance: 160,
  dueDate: '2024-06-30',
  history: [
    { id: '1', description: 'Aula Matemática - 20/06', amount: 80, type: 'debit' },
    { id: '2', description: 'Aula Física - 22/06', amount: 70, type: 'debit' },
    { id: '3', description: 'Pagamento Mensalidade', amount: -400, type: 'credit' },
    { id: '4', description: 'Aula Inglês - 15/06', amount: 70, type: 'debit' },
  ]
};

export const ParentFinance: React.FC = () => {
  const { selectedChild, hasChildren } = useParent();

  const childName = selectedChild?.name || 'seu filho(a)';

  if (!hasChildren) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-muted rounded-3xl p-12 text-center border border-dashed border-border">
          <p className="text-muted-foreground">Você ainda não possui filhos vinculados.</p>
          <p className="text-sm text-muted-foreground mt-2">Compartilhe o código da família para seus filhos se vincularem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-xl font-bold text-foreground">Financeiro</h2>
        <p className="text-muted-foreground text-sm">Acompanhe a situação financeira de {childName}</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <span className="text-9xl">💰</span>
        </div>
        
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium mb-2">Saldo em Aberto</p>
          <p className="text-5xl font-bold tracking-tight">R$ {FINANCE_DATA.balance}</p>
          <p className="text-emerald-200 text-sm mt-4">
            Vencimento: {new Date(FINANCE_DATA.dueDate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <button className="mt-6 px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-colors">
          Pagar Agora
        </button>
      </div>

      <div className="bg-surface rounded-3xl border border-border p-6">
        <h3 className="font-bold text-foreground text-lg mb-4">Extrato</h3>
        
        <div className="space-y-3">
          {FINANCE_DATA.history.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.type === 'credit' ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                  {item.type === 'credit' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.description}</p>
                </div>
              </div>
              <p className={`font-bold ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'credit' ? '-' : '+'}R$ {Math.abs(item.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

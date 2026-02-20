
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BillingReportData {
    student_name: string;
    period_start: string;
    period_end: string;
    lines: Array<{
        date: string;
        duration: number;
        subject: string;
        topic: string;
        modality: 'remote' | 'in_person';
    }>;
    adjustments: Array<{
        type: string;
        amount: number;
        reason: string;
    }>;
}

import { StudentAgreement } from '@/hooks/useStudentAnalytics';

export const generateBillingPDF = (data: BillingReportData, agreement: StudentAgreement | null) => {
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Calculate prices
    const calculatePrice = (duration: number, modality: 'remote' | 'in_person') => {
        if (!agreement) return 0;
        if (modality === 'in_person') {
            return duration <= 60 ? agreement.price_person_60 : agreement.price_person_90;
        }
        return duration <= 60 ? agreement.price_remote_60 : agreement.price_remote_90;
    };

    const linesWithPrice = data.lines.map(line => ({
        ...line,
        price: calculatePrice(line.duration, line.modality)
    }));

    const totalClassesValue = linesWithPrice.reduce((acc, line) => acc + line.price, 0);

    const totalAdjustments = data.adjustments.reduce((acc, adj) => {
        if (adj.type === 'credit' || adj.type === 'discount') return acc - adj.amount;
        return acc + adj.amount;
    }, 0);

    const finalTotal = totalClassesValue + totalAdjustments;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Relatório de Fechamento - ${data.student_name}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .meta { margin-top: 10px; font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
          th { background-color: #f8fafc; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #64748b; }
          .total-row { font-weight: bold; background-color: #f1f5f9; }
          .summary { margin-top: 40px; float: right; width: 300px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; }
          .summary-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
          .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #999; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">EleveApp</div>
          <h1>Demonstrativo de Serviço</h1>
          <div class="meta">
            Aluno: <strong>${data.student_name}</strong><br>
            Período: ${new Date(data.period_start).toLocaleDateString()} a ${new Date(data.period_end).toLocaleDateString()}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Matéria</th>
              <th>Tópico</th>
              <th>Duração</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${linesWithPrice.map(line => `
              <tr>
                <td>${new Date(line.date).toLocaleDateString()}</td>
                <td>${line.subject || '-'}</td>
                <td>${line.topic || '-'}</td>
                <td>${line.duration} min</td>
                <td>${formatCurrency(line.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal Aulas</span>
            <span>${formatCurrency(totalClassesValue)}</span>
          </div>
          ${data.adjustments.map(adj => `
            <div class="summary-row" style="color: ${adj.type === 'discount' || adj.type === 'credit' ? 'red' : 'green'}">
              <span>${adj.reason} (${adj.type})</span>
              <span>${adj.type === 'discount' || adj.type === 'credit' ? '-' : '+'}${formatCurrency(adj.amount)}</span>
            </div>
          `).join('')}
          <div class="summary-row summary-total">
            <span>Total a Pagar</span>
            <span>${formatCurrency(finalTotal)}</span>
          </div>
        </div>

        <div style="clear: both"></div>

        <div class="footer">
          Gerado em ${new Date().toLocaleString()} pelo Portal do Professor.
        </div>
        <script>
          window.print();
        </script>
      </body>
    </html>
  `;

    const win = window.open('', '_blank');
    if (win) {
        win.document.write(htmlContent);
        win.document.close();
    }
};

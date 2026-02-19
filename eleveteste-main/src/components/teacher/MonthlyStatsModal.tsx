import React from 'react';
import { X, Calendar, Clock, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeacherStudent } from '@/hooks/useTeacherStudents';
import { LearningHistoryEntry } from '@/hooks/useLearningHistory';

interface MonthlyStatsModalProps {
  student: TeacherStudent;
  history: LearningHistoryEntry[];
  onClose: () => void;
}

export const MonthlyStatsModal: React.FC<MonthlyStatsModalProps> = ({
  student,
  history,
  onClose,
}) => {
  const now = new Date();
  const currentMonth = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  const thisMonthHistory = history.filter(h => {
    const date = new Date(h.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalMinutes = thisMonthHistory.reduce((sum, h) => sum + h.duration_minutes, 0);
  const totalHours = totalMinutes / 60;
  const totalClasses = thisMonthHistory.length;

  // Calculate estimated value
  const estimatedValue = thisMonthHistory.reduce((sum, h) => {
    if (h.duration_minutes === 60) return sum + Number(student.price_per_hour);
    if (h.duration_minutes === 90) return sum + Number(student.price_per_90min);
    if (h.duration_minutes === 120) return sum + Number(student.price_per_2h);
    return sum + (h.duration_minutes / 60) * Number(student.price_per_hour);
  }, 0);

  // Generate calendar data
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const classDates = new Set(thisMonthHistory.map(h => new Date(h.date).getDate()));

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    const message = `📊 *Resumo Mensal - ${currentMonth}*

👤 Aluno: ${student.student.full_name}

📚 *Estatísticas:*
• Total de aulas: ${totalClasses}
• Horas totais: ${totalHours.toFixed(1)}h
• Valor estimado: R$ ${estimatedValue.toFixed(2)}

📅 *Aulas realizadas:*
${thisMonthHistory.map(h => `• ${new Date(h.date).toLocaleDateString('pt-BR')} - ${h.subject?.name || 'Aula'} (${h.duration_minutes}min)`).join('\n')}

---
Gerado pelo Eleve 📱`;

    const phone = student.parent?.phone || student.student.phone;
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto animate-in zoom-in-95">
        <div className="sticky top-0 bg-card z-10 p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Estatísticas - {currentMonth}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <CardContent className="p-4 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
              <p className="text-xs text-muted-foreground">Aulas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Clock className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Horas</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-lg mb-2">💰</p>
              <p className="text-2xl font-bold text-green-600">R${estimatedValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Valor</p>
            </div>
          </div>

          {/* Calendar View */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Calendário de Aulas</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i} className="p-2 font-bold text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {calendarDays.map(day => (
                <div
                  key={day}
                  className={`p-2 rounded-lg transition-colors ${
                    classDates.has(day)
                      ? 'bg-primary text-primary-foreground font-bold'
                      : day === now.getDate()
                      ? 'bg-muted font-bold text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Class List */}
          <div>
            <h3 className="font-bold text-foreground mb-3">Detalhes das Aulas</h3>
            <div className="space-y-2 max-h-48 overflow-auto">
              {thisMonthHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma aula neste mês</p>
              ) : (
                thisMonthHistory.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.subject?.name || 'Aula'}</p>
                    </div>
                    <Badge variant="outline">{entry.duration_minutes} min</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button className="flex-1" onClick={generateWhatsAppMessage}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyStatsModal;

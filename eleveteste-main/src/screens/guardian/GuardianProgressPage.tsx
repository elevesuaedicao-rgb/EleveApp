import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';

export const GuardianProgressPage: React.FC = () => {
  const { studentId } = useParams();
  const { learningHistory } = useGuardianPortal(studentId);

  const thisMonthReports = useMemo(() => {
    const now = new Date();
    return learningHistory.filter((entry) => {
      const date = new Date(entry.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [learningHistory]);

  const subjects = useMemo(() => {
    const map = new Map<string, number>();
    for (const report of learningHistory) {
      const name = report.subjects?.name || 'Sem materia';
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries());
  }, [learningHistory]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Progresso academico</h1>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Relatorios por aula</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{learningHistory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Relatorio mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{thisMonthReports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Provas futuras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Use o modulo de provas para acompanhar datas futuras.</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Evolucao por materia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subjects.length === 0 && <p className="text-sm text-muted-foreground">Sem relatorios ainda.</p>}
          {subjects.map(([subject, count]) => (
            <div key={subject} className="flex justify-between text-sm border-b border-border pb-2">
              <span>{subject}</span>
              <span className="font-semibold">{count} aulas</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Relatorios recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {learningHistory.slice(0, 8).map((report) => (
            <div key={report.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{report.subjects?.name || 'Sem materia'} - {report.date}</p>
              <p className="text-xs text-muted-foreground mt-1">{report.observations || 'Sem observacoes'}</p>
              <p className="text-xs text-muted-foreground mt-1">Tendencia: {report.student_performance || 'nao informada'}</p>
            </div>
          ))}
          {learningHistory.length === 0 && <p className="text-sm text-muted-foreground">Sem dados de relatorio.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

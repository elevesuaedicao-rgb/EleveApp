import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGuardian } from './GuardianLayout';
import { useFamilyChildren } from '@/hooks/useFamilyChildren';

export const GuardianStudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedStudentId } = useGuardian();
  const { children, isLoading } = useFamilyChildren();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando alunos...</p>;
  }

  if (children.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum aluno vinculado ainda.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children.map((student) => (
        <Card key={student.id}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{student.name}</p>
              <p className="text-sm text-muted-foreground">{student.grade}</p>
            </div>
            <Button
              onClick={() => {
                setSelectedStudentId(student.id);
                navigate(`/app/guardian/students/${student.id}/calendar`);
              }}
            >
              Abrir agenda
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';

const GRADES = [
  { value: '1º ano', label: '1º Ano', level: 'Fundamental' },
  { value: '2º ano', label: '2º Ano', level: 'Fundamental' },
  { value: '3º ano', label: '3º Ano', level: 'Fundamental' },
  { value: '4º ano', label: '4º Ano', level: 'Fundamental' },
  { value: '5º ano', label: '5º Ano', level: 'Fundamental' },
  { value: '6º ano', label: '6º Ano', level: 'Fundamental' },
  { value: '7º ano', label: '7º Ano', level: 'Fundamental' },
  { value: '8º ano', label: '8º Ano', level: 'Fundamental' },
  { value: '9º ano', label: '9º Ano', level: 'Fundamental' },
  { value: '1º EM', label: '1º Ano', level: 'Médio' },
  { value: '2º EM', label: '2º Ano', level: 'Médio' },
  { value: '3º EM', label: '3º Ano', level: 'Médio' },
];

export const StudentGrade = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();

  const handleSelectGrade = async (gradeYear: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ grade_year: gradeYear })
        .eq('id', user.id);

      if (error) throw error;

      await refetchProfile();
      navigate('/onboarding/student/age', { state: { gradeYear } });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao selecionar ano',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fundamentalGrades = GRADES.filter(g => g.level === 'Fundamental');
  const medioGrades = GRADES.filter(g => g.level === 'Médio');

  return (
    <OnboardingLayout
      step={3}
      totalSteps={4}
      title="Em qual ano você está?"
      subtitle="Selecione seu ano letivo atual"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Ensino Fundamental</h3>
          <div className="grid grid-cols-3 gap-2">
            {fundamentalGrades.map((grade) => (
              <Card
                key={grade.value}
                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => handleSelectGrade(grade.value)}
              >
                <CardContent className="p-4 text-center">
                  <span className="text-lg font-bold text-foreground">{grade.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Ensino Médio</h3>
          <div className="grid grid-cols-3 gap-2">
            {medioGrades.map((grade) => (
              <Card
                key={grade.value}
                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => handleSelectGrade(grade.value)}
              >
                <CardContent className="p-4 text-center">
                  <span className="text-lg font-bold text-foreground">{grade.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default StudentGrade;

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';

// Função com typing correto: Record<string, number>
const getAgeSuggestions = (gradeYear: string): number[] => {
  const baseByGrade: Record<string, number> = {
    '1º ano': 6,
    '2º ano': 7,
    '3º ano': 8,
    '4º ano': 9,
    '5º ano': 10,
    '6º ano': 11,
    '7º ano': 12,
    '8º ano': 13,
    '9º ano': 14,
    '1º EM': 15,
    '2º EM': 16,
    '3º EM': 17,
  };

  const base = baseByGrade[gradeYear] ?? 10;
  return [base, base + 1, base + 2, base + 3];
};

export const StudentAge = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, refetchProfile } = useAuth();

  // Pegar grade_year do state ou do profile
  const gradeYear = location.state?.gradeYear || profile?.grade_year || '5º ano';
  const ageSuggestions = getAgeSuggestions(gradeYear);

  // Update único e atômico: salva age e onboarding_completed juntos
  const handleSelectAge = async (age: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          age, 
          onboarding_completed: true 
        })
        .eq('id', user.id);

      if (error) throw error;

      await refetchProfile();
      navigate('/student');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar idade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={4}
      title="Qual a sua idade?"
      subtitle="Selecione sua idade atual"
    >
      <div className="grid grid-cols-2 gap-4">
        {ageSuggestions.map((age) => (
          <Card
            key={age}
            className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2 hover:border-primary ${
              loading ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => handleSelectAge(age)}
          >
            <CardContent className="p-8 text-center">
              <span className="text-4xl font-black text-foreground">{age}</span>
              <p className="text-sm text-muted-foreground mt-1">anos</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </OnboardingLayout>
  );
};

export default StudentAge;

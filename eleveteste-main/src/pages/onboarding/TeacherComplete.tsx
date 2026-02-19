import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingLayout } from './OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const TeacherComplete = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      await refetchProfile();
      navigate('/teacher');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={2}
      title="Tudo pronto!"
      subtitle="Você está configurado como professor"
    >
      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Bem-vindo ao Eleve!
            </h3>
            <p className="text-sm text-muted-foreground">
              Como professor, você poderá gerenciar seus horários, aprovar aulas e acompanhar seus alunos.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span>Gerenciar disponibilidade de horários</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span>Aprovar ou recusar solicitações de aula</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500" />
            <span>Visualizar histórico de aulas</span>
          </div>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full h-12 text-lg"
          disabled={loading}
        >
          {loading ? 'Finalizando...' : 'Começar a usar'}
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default TeacherComplete;

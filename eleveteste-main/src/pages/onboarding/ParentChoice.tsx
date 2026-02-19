import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFamily } from '@/hooks/useFamily';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';

export const ParentChoice = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refetchProfile } = useAuth();
  const { createFamily, isCreating } = useFamily();

  const handleCreateFamily = async () => {
    setLoading(true);
    try {
      const code = await createFamily();
      toast({
        title: 'Família criada!',
        description: `Seu código familiar é: ${code}`,
      });
      await refetchProfile();
      navigate('/onboarding/parent/complete', { state: { familyCode: code } });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar família',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = () => {
    navigate('/onboarding/parent/code');
  };

  const isLoading = loading || isCreating;

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      title="Como você quer começar?"
      subtitle="Crie uma nova família ou entre em uma existente"
    >
      <div className="grid gap-4">
        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={handleCreateFamily}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Plus className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Criar nova família</h3>
              <p className="text-sm text-muted-foreground">
                Gere um código para compartilhar com seus filhos
              </p>
            </div>
            <div className="text-muted-foreground">→</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={handleJoinFamily}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Tenho um código</h3>
              <p className="text-sm text-muted-foreground">
                Outro responsável já criou a família
              </p>
            </div>
            <div className="text-muted-foreground">→</div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
};

export default ParentChoice;

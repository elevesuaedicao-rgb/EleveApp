import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, KeyRound, Clock3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFamily } from '@/hooks/useFamily';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';

export const ParentChoice = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refetchProfile } = useAuth();
  const { createFamily, isCreating, setFamilyJoinIntent } = useFamily();

  const handleCreateFamily = async () => {
    setLoading(true);
    try {
      const code = await createFamily();
      await setFamilyJoinIntent('create', 'linked');
      toast({
        title: 'Familia criada!',
        description: `Seu codigo familiar e: ${code}`,
      });
      await refetchProfile();
      navigate('/onboarding/parent/complete', { state: { familyCode: code } });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar familia',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNow = async () => {
    await setFamilyJoinIntent('join_now', 'pending');
    navigate('/onboarding/parent/code');
  };

  const handleJoinLater = async () => {
    setLoading(true);
    try {
      await setFamilyJoinIntent('join_later', 'pending');
      navigate('/onboarding/parent/complete');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || isCreating;

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      title="Como voce quer comecar?"
      subtitle="Escolha se vai criar, entrar agora ou inserir o codigo depois"
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
              <h3 className="text-lg font-semibold text-foreground">Criar nova familia</h3>
              <p className="text-sm text-muted-foreground">Gera codigo e vincula voce agora</p>
            </div>
            <div className="text-muted-foreground">-&gt;</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={handleJoinNow}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Tenho um codigo agora</h3>
              <p className="text-sm text-muted-foreground">Vincula imediatamente a familia existente</p>
            </div>
            <div className="text-muted-foreground">-&gt;</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary ${
            isLoading ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={handleJoinLater}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Clock3 className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Tenho codigo, vou inserir depois</h3>
              <p className="text-sm text-muted-foreground">Nao cria familia nova e libera o portal com banner de vinculacao</p>
            </div>
            <div className="text-muted-foreground">-&gt;</div>
          </CardContent>
        </Card>
      </div>
    </OnboardingLayout>
  );
};

export default ParentChoice;

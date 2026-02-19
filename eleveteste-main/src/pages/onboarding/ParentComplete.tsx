import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Copy, Link } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFamily } from '@/hooks/useFamily';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const ParentComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetchProfile, profile } = useAuth();
  const { family } = useFamily();
  const familyCode = location.state?.familyCode || family?.code || '';

  useEffect(() => {
    const completeOnboarding = async () => {
      if (!user) return;
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      await refetchProfile();
    };
    completeOnboarding();
  }, [refetchProfile, user]);

  const handleCopyCode = () => {
    if (!familyCode) return;
    navigator.clipboard.writeText(familyCode);
    toast({
      title: 'Codigo copiado!',
      description: 'Compartilhe com seus filhos e outros responsaveis',
    });
  };

  const handleContinue = () => {
    navigate('/app/guardian');
  };

  const isPendingLink = profile?.family_link_status !== 'linked';

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title={isPendingLink ? 'Onboarding concluido' : 'Familia criada!'}
      subtitle={
        isPendingLink
          ? 'Voce pode vincular o codigo familiar depois no portal'
          : 'Compartilhe o codigo abaixo com seus filhos'
      }
    >
      <div className="space-y-6">
        {!isPendingLink && familyCode && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <p className="text-sm text-muted-foreground mb-2">Seu codigo familiar:</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl font-mono font-bold tracking-widest text-foreground">{familyCode}</span>
                <Button variant="ghost" size="icon" onClick={handleCopyCode} className="shrink-0">
                  <Copy className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">Use esse codigo para conectar todos da familia</p>
            </CardContent>
          </Card>
        )}

        {isPendingLink && (
          <Card className="border-2 border-amber-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <Link className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nao criaremos familia automaticamente. Quando tiver o codigo, basta inserir no banner de vinculacao no portal do responsavel.
              </p>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleContinue} className="w-full h-12 text-lg">
          Continuar para o portal do responsavel
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default ParentComplete;

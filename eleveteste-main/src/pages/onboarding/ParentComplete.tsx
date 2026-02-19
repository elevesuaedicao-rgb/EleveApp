import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const ParentComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetchProfile } = useAuth();
  const familyCode = location.state?.familyCode || '';

  useEffect(() => {
    // Marcar onboarding como completo
    const completeOnboarding = async () => {
      if (!user) return;
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
      await refetchProfile();
    };
    completeOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyCode);
    toast({
      title: 'Código copiado!',
      description: 'Compartilhe com seus filhos',
    });
  };

  const handleContinue = () => {
    navigate('/parent');
  };

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Família criada!"
      subtitle="Compartilhe o código abaixo com seus filhos"
    >
      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">Seu código familiar:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl font-mono font-bold tracking-widest text-foreground">
                {familyCode}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Seus filhos usarão este código para se conectar à família
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={handleContinue}
          className="w-full h-12 text-lg"
        >
          Continuar para o painel
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default ParentComplete;

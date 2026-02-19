import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFamily } from '@/hooks/useFamily';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

export const ParentCode = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();
  const { joinFamily, isJoining, setFamilyJoinIntent } = useFamily();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setLoading(true);
    try {
      await setFamilyJoinIntent('join_now', 'pending');
      await joinFamily(code.trim().toUpperCase());

      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      await refetchProfile();

      toast({
        title: 'Sucesso!',
        description: 'Voce entrou na familia.',
      });
      navigate('/app/guardian');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Codigo invalido ou nao encontrado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || isJoining;

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Digite o codigo familiar"
      subtitle="Peca o codigo para o responsavel que criou a familia"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex: ABC123"
          className="text-center text-2xl font-mono tracking-widest h-16"
          maxLength={6}
          disabled={isLoading}
        />

        <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || code.trim().length < 6}>
          {isLoading ? 'Entrando...' : 'Entrar na familia'}
        </Button>
      </form>
    </OnboardingLayout>
  );
};

export default ParentCode;

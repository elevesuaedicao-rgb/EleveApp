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
  const { joinFamily, isJoining } = useFamily();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setLoading(true);
    try {
      await joinFamily(code.trim().toUpperCase());
      
      // Marcar onboarding como completo
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      await refetchProfile();
      
      toast({
        title: 'Sucesso!',
        description: 'Você entrou na família.',
      });
      navigate('/parent');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Código inválido ou não encontrado',
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
      title="Digite o código familiar"
      subtitle="Peça o código para o responsável que criou a família"
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
        
        <Button
          type="submit"
          className="w-full h-12 text-lg"
          disabled={isLoading || code.trim().length < 6}
        >
          {isLoading ? 'Entrando...' : 'Entrar na família'}
        </Button>
      </form>
    </OnboardingLayout>
  );
};

export default ParentCode;

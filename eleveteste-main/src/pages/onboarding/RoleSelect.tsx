import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';

type UserRole = 'student' | 'parent' | 'teacher';

const ROLES = [
  {
    value: 'student' as UserRole,
    label: 'Aluno',
    icon: GraduationCap,
    description: 'Sou estudante e quero agendar aulas',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    value: 'parent' as UserRole,
    label: 'Pai/Mãe',
    icon: Users,
    description: 'Sou responsável e quero acompanhar meu filho',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    value: 'teacher' as UserRole,
    label: 'Professor',
    icon: BookOpen,
    description: 'Sou professor e quero gerenciar aulas',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
];

export const RoleSelect = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();

  const handleSelectRole = async (role: UserRole) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user.id, role });

      if (error) throw error;

      await refetchProfile();

      // Redirecionar para próximo passo do onboarding
      if (role === 'student') {
        navigate('/onboarding/student/school');
      } else if (role === 'parent') {
        navigate('/onboarding/parent/choice');
      } else {
        navigate('/onboarding/teacher/complete');
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao selecionar perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={4}
      title="Qual é o seu perfil?"
      subtitle="Selecione como você vai usar o Eleve"
    >
      <div className="grid gap-4">
        {ROLES.map((role) => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary ${
              loading ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => handleSelectRole(role.value)}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${role.color}`}>
                <role.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{role.label}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
              <div className="text-muted-foreground">→</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </OnboardingLayout>
  );
};

export default RoleSelect;

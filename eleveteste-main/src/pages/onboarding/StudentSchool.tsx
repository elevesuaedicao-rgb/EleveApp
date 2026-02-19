import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSchools } from '@/hooks/useSchools';
import { toast } from '@/hooks/use-toast';
import { OnboardingLayout } from './OnboardingLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const StudentSchool = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refetchProfile } = useAuth();
  const { data: schools, isLoading: schoolsLoading } = useSchools();

  const handleSelectSchool = async (schoolId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ school_id: schoolId })
        .eq('id', user.id);

      if (error) throw error;

      await refetchProfile();
      navigate('/onboarding/student/grade');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao selecionar escola',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={4}
      title="Qual é a sua escola?"
      subtitle="Selecione a escola onde você estuda"
    >
      <div className="grid gap-3">
        {schoolsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : (
          schools?.map((school) => (
            <Card
              key={school.id}
              className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary ${
                loading ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => handleSelectSchool(school.id)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <School className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{school.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{school.city}, {school.state}</span>
                  </div>
                </div>
                <div className="text-muted-foreground">→</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </OnboardingLayout>
  );
};

export default StudentSchool;

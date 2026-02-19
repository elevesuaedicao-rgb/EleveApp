import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const StudentProfile = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [schoolName, setSchoolName] = useState<string>('');

  useEffect(() => {
    const fetchSchool = async () => {
      if (!profile?.school_id) return;
      
      const { data } = await supabase
        .from('schools')
        .select('name')
        .eq('id', profile.school_id)
        .maybeSingle();
      
      if (data) {
        setSchoolName(data.name);
      }
    };
    
    fetchSchool();
  }, [profile?.school_id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/student')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <ProfileForm role="student" schoolName={schoolName} />

        {/* Logout */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Sair da Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Você será desconectado e precisará fazer login novamente.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;

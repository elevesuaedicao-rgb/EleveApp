import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarUpload } from './AvatarUpload';
import { Loader2, Save, Mail, User, Calendar, GraduationCap, School } from 'lucide-react';

interface ProfileFormProps {
  role: 'student' | 'parent' | 'teacher';
  schoolName?: string;
}

export const ProfileForm = ({ role, schoolName }: ProfileFormProps) => {
  const { profile, refetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      await refetchProfile();
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    student: 'Aluno',
    parent: 'Pai/Mãe',
    teacher: 'Professor',
  };

  const roleColors = {
    student: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    parent: 'bg-green-500/10 text-green-600 dark:text-green-400',
    teacher: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="space-y-6">
      {/* Header com Avatar */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center text-center">
            <AvatarUpload
              avatarUrl={profile?.avatar_url}
              fullName={profile?.full_name}
              size="lg"
            />
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              {profile?.full_name}
            </h2>
            <span className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${roleColors[role]}`}>
              {roleLabels[role]}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nome Completo
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                E-mail
              </Label>
              <Input
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            {role === 'student' && (
              <>
                {schoolName && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <School className="w-4 h-4 text-muted-foreground" />
                      Escola
                    </Label>
                    <Input value={schoolName} disabled className="bg-muted" />
                  </div>
                )}

                {profile?.grade_year && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      Ano/Série
                    </Label>
                    <Input value={profile.grade_year} disabled className="bg-muted" />
                  </div>
                )}

                {profile?.age && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Idade
                    </Label>
                    <Input value={`${profile.age} anos`} disabled className="bg-muted" />
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

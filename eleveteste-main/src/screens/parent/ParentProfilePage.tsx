import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFamily } from '@/hooks/useFamily';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Copy, Users } from 'lucide-react';

export const ParentProfilePage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { family } = useFamily();

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome');
  };

  const handleCopyCode = () => {
    if (family?.code) {
      navigator.clipboard.writeText(family.code);
      toast({
        title: 'Código copiado!',
        description: 'Compartilhe com seus filhos',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/guardian')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <ProfileForm role="parent" />

        {/* Código da Família */}
        {family?.code && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Código da Família
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Compartilhe este código com seus filhos para que eles se conectem à família.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-center">
                  <span className="text-2xl font-mono font-bold tracking-widest text-foreground">
                    {family.code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

export default ParentProfilePage;

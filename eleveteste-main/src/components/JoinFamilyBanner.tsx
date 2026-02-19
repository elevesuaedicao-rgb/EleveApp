import { useState } from 'react';
import { Users, X } from 'lucide-react';
import { useFamily } from '@/hooks/useFamily';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const JoinFamilyBanner = () => {
  const [code, setCode] = useState('');
  const [showInput, setShowInput] = useState(false);
  const { family, isLoading, joinFamily, isJoining } = useFamily();

  // Se já está em uma família, não mostrar
  if (isLoading || family) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await joinFamily(code.trim().toUpperCase());
      toast({
        title: 'Sucesso!',
        description: 'Você foi vinculado à família.',
      });
      setShowInput(false);
      setCode('');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Código inválido',
        variant: 'destructive',
      });
    }
  };

  if (!showInput) {
    return (
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">Vincular à família</p>
              <p className="text-sm text-muted-foreground">
                Peça o código para seus pais
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInput(true)}
          >
            Inserir código
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-500/5 border-blue-500/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-foreground">Digite o código familiar</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowInput(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="font-mono tracking-widest text-center"
            maxLength={6}
            disabled={isJoining}
          />
          <Button type="submit" disabled={isJoining || code.length < 6}>
            {isJoining ? 'Vinculando...' : 'Vincular'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinFamilyBanner;

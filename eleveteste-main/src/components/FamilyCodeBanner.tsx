import { useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { useFamily } from '@/hooks/useFamily';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const FamilyCodeBanner = () => {
  const [copied, setCopied] = useState(false);
  const { family, isLoading } = useFamily();

  if (isLoading || !family) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(family.code);
    setCopied(true);
    toast({
      title: 'Código copiado!',
      description: 'Compartilhe com seus filhos para eles se vincularem.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Código da família</p>
            <p className="font-mono font-bold text-lg tracking-widest text-foreground">
              {family.code}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FamilyCodeBanner;

import React from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface PushNotificationButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export const PushNotificationButton: React.FC<PushNotificationButtonProps> = ({
  variant = 'outline',
  size = 'default',
  showLabel = true
}) => {
  const { 
    isSupported, 
    isSubscribed, 
    permission, 
    loading, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (isSubscribed) {
      const result = await unsubscribe();
      if (result.success) {
        toast.success('Notificações desativadas');
      } else {
        toast.error('Erro ao desativar notificações');
      }
    } else {
      const result = await subscribe();
      if (result.success) {
        toast.success('Notificações ativadas!');
      } else if (result.error === 'Permission denied') {
        toast.error('Permissão negada. Habilite nas configurações do navegador.');
      } else {
        toast.error('Erro ao ativar notificações');
      }
    }
  };

  const getIcon = () => {
    if (permission === 'denied') return <BellOff className="w-4 h-4" />;
    if (isSubscribed) return <BellRing className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (permission === 'denied') return 'Bloqueado';
    if (isSubscribed) return 'Notificações ativas';
    return 'Ativar notificações';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading || permission === 'denied'}
      className="gap-2"
    >
      {getIcon()}
      {showLabel && <span>{getLabel()}</span>}
    </Button>
  );
};

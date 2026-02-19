import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { UserRole } from '../../types';
import { useSchedule } from '../../context/ScheduleContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopBarProps {
  hideLogoOnDesktop?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ hideLogoOnDesktop = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, acceptSwap, markNotificationRead } = useSchedule();
  const { theme, toggleTheme } = useTheme();
  const { signOut, profile } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);

  const getActiveRole = (): string => {
    if (location.pathname.includes(UserRole.Student)) return 'student';
    if (location.pathname.includes(UserRole.Parent)) return 'parent';
    if (location.pathname.includes(UserRole.Teacher)) return 'teacher';
    return '';
  };

  const activeRole = getActiveRole();
  const myNotifications = notifications.filter(n => n.userId === activeRole && !n.read);

  const handleAvatarClick = () => {
    if (activeRole === 'student') {
      navigate('/student/profile');
    } else if (activeRole === 'parent') {
      navigate('/parent/profile-page');
    } else if (activeRole === 'teacher') {
      navigate('/teacher/profile');
    }
  };

  const handleNotificationAction = (notificationId: string, actionPath: string) => {
    markNotificationRead(notificationId);
    setShowNotifs(false);
    navigate(actionPath);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-surface/80 dark:bg-surface/80 border-b border-border transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div 
          className={`flex items-center gap-1.5 cursor-pointer group ${hideLogoOnDesktop ? 'md:hidden' : ''}`} 
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 bg-foreground dark:bg-foreground rounded-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center shadow-sm">
            <span className="text-background dark:text-background font-extrabold text-xl font-sans leading-none mt-0.5">E</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground transform -rotate-1 origin-left group-hover:rotate-0 transition-transform">
            LEVE
          </span>
        </div>

        {hideLogoOnDesktop && <div className="hidden md:block" />}

        <div className="flex items-center gap-3 sm:gap-4">
          
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-transparent md:hidden flex items-center justify-center hover:bg-muted transition-colors"
            title="Alternar Tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors relative"
            >
              🔔
              {myNotifications.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-destructive rounded-full border-2 border-surface"></span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 z-50">
                <div className="p-3 border-b border-border bg-muted flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">Notificações</span>
                  <button onClick={() => setShowNotifs(false)} className="text-xs text-muted-foreground hover:text-foreground">Fechar</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {myNotifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">Nada por aqui.</div>
                  ) : (
                    myNotifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50">
                        <p className="text-sm text-foreground mb-2">{n.message}</p>
                        
                        {n.type === 'swap_request' ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => acceptSwap(n.id)}
                              className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded-lg"
                            >
                              Aceitar Troca
                            </button>
                            <button 
                              onClick={() => markNotificationRead(n.id)}
                              className="flex-1 bg-muted text-muted-foreground text-xs font-bold py-1.5 rounded-lg"
                            >
                              Ignorar
                            </button>
                          </div>
                        ) : n.actionPayload?.actionPath ? (
                          <button 
                            onClick={() => handleNotificationAction(n.id, n.actionPayload!.actionPath!)}
                            className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            {n.actionPayload.actionLabel || 'Ver Detalhes'} ➜
                          </button>
                        ) : (
                          <button 
                            onClick={() => markNotificationRead(n.id)}
                            className="text-xs text-primary font-bold uppercase"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleAvatarClick}
            className="transition-transform active:scale-95"
            title="Meu Perfil"
          >
            <Avatar className="w-9 h-9 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="w-9 h-9 text-muted-foreground hover:text-foreground"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

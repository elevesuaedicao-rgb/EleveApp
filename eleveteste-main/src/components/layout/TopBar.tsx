import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, User, Bell, Sun, Moon } from 'lucide-react';
import { UserRole } from '../../types';
import { useSchedule } from '../../context/ScheduleContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useGuardianPortal } from '@/hooks/useGuardianPortal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TopBarProps {
  hideLogoOnDesktop?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ hideLogoOnDesktop = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, acceptSwap, markNotificationRead } = useSchedule();
  const { theme, toggleTheme } = useTheme();
  const { signOut, profile } = useAuth();
  const { teacherPhoneE164 } = useGuardianPortal();
  const [showNotifs, setShowNotifs] = useState(false);

  const getActiveRole = (): string => {
    if (location.pathname.includes(UserRole.Student)) return 'student';
    if (location.pathname.includes(UserRole.Parent) || location.pathname.includes('/app/guardian')) return 'parent';
    if (location.pathname.includes(UserRole.Teacher)) return 'teacher';
    return '';
  };

  const activeRole = getActiveRole();
  const myNotifications = notifications.filter((n) => n.userId === activeRole && !n.read);

  const handleAvatarClick = () => {
    if (activeRole === 'student') navigate('/app/student/profile');
    if (activeRole === 'parent') navigate('/parent/profile-page');
    if (activeRole === 'teacher') navigate('/teacher/profile');
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

  const openGuardianWhatsapp = () => {
    if (!teacherPhoneE164) return;
    const message = encodeURIComponent(
      'Ola, professor! Aqui e o responsavel do(a) aluno(a). Posso tirar uma duvida?'
    );
    window.open(`https://wa.me/${teacherPhoneE164.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-surface/80 border-b border-border/50 supports-[backdrop-filter]:bg-surface/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div
          className={`flex items-center gap-3 cursor-pointer group ${hideLogoOnDesktop ? 'md:hidden' : ''}`}
          onClick={() => navigate('/')}
        >
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute inset-0 bg-primary rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xl font-sans leading-none mt-0.5">E</span>
            </div>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground transform origin-left transition-all duration-300 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            ELEVE
          </span>
        </div>

        {hideLogoOnDesktop && <div className="hidden md:block" />}

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-transparent md:hidden flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
            title="Alternar tema"
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {activeRole === 'parent' && (
            <button
              onClick={openGuardianWhatsapp}
              disabled={!teacherPhoneE164}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Abrir WhatsApp do professor"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {myNotifications.length > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-destructive rounded-full border border-surface" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden z-50">
                <div className="p-3 border-b border-border bg-muted flex justify-between items-center">
                  <span className="font-bold text-sm text-foreground">Notificacoes</span>
                  <button onClick={() => setShowNotifs(false)} className="text-xs text-muted-foreground hover:text-foreground">
                    Fechar
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {myNotifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">Nada por aqui.</div>
                  ) : (
                    myNotifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-border last:border-0 hover:bg-muted/50">
                        <p className="text-sm text-foreground mb-2">{notification.message}</p>

                        {notification.type === 'swap_request' ? (
                          <div className="flex gap-2">
                            <button onClick={() => acceptSwap(notification.id)} className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-1.5 rounded-lg">
                              Aceitar troca
                            </button>
                            <button onClick={() => markNotificationRead(notification.id)} className="flex-1 bg-muted text-muted-foreground text-xs font-bold py-1.5 rounded-lg">
                              Ignorar
                            </button>
                          </div>
                        ) : notification.actionPayload?.actionPath ? (
                          <button
                            onClick={() => handleNotificationAction(notification.id, notification.actionPayload!.actionPath!)}
                            className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold py-2 rounded-lg transition-colors"
                          >
                            {notification.actionPayload.actionLabel || 'Ver detalhes'}
                          </button>
                        ) : (
                          <button onClick={() => markNotificationRead(notification.id)} className="text-xs text-primary font-bold uppercase">
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

          <button onClick={handleAvatarClick} className="transition-transform active:scale-95" title="Meu perfil">
            <Avatar className="w-9 h-9 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials || <User className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </button>

          <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-9 h-9 text-muted-foreground hover:text-foreground" title="Sair">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

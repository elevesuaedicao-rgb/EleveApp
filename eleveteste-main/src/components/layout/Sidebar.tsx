import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from './NavigationConfig';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ChevronLeft, Moon, Sun, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV_ITEMS[role] || [];
  const { theme, toggleTheme } = useTheme();
  const { profile } = useAuth();

  const displayName = profile?.full_name?.split(' ')[0] || 'Usuário';
  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabels: Record<string, string> = {
    student: 'Aluno',
    teacher: 'Professor',
    parent: 'Responsável',
  };

  const profileRoutes: Record<string, string> = {
    student: '/student/profile',
    parent: '/parent/profile-page',
    teacher: '/teacher/profile',
  };

  const profilePath = profileRoutes[role];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out border-r border-border/50",
        "bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/50",
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header / Logo */}
      <div
        className={cn(
          "h-20 flex items-center px-6 border-b border-border/50 cursor-pointer relative",
          isCollapsed ? 'justify-center px-0' : ''
        )}
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute inset-0 bg-primary rounded-xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-xl font-sans leading-none mt-0.5">E</span>
            </div>
          </div>

          <span
            className={cn(
              "text-2xl font-black tracking-tighter text-foreground transform origin-left transition-all duration-300 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70",
              isCollapsed ? 'opacity-0 w-0 overflow-hidden scale-90' : 'opacity-100 w-auto scale-100'
            )}
          >
            ELEVE
          </span>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="absolute -right-3 top-9 transform bg-surface border border-border shadow-sm rounded-full w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all z-50 focus:outline-none hover:scale-110"
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        <ChevronLeft className={cn("w-3 h-3 transition-transform duration-300", isCollapsed && "rotate-180")} />
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
        {items.map((item) => {
          const isRoleRoot = item.path === `/${role}` || item.path === `/app/${role}`;
          const isActive = location.pathname === item.path || (!isRoleRoot && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
              className={cn(
                "w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isCollapsed ? 'justify-center px-0 gap-0' : 'gap-3'
              )}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none" />
              )}

              <span className={cn(
                "transition-transform duration-300 shrink-0",
                isActive ? 'scale-110' : 'group-hover:scale-110',
                isCollapsed ? '' : ''
              )}>
                {item.icon}
              </span>

              <span
                className={cn(
                  "text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                  isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 ml-3'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border/50 space-y-3 bg-surface/50 backdrop-blur-sm">
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-300",
            "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border",
            isCollapsed ? 'justify-center gap-0' : 'justify-between gap-3'
          )}
          title={isCollapsed ? `Modo ${theme === 'light' ? 'Claro' : 'Escuro'}` : ''}
        >
          <span
            className={cn(
              "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 ml-3'
            )}
          >
            Modo {theme === 'light' ? 'Claro' : 'Escuro'}
          </span>
          {theme === 'light' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
        </button>

        <button
          type="button"
          onClick={() => profilePath && navigate(profilePath)}
          disabled={!profilePath}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 text-left group",
            "bg-muted/50 hover:bg-primary/5 hover:border-primary/20 border border-transparent",
            isCollapsed ? 'justify-center bg-transparent p-0 hover:bg-transparent' : ''
          )}
          title={profilePath ? 'Ir para perfil' : ''}
        >
          <Avatar className={cn(
            "w-9 h-9 shrink-0 border-2 border-background shadow-sm transition-transform group-hover:scale-105",
            isCollapsed && "w-10 h-10"
          )}>
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>

          <div
            className={cn(
              "flex-1 overflow-hidden transition-all duration-300",
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 ml-3'
            )}
          >
            <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{displayName}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {roleLabels[role] || role}
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
};

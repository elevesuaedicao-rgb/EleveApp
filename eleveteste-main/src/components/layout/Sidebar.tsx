import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from './NavigationConfig';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

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

  return (
    <aside 
      className={`
        hidden md:flex flex-col h-screen fixed left-0 top-0 bg-surface border-r border-border z-40 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div 
        className={`h-16 flex items-center px-4 border-b border-border cursor-pointer relative ${isCollapsed ? 'justify-center' : ''}`} 
        onClick={() => navigate('/')}
      >
        <div className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-foreground rounded-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-background font-extrabold text-lg font-sans leading-none mt-0.5">E</span>
          </div>
          <span 
            className={`
              text-xl font-black tracking-tighter text-foreground transform -rotate-1 origin-left group-hover:rotate-0 transition-all duration-300
              ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
            `}
          >
            LEVE
          </span>
        </div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-surface border border-border rounded-full w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors shadow-md z-50 focus:outline-none"
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {items.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== `/${role}` && location.pathname.startsWith(item.path));
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : ''}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className={`text-xl shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {item.icon}
              </span>
              <span 
                className={`
                  font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                  ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <button 
          onClick={toggleTheme}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-muted text-muted-foreground hover:bg-accent transition-colors
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}
          title={isCollapsed ? `Modo ${theme === 'light' ? 'Claro' : 'Escuro'}` : ''}
        >
          <span 
            className={`
              text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300
              ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}
            `}
          >
            Modo {theme === 'light' ? 'Claro' : 'Escuro'}
          </span>
          <span className="text-lg shrink-0">{theme === 'light' ? '☀️' : '🌙'}</span>
        </button>

        <div 
          className={`
            flex items-center gap-3 p-2 rounded-xl bg-muted border border-border transition-all duration-300
            ${isCollapsed ? 'justify-center bg-transparent border-transparent' : ''}
          `}
        >
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div 
            className={`
              flex-1 overflow-hidden transition-all duration-300
              ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}
            `}
          >
            <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {roleLabels[role] || role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

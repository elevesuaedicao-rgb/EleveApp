import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DevRole,
  getDevNavigationRole,
  isDevNavigationEnabled,
  setDevNavigationEnabled,
  setDevNavigationRole,
} from '@/lib/devNavigation';

interface DevNavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: Record<DevRole, DevNavItem[]> = {
  student: [
    { label: 'Dashboard', path: '/student' },
    { label: 'Agendar', path: '/student/booking' },
    { label: 'Provas', path: '/student/exams' },
    { label: 'Historico', path: '/student/history' },
    { label: 'Duvidas', path: '/student/questions' },
    { label: 'Materias', path: '/student/subjects' },
    { label: 'Perfil', path: '/student/profile' },
  ],
  teacher: [
    { label: 'Dashboard', path: '/teacher' },
    { label: 'Agenda', path: '/teacher/calendar' },
    { label: 'Alunos', path: '/teacher/students' },
    { label: 'Duvidas', path: '/teacher/questions' },
    { label: 'Aprovacoes', path: '/teacher/approvals' },
    { label: 'Financeiro', path: '/teacher/finance' },
    { label: 'Perfil', path: '/teacher/profile' },
  ],
  guardian: [
    { label: 'Portal', path: '/app/guardian' },
    { label: 'Alunos', path: '/app/guardian/students' },
    { label: 'Financeiro', path: '/app/guardian/finance' },
    { label: 'Faturas', path: '/app/guardian/finance/invoices' },
    { label: 'Pagamentos', path: '/app/guardian/finance/payments' },
    { label: 'Chat', path: '/app/guardian/chat' },
  ],
};

const ROLE_META: Record<DevRole, { label: string; defaultPath: string }> = {
  student: { label: 'Aluno', defaultPath: '/student' },
  teacher: { label: 'Professor', defaultPath: '/teacher' },
  guardian: { label: 'Pai/Responsavel', defaultPath: '/app/guardian' },
};

export const DevFloatingNavigator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [activeRole, setActiveRole] = useState<DevRole>(getDevNavigationRole());
  const enabled = isDevNavigationEnabled();

  const currentItems = useMemo(() => NAV_ITEMS[activeRole], [activeRole]);

  if (!enabled) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] w-[min(96vw,1120px)] pointer-events-none">
      <div className="pointer-events-auto rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-[0_12px_38px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2 p-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="h-10 px-3 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {expanded ? 'Ocultar nav dev' : 'Mostrar nav dev'}
          </button>

          {(Object.keys(ROLE_META) as DevRole[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setActiveRole(role);
                setDevNavigationRole(role);
                navigate(ROLE_META[role].defaultPath);
              }}
              className={cn(
                'h-10 px-3 rounded-xl text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                activeRole === role
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {ROLE_META[role].label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setDevNavigationEnabled(false);
              navigate('/login');
            }}
            className="ml-auto h-10 px-3 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Desativar modo dev
          </button>
        </div>

        {expanded && (
          <div className="px-2 pb-2">
            <div className="rounded-xl border border-border bg-background p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {currentItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={cn(
                      'h-11 rounded-lg px-3 text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface border-border text-foreground hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

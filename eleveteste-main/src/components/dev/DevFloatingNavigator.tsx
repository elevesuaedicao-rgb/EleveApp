import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Settings, X, GripVertical, Power, User } from 'lucide-react';
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
  guardian: { label: 'Responsável', defaultPath: '/app/guardian' },
};

export const DevFloatingNavigator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [activeRole, setActiveRole] = useState<DevRole>(getDevNavigationRole());
  const enabled = isDevNavigationEnabled();
  const constraintsRef = useRef(null);

  const currentItems = useMemo(() => NAV_ITEMS[activeRole], [activeRole]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
      />

      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={constraintsRef}
        initial={{ right: 20, bottom: 20 }}
        whileDrag={{ scale: 1.1 }}
        className="fixed z-[101] pointer-events-auto"
        style={{ right: 20, bottom: 20 }} // Start position
      >
        <AnimatePresence mode='wait'>
          {!expanded ? (
            <motion.button
              key="collapsed"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setExpanded(true)}
              className="w-14 h-14 rounded-full bg-foreground/90 text-background backdrop-blur-md shadow-2xl flex items-center justify-center border border-white/10"
            >
              <Settings className="w-6 h-6 animate-spin-slow" />
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="w-[320px] bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div
                className="h-12 bg-muted/50 border-b border-border/50 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                  <span>Dev Tools</span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-6 h-6 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">

                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1">Alternar Papel</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ROLE_META) as DevRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setActiveRole(role);
                          setDevNavigationRole(role);
                          navigate(ROLE_META[role].defaultPath);
                        }}
                        className={cn(
                          'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl border transition-all duration-200',
                          activeRole === role
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                            : 'bg-surface border-border hover:bg-muted text-muted-foreground hover:scale-105'
                        )}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-[10px] font-medium leading-none">{ROLE_META[role].label.split('/')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1">Navegação Rápida</label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentItems.map((item) => {
                      const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                      return (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={cn(
                            'text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border',
                            isActive
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-surface border-border hover:bg-muted hover:border-border/80'
                          )}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
                <button
                  onClick={() => {
                    setDevNavigationEnabled(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors"
                >
                  <Power className="w-4 h-4" />
                  Desativar Modo Dev
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

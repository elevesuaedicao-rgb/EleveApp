import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DevRole,
  setDevNavigationEnabled,
  setDevNavigationRole,
} from '@/lib/devNavigation';

const ROLE_OPTIONS: Array<{
  id: DevRole;
  title: string;
  description: string;
  targetPath: string;
}> = [
  {
    id: 'student',
    title: 'Aluno',
    description: 'Abrir painel e subpaginas do aluno.',
    targetPath: '/student',
  },
  {
    id: 'teacher',
    title: 'Professor',
    description: 'Abrir painel e subpaginas do professor.',
    targetPath: '/teacher',
  },
  {
    id: 'guardian',
    title: 'Pai/Responsavel',
    description: 'Abrir portal do responsavel e agenda.',
    targetPath: '/app/guardian',
  },
];

const DevRoleSelect: React.FC = () => {
  const navigate = useNavigate();

  const enterRole = (role: DevRole, targetPath: string) => {
    setDevNavigationEnabled(true);
    setDevNavigationRole(role);
    navigate(targetPath, { replace: true });
  };

  const goToRealLogin = () => {
    setDevNavigationEnabled(false);
    navigate('/auth/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Modo de desenvolvimento</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Selecionar tipo de usuario</h1>
          <p className="text-sm text-muted-foreground">
            Tela temporaria para navegar rapidamente entre os fluxos sem alterar login e onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => enterRole(role.id, role.targetPath)}
              className="text-left rounded-3xl border border-border bg-surface p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Entrar como</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground">{role.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{role.description}</p>
              <span className="inline-flex mt-5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
                Abrir {role.title}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={goToRealLogin}>
            Ir para login real
          </Button>
          <Button variant="ghost" onClick={() => navigate('/welcome')}>
            Voltar para welcome
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevRoleSelect;

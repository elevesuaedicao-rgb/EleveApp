import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isDevNavigationEnabled } from '@/lib/devNavigation';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { session, roles, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const devNavigationEnabled = isDevNavigationEnabled();

  useEffect(() => {
    if (devNavigationEnabled) return;
    if (loading) return;

    const isWelcomePage = location.pathname === '/welcome';
    const isLoginPage = location.pathname === '/login';
    const isRealLoginPage = location.pathname === '/auth/login';
    const isOnboardingPage = location.pathname.startsWith('/onboarding');
    const isPublicPage = isWelcomePage || isLoginPage || isRealLoginPage;

    // Se não tem sessão e não está em páginas públicas, redireciona para welcome
    if (!session) {
      if (!isPublicPage) {
        navigate('/welcome');
      }
      return;
    }

    // Se tem sessão mas está em página pública, redireciona para home
    if (session && isPublicPage) {
      navigate('/');
      return;
    }

    // Se tem sessão mas não tem role, vai para seleção de role
    if (session && roles.length === 0 && !isOnboardingPage) {
      navigate('/onboarding');
      return;
    }

    // Se tem role mas onboarding não está completo
    if (session && roles.length > 0 && profile && !profile.onboarding_completed && !isOnboardingPage) {
      const role = roles[0];
      if (role === 'student') {
        // Verificar qual etapa do onboarding falta
        if (!profile.school_id) {
          navigate('/onboarding/student/school');
        } else if (!profile.grade_year) {
          navigate('/onboarding/student/grade');
        } else if (!profile.age) {
          navigate('/onboarding/student/age');
        }
      } else if (role === 'parent') {
        navigate('/onboarding/parent/choice');
      } else if (role === 'teacher') {
        navigate('/onboarding/teacher/complete');
      }
      return;
    }

    // Protege rotas baseado no role do usuário
    if (session && roles.length > 0 && profile?.onboarding_completed) {
      const primaryRole = roles[0];
      const currentPath = location.pathname;
      
      // Verifica se o usuário está tentando acessar uma área não permitida
      const isStudentRoute = currentPath.startsWith('/student');
      const isParentRoute = currentPath.startsWith('/parent') || currentPath.startsWith('/app/guardian');
      const isTeacherRoute = currentPath.startsWith('/teacher');
      
      if (isStudentRoute && primaryRole !== 'student') {
        navigate('/', { replace: true });
        return;
      }
      if (isParentRoute && primaryRole !== 'parent') {
        navigate('/', { replace: true });
        return;
      }
      if (isTeacherRoute && primaryRole !== 'teacher') {
        navigate('/', { replace: true });
        return;
      }
    }

  }, [session, roles, profile, loading, navigate, location.pathname, devNavigationEnabled]);

  if (loading && !devNavigationEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const DashboardRouter: React.FC = () => {
  const navigate = useNavigate();
  const { roles, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Redireciona baseado no role do usuário
    if (roles.length > 0) {
      const primaryRole = roles[0];
      
      switch (primaryRole) {
        case 'student':
          navigate('/student', { replace: true });
          break;
        case 'parent':
          navigate('/parent', { replace: true });
          break;
        case 'teacher':
          navigate('/teacher', { replace: true });
          break;
        default:
          // Fallback - vai para onboarding se não tiver role
          navigate('/onboarding', { replace: true });
      }
    }
  }, [roles, loading, navigate]);

  // Tela de "Bem-vindo de volta" enquanto redireciona
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 py-8">
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        {/* Logo */}
        <div className="w-20 h-20 bg-foreground rounded-2xl mx-auto flex items-center justify-center shadow-xl transform -rotate-6">
          <span className="text-background font-extrabold text-4xl font-sans mt-1">E</span>
        </div>
        
        {/* Mensagem de boas-vindas */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Bem-vindo de volta{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Redirecionando para seu painel...
          </p>
        </div>
        
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
};

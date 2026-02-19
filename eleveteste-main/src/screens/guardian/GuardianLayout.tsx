import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { JoinFamilyBanner } from '@/components/JoinFamilyBanner';
import { useFamilyChildren } from '@/hooks/useFamilyChildren';
import { useFamily } from '@/hooks/useFamily';

interface GuardianContextType {
  selectedStudentId: string | null;
  setSelectedStudentId: (studentId: string) => void;
  hasStudents: boolean;
  isLoadingStudents: boolean;
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export const useGuardian = () => {
  const context = useContext(GuardianContext);
  if (!context) {
    throw new Error('useGuardian must be used inside GuardianLayout');
  }
  return context;
};

export const GuardianLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { children, isLoading, hasChildren } = useFamilyChildren();
  const { needsFamilyLink } = useFamily();

  const [selectedStudentId, setSelectedStudentIdState] = useState<string | null>(searchParams.get('studentId'));

  useEffect(() => {
    const fromQuery = searchParams.get('studentId');
    if (fromQuery) {
      setSelectedStudentIdState(fromQuery);
      return;
    }

    if (!selectedStudentId && children.length > 0) {
      setSelectedStudentIdState(children[0].id);
    }
  }, [children, searchParams, selectedStudentId]);

  const setSelectedStudentId = (studentId: string) => {
    setSelectedStudentIdState(studentId);

    const next = new URLSearchParams(searchParams);
    next.set('studentId', studentId);
    setSearchParams(next, { replace: true });
  };

  const selectedStudent = useMemo(
    () => children.find((child) => child.id === selectedStudentId),
    [children, selectedStudentId]
  );

  const isDashboard = location.pathname === '/app/guardian' || location.pathname === '/parent';
  const isCalendarPage = /^\/app\/guardian\/students\/[^/]+\/calendar$/.test(location.pathname);

  return (
    <GuardianContext.Provider
      value={{
        selectedStudentId,
        setSelectedStudentId,
        hasStudents: hasChildren,
        isLoadingStudents: isLoading,
      }}
    >
      <div className="max-w-6xl mx-auto space-y-5 pb-20">
        {needsFamilyLink && <JoinFamilyBanner />}

        {!isLoading && hasChildren && !isCalendarPage && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Aluno selecionado</p>
              <p className="text-sm font-medium text-foreground">{selectedStudent?.name || 'Selecione um aluno'}</p>
            </div>
            <div className="flex bg-surface border border-border rounded-2xl p-1.5 gap-1 overflow-x-auto">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedStudentId(child.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedStudentId === child.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {child.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && !isCalendarPage && <Skeleton className="h-12 w-full rounded-2xl" />}

        {!isDashboard && !isCalendarPage && (
          <button
            onClick={() => navigate('/app/guardian')}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {'<-'} Voltar para o portal
          </button>
        )}

        <Outlet />
      </div>
    </GuardianContext.Provider>
  );
};

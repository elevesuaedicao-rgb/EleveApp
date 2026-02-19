import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useFamilyChildren } from '@/hooks/useFamilyChildren';
import { Skeleton } from '@/components/ui/skeleton';

interface Child {
  id: string;
  name: string;
  grade: string;
  avatarUrl: string;
}

interface ParentContextType {
  childrenList: Child[];
  selectedChild: Child | null;
  selectChild: (id: string) => void;
  isLoading: boolean;
  hasChildren: boolean;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export const useParent = () => {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentLayout');
  }
  return context;
};

export const ParentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { children: familyChildren, isLoading, hasChildren } = useFamilyChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Select first child when data loads
  useEffect(() => {
    if (familyChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(familyChildren[0].id);
    }
  }, [familyChildren, selectedChildId]);

  const selectedChild = familyChildren.find(c => c.id === selectedChildId) || null;

  const selectChild = (id: string) => {
    setSelectedChildId(id);
  };

  const isDashboard = location.pathname === '/parent';
  const isProfile = location.pathname === '/parent/profile';

  return (
    <ParentContext.Provider value={{ 
      childrenList: familyChildren, 
      selectedChild, 
      selectChild,
      isLoading,
      hasChildren,
    }}>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Child selector - only show if has children and not on profile */}
        {!isProfile && hasChildren && (
          <div className="flex justify-end pt-2">
            {isLoading ? (
              <Skeleton className="h-12 w-48 rounded-2xl" />
            ) : (
              <div className="flex bg-surface p-1.5 rounded-2xl shadow-sm border border-border w-fit">
                {familyChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => selectChild(child.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm ${
                      selectedChild?.id === child.id 
                        ? 'bg-muted text-foreground font-bold shadow-sm' 
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {child.avatarUrl.startsWith('http') ? (
                      <img src={child.avatarUrl} alt={child.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <span className="text-lg">{child.avatarUrl}</span>
                    )}
                    {child.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(!isDashboard && !isProfile) && (
          <button 
            onClick={() => navigate('/parent')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            ← Voltar para o Painel
          </button>
        )}
        
        {isProfile && (
          <button 
            onClick={() => navigate('/parent')}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            ← Voltar para o Dashboard
          </button>
        )}

        <Outlet />
      </div>
    </ParentContext.Provider>
  );
};

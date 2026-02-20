import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';
import { UserRole } from '../../types';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getActiveRole = (): string => {
    if (location.pathname.startsWith('/student') || location.pathname.startsWith('/app/student')) return 'student';
    if (location.pathname.startsWith('/parent') || location.pathname.startsWith('/app/guardian')) return 'parent';
    if (location.pathname.startsWith('/teacher')) return 'teacher';
    return '';
  };

  const activeRole = getActiveRole();
  const showNavigation = !!activeRole;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary flex overflow-hidden">

      {showNavigation && (
        <Sidebar
          role={activeRole}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300 w-full max-w-[100vw] overflow-x-hidden
        ${showNavigation ? (isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72') : ''}
      `}>

        {location.pathname !== '/teacher/calendar' && <TopBar hideLogoOnDesktop={showNavigation} />}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {showNavigation && <BottomBar role={activeRole} />}
    </div>
  );
};

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from './NavigationConfig';

interface BottomBarProps {
  role: string;
}

export const BottomBar: React.FC<BottomBarProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV_ITEMS[role] || [];
  const displayItems = items.slice(0, 5);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-surface/95 backdrop-blur-xl border-t border-border pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-5 h-16 px-1 relative">
          
          {displayItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.path !== `/${role}` && location.pathname.startsWith(item.path));
            const isCenter = index === 2;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  relative flex flex-col items-center justify-center w-full h-full gap-0.5 active:scale-95 transition-all duration-200 group
                  ${isActive && !isCenter ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                `}
              >
                {isCenter ? (
                  <div className="relative -top-5">
                    <div 
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 border-4 border-background
                        ${isActive 
                          ? 'bg-foreground text-background transform scale-110' 
                          : 'bg-surface text-muted-foreground shadow-sm'}
                      `}
                    >
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap mt-1 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className={`text-2xl transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className={`text-[9px] font-medium leading-tight max-w-[64px] truncate ${isActive ? 'font-bold' : ''}`}>
                      {item.label}
                    </span>
                    
                    {isActive && (
                      <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-primary animate-in fade-in zoom-in" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

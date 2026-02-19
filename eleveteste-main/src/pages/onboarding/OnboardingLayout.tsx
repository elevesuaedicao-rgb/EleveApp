import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  title?: string;
  subtitle?: string;
}

export const OnboardingLayout = ({ 
  children, 
  step, 
  totalSteps, 
  title, 
  subtitle 
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border">
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-9 h-9 bg-foreground rounded-lg transform -rotate-6 flex items-center justify-center shadow-sm">
            <span className="text-background font-extrabold text-xl font-sans leading-none mt-0.5">E</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground transform -rotate-1">
            LEVE
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {step && totalSteps && (
          <div className="w-full max-w-md mb-6">
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Passo {step} de {totalSteps}
            </p>
          </div>
        )}

        {title && (
          <div className="text-center mb-8 max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;

import React from 'react';
import { BookOpen, Clock, Star, FileText, ChevronRight } from 'lucide-react';
import { LearningHistoryEntry } from '@/hooks/useLearningHistory';
import { Badge } from '@/components/ui/badge';

interface LearningTimelineProps {
  entries: LearningHistoryEntry[];
  isLoading?: boolean;
}

const getPerformanceConfig = (performance: string | null) => {
  switch (performance) {
    case 'excellent':
      return { icon: '⭐', label: 'Excelente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' };
    case 'good':
      return { icon: '👍', label: 'Bom', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' };
    case 'regular':
      return { icon: '📊', label: 'Regular', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    case 'needs_improvement':
      return { icon: '⚠️', label: 'Precisa melhorar', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' };
    default:
      return null;
  }
};

const getSubjectIcon = (subjectName: string | undefined) => {
  const name = subjectName?.toLowerCase() || '';
  if (name.includes('matemática') || name.includes('math')) return '📐';
  if (name.includes('física') || name.includes('physics')) return '⚡';
  if (name.includes('química') || name.includes('chemistry')) return '🧪';
  if (name.includes('biologia') || name.includes('biology')) return '🧬';
  if (name.includes('português') || name.includes('portuguese')) return '📖';
  if (name.includes('inglês') || name.includes('english')) return '🇺🇸';
  if (name.includes('história') || name.includes('history')) return '🏛️';
  if (name.includes('geografia') || name.includes('geography')) return '🌍';
  return '📚';
};

export const LearningTimeline: React.FC<LearningTimelineProps> = ({ entries, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="w-12 h-12 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground font-medium">Nenhum registro encontrado</p>
        <p className="text-sm text-muted-foreground mt-1">O histórico pedagógico aparecerá aqui</p>
      </div>
    );
  }

  // Group entries by month
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = new Date(entry.date);
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(entry);
    return groups;
  }, {} as Record<string, LearningHistoryEntry[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedEntries).map(([month, monthEntries]) => (
        <div key={month}>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
            {month}
          </h3>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {monthEntries.map((entry, index) => {
                const performanceConfig = getPerformanceConfig(entry.student_performance);
                const subjectIcon = getSubjectIcon(entry.subject?.name);
                
                return (
                  <div 
                    key={entry.id} 
                    className="relative flex gap-4 animate-in slide-in-from-left-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Timeline dot */}
                    <div 
                      className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border"
                      style={{ 
                        backgroundColor: entry.subject?.color ? `${entry.subject.color}20` : undefined,
                        borderColor: entry.subject?.color || 'hsl(var(--border))',
                      }}
                    >
                      {subjectIcon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-foreground">
                            {entry.subject?.name || 'Aula'}
                          </h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>📅 {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.duration_minutes} min
                            </span>
                          </p>
                        </div>
                        {performanceConfig && (
                          <div className={`px-2 py-1 rounded-lg text-xs font-bold border ${performanceConfig.color}`}>
                            {performanceConfig.icon} {performanceConfig.label}
                          </div>
                        )}
                      </div>
                      
                      {/* Topics */}
                      {entry.topics_covered.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {entry.topics_covered.map((topic, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Observations */}
                      {entry.observations && (
                        <div className="p-3 bg-muted/50 rounded-lg mb-3">
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {entry.observations}
                          </p>
                        </div>
                      )}
                      
                      {/* Homework */}
                      {entry.homework && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                            <span className="text-base">📝</span>
                            <span><strong>Tarefa:</strong> {entry.homework}</span>
                          </p>
                        </div>
                      )}
                      
                      {/* Next steps */}
                      {entry.next_steps && (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <ChevronRight className="w-4 h-4" />
                          <span>{entry.next_steps}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearningTimeline;

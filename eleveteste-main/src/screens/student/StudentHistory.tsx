import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLearningHistory } from "@/hooks/useLearningHistory";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";
import { LearningTimeline } from "@/components/history/LearningTimeline";

export const StudentHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history, isLoading } = useLearningHistory({ role: "student" });
  const { sessions, stats } = useTrainingSessions(user?.id);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const subjects = [...new Set(history.filter((h) => h.subject).map((h) => h.subject!.name))];
  const filteredHistory =
    filterSubject === "all" ? history : history.filter((h) => h.subject?.name === filterSubject);

  const totalClasses = history.length;
  const totalHours = history.reduce((sum, h) => sum + h.duration_minutes, 0) / 60;
  const thisMonthClasses = history.filter((h) => {
    const date = new Date(h.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Historico pedagogico</h1>
          </div>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{totalClasses}</p>
            <p className="text-xs text-muted-foreground">Total de aulas</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-600">{totalHours.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Horas totais</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-green-600">{thisMonthClasses}</p>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.totalSessions}</p>
            <p className="text-xs text-muted-foreground">Treinos autonomos</p>
          </div>
        </div>

        <div className="bg-surface rounded-3xl p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground">Treino inteligente</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seus treinos por submateria alimentam seu perfil e os insights para familia e professor.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-muted rounded-xl p-4 border border-border">
              <p className="text-2xl font-black text-foreground">{stats.averageScore}%</p>
              <p className="text-xs text-muted-foreground uppercase">Media geral</p>
            </div>
            <div className="bg-muted rounded-xl p-4 border border-border">
              <p className="text-sm font-semibold text-foreground">{stats.mostPracticedTopic ?? "Sem dados"}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Top pratica</p>
            </div>
            <div className="bg-muted rounded-xl p-4 border border-border">
              <p className="text-sm font-semibold text-foreground">{stats.hardestTopic ?? "Sem dados"}</p>
              <p className="text-xs text-muted-foreground uppercase mt-1">Maior dificuldade</p>
            </div>
          </div>
          {sessions.length > 0 && (
            <div className="mt-4 space-y-2">
              {sessions.slice(0, 3).map((session) => (
                <div key={session.id} className="bg-muted/50 border border-border rounded-xl p-3">
                  <p className="font-medium text-foreground">
                    {session.subjectName} - {session.topicName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(session.finishedAt).toLocaleDateString("pt-BR")} | {session.scorePercent}% |{" "}
                    {session.correctCount}/{session.totalTasks} acertos
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <LearningTimeline entries={filteredHistory} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default StudentHistory;


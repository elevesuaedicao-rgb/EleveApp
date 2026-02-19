import React, { useState } from "react";
import { Filter, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLearningHistory } from "@/hooks/useLearningHistory";
import { LearningTimeline } from "@/components/history/LearningTimeline";
import { useParent } from "./ParentLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";

export const ParentHistory: React.FC = () => {
  const { selectedChild, hasChildren } = useParent();
  const { user } = useAuth();
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const { data: linkedStudents } = useQuery({
    queryKey: ["linked-students", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.rpc("get_linked_students", { _parent_id: user.id });
      if (!data || data.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", data);
      return profiles || [];
    },
    enabled: !!user,
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const currentStudentId = selectedStudentId || linkedStudents?.[0]?.id || "";

  const { history, isLoading } = useLearningHistory({
    role: "parent",
    studentId: currentStudentId,
  });
  const { sessions: trainingSessions, stats: trainingStats } = useTrainingSessions(currentStudentId);

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
  const excellentCount = history.filter(
    (h) => h.student_performance === "excellent" || h.student_performance === "good"
  ).length;
  const childName = selectedChild?.name || "seu filho(a)";

  if (!hasChildren) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-muted rounded-3xl p-12 text-center border border-dashed border-border">
          <p className="text-muted-foreground">Voce ainda nao possui filhos vinculados.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Compartilhe o codigo da familia para seus filhos se vincularem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Historico de {childName}</h2>
          <p className="text-muted-foreground text-sm">Acompanhe evolucao de aulas e treinos.</p>
        </div>
        <div className="flex gap-2">
          {linkedStudents && linkedStudents.length > 1 && (
            <Select value={currentStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger className="w-44">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filho" />
              </SelectTrigger>
              <SelectContent>
                {linkedStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Materia" />
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
          <p className="text-2xl font-bold text-amber-600">{trainingStats.totalSessions}</p>
          <p className="text-xs text-muted-foreground">Treinos no app</p>
        </div>
      </div>

      <LearningTimeline entries={filteredHistory} isLoading={isLoading} />

      <div className="bg-surface rounded-3xl p-6 border border-border">
        <h3 className="font-bold text-foreground text-lg">Insight de treino autonomo</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Sessao, media e maior dificuldade identificada no treino guiado.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="bg-muted rounded-xl p-4 border border-border">
            <p className="text-2xl font-black text-foreground">{trainingStats.averageScore}%</p>
            <p className="text-xs uppercase text-muted-foreground">Media de acertos</p>
          </div>
          <div className="bg-muted rounded-xl p-4 border border-border">
            <p className="text-sm font-semibold text-foreground">{trainingStats.mostPracticedTopic || "Sem dados"}</p>
            <p className="text-xs uppercase text-muted-foreground mt-1">Top pratica</p>
          </div>
          <div className="bg-muted rounded-xl p-4 border border-border">
            <p className="text-sm font-semibold text-foreground">{trainingStats.hardestTopic || "Sem dados"}</p>
            <p className="text-xs uppercase text-muted-foreground mt-1">Maior dificuldade</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Avaliacoes positivas em aula: <strong>{excellentCount}</strong>
        </p>
        {trainingSessions.length > 0 && (
          <div className="mt-4 space-y-2">
            {trainingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="rounded-xl border border-border p-3 bg-muted/40">
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
    </div>
  );
};


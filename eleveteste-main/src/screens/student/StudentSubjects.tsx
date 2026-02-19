import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { TRAINING_SUBJECTS } from "@/data/trainingCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";

export const StudentSubjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions } = useTrainingSessions(user?.id);

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Conhecimentos</h1>
          <p className="text-muted-foreground text-sm">
            Selecione um conhecimento para escolher a submateria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {TRAINING_SUBJECTS.map((subject) => {
          const subjectSessions = sessions.filter((item) => item.subjectId === subject.id);
          const totalTopics = subject.topics.length;
          const practicedTopics = new Set(subjectSessions.map((item) => item.topicId)).size;
          const averageScore =
            subjectSessions.length > 0
              ? Math.round(
                  subjectSessions.reduce((sum, item) => sum + item.scorePercent, 0) / subjectSessions.length
                )
              : 0;

          return (
            <button
              key={subject.id}
              onClick={() => navigate(`/student/subjects/${subject.id}`)}
              className="group text-left bg-surface p-6 rounded-3xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.colorClass} flex items-center justify-center text-2xl border`}
                >
                  {subject.icon}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-foreground mt-4">{subject.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Clique para ver submaterias e iniciar treino guiado.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-lg font-bold text-foreground">{totalTopics}</p>
                  <p className="text-[11px] text-muted-foreground uppercase">Submaterias</p>
                </div>
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-lg font-bold text-foreground">{practicedTopics}</p>
                  <p className="text-[11px] text-muted-foreground uppercase">Treinadas</p>
                </div>
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-lg font-bold text-foreground">{averageScore}%</p>
                  <p className="text-[11px] text-muted-foreground uppercase">Media</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


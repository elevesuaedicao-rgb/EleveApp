import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getSubjectById } from "@/data/trainingCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";

export const StudentSubjectTopics: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();
  const subject = getSubjectById(subjectId);
  const { user } = useAuth();
  const { sessions } = useTrainingSessions(user?.id);

  if (!subject) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Conhecimento nao encontrado</h1>
        <button
          onClick={() => navigate("/student/subjects")}
          className="px-4 py-2 rounded-xl bg-foreground text-background"
        >
          Voltar para conhecimentos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/student/subjects")}
          className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma submateria para treinar com wizard personalizado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {subject.topics.map((topic) => {
          const topicSessions = sessions.filter(
            (entry) => entry.subjectId === subject.id && entry.topicId === topic.id
          );
          const bestScore =
            topicSessions.length > 0
              ? Math.max(...topicSessions.map((entry) => entry.scorePercent))
              : 0;

          return (
            <button
              key={topic.id}
              onClick={() => navigate(`/student/subjects/${subject.id}/${topic.id}/wizard`)}
              className="group bg-surface border border-border rounded-3xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Submateria</p>
                  <h2 className="text-2xl font-black text-foreground">{topic.name}</h2>
                  <p className="text-sm text-muted-foreground">{topic.shortDescription}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-lg font-bold text-foreground">{topic.questions.length}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">Questoes</p>
                </div>
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-lg font-bold text-foreground">{topicSessions.length}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">Treinos</p>
                </div>
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <p className="text-lg font-bold text-foreground">{bestScore}%</p>
                  <p className="text-[11px] uppercase text-muted-foreground">Melhor</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


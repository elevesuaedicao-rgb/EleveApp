import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";

export const StudentKnowledgeSubjects: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app/student/knowledge")}
          className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-muted"
        >
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materias</h1>
          <p className="text-sm text-muted-foreground">Visao por materia e progresso medio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledge.subjectCards.map((subject) => (
          <button
            key={subject.key}
            onClick={() => navigate(`/app/student/knowledge/subjects/${subject.key}`)}
            className="text-left rounded-3xl border border-border bg-surface p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{subject.name}</h2>
              <span className="text-xs font-semibold text-muted-foreground">{subject.masteryPercent}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-foreground" style={{ width: `${subject.masteryPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">{subject.inProgressCount} unidades em progresso</p>
            <p className="text-xs text-muted-foreground">Proximo passo: {subject.nextStep}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentKnowledgeSubjects;

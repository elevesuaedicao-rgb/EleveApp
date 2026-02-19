import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKnowledgeSubject, type SubjectKey } from "@/data/knowledgeCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";

export const StudentKnowledgeSubjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { subjectKey } = useParams<{ subjectKey: SubjectKey }>();
  const subject = getKnowledgeSubject(subjectKey);
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  if (!subject) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Materia nao encontrada</h1>
        <button onClick={() => navigate("/app/student/knowledge/subjects")} className="px-4 py-2 rounded-xl bg-foreground text-background">
          Voltar
        </button>
      </div>
    );
  }

  const currentUnits = knowledge.gradeUnits.filter((unit) => unit.subjectKey === subject.key);
  const futureUnits = knowledge.futureUnits.filter((unit) => unit.subjectKey === subject.key);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/app/student/knowledge/subjects")} className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-muted">
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
          <p className="text-sm text-muted-foreground">Unidades priorizadas para seu ano e proximas etapas.</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Unidades recomendadas agora</h2>
        {currentUnits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
            Nenhuma unidade filtrada para seu ano. Mostrando trilhas gerais no menu principal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentUnits.map((unit) => {
              const progress = knowledge.getUnitProgress(unit.id);
              return (
                <div key={unit.id} className="rounded-2xl border border-border bg-surface p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground">{unit.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{unit.description}</p>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-foreground" style={{ width: `${progress?.masteryPercent ?? 0}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dominio: {progress?.masteryPercent ?? 0}%</span>
                    <span className="text-muted-foreground">{knowledge.getUnitProgressLabel(unit.id)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/app/student/knowledge/units/${unit.id}`)}
                      className="rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      Abrir unidade
                    </button>
                    <button
                      onClick={() => navigate(`/app/student/knowledge/sessions/new?source=unit&unitId=${unit.id}`)}
                      className="rounded-xl bg-foreground text-background px-3 py-2 text-sm font-semibold"
                    >
                      Treinar agora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {futureUnits.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Em breve voce chega em...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {futureUnits.map((unit) => (
              <div key={unit.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-semibold text-foreground">{unit.title}</p>
                <p className="text-xs text-muted-foreground mt-1">Prerequisito para: {unit.prerequisites.length > 0 ? unit.prerequisites.join(", ") : "entrada direta"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentKnowledgeSubjectDetail;

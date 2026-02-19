import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";

export const StudentKnowledgeInsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/app/student/knowledge")} className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-muted">
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights e conexoes</h1>
          <p className="text-sm text-muted-foreground">Conexoes entre materias baseadas na sua trilha e erros recentes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {knowledge.insights.map((insight) => (
          <div key={insight.id} className="rounded-2xl border border-border bg-surface p-5 space-y-2">
            <p className="text-xs uppercase text-muted-foreground">{insight.subjectKeys.join(" + ")}</p>
            <h2 className="text-lg font-bold text-foreground">{insight.title}</h2>
            <p className="text-sm text-muted-foreground">{insight.text}</p>
          </div>
        ))}
      </div>

      {knowledge.weakTopicSuggestions.length > 0 && (
        <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-2">
          <h2 className="text-lg font-bold text-foreground">Conectar com seus pontos fracos</h2>
          {knowledge.weakTopicSuggestions.slice(0, 4).map((item) => (
            <button
              key={item.topicId}
              onClick={() => item.unitId && navigate(`/app/student/knowledge/sessions/new?source=unit&unitId=${item.unitId}&mode=MIXED`)}
              className="w-full rounded-xl border border-border bg-surface p-3 text-left hover:bg-muted"
            >
              <p className="font-semibold text-foreground">{item.topicTitle}</p>
              <p className="text-xs text-muted-foreground">{item.unitTitle}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentKnowledgeInsightsPage;

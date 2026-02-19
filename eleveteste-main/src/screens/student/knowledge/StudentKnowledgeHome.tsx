import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";

export const StudentKnowledgeHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conhecimento</h1>
          <p className="text-sm text-muted-foreground">
            Seu mapa de progresso por materia e trilhas personalizadas.
          </p>
        </div>
        <button
          onClick={() => navigate("/app/student/knowledge/sessions/new")}
          className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold"
        >
          Treinar agora
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Mapa de progresso</h2>
          <button
            onClick={() => navigate("/app/student/knowledge/subjects")}
            className="text-sm text-primary font-semibold"
          >
            Ver materias
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {knowledge.subjectCards.map((card) => (
            <div key={card.key} className="rounded-2xl border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{card.name}</h3>
                <span className="text-xs text-muted-foreground">{card.masteryPercent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground" style={{ width: `${card.masteryPercent}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Em progresso: {card.inProgressCount} unidades</p>
              <p className="text-xs text-muted-foreground">Proximo passo: {card.nextStep}</p>
              <button
                onClick={() => navigate(`/app/student/knowledge/subjects/${card.key}`)}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                Abrir materia
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Trilhas do aluno</h2>
          <button
            onClick={() => navigate("/app/student/knowledge/tracks")}
            className="text-sm text-primary font-semibold"
          >
            Ver tudo
          </button>
        </div>

        {knowledge.tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-5">
            <p className="text-sm text-muted-foreground">Sem trilhas ainda.</p>
            <button
              onClick={() => navigate("/app/student/knowledge/tracks/new")}
              className="mt-3 rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold"
            >
              Adicionar trilha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {knowledge.tracks.slice(0, 4).map((track) => (
              <div key={track.id} className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs uppercase text-muted-foreground">{track.subjectKey}</p>
                <h3 className="font-bold text-foreground">{track.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">Foco: {track.focusMode} | {track.unitIds.length} unidades</p>
              </div>
            ))}
          </div>
        )}

        {knowledge.recommendedTracks.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold text-foreground">Sugestoes curadas</p>
            <div className="mt-2 space-y-2">
              {knowledge.recommendedTracks.slice(0, 2).map((track) => (
                <div key={track.id} className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">{track.title}</p>
                  <button
                    onClick={() => navigate(`/app/student/knowledge/tracks/new?template=${track.id}`)}
                    className="text-xs font-semibold text-primary"
                  >
                    Usar trilha
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Treino rapido</h2>
        <div className="grid grid-cols-3 gap-2">
          {[5, 15, 30].map((minutes) => (
            <button
              key={minutes}
              onClick={() => navigate(`/app/student/knowledge/sessions/new?timeBox=${minutes}`)}
              className="rounded-xl border border-border bg-surface p-3 hover:bg-muted"
            >
              <p className="font-bold text-foreground">{minutes} min</p>
              <p className="text-[11px] text-muted-foreground">Iniciar</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Insights do Professor Caio</h2>
          <button
            onClick={() => navigate("/app/student/knowledge/insights")}
            className="text-sm text-primary font-semibold"
          >
            Ver todos
          </button>
        </div>
        <div className="space-y-2">
          {knowledge.insights.slice(0, 2).map((insight) => (
            <div key={insight.id} className="rounded-2xl border border-border bg-surface p-4">
              <p className="font-semibold text-foreground">{insight.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{insight.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Revisao por erros recentes</h2>
        {knowledge.weakTopicSuggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
            Sem erros recentes. Continue treinando para gerar recomendacoes.
          </div>
        ) : (
          <div className="space-y-2">
            {knowledge.weakTopicSuggestions.slice(0, 3).map((item) => (
              <button
                key={item.topicId}
                onClick={() => item.unitId && navigate(`/app/student/knowledge/sessions/new?source=errors&unitId=${item.unitId}`)}
                className="w-full rounded-2xl border border-border bg-surface p-4 text-left hover:bg-muted"
              >
                <p className="font-semibold text-foreground">Revisar: {item.topicTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.unitTitle} | {item.count} erros recentes</p>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Level Points: <span className="font-bold text-foreground">{knowledge.studentProfile.levelPoints}</span> | streak: <span className="font-bold text-foreground">{knowledge.studentProfile.streak}</span>
        </p>
      </section>
    </div>
  );
};

export default StudentKnowledgeHome;

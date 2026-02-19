import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";

export const StudentKnowledgeTracks: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/student/knowledge")} className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-muted">
            {"<-"}
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas trilhas</h1>
            <p className="text-sm text-muted-foreground">Personalize foco por materia, objetivo e modo.</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/app/student/knowledge/tracks/new")}
          className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold"
        >
          Nova trilha
        </button>
      </div>

      {knowledge.tracks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted-foreground">
          Nenhuma trilha criada ainda. Crie uma trilha para aparecer no topo da area de conhecimento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {knowledge.tracks.map((track) => (
            <div key={track.id} className="rounded-2xl border border-border bg-surface p-4 space-y-2">
              <p className="text-xs uppercase text-muted-foreground">{track.subjectKey}</p>
              <h2 className="font-bold text-foreground">{track.title}</h2>
              <p className="text-xs text-muted-foreground">Objetivo: {track.objective} | modo: {track.focusMode}</p>
              <p className="text-xs text-muted-foreground">{track.unitIds.length} unidade(s) vinculadas</p>
              <button
                onClick={() => navigate(`/app/student/knowledge/sessions/new?source=track&trackId=${track.id}`)}
                className="mt-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                Treinar essa trilha
              </button>
            </div>
          ))}
        </div>
      )}

      {knowledge.recommendedTracks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Trilhas sugeridas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {knowledge.recommendedTracks.map((track) => (
              <div key={track.id} className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="font-semibold text-foreground">{track.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{track.description}</p>
                <button
                  onClick={() => navigate(`/app/student/knowledge/tracks/new?template=${track.id}`)}
                  className="mt-3 text-sm font-semibold text-primary"
                >
                  Usar como base
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentKnowledgeTracks;

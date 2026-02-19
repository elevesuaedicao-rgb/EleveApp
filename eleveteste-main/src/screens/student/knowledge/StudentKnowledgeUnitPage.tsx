import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKnowledgeUnit } from "@/data/knowledgeCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";
import { useSchedule } from "@/hooks/useSchedule";

export const StudentKnowledgeUnitPage: React.FC = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);
  const { getMyBookings } = useSchedule();

  const unit = getKnowledgeUnit(unitId);
  const topics = unitId ? knowledge.getUnitTopics(unitId) : [];
  const progress = unitId ? knowledge.getUnitProgress(unitId) : undefined;

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [note, setNote] = useState("");
  const [linking, setLinking] = useState(false);

  const futureBookings = useMemo(
    () =>
      getMyBookings()
        .filter((booking) => booking.time_slots?.date)
        .filter((booking) => {
          const date = booking.time_slots?.date;
          if (!date) return false;
          return new Date(`${date}T00:00:00`) >= new Date(new Date().toDateString());
        })
        .sort((a, b) => (a.time_slots?.date ?? "").localeCompare(b.time_slots?.date ?? "")),
    [getMyBookings]
  );

  if (!unit) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Unidade nao encontrada</h1>
        <button onClick={() => navigate("/app/student/knowledge/subjects")} className="px-4 py-2 rounded-xl bg-foreground text-background">
          Voltar
        </button>
      </div>
    );
  }

  const handleLinkLesson = async () => {
    if (!selectedLessonId) return;
    setLinking(true);
    try {
      await knowledge.saveLessonFocus({
        lessonId: selectedLessonId,
        unitId: unit.id,
        topicId: selectedTopicId || undefined,
        note: note || undefined,
      });
      navigate(`/app/student/lessons/${selectedLessonId}`);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/app/student/knowledge/subjects/${unit.subjectKey}`)} className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-muted">
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{unit.title}</h1>
          <p className="text-sm text-muted-foreground">{unit.description}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Dominio</p>
          <p className="text-sm font-semibold text-foreground">{progress?.masteryPercent ?? 0}%</p>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-foreground" style={{ width: `${progress?.masteryPercent ?? 0}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Status: {knowledge.getUnitProgressLabel(unit.id)}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
        <h2 className="text-lg font-bold text-foreground">Topicos</h2>
        <div className="space-y-2">
          {topics.map((topic) => (
            <div key={topic.id} className="rounded-xl border border-border p-3">
              <p className="font-semibold text-foreground">{topic.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => navigate(`/app/student/knowledge/sessions/new?source=unit&unitId=${unit.id}&mode=N1`)}
          className="rounded-xl border border-border bg-surface p-3 text-sm font-semibold hover:bg-muted"
        >
          Aprender conceitos (N1)
        </button>
        <button
          onClick={() => navigate(`/app/student/knowledge/sessions/new?source=unit&unitId=${unit.id}&mode=N2`)}
          className="rounded-xl border border-border bg-surface p-3 text-sm font-semibold hover:bg-muted"
        >
          Resolver questoes (N2)
        </button>
        <button
          onClick={() => navigate(`/app/student/knowledge/sessions/new?source=unit&unitId=${unit.id}&mode=MIXED`)}
          className="rounded-xl bg-foreground text-background p-3 text-sm font-semibold"
        >
          Misto
        </button>
      </div>

      <button
        onClick={() => navigate(`/app/student/knowledge/mastery/${unit.id}`)}
        className="w-full rounded-xl border border-border bg-surface p-3 text-sm font-semibold hover:bg-muted"
      >
        Fazer Teste de Dominio
      </button>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
        <h2 className="text-lg font-bold text-foreground">Levar para a proxima aula</h2>
        {futureBookings.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Nao ha aulas futuras para vincular este subassunto.</p>
            <button
              onClick={() => navigate("/app/student/booking")}
              className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold"
            >
              Agendar aula
            </button>
          </div>
        ) : (
          <>
            <select
              value={selectedLessonId}
              onChange={(event) => setSelectedLessonId(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Selecione uma aula futura</option>
              {futureBookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.time_slots?.date} {booking.time_slots?.start_time?.slice(0, 5)} - {booking.subjects?.name ?? "Aula"}
                </option>
              ))}
            </select>

            <select
              value={selectedTopicId}
              onChange={(event) => setSelectedTopicId(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="">Selecione um topico (opcional)</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </select>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Nota opcional para o professor"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 min-h-[90px]"
            />

            <button
              onClick={handleLinkLesson}
              disabled={!selectedLessonId || linking}
              className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {linking ? "Salvando..." : "Vincular subassunto"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentKnowledgeUnitPage;

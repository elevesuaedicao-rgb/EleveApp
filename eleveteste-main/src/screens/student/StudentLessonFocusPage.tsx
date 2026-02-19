import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";
import { useSchedule } from "@/hooks/useSchedule";

export const StudentLessonFocusPage: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);
  const { getMyBookings } = useSchedule();

  const booking = useMemo(() => getMyBookings().find((item) => item.id === lessonId), [getMyBookings, lessonId]);
  const existingFocus = knowledge.getLessonFocusByLessonId(lessonId);

  const [unitId, setUnitId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUnitId(existingFocus?.unitId ?? "");
    setTopicId(existingFocus?.topicId ?? "");
    setNote(existingFocus?.note ?? "");
  }, [existingFocus]);

  const topics = unitId ? knowledge.getUnitTopics(unitId) : [];

  const handleSave = async () => {
    if (!lessonId) return;
    setSaving(true);
    try {
      await knowledge.saveLessonFocus({
        lessonId,
        unitId: unitId || undefined,
        topicId: topicId || undefined,
        note: note || undefined,
      });
      navigate("/app/student/booking");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/app/student/booking")} className="w-10 h-10 rounded-full border border-border bg-surface hover:bg-muted">
          {"<-"}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vincular subassunto</h1>
          <p className="text-sm text-muted-foreground">Defina o foco da sua aula agendada.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-1">
        <p className="text-xs uppercase text-muted-foreground">Aula selecionada</p>
        <p className="font-semibold text-foreground">
          {booking?.time_slots?.date ?? "Aula"} {booking?.time_slots?.start_time?.slice(0, 5) ?? ""}
        </p>
        <p className="text-xs text-muted-foreground">{booking?.subjects?.name ?? "Sem materia definida"}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground">Unidade</label>
          <select
            value={unitId}
            onChange={(event) => {
              setUnitId(event.target.value);
              setTopicId("");
            }}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          >
            <option value="">Selecione uma unidade</option>
            {knowledge.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Topico (opcional)</label>
          <select
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
            disabled={!unitId}
          >
            <option value="">Selecione um topico</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground">Nota para a aula (opcional)</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ex.: quero focar em exercicios de aplicacao"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 min-h-[100px]"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar LessonFocus"}
        </button>
      </div>
    </div>
  );
};

export default StudentLessonFocusPage;

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";
import { useSchedule } from "@/hooks/useSchedule";

export const StudentKnowledgeSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);
  const { getMyBookings } = useSchedule();

  const session = knowledge.getSession(sessionId);
  const items = knowledge.getSessionItems(sessionId);
  const previousAttempts = knowledge.getSessionAttempts(sessionId);

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string; expectedAnswer: string } | null>(null);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof knowledge.completePracticeSession>> | null>(null);
  const [itemStartedAt, setItemStartedAt] = useState<number>(Date.now());

  const attemptsByItem = useMemo(
    () => new Map(previousAttempts.map((attempt) => [attempt.itemId, attempt])),
    [previousAttempts]
  );

  const upcomingLesson = useMemo(() => {
    return getMyBookings().find((booking) => {
      const date = booking.time_slots?.date;
      if (!date) return false;
      return new Date(`${date}T00:00:00`) >= new Date(new Date().toDateString());
    });
  }, [getMyBookings]);

  useEffect(() => {
    if (!sessionId) return;
    knowledge.startPracticeSession(sessionId);
  }, [knowledge, sessionId]);

  useEffect(() => {
    const currentItem = items[index];
    if (!currentItem) return;
    const previous = attemptsByItem.get(currentItem.id);
    setAnswer(previous?.answer ?? "");
    setFeedback(null);
    setItemStartedAt(Date.now());
  }, [index, items, attemptsByItem]);

  if (!session || !sessionId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Sessao nao encontrada</h1>
        <button onClick={() => navigate("/app/student/knowledge")} className="px-4 py-2 rounded-xl bg-foreground text-background">
          Voltar
        </button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="max-w-3xl mx-auto space-y-5 pb-20 animate-in fade-in duration-500">
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-3">
          <p className="text-xs uppercase text-muted-foreground">Sessao concluida</p>
          <h1 className="text-3xl font-bold text-foreground">{summary.scorePercent}% de aproveitamento</h1>
          <p className="text-sm text-muted-foreground">
            Acertos: {summary.correctCount} | Erros: {summary.wrongCount} | +{summary.gainedLevelPoints} LP
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-lg font-bold text-foreground">Sugestoes de revisao</h2>
          {summary.suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem pontos fracos relevantes nesta sessao.</p>
          ) : (
            <div className="space-y-2">
              {summary.suggestions.map((item) => {
                const topic = knowledge.topics.find((topicItem) => topicItem.id === item.topicId);
                const unit = knowledge.units.find((unitItem) => unitItem.id === item.unitId);
                return (
                  <div key={`${item.unitId}-${item.topicId}`} className="rounded-xl border border-border p-3">
                    <p className="font-semibold text-foreground">{topic?.title ?? "Topico"}</p>
                    <p className="text-xs text-muted-foreground">{unit?.title ?? "Unidade"} | {item.count} erro(s)</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/app/student/knowledge/sessions/new")}
            className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold"
          >
            Nova sessao
          </button>
          {upcomingLesson && (
            <button
              onClick={() => navigate(`/app/student/lessons/${upcomingLesson.id}`)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Vincular a uma aula
            </button>
          )}
          <button
            onClick={() => navigate("/app/student/knowledge")}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Voltar ao conhecimento
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Sessao sem itens</h1>
        <button onClick={() => navigate("/app/student/knowledge/sessions/new")} className="px-4 py-2 rounded-xl bg-foreground text-background">
          Gerar outra sessao
        </button>
      </div>
    );
  }

  const currentItem = items[index];
  const progressPercent = Math.round(((index + 1) / items.length) * 100);

  const handleSubmitCurrent = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const result = await knowledge.savePracticeAttempt({
        sessionId,
        itemId: currentItem.id,
        answer,
        timeSpentMs: Date.now() - itemStartedAt,
      });
      setFeedback({
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        expectedAnswer: result.expectedAnswer,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvance = async () => {
    if (index < items.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    const result = await knowledge.completePracticeSession(sessionId);
    setSummary(result);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Sessao em andamento</p>
            <h1 className="text-xl font-bold text-foreground">{session.subjectKey.toUpperCase()} | {session.mode}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{index + 1}/{items.length}</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-foreground" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
        <p className="text-xs uppercase text-muted-foreground">Item {index + 1}</p>
        <h2 className="text-xl font-bold text-foreground leading-tight">{currentItem.prompt}</h2>

        {currentItem.type === "multiple_choice" && currentItem.options ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {currentItem.options.map((option) => (
              <button
                key={option}
                onClick={() => setAnswer(option)}
                className={`rounded-xl border px-3 py-2 text-left ${answer === option ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : currentItem.type === "true_false" ? (
          <div className="grid grid-cols-2 gap-2">
            {["true", "false"].map((option) => (
              <button
                key={option}
                onClick={() => setAnswer(option)}
                className={`rounded-xl border px-3 py-2 text-left ${answer === option ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {option === "true" ? "Verdadeiro" : "Falso"}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Escreva sua resposta"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 min-h-[100px]"
          />
        )}

        {feedback && (
          <div className={`rounded-xl border p-3 ${feedback.isCorrect ? "border-green-300 bg-green-50 text-green-800" : "border-red-300 bg-red-50 text-red-800"}`}>
            <p className="font-semibold">{feedback.isCorrect ? "Acertou" : "Errou"}</p>
            {!feedback.isCorrect && <p className="text-sm mt-1">Resposta esperada: {feedback.expectedAnswer}</p>}
            <p className="text-sm mt-1">{feedback.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => navigate("/app/student/knowledge")}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Sair
        </button>
        {!feedback ? (
          <button
            onClick={handleSubmitCurrent}
            disabled={submitting || !answer.trim()}
            className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? "Validando..." : "Confirmar"}
          </button>
        ) : (
          <button
            onClick={handleAdvance}
            className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold"
          >
            {index === items.length - 1 ? "Finalizar sessao" : "Proximo"}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentKnowledgeSessionPage;

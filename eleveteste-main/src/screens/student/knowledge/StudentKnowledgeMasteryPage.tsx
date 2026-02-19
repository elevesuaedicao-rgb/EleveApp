import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKnowledgeUnit } from "@/data/knowledgeCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge, type MasteryQuestion } from "@/hooks/useKnowledge";

export const StudentKnowledgeMasteryPage: React.FC = () => {
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  const unit = getKnowledgeUnit(unitId);

  const [questions, setQuestions] = useState<MasteryQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof knowledge.submitMasteryResult>> | null>(null);

  useEffect(() => {
    if (!unitId) return;
    setQuestions(knowledge.generateMasteryQuestions(unitId, 20));
  }, [knowledge, unitId]);

  if (!unit || !unitId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Unidade nao encontrada</h1>
        <button onClick={() => navigate("/app/student/knowledge")} className="px-4 py-2 rounded-xl bg-foreground text-background">
          Voltar
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Gerando teste...</h1>
      </div>
    );
  }

  if (result) {
    const passed = result.result.passed;
    return (
      <div className="max-w-3xl mx-auto space-y-5 pb-20 animate-in fade-in duration-500">
        <div className={`rounded-3xl border p-6 ${passed ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"}`}>
          <p className="text-xs uppercase text-muted-foreground">Teste de dominio</p>
          <h1 className="text-3xl font-bold text-foreground mt-1">{result.result.score}%</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {passed
              ? "Unidade marcada como dominada e proxima unidade desbloqueada."
              : "Abaixo do limiar. Siga uma trilha de revisao para fortalecer os topicos fracos."}
          </p>
        </div>

        {!passed && result.weakTopics.length > 0 && (
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-2">
            <h2 className="text-lg font-bold text-foreground">Topicos fracos</h2>
            {result.weakTopics.slice(0, 4).map((topic) => (
              <div key={topic.topicId} className="rounded-xl border border-border p-3">
                <p className="font-semibold text-foreground">{topic.topicTitle}</p>
                <p className="text-xs text-muted-foreground">{topic.count} erro(s)</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!passed && (
            <button
              onClick={() => navigate(`/app/student/knowledge/sessions/new?source=unit&unitId=${unit.id}&mode=MIXED`)}
              className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold"
            >
              Revisar unidade
            </button>
          )}
          <button
            onClick={() => navigate(`/app/student/knowledge/units/${unit.id}`)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Voltar para unidade
          </button>
        </div>
      </div>
    );
  }

  const current = questions[index];
  const answer = answers[current.id] ?? "";
  const progressPercent = Math.round(((index + 1) / questions.length) * 100);

  const saveAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const goNext = async () => {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload = await knowledge.submitMasteryResult(unit.id, questions, answers);
      setResult(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-surface p-6">
        <p className="text-xs uppercase text-muted-foreground">Teste de dominio</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">{unit.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Questao {index + 1} de {questions.length}</p>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-foreground" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground leading-tight">{current.prompt}</h2>

        {current.type === "multiple_choice" && current.options ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => saveAnswer(option)}
                className={`rounded-xl border px-3 py-2 text-left ${answer === option ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : current.type === "true_false" ? (
          <div className="grid grid-cols-2 gap-2">
            {["true", "false"].map((option) => (
              <button
                key={option}
                onClick={() => saveAnswer(option)}
                className={`rounded-xl border px-3 py-2 text-left ${answer === option ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {option === "true" ? "Verdadeiro" : "Falso"}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(event) => saveAnswer(event.target.value)}
            placeholder="Resposta curta"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 min-h-[100px]"
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => (index === 0 ? navigate(`/app/student/knowledge/units/${unit.id}`) : setIndex((value) => value - 1))}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Voltar
        </button>
        <button
          onClick={goNext}
          disabled={submitting || !answer.trim()}
          className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {index === questions.length - 1 ? (submitting ? "Corrigindo..." : "Finalizar teste") : "Proxima"}
        </button>
      </div>
    </div>
  );
};

export default StudentKnowledgeMasteryPage;

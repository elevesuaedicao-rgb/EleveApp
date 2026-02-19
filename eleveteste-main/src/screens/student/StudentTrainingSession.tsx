import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getSubjectById, getTopicById, type DifficultyLevel, type TrainingQuestion, type TrainingType, type MoodType } from "@/data/trainingCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useTrainingSessions } from "@/hooks/useTrainingSessions";

interface AnswerState {
  questionId: string;
  answer: string;
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const isOpenAnswerCorrect = (question: TrainingQuestion, answer: string) => {
  const normalized = normalizeText(answer);
  if (!normalized) return false;
  if (question.acceptedKeywords && question.acceptedKeywords.length > 0) {
    return question.acceptedKeywords.every((keyword) => normalized.includes(normalizeText(keyword)));
  }
  return normalized.includes(normalizeText(question.correctAnswer));
};

const getTaskCountByDuration = (minutes: number) => {
  if (minutes <= 10) return 4;
  if (minutes <= 20) return 6;
  return 8;
};

const pickQuestions = (
  questions: TrainingQuestion[],
  trainingType: TrainingType,
  taskCount: number
): TrainingQuestion[] => {
  const byType =
    trainingType === "mixed"
      ? questions
      : questions.filter((question) => question.type === trainingType);

  const source = byType.length > 0 ? byType : questions;
  const result: TrainingQuestion[] = [];
  for (let index = 0; index < taskCount; index += 1) {
    result.push(source[index % source.length]);
  }
  return result;
};

export const StudentTrainingSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveSession } = useTrainingSessions();
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>();
  const [query] = useSearchParams();

  const subject = getSubjectById(subjectId);
  const topic = getTopicById(subjectId, topicId);

  const difficulty = (query.get("difficulty") as DifficultyLevel) || "easy";
  const duration = Number(query.get("duration") || "20");
  const trainingType = (query.get("type") as TrainingType) || "mixed";
  const mood = (query.get("mood") as MoodType) || "ok";

  const questions = useMemo(
    () => (topic ? pickQuestions(topic.questions, trainingType, getTaskCountByDuration(duration)) : []),
    [topic, trainingType, duration]
  );

  const [index, setIndex] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!subject || !topic) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Treino nao encontrado</h1>
        <button onClick={() => navigate("/student/subjects")} className="px-4 py-2 rounded-xl bg-foreground text-background">
          Voltar
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Sem questoes disponiveis</h1>
        <button
          onClick={() => navigate(`/student/subjects/${subject.id}`)}
          className="px-4 py-2 rounded-xl bg-foreground text-background"
        >
          Voltar para submaterias
        </button>
      </div>
    );
  }

  const currentQuestion = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);

  const setAnswerForCurrent = (answer: string) => {
    setAnswers((previous) => {
      const withoutCurrent = previous.filter((item) => item.questionId !== currentQuestion.id);
      return [...withoutCurrent, { questionId: currentQuestion.id, answer }];
    });
  };

  const currentAnswer = answers.find((item) => item.questionId === currentQuestion.id)?.answer ?? "";

  const handleNext = async () => {
    if (!currentAnswer.trim()) return;
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setInputValue("");
      return;
    }

    setSaving(true);
    const wrongAnswers = questions
      .map((question) => {
        const studentAnswer = answers.find((item) => item.questionId === question.id)?.answer ?? "";
        const isCorrect =
          question.type === "multiple_choice"
            ? normalizeText(studentAnswer) === normalizeText(question.correctAnswer)
            : isOpenAnswerCorrect(question, studentAnswer);
        if (isCorrect) return null;
        return {
          questionId: question.id,
          prompt: question.prompt,
          expectedAnswer: question.correctAnswer,
          studentAnswer: studentAnswer || "Sem resposta",
          explanation: question.explanation,
        };
      })
      .filter(Boolean);

    const totalTasks = questions.length;
    const wrongCount = wrongAnswers.length;
    const correctCount = totalTasks - wrongCount;
    const scorePercent = Math.round((correctCount / totalTasks) * 100);

    await saveSession({
      studentId: user?.id ?? "anonymous-student",
      subjectId: subject.id,
      subjectName: subject.name,
      topicId: topic.id,
      topicName: topic.name,
      difficulty,
      durationMinutes: duration,
      trainingType,
      mood,
      startedAt,
      totalTasks,
      correctCount,
      scorePercent,
      wrongAnswers: wrongAnswers as NonNullable<typeof wrongAnswers>,
    });
    setSaving(false);
    setFinished(true);
  };

  if (finished) {
    const latest = {
      totalTasks: questions.length,
      wrongAnswers: questions
        .map((question) => {
          const studentAnswer = answers.find((item) => item.questionId === question.id)?.answer ?? "";
          const isCorrect =
            question.type === "multiple_choice"
              ? normalizeText(studentAnswer) === normalizeText(question.correctAnswer)
              : isOpenAnswerCorrect(question, studentAnswer);
          if (isCorrect) return null;
          return {
            questionId: question.id,
            prompt: question.prompt,
            expectedAnswer: question.correctAnswer,
            studentAnswer: studentAnswer || "Sem resposta",
            explanation: question.explanation,
          };
        })
        .filter(Boolean),
    };
    const correctCount = latest.totalTasks - latest.wrongAnswers.length;
    const scorePercent = Math.round((correctCount / latest.totalTasks) * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="bg-surface border border-border rounded-3xl p-6">
          <p className="text-xs uppercase text-muted-foreground">Treino concluido</p>
          <h1 className="text-3xl font-black text-foreground mt-1">Resultado final</h1>
          <p className="text-muted-foreground mt-2">
            {subject.name} - {topic.name}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-2xl bg-muted border border-border p-4">
              <p className="text-3xl font-black text-foreground">{scorePercent}%</p>
              <p className="text-xs uppercase text-muted-foreground">Aproveitamento</p>
            </div>
            <div className="rounded-2xl bg-muted border border-border p-4">
              <p className="text-3xl font-black text-foreground">{correctCount}</p>
              <p className="text-xs uppercase text-muted-foreground">Acertos</p>
            </div>
            <div className="rounded-2xl bg-muted border border-border p-4">
              <p className="text-3xl font-black text-foreground">{latest.wrongAnswers.length}</p>
              <p className="text-xs uppercase text-muted-foreground">Erros</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Onde voce errou</h2>
          {latest.wrongAnswers.length === 0 ? (
            <p className="text-muted-foreground">Excelente. Nenhum erro nesta sessao.</p>
          ) : (
            latest.wrongAnswers.map((item) => (
              <div key={item?.questionId} className="rounded-2xl border border-border p-4 bg-muted/40">
                <p className="font-semibold text-foreground">{item?.prompt}</p>
                <p className="text-sm text-muted-foreground mt-2">Sua resposta: {item?.studentAnswer}</p>
                <p className="text-sm text-foreground mt-1">Resposta esperada: {item?.expectedAnswer}</p>
                <p className="text-sm text-muted-foreground mt-1">{item?.explanation}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/student/subjects/${subject.id}/${topic.id}/wizard`)}
            className="px-5 py-3 rounded-xl bg-foreground text-background"
          >
            Treinar novamente
          </button>
          <button
            onClick={() => navigate("/student/history")}
            className="px-5 py-3 rounded-xl border border-border bg-surface hover:bg-muted"
          >
            Ver historico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-surface border border-border rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Sessao em andamento</p>
            <h1 className="text-2xl font-black text-foreground">{topic.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Dificuldade: {difficulty}</p>
            <p className="text-sm text-muted-foreground">Tempo: {duration} min</p>
          </div>
        </div>
        <div className="w-full h-3 bg-muted rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Tarefa {index + 1} de {questions.length} | Humor: {mood}
        </p>
      </div>

      <div className="bg-gradient-to-br from-sky-50 via-white to-emerald-50 border border-border rounded-3xl p-6 md:p-8">
        <p className="text-xs uppercase text-muted-foreground">Desafio atual</p>
        <h2 className="text-2xl font-bold text-foreground mt-2 leading-tight">{currentQuestion.prompt}</h2>

        {currentQuestion.type === "multiple_choice" && currentQuestion.options ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {currentQuestion.options.map((option) => {
              const selected = currentAnswer === option;
              return (
                <button
                  key={option}
                  onClick={() => setAnswerForCurrent(option)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "bg-foreground text-background border-foreground"
                      : "bg-surface border-border hover:border-foreground/30"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <textarea
              value={currentAnswer || inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setAnswerForCurrent(event.target.value);
              }}
              placeholder="Escreva sua resposta..."
              className="w-full min-h-[140px] rounded-2xl border border-border bg-surface p-4 outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => (index === 0 ? navigate(`/student/subjects/${subject.id}/${topic.id}/wizard`) : setIndex((value) => value - 1))}
          className="px-5 py-3 rounded-xl border border-border bg-surface hover:bg-muted"
        >
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!currentAnswer.trim() || saving}
          className="px-5 py-3 rounded-xl bg-foreground text-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {index === questions.length - 1 ? (saving ? "Salvando..." : "Finalizar treino") : "Proxima"}
        </button>
      </div>
    </div>
  );
};


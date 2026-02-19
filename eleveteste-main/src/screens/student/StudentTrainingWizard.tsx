import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { DifficultyLevel, MoodType, TrainingType } from "@/data/trainingCatalog";
import { getSubjectById, getTopicById } from "@/data/trainingCatalog";

interface WizardOption<T extends string> {
  value: T;
  title: string;
  subtitle: string;
}

const DIFFICULTY_OPTIONS: WizardOption<DifficultyLevel>[] = [
  { value: "easy", title: "Facil", subtitle: "Revisao e base" },
  { value: "medium", title: "Medio", subtitle: "Equilibrado" },
  { value: "hard", title: "Dificil", subtitle: "Desafio alto" },
];

const DURATION_OPTIONS: WizardOption<"10" | "20" | "30">[] = [
  { value: "10", title: "10 min", subtitle: "Treino rapido" },
  { value: "20", title: "20 min", subtitle: "Ritmo normal" },
  { value: "30", title: "30 min", subtitle: "Sessao completa" },
];

const TYPE_OPTIONS: WizardOption<TrainingType>[] = [
  { value: "multiple_choice", title: "Assinalar", subtitle: "Alternativas" },
  { value: "open_answer", title: "Dissertativa", subtitle: "Resposta aberta" },
  { value: "mixed", title: "Misto", subtitle: "Assinalar + aberta" },
];

const MOOD_OPTIONS: WizardOption<MoodType>[] = [
  { value: "confident", title: "Confiante", subtitle: "Pronto para avancar" },
  { value: "ok", title: "Normal", subtitle: "Quero manter ritmo" },
  { value: "tired", title: "Cansado", subtitle: "Preciso de aquecimento" },
];

export const StudentTrainingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>();
  const subject = getSubjectById(subjectId);
  const topic = getTopicById(subjectId, topicId);

  const [step, setStep] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [duration, setDuration] = useState<"10" | "20" | "30" | null>(null);
  const [trainingType, setTrainingType] = useState<TrainingType | null>(null);
  const [mood, setMood] = useState<MoodType | null>(null);

  const steps = useMemo(
    () => [
      {
        title: "Qual nivel voce quer hoje?",
        subtitle: "Ajuste o desafio para o seu momento.",
        options: DIFFICULTY_OPTIONS,
        selected: difficulty,
        select: (value: string) => setDifficulty(value as DifficultyLevel),
      },
      {
        title: "Quanto tempo voce tem?",
        subtitle: "Nos ajustamos o treino ao seu tempo.",
        options: DURATION_OPTIONS,
        selected: duration,
        select: (value: string) => setDuration(value as "10" | "20" | "30"),
      },
      {
        title: "Tipo de treino",
        subtitle: "Escolha como quer praticar hoje.",
        options: TYPE_OPTIONS,
        selected: trainingType,
        select: (value: string) => setTrainingType(value as TrainingType),
      },
      {
        title: "Como voce esta se sentindo?",
        subtitle: "Isso ajuda a calibrar feedback e ritmo.",
        options: MOOD_OPTIONS,
        selected: mood,
        select: (value: string) => setMood(value as MoodType),
      },
    ],
    [difficulty, duration, trainingType, mood]
  );

  if (!subject || !topic) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Submateria nao encontrada</h1>
        <button
          onClick={() => navigate("/student/subjects")}
          className="px-4 py-2 rounded-xl bg-foreground text-background"
        >
          Voltar
        </button>
      </div>
    );
  }

  const currentStep = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);
  const canContinue = Boolean(currentStep.selected);

  const handleNext = () => {
    if (!canContinue) return;
    if (step < steps.length - 1) {
      setStep((value) => value + 1);
      return;
    }

    const params = new URLSearchParams({
      difficulty: difficulty ?? "easy",
      duration: duration ?? "20",
      type: trainingType ?? "mixed",
      mood: mood ?? "ok",
    });
    navigate(`/student/subjects/${subject.id}/${topic.id}/train?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-surface border border-border rounded-3xl p-6">
        <p className="text-xs uppercase text-muted-foreground tracking-wide">Wizard de treino</p>
        <h1 className="text-3xl font-black text-foreground mt-1">
          {subject.name} - {topic.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">{topic.shortDescription}</p>

        <div className="w-full h-3 bg-muted rounded-full mt-5 overflow-hidden">
          <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Etapa {step + 1} de {steps.length}
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-50 via-white to-sky-50 border border-border rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{currentStep.title}</h2>
          <p className="text-muted-foreground">{currentStep.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentStep.options.map((option) => {
            const isActive = currentStep.selected === option.value;
            return (
              <button
                key={option.value}
                onClick={() => currentStep.select(option.value)}
                className={`rounded-2xl border p-6 text-left transition-all ${
                  isActive
                    ? "border-foreground bg-foreground text-background shadow-lg"
                    : "border-border bg-surface hover:border-foreground/40 hover:shadow-sm"
                }`}
              >
                <p className="text-xl font-bold">{option.title}</p>
                <p className={`text-sm mt-1 ${isActive ? "text-background/80" : "text-muted-foreground"}`}>
                  {option.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => (step === 0 ? navigate(`/student/subjects/${subject.id}`) : setStep((value) => value - 1))}
          className="px-5 py-3 rounded-xl border border-border bg-surface hover:bg-muted transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!canContinue}
          className="px-5 py-3 rounded-xl bg-foreground text-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === steps.length - 1 ? "Comecar treino" : "Continuar"}
        </button>
      </div>
    </div>
  );
};


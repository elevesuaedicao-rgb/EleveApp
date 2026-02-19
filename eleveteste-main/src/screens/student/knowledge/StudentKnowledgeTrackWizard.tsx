import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getKnowledgeSubject,
  STANDARD_TRACK_TEMPLATES,
  type FocusMode,
  type SubjectKey,
} from "@/data/knowledgeCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";

const OBJECTIVES = [
  { value: "reforco", label: "Reforco" },
  { value: "prova", label: "Prova" },
  { value: "base", label: "Recuperar base" },
  { value: "curiosidade", label: "Curiosidade" },
] as const;

const MODE_OPTIONS: Array<{ value: FocusMode; label: string }> = [
  { value: "N1", label: "Conceitos (N1)" },
  { value: "N2", label: "Questoes (N2)" },
  { value: "MIXED", label: "Misto" },
];

export const StudentKnowledgeTrackWizard: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  const template = STANDARD_TRACK_TEMPLATES.find((item) => item.id === params.get("template"));

  const [step, setStep] = useState(1);
  const [subjectKey, setSubjectKey] = useState<SubjectKey | null>(template?.subjectKey ?? null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(template?.unitIds ?? []);
  const [customUnitTitle, setCustomUnitTitle] = useState("");
  const [objective, setObjective] = useState<(typeof OBJECTIVES)[number]["value"]>("reforco");
  const [mode, setMode] = useState<FocusMode>(template?.defaultFocusMode ?? "MIXED");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const availableUnits = useMemo(() => {
    if (!subjectKey) return [];
    return knowledge.units.filter((unit) => unit.subjectKey === subjectKey);
  }, [knowledge.units, subjectKey]);

  const filteredUnits = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return availableUnits;
    return availableUnits.filter((unit) => unit.title.toLowerCase().includes(normalized));
  }, [availableUnits, searchTerm]);

  const canContinue =
    (step === 1 && !!subjectKey) ||
    (step === 2 && (selectedUnitIds.length > 0 || customUnitTitle.trim().length > 0)) ||
    (step === 3 && !!objective) ||
    (step === 4 && !!mode) ||
    step === 5;

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds((previous) =>
      previous.includes(unitId) ? previous.filter((item) => item !== unitId) : [...previous, unitId]
    );
  };

  const handleCreateTrack = async () => {
    if (!subjectKey) return;
    setSubmitting(true);
    try {
      const subjectName = getKnowledgeSubject(subjectKey)?.name ?? "Trilha";
      await knowledge.createTrack({
        subjectKey,
        unitIds: selectedUnitIds,
        focusMode: mode,
        objective,
        title: template?.title ?? `${subjectName} - personalizada`,
        customUnitTitle,
      });
      navigate("/app/student/knowledge/tracks");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-surface p-6">
        <p className="text-xs uppercase text-muted-foreground tracking-wide">Adicionar trilha</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">Passo {step} de 5</h1>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-foreground" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 1 - Escolher materia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {knowledge.subjects.map((subject) => (
              <button
                key={subject.key}
                onClick={() => setSubjectKey(subject.key)}
                className={`rounded-2xl border p-4 text-left ${subjectKey === subject.key ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                <p className="font-semibold">{subject.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 2 - Escolher unidade/submateria</h2>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar unidade..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredUnits.map((unit) => (
              <button
                key={unit.id}
                onClick={() => toggleUnit(unit.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm ${selectedUnitIds.includes(unit.id) ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {unit.title}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-border p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">Outra...</p>
            <input
              value={customUnitTitle}
              onChange={(event) => setCustomUnitTitle(event.target.value)}
              placeholder="Digite uma unidade personalizada"
              className="w-full rounded-xl border border-border bg-background px-3 py-2"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 3 - Objetivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OBJECTIVES.map((item) => (
              <button
                key={item.value}
                onClick={() => setObjective(item.value)}
                className={`rounded-2xl border px-4 py-3 text-left ${objective === item.value ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 4 - Preferencia de treino</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MODE_OPTIONS.map((item) => (
              <button
                key={item.value}
                onClick={() => setMode(item.value)}
                className={`rounded-2xl border px-4 py-3 text-left ${mode === item.value ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 5 - Confirmar</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Materia: {subjectKey ? getKnowledgeSubject(subjectKey)?.name : "-"}</p>
            <p>Unidades selecionadas: {selectedUnitIds.length}</p>
            {customUnitTitle && <p>Unidade custom: {customUnitTitle}</p>}
            <p>Objetivo: {objective}</p>
            <p>Modo: {mode}</p>
          </div>
          <button
            onClick={handleCreateTrack}
            disabled={submitting}
            className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? "Criando..." : "Criar StudentTrack"}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => (step === 1 ? navigate("/app/student/knowledge/tracks") : setStep((value) => value - 1))}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Voltar
        </button>
        <button
          onClick={() => step < 5 && canContinue && setStep((value) => value + 1)}
          disabled={step >= 5 || !canContinue}
          className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default StudentKnowledgeTrackWizard;

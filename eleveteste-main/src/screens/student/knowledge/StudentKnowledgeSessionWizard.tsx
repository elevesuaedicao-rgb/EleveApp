import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { type FocusMode } from "@/data/knowledgeCatalog";
import { useKnowledge, type SessionMood, type SessionSource, type SessionTimeBox } from "@/hooks/useKnowledge";

const MOODS: Array<{ value: SessionMood; label: string; subtitle: string }> = [
  { value: "low", label: "Sem energia", subtitle: "Sessao curta e leve" },
  { value: "ok", label: "Ok", subtitle: "Ritmo equilibrado" },
  { value: "high", label: "Empolgado", subtitle: "Desafio mais longo" },
];

const TIME_OPTIONS: SessionTimeBox[] = [5, 15, 30];
const MODE_OPTIONS: FocusMode[] = ["N1", "N2", "MIXED"];

export const StudentKnowledgeSessionWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const knowledge = useKnowledge(user?.id, profile?.grade_year);

  const presetSource = (searchParams.get("source") as SessionSource | null) ?? undefined;
  const presetUnitId = searchParams.get("unitId") ?? undefined;
  const presetTrackId = searchParams.get("trackId") ?? undefined;

  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<SessionMood>("ok");
  const [timeBox, setTimeBox] = useState<SessionTimeBox>((Number(searchParams.get("timeBox")) as SessionTimeBox) || 15);
  const [source, setSource] = useState<SessionSource>(presetSource ?? "track");
  const [mode, setMode] = useState<FocusMode>((searchParams.get("mode") as FocusMode) || "MIXED");
  const [trackId, setTrackId] = useState<string>(presetTrackId ?? "");
  const [unitId, setUnitId] = useState<string>(presetUnitId ?? "");
  const [creating, setCreating] = useState(false);

  const planPreview = useMemo(
    () => knowledge.buildSessionPlan({ mood, timeBox, source, mode, trackId: trackId || undefined, unitId: unitId || undefined }),
    [knowledge, mood, mode, source, timeBox, trackId, unitId]
  );

  const canContinue =
    step === 1 ||
    step === 2 ||
    (step === 3 && (source !== "track" || !!trackId) && (source !== "unit" || !!unitId)) ||
    step === 4 ||
    step === 5;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const session = await knowledge.createPracticeSession({
        mood,
        timeBox,
        source,
        mode,
        trackId: trackId || undefined,
        unitId: unitId || undefined,
      });
      navigate(`/app/student/knowledge/sessions/${session.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-surface p-6">
        <p className="text-xs uppercase text-muted-foreground tracking-wide">Wizard de sessao</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">Passo {step} de 5</h1>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-foreground" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 1 - Como voce esta hoje?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MOODS.map((item) => (
              <button
                key={item.value}
                onClick={() => setMood(item.value)}
                className={`rounded-2xl border p-4 text-left ${mood === item.value ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs mt-1 opacity-80">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 2 - Tempo disponivel</h2>
          <div className="grid grid-cols-3 gap-3">
            {TIME_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                onClick={() => setTimeBox(minutes)}
                className={`rounded-2xl border p-4 text-center ${timeBox === minutes ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                <p className="text-lg font-bold">{minutes}</p>
                <p className="text-xs">min</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 3 - O que quer treinar?</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={source === "track"} onChange={() => setSource("track")} />
              Continuar trilha atual (recomendado)
            </label>
            {source === "track" && (
              <select value={trackId} onChange={(event) => setTrackId(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2">
                <option value="">Selecione uma trilha</option>
                {knowledge.tracks.map((track) => (
                  <option key={track.id} value={track.id}>{track.title}</option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={source === "unit"} onChange={() => setSource("unit")} />
              Escolher unidade
            </label>
            {source === "unit" && (
              <select value={unitId} onChange={(event) => setUnitId(event.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2">
                <option value="">Selecione uma unidade</option>
                {knowledge.gradeUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.title}</option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={source === "errors"} onChange={() => setSource("errors")} />
              Treinar por erro recente
            </label>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 4 - Modo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MODE_OPTIONS.map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-2xl border p-4 ${mode === item ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted"}`}
              >
                {item === "N1" ? "Conceitos" : item === "N2" ? "Questoes" : "Misto"}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Step 5 - Confirmar sessao</h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Humor: {mood}</p>
            <p>Tempo: {timeBox} min</p>
            <p>Origem: {source}</p>
            <p>Modo: {mode}</p>
            <p>Itens planejados: {planPreview?.itemCount ?? 0}</p>
            <p>Unidades: {(planPreview?.unitIds.length ?? 0)}</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="rounded-xl bg-foreground text-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {creating ? "Criando PracticeSession..." : "Iniciar sessao"}
          </button>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => (step === 1 ? navigate("/app/student/knowledge") : setStep((value) => value - 1))}
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

export default StudentKnowledgeSessionWizard;

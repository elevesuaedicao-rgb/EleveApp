import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { type FocusMode } from "@/data/knowledgeCatalog";
import { useKnowledge, type SessionMood, type SessionSource, type SessionTimeBox } from "@/hooks/useKnowledge";
import {
  ChevronLeft,
  Check,
  BatteryLow,
  BatteryMedium,
  Zap,
  Clock,
  Map,
  BookOpen,
  AlertTriangle,
  Brain,
  Rocket
} from "lucide-react";

// --- Constants & Types ---
const MOODS: Array<{ value: SessionMood; label: string; subtitle: string; icon: any; color: string }> = [
  { value: "low", label: "Sem energia", subtitle: "Sessão curta e leve", icon: BatteryLow, color: "text-amber-500 bg-amber-50" },
  { value: "ok", label: "Ok", subtitle: "Ritmo equilibrado", icon: BatteryMedium, color: "text-blue-500 bg-blue-50" },
  { value: "high", label: "Empolgado", subtitle: "Desafio mais longo", icon: Zap, color: "text-yellow-500 bg-yellow-50" },
];

const TIME_OPTIONS: Array<{ value: SessionTimeBox; label: string; icon: any }> = [
  { value: 5, label: "Rapidinha", icon: Zap },
  { value: 15, label: "Padrão", icon: Clock },
  { value: 30, label: "Intenso", icon: Brain },
];

const MODE_OPTIONS: Array<{ value: FocusMode; label: string }> = [
  { value: "N1", label: "Conceitos (N1)" },
  { value: "N2", label: "Questões (N2)" },
  { value: "MIXED", label: "Misto" },
];

const WizardHeader = ({ step, totalSteps, onBack }: { step: number; totalSteps: number; onBack: () => void }) => (
  <div className="flex items-center gap-4 mb-8">
    <button
      onClick={onBack}
      className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
    <div className="h-4 flex-1 bg-muted rounded-full overflow-hidden relative">
      <motion.div
        className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(step / totalSteps) * 100}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
      <div
        className="absolute top-1 left-2 h-1.5 w-[90%] bg-white/20 rounded-full"
        style={{ width: `${(step / totalSteps) * 90}%` }}
      />
    </div>
  </div>
);

const SelectionCard = ({
  selected,
  onClick,
  children,
  className = ""
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      relative w-full text-left p-4 rounded-2xl border-2 border-b-4 transition-all duration-200
      ${selected
        ? "border-primary bg-primary/5 border-b-primary translate-y-[2px] border-b-[2px]"
        : "border-border bg-card hover:bg-accent/50 hover:border-primary/30"
      }
      ${className}
    `}
  >
    {selected && (
      <div className="absolute top-3 right-3 text-primary">
        <div className="bg-primary text-primary-foreground rounded-full p-0.5">
          <Check className="w-3 h-3" strokeWidth={4} />
        </div>
      </div>
    )}
    {children}
  </motion.button>
);

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

  const handleBack = () => {
    if (step === 1) navigate("/app/student/knowledge");
    else setStep((s) => s - 1);
  };

  const handleContinue = () => {
    if (step < 5 && canContinue) setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-8 pb-24 px-4 sm:px-6">
      <div className="w-full max-w-2xl">
        <WizardHeader step={step} totalSteps={5} onBack={handleBack} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* STEP 1: MOOD */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">Como você está hoje?</h1>
                  <p className="text-muted-foreground text-lg">Para ajustar o nível do desafio.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  {MOODS.map((item) => (
                    <SelectionCard
                      key={item.value}
                      selected={mood === item.value}
                      onClick={() => setMood(item.value)}
                      className="flex items-center gap-4"
                    >
                      <div className={`p-3 rounded-2xl ${item.color}`}>
                        <item.icon className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xl">{item.label}</span>
                        <span className="text-muted-foreground">{item.subtitle}</span>
                      </div>
                    </SelectionCard>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: TIME */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">Quanto tempo?</h1>
                  <p className="text-muted-foreground text-lg">Sessões curtas ou mergulho profundo.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {TIME_OPTIONS.map((item) => (
                    <SelectionCard
                      key={item.value}
                      selected={timeBox === item.value}
                      onClick={() => setTimeBox(item.value)}
                      className="flex flex-col items-center justify-center gap-3 py-8"
                    >
                      <div className="p-3 bg-primary/5 rounded-full text-primary">
                        <item.icon className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <span className="block text-3xl font-black">{item.value}</span>
                        <span className="text-sm font-medium text-muted-foreground">minutos</span>
                      </div>
                    </SelectionCard>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: SOURCE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">O que vamos treinar?</h1>
                  <p className="text-muted-foreground text-lg">Escolha o foco do treino.</p>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Option: Track */}
                  <SelectionCard
                    selected={source === "track"}
                    onClick={() => setSource("track")}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Map className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold block text-lg">Trilha Atual</span>
                        <span className="text-sm text-muted-foreground">Continuar sua jornada.</span>
                      </div>
                    </div>

                    {source === "track" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="w-full mt-2"
                      >
                        <select
                          value={trackId}
                          onChange={(e) => setTrackId(e.target.value)}
                          className="w-full p-3 rounded-xl border bg-background"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Selecione uma trilha...</option>
                          {knowledge.tracks.map((track) => (
                            <option key={track.id} value={track.id}>{track.title}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </SelectionCard>

                  {/* Option: Unit */}
                  <SelectionCard
                    selected={source === "unit"}
                    onClick={() => setSource("unit")}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold block text-lg">Unidade Específica</span>
                        <span className="text-sm text-muted-foreground">Escolha um tópico pontual.</span>
                      </div>
                    </div>

                    {source === "unit" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="w-full mt-2"
                      >
                        <select
                          value={unitId}
                          onChange={(e) => setUnitId(e.target.value)}
                          className="w-full p-3 rounded-xl border bg-background"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Selecione uma unidade...</option>
                          {knowledge.gradeUnits.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.title}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </SelectionCard>

                  {/* Option: Errors */}
                  <SelectionCard
                    selected={source === "errors"}
                    onClick={() => setSource("errors")}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold block text-lg">Revisar Erros</span>
                      <span className="text-sm text-muted-foreground">Treinar o que você errou recentemente.</span>
                    </div>
                  </SelectionCard>
                </div>
              </div>
            )}

            {/* STEP 4: MODE */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">Qual o foco?</h1>
                  <p className="text-muted-foreground text-lg">Defina o estilo das questões.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  {MODE_OPTIONS.map((item) => (
                    <SelectionCard
                      key={item.value}
                      selected={mode === item.value}
                      onClick={() => setMode(item.value)}
                      className="flex items-center gap-4"
                    >
                      <div className={`p-3 rounded-xl ${mode === item.value ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                        }`}>
                        {item.value === "N1" ? (
                          <Brain className="w-6 h-6" />
                        ) : item.value === "N2" ? (
                          <Zap className="w-6 h-6" />
                        ) : (
                          <Rocket className="w-6 h-6" />
                        )}
                      </div>
                      <span className="font-bold text-lg">{item.label}</span>
                    </SelectionCard>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRM */}
            {step === 5 && (
              <div className="space-y-8 text-center px-4">
                <div className="space-y-2">
                  <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Rocket className="w-12 h-12" strokeWidth={2} />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">Vamos lá!</h1>
                  <p className="text-muted-foreground text-lg">
                    Preparamos um treino especial para você.
                  </p>
                </div>

                <div className="bg-card border-2 border-border rounded-2xl p-6 text-left space-y-3 max-w-sm mx-auto shadow-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tempo</span>
                    <span className="font-semibold">{timeBox} min</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Modo</span>
                    <span className="font-semibold">{mode === "N1" ? "Conceitos" : mode === "N2" ? "Prática" : "Misto"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Itens</span>
                    <span className="font-semibold text-primary">{planPreview?.itemCount ?? 0} questões</span>
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full max-w-sm mx-auto bg-green-500 hover:bg-green-600 active:translate-y-1 transition-all text-white font-bold text-lg py-4 rounded-2xl border-b-4 border-green-700 active:border-b-0 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creating ? "Preparando..." : "Começar Treino"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex justify-center z-50">
            <div className="w-full max-w-2xl flex justify-end">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`
                  px-8 py-3 rounded-xl font-bold text-lg transition-all border-b-4
                  ${canContinue
                    ? "bg-green-500 hover:bg-green-600 text-white border-green-700 active:border-b-0 active:translate-y-1 shadow-lg cursor-pointer"
                    : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"}
                `}
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentKnowledgeSessionWizard;

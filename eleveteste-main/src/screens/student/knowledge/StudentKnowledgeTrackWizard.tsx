import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getKnowledgeSubject,
  STANDARD_TRACK_TEMPLATES,
  type FocusMode,
  type SubjectKey,
  KNOWLEDGE_SUBJECTS,
} from "@/data/knowledgeCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useKnowledge } from "@/hooks/useKnowledge";
import {
  ChevronLeft,
  Check,
  Search,
  Plus,
  Target,
  Trophy,
  BookOpen,
  Sparkles,
  Calculator,
  Atom,
  FlaskConical,
  Zap,
  Brain,
  Layers,
  Rocket
} from "lucide-react";

// --- Constants & Types ---
const OBJECTIVES = [
  { value: "reforco", label: "Reforço Escolar", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200" },
  { value: "prova", label: "Preparação para Prova", icon: Target, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-200" },
  { value: "base", label: "Recuperar a Base", icon: Layers, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-200" },
  { value: "curiosidade", label: "Aprender por Curiosidade", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-200" },
] as const;

const MODE_OPTIONS: Array<{ value: FocusMode; label: string; icon: any; desc: string }> = [
  { value: "N1", label: "Conceitos (N1)", icon: Brain, desc: "Foco em teoria e compreensão básica." },
  { value: "N2", label: "Questões (N2)", icon: Zap, desc: "Foco em resolução de problemas e cálculos." },
  { value: "MIXED", label: "Misto", icon: Rocket, desc: "Equilíbrio entre teoria e prática." },
];

const SUBJECT_ICONS: Record<string, any> = {
  matematica: Calculator,
  fisica: Atom,
  quimica: FlaskConical
};

// --- Components ---

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
      const track = await knowledge.createTrack({
        subjectKey,
        unitIds: selectedUnitIds,
        focusMode: mode,
        objective,
        title: template?.title ?? `${subjectName} - personalizada`,
        customUnitTitle,
      });

      // Create initial session automatically for better UX
      const session = await knowledge.createPracticeSession({
        mood: "ok",
        timeBox: 15,
        source: "track",
        mode: mode,
        trackId: track.id,
        subjectKey: subjectKey,
      });

      navigate(`/app/student/knowledge/sessions/${session.id}`);
    } catch (error) {
      console.error("Failed to create track:", error);
      alert("Ocorreu um erro ao criar sua trilha. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 1) navigate("/app/student/knowledge/tracks");
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
            {/* STEP 1: SUBJECT */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">O que vamos estudar?</h1>
                  <p className="text-muted-foreground text-lg">Escolha a matéria principal da sua trilha.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  {knowledge.subjects.map((subject) => {
                    const Icon = SUBJECT_ICONS[subject.key] || BookOpen;
                    return (
                      <SelectionCard
                        key={subject.key}
                        selected={subjectKey === subject.key}
                        onClick={() => setSubjectKey(subject.key)}
                        className="flex flex-col items-center justify-center gap-4 py-8 h-40"
                      >
                        <div className={`p-4 rounded-2xl ${subjectKey === subject.key ? "bg-background text-primary" : "bg-muted text-foreground"
                          }`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg">{subject.name}</span>
                      </SelectionCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: UNITS */}
            {step === 2 && (
              <div className="space-y-6 h-full flex flex-col">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Quais tópicos?</h1>
                  <p className="text-muted-foreground">Selecione as unidades que deseja cobrir.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar unidade..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredUnits.map((unit) => (
                    <SelectionCard
                      key={unit.id}
                      selected={selectedUnitIds.includes(unit.id)}
                      onClick={() => toggleUnit(unit.id)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className={`p-2 rounded-lg ${selectedUnitIds.includes(unit.id) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{unit.title}</span>
                    </SelectionCard>
                  ))}

                  {/* Custom Unit Input */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-semibold mb-2">Não encontrou? Adicione:</p>
                    <div className="flex gap-2">
                      <input
                        value={customUnitTitle}
                        onChange={(e) => setCustomUnitTitle(e.target.value)}
                        placeholder="Ex: Revisão de Álgebra"
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: OBJECTIVE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Qual o seu objetivo?</h1>
                  <p className="text-muted-foreground">Isso ajuda a personalizar o ritmo.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 mt-6">
                  {OBJECTIVES.map((item) => (
                    <SelectionCard
                      key={item.value}
                      selected={objective === item.value}
                      onClick={() => setObjective(item.value)}
                      className="flex items-center gap-4"
                    >
                      <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">{item.label}</span>
                      </div>
                    </SelectionCard>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: MODE */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Estilo de aprendizado</h1>
                  <p className="text-muted-foreground">Escolha como prefere praticar.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  {MODE_OPTIONS.map((item) => (
                    <SelectionCard
                      key={item.value}
                      selected={mode === item.value}
                      onClick={() => setMode(item.value)}
                      className="flex items-start gap-4 p-5"
                    >
                      <div className={`p-3 rounded-xl ${mode === item.value ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </SelectionCard>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMATION */}
            {step === 5 && (
              <div className="space-y-8 text-center px-4">
                <div className="space-y-2">
                  <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                    <Check className="w-10 h-10" strokeWidth={3} />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">Tudo pronto!</h1>
                  <p className="text-muted-foreground text-lg px-8">
                    Sua trilha de estudos será criada a seguir.
                  </p>
                </div>

                <div className="bg-card border-2 border-border rounded-2xl p-6 text-left space-y-3 max-w-sm mx-auto shadow-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Matéria</span>
                    <span className="font-semibold">{subjectKey ? getKnowledgeSubject(subjectKey)?.name : "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Tópicos</span>
                    <span className="font-semibold">{selectedUnitIds.length} selecionados</span>
                  </div>
                  {customUnitTitle && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Extra</span>
                      <span className="font-semibold truncate max-w-[150px]">{customUnitTitle}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Objetivo</span>
                    <span className="font-semibold capitalize">{objective}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modo</span>
                    <span className="font-semibold">{mode === "N1" ? "Conceitos" : mode === "N2" ? "Prática" : "Misto"}</span>
                  </div>
                </div>

                <button
                  onClick={handleCreateTrack}
                  disabled={submitting}
                  className="w-full max-w-sm mx-auto bg-green-500 hover:bg-green-600 active:translate-y-1 transition-all text-white font-bold text-lg py-4 rounded-2xl border-b-4 border-green-700 active:border-b-0 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? "Criando Trilha..." : "Começar Agora"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation (Hidden on final step) */}
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

export default StudentKnowledgeTrackWizard;

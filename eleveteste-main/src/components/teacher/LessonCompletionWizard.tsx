
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Loader2, Star, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
    bookingId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface TopicEntry {
    topic: string;
    difficulty: number;
}

export const LessonCompletionWizard = ({ bookingId, isOpen, onClose, onSuccess }: Props) => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [mood, setMood] = useState(8);
    const [attention, setAttention] = useState(8);
    const [topics, setTopics] = useState<TopicEntry[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [newDiff, setNewDiff] = useState(5);
    const [notes, setNotes] = useState('');
    const [problems, setProblems] = useState('');
    const [examLinked, setExamLinked] = useState(false);

    const addTopic = () => {
        if (newTopic.trim()) {
            setTopics([...topics, { topic: newTopic, difficulty: newDiff }]);
            setNewTopic('');
            setNewDiff(5);
        }
    };

    const removeTopic = (idx: number) => {
        setTopics(topics.filter((_, i) => i !== idx));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.rpc('complete_lesson_wizard', {
                p_booking_id: bookingId,
                p_mood: mood,
                p_attention: attention,
                p_notes: notes,
                p_problems: problems,
                p_exam: examLinked,
                p_topics: topics
            });

            if (error) throw error;

            toast({
                title: "Aula concluída!",
                description: "Os dados foram salvos e o analytics atualizado.",
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao salvar",
                description: "Tente novamente mais tarde.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Finalizar Aula</DialogTitle>
                    <DialogDescription>Registre o desempenho e observações da aula.</DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Humor/Engajamento do Aluno</Label>
                                    <span className="text-lg font-bold text-primary">{mood}</span>
                                </div>
                                <Slider value={[mood]} onValueChange={([v]) => setMood(v)} max={10} step={1} className="w-full" />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Desanimado</span>
                                    <span>Empolgado</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-base font-semibold">Nível de Atenção</Label>
                                    <span className="text-lg font-bold text-primary">{attention}</span>
                                </div>
                                <Slider value={[attention]} onValueChange={([v]) => setAttention(v)} max={10} step={1} className="w-full" />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Disperso</span>
                                    <span>Focado</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="exam" checked={examLinked} onCheckedChange={(c) => setExamLinked(!!c)} />
                                <Label htmlFor="exam" className="cursor-pointer">Esta aula foi revisão para prova?</Label>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-semibold">Tópicos Trabalhados</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        placeholder="Ex: Equação 2º Grau"
                                        value={newTopic}
                                        onChange={(e) => setNewTopic(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                                    />
                                    <div className="w-32">
                                        <div className="text-center text-xs mb-1">Dificuldade: {newDiff}</div>
                                        <Slider value={[newDiff]} onValueChange={([v]) => setNewDiff(v)} max={10} step={1} />
                                    </div>
                                    <Button size="icon" onClick={addTopic} disabled={!newTopic.trim()}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-muted/30 rounded-lg border border-dashed">
                                {topics.length === 0 && <span className="text-sm text-muted-foreground w-full text-center py-4">Adicione tópicos...</span>}
                                {topics.map((t, i) => (
                                    <div key={i} className="flex items-center bg-background border px-3 py-1 rounded-full shadow-sm text-sm">
                                        <span className="mr-2">{t.topic}</span>
                                        <span className="bg-primary/10 text-primary px-1.5 rounded text-xs font-bold mr-2">{t.difficulty}</span>
                                        <button onClick={() => removeTopic(i)} className="text-muted-foreground hover:text-destructive">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Observações Gerais</Label>
                                <Textarea
                                    placeholder="Como foi a aula? Alguma pendência?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Problemas Resolvidos (Opcional)</Label>
                                <Textarea
                                    placeholder="Quais exercícios foram feitos?"
                                    value={problems}
                                    onChange={(e) => setProblems(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <div className="flex gap-2">
                        {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Voltar</Button>}
                        {step < 3 ? (
                            <Button onClick={() => setStep(step + 1)}>Próximo</Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Concluir Aula
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

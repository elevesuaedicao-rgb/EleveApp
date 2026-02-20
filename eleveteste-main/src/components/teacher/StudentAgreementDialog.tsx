
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudentAnalytics, StudentAgreement } from '@/hooks/useStudentAnalytics';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
    studentId: string;
    isOpen: boolean;
    onClose: () => void;
    currentAgreement: StudentAgreement | undefined | null;
}

export const StudentAgreementDialog = ({ studentId, isOpen, onClose, currentAgreement }: Props) => {
    const { updateAgreement } = useStudentAnalytics(studentId);
    const [formData, setFormData] = useState<StudentAgreement>({
        student_id: studentId,
        price_remote_60: 50,
        price_remote_90: 70,
        price_person_60: 60,
        price_person_90: 80,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentAgreement) {
            setFormData(currentAgreement);
        } else {
            setFormData({
                student_id: studentId,
                price_remote_60: 50,
                price_remote_90: 70,
                price_person_60: 60,
                price_person_90: 80,
            });
        }
    }, [currentAgreement, studentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateAgreement(formData);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Acordo Financeiro</DialogTitle>
                    <DialogDescription>Define os valores base para cálculos de faturamento.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Online (60min)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                <Input className="pl-9" type="number" value={formData.price_remote_60} onChange={e => setFormData({ ...formData, price_remote_60: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Online (90+ min)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                <Input className="pl-9" type="number" value={formData.price_remote_90} onChange={e => setFormData({ ...formData, price_remote_90: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Presencial (60min)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                <Input className="pl-9" type="number" value={formData.price_person_60} onChange={e => setFormData({ ...formData, price_person_60: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Presencial (90+ min)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                <Input className="pl-9" type="number" value={formData.price_person_90} onChange={e => setFormData({ ...formData, price_person_90: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

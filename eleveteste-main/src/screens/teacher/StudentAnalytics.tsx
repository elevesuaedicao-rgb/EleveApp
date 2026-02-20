
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Calendar, Coins, TrendingUp, Clock,
    BookOpen, Calculator, Download, Settings,
    MessageCircle, MoreHorizontal, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeacherStudents } from '@/hooks/useTeacherStudents';
import { useStudentAnalytics, StudentProjection } from '@/hooks/useStudentAnalytics';
import { StudentAgreementDialog } from '@/components/teacher/StudentAgreementDialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateBillingPDF } from '../../utils/billing-pdf';


export const StudentAnalytics = () => {
    const navigate = useNavigate();
    const { studentId } = useParams<{ studentId: string }>();
    const { students } = useTeacherStudents();
    const { agreement, getProjection, topics, billingCycles, createBillingCycle } = useStudentAnalytics(studentId!); // Assumes studentId exists

    const [period, setPeriod] = useState('this-month'); // this-month, last-month, next-month
    const [projection, setProjection] = useState<StudentProjection | null>(null);
    const [isAgreementOpen, setIsAgreementOpen] = useState(false);
    const [loadingProj, setLoadingProj] = useState(false);

    // Find student profile
    const student = students.find(s => s.student_id === studentId);
    const initials = student?.student.full_name.slice(0, 2).toUpperCase() || 'AL';

    // Calculate Dates
    useEffect(() => {
        const fetchProj = async () => {
            if (!studentId) return;
            setLoadingProj(true);
            let start, end;
            const now = new Date();

            if (period === 'this-month') {
                start = startOfMonth(now);
                end = endOfMonth(now);
            } else if (period === 'last-month') {
                start = startOfMonth(subMonths(now, 1));
                end = endOfMonth(subMonths(now, 1));
            } else if (period === 'next-month') {
                start = startOfMonth(new Date(now.getFullYear(), now.getMonth() + 1, 1));
                end = endOfMonth(new Date(now.getFullYear(), now.getMonth() + 1, 1));
            } else {
                start = startOfMonth(now);
                end = endOfMonth(now);
            }

            try {
                const data = await getProjection(start, end);
                setProjection(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProj(false);
            }
        };
        fetchProj();
    }, [period, studentId]);

    if (!student) return <div className="p-8">Carregando...</div>;

    const chartData = projection ? [
        { name: 'Histórico (Média)', value: projection.historical_avg_value, type: 'historical' },
        { name: 'Previsto (Real)', value: projection.real_value, type: 'real' },
    ] : [];

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="min-h-screen bg-background pb-20 fade-in">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/students')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={student.student.avatar_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{student.student.full_name}</h1>
                            <p className="text-xs text-muted-foreground">Analytics & Financeiro</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/teacher/students/${studentId}`)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Perfil
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-4 space-y-6">

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Tabs value={period} onValueChange={setPeriod} className="w-full sm:w-auto">
                        <TabsList>
                            <TabsTrigger value="last-month">Mês Passado</TabsTrigger>
                            <TabsTrigger value="this-month">Este Mês</TabsTrigger>
                            <TabsTrigger value="next-month">Próximo Mês</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => window.open(`https://wa.me/55${student.student.phone?.replace(/\D/g, '')}`, '_blank')}>
                            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                            Aluno
                        </Button>
                        {student.parent?.phone && (
                            <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => window.open(`https://wa.me/55${student.parent.phone?.replace(/\D/g, '')}`, '_blank')}>
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                Resp.
                            </Button>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Projection Card */}
                    <Card className="col-span-1 md:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Projeção do Período</CardTitle>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">
                                    {formatCurrency(projection?.real_value || 0)}
                                </span>
                                {projection && projection.real_value > projection.historical_avg_value && (
                                    <Badge variant="default" className="bg-green-500/15 text-green-600 hover:bg-green-500/25 border-0">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Acima da média
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>
                                Baseado em {projection?.real_count || 0} aulas agendadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} interval={0} />
                                    <RechartsTooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'real' ? '#3b82f6' : '#94a3b8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Volume Stats */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Volume de Aulas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{projection?.real_count || 0}</p>
                                    <p className="text-xs text-muted-foreground">Agendadas</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                                <span className="text-muted-foreground">Média Histórica:</span>
                                <span className="font-medium">{projection?.historical_avg_count || 0}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Agreement Mini-View */}
                    <Card className="relative overflow-hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => setIsAgreementOpen(true)}
                        >
                            <Settings className="w-3 h-3" />
                        </Button>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Acordo Vigente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Online (60min)</span>
                                <span className="font-bold">{formatCurrency(agreement?.price_remote_60 || 50)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Presencial (60min)</span>
                                <span className="font-bold">{formatCurrency(agreement?.price_person_60 || 60)}</span>
                            </div>
                            <div className="text-xs text-center text-muted-foreground mt-2 bg-muted/50 p-1 rounded">
                                Clique na engrenagem para editar
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Subject Performance */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Desempenho por Tópico
                                </CardTitle>
                                <CardDescription>Baseado na dificuldade reportada e exercícios</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topics.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Nenhum dado de tópico registrado ainda.
                                        </div>
                                    ) : (
                                        topics.map((topic) => (
                                            <div key={topic.topic_name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/50 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{topic.topic_name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Última prática: {new Date(topic.last_practiced_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold">
                                                            {topic.difficulty_ema.toFixed(1)} <span className="text-muted-foreground font-normal text-xs">/ 10</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Dificuldade</div>
                                                    </div>
                                                    <Badge variant="outline" className={
                                                        topic.trend === 'improving' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            topic.trend === 'worsening' ? 'bg-red-50 text-red-700 border-red-200' : ''
                                                    }>
                                                        {topic.trend === 'improving' ? 'Melhorando' :
                                                            topic.trend === 'worsening' ? 'Atenção' : 'Estável'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Billing History / Cycles */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Fechamentos & Cobrança
                                    </CardTitle>
                                    <CardDescription>Histórico de ciclos de faturamento</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => createBillingCycle({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') })}>
                                    Gerar Fechamento
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {billingCycles.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum fechamento gerado.</p>
                                    ) : (
                                        billingCycles.map((cycle) => (
                                            <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">
                                                        {format(new Date(cycle.start_date), 'dd/MM')} a {format(new Date(cycle.end_date), 'dd/MM/yyyy')}
                                                    </p>
                                                    <Badge variant={cycle.status === 'paid' ? 'default' : cycle.status === 'closed' ? 'secondary' : 'outline'}>
                                                        {cycle.status === 'paid' ? 'Pago' : cycle.status === 'closed' ? 'Fechado' : 'Aberto'}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={async () => {
                                                        try {
                                                            const report = await getBillingReport(cycle.id);
                                                            generateBillingPDF(report as any, agreement);
                                                        } catch (e) {
                                                            console.error("Erro ao gerar PDF", e);
                                                        }
                                                    }}>
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Quick Actions / Summary */}
                    <div className="space-y-6">
                        <Card className="bg-primary text-primary-foreground">
                            <CardHeader>
                                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
                                <CardDescription className="text-primary-foreground/80">Projeção mensal atual</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold mb-2">
                                    {formatCurrency(projection?.real_value || 0)}
                                </div>
                                <p className="text-sm opacity-90 mb-6">
                                    Valor estimado se todas as {projection?.real_count} aulas agendadas ocorrerem.
                                </p>
                                <Button variant="secondary" className="w-full text-primary" onClick={() => navigate(`/teacher/students/${studentId}/finance`)}>
                                    Ver Detalhes
                                </Button>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>

            <StudentAgreementDialog
                studentId={studentId!}
                isOpen={isAgreementOpen}
                onClose={() => setIsAgreementOpen(false)}
                currentAgreement={agreement}
            />
        </div>
    );
};

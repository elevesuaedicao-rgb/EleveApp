import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, DollarSign, Clock, Users, Settings, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFinance } from '@/hooks/useFinance';
import { useTeacherStudents } from '@/hooks/useTeacherStudents';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const TeacherFinance = () => {
  const navigate = useNavigate();
  const { transactions, paymentInfo, updatePaymentInfo, isUpdatingPaymentInfo, stats, isLoading } = useFinance({ role: 'teacher' });
  const { students } = useTeacherStudents();
  const [showPixConfig, setShowPixConfig] = useState(false);
  const [pixForm, setPixForm] = useState({
    pix_key: paymentInfo?.pix_key || '',
    pix_key_type: paymentInfo?.pix_key_type || 'cpf',
    holder_name: paymentInfo?.holder_name || '',
    bank_name: paymentInfo?.bank_name || '',
  });

  // Generate monthly revenue data for chart (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthTransactions = transactions.filter(t => {
      const txDate = new Date(t.created_at);
      return t.type === 'payment' && 
             t.status === 'paid' && 
             txDate.getMonth() === date.getMonth() &&
             txDate.getFullYear() === date.getFullYear();
    });
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      revenue: monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  // Top students by revenue
  const studentRevenue = students.map(student => {
    const revenue = transactions
      .filter(t => t.student_id === student.student_id && t.status === 'paid')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return { ...student, revenue };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const handleSavePixInfo = async () => {
    try {
      await updatePaymentInfo({
        pix_key: pixForm.pix_key,
        pix_key_type: pixForm.pix_key_type as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
        holder_name: pixForm.holder_name,
        bank_name: pixForm.bank_name || null,
      });
      toast({ title: 'Dados PIX salvos com sucesso!' });
      setShowPixConfig(false);
    } catch {
      toast({ title: 'Erro ao salvar dados PIX', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/teacher')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
          </div>
          <Dialog open={showPixConfig} onOpenChange={setShowPixConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Config PIX
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Dados PIX</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Chave</Label>
                  <Select value={pixForm.pix_key_type} onValueChange={(v: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random') => setPixForm(f => ({ ...f, pix_key_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="random">Chave Aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX</Label>
                  <Input 
                    value={pixForm.pix_key} 
                    onChange={(e) => setPixForm(f => ({ ...f, pix_key: e.target.value }))}
                    placeholder="Sua chave PIX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nome do Titular</Label>
                  <Input 
                    value={pixForm.holder_name} 
                    onChange={(e) => setPixForm(f => ({ ...f, holder_name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banco (opcional)</Label>
                  <Input 
                    value={pixForm.bank_name} 
                    onChange={(e) => setPixForm(f => ({ ...f, bank_name: e.target.value }))}
                    placeholder="Nome do banco"
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSavePixInfo}
                  disabled={isUpdatingPaymentInfo || !pixForm.pix_key || !pixForm.holder_name}
                >
                  {isUpdatingPaymentInfo ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <DollarSign className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-80">Faturamento do Mês</p>
              <p className="text-2xl font-bold">R$ {stats.thisMonthRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-80">Total Recebido</p>
              <p className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-80">A Receber</p>
              <p className="text-2xl font-bold">R$ {stats.pendingAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm opacity-80">Alunos Ativos</p>
              <p className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Students */}
          <Card>
            <CardHeader>
              <CardTitle>Top Alunos (Faturamento)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {studentRevenue.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum dado disponível</p>
              ) : (
                studentRevenue.map((student, index) => (
                  <button
                    key={student.id}
                    onClick={() => navigate(`/teacher/students/${student.student_id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      {index + 1}º
                    </span>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={student.student.avatar_url || undefined} />
                      <AvatarFallback>
                        {student.student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{student.student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.student.grade_year}</p>
                    </div>
                    <p className="font-bold text-green-600">R$ {student.revenue.toFixed(2)}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma transação</p>
              ) : (
                transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">{tx.student?.full_name || 'Aluno'}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.description || (tx.type === 'class_fee' ? 'Aula' : tx.type === 'payment' ? 'Pagamento' : 'Ajuste')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'payment' ? 'text-green-600' : 'text-foreground'}`}>
                        {tx.type === 'payment' ? '+' : ''}R$ {Number(tx.amount).toFixed(2)}
                      </p>
                      <Badge variant={tx.status === 'paid' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                        {tx.status === 'paid' ? 'Pago' : tx.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* PIX Info Display */}
        {paymentInfo && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Seus Dados PIX
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Chave PIX</p>
                  <p className="font-mono font-medium">{paymentInfo.pix_key}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Titular</p>
                  <p className="font-medium">{paymentInfo.holder_name}</p>
                </div>
                {paymentInfo.bank_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Banco</p>
                    <p className="font-medium">{paymentInfo.bank_name}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherFinance;

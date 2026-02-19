import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Users, UserCheck, Clock, UserX, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTeacherStudents, TeacherStudent } from "@/hooks/useTeacherStudents";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type StudentStatus = 'active' | 'pending' | 'inactive';

const filterOptions = [
  { key: 'all', label: 'Todos', icon: Users, color: 'bg-primary' },
  { key: 'active', label: 'Ativos', icon: UserCheck, color: 'bg-green-600' },
  { key: 'pending', label: 'Pendentes', icon: Clock, color: 'bg-yellow-500' },
  { key: 'inactive', label: 'Inativos', icon: UserX, color: 'bg-red-500' },
] as const;

const getStatusColor = (status: StudentStatus) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'pending': return 'bg-yellow-500';
    case 'inactive': return 'bg-red-500';
  }
};

const getStatusLabel = (status: StudentStatus) => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'pending': return 'Pendente';
    case 'inactive': return 'Inativo';
  }
};

const getModeLabel = (mode: string) => {
  return mode === 'online' ? 'Online' : 'Presencial';
};

function StudentCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
}

export function TeacherStudents() {
  const navigate = useNavigate();
  const { students, isLoading, updateRelationship, isUpdating } = useTeacherStudents();
  const [filter, setFilter] = useState<'all' | StudentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredStudents = students.filter(rel => {
    const matchesFilter = filter === 'all' || rel.status === filter;
    const matchesSearch = 
      rel.student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rel.student.grade_year?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (rel.student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: students.length,
    active: students.filter(s => s.status === 'active').length,
    pending: students.filter(s => s.status === 'pending').length,
    inactive: students.filter(s => s.status === 'inactive').length,
  };

  const handleStatusChange = async (relationshipId: string, newStatus: StudentStatus) => {
    setUpdatingId(relationshipId);
    try {
      await updateRelationship({ id: relationshipId, status: newStatus });
      toast.success(`Status alterado para ${getStatusLabel(newStatus)}`);
    } catch (error) {
      toast.error('Erro ao alterar status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/teacher')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <h1 className="text-xl font-bold text-foreground">Meus Alunos</h1>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filter === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setFilter(option.key as 'all' | StudentStatus)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isActive 
                    ? `${option.color} text-white shadow-lg` 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-background'
                }`}>
                  {statusCounts[option.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Student List */}
      <div className="px-4 pb-24">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <StudentCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredStudents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Users className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum aluno encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou a busca</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredStudents.map((rel, index) => (
                  <motion.div
                    key={rel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between w-full group hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <button
                      onClick={() => navigate(`/teacher/students/${rel.student_id}`)}
                      className="flex items-center gap-4 flex-1 text-left"
                    >
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-background">
                          <AvatarImage src={rel.student.avatar_url || undefined} alt={rel.student.full_name} />
                          <AvatarFallback>
                            {rel.student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(rel.status)} border-2 border-card rounded-full`} />
                      </div>
                      
                      <div className="flex flex-col items-start">
                        <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                          {rel.student.full_name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          {rel.student.grade_year || 'Série não informada'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              rel.mode === 'online' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}
                          >
                            {getModeLabel(rel.mode)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] uppercase tracking-wide ${
                              rel.status === 'active' 
                                ? 'border-green-500/50 text-green-600 dark:text-green-400'
                                : rel.status === 'pending'
                                ? 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400'
                                : 'border-red-500/50 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {getStatusLabel(rel.status)}
                          </Badge>
                        </div>
                      </div>
                    </button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-full"
                          disabled={updatingId === rel.id || isUpdating}
                        >
                          {updatingId === rel.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <MoreVertical className="h-5 w-5" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(rel.id, 'active')}
                          disabled={rel.status === 'active'}
                          className="gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Ativo
                          {rel.status === 'active' && <span className="ml-auto text-xs text-muted-foreground">Atual</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(rel.id, 'pending')}
                          disabled={rel.status === 'pending'}
                          className="gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          Pendente
                          {rel.status === 'pending' && <span className="ml-auto text-xs text-muted-foreground">Atual</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(rel.id, 'inactive')}
                          disabled={rel.status === 'inactive'}
                          className="gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          Inativo
                          {rel.status === 'inactive' && <span className="ml-auto text-xs text-muted-foreground">Atual</span>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => navigate(`/teacher/students/${rel.student_id}`)}
                        >
                          Ver perfil completo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

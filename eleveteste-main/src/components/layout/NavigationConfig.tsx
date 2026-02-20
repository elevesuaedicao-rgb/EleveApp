import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  History, 
  MessageCircle, 
  Users, 
  Wallet, 
  ClipboardCheck, 
  FileText, 
  Library, 
  User,
  GraduationCap
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  student: [
    { label: 'Início', path: '/app/student', icon: <LayoutDashboard size={20} /> },
    { label: 'Agenda', path: '/app/student/booking', icon: <Calendar size={20} /> },
    { label: 'Conhecimento', path: '/app/student/knowledge', icon: <BookOpen size={20} /> },
    { label: 'Histórico', path: '/app/student/history', icon: <History size={20} /> },
    { label: 'Dúvidas', path: '/app/student/questions', icon: <MessageCircle size={20} /> },
  ],
  parent: [
    { label: 'Início', path: '/app/guardian', icon: <LayoutDashboard size={20} /> },
    { label: 'Alunos', path: '/app/guardian/students', icon: <GraduationCap size={20} /> },
    { label: 'Agenda', path: '/app/guardian/students/calendar', icon: <Calendar size={20} /> }, // Note: Adjusted path slightly if needed, kept generic
    { label: 'Financeiro', path: '/app/guardian/finance', icon: <Wallet size={20} /> },
    { label: 'Chat', path: '/app/guardian/chat', icon: <MessageCircle size={20} /> },
  ],
  teacher: [
    { label: 'Painel', path: '/teacher', icon: <LayoutDashboard size={20} /> },
    { label: 'Agenda', path: '/teacher/calendar', icon: <Calendar size={20} /> },
    { label: 'Alunos', path: '/teacher/students', icon: <Users size={20} /> },
    { label: 'Dúvidas', path: '/teacher/questions', icon: <MessageCircle size={20} /> },
    { label: 'Aprovações', path: '/teacher/approvals', icon: <ClipboardCheck size={20} /> },
  ],
};

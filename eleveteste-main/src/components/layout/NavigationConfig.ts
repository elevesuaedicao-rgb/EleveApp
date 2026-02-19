export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  student: [
    { label: 'Inicio', path: '/app/student', icon: 'I' },
    { label: 'Agenda', path: '/app/student/booking', icon: 'A' },
    { label: 'Conhecimento', path: '/app/student/knowledge', icon: 'K' },
    { label: 'Historico', path: '/app/student/history', icon: 'H' },
    { label: 'Chat', path: '/app/student/questions', icon: 'C' },
  ],
  parent: [
    { label: 'Agenda', path: '/app/guardian/students', icon: '??' },
    { label: 'Chat', path: '/app/guardian/chat', icon: '??' },
    { label: 'Inicio', path: '/app/guardian', icon: '??' },
    { label: 'Financeiro', path: '/app/guardian/finance', icon: '??' },
    { label: 'Alunos', path: '/app/guardian/students', icon: '????????' },
  ],
  teacher: [
    { label: 'Painel', path: '/teacher', icon: '??' },
    { label: 'Duvidas', path: '/teacher/questions', icon: '?' },
    { label: 'Agenda', path: '/teacher/calendar', icon: '??' },
    { label: 'Alunos', path: '/teacher/students', icon: '??' },
    { label: 'Aprovacoes', path: '/teacher/approvals', icon: '?' },
  ],
};

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  student: [
    { label: 'Dúvidas', path: '/student/questions', icon: '❓' },
    { label: 'Provas', path: '/student/exams', icon: '📝' },
    { label: 'Início', path: '/student', icon: '🏠' },
    { label: 'Agendar', path: '/student/booking', icon: '📅' },
    { label: 'Estudar', path: '/student/subjects', icon: '📚' },
  ],
  parent: [
    { label: 'Aulas', path: '/parent/classes', icon: '📅' },
    { label: 'Provas', path: '/parent/exams', icon: '📝' },
    { label: 'Início', path: '/parent', icon: '🏠' },
    { label: 'Financeiro', path: '/parent/finance', icon: '💲' },
    { label: 'Histórico', path: '/parent/history', icon: '📜' },
  ],
  teacher: [
    { label: 'Painel', path: '/teacher', icon: '📊' },
    { label: 'Dúvidas', path: '/teacher/questions', icon: '❓' },
    { label: 'Agenda', path: '/teacher/calendar', icon: '📅' },
    { label: 'Alunos', path: '/teacher/students', icon: '👥' },
    { label: 'Aprovações', path: '/teacher/approvals', icon: '✅' },
  ]
};

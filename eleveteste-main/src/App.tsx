import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { AuthProvider } from './hooks/useAuth';
import { AuthGuard } from './components/AuthGuard';
import { DevFloatingNavigator } from './components/dev/DevFloatingNavigator';
import { AppShell } from './components/layout/AppShell';
import { DashboardRouter } from './screens/DashboardRouter';
import { StudentDashboard } from './screens/student/StudentDashboard';
import { StudentBooking } from './screens/student/StudentBooking';
import { StudentExams } from './screens/student/StudentExams';
import { StudentHistory } from './screens/student/StudentHistory';
import { StudentQuestionsPage } from './screens/student/StudentQuestionsPage';
import { StudentSubjects } from './screens/student/StudentSubjects';
import { StudentSubjectTopics } from './screens/student/StudentSubjectTopics';
import { StudentTrainingWizard } from './screens/student/StudentTrainingWizard';
import { StudentTrainingSession } from './screens/student/StudentTrainingSession';
import { StudentProfile } from './screens/student/StudentProfile';
import { StudentLessonFocusPage } from './screens/student/StudentLessonFocusPage';
import { StudentKnowledgeHome } from './screens/student/knowledge/StudentKnowledgeHome';
import { StudentKnowledgeSubjects } from './screens/student/knowledge/StudentKnowledgeSubjects';
import { StudentKnowledgeSubjectDetail } from './screens/student/knowledge/StudentKnowledgeSubjectDetail';
import { StudentKnowledgeTracks } from './screens/student/knowledge/StudentKnowledgeTracks';
import { StudentKnowledgeTrackWizard } from './screens/student/knowledge/StudentKnowledgeTrackWizard';
import { StudentKnowledgeUnitPage } from './screens/student/knowledge/StudentKnowledgeUnitPage';
import { StudentKnowledgeSessionWizard } from './screens/student/knowledge/StudentKnowledgeSessionWizard';
import { StudentKnowledgeSessionPage } from './screens/student/knowledge/StudentKnowledgeSessionPage';
import { StudentKnowledgeMasteryPage } from './screens/student/knowledge/StudentKnowledgeMasteryPage';
import { StudentKnowledgeInsightsPage } from './screens/student/knowledge/StudentKnowledgeInsightsPage';
import { ParentProfilePage } from './screens/parent/ParentProfilePage';
import { TeacherDashboard } from './screens/teacher/TeacherDashboard';
import { TeacherApprovals } from './screens/teacher/TeacherApprovals';
import { TeacherCalendar } from './screens/teacher/TeacherCalendar';
import { TeacherProfile } from './screens/teacher/TeacherProfile';
import { TeacherStudents } from './screens/teacher/TeacherStudents';
import { TeacherStudentProfile } from './screens/teacher/TeacherStudentProfile';
import { TeacherFinance } from './screens/teacher/TeacherFinance';
import { TeacherQuestionsPage } from './screens/teacher/TeacherQuestionsPage';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import DevRoleSelect from './pages/DevRoleSelect';
import { StudentAnalytics } from './screens/teacher/StudentAnalytics';
import NotFound from './pages/NotFound';

import RoleSelect from './pages/onboarding/RoleSelect';
import StudentSchool from './pages/onboarding/StudentSchool';
import StudentGrade from './pages/onboarding/StudentGrade';
import StudentAge from './pages/onboarding/StudentAge';
import ParentChoice from './pages/onboarding/ParentChoice';
import ParentCode from './pages/onboarding/ParentCode';
import ParentComplete from './pages/onboarding/ParentComplete';
import TeacherComplete from './pages/onboarding/TeacherComplete';

import { GuardianLayout } from './screens/guardian/GuardianLayout';
import { GuardianDashboard } from './screens/guardian/GuardianDashboard';
import { GuardianStudentsPage } from './screens/guardian/GuardianStudentsPage';
import { GuardianStudentIndexRedirect } from './screens/guardian/GuardianStudentIndexRedirect';
import { GuardianCalendarPage } from './screens/guardian/GuardianCalendarPage';
import { GuardianLessonDetailPage } from './screens/guardian/GuardianLessonDetailPage';
import { GuardianBookingWizardPage } from './screens/guardian/GuardianBookingWizardPage';
import { GuardianWaitlistWizardPage } from './screens/guardian/GuardianWaitlistWizardPage';
import { GuardianRescheduleWizardPage } from './screens/guardian/GuardianRescheduleWizardPage';
import { GuardianCancelWizardPage } from './screens/guardian/GuardianCancelWizardPage';
import { GuardianConfirmationsWizardPage } from './screens/guardian/GuardianConfirmationsWizardPage';
import { GuardianProgressPage } from './screens/guardian/GuardianProgressPage';
import { GuardianFinancePage } from './screens/guardian/GuardianFinancePage';
import { GuardianInvoicesPage } from './screens/guardian/GuardianInvoicesPage';
import { GuardianInvoiceDetailPage } from './screens/guardian/GuardianInvoiceDetailPage';
import { GuardianPaymentsPage } from './screens/guardian/GuardianPaymentsPage';
import { GuardianChatPage, GuardianChatThreadPage } from './screens/guardian/GuardianChatPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ScheduleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <DevFloatingNavigator />
              <AuthGuard>
                <Routes>
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/login" element={<DevRoleSelect />} />
                  <Route path="/auth/login" element={<Login />} />

                  <Route path="/onboarding" element={<RoleSelect />} />
                  <Route path="/onboarding/student/school" element={<StudentSchool />} />
                  <Route path="/onboarding/student/grade" element={<StudentGrade />} />
                  <Route path="/onboarding/student/age" element={<StudentAge />} />
                  <Route path="/onboarding/parent/choice" element={<ParentChoice />} />
                  <Route path="/onboarding/parent/code" element={<ParentCode />} />
                  <Route path="/onboarding/parent/complete" element={<ParentComplete />} />
                  <Route path="/onboarding/teacher/complete" element={<TeacherComplete />} />

                  <Route element={<AppShell />}>
                    <Route path="/" element={<DashboardRouter />} />

                    <Route path="/app/student" element={<StudentDashboard />} />
                    <Route path="/app/student/booking" element={<StudentBooking />} />
                    <Route path="/app/student/exams" element={<StudentExams />} />
                    <Route path="/app/student/history" element={<StudentHistory />} />
                    <Route path="/app/student/questions" element={<StudentQuestionsPage />} />
                    <Route path="/app/student/profile" element={<StudentProfile />} />
                    <Route path="/app/student/lessons/:lessonId" element={<StudentLessonFocusPage />} />
                    <Route path="/app/student/knowledge" element={<StudentKnowledgeHome />} />
                    <Route path="/app/student/knowledge/subjects" element={<StudentKnowledgeSubjects />} />
                    <Route path="/app/student/knowledge/subjects/:subjectKey" element={<StudentKnowledgeSubjectDetail />} />
                    <Route path="/app/student/knowledge/tracks" element={<StudentKnowledgeTracks />} />
                    <Route path="/app/student/knowledge/tracks/new" element={<StudentKnowledgeTrackWizard />} />
                    <Route path="/app/student/knowledge/units/:unitId" element={<StudentKnowledgeUnitPage />} />
                    <Route path="/app/student/knowledge/sessions/new" element={<StudentKnowledgeSessionWizard />} />
                    <Route path="/app/student/knowledge/sessions/:sessionId" element={<StudentKnowledgeSessionPage />} />
                    <Route path="/app/student/knowledge/mastery/:unitId" element={<StudentKnowledgeMasteryPage />} />
                    <Route path="/app/student/knowledge/insights" element={<StudentKnowledgeInsightsPage />} />

                    <Route path="/student" element={<StudentDashboard />} />
                    <Route path="/student/booking" element={<StudentBooking />} />
                    <Route path="/student/exams" element={<StudentExams />} />
                    <Route path="/student/history" element={<StudentHistory />} />
                    <Route path="/student/questions" element={<StudentQuestionsPage />} />
                    <Route path="/student/subjects" element={<StudentSubjects />} />
                    <Route path="/student/subjects/:subjectId" element={<StudentSubjectTopics />} />
                    <Route path="/student/subjects/:subjectId/:topicId/wizard" element={<StudentTrainingWizard />} />
                    <Route path="/student/subjects/:subjectId/:topicId/train" element={<StudentTrainingSession />} />
                    <Route path="/student/profile" element={<StudentProfile />} />

                    <Route path="/app/guardian" element={<GuardianLayout />}>
                      <Route index element={<GuardianDashboard />} />
                      <Route path="students" element={<GuardianStudentsPage />} />
                      <Route path="students/:studentId" element={<GuardianStudentIndexRedirect />} />
                      <Route path="students/:studentId/calendar" element={<GuardianCalendarPage />} />
                      <Route path="students/:studentId/lessons/:lessonId" element={<GuardianLessonDetailPage />} />
                      <Route path="students/:studentId/booking/new" element={<GuardianBookingWizardPage />} />
                      <Route path="students/:studentId/booking/waitlist" element={<GuardianWaitlistWizardPage />} />
                      <Route path="students/:studentId/lessons/:lessonId/reschedule" element={<GuardianRescheduleWizardPage />} />
                      <Route path="students/:studentId/lessons/:lessonId/cancel" element={<GuardianCancelWizardPage />} />
                      <Route path="students/:studentId/booking/confirmations" element={<GuardianConfirmationsWizardPage />} />
                      <Route path="students/:studentId/progress" element={<GuardianProgressPage />} />
                      <Route path="finance" element={<GuardianFinancePage />} />
                      <Route path="finance/invoices" element={<GuardianInvoicesPage />} />
                      <Route path="finance/invoices/:invoiceId" element={<GuardianInvoiceDetailPage />} />
                      <Route path="finance/payments" element={<GuardianPaymentsPage />} />
                      <Route path="chat" element={<GuardianChatPage />} />
                      <Route path="chat/thread/:threadId" element={<GuardianChatThreadPage />} />
                    </Route>

                    <Route path="/parent" element={<Navigate to="/app/guardian" replace />} />
                    <Route path="/parent/classes" element={<Navigate to="/app/guardian" replace />} />
                    <Route path="/parent/exams" element={<Navigate to="/app/guardian" replace />} />
                    <Route path="/parent/finance" element={<Navigate to="/app/guardian/finance" replace />} />
                    <Route path="/parent/history" element={<Navigate to="/app/guardian" replace />} />
                    <Route path="/parent/profile" element={<Navigate to="/parent/profile-page" replace />} />
                    <Route path="/parent/profile-page" element={<ParentProfilePage />} />

                    <Route path="/teacher" element={<TeacherDashboard />} />
                    <Route path="/teacher/questions" element={<TeacherQuestionsPage />} />
                    <Route path="/teacher/calendar" element={<TeacherCalendar />} />
                    <Route path="/teacher/students" element={<TeacherStudents />} />
                    <Route path="/teacher/students/:studentId" element={<TeacherStudentProfile />} />
                    <Route path="/teacher/approvals" element={<TeacherApprovals />} />
                    <Route path="/teacher/finance" element={<TeacherFinance />} />
                    <Route path="/teacher/history" element={<TeacherDashboard />} />
                    <Route path="/teacher/notifications" element={<TeacherDashboard />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />} />
                    <Route path="/app/teacher/students/:studentId" element={<StudentAnalytics />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthGuard>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ScheduleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ScheduleProvider } from "./context/ScheduleContext";
import { AuthProvider } from "./hooks/useAuth";
import { AuthGuard } from "./components/AuthGuard";
import { AppShell } from "./components/layout/AppShell";
import { DashboardRouter } from "./screens/DashboardRouter";
import { StudentDashboard } from "./screens/student/StudentDashboard";
import { StudentBooking } from "./screens/student/StudentBooking";
import { StudentExams } from "./screens/student/StudentExams";
import { StudentHistory } from "./screens/student/StudentHistory";
import { StudentQuestionsPage } from "./screens/student/StudentQuestionsPage";
import { StudentSubjects } from "./screens/student/StudentSubjects";
import { StudentSubjectTopics } from "./screens/student/StudentSubjectTopics";
import { StudentTrainingWizard } from "./screens/student/StudentTrainingWizard";
import { StudentTrainingSession } from "./screens/student/StudentTrainingSession";
import { StudentProfile } from "./screens/student/StudentProfile";
import { ParentLayout } from "./screens/parent/ParentLayout";
import { ParentDashboard } from "./screens/parent/ParentDashboard";
import { ParentClasses } from "./screens/parent/ParentClasses";
import { ParentFinance } from "./screens/parent/ParentFinance";
import { ParentHistory } from "./screens/parent/ParentHistory";
import { ParentProfile } from "./screens/parent/ParentProfile";
import { ParentProfilePage } from "./screens/parent/ParentProfilePage";
import { TeacherDashboard } from "./screens/teacher/TeacherDashboard";
import { TeacherApprovals } from "./screens/teacher/TeacherApprovals";
import { TeacherCalendar } from "./screens/teacher/TeacherCalendar";
import { TeacherProfile } from "./screens/teacher/TeacherProfile";
import { TeacherStudents } from "./screens/teacher/TeacherStudents";
import { TeacherStudentProfile } from "./screens/teacher/TeacherStudentProfile";
import { TeacherFinance } from "./screens/teacher/TeacherFinance";
import { TeacherQuestionsPage } from "./screens/teacher/TeacherQuestionsPage";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Onboarding pages
import RoleSelect from "./pages/onboarding/RoleSelect";
import StudentSchool from "./pages/onboarding/StudentSchool";
import StudentGrade from "./pages/onboarding/StudentGrade";
import StudentAge from "./pages/onboarding/StudentAge";
import ParentChoice from "./pages/onboarding/ParentChoice";
import ParentCode from "./pages/onboarding/ParentCode";
import ParentComplete from "./pages/onboarding/ParentComplete";
import TeacherComplete from "./pages/onboarding/TeacherComplete";

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
              <AuthGuard>
                <Routes>
                {/* Public routes */}
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Onboarding routes */}
                  <Route path="/onboarding" element={<RoleSelect />} />
                  <Route path="/onboarding/student/school" element={<StudentSchool />} />
                  <Route path="/onboarding/student/grade" element={<StudentGrade />} />
                  <Route path="/onboarding/student/age" element={<StudentAge />} />
                  <Route path="/onboarding/parent/choice" element={<ParentChoice />} />
                  <Route path="/onboarding/parent/code" element={<ParentCode />} />
                  <Route path="/onboarding/parent/complete" element={<ParentComplete />} />
                  <Route path="/onboarding/teacher/complete" element={<TeacherComplete />} />
                  
                  {/* Protected routes with AppShell */}
                  <Route element={<AppShell />}>
                    <Route path="/" element={<DashboardRouter />} />
                    
                    {/* Student Routes */}
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
                    
                    {/* Parent Routes */}
                    <Route path="/parent" element={<ParentLayout />}>
                      <Route index element={<ParentDashboard />} />
                      <Route path="classes" element={<ParentClasses />} />
                      <Route path="exams" element={<ParentClasses />} />
                      <Route path="finance" element={<ParentFinance />} />
                      <Route path="history" element={<ParentHistory />} />
                      <Route path="profile" element={<ParentProfile />} />
                    </Route>
                    <Route path="/parent/profile-page" element={<ParentProfilePage />} />
                    
                    {/* Teacher Routes */}
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

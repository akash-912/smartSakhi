import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth.js';// Ensure this path is correct
// Ensure this path is correct
import ProtectedRoute from './components/ProtectedRoute.jsx';
// Page Imports
import { LoginPage } from './features/auth/components/LoginForm.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SyllabusPage } from './pages/SyllabusPage.jsx';
import { AIAssistant } from './features/ai-tutor/components/AIAssistant.jsx';
import { PlannerPage } from './features/exam-planner/components/PlannerPage.jsx';
import { AdminUploadPage } from './pages/AdminUploadPage.jsx';
// We extract the main content into a separate component so we can use React Router hooks (useLocation, useNavigate)
function AppContent() {
  const { user, logOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // --- MOCK DATA (We will replace this with Supabase data later) ---
  const [userBranch, setUserBranch] = useState('Computer Science Engineering');
  const [userSemester, setUserSemester] = useState(3);
  const [subjectsProgress] = useState([
    { name: 'Data Structures', progress: 65, totalTopics: 27, completedTopics: 18 },
    { name: 'DBMS', progress: 45, totalTopics: 18, completedTopics: 8 },
    { name: 'Operating Systems', progress: 80, totalTopics: 15, completedTopics: 12 },
    { name: 'Computer Networks', progress: 30, totalTopics: 21, completedTopics: 6 },
    { name: 'Software Engineering', progress: 55, totalTopics: 12, completedTopics: 7 },
    { name: 'Web Technologies', progress: 70, totalTopics: 20, completedTopics: 14 },
  ]);

  const overallProgress = Math.round(
    subjectsProgress.reduce((acc, subject) => acc + subject.progress, 0) / subjectsProgress.length
  );

  // --- AUTH & NAVIGATION LOGIC ---
  
  // Extract real user data from Supabase session
  const userName = user?.user_metadata?.full_name || 'Student';
  const userEmail = user?.email || '';

  // Map the current URL path to your Navbar's 'currentPage' prop
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/'); // Send back to login after logout
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Navbar only if logged in and NOT on the login page */}
      {user && location.pathname !== '/' && (
        <Navbar
          currentPage={currentPath}
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
          onLogout={handleLogout}
          userName={userName}
        />
      )}

      <Routes>
        {/* PUBLIC ROUTE: If logged in, redirect to dashboard. Otherwise, show login. */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        {/* Admin Routes */}
        <Route path="/admin/upload" element={<AdminUploadPage />} />

        {/* PROTECTED ROUTES */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard
                userName={userName}
                userBranch={userBranch}
                userSemester={userSemester}
                overallProgress={overallProgress}
                onNavigate={handleNavigate}
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage
                userName={userName}
                userEmail={userEmail}
                userBranch={userBranch}
                userSemester={userSemester}
                onBranchChange={setUserBranch}
                onSemesterChange={setUserSemester}
              />
            </ProtectedRoute>
          } 
        />
       
        <Route 
          path="/syllabus" 
          element={
            <ProtectedRoute>
              <SyllabusPage
                userBranch={userBranch}
                userSemester={userSemester}
                onSubjectSelect={(subject) => console.log('Selected subject:', subject)}
              />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/planner" 
          element={
            <ProtectedRoute>
              <PlannerPage userSemester={userSemester} />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/ai-assistant" 
          element={
            <ProtectedRoute>
              <AIAssistant />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route for bad URLs */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

// Wrap everything in the Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
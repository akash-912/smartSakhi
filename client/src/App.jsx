import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth.js';
import { supabase } from './lib/supabase'; 
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
import { UpdatePasswordPage } from './features/auth/components/UpdatePasswordPage.jsx';
import { PlannerSidebar } from './features/daily-planner/components/PlannerSidebar.jsx';

function AppContent() {
  const { user, logOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Initialize State from LocalStorage (Persist the lock across refreshes!)
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => {
    return localStorage.getItem('recovery_pending') === 'true';
  });

  const [userBranch, setUserBranch] = useState('Computer Science Engineering');
  const [userSemester, setUserSemester] = useState(3);
  //daily-task-tracker
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const togglePlanner = () => {
    setIsPlannerOpen(prev => !prev);
  };

  // --- RECOVERY MODE LISTENER ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      // A. LOCKDOWN: User clicked email link
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        localStorage.setItem('recovery_pending', 'true'); // Save the lock to disk
        navigate('/update-password'); 
      }
      
      // B. SAFETY CHECK: If user signs in normally, ensure lock is cleared
      // This handles the edge case where a user abandoned recovery previously
      else if (event === 'SIGNED_IN' && !session?.user?.user_metadata?.recovery_mode) {
         // We simply rely on the fact that if they logged in with a password, 
         // they aren't in the recovery flow.
      }
      
      // C. SIGN OUT: Reset state (Local storage is handled by the Update Page or manual logout)
      else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // --- USER DATA SYNC ---
  useEffect(() => {
    if (user?.user_metadata) {
      if (user.user_metadata.branch) setUserBranch(user.user_metadata.branch);
      if (user.user_metadata.semester) setUserSemester(Number(user.user_metadata.semester));
    }
  }, [user]);

  // Mock Data for Dashboard (Replace with real data later)
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

  const userName = user?.user_metadata?.full_name || 'Student';
  const userEmail = user?.email || '';
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  const handleNavigate = (page) => {
    // Block navigation if locked
    if (isRecoveryMode) return; 
    navigate(`/${page}`);
  };

  const handleLogout = async () => {
    // If they logout manually during recovery, clear the lock
    localStorage.removeItem('recovery_pending');
    await logOut();
    navigate('/'); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HIDE NAVBAR: If in recovery mode, NO navigation allowed */}
      {user && location.pathname !== '/' && !isRecoveryMode && (
        <Navbar
          currentPage={currentPath}
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
          onLogout={handleLogout}
          userName={userName}
          openPlanner={togglePlanner}
        />
      )}

      <PlannerSidebar isOpen={isPlannerOpen} />

      <Routes>
        {/* PUBLIC ROUTE */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        
        {/* RECOVERY ROUTE - The only allowed place when in recovery mode */}
        <Route 
          path="/update-password" 
          element={<UpdatePasswordPage />} 
        />
        
        {/* ADMIN ROUTE */}
        <Route path="/admin/upload" element={<AdminUploadPage />} />

        {/* --- PROTECTED ROUTES (LOCKED DOWN) --- */}
        {/* If isRecoveryMode is true, redirect ALL these to /update-password */}
        
        <Route 
          path="/dashboard" 
          element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <Dashboard
                  userName={userName}
                  userBranch={userBranch}
                  userSemester={userSemester}
                  overallProgress={overallProgress}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            )
          } 
        />

        <Route 
          path="/profile" 
          element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
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
            )
          } 
        />
       
        <Route 
          path="/syllabus" 
          element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <SyllabusPage
                  userBranch={userBranch}
                  userSemester={userSemester}
                  onSubjectSelect={(subject) => console.log('Selected subject:', subject)}
                />
              </ProtectedRoute>
            )
          } 
        />

        <Route 
          path="/planner" 
          element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <PlannerPage userSemester={userSemester} />
              </ProtectedRoute>
            )
          } 
        />

        <Route 
          path="/ai-assistant" 
          element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
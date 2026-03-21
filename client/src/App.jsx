import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './features/auth/hooks/useAuth.js';
import { supabase } from './lib/supabase'; 
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Page Imports
import { LoginPage } from './features/auth/components/LoginForm.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SyllabusPage } from './pages/SyllabusPage.jsx';
import { AIAssistant } from './features/ai-tutor/components/AIAssistant.jsx';
import { PlannerPage } from './features/exam-planner/components/PlannerPage.jsx';
import { AdminUploadPage } from './pages/AdminUploadPage.jsx';
import { UpdatePasswordPage } from './features/auth/components/UpdatePasswordPage.jsx';
import { PlannerSidebar } from './features/daily-planner/components/PlannerSidebar.jsx';
import { SafeSpacePage } from './features/community/components/SafeSpacePage.jsx';
import { MainLayout } from './components/layout/MainLayout.jsx';

function AppContent() {
  const { user, logOut, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize State
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => localStorage.getItem('recovery_pending') === 'true');
  const [userBranch, setUserBranch] = useState('Computer Science Engineering');
  const [userSemester, setUserSemester] = useState(3);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  
  const togglePlanner = () => setIsPlannerOpen(prev => !prev);

  // Recovery Mode Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        localStorage.setItem('recovery_pending', 'true');
        navigate('/update-password'); 
      } else if (event === 'SIGNED_OUT') {
        setIsRecoveryMode(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Sync User Data
  useEffect(() => {
    if (user?.user_metadata) {
      if (user.user_metadata.branch) setUserBranch(user.user_metadata.branch);
      if (user.user_metadata.semester) setUserSemester(Number(user.user_metadata.semester));
    }
  }, [user]);

  const userName = user?.user_metadata?.full_name || 'Student';
  const userEmail = user?.email || '';
  
  // Get the current page from the URL (e.g., "/dashboard" becomes "dashboard")
  const currentPage = location.pathname.replace('/', '') || 'dashboard';

  const handleNavigate = (page) => {
    if (isRecoveryMode) return; 
    navigate(`/${page}`);
    setIsPlannerOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('recovery_pending');
    await logOut();
    navigate('/'); 
  };

  // 1. SHOW SPINNER WHILE SUPABASE CHECKS SESSION
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center z-50">
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. IF TRULY NOT LOGGED IN, LOCK THEM TO THE LOGIN PAGE
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 3. IF LOGGED IN, BUT SITTING ON "/", REDIRECT TO DASHBOARD
  if (user && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }
  

  // If user IS logged in, wrap the app in the MainLayout (Sidebars + Dark Mode)
  return (
    <>
      <MainLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={!!user}
        onLogout={handleLogout}
        userName={userName}
        openPlanner={togglePlanner}
        isRecoveryMode={isRecoveryMode} // Pass this so layout hides sidebar during recovery
      >
        <Routes>
          <Route path="/admin/upload" element={<AdminUploadPage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />

          {/* PROTECTED ROUTES */}
          <Route path="/dashboard" element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <Dashboard 
                  userName={userName} 
                  userBranch={userBranch} 
                  userSemester={userSemester} 
                  onNavigate={handleNavigate} 
                  openPlanner={togglePlanner} /* <--- ADD THIS LINE */
                />
              </ProtectedRoute>
            )
          } />

          <Route path="/profile" element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <ProfilePage userName={userName} userEmail={userEmail} userBranch={userBranch} userSemester={userSemester} onBranchChange={setUserBranch} onSemesterChange={setUserSemester} onNavigate={handleNavigate} />
              </ProtectedRoute>
            )
          } />
         
          <Route path="/syllabus" element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <SyllabusPage userBranch={userBranch} userSemester={userSemester} onNavigate={handleNavigate} />
              </ProtectedRoute>
            )
          } />

          <Route path="/planner" element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <PlannerPage userBranch={userBranch} userSemester={userSemester} onNavigate={handleNavigate} />
              </ProtectedRoute>
            )
          } />

          <Route path="/ai-assistant" element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <AIAssistant userBranch={userBranch} userSemester={userSemester} onNavigate={handleNavigate} />
              </ProtectedRoute>
            )
          } />

          <Route path="/safe-space" element={
            isRecoveryMode ? <Navigate to="/update-password" replace /> : (
              <ProtectedRoute>
                <SafeSpacePage userName={userName} />
              </ProtectedRoute>
            )
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>

      {/* The slide-out planner panel */}
      <PlannerSidebar 
        isOpen={isPlannerOpen} 
        onClose={() => setIsPlannerOpen(false)} 
      />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
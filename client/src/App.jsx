// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App



import { useState } from 'react';
import { LoginPage } from './features/auth/components/LoginForm.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SyllabusPage } from './pages/SyllabusPage.jsx';
import { AIAssistant } from './features/ai-tutor/components/AIAssistant.jsx';
import { PlannerPage } from './features/exam-planner/components/PlannerPage.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBranch, setUserBranch] = useState('Computer Science Engineering');
  const [userSemester, setUserSemester] = useState(3);

  // Mock subject progress data
  const [subjectsProgress] = useState([
    {
      name: 'Data Structures',
      progress: 65,
      totalTopics: 27,
      completedTopics: 18,
    },
    {
      name: 'DBMS',
      progress: 45,
      totalTopics: 18,
      completedTopics: 8,
    },
    {
      name: 'Operating Systems',
      progress: 80,
      totalTopics: 15,
      completedTopics: 12,
    },
    {
      name: 'Computer Networks',
      progress: 30,
      totalTopics: 21,
      completedTopics: 6,
    },
    {
      name: 'Software Engineering',
      progress: 55,
      totalTopics: 12,
      completedTopics: 7,
    },
    {
      name: 'Web Technologies',
      progress: 70,
      totalTopics: 20,
      completedTopics: 14,
    },
  ]);

  const overallProgress = Math.round(
    subjectsProgress.reduce((acc, subject) => acc + subject.progress, 0) / subjectsProgress.length
  );

  const handleLogin = (name, email) => {
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleBranchChange = (branch) => {
    setUserBranch(branch);
  };

  const handleSemesterChange = (semester) => {
    setUserSemester(semester);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        userName={userName}
      />

      {currentPage === 'dashboard' && (
        <Dashboard
          userName={userName}
          userBranch={userBranch}
          userSemester={userSemester}
          overallProgress={overallProgress}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          userName={userName}
          userEmail={userEmail}
          userBranch={userBranch}
          userSemester={userSemester}
          onBranchChange={handleBranchChange}
          onSemesterChange={handleSemesterChange}
          subjectsProgress={subjectsProgress}
        />
      )}

      {currentPage === 'syllabus' && (
        <SyllabusPage
          userBranch={userBranch}
          userSemester={userSemester}
          onSubjectSelect={(subject) => console.log('Selected subject:', subject)}
        />
      )}

      {currentPage === 'planner' && (
        <PlannerPage
          userSemester={userSemester}
        />
      )}

      {currentPage === 'ai-assistant' && (<AIAssistant />)}
    </div>
  );
}

export default App;

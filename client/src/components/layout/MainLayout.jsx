
import { Navbar } from "./Navbar.jsx";
import { Sidebar } from "./Sidebar.jsx";
export function MainLayout({ children, currentPage, onNavigate, isLoggedIn, onLogout, userName, openPlanner, isRecoveryMode }) {
  
  // If in recovery mode, show the content (the update password form) but hide the navigation menus!
  if (isRecoveryMode) {
    return <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex font-sans">
      
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        onLogout={onLogout} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <Navbar 
          currentPage={currentPage} 
          onNavigate={onNavigate} 
          isLoggedIn={isLoggedIn} 
          onLogout={onLogout} 
          userName={userName} 
          openPlanner={openPlanner} 
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
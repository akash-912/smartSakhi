import { LogOut, User, BookOpen, Brain, Home, CalendarDays, Menu, Heart } from 'lucide-react';
import { usePlanner } from "../../features/daily-planner/context/PlannerContext.jsx";

export function Navbar({ currentPage, onNavigate, isLoggedIn, onLogout, userName, openPlanner }) {
  if (!isLoggedIn) return null;
  const { completedTasks, totalTasks, streak } = usePlanner();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', Icon: Home },
    { key: 'syllabus', label: 'Syllabus', Icon: BookOpen },
    { key: 'planner', label: 'Planner', Icon: CalendarDays },
    { key: 'ai-assistant', label: 'AI Tutor', Icon: Brain },
    { key: 'profile', label: 'Profile', Icon: User },
    { key: 'safe-space', label: 'Safe Space', Icon: Heart },
  ];

  // The 'md:hidden' class makes this entirely disappear on desktop!
  return (
    <nav className="md:hidden bg-[#0a0a0a]/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50 shadow-sm font-sans">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm">
              E
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">EduTrack</h1>
          </div>
          
          {/* Mobile Hamburger Menu */}
          <details className="relative group">
            <summary className="list-none cursor-pointer flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 bg-[#121212] text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors appearance-none marker:hidden">
              <Menu className="w-5 h-5" />
            </summary>
            
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-[#121212] shadow-2xl shadow-black p-2 z-50">
              <div className="px-3 py-2">
                <div className="text-xs text-zinc-500">Signed in as</div>
                <div className="font-semibold text-zinc-100 truncate">{userName}</div>
              </div>

              <div className="h-px bg-zinc-800 my-2" />

              <button
                onClick={(e) => {
                  openPlanner();
                  e.currentTarget.closest('details').removeAttribute('open');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors flex items-center justify-between"
              >
                <div className="text-sm font-medium text-zinc-300">Daily planner</div>
                <div className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md text-zinc-400">
                  <span className="text-orange-500">🔥{streak}</span> · {completedTasks}/{totalTasks}
                </div>
              </button>

              <div className="h-px bg-zinc-800 my-2" />

              <div className="space-y-1">
                {navItems.map(({ key, label, Icon }) => {
                  const isActive = currentPage === key;
                  return (
                    <button
                      key={key}
                      onClick={(e) => {
                        onNavigate(key);
                        e.currentTarget.closest('details').removeAttribute('open');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-teal-500/10 text-teal-400' 
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-zinc-800 my-2" />

              <button 
                onClick={(e) => {
                  onLogout();
                  e.currentTarget.closest('details').removeAttribute('open');
                }} 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </details>

        </div>
      </div>
    </nav>
  );
}
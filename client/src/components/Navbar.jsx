import { LogOut, User, BookOpen, Brain, Home, CalendarDays } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { usePlanner } from "../features/daily-planner/context/PlannerContext.jsx";


export function Navbar({ currentPage, onNavigate, isLoggedIn, onLogout, userName, openPlanner }) {
  if (!isLoggedIn) return null;
  const { theme, toggleTheme } = useTheme();
  const { completedTasks, totalTasks, streak } = usePlanner();
  return (
    <nav className="bg-background border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-foreground">EduTrack</h1>
            <div className="hidden md:flex gap-1">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => onNavigate('dashboard')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'syllabus' ? 'default' : 'ghost'}
                onClick={() => onNavigate('syllabus')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Syllabus
              </Button>
              <Button
                variant={currentPage === 'planner' ? 'default' : 'ghost'}
                onClick={() => onNavigate('planner')}
                className="gap-2"
              >
                <CalendarDays className="w-4 h-4" />
                Planner
              </Button>
              <Button
                variant={currentPage === 'ai-assistant' ? 'default' : 'ghost'}
                onClick={() => onNavigate('ai-assistant')}
                className="gap-2"
              >
                <Brain className="w-4 h-4" />
                AI Assistant
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                onClick={() => onNavigate('profile')}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-muted text-foreground transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>          
            <span className="hidden sm:block text-sm text-foreground">
              Welcome, <span className="font-semibold">{userName}</span>
            </span>
            <button onClick={openPlanner}>
            🔥{streak} 📅({completedTasks}/{totalTasks})
            </button>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

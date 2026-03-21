import { useState } from 'react';
import { 
  Home, BookOpen, CalendarDays, Brain, User, 
  LogOut, Heart, GalleryVerticalEnd
} from 'lucide-react';

export function Sidebar({ currentPage, onNavigate, onLogout }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Home', Icon: Home },
    { key: 'syllabus', label: 'Syllabus', Icon: BookOpen },
    { key: 'planner', label: 'Planner', Icon: CalendarDays },
    { key: 'ai-assistant', label: 'AI Tutor', Icon: Brain },
    { key: 'safe-space', label: 'Safe Space', Icon: Heart },
  ];

  return (
    <div 
      className={`border-r border-zinc-800/60 hidden md:flex flex-col bg-[#0a0a0a] h-screen sticky top-0 transition-all duration-300 ease-in-out z-40 shrink-0 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      
      {/* Top Menu / Toggle Icon */}
      <div className={`mt-6 mb-6 flex items-center w-full ${isExpanded ? 'px-6 justify-between' : 'justify-center'}`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white transition-colors focus:outline-none"
        >
          <GalleryVerticalEnd size={26} strokeWidth={1.5} />
        </button>
        
        {/* RetroPrep Text with Teal/Emerald Gradient */}
        <div className={`font-bold font-sans text-xl tracking-tight overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
          <span className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
            RetroPrep
          </span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className={`flex flex-col gap-4 flex-1 w-full mt-6 ${isExpanded ? 'px-4' : 'items-center'}`}>
        {navItems.map(({ key, label, Icon }) => {
          const isActive = currentPage === key;
          
          return (
            <button 
              key={key}
              onClick={() => onNavigate(key)} 
              title={!isExpanded ? label : ''}
              className={`flex items-center transition-all duration-300 ${
                isExpanded 
                  ? `px-4 py-3 w-full gap-3 font-medium ${isActive ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white rounded-xl shadow-[0_4px_15px_rgba(20,184,166,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-xl'}` 
                  : `justify-center w-12 h-12 mx-auto ${isActive ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white rounded-2xl shadow-[0_0_15px_rgba(20,184,166,0.4)] scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-full'}`
              }`}
            >
              <Icon 
                size={isActive ? 22 : 24} 
                className="shrink-0" 
                fill={isActive ? "currentColor" : "none"} 
                strokeWidth={isActive ? 0 : 1.5} 
              />
              
              {isExpanded && (
                <span className="text-sm whitespace-nowrap drop-shadow-sm">
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions (Profile & Logout) */}
      <div className={`mt-auto mb-6 flex flex-col gap-4 w-full ${isExpanded ? 'px-4' : 'items-center'}`}>
        
        {/* Profile */}
        <button 
          onClick={() => onNavigate('profile')} 
          title="Profile"
          className={`flex items-center transition-all duration-300 ${
            isExpanded 
              ? 'px-4 py-3 w-full gap-3 bg-[#121212] border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-300' 
              : 'justify-center w-12 h-12 mx-auto rounded-full border bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:text-white text-zinc-400'
          } ${
            currentPage === 'profile' && !isExpanded ? 'border-teal-500/50 bg-teal-500/10 text-teal-400' : ''
          }`} 
        >
          <User size={20} className="shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Profile</span>}
        </button>
        
        {/* Logout */}
        <button 
          onClick={onLogout} 
          title="Logout"
          className={`flex items-center transition-all duration-300 text-rose-400 ${
            isExpanded 
              ? 'px-4 py-3 w-full gap-3 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 rounded-xl' 
              : 'justify-center w-12 h-12 mx-auto rounded-full border bg-rose-500/10 border-rose-500/20 hover:bg-rose-500 hover:text-white'
          }`} 
        >
          <LogOut size={20} className="shrink-0" strokeWidth={1.5} />
          {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Logout</span>}
        </button>

      </div>
    </div>
  );
}
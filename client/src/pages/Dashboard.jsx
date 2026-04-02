import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useSyllabus } from '../features/syllabus/api/useSyllabus';
import { useProgress } from '../features/syllabus/api/useProgress';
import { usePlanner } from '../features/exam-planner/api/usePlanner';
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { 
  BookOpen, MoreVertical, Code2, Database, Layout, Cpu, 
  Target, CalendarDays, Brain, Youtube, Flame
} from 'lucide-react';
import TerminalGame from '../features/community/components/TerminalGame.jsx';
const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const cardStyles = [
  { gradient: 'from-teal-400 to-emerald-600', icon: Code2 },
  { gradient: 'from-amber-200 to-amber-500', icon: Layout },
  { gradient: 'from-indigo-500 to-blue-600', icon: Database },
  { gradient: 'from-purple-500 to-pink-600', icon: Cpu },
  { gradient: 'from-rose-400 to-red-600', icon: BookOpen },
];

export function Dashboard({ userName, userBranch, userSemester, onNavigate,openPlanner }) {
  const { user } = useAuth();
  const { syllabus, loading: loadingSyllabus } = useSyllabus(userBranch, userSemester);
  const { completedTopics } = useProgress();
  const { plannedTopics } = usePlanner('Mid-Sem 1'); 
  const [recentActivities, setRecentActivities] = useState([]);

  let totalTopicsCount = 0;
  const allTopicsMap = {}; 

  if (syllabus) {
    syllabus.forEach(subject => {
      subject.units.forEach(unit => {
        unit.topics.forEach(topic => {
          totalTopicsCount++;
          allTopicsMap[topic.id] = {
            topicName: topic.title,
            subjectName: subject.name,
            unitName: `Unit ${unit.unit_number}`
          };
        });
      });
    });
  }

  const subjectsCount = syllabus ? syllabus.length : 0;
  const completedCount = completedTopics.size;
  const overallProgress = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;
  const [showTerminal, setShowTerminal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Listen for Ctrl + Shift + K
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_progress')
        .select('topic_id, completed_at')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(4);

      if (!error && data) setRecentActivities(data);
    };
    fetchRecentActivity();
  }, [user, completedTopics]);

  const upcomingTopics = Array.from(plannedTopics)
    .filter(id => !completedTopics.has(id)) 
    .slice(0, 3) 
    .map(id => allTopicsMap[id])
    .filter(Boolean); 

  if (loadingSyllabus) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row w-full">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 lg:p-10 pb-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-1 text-white tracking-tight">Welcome back, {userName}</h1>
            <p className="text-sm text-zinc-400">{userBranch} • Semester {userSemester}</p>
          </div>
          
          {/* Featured Subjects */}
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[18px] font-bold text-white">Your Subjects</h2>
            <BookOpen size={16} className="text-zinc-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {syllabus?.slice(0, 4).map((subject, index) => {
              const style = cardStyles[index % cardStyles.length];
              const Icon = style.icon;
              return (
                <div 
                  key={subject.id} 
                  onClick={() => onNavigate('syllabus')}
                  className="bg-[#18181b] rounded-[2rem] p-2 flex flex-col items-center justify-between h-48 cursor-pointer group hover:bg-[#27272a] transition-colors border border-zinc-800/60 shadow-lg shadow-black/20"
                >
                  <div className={`w-full h-[65%] rounded-3xl bg-gradient-to-br ${style.gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <Icon size={42} className="text-white drop-shadow-md z-10 opacity-90 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <span className="font-bold text-[15px] mb-3 text-zinc-300 group-hover:text-white text-center px-2 truncate w-full">{subject.name}</span>
                </div>
              );
            })}
          </div>

          {/* Upcoming Planner */}
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[18px] font-bold text-white">Up Next for {userSemester >3? userSemester + "th": (userSemester==='1'? "1st": (userSemester==='2'? '2nd':(userSemester==='3'? '3rd': "")))} Sem</h2>
            <Target size={16} className="text-zinc-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {upcomingTopics.length > 0 ? (
              upcomingTopics.map((topic, index) => (
                <div key={index} className="bg-[#121212] border border-zinc-800/80 rounded-[1.5rem] p-5 hover:border-zinc-700 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[15px] text-zinc-100 line-clamp-1">{topic.topicName}</h3>
                  </div>
                  <p className="text-[13px] text-zinc-500 mb-6 line-clamp-1">{topic.subjectName} • {topic.unitName}</p>
                  <div className="mt-auto">
                    <button 
                      onClick={() => onNavigate('syllabus')}
                      className="w-full py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all font-medium text-sm flex items-center justify-center gap-2"
                    >
                      Start Learning
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 border border-dashed border-zinc-800 rounded-[1.5rem] text-center">
                <p className="text-zinc-500 text-sm">No planned topics remaining. You are all caught up!</p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[18px] font-bold text-white">Recent Activity</h2>
            <CalendarDays size={16} className="text-zinc-500" />
          </div>

          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const details = allTopicsMap[activity.topic_id];
                if (!details) return null;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#18181b] rounded-2xl border border-zinc-800/60 hover:bg-[#1f1f22] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <Code2 size={16} className="text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-200 line-clamp-1">{details.topicName}</p>
                        <p className="text-xs text-zinc-500">{details.subjectName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-full">{getRelativeTime(activity.completed_at)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-600">No activity yet. Start studying to build your streak!</p>
            )}
          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR (Stats & Motivation) */}
      <div className="w-[340px] border-l border-zinc-800/60 p-6 hidden xl:block bg-[#0f0f0f] shrink-0">
        <div className="sticky top-6">
          <button 
            onClick={openPlanner}
            className="w-full flex items-center justify-between bg-gradient-to-r from-teal-500/10 to-emerald-500/10 hover:from-teal-500/20 hover:to-emerald-500/20 border border-teal-500/30 rounded-[1.5rem] px-5 py-4 mb-4 transition-all group shadow-[0_0_15px_rgba(20,184,166,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg group-hover:scale-110 transition-transform">
                <CalendarDays size={18} />
              </div>
              <span className="text-sm font-bold text-teal-400 group-hover:text-teal-300 transition-colors">Daily Planner</span>
            </div>
            <div className="bg-[#0a0a0a] px-3 py-1 rounded-md border border-teal-500/20 text-[10px] uppercase tracking-wider font-bold text-teal-500">
              Open
            </div>
          </button>
          <div className="bg-[#18181b] border border-zinc-800/80 rounded-[1.5rem] p-6 mb-4 shadow-lg shadow-black/20">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-xs tracking-wider uppercase text-zinc-300 bg-zinc-800/80 px-3 py-1.5 rounded-full">Overview</span>
              {/* <MoreVertical size={16} className="text-zinc-500" /> */}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 bg-[#0a0a0a] rounded-full p-2 border border-zinc-800 shadow-inner">
                <CircularProgress percentage={overallProgress} size={85} strokeWidth={8} />
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                    <span className="text-zinc-400">Completed</span>
                  </div>
                  <span className="text-zinc-200 font-semibold">{completedCount}<span className="text-zinc-600 font-normal">/{totalTopicsCount}</span></span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                    <span className="text-zinc-400">Subjects</span>
                  </div>
                  <span className="text-zinc-200 font-semibold">{subjectsCount}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>
                    <span className="text-zinc-400">Streak</span>
                  </div>
                  <span className="text-zinc-200 font-semibold">{completedCount > 0 ? '1' : '0'} <span className="text-zinc-600 font-normal">days</span></span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('syllabus')}
            className="w-full flex items-center justify-between bg-gradient-to-r from-[#18181b] to-[#1f1f22] hover:to-[#27272a] border border-zinc-800/80 rounded-2xl px-5 py-4 mb-4 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg group-hover:scale-110 transition-transform">
                <Youtube size={18} />
              </div>
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Video Lectures</span>
            </div>
          </button>

          <div className="relative bg-gradient-to-br from-zinc-800 to-black border border-zinc-800/80 rounded-[1.5rem] p-6 h-64 overflow-hidden mb-4 group cursor-pointer shadow-lg shadow-black/40">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay group-hover:opacity-30 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
            
            <div className="relative z-10 h-full flex flex-col justify-end">
              <Flame className="w-6 h-6 text-orange-500 mb-3 opacity-80" />
              <h3 className="text-lg font-bold text-zinc-100 leading-snug mb-2">
                Don't cry in a corner if you want something, mehnat kar, best ban aur <span className="text-black bg-white px-1 mt-1 inline-block">cheen le</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
      {showTerminal && <TerminalGame onClose={() => setShowTerminal(false)} />}
    </div>
  );
}
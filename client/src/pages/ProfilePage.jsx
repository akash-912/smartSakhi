import React, { useState, useEffect } from 'react';
import { useSyllabus } from '../features/syllabus/api/useSyllabus'; 
import { useProgress } from '../features/syllabus/api/useProgress'; 
import { useBranches } from '../features/syllabus/hooks/useBranches'; 
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { User, Mail, GraduationCap, Calendar, Award, Book, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx';
import { supabase } from '../lib/supabase';
import StudyHeatmap from '../components/ui/StudyHeatmap.jsx';// Adjust this path if needed!

export function ProfilePage({ userName, userEmail, userBranch, userSemester, onBranchChange, onSemesterChange }) {
  const { branches, loading: loadingBranches } = useBranches();
  const { syllabus, loading } = useSyllabus(userBranch, userSemester);
  const { completedTopics } = useProgress();

  // --- NEW STATE FOR HEATMAP ---
  const [heatmapData, setHeatmapData] = useState([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);

  // --- NEW DATA FETCHING LOGIC FOR HEATMAP ---
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Note: Change 'user_progress' to your actual table name that tracks completed topics
        // Note: Change 'completed_at' to the timestamp column name
        const { data, error } = await supabase
          .from('user_progress') 
          .select('completed_at')
          .eq('user_id', user.id);

        if (error) throw error;

        if (data) {
          const activityCounts = data.reduce((acc, row) => {
            if (!row.completed_at) return acc;
            const dateOnly = row.completed_at.split('T')[0]; // Extract YYYY-MM-DD
            acc[dateOnly] = (acc[dateOnly] || 0) + 1;
            return acc;
          }, {});

          const formattedData = Object.keys(activityCounts).map(date => ({
            date: date,
            count: activityCounts[date]
          }));
          
          setHeatmapData(formattedData);
        }
      } catch (err) {
        console.error("Error fetching heatmap data:", err);
      } finally {
        setLoadingHeatmap(false);
      }
    };

    fetchActivity();
  }, []);

  let totalTopicsGlobal = 0;
  let completedTopicsGlobal = 0;
  let subjectsCompletedCount = 0;

  const dynamicSubjectsProgress = syllabus ? syllabus.map(subject => {
    let subjectTotalTopics = 0;
    let subjectCompletedTopics = 0;

    subject.units.forEach(unit => {
      unit.topics.forEach(topic => {
        subjectTotalTopics++;
        totalTopicsGlobal++;
        if (completedTopics.has(topic.id)) {
          subjectCompletedTopics++;
          completedTopicsGlobal++;
        }
      });
    });

    const progressPercentage = subjectTotalTopics > 0 
      ? Math.round((subjectCompletedTopics / subjectTotalTopics) * 100) 
      : 0;

    if (progressPercentage === 100 && subjectTotalTopics > 0) subjectsCompletedCount++;

    return { name: subject.name, totalTopics: subjectTotalTopics, completedTopics: subjectCompletedTopics, progress: progressPercentage };
  }) : [];

  const overallProgress = totalTopicsGlobal > 0 ? Math.round((completedTopicsGlobal / totalTopicsGlobal) * 100) : 0;
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  if (loading || loadingBranches) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const handleBranchUpdate = async (newBranch) => {
    onBranchChange(newBranch); 
    await supabase.auth.updateUser({ data: { branch: newBranch } }); 
  };

  const handleSemesterUpdate = async (newSem) => {
    onSemesterChange(newSem); 
    await supabase.auth.updateUser({ data: { semester: newSem } }); 
  };

  return (
    <div className="pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Profile Header */}
        <div className="p-8 mb-8 bg-[#121212] border border-zinc-800/60 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-purple-500/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-28 h-28 bg-[#18181b] border border-zinc-700/50 rounded-full flex items-center justify-center text-zinc-400 shadow-inner">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{userName}</h1>
              <div className="flex flex-col sm:flex-row gap-4 mt-3 text-zinc-400">
                <div className="flex items-center gap-2 justify-center md:justify-start bg-[#0a0a0a] px-3 py-1.5 rounded-full border border-zinc-800/50"><Mail className="w-4 h-4 text-teal-500" /><span className="text-xs">{userEmail}</span></div>
                <div className="flex items-center gap-2 justify-center md:justify-start bg-[#0a0a0a] px-3 py-1.5 rounded-full border border-zinc-800/50"><GraduationCap className="w-4 h-4 text-teal-500" /><span className="text-xs">{userBranch}</span></div>
                <div className="flex items-center gap-2 justify-center md:justify-start bg-[#0a0a0a] px-3 py-1.5 rounded-full border border-zinc-800/50"><Calendar className="w-4 h-4 text-teal-500" /><span className="text-xs">Semester {userSemester}</span></div>
              </div>
            </div>
            <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80 shadow-inner">
              <CircularProgress percentage={overallProgress} size={100} strokeWidth={8} />
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-8 mb-10 shadow-lg">
          <h2 className="text-[18px] font-bold text-white mb-6 flex items-center gap-2">
            <Book className="w-5 h-5 text-teal-500" />
            Academic Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Select Branch</label>
              <Select value={userBranch} onValueChange={handleBranchUpdate}>
                <SelectTrigger className="bg-[#0a0a0a] text-zinc-100 border-zinc-800/80 h-12 rounded-xl focus:ring-teal-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-100">
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Select Semester</label>
              <Select value={userSemester.toString()} onValueChange={(val) => handleSemesterUpdate(Number(val))}>
                <SelectTrigger className="bg-[#0a0a0a] text-zinc-100 border-zinc-800/80 h-12 rounded-xl focus:ring-teal-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#18181b] border-zinc-800 text-zinc-100">
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()} className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* NEW: Heatmap Consistency Graph Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-teal-500" />
            <h2 className="text-[18px] font-bold text-white">Consistency Graph</h2>
          </div>
          {loadingHeatmap ? (
            <div className="p-8 text-center text-zinc-500 border border-zinc-800/60 bg-[#18181b] rounded-[1.5rem] shadow-lg">
              <div className="animate-pulse">Loading your consistency data...</div>
            </div>
          ) : (
            <StudyHeatmap data={heatmapData} />
          )}
        </div>

        {/* Progress Section */}
        <div className="mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-500" />
          <h2 className="text-[18px] font-bold text-white">Subject-wise Progress</h2>
        </div>

        {dynamicSubjectsProgress.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {dynamicSubjectsProgress.map((subject, index) => (
              <div key={index} className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 hover:bg-[#1f1f22] transition-colors group shadow-lg">
                <div className="flex flex-col items-center">
                  <h3 className="text-[15px] font-bold text-zinc-100 text-center mb-6 h-10 flex items-center justify-center line-clamp-2">
                    {subject.name}
                  </h3>
                  <div className="bg-[#0a0a0a] p-2 rounded-full border border-zinc-800/50 shadow-inner group-hover:border-teal-500/30 transition-colors">
                     <CircularProgress percentage={subject.progress} size={110} strokeWidth={8} />
                  </div>
                  <div className="mt-8 w-full space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Completed Topics</span>
                      <span className="font-semibold text-zinc-300">{subject.completedTopics} <span className="text-zinc-600 font-normal">/ {subject.totalTopics}</span></span>
                    </div>
                    <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden border border-zinc-800">
                      <div className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" style={{ width: `${subject.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-[2rem]">
             No subjects found for this combination.
           </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { useSyllabus } from '../features/syllabus/api/useSyllabus'; 
import { useProgress } from '../features/syllabus/api/useProgress';
import { useBranches } from '../features/syllabus/hooks/useBranches'; 
import { BookOpen, CheckCircle, Circle, Youtube, Layers, FileText, Download, BookMarked } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordian.jsx';

export function SyllabusPage({ userBranch, userSemester }) {
  const { branches, loading: loadingBranches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState(userBranch || 'Computer Science Engineering');
  const [selectedSemester, setSelectedSemester] = useState(userSemester || 3);
  const [materials, setMaterials] = useState([]);

  const { syllabus, loading: loadingSyllabus, error } = useSyllabus(selectedBranch, selectedSemester);
  const { completedTopics, toggleTopic } = useProgress();

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase.from('study_materials').select('*').eq('branch', selectedBranch).eq('semester', selectedSemester);
      if (!error && data) setMaterials(data);
    };
    fetchMaterials();
  }, [selectedBranch, selectedSemester]);

  const handleTopicToggle = async (topicId) => {
    const isCompleted = completedTopics.has(topicId);
    await toggleTopic(topicId, isCompleted);
  };

  const calculateSubjectProgress = (subject) => {
    let totalTopicsCount = 0;
    let completedCount = 0;
    subject.units.forEach(unit => {
      unit.topics.forEach(topic => {
        totalTopicsCount++;
        if (completedTopics.has(topic.id)) completedCount++;
      });
    });
    if (totalTopicsCount === 0) return 0;
    return Math.round((completedCount / totalTopicsCount) * 100);
  };

  if (loadingSyllabus || loadingBranches) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Syllabus Browser</h1>
          <p className="text-sm text-zinc-400">Explore subjects, units, and resources for {selectedBranch} - Sem {selectedSemester}</p>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 mb-10 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Select Branch</label>
              <div className="flex flex-wrap gap-2">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.name)}
                    className={`text-xs px-4 py-2 rounded-xl transition-all font-medium border ${
                      selectedBranch === branch.name 
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]' 
                        : 'bg-[#0a0a0a] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {branch.short_code || branch.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Select Semester</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`text-xs px-4 py-2 rounded-xl transition-all font-medium border ${
                      selectedSemester === sem 
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]' 
                        : 'bg-[#0a0a0a] text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    Sem {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {syllabus.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-[2rem]">
              No syllabus uploaded for Semester {selectedSemester} yet.
            </div>
          ) : (
            syllabus.map((subject) => {
              const currentProgress = calculateSubjectProgress(subject);
              const subjectMaterials = materials.filter(m => m.subject_name === subject.name);
              const pyqs = subjectMaterials.filter(m => m.type === 'PYQ');
              const notes = subjectMaterials.filter(m => m.type === 'Note');

              return (
                <div key={subject.id} className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] overflow-hidden shadow-lg">
                  <div className="p-6 bg-[#1f1f22] border-b border-zinc-800/80">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-inner mt-1">
                            <BookOpen className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-zinc-100">{subject.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs bg-[#0a0a0a] text-zinc-400 px-2 py-1 rounded border border-zinc-800">
                                {subject.code || `SUB-${subject.id.slice(0,4)}`}
                              </span>
                              <span className="text-xs bg-[#0a0a0a] text-zinc-400 px-2 py-1 rounded border border-zinc-800">
                                {subject.credits} Credits
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]">{currentProgress}%</p>
                          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Progress</p>
                        </div>
                        <button 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-sm font-medium transition-colors"
                          onClick={() => window.open(subject.youtube_url || 'https://youtube.com', '_blank')}
                        >
                          <Youtube className="w-4 h-4" /> Playlist
                        </button>
                      </div>
                    </div>
                    <div className="mt-5 w-full bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden border border-zinc-800">
                       <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${currentProgress}%` }} />
                    </div>
                  </div>

                  <div className="p-6">
                    <Accordion type="single" collapsible className="w-full space-y-3">
                      {subjectMaterials.length > 0 && (
                        <AccordionItem value="materials" className="border border-indigo-500/20 bg-indigo-500/5 rounded-xl overflow-hidden">
                          <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-indigo-500/10 transition-colors">
                            <div className="flex items-center justify-between w-full pr-2">
                              <div className="flex items-center gap-3">
                                <BookMarked className="w-4 h-4 text-indigo-400" />
                                <span className="font-semibold text-sm text-zinc-200">Study Materials (PYQs & Notes)</span>
                              </div>
                              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{subjectMaterials.length} Files</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4 pt-2">
                              {pyqs.length > 0 && (
                                <div>
                                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Previous Year Questions</h4>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {pyqs.map(pyq => (
                                      <div key={pyq.id} className="flex items-center justify-between p-3 bg-[#121212] border border-zinc-800 rounded-lg hover:border-orange-500/50 transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                                          <span className="text-xs font-medium text-zinc-300 truncate">{pyq.title}</span>
                                        </div>
                                        <button className="text-zinc-500 hover:text-orange-400" onClick={() => window.open(pyq.file_url, '_blank')}><Download className="w-4 h-4" /></button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {notes.length > 0 && (
                                <div>
                                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">PDF Notes</h4>
                                  <div className="grid sm:grid-cols-2 gap-3">
                                    {notes.map(note => (
                                      <div key={note.id} className="flex items-center justify-between p-3 bg-[#121212] border border-zinc-800 rounded-lg hover:border-blue-500/50 transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                          <span className="text-xs font-medium text-zinc-300 truncate">{note.title}</span>
                                        </div>
                                        <button className="text-zinc-500 hover:text-blue-400" onClick={() => window.open(note.file_url, '_blank')}><Download className="w-4 h-4" /></button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {subject.units.map((unit) => {
                        const completedTopicsInUnit = unit.topics.filter(t => completedTopics.has(t.id)).length;
                        const totalTopicsInUnit = unit.topics.length;
                        return (
                          <AccordionItem key={unit.id} value={`unit-${unit.id}`} className="border border-zinc-800/80 bg-[#121212] rounded-xl overflow-hidden">
                            <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-[#18181b] transition-colors">
                              <div className="flex items-center justify-between w-full pr-2">
                                <div className="flex items-center gap-3">
                                  <Layers className="w-4 h-4 text-zinc-500" />
                                  <span className="font-semibold text-sm text-zinc-200">Unit {unit.unit_number}: {unit.title}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 bg-[#0a0a0a] px-2 py-0.5 rounded border border-zinc-800">{completedTopicsInUnit}/{totalTopicsInUnit} topics</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-2 pt-2">
                                {unit.topics.map((topic) => {
                                  const isTopicCompleted = completedTopics.has(topic.id);
                                  return (
                                    <div key={topic.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-[#0a0a0a] border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer group" onClick={() => handleTopicToggle(topic.id)}>
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {isTopicCompleted ? <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" /> : <Circle className="w-4 h-4 text-zinc-600 shrink-0" />}
                                        <span className={`truncate text-sm ${isTopicCompleted ? 'text-zinc-500 line-through' : 'text-zinc-300'} ml-1`}>{topic.title}</span>
                                        {topic.youtube_url && (
                                          <a href={topic.youtube_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="ml-2 text-zinc-600 hover:text-rose-500 transition-colors"><Youtube className="w-5 h-5" /></a>
                                        )}
                                      </div>
                                      {isTopicCompleted && <span className="text-[10px] uppercase font-bold tracking-wider text-teal-500 bg-teal-500/10 px-2 py-1 rounded">Done</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
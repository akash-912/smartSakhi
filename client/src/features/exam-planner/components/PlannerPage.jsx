import { useState } from 'react';
import { useSyllabus } from '../../syllabus/api/useSyllabus'; 
import { useProgress } from '../../syllabus/api/useProgress'; 
import { usePlanner } from '../api/usePlanner'; 
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { CalendarDays, BookOpen, Target, Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/Accordian.jsx';
import { CircularProgress } from '../../../components/ui/CircularProgress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tab.jsx';

export function PlannerPage({ userSemester , userBranch }) {
  const [selectedExam, setSelectedExam] = useState('Mid-Sem 1'); 
  const { syllabus, loading: loadingSyllabus } = useSyllabus(userBranch, userSemester);
  const { completedTopics, toggleTopic: toggleCompletedTopic } = useProgress();
  const { plannedTopics, togglePlannedTopic, loadingPlanner } = usePlanner(selectedExam);

  const [isEditMode, setIsEditMode] = useState(false);
  const [draftSelectedTopics, setDraftSelectedTopics] = useState([]);

  const topicsBySubject = {};
  const allTopicsMap = {}; 
  
  if (syllabus) {
    syllabus.forEach(subject => {
      topicsBySubject[subject.name] = [];
      subject.units.forEach(unit => {
        unit.topics.forEach(topic => {
          const formattedTopic = { id: topic.id, name: topic.title, subjectName: subject.name, unitName: `Unit ${unit.unit_number}` };
          topicsBySubject[subject.name].push(formattedTopic);
          allTopicsMap[topic.id] = formattedTopic;
        });
      });
    });
  }

  const plannedTopicsArray = Array.from(plannedTopics).map(id => allTopicsMap[id]).filter(Boolean);

  const handleTopicToggle = (topicId) => {
    setDraftSelectedTopics(prev => prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]);
  };

  const handleAddToPlanner = async () => {
    for (const topicId of draftSelectedTopics) if (!plannedTopics.has(topicId)) await togglePlannedTopic(topicId, false);
    for (const topicId of plannedTopics) if (!draftSelectedTopics.includes(topicId)) await togglePlannedTopic(topicId, true);
    setIsEditMode(false);
    setDraftSelectedTopics([]);
  };

  const handleClearPlanner = async () => {
    for (const topicId of plannedTopics) await togglePlannedTopic(topicId, true); 
    setIsEditMode(false);
    setDraftSelectedTopics([]);
  };

  const handleEditPlanner = () => {
    setIsEditMode(true);
    setDraftSelectedTopics(Array.from(plannedTopics));
  };

  const handleToggleComplete = async (topicId) => {
    const isCompleted = completedTopics.has(topicId);
    await toggleCompletedTopic(topicId, isCompleted);
  };

  const getSubjectProgress = () => {
    const subjectStats = {};
    plannedTopicsArray.forEach(topic => {
      if (!subjectStats[topic.subjectName]) subjectStats[topic.subjectName] = { total: 0, completed: 0 };
      subjectStats[topic.subjectName].total++;
      if (completedTopics.has(topic.id)) subjectStats[topic.subjectName].completed++;
    });
    return Object.entries(subjectStats).map(([name, stats]) => ({ name, total: stats.total, completed: stats.completed, progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0 }));
  };

  const subjectProgress = getSubjectProgress();
  const completedPlannedCount = plannedTopicsArray.filter(t => completedTopics.has(t.id)).length;
  const overallProgress = plannedTopicsArray.length > 0 ? Math.round((completedPlannedCount / plannedTopicsArray.length) * 100) : 0;

  if (loadingSyllabus || loadingPlanner) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        <div className="mb-8 flex items-start gap-4">
          <div className="p-3 bg-[#18181b] border border-zinc-800/80 rounded-xl shadow-inner">
            <CalendarDays className="w-6 h-6 text-teal-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Exam Planner</h1>
            <p className="text-sm text-zinc-400">Plan your studies for Mid-Sem and End-Sem exams</p>
          </div>
        </div>

        <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 mb-8 shadow-lg">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Select Target Exam</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Mid-Sem 1', 'Mid-Sem 2', 'End-Sem'].map((examName) => (
              <button
                key={examName}
                onClick={() => { setSelectedExam(examName); setIsEditMode(false); }}
                className={`h-20 rounded-xl border flex flex-col justify-center items-center gap-1 transition-all ${
                  selectedExam === examName 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]' 
                    : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span className="font-bold">{examName}</span>
                {selectedExam === examName && <span className="text-[10px] bg-[#0a0a0a] border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">{plannedTopicsArray.length} topics</span>}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="planner" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#18181b] border border-zinc-800/60 p-1 rounded-xl mx-auto md:mx-0">
            <TabsTrigger value="planner" className="gap-2 text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-white rounded-lg py-2">
              <CalendarDays className="w-4 h-4" /> Study Planner
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2 text-zinc-400 data-[state=active]:bg-[#27272a] data-[state=active]:text-white rounded-lg py-2">
              <TrendingUp className="w-4 h-4" /> Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                {(isEditMode || plannedTopics.size === 0) ? (
                  <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-white">{isEditMode ? 'Edit Plan Topics' : 'Select Topics'}</h2>
                      {draftSelectedTopics.length > 0 && (
                        <button onClick={handleAddToPlanner} className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                          <Plus className="w-4 h-4" /> {isEditMode ? 'Update' : `Add ${draftSelectedTopics.length}`}
                        </button>
                      )}
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(topicsBySubject).map(([subjectName, topics]) => (
                        <Accordion key={subjectName} type="single" collapsible>
                          <AccordionItem value={subjectName} className="border border-zinc-800/80 bg-[#121212] rounded-xl overflow-hidden mb-2">
                            <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-[#1f1f22]">
                              <div className="flex items-center justify-between w-full pr-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <BookOpen className="w-4 h-4 text-teal-500 shrink-0" />
                                  <span className="font-semibold text-sm text-zinc-200 truncate">{subjectName}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 bg-[#0a0a0a] px-2 py-0.5 rounded border border-zinc-800 shrink-0">{topics.length}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-2 pt-2">
                                {topics.map((topic) => (
                                  <div key={topic.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-zinc-800/50 rounded-lg hover:border-teal-500/30 transition-colors group">
                                    <Checkbox id={`topic-${topic.id}`} checked={draftSelectedTopics.includes(topic.id)} onCheckedChange={() => handleTopicToggle(topic.id)} className="border-zinc-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                                    <label htmlFor={`topic-${topic.id}`} className="flex-1 cursor-pointer min-w-0">
                                      <p className="text-sm font-medium text-zinc-200 truncate">{topic.name}</p>
                                      <p className="text-[10px] text-zinc-500 mt-0.5">{topic.unitName}</p>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-white">Your Study Plan</h2>
                      <div className="flex gap-2">
                        <button onClick={handleEditPlanner} className="flex items-center gap-2 bg-[#27272a] hover:bg-[#3f3f46] text-zinc-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Edit className="w-3 h-3" /> Edit</button>
                        <button onClick={handleClearPlanner} className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"><Trash2 className="w-3 h-3" /> Clear</button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {plannedTopicsArray.map((topic, index) => {
                        const isCompleted = completedTopics.has(topic.id);
                        const displayDate = new Date();
                        displayDate.setDate(displayDate.getDate() + index);

                        return (
                          <div key={topic.id} className={`p-4 rounded-xl border transition-colors ${isCompleted ? 'bg-[#121212] border-zinc-800/40 opacity-60' : 'bg-[#1f1f22] border-zinc-700 shadow-sm'}`}>
                            <div className="flex items-start gap-4">
                              <Checkbox id={`complete-${topic.id}`} checked={isCompleted} onCheckedChange={() => handleToggleComplete(topic.id)} className="mt-1 border-zinc-600 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${isCompleted ? 'bg-zinc-800 text-zinc-500' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'}`}>Day {index + 1}</span>
                                  <span className="text-[10px] text-zinc-500 bg-[#0a0a0a] px-2 py-0.5 rounded border border-zinc-800">{displayDate.toISOString().split('T')[0]}</span>
                                </div>
                                <h3 className={`text-sm font-semibold mb-1 ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>{topic.name}</h3>
                                <p className="text-xs text-zinc-500">{topic.subjectName} • {topic.unitName}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 text-center shadow-lg">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">Overall Progress</h3>
                  <div className="flex justify-center mb-6">
                    <div className="bg-[#0a0a0a] p-2 rounded-full border border-zinc-800 shadow-inner">
                      <CircularProgress percentage={overallProgress} size={130} strokeWidth={8} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#121212] rounded-xl border border-zinc-800/80">
                      <p className="text-2xl font-bold text-teal-500">{plannedTopicsArray.length}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total</p>
                    </div>
                    <div className="p-3 bg-[#121212] rounded-xl border border-zinc-800/80">
                      <p className="text-2xl font-bold text-white">{completedPlannedCount}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="bg-[#18181b] border border-zinc-800/60 rounded-[1.5rem] p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-6">Subject-wise Target Progress</h2>
              {subjectProgress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectProgress.map((subject, index) => (
                    <div key={index} className="bg-[#121212] border border-zinc-800/80 rounded-xl p-5">
                      <div className="flex flex-col items-center">
                         <div className="bg-[#0a0a0a] p-2 rounded-full border border-zinc-800 mb-4">
                           <CircularProgress percentage={subject.progress} size={90} strokeWidth={6} />
                         </div>
                         <h3 className="text-sm font-bold text-zinc-200 text-center line-clamp-1 w-full mb-3">{subject.name}</h3>
                         <div className="w-full flex justify-between text-[11px] text-zinc-500 mb-1">
                           <span>Completed</span>
                           <span className="text-zinc-300 font-bold">{subject.completed}/{subject.total}</span>
                         </div>
                         <div className="w-full bg-[#0a0a0a] rounded-full h-1 overflow-hidden">
                           <div className="bg-teal-500 h-full transition-all" style={{ width: `${subject.progress}%` }} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center">
                  <p className="text-zinc-500 text-sm">No topics added to your plan yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
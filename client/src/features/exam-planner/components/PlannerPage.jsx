import { useState } from 'react';
import { useSyllabus } from '../../syllabus/api/useSyllabus'; 
import { useProgress } from '../../syllabus/api/useProgress'; 
import { usePlanner } from '../api/usePlanner'; 

import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { CalendarDays, BookOpen, Target, Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/Accordian.jsx';
import { CircularProgress } from '../../../components/ui/CircularProgress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tab.jsx';

export function PlannerPage({ userSemester , userBranch }) {
  // 1. Backend Hooks
  const [selectedExam, setSelectedExam] = useState('Mid-Sem 1'); 
  const { syllabus, loading: loadingSyllabus } = useSyllabus(userBranch, userSemester);
  const { completedTopics, toggleTopic: toggleCompletedTopic } = useProgress();
  const { plannedTopics, togglePlannedTopic, loadingPlanner } = usePlanner(selectedExam);

  // 2. Local State for drafting a plan
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftSelectedTopics, setDraftSelectedTopics] = useState([]);

  // 3. Transform Supabase Syllabus
  const topicsBySubject = {};
  const allTopicsMap = {}; 
  
  if (syllabus) {
    syllabus.forEach(subject => {
      topicsBySubject[subject.name] = [];
      subject.units.forEach(unit => {
        unit.topics.forEach(topic => {
          const formattedTopic = {
            id: topic.id,
            name: topic.title,
            subjectName: subject.name,
            unitName: `Unit ${unit.unit_number}`,
          };
          topicsBySubject[subject.name].push(formattedTopic);
          allTopicsMap[topic.id] = formattedTopic;
        });
      });
    });
  }

  const plannedTopicsArray = Array.from(plannedTopics).map(id => allTopicsMap[id]).filter(Boolean);

  // 4. Handlers
  const handleTopicToggle = (topicId) => {
    setDraftSelectedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleAddToPlanner = async () => {
    for (const topicId of draftSelectedTopics) {
      if (!plannedTopics.has(topicId)) await togglePlannedTopic(topicId, false);
    }
    for (const topicId of plannedTopics) {
      if (!draftSelectedTopics.includes(topicId)) await togglePlannedTopic(topicId, true);
    }
    setIsEditMode(false);
    setDraftSelectedTopics([]);
  };

  const handleClearPlanner = async () => {
    for (const topicId of plannedTopics) {
      await togglePlannedTopic(topicId, true); 
    }
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

  // 5. Calculate Progress Stats
  const getSubjectProgress = () => {
    const subjectStats = {};
    
    plannedTopicsArray.forEach(topic => {
      if (!subjectStats[topic.subjectName]) {
        subjectStats[topic.subjectName] = { total: 0, completed: 0 };
      }
      subjectStats[topic.subjectName].total++;
      if (completedTopics.has(topic.id)) {
        subjectStats[topic.subjectName].completed++;
      }
    });

    return Object.entries(subjectStats).map(([name, stats]) => ({
      name,
      total: stats.total,
      completed: stats.completed,
      progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));
  };

  const subjectProgress = getSubjectProgress();
  const completedPlannedCount = plannedTopicsArray.filter(t => completedTopics.has(t.id)).length;
  const overallProgress = plannedTopicsArray.length > 0 
    ? Math.round((completedPlannedCount / plannedTopicsArray.length) * 100) 
    : 0;

  if (loadingSyllabus || loadingPlanner) {
    return (
      <div className="min-h-screen flex justify-center pt-20 bg-background transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary rounded-lg">
              <CalendarDays className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Exam Planner</h1>
              <p className="text-muted-foreground">Plan your studies for Mid-Sem and End-Sem exams</p>
            </div>
          </div>
        </div>

        {/* Exam Selection */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Select Exam</h2>
          <div className="grid grid-cols-3 gap-4">
            {['Mid-Sem 1', 'Mid-Sem 2', 'End-Sem'].map((examName) => (
              <Button
                key={examName}
                variant={selectedExam === examName ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedExam(examName);
                  setIsEditMode(false);
                }}
                className={`h-20 flex flex-col gap-2 transition-colors ${
                  selectedExam === examName ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-lg font-bold">{examName}</span>
                {selectedExam === examName && (
                  <span className="text-xs opacity-80">{plannedTopicsArray.length} topics</span>
                )}
              </Button>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="planner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted text-muted-foreground">
            <TabsTrigger value="planner" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <CalendarDays className="w-4 h-4" />
              Study Planner
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <TrendingUp className="w-4 h-4" />
              Subject Progress
            </TabsTrigger>
          </TabsList>

          {/* Planner Tab */}
          <TabsContent value="planner">
            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div>
                {(isEditMode || plannedTopics.size === 0) ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-foreground">
                        {isEditMode ? 'Edit Topics' : 'Select Topics'}
                      </h2>
                      {draftSelectedTopics.length > 0 && (
                        <Button onClick={handleAddToPlanner} className="gap-2">
                          <Plus className="w-4 h-4" />
                          {isEditMode ? 'Update Plan' : `Add ${draftSelectedTopics.length} Topics`}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(topicsBySubject).map(([subjectName, topics]) => (
                        <Accordion key={subjectName} type="single" collapsible>
                          <AccordionItem value={subjectName} className="border-border">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-foreground">{subjectName}</span>
                                </div>
                                <Badge variant="secondary" className="bg-muted text-muted-foreground">{topics.length} topics</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {topics.map((topic) => (
                                  <div key={topic.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                                    <Checkbox
                                      id={`topic-${topic.id}`}
                                      checked={draftSelectedTopics.includes(topic.id)}
                                      onCheckedChange={() => handleTopicToggle(topic.id)}
                                    />
                                    <label htmlFor={`topic-${topic.id}`} className="flex-1 cursor-pointer">
                                      <p className="font-medium text-foreground">{topic.name}</p>
                                      <Badge variant="secondary" className="text-xs mt-1 bg-background text-muted-foreground">
                                        {topic.unitName}
                                      </Badge>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-foreground">Your Study Plan</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleEditPlanner} className="gap-2 hover:bg-muted text-foreground">
                          <Edit className="w-4 h-4" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClearPlanner} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive border-border">
                          <Trash2 className="w-4 h-4" /> Clear
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                      {plannedTopicsArray.map((topic, index) => {
                        const isCompleted = completedTopics.has(topic.id);
                        const displayDate = new Date();
                        displayDate.setDate(displayDate.getDate() + index);

                        return (
                          <div key={topic.id} className={`p-4 rounded-lg border transition-colors ${
                            isCompleted 
                              ? 'bg-muted/30 border-border opacity-75' 
                              : 'bg-card border-primary/20 shadow-sm'
                          }`}>
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`complete-${topic.id}`}
                                checked={isCompleted}
                                onCheckedChange={() => handleToggleComplete(topic.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={isCompleted ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}>
                                    Day {index + 1}
                                  </Badge>
                                  <Badge variant="outline" className="text-muted-foreground border-border">{displayDate.toISOString().split('T')[0]}</Badge>
                                  {isCompleted && (
                                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-none">✓ Completed</Badge>
                                  )}
                                </div>
                                <h3 className={`font-semibold mb-1 ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                  {topic.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm">
                                  <span className="text-muted-foreground">{topic.subjectName}</span>
                                  <span className="text-border">•</span>
                                  <span className="text-muted-foreground">{topic.unitName}</span>
                                  <span className="text-border">•</span>
                                  <span className="text-primary font-medium opacity-80">2 hours</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Overall Progress</h3>
                  <div className="flex justify-center mb-4">
                    <CircularProgress percentage={overallProgress} size={150} strokeWidth={12} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-2xl font-bold text-primary">{plannedTopicsArray.length}</p>
                      <p className="text-xs text-muted-foreground">Total Topics</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">{completedPlannedCount}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </Card>

                {plannedTopicsArray.length > 0 && (
                  <Card className="p-6 bg-muted/30 border-primary/10">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Study Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Topics</p>
                        <p className="text-2xl font-bold text-foreground">{plannedTopicsArray.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Days</p>
                        <p className="text-2xl font-bold text-foreground">{plannedTopicsArray.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Study Hours</p>
                        <p className="text-2xl font-bold text-foreground">{plannedTopicsArray.length * 2}h</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              {subjectProgress.length > 0 ? (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">
                    Subject-wise Progress for {selectedExam}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectProgress.map((subject, index) => (
                      <Card key={index} className="p-6 hover:shadow-md transition-shadow border-border">
                        <div className="flex flex-col items-center">
                          <CircularProgress
                            percentage={subject.progress}
                            size={120}
                            strokeWidth={10}
                            label={subject.name}
                          />
                          <div className="mt-4 w-full space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Completed:</span>
                              <span className="font-semibold text-foreground">
                                {subject.completed}/{subject.total}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-500"
                                style={{ width: `${subject.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card className="p-12 border-border bg-muted/20">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium text-foreground">No topics in your plan yet</p>
                    <p className="text-sm mt-1">Add topics to see subject-wise progress</p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
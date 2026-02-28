import { useState } from 'react';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { Calendar, CheckCircle, BookOpen, Target, Plus, Trash2, CalendarDays, Edit, TrendingUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/Accordian.jsx';
import { CircularProgress } from '../../../components/ui/CircularProgress.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tab.jsx';

export function PlannerPage({ userSemester }) {
  // Available topics from all subjects
  const allTopics = [
    // Data Structures
    { id: 1, name: 'Arrays and Linked Lists', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 1', completed: false },
    { id: 2, name: 'Stacks and Queues', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 1', completed: false },
    { id: 3, name: 'Time and Space Complexity', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 1', completed: false },
    { id: 4, name: 'Binary Trees', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 2', completed: false },
    { id: 5, name: 'Binary Search Trees', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 2', completed: false },
    { id: 6, name: 'AVL Trees', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 2', completed: false },
    { id: 7, name: 'Graph Representation', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 3', completed: false },
    { id: 8, name: 'BFS and DFS', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 3', completed: false },
    { id: 9, name: 'Shortest Path Algorithms', subjectName: 'Data Structures', subjectCode: 'CS301', unitName: 'Unit 3', completed: false },
    
    // DBMS
    { id: 10, name: 'Database Concepts', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 1', completed: false },
    { id: 11, name: 'ER Diagrams', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 1', completed: false },
    { id: 12, name: 'Relational Model', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 1', completed: false },
    { id: 13, name: 'Basic SQL Queries', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 2', completed: false },
    { id: 14, name: 'Joins and Subqueries', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 2', completed: false },
    { id: 15, name: 'Advanced SQL', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 2', completed: false },
    { id: 16, name: 'Normalization', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 3', completed: false },
    { id: 17, name: 'Transactions', subjectName: 'DBMS', subjectCode: 'CS302', unitName: 'Unit 3', completed: false },
    
    // Operating Systems
    { id: 18, name: 'Process Concepts', subjectName: 'Operating Systems', subjectCode: 'CS303', unitName: 'Unit 1', completed: false },
    { id: 19, name: 'Process Scheduling', subjectName: 'Operating Systems', subjectCode: 'CS303', unitName: 'Unit 1', completed: false },
    { id: 20, name: 'Inter-process Communication', subjectName: 'Operating Systems', subjectCode: 'CS303', unitName: 'Unit 1', completed: false },
    { id: 21, name: 'Memory Allocation', subjectName: 'Operating Systems', subjectCode: 'CS303', unitName: 'Unit 2', completed: false },
    { id: 22, name: 'Paging and Segmentation', subjectName: 'Operating Systems', subjectCode: 'CS303', unitName: 'Unit 2', completed: false },
    { id: 23, name: 'Deadlocks', subjectName: 'Operating Systems', subjectCode: 'CS303', unitName: 'Unit 3', completed: false },
    
    // Computer Networks
    { id: 24, name: 'OSI Model', subjectName: 'Computer Networks', subjectCode: 'CS304', unitName: 'Unit 1', completed: false },
    { id: 25, name: 'TCP/IP Model', subjectName: 'Computer Networks', subjectCode: 'CS304', unitName: 'Unit 1', completed: false },
    { id: 26, name: 'Network Devices', subjectName: 'Computer Networks', subjectCode: 'CS304', unitName: 'Unit 1', completed: false },
    { id: 27, name: 'IP Addressing', subjectName: 'Computer Networks', subjectCode: 'CS304', unitName: 'Unit 2', completed: false },
    { id: 28, name: 'Routing Protocols', subjectName: 'Computer Networks', subjectCode: 'CS304', unitName: 'Unit 2', completed: false },
    
    // Software Engineering
    { id: 29, name: 'Waterfall Model', subjectName: 'Software Engineering', subjectCode: 'CS305', unitName: 'Unit 1', completed: false },
    { id: 30, name: 'Agile Methodology', subjectName: 'Software Engineering', subjectCode: 'CS305', unitName: 'Unit 1', completed: false },
    { id: 31, name: 'DevOps', subjectName: 'Software Engineering', subjectCode: 'CS305', unitName: 'Unit 1', completed: false },
    { id: 32, name: 'Testing Methods', subjectName: 'Software Engineering', subjectCode: 'CS305', unitName: 'Unit 2', completed: false },
    { id: 33, name: 'Design Patterns', subjectName: 'Software Engineering', subjectCode: 'CS305', unitName: 'Unit 2', completed: false },
    
    // Web Technologies
    { id: 34, name: 'HTML Basics', subjectName: 'Web Technologies', subjectCode: 'CS306', unitName: 'Unit 1', completed: false },
    { id: 35, name: 'CSS Styling', subjectName: 'Web Technologies', subjectCode: 'CS306', unitName: 'Unit 1', completed: false },
    { id: 36, name: 'Responsive Design', subjectName: 'Web Technologies', subjectCode: 'CS306', unitName: 'Unit 1', completed: false },
    { id: 37, name: 'JavaScript Fundamentals', subjectName: 'Web Technologies', subjectCode: 'CS306', unitName: 'Unit 2', completed: false },
    { id: 38, name: 'DOM Manipulation', subjectName: 'Web Technologies', subjectCode: 'CS306', unitName: 'Unit 2', completed: false },
    { id: 39, name: 'React Basics', subjectName: 'Web Technologies', subjectCode: 'CS306', unitName: 'Unit 3', completed: false },
  ];

  const [selectedExam, setSelectedExam] = useState('mid-sem-1');
  const [examProgress, setExamProgress] = useState({
    'mid-sem-1': { selectedTopics: [], completedTopics: [], plannerTopics: [] },
    'mid-sem-2': { selectedTopics: [], completedTopics: [], plannerTopics: [] },
    'end-sem': { selectedTopics: [], completedTopics: [], plannerTopics: [] },
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Group topics by subject
  const topicsBySubject = allTopics.reduce((acc, topic) => {
    if (!acc[topic.subjectName]) {
      acc[topic.subjectName] = [];
    }
    acc[topic.subjectName].push(topic);
    return acc;
  }, {});

  const currentExamData = examProgress[selectedExam];
  const selectedTopics = currentExamData.selectedTopics;
  const completedTopics = currentExamData.completedTopics;
  const plannerTopics = currentExamData.plannerTopics;

  const handleTopicToggle = (topicId) => {
    setExamProgress(prev => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        selectedTopics: prev[selectedExam].selectedTopics.includes(topicId)
          ? prev[selectedExam].selectedTopics.filter(id => id !== topicId)
          : [...prev[selectedExam].selectedTopics, topicId]
      }
    }));
  };

  const handleAddToPlanner = () => {
    const newPlannerTopics = selectedTopics.map((topicId, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        topicId,
        date: date.toISOString().split('T')[0],
        time: '2 hours',
      };
    });
    
    setExamProgress(prev => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        plannerTopics: newPlannerTopics,
        selectedTopics: []
      }
    }));
    setIsEditMode(false);
  };

  const handleRemoveFromPlanner = (topicId) => {
    setExamProgress(prev => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        plannerTopics: prev[selectedExam].plannerTopics.filter(item => item.topicId !== topicId)
      }
    }));
  };

  const handleToggleComplete = (topicId) => {
    setExamProgress(prev => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        completedTopics: prev[selectedExam].completedTopics.includes(topicId)
          ? prev[selectedExam].completedTopics.filter(id => id !== topicId)
          : [...prev[selectedExam].completedTopics, topicId]
      }
    }));
  };

  const handleEditPlanner = () => {
    setIsEditMode(true);
    setExamProgress(prev => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        selectedTopics: prev[selectedExam].plannerTopics.map(item => item.topicId)
      }
    }));
  };

  const handleClearPlanner = () => {
    setExamProgress(prev => ({
      ...prev,
      [selectedExam]: {
        selectedTopics: [],
        completedTopics: [],
        plannerTopics: []
      }
    }));
    setIsEditMode(false);
  };

  const getTopicById = (id) => allTopics.find(t => t.id === id);

  // Calculate subject-wise progress
  const getSubjectProgress = () => {
    const subjectStats = {};
    
    plannerTopics.forEach(item => {
      const topic = getTopicById(item.topicId);
      if (topic) {
        if (!subjectStats[topic.subjectName]) {
          subjectStats[topic.subjectName] = { total: 0, completed: 0 };
        }
        subjectStats[topic.subjectName].total++;
        if (completedTopics.includes(item.topicId)) {
          subjectStats[topic.subjectName].completed++;
        }
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
  const overallProgress = plannerTopics.length > 0 
    ? Math.round((completedTopics.length / plannerTopics.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exam Planner</h1>
              <p className="text-gray-600">Plan your studies for Mid-Sem and End-Sem exams</p>
            </div>
          </div>
        </div>

        {/* Exam Selection */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select Exam</h2>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={selectedExam === 'mid-sem-1' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedExam('mid-sem-1');
                setIsEditMode(false);
              }}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg font-bold">Mid-Sem 1</span>
              <span className="text-xs opacity-80">
                {examProgress['mid-sem-1'].plannerTopics.length} topics
              </span>
            </Button>
            <Button
              variant={selectedExam === 'mid-sem-2' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedExam('mid-sem-2');
                setIsEditMode(false);
              }}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg font-bold">Mid-Sem 2</span>
              <span className="text-xs opacity-80">
                {examProgress['mid-sem-2'].plannerTopics.length} topics
              </span>
            </Button>
            <Button
              variant={selectedExam === 'end-sem' ? 'default' : 'outline'}
              onClick={() => {
                setSelectedExam('end-sem');
                setIsEditMode(false);
              }}
              className="h-20 flex flex-col gap-2"
            >
              <span className="text-lg font-bold">End-Sem</span>
              <span className="text-xs opacity-80">
                {examProgress['end-sem'].plannerTopics.length} topics
              </span>
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="planner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planner" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Study Planner
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Subject Progress
            </TabsTrigger>
          </TabsList>

          {/* Planner Tab */}
          <TabsContent value="planner">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Topic Selection or Study Plan */}
              <div>
                {(isEditMode || plannerTopics.length === 0) ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Topics' : 'Select Topics'}
                      </h2>
                      {selectedTopics.length > 0 && (
                        <Button onClick={handleAddToPlanner} className="gap-2">
                          <Plus className="w-4 h-4" />
                          {isEditMode ? 'Update Plan' : `Add ${selectedTopics.length} Topics`}
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                      {Object.entries(topicsBySubject).map(([subjectName, topics]) => (
                        <Accordion key={subjectName} type="single" collapsible>
                          <AccordionItem value={subjectName}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold">{subjectName}</span>
                                </div>
                                <Badge variant="outline">{topics.length} topics</Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {topics.map((topic) => (
                                  <div
                                    key={topic.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <Checkbox
                                      id={`topic-${topic.id}`}
                                      checked={selectedTopics.includes(topic.id)}
                                      onCheckedChange={() => handleTopicToggle(topic.id)}
                                    />
                                    <label
                                      htmlFor={`topic-${topic.id}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <p className="font-medium text-gray-900">{topic.name}</p>
                                      <Badge variant="secondary" className="text-xs mt-1">
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
                      <h2 className="text-xl font-bold text-gray-900">Your Study Plan</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleEditPlanner} className="gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleClearPlanner}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                      {plannerTopics.map((item, index) => {
                        const topic = getTopicById(item.topicId);
                        if (!topic) return null;
                        const isCompleted = completedTopics.includes(item.topicId);

                        return (
                          <div
                            key={item.topicId}
                            className={`p-4 rounded-lg border ${
                              isCompleted 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`complete-${item.topicId}`}
                                checked={isCompleted}
                                onCheckedChange={() => handleToggleComplete(item.topicId)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={isCompleted ? 'bg-green-600' : 'bg-purple-600'}>
                                    Day {index + 1}
                                  </Badge>
                                  <Badge variant="outline">{item.date}</Badge>
                                  {isCompleted && (
                                    <Badge className="bg-green-100 text-green-800">
                                      ✓ Completed
                                    </Badge>
                                  )}
                                </div>
                                <h3 className={`font-semibold mb-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {topic.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm">
                                  <span className="text-gray-600">{topic.subjectName}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-600">{topic.unitName}</span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-purple-600 font-medium">{item.time}</span>
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
                {/* Overall Progress */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Progress</h3>
                  <div className="flex justify-center mb-4">
                    <CircularProgress percentage={overallProgress} size={150} strokeWidth={12} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{plannerTopics.length}</p>
                      <p className="text-xs text-gray-600">Total Topics</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{completedTopics.length}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                </Card>

                {/* Study Summary */}
                {plannerTopics.length > 0 && (
                  <Card className="p-6 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Study Summary</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Topics</p>
                        <p className="text-2xl font-bold text-gray-900">{plannerTopics.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Days</p>
                        <p className="text-2xl font-bold text-gray-900">{plannerTopics.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Study Hours</p>
                        <p className="text-2xl font-bold text-gray-900">{plannerTopics.length * 2}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Date</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(plannerTopics[plannerTopics.length - 1].date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Quick Stats */}
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mid-Sem 1</span>
                      <Badge variant={selectedExam === 'mid-sem-1' ? 'default' : 'secondary'}>
                        {examProgress['mid-sem-1'].plannerTopics.length} topics
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mid-Sem 2</span>
                      <Badge variant={selectedExam === 'mid-sem-2' ? 'default' : 'secondary'}>
                        {examProgress['mid-sem-2'].plannerTopics.length} topics
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">End-Sem</span>
                      <Badge variant={selectedExam === 'end-sem' ? 'default' : 'secondary'}>
                        {examProgress['end-sem'].plannerTopics.length} topics
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              {subjectProgress.length > 0 ? (
                <>
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Subject-wise Progress for {selectedExam === 'mid-sem-1' ? 'Mid-Sem 1' : selectedExam === 'mid-sem-2' ? 'Mid-Sem 2' : 'End-Sem'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subjectProgress.map((subject, index) => (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                          <div className="flex flex-col items-center">
                            <CircularProgress
                              percentage={subject.progress}
                              size={120}
                              strokeWidth={10}
                              label={subject.name}
                            />
                            <div className="mt-4 w-full space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Completed:</span>
                                <span className="font-semibold text-gray-900">
                                  {subject.completed}/{subject.total}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${subject.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-12">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <TrendingUp className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">No topics in your plan yet</p>
                    <p className="text-sm">Add topics to see subject-wise progress</p>
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

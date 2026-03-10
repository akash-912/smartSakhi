import { useSyllabus } from '../features/syllabus/api/useSyllabus'; 
import { useProgress } from '../features/syllabus/api/useProgress'; 
import { useBranches } from '../features/syllabus/hooks/useBranches'; // 1. Import the hook

import { Card } from '../components/ui/Card.jsx';
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { User, Mail, GraduationCap, Calendar, Award, Book } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx';
import { supabase } from '../lib/supabase'; // <-- Add this import


export function ProfilePage({
  userName,
  userEmail,
  userBranch,
  userSemester,
  onBranchChange,
  onSemesterChange,
}) {


  
  // 2. Fetch Dynamic Branches
  const { branches, loading: loadingBranches } = useBranches();

  // 3. Fetch live data based on the current user selections
  const { syllabus, loading } = useSyllabus(userBranch, userSemester);
  const { completedTopics } = useProgress();

  // 4. Calculate dynamic subjects progress array
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

    if (progressPercentage === 100 && subjectTotalTopics > 0) {
      subjectsCompletedCount++;
    }

    return {
      name: subject.name,
      totalTopics: subjectTotalTopics,
      completedTopics: subjectCompletedTopics,
      progress: progressPercentage
    };
  }) : [];

  // 5. Calculate overall global progress
  const overallProgress = totalTopicsGlobal > 0 
    ? Math.round((completedTopicsGlobal / totalTopicsGlobal) * 100) 
    : 0;

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // 6. Wait for BOTH Syllabus and Branches to load
  if (loading || loadingBranches) {
    return (
      <div className="min-h-screen flex justify-center pt-20 bg-background transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  const handleBranchUpdate = async (newBranch) => {
    onBranchChange(newBranch); // 1. Update UI instantly
    await supabase.auth.updateUser({ 
      data: { branch: newBranch } 
    }); // 2. Save to Supabase forever
  };

  // Save new semester to Database AND React State
  const handleSemesterUpdate = async (newSem) => {
    onSemesterChange(newSem); 
    await supabase.auth.updateUser({ 
      data: { semester: newSem } 
    }); 
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 text-white border-none shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/10 dark:bg-black/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{userName}</h1>
              <div className="flex flex-col sm:flex-row gap-4 mt-3 text-blue-50 dark:text-blue-200">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{userEmail}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{userBranch}</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Semester {userSemester}</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <CircularProgress
                percentage={overallProgress}
                size={100}
                strokeWidth={8}
                // Overriding default colors for this specific dark header
                colorClass="text-white"
                trackColorClass="text-white/20"
              />
            </div>
          </div>
        </Card>

        {/* Settings Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            Academic Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Branch
              </label>
              <Select value={userBranch} onValueChange={handleBranchUpdate}>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground border-border">
                  {/* Map over dynamic branches from Database */}
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.name} className="focus:bg-muted focus:text-foreground">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Semester
              </label>
              <Select value={userSemester.toString()} onValueChange={(val) => handleSemesterUpdate(Number(val))}>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card text-foreground border-border">
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()} className="focus:bg-muted focus:text-foreground">
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Progress Section */}
        <div className="mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">
            Subject-wise Progress
          </h2>
        </div>

        {dynamicSubjectsProgress.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicSubjectsProgress.map((subject, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow border-border">
                <div className="flex flex-col items-center">
                  
                  {/* 1. EXPLICITLY RENDER THE SUBJECT NAME HERE */}
                  <h3 className="text-lg font-bold text-foreground text-center mb-4 h-14 flex items-center justify-center">
                    {subject.name}
                  </h3>

                  {/* 2. Render the circle without the label prop */}
                  <CircularProgress
                    percentage={subject.progress}
                    size={120}
                    strokeWidth={10}
                  />
                  
                  <div className="mt-6 w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed Topics:</span>
                      <span className="font-semibold text-foreground">
                        {subject.completedTopics}/{subject.totalTopics}
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
        ) : (
           <Card className="p-12 text-center text-muted-foreground bg-muted/20 border-border">
             No subjects found for this Branch and Semester combination.
           </Card>
        )}

        {/* Statistics */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-foreground mb-6">Your Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
              <p className="text-3xl font-bold text-primary">
                {completedTopicsGlobal}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Topics Completed</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalTopicsGlobal}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Topics</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
              <p className="text-3xl font-bold text-green-600 dark:text-green-500">{overallProgress}%</p>
              <p className="text-sm text-muted-foreground mt-1">Overall Progress</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">
                {subjectsCompletedCount}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Subjects Completed</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
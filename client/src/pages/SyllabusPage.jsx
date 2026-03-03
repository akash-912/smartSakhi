import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { useSyllabus } from '../features/syllabus/api/useSyllabus'; 
import { useProgress } from '../features/syllabus/api/useProgress';
// 1. Import the new hook
import { useBranches } from '../features/syllabus/hooks/useBranches'; 
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { 
  BookOpen, 
  CheckCircle, 
  Circle, 
  Youtube,
  Layers,
  FileText,
  Download,
  BookMarked
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordian.jsx';
import { Progress } from '../components/ui/Progress.jsx';

export function SyllabusPage({ userBranch, userSemester }) {
  // 2. Use the hook to get real branches from DB
  const { branches, loading: loadingBranches } = useBranches();
  
  const [selectedBranch, setSelectedBranch] = useState(userBranch || 'Computer Science Engineering');
  const [selectedSemester, setSelectedSemester] = useState(userSemester || 3);
  const [materials, setMaterials] = useState([]);

  const { syllabus, loading: loadingSyllabus, error } = useSyllabus(selectedBranch, selectedSemester);
  const { completedTopics, toggleTopic } = useProgress();

  // Fetch Study Materials
  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('branch', selectedBranch)
        .eq('semester', selectedSemester);

      if (!error && data) {
        setMaterials(data);
      }
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
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-destructive bg-background min-h-screen">Failed to load syllabus: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Syllabus Browser</h1>
          <p className="text-muted-foreground">
            Explore subjects, units, and resources for {selectedBranch} - Semester {selectedSemester}
          </p>
        </div>

        {/* Branch and Semester Selector */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Branch</label>
              <div className="grid grid-cols-2 gap-2">
                {/* 3. Map over the DYNAMIC branches from Supabase */}
                {branches.map((branch) => (
                  <Button
                    key={branch.id}
                    variant={selectedBranch === branch.name ? 'default' : 'outline'}
                    onClick={() => setSelectedBranch(branch.name)}
                    className={`text-sm transition-colors ${
                      selectedBranch === branch.name ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {/* Display logic: Use short_code if available, else first 2 words */}
                    {branch.short_code || branch.name.split(' ').slice(0, 2).join(' ')}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Select Semester</label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <Button
                    key={sem}
                    variant={selectedSemester === sem ? 'default' : 'outline'}
                    onClick={() => setSelectedSemester(sem)}
                    className={`transition-colors ${
                      selectedSemester === sem ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {sem}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Subjects Grid */}
        <div className="space-y-6">
          {syllabus.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground bg-muted/20 border-border">
              No syllabus uploaded for Semester {selectedSemester} yet.
            </Card>
          ) : (
            syllabus.map((subject) => {
              const currentProgress = calculateSubjectProgress(subject);
              
              const subjectMaterials = materials.filter(m => m.subject_name === subject.name);
              const pyqs = subjectMaterials.filter(m => m.type === 'PYQ');
              const notes = subjectMaterials.filter(m => m.type === 'Note');

              return (
                <Card key={subject.id} className="overflow-hidden border-border">
                  <div className="p-6 bg-muted/30 border-b border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary rounded-lg">
                            <BookOpen className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground">{subject.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="secondary" className="bg-background text-muted-foreground border-border">
                                {subject.code || `SUB-${subject.id.slice(0,4)}`}
                              </Badge>
                              <Badge variant="secondary" className="bg-background text-muted-foreground border-border">
                                {subject.credits} Credits
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{currentProgress}%</p>
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 hover:bg-muted text-foreground border-border"
                          onClick={() => window.open(subject.youtube_url || 'https://youtube.com', '_blank')}
                        >
                          <Youtube className="w-4 h-4 text-destructive" />
                          Playlist
                        </Button>
                      </div>
                    </div>
                    <Progress value={currentProgress} className="mt-4" />
                  </div>

                  <div className="p-6">
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      
                      {/* Study Materials Section */}
                      {subjectMaterials.length > 0 && (
                        <AccordionItem value="materials" className="border-border bg-primary/5 rounded-lg px-2">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <BookMarked className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-left text-foreground">
                                  Study Materials (PYQs & Notes)
                                </span>
                              </div>
                              <Badge variant="outline" className="text-primary border-primary/30 bg-background">
                                {subjectMaterials.length} Files
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2 pb-2">
                              {pyqs.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Previous Year Questions</h4>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {pyqs.map(pyq => (
                                      <div key={pyq.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                                          <span className="text-sm font-medium text-foreground truncate">{pyq.title}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => window.open(pyq.file_url, '_blank')}>
                                          <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {notes.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1 mt-4">PDF Notes</h4>
                                  <div className="grid sm:grid-cols-2 gap-2">
                                    {notes.map(note => (
                                      <div key={note.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                          <span className="text-sm font-medium text-foreground truncate">{note.title}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => window.open(note.file_url, '_blank')}>
                                          <Download className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}

                      {/* Regular Units List */}
                      {subject.units.map((unit) => {
                        const completedTopicsInUnit = unit.topics.filter(t => completedTopics.has(t.id)).length;
                        const totalTopicsInUnit = unit.topics.length;

                        return (
                          <AccordionItem key={unit.id} value={`unit-${unit.id}`} className="border-border px-2">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-3">
                                  <Layers className="w-5 h-5 text-primary" />
                                  <span className="font-semibold text-left text-foreground">
                                    Unit {unit.unit_number}: {unit.title}
                                  </span>
                                </div>
                                <Badge variant="outline" className="text-muted-foreground border-border">
                                  {completedTopicsInUnit}/{totalTopicsInUnit} topics
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {unit.topics.map((topic) => {
                                  const isTopicCompleted = completedTopics.has(topic.id);
                                  return (
                                    <div
                                      key={topic.id}
                                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border"
                                      onClick={() => handleTopicToggle(topic.id)}
                                    >
                                      <div className="flex items-center gap-3">
                                        {isTopicCompleted ? (
                                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                                        ) : (
                                          <Circle className="w-5 h-5 text-muted-foreground/50" />
                                        )}
                                        <span className={isTopicCompleted ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>
                                          {topic.title}
                                        </span>
                                      </div>
                                      {isTopicCompleted && (
                                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-none">
                                          Completed
                                        </Badge>
                                      )}
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
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
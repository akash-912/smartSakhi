import { useState } from 'react';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { 
  BookOpen, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Youtube,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordian.jsx';
import { Progress } from '../components/ui/Progress.jsx';

export function SyllabusPage({ userBranch, userSemester, onSubjectSelect }) {
  const [selectedBranch, setSelectedBranch] = useState(userBranch);
  const [selectedSemester, setSelectedSemester] = useState(userSemester);

  const branches = [
    { id: 'cse', name: 'Computer Science Engineering' },
    { id: 'it', name: 'Information Technology' },
    { id: 'ece', name: 'Electronics and Communication' },
    { id: 'me', name: 'Mechanical Engineering' },
  ];

  const subjects = [
    {
      id: 1,
      name: 'Data Structures and Algorithms',
      code: 'CS301',
      credits: 4,
      progress: 65,
      youtubePlaylist: 'https://youtube.com/playlist?list=PLexample1',
      units: [
        {
          id: 1,
          name: 'Unit 1: Introduction to Data Structures',
          topics: [
            { id: 1, name: 'Arrays and Linked Lists', completed: true },
            { id: 2, name: 'Stacks and Queues', completed: true },
            { id: 3, name: 'Time and Space Complexity', completed: false },
          ],
        },
        {
          id: 2,
          name: 'Unit 2: Trees',
          topics: [
            { id: 4, name: 'Binary Trees', completed: true },
            { id: 5, name: 'Binary Search Trees', completed: false },
            { id: 6, name: 'AVL Trees', completed: false },
          ],
        },
        {
          id: 3,
          name: 'Unit 3: Graphs',
          topics: [
            { id: 7, name: 'Graph Representation', completed: false },
            { id: 8, name: 'BFS and DFS', completed: false },
            { id: 9, name: 'Shortest Path Algorithms', completed: false },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Database Management Systems',
      code: 'CS302',
      credits: 4,
      progress: 45,
      youtubePlaylist: 'https://youtube.com/playlist?list=PLexample2',
      units: [
        {
          id: 1,
          name: 'Unit 1: Introduction to DBMS',
          topics: [
            { id: 1, name: 'Database Concepts', completed: true },
            { id: 2, name: 'ER Diagrams', completed: true },
            { id: 3, name: 'Relational Model', completed: false },
          ],
        },
        {
          id: 2,
          name: 'Unit 2: SQL',
          topics: [
            { id: 4, name: 'Basic SQL Queries', completed: true },
            { id: 5, name: 'Joins and Subqueries', completed: false },
            { id: 6, name: 'Advanced SQL', completed: false },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Operating Systems',
      code: 'CS303',
      credits: 3,
      progress: 80,
      youtubePlaylist: 'https://youtube.com/playlist?list=PLexample3',
      units: [
        {
          id: 1,
          name: 'Unit 1: Process Management',
          topics: [
            { id: 1, name: 'Process Concepts', completed: true },
            { id: 2, name: 'Process Scheduling', completed: true },
            { id: 3, name: 'Inter-process Communication', completed: true },
          ],
        },
        {
          id: 2,
          name: 'Unit 2: Memory Management',
          topics: [
            { id: 4, name: 'Memory Allocation', completed: true },
            { id: 5, name: 'Paging and Segmentation', completed: false },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Computer Networks',
      code: 'CS304',
      credits: 3,
      progress: 30,
      youtubePlaylist: 'https://youtube.com/playlist?list=PLexample4',
      units: [
        {
          id: 1,
          name: 'Unit 1: Network Fundamentals',
          topics: [
            { id: 1, name: 'OSI Model', completed: true },
            { id: 2, name: 'TCP/IP Model', completed: false },
            { id: 3, name: 'Network Devices', completed: false },
          ],
        },
      ],
    },
    {
      id: 5,
      name: 'Software Engineering',
      code: 'CS305',
      credits: 3,
      progress: 55,
      youtubePlaylist: 'https://youtube.com/playlist?list=PLexample5',
      units: [
        {
          id: 1,
          name: 'Unit 1: SDLC Models',
          topics: [
            { id: 1, name: 'Waterfall Model', completed: true },
            { id: 2, name: 'Agile Methodology', completed: true },
            { id: 3, name: 'DevOps', completed: false },
          ],
        },
      ],
    },
    {
      id: 6,
      name: 'Web Technologies',
      code: 'CS306',
      credits: 4,
      progress: 70,
      youtubePlaylist: 'https://youtube.com/playlist?list=PLexample6',
      units: [
        {
          id: 1,
          name: 'Unit 1: HTML & CSS',
          topics: [
            { id: 1, name: 'HTML Basics', completed: true },
            { id: 2, name: 'CSS Styling', completed: true },
            { id: 3, name: 'Responsive Design', completed: true },
          ],
        },
        {
          id: 2,
          name: 'Unit 2: JavaScript',
          topics: [
            { id: 4, name: 'JavaScript Fundamentals', completed: true },
            { id: 5, name: 'DOM Manipulation', completed: false },
          ],
        },
      ],
    },
  ];

  const handleTopicToggle = (subjectId, unitId, topicId) => {
    // In a real app, this would update the backend
    console.log('Toggle topic:', { subjectId, unitId, topicId });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Syllabus Browser</h1>
          <p className="text-gray-600">
            Explore subjects, units, and topics for {selectedBranch} - Semester {selectedSemester}
          </p>
        </div>

        {/* Branch and Semester Selector */}
        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Branch
              </label>
              <div className="grid grid-cols-2 gap-2">
                {branches.map((branch) => (
                  <Button
                    key={branch.id}
                    variant={selectedBranch === branch.name ? 'default' : 'outline'}
                    onClick={() => setSelectedBranch(branch.name)}
                    className="text-sm"
                  >
                    {branch.name.split(' ').slice(0, 2).join(' ')}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Semester
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <Button
                    key={sem}
                    variant={selectedSemester === sem ? 'default' : 'outline'}
                    onClick={() => setSelectedSemester(sem)}
                  >
                    {sem}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Subjects Grid */}
        <div className="space-y-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">{subject.code}</Badge>
                          <Badge variant="secondary">{subject.credits} Credits</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{subject.progress}%</p>
                      <p className="text-xs text-gray-600">Progress</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => window.open(subject.youtubePlaylist, '_blank')}
                    >
                      <Youtube className="w-4 h-4 text-red-600" />
                      Playlist
                    </Button>
                  </div>
                </div>
                <Progress value={subject.progress} className="mt-4" />
              </div>

              <div className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {subject.units.map((unit) => {
                    const completedTopics = unit.topics.filter((t) => t.completed).length;
                    const totalTopics = unit.topics.length;

                    return (
                      <AccordionItem key={unit.id} value={`unit-${unit.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Layers className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-left">{unit.name}</span>
                            </div>
                            <Badge variant="outline">
                              {completedTopics}/{totalTopics} topics
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {unit.topics.map((topic) => (
                              <div
                                key={topic.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => handleTopicToggle(subject.id, unit.id, topic.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {topic.completed ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-gray-400" />
                                  )}
                                  <span className={topic.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                                    {topic.name}
                                  </span>
                                </div>
                                {topic.completed && (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

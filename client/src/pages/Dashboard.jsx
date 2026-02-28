import { Card } from '../components/ui/Card.jsx';
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { BookOpen, Trophy, Target, TrendingUp, Youtube, Brain, CalendarDays } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export function Dashboard({ userName, userBranch, userSemester, overallProgress, onNavigate }) {
  const recentActivities = [
    { subject: 'Data Structures', topic: 'Binary Trees', progress: 15, time: '2 hours ago' },
    { subject: 'Operating Systems', topic: 'Process Scheduling', progress: 10, time: '5 hours ago' },
    { subject: 'DBMS', topic: 'Normalization', progress: 20, time: 'Yesterday' },
  ];

  const upcomingTopics = [
    { subject: 'Data Structures', topic: 'AVL Trees', unit: 'Unit 3' },
    { subject: 'Computer Networks', topic: 'TCP/IP Protocol', unit: 'Unit 2' },
    { subject: 'Software Engineering', topic: 'Agile Methodology', unit: 'Unit 4' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {userBranch} - Semester {userSemester}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{overallProgress}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">6</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Topics Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">42</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Streak</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">7 days</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress Card */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Progress</h2>
              <div className="flex justify-center">
                <CircularProgress percentage={overallProgress} size={200} strokeWidth={12} />
              </div>
              <p className="text-center text-gray-600 mt-4">
                Keep going! You're doing great this semester.
              </p>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.subject}</p>
                      <p className="text-sm text-gray-600">{activity.topic}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{activity.progress}%</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => onNavigate('syllabus')}
                >
                  <BookOpen className="w-4 h-4" />
                  Browse Syllabus
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => onNavigate('planner')}
                >
                  <CalendarDays className="w-4 h-4" />
                  Mid-Sem Planner
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => onNavigate('ai-assistant')}
                >
                  <Brain className="w-4 h-4" />
                  AI Assistant
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="outline"
                  onClick={() => onNavigate('profile')}
                >
                  <Target className="w-4 h-4" />
                  View Progress
                </Button>
              </div>
            </Card>

            {/* Upcoming Topics */}
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">Upcoming Topics</h3>
              <div className="space-y-3">
                {upcomingTopics.map((topic, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{topic.subject}</p>
                    <p className="text-xs text-gray-600">{topic.topic}</p>
                    <p className="text-xs text-blue-600 mt-1">{topic.unit}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* YouTube Resources */}
            <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50">
              <div className="flex items-center gap-2 mb-3">
                <Youtube className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-900">Video Resources</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Access curated YouTube playlists for each subject
              </p>
              <Button variant="outline" className="w-full" onClick={() => onNavigate('syllabus')}>
                View Playlists
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

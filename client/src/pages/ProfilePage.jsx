import { Card } from '../components/ui/Card.jsx';
import { CircularProgress } from '../components/ui/CircularProgress.jsx';
import { User, Mail, GraduationCap, Calendar, Award, Book } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select.jsx';

export function ProfilePage({
  userName,
  userEmail,
  userBranch,
  userSemester,
  onBranchChange,
  onSemesterChange,
  subjectsProgress,
}) {
  const overallProgress = Math.round(
    subjectsProgress.reduce((acc, subject) => acc + subject.progress, 0) / subjectsProgress.length
  );

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
  ];

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{userName}</h1>
              <div className="flex flex-col sm:flex-row gap-4 mt-3 text-blue-100">
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
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
              <CircularProgress
                percentage={overallProgress}
                size={100}
                strokeWidth={8}
              />
            </div>
          </div>
        </Card>

        {/* Settings Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5" />
            Academic Settings
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Branch
              </label>
              <Select value={userBranch} onValueChange={onBranchChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Semester
              </label>
              <Select value={userSemester.toString()} onValueChange={(val) => onSemesterChange(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
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
          <Award className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Subject-wise Progress
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectsProgress.map((subject, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center">
                <CircularProgress
                  percentage={subject.progress}
                  size={140}
                  strokeWidth={10}
                  label={subject.name}
                />
                <div className="mt-4 w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed Topics:</span>
                    <span className="font-semibold text-gray-900">
                      {subject.completedTopics}/{subject.totalTopics}
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

        {/* Statistics */}
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {subjectsProgress.reduce((acc, s) => acc + s.completedTopics, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Topics Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {subjectsProgress.reduce((acc, s) => acc + s.totalTopics, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Topics</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{overallProgress}%</p>
              <p className="text-sm text-gray-600 mt-1">Overall Progress</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {subjectsProgress.filter((s) => s.progress === 100).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Subjects Completed</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

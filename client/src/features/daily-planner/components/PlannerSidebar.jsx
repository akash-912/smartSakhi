import { X, Plus, Trash2, CheckCircle, Circle, Flame, CalendarDays, Copy } from 'lucide-react';
import { usePlanner } from '../context/PlannerContext.jsx';

export const PlannerSidebar = ({ isOpen, onClose }) => {
  const {
    tasks,
    newTask,
    setNewTask,
    addTask,
    toggleTask,
    deleteTask,
    streak,
    copyYesterdayTasks
  } = usePlanner();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addTask(); // Your context handles adding the task based on newTask state
  };

  return (
    <>
      {/* Dark Glass Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
        />
      )}
      {/* Slide-out Sidebar */}
      <div 
        className={`fixed top-0 right-0 w-full sm:w-[340px] h-full bg-[#0a0a0a] border-l border-zinc-800/80 z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-[#121212]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20">
                <CalendarDays className="w-5 h-5 text-teal-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Daily Planner</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mini Stats Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 bg-[#0a0a0a] px-3 py-1.5 rounded-lg border border-zinc-800">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-zinc-200">{streak} Day Streak</span>
            </div>
            <span className="text-xs font-semibold text-zinc-500">{completedTasks} / {totalTasks} Tasks</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 overflow-hidden border border-zinc-800">
            <div 
              className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
              style={{ width: `${progressPercentage}%` }} 
            />
          </div>
        </div>

        {/* Task List Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
          
          {/* Copy Yesterday Button */}
          <button
            onClick={copyYesterdayTasks}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#27272a] border border-zinc-800/80 text-zinc-300 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Copy className="w-4 h-4 text-teal-500" />
            Copy Yesterday's Tasks
          </button>

          <div className="space-y-3 flex-1">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all group ${
                    task.completed 
                      ? 'bg-[#121212] border-zinc-800/40 opacity-60' 
                      : 'bg-[#18181b] border-zinc-800 hover:border-teal-500/30 shadow-sm'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task)} // Passing the whole task object based on your context
                    className="mt-0.5 flex-shrink-0 focus:outline-none"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-teal-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 group-hover:text-teal-500/50 transition-colors" />
                    )}
                  </button>
                  
                  <p className={`flex-1 text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                    {task.task_text}
                  </p>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-500 transition-all rounded-md hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-3 opacity-60 py-10">
                <CalendarDays className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">Your day is entirely clear.</p>
                <p className="text-xs">Add a task below to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Task Input (Fixed at Bottom) */}
        <div className="p-6 bg-[#121212] border-t border-zinc-800/80">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to get done?"
              className="flex-1 bg-[#0a0a0a] text-zinc-200 border border-zinc-800 focus:border-teal-500/50 rounded-xl px-4 py-2.5 text-sm outline-none transition-all placeholder-zinc-600"
            />
            <button 
              type="submit"
              disabled={!newTask.trim()}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:hover:bg-teal-500 text-black p-2.5 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
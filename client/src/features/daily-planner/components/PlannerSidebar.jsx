import { usePlanner } from "../context/PlannerContext.jsx";

export const PlannerSidebar = ({ isOpen }) => {

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

  return (
    <div
      className={`fixed mt-16  overflow-y-auto pb-2 top-0 right-0 h-[calc(100vh-4rem)] w-80
      bg-white dark:bg-gray-900
      text-gray-800 dark:text-gray-100
      shadow-lg transform transition-all duration-300 z-50
      ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Daily Planner</h2>
      </div>

      {/* Streak */}
      <div className="px-4 pt-3 text-sm font-medium text-orange-600 dark:text-orange-400">
        🔥 Show-up Streak: {streak} days
      </div>

      <div className="p-4">

        {/* Add Task */}
        <div className="flex gap-2 mb-4">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task..."
            className="border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            p-2 flex-1 rounded"
          />

          <button
            onClick={addTask}
            className="bg-blue-600 hover:bg-blue-700
            text-white px-3 rounded transition"
          >
            Add
          </button>
        </div>

        {/* Copy Yesterday */}
        <button
          onClick={copyYesterdayTasks}
          className="mb-4 w-full
          bg-gray-200 hover:bg-gray-300
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-800 dark:text-gray-100
          p-2 rounded transition"
        >
          Copy Yesterday Tasks
        </button>

        {/* Task List */}
        <div className="space-y-2">

          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center justify-between
              border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800
              p-2 rounded"
            >

              <div className="flex items-center gap-2">

                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  className="accent-blue-600"
                />

                <span
                  className={
                    task.completed
                      ? "line-through text-gray-400 dark:text-gray-500"
                      : "text-gray-800 dark:text-gray-100"
                  }
                >
                  {task.task_text}
                </span>

              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                ✕
              </button>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
};
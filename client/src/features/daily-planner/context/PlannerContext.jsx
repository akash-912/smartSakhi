import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";

const PlannerContext = createContext();

export const PlannerProvider = ({ children }) => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [newTask, setNewTask] = useState("");

  const today = new Date().toISOString().split("T")[0];

  /* =========================
     LOAD TODAY TASKS
  ========================== */

  const loadTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", today)
      .order("created_at");

    if (!error && data) {
      setTasks(data);
    }
  };

  /* =========================
     LOAD STREAK
  ========================== */

  const loadStreak = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setStreak(data.showup_streak);
    }
  };

  /* =========================
     UPDATE STREAK
  ========================== */

  const updateStreak = async () => {
    if (!user) return;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const { data } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let newStreak = 1;

    if (!data) {
      await supabase.from("streaks").insert({
        user_id: user.id,
        showup_streak: 1,
        last_active_date: today
      });

      setStreak(1);
      return;
    }

    const lastDate = data.last_active_date;

    if (lastDate === today) return;

    if (lastDate === yesterday) {
      newStreak = data.showup_streak + 1;
    }

    await supabase
      .from("streaks")
      .update({
        showup_streak: newStreak,
        last_active_date: today
      })
      .eq("user_id", user.id);

    setStreak(newStreak);
  };

  /* =========================
     ADD TASK
  ========================== */

  const addTask = async () => {
    if (!newTask.trim() || !user) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        task_text: newTask,
        task_date: today
      })
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => [...prev, data]);
    }

    setNewTask("");
  };

  /* =========================
     TOGGLE TASK
  ========================== */

  const toggleTask = async (task) => {
    const { data } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .select()
      .single();

    setTasks(prev =>
      prev.map(t => (t.id === task.id ? data : t))
    );

    // increase streak only when first task completed
    if (!task.completed) {
      const completedBefore = tasks.filter(t => t.completed).length;

      if (completedBefore === 0) {
        updateStreak();
      }
    }
  };

  /* =========================
     DELETE TASK
  ========================== */

  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);

    setTasks(prev => prev.filter(t => t.id !== id));
  };

  /* =========================
     COPY YESTERDAY TASKS
  ========================== */

  const copyYesterdayTasks = async () => {
    if (!user) return;

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("task_date", yesterday);

    if (!data || data.length === 0) return;

    const newTasks = data.map(t => ({
      user_id: user.id,
      task_text: t.task_text,
      task_date: today
    }));

    await supabase.from("tasks").insert(newTasks);

    loadTasks();
  };

  /* =========================
     LOAD DATA ON LOGIN
  ========================== */

  useEffect(() => {
    if (user) {
      loadTasks();
      loadStreak();
    }
  }, [user]);

  /* =========================
     TASK PROGRESS
  ========================== */

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        newTask,
        setNewTask,
        addTask,
        toggleTask,
        deleteTask,
        copyYesterdayTasks,
        streak,
        completedTasks,
        totalTasks
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = () => {
  return useContext(PlannerContext);
};
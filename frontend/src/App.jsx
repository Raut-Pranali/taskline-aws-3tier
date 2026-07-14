import React, { useEffect, useState } from "react";
import { api } from "./api";
import TaskItem from "./components/TaskItem.jsx";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      setError(null);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const newTask = await api.createTask({ title, notes, priority });
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setNotes("");
      setPriority("medium");
    } catch (err) {
      setError("Could not add the task. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task) => {
    const updated = await api.updateTask(task.id, { is_done: !task.is_done });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  const handleDelete = async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const openCount = tasks.filter((t) => !t.is_done).length;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-mark">TL</div>
        <div>
          <h1>Taskline</h1>
          <p className="subtitle">
            {loading ? "Loading…" : `${openCount} open · ${tasks.length} total`}
          </p>
        </div>
      </header>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && tasks.length === 0 && (
        <div className="empty-state">
          <p>No tasks yet. Add your first one above.</p>
        </div>
      )}

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </ul>

      <footer className="app-footer">
        <span className="dot" /> served from Auto Scaling Group behind ALB
      </footer>
    </div>
  );
}

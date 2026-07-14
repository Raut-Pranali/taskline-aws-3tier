import React from "react";

const PRIORITY_LABEL = { high: "HIGH", medium: "MED", low: "LOW" };

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={`task-row ${task.is_done ? "is-done" : ""}`}>
      <button
        className="task-check"
        aria-label={task.is_done ? "Mark as not done" : "Mark as done"}
        onClick={() => onToggle(task)}
      >
        {task.is_done ? "✓" : ""}
      </button>

      <div className="task-body">
        <p className="task-title">{task.title}</p>
        {task.notes ? <p className="task-notes">{task.notes}</p> : null}
      </div>

      <span className={`priority-tag priority-${task.priority}`}>
        {PRIORITY_LABEL[task.priority]}
      </span>

      <button
        className="task-delete"
        aria-label="Delete task"
        onClick={() => onDelete(task.id)}
      >
        ×
      </button>
    </li>
  );
}

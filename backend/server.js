require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check — point your ALB target group here (e.g. /api/health)
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM tasks ORDER BY is_done ASC, created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
});

// POST create a task
app.post("/api/tasks", async (req, res) => {
  const { title, notes, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, notes, priority) VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), notes || null, priority || "medium"]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create task" });
  }
});

// PATCH update a task (toggle done, edit fields)
app.patch("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, notes, priority, is_done } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET
         title = COALESCE($1, title),
         notes = COALESCE($2, notes),
         priority = COALESCE($3, priority),
         is_done = COALESCE($4, is_done),
         updated_at = now()
       WHERE id = $5 RETURNING *`,
      [title, notes, priority, is_done, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update task" });
  }
});

// DELETE a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete task" });
  }
});

app.listen(PORT, () => {
  console.log(`Task API listening on port ${PORT}`);
});

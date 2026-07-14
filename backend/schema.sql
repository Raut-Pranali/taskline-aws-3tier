-- Run this once against your RDS instance (or local Postgres) to set up the schema.
-- psql -h <RDS_ENDPOINT> -U <username> -d todoapp -f schema.sql

CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    notes       TEXT,
    priority    VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_done     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_is_done ON tasks(is_done);

-- A couple of sample rows so the UI isn't empty on first load
INSERT INTO tasks (title, notes, priority, is_done)
VALUES
    ('Attach WAF to ALB', 'Use AWS managed core rule set to start', 'high', false),
    ('Set up Auto Scaling policy', 'Target tracking on CPU at 60%', 'medium', false),
    ('Enable RDS Multi-AZ', 'Confirm failover with a test reboot', 'high', true)
ON CONFLICT DO NOTHING;

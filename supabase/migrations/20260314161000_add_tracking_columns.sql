-- Migration to add navigation and tracking columns to tasks

-- Add SLA/Deadline Tracking
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMPTZ;

-- Add Real-time Check-in (Time Tracking)
ALTER TABLE tasks ADD COLUMN started_work_at TIMESTAMPTZ;

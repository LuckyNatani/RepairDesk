-- Migration to add priority and category to tasks

-- Add columns
ALTER TABLE tasks 
ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN category TEXT DEFAULT 'repair';

-- Note: The constraints and defaults ensure existing data will have 'medium' priority and 'repair' category.

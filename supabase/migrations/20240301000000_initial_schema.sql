-- Initial Schema for TaskPod
-- Tables: users, tasks, remarks, push_logs

-- 1. Users Table (Maps to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'staff')) NOT NULL,
    push_subscription JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number SERIAL UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('unassigned', 'in_progress', 'completed')) DEFAULT 'unassigned',
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    assigned_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 3. Remarks Table
CREATE TABLE IF NOT EXISTS public.remarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    staff_id UUID REFERENCES public.users(id) NOT NULL,
    remark_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Push Logs Table (Optional - for debugging)
CREATE TABLE IF NOT EXISTS public.push_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.users(id),
    event_type TEXT NOT NULL, -- 'assigned' or 'completed'
    sent_at TIMESTAMPTZ DEFAULT now(),
    success BOOLEAN
);

-- --- RLS POLICIES ---

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;

-- 1. Users Policies
-- All authenticated users can view all users (for assignment dropdown)
CREATE POLICY "Users are viewable by all authenticated users" ON public.users
FOR SELECT TO authenticated USING (true);

-- Users can only update their own profile (specifically push_subscription)
CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Tasks Policies
-- All authenticated users can read all tasks
CREATE POLICY "Tasks are viewable by all authenticated" ON public.tasks
FOR SELECT TO authenticated USING (true);

-- Only owner can create tasks
CREATE POLICY "Only owners can create tasks" ON public.tasks
FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

-- Owners can update any task
CREATE POLICY "Owners can update any task" ON public.tasks
FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

-- Staff can only update tasks assigned to them (specifically status and completed_at)
CREATE POLICY "Staff can update assigned tasks" ON public.tasks
FOR UPDATE TO authenticated USING (
    assigned_to = auth.uid()
) WITH CHECK (
    assigned_to = auth.uid()
);

-- 3. Remarks Policies
-- All authenticated users can view all remarks
CREATE POLICY "Remarks are viewable by all" ON public.remarks
FOR SELECT TO authenticated USING (true);

-- Staff can only insert remarks on tasks assigned to them
CREATE POLICY "Staff can add remarks to assigned tasks" ON public.remarks
FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND assigned_to = auth.uid())
);

-- 4. Push Logs Policies
CREATE POLICY "Push logs are viewable by owner" ON public.push_logs
FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
);

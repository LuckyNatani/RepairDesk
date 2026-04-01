-- Migration 003: Production Constraints and Optimizations

-- 1. Enforce per-business phone uniqueness for users (Critical P0)
ALTER TABLE public.users ADD CONSTRAINT unique_business_phone UNIQUE(business_id, phone);

-- 2. Add versioning for deterministic optimistic concurrency (Medium)
ALTER TABLE public.tasks ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- 3. Move draft reminder debounce state to businesses table (Medium)
ALTER TABLE public.businesses ADD COLUMN last_draft_reminder_at TIMESTAMPTZ;

-- 4. Create a STABLE helper function for business-scoped RLS (Critical - Performance)
-- Marking it STABLE ensures Postgres caches the result for the duration of a statement.
CREATE OR REPLACE FUNCTION public.get_my_business_id() 
RETURNS UUID 
LANGUAGE SQL 
STABLE SECURITY DEFINER
AS $$ 
  SELECT business_id FROM public.users WHERE id = auth.uid();
$$;

-- 5. Update existing RLS helper functions to be STABLE
CREATE OR REPLACE FUNCTION public.auth_user_is_active() 
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE SECURITY DEFINER
AS $$ 
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_active = true); 
$$;

CREATE OR REPLACE FUNCTION public.auth_user_role() 
RETURNS TEXT 
LANGUAGE SQL 
STABLE SECURITY DEFINER
AS $$ 
  SELECT role FROM public.users WHERE id = auth.uid(); 
$$;

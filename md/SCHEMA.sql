-- ============================================================
-- TaskPod v6.0 — Single Run-Ready Supabase Migration
-- Run on a fresh Supabase project via SQL Editor or CLI
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLES
-- ============================================================

-- ------------------------------------------------------------
-- businesses
-- Max 2 rows enforced by trigger below
-- ------------------------------------------------------------
CREATE TABLE businesses (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT         NOT NULL,
  owner_id          UUID         UNIQUE, -- FK set after users inserted; updated after creation
  account_status    TEXT         NOT NULL
                                 CHECK (account_status IN (
                                   'trial_active','active','trial_expired','suspended'
                                 )),
  trial_ends_at     TIMESTAMPTZ  NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  activated_at      TIMESTAMPTZ,
  activated_by      UUID,        -- FK → users.id (added below)
  suspended_at      TIMESTAMPTZ,
  suspended_reason  TEXT,
  superadmin_note   TEXT,
  next_task_number  INTEGER      NOT NULL DEFAULT 1001,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- users (mirrors auth.users; id = Supabase Auth user ID)
-- ------------------------------------------------------------
CREATE TABLE users (
  id                   UUID         PRIMARY KEY, -- = auth.uid()
  email                TEXT         UNIQUE NOT NULL,
  name                 TEXT         NOT NULL,
  phone                TEXT         NOT NULL,
  role                 TEXT         NOT NULL
                                    CHECK (role IN ('superadmin','owner','staff')),
  business_id          UUID         REFERENCES businesses(id) ON DELETE SET NULL,
  is_active            BOOLEAN      NOT NULL DEFAULT true,
  must_change_password BOOLEAN      NOT NULL DEFAULT true,
  avatar_color         TEXT         NOT NULL DEFAULT '#1E3A5F',
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_seen_at         TIMESTAMPTZ
);

-- Add deferred FKs now that both tables exist
ALTER TABLE businesses
  ADD CONSTRAINT businesses_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT businesses_activated_by_fkey
    FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- account_events — immutable audit log of status transitions
-- ------------------------------------------------------------
CREATE TABLE account_events (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_type   TEXT         NOT NULL
               CHECK (event_type IN (
                 'created','activated','suspended','reactivated',
                 'trial_expired','trial_extended'
               )),
  actor_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note         TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- service_types — business-scoped, owner-managed
-- ------------------------------------------------------------
CREATE TABLE service_types (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label               TEXT         NOT NULL,
  default_description TEXT,
  sort_order          INTEGER      NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- customers — business-scoped phonebook
-- ------------------------------------------------------------
CREATE TABLE customers (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name         TEXT         NOT NULL,
  phone        TEXT         NOT NULL,
  created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_task_at TIMESTAMPTZ,
  UNIQUE (business_id, phone)
);

-- ------------------------------------------------------------
-- tasks — core entity
-- ------------------------------------------------------------
CREATE TABLE tasks (
  id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_number          INTEGER      NOT NULL,
  business_id          UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id          UUID         REFERENCES customers(id) ON DELETE SET NULL,
  customer_name        TEXT         NOT NULL,
  customer_phone       TEXT         NOT NULL,
  customer_address     TEXT,
  service_type_id      UUID         REFERENCES service_types(id) ON DELETE SET NULL,
  service_type_label   TEXT,
  service_description  TEXT,
  status               TEXT         NOT NULL DEFAULT 'unassigned'
                                    CHECK (status IN ('unassigned','in_progress','completed')),
  assigned_to          UUID         REFERENCES users(id) ON DELETE SET NULL,
  is_urgent            BOOLEAN      NOT NULL DEFAULT false,
  is_draft             BOOLEAN      NOT NULL DEFAULT true,
  due_at               TIMESTAMPTZ,
  assigned_at          TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  created_by           UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (business_id, task_number)
);

-- ------------------------------------------------------------
-- task_events — immutable audit log; inserted by triggers only
-- ------------------------------------------------------------
CREATE TABLE task_events (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  event_type   TEXT         NOT NULL
               CHECK (event_type IN (
                 'created','assigned','reassigned','completed','reopened','status_changed'
               )),
  actor_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  to_user_id   UUID         REFERENCES users(id) ON DELETE SET NULL,
  from_user_id UUID         REFERENCES users(id) ON DELETE SET NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- remarks — task comments; 500 char limit enforced at DB level
-- ------------------------------------------------------------
CREATE TABLE remarks (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  text       TEXT         NOT NULL CHECK (length(text) <= 500),
  is_system  BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- push_subscriptions — multi-device, one row per device/user
-- ------------------------------------------------------------
CREATE TABLE push_subscriptions (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint          TEXT         UNIQUE NOT NULL,
  subscription_json JSONB        NOT NULL,
  device_hint       TEXT,
  last_used_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  is_denied         BOOLEAN      NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- notifications — in-app + push record; 90-day TTL via cron
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  task_id      UUID         REFERENCES tasks(id) ON DELETE SET NULL,
  event_type   TEXT         NOT NULL
               CHECK (event_type IN (
                 'assigned','completed','remarked','reassigned',
                 'account_activated','account_suspended','draft_reminder',
                 'staff_deactivated'
               )),
  message      TEXT         NOT NULL,
  is_read      BOOLEAN      NOT NULL DEFAULT false,
  push_sent_at TIMESTAMPTZ,
  push_success BOOLEAN,
  push_error   TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Kanban board — primary query
CREATE INDEX idx_tasks_business_status_created
  ON tasks (business_id, status, created_at DESC);

-- Active task queries (partial)
CREATE INDEX idx_tasks_active_status
  ON tasks (status) WHERE status != 'completed';

-- Staff workload count, My Tasks filter (partial)
CREATE INDEX idx_tasks_assigned_in_progress
  ON tasks (assigned_to) WHERE status = 'in_progress';

-- Draft reminder queries (partial)
CREATE INDEX idx_tasks_drafts
  ON tasks (business_id, is_draft) WHERE is_draft = true;

-- Optimistic concurrency checks
CREATE INDEX idx_tasks_updated_at ON tasks (updated_at);

-- Task lookup by display number
CREATE INDEX idx_tasks_business_number ON tasks (business_id, task_number);

-- Customer autocomplete (business-scoped)
CREATE INDEX idx_customers_business_phone ON customers (business_id, phone);

-- ILIKE name search via trigram
CREATE INDEX idx_customers_name_trgm
  ON customers USING gin (name gin_trgm_ops);

-- Notification bell badge count (partial)
CREATE INDEX idx_notifications_unread
  ON notifications (user_id) WHERE is_read = false;

-- Remark debounce check
CREATE INDEX idx_notifications_task_type_push
  ON notifications (task_id, event_type, push_sent_at DESC);

-- TTL cleanup
CREATE INDEX idx_notifications_created_at ON notifications (created_at);

-- All devices for a user
CREATE INDEX idx_push_subs_user_id ON push_subscriptions (user_id);

-- Stale subscription cleanup
CREATE INDEX idx_push_subs_last_used ON push_subscriptions (last_used_at);

-- SA dashboard status filter
CREATE INDEX idx_businesses_account_status ON businesses (account_status);

-- Account history per business
CREATE INDEX idx_account_events_business_created
  ON account_events (business_id, created_at DESC);

-- Task events per task
CREATE INDEX idx_task_events_task_id ON task_events (task_id);

-- Users by business
CREATE INDEX idx_users_business_id ON users (business_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- Enforce max 2 businesses
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_max_businesses()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM businesses) >= 2 THEN
    RAISE EXCEPTION 'Maximum of 2 businesses allowed on this platform';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_businesses
  BEFORE INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION enforce_max_businesses();

-- ------------------------------------------------------------
-- Per-business task number (atomic increment)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION assign_task_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  UPDATE businesses
  SET next_task_number = next_task_number + 1
  WHERE id = NEW.business_id
  RETURNING next_task_number - 1 INTO next_num;

  NEW.task_number := next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_task_number
  BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION assign_task_number();

-- ------------------------------------------------------------
-- Auto-update tasks.updated_at on every UPDATE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- task_events: insert audit row on task INSERT
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_task_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_events (task_id, event_type, actor_id, note)
  VALUES (NEW.id, 'created', NEW.created_by, 'Task created');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_created
  AFTER INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_created();

-- ------------------------------------------------------------
-- task_events: insert audit row on task status/assignment UPDATE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Assignment / reassignment
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO task_events (task_id, event_type, actor_id, to_user_id, note)
      VALUES (NEW.id, 'assigned', NEW.created_by, NEW.assigned_to, 'Task assigned');
    ELSIF OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO task_events (task_id, event_type, actor_id, from_user_id, to_user_id, note)
      VALUES (NEW.id, 'reassigned', NEW.created_by, OLD.assigned_to, NEW.assigned_to, 'Task reassigned');
      -- System remark for reassignment
      INSERT INTO remarks (task_id, author_id, text, is_system)
      VALUES (NEW.id, NEW.created_by,
        'Task reassigned to new staff member.', true);
    ELSIF OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NULL THEN
      INSERT INTO task_events (task_id, event_type, actor_id, from_user_id, note)
      VALUES (NEW.id, 'status_changed', NEW.created_by, OLD.assigned_to, 'Task unassigned');
    END IF;
  END IF;

  -- Completion
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    INSERT INTO task_events (task_id, event_type, actor_id, note)
    VALUES (NEW.id, 'completed',
      COALESCE(NEW.assigned_to, NEW.created_by), 'Task marked completed');
  END IF;

  -- Reopen
  IF OLD.status = 'completed' AND NEW.status = 'unassigned' THEN
    INSERT INTO task_events (task_id, event_type, actor_id, note)
    VALUES (NEW.id, 'reopened', NEW.created_by, 'Task reopened by owner');
    INSERT INTO remarks (task_id, author_id, text, is_system)
    VALUES (NEW.id, NEW.created_by, 'Task reopened. Status returned to Unassigned.', true);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_changes
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_task_changes();

-- ============================================================
-- PUBLIC VIEW: users_public (hides sensitive columns)
-- ============================================================
CREATE OR REPLACE VIEW users_public AS
  SELECT
    id,
    name,
    phone,
    role,
    business_id,
    is_active,
    avatar_color,
    last_seen_at
  FROM users;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE businesses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- Helper: is current user active?
CREATE OR REPLACE FUNCTION auth_user_is_active()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: get current user's business_id
CREATE OR REPLACE FUNCTION auth_user_business_id()
RETURNS UUID AS $$
  SELECT business_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ------------------------------------------------------------
-- businesses RLS
-- ------------------------------------------------------------
-- Owner: own row only
CREATE POLICY "businesses_select_owner"
  ON businesses FOR SELECT
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND owner_id = auth.uid()
  );

-- Superadmin: all rows (SA uses service role via Edge Function)
CREATE POLICY "businesses_select_superadmin"
  ON businesses FOR SELECT
  USING (auth_user_role() = 'superadmin');

-- UPDATE: service role (Edge Functions) only — no direct frontend UPDATE
-- (No public UPDATE policy — Edge Functions use service role which bypasses RLS)

-- ------------------------------------------------------------
-- users RLS
-- ------------------------------------------------------------
-- Self: read own record
CREATE POLICY "users_select_self"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Same business: active users can see active colleagues (business-scoped)
CREATE POLICY "users_select_same_business"
  ON users FOR SELECT
  USING (
    auth_user_is_active()
    AND business_id = auth_user_business_id()
    AND is_active = true
  );

-- Superadmin: see all users
CREATE POLICY "users_select_superadmin"
  ON users FOR SELECT
  USING (auth_user_role() = 'superadmin');

-- Owner: update is_active for staff in own business (deactivate/reactivate)
CREATE POLICY "users_update_active_owner"
  ON users FOR UPDATE
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND business_id = auth_user_business_id()
    AND role = 'staff'
  )
  WITH CHECK (
    business_id = auth_user_business_id()
  );

-- Self: update own last_seen_at, avatar_color, must_change_password
CREATE POLICY "users_update_self"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- INSERT: service role only (Edge Functions create owner + staff)

-- ------------------------------------------------------------
-- account_events RLS
-- ------------------------------------------------------------
CREATE POLICY "account_events_select_owner"
  ON account_events FOR SELECT
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND business_id = auth_user_business_id()
  );

CREATE POLICY "account_events_select_superadmin"
  ON account_events FOR SELECT
  USING (auth_user_role() = 'superadmin');

-- INSERT: service role only (Edge Functions and triggers)

-- ------------------------------------------------------------
-- service_types RLS
-- ------------------------------------------------------------
CREATE POLICY "service_types_select_active_users"
  ON service_types FOR SELECT
  USING (
    auth_user_is_active()
    AND business_id = auth_user_business_id()
  );

CREATE POLICY "service_types_owner_write"
  ON service_types FOR ALL
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND business_id = auth_user_business_id()
  )
  WITH CHECK (business_id = auth_user_business_id());

-- ------------------------------------------------------------
-- customers RLS
-- ------------------------------------------------------------
CREATE POLICY "customers_select_active_users"
  ON customers FOR SELECT
  USING (
    auth_user_is_active()
    AND business_id = auth_user_business_id()
  );

CREATE POLICY "customers_insert_active_users"
  ON customers FOR INSERT
  WITH CHECK (
    auth_user_is_active()
    AND business_id = auth_user_business_id()
  );

CREATE POLICY "customers_update_owner"
  ON customers FOR UPDATE
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND business_id = auth_user_business_id()
  );

-- ------------------------------------------------------------
-- tasks RLS
-- ------------------------------------------------------------
-- SELECT: all active users in same business (not suspended)
CREATE POLICY "tasks_select_active_users"
  ON tasks FOR SELECT
  USING (
    auth_user_is_active()
    AND business_id = auth_user_business_id()
    AND EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = tasks.business_id
        AND b.account_status NOT IN ('suspended')
    )
  );

-- INSERT: owner only, account must be active or trial_active
CREATE POLICY "tasks_insert_owner"
  ON tasks FOR INSERT
  WITH CHECK (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND business_id = auth_user_business_id()
    AND EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = tasks.business_id
        AND b.account_status IN ('trial_active','active')
    )
  );

-- UPDATE status/completed_at: assigned staff only (own task completion)
CREATE POLICY "tasks_update_status_staff"
  ON tasks FOR UPDATE
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'staff'
    AND assigned_to = auth.uid()
    AND business_id = auth_user_business_id()
  )
  WITH CHECK (
    assigned_to = auth.uid()
    AND business_id = auth_user_business_id()
  );

-- UPDATE assign/urgent/due/reopen: owner only
CREATE POLICY "tasks_update_owner"
  ON tasks FOR UPDATE
  USING (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND business_id = auth_user_business_id()
  )
  WITH CHECK (business_id = auth_user_business_id());

-- ------------------------------------------------------------
-- task_events RLS
-- ------------------------------------------------------------
CREATE POLICY "task_events_select_active_users"
  ON task_events FOR SELECT
  USING (
    auth_user_is_active()
    AND EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_events.task_id
        AND t.business_id = auth_user_business_id()
    )
  );
-- INSERT: SECURITY DEFINER triggers only (no public INSERT policy)

-- ------------------------------------------------------------
-- remarks RLS
-- ------------------------------------------------------------
CREATE POLICY "remarks_select_active_users"
  ON remarks FOR SELECT
  USING (
    auth_user_is_active()
    AND EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = remarks.task_id
        AND t.business_id = auth_user_business_id()
    )
  );

-- Owner: add remark to any task in own business
CREATE POLICY "remarks_insert_owner"
  ON remarks FOR INSERT
  WITH CHECK (
    auth_user_is_active()
    AND auth_user_role() = 'owner'
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN businesses b ON b.id = t.business_id
      WHERE t.id = remarks.task_id
        AND t.business_id = auth_user_business_id()
        AND b.account_status IN ('trial_active','active')
    )
  );

-- Staff: add remark only to own assigned task
CREATE POLICY "remarks_insert_staff"
  ON remarks FOR INSERT
  WITH CHECK (
    auth_user_is_active()
    AND auth_user_role() = 'staff'
    AND author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks t
      JOIN businesses b ON b.id = t.business_id
      WHERE t.id = remarks.task_id
        AND t.assigned_to = auth.uid()
        AND t.business_id = auth_user_business_id()
        AND b.account_status IN ('trial_active','active')
    )
  );

-- ------------------------------------------------------------
-- push_subscriptions RLS
-- ------------------------------------------------------------
CREATE POLICY "push_subs_own_rows"
  ON push_subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------
-- notifications RLS
-- ------------------------------------------------------------
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_read"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT: service role only (Edge Functions)

-- ============================================================
-- DB WEBHOOK STUB
-- ============================================================
-- Configure in Supabase Dashboard → Database → Webhooks:
--
-- Webhook Name : send-push-on-task-change
-- Table        : tasks
-- Events       : INSERT, UPDATE
-- URL          : https://<project-ref>.supabase.co/functions/v1/send-push-notification
-- HTTP Headers : Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
--                Content-Type: application/json
--
-- Webhook Name : send-push-on-remark
-- Table        : remarks
-- Events       : INSERT
-- URL          : https://<project-ref>.supabase.co/functions/v1/send-push-notification
-- HTTP Headers : Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
--                Content-Type: application/json
--
-- NOTE: Both webhooks fire send-push-notification/index.ts
-- The function inspects the payload table name to route logic.

-- ============================================================
-- SCHEDULED EDGE FUNCTION STUBS (configure in Supabase Dashboard)
-- ============================================================
-- check-trial-expiry      : cron("0 * * * *")   — every hour
-- check-draft-reminders   : cron("0 */4 * * *") — every 4 hours
-- cleanup                 : cron("0 3 * * 0")   — Sunday 3AM UTC

-- ============================================================
-- SUPERADMIN SEED (run once after initial deploy)
-- ============================================================
-- Step 1: Create auth.users entry via Supabase Dashboard Auth tab
--   Email: admin@taskpod.app (or your chosen email)
--   Password: set a strong initial password
--   Copy the generated UUID → use as <superadmin-uuid> below
--
-- Step 2: Run this INSERT (replace UUIDs and values):
--
-- INSERT INTO users (id, email, name, phone, role, business_id, is_active, must_change_password)
-- VALUES (
--   '<superadmin-uuid>',        -- from auth.users
--   'admin@taskpod.app',
--   'TaskPod Admin',
--   '+91XXXXXXXXXX',
--   'superadmin',
--   NULL,                       -- Superadmin has no business_id
--   true,
--   false                       -- Superadmin does not need password change
-- );
--
-- Step 3: Set SUPERADMIN_USER_ID env var in Supabase Edge Functions
--   Value: <superadmin-uuid>

-- ============================================================
-- END OF MIGRATION
-- ============================================================

-- ============================================================
-- TaskPod v6.0 — Production Schema (No max-businesses limit)
-- Run on a fresh Supabase project via SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE businesses (
  id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT         NOT NULL,
  owner_id          UUID         UNIQUE,
  account_status    TEXT         NOT NULL CHECK (account_status IN ('trial_active','active','trial_expired','suspended')),
  trial_ends_at     TIMESTAMPTZ  NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  activated_at      TIMESTAMPTZ,
  activated_by      UUID,
  suspended_at      TIMESTAMPTZ,
  suspended_reason  TEXT,
  superadmin_note   TEXT,
  next_task_number  INTEGER      NOT NULL DEFAULT 1001,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id                   UUID         PRIMARY KEY,
  email                TEXT         UNIQUE NOT NULL,
  name                 TEXT         NOT NULL,
  phone                TEXT         NOT NULL,
  role                 TEXT         NOT NULL CHECK (role IN ('superadmin','owner','staff')),
  business_id          UUID         REFERENCES businesses(id) ON DELETE SET NULL,
  is_active            BOOLEAN      NOT NULL DEFAULT true,
  must_change_password BOOLEAN      NOT NULL DEFAULT true,
  avatar_color         TEXT         NOT NULL DEFAULT '#1E3A5F',
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  last_seen_at         TIMESTAMPTZ
);

ALTER TABLE businesses
  ADD CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
  ADD CONSTRAINT businesses_activated_by_fkey FOREIGN KEY (activated_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE account_events (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_type   TEXT         NOT NULL CHECK (event_type IN ('created','activated','suspended','reactivated','trial_expired','trial_extended')),
  actor_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  note         TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE service_types (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label               TEXT         NOT NULL,
  default_description TEXT,
  sort_order          INTEGER      NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

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
  status               TEXT         NOT NULL DEFAULT 'unassigned' CHECK (status IN ('unassigned','in_progress','completed')),
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

CREATE TABLE task_events (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id      UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  event_type   TEXT         NOT NULL CHECK (event_type IN ('created','assigned','reassigned','completed','reopened','status_changed')),
  actor_id     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  to_user_id   UUID         REFERENCES users(id) ON DELETE SET NULL,
  from_user_id UUID         REFERENCES users(id) ON DELETE SET NULL,
  note         TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE remarks (
  id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id    UUID         NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id  UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  text       TEXT         NOT NULL CHECK (length(text) <= 500),
  is_system  BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

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

CREATE TABLE notifications (
  id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id  UUID         NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  task_id      UUID         REFERENCES tasks(id) ON DELETE SET NULL,
  event_type   TEXT         NOT NULL CHECK (event_type IN ('assigned','completed','remarked','reassigned','account_activated','account_suspended','draft_reminder','staff_deactivated')),
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

CREATE INDEX idx_tasks_business_status_created ON tasks (business_id, status, created_at DESC);
CREATE INDEX idx_tasks_active_status ON tasks (status) WHERE status != 'completed';
CREATE INDEX idx_tasks_assigned_in_progress ON tasks (assigned_to) WHERE status = 'in_progress';
CREATE INDEX idx_tasks_drafts ON tasks (business_id, is_draft) WHERE is_draft = true;
CREATE INDEX idx_tasks_updated_at ON tasks (updated_at);
CREATE INDEX idx_tasks_business_number ON tasks (business_id, task_number);
CREATE INDEX idx_customers_business_phone ON customers (business_id, phone);
CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_task_type_push ON notifications (task_id, event_type, push_sent_at DESC);
CREATE INDEX idx_notifications_created_at ON notifications (created_at);
CREATE INDEX idx_push_subs_user_id ON push_subscriptions (user_id);
CREATE INDEX idx_push_subs_last_used ON push_subscriptions (last_used_at);
CREATE INDEX idx_businesses_account_status ON businesses (account_status);
CREATE INDEX idx_account_events_business_created ON account_events (business_id, created_at DESC);
CREATE INDEX idx_task_events_task_id ON task_events (task_id);
CREATE INDEX idx_users_business_id ON users (business_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Per-business task number (atomic increment)
CREATE OR REPLACE FUNCTION assign_task_number()
RETURNS TRIGGER AS $$
DECLARE next_num INTEGER;
BEGIN
  UPDATE businesses SET next_task_number = next_task_number + 1 WHERE id = NEW.business_id RETURNING next_task_number - 1 INTO next_num;
  NEW.task_number := next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_task_number
  BEFORE INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION assign_task_number();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Task created event
CREATE OR REPLACE FUNCTION log_task_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_events (task_id, event_type, actor_id, note) VALUES (NEW.id, 'created', NEW.created_by, 'Task created');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_created AFTER INSERT ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_created();

-- Task changes event
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO task_events (task_id, event_type, actor_id, to_user_id, note) VALUES (NEW.id, 'assigned', NEW.created_by, NEW.assigned_to, 'Task assigned');
    ELSIF OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NOT NULL THEN
      INSERT INTO task_events (task_id, event_type, actor_id, from_user_id, to_user_id, note) VALUES (NEW.id, 'reassigned', NEW.created_by, OLD.assigned_to, NEW.assigned_to, 'Task reassigned');
      INSERT INTO remarks (task_id, author_id, text, is_system) VALUES (NEW.id, NEW.created_by, 'Task reassigned to new staff member.', true);
    ELSIF OLD.assigned_to IS NOT NULL AND NEW.assigned_to IS NULL THEN
      INSERT INTO task_events (task_id, event_type, actor_id, from_user_id, note) VALUES (NEW.id, 'status_changed', NEW.created_by, OLD.assigned_to, 'Task unassigned');
    END IF;
  END IF;
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    INSERT INTO task_events (task_id, event_type, actor_id, note) VALUES (NEW.id, 'completed', COALESCE(NEW.assigned_to, NEW.created_by), 'Task marked completed');
  END IF;
  IF OLD.status = 'completed' AND NEW.status = 'unassigned' THEN
    INSERT INTO task_events (task_id, event_type, actor_id, note) VALUES (NEW.id, 'reopened', NEW.created_by, 'Task reopened by owner');
    INSERT INTO remarks (task_id, author_id, text, is_system) VALUES (NEW.id, NEW.created_by, 'Task reopened. Status returned to Unassigned.', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_changes AFTER UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION log_task_changes();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION auth_user_is_active() RETURNS BOOLEAN AS $$ SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_active = true); $$ LANGUAGE sql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION auth_user_business_id() RETURNS UUID AS $$ SELECT business_id FROM users WHERE id = auth.uid(); $$ LANGUAGE sql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$ SELECT role FROM users WHERE id = auth.uid(); $$ LANGUAGE sql SECURITY DEFINER;

-- businesses
CREATE POLICY "businesses_select_owner" ON businesses FOR SELECT USING (auth_user_is_active() AND auth_user_role() = 'owner' AND owner_id = auth.uid());
CREATE POLICY "businesses_select_superadmin" ON businesses FOR SELECT USING (auth_user_role() = 'superadmin');

-- users
CREATE POLICY "users_select_self" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_select_same_business" ON users FOR SELECT USING (auth_user_is_active() AND business_id = auth_user_business_id() AND is_active = true);
CREATE POLICY "users_select_superadmin" ON users FOR SELECT USING (auth_user_role() = 'superadmin');
CREATE POLICY "users_update_active_owner" ON users FOR UPDATE USING (auth_user_is_active() AND auth_user_role() = 'owner' AND business_id = auth_user_business_id() AND role = 'staff') WITH CHECK (business_id = auth_user_business_id());
CREATE POLICY "users_update_self" ON users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- account_events
CREATE POLICY "account_events_select_owner" ON account_events FOR SELECT USING (auth_user_is_active() AND auth_user_role() = 'owner' AND business_id = auth_user_business_id());
CREATE POLICY "account_events_select_superadmin" ON account_events FOR SELECT USING (auth_user_role() = 'superadmin');

-- service_types
CREATE POLICY "service_types_select" ON service_types FOR SELECT USING (auth_user_is_active() AND business_id = auth_user_business_id());
CREATE POLICY "service_types_owner_write" ON service_types FOR ALL USING (auth_user_is_active() AND auth_user_role() = 'owner' AND business_id = auth_user_business_id()) WITH CHECK (business_id = auth_user_business_id());

-- customers
CREATE POLICY "customers_select" ON customers FOR SELECT USING (auth_user_is_active() AND business_id = auth_user_business_id());
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (auth_user_is_active() AND business_id = auth_user_business_id());
CREATE POLICY "customers_update_owner" ON customers FOR UPDATE USING (auth_user_is_active() AND auth_user_role() = 'owner' AND business_id = auth_user_business_id());

-- tasks
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (auth_user_is_active() AND business_id = auth_user_business_id() AND EXISTS (SELECT 1 FROM businesses b WHERE b.id = tasks.business_id AND b.account_status != 'suspended'));
CREATE POLICY "tasks_insert_owner" ON tasks FOR INSERT WITH CHECK (auth_user_is_active() AND auth_user_role() = 'owner' AND business_id = auth_user_business_id() AND EXISTS (SELECT 1 FROM businesses b WHERE b.id = tasks.business_id AND b.account_status IN ('trial_active','active')));
CREATE POLICY "tasks_update_staff" ON tasks FOR UPDATE USING (auth_user_is_active() AND auth_user_role() = 'staff' AND assigned_to = auth.uid() AND business_id = auth_user_business_id()) WITH CHECK (assigned_to = auth.uid() AND business_id = auth_user_business_id());
CREATE POLICY "tasks_update_owner" ON tasks FOR UPDATE USING (auth_user_is_active() AND auth_user_role() = 'owner' AND business_id = auth_user_business_id()) WITH CHECK (business_id = auth_user_business_id());

-- task_events
CREATE POLICY "task_events_select" ON task_events FOR SELECT USING (auth_user_is_active() AND EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_events.task_id AND t.business_id = auth_user_business_id()));

-- remarks
CREATE POLICY "remarks_select" ON remarks FOR SELECT USING (auth_user_is_active() AND EXISTS (SELECT 1 FROM tasks t WHERE t.id = remarks.task_id AND t.business_id = auth_user_business_id()));
CREATE POLICY "remarks_insert_owner" ON remarks FOR INSERT WITH CHECK (auth_user_is_active() AND auth_user_role() = 'owner' AND author_id = auth.uid() AND EXISTS (SELECT 1 FROM tasks t JOIN businesses b ON b.id = t.business_id WHERE t.id = remarks.task_id AND t.business_id = auth_user_business_id() AND b.account_status IN ('trial_active','active')));
CREATE POLICY "remarks_insert_staff" ON remarks FOR INSERT WITH CHECK (auth_user_is_active() AND auth_user_role() = 'staff' AND author_id = auth.uid() AND EXISTS (SELECT 1 FROM tasks t JOIN businesses b ON b.id = t.business_id WHERE t.id = remarks.task_id AND t.assigned_to = auth.uid() AND t.business_id = auth_user_business_id() AND b.account_status IN ('trial_active','active')));

-- push_subscriptions
CREATE POLICY "push_subs_own" ON push_subscriptions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_read" ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SUPERADMIN SEED (run once):
-- 1. Create user in Supabase Auth Dashboard
-- 2. INSERT INTO users (id, email, name, phone, role, business_id, is_active, must_change_password)
--    VALUES ('<auth-uid>', 'admin@taskpod.app', 'TaskPod Admin', '+91XXXXXXXXXX', 'superadmin', NULL, true, false);
-- 3. Set SUPERADMIN_USER_ID env var in Edge Functions dashboard
-- ============================================================

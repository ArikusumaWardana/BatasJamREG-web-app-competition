-- BatasJamREG Initial Schema Migration
-- Single Source of Truth: DATABASE.md

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2),
  role_title TEXT NOT NULL DEFAULT 'Anggota Tim',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. WORKSPACES
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 80),
  slug TEXT NOT NULL UNIQUE,
  invite_code TEXT NOT NULL UNIQUE,
  work_pattern TEXT NOT NULL DEFAULT 'FIVE_DAYS_8H'
    CHECK (work_pattern IN ('FIVE_DAYS_8H', 'SIX_DAYS_7H', 'CUSTOM')),
  work_start_time TIME NOT NULL DEFAULT '09:00:00',
  work_end_time TIME NOT NULL DEFAULT '17:00:00',
  digest_dispatch_time TIME NOT NULL DEFAULT '08:30:00',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta'
    CHECK (timezone IN ('Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura')),
  -- ISO weekday: 1=Senin ... 7=Minggu
  work_days SMALLINT[] NOT NULL DEFAULT '{1,2,3,4,5}',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. WORKSPACE_MEMBERS
CREATE TABLE public.workspace_members (
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER'
    CHECK (role IN ('OWNER', 'LEAD', 'MEMBER')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 4. DIGEST_CARDS (Async Morning Digest Board)
CREATE TABLE public.digest_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 140),
  body TEXT NOT NULL CHECK (char_length(trim(body)) BETWEEN 3 AND 1000),
  recipient_label TEXT NOT NULL DEFAULT 'Semua Tim' CHECK (char_length(trim(recipient_label)) <= 60),
  triage_type TEXT NOT NULL DEFAULT 'MORNING_QUEUE'
    CHECK (triage_type IN ('MORNING_QUEUE', 'EMERGENCY_OPS')),
  emergency_reason TEXT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED'
    CHECK (status IN ('QUEUED', 'DISPATCHED', 'ARCHIVED')),
  scheduled_for DATE NOT NULL DEFAULT CURRENT_DATE,
  dispatched_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_emergency_reason_required CHECK (
    (triage_type = 'MORNING_QUEUE') OR
    (triage_type = 'EMERGENCY_OPS' AND emergency_reason IS NOT NULL AND char_length(trim(emergency_reason)) >= 10)
  )
);

-- 5. AUDIT_SNAPSHOTS (Numeric-Only Anonymized Metrics - ZERO RAW CHAT TEXT)
CREATE TABLE public.audit_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  label TEXT NOT NULL CHECK (char_length(trim(label)) BETWEEN 2 AND 100),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_messages INTEGER NOT NULL CHECK (total_messages >= 0),
  after_hours_messages INTEGER NOT NULL CHECK (after_hours_messages >= 0),
  shadow_overtime_hours NUMERIC(6,2) NOT NULL CHECK (shadow_overtime_hours >= 0),
  false_urgency_count INTEGER NOT NULL CHECK (false_urgency_count >= 0),
  peak_day_of_week SMALLINT NOT NULL CHECK (peak_day_of_week BETWEEN 1 AND 7),
  peak_hour SMALLINT NOT NULL CHECK (peak_hour BETWEEN 0 AND 23),
  -- Strictly 7x24 matrix of message counts
  heatmap_matrix JSONB NOT NULL CHECK (jsonb_typeof(heatmap_matrix) = 'array' AND jsonb_array_length(heatmap_matrix) = 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_period_order CHECK (period_end >= period_start),
  CONSTRAINT chk_after_hours_lte_total CHECK (after_hours_messages <= total_messages)
);

-- 6. TEAM_CHARTERS (Right-to-Disconnect Piagam)
CREATE TABLE public.team_charters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 120),
  company_or_team_name TEXT NOT NULL CHECK (char_length(trim(company_or_team_name)) BETWEEN 2 AND 100),
  quiet_hours_start TIME NOT NULL DEFAULT '18:00:00',
  quiet_hours_end TIME NOT NULL DEFAULT '08:00:00',
  non_urgent_sla_hours SMALLINT NOT NULL DEFAULT 2 CHECK (non_urgent_sla_hours BETWEEN 1 AND 24),
  emergency_criteria JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(emergency_criteria) = 'array'),
  baseline_shadow_hours NUMERIC(6,2) NULL CHECK (baseline_shadow_hours IS NULL OR baseline_shadow_hours >= 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_digest_cards_workspace_status ON public.digest_cards(workspace_id, status, scheduled_for DESC);
CREATE INDEX idx_audit_snapshots_workspace_created ON public.audit_snapshots(workspace_id, created_at DESC);
CREATE INDEX idx_team_charters_workspace_active ON public.team_charters(workspace_id, is_active);

-- Trigger: auto update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_digest_cards_updated_at BEFORE UPDATE ON public.digest_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_team_charters_updated_at BEFORE UPDATE ON public.team_charters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: auto create profile upon auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: auto add workspace creator as OWNER in workspace_members
CREATE OR REPLACE FUNCTION public.handle_new_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'OWNER')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_workspace_created_add_owner
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace_owner();

-- Trigger: auto-increment charter version and keep only one active charter per workspace
CREATE OR REPLACE FUNCTION public.handle_new_charter_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1
  INTO next_version
  FROM public.team_charters
  WHERE workspace_id = NEW.workspace_id;

  NEW.version := next_version;

  IF NEW.is_active THEN
    UPDATE public.team_charters
    SET is_active = false
    WHERE workspace_id = NEW.workspace_id AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_team_charters_version
  BEFORE INSERT ON public.team_charters
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_charter_version();

-- Enable Realtime on digest_cards
ALTER PUBLICATION supabase_realtime ADD TABLE public.digest_cards;

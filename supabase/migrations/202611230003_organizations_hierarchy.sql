-- BatasJamREG Multi-Workspace Hierarchy Migration
-- Organization -> Multiple Workspaces / Divisions + RLS & Demo Backfill

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 100),
  slug TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ORGANIZATION_MEMBERS
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER'
    CHECK (role IN ('OWNER', 'MEMBER')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- 3. ADD ORGANIZATION_ID TO WORKSPACES
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS organization_id UUID
  REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Indexes for query & RLS lookup performance
CREATE INDEX IF NOT EXISTS idx_organization_members_user
  ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_organization
  ON public.workspaces(organization_id);

-- Trigger: auto update updated_at on organizations
CREATE OR REPLACE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: auto add organization creator as OWNER in organization_members
CREATE OR REPLACE FUNCTION public.handle_new_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'OWNER')
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_organization_created_add_owner
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_organization_owner();

-- 4. SECURITY DEFINER HELPERS (locked search_path)
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = (SELECT auth.uid())
      AND role = 'OWNER'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_workspace_org_owner(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = ws_id
      AND w.organization_id IS NOT NULL
      AND public.is_org_owner(w.organization_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = (SELECT auth.uid())
  ) OR public.is_workspace_org_owner(ws_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id
      AND user_id = (SELECT auth.uid())
      AND role IN ('OWNER', 'LEAD')
  ) OR public.is_workspace_org_owner(ws_id);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 5. SAFE RPC: join_workspace_by_invite_code (also enrolls user in org as MEMBER)
CREATE OR REPLACE FUNCTION public.join_workspace_by_invite_code(p_invite_code TEXT)
RETURNS TABLE(workspace_id UUID, role TEXT) AS $$
DECLARE
  v_ws_id UUID;
  v_org_id UUID;
  v_role TEXT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT w.id, w.organization_id
  INTO v_ws_id, v_org_id
  FROM public.workspaces w
  WHERE upper(w.invite_code) = upper(trim(p_invite_code))
  LIMIT 1;

  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_CODE_NOT_FOUND';
  END IF;

  IF v_org_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, (SELECT auth.uid()), 'MEMBER')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_ws_id, (SELECT auth.uid()), 'MEMBER')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  SELECT wm.role INTO v_role
  FROM public.workspace_members wm
  WHERE wm.workspace_id = v_ws_id AND wm.user_id = (SELECT auth.uid());

  RETURN QUERY SELECT v_ws_id, v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. ROW-LEVEL SECURITY POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ORGANIZATIONS
CREATE POLICY "Org members or creator can view organization" ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id) OR created_by = (SELECT auth.uid()));

CREATE POLICY "Authenticated users can create organization" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Org owner can update organization" ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.is_org_owner(id))
  WITH CHECK (public.is_org_owner(id));

-- ORGANIZATION_MEMBERS
CREATE POLICY "Members can view organization roster" ON public.organization_members
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_org_member(organization_id));

CREATE POLICY "Org owner can insert organization member" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_owner(organization_id));

CREATE POLICY "Org owner can update organization member" ON public.organization_members
  FOR UPDATE TO authenticated
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

-- PROFILES
ALTER POLICY "Users can view own profile and teammates" ON public.profiles
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.workspace_members wm1
      JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = (SELECT auth.uid()) AND wm2.user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = profiles.id AND public.is_org_member(om.organization_id)
    )
  );

-- WORKSPACES
ALTER POLICY "Members or creator can view workspace" ON public.workspaces
  TO authenticated
  USING (
    public.is_workspace_member(id)
    OR public.is_org_owner(organization_id)
    OR created_by = (SELECT auth.uid())
  );

ALTER POLICY "Authenticated can create workspace" ON public.workspaces
  TO authenticated
  WITH CHECK (
    created_by = (SELECT auth.uid())
    AND (organization_id IS NULL OR public.is_org_owner(organization_id))
  );

ALTER POLICY "Admins can update workspace" ON public.workspaces
  TO authenticated
  USING (public.is_workspace_admin(id))
  WITH CHECK (public.is_workspace_admin(id));

-- WORKSPACE_MEMBERS
ALTER POLICY "Members can view workspace roster" ON public.workspace_members
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    OR public.is_workspace_org_owner(workspace_id)
  );

ALTER POLICY "Users can insert own membership" ON public.workspace_members
  TO authenticated
  WITH CHECK (public.is_workspace_org_owner(workspace_id));

CREATE POLICY "Org owner can update workspace member role" ON public.workspace_members
  FOR UPDATE TO authenticated
  USING (public.is_workspace_org_owner(workspace_id) AND role IN ('MEMBER', 'LEAD'))
  WITH CHECK (public.is_workspace_org_owner(workspace_id) AND role IN ('MEMBER', 'LEAD'));

-- DIGEST_CARDS / AUDIT_SNAPSHOTS / TEAM_CHARTERS SELECT alignment
ALTER POLICY "Members can read digest cards" ON public.digest_cards
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    OR public.is_workspace_org_owner(workspace_id)
  );

ALTER POLICY "Members can read snapshots" ON public.audit_snapshots
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    OR public.is_workspace_org_owner(workspace_id)
  );

ALTER POLICY "Members can read charters" ON public.team_charters
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    OR public.is_workspace_org_owner(workspace_id)
  );

-- 7. SAFE IDEMPOTENT BACKFILL FOR DEMO ORGANIZATION & SECOND DIVISION
DO $$
DECLARE
  v_demo_owner_id UUID;
  v_org_id UUID;
  v_eng_ws_id UUID;
  v_orphan RECORD;
  v_fallback_org_id UUID;
  v_heatmap JSONB := '[
    [0,0,0,0,0,0,0,1,4,22,28,24,12,26,31,29,24,18,16,24,30,36,22,8],
    [1,0,0,0,0,0,0,2,6,25,30,26,14,29,34,27,25,21,22,32,38,41,28,10],
    [0,0,0,0,0,0,0,1,5,21,27,22,11,24,29,28,22,19,20,28,34,39,24,7],
    [2,0,0,0,0,0,0,2,5,24,29,25,13,27,32,30,26,24,28,38,44,52,58,18],
    [1,0,0,0,0,0,0,1,4,20,25,21,10,22,26,24,20,17,18,25,29,31,19,6],
    [0,0,0,0,0,0,0,0,1,3,5,4,3,5,6,5,4,6,8,12,15,14,9,3],
    [0,0,0,0,0,0,0,0,0,2,4,3,2,4,5,4,3,5,7,11,14,16,10,4]
  ]'::jsonb;
BEGIN
  SELECT w.created_by
  INTO v_demo_owner_id
  FROM public.workspaces w
  WHERE w.invite_code = 'REG-8492'
  LIMIT 1;

  IF v_demo_owner_id IS NULL THEN
    SELECT u.id
    INTO v_demo_owner_id
    FROM auth.users u
    WHERE lower(u.email) = 'demo@batasjamreg.local'
    LIMIT 1;
  END IF;

  IF v_demo_owner_id IS NOT NULL THEN
    SELECT o.id INTO v_org_id
    FROM public.organizations o
    WHERE o.slug = 'pt-nusantara-digital'
    LIMIT 1;

    IF v_org_id IS NULL THEN
      INSERT INTO public.organizations (name, slug, created_by)
      VALUES ('PT Nusantara Digital', 'pt-nusantara-digital', v_demo_owner_id)
      ON CONFLICT (slug) DO NOTHING
      RETURNING id INTO v_org_id;

      IF v_org_id IS NULL THEN
        SELECT o.id INTO v_org_id
        FROM public.organizations o
        WHERE o.slug = 'pt-nusantara-digital'
        LIMIT 1;
      END IF;
    END IF;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_demo_owner_id, 'OWNER')
    ON CONFLICT (organization_id, user_id) DO UPDATE
      SET role = 'OWNER';

    UPDATE public.workspaces
    SET organization_id = v_org_id
    WHERE invite_code = 'REG-8492';

    INSERT INTO public.organization_members (organization_id, user_id, role)
    SELECT
      v_org_id,
      wm.user_id,
      CASE WHEN wm.role = 'OWNER' THEN 'OWNER' ELSE 'MEMBER' END
    FROM public.workspace_members wm
    JOIN public.workspaces w ON w.id = wm.workspace_id
    WHERE w.invite_code = 'REG-8492'
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    INSERT INTO public.workspaces (
      name,
      slug,
      invite_code,
      organization_id,
      work_pattern,
      work_start_time,
      work_end_time,
      digest_dispatch_time,
      timezone,
      work_days,
      created_by
    )
    VALUES (
      'Tim Produk & Engineering',
      'tim-produk-engineering',
      'REG-4105',
      v_org_id,
      'FIVE_DAYS_8H',
      '09:00:00',
      '17:00:00',
      '08:30:00',
      'Asia/Jakarta',
      '{1,2,3,4,5}',
      v_demo_owner_id
    )
    ON CONFLICT (invite_code) DO UPDATE
      SET organization_id = EXCLUDED.organization_id;

    SELECT w.id INTO v_eng_ws_id
    FROM public.workspaces w
    WHERE w.invite_code = 'REG-4105'
    LIMIT 1;

    IF v_eng_ws_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.audit_snapshots s WHERE s.workspace_id = v_eng_ws_id
    ) THEN
      INSERT INTO public.audit_snapshots (
        workspace_id,
        created_by,
        label,
        period_start,
        period_end,
        total_messages,
        after_hours_messages,
        shadow_overtime_hours,
        false_urgency_count,
        peak_day_of_week,
        peak_hour,
        heatmap_matrix
      )
      VALUES (
        v_eng_ws_id,
        v_demo_owner_id,
        'Audit Grup Engineering Sprint (Sep-Nov 2026)',
        '2026-08-25',
        '2026-11-22',
        2310,
        842,
        58.00,
        104,
        4,
        22,
        v_heatmap
      );
    END IF;
  END IF;

  -- Backfill any orphaned workspaces created before organizations existed
  FOR v_orphan IN
    SELECT w.id, w.name, w.created_by
    FROM public.workspaces w
    WHERE w.organization_id IS NULL
  LOOP
    SELECT o.id INTO v_fallback_org_id
    FROM public.organizations o
    WHERE o.created_by = v_orphan.created_by
    ORDER BY o.created_at ASC
    LIMIT 1;

    IF v_fallback_org_id IS NULL THEN
      INSERT INTO public.organizations (name, slug, created_by)
      VALUES (
        'Organisasi ' || left(v_orphan.name, 70),
        'org-' || substr(replace(v_orphan.id::text, '-', ''), 1, 12),
        v_orphan.created_by
      )
      RETURNING id INTO v_fallback_org_id;
    END IF;

    UPDATE public.workspaces
    SET organization_id = v_fallback_org_id
    WHERE id = v_orphan.id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    SELECT
      v_fallback_org_id,
      wm.user_id,
      CASE WHEN wm.role = 'OWNER' THEN 'OWNER' ELSE 'MEMBER' END
    FROM public.workspace_members wm
    WHERE wm.workspace_id = v_orphan.id
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END LOOP;
END $$;

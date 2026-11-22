-- BatasJamREG Row-Level Security (RLS) Policies & Safe RPCs
-- Single Source of Truth: DATABASE.md

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_charters ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER to avoid recursive RLS evaluation)
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND role IN ('OWNER', 'LEAD')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Safe RPC: join workspace by invite_code without exposing workspaces table publicly
CREATE OR REPLACE FUNCTION public.join_workspace_by_invite_code(p_invite_code TEXT)
RETURNS TABLE(workspace_id UUID, role TEXT) AS $$
DECLARE
  v_ws_id UUID;
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT id INTO v_ws_id
  FROM public.workspaces
  WHERE upper(invite_code) = upper(trim(p_invite_code))
  LIMIT 1;

  IF v_ws_id IS NULL THEN
    RAISE EXCEPTION 'INVITE_CODE_NOT_FOUND';
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_ws_id, auth.uid(), 'MEMBER')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  SELECT wm.role INTO v_role
  FROM public.workspace_members wm
  WHERE wm.workspace_id = v_ws_id AND wm.user_id = auth.uid();

  RETURN QUERY SELECT v_ws_id, v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile and teammates" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.workspace_members wm1
      JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid() AND wm2.user_id = profiles.id
    )
  );
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- WORKSPACES
CREATE POLICY "Members or creator can view workspace" ON public.workspaces
  FOR SELECT USING (public.is_workspace_member(id) OR created_by = auth.uid());
CREATE POLICY "Authenticated can create workspace" ON public.workspaces
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update workspace" ON public.workspaces
  FOR UPDATE USING (public.is_workspace_admin(id));

-- WORKSPACE_MEMBERS
CREATE POLICY "Members can view workspace roster" ON public.workspace_members
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Users can insert own membership" ON public.workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- DIGEST_CARDS
CREATE POLICY "Members can read digest cards" ON public.digest_cards
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Members can create digest cards" ON public.digest_cards
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) AND author_id = auth.uid());
CREATE POLICY "Author or admin can update digest cards" ON public.digest_cards
  FOR UPDATE USING (
    public.is_workspace_member(workspace_id) AND (author_id = auth.uid() OR public.is_workspace_admin(workspace_id))
  );
CREATE POLICY "Author or admin can delete digest cards" ON public.digest_cards
  FOR DELETE USING (
    public.is_workspace_member(workspace_id) AND (author_id = auth.uid() OR public.is_workspace_admin(workspace_id))
  );

-- AUDIT_SNAPSHOTS
CREATE POLICY "Members can read snapshots" ON public.audit_snapshots
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Members can insert snapshots" ON public.audit_snapshots
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) AND created_by = auth.uid());

-- TEAM_CHARTERS
CREATE POLICY "Members can read charters" ON public.team_charters
  FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Members can create charters" ON public.team_charters
  FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id) AND created_by = auth.uid());
CREATE POLICY "Admins can update charters" ON public.team_charters
  FOR UPDATE USING (public.is_workspace_admin(workspace_id));

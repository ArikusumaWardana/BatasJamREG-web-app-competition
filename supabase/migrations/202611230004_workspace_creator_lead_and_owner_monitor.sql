-- BatasJamREG Multi-Workspace Ownership & Monitoring Patch
-- Allows any organization member to create a team workspace (auto-assigned LEAD)
-- while organization OWNER can monitor all workspaces without joining workspace_members.

-- 1. Helper: check whether current user belongs to target organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT org_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Policy INSERT on workspaces: any active organization member (OWNER or MEMBER)
ALTER POLICY "Authenticated can create workspace" ON public.workspaces
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = created_by
    AND public.is_org_member(organization_id)
  );

-- 3. Trigger function on workspace insert: add creator to workspace_members as LEAD
CREATE OR REPLACE FUNCTION public.handle_new_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'LEAD')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_workspace_created_add_owner
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace_owner();

-- 4. Confirm SELECT policies allow workspace members OR organization OWNER
ALTER POLICY "Members or creator can view workspace" ON public.workspaces
  TO authenticated
  USING (
    public.is_workspace_member(id)
    OR public.is_org_owner(organization_id)
    OR created_by = (SELECT auth.uid())
  );

ALTER POLICY "Members can view workspace roster" ON public.workspace_members
  TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    OR public.is_workspace_org_owner(workspace_id)
  );

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

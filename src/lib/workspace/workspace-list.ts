import type { WorkspaceListItem, WorkspaceRole } from "@/features/workspace/types";
import type {
  IndonesiaTimezone,
  WorkPatternCode,
} from "@/lib/constants/work-hours";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface UserOrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "MEMBER";
  joined_at: string;
}

interface RawWorkspaceFields {
  id: string;
  organization_id: string | null;
  name: string;
  slug: string;
  invite_code: string;
  work_pattern: string;
  work_start_time: string;
  work_end_time: string;
  digest_dispatch_time: string;
  timezone: string;
  work_days: number[];
  created_at: string;
  updated_at: string;
}

function toWorkspaceListItem(
  ws: RawWorkspaceFields,
  role: WorkspaceRole,
  orgName: string | null,
  orgRole: "OWNER" | "MEMBER" | null,
  isJoined: boolean
): WorkspaceListItem {
  return {
    id: ws.id,
    organization_id: ws.organization_id,
    organization_name: orgName,
    org_role: orgRole,
    name: ws.name,
    slug: ws.slug,
    invite_code: ws.invite_code,
    work_pattern: ws.work_pattern as WorkPatternCode,
    work_start_time: ws.work_start_time,
    work_end_time: ws.work_end_time,
    digest_dispatch_time: ws.digest_dispatch_time,
    timezone: ws.timezone as IndonesiaTimezone,
    work_days: ws.work_days,
    role,
    is_joined: isJoined,
    created_at: ws.created_at,
    updated_at: ws.updated_at,
  };
}

export async function fetchAccessibleWorkspaces(
  supabase: SupabaseServerClient,
  userId: string
): Promise<{
  organizations: UserOrganizationSummary[];
  workspaces: WorkspaceListItem[];
  error: boolean;
}> {
  const [{ data: orgRows, error: orgError }, { data: memberRows, error: wsError }] =
    await Promise.all([
      supabase
        .from("organization_members")
        .select("role, joined_at, organizations(id, name, slug)")
        .eq("user_id", userId)
        .order("joined_at", { ascending: true }),
      supabase
        .from("workspace_members")
        .select(
          "role, joined_at, workspaces(id, organization_id, name, slug, invite_code, work_pattern, work_start_time, work_end_time, digest_dispatch_time, timezone, work_days, created_at, updated_at, organizations(name))"
        )
        .eq("user_id", userId)
        .order("joined_at", { ascending: true }),
    ]);

  if (orgError || wsError) {
    return { organizations: [], workspaces: [], error: true };
  }

  const organizations: UserOrganizationSummary[] = [];
  const orgById = new Map<string, UserOrganizationSummary>();

  for (const row of orgRows ?? []) {
    const org = Array.isArray(row.organizations)
      ? row.organizations[0]
      : row.organizations;
    if (!org) continue;
    const summary: UserOrganizationSummary = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      role: row.role === "OWNER" ? "OWNER" : "MEMBER",
      joined_at: row.joined_at,
    };
    organizations.push(summary);
    orgById.set(org.id, summary);
  }

  const ownedOrgIds = organizations
    .filter((item) => item.role === "OWNER")
    .map((item) => item.id);

  let ownedWorkspaces: RawWorkspaceFields[] = [];
  if (ownedOrgIds.length > 0) {
    const { data: orgWsRows, error: ownedErr } = await supabase
      .from("workspaces")
      .select(
        "id, organization_id, name, slug, invite_code, work_pattern, work_start_time, work_end_time, digest_dispatch_time, timezone, work_days, created_at, updated_at"
      )
      .in("organization_id", ownedOrgIds)
      .order("created_at", { ascending: true });

    if (ownedErr) {
      return { organizations, workspaces: [], error: true };
    }
    ownedWorkspaces = orgWsRows ?? [];
  }

  const resultMap = new Map<string, WorkspaceListItem>();

  for (const item of memberRows ?? []) {
    const rawWs = Array.isArray(item.workspaces)
      ? item.workspaces[0]
      : item.workspaces;
    if (!rawWs) continue;

    const nestedOrg = Array.isArray(rawWs.organizations)
      ? rawWs.organizations[0]
      : rawWs.organizations;
    const orgSummary = rawWs.organization_id
      ? orgById.get(rawWs.organization_id)
      : undefined;

    const isOwnerOfThisOrg = orgSummary?.role === "OWNER";
    const effectiveRole: WorkspaceRole = isOwnerOfThisOrg
      ? "OWNER"
      : (item.role as WorkspaceRole);
    const orgName = orgSummary?.name ?? nestedOrg?.name ?? null;
    const orgRole = orgSummary?.role ?? null;

    resultMap.set(
      rawWs.id,
      toWorkspaceListItem(rawWs, effectiveRole, orgName, orgRole, true)
    );
  }

  for (const ws of ownedWorkspaces) {
    if (resultMap.has(ws.id)) continue;
    const orgSummary = ws.organization_id
      ? orgById.get(ws.organization_id)
      : undefined;
    resultMap.set(
      ws.id,
      toWorkspaceListItem(ws, "OWNER", orgSummary?.name ?? null, "OWNER", false)
    );
  }

  return {
    organizations,
    workspaces: Array.from(resultMap.values()),
    error: false,
  };
}

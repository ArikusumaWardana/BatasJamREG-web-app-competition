export interface AppShellUser {
  id: string;
  fullName: string;
  roleTitle: string;
}

export interface AppShellOrganization {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
}

export interface AppShellWorkspace {
  id: string;
  name: string;
  role: string;
  inviteCode?: string;
  organizationId?: string | null;
  organizationName?: string | null;
  orgRole?: "OWNER" | "MEMBER" | null;
  isJoined?: boolean;
  workStartTime?: string;
  workEndTime?: string;
  digestDispatchTime?: string;
  timezone?: "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";
  workDays?: number[];
}

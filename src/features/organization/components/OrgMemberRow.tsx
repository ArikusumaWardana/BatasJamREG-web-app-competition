"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorkspaceMemberItem } from "../types";

interface OrgMemberRowProps {
  member: WorkspaceMemberItem;
  isUpdating: boolean;
  onRoleChange: (member: WorkspaceMemberItem, role: "MEMBER" | "LEAD") => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getMemberRoleLabel(role: string): string {
  if (role === "LEAD") return "Team Lead";
  if (role === "OWNER") return "Owner Organisasi";
  return "Member";
}

export function OrgMemberRow({
  member,
  isUpdating,
  onRoleChange,
}: OrgMemberRowProps) {
  return (
    <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-soft font-mono text-xs font-medium text-brand">
          {getInitials(member.full_name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-primary">
            {member.full_name}
          </p>
          <p className="truncate text-xs text-ink-secondary">
            {member.role_title}
          </p>
        </div>
      </div>

      {member.role === "OWNER" ? (
        <span className="inline-flex w-fit items-center rounded-full bg-brand-soft px-2.5 py-1 font-mono text-xs font-medium text-brand">
          OWNER ORGANISASI
        </span>
      ) : (
        <div className="flex items-center gap-2 sm:w-52">
          <Select
            value={member.role}
            disabled={isUpdating}
            onValueChange={(value) => {
              if (value === "MEMBER" || value === "LEAD") {
                onRoleChange(member, value);
              }
            }}
          >
            <SelectTrigger
              aria-label={`Ubah peran ${member.full_name}`}
              className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-xs font-medium text-ink-primary"
            >
              <SelectValue>
                {isUpdating ? "Menyimpan..." : getMemberRoleLabel(member.role)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="LEAD">Team Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

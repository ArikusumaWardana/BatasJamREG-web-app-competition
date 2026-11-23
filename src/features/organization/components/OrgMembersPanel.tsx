"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchWorkspaceMembers,
  updateWorkspaceMemberRole,
} from "../lib/organization-api";
import type { DivisionOverviewItem, WorkspaceMemberItem } from "../types";
import { getMemberRoleLabel, OrgMemberRow } from "./OrgMemberRow";

interface OrgMembersPanelProps {
  divisions: DivisionOverviewItem[];
  onRoleUpdated: () => void;
}

export function OrgMembersPanel({
  divisions,
  onRoleUpdated,
}: OrgMembersPanelProps) {
  const [selectedDivId, setSelectedDivId] = useState<string>(
    divisions[0]?.id ?? ""
  );
  const [members, setMembers] = useState<WorkspaceMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(divisions.length > 0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const effectiveDivId = divisions.some((d) => d.id === selectedDivId)
    ? selectedDivId
    : (divisions[0]?.id ?? "");

  const loadMembers = useCallback((workspaceId: string) => {
    if (!workspaceId) return;
    setIsLoading(true);
    setErrorMsg(null);
    void fetchWorkspaceMembers(workspaceId).then((res) => {
      setMembers(res.members);
      setErrorMsg(res.errorMsg);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!effectiveDivId) return;
    let active = true;
    void fetchWorkspaceMembers(effectiveDivId).then((res) => {
      if (!active) return;
      setMembers(res.members);
      setErrorMsg(res.errorMsg);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [effectiveDivId]);

  async function handleRoleChange(
    member: WorkspaceMemberItem,
    nextRole: "MEMBER" | "LEAD"
  ) {
    if (!effectiveDivId || nextRole === member.role || updatingUserId) return;
    setUpdatingUserId(member.user_id);
    const res = await updateWorkspaceMemberRole(
      effectiveDivId,
      member.user_id,
      nextRole
    );
    setUpdatingUserId(null);

    if (!res.ok) {
      toast.error(res.errorMsg);
      return;
    }

    setMembers((prev) =>
      prev.map((item) =>
        item.user_id === member.user_id ? res.member : item
      )
    );
    toast.success(
      `Peran ${member.full_name} diperbarui menjadi ${getMemberRoleLabel(nextRole)}.`
    );
    onRoleUpdated();
  }

  const activeDivision = divisions.find((d) => d.id === effectiveDivId);

  return (
    <section
      aria-label="Kelola anggota dan penetapan Team Lead"
      className="rounded-lg border border-border-hairline bg-surface p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-brand"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-ink-primary">
              Kelola Anggota &amp; Penetapan Team Lead
            </h2>
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Tetapkan anggota divisi sebagai Team Lead agar dapat mengatur jam
            reguler divisi dan memoderasi Morning Digest.
          </p>
        </div>

        {divisions.length > 0 ? (
          <div className="flex w-full flex-col gap-1.5 sm:w-72">
            <Label
              htmlFor="org-member-division-select"
              className="text-xs font-medium text-ink-secondary"
            >
              Pilih Divisi
            </Label>
            <Select
              value={effectiveDivId}
              onValueChange={(value) => {
                if (value && value !== effectiveDivId) {
                  setSelectedDivId(value);
                  loadMembers(value);
                }
              }}
            >
              <SelectTrigger
                id="org-member-division-select"
                className="h-10 w-full rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm"
              >
                <SelectValue>
                  {activeDivision?.name ?? "Pilih divisi"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>
                    {div.name} ({div.member_count} anggota)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      {!effectiveDivId ? (
        <p className="rounded-md border border-border-hairline bg-canvas p-4 text-xs text-ink-secondary">
          Buat divisi terlebih dahulu untuk mengelola anggota dan menetapkan Team
          Lead.
        </p>
      ) : isLoading ? (
        <div className="flex items-center gap-2 rounded-md border border-border-hairline bg-canvas p-4 text-xs text-ink-secondary">
          <Loader2
            className="h-4 w-4 animate-spin text-brand"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span>Memuat daftar anggota divisi...</span>
        </div>
      ) : errorMsg ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-hairline bg-canvas p-4">
          <div className="flex items-center gap-2 text-xs text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => loadMembers(effectiveDivId)}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Muat Ulang</span>
          </button>
        </div>
      ) : members.length === 0 ? (
        <p className="rounded-md border border-border-hairline bg-canvas p-4 text-xs text-ink-secondary">
          Belum ada anggota lain pada divisi {activeDivision?.name}. Bagikan kode{" "}
          <span className="font-mono font-medium text-ink-primary">
            {activeDivision?.invite_code}
          </span>{" "}
          agar rekan tim dapat bergabung.
        </p>
      ) : (
        <div className="divide-y divide-border-hairline rounded-md border border-border-hairline bg-canvas">
          {members.map((member) => (
            <OrgMemberRow
              key={member.user_id}
              member={member}
              isUpdating={updatingUserId === member.user_id}
              onRoleChange={(m, nextRole) => void handleRoleChange(m, nextRole)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

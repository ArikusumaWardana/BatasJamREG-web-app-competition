"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, RefreshCw } from "lucide-react";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CharterSignOffCard } from "@/features/charter/components/CharterSignOffCard";
import type { CharterAdoptionSummary } from "@/features/charter/types";
import { WellbeingPulseCard } from "@/features/wellbeing/components/WellbeingPulseCard";
import {
  getStoredActiveWorkspaceId,
  setStoredActiveWorkspaceId,
} from "@/lib/storage/active-workspace";
import { fetchWorkspaceBundle } from "../lib/workspace-api";
import type { WorkspaceDetail, WorkspaceListItem } from "../types";
import { EmergencyAuditSummaryCard } from "./EmergencyAuditSummaryCard";
import { JoinWorkspaceCard } from "./JoinWorkspaceCard";
import { SharePublicStatusCard } from "./SharePublicStatusCard";
import { SnapshotTrendCard } from "./SnapshotTrendCard";
import { WorkspaceOnboarding } from "./WorkspaceOnboarding";
import { WorkspaceSettingsCard } from "./WorkspaceSettingsCard";
import { WorkspaceSummaryCards } from "./WorkspaceSummaryCards";
import { WorkStatusBanner } from "./WorkStatusBanner";

export function WorkspaceDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedWsId = searchParams.get("ws") ?? undefined;

  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const preferred = requestedWsId ?? getStoredActiveWorkspaceId() ?? undefined;
    void fetchWorkspaceBundle(preferred).then((bundle) => {
      if (!active) return;
      if (bundle.selectedId) {
        setStoredActiveWorkspaceId(bundle.selectedId);
      }
      setWorkspaces(bundle.workspaces);
      setSelectedId(bundle.selectedId);
      setDetail(bundle.detail);
      setErrorMsg(bundle.errorMsg);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [requestedWsId]);

  const reloadWorkspace = useCallback(
    async (preferredId?: string) => {
      setIsLoading(true);
      setErrorMsg(null);
      const targetPreferred =
        preferredId ?? requestedWsId ?? getStoredActiveWorkspaceId() ?? undefined;
      const bundle = await fetchWorkspaceBundle(targetPreferred);
      if (bundle.selectedId) {
        setStoredActiveWorkspaceId(bundle.selectedId);
      }
      setWorkspaces(bundle.workspaces);
      setSelectedId(bundle.selectedId);
      setDetail(bundle.detail);
      setErrorMsg(bundle.errorMsg);
      setIsLoading(false);
    },
    [requestedWsId]
  );

  const handleCharterAdoptionChange = useCallback(
    (summary: CharterAdoptionSummary) => {
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              charter_adoption: {
                charter_id: summary.charter_id,
                signed_count: summary.signed_count,
                total_members: summary.total_members,
                adoption_percentage: summary.adoption_percentage,
                has_signed: summary.has_signed,
              },
            }
          : prev
      );
    },
    []
  );

  function handleSelectDivision(id: string) {
    setStoredActiveWorkspaceId(id);
    router.replace(`/workspace?ws=${id}`);
    void reloadWorkspace(id);
  }

  if (isLoading) {
    return (
      <PageLoadingOverlay
        variant="panel"
        message="Sedang memuat ringkasan workspace..."
      />
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border-hairline bg-surface p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-base font-semibold">Gagal Memuat Workspace</h1>
        </div>
        <p className="text-sm text-ink-secondary">{errorMsg}</p>
        <button
          type="button"
          onClick={() => void reloadWorkspace(selectedId ?? undefined)}
          className="inline-flex min-h-[38px] items-center gap-2 rounded-md border border-border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink-primary hover:bg-surface-muted"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  if (workspaces.length === 0 || !detail) {
    return (
      <WorkspaceOnboarding
        onCompleted={(newWorkspaceId) => {
          void reloadWorkspace(newWorkspaceId);
        }}
      />
    );
  }

  const activeWorkspaceItem = workspaces.find((item) => item.id === detail.id);
  const isMonitorOnly =
    detail.org_role === "OWNER" && detail.is_joined === false;

  return (
    <div className="flex flex-col gap-6">
      {workspaces.length > 1 || isMonitorOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-secondary">
              {detail.organization_name
                ? `${detail.organization_name} (${workspaces.length} divisi)`
                : `Workspace Aktif (${workspaces.length} tersedia)`}
            </span>
            {isMonitorOnly ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border-hairline bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                <Eye className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                <span>Mode Pantau</span>
              </span>
            ) : null}
          </div>
          {workspaces.length > 1 ? (
            <Select
              value={detail.id}
              onValueChange={(value) => {
                if (value) handleSelectDivision(value);
              }}
            >
              <SelectTrigger className="w-full max-w-sm rounded-md border-border-hairline bg-surface pr-3 pl-4 text-sm font-medium text-ink-primary data-[size=default]:h-11 sm:w-80">
                <SelectValue>
                  {activeWorkspaceItem?.name ?? detail.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} (
                    {item.is_joined === false ? "Mode Pantau" : item.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      ) : null}

      <WorkStatusBanner workspace={detail} />

      <WorkspaceSummaryCards workspace={detail} />

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <SnapshotTrendCard
            snapshots={detail.recent_snapshots}
            workDays={detail.work_days}
          />
          <WellbeingPulseCard key={`wb-${detail.id}`} workspaceId={detail.id} />
          <EmergencyAuditSummaryCard
            summary={detail.emergency_audit_summary}
            workspaceId={detail.id}
          />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5">
          {detail.active_charter ? (
            <CharterSignOffCard
              key={`ack-${detail.active_charter.id}`}
              workspaceId={detail.id}
              charterId={detail.active_charter.id}
              charterTitle={detail.active_charter.title}
              version={detail.active_charter.version}
              onSummaryChange={handleCharterAdoptionChange}
            />
          ) : null}
          <SharePublicStatusCard workspace={detail} />
          <JoinWorkspaceCard
            inviteCode={detail.invite_code}
            memberCount={detail.member_count}
            organizationId={detail.organization_id}
            canCreateDivision
            onWorkspaceSelected={(id) => handleSelectDivision(id)}
          />
          <WorkspaceSettingsCard
            workspace={detail}
            onUpdated={(updated) => {
              setDetail(updated);
              setWorkspaces((prev) =>
                prev.map((item) =>
                  item.id === updated.id
                    ? { ...item, name: updated.name }
                    : item
                )
              );
            }}
          />
        </div>
      </section>
    </div>
  );
}

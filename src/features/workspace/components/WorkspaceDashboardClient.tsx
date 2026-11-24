"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, RefreshCw } from "lucide-react";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { BENTO_CARD_CLS, BENTO_PILL_PRIMARY_CLS } from "@/components/shared/BentoPrimitives";
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
import { WorkspaceHeroCard } from "./WorkspaceHeroCard";
import { WorkspaceOnboarding } from "./WorkspaceOnboarding";
import { WorkspaceSettingsCard } from "./WorkspaceSettingsCard";

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
      <div className={`flex flex-col items-start gap-3 ${BENTO_CARD_CLS}`}>
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-base font-semibold">Gagal Memuat Workspace</h1>
        </div>
        <p className="text-sm text-ink-secondary">{errorMsg}</p>
        <button
          type="button"
          onClick={() => void reloadWorkspace(selectedId ?? undefined)}
          className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-stone-200 bg-surface px-4 py-2 text-xs font-medium text-ink-primary hover:bg-surface-muted"
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
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
            Selamat Datang,{" "}
            <span className="font-normal text-ink-secondary">{detail.name}</span>
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
            <span>
              {detail.organization_name
                ? `${detail.organization_name} (${workspaces.length} divisi)`
                : `Workspace Aktif (${workspaces.length} tersedia)`}
            </span>
            {isMonitorOnly ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-surface px-2.5 py-0.5 text-[11px] font-medium text-ink-secondary">
                <Eye className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                <span>Mode Pantau</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {workspaces.length > 1 ? (
            <Select value={detail.id} onValueChange={(v) => v && handleSelectDivision(v)}>
              <SelectTrigger className="w-full min-w-[200px] rounded-full border-stone-200/80 bg-surface pr-4 pl-4 text-xs font-medium text-ink-primary shadow-2xs data-[size=default]:h-10 sm:w-64">
                <SelectValue>{activeWorkspaceItem?.name ?? detail.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.is_joined === false ? "Mode Pantau" : item.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Link href={`/workspace/digest?ws=${detail.id}`} className={BENTO_PILL_PRIMARY_CLS}>
            <span>Buka Morning Digest</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-5"><WorkspaceHeroCard workspace={detail} /></div>
        <div className="min-w-0 xl:col-span-7">
          <SnapshotTrendCard snapshots={detail.recent_snapshots} workDays={detail.work_days} />
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-7">
          <WellbeingPulseCard key={`wb-${detail.id}`} workspaceId={detail.id} />
          <EmergencyAuditSummaryCard summary={detail.emergency_audit_summary} workspaceId={detail.id} />
        </div>
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
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
          <SharePublicStatusCard id="status-publik" workspace={detail} />
        </div>
      </section>

      <section aria-label="Akses Anggota dan Pengaturan Divisi" className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <JoinWorkspaceCard
            inviteCode={detail.invite_code}
            memberCount={detail.member_count}
            organizationId={detail.organization_id}
            canCreateDivision
            onWorkspaceSelected={handleSelectDivision}
          />
        </div>
        <div className="min-w-0 lg:col-span-7">
          <WorkspaceSettingsCard
            workspace={detail}
            onUpdated={(updated) => {
              setDetail(updated);
              setWorkspaces((prev) => prev.map((item) => (item.id === updated.id ? { ...item, name: updated.name } : item)));
            }}
          />
        </div>
      </section>
    </div>
  );
}

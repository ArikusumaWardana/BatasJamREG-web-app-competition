"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWorkspaceBundle } from "../lib/workspace-api";
import type { WorkspaceDetail, WorkspaceListItem } from "../types";
import { JoinWorkspaceCard } from "./JoinWorkspaceCard";
import { SnapshotTrendCard } from "./SnapshotTrendCard";
import { WorkspaceSettingsCard } from "./WorkspaceSettingsCard";
import { WorkspaceSummaryCards } from "./WorkspaceSummaryCards";
import { WorkStatusBanner } from "./WorkStatusBanner";

function DashboardSkeleton() {
  return (
    <PageLoadingOverlay
      variant="panel"
      message="Sedang memuat ringkasan workspace..."
    />
  );
}

export function WorkspaceDashboardClient() {
  const [workspaces, setWorkspaces] = useState<WorkspaceListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WorkspaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchWorkspaceBundle().then((bundle) => {
      if (!active) return;
      setWorkspaces(bundle.workspaces);
      setSelectedId(bundle.selectedId);
      setDetail(bundle.detail);
      setErrorMsg(bundle.errorMsg);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function reloadWorkspace(preferredId?: string) {
    setIsLoading(true);
    setErrorMsg(null);
    const bundle = await fetchWorkspaceBundle(preferredId);
    setWorkspaces(bundle.workspaces);
    setSelectedId(bundle.selectedId);
    setDetail(bundle.detail);
    setErrorMsg(bundle.errorMsg);
    setIsLoading(false);
  }

  if (isLoading) {
    return <DashboardSkeleton />;
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
      <div className="mx-auto max-w-xl">
        <div className="mb-4 rounded-lg border border-border-hairline bg-surface p-6">
          <h1 className="text-xl font-bold tracking-tight text-ink-primary">
            Selamat Datang di Workspace BatasJamREG
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            Anda belum tergabung ke workspace mana pun. Masukkan kode undangan
            dari rekan tim atau buat workspace baru untuk mulai mengatur batas
            jam digital.
          </p>
        </div>
        <JoinWorkspaceCard
          onWorkspaceSelected={(id) => void reloadWorkspace(id)}
        />
      </div>
    );
  }

  const activeWorkspaceItem = workspaces.find((item) => item.id === detail.id);

  return (
    <div className="flex flex-col gap-6">
      {workspaces.length > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink-secondary">
            Workspace Aktif ({workspaces.length} tersedia)
          </span>
          <Select
            value={detail.id}
            onValueChange={(value) => {
              if (value) void reloadWorkspace(value);
            }}
          >
            <SelectTrigger className="h-9 w-full max-w-xs rounded-md border-border-hairline bg-surface pr-8 pl-3 text-sm text-ink-primary">
              <SelectValue>
                {activeWorkspaceItem?.name ?? detail.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} ({item.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <WorkStatusBanner workspace={detail} />

      <WorkspaceSummaryCards workspace={detail} />

      <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SnapshotTrendCard snapshots={detail.recent_snapshots} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-5">
          <JoinWorkspaceCard
            inviteCode={detail.invite_code}
            memberCount={detail.member_count}
            onWorkspaceSelected={(id) => void reloadWorkspace(id)}
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

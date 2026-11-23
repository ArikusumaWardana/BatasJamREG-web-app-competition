"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronsUpDown, Eye } from "lucide-react";
import { CreateDivisionDialog } from "@/features/organization/components/CreateDivisionDialog";
import {
  getServerActiveWorkspaceId,
  getStoredActiveWorkspaceId,
  setStoredActiveWorkspaceId,
  subscribeActiveWorkspaceId,
} from "@/lib/storage/active-workspace";
import { JoinDivisionDialog } from "./JoinDivisionDialog";
import type {
  AppShellOrganization,
  AppShellWorkspace,
} from "./shell-types";
import { WorkspaceSwitcherMenu } from "./WorkspaceSwitcherMenu";

interface WorkspaceSwitcherProps {
  organization?: AppShellOrganization | null;
  workspaces?: AppShellWorkspace[];
  activeWorkspace?: AppShellWorkspace | null;
  onStartNavigation?: (href: string) => void;
  onNavigate?: () => void;
}

export function WorkspaceSwitcher({
  organization,
  workspaces = [],
  activeWorkspace,
  onStartNavigation,
  onNavigate,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const storedWsId = useSyncExternalStore(
    subscribeActiveWorkspaceId,
    getStoredActiveWorkspaceId,
    getServerActiveWorkspaceId
  );

  const currentWorkspace =
    workspaces.find((item) => item.id === storedWsId) ??
    activeWorkspace ??
    workspaces[0] ??
    null;

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function navigateToDivision(workspaceId: string) {
    setStoredActiveWorkspaceId(workspaceId);
    setMenuOpen(false);
    onNavigate?.();
    const targetBase =
      pathname === "/workspace/digest" ? "/workspace/digest" : "/workspace";
    onStartNavigation?.(targetBase);
    router.push(`${targetBase}?ws=${workspaceId}`);
  }

  const orgDisplayName =
    organization?.name ??
    currentWorkspace?.organizationName ??
    "Tempat Kerja Anda";
  const isOwner = organization?.role === "OWNER";
  const isMonitorOnly =
    isOwner && currentWorkspace !== null && currentWorkspace.isJoined === false;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Pilih divisi atau kelola tempat kerja"
        className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-md border border-border-hairline bg-canvas p-2.5 text-left transition-colors hover:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary">
            <Building2
              className="h-3 w-3 shrink-0 text-brand"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span className="truncate">{orgDisplayName}</span>
          </div>
          <p className="mt-0.5 truncate text-xs font-semibold text-ink-primary">
            {currentWorkspace?.name ?? "Belum ada divisi"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand">
              {currentWorkspace?.role ?? organization?.role ?? "BARU"}
            </span>
            {isMonitorOnly ? (
              <span className="inline-flex items-center gap-1 rounded border border-border-hairline bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary">
                <Eye className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Mode Pantau</span>
              </span>
            ) : isOwner ? (
              <span className="inline-flex items-center rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-secondary">
                ORG OWNER
              </span>
            ) : null}
          </div>
        </div>
        <ChevronsUpDown
          className="h-4 w-4 shrink-0 text-ink-secondary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {menuOpen ? (
        <WorkspaceSwitcherMenu
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspace?.id ?? null}
          isOwner={isOwner}
          canCreateDivision={Boolean(organization)}
          onSelectDivision={navigateToDivision}
          onOpenCreate={() => {
            setMenuOpen(false);
            setCreateOpen(true);
          }}
          onOpenJoin={() => {
            setMenuOpen(false);
            setJoinOpen(true);
          }}
        />
      ) : null}

      <CreateDivisionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organization?.id}
        organizationName={organization?.name}
        onCreated={navigateToDivision}
      />

      <JoinDivisionDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onJoined={navigateToDivision}
      />
    </div>
  );
}

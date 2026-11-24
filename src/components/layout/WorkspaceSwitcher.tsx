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
import { cn } from "@/lib/utils";
import { JoinDivisionDialog } from "./JoinDivisionDialog";
import type {
  AppShellOrganization,
  AppShellWorkspace,
} from "./shell-types";
import { WorkspaceSwitcherMenu } from "./WorkspaceSwitcherMenu";

interface WorkspaceSwitcherProps {
  variant?: "pill" | "drawer";
  organization?: AppShellOrganization | null;
  workspaces?: AppShellWorkspace[];
  activeWorkspace?: AppShellWorkspace | null;
  onStartNavigation?: (href: string) => void;
  onNavigate?: () => void;
}

export function WorkspaceSwitcher({
  variant = "drawer",
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
      {variant === "pill" ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Pilih divisi atau kelola tempat kerja"
          className="inline-flex h-10 max-w-[180px] items-center gap-2 rounded-full border border-stone-200 bg-surface px-3 py-1.5 text-left transition-colors hover:bg-surface-muted md:max-w-[240px]"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink-primary">
            {currentWorkspace?.name ?? orgDisplayName}
          </span>
          <ChevronsUpDown
            className="h-3.5 w-3.5 shrink-0 text-ink-secondary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Pilih divisi atau kelola tempat kerja"
          className="flex min-h-[44px] w-full items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-canvas p-2.5 text-left transition-colors hover:bg-surface-muted"
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
              <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
                {currentWorkspace?.role ?? organization?.role ?? "BARU"}
              </span>
              {isMonitorOnly ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-secondary">
                  <Eye className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Mode Pantau</span>
                </span>
              ) : isOwner ? (
                <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 font-mono text-[10px] font-medium text-ink-secondary">
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
      )}

      {menuOpen ? (
        <div className={cn(variant === "pill" ? "relative" : "")}>
          <WorkspaceSwitcherMenu
            variant={variant}
            fallbackOrgName={orgDisplayName}
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
        </div>
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

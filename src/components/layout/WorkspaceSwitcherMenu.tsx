"use client";

import { Check, Eye, KeyRound, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppShellWorkspace } from "./shell-types";

interface WorkspaceSwitcherMenuProps {
  workspaces: AppShellWorkspace[];
  currentWorkspaceId: string | null;
  isOwner: boolean;
  canCreateDivision: boolean;
  onSelectDivision: (workspaceId: string) => void;
  onOpenCreate: () => void;
  onOpenJoin: () => void;
}

export function WorkspaceSwitcherMenu({
  workspaces,
  currentWorkspaceId,
  isOwner,
  canCreateDivision,
  onSelectDivision,
  onOpenCreate,
  onOpenJoin,
}: WorkspaceSwitcherMenuProps) {
  return (
    <div
      role="menu"
      aria-label="Daftar divisi dan aksi tempat kerja"
      className="absolute right-0 left-0 z-40 mt-1.5 rounded-lg border border-border-hairline bg-surface p-1.5 shadow-sm"
    >
      <div className="px-2 py-1 text-[11px] font-medium text-ink-secondary">
        {isOwner
          ? `Semua Divisi Perusahaan (${workspaces.length})`
          : `Divisi Anda (${workspaces.length})`}
      </div>

      {workspaces.length > 0 ? (
        <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
          {workspaces.map((item) => {
            const isSelected = currentWorkspaceId === item.id;
            const isMonitorOnly = isOwner && item.isJoined === false;

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => onSelectDivision(item.id)}
                className={cn(
                  "flex min-h-[40px] w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  isSelected
                    ? "bg-brand-soft font-medium text-brand"
                    : "text-ink-primary hover:bg-surface-muted"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate">{item.name}</p>
                  {isMonitorOnly ? (
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-border-hairline bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary">
                      <Eye className="h-2.5 w-2.5" strokeWidth={1.5} aria-hidden="true" />
                      <span>Mode Pantau</span>
                    </span>
                  ) : null}
                </div>

                <span className="flex shrink-0 items-center gap-1">
                  <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-ink-secondary">
                    {item.role}
                  </span>
                  {isSelected ? (
                    <Check
                      className="h-3.5 w-3.5 text-brand"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="px-2 py-1.5 text-xs text-ink-secondary">
          Belum ada divisi aktif.
        </p>
      )}

      <div className="mt-1.5 flex flex-col gap-1 border-t border-border-hairline pt-1.5">
        {canCreateDivision ? (
          <button
            type="button"
            role="menuitem"
            onClick={onOpenCreate}
            className="flex min-h-[40px] w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-brand transition-colors hover:bg-brand-soft"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <span>Buat Divisi Baru</span>
          </button>
        ) : null}

        <button
          type="button"
          role="menuitem"
          onClick={onOpenJoin}
          className="flex min-h-[40px] w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
        >
          <KeyRound
            className="h-3.5 w-3.5 shrink-0 text-ink-secondary"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span>Gabung Divisi via Kode</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, Loader2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  DemoActorConfig,
  DemoRoleUserOption,
} from "@/lib/constants/demo-actors";

interface DemoActorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleConfig: DemoActorConfig | null;
  users: DemoRoleUserOption[];
  loadingEmail: string | null;
  onSelectUser: (user: DemoRoleUserOption) => void;
}

export function DemoActorPickerDialog({
  open,
  onOpenChange,
  roleConfig,
  users,
  loadingEmail,
  onSelectUser,
}: DemoActorPickerDialogProps) {
  if (!roleConfig) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-semibold text-brand">
              {roleConfig.actor}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-ink-secondary">
              <Users className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span>{users.length} akun demo</span>
            </span>
          </div>
          <DialogTitle className="text-lg font-semibold text-ink-primary">
            Pilih Akun Demo: {roleConfig.shortLabel}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-ink-secondary">
            Klik salah satu pengguna di bawah ini untuk langsung masuk ke
            workspace demo dengan sesi aktif.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1">
          {users.map((user) => {
            const isThisLoading = loadingEmail === user.email;
            return (
              <button
                key={user.email}
                type="button"
                disabled={loadingEmail !== null}
                onClick={() => onSelectUser(user)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-border-hairline bg-canvas px-3.5 py-2.5 text-left transition-colors hover:border-brand hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-primary">
                      {user.fullName}
                    </span>
                    <span className="rounded border border-border-hairline bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-secondary">
                      {user.roleTitle}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-secondary">
                    {user.divisionSummary}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
                    {user.email}
                  </p>
                </div>

                {isThisLoading ? (
                  <Loader2
                    className="h-4 w-4 shrink-0 animate-spin text-brand"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-brand"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

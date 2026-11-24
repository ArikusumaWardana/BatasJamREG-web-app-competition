"use client";

import { useState } from "react";
import { ArrowRight, Loader2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEMO_ACTORS,
  DEMO_ROLE_USERS,
  getDemoActorConfig,
  type DemoActorRole,
  type DemoRoleUserOption,
} from "@/lib/constants/demo-actors";
import { cn } from "@/lib/utils";

type RoleFilter = "ALL" | DemoActorRole;

interface DemoActorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadingEmail: string | null;
  onSelectUser: (user: DemoRoleUserOption) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "BJ";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getRoleStyles(role: DemoActorRole) {
  if (role === "OWNER") {
    return {
      label: "OWNER",
      avatar: "bg-brand text-white",
      badge: "bg-brand text-white",
    };
  }
  if (role === "LEAD") {
    return {
      label: "TEAM LEAD",
      avatar: "bg-brand-soft text-brand",
      badge: "bg-brand-soft text-brand",
    };
  }
  return {
    label: "ANGGOTA",
    avatar: "bg-safe-soft text-safe",
    badge: "bg-safe-soft text-safe",
  };
}

export function DemoActorPickerDialog({
  open,
  onOpenChange,
  loadingEmail,
  onSelectUser,
}: DemoActorPickerDialogProps) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const filterOptions: { value: RoleFilter; label: string }[] = [
    { value: "ALL", label: `Semua (${DEMO_ROLE_USERS.length})` },
    ...DEMO_ACTORS.map((item) => {
      const count = DEMO_ROLE_USERS.filter((u) => u.actor === item.actor).length;
      return { value: item.actor, label: `${item.shortLabel} (${count})` };
    }),
  ];

  const activeRoleConfig =
    roleFilter === "ALL" ? null : getDemoActorConfig(roleFilter);
  const filteredUsers =
    roleFilter === "ALL"
      ? DEMO_ROLE_USERS
      : DEMO_ROLE_USERS.filter((user) => user.actor === roleFilter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-1.5rem)] rounded-[24px] border-stone-200/80 p-5 sm:max-w-xl sm:p-6">
        <DialogHeader>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            <span>Akses Cepat Evaluasi</span>
          </span>
          <DialogTitle className="pt-1 text-lg font-semibold text-ink-primary">
            Pilih Aktor &amp; Role Demo
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-ink-secondary">
            Klik salah satu akun untuk langsung masuk ke workspace dengan sesi
            aktif.
          </DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label="Filter role aktor demo"
          className="flex flex-wrap gap-1.5 rounded-2xl bg-stone-100/80 p-1.5"
        >
          {filterOptions.map((option) => {
            const active = roleFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                disabled={loadingEmail !== null}
                onClick={() => setRoleFilter(option.value)}
                className={cn(
                  "min-h-[34px] flex-1 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-50",
                  active
                    ? "bg-brand text-white shadow-2xs"
                    : "text-ink-secondary hover:bg-surface hover:text-ink-primary"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {activeRoleConfig ? (
          <div className="rounded-xl bg-brand-soft/70 px-3.5 py-2.5 text-xs leading-relaxed text-brand">
            {activeRoleConfig.description}
          </div>
        ) : null}

        <div className="max-h-[50vh] space-y-2.5 overflow-y-auto pr-1.5">
          {filteredUsers.map((user) => {
            const isThisLoading = loadingEmail === user.email;
            const roleStyle = getRoleStyles(user.actor);
            return (
              <button
                key={user.email}
                type="button"
                disabled={loadingEmail !== null}
                onClick={() => onSelectUser(user)}
                className="flex w-full shrink-0 items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-bento-canvas/50 px-4 py-3.5 text-left transition-colors hover:border-brand hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold",
                      roleStyle.avatar
                    )}
                  >
                    {getInitials(user.fullName)}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold leading-snug text-ink-primary">
                        {user.fullName}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
                          roleStyle.badge
                        )}
                      >
                        {roleStyle.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-secondary">
                      <span className="font-medium text-ink-primary/80">
                        {user.roleTitle}
                      </span>{" "}
                      - {user.divisionSummary}
                    </p>
                    <p className="break-all font-mono text-[11px] leading-snug text-ink-muted">
                      {user.email}
                    </p>
                  </div>
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

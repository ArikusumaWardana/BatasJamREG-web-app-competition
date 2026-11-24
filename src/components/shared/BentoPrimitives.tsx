import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const BENTO_CARD_CLS =
  "rounded-[24px] border border-stone-200/70 bg-surface p-5 shadow-[0_2px_12px_rgba(28,25,23,0.03)] sm:p-6";

export const BENTO_INNER_CARD_CLS =
  "rounded-[18px] border border-stone-200/70 bg-canvas/80 p-4";

export const BENTO_PILL_PRIMARY_CLS =
  "inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";

export const BENTO_PILL_OUTLINE_CLS =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-stone-200 bg-surface px-4 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50";

interface BentoCardHeaderProps {
  icon?: React.ReactNode;
  iconToneClass?: string;
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  rightSlot?: React.ReactNode;
}

export function BentoCardHeader({
  icon,
  iconToneClass = "bg-brand-soft text-brand",
  title,
  subtitle,
  actionHref,
  actionLabel,
  rightSlot,
}: BentoCardHeaderProps) {
  const hasRightSlot = Boolean(rightSlot);

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        hasRightSlot && "flex-wrap"
      )}
    >
      <div
        className={cn(
          "flex flex-1 items-start gap-3",
          hasRightSlot ? "min-w-[200px]" : "min-w-0"
        )}
      >
        {icon ? (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              iconToneClass
            )}
          >
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold leading-snug text-ink-primary">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {rightSlot ? (
        <div className="max-w-full shrink-0">{rightSlot}</div>
      ) : actionHref ? (
        <Link
          href={actionHref}
          aria-label={actionLabel ?? title}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-surface text-ink-secondary transition-colors hover:border-brand-border hover:bg-brand-soft hover:text-brand"
        >
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

interface AvatarStackProps {
  names: string[];
  maxVisible?: number;
  sizeClass?: string;
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AvatarStack({
  names,
  maxVisible = 4,
  sizeClass = "h-8 w-8 text-[11px]",
}: AvatarStackProps) {
  const visible = names.slice(0, maxVisible);
  const remaining = Math.max(0, names.length - visible.length);

  if (names.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((name, idx) => (
        <span
          key={`${name}-${idx}`}
          title={name}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-soft font-mono font-semibold text-brand ring-2 ring-surface",
            sizeClass
          )}
        >
          {toInitials(name)}
        </span>
      ))}
      {remaining > 0 ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-brand font-mono font-semibold text-white ring-2 ring-surface",
            sizeClass
          )}
        >
          +{remaining}
        </span>
      ) : null}
    </div>
  );
}

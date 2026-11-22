"use client";

import type { CSSProperties } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ duration = 3500, ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      duration={duration}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle2
            className="h-4 w-4 text-safe"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ),
        info: (
          <Info
            className="h-4 w-4 text-brand"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ),
        warning: (
          <AlertTriangle
            className="h-4 w-4 text-warn"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ),
        error: (
          <AlertCircle
            className="h-4 w-4 text-danger"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ),
        loading: (
          <Loader2
            className="h-4 w-4 animate-spin text-brand"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ),
      }}
      style={
        {
          "--normal-bg": "#FFFFFF",
          "--normal-text": "#1C1917",
          "--normal-border": "#E7E5E4",
          "--border-radius": "8px",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "bg-surface text-ink-primary border border-border-hairline rounded-lg shadow-sm",
          title: "text-sm font-medium text-ink-primary",
          description: "text-xs text-ink-secondary",
        },
      }}
      {...props}
    />
  );
}

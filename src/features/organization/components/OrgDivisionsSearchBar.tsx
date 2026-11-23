"use client";

import { Search, X } from "lucide-react";

interface OrgDivisionsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputId?: string;
  placeholder?: string;
}

export function OrgDivisionsSearchBar({
  value,
  onChange,
  onClear,
  inputId = "org-divisions-search",
  placeholder = "Cari divisi, lead, kode...",
}: OrgDivisionsSearchBarProps) {
  return (
    <div className="relative w-full sm:w-64">
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border-hairline bg-canvas pr-8 pl-8 text-xs text-ink-primary placeholder:text-ink-muted focus:border-brand focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Hapus pencarian divisi"
          className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-ink-muted hover:bg-surface-muted hover:text-ink-primary"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

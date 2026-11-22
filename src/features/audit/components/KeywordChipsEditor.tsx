"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface KeywordChipsEditorProps {
  keywords: string[];
  disabled?: boolean;
  onChange: (nextKeywords: string[]) => void;
}

export function KeywordChipsEditor({
  keywords,
  disabled = false,
  onChange,
}: KeywordChipsEditorProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  function addKeyword() {
    const trimmed = newKeyword.trim();
    if (trimmed.length < 2) return;
    const duplicate = keywords.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setNewKeyword("");
      setShowAddInput(false);
      return;
    }
    onChange([...keywords, trimmed]);
    setNewKeyword("");
    setShowAddInput(false);
  }

  function removeKeyword(target: string) {
    onChange(keywords.filter((item) => item !== target));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-ink-secondary">
        Kata Kunci False Urgency
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 rounded-full border border-border-hairline bg-surface-muted px-2.5 py-1 text-xs text-ink-primary"
          >
            <span>{kw}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeKeyword(kw)}
              aria-label={`Hapus kata kunci ${kw}`}
              className="rounded-full p-0.5 text-ink-secondary hover:text-ink-primary"
            >
              <X className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </span>
        ))}

        {showAddInput ? (
          <div className="flex items-center gap-1">
            <Input
              type="text"
              placeholder="Frasa baru..."
              value={newKeyword}
              onChange={(event) => setNewKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addKeyword();
                }
              }}
              aria-label="Tambah kata kunci false urgency"
              className="h-7 w-28 rounded-full border-border-hairline px-2.5 text-xs"
            />
            <button
              type="button"
              disabled={newKeyword.trim().length < 2}
              onClick={addKeyword}
              className="h-7 rounded-full bg-brand px-2.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowAddInput(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border-strong bg-surface px-2.5 py-1 text-xs font-medium text-brand hover:bg-brand-soft"
          >
            <Plus className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            <span>Tambah</span>
          </button>
        )}
      </div>
    </div>
  );
}

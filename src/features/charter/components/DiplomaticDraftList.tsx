"use client";

import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DiplomaticReplyDraft, DiplomaticReplySource } from "../types";

interface DiplomaticDraftListProps {
  source: DiplomaticReplySource;
  replies: DiplomaticReplyDraft[];
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
}

export function DiplomaticDraftList({
  source,
  replies,
  copiedIndex,
  onCopy,
}: DiplomaticDraftListProps) {
  return (
    <section
      aria-label="Alternatif balasan siap kirim"
      className="flex flex-col gap-4 lg:col-span-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink-primary">
          3 Alternatif Balasan Siap Kirim
        </h2>
        <Badge
          variant="outline"
          className={
            source === "AI"
              ? "border-safe/30 bg-safe-soft text-safe"
              : "border-brand-border bg-brand-soft text-brand"
          }
        >
          {source === "AI" ? "Diperhalus AI" : "Template Terkurasi"}
        </Badge>
      </div>

      {replies.length === 0 ? (
        <Card className="border-border-hairline bg-surface">
          <CardContent className="py-8 text-center text-sm text-ink-secondary">
            Isi jendela kerja (minimal 3 karakter) dan konteks singkat (minimal 5
            karakter) untuk menyusun 3 draf balasan diplomatis.
          </CardContent>
        </Card>
      ) : (
        replies.map((reply, index) => {
          const isCopied = copiedIndex === index;
          return (
            <Card key={reply.label} className="border-border-hairline bg-surface">
              <CardContent className="flex flex-col gap-3 pt-5">
                <div className="flex items-center justify-between gap-2 border-b border-border-hairline pb-3">
                  <span className="text-sm font-semibold text-ink-primary">
                    {index + 1}. {reply.label}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onCopy(reply.text, index)}
                    className={cn(
                      isCopied && "border-safe bg-safe-soft text-safe hover:bg-safe-soft"
                    )}
                  >
                    {isCopied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>{isCopied ? "Tersalin" : "Salin Balasan"}</span>
                  </Button>
                </div>
                <p className="text-sm leading-relaxed text-ink-primary">
                  {reply.text}
                </p>
              </CardContent>
            </Card>
          );
        })
      )}
    </section>
  );
}

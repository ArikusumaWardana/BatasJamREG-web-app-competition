"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  diplomaticReplySchema,
  type DiplomaticReplyInput,
} from "@/lib/validations";
import { requestDiplomaticReplies } from "../lib/charter-api";
import { generateTemplateReplies } from "../lib/diplomatic-templates";
import type { DiplomaticReplyDraft, DiplomaticReplySource } from "../types";
import { DiplomaticDraftList } from "./DiplomaticDraftList";
import { DiplomaticScenarioCard } from "./DiplomaticScenarioCard";

export function DiplomaticReplyTab() {
  const [formInput, setFormInput] = useState<DiplomaticReplyInput>({
    recipient: "MANAGER",
    time_context: "NIGHT",
    tone: "POLITE_STARTUP",
    short_context: "Diminta revisi deck presentasi untuk rapat lusa jam 21.30 WIB",
    next_work_window: "Besok pukul 09.00 WIB",
  });
  const [aiResult, setAiResult] = useState<{
    key: string;
    source: DiplomaticReplySource;
    replies: DiplomaticReplyDraft[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const inputKey = JSON.stringify(formInput);
  const validation = diplomaticReplySchema.safeParse(formInput);
  const isFormValid = validation.success;

  const activeMatch = aiResult?.key === inputKey ? aiResult : null;
  const activeSource: DiplomaticReplySource =
    activeMatch?.source ?? "TEMPLATE_FALLBACK";
  const activeReplies: DiplomaticReplyDraft[] = activeMatch
    ? activeMatch.replies
    : validation.success
      ? generateTemplateReplies(validation.data)
      : [];

  async function handleRefineWithAi() {
    if (!validation.success || isGenerating) return;
    setIsGenerating(true);
    const result = await requestDiplomaticReplies(validation.data);
    setIsGenerating(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    setAiResult({
      key: inputKey,
      source: result.data.source,
      replies: result.data.replies,
    });

    if (result.data.source === "AI") {
      toast.success("3 variasi balasan berhasil diperhalus oleh AI.");
    } else {
      toast.info(
        "Layanan AI tidak aktif atau batas kuota tercapai; menampilkan template terkurasi."
      );
    }
  }

  function handleResetToTemplate() {
    if (!isFormValid) return;
    setAiResult(null);
    toast.success("Menampilkan 3 draf template terkurasi instan.");
  }

  async function handleCopyReply(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Draf balasan disalin ke clipboard.");
      window.setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    } catch {
      toast.error("Gagal menyalin teks balasan ke clipboard.");
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
      <section className="lg:col-span-5">
        <DiplomaticScenarioCard
          formInput={formInput}
          isFormValid={isFormValid}
          isGenerating={isGenerating}
          onChange={setFormInput}
          onRefineWithAi={handleRefineWithAi}
          onResetToTemplate={handleResetToTemplate}
        />
      </section>

      <DiplomaticDraftList
        source={activeSource}
        replies={activeReplies}
        copiedIndex={copiedIndex}
        onCopy={handleCopyReply}
      />
    </div>
  );
}

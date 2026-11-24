"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileCheck, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readAuditHandoff } from "@/lib/storage/audit-handoff";
import {
  fetchActiveCharterWorkspace,
  fetchWorkspaceCharters,
} from "../lib/charter-api";
import type { CharterDraft, TeamCharterRecord } from "../types";
import { CharterBuilderTab } from "./CharterBuilderTab";
import { DiplomaticReplyTab } from "./DiplomaticReplyTab";

const DEFAULT_DRAFT: CharterDraft = {
  title: "Piagam Jam Digital Tim Kreatif Nusantara",
  company_or_team_name: "Tim Kreatif Nusantara",
  quiet_hours_start: "18:00:00",
  quiet_hours_end: "08:00:00",
  non_urgent_sla_hours: 2,
  emergency_criteria: [
    "Server produksi atau layanan publik mengalami downtime",
    "Insiden keamanan data atau kebocoran akses",
    "Revisi krisis kampanye yang sedang tayang aktif",
  ],
  baseline_shadow_hours: 42.5,
  version: 1,
};

export function CharterPageClient() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "reply" ? "reply" : "piagam";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "guest"
  >("loading");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [savedCharters, setSavedCharters] = useState<TeamCharterRecord[]>([]);
  const [auditHandoffNote, setAuditHandoffNote] = useState<string | null>(null);
  const [draft, setDraft] = useState<CharterDraft>(DEFAULT_DRAFT);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      const wsResult = await fetchActiveCharterWorkspace();
      if (cancelled) return;

      const handoff = readAuditHandoff();
      const handoffBaseline = handoff ? handoff.shadow_overtime_hours : null;
      if (handoff) {
        setAuditHandoffNote(
          `Baseline ${handoff.shadow_overtime_hours.toLocaleString("id-ID", {
            maximumFractionDigits: 1,
          })} jam lembur bayangan diterapkan dari hasil Audit Lokal (${handoff.source_label}).`
        );
      }

      if (wsResult.status === "guest" || !wsResult.workspace) {
        setAuthStatus(wsResult.status);
        setWorkspaceId(null);
        if (handoffBaseline !== null) {
          setDraft((prev) => ({
            ...prev,
            baseline_shadow_hours: handoffBaseline,
          }));
        }
        return;
      }

      setAuthStatus("authenticated");
      setWorkspaceId(wsResult.workspace.id);

      const charters = await fetchWorkspaceCharters(wsResult.workspace.id);
      if (cancelled) return;

      setSavedCharters(charters);
      const latest = charters.find((item) => item.is_active) ?? charters[0];

      if (latest) {
        setDraft({
          title: latest.title,
          company_or_team_name: latest.company_or_team_name,
          quiet_hours_start: latest.quiet_hours_start,
          quiet_hours_end: latest.quiet_hours_end,
          non_urgent_sla_hours: latest.non_urgent_sla_hours,
          emergency_criteria:
            latest.emergency_criteria.length > 0
              ? latest.emergency_criteria
              : DEFAULT_DRAFT.emergency_criteria,
          baseline_shadow_hours:
            handoffBaseline ?? latest.baseline_shadow_hours,
          version: latest.version,
          effective_date: latest.created_at,
          timezone: wsResult.workspace.timezone,
          organization_name: wsResult.workspace.organization_name ?? null,
          organization_stamp_url:
            wsResult.workspace.organization_stamp_url ?? null,
        });
      } else {
        setDraft((prev) => ({
          ...prev,
          company_or_team_name: wsResult.workspace?.name ?? prev.company_or_team_name,
          baseline_shadow_hours: handoffBaseline ?? prev.baseline_shadow_hours,
          timezone: wsResult.workspace?.timezone ?? prev.timezone,
          organization_name:
            wsResult.workspace?.organization_name ?? prev.organization_name ?? null,
          organization_stamp_url:
            wsResult.workspace?.organization_stamp_url ??
            prev.organization_stamp_url ??
            null,
        }));
      }
    }

    void loadInitialState();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleCharterSaved(saved: TeamCharterRecord) {
    setSavedCharters((prev) => [
      saved,
      ...prev.map((item) => ({ ...item, is_active: false })),
    ]);
    setDraft((prev) => ({
      ...prev,
      version: saved.version,
      effective_date: saved.created_at,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
              Studio Piagam,{" "}
              <span className="font-normal text-ink-secondary">
                &amp; Balasan Diplomatis
              </span>
            </h1>
            <p className="text-sm text-ink-secondary">
              Tetapkan kesepakatan jam kerja digital tertulis dan susun balasan
              sopan di luar jam reguler.
            </p>
          </div>

          <TabsList className="grid w-full max-w-full shrink-0 grid-cols-1 gap-1 rounded-[20px] border border-stone-200/80 bg-surface p-1.5 shadow-2xs group-data-horizontal/tabs:h-auto sm:inline-flex sm:w-fit sm:flex-nowrap sm:rounded-full sm:p-1">
            <TabsTrigger
              value="piagam"
              className={`h-auto min-h-[40px] w-full gap-2 rounded-[14px] px-4 py-2 text-xs font-medium transition-colors sm:w-auto sm:rounded-full sm:px-5 ${
                activeTab === "piagam"
                  ? "!bg-brand !text-white shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <FileCheck
                className={`size-4 ${activeTab === "piagam" ? "text-white" : "text-brand"}`}
              />
              <span>Piagam Jam Digital Tim</span>
            </TabsTrigger>
            <TabsTrigger
              value="reply"
              className={`h-auto min-h-[40px] w-full gap-2 rounded-[14px] px-4 py-2 text-xs font-medium transition-colors sm:w-auto sm:rounded-full sm:px-5 ${
                activeTab === "reply"
                  ? "!bg-brand !text-white shadow-2xs"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <MessageSquare
                className={`size-4 ${activeTab === "reply" ? "text-white" : "text-brand"}`}
              />
              <span>Penyusun Balasan Diplomatis</span>
            </TabsTrigger>
          </TabsList>
        </header>

        <TabsContent value="piagam">
          <CharterBuilderTab
            draft={draft}
            authStatus={authStatus}
            workspaceId={workspaceId}
            savedCharters={savedCharters}
            auditHandoffNote={auditHandoffNote}
            onDraftChange={setDraft}
            onCharterSaved={handleCharterSaved}
          />
        </TabsContent>

        <TabsContent value="reply">
          <DiplomaticReplyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

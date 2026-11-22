"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkspaceListItem } from "@/features/workspace/types";
import { useRealtimeDigest } from "../hooks/useRealtimeDigest";
import {
  deleteDigestCardRequest,
  loadActiveWorkspaceContext,
} from "../lib/digest-api";
import { filterDigestCardsByTab } from "../lib/wa-formatter";
import type { DigestCardItem, DigestTabKey } from "../types";
import { CreateDigestCardDialog } from "./CreateDigestCardDialog";
import { DigestCardListTab } from "./DigestCardListTab";
import { DigestFormatterPanel } from "./DigestFormatterPanel";
import { DigestHeaderBanner } from "./DigestHeaderBanner";

export function DigestBoardClient() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceListItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DigestTabKey>("MORNING_QUEUE");
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<DigestCardItem | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadActiveWorkspaceContext().then((ctx) => {
      if (!active) return;
      setWorkspace(ctx.workspace);
      setUserId(ctx.userId);
      setWsError(ctx.error);
      setWsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const {
    cards,
    isLoading: cardsLoading,
    error: cardsError,
    realtimeStatus,
    refreshCards,
  } = useRealtimeDigest(workspace?.id ?? null);

  if (wsLoading) {
    return (
      <PageLoadingOverlay
        variant="panel"
        message="Sedang memuat papan Morning Digest..."
      />
    );
  }

  if (wsError) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border-hairline bg-surface p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-base font-semibold">Gagal Memuat Papan Digest</h1>
        </div>
        <p className="text-sm text-ink-secondary">{wsError}</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-border-hairline bg-surface p-6">
        <h1 className="text-xl font-bold text-ink-primary">
          Belum Ada Workspace Aktif
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Bergabung ke workspace atau buat tim baru terlebih dahulu di halaman
          Ringkasan Tim sebelum mengelola Morning Digest.
        </p>
        <Link
          href="/workspace"
          className="mt-4 inline-flex min-h-[40px] items-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
        >
          Buka Ringkasan Tim
        </Link>
      </div>
    );
  }

  const morningCards = filterDigestCardsByTab(cards, "MORNING_QUEUE");
  const emergencyCards = filterDigestCardsByTab(cards, "EMERGENCY_OPS");
  const dispatchedCards = filterDigestCardsByTab(cards, "DISPATCHED");
  const selectedMorningCards = morningCards.filter(
    (item) => !deselectedIds.has(item.id)
  );
  const isAdmin = workspace.role === "OWNER" || workspace.role === "LEAD";

  function handleToggleSelect(cardId: string, checked: boolean) {
    setDeselectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }

  async function handleDeleteCard(cardId: string) {
    if (!workspace || deletingCardId) return;
    setDeletingCardId(cardId);
    const res = await deleteDigestCardRequest(workspace.id, cardId);
    setDeletingCardId(null);

    if (!res.ok) {
      toast.error(res.errorMessage ?? "Gagal menghapus kartu instruksi.");
      return;
    }

    toast.success("Kartu instruksi berhasil dihapus.");
    await refreshCards();
    router.refresh();
  }

  function openCreateModal() {
    setEditingCard(null);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <DigestHeaderBanner
        workspace={workspace}
        realtimeStatus={realtimeStatus}
        onOpenCreate={openCreateModal}
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section
          aria-label="Daftar instruksi Morning Digest"
          className="flex flex-col gap-4 lg:col-span-8"
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setActiveTab(value as DigestTabKey);
              }
            }}
          >
            <TabsList
              variant="line"
              className="w-full justify-start border-b border-border-hairline pb-0"
            >
              <TabsTrigger value="MORNING_QUEUE">
                Antrean Pagi ({morningCards.length})
              </TabsTrigger>
              <TabsTrigger value="EMERGENCY_OPS">
                Darurat Operasional ({emergencyCards.length})
              </TabsTrigger>
              <TabsTrigger value="DISPATCHED">
                Sudah Terkirim ({dispatchedCards.length})
              </TabsTrigger>
            </TabsList>

            {(
              [
                { key: "MORNING_QUEUE", items: morningCards },
                { key: "EMERGENCY_OPS", items: emergencyCards },
                { key: "DISPATCHED", items: dispatchedCards },
              ] as const
            ).map(({ key, items }) => (
              <TabsContent key={key} value={key} className="pt-3">
                <DigestCardListTab
                  items={items}
                  tab={key}
                  isLoading={cardsLoading}
                  error={cardsError}
                  userId={userId}
                  isAdmin={isAdmin}
                  deselectedIds={deselectedIds}
                  deletingCardId={deletingCardId}
                  onRetry={() => void refreshCards()}
                  onCreateNew={openCreateModal}
                  onToggleSelect={handleToggleSelect}
                  onEdit={(target) => {
                    setEditingCard(target);
                    setDialogOpen(true);
                  }}
                  onDelete={(id) => void handleDeleteCard(id)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <DigestFormatterPanel
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          timezone={workspace.timezone}
          queuedCards={morningCards}
          selectedCards={selectedMorningCards}
          onSelectAll={() => setDeselectedIds(new Set())}
          onClearSelection={() =>
            setDeselectedIds(new Set(morningCards.map((item) => item.id)))
          }
          onDispatched={() => {
            setDeselectedIds(new Set());
            void refreshCards();
          }}
        />
      </div>

      <CreateDigestCardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workspaceId={workspace.id}
        editingCard={editingCard}
        onSaved={() => void refreshCards()}
      />
    </div>
  );
}

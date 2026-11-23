"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { WorkspaceListItem } from "@/features/workspace/types";
import {
  getStoredActiveWorkspaceId,
  setStoredActiveWorkspaceId,
} from "@/lib/storage/active-workspace";
import { useRealtimeDigest } from "../hooks/useRealtimeDigest";
import {
  deleteDigestCardRequest,
  loadActiveWorkspaceContext,
  reviewEmergencyCardRequest,
} from "../lib/digest-api";
import {
  filterDigestCardsByTab,
  formatEmergencyWhatsAppMessage,
} from "../lib/wa-formatter";
import type {
  DigestCardItem,
  DigestTabKey,
  EmergencyReviewStatus,
} from "../types";
import { CreateDigestCardDialog } from "./CreateDigestCardDialog";
import { DigestBoardFallback } from "./DigestBoardFallback";
import { DigestFormatterPanel } from "./DigestFormatterPanel";
import { DigestHeaderBanner } from "./DigestHeaderBanner";
import { DigestTabsSection } from "./DigestTabsSection";
import { EmergencyWhatsAppPreview } from "./EmergencyWhatsAppPreview";

export function DigestBoardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedWsId = searchParams.get("ws") ?? undefined;
  const [workspace, setWorkspace] = useState<WorkspaceListItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [wsLoading, setWsLoading] = useState(true);
  const [wsError, setWsError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DigestTabKey>("MORNING_QUEUE");
  const [deselectedIds, setDeselectedIds] = useState<Set<string>>(new Set());
  const [selectedEmergencyCardId, setSelectedEmergencyCardId] = useState<
    string | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<DigestCardItem | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [reviewingCardId, setReviewingCardId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const preferred = requestedWsId ?? getStoredActiveWorkspaceId() ?? undefined;
    void loadActiveWorkspaceContext(preferred).then((ctx) => {
      if (!active) return;
      if (ctx.workspace) {
        setStoredActiveWorkspaceId(ctx.workspace.id);
      }
      setWorkspace(ctx.workspace);
      setUserId(ctx.userId);
      setWsError(ctx.error);
      setWsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [requestedWsId]);

  const {
    cards,
    isLoading: cardsLoading,
    error: cardsError,
    realtimeStatus,
    refreshCards,
  } = useRealtimeDigest(workspace?.id ?? null);

  if (wsLoading || wsError || !workspace) {
    return <DigestBoardFallback wsLoading={wsLoading} wsError={wsError} />;
  }

  const morningCards = filterDigestCardsByTab(cards, "MORNING_QUEUE");
  const emergencyCards = filterDigestCardsByTab(cards, "EMERGENCY_OPS");
  const dispatchedCards = filterDigestCardsByTab(cards, "DISPATCHED");
  const selectedMorningCards = morningCards.filter(
    (item) => !deselectedIds.has(item.id)
  );
  const activeEmergencyCard =
    emergencyCards.find((item) => item.id === selectedEmergencyCardId) ??
    emergencyCards[0] ??
    null;
  const isAdmin = workspace.role === "OWNER" || workspace.role === "LEAD";

  async function handleCopyEmergencyCard(card: DigestCardItem) {
    if (!workspace) return;
    setSelectedEmergencyCardId(card.id);
    const text = formatEmergencyWhatsAppMessage(card, workspace.name);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Pesan darurat WhatsApp berhasil disalin");
    } catch {
      toast.error("Gagal menyalin pesan darurat ke clipboard.");
    }
  }

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

  async function handleReviewEmergency(
    cardId: string,
    status: Exclude<EmergencyReviewStatus, "PENDING">
  ) {
    if (!workspace || reviewingCardId) return;
    setReviewingCardId(cardId);
    const res = await reviewEmergencyCardRequest(workspace.id, cardId, status);
    setReviewingCardId(null);

    if (!res.ok) {
      toast.error(res.errorMessage ?? "Gagal mengevaluasi kartu darurat.");
      return;
    }

    toast.success(
      status === "VALID_EMERGENCY"
        ? "Kartu ditandai sebagai Darurat Valid."
        : "Kartu dicatat sebagai Seharusnya Antrean Pagi."
    );
    await refreshCards();
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
        <DigestTabsSection
          activeTab={activeTab}
          morningCards={morningCards}
          emergencyCards={emergencyCards}
          dispatchedCards={dispatchedCards}
          isLoading={cardsLoading}
          error={cardsError}
          userId={userId}
          isAdmin={isAdmin}
          deselectedIds={deselectedIds}
          selectedEmergencyCardId={activeEmergencyCard?.id ?? null}
          deletingCardId={deletingCardId}
          reviewingCardId={reviewingCardId}
          onTabChange={setActiveTab}
          onRetry={() => void refreshCards()}
          onCreateNew={openCreateModal}
          onToggleSelect={handleToggleSelect}
          onSelectEmergencyCard={setSelectedEmergencyCardId}
          onCopyEmergencyCard={(card) => void handleCopyEmergencyCard(card)}
          onEdit={(target) => {
            setEditingCard(target);
            setDialogOpen(true);
          }}
          onDelete={(id) => void handleDeleteCard(id)}
          onReviewEmergency={(id, status) =>
            void handleReviewEmergency(id, status)
          }
        />

        {activeTab === "EMERGENCY_OPS" ? (
          <EmergencyWhatsAppPreview
            workspaceName={workspace.name}
            card={activeEmergencyCard}
          />
        ) : (
          <DigestFormatterPanel
            workspaceId={workspace.id}
            workspaceName={workspace.name}
            timezone={workspace.timezone}
            dispatchTime={workspace.digest_dispatch_time}
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
        )}
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

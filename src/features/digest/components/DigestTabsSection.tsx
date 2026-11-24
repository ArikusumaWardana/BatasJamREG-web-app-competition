"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DigestCardItem,
  DigestTabKey,
  EmergencyReviewStatus,
} from "../types";
import { DigestCardListTab } from "./DigestCardListTab";

interface DigestTabsSectionProps {
  activeTab: DigestTabKey;
  morningCards: DigestCardItem[];
  emergencyCards: DigestCardItem[];
  dispatchedCards: DigestCardItem[];
  isLoading: boolean;
  error: string | null;
  userId: string | null;
  isAdmin: boolean;
  deselectedIds: Set<string>;
  selectedEmergencyCardId: string | null;
  deletingCardId: string | null;
  reviewingCardId: string | null;
  onTabChange: (tab: DigestTabKey) => void;
  onRetry: () => void;
  onCreateNew: () => void;
  onToggleSelect: (cardId: string, checked: boolean) => void;
  onSelectEmergencyCard: (cardId: string) => void;
  onCopyEmergencyCard: (card: DigestCardItem) => void;
  onEdit: (card: DigestCardItem) => void;
  onDelete: (cardId: string) => void;
  onReviewEmergency: (
    cardId: string,
    status: Exclude<EmergencyReviewStatus, "PENDING">
  ) => void;
}

export function DigestTabsSection({
  activeTab,
  morningCards,
  emergencyCards,
  dispatchedCards,
  isLoading,
  error,
  userId,
  isAdmin,
  deselectedIds,
  selectedEmergencyCardId,
  deletingCardId,
  reviewingCardId,
  onTabChange,
  onRetry,
  onCreateNew,
  onToggleSelect,
  onSelectEmergencyCard,
  onCopyEmergencyCard,
  onEdit,
  onDelete,
  onReviewEmergency,
}: DigestTabsSectionProps) {
  const tabs = [
    { key: "MORNING_QUEUE", items: morningCards },
    { key: "EMERGENCY_OPS", items: emergencyCards },
    { key: "DISPATCHED", items: dispatchedCards },
  ] as const;

  return (
    <section
      aria-label="Daftar instruksi Morning Digest"
      className="flex min-w-0 flex-col gap-4 lg:col-span-7"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onTabChange(value as DigestTabKey);
          }
        }}
      >
        <TabsList className="flex w-full max-w-full flex-wrap justify-start gap-1 rounded-[20px] border border-stone-200/80 bg-surface p-1.5 shadow-2xs group-data-horizontal/tabs:h-auto sm:inline-flex sm:w-fit sm:flex-nowrap sm:rounded-full sm:p-1">
          <TabsTrigger
            value="MORNING_QUEUE"
            className={`h-auto min-h-[36px] flex-1 rounded-[14px] px-3.5 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:rounded-full sm:px-4 ${
              activeTab === "MORNING_QUEUE"
                ? "!bg-brand !text-white shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Antrean Pagi ({morningCards.length})
          </TabsTrigger>
          <TabsTrigger
            value="EMERGENCY_OPS"
            className={`h-auto min-h-[36px] flex-1 rounded-[14px] px-3.5 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:rounded-full sm:px-4 ${
              activeTab === "EMERGENCY_OPS"
                ? "!bg-brand !text-white shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Darurat Operasional ({emergencyCards.length})
          </TabsTrigger>
          <TabsTrigger
            value="DISPATCHED"
            className={`h-auto min-h-[36px] flex-1 rounded-[14px] px-3.5 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:rounded-full sm:px-4 ${
              activeTab === "DISPATCHED"
                ? "!bg-brand !text-white shadow-2xs"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            Riwayat ({dispatchedCards.length})
          </TabsTrigger>
        </TabsList>

        {tabs.map(({ key, items }) => (
          <TabsContent key={key} value={key} className="pt-3">
            <DigestCardListTab
              items={items}
              tab={key}
              isLoading={isLoading}
              error={error}
              userId={userId}
              isAdmin={isAdmin}
              deselectedIds={deselectedIds}
              selectedEmergencyCardId={selectedEmergencyCardId}
              deletingCardId={deletingCardId}
              reviewingCardId={reviewingCardId}
              onRetry={onRetry}
              onCreateNew={onCreateNew}
              onToggleSelect={onToggleSelect}
              onSelectEmergencyCard={onSelectEmergencyCard}
              onCopyEmergencyCard={onCopyEmergencyCard}
              onEdit={onEdit}
              onDelete={onDelete}
              onReviewEmergency={onReviewEmergency}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

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
      className="flex flex-col gap-4 lg:col-span-8"
    >
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            onTabChange(value as DigestTabKey);
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

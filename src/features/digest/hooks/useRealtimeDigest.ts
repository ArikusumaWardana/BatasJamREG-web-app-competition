"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DigestCardItem, RealtimeStatus } from "../types";

async function fetchDigestCards(workspaceId: string): Promise<{
  cards: DigestCardItem[];
  error: string | null;
}> {
  try {
    const response = await fetch(`/api/workspaces/${workspaceId}/digest-cards`);
    const payload = (await response.json()) as {
      success?: boolean;
      data?: DigestCardItem[];
      error?: { message?: string };
    };

    if (!response.ok || !payload.success || !payload.data) {
      return {
        cards: [],
        error: payload.error?.message ?? "Gagal memuat daftar kartu digest.",
      };
    }

    return { cards: payload.data, error: null };
  } catch {
    return {
      cards: [],
      error: "Koneksi terputus saat memuat papan Morning Digest.",
    };
  }
}

export function useRealtimeDigest(workspaceId: string | null) {
  const [cards, setCards] = useState<DigestCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(workspaceId));
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("CONNECTING");

  const refreshCards = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoading(true);
    const result = await fetchDigestCards(workspaceId);
    setCards(result.cards);
    setError(result.error);
    setIsLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;

    let active = true;
    const supabase = createClient();

    void fetchDigestCards(workspaceId).then((result) => {
      if (!active) return;
      setCards(result.cards);
      setError(result.error);
      setIsLoading(false);
    });

    const channel = supabase
      .channel(`digest_cards:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "digest_cards",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          void fetchDigestCards(workspaceId).then((result) => {
            if (!active) return;
            if (!result.error) {
              setCards(result.cards);
              setError(null);
            }
          });
        }
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("CONNECTED");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setRealtimeStatus("DISCONNECTED");
        } else {
          setRealtimeStatus("CONNECTING");
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  return {
    cards,
    isLoading,
    error,
    realtimeStatus,
    refreshCards,
  };
}

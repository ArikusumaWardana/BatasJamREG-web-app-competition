import type {
  AppShellOrganization,
  AppShellUser,
  AppShellWorkspace,
} from "@/components/layout/shell-types";

export interface CachedShellContext {
  mode: "authenticated" | "guest";
  user: AppShellUser | null;
  organization: AppShellOrganization | null;
  workspaces: AppShellWorkspace[];
  activeWorkspace: AppShellWorkspace | null;
  queuedDigestCount: number;
}

const STORAGE_KEY = "batasjamreg:shell-ctx:v3";
const listeners = new Set<() => void>();

let memoryCache: CachedShellContext | null = null;
let initialized = false;

function readInitialCache(): CachedShellContext | null {
  if (typeof window === "undefined") return null;
  if (initialized) return memoryCache;
  initialized = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      ((parsed as CachedShellContext).mode === "authenticated" ||
        (parsed as CachedShellContext).mode === "guest") &&
      Array.isArray((parsed as CachedShellContext).workspaces)
    ) {
      memoryCache = parsed as CachedShellContext;
    }
  } catch {
    memoryCache = null;
  }
  return memoryCache;
}

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeShellContextCache(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getShellContextSnapshot(): CachedShellContext | null {
  return readInitialCache();
}

export function getServerShellContextSnapshot(): CachedShellContext | null {
  return null;
}

export function saveShellContextCache(next: CachedShellContext): void {
  if (typeof window === "undefined") return;
  initialized = true;
  const serializedNext = JSON.stringify(next);
  const serializedCurrent = memoryCache ? JSON.stringify(memoryCache) : null;
  if (serializedNext === serializedCurrent) return;

  memoryCache = next;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, serializedNext);
  } catch {
    // Abaikan jika sessionStorage tidak tersedia
  }
  notifyListeners();
}

export function clearShellContextCache(): void {
  if (typeof window === "undefined") return;
  initialized = true;
  memoryCache = null;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Abaikan jika sessionStorage tidak tersedia
  }
  notifyListeners();
}

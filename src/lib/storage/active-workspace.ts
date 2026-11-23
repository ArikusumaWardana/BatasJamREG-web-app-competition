const STORAGE_KEY = "batasjamreg:active-ws:v1";
const listeners = new Set<() => void>();

let memoryValue: string | null = null;
let initialized = false;

function readInitial(): string | null {
  if (typeof window === "undefined") return null;
  if (initialized) return memoryValue;
  initialized = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    memoryValue = raw && raw.length > 0 ? raw : null;
  } catch {
    memoryValue = null;
  }
  return memoryValue;
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeActiveWorkspaceId(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStoredActiveWorkspaceId(): string | null {
  return readInitial();
}

export function getServerActiveWorkspaceId(): string | null {
  return null;
}

export function setStoredActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;
  initialized = true;
  if (memoryValue === workspaceId) return;
  memoryValue = workspaceId;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, workspaceId);
  } catch {
    // Abaikan jika sessionStorage tidak tersedia
  }
  notify();
}

export function clearStoredActiveWorkspaceId(): void {
  if (typeof window === "undefined") return;
  initialized = true;
  if (memoryValue === null) return;
  memoryValue = null;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Abaikan jika sessionStorage tidak tersedia
  }
  notify();
}

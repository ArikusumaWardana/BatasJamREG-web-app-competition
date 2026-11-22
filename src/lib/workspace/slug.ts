import { randomBytes } from "node:crypto";

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomToken(length: number, alphabet: string): string {
  const bytes = randomBytes(length);
  let token = "";
  for (let i = 0; i < length; i += 1) {
    token += alphabet[bytes[i] % alphabet.length];
  }
  return token;
}

export function generateWorkspaceSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const safeBase = base.length > 0 ? base : "workspace";
  const suffix = randomToken(4, "abcdefghijklmnopqrstuvwxyz0123456789");
  return `${safeBase}-${suffix}`;
}

export function generateInviteCode(): string {
  return `REG-${randomToken(4, INVITE_ALPHABET)}`;
}

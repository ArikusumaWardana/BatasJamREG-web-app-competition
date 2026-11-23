import { describe, expect, it } from "vitest";
import type { CharterAcknowledgementItem } from "../types";
import { resolveCharterSignatures } from "./charter-signatures";

const LEAD_ACK: CharterAcknowledgementItem = {
  id: "a1b2c3d4-0000-4000-8000-000000000001",
  user_id: "u-lead",
  full_name: "Sinta Dewi",
  role_title: "Team Lead Operasional",
  workspace_role: "LEAD",
  signed_at: "2026-11-23T11:10:00.000Z", // 18:10 WIB
};

const OWNER_ACK: CharterAcknowledgementItem = {
  id: "f9e8d7c6-0000-4000-8000-000000000002",
  user_id: "u-owner",
  full_name: "Kadek Agus",
  role_title: "Pemilik Perusahaan",
  workspace_role: "OWNER",
  signed_at: "2026-11-23T10:05:00.000Z", // 17:05 WIB
};

const MEMBER_ACKS: CharterAcknowledgementItem[] = [
  {
    id: "11112222-0000-4000-8000-000000000003",
    user_id: "u-m1",
    full_name: "Nadya Putri",
    role_title: "Desainer Kreatif",
    workspace_role: "MEMBER",
    signed_at: "2026-11-23T12:00:00.000Z", // 19:00 WIB
  },
  {
    id: "33334444-0000-4000-8000-000000000004",
    user_id: "u-m2",
    full_name: "Raka Pratama",
    role_title: "Copywriter",
    workspace_role: "MEMBER",
    signed_at: "2026-11-23T13:15:00.000Z", // 20:15 WIB
  },
  {
    id: "55556666-0000-4000-8000-000000000005",
    user_id: "u-m3",
    full_name: "Fajar Nugroho",
    role_title: "Video Editor",
    workspace_role: "MEMBER",
    signed_at: "2026-11-23T14:30:00.000Z", // 21:30 WIB
  },
];

describe("resolveCharterSignatures", () => {
  it("mengembalikan mode MANUAL_PRINT saat mode tamu atau tanpa konteks workspace", () => {
    const guestUndefined = resolveCharterSignatures(undefined);
    const guestEmpty = resolveCharterSignatures(null, 0);
    const zeroMembers = resolveCharterSignatures([], 0);

    expect(guestUndefined.mode).toBe("MANUAL_PRINT");
    expect(guestUndefined.leaderSignoff).toBeNull();
    expect(guestUndefined.memberSignoff.signedCount).toBe(0);
    expect(guestEmpty.mode).toBe("MANUAL_PRINT");
    expect(zeroMembers.mode).toBe("MANUAL_PRINT");
  });

  it("mengembalikan DIGITAL_SIGN dengan kedua kolom menunggu jika belum ada penandatangan", () => {
    const resolved = resolveCharterSignatures([], 6);

    expect(resolved.mode).toBe("DIGITAL_SIGN");
    expect(resolved.leaderSignoff).toBeNull();
    expect(resolved.memberSignoff).toEqual({
      signedCount: 0,
      totalMembers: 6,
      representativeLabel: null,
      latestSignedAtFormatted: null,
    });
  });

  it("mengisi kolom pimpinan saja (prioritas LEAD atas OWNER) saat baru pimpinan yang tanda tangan", () => {
    const withBothLeaders = resolveCharterSignatures([OWNER_ACK, LEAD_ACK], 4);
    expect(withBothLeaders.mode).toBe("DIGITAL_SIGN");
    expect(withBothLeaders.leaderSignoff).toEqual({
      name: "Sinta Dewi",
      roleLabel: "Team Lead Operasional",
      workspaceRole: "LEAD",
      signedAtFormatted: "23 Nov 2026, 18:10 WIB",
      verificationCode: "A1B2C3D4",
    });
    expect(withBothLeaders.memberSignoff.signedCount).toBe(0);
    expect(withBothLeaders.memberSignoff.totalMembers).toBe(4);

    const ownerFallback = resolveCharterSignatures([OWNER_ACK], 4);
    expect(ownerFallback.leaderSignoff?.workspaceRole).toBe("OWNER");
    expect(ownerFallback.leaderSignoff?.verificationCode).toBe("F9E8D7C6");
  });

  it("mengisi perwakilan 1 anggota dan banyak anggota lengkap dengan tanggal terakhir tanpa em-dash", () => {
    const singleMember = resolveCharterSignatures(
      [LEAD_ACK, MEMBER_ACKS[0]],
      5
    );
    expect(singleMember.memberSignoff).toEqual({
      signedCount: 1,
      totalMembers: 5,
      representativeLabel: "Nadya Putri",
      latestSignedAtFormatted: "23 Nov 2026, 19:00 WIB",
    });

    const multiMembers = resolveCharterSignatures(
      [LEAD_ACK, MEMBER_ACKS[2], MEMBER_ACKS[0], MEMBER_ACKS[1]],
      8
    );
    expect(multiMembers.memberSignoff).toEqual({
      signedCount: 3,
      totalMembers: 8,
      representativeLabel: "Nadya Putri & 2 Anggota Lainnya",
      latestSignedAtFormatted: "23 Nov 2026, 21:30 WIB",
    });
    expect(JSON.stringify(multiMembers)).not.toContain("\u2014");
  });
});

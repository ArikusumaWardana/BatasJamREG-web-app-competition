import { beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  extractClientIp,
  resetRateLimitStore,
} from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("mengizinkan hingga batas 10 request dalam 1 menit lalu menolak", () => {
    const start = 1_000_000;
    for (let i = 0; i < 10; i += 1) {
      const result = checkRateLimit("ip-a", 10, 60_000, start + i * 100);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9 - i);
    }

    const blocked = checkRateLimit("ip-a", 10, 60_000, start + 5000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);

    const otherIp = checkRateLimit("ip-b", 10, 60_000, start + 5000);
    expect(otherIp.allowed).toBe(true);
  });

  it("mengizinkan kembali setelah jendela waktu berlalu", () => {
    const start = 2_000_000;
    for (let i = 0; i < 10; i += 1) {
      checkRateLimit("ip-c", 10, 60_000, start + i * 10);
    }

    const afterWindow = checkRateLimit("ip-c", 10, 60_000, start + 61_000);
    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(9);
  });

  it("mengekstrak IP klien dari header x-forwarded-for atau x-real-ip", () => {
    const req1 = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" },
    });
    expect(extractClientIp(req1)).toBe("203.0.113.9");

    const req2 = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.4" },
    });
    expect(extractClientIp(req2)).toBe("198.51.100.4");

    const req3 = new Request("http://localhost");
    expect(extractClientIp(req3)).toBe("unknown-ip");
  });
});

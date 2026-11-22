interface RateLimitBucket {
  timestamps: number[];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
  now = Date.now()
): RateLimitResult {
  const cutoff = now - windowMs;
  const existing = rateLimitStore.get(key);
  const recent = existing
    ? existing.timestamps.filter((stamp) => stamp > cutoff)
    : [];

  if (recent.length >= limit) {
    rateLimitStore.set(key, { timestamps: recent });
    const oldest = recent[0] ?? now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    };
  }

  recent.push(now);
  rateLimitStore.set(key, { timestamps: recent });

  return {
    allowed: true,
    remaining: Math.max(0, limit - recent.length),
    retryAfterMs: 0,
  };
}

export function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "unknown-ip";
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

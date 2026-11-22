import { describe, expect, it } from "vitest";
import { DEMO_ACTORS, getDemoActorConfig } from "./demo-actors";

describe("demo-actors", () => {
  it("menyediakan 3 aktor demo unik untuk OWNER, LEAD, dan MEMBER", () => {
    expect(DEMO_ACTORS).toHaveLength(3);
    expect(DEMO_ACTORS.map((item) => item.actor)).toEqual([
      "OWNER",
      "LEAD",
      "MEMBER",
    ]);

    const emails = DEMO_ACTORS.map((item) => item.defaultEmail);
    expect(new Set(emails).size).toBe(3);

    for (const item of DEMO_ACTORS) {
      expect(item.fullName.length).toBeGreaterThanOrEqual(2);
      expect(item.description).not.toContain("\u2014");
    }
  });

  it("mengembalikan konfigurasi aktor sesuai role", () => {
    expect(getDemoActorConfig("OWNER").fullName).toBe("Raka Pratama");
    expect(getDemoActorConfig("LEAD").fullName).toBe("Sinta Dewi");
    expect(getDemoActorConfig("MEMBER").fullName).toBe("Nadya Putri");
  });
});

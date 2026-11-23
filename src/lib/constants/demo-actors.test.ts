import { describe, expect, it } from "vitest";
import {
  DEMO_ACTORS,
  DEMO_ROLE_USERS,
  findDemoUserByEmail,
  getDemoActorConfig,
  getDemoUsersByRole,
} from "./demo-actors";

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

  it("mengelompokkan seluruh pengguna demo per role dengan email unik", () => {
    expect(DEMO_ROLE_USERS.length).toBeGreaterThanOrEqual(18);
    expect(new Set(DEMO_ROLE_USERS.map((u) => u.email)).size).toBe(
      DEMO_ROLE_USERS.length
    );
    expect(getDemoUsersByRole("OWNER").length).toBeGreaterThanOrEqual(1);
    expect(getDemoUsersByRole("LEAD").length).toBeGreaterThanOrEqual(9);
    expect(getDemoUsersByRole("MEMBER").length).toBeGreaterThanOrEqual(8);
    expect(findDemoUserByEmail("dimas.wijaya@batasjamreg.local")?.actor).toBe(
      "LEAD"
    );
    expect(findDemoUserByEmail("tidak-ada@example.com")).toBeUndefined();
  });
});

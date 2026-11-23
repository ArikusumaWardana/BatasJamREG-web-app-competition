import { describe, expect, it } from "vitest";
import type { OrganizationOverviewData } from "../types";
import { buildOrganizationOverview } from "./overview-metrics";
import {
  buildExecutiveReportPdf,
  sanitizeExecutiveReportFilename,
} from "./executive-report-pdf";

function createSampleOverview(): OrganizationOverviewData {
  return buildOrganizationOverview({
    organization: {
      id: "org-1",
      name: "PT Nusantara Digital",
      slug: "pt-nusantara-digital",
    },
    viewerUserId: "u-owner",
    orgMembers: [
      { user_id: "u-owner", role: "OWNER" },
      { user_id: "u-lead", role: "MEMBER" },
      { user_id: "u-member", role: "MEMBER" },
    ],
    workspaces: [
      {
        id: "ws-1",
        name: "Tim Kreatif Nusantara",
        slug: "tim-kreatif-nusantara",
        invite_code: "REG-8492",
        work_pattern: "FIVE_DAYS_8H",
        work_start_time: "09:00:00",
        work_end_time: "17:00:00",
        digest_dispatch_time: "08:30:00",
        timezone: "Asia/Jakarta",
        work_days: [1, 2, 3, 4, 5],
        created_at: "2026-11-20T00:00:00Z",
      },
      {
        id: "ws-2",
        name: "Tim Produk & Engineering",
        slug: "tim-produk-engineering",
        invite_code: "REG-4105",
        work_pattern: "FIVE_DAYS_8H",
        work_start_time: "09:00:00",
        work_end_time: "17:00:00",
        digest_dispatch_time: "08:30:00",
        timezone: "Asia/Jakarta",
        work_days: [1, 2, 3, 4, 5],
        created_at: "2026-11-21T00:00:00Z",
      },
    ],
    divisionMembers: [
      {
        workspace_id: "ws-1",
        user_id: "u-lead",
        role: "LEAD",
        full_name: "Sinta Dewi",
        role_title: "Team Lead",
      },
      {
        workspace_id: "ws-1",
        user_id: "u-member",
        role: "MEMBER",
        full_name: "Nadya Putri",
        role_title: "Desainer",
      },
      {
        workspace_id: "ws-2",
        user_id: "u-lead",
        role: "LEAD",
        full_name: "Sinta Dewi",
        role_title: "Team Lead",
      },
    ],
    snapshots: [
      {
        id: "s-1",
        workspace_id: "ws-1",
        label: "Audit Nov",
        period_start: "2026-11-01",
        period_end: "2026-11-22",
        total_messages: 1840,
        after_hours_messages: 497,
        shadow_overtime_hours: 42.5,
        false_urgency_count: 31,
        created_at: "2026-11-22T00:00:00Z",
      },
    ],
    activeCharters: [{ id: "ch-1", workspace_id: "ws-1", version: 1 }],
    acknowledgements: [{ charter_id: "ch-1", workspace_id: "ws-1", user_id: "u-lead" }],
    emergencyCards: [
      { workspace_id: "ws-1", emergency_review_status: "VALID_EMERGENCY" },
      { workspace_id: "ws-1", emergency_review_status: "SHOULD_BE_QUEUED" },
    ],
  });
}

describe("executive-report-pdf", () => {
  it("menghasilkan nama file PDF aman", () => {
    expect(sanitizeExecutiveReportFilename("PT Nusantara Digital")).toBe(
      "laporan-eksekutif-pt-nusantara-digital.pdf"
    );
    expect(sanitizeExecutiveReportFilename("   ")).toBe(
      "laporan-eksekutif-perusahaan.pdf"
    );
  });

  it("menghasilkan PDF eksekutif 2 halaman valid termasuk saat divisi belum punya snapshot", () => {
    const overview = createSampleOverview();
    const doc = buildExecutiveReportPdf(overview);

    const rawPdf = doc.output("arraybuffer");
    const header = new TextDecoder().decode(new Uint8Array(rawPdf).slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(doc.getNumberOfPages()).toBe(2);
    expect(rawPdf.byteLength).toBeGreaterThan(2500);
  });
});

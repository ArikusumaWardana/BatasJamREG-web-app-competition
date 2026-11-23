import { describe, expect, it } from "vitest";
import {
  buildOrganizationOverview,
  formatWorkHoursRange,
} from "./overview-metrics";

describe("organization overview-metrics", () => {
  it("memformat rentang jam kerja dan label zona waktu dengan tanda hubung standar", () => {
    expect(formatWorkHoursRange("09:00:00", "17:00:00", "Asia/Jakarta")).toBe(
      "09:00-17:00 WIB"
    );
    expect(formatWorkHoursRange("08:30:00", "16:30:00", "Asia/Makassar")).toBe(
      "08:30-16:30 WITA"
    );
  });

  it("mengagregasi KPI perusahaan, total anggota unik, Team Lead, dan mode pantau Owner", () => {
    const result = buildOrganizationOverview({
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
          user_id: "u-owner",
          role: "OWNER",
          full_name: "Raka Pratama",
          role_title: "Demo Lead",
        },
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
          role_title: "Desainer Kreatif",
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
          id: "s-old",
          workspace_id: "ws-1",
          label: "Audit Lama",
          period_start: "2026-06-01",
          period_end: "2026-08-31",
          total_messages: 1000,
          after_hours_messages: 300,
          shadow_overtime_hours: 30.0,
          false_urgency_count: 15,
          created_at: "2026-09-01T00:00:00Z",
        },
        {
          id: "s-new",
          workspace_id: "ws-1",
          label: "Audit Terbaru Kreatif",
          period_start: "2026-09-01",
          period_end: "2026-11-22",
          total_messages: 1840,
          after_hours_messages: 612,
          shadow_overtime_hours: "42.50",
          false_urgency_count: 48,
          created_at: "2026-11-22T00:00:00Z",
        },
        {
          id: "s-eng",
          workspace_id: "ws-2",
          label: "Audit Engineering",
          period_start: "2026-08-25",
          period_end: "2026-11-22",
          total_messages: 2310,
          after_hours_messages: 842,
          shadow_overtime_hours: 58.0,
          false_urgency_count: 104,
          created_at: "2026-11-22T01:00:00Z",
        },
      ],
      activeCharters: [{ id: "ch-1", workspace_id: "ws-1", version: 2 }],
      acknowledgements: [
        { charter_id: "ch-1", workspace_id: "ws-1", user_id: "u-lead" },
        { charter_id: "ch-1", workspace_id: "ws-1", user_id: "u-member" },
      ],
      emergencyCards: [
        { workspace_id: "ws-1", emergency_review_status: "VALID_EMERGENCY" },
        { workspace_id: "ws-2", emergency_review_status: "SHOULD_BE_QUEUED" },
      ],
      wellbeingByWorkspace: [
        {
          workspace_id: "ws-1",
          rows: [
            {
              week_start_date: "2026-11-23",
              response_count: 3,
              is_threshold_met: true,
              avg_rest_quality: 4,
              avg_reply_pressure: 2,
              avg_boundary_clarity: 4,
            },
          ],
        },
        {
          workspace_id: "ws-2",
          rows: [
            {
              week_start_date: "2026-11-23",
              response_count: 1,
              is_threshold_met: false,
              avg_rest_quality: null,
              avg_reply_pressure: null,
              avg_boundary_clarity: null,
            },
          ],
        },
      ],
    });

    expect(result.kpis.total_divisions).toBe(2);
    expect(result.kpis.total_members).toBe(3);
    expect(result.kpis.total_shadow_overtime_hours).toBe(100.5);
    expect(result.kpis.highest_burnout_division).toEqual({
      workspace_id: "ws-2",
      name: "Tim Produk & Engineering",
      shadow_overtime_hours: 58,
    });

    expect(result.divisions[0]?.team_leads).toEqual([
      {
        user_id: "u-lead",
        full_name: "Sinta Dewi",
        role_title: "Team Lead",
      },
    ]);
    expect(result.divisions[0]?.latest_snapshot?.shadow_overtime_hours).toBe(
      42.5
    );
    expect(result.divisions[0]?.boundary_score?.score).toBeGreaterThanOrEqual(0);
    expect(result.divisions[0]?.boundary_score?.score).toBeLessThanOrEqual(100);
    expect(result.divisions[0]?.is_joined).toBe(true);
    expect(result.divisions[0]?.charter_adoption.adoption_percentage).toBe(67);
    expect(result.divisions[0]?.wellbeing?.composite_score).toBe(4);
    expect(result.divisions[1]?.is_joined).toBe(false);
    expect(result.divisions[1]?.wellbeing?.is_threshold_met).toBe(false);
    expect(result.divisions[1]?.wellbeing?.composite_score).toBeNull();
    expect(result.kpis.emergency_audit.valid_ratio_pct).toBe(50);
    expect(result.divisions[1]?.member_count).toBe(1);
    expect(result.divisions[1]?.team_leads).toEqual([
      {
        user_id: "u-lead",
        full_name: "Sinta Dewi",
        role_title: "Team Lead",
      },
    ]);
  });

  it("mengembalikan highest_burnout_division null jika belum ada snapshot atau jam nol", () => {
    const result = buildOrganizationOverview({
      organization: {
        id: "org-empty",
        name: "PT Awal Baru",
        slug: "pt-awal-baru",
      },
      orgMembers: [{ user_id: "u-1", role: "OWNER" }],
      workspaces: [
        {
          id: "ws-empty",
          name: "Divisi Inti",
          slug: "divisi-inti",
          invite_code: "REG-1111",
          work_pattern: "FIVE_DAYS_8H",
          work_start_time: "09:00:00",
          work_end_time: "17:00:00",
          digest_dispatch_time: "08:30:00",
          timezone: "Asia/Jakarta",
          work_days: [1, 2, 3, 4, 5],
          created_at: "2026-11-22T00:00:00Z",
        },
      ],
      divisionMembers: [],
      snapshots: [],
    });

    expect(result.kpis.total_divisions).toBe(1);
    expect(result.kpis.total_shadow_overtime_hours).toBe(0);
    expect(result.kpis.highest_burnout_division).toBeNull();
    expect(result.divisions[0]?.boundary_score).toBeNull();
  });
});

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  FileDown,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { PageLoadingOverlay } from "@/components/layout/PageLoadingOverlay";
import { downloadExecutiveReportPdf } from "../lib/executive-report-pdf";
import {
  fetchOrganizationOverview,
  fetchOrganizations,
} from "../lib/organization-api";
import type { OrganizationOverviewData } from "../types";
import { CreateDivisionDialog } from "./CreateDivisionDialog";
import { OrgDivisionsTable } from "./OrgDivisionsTable";
import { OrgKpiCards } from "./OrgKpiCards";
import { OrgMembersPanel } from "./OrgMembersPanel";
import { OrgWellbeingComparison } from "./OrgWellbeingComparison";

export function OrganizationPageClient() {
  const router = useRouter();
  const [overview, setOverview] = useState<OrganizationOverviewData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const loadData = useCallback(async () => {
    const orgList = await fetchOrganizations();
    if (orgList.errorMsg) {
      return { overview: null, redirectWorkspace: false, error: orgList.errorMsg };
    }

    const ownedOrg = orgList.organizations.find((o) => o.role === "OWNER");
    if (!ownedOrg) {
      return { overview: null, redirectWorkspace: true, error: null };
    }

    const res = await fetchOrganizationOverview(ownedOrg.id);
    if (res.forbidden) {
      return { overview: null, redirectWorkspace: true, error: null };
    }
    return {
      overview: res.data,
      redirectWorkspace: false,
      error: res.errorMsg,
    };
  }, []);

  useEffect(() => {
    let active = true;
    void loadData().then((res) => {
      if (!active) return;
      if (res.redirectWorkspace) {
        router.replace("/workspace");
        return;
      }
      setOverview(res.overview);
      setErrorMsg(res.error);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [loadData, router]);

  function refreshOverview() {
    setIsLoading(true);
    setErrorMsg(null);
    void loadData().then((res) => {
      if (res.redirectWorkspace) {
        router.replace("/workspace");
        return;
      }
      setOverview(res.overview);
      setErrorMsg(res.error);
      setIsLoading(false);
    });
  }

  function handleExportExecutivePdf() {
    if (!overview || isExportingPdf || overview.divisions.length === 0) return;
    setIsExportingPdf(true);
    try {
      const filename = downloadExecutiveReportPdf(overview);
      toast.success(`Laporan Eksekutif "${filename}" berhasil diunduh.`);
    } catch {
      toast.error("Gagal membuat PDF Laporan Eksekutif.");
    } finally {
      setIsExportingPdf(false);
    }
  }

  if (isLoading) {
    return (
      <PageLoadingOverlay
        variant="panel"
        message="Sedang memuat ringkasan perusahaan..."
      />
    );
  }

  if (errorMsg || !overview) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border-hairline bg-surface p-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          <h1 className="text-base font-semibold">
            Gagal Memuat Ringkasan Perusahaan
          </h1>
        </div>
        <p className="text-sm text-ink-secondary">
          {errorMsg ?? "Data organisasi belum tersedia saat ini."}
        </p>
        <button
          type="button"
          onClick={refreshOverview}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink-primary hover:bg-surface-muted"
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 rounded-lg border border-border-hairline bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-brand">
            <Building2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Ringkasan Perusahaan (Owner)</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-primary">
            {overview.organization.name}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Pantau lembur bayangan lintas divisi, tambah ruang kerja baru, dan
            tetapkan Team Lead tiap divisi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshOverview}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            <span>Muat Ulang</span>
          </button>
          <button
            type="button"
            disabled={isExportingPdf || isLoading || overview.divisions.length === 0}
            onClick={handleExportExecutivePdf}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink-primary transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExportingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <FileDown className="h-4 w-4 text-brand" strokeWidth={1.5} aria-hidden="true" />
            )}
            <span>
              {isExportingPdf
                ? "Menyiapkan PDF..."
                : "Unduh Laporan Eksekutif (PDF)"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Buat Divisi Baru</span>
          </button>
        </div>
      </header>

      <OrgKpiCards kpis={overview.kpis} />

      <OrgWellbeingComparison divisions={overview.divisions} />

      <OrgDivisionsTable
        divisions={overview.divisions}
        onCreateDivision={() => setCreateOpen(true)}
      />

      <OrgMembersPanel
        divisions={overview.divisions}
        onRoleUpdated={refreshOverview}
      />

      <CreateDivisionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={overview.organization.id}
        organizationName={overview.organization.name}
        onCreated={() => {
          refreshOverview();
        }}
      />
    </div>
  );
}

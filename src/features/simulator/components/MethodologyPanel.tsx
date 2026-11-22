"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, FileCheck, FileSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INDONESIA_BENCHMARKS } from "../lib/presenteeism-formula";

export function MethodologyPanel() {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="border-border-hairline bg-surface">
      <CardContent className="flex flex-col gap-3 pt-5">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2 rounded-xs text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="text-base font-semibold text-ink-primary">
            Transparansi Metodologi & Referensi Data Indonesia
          </span>
          {expanded ? (
            <ChevronUp className="size-4 shrink-0 text-ink-secondary" />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-ink-secondary" />
          )}
        </button>

        {expanded ? (
          <div className="flex flex-col gap-3 border-t border-border-hairline pt-3 text-sm leading-relaxed text-ink-secondary">
            <p>
              Model kalkulasi menggabungkan intensitas lembur bayangan mingguan
              dan beban interupsi malam terhadap 250 hari kerja efektif per
              tahun (mengacu UU No. 13 Tahun 2003 Pasal 77), dikalikan porsi
              kerugian presenteeism sebesar{" "}
              <span className="font-mono font-medium text-ink-primary">
                88,5%
              </span>
              .
            </p>

            <ul className="list-disc space-y-1 pl-5 text-xs text-ink-secondary sm:text-sm">
              <li>
                Riset dampak kesehatan mental kerja di Indonesia mencatat
                kerugian makro mencapai Rp
                {INDONESIA_BENCHMARKS.national_loss_trillion_idr} triliun per
                tahun (88,5% berasal dari penurunan produktivitas dan
                presenteeism).
              </li>
              <li>
                Ambang atas benchmark individu dibatasi pada Rp11 juta per orang
                per tahun, maksimal{" "}
                {INDONESIA_BENCHMARKS.max_lost_workdays_per_year} hari kerja
                efektif hilang per tahun, dan penurunan kinerja efektif hingga{" "}
                {INDONESIA_BENCHMARKS.max_performance_drop_pct}%.
              </li>
              <li>
                Konteks kelelahan kerja nasional: Workplace Wellbeing Score
                Indonesia 2025 mencatat 52% kelelahan kronis dan Jobstreet 2026
                mencatat 43% pekerja mengalami burnout.
              </li>
            </ul>

            <p className="text-xs text-ink-muted">
              Catatan: Angka simulasi bersifat edukatif sebagai bahan diskusi
              kebijakan jam kerja sehat dan tidak menggantikan audit keuangan
              resmi perusahaan.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/audit"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileSearch className="size-3.5" />
                <span>Uji Chat Lokal di Audit WA</span>
              </Link>
              <Link
                href="/charter"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <FileCheck className="size-3.5" />
                <span>Susun Piagam Jam Digital</span>
              </Link>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

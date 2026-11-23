"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Moon,
  ShieldAlert,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { formatTimeHHMM } from "@/lib/constants/work-hours";
import type { PublicWorkspaceStatus } from "../lib/public-status-server";
import { getPublicWorkClockInfo } from "../lib/public-status-time";
import { formatWorkDaysLabel } from "../lib/wa-bio-generator";

interface PublicStatusCardProps {
  status: PublicWorkspaceStatus;
  initialNowIso: string;
}

export function PublicStatusCard({
  status,
  initialNowIso,
}: PublicStatusCardProps) {
  const [now, setNow] = useState<Date>(() => new Date(initialNowIso));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const clock = getPublicWorkClockInfo(
    {
      work_start_time: status.work_start_time,
      work_end_time: status.work_end_time,
      digest_dispatch_time: status.digest_dispatch_time,
      timezone: status.timezone,
      work_days: status.work_days,
    },
    now
  );

  const workDaysFull = formatWorkDaysLabel(status.work_days, "full");
  const quietWindow =
    status.quiet_hours_start && status.quiet_hours_end
      ? `${formatTimeHHMM(status.quiet_hours_start)}-${formatTimeHHMM(status.quiet_hours_end)} ${clock.timezoneLabel}`
      : `Di luar ${clock.workWindowLabel} ${clock.timezoneLabel}`;
  const slaHours = status.non_urgent_sla_hours ?? 2;

  return (
    <main className="min-h-screen bg-canvas px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <BrandLogo href="/" size="sm" />
          <span className="rounded-full border border-border-hairline bg-surface px-3 py-1 text-xs font-medium text-ink-secondary">
            Status Komunikasi Publik
          </span>
        </header>

        <article className="flex flex-col gap-6 rounded-lg border border-border-hairline bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-1.5 border-b border-border-hairline pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-ink-primary">
              {status.workspace_name}
            </h1>
            <p className="text-sm text-ink-secondary">
              Panduan jam aktif kerja, antrean Morning Digest, dan batas eskalasi
              darurat tim.
            </p>
          </div>

          <section
            aria-label="Status jam kerja real-time"
            className={`flex flex-col gap-3 rounded-lg border border-border-hairline border-l-4 p-4 ${
              clock.isRegularHours
                ? "border-l-safe bg-safe-soft/50"
                : "border-l-warn bg-warn-soft/50"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    clock.isRegularHours
                      ? "bg-safe-soft text-safe"
                      : "bg-warn-soft text-warn"
                  }`}
                >
                  {clock.isRegularHours ? (
                    <Sun className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      clock.isRegularHours ? "text-safe" : "text-warn"
                    }`}
                  >
                    {clock.isRegularHours
                      ? "Sedang Jam Reguler"
                      : "Sedang Jam Tenang"}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-ink-secondary">
                    {clock.dayLabel}, {clock.currentTimeLabel}{" "}
                    {clock.timezoneLabel}
                  </p>
                </div>
              </div>

              <span className="rounded-md border border-border-hairline bg-surface px-2.5 py-1 font-mono text-xs font-medium tabular-nums text-ink-primary">
                {clock.nextTransitionCountdown}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-ink-secondary">
              {clock.isRegularHours ? (
                <>
                  Tim aktif menerima koordinasi kerja hingga{" "}
                  <strong className="font-mono tabular-nums text-ink-primary">
                    {clock.nextTransitionLabel}
                  </strong>
                  .
                </>
              ) : (
                <>
                  Jam kerja aktif kembali{" "}
                  <strong className="font-mono tabular-nums text-ink-primary">
                    {clock.nextTransitionLabel}
                  </strong>
                  . Pesan non-darurat ditangani pada jadwal Morning Digest
                  berikutnya:{" "}
                  <strong className="font-mono tabular-nums text-ink-primary">
                    {clock.nextDigestLabel}
                  </strong>{" "}
                  ({clock.nextDigestCountdown}).
                </>
              )}
            </p>
          </section>

          <section
            aria-label="Detail jadwal tim"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1 rounded-md border border-border-hairline bg-canvas p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
                <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Hari &amp; Jam Reguler</span>
              </div>
              <p className="text-sm font-semibold text-ink-primary">
                {workDaysFull}
              </p>
              <p className="font-mono text-xs tabular-nums text-ink-secondary">
                {clock.workWindowLabel} {clock.timezoneLabel}
              </p>
            </div>

            <div className="flex flex-col gap-1 rounded-md border border-border-hairline bg-canvas p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span>Morning Digest &amp; SLA</span>
              </div>
              <p className="font-mono text-sm font-semibold tabular-nums text-ink-primary">
                Digest {clock.digestTimeLabel} {clock.timezoneLabel}
              </p>
              <p className="text-xs text-ink-secondary">
                SLA non-darurat: {slaHours} jam kerja berikutnya (Jam tenang:{" "}
                {quietWindow})
              </p>
            </div>
          </section>

          <section
            aria-label="Kriteria darurat operasional"
            className="flex flex-col gap-3 rounded-md border border-border-hairline bg-canvas p-4"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert
                className="h-4 w-4 shrink-0 text-warn"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold text-ink-primary">
                Kriteria Darurat Operasional yang Berlaku
              </h2>
            </div>

            {status.emergency_criteria.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {status.emergency_criteria.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-ink-primary"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-safe"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-relaxed text-ink-secondary">
                Eskalasi di luar jam reguler hanya berlaku untuk insiden kritis
                layanan produksi, gangguan keamanan, atau kebutuhan operasional
                yang tidak dapat ditunda hingga pagi hari kerja berikutnya.
              </p>
            )}
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline pt-4 text-xs text-ink-secondary">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-safe"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                Halaman publik ini tidak menampilkan nama anggota, kartu tugas
                internal, maupun percakapan tim.
              </span>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-[36px] items-center font-medium text-brand underline-offset-4 hover:underline"
            >
              Tentang BatasJamREG
            </Link>
          </footer>
        </article>
      </div>
    </main>
  );
}

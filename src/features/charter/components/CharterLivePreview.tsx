import { Badge } from "@/components/ui/badge";
import { formatCharterTimeShort, type CharterDraft } from "../types";
import { CharterSignatureFooter } from "./CharterSignatureFooter";

interface CharterLivePreviewProps {
  draft: CharterDraft;
}

export function CharterLivePreview({ draft }: CharterLivePreviewProps) {
  const quietStart = formatCharterTimeShort(draft.quiet_hours_start);
  const quietEnd = formatCharterTimeShort(draft.quiet_hours_end);
  const versionLabel = `Versi ${draft.version ?? 1}`;
  const baselineText =
    draft.baseline_shadow_hours !== null
      ? `${draft.baseline_shadow_hours.toLocaleString("id-ID", {
          maximumFractionDigits: 1,
        })} jam lembur bayangan`
      : "belum ditentukan dari audit lokal";

  return (
    <div className="rounded-lg border border-border-hairline bg-surface-subtle p-4 sm:p-6 lg:p-7">
      <article
        aria-label="Dokumen Piagam Jam Digital Tim"
        className="flex flex-col gap-6 rounded-sm border border-border-strong bg-surface p-6 sm:p-8"
      >
        <header className="flex flex-col gap-2 border-b border-border-hairline pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs tracking-wider text-brand">
              PIAGAM JAM DIGITAL TIM
            </span>
            <Badge
              variant="outline"
              className="border-brand-border bg-brand-soft font-mono text-xs text-brand tabular-nums"
            >
              {versionLabel} - Aktif Diterapkan
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink-primary">
            {draft.title.trim() || "Judul Piagam Jam Digital"}
          </h2>
          <p className="text-sm font-medium text-ink-secondary">
            Tim / Organisasi:{" "}
            <span className="text-ink-primary">
              {draft.company_or_team_name.trim() || "Nama Tim"}
            </span>
          </p>
        </header>

        <div className="flex flex-col gap-4 text-sm leading-relaxed text-ink-secondary">
          <section className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-ink-primary">
              1. Koridor Jam Tenang (Right-to-Disconnect)
            </h3>
            <p>
              Seluruh anggota{" "}
              <span className="font-medium text-ink-primary">
                {draft.company_or_team_name.trim() || "tim"}
              </span>{" "}
              bersepakat menetapkan Jam Tenang pada pukul{" "}
              <span className="font-mono font-medium text-ink-primary tabular-nums">
                {quietStart} - {quietEnd} WIB
              </span>{" "}
              serta hari libur resmi. Di luar jam reguler tersebut, notifikasi
              grup percakapan kerja tidak diwajibkan untuk segera dibalas.
            </p>
          </section>

          <section className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-ink-primary">
              2. Protokol Antrean Pagi & SLA Balasan Non-Darurat
            </h3>
            <p>
              Instruksi non-darurat di luar jam aktif ditampung melalui Async
              Morning Digest Board dan diproses pada awal hari kerja berikutnya
              dengan batas SLA balasan maksimal{" "}
              <span className="font-mono font-medium text-ink-primary tabular-nums">
                {draft.non_urgent_sla_hours} jam kerja
              </span>{" "}
              setelah jam operasional dibuka.
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h3 className="text-sm font-semibold text-ink-primary">
              3. Batasan Kriteria Darurat Operasional
            </h3>
            <p>
              Komunikasi langsung di luar jam kerja hanya diperkenankan apabila
              memenuhi kriteria darurat operasional berikut:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-ink-primary">
              {draft.emergency_criteria.map((item, idx) => (
                <li key={`${idx}-${item.slice(0, 16)}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-ink-primary">
              4. Dasar Evaluasi & Privasi Komunikasi
            </h3>
            <p>
              Kesepakatan ini disusun berdasarkan evaluasi ritme kerja dengan
              baseline{" "}
              <span className="font-mono font-medium text-ink-primary tabular-nums">
                {baselineText}
              </span>{" "}
              dan ditinjau berkala tanpa pengawasan isi chat pribadi.
            </p>
          </section>
        </div>

        <CharterSignatureFooter draft={draft} />
      </article>
    </div>
  );
}

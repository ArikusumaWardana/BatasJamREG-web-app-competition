# BatasJamREG

**Deteksi Lembur Bayangan dan Bangun Batas Jam Digital Kerja Tanpa Mengunggah Chat ke Server.**

BatasJamREG adalah aplikasi web fullstack yang dikembangkan untuk kompetisi **Web Application Competition Techcomfest 2027** (Politeknik Negeri Semarang) pada sub-tema **Smart Lifestyle & Digital Wellbeing**, selaras dengan **SDG 3: Good Health and Well-being (Target 3.4)**.

---

## Latar Belakang Masalah

Mayoritas tim kerja, agensi kreatif, startup, dan UKM di Indonesia mengandalkan WhatsApp pribadi sebagai kanal koordinasi utama. Akibatnya, instruksi kerja sering masuk pada malam hari, akhir pekan, dan hari libur sehingga memicu fenomena *lembur bayangan* (pekerjaan nyata di luar jam reguler yang tidak tercatat dan luput dari pengawasan beban kerja).

- **Dampak Ekonomi & Presenteeism:** Kerugian ekonomi akibat gangguan kesehatan mental pekerja di Indonesia diperkirakan mencapai Rp463 triliun per tahun, dengan 88,5% berasal dari penurunan produktivitas dan *presenteeism* (estimasi kerugian individu hingga Rp11 juta/orang/tahun, hingga 34 hari absen/tahun, dan penurunan kinerja hingga 51%).
- **Kelelahan & Burnout:** Workplace Wellbeing Score Indonesia 2025 mencatat 52% karyawan mengalami kelelahan kerja kronis, sedangkan Workplace Happiness Index Jobstreet (Februari 2026) mencatat 43% pekerja Indonesia mengalami *burnout*.
- **Celah Regulasi:** Meskipun UU No. 13 Tahun 2003 Pasal 77 mengatur batas jam kerja normal (7 jam/hari untuk 6 hari kerja atau 8 jam/hari untuk 5 hari kerja), Indonesia belum memiliki regulasi khusus *Right to Disconnect*.

BatasJamREG hadir mendampingi alur kerja tim di Indonesia tanpa memaksa organisasi bermigrasi ke platform komunikasi berbayar.

---

## Prinsip Arsitektur: Two-Zone Privacy Firewall

BatasJamREG memisahkan pemrosesan percakapan pribadi dari ruang kolaborasi tim melalui dua zona tegas:

1. **Zona A (100% Client-Side Local / Zero-Upload):**
   Seluruh pembacaan dan analisis file ekspor chat WhatsApp (`.txt` Android maupun `.zip` iOS) berjalan lokal di dalam browser melalui Web Worker (`src/workers/wa-parser.worker.ts`). Tidak ada satu byte pun teks percakapan mentah maupun nama pengirim yang dikirim ke server, database, atau API AI.
2. **Zona B (Kolaborasi Tim Opt-In via Supabase RLS):**
   Hanya data kerja terstruktur hasil persetujuan pengguna (pengaturan jam kerja reguler, kartu *Async Morning Digest*, dokumen Piagam Jam Digital Tim, dan snapshot statistik numerik anonim tanpa teks chat) yang disimpan di PostgreSQL Supabase dengan isolasi *Row-Level Security* (RLS).

---

## Fitur Utama

### 1. Zero-Upload WhatsApp Auditor (`/audit`)
- Memproses file ekspor chat WhatsApp secara lokal di browser atau memuat dataset simulasi 90 hari (`/audit?demo=true`) dalam 1 klik.
- Mengukur total jam lembur bayangan, persentase pesan di luar jam reguler, jumlah pemicu *false urgency*, serta hari dan jam paling rawan interupsi.
- Visualisasi *Heatmap Interupsi 24x7*, grafik tren mingguan pesan reguler vs luar jam, tabel kata kunci *false urgency*, dan simpan snapshot numerik anonim (opt-in) dengan pratinjau payload JSON.

### 2. Async Morning Digest Board (`/workspace/digest`)
- Papan penampung instruksi kerja non-darurat di luar jam reguler agar tidak langsung mengganggu waktu istirahat tim.
- Protokol *triage* wajib: membedakan `MORNING_QUEUE` (antrean pagi) dan `EMERGENCY_OPS` (darurat operasional dengan alasan terukur minimal 10 karakter).
- Pembaruan status secara realtime antar anggota tim melalui Supabase Realtime serta generator format pesan WhatsApp siap salin dan *batch dispatch*.

### 3. Piagam Jam Digital & Studio Balasan Diplomatis (`/charter`)
- **Piagam Jam Digital Tim:** Menyusun kesepakatan jam tenang (*quiet hours*), SLA balasan non-darurat, dan kriteria darurat operasional dengan pratinjau langsung, penyimpanan versi ke workspace, serta unduh PDF 100% di sisi klien.
- **Penyusun Balasan Diplomatis:** Menghasilkan 3 variasi balasan berbahasa Indonesia yang sopan dan tegas berdasarkan penerima (`Atasan`, `Klien`, `Rekan Tim`), konteks waktu, dan gaya bahasa, lengkap dengan *fallback* template deterministik otomatis.

### 4. Presenteeism & Burnout Cost Simulator (`/simulator`)
- Mengonversi jam lembur bayangan mingguan (termasuk tarik angka otomatis dari hasil `/audit`), jumlah anggota tim, rata-rata gaji bulanan, dan intensitas interupsi malam menjadi estimasi risiko *presenteeism*, kerugian finansial bulanan/tahunan, serta hari kerja efektif yang hilang.
- Menampilkan grafik proyeksi akumulasi biaya 12 bulan (kondisi *Always-On* vs penerapan BatasJamREG) dan panel transparansi metodologi.

### 5. Workspace & Demo Multi-Aktor (`/workspace`, `/auth/login`)
- Pemantauan status jam kerja reguler secara langsung sesuai zona waktu Indonesia (WIB, WITA, WIT) serta pengaturan pola kerja UU 13/2003.
- Akses demo 1-klik untuk tiga peran aktor pada workspace `Tim Kreatif Nusantara` (`REG-8492`): **Owner** (`Raka Pratama`), **Team Lead** (`Sinta Dewi`), dan **Anggota** (`Nadya Putri`).

---

## Teknologi yang Digunakan

- **Framework & Bahasa:** Next.js 16 (App Router), React, TypeScript (`strict: true`)
- **UI & Visualisasi:** Tailwind CSS v4, `shadcn/ui`, `lucide-react`, Recharts, Sonner
- **Pemrosesan Lokal & PDF:** Web Worker (`whatsapp-chat-parser`, `fflate`), `jsPDF`, `jspdf-autotable`
- **Backend & Keamanan:** Supabase (Auth, PostgreSQL, Row-Level Security, Realtime), Zod
- **AI Refinement & Pengujian:** `@google/genai` (dengan fallback deterministik), Vitest

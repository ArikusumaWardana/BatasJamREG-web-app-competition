-- Idempotent Rich Dummy Data for BatasJamREG Demo ("PT Nusantara Digital")
-- Menambah anggota tim, divisi, snapshot historis, kartu digest, piagam, persetujuan digital, dan wellbeing pulse.

DO $$
DECLARE
  v_org_id UUID;
  v_owner_id UUID;
  v_lead_id UUID;
  v_member_id UUID;

  v_bima_id UUID := '11111111-1111-4111-8111-111111111102'::uuid;
  v_tari_id UUID := '11111111-1111-4111-8111-111111111103'::uuid;
  v_dimas_id UUID := '11111111-1111-4111-8111-111111111104'::uuid;
  v_ayu_id UUID := '11111111-1111-4111-8111-111111111105'::uuid;
  v_fajar_id UUID := '11111111-1111-4111-8111-111111111106'::uuid;

  v_ws_creative UUID;
  v_ws_eng UUID;
  v_ws_growth UUID := '22222222-2222-4222-8222-222222222203'::uuid;
  v_ws_ops UUID := '22222222-2222-4222-8222-222222222204'::uuid;

  v_ch_creative UUID;
  v_ch_eng UUID;
  v_ch_growth UUID;
  v_ch_ops UUID;

  v_week_start DATE := date_trunc('week', timezone('Asia/Jakarta', now()))::date;

  v_heatmap_high JSONB := '[
    [0,0,0,0,0,0,0,1,4,15,19,17,13,16,18,15,12,9,8,11,16,22,14,5],
    [0,0,0,0,0,0,0,2,5,16,20,18,14,17,19,17,14,11,10,14,24,36,23,8],
    [0,0,0,0,0,0,0,1,4,15,18,16,12,15,17,15,13,9,8,11,18,24,15,5],
    [0,0,0,0,0,0,0,1,4,14,19,17,13,16,16,15,12,10,9,12,19,26,16,6],
    [0,0,0,0,0,0,0,1,3,13,17,15,11,14,16,14,11,8,7,9,13,16,10,4],
    [0,0,0,0,0,0,0,0,1,4,6,7,6,5,5,4,3,3,3,4,6,8,5,2],
    [0,0,0,0,0,0,0,0,0,2,4,5,4,4,3,2,2,2,4,6,9,12,7,2]
  ]'::jsonb;

  v_heatmap_mid JSONB := '[
    [0,0,0,0,0,0,0,1,3,16,20,18,14,17,19,16,12,7,6,8,11,14,9,2],
    [0,0,0,0,0,0,0,1,4,17,21,19,14,18,20,18,13,9,7,10,16,24,14,4],
    [0,0,0,0,0,0,0,1,3,16,19,17,13,16,18,16,12,7,5,8,12,17,9,2],
    [0,0,0,0,0,0,0,1,3,15,20,18,13,17,17,16,11,7,6,9,13,18,10,3],
    [0,0,0,0,0,0,0,1,3,14,18,16,12,15,17,15,10,5,4,6,8,10,6,2],
    [0,0,0,0,0,0,0,0,1,2,3,4,3,3,2,2,2,1,2,2,4,5,2,1],
    [0,0,0,0,0,0,0,0,0,1,2,2,2,2,1,1,1,2,2,4,6,8,4,1]
  ]'::jsonb;

  v_heatmap_healthy JSONB := '[
    [0,0,0,0,0,0,0,1,3,18,22,20,15,19,21,18,14,5,3,4,5,6,3,1],
    [0,0,0,0,0,0,0,1,4,19,23,21,16,20,22,19,15,6,4,5,7,9,4,1],
    [0,0,0,0,0,0,0,1,3,18,21,19,15,18,20,18,14,5,3,4,6,7,3,1],
    [0,0,0,0,0,0,0,1,3,17,22,20,15,19,19,18,13,5,4,5,6,8,4,1],
    [0,0,0,0,0,0,0,1,3,16,20,18,14,17,19,17,12,4,2,3,4,5,2,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,1,1,1,1,1,1,1,1,2,2,1,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,2,2,3,1,0]
  ]'::jsonb;

  v_staff RECORD;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'pt-nusantara-digital' LIMIT 1;
  SELECT id INTO v_owner_id FROM auth.users WHERE lower(email) = 'demo@batasjamreg.local' LIMIT 1;
  SELECT id INTO v_lead_id FROM auth.users WHERE lower(email) = 'demo-lead@batasjamreg.local' LIMIT 1;
  SELECT id INTO v_member_id FROM auth.users WHERE lower(email) = 'demo-member@batasjamreg.local' LIMIT 1;
  SELECT id INTO v_ws_creative FROM public.workspaces WHERE invite_code = 'REG-8492' LIMIT 1;
  SELECT id INTO v_ws_eng FROM public.workspaces WHERE invite_code = 'REG-4105' LIMIT 1;

  IF v_org_id IS NULL OR v_owner_id IS NULL THEN
    RETURN;
  END IF;

  -- 1. Tambah 5 anggota dummy realistis ke auth.users, auth.identities, profiles, & organization_members
  FOR v_staff IN
    SELECT * FROM (VALUES
      (v_bima_id, 'bima.sakti@batasjamreg.local', 'Bima Sakti', 'Senior Backend Engineer'),
      (v_tari_id, 'tari.kusuma@batasjamreg.local', 'Tari Kusuma', 'Product Manager'),
      (v_dimas_id, 'dimas.wijaya@batasjamreg.local', 'Dimas Wijaya', 'Growth Lead'),
      (v_ayu_id, 'ayu.lestari@batasjamreg.local', 'Ayu Lestari', 'Client Operations Lead'),
      (v_fajar_id, 'fajar.nugroho@batasjamreg.local', 'Fajar Nugroho', 'People Operations')
    ) AS t(uid, email, full_name, role_title)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_staff.uid OR lower(email) = v_staff.email) THEN
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        v_staff.uid,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'authenticated',
        'authenticated',
        v_staff.email,
        extensions.crypt('BatasJamDemo2026!', extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_staff.full_name),
        now(), now(), '', '', '', ''
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_staff.uid AND provider = 'email') THEN
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_staff.uid,
        jsonb_build_object('sub', v_staff.uid::text, 'email', v_staff.email, 'email_verified', true, 'phone_verified', false),
        'email',
        v_staff.uid::text,
        now(), now(), now()
      );
    END IF;

    INSERT INTO public.profiles (id, full_name, role_title)
    VALUES (v_staff.uid, v_staff.full_name, v_staff.role_title)
    ON CONFLICT (id) DO UPDATE SET role_title = EXCLUDED.role_title;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_staff.uid, 'MEMBER')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END LOOP;

  -- 2. Tambah 2 divisi baru (Tim Growth & Pemasaran, Tim Operasional & Klien)
  INSERT INTO public.workspaces (
    id, organization_id, name, slug, invite_code, work_pattern,
    work_start_time, work_end_time, digest_dispatch_time, timezone, work_days, created_by
  ) VALUES
    (
      v_ws_growth, v_org_id, 'Tim Growth & Pemasaran', 'tim-growth-pemasaran', 'REG-5218',
      'FIVE_DAYS_8H', '09:00:00', '17:00:00', '08:30:00', 'Asia/Jakarta', '{1,2,3,4,5}', v_dimas_id
    ),
    (
      v_ws_ops, v_org_id, 'Tim Operasional & Klien', 'tim-operasional-klien', 'REG-6340',
      'SIX_DAYS_7H', '09:00:00', '16:00:00', '08:30:00', 'Asia/Makassar', '{1,2,3,4,5,6}', v_ayu_id
    )
  ON CONFLICT (invite_code) DO NOTHING;

  SELECT id INTO v_ws_growth FROM public.workspaces WHERE invite_code = 'REG-5218' LIMIT 1;
  SELECT id INTO v_ws_ops FROM public.workspaces WHERE invite_code = 'REG-6340' LIMIT 1;

  -- Lengkapi anggota di keempat divisi (Owner tetap Mode Pantau pada Engineering, Growth, Ops)
  IF v_ws_creative IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
      (v_ws_creative, v_fajar_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  IF v_ws_eng IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
      (v_ws_eng, v_bima_id, 'MEMBER'),
      (v_ws_eng, v_tari_id, 'MEMBER'),
      (v_ws_eng, v_fajar_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  IF v_ws_growth IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
      (v_ws_growth, v_dimas_id, 'LEAD'),
      (v_ws_growth, v_ayu_id, 'MEMBER'),
      (v_ws_growth, COALESCE(v_member_id, v_fajar_id), 'MEMBER'),
      (v_ws_growth, v_tari_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  IF v_ws_ops IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
      (v_ws_ops, v_ayu_id, 'LEAD'),
      (v_ws_ops, v_fajar_id, 'MEMBER'),
      (v_ws_ops, v_bima_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  -- 3. Perbanyak audit_snapshots lintas divisi
  IF v_ws_creative IS NOT NULL THEN
    INSERT INTO public.audit_snapshots (
      id, workspace_id, created_by, label, period_start, period_end,
      total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count,
      peak_day_of_week, peak_hour, heatmap_matrix
    ) VALUES (
      '44444444-4444-4444-8444-444444444400'::uuid,
      v_ws_creative, v_owner_id,
      'Audit Agustus 2026 (Pra-Piagam)', '2026-08-01'::date, '2026-08-31'::date,
      1680, 672, 62.00, 58, 2, 21, v_heatmap_high
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ws_eng IS NOT NULL THEN
    INSERT INTO public.audit_snapshots (
      id, workspace_id, created_by, label, period_start, period_end,
      total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count,
      peak_day_of_week, peak_hour, heatmap_matrix
    ) VALUES
      (
        '44444444-4444-4444-8444-444444444411'::uuid,
        v_ws_eng, COALESCE(v_lead_id, v_owner_id),
        'Audit September 2026 (Sprint Rilis)', '2026-09-01'::date, '2026-09-30'::date,
        2150, 882, 64.00, 118, 2, 22, v_heatmap_high
      ),
      (
        '44444444-4444-4444-8444-444444444412'::uuid,
        v_ws_eng, COALESCE(v_lead_id, v_owner_id),
        'Audit Oktober 2026 (Stabilisasi)', '2026-10-01'::date, '2026-10-31'::date,
        2240, 829, 61.00, 110, 2, 21, v_heatmap_high
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ws_growth IS NOT NULL THEN
    INSERT INTO public.audit_snapshots (
      id, workspace_id, created_by, label, period_start, period_end,
      total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count,
      peak_day_of_week, peak_hour, heatmap_matrix
    ) VALUES
      (
        '44444444-4444-4444-8444-444444444421'::uuid,
        v_ws_growth, v_dimas_id,
        'Audit September 2026 (Kampanye Q3)', '2026-09-01'::date, '2026-09-30'::date,
        1420, 398, 38.50, 29, 4, 20, v_heatmap_mid
      ),
      (
        '44444444-4444-4444-8444-444444444422'::uuid,
        v_ws_growth, v_dimas_id,
        'Audit November 2026 (Pasca-Piagam)', '2026-11-01'::date, '2026-11-22'::date,
        1510, 211, 21.50, 11, 4, 19, v_heatmap_healthy
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ws_ops IS NOT NULL THEN
    INSERT INTO public.audit_snapshots (
      id, workspace_id, created_by, label, period_start, period_end,
      total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count,
      peak_day_of_week, peak_hour, heatmap_matrix
    ) VALUES
      (
        '44444444-4444-4444-8444-444444444431'::uuid,
        v_ws_ops, v_ayu_id,
        'Audit September 2026 (Baseline WITA)', '2026-09-01'::date, '2026-09-30'::date,
        1340, 442, 44.00, 36, 3, 20, v_heatmap_mid
      ),
      (
        '44444444-4444-4444-8444-444444444432'::uuid,
        v_ws_ops, v_ayu_id,
        'Audit November 2026 (Penyesuaian SLA)', '2026-11-01'::date, '2026-11-22'::date,
        1390, 361, 34.50, 22, 3, 19, v_heatmap_mid
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 4. Pastikan tiap divisi punya piagam aktif + persetujuan digital
  IF v_ws_growth IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.team_charters WHERE workspace_id = v_ws_growth) THEN
    INSERT INTO public.team_charters (
      id, workspace_id, created_by, title, company_or_team_name,
      quiet_hours_start, quiet_hours_end, non_urgent_sla_hours, emergency_criteria,
      baseline_shadow_hours, is_active
    ) VALUES (
      '55555555-5555-4555-8555-555555555503'::uuid,
      v_ws_growth, v_dimas_id, 'Piagam Jam Digital Tim Growth & Pemasaran', 'Tim Growth & Pemasaran',
      '18:00:00', '08:30:00', 2,
      '[
        "Kesalahan tautan atau harga promo pada iklan berbayar yang sedang tayang",
        "Akun media sosial atau dashboard iklan terindikasi akses tidak sah",
        "Penarikan materi publikasi mendadak akibat isu hukum atau kepatuhan"
      ]'::jsonb,
      21.50, true
    );
  END IF;

  IF v_ws_ops IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.team_charters WHERE workspace_id = v_ws_ops) THEN
    INSERT INTO public.team_charters (
      id, workspace_id, created_by, title, company_or_team_name,
      quiet_hours_start, quiet_hours_end, non_urgent_sla_hours, emergency_criteria,
      baseline_shadow_hours, is_active
    ) VALUES (
      '55555555-5555-4555-8555-555555555504'::uuid,
      v_ws_ops, v_ayu_id, 'Piagam Jam Digital Tim Operasional & Klien', 'Tim Operasional & Klien',
      '17:00:00', '08:30:00', 3,
      '[
        "Kendala akses portal klien pada hari peluncuran kontrak",
        "Perubahan jadwal kegiatan luring klien dalam kurang dari 12 jam",
        "Insiden penagihan atau kesalahan dokumen kontrak mendesak"
      ]'::jsonb,
      34.50, true
    );
  END IF;

  SELECT id INTO v_ch_creative FROM public.team_charters WHERE workspace_id = v_ws_creative AND is_active = true ORDER BY version DESC LIMIT 1;
  SELECT id INTO v_ch_eng FROM public.team_charters WHERE workspace_id = v_ws_eng AND is_active = true ORDER BY version DESC LIMIT 1;
  SELECT id INTO v_ch_growth FROM public.team_charters WHERE workspace_id = v_ws_growth AND is_active = true ORDER BY version DESC LIMIT 1;
  SELECT id INTO v_ch_ops FROM public.team_charters WHERE workspace_id = v_ws_ops AND is_active = true ORDER BY version DESC LIMIT 1;

  IF v_ch_creative IS NOT NULL THEN
    INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
    VALUES (v_ch_creative, v_ws_creative, v_fajar_id, now() - interval '12 hours')
    ON CONFLICT (charter_id, user_id) DO NOTHING;
  END IF;

  IF v_ch_eng IS NOT NULL THEN
    INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
    VALUES
      (v_ch_eng, v_ws_eng, v_bima_id, now() - interval '2 days'),
      (v_ch_eng, v_ws_eng, v_tari_id, now() - interval '1 day')
    ON CONFLICT (charter_id, user_id) DO NOTHING;
  END IF;

  IF v_ch_growth IS NOT NULL THEN
    INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
    VALUES
      (v_ch_growth, v_ws_growth, v_dimas_id, now() - interval '4 days'),
      (v_ch_growth, v_ws_growth, v_ayu_id, now() - interval '3 days'),
      (v_ch_growth, v_ws_growth, COALESCE(v_member_id, v_fajar_id), now() - interval '2 days'),
      (v_ch_growth, v_ws_growth, v_tari_id, now() - interval '1 day')
    ON CONFLICT (charter_id, user_id) DO NOTHING;
  END IF;

  IF v_ch_ops IS NOT NULL THEN
    INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
    VALUES
      (v_ch_ops, v_ws_ops, v_ayu_id, now() - interval '3 days'),
      (v_ch_ops, v_ws_ops, v_fajar_id, now() - interval '1 day')
    ON CONFLICT (charter_id, user_id) DO NOTHING;
  END IF;

  -- 5. Perbanyak digest_cards across divisions
  IF v_ws_creative IS NOT NULL THEN
    INSERT INTO public.digest_cards (
      id, workspace_id, author_id, title, body, recipient_label, triage_type,
      emergency_reason, status, scheduled_for, dispatched_at
    ) VALUES
      (
        '33333333-3333-4333-8333-333333333311'::uuid,
        v_ws_creative, v_fajar_id,
        'Revisi palet ilustrasi panduan onboarding klien',
        'Sesuaikan warna latar infografis halaman 3 dengan panduan merek terbaru pada jam kerja besok.',
        'Tim Desain', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL
      ),
      (
        '33333333-3333-4333-8333-333333333312'::uuid,
        v_ws_creative, COALESCE(v_member_id, v_owner_id),
        'Kurasi dokumentasi studi kasus kampanye Oktober',
        'Kumpulkan tangkapan layar performa akhir Oktober untuk bahan presentasi mingguan.',
        'Tim Konten', 'MORNING_QUEUE', NULL, 'DISPATCHED', CURRENT_DATE, now() - interval '1 day'
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ws_eng IS NOT NULL THEN
    INSERT INTO public.digest_cards (
      id, workspace_id, author_id, title, body, recipient_label, triage_type,
      emergency_reason, status, scheduled_for, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at
    ) VALUES
      (
        '33333333-3333-4333-8333-333333333321'::uuid,
        v_ws_eng, v_bima_id,
        'Optimasi indeks query laporan ekspor bulanan',
        'Tambahkan composite index pada kolom workspace_id dan created_at saat jam kerja besok pagi.',
        'Tim Backend', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, 'PENDING', NULL, NULL
      ),
      (
        '33333333-3333-4333-8333-333333333322'::uuid,
        v_ws_eng, v_tari_id,
        'Sinkronisasi daftar bug minor rilis v2.4',
        'Rangkum tiga temuan QA minor untuk dibahas di standup pukul 09.30 WIB.',
        'Tim QA & Produk', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, 'PENDING', NULL, NULL
      ),
      (
        '33333333-3333-4333-8333-333333333323'::uuid,
        v_ws_eng, v_bima_id,
        'Lonjakan latency API autentikasi di atas 4 detik',
        'Monitoring mencatat timeout pada layanan token refresh pukul 22.10 WIB.',
        'Tim Infrastruktur', 'EMERGENCY_OPS',
        'Pengguna aktif gagal login ke aplikasi produksi secara serentak sejak pukul 22.10 WIB.',
        'QUEUED', CURRENT_DATE, 'VALID_EMERGENCY', COALESCE(v_lead_id, v_owner_id), now() - interval '3 hours'
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ws_growth IS NOT NULL THEN
    INSERT INTO public.digest_cards (
      id, workspace_id, author_id, title, body, recipient_label, triage_type,
      emergency_reason, status, scheduled_for, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at
    ) VALUES
      (
        '33333333-3333-4333-8333-333333333331'::uuid,
        v_ws_growth, v_dimas_id,
        'Evaluasi biaya akuisisi kampanye media sosial minggu ini',
        'Tinjau ulang alokasi anggaran adset B dan siapkan opsi materi baru untuk besok pagi.',
        'Tim Growth', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, 'PENDING', NULL, NULL
      ),
      (
        '33333333-3333-4333-8333-333333333332'::uuid,
        v_ws_growth, v_ayu_id,
        'Tautan formulir pendaftaran webinar mengarah ke halaman 404',
        'Iklan berbayar sudah aktif berjalan namun tombol daftar mengarah ke URL lama.',
        'Tim Kampanye', 'EMERGENCY_OPS',
        'Kampanye iklan berbayar sedang tayang aktif malam ini dan seluruh klik pengguna gagal membuka form.',
        'QUEUED', CURRENT_DATE, 'VALID_EMERGENCY', v_dimas_id, now() - interval '4 hours'
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF v_ws_ops IS NOT NULL THEN
    INSERT INTO public.digest_cards (
      id, workspace_id, author_id, title, body, recipient_label, triage_type,
      emergency_reason, status, scheduled_for, emergency_review_status
    ) VALUES
      (
        '33333333-3333-4333-8333-333333333341'::uuid,
        v_ws_ops, v_ayu_id,
        'Konfirmasi agenda onboarding klien wilayah Indonesia Tengah',
        'Kirim tautan rapat dan panduan jam reguler tim ke PIC klien pukul 09.00 WITA.',
        'Tim Klien', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, 'PENDING'
      ),
      (
        '33333333-3333-4333-8333-333333333342'::uuid,
        v_ws_ops, v_fajar_id,
        'Permintaan salinan invoice arsip kuartal dua',
        'Klien meminta salinan PDF ulang untuk arsip internal mereka besok siang.',
        'Tim Administrasi', 'EMERGENCY_OPS',
        'Khawatir terlewat saat jam masuk besok pagi padahal tenggat administrasi klien baru tiga hari lagi.',
        'QUEUED', CURRENT_DATE, 'SHOULD_BE_QUEUED'
      )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 6. Perbanyak wellbeing_pulses agar K-Anonymity (>= 3) terpenuhi di Engineering & Growth, dan < 3 di Ops
  IF v_ws_eng IS NOT NULL THEN
    INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
    VALUES
      (v_ws_eng, COALESCE(v_lead_id, v_owner_id), v_week_start, 3, 4, 3),
      (v_ws_eng, v_bima_id, v_week_start, 2, 4, 3),
      (v_ws_eng, v_tari_id, v_week_start, 3, 3, 4),
      (v_ws_eng, v_fajar_id, v_week_start, 3, 3, 4)
    ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
  END IF;

  IF v_ws_growth IS NOT NULL THEN
    INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
    VALUES
      (v_ws_growth, v_dimas_id, v_week_start, 4, 2, 5),
      (v_ws_growth, v_ayu_id, v_week_start, 5, 2, 5),
      (v_ws_growth, COALESCE(v_member_id, v_fajar_id), v_week_start, 4, 2, 4),
      (v_ws_growth, v_tari_id, v_week_start, 4, 1, 5)
    ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
  END IF;

  IF v_ws_ops IS NOT NULL THEN
    INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
    VALUES
      (v_ws_ops, v_ayu_id, v_week_start, 4, 3, 4),
      (v_ws_ops, v_fajar_id, v_week_start, 3, 3, 4)
    ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
  END IF;
END $$;

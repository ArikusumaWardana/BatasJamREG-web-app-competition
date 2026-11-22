-- BatasJamREG Idempotent Demo Seed Script
-- Akun Demo: demo@batasjamreg.local (Raka Pratama - Demo Lead)
-- Workspace: Tim Kreatif Nusantara (Invite Code: REG-8492)

DO $$
DECLARE
  v_user_id UUID;
  v_ws_id UUID;
  v_heatmap_sep JSONB := '[
    [0,0,0,0,0,0,0,1,4,14,18,16,12,15,17,14,11,8,7,9,14,19,12,4],
    [0,0,0,0,0,0,0,2,5,15,19,17,13,16,18,16,13,10,9,13,22,34,21,7],
    [0,0,0,0,0,0,0,1,4,14,17,15,11,14,16,14,12,8,7,10,16,22,13,4],
    [0,0,0,0,0,0,0,1,4,13,18,16,12,15,15,14,11,9,8,11,17,24,14,5],
    [0,0,0,0,0,0,0,1,3,12,16,14,10,13,15,13,10,7,6,8,11,14,9,3],
    [0,0,0,0,0,0,0,0,1,3,5,6,5,4,4,3,3,2,2,3,5,7,4,1],
    [0,0,0,0,0,0,0,0,0,2,3,4,3,3,2,2,2,2,3,5,8,11,6,2]
  ]'::jsonb;
  v_heatmap_okt JSONB := '[
    [0,0,0,0,0,0,0,1,3,15,19,17,13,16,18,15,12,7,6,8,12,16,10,3],
    [0,0,0,0,0,0,0,1,4,16,20,18,14,17,19,17,13,9,8,11,19,29,18,5],
    [0,0,0,0,0,0,0,1,3,15,18,16,12,15,17,15,12,7,6,9,14,19,11,3],
    [0,0,0,0,0,0,0,1,4,14,19,17,12,16,16,15,11,8,7,10,15,21,12,4],
    [0,0,0,0,0,0,0,1,3,13,17,15,11,14,16,14,10,6,5,7,10,12,7,2],
    [0,0,0,0,0,0,0,0,1,2,4,5,4,3,3,2,2,2,2,3,4,6,3,1],
    [0,0,0,0,0,0,0,0,0,1,2,3,3,2,2,2,2,2,3,4,7,9,5,1]
  ]'::jsonb;
  v_heatmap_nov JSONB := '[
    [0,0,0,0,0,0,0,1,3,16,20,18,14,17,19,16,12,6,5,7,10,14,8,2],
    [0,0,0,0,0,0,0,1,4,17,21,19,14,18,20,18,13,8,7,10,17,26,15,4],
    [0,0,0,0,0,0,0,1,3,16,19,17,13,16,18,16,12,6,5,8,12,17,9,2],
    [0,0,0,0,0,0,0,1,3,15,20,18,13,17,17,16,11,7,6,9,13,18,10,3],
    [0,0,0,0,0,0,0,1,3,14,18,16,12,15,17,15,10,5,4,6,8,10,6,2],
    [0,0,0,0,0,0,0,0,1,2,3,4,3,3,2,2,2,1,2,2,4,5,2,1],
    [0,0,0,0,0,0,0,0,0,1,2,2,2,2,1,1,1,2,2,4,6,8,4,1]
  ]'::jsonb;
BEGIN
  -- 1. Pastikan akun demo ada di auth.users & auth.identities
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'demo@batasjamreg.local'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := '11111111-1111-4111-8111-111111111111'::uuid;

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'authenticated',
      'authenticated',
      'demo@batasjamreg.local',
      extensions.crypt('BatasJamDemo2026!', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Raka Pratama"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = v_user_id AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object(
        'sub', v_user_id::text,
        'email', 'demo@batasjamreg.local',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  END IF;

  -- Pastikan profil Demo Lead tersinkron
  INSERT INTO public.profiles (id, full_name, role_title)
  VALUES (v_user_id, 'Raka Pratama', 'Demo Lead')
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role_title = EXCLUDED.role_title;

  -- 2. Workspace demo "Tim Kreatif Nusantara"
  INSERT INTO public.workspaces (
    id,
    name,
    slug,
    invite_code,
    work_pattern,
    work_start_time,
    work_end_time,
    digest_dispatch_time,
    timezone,
    work_days,
    created_by
  ) VALUES (
    '22222222-2222-4222-8222-222222222222'::uuid,
    'Tim Kreatif Nusantara',
    'tim-kreatif-nusantara',
    'REG-8492',
    'FIVE_DAYS_8H',
    '09:00:00',
    '17:00:00',
    '08:30:00',
    'Asia/Jakarta',
    '{1,2,3,4,5}',
    v_user_id
  )
  ON CONFLICT (invite_code) DO NOTHING;

  SELECT id INTO v_ws_id
  FROM public.workspaces
  WHERE invite_code = 'REG-8492'
  LIMIT 1;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_ws_id, v_user_id, 'OWNER')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- 3. 5 kartu digest_cards realistis (MORNING_QUEUE, EMERGENCY_OPS, DISPATCHED)
  INSERT INTO public.digest_cards (
    id,
    workspace_id,
    author_id,
    title,
    body,
    recipient_label,
    triage_type,
    emergency_reason,
    status,
    scheduled_for,
    dispatched_at
  ) VALUES
    (
      '33333333-3333-4333-8333-333333333301'::uuid,
      v_ws_id,
      v_user_id,
      'Finalisasi salinan deck presentasi klien Q4',
      'Mohon tinjau ulang slide 4 sampai 8 dan sesuaikan angka target kampanye sebelum rapat pukul 10.00 WIB besok.',
      'Tim Kreatif',
      'MORNING_QUEUE',
      NULL,
      'QUEUED',
      CURRENT_DATE + 1,
      NULL
    ),
    (
      '33333333-3333-4333-8333-333333333302'::uuid,
      v_ws_id,
      v_user_id,
      'Pembaruan aset banner landing page produk',
      'Ganti resolusi banner hero desktop ke ukuran 1440px agar tidak terpotong di layar lebar. Dikerjakan saat jam kerja dimulai.',
      'Tim Desain',
      'MORNING_QUEUE',
      NULL,
      'QUEUED',
      CURRENT_DATE + 1,
      NULL
    ),
    (
      '33333333-3333-4333-8333-333333333303'::uuid,
      v_ws_id,
      v_user_id,
      'Sinkronisasi jadwal konten media sosial minggu depan',
      'Rekap ulang daftar jadwal unggah dari tim copywriter dan kirim draf ringkasnya setelah sesi standup pagi.',
      'Semua Tim',
      'MORNING_QUEUE',
      NULL,
      'QUEUED',
      CURRENT_DATE + 1,
      NULL
    ),
    (
      '33333333-3333-4333-8333-333333333304'::uuid,
      v_ws_id,
      v_user_id,
      'Pemulihan endpoint webhook pembayaran produksi',
      'Terdapat lonjakan error 502 pada callback payment gateway sejak pukul 21.15 WIB. Perlu verifikasi status server segera.',
      'Tim Teknis',
      'EMERGENCY_OPS',
      'Layanan checkout produksi gagal menerima notifikasi pembayaran sejak pukul 21.15 WIB sehingga transaksi pelanggan tertahan.',
      'QUEUED',
      CURRENT_DATE,
      NULL
    ),
    (
      '33333333-3333-4333-8333-333333333305'::uuid,
      v_ws_id,
      v_user_id,
      'Konfirmasi daftar vendor percetakan kalender tahunan',
      'Rangkuman penawaran tiga vendor percetakan sudah masuk. Mohon pilih satu vendor saat diskusi pagi.',
      'Tim Operasional',
      'MORNING_QUEUE',
      NULL,
      'DISPATCHED',
      CURRENT_DATE,
      now() - interval '6 hours'
    )
  ON CONFLICT (id) DO NOTHING;

  -- 4. 3 audit_snapshots historis (Sep 56.0 jam, Okt 49.0 jam, Nov 42.5 jam)
  INSERT INTO public.audit_snapshots (
    id,
    workspace_id,
    created_by,
    label,
    period_start,
    period_end,
    total_messages,
    after_hours_messages,
    shadow_overtime_hours,
    false_urgency_count,
    peak_day_of_week,
    peak_hour,
    heatmap_matrix
  ) VALUES
    (
      '44444444-4444-4444-8444-444444444401'::uuid,
      v_ws_id,
      v_user_id,
      'Audit September 2026 (Baseline Awal)',
      '2026-09-01'::date,
      '2026-09-30'::date,
      1720,
      619,
      56.00,
      48,
      2,
      21,
      v_heatmap_sep
    ),
    (
      '44444444-4444-4444-8444-444444444402'::uuid,
      v_ws_id,
      v_user_id,
      'Audit Oktober 2026 (Fase Edukasi Tim)',
      '2026-10-01'::date,
      '2026-10-31'::date,
      1790,
      555,
      49.00,
      39,
      2,
      21,
      v_heatmap_okt
    ),
    (
      '44444444-4444-4444-8444-444444444403'::uuid,
      v_ws_id,
      v_user_id,
      'Audit November 2026 (Simulasi 90 Hari)',
      '2026-11-01'::date,
      '2026-11-22'::date,
      1840,
      497,
      42.50,
      31,
      2,
      21,
      v_heatmap_nov
    )
  ON CONFLICT (id) DO NOTHING;

  -- 5. 1 team_charters aktif versi 1 (cegah duplikasi versi saat re-run)
  IF NOT EXISTS (
    SELECT 1 FROM public.team_charters
    WHERE workspace_id = v_ws_id
  ) THEN
    INSERT INTO public.team_charters (
      id,
      workspace_id,
      created_by,
      title,
      company_or_team_name,
      quiet_hours_start,
      quiet_hours_end,
      non_urgent_sla_hours,
      emergency_criteria,
      baseline_shadow_hours,
      is_active
    ) VALUES (
      '55555555-5555-4555-8555-555555555501'::uuid,
      v_ws_id,
      v_user_id,
      'Piagam Jam Digital Tim Kreatif Nusantara',
      'Tim Kreatif Nusantara',
      '18:00:00',
      '08:00:00',
      2,
      '[
        "Gangguan server atau website produksi mati (HTTP 5xx)",
        "Kebocoran data atau insiden keamanan akun klien",
        "Perubahan jadwal tayang iklan berbayar yang sudah berjalan",
        "Pembatalan mendadak acara luring di hari pelaksanaan"
      ]'::jsonb,
      42.50,
      true
    );
  END IF;
END $$;

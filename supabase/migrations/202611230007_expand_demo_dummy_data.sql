-- Idempotent Expanded Dummy Data for BatasJamREG Demo ("PT Nusantara Digital")
-- Menambah 10 anggota baru (total 18), 6 divisi baru (total 10 divisi -> 4 halaman pagination),
-- 19 snapshot historis baru (total 30), piagam + persetujuan digital, 24 kartu digest baru, & 40+ wellbeing pulses.

DO $$
DECLARE
  v_org_id UUID;
  v_owner_id UUID;

  v_rendra_id UUID := '11111111-1111-4111-8111-111111111107'::uuid;
  v_nadia_id UUID  := '11111111-1111-4111-8111-111111111108'::uuid;
  v_hendra_id UUID := '11111111-1111-4111-8111-111111111109'::uuid;
  v_putri_id UUID  := '11111111-1111-4111-8111-111111111110'::uuid;
  v_bagus_id UUID  := '11111111-1111-4111-8111-111111111112'::uuid;
  v_laras_id UUID  := '11111111-1111-4111-8111-111111111113'::uuid;
  v_yoga_id UUID   := '11111111-1111-4111-8111-111111111114'::uuid;
  v_citra_id UUID  := '11111111-1111-4111-8111-111111111115'::uuid;
  v_reza_id UUID   := '11111111-1111-4111-8111-111111111116'::uuid;
  v_maya_id UUID   := '11111111-1111-4111-8111-111111111117'::uuid;

  v_bima_id UUID   := '11111111-1111-4111-8111-111111111102'::uuid;
  v_tari_id UUID   := '11111111-1111-4111-8111-111111111103'::uuid;
  v_dimas_id UUID  := '11111111-1111-4111-8111-111111111104'::uuid;
  v_ayu_id UUID    := '11111111-1111-4111-8111-111111111105'::uuid;
  v_fajar_id UUID  := '11111111-1111-4111-8111-111111111106'::uuid;

  v_ws_creative UUID;
  v_ws_eng UUID;
  v_ws_data UUID  := '22222222-2222-4222-8222-222222222205'::uuid;
  v_ws_qa UUID    := '22222222-2222-4222-8222-222222222206'::uuid;
  v_ws_infra UUID := '22222222-2222-4222-8222-222222222207'::uuid;
  v_ws_fin UUID   := '22222222-2222-4222-8222-222222222208'::uuid;
  v_ws_hr UUID    := '22222222-2222-4222-8222-222222222209'::uuid;
  v_ws_cs UUID    := '22222222-2222-4222-8222-222222222210'::uuid;

  v_ch_id UUID;
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
  SELECT id INTO v_ws_creative FROM public.workspaces WHERE invite_code = 'REG-8492' LIMIT 1;
  SELECT id INTO v_ws_eng FROM public.workspaces WHERE invite_code = 'REG-4105' LIMIT 1;

  IF v_org_id IS NULL OR v_owner_id IS NULL THEN
    RETURN;
  END IF;

  -- 1. Tambah 10 anggota tim baru (total 18 profil)
  FOR v_staff IN
    SELECT * FROM (VALUES
      (v_rendra_id, 'rendra.pratama@batasjamreg.local', 'Rendra Pratama', 'Frontend Engineer'),
      (v_nadia_id,  'nadia.wulandari@batasjamreg.local', 'Nadia Wulandari', 'UI/UX Designer'),
      (v_hendra_id, 'hendra.gunawan@batasjamreg.local', 'Hendra Gunawan', 'QA Lead'),
      (v_putri_id,  'putri.maharani@batasjamreg.local', 'Putri Maharani', 'Finance & Tax Specialist'),
      (v_bagus_id,  'bagus.santoso@batasjamreg.local', 'Bagus Santoso', 'DevOps Lead'),
      (v_laras_id,  'larasati.dewi@batasjamreg.local', 'Larasati Dewi', 'People & Culture Lead'),
      (v_yoga_id,   'yoga.permana@batasjamreg.local', 'Yoga Permana', 'Customer Success Lead'),
      (v_citra_id,  'citra.anggraini@batasjamreg.local', 'Citra Anggraini', 'Content Strategist'),
      (v_reza_id,   'reza.pahlevi@batasjamreg.local', 'Reza Pahlevi', 'Data & Analytics Lead'),
      (v_maya_id,   'maya.sari@batasjamreg.local', 'Maya Sari', 'Legal & Finance Lead')
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
        'authenticated', 'authenticated', v_staff.email,
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
        gen_random_uuid(), v_staff.uid,
        jsonb_build_object('sub', v_staff.uid::text, 'email', v_staff.email, 'email_verified', true, 'phone_verified', false),
        'email', v_staff.uid::text, now(), now(), now()
      );
    END IF;

    INSERT INTO public.profiles (id, full_name, role_title)
    VALUES (v_staff.uid, v_staff.full_name, v_staff.role_title)
    ON CONFLICT (id) DO UPDATE SET role_title = EXCLUDED.role_title;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_staff.uid, 'MEMBER')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END LOOP;

  -- 2. Tambah 6 divisi baru (total 10 divisi -> 4 halaman pagination)
  INSERT INTO public.workspaces (
    id, organization_id, name, slug, invite_code, work_pattern,
    work_start_time, work_end_time, digest_dispatch_time, timezone, work_days, created_by
  ) VALUES
    (v_ws_data,  v_org_id, 'Tim Data & Analitik', 'tim-data-analitik', 'REG-7120', 'FIVE_DAYS_8H', '09:00:00', '17:00:00', '08:30:00', 'Asia/Jakarta', '{1,2,3,4,5}', v_reza_id),
    (v_ws_qa,    v_org_id, 'Tim Quality Assurance', 'tim-quality-assurance', 'REG-7245', 'FIVE_DAYS_8H', '09:00:00', '17:00:00', '08:30:00', 'Asia/Jakarta', '{1,2,3,4,5}', v_hendra_id),
    (v_ws_infra, v_org_id, 'Tim Infrastruktur & Cloud', 'tim-infrastruktur-cloud', 'REG-7390', 'CUSTOM', '08:00:00', '16:00:00', '08:00:00', 'Asia/Jakarta', '{1,2,3,4,5}', v_bagus_id),
    (v_ws_fin,   v_org_id, 'Tim Keuangan & Legal', 'tim-keuangan-legal', 'REG-7412', 'FIVE_DAYS_8H', '08:30:00', '16:30:00', '08:30:00', 'Asia/Jakarta', '{1,2,3,4,5}', v_maya_id),
    (v_ws_hr,    v_org_id, 'Tim People & Budaya', 'tim-people-budaya', 'REG-7588', 'FIVE_DAYS_8H', '09:00:00', '17:00:00', '08:30:00', 'Asia/Jakarta', '{1,2,3,4,5}', v_laras_id),
    (v_ws_cs,    v_org_id, 'Tim Customer Success', 'tim-customer-success', 'REG-7694', 'SIX_DAYS_7H', '09:00:00', '16:00:00', '08:30:00', 'Asia/Jayapura', '{1,2,3,4,5,6}', v_yoga_id)
  ON CONFLICT (invite_code) DO NOTHING;

  SELECT id INTO v_ws_data  FROM public.workspaces WHERE invite_code = 'REG-7120' LIMIT 1;
  SELECT id INTO v_ws_qa    FROM public.workspaces WHERE invite_code = 'REG-7245' LIMIT 1;
  SELECT id INTO v_ws_infra FROM public.workspaces WHERE invite_code = 'REG-7390' LIMIT 1;
  SELECT id INTO v_ws_fin   FROM public.workspaces WHERE invite_code = 'REG-7412' LIMIT 1;
  SELECT id INTO v_ws_hr    FROM public.workspaces WHERE invite_code = 'REG-7588' LIMIT 1;
  SELECT id INTO v_ws_cs    FROM public.workspaces WHERE invite_code = 'REG-7694' LIMIT 1;

  -- Keanggotaan tiap divisi (4-6 anggota per divisi)
  IF v_ws_creative IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
      (v_ws_creative, v_nadia_id, 'MEMBER'),
      (v_ws_creative, v_citra_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  IF v_ws_eng IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
      (v_ws_eng, v_rendra_id, 'MEMBER'),
      (v_ws_eng, v_bagus_id, 'MEMBER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
    (v_ws_data,  v_reza_id,   'LEAD'),
    (v_ws_data,  v_bima_id,   'MEMBER'),
    (v_ws_data,  v_tari_id,   'MEMBER'),
    (v_ws_data,  v_putri_id,  'MEMBER'),
    (v_ws_qa,    v_hendra_id, 'LEAD'),
    (v_ws_qa,    v_rendra_id, 'MEMBER'),
    (v_ws_qa,    v_nadia_id,  'MEMBER'),
    (v_ws_qa,    v_tari_id,   'MEMBER'),
    (v_ws_infra, v_bagus_id,  'LEAD'),
    (v_ws_infra, v_bima_id,   'MEMBER'),
    (v_ws_infra, v_hendra_id, 'MEMBER'),
    (v_ws_fin,   v_maya_id,   'LEAD'),
    (v_ws_fin,   v_putri_id,  'MEMBER'),
    (v_ws_fin,   v_laras_id,  'MEMBER'),
    (v_ws_hr,    v_laras_id,  'LEAD'),
    (v_ws_hr,    v_fajar_id,  'MEMBER'),
    (v_ws_hr,    v_citra_id,  'MEMBER'),
    (v_ws_cs,    v_yoga_id,   'LEAD'),
    (v_ws_cs,    v_ayu_id,    'MEMBER'),
    (v_ws_cs,    v_dimas_id,  'MEMBER'),
    (v_ws_cs,    v_citra_id,  'MEMBER')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- 3. Snapshot historis baru (total ~30 snapshot across 10 divisions)
  IF v_ws_creative IS NOT NULL THEN
    INSERT INTO public.audit_snapshots (
      id, workspace_id, created_by, label, period_start, period_end,
      total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count,
      peak_day_of_week, peak_hour, heatmap_matrix
    ) VALUES (
      '44444444-4444-4444-8444-444444444409'::uuid,
      v_ws_creative, v_owner_id, 'Audit Juli 2026 (Baseline Kuartal 3)', '2026-07-01'::date, '2026-07-31'::date,
      1610, 692, 66.50, 64, 2, 22, v_heatmap_high
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.audit_snapshots (
    id, workspace_id, created_by, label, period_start, period_end,
    total_messages, after_hours_messages, shadow_overtime_hours, false_urgency_count,
    peak_day_of_week, peak_hour, heatmap_matrix
  ) VALUES
    ('44444444-4444-4444-8444-444444444501'::uuid, v_ws_data, v_reza_id, 'Audit September 2026', '2026-09-01'::date, '2026-09-30'::date, 1280, 320, 29.00, 22, 3, 20, v_heatmap_mid),
    ('44444444-4444-4444-8444-444444444502'::uuid, v_ws_data, v_reza_id, 'Audit Oktober 2026', '2026-10-01'::date, '2026-10-31'::date, 1340, 268, 24.50, 15, 3, 19, v_heatmap_mid),
    ('44444444-4444-4444-8444-444444444503'::uuid, v_ws_data, v_reza_id, 'Audit November 2026', '2026-11-01'::date, '2026-11-22'::date, 1390, 181, 18.00, 9, 2, 19, v_heatmap_healthy),

    ('44444444-4444-4444-8444-444444444601'::uuid, v_ws_qa, v_hendra_id, 'Audit September 2026', '2026-09-01'::date, '2026-09-30'::date, 1750, 560, 48.00, 54, 4, 21, v_heatmap_high),
    ('44444444-4444-4444-8444-444444444602'::uuid, v_ws_qa, v_hendra_id, 'Audit Oktober 2026', '2026-10-01'::date, '2026-10-31'::date, 1810, 489, 41.50, 42, 4, 20, v_heatmap_mid),
    ('44444444-4444-4444-8444-444444444603'::uuid, v_ws_qa, v_hendra_id, 'Audit November 2026', '2026-11-01'::date, '2026-11-22'::date, 1820, 382, 33.00, 28, 4, 20, v_heatmap_mid),

    ('44444444-4444-4444-8444-444444444701'::uuid, v_ws_infra, v_bagus_id, 'Audit September 2026', '2026-09-01'::date, '2026-09-30'::date, 1940, 776, 68.50, 96, 2, 22, v_heatmap_high),
    ('44444444-4444-4444-8444-444444444702'::uuid, v_ws_infra, v_bagus_id, 'Audit Oktober 2026', '2026-10-01'::date, '2026-10-31'::date, 1990, 716, 63.00, 82, 2, 22, v_heatmap_high),
    ('44444444-4444-4444-8444-444444444703'::uuid, v_ws_infra, v_bagus_id, 'Audit November 2026', '2026-11-01'::date, '2026-11-22'::date, 2050, 635, 54.00, 68, 2, 21, v_heatmap_high),

    ('44444444-4444-4444-8444-444444444801'::uuid, v_ws_fin, v_maya_id, 'Audit September 2026', '2026-09-01'::date, '2026-09-30'::date, 980, 176, 16.50, 12, 5, 18, v_heatmap_healthy),
    ('44444444-4444-4444-8444-444444444802'::uuid, v_ws_fin, v_maya_id, 'Audit Oktober 2026', '2026-10-01'::date, '2026-10-31'::date, 1020, 153, 14.00, 8, 5, 18, v_heatmap_healthy),
    ('44444444-4444-4444-8444-444444444803'::uuid, v_ws_fin, v_maya_id, 'Audit November 2026', '2026-11-01'::date, '2026-11-22'::date, 1060, 117, 11.50, 5, 5, 17, v_heatmap_healthy),

    ('44444444-4444-4444-8444-444444444901'::uuid, v_ws_hr, v_laras_id, 'Audit September 2026', '2026-09-01'::date, '2026-09-30'::date, 890, 142, 13.00, 9, 1, 18, v_heatmap_healthy),
    ('44444444-4444-4444-8444-444444444902'::uuid, v_ws_hr, v_laras_id, 'Audit Oktober 2026', '2026-10-01'::date, '2026-10-31'::date, 920, 110, 10.50, 6, 1, 18, v_heatmap_healthy),
    ('44444444-4444-4444-8444-444444444903'::uuid, v_ws_hr, v_laras_id, 'Audit November 2026', '2026-11-01'::date, '2026-11-22'::date, 950, 86, 8.50, 3, 1, 17, v_heatmap_healthy),

    ('44444444-4444-4444-8444-444444445001'::uuid, v_ws_cs, v_yoga_id, 'Audit September 2026 (WIT)', '2026-09-01'::date, '2026-09-30'::date, 1640, 541, 46.50, 44, 3, 20, v_heatmap_mid),
    ('44444444-4444-4444-8444-444444445002'::uuid, v_ws_cs, v_yoga_id, 'Audit Oktober 2026 (WIT)', '2026-10-01'::date, '2026-10-31'::date, 1690, 473, 39.00, 34, 3, 19, v_heatmap_mid),
    ('44444444-4444-4444-8444-444444445003'::uuid, v_ws_cs, v_yoga_id, 'Audit November 2026 (WIT)', '2026-11-01'::date, '2026-11-22'::date, 1720, 413, 33.50, 25, 3, 19, v_heatmap_mid)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Piagam aktif & tanda tangan digital untuk 6 divisi baru
  INSERT INTO public.team_charters (
    id, workspace_id, created_by, title, company_or_team_name,
    quiet_hours_start, quiet_hours_end, non_urgent_sla_hours, emergency_criteria,
    baseline_shadow_hours, is_active
  )
  SELECT
    seed.cid, seed.ws_id, seed.author_id, seed.title, seed.team_name,
    seed.q_start::time, seed.q_end::time, seed.sla, seed.criteria::jsonb, seed.baseline, true
  FROM (VALUES
    ('55555555-5555-4555-8555-555555555505'::uuid, v_ws_data,  v_reza_id,   'Piagam Jam Digital Tim Data & Analitik',      'Tim Data & Analitik',      '18:00:00', '08:30:00', 2, '["Pipeline ETL malam gagal memblokir dashboard eksekutif","Anomali kebocoran akses warehouse data"]'::text, 18.00),
    ('55555555-5555-4555-8555-555555555506'::uuid, v_ws_qa,    v_hendra_id, 'Piagam Jam Digital Tim Quality Assurance',    'Tim Quality Assurance',    '18:00:00', '08:30:00', 2, '["Temuan bug kritikal P0 pada rilis produksi aktif","Kegagalan skrip regresi pada hotfix darurat"]'::text, 33.00),
    ('55555555-5555-4555-8555-555555555507'::uuid, v_ws_infra, v_bagus_id,  'Piagam Jam Digital Tim Infrastruktur & Cloud','Tim Infrastruktur & Cloud','17:00:00', '07:30:00', 1, '["Downtime cluster produksi atau database utama","Peringatan intrusi keamanan atau sertifikat TLS kedaluwarsa"]'::text, 54.00),
    ('55555555-5555-4555-8555-555555555508'::uuid, v_ws_fin,   v_maya_id,   'Piagam Jam Digital Tim Keuangan & Legal',     'Tim Keuangan & Legal',     '17:30:00', '08:00:00', 3, '["Tenggat pelaporan pajak atau otoritas di hari yang sama","Sengketa kontrak aktif atau pembekuan rekening operasional"]'::text, 11.50),
    ('55555555-5555-4555-8555-555555555509'::uuid, v_ws_hr,    v_laras_id,  'Piagam Jam Digital Tim People & Budaya',      'Tim People & Budaya',      '18:00:00', '08:30:00', 3, '["Insiden keselamatan kerja atau kedaruratan medis karyawan","Krisis kepegawaian mendesak yang memerlukan keputusan hari ini"]'::text, 8.50),
    ('55555555-5555-4555-8555-555555555510'::uuid, v_ws_cs,    v_yoga_id,   'Piagam Jam Digital Tim Customer Success',     'Tim Customer Success',     '17:00:00', '08:30:00', 2, '["Klien enterprise tidak dapat mengakses layanan saat jam operasional","Eskalasi gangguan SLA kontrak tingkat kritis"]'::text, 33.50)
  ) AS seed(cid, ws_id, author_id, title, team_name, q_start, q_end, sla, criteria, baseline)
  WHERE NOT EXISTS (SELECT 1 FROM public.team_charters tc WHERE tc.workspace_id = seed.ws_id);

  -- Persetujuan digital untuk piagam baru
  FOR v_ch_id IN
    SELECT id FROM public.team_charters
    WHERE workspace_id IN (v_ws_data, v_ws_qa, v_ws_infra, v_ws_fin, v_ws_hr, v_ws_cs)
      AND is_active = true
  LOOP
    INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
    SELECT tc.id, tc.workspace_id, wm.user_id, now() - interval '1 day'
    FROM public.team_charters tc
    JOIN public.workspace_members wm ON wm.workspace_id = tc.workspace_id
    WHERE tc.id = v_ch_id
      AND wm.role IN ('LEAD', 'MEMBER')
    ON CONFLICT (charter_id, user_id) DO NOTHING;
  END LOOP;

  -- 5. Kartu digest tambahan across divisions (campuran antrean, darurat, terkirim)
  IF v_ws_creative IS NOT NULL THEN
    INSERT INTO public.digest_cards (
      id, workspace_id, author_id, title, body, recipient_label, triage_type,
      emergency_reason, status, scheduled_for, dispatched_at, emergency_review_status
    ) VALUES
      ('33333333-3333-4333-8333-333333333313'::uuid, v_ws_creative, v_nadia_id, 'Ekspor variasi thumbnail YouTube 16:9', 'Siapkan 3 opsi warna teks thumbnail untuk evaluasi jam 10.00 WIB besok.', 'Tim Desain', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING'),
      ('33333333-3333-4333-8333-333333333314'::uuid, v_ws_creative, v_citra_id, 'Draf skrip video testimoni pelanggan November', 'Kirim dokumen Google Docs untuk direview tim kreatif pada jam kerja.', 'Tim Konten', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING'),
      ('33333333-3333-4333-8333-333333333315'::uuid, v_ws_creative, v_owner_id, 'Rekap aset materi peluncuran produk Q4', 'Seluruh aset kampanye sudah diunggah ke folder bersama tim.', 'Semua Tim', 'MORNING_QUEUE', NULL, 'DISPATCHED', CURRENT_DATE - 1, now() - interval '1 day', 'PENDING')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  INSERT INTO public.digest_cards (
    id, workspace_id, author_id, title, body, recipient_label, triage_type,
    emergency_reason, status, scheduled_for, dispatched_at, emergency_review_status, emergency_reviewed_by, emergency_reviewed_at
  ) VALUES
    ('33333333-3333-4333-8333-333333333501'::uuid, v_ws_data,  v_reza_id,   'Validasi skema tabel metrik retensi mingguan', 'Pastikan kolom tanggal memakai zona waktu Asia/Jakarta sebelum di-deploy besok pagi.', 'Tim Data', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333333502'::uuid, v_ws_data,  v_bima_id,   'Penambahan indeks partisi log agregasi harian', 'Optimasi dijalankan pada jam kerja pukul 09.30 WIB.', 'Tim Data Engineering', 'MORNING_QUEUE', NULL, 'DISPATCHED', CURRENT_DATE, now() - interval '5 hours', 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333333601'::uuid, v_ws_qa,    v_hendra_id, 'Lengkapi skenario uji regresi halaman publik', 'Uji responsivitas di viewport mobile 375px pada sesi pagi.', 'Tim QA', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333333602'::uuid, v_ws_qa,    v_rendra_id, 'Crash modal konfirmasi pada browser Safari lama', 'Terjadi error render pada perangkat iOS 15 saat pengguna menekan tombol simpan.', 'Tim Frontend & QA', 'EMERGENCY_OPS', 'Bug kritikal memblokir seluruh pengguna Safari iOS 15 pada rilis produksi v2.4 malam ini.', 'QUEUED', CURRENT_DATE, NULL, 'VALID_EMERGENCY', v_hendra_id, now() - interval '2 hours'),
    ('33333333-3333-4333-8333-333333333701'::uuid, v_ws_infra, v_bagus_id,  'Audit rotasi kunci API layanan eksternal bulanan', 'Jadwalkan rotasi kunci sandbox pukul 10.00 WIB besok.', 'Tim DevOps', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333333702'::uuid, v_ws_infra, v_bima_id,   'Lonjakan penggunaan CPU node database utama di atas 92%', 'Perlu pengecekan query lock segera agar tidak memicu downtime.', 'Tim Infrastruktur', 'EMERGENCY_OPS', 'Konsumsi CPU database mencapai 94% selama 15 menit berturut-turut di server produksi.', 'QUEUED', CURRENT_DATE, NULL, 'VALID_EMERGENCY', v_bagus_id, now() - interval '1 hour'),
    ('33333333-3333-4333-8333-333333333703'::uuid, v_ws_infra, v_hendra_id, 'Minta ubah nama label environment staging', 'Mohon sesuaikan nama tag staging di dashboard monitoring.', 'Tim DevOps', 'EMERGENCY_OPS', 'Ingin merapikan nama dashboard sebelum demo internal dua hari lagi.', 'QUEUED', CURRENT_DATE, NULL, 'SHOULD_BE_QUEUED', v_bagus_id, now() - interval '30 minutes'),
    ('33333333-3333-4333-8333-333333333801'::uuid, v_ws_fin,   v_maya_id,   'Finalisasi lampiran perjanjian kerja sama vendor', 'Tinjau klausul SLA pada pasal 4 di jam kerja besok.', 'Tim Legal', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333333901'::uuid, v_ws_hr,    v_laras_id,  'Rekap hasil survei keterlibatan karyawan kuartal empat', 'Siapkan ringkasan anonim untuk diskusi pimpinan minggu depan.', 'Tim People', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333334001'::uuid, v_ws_cs,    v_yoga_id,   'Tindak lanjut tiket onboarding akun enterprise Papua', 'Jadwalkan sesi pendampingan pukul 10.00 WIT.', 'Tim CS', 'MORNING_QUEUE', NULL, 'QUEUED', CURRENT_DATE + 1, NULL, 'PENDING', NULL, NULL),
    ('33333333-3333-4333-8333-333333334002'::uuid, v_ws_cs,    v_ayu_id,    'Gangguan akses SSO pada portal klien enterprise', 'Tiga admin klien melaporkan gagal masuk sejak pukul 19.30 WIT.', 'Tim Support', 'EMERGENCY_OPS', 'Klien enterprise aktif tidak dapat masuk ke portal pelaporan pada jam operasional mereka.', 'QUEUED', CURRENT_DATE, NULL, 'PENDING', NULL, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- 6. Wellbeing pulses (multi-minggu, menjaga K-Anonymity >= 3 di mayoritas divisi dan < 3 di Fin/Ops)
  INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
  VALUES
    -- Tim Data & Analitik (4 responden minggu ini)
    (v_ws_data, v_reza_id,  v_week_start, 4, 2, 5),
    (v_ws_data, v_bima_id,  v_week_start, 4, 2, 4),
    (v_ws_data, v_tari_id,  v_week_start, 5, 2, 5),
    (v_ws_data, v_putri_id, v_week_start, 4, 1, 5),
    -- Tim QA (4 responden minggu ini)
    (v_ws_qa, v_hendra_id, v_week_start, 3, 3, 4),
    (v_ws_qa, v_rendra_id, v_week_start, 4, 3, 4),
    (v_ws_qa, v_nadia_id,  v_week_start, 3, 2, 4),
    (v_ws_qa, v_tari_id,   v_week_start, 4, 3, 4),
    -- Tim Infrastruktur & Cloud (3 responden minggu ini)
    (v_ws_infra, v_bagus_id,  v_week_start, 2, 4, 3),
    (v_ws_infra, v_bima_id,   v_week_start, 3, 4, 3),
    (v_ws_infra, v_hendra_id, v_week_start, 2, 4, 2),
    -- Tim Keuangan & Legal (2 responden -> sengaja < 3 untuk demo K-Anonymity)
    (v_ws_fin, v_maya_id,  v_week_start, 5, 1, 5),
    (v_ws_fin, v_putri_id, v_week_start, 4, 2, 5),
    -- Tim People & Budaya (3 responden minggu ini)
    (v_ws_hr, v_laras_id, v_week_start, 5, 1, 5),
    (v_ws_hr, v_fajar_id, v_week_start, 5, 1, 5),
    (v_ws_hr, v_citra_id, v_week_start, 4, 2, 5),
    -- Tim Customer Success (4 responden minggu ini)
    (v_ws_cs, v_yoga_id,  v_week_start, 3, 3, 4),
    (v_ws_cs, v_ayu_id,   v_week_start, 4, 3, 4),
    (v_ws_cs, v_dimas_id, v_week_start, 3, 3, 3),
    (v_ws_cs, v_citra_id, v_week_start, 4, 2, 4)
  ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
END $$;

-- BatasJamREG Governance & Mental Wellbeing Upgrade
-- Poin 1: Charter Digital Sign-Off (charter_acknowledgements)
-- Poin 2: Weekly Anonymized Wellbeing Pulse with K-Anonymity (wellbeing_pulses + RPC)
-- Poin 3: Emergency Audit Trail on digest_cards
-- Poin 5 Prep: Public workspace status RPC (get_public_workspace_status)

-- 1. POIN 1: CHARTER_ACKNOWLEDGEMENTS
CREATE TABLE IF NOT EXISTS public.charter_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  charter_id UUID NOT NULL REFERENCES public.team_charters(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (charter_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_charter_ack_charter
  ON public.charter_acknowledgements(charter_id, signed_at ASC);
CREATE INDEX IF NOT EXISTS idx_charter_ack_workspace
  ON public.charter_acknowledgements(workspace_id);

ALTER TABLE public.charter_acknowledgements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members or org owner can view charter acknowledgements"
  ON public.charter_acknowledgements
  FOR SELECT TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    OR public.is_workspace_org_owner(workspace_id)
  );

CREATE POLICY "Workspace members can sign active charter"
  ON public.charter_acknowledgements
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_workspace_member(workspace_id)
    AND user_id = (SELECT auth.uid())
  );

-- 2. POIN 2: WELLBEING_PULSES (STRICT ROW-LEVEL K-ANONYMITY)
CREATE TABLE IF NOT EXISTS public.wellbeing_pulses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  rest_quality SMALLINT NOT NULL CHECK (rest_quality BETWEEN 1 AND 5),
  reply_pressure SMALLINT NOT NULL CHECK (reply_pressure BETWEEN 1 AND 5),
  boundary_clarity SMALLINT NOT NULL CHECK (boundary_clarity BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_wellbeing_pulses_ws_week
  ON public.wellbeing_pulses(workspace_id, week_start_date DESC);

ALTER TABLE public.wellbeing_pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only own wellbeing pulses"
  ON public.wellbeing_pulses
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Workspace members can submit own wellbeing pulse"
  ON public.wellbeing_pulses
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_workspace_member(workspace_id)
    AND user_id = (SELECT auth.uid())
  );

CREATE POLICY "Users can update own wellbeing pulse"
  ON public.wellbeing_pulses
  FOR UPDATE TO authenticated
  USING (
    public.is_workspace_member(workspace_id)
    AND user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    public.is_workspace_member(workspace_id)
    AND user_id = (SELECT auth.uid())
  );

-- K-Anonymity summary RPC: returns averages only when response_count >= 3
CREATE OR REPLACE FUNCTION public.get_workspace_wellbeing_summary(p_workspace_id UUID)
RETURNS TABLE(
  week_start_date DATE,
  response_count INTEGER,
  is_threshold_met BOOLEAN,
  avg_rest_quality NUMERIC(4,2),
  avg_reply_pressure NUMERIC(4,2),
  avg_boundary_clarity NUMERIC(4,2)
) AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF NOT (
    public.is_workspace_member(p_workspace_id)
    OR public.is_workspace_org_owner(p_workspace_id)
  ) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  RETURN QUERY
  SELECT
    wp.week_start_date,
    COUNT(*)::INTEGER AS response_count,
    (COUNT(*) >= 3) AS is_threshold_met,
    CASE
      WHEN COUNT(*) >= 3 THEN ROUND(AVG(wp.rest_quality)::numeric, 2)
      ELSE NULL
    END AS avg_rest_quality,
    CASE
      WHEN COUNT(*) >= 3 THEN ROUND(AVG(wp.reply_pressure)::numeric, 2)
      ELSE NULL
    END AS avg_reply_pressure,
    CASE
      WHEN COUNT(*) >= 3 THEN ROUND(AVG(wp.boundary_clarity)::numeric, 2)
      ELSE NULL
    END AS avg_boundary_clarity
  FROM public.wellbeing_pulses wp
  WHERE wp.workspace_id = p_workspace_id
  GROUP BY wp.week_start_date
  ORDER BY wp.week_start_date DESC
  LIMIT 8;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_workspace_wellbeing_summary(UUID) TO authenticated;

-- 3. POIN 3: EMERGENCY AUDIT TRAIL ON DIGEST_CARDS
ALTER TABLE public.digest_cards
  ADD COLUMN IF NOT EXISTS emergency_review_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (emergency_review_status IN ('PENDING', 'VALID_EMERGENCY', 'SHOULD_BE_QUEUED')),
  ADD COLUMN IF NOT EXISTS emergency_reviewed_by UUID NULL REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS emergency_reviewed_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_digest_cards_ws_triage_review
  ON public.digest_cards(workspace_id, triage_type, emergency_review_status);

-- 4. PREP POIN 5: PUBLIC WORKSPACE STATUS RPC (NON-SENSITIVE FIELDS ONLY)
CREATE OR REPLACE FUNCTION public.get_public_workspace_status(p_slug TEXT)
RETURNS TABLE(
  workspace_name TEXT,
  slug TEXT,
  work_pattern TEXT,
  work_start_time TIME,
  work_end_time TIME,
  work_days SMALLINT[],
  timezone TEXT,
  digest_dispatch_time TIME,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  non_urgent_sla_hours SMALLINT,
  emergency_criteria JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.name AS workspace_name,
    w.slug,
    w.work_pattern,
    w.work_start_time,
    w.work_end_time,
    w.work_days,
    w.timezone,
    w.digest_dispatch_time,
    c.quiet_hours_start,
    c.quiet_hours_end,
    c.non_urgent_sla_hours,
    COALESCE(c.emergency_criteria, '[]'::jsonb) AS emergency_criteria
  FROM public.workspaces w
  LEFT JOIN public.team_charters c
    ON c.workspace_id = w.id
    AND c.is_active = true
  WHERE lower(w.slug) = lower(trim(p_slug))
  ORDER BY c.version DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_public_workspace_status(TEXT) TO anon, authenticated;

-- 5. IDEMPOTENT DEMO SEED DATA
DO $$
DECLARE
  v_creative_ws_id UUID;
  v_eng_ws_id UUID;
  v_owner_id UUID;
  v_lead_id UUID;
  v_member_id UUID;
  v_creative_charter_id UUID;
  v_eng_charter_id UUID;
  v_week_start DATE := date_trunc('week', timezone('Asia/Jakarta', now()))::date;
  v_creative_em_count INTEGER := 0;
  v_eng_em_count INTEGER := 0;
BEGIN
  SELECT id INTO v_creative_ws_id FROM public.workspaces WHERE invite_code = 'REG-8492' LIMIT 1;
  SELECT id INTO v_eng_ws_id FROM public.workspaces WHERE invite_code = 'REG-4105' LIMIT 1;

  SELECT id INTO v_owner_id FROM auth.users WHERE lower(email) = 'demo@batasjamreg.local' LIMIT 1;
  SELECT id INTO v_lead_id FROM auth.users WHERE lower(email) = 'demo-lead@batasjamreg.local' LIMIT 1;
  SELECT id INTO v_member_id FROM auth.users WHERE lower(email) = 'demo-member@batasjamreg.local' LIMIT 1;

  IF v_creative_ws_id IS NOT NULL THEN
    IF v_owner_id IS NULL THEN
      SELECT created_by INTO v_owner_id FROM public.workspaces WHERE id = v_creative_ws_id;
    END IF;

    SELECT id INTO v_creative_charter_id
    FROM public.team_charters
    WHERE workspace_id = v_creative_ws_id AND is_active = true
    ORDER BY version DESC
    LIMIT 1;

    IF v_creative_charter_id IS NOT NULL THEN
      IF v_lead_id IS NOT NULL THEN
        INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
        VALUES (v_creative_charter_id, v_creative_ws_id, v_lead_id, now() - interval '2 days')
        ON CONFLICT (charter_id, user_id) DO NOTHING;
      END IF;

      IF v_member_id IS NOT NULL THEN
        INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
        VALUES (v_creative_charter_id, v_creative_ws_id, v_member_id, now() - interval '1 day')
        ON CONFLICT (charter_id, user_id) DO NOTHING;
      END IF;
    END IF;

    IF v_owner_id IS NOT NULL THEN
      INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
      VALUES
        (v_creative_ws_id, v_owner_id, v_week_start, 4, 2, 4),
        (v_creative_ws_id, v_owner_id, v_week_start - 7, 3, 3, 4)
      ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
    END IF;

    IF v_lead_id IS NOT NULL THEN
      INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
      VALUES
        (v_creative_ws_id, v_lead_id, v_week_start, 4, 3, 4),
        (v_creative_ws_id, v_lead_id, v_week_start - 7, 3, 4, 3)
      ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
    END IF;

    IF v_member_id IS NOT NULL THEN
      INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
      VALUES
        (v_creative_ws_id, v_member_id, v_week_start, 3, 2, 5),
        (v_creative_ws_id, v_member_id, v_week_start - 7, 2, 3, 4)
      ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;
    END IF;

    IF v_owner_id IS NOT NULL THEN
      UPDATE public.digest_cards
      SET
        emergency_review_status = 'VALID_EMERGENCY',
        emergency_reviewed_by = v_owner_id,
        emergency_reviewed_at = now() - interval '2 hours'
      WHERE id = '33333333-3333-4333-8333-333333333304'
        AND emergency_review_status = 'PENDING';
    END IF;

    SELECT COUNT(*) INTO v_creative_em_count
    FROM public.digest_cards
    WHERE workspace_id = v_creative_ws_id AND triage_type = 'EMERGENCY_OPS';

    IF v_creative_em_count < 2 AND v_owner_id IS NOT NULL THEN
      INSERT INTO public.digest_cards (
        workspace_id,
        author_id,
        title,
        body,
        recipient_label,
        triage_type,
        emergency_reason,
        status,
        scheduled_for,
        emergency_review_status,
        emergency_reviewed_by,
        emergency_reviewed_at
      )
      VALUES (
        v_creative_ws_id,
        COALESCE(v_member_id, v_owner_id),
        'Minta ubah warna tombol deck presentasi internal',
        'Tolong ganti warna aksen slide 4 menjadi lebih cerah sebelum diskusi besok siang.',
        'Tim Desain',
        'EMERGENCY_OPS',
        'Takut lupa menyampaikan sebelum rapat siang besok, padahal jadwal presentasi masih besok pukul 13.00 WIB.',
        'QUEUED',
        CURRENT_DATE,
        'SHOULD_BE_QUEUED',
        v_owner_id,
        now() - interval '1 hour'
      );

      INSERT INTO public.digest_cards (
        workspace_id,
        author_id,
        title,
        body,
        recipient_label,
        triage_type,
        emergency_reason,
        status,
        scheduled_for,
        emergency_review_status
      )
      VALUES (
        v_creative_ws_id,
        COALESCE(v_lead_id, v_owner_id),
        'Sertifikat SSL subdomain kampanye akan kedaluwarsa malam ini',
        'Mohon verifikasi pembaruan otomatis sertifikat TLS agar tautan iklan tidak memunculkan peringatan browser.',
        'Tim Infrastruktur',
        'EMERGENCY_OPS',
        'Jika sertifikat SSL kedaluwarsa pukul 23.00 WIB maka landing page kampanye berbayar tidak bisa diakses publik.',
        'QUEUED',
        CURRENT_DATE,
        'PENDING'
      );
    END IF;
  END IF;

  IF v_eng_ws_id IS NOT NULL AND v_owner_id IS NOT NULL THEN
    SELECT id INTO v_eng_charter_id
    FROM public.team_charters
    WHERE workspace_id = v_eng_ws_id AND is_active = true
    ORDER BY version DESC
    LIMIT 1;

    IF v_eng_charter_id IS NULL THEN
      INSERT INTO public.team_charters (
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
      )
      VALUES (
        v_eng_ws_id,
        v_owner_id,
        'Piagam Jam Digital Tim Produk & Engineering',
        'Tim Produk & Engineering',
        '18:00:00',
        '08:00:00',
        2,
        '["Layanan produksi API inti mengalami outage HTTP 5xx", "Insiden kebocoran kredensial atau akses tidak sah", "Rollout hotfix bug kritis transaksi aktif"]'::jsonb,
        58.00,
        true
      )
      RETURNING id INTO v_eng_charter_id;
    END IF;

    IF v_eng_charter_id IS NOT NULL THEN
      INSERT INTO public.charter_acknowledgements (charter_id, workspace_id, user_id, signed_at)
      VALUES (v_eng_charter_id, v_eng_ws_id, v_owner_id, now() - interval '12 hours')
      ON CONFLICT (charter_id, user_id) DO NOTHING;
    END IF;

    INSERT INTO public.wellbeing_pulses (workspace_id, user_id, week_start_date, rest_quality, reply_pressure, boundary_clarity)
    VALUES (v_eng_ws_id, v_owner_id, v_week_start, 2, 4, 3)
    ON CONFLICT (workspace_id, user_id, week_start_date) DO NOTHING;

    SELECT COUNT(*) INTO v_eng_em_count
    FROM public.digest_cards
    WHERE workspace_id = v_eng_ws_id AND triage_type = 'EMERGENCY_OPS';

    IF v_eng_em_count = 0 THEN
      INSERT INTO public.digest_cards (
        workspace_id,
        author_id,
        title,
        body,
        recipient_label,
        triage_type,
        emergency_reason,
        status,
        scheduled_for,
        emergency_review_status,
        emergency_reviewed_by,
        emergency_reviewed_at
      )
      VALUES
        (
          v_eng_ws_id,
          v_owner_id,
          'Lonjakan error rate 502 pada worker antrean utama',
          'Segera cek koneksi pool database worker agar job pengguna tidak menumpuk.',
          'Tim Backend',
          'EMERGENCY_OPS',
          'Worker pemroses transaksi utama mengalami timeout berulang sehingga memengaruhi antrean pengguna aktif.',
          'QUEUED',
          CURRENT_DATE,
          'VALID_EMERGENCY',
          v_owner_id,
          now() - interval '3 hours'
        ),
        (
          v_eng_ws_id,
          v_owner_id,
          'Review PR dokumentasi README internal',
          'Tolong setujui PR dokumentasi setup lokal malam ini agar bisa di-merge cepat.',
          'Tim Engineering',
          'EMERGENCY_OPS',
          'Ingin merapikan daftar PR terbuka malam ini walaupun tidak berdampak ke layanan produksi.',
          'QUEUED',
          CURRENT_DATE,
          'SHOULD_BE_QUEUED',
          v_owner_id,
          now() - interval '2 hours'
        );
    END IF;
  END IF;
END $$;
